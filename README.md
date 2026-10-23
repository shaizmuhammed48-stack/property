# Kerala Estates

A complete, responsive Kerala real-estate portal built with the Next.js App Router, TypeScript and Tailwind CSS. Property listings and buyer enquiries can be driven by Google Sheets through a small Apps Script bridge, with a polished preview catalogue available when the bridge is not configured.

The visual language follows the supplied Stitch designs: deep emerald and champagne accents, Newsreader display type, Manrope body type, generous property photography and editorial spacing.

## Stack

- Next.js 16 (App Router, server components, route handlers)
- React 19 + TypeScript
- Tailwind CSS 3 with custom design tokens
- Lucide icons
- Zod validation
- Google Apps Script + Google Sheets data bridge
- scrypt password hashing and signed, HttpOnly session cookies

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

The app starts in **preview mode** when `GOOGLE_APPS_SCRIPT_URL` is empty:

- 9 curated properties from `lib/mock-data.ts`
- 5 sample enquiries in a local store at `.data/enquiries.json` (gitignored)
- Enquiries submitted through the site are persisted to that local store
- The admin desk can read and update those local enquiries

### Demo admin login

The included gitignored `.env.local` contains a local-only demo account:

```text
URL:      http://localhost:3000/admin/login
Username: admin
Password: KeralaEstates@2026
```

Change these values before deploying. The password must be stored as a scrypt hash, never in plain text.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `GOOGLE_SHEETS_ID` | Optional | Spreadsheet ID kept for reference and operations. The Apps Script bridge performs the actual reads; store the ID there as `SPREADSHEET_ID`. |
| `GOOGLE_APPS_SCRIPT_URL` | Live mode | Deployed Apps Script web-app URL ending in `/exec`. Leave blank for preview mode. |
| `GOOGLE_APPS_SCRIPT_ADMIN_TOKEN` | Bundled bridge | Shared secret also stored as the Apps Script `ADMIN_TOKEN` Script Property. Server-side only. Leave blank for bridges that expose public read endpoints. |
| `ADMIN_USERNAME` | Yes | Admin login username. |
| `ADMIN_PASSWORD_HASH` | Yes | scrypt hash generated with `npm run hash-password`. |
| `AUTH_SECRET` | Production | 32+ character random string (hex recommended) used to sign the admin session cookie. Admin login is disabled in production without it. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL used in metadata and WhatsApp messages. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Recommended | WhatsApp number in international format, digits only (e.g. `919847012345`). |
| `NEXT_PUBLIC_OFFICE_PHONE` | Recommended | Display phone number. |
| `NEXT_PUBLIC_OFFICE_PHONE_E164` | Recommended | `tel:` link phone number. |
| `NEXT_PUBLIC_IMAGE_HOSTS` | Optional | Comma-separated extra HTTPS image hosts for `next/image`. |

Generate an admin password hash:

```bash
npm run hash-password -- "your-strong-password"
```

Paste the full `scrypt:salt:hash` output as `ADMIN_PASSWORD_HASH`. The colon-separated format is deliberate: Next.js expands `$NAME` sequences in `.env` files, which would corrupt a dollar-separated hash.

Only brand/contact values use the `NEXT_PUBLIC_` prefix. Never expose the Apps Script URL token, admin token, password hash or auth secret to the browser.

## Google Sheet schema

The bridge does **not** assume tab names. On each request it scans every tab's header row and picks the sheet whose columns best match a property or enquiry layout. Headers are case-insensitive and ignore spaces, underscores and punctuation, so `Property Name`, `property_name` and `propertyname` are equivalent.

### Property tab

Required for detection: a **name/title** column and a **price/prize/amount** column.

| Suggested header | Aliases recognised | Notes |
| --- | --- | --- |
| `Property ID` | `id`, `ref`, `reference`, `code` | Generated preview IDs are used if absent. |
| `Property Name` | `name`, `title`, `project` | Falls back to `Kerala Residence`. |
| `City` | `town`, `municipality` | |
| `District` | `region` | |
| `Location` | `landmark`, `locality`, `neighbourhood` | |
| `Price` | `prize`, `amount`, `value`, `cost`, `budget` | Accepts `9600000`, `96,00,000`, `₹96 Lakh`, `1.2 Cr`. Plain values below 1000 are treated as lakh. |
| `Bedrooms` | `beds`, `bhk` | |
| `Bathrooms` | `baths` | |
| `Area` | `sqft`, `builtuparea`, `size` | `Cent` values are converted to square feet. |
| `Property Type` | `type`, `category` | |
| `Image URL` | `cardimage`, `image`, `imagelink`, `coverimage`, `photo` | Must be a public HTTPS image URL. `=IMAGE("…")` cells and Google Drive share links are also understood. |
| `Gallery` | `galleryurls`, `galleryimages`, `images`, `photos` | Multiple URLs separated by commas, pipes, semicolons or newlines. |
| `Features` | `amenities`, `highlights`, `keyfeatures` | Comma/pipe separated. |
| `Description` | `about`, `details`, `summary` | |
| `Status` | `possession`, `availability` | |
| `Featured` | `isfeatured`, `showonhome` | `true`, `yes`, `1`, `featured`. |
| `Premium` | `ispremium`, `signature`, `luxury` | Controls the premium/spotlight treatment. |
| `RERA Verified` | `rera`, `verified`, `kvera` | |
| `Created At` | `dateadded`, `listeddate`, `timestamp` | Used for newest-first ordering. |

Missing values degrade gracefully. Invalid or unreachable images are replaced by a branded fallback while keeping a consistent aspect ratio.

### Enquiry tab

Recommended headers: `Enquiry ID`, `Buyer Name`, `Phone`, `Email`, `Property ID`, `Property Name`, `Preferred Location`, `Budget`, `Property Type`, `Bedrooms`, `Message`, `Status`, `Created At`, `Source`.

If no enquiry tab can be detected, the first website submission creates an `Enquiries` tab with these headers. Missing columns are appended automatically without removing existing data. Valid statuses are exactly `New`, `Contacted`, `Interested` and `Closed`.

## Deploying the Apps Script bridge

1. Open the target spreadsheet and choose **Extensions → Apps Script**.
2. Replace the editor contents with [`apps-script/Code.gs`](apps-script/Code.gs).
3. In **Project Settings**, enable **Show `appsscript.json` manifest file**, then paste [`apps-script/appsscript.json`](apps-script/appsscript.json).
4. In **Project Settings → Script Properties**, add:
   - `SPREADSHEET_ID` — the spreadsheet ID (skip this if the script is bound to the sheet).
   - `ADMIN_TOKEN` — a long random shared secret. Use a different value from `AUTH_SECRET`.
5. Click **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone** (required so the Next.js server can reach it; admin actions still require the shared token)
6. Copy the `/exec` URL into `GOOGLE_APPS_SCRIPT_URL` and set the same shared secret in `GOOGLE_APPS_SCRIPT_ADMIN_TOKEN`.
7. Restart the Next.js server and open `/properties`. The listing should now use the live sheet.
8. Test the bridge: `GET <exec-url>?action=ping` should return `{"ok":true,...}`.
9. After changing `Code.gs`, create a **new deployment version** (or edit the existing deployment) and redeploy.

The manifest grants only the Sheets scope and configures an anonymous web app executed as the deploying user. The admin token is checked server-side inside Apps Script; it is never stored in the browser or trusted from a client-supplied admin role.

### Using an existing lightweight bridge

The client also speaks to simpler Apps Script deployments that expose:

- `GET <exec-url>` (or `?action=list`) → `{ ok, count, data: [properties] }`
- `GET ?action=enquiries` → `{ ok, count, data: [{ row, id, name, phone, message, status }] }`
- `POST { action: "addEnquiry", id, name, phone, message }`
- `POST { action: "updateEnquiry", row, status }` with `new`, `contacted`, `in progress` or `closed`

Enquiry rows are addressed by sheet row (`ROW-3`), property names are joined from the property list, and missing dates render as `—`. This layout is convenient but its endpoints are public — anyone with the URL can read enquiries or write rows. Prefer the bundled `Code.gs` bridge with `ADMIN_TOKEN` for production.

## Data flow and security

```text
Browser
  └─ Next.js API route / server component
       ├─ public: properties, create enquiry (Zod + rate limit)
       └─ admin: session cookie required
            └─ server-only Apps Script call (+ ADMIN_TOKEN)
                 └─ Google Sheet
```

- Admin pages are guarded server-side by `requireAdmin()`; unauthenticated visitors are redirected to `/admin/login`.
- Sessions are HMAC-signed, HttpOnly, SameSite=Lax, `Secure` in production, and expire after 8 hours.
- Login and enquiry endpoints are rate limited in memory. For multi-instance production hosting, replace this with a shared limiter.
- Enquiries are deduplicated for the same phone and property within 10 minutes in the local store and the bundled Apps Script bridge. Lightweight bridge layouts may not deduplicate.
- Apps Script serialises writes with `LockService` and neutralises formula-injection prefixes (`=`, `+`, `-`, `@`) on write.
- CSV exports also guard against spreadsheet formula injection.
- Admin credentials are verified with scrypt and timing-safe comparisons.

## Routes

| Route | Description |
| --- | --- |
| `/` | Hero search, featured/recent/premium properties, city explorer, why-us, enquiry CTA. |
| `/properties` | Live catalogue, search, filters, sorting, load-more, loading/empty/error states. |
| `/properties/[id]` | Gallery, full details, features, enquiry form, WhatsApp, related properties, mobile action bar. |
| `/enquiry` | General buyer enquiry form with success/error and duplicate feedback. |
| `/admin/login` | Admin sign-in. |
| `/admin/enquiries` | Protected CRM dashboard: stats, search, filters, inline status updates, WhatsApp, CSV export. |

API routes:

- `GET /api/properties`
- `GET /api/properties/[id]`
- `POST /api/enquiries`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/enquiries` (admin session required)
- `PATCH /api/admin/enquiries/[id]` (admin session required)

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # TypeScript check
npm run start      # serve the production build
npm run typecheck  # TypeScript check
npm run hash-password -- "password"
```

## Project structure

```text
app/
  (site)/              public layout, home, properties, detail, enquiry
  admin/               login + protected admin layout and dashboard
  api/                 property, enquiry and admin route handlers
components/            shared UI, chrome, property, enquiry and admin components
lib/                   types, normalization, data services, auth, validation
apps-script/           Code.gs bridge and appsscript.json manifest
scripts/               password hashing utility
.data/                 local enquiry store (created at runtime, gitignored)
```

## Troubleshooting

- **The sheet URL returns 401 in the browser.** That is expected for a private spreadsheet. The app never reads Google Sheets directly; the Apps Script deployment reads it as the deploying user.
- **Still seeing preview properties.** Confirm `GOOGLE_APPS_SCRIPT_URL` ends in `/exec`, restart the server, and check the `ping` action. Look for `[properties] Apps Script fetch failed` in the server log.
- **`property_sheet_not_found` / `enquiry_sheet_not_found`.** Ensure a tab has recognisable name and price headers (properties) or name/phone headers (enquiries). Header names do not need to match the suggested schema exactly.
- **Admin actions return `unauthorized`.** `ADMIN_TOKEN` in Script Properties must exactly match `GOOGLE_APPS_SCRIPT_ADMIN_TOKEN`, and the Apps Script deployment must be redeployed after changes.
- **Images do not optimise.** Add their host to `next.config.ts` `images.remotePatterns` or `NEXT_PUBLIC_IMAGE_HOSTS`. Unknown hosts still render through the safe fallback image component.
- **Admin login fails.** Regenerate the hash with `npm run hash-password`, update `ADMIN_PASSWORD_HASH`, and restart. Ensure `ADMIN_USERNAME` matches exactly.

## Production checklist

- Replace the demo admin username/password and set a strong `AUTH_SECRET`.
- Deploy Apps Script, set both tokens, and verify `ping`, property loading and an enquiry round-trip.
- Use a shared rate-limit store if deploying multiple instances.
- Serve over HTTPS so the `Secure` session cookie is enforced.
- Keep `.env.local` out of version control and rotate the admin token if it is ever exposed.
- Confirm all image hosts are allow-listed and that external property images use HTTPS.
#   p r o p e r t y  
 