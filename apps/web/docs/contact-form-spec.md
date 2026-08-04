# Contact Form → Email Feature Spec

Status: Implemented
Owner: apps/web
Scope: `apps/web`, plus two new shared packages (`packages/utils`, `packages/email`) that other apps can
reuse later. No changes to `apps/admin`, `apps/reviews`, `apps/blog`, or existing shared packages.

## 1. Goal

The `ModernContact` section (`src/components/modern-contact.tsx`) currently renders a `<form>` with no
submit behavior. This feature wires it up end-to-end so a visitor's message is validated client-side and
server-side, then emailed to Zyad via Gmail SMTP — no database, no stored submissions, no third-party
form service.

## 2. Non-goals

- No persistence (no DB table, no logging of submissions beyond server console on error).
- No admin-side inbox/viewer — email IS the inbox (Gmail).
- No file attachments.
- No CAPTCHA/third-party bot-protection service — a honeypot field is the only anti-spam measure (see §6).
- No distributed rate limiting — `apps/web` is stateless/serverless (Vercel); a shared counter would need
  external storage, which is out of scope. This is a documented limitation, not an oversight.

## 3. Form fields & validation

Single zod schema, shared between client and server via `@repo/utils` (`packages/utils/src/schemas/contact.ts`,
published as `@repo/utils/schemas/contact`) — both the client component and the API route import the same
schema so validation never drifts between them:

| Field   | Type   | Rules                                              |
|---------|--------|-----------------------------------------------------|
| name    | string | trim, 1–100 chars, required                         |
| email   | string | trim, valid email format, required                  |
| subject | string | trim, 1–150 chars, required                         |
| message | string | trim, 10–2000 chars, required                       |
| company | string | optional honeypot — must arrive empty (see §6)      |

```ts
const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
  company: z.string().max(0, "").optional(),
});
```

`ContactFormValues = z.infer<typeof contactFormSchema>`, also exported from `@repo/utils/schemas/contact`.

## 4. Client (`ModernContact`)

- Converts the existing plain `<form>` to `react-hook-form` (`useForm` + `zodResolver(contactFormSchema)`),
  using `@repo/ui`'s existing shadcn-style `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/
  `FormMessage` primitives (`packages/ui/src/components/ui/form.tsx`) — same pattern already used in
  `apps/reviews`'s submit-review page and `apps/blog`'s new-post page. `Input`/`Textarea`/`Button` stay the
  same `@repo/ui` components already in use; only the field wiring changes.
- The `company` honeypot field renders visually hidden (`sr-only` + `tabIndex={-1}` + `aria-hidden`), not
  `display:none`, so it still occupies real DOM (harder for basic bots to detect via style scan) but is
  invisible/unreachable to real users.
- On submit: `POST /api/contact` with JSON body of the validated values (honeypot included).
- UI states:
  - **idle** — form as normal.
  - **submitting** — submit button shows spinner + "Sending...", disabled, fields disabled.
  - **success** — form replaced with a confirmation message ("Thanks — I'll get back to you soon.") in
    place, matching the reviews app's post-submit pattern. A "Send another message" action resets the form
    back to idle.
  - **error** — inline `role="alert"` message above the submit button (same visual pattern as the reviews
    submit page), form stays filled in so the user doesn't lose their input; submit re-enabled for retry.
- Client-side validation errors render via `FormMessage` under each field (existing shadcn pattern), so a
  bad email/short message never reaches the network.

## 5. API route

New file: `apps/web/src/app/api/contact/route.ts` (Next.js App Router route handler, `POST` only).

This is a deliberate, minimal exception to `apps/web`'s "no backend of its own" — there is no tRPC stack in
this app and adding one for a single mutation would be pure overhead. A thin route handler is the smallest
unit that can hold an SMTP credential server-side.

Request/response contract:

```
POST /api/contact
Content-Type: application/json

{ "name": string, "email": string, "subject": string, "message": string, "company"?: string }

→ 200 { "ok": true }
→ 400 { "ok": false, "error": "<validation message>" }   // zod parse failure, or honeypot filled
→ 500 { "ok": false, "error": "Something went wrong. Please try again." }  // SMTP/send failure
```

Server logic:
1. Parse `request.json()`, run through `contactFormSchema.safeParse` (imported from `@repo/utils/schemas/contact`).
   Reject with 400 on failure (field errors are not itemized in the response — client-side validation
   already prevents this in the normal path, so a 400 here is either a spoofed request or a honeypot trip).
2. If `company` is non-empty, respond `200 { ok: true }` immediately without sending mail — pretending
   success is deliberate so a bot doesn't learn its submission was rejected (see §6).
3. Call `sendContactEmail(values)` from `@repo/email`, which owns the nodemailer transport and Gmail send
   (see §6). `replyTo` is the visitor's submitted email so replying from Gmail goes straight to them.
4. Catch send errors, log server-side (`console.error`) with enough context to debug (not the full message
   body), return 500 with a generic message — never leak SMTP errors to the client.

No rate limiting is implemented (see §2); if abuse becomes a real problem, the recommended follow-up is
Vercel's own edge/WAF rate limiting or a lightweight external store (e.g. Upstash Redis), not something
this route implements itself.

## 6. Email transport (`@repo/email` + nodemailer + Gmail)

A new package, `packages/email` (`@repo/email`), owns all mail-sending — not `apps/web` directly. This
keeps the SMTP concern (and the `nodemailer` dependency) reusable by any future app/package instead of
tying it to the contact form specifically:

- `src/transport.ts` — `getTransporter()` lazily builds and memoizes (module-scope singleton) a
  `nodemailer.createTransport({ service: "gmail", auth: { user, pass } })`, reading credentials via
  `requireEnv` from `@repo/utils` (`GMAIL_USER`, `GMAIL_APP_PASSWORD`). `GMAIL_APP_PASSWORD` is a Google
  **App Password** (requires 2FA enabled on the account), not the account login password — Gmail rejects
  normal-password SMTP auth for third-party apps. Memoizing avoids reconnecting per request; nodemailer
  transports are meant to be reused/pooled.
- `src/contact.ts` — `sendContactEmail({ name, email, subject, message })`, the one domain-specific export,
  builds the message and calls `transporter.sendMail(...)`.
- `src/index.ts` — barrel exporting `sendContactEmail`. `apps/web`'s route handler imports only that; it
  never touches `nodemailer` or transport details directly.
- Mail options:
  - `from`: `"Portfolio Contact" <GMAIL_USER>` — must be the authenticated Gmail address; Gmail's SMTP
    rejects/overrides arbitrary `from` addresses.
  - `to`: `CONTACT_TO_EMAIL` (defaults to `zyadyasser6@gmail.com` if unset, so it works with only the two
    auth env vars set).
  - `replyTo`: the visitor's submitted `email`.
  - `subject`: `` `Portfolio contact: ${subject}` ``.
  - `text`/`html`: name, email, subject, message rendered in a simple template (plain text body is
    sufficient; a minimal HTML version is a nice-to-have, not required).
- Honeypot (`company` field): standard low-cost bot mitigation. Bots that auto-fill every form field trip
  it; real users never see or fill it. Server responds as if successful either way, so scripted probing
  gets no signal to adapt against. No CAPTCHA/third-party service is introduced (see §2).

## 7. Environment variables

New, documented in `apps/web/.env.example` (created by this feature — didn't exist before):

| Var                   | Required | Description                                          |
|------------------------|----------|-------------------------------------------------------|
| `GMAIL_USER`           | yes      | Gmail address used to authenticate + send from        |
| `GMAIL_APP_PASSWORD`   | yes      | 16-char Google App Password for that account          |
| `CONTACT_TO_EMAIL`     | no       | Recipient; defaults to `zyadyasser6@gmail.com`        |

These are server-only (read in the route handler, never prefixed `NEXT_PUBLIC_`) and must be set in the
`apps/web` Vercel project's environment variables for production, and in `apps/web/.env` locally.

## 8. Files touched/added

New shared packages (mirror the existing `packages/*` conventions — raw TS source exports, no build step,
consumed via each app's `transpilePackages`):

- `packages/utils` (`@repo/utils`)
  - `src/env.ts` — `requireEnv(name)`, throws a descriptive error if the env var is missing/empty.
  - `src/schemas/contact.ts` — `contactFormSchema` / `ContactFormValues`.
  - `src/index.ts` — barrel (`requireEnv`). Multi-entry `exports` map: `.` and `./schemas/contact`.
- `packages/email` (`@repo/email`)
  - `src/transport.ts` — memoized Gmail `nodemailer` transporter, reads env via `@repo/utils`.
  - `src/contact.ts` — `sendContactEmail`.
  - `src/index.ts` — barrel (`sendContactEmail`).
  - depends on `@repo/utils` (workspace) and `nodemailer` (+ `@types/nodemailer` dev).

`apps/web` changes:

- `docs/contact-form-spec.md` — this doc.
- `.env.example` — new (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_TO_EMAIL`).
- `src/app/api/contact/route.ts` — new, POST handler using `@repo/email` + `@repo/utils`.
- `src/components/modern-contact.tsx` — form wiring rewritten to react-hook-form + `@repo/ui`'s `Form`
  primitives + fetch call, using the shared schema from `@repo/utils`.
- `package.json` — new deps: `@repo/utils`, `@repo/email` (workspace), `react-hook-form`, `zod`,
  `@hookform/resolvers`.
- `next.config.js` — `@repo/utils` and `@repo/email` added to `transpilePackages` (alongside the existing
  `@repo/ui`), same reason admin's config lists `@repo/auth`/`@repo/trpc` — these packages ship raw TS
  source, so Next.js needs to know to transpile them too.

## 9. Manual test plan

1. Valid submission → 200, email arrives in `CONTACT_TO_EMAIL` inbox with correct `replyTo`.
2. Empty required field → client-side `FormMessage` blocks submit, no network call.
3. Invalid email format → same, client-side blocked.
4. Honeypot (`company`) filled via devtools → server returns `200 { ok: true }`, no email sent.
5. SMTP misconfigured (wrong app password) → 500, generic error message shown, error logged server-side.
6. Successful submit → form swaps to confirmation state; "Send another message" resets to a blank form.
