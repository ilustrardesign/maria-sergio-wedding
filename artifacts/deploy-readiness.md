# Deploy readiness

## UI

Status: BLOCKED

Verified:

- production build responds with HTTP 200 at `http://127.0.0.1:3001`;
- desktop top/hero screenshot captured at `artifacts/screenshots/final-surgical-qa/1920x1080-top.png`;
- SwiftRead hydration issue is external to the app and was not hidden with React changes.

Blocked:

- full automated desktop/mobile section screenshots were limited by the invitation opening interaction in Chromium headless;
- manual/interactive QA is still required for RSVP layout, gifts grid, Pix modal, mobile sections, navbar, and closing.

## CONTENT

Status: PASS

Verified:

- gift 10 uses `public/images/gifts/original/10-fila-buffet.jpg`;
- current local asset is the Wikimedia/Todai buffet replacement and has no visible iStock watermark;
- `src/content/wedding.ts` references `/images/gifts/original/10-fila-buffet.jpg`;
- `.next` was cleared before the production build to avoid stale image/build cache.

## RSVP

Status: BLOCKED

Implemented locally:

- browser posts only to `POST /api/rsvp`;
- Next.js server forwards to `RSVP_APPS_SCRIPT_URL` with `RSVP_SHARED_SECRET`;
- local auditable Apps Script exists in `artifacts/apps-script/rsvp/Code.gs`;
- Apps Script uses Script Properties: `RSVP_SHARED_SECRET`, `RSVP_NOTIFICATION_EMAILS`, `RSVP_SPREADSHEET_ID`;
- `setup()` creates or validates the Google Sheet without destroying existing rows;
- `doPost(e)` validates payload, appends exactly the 8 required columns, and sends one notification to both recipients.

Blocked:

- no Google Sheet was found in Drive by exact or relaxed title search;
- no Apps Script deployment tool is available in this Codex environment;
- `RSVP_APPS_SCRIPT_URL` is not configured locally;
- RSVP E2E row and the two email deliveries were not tested.

## PIX

Status: BLOCKED

Implemented locally:

- static BR Code Pix generation server-side;
- `POST /api/pix/charges`;
- fixed gifts use server catalog prices and ignore client amount;
- custom gift validates server-side amount;
- QR generated locally with `qrcode`;
- Pix Copia e Cola returned as `pixCopyPaste`;
- no separate JSON field exposes the Pix CPF key;
- no fake `paid`, polling, timeout, or automatic confirmation state.

Blocked:

- `PIX_KEY_CPF` is not configured locally;
- `PIX_RECEIVER_NAME` is not configured locally;
- `PIX_RECEIVER_CITY` is not configured locally;
- real QR/Pix Copia e Cola and bank-app review were not tested.

## BUILD

Status: PASS

Verified commands:

- `corepack pnpm@10.24.0 --version`: PASS (`10.24.0`)
- `corepack pnpm@10.24.0 typecheck`: PASS
- `corepack pnpm@10.24.0 test`: PASS, 6 files and 24 tests
- `corepack pnpm@10.24.0 lint`: PASS
- `corepack pnpm@10.24.0 build`: PASS
- `git diff --check`: PASS

## PRODUCTION SMOKE TEST

Status: PASS

Verified:

- `corepack pnpm@10.24.0 start --hostname 127.0.0.1 --port 3001`: PASS
- `GET /`: PASS, HTTP 200
- `POST /api/rsvp`: PASS as safe blocker, HTTP 503 while `RSVP_APPS_SCRIPT_URL` is unset
- `POST /api/pix/charges`: PASS as safe blocker, HTTP 503 with `Pix ainda não configurado.`
- Next Dev Overlay badge is not present in production start.
