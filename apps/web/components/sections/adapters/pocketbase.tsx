import { CodeBlock } from "@/components/code-block";
import { Heading } from "@/components/heading";
import { PropAccordionItem } from "@/components/prop-accordion-item";
import { Accordion } from "@/components/ui/accordion";

const POCKETBASE_EXAMPLE = `import { Files } from "files-sdk";
import { pocketbase } from "files-sdk/pocketbase";

const files = new Files({
  adapter: pocketbase({
    collection: "files",
    // Auto-loads url + auth from POCKETBASE_URL,
    // POCKETBASE_ADMIN_EMAIL + POCKETBASE_ADMIN_PASSWORD, or
    // POCKETBASE_AUTH_TOKEN. Or pass an existing PocketBase client.
    //
    // Collection must already exist with a unique-indexed text \`key\`
    // field and a single-value \`file\` field. Field names are
    // configurable via \`keyField\` / \`fileField\`.
  }),
});`;

export const Pocketbase = () => (
  <section>
    <p>
      PocketBase via the official <code>pocketbase</code> JS SDK. PocketBase has
      no object-store primitive — files live as field values on records inside
      collections. The adapter maps the unified key/blob API onto a dedicated
      collection: each upload becomes (or updates) a record whose configurable
      <em> key field</em> holds the user-facing string key and whose
      configurable <em>file field</em> holds the body.
    </p>
    <CodeBlock code={POCKETBASE_EXAMPLE} lang="ts" />
    <section>
      <Heading as="h2" id="options">
        Options
      </Heading>
      <Accordion className="rounded-md border-dotted" type="multiple">
        <PropAccordionItem
          name="collection"
          status="required"
          value="collection"
        >
          <p>
            Collection name (or id) that holds the file records. Must already
            exist with the configured <code>keyField</code> (unique-indexed
            text) and <code>fileField</code> (single-value file). The adapter
            does not create or migrate the collection — set it up via the
            PocketBase admin UI or migrations first.
          </p>
        </PropAccordionItem>
        <PropAccordionItem name="client" status="optional" value="client">
          <p>
            Existing PocketBase client. Highest-precedence — when passed, all
            auth options below are ignored. Useful when the host app already
            shares one client across auth, realtime, and storage.
          </p>
        </PropAccordionItem>
        <PropAccordionItem name="url" status="required" value="url">
          <p>
            PocketBase backend URL, e.g. <code>https://pb.example.com</code>.
            Falls back to <code>POCKETBASE_URL</code>. Required unless{" "}
            <code>client</code> is passed.
          </p>
        </PropAccordionItem>
        <PropAccordionItem
          name="adminEmail"
          status="optional"
          value="adminEmail"
        >
          <p>
            Superuser email. Combined with <code>adminPassword</code> to auth as
            a superuser on the first call that needs it. Falls back to{" "}
            <code>POCKETBASE_ADMIN_EMAIL</code>.
          </p>
        </PropAccordionItem>
        <PropAccordionItem
          name="adminPassword"
          status="optional"
          value="adminPassword"
        >
          <p>
            Superuser password. Falls back to{" "}
            <code>POCKETBASE_ADMIN_PASSWORD</code>.
          </p>
        </PropAccordionItem>
        <PropAccordionItem name="authToken" status="optional" value="authToken">
          <p>
            Pre-issued auth token. Saved into the client&apos;s{" "}
            <code>authStore</code> directly — use this when you already have a
            token from elsewhere (an OAuth2 exchange, a custom user-auth flow).
            Falls back to <code>POCKETBASE_AUTH_TOKEN</code>. Wins over the
            admin email/password pair when both are provided.
          </p>
        </PropAccordionItem>
        <PropAccordionItem name="keyField" status="optional" value="keyField">
          <p>
            Name of the text field on the collection holding the user-facing
            key. Must be unique-indexed. Defaults to{" "}
            <code>&quot;key&quot;</code>.
          </p>
        </PropAccordionItem>
        <PropAccordionItem name="fileField" status="optional" value="fileField">
          <p>
            Name of the single-file field on the collection holding the body.
            Defaults to <code>&quot;file&quot;</code>.
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
            <code>{`\`\${publicBaseUrl}/\${key}\``}</code> and skips
            PocketBase&apos;s file URL entirely — appropriate when a CDN sits in
            front of the PB instance. When unset, <code>url()</code> falls back
            to <code>pb.files.getURL(record, filename)</code>, threading a
            short-lived file token for authenticated clients.
          </p>
        </PropAccordionItem>
      </Accordion>
    </section>
    <section>
      <Heading as="h2" id="limitations">
        Limitations
      </Heading>
      <p>
        <code>signedUploadUrl()</code> throws — PocketBase has no presigned
        upload primitive; writes always go through the authenticated API.{" "}
        <code>copy()</code> is read-then-write (no server-side copy) — costs an
        egress + an ingest and isn&apos;t atomic. <code>list()</code> uses
        PocketBase&apos;s offset/limit API; the adapter encodes the page number
        as a numeric cursor string so the unified API works unchanged.{" "}
        <code>UploadOptions</code> <code>cacheControl</code> and{" "}
        <code>metadata</code> throw — PocketBase has no per-file HTTP cache
        headers and no arbitrary-metadata field on the file; add extra typed
        columns to the collection and write to them via <code>raw</code> if you
        need them. <code>responseContentDisposition</code> on <code>url()</code>{" "}
        throws — PocketBase has no per-URL Content-Disposition override; reach
        for <code>raw</code> and the <code>?download=true</code> query string
        instead.
      </p>
    </section>
  </section>
);
