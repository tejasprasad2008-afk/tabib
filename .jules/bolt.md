## 2024-05-18 - Avoid committing local DB files after benchmarking
**Learning:** Running local performance benchmarks or tests that mutate data can inadvertently modify tracked SQLite database files.
**Action:** When creating a test or benchmark script, use a separate temporary database file to avoid dirtying the project's repository. Do not blindly `git commit -a`, review `git status` to ensure binary artifacts like `.db` files are not accidentally staged.
