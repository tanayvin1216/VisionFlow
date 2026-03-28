# VisionFlow

A gesture-based AI assistant demo that combines MediaPipe hand tracking with Gemini Vision API. Draw in the air with hand gestures, speak prompts via Whispr Flow, and get intelligent AI analysis.

## Demo for Whispr Flow Internship Application

This project demonstrates the powerful combination of:
- **Gesture Input** - Draw equations, diagrams, or notes in the air
- **Voice Transcription** - Speak your prompts naturally (via Whispr Flow)
- **Multimodal AI** - Gemini Vision analyzes your drawings and responds intelligently

## Quick Start

```bash
# Install dependencies
pnpm install

# Add your Gemini API key
cp .env.example .env.local
# Edit .env.local and add your key from https://aistudio.google.com/apikey

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Draw**: Pinch your thumb and index finger together to draw in the air
2. **Clear**: Open your palm to clear the drawing
3. **Speak**: Use Whispr Flow to transcribe your voice (runs externally)
4. **Submit**: Press Enter to send your drawing + prompt to Gemini AI

## Gestures

| Gesture | Action |
|---------|--------|
| 👌 Pinch | Start/stop drawing |
| ✋ Open Palm | Clear canvas |
| ⌨️ Enter | Submit for AI analysis |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Hand Tracking**: @mediapipe/tasks-vision
- **Animations**: Framer Motion
- **State**: Zustand
- **AI**: Google Gemini 1.5 Flash Vision API
- **Styling**: Tailwind CSS

## Project Structure

```
src/
├── app/
│   ├── api/analyze/     # Gemini API route
│   └── page.tsx         # Main page
├── components/
│   ├── canvas/          # Hand tracking, drawing
│   ├── textbox/         # Invisible input, submit overlay
│   └── ui/              # Mode indicator, FPS counter
├── hooks/               # useWebcam, useHandTracking, useSubmitFlow
├── lib/
│   ├── canvas/          # Drawing capture utilities
│   └── store/           # Zustand state
└── types/               # TypeScript types
```

## Environment Variables

```env
GEMINI_API_KEY=your_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)
