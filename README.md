<div align="center">

<br/>

# VisionFlow
### The space between thinking and doing is disappearing.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-0097A7?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<br/>

### A proof-of-concept for gesture-driven, voice-native computing.

<br/>

![GitHub stars](https://img.shields.io/github/stars/tanayvin1216/VisionFlow?style=social)
![GitHub forks](https://img.shields.io/github/forks/tanayvin1216/VisionFlow?style=social)

</div>

---

## The Idea

We type because keyboards exist, not because typing is how humans think.

Thinking is spatial. It's gestural. You sketch on a whiteboard, you point at things, you talk through problems out loud. But the moment you sit in front of a computer, all of that collapses into a cursor and a blinking text field.

VisionFlow is an experiment in removing that layer. You use your hands to draw in the air, pinch to manipulate a 3D model, and speak naturally to an AI — no keyboard, no mouse, no abstraction between your intent and the machine's understanding.

This isn't about replacing interfaces. It's about asking: what happens when the interface disappears entirely?

---

## What You're Looking At

VisionFlow is a proof-of-concept that connects three input modalities into one seamless loop:

**Gesture** — MediaPipe hand tracking runs in the browser at 30-60fps, detecting pinch, grab, open palm, and peace gestures from your webcam. One hand rotates a 3D model. Two hands zoom and pan. Pinch to draw annotations in the air.

**Voice** — An always-listening invisible textbox captures voice transcription from [Wispr Flow](https://wisprflow.ai), turning speech into prompts without a single keystroke.

**Vision AI** — Your drawings, annotations, and 3D scene are captured and sent to a multimodal AI (OpenAI, Anthropic, or Google Gemini) that sees what you see and responds to what you said.

The result: you manipulate a 3D influenza virion with your bare hands, speak a question about its protein structure, and get an answer — all without touching a keyboard.

---

## Three Modes

| Key | Mode | What It Does |
|-----|------|-------------|
| `1` | **Draw** | Pinch to draw in the air over your webcam feed. Two hands to clear. |
| `2` | **3D Model** | Pinch to rotate a scientifically accurate influenza A virion. Two hands to zoom. |
| `3` | **Annotate** | Draw directly on the 3D model, then ask AI about what you see. |

In every mode, speak your prompt and press Enter. The AI sees everything.

---

## Why This Matters

The keyboard was designed in 1868. We've been typing ever since.

Voice-first tools like Wispr Flow have started to chip away at that — replacing typing with speech, closing the gap between thinking and writing. VisionFlow asks: what's the next step after voice?

It's gesture. It's spatial. It's the idea that your hands and your voice together are a more complete input system than anything we've built so far. You don't describe a 3D object in words — you rotate it. You don't type coordinates — you point. You don't format a diagram — you draw it in the air.

This is a demo, not a product. But it's a demo of something real: the future where doing and creating are the same thing, and the computer just keeps up.

---

## Quick Start

```bash
pnpm install

# Add at least one API key
cp .env.example .env.local

pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll need a webcam.

### Environment Variables

```env
GEMINI_API_KEY=       # Required (at least one)
OPENAI_API_KEY=       # Optional fallback
ANTHROPIC_API_KEY=    # Optional fallback
```

---

## Contributing

Ideas, bug reports, and PRs are welcome.

---

## Contact

- **GitHub:** [@tanayvin1216](https://github.com/tanayvin1216)
- **Email:** [Vinaykya27T@ncssm.edu](mailto:Vinaykya27T@ncssm.edu)
- **Issues:** [Report a bug or request a feature](https://github.com/tanayvin1216/VisionFlow/issues)

---

<div align="center">
  The best interface is no interface.
</div>
