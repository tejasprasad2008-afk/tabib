## 2024-05-15 - Parameterized Query Fixes for String Concatenation

**What:** Fixed a potential SQL Injection vulnerability in `tabib-clinic-server/database.py` where a hardcoded string `'EMERGENCY'` was appended to a SQL query by converting it to a parameterized query (`?`).
**Why:** While technically not exploitable due to being a hardcoded string, replacing concatenated strings in SQL statements with explicit parameterization is a strong defense-in-depth practice that safeguards against future refactors inadvertently introducing user input into query construction.
**Action:** Always favor parameterization (`?` in SQLite/aiosqlite) for values added to query strings, even for static conditions, to prevent potential regression vectors.
