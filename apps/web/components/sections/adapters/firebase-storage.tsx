import { CodeBlock } from "@/components/code-block";
import { Heading } from "@/components/heading";
import { PropAccordionItem } from "@/components/prop-accordion-item";
import { Accordion } from "@/components/ui/accordion";

const FIREBASE_STORAGE_EXAMPLE = `import { Files } from "files-sdk";
import { firebaseStorage } from "files-sdk/firebase-storage";

const files = new Files({
  adapter: firebaseStorage({
    bucket: "my-project.firebasestorage.app",
    // Auto-loads credentials from FIREBASE_PROJECT_ID,
    // FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, or falls back to
    // Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS,
    // gcloud auth, GCE metadata). Or pass an existing firebase-admin App
    // or @google-cloud/storage Bucket via \`app\`.
  }),
});`;

export const FirebaseStorage = () => (
  <section>
    <p>
      Firebase Cloud Storage via the official <code>firebase-admin</code> SDK.
      The Admin SDK&apos;s <code>getStorage().bucket()</code> returns a{" "}
      <code>@google-cloud/storage</code> <code>Bucket</code> under the hood, so
      every primitive (server-side copy, V4 signed URLs, POST policy uploads)
      maps onto the GCS surface — with Firebase-flavoured credential conventions
      and a default bucket name derived from your project ID.
    </p>
    <CodeBlock code={FIREBASE_STORAGE_EXAMPLE} lang="ts" />
    <section>
      <Heading as="h2" id="options">
        Options
      </Heading>
      <Accordion className="rounded-md border-dotted" type="multiple">
        <PropAccordionItem name="bucket" status="optional" value="bucket">
          <p>
            Storage bucket name. Falls back to{" "}
            <code>FIREBASE_STORAGE_BUCKET</code>, then{" "}
            <code>{`<projectId>.firebasestorage.app`}</code> if{" "}
            <code>projectId</code> is known. The Firebase console shows the
            bucket as <code>{`<project>.appspot.com`}</code> on older projects
            and <code>{`<project>.firebasestorage.app`}</code> on newer ones —
            pass the literal name from the console rather than relying on the
            default if you&apos;re unsure.
          </p>
        </PropAccordionItem>
        <PropAccordionItem name="projectId" status="optional" value="projectId">
          <p>
            GCP project ID. Falls back to <code>FIREBASE_PROJECT_ID</code>, then{" "}
            <code>GOOGLE_CLOUD_PROJECT</code>, then <code>GCLOUD_PROJECT</code>.
            Application Default Credentials carry a project ID, so this is
            rarely needed.
          </p>
        </PropAccordionItem>
        <PropAccordionItem
          name="credentials"
          status="optional"
          value="credentials"
        >
          <p>
            Inline service-account credentials —{" "}
            <code>{"{ clientEmail, privateKey }"}</code>. Useful when you only
            have those fields as separate env vars (Vercel, Netlify) and
            don&apos;t want to materialize a JSON file. Falls back to{" "}
            <code>FIREBASE_CLIENT_EMAIL</code> +{" "}
            <code>FIREBASE_PRIVATE_KEY</code>. The adapter unescapes literal{" "}
            <code>\n</code> sequences in the private key so env-sourced values
            just work.
          </p>
        </PropAccordionItem>
        <PropAccordionItem
          name="serviceAccountPath"
          status="optional"
          value="serviceAccountPath"
        >
          <p>
            Path to a service-account JSON file. Wins over inline{" "}
            <code>credentials</code> when set. Falls back to{" "}
            <code>GOOGLE_APPLICATION_CREDENTIALS</code>. When neither is set,
            the SDK falls back to Application Default Credentials.
          </p>
        </PropAccordionItem>
        <PropAccordionItem name="app" status="optional" value="app">
          <p>
            Existing Firebase <code>App</code> or{" "}
            <code>@google-cloud/storage</code> <code>Bucket</code>.
            Highest-precedence credential — when passed, all other credential
            options are ignored. Useful when the consumer already initializes
            Firebase elsewhere (Firestore, Auth) and wants to share the app.
          </p>
        </PropAccordionItem>
        <PropAccordionItem
          name="publicBaseUrl"
          status="optional"
          value="publicBaseUrl"
        >
          <p>
            Origin used to build URLs from <code>url()</code>. When set,{" "}
            <code>url(key)</code> returns{" "}
            <code>{`\`\${publicBaseUrl}/\${key}\``}</code> and skips signing —
            appropriate for a public bucket or a CDN in front of Firebase
            Storage. When unset, <code>url()</code> returns a V4 signed read URL
            (1-hour default).
          </p>
        </PropAccordionItem>
        <PropAccordionItem
          name="defaultUrlExpiresIn"
          status="optional"
          value="defaultUrlExpiresIn"
        >
          <p>
            Default expiry, in seconds, for the V4 signed URLs returned by{" "}
            <code>url()</code> when <code>publicBaseUrl</code> is not set.
            Defaults to 3600 (1 hour). Per-call{" "}
            <code>url(key, {"{ expiresIn }"})</code> overrides. GCS V4 caps at 7
            days.
          </p>
        </PropAccordionItem>
        <PropAccordionItem name="appName" status="optional" value="appName">
          <p>
            Internal Firebase app name. The adapter derives a stable name from{" "}
            <code>{`(projectId, bucket)`}</code> by default and reuses an
            existing app when one already exists — only set this if you have a
            reason (e.g. you want multiple isolated Firebase apps for the same
            project).
          </p>
        </PropAccordionItem>
      </Accordion>
    </section>
    <section>
      <Heading as="h2" id="limitations">
        Limitations
      </Heading>
      <p>
        Firebase&apos;s <code>?alt=media&amp;token=...</code> download-token URL
        form is out of scope for v1 — <code>url()</code> always returns either a
        V4 signed read URL or your configured <code>publicBaseUrl</code>. Reach
        for <code>adapter.raw</code> (the underlying{" "}
        <code>@google-cloud/storage</code> <code>Bucket</code>) if you need to
        mint Firebase download tokens or use any GCS-side feature that
        isn&apos;t in the unified API. Stream uploads use single-request mode;
        multi-GB resumable uploads also need <code>raw</code>.
      </p>
    </section>
  </section>
);
