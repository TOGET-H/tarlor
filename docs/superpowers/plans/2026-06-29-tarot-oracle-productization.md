# Tarot Oracle Productization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing Nuxt tarot CRUD demo into a deployable oracle-style tarot reading experience with immersive visuals, staged draw flow, card reveal, report export, and polished history pages.

**Architecture:** Keep the existing Nuxt/Nitro/Prisma backend contract. Move product experience into `pages/index.vue`, `pages/draw.vue`, `pages/readings/index.vue`, `pages/readings/[id].vue`, and shared CSS in `assets/css/main.css`. Add client-only theme state and PNG export without extra dependencies.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Nitro API, Prisma SQLite, TypeScript, CSS animations, browser Canvas/SVG export.

---

## File Structure

- Modify: `app.vue` - Rename shell branding and update navigation labels for the productized oracle.
- Modify: `assets/css/main.css` - Replace the practical CRUD visual layer with the oracle design system, theme variables, star field, glass panels, card backs, shuffle/reveal animations, reports, responsive rules, and export-friendly classes.
- Modify: `pages/index.vue` - Build the immersive entry page with four themes, question field, spread selector, card back preview, and route handoff to `/draw`.
- Modify: `pages/draw.vue` - Build staged draw flow: prepare, shuffling, reveal, interpretation, follow-up prompts, and long-image export.
- Modify: `pages/readings/index.vue` - Restyle saved reading history with oracle cards and compact record summaries.
- Modify: `pages/readings/[id].vue` - Restyle detail page with card reveal presentation, editable metadata, report section, and export.
- Leave unchanged: `server/api/readings/draw.post.ts` - Existing API already creates saved readings and mock interpretation.
- Leave unchanged: `server/services/interpretation.ts` - Existing mock interpretation remains the report source.

## Task 1: Shared Oracle Visual System

- [ ] Replace base CSS variables with four theme-aware palettes.
- [ ] Add star/noise background, top navigation glass, hero typography, fields, buttons, segmented controls, oracle cards, card backs, shuffle stack, reveal flip, report panels, and responsive mobile layout.
- [ ] Preserve existing `.panel`, `.grid`, `.table`, `.badge`, `.error`, and form utility classes so card CRUD remains usable.

## Task 2: Product Entry Page

- [ ] Replace `pages/index.vue` with a full first-viewport oracle entry.
- [ ] Add local state for `question`, `spreadType`, and `theme`.
- [ ] Route to `/draw?question=...&spread=...&theme=...` on submit.
- [ ] Include four theme swatches and quick feature anchors for draw, records, and card library.

## Task 3: Staged Draw Flow

- [ ] Replace `pages/draw.vue` with staged state: `idle`, `shuffling`, and `revealed`.
- [ ] Read route query for initial question, spread, and theme.
- [ ] Call existing `POST /api/readings/draw`.
- [ ] During draw, show a timed shuffle animation before revealing saved data.
- [ ] Render hidden card backs and let the user reveal cards one by one.
- [ ] Show long-form interpretation report, follow-up prompt buttons, note field, detail link, and retry action.

## Task 4: Client PNG Export

- [ ] Add export helpers in `pages/draw.vue` and `pages/readings/[id].vue`.
- [ ] Use SVG text layout drawn into Canvas to produce a PNG.
- [ ] Include question, spread summary, cards, interpretation, timestamp, and product mark.
- [ ] Show inline export errors.

## Task 5: History And Detail Polish

- [ ] Restyle `pages/readings/index.vue` as a record wall with compact metadata, card summaries, interpretation preview, open/delete actions, and empty state.
- [ ] Restyle `pages/readings/[id].vue` as a saved report page with editable question/status, card spread panel, interpretation report, and export action.

## Task 6: Verification

- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm build`.
- [ ] Start a dev server and provide the local URL.
- [ ] Manually inspect `/`, `/draw`, `/readings`, and at least one `/readings/:id` route.
- [ ] Confirm export button creates a PNG in the browser or report any browser limitation.

## Self-Review

- Spec coverage: all productization requirements from `docs/superpowers/specs/2026-06-29-tarot-oracle-productization-design.md` are represented.
- Placeholder scan: no `TBD`/`TODO` placeholders are present.
- Type consistency: plan uses the existing `Reading`, `ReadingCard`, and `Interpretation` shapes from `types/tarot.ts`.
