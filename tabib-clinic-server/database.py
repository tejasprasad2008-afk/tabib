"""
SQLite database setup and queries for Tabib Clinic Server
Uses aiosqlite for async database operations
"""

import aiosqlite
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid


DB_PATH = os.getenv("DB_PATH", "tabib_clinic.db")


async def init_db():
    """Initialize database with all required tables"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS patients (
                id TEXT PRIMARY KEY,
                phone_hash TEXT UNIQUE,
                token TEXT,
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                patient_id TEXT,
                messages TEXT,
                urgency_level TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notified_clinic BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                patient_id TEXT,
                patient_phone TEXT,
                summary TEXT,
                urgency_level TEXT,
                session_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                called_back BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (patient_id) REFERENCES patients(id),
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            );

            CREATE TABLE IF NOT EXISTS queue (
                id TEXT PRIMARY KEY,
                patient_id TEXT,
                request_payload TEXT,
                status TEXT,
                result TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            );

            CREATE INDEX IF NOT EXISTS idx_sessions_patient ON sessions(patient_id);
            CREATE INDEX IF NOT EXISTS idx_notifications_patient ON notifications(patient_id);
            CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);
            CREATE INDEX IF NOT EXISTS idx_queue_created ON queue(created_at);
        """)
        await db.commit()


async def create_patient(phone_hash: str) -> str:
    """Create a new patient record"""
    patient_id = str(uuid.uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO patients (id, phone_hash) VALUES (?, ?)",
            (patient_id, phone_hash)
        )
        await db.commit()
    return patient_id


async def get_patient_by_phone_hash(phone_hash: str) -> Optional[Dict[str, Any]]:
    """Get patient by phone hash"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM patients WHERE phone_hash = ?",
            (phone_hash,)
        )
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None


async def get_all_patients() -> List[Dict[str, Any]]:
    """Get all patients (for Bcrypt lookup)"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM patients")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

async def update_patient_last_seen(patient_id: str):
    """Update patient's last seen timestamp"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE patients SET last_seen = CURRENT_TIMESTAMP WHERE id = ?",
            (patient_id,)
        )
        await db.commit()

async def update_patient_token(patient_id: str, token: str, expires_at: str):
    """Update patient's auth token"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE patients SET token = ?, expires_at = ? WHERE id = ?",
            (token, expires_at, patient_id)
        )
        await db.commit()

async def get_patient_by_token(token: str) -> Optional[Dict[str, Any]]:
    """Get patient by auth token"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM patients WHERE token = ?",
            (token,)
        )
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None


async def create_session(patient_id: str, messages: List[Dict]) -> str:
    """Create a new session"""
    session_id = str(uuid.uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO sessions (id, patient_id, messages) VALUES (?, ?, ?)",
            (session_id, patient_id, json.dumps(messages))
        )
        await db.commit()
    return session_id


async def update_session_urgency(session_id: str, urgency_level: str):
    """Update session urgency level"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE sessions SET urgency_level = ? WHERE id = ?",
            (urgency_level, session_id)
        )
        await db.commit()


async def mark_session_notified(session_id: str):
    """Mark session as notified to clinic"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE sessions SET notified_clinic = TRUE WHERE id = ?",
            (session_id,)
        )
        await db.commit()

from datetime import timedelta

async def cleanup_old_sessions(days: int = 30):
    """Cleanup old sessions (Session Retention Policy)"""
    cutoff = datetime.now() - timedelta(days=days)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM sessions WHERE created_at < ?", (cutoff.isoformat(),))
        await db.commit()


async def create_notification(
    patient_id: str,
    patient_phone: str,
    summary: str,
    urgency_level: str,
    session_id: str
) -> str:
    """Create a new notification"""
    notification_id = str(uuid.uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO notifications
               (id, patient_id, patient_phone, summary, urgency_level, session_id)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (notification_id, patient_id, patient_phone, summary, urgency_level, session_id)
        )
        await db.commit()
    return notification_id


async def get_notifications(
    limit: int = 50,
    filter_status: Optional[str] = None,
    urgency_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Get notifications with optional filters"""
    query = "SELECT * FROM notifications"
    params = []

    conditions = []
    if filter_status == "pending":
        conditions.append("called_back = FALSE")
    elif filter_status == "called":
        conditions.append("called_back = TRUE")

    if urgency_filter == "emergency":
        conditions.append("urgency_level = 'EMERGENCY'")

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def mark_notification_called(notification_id: str):
    """Mark notification as called back"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE notifications SET called_back = TRUE WHERE id = ?",
            (notification_id,)
        )
        await db.commit()


async def create_queue_item(
    patient_id: str,
    request_payload: Dict[str, Any]
) -> str:
    """Create a new queue item"""
    queue_id = str(uuid.uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO queue (id, patient_id, request_payload, status)
               VALUES (?, ?, ?, 'pending')""",
            (queue_id, patient_id, json.dumps(request_payload))
        )
        await db.commit()
    return queue_id


async def update_queue_status(
    queue_id: str,
    status: str,
    result: Optional[Dict[str, Any]] = None
):
    """Update queue item status"""
    async with aiosqlite.connect(DB_PATH) as db:
        if status in ["done", "error"]:
            await db.execute(
                """UPDATE queue
                   SET status = ?, result = ?, completed_at = CURRENT_TIMESTAMP
                   WHERE id = ?""",
                (status, json.dumps(result) if result else None, queue_id)
            )
        else:
            await db.execute(
                "UPDATE queue SET status = ? WHERE id = ?",
                (status, queue_id)
            )
        await db.commit()


async def get_queue_item(queue_id: str) -> Optional[Dict[str, Any]]:
    """Get queue item by ID"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM queue WHERE id = ?",
            (queue_id,)
        )
        row = await cursor.fetchone()
        if row:
            result = dict(row)
            if result.get("request_payload"):
                result["request_payload"] = json.loads(result["request_payload"])
            if result.get("result"):
                result["result"] = json.loads(result["result"])
            return result
        return None


async def get_queue_position(queue_id: str) -> int:
    """Get position in queue (0-indexed)"""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            """SELECT COUNT(*) FROM queue
               WHERE status = 'pending' AND created_at < (
                   SELECT created_at FROM queue WHERE id = ?
               )""",
            (queue_id,)
        )
        row = await cursor.fetchone()
        return row[0] if row else 0


async def get_pending_queue_items(limit: int = 10) -> List[Dict[str, Any]]:
    """Get pending queue items for processing"""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """SELECT * FROM queue
               WHERE status = 'pending'
               ORDER BY created_at ASC
               LIMIT ?""",
            (limit,)
        )
        rows = await cursor.fetchall()
        results = []
        for row in rows:
            result = dict(row)
            if result.get("request_payload"):
                result["request_payload"] = json.loads(result["request_payload"])
            results.append(result)
        return results


async def reset_pending_queue():
    """Mark all pending queue items as error (for server restart)"""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """UPDATE queue
               SET status = 'error', completed_at = CURRENT_TIMESTAMP
               WHERE status = 'pending'"""
        )
        await db.commit()


async def get_queue_stats() -> Dict[str, int]:
    """Get queue statistics"""
    async with aiosqlite.connect(DB_PATH) as db:
        stats = {}
        for status in ["pending", "processing", "done", "error"]:
            cursor = await db.execute(
                "SELECT COUNT(*) FROM queue WHERE status = ?",
                (status,)
            )
            row = await cursor.fetchone()
            stats[status] = row[0] if row else 0
        return stats
