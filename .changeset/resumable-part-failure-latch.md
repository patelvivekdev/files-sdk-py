---
"files-sdk": patch
---

Fix multipart resumable uploads continuing in the background after a part fails. When one part exhausted its retries, `upload()` rejected but the sibling workers kept slicing and uploading every remaining part (burning bandwidth and provider requests), `onProgress` kept firing after rejection, the pause gate flipped the control's status from `"error"` back to `"uploading"`, and a later `resume()` could wake paused workers into the dead run. A part failure now latches the run: new dispatches stop, in-flight sibling attempts are aborted via a run-scoped signal, parked workers wake up and bail, and the control's status stays `"error"`.
