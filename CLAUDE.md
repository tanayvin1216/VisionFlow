# VisionFlow

Gesture-based AI assistant: draw in the air with hand tracking, speak prompts via Whispr Flow, get AI analysis from multimodal vision APIs.

## Stack
- **Framework**: Next.js 16.2 (App Router), React 19, TypeScript 5 (strict)
- **Hand Tracking**: @mediapipe/tasks-vision (browser, GPU-accelerated, ~30fps)
- **Drawing**: HTML5 Canvas 2D API with smoothing filter
- **Styling**: Tailwind CSS 4, Framer Motion 12
- **State**: Zustand 5
- **AI Backend**: Multi-provider fallback — OpenAI (gpt-4o) → Anthropic (claude-sonnet) → Google Gemini (2.0 Flash)
- **Testing**: Vitest 4, Testing Library 16
- **Package Manager**: pnpm

## Commands
```
pnpm dev          # start dev server
pnpm build        # production build
pnpm test         # run tests (vitest)
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
```

## Architecture
```
src/
├── app/
│   ├── api/analyze/route.ts       # AI analysis endpoint (3 provider fallback)
│   ├── page.tsx                   # Main app — orchestrates all components
│   ├── layout.tsx                 # Root layout
│   └── globals.css
├── components/
│   ├── canvas/
│   │   ├── HandTracking.tsx       # Main orchestrator — webcam + tracking + canvas
│   │   ├── DrawingCanvas.tsx      # Canvas rendering + gesture state machine
│   │   ├── HandLandmarksOverlay.tsx # Hand skeleton visualization
│   │   └── index.ts
│   ├── textbox/
│   │   ├── InvisibleTextbox.tsx   # Always-focused textarea for voice/keyboard input
│   │   ├── SubmitOverlay.tsx      # Animated submission + response UI
│   │   └── index.ts
│   └── ui/
│       ├── FpsCounter.tsx
│       ├── ModeIndicator.tsx
│       └── index.ts
├── hooks/
│   ├── useWebcam.ts              # Webcam stream management
│   ├── useHandTracking.ts        # MediaPipe loop + gesture detection
│   └── useSubmitFlow.ts          # Submit orchestration + API calls
├── lib/
│   ├── canvas/capture.ts         # Canvas → base64 PNG
│   └── store/app-store.ts        # Zustand store (mode, gestures, drawing, response)
└── types/
    ├── hand-tracking.ts          # Gesture & landmark types
    └── mediapipe.d.ts            # MediaPipe type declarations
```

## Key Patterns
- **Gesture detection**: Geometric finger-position comparison (not ML classifier)
- **Drawing smoothing**: Weighted average over 5 recent points
- **App modes**: idle → drawing → submitting → thinking → response (state machine in Zustand)
- **Voice input**: Invisible always-focused textarea captures Whispr Flow transcription
- **API security**: Keys stay server-side in API route, never exposed to client

## Environment Variables
```
GEMINI_API_KEY=       # Required (at least one)
OPENAI_API_KEY=       # Optional fallback
ANTHROPIC_API_KEY=    # Optional fallback
```

## Pre-Commit Verification
1. `pnpm typecheck` — must pass
2. `pnpm lint` — must pass
3. `pnpm build` — must succeed

## Rules
- TypeScript strict mode. No `any` types.
- No hardcoded secrets. Environment variables only.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- All errors handled explicitly. No silent catches.
- Read `node_modules/next/dist/docs/` before using Next.js APIs — this version has breaking changes.

@AGENTS.md
