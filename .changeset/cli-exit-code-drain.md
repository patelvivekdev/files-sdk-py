---
"files-sdk": patch
---

Fix the CLI truncating piped output on partial failures. Commands called `process.exit()` immediately after writing the structured result to stdout, and POSIX pipe writes are asynchronous — a large payload (e.g. a bulk `head` with errors) could be cut off mid-JSON before the consumer received it. Commands now signal failure via `process.exitCode` and let the process end once stdout drains.
