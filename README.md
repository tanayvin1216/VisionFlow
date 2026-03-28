<div align="center">

<br/>

# VisionFlow
### What if you could just use your hands and your voice?

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

### **[Try the Live Demo →](https://visionflow-eta.vercel.app/)**

<br/>

![GitHub stars](https://img.shields.io/github/stars/tanayvin1216/VisionFlow?style=social)
![GitHub forks](https://img.shields.io/github/forks/tanayvin1216/VisionFlow?style=social)

</div>

---

## The Idea

I kept noticing how weird it is that we still type everything. You're standing at a whiteboard sketching and pointing and talking through ideas — and then you sit down at a computer and all of that turns into a cursor in a text box.

VisionFlow started as me wondering what it would feel like to skip that translation step entirely. Just use your hands to move things around, speak when you want to say something, and let the computer figure out the rest.

It's a proof-of-concept. I built it to see if gesture + voice + AI could actually work as one continuous loop — and honestly, it kind of does.

---

## What You're Looking At

Three things running together:

**Gesture** — MediaPipe hand tracking in the browser at 30-60fps. Pinch to draw, grab to rotate a 3D model, two hands to zoom. All from your webcam, nothing to install.

**Voice** — There's an invisible textbox that catches transcription from [Wispr Flow](https://wisprflow.ai). You just talk and it becomes your prompt. No clicking into a text field, no typing.

**Vision AI** — Whatever you drew or whatever the 3D model looks like gets screenshotted and sent to a multimodal AI (supports OpenAI, Anthropic, and Gemini). It sees what you see and answers what you asked.

So you can rotate a 3D influenza virion with your hands, ask "what are the green spikes," and get an actual answer. Without touching the keyboard once.

---

## Three Modes

| Screen | Mode | What It Does |
|-----|------|-------------|
| `1` | **Draw** | Pinch to draw in the air over your webcam feed. Two hands to clear. |
| `2` | **3D Model** | Pinch to rotate a scientifically accurate influenza A virion. Two hands to zoom. |
| `3` | **Annotate** | Draw directly on the 3D model, then ask AI about what you see. |

In every mode, speak your prompt and press Enter. The AI sees everything.

---

## Why This Matters

Voice tools like Wispr Flow already got rid of typing for text. That's huge. But there's still a gap — you can talk to your computer, but you can't *show* it things naturally.

That's what this is trying to explore. Your hands and your voice together are a way more complete input than either one alone. You don't describe a 3D object in words when you could just rotate it. You don't type coordinates when you could point.

I don't think this is the final version of anything. But I think the direction is right — the gap between what you're thinking and what the computer understands should keep getting smaller.

---

## Quick Start

```bash
pnpm install

# Add at least one API key
cp .env.example .env.local

pnpm dev
```

Open ([(https://visionflow-eta.vercel.app/)](https://visionflow-eta.vercel.app/)) — you'll need a webcam.

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
  Built by Tanay Vinaykya
</div>
