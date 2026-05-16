---
"files-sdk": minor
---

Add Firebase Storage adapter (`files-sdk/firebase-storage`). Wraps the official `firebase-admin` SDK; the underlying `getStorage().bucket()` returns a `@google-cloud/storage` `Bucket`, so V4 signed read URLs, POST policy uploads with `maxSize`, server-side copy, and the full metadata round-trip all work out of the box. Auto-loads credentials from `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` / `FIREBASE_STORAGE_BUCKET`, falling back to a service-account JSON path (`GOOGLE_APPLICATION_CREDENTIALS`) and then to Application Default Credentials. Accepts an existing `App` or `Bucket` via `app` to share initialization with Firestore/Auth. The bucket name defaults to `<projectId>.firebasestorage.app` when neither `bucket` nor `FIREBASE_STORAGE_BUCKET` is set. Firebase's `?alt=media&token=…` download-token URL form is out of scope for v1 — reach for `adapter.raw` if you need it.
