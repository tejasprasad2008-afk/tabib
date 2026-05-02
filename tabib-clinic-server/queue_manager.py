"""
Queue manager for Gemma inference requests
Handles concurrent request processing with asyncio
"""

import asyncio
import os
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

from database import (
    create_queue_item,
    update_queue_status,
    get_queue_item,
    get_queue_position,
    get_pending_queue_items,
    reset_pending_queue,
    get_queue_stats
)
from gemma_client import chat, OllamaError
from prompts import TRIAGE_SYSTEM_PROMPT


MAX_CONCURRENT = int(os.getenv("GEMMA_WORKERS", "2"))
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "300"))  # 5 minutes
MAX_QUEUE_DEPTH = 10


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

            # Process with timeout
            result = await asyncio.wait_for(
                self._run_inference(item["request_payload"]),
                timeout=REQUEST_TIMEOUT
            )

            # Mark as done
            await update_queue_status(queue_id, "done", result)

        except asyncio.TimeoutError:
            await update_queue_status(
                queue_id,
                "error",
                {"error": "Request timed out. Please try again."}
            )
        except OllamaError as e:
            await update_queue_status(
                queue_id,
                "error",
                {"error": str(e)}
            )
        except Exception as e:
            await update_queue_status(
                queue_id,
                "error",
                {"error": f"Unexpected error: {str(e)}"}
            )

    async def _run_inference(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Run Gemma inference and parse response"""
        message = payload.get("message", "")
        
        if len(message) > 2000:
            raise ValueError("Message too long")

        EMERGENCY_KEYWORDS = ["chest pain", "difficulty breathing", "loss of consciousness", "severe bleeding", "stroke", "poisoning", "self-harm", "ألم في الصدر", "ضيق في التنفس", "فقدان الوعي"]
        if any(keyword in message.lower() for keyword in EMERGENCY_KEYWORDS):
            return {
                "urgency": "EMERGENCY",
                "explanation": "System detected emergency keywords.",
                "steps": ["Call emergency services immediately."],
                "warning_signs": [],
                "emergency_numbers": "911 / 998",
                "disclaimer": "Automated emergency detection. Always consult a professional.",
                "raw": message
            }

        image_base64 = payload.get("image_base64")

        # Build messages
        messages = [{"role": "system", "content": TRIAGE_SYSTEM_PROMPT}]

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

        # Call Gemma
        response_text = await chat(messages)

        # Parse response
        DEFAULT_DISCLAIMER = "This is an AI-generated assessment. Always consult a healthcare professional."
        try:
            result = self._parse_response(response_text)
        except Exception:
            result = {"urgency": "SEE_A_DOCTOR", "raw": response_text, "disclaimer": DEFAULT_DISCLAIMER, "steps": [], "warning_signs": [], "explanation": "", "emergency_numbers": ""}
            
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
