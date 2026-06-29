# Tarot Oracle Productization Design

## Goal

Turn the current Nuxt tarot CRUD demo into a deployable tarot reading experience inspired by the reference video: atmospheric landing, theme selection, ritual draw flow, card reveal, long-form interpretation, follow-up prompt area, reading history, and shareable long-image export.

## Scope

This iteration focuses on the public reading experience and deployable polish while preserving the existing backend contract.

Included:

- Replace the plain home page with an immersive oracle entry screen.
- Add four visual theme modes: blue, ember, moss, and violet.
- Rebuild `/draw` as a staged flow: intent input, shuffle animation, hidden cards, click-to-reveal cards, interpretation report, follow-up prompts, and long-image export.
- Upgrade reading history and detail pages to match the oracle visual language.
- Keep card library CRUD available as an admin-like management page.
- Keep existing Prisma SQLite persistence and Nitro API routes.
- Keep mock interpretation for now, but present it as a report section suitable for future AI output.
- Add client-side long-image export using browser canvas/SVG APIs without adding a new dependency.
- Verify typecheck and production build before handoff.

Not included:

- Real AI provider integration.
- User login or multi-user permissions.
- Payment, subscription, or hosted database migration.
- Pixel-perfect cloning of the reference video.

## UX Direction

The product should feel like a quiet digital oracle rather than a CRUD demo. The first viewport should immediately show the product identity, a question field, spread choice, and a large animated card back. The palette is dark and restrained with star dust, glass panels, low-contrast borders, and precise typography.

The primary user journey:

1. User opens `/` and sees the oracle entry.
2. User enters a question and chooses a spread.
3. User starts a reading and moves into `/draw`.
4. The app displays a shuffle state for a short interval.
5. The app shows card backs and invites the user to reveal each card.
6. Revealed cards show position, orientation, card name, and selected upright/reversed meaning.
7. The report section shows the saved mock interpretation as a polished reading.
8. The user can pick a follow-up prompt, add a note, save a long image, or open the saved detail page.

## Architecture

Keep the current Nuxt full-stack structure:

- `server/api/readings/draw.post.ts` remains the source of saved readings.
- `pages/index.vue` handles the entry experience and navigates to `/draw` with query parameters.
- `pages/draw.vue` handles the staged client interaction and calls the existing draw API.
- `pages/readings/index.vue` and `pages/readings/[id].vue` show saved records using the same design system.
- `assets/css/main.css` owns the shared visual system, card art, animation, responsive layout, and print/export-friendly report styling.

The theme is client-side only. It controls CSS classes and does not affect saved API data.

## Data Flow

- Home page stores the user's current question, spread type, and theme in the route query when starting a reading.
- Draw page reads query values on mount and pre-fills its local state.
- Draw submit sends `{ question, spreadType }` to `POST /api/readings/draw`.
- The API returns a persisted `Reading`.
- Draw page keeps local reveal state in an array of card IDs.
- Reading history and detail pages continue to fetch saved records from `/api/readings` and `/api/readings/[id]`.

## Long Image Export

The export should work fully in the browser:

- Build a compact SVG string containing the question, card summary, interpretation, and timestamp.
- Draw that SVG into a canvas through an `Image`.
- Download a PNG with a deterministic filename like `oracle-reading-<id>.png`.

This avoids adding screenshot libraries and keeps deployment simple. If browser export fails, show an inline error and keep the saved reading available.

## Error Handling

- Empty questions are blocked by HTML required fields and backend validation.
- API errors display inline near the action button.
- Export errors display in the report action area.
- Unknown route query values fall back to the single-card spread and blue theme.
- If a saved reading has no interpretation, the UI shows a muted fallback instead of crashing.

## Deployment Verification

Before handoff:

- Run `pnpm typecheck`.
- Run `pnpm build`.
- Start `pnpm dev` or `pnpm preview` and provide the local URL.
- Manually inspect `/`, `/draw`, `/readings`, and one reading detail page.
- Confirm the long-image export button downloads a PNG in a browser.

## Self-Review

- Spec coverage: public entry, theme modes, draw flow, reveal interaction, interpretation report, follow-up prompts, history/detail polish, export, and deployment verification are covered.
- Placeholder scan: no placeholder feature remains in scope.
- Scope check: real AI, auth, payment, and production database migration are explicitly out of scope.
- Ambiguity check: the implementation is a reference-inspired productization, not pixel-perfect video cloning.
