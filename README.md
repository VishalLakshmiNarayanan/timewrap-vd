<h1><b>Chronos Guru</b></h1>
<h3>Where History Talks Back — An AI-Powered Historical Conversation Platform</h3>

<p>
Learning history from textbooks is passive — what if you could <b>debate with Socrates</b> or <b>discuss art with Leonardo da Vinci</b>?<br>
Chronos Guru brings historical figures to life through immersive, multi-lingual AI conversations powered by Claude and Groq, featuring voice interaction, gamification, and cross-era debates.
</p>

<p>
  <img src="https://img.shields.io/badge/Status-Completed-brightgreen?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge"/>
</p>

---

## Overview

Chronos Guru answers a crucial educational question:

> **"How do we make history engaging, interactive, and accessible to learners of all languages?"**

This platform enables users to:

- Engage in **authentic conversations** with any historical figure
- Learn in **19+ languages** with real-time translation
- Experience **cross-era debates** between multiple historical figures
- Track progress through **gamification** (points, badges, perfect scores)
- Export **AI-generated summaries** with key points and timelines
- Interact via **voice** (Speech-to-Text + Text-to-Speech)

The project is **fully deployed**, **production-ready**, and designed for educational impact.

---

## Key Features

| Category | Description |
| ---------------------- | --------------------------------------------------------------- |
| **AI Conversations** | Chat with any historical figure powered by Claude AI (Groq LLaMA 3.3 70B) |
| **Multi-Language** | 19 languages supported with real-time translation (Google Translate API) |
| **Voice Interaction** | Speech-to-Text input + ElevenLabs/Browser TTS output |
| **Cross-Era Debates** | Add multiple historical figures for dynamic debates and discussions |
| **Gamification** | Points system, achievement badges, perfect score tracking |
| **Quiz System** | AI-generated quizzes with personalized feedback from historical figures |
| **PDF Summaries** | Export conversation summaries with key points and timelines |
| **Dark Mode** | Full dark mode support with Next.js themes |
| **Progress Tracking** | LocalStorage-based progress persistence across sessions |

---

## Tech Stack

<p>
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" height="45" />
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" height="45" />
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" height="45" />
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" height="45" />
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vercel/vercel-original.svg" height="45" />
</p>

**Core Technologies:**
- **Next.js 16.0** (React 19) - App Router, Server Components, API Routes
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling with custom theme
- **Radix UI** - Accessible component primitives
- **Groq AI SDK** - LLaMA 3.3 70B for historical figure conversations
- **ElevenLabs API** - Premium text-to-speech with gender-based voices
- **Web Speech API** - Browser-based STT/TTS fallback
- **Vercel** - Serverless deployment and analytics

---

## Feature Deep Dive

<table>
<tr>
<td width="50%" valign="top">

### **1. AI-Powered Historical Figures**
- Authentic persona modeling
- Era-specific knowledge boundaries
- First-person conversational responses
- Context-aware dialogue with memory

</td>
<td width="50%" valign="top">

### **2. Multi-Language Support**
- 19 languages including English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, and more
- Real-time translation for both input and output
- Language-specific TTS voices
- Optional English transcripts

</td>
</tr>

<tr>
<td width="50%" valign="top">

### **3. Cross-Era Debates**
- Add multiple historical figures to conversations
- AI-generated debate interactions
- Figures respond to each other contextually
- Sequential turn-based dialogue system
- Color-coded speaker identification

</td>
<td width="50%" valign="top">

### **4. Voice Interaction**
- **Speech-to-Text**: Web Speech API for voice input
- **Text-to-Speech**: ElevenLabs premium voices with gender detection
- **Fallback TTS**: Browser-native voices in 19 languages
- **Speech Variations**: Natural coughs, pauses, chuckles

</td>
</tr>

<tr>
<td width="50%" valign="top">

### **5. Gamification System**
- **Points**: 10 points per correct quiz answer + 10 bonus for perfect scores
- **Badges**: Achievement system for milestones
- **Perfect Scores**: Track figures you've mastered
- **Journey Reset**: Start fresh while preserving learning

</td>
<td width="50%" valign="top">

### **6. Quiz & Assessment**
- AI-generated quizzes based on conversation content
- Personalized feedback from historical figures
- Wrong answer explanations in character
- Progress tracking per figure

</td>
</tr>
</table>

---

## Architecture

```
timewrap-vd/
├── app/
│   ├── api/
│   │   ├── chat/                 # Main conversation endpoint
│   │   ├── quiz/                 # Quiz generation
│   │   ├── reflection/           # Post-quiz feedback
│   │   ├── summary/              # PDF export data
│   │   ├── translate/            # Multi-language translation
│   │   ├── elevenlabs-tts/       # Premium voice synthesis
│   │   ├── figure-gender/        # Gender detection for voices
│   │   └── wikipedia-images/     # Historical figure images
│   ├── chat/[figure]/            # Dynamic chat routes
│   ├── page.tsx                  # Landing page with progress
│   └── layout.tsx                # Root layout with theme
├── components/
│   ├── chat-interface.tsx        # Main chat UI with voice
│   ├── quiz-modal.tsx            # Quiz interface
│   ├── add-member-modal.tsx      # Multi-figure conversation
│   └── ui/                       # Radix UI components
└── lib/
    └── utils.ts                  # Shared utilities
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Groq API key (for LLaMA 3.3)
- ElevenLabs API key (optional, for premium TTS)

### Environment Variables

Create a `.env.local` file:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional (for premium TTS)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### Installation

```bash
# Clone the repository
git clone https://github.com/VishalLakshmiNarayanan/timewrap-vd.git
cd timewrap-vd

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to start chatting with historical figures!

---

## Usage Examples

### Single Figure Conversation
1. Enter a historical figure name (e.g., "Albert Einstein")
2. Start asking questions about their era, work, or life
3. Switch languages using the dropdown
4. Use voice input by clicking "Speak"
5. Take a quiz to test your knowledge
6. Export a PDF summary

### Cross-Era Debate
1. Start a conversation with any historical figure
2. Click the 👥 button to add another figure
3. Ask questions that both can answer
4. Watch them debate and respond to each other
5. Add up to 5 figures for rich discussions

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Generate historical figure responses |
| `/api/quiz` | POST | Create AI-generated quizzes |
| `/api/reflection` | POST | Generate personalized quiz feedback |
| `/api/summary` | POST | Extract key points and timeline |
| `/api/translate` | POST | Translate text to target language |
| `/api/translate-to-english` | POST | Translate back to English |
| `/api/elevenlabs-tts` | POST | Generate premium voice audio |
| `/api/figure-gender` | POST | Detect gender for voice selection |

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| **Initial Load Time** | < 2s (Vercel Edge) |
| **Time to Interactive** | < 3s |
| **Conversation Response** | 1-3s (LLaMA 3.3 70B) |
| **TTS Generation** | 0.5-1.5s (ElevenLabs) |
| **Languages Supported** | 19 |
| **Max Concurrent Figures** | 5 |
| **Quiz Generation Time** | 2-4s |

---

## Roadmap

- [ ] **Voice Cloning**: Historical figure voice synthesis using AI
- [ ] **AR/VR Mode**: Immersive historical environments
- [ ] **Collaborative Learning**: Multi-user debate sessions
- [ ] **Timeline Visualization**: Interactive historical timeline UI
- [ ] **Mobile App**: React Native iOS/Android versions
- [ ] **Classroom Mode**: Teacher dashboard and student management
- [ ] **Advanced Analytics**: Learning path recommendations
- [ ] **Historical Accuracy Scoring**: Fact-checking with citations

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Deployment

This project is deployed on Vercel:

**Live Demo:** [https://vercel.com/vishals-projects-aa823dcf/v0-ai-history-tutor](https://vercel.com/vishals-projects-aa823dcf/v0-ai-history-tutor)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/VishalLakshmiNarayanan/timewrap-vd)

---

## Acknowledgements

**Technologies:**
- [Claude AI](https://www.anthropic.com/claude) - Inspiration for conversational AI
- [Groq](https://groq.com/) - LLaMA 3.3 70B inference
- [ElevenLabs](https://elevenlabs.io/) - Premium text-to-speech
- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Deployment platform
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Styling

**Research & Inspiration:**
- Educational psychology research on active learning
- Historical pedagogy and conversational teaching methods
- AI safety and responsible historical representation

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

