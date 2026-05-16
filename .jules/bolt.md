## 2026-05-08 - O(N) Password Hashing Bottleneck
**Learning:** Found a critical backend anti-pattern: `verify_otp` was iterating over ALL users in the database and checking their phone numbers using `bcrypt.checkpw()`. Since bcrypt is intentionally slow (~100ms per check), login time grew linearly at O(N) with the number of registered users, creating a massive CPU bottleneck.
**Action:** Use a deterministic hashing algorithm (like SHA-256 with a salt) for lookups so we can query the database directly in O(1) time (`SELECT * WHERE phone_hash = ?`), falling back to O(N) bcrypt validation ONLY for legacy users during migration.

## 2025-03-01 - Asynchronous File Responses in FastAPI
**Learning:** Using synchronous `open(..., "r").read()` inside an `async def` endpoint in FastAPI blocks the asynchronous event loop, significantly degrading concurrent performance. FastAPI's `FileResponse` serves files efficiently using `anyio` in the background and sets correct content-type headers implicitly.
**Action:** Always prefer `FileResponse` for serving static files asynchronously in FastAPI instead of manually reading files. Ensure benchmark scripts simulate concurrent connections (e.g., using `httpx.AsyncClient`) to reveal event loop blocking behaviors.
