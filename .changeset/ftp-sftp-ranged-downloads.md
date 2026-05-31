---
"files-sdk": patch
---

FTP & SFTP now support ranged downloads (`download(key, { range })`): SFTP uses native read-stream `start`/`end` offsets; FTP begins the transfer at the `REST` start offset and trims a bounded `end` client-side. Both adapters now advertise `supportsRange`.
