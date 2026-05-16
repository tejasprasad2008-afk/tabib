## 2026-05-08 - O(N) Password Hashing Bottleneck
**Learning:** Found a critical backend anti-pattern: `verify_otp` was iterating over ALL users in the database and checking their phone numbers using `bcrypt.checkpw()`. Since bcrypt is intentionally slow (~100ms per check), login time grew linearly at O(N) with the number of registered users, creating a massive CPU bottleneck.
**Action:** Use a deterministic hashing algorithm (like SHA-256 with a salt) for lookups so we can query the database directly in O(1) time (`SELECT * WHERE phone_hash = ?`), falling back to O(N) bcrypt validation ONLY for legacy users during migration.

## 2026-05-15 - Non-blocking File I/O for JSON Registries
**Learning:** Synchronous file reading (`open().read()`) combined with `json.load()` inside `async def` methods heavily blocks the event loop, causing severe latency spikes (e.g., ~10s event loop latency on ~50k records).
**Action:** Use `asyncio.to_thread` to offload both file reading and JSON parsing to a separate thread, reducing event loop blocking while keeping the interface unchanged.
