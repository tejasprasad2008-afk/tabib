## 2026-05-15 - Parameterized Query Fixes for String Concatenation

**What:** Fixed a potential SQL Injection vulnerability in `tabib-clinic-server/database.py` where a hardcoded string `'EMERGENCY'` was appended to a SQL query by converting it to a parameterized query (`?`).
**Why:** While technically not exploitable due to being a hardcoded string, replacing concatenated strings in SQL statements with explicit parameterization is a strong defense-in-depth practice that safeguards against future refactors inadvertently introducing user input into query construction.
**Action:** Always favor parameterization (`?` in SQLite/aiosqlite) for values added to query strings, even for static conditions, to prevent potential regression vectors.

## 2026-05-15 - Enforce TLS by default
**Vulnerability:** Missing TLS Enforcement (Plaintext Health Data Transmission)
**Learning:** The FastAPI server had a middleware that optionally enforced HTTPS only if a specific environment variable (`FORCE_HTTPS=true`) was provided. The default behavior was to allow plaintext HTTP, leaving patient health data and authentication tokens exposed to interception.
**Prevention:** Always default to "secure by default" configurations for any service handling PII or sensitive health data. `FORCE_HTTPS` should default to `true`, and require an explicit opt-out rather than an explicit opt-in for unencrypted development connections.

## 2026-05-16 - CORS Misconfiguration
**Vulnerability:** Combining `allow_origin_regex=".*"` with `allow_credentials=True` in FastAPI CORS Middleware allows cross-origin requests to read authenticated responses, posing CSRF and data leakage risks.
**Fix:** Disable `allow_credentials=False` and set `allow_origins=["*"]` when token-based authentication (e.g., Bearer tokens) is used, and remove redundant manual `Access-Control-Allow-Origin: *` headers.
