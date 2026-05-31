---
"files-sdk": patch
---

FTP & SFTP `move()` now uses a native rename (`RNFR`/`RNTO` and the SFTP `RENAME` op) instead of a copy + delete body round-trip. The destination's parent directory is created first where needed.
