"""
Queue manager for Gemma inference requests
Handles concurrent request processing with asyncio
"""

import asyncio
import os
from typing import Dict, Any, Optional
from datetime import datetime

from database import (
    create_queue_item,
    update_queue_status,
    get_queue_item,
    get_queue_position,
    get_pending_queue_items,
    reset_pending_queue,
    get_queue_stats,
    create_session,
    get_latest_session,
    update_session_messages,
    get_patient_demographics
)
from gemma_client import get_ai_client
from prompts import TRIAGE_SYSTEM_PROMPT


MAX_CONCURRENT = int(os.getenv("GEMMA_WORKERS", "2"))
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "300"))  # 5 minutes
MAX_QUEUE_DEPTH = 10

# Initialize AI client
ai_client = get_ai_client()


class QueueManager:
    """Manages the inference request queue"""

    def __init__(self):
        self.running = False
        self.worker_tasks = []
        self.queue = asyncio.Queue()

    async def start(self):
        """Start the queue manager workers"""
        if self.running:
            return

        self.running = True

        # Reset any pending items from previous run
        await reset_pending_queue()

        # Start worker tasks
        for i in range(MAX_CONCURRENT):
            task = asyncio.create_task(self._worker(f"worker-{i}"))
            self.worker_tasks.append(task)

    async def stop(self):
        """Stop the queue manager"""
        self.running = False

        # Cancel all worker tasks
        for task in self.worker_tasks:
            task.cancel()

        # Wait for tasks to complete
        await asyncio.gather(*self.worker_tasks, return_exceptions=True)
        self.worker_tasks = []

    async def submit(self, patient_id: str, request_payload: Dict[str, Any]) -> str:
        """
        Submit a request to the queue

        Returns:
            Queue item ID
        """
        queue_id = await create_queue_item(patient_id, request_payload)
        await self.queue.put(queue_id)
        return queue_id

    async def get_status(self, queue_id: str) -> Dict[str, Any]:
        """
        Get status of a queue item

        Returns:
            Dict with status, position, and result if done
        """
        item = await get_queue_item(queue_id)
        if not item:
            return {
                "status": "error",
                "error": "Queue item not found"
            }

        position = 0
        if item["status"] == "pending":
            position = await get_queue_position(queue_id)

        result = {
            "status": item["status"],
            "queue_position": position
        }

        if item["status"] == "done" and item.get("result"):
            result["response"] = item["result"]

        if item["status"] == "error" and item.get("result"):
            result["error"] = item["result"].get("error", "Unknown error")

        return result

    async def get_depth(self) -> int:
        """Get current queue depth (pending items)"""
        stats = await get_queue_stats()
        return stats.get("pending", 0)

    async def _worker(self, worker_name: str):
        """Worker task that processes queue items"""
        while self.running:
            try:
                queue_id = await asyncio.wait_for(
                    self.queue.get(),
                    timeout=1.0
                )

                await self._process_item(queue_id, worker_name)

            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print(f"Worker {worker_name} error: {e}")

    async def _process_item(self, queue_id: str, worker_name: str):
        """Process a single queue item"""
        try:
            # Mark as processing
            await update_queue_status(queue_id, "processing")

            # Get the item
            item = await get_queue_item(queue_id)
            if not item:
                await update_queue_status(queue_id, "error", {"error": "Item not found"})
                return

            # Process with timeout - include patient_id in payload
            payload = item["request_payload"]
            payload["patient_id"] = item.get("patient_id")
            result = await asyncio.wait_for(
                self._run_inference(payload),
                timeout=REQUEST_TIMEOUT
            )

            # Mark as done
            await update_queue_status(queue_id, "done", result)

        except Exception as e:
            # Return patient-friendly Arabic error message
            error_response = {
                "urgency": "SEE_A_DOCTOR",
                "explanation": "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.",
                "steps": [
                    "حاول إرسال رسالتك مرة أخرى",
                    "إذا استمر الخطأ، تواصل مع العيادة مباشرة"
                ],
                "warning_signs": [],
                "disclaimer": "هذه المعلومات للتوجيه فقط.",
                "error": str(e)
            }
            await update_queue_status(queue_id, "error", error_response)

    async def _run_inference(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Run Gemma inference and parse response"""
        message = payload.get("message", "")
        patient_id = payload.get("patient_id", "")
        
        if len(message) > 2000:
            raise ValueError("Message too long")

        EMERGENCY_KEYWORDS = ["chest pain", "difficulty breathing", "loss of consciousness", "severe bleeding", "stroke", "poisoning", "self-harm", "ألم في الصدر", "ضيق في التنفس", "فقدان الوعي", "998", "999"]
        if any(keyword in message.lower() for keyword in EMERGENCY_KEYWORDS):
            return {
                "urgency": "EMERGENCY",
                "explanation": "System detected emergency keywords. / تم اكتشاف كلمات طوارئ.",
                "steps": ["Call emergency services immediately (998/999).", "اتصل بخدمات الطوارئ فوراً (998/999)."],
                "warning_signs": [],
                "emergency_numbers": "911 / 998 / 999",
                "disclaimer": "Automated emergency detection. / كشف تلقائي للطوارئ.",
                "raw": message
            }

        image_base64 = payload.get("image_base64")

        # Get or create session for conversation history
        session_id = None
        conversation_history = []
        patient_context = ""
        
        if patient_id:
            session = await get_latest_session(patient_id)
            if session and session.get("messages"):
                import json
                conversation_history = json.loads(session["messages"])
                session_id = session["id"]
            
            # Get patient demographics
            demographics = await get_patient_demographics(patient_id)
            if demographics and demographics.get("profile_completed"):
                age = demographics.get("age", "unknown")
                gender = demographics.get("gender", "unknown")
                height = demographics.get("height_cm", "unknown")
                weight = demographics.get("weight_kg", "unknown")
                patient_context = f"\n\nPATIENT CONTEXT: Age: {age} years, Gender: {gender}, Height: {height}cm, Weight: {weight}kg"

        # Build messages with conversation history and patient context
        system_prompt = TRIAGE_SYSTEM_PROMPT + patient_context
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history (last 6 messages to keep context but not overflow)
        for msg in conversation_history[-6:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

        # Add current message
        if image_base64:
            content = []
            if message:
                content.append({"type": "text", "text": message})
            content.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
            })
            messages.append({"role": "user", "content": content})
        else:
            messages.append({"role": "user", "content": message})

        # Call AI Client
        response_text = await ai_client.chat(messages)

        # Save conversation to session
        if patient_id:
            new_message = {"role": "user", "content": message, "timestamp": datetime.now().isoformat()}
            ai_message = {"role": "assistant", "content": response_text, "timestamp": datetime.now().isoformat()}
            
            if session_id:
                # Append to existing session
                await update_session_messages(session_id, conversation_history + [new_message, ai_message])
            else:
                # Create new session
                session_id = await create_session(patient_id, [new_message, ai_message])

        # Parse response
        DEFAULT_DISCLAIMER = "This is an AI-generated assessment. Always consult a healthcare professional."
        try:
            result = self._parse_response(response_text)
        except Exception:
            result = {"urgency": "SEE_A_DOCTOR", "raw": response_text, "disclaimer": DEFAULT_DISCLAIMER, "steps": [], "warning_signs": [], "explanation": "", "emergency_numbers": ""}
        
        # Update session with urgency level
        if session_id and result.get("urgency"):
            from database import update_session_urgency
            await update_session_urgency(session_id, result["urgency"])
            
        return result

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Gemma response into structured format"""
        result = {
            "urgency": "HOME_CARE",
            "explanation": "",
            "steps": [],
            "warning_signs": [],
            "emergency_numbers": "",
            "disclaimer": "",
            "raw": response_text
        }

        lines = response_text.split("\n")
        current_section = None

        for line in lines:
            line = line.strip()

            if line.startswith("URGENCY:"):
                urgency = line.replace("URGENCY:", "").strip().upper()
                if "EMERGENCY" in urgency:
                    result["urgency"] = "EMERGENCY"
                elif "SEE_A_DOCTOR" in urgency or "DOCTOR" in urgency:
                    result["urgency"] = "SEE_A_DOCTOR"
                else:
                    result["urgency"] = "HOME_CARE"
                current_section = None

            elif line.startswith("EXPLANATION:"):
                current_section = "explanation"
                result["explanation"] = line.replace("EXPLANATION:", "").strip()

            elif line.startswith("STEPS:"):
                current_section = "steps"

            elif line.startswith("WARNING SIGNS:"):
                current_section = "warning_signs"

            elif line.startswith("EMERGENCY NUMBERS:"):
                current_section = "emergency_numbers"
                result["emergency_numbers"] = line.replace("EMERGENCY NUMBERS:", "").strip()

            elif line.startswith("DISCLAIMER:"):
                current_section = "disclaimer"
                result["disclaimer"] = line.replace("DISCLAIMER:", "").strip()

            elif current_section:
                if current_section == "steps" and line and (line[0].isdigit() or line.startswith("-")):
                    step = line.lstrip("0123456789.-").strip()
                    if step:
                        result["steps"].append(step)
                elif current_section == "warning_signs" and line.startswith("-"):
                    warning = line.lstrip("-").strip()
                    if warning:
                        result["warning_signs"].append(warning)
                elif current_section == "explanation" and line:
                    result["explanation"] += " " + line
                elif current_section == "emergency_numbers" and line:
                    result["emergency_numbers"] += " " + line
                elif current_section == "disclaimer" and line:
                    result["disclaimer"] += " " + line

        # Clean up
        result["explanation"] = result["explanation"].strip()
        result["emergency_numbers"] = result["emergency_numbers"].strip()
        result["disclaimer"] = result["disclaimer"].strip()

        if not result["disclaimer"]:
            result["disclaimer"] = "This is an AI-generated assessment. Always consult a healthcare professional."

        return result


# Global queue manager instance
queue_manager = QueueManager()
