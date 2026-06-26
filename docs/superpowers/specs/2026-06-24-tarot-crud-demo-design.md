# Tarot CRUD Demo Design

## Goal

Build a runnable Nuxt full-stack demo for a tarot reading application. The demo must include a local database, backend APIs, and frontend pages. It should support tarot card library CRUD, drawing cards, saving reading records, and reserving a clean integration point for future AI interpretation.

## Scope

The demo is a single-user local application. It does not include login, payment, multi-user permissions, or production deployment setup.

Included features:

- Manage a small seeded tarot card library.
- Create, read, update, and delete tarot cards.
- Create tarot readings from a user question and a selected spread.
- Support one-card and three-card spreads.
- Randomly draw cards from the local card library.
- Randomly assign upright or reversed orientation for each drawn card.
- Save reading history.
- Save generated interpretation text.
- Use a mock interpretation generator now, with a replaceable backend service function for future AI integration.

## Recommended Stack

- Framework: Nuxt 4
- Frontend: Vue single-file components in Nuxt pages
- Backend: Nuxt/Nitro server API routes
- Database: local SQLite file
- ORM: Prisma
- Package manager: pnpm

This keeps the demo in one project while still showing the full path from database schema to backend API to frontend UI.

## Data Model

### TarotCard

Represents a card in the tarot library.

Fields:

- `id`: primary key
- `name`: card name, for example `The Fool`
- `arcana`: `major` or `minor`
- `suit`: optional, for minor arcana
- `number`: optional numeric or court rank text
- `uprightMeaning`: upright meaning
- `reversedMeaning`: reversed meaning
- `description`: optional longer description
- `imageUrl`: optional image URL or local asset path
- `createdAt`
- `updatedAt`

The initial seed should include about 10-12 sample cards, enough for one-card and three-card draws.

### Reading

Represents one saved tarot reading.

Fields:

- `id`: primary key
- `question`: user question
- `spreadType`: `single` or `past_present_future`
- `status`: `draft`, `interpreted`, or `archived`
- `createdAt`
- `updatedAt`

### ReadingCard

Represents a card drawn inside one reading.

Fields:

- `id`: primary key
- `readingId`: related reading
- `cardId`: related tarot card
- `position`: spread position, for example `single`, `past`, `present`, or `future`
- `orientation`: `upright` or `reversed`
- `sortOrder`: display order

### Interpretation

Represents generated interpretation content for a reading.

Fields:

- `id`: primary key
- `readingId`: related reading
- `provider`: `mock` initially, future value can be `openai`
- `content`: generated interpretation text
- `createdAt`

## Backend API

All APIs live under `server/api`.

### Card APIs

- `GET /api/cards`: list tarot cards
- `POST /api/cards`: create a card
- `GET /api/cards/[id]`: get one card
- `PUT /api/cards/[id]`: update one card
- `DELETE /api/cards/[id]`: delete one card

Validation rules:

- `name`, `arcana`, `uprightMeaning`, and `reversedMeaning` are required.
- `arcana` must be `major` or `minor`.
- Delete should fail if the card is already used by a saved reading, unless a future archive strategy is added.

### Reading APIs

- `GET /api/readings`: list readings with drawn cards and latest interpretation
- `POST /api/readings/draw`: create a reading, draw cards, save drawn cards, generate mock interpretation
- `GET /api/readings/[id]`: get one reading detail
- `PUT /api/readings/[id]`: update question or status
- `DELETE /api/readings/[id]`: delete a reading and its related drawn cards and interpretations

Draw rules:

- `single` draws 1 card with position `single`.
- `past_present_future` draws 3 unique cards with positions `past`, `present`, and `future`.
- Each card orientation is randomly assigned.
- If there are not enough cards in the database for the selected spread, the API returns a clear validation error.

### Interpretation Service

Create a small server-side service module, for example `server/services/interpretation.ts`.

Initial behavior:

- Accept the reading question, spread type, drawn cards, positions, orientations, and meanings.
- Return deterministic-looking mock interpretation text.

Future AI behavior:

- Replace the internals of this service with an OpenAI or other AI provider call.
- Keep the API and database contract unchanged.

## Frontend Pages

### `/`

A compact home screen that links to:

- Draw a reading
- Card library
- Reading history

### `/cards`

Card library management page.

Capabilities:

- Display all cards in a table or dense list.
- Add a new card.
- Edit an existing card.
- Delete a card.
- Show validation and API errors inline.

### `/draw`

Main tarot reading flow.

Capabilities:

- Input the user's question.
- Select spread type: single card or past/present/future.
- Submit to draw cards.
- Show drawn cards with position, orientation, and matching upright/reversed meaning.
- Show generated mock interpretation.
- Provide a link to the saved reading detail.

### `/readings`

Reading history page.

Capabilities:

- List saved readings.
- Show question, spread type, created time, card names, and interpretation preview.
- Open a reading detail.
- Delete a reading.

### `/readings/[id]`

Reading detail page.

Capabilities:

- Show full question.
- Show spread and drawn cards.
- Show full interpretation.
- Allow editing the question or archiving the record.

## UI Direction

The app should feel like a practical tarot journal, not a marketing landing page. Use restrained visual styling, readable content density, and clear actions.

Preferred UI characteristics:

- Dark-neutral or parchment-like background with restrained accent colors.
- Clear navigation between draw, cards, and history.
- Cards should be recognizable as tarot cards through layout, title, orientation, and meaning text.
- Forms should be simple and task-focused.
- Avoid oversized hero sections and decorative-only UI.

## Error Handling

Backend errors should return structured messages suitable for frontend display.

Important cases:

- Required fields missing when creating or editing a card.
- Invalid spread type.
- Not enough cards in the local database to draw the selected spread.
- Trying to delete a card that is already used by a reading.
- Reading not found.

Frontend should show these messages near the action that failed.

## Testing And Verification

Minimum verification:

- Install dependencies.
- Run Prisma migration.
- Seed sample tarot cards.
- Start Nuxt dev server.
- Verify `/cards`, `/draw`, `/readings`, and `/readings/[id]`.
- Run lint or typecheck if the scaffold includes scripts for them.

Manual acceptance checks:

- Cards can be created, edited, listed, and deleted.
- A single-card reading can be drawn and saved.
- A three-card reading can be drawn and saved.
- Reading history shows saved readings.
- Reading detail shows cards and interpretation.
- Deleting a reading removes it from history.
- A card used in a reading cannot be deleted and shows a useful error.

## Open Decisions

Resolved decisions:

- Use a local database.
- Use a small sample tarot library rather than all 78 cards.
- Include card library CRUD, reading CRUD, and AI interpretation placeholder.
- Start without login.

No unresolved decisions remain for the initial demo.
