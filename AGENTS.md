# Agent Instructions

## This is NOT the Next.js you know
This version (16.2) has breaking changes — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Feature Implementation Workflow

When implementing a new feature, follow this sequence:

### 1. Plan (use `/plan` or `planning` skill)
- Break the feature into INVEST-compliant stories
- Produce updated PLAN.md with new iteration
- Identify affected files and architectural impact
- Get user alignment before coding

### 2. Implement (use task routing from global rules)
- Route each task to the correct tier (Tier 0-3)
- Follow TDD: write failing test → make it pass → refactor
- Use the Zustand store for new state; extend `AppMode` type if adding modes
- MediaPipe runs client-side only — no SSR for hand tracking code
- Canvas operations must use the existing smoothing/capture utilities in `src/lib/canvas/`
- API routes go in `src/app/api/` — keep keys server-side

### 3. Verify
- `pnpm typecheck && pnpm lint && pnpm build`
- Run tests: `pnpm test`
- For UI changes: check with design-guardian agent against design-policy rules

### 4. Commit
- Follow git-workflow rules (conventional commits, no AI co-author)
- One atomic commit per logical change

## Project-Specific Conventions

### State Management
All app state lives in `src/lib/store/app-store.ts` (Zustand). Do not create additional stores — extend the existing one.

### Component Structure
- `canvas/` — anything related to hand tracking, drawing, or webcam overlay
- `textbox/` — input capture and submission UI
- `ui/` — shared presentational components
- Each directory has an `index.ts` barrel export — update it when adding components

### Gestures
Gesture detection lives in `useHandTracking.ts`. Current gestures:
- **Pointing** (index extended, others curled) → activates drawing
- **Open palm** (all fingers extended, held 800ms) → clears canvas
- **Idle** (fist/other) → no action

To add a new gesture: extend the `GestureType` in `types/hand-tracking.ts`, add detection logic in `useHandTracking.ts`, handle it in `DrawingCanvas.tsx`.

### API Route
`/api/analyze` supports 3 AI providers with automatic fallback. To add a new provider: add detection block in `route.ts`, follow the existing pattern (check env var → construct client → call API → return response).

### Animation
All animations use Framer Motion. Follow existing patterns in `SubmitOverlay.tsx` for sequenced animations with `motion.div` and `AnimatePresence`.
