"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { QuizModal } from "./quiz-modal"

interface Message {
  role: "user" | "assistant"
  content: string
}

type LangCode = 'auto' | 'en' | 'hi' | 'es' | 'fr' | 'de' | 'it' | 'ar' | 'zh' | 'ja'

export function ChatInterface({ figure }: { figure: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Greetings! I am ${figure}. I am pleased to share knowledge about my era and expertise. What would you like to know?`,
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [sttSupported, setSttSupported] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [language, setLanguage] = useState<LangCode>('en')
  const [autoLangCode, setAutoLangCode] = useState<string>('en-US')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [figureGender, setFigureGender] = useState<'male' | 'female'>('male')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => { scrollToBottom() }, [messages])

  // Load available TTS voices
  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.onvoiceschanged = load
  }, [])

  // Detect Speech-to-Text support (Web Speech API)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const supported = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    setSttSupported(supported)
  }, [])

  // Removed Wikipedia integration

  // Resolve figure language if using auto mode
  useEffect(() => {
    const resolve = async () => {
      try {
        const r = await fetch('/api/figure-language', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ figure })
        })
        if (r.ok) {
          const data = await r.json()
          if (data?.code) setAutoLangCode(data.code)
        }
      } catch {}
    }
    if (language === 'auto') resolve()
  }, [language, figure])

  // Detect figure gender for voice selection
  useEffect(() => {
    const detectGender = async () => {
      try {
        const r = await fetch('/api/figure-gender', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ figure })
        })
        if (r.ok) {
          const data = await r.json()
          setFigureGender(data?.gender || 'male')
        }
      } catch {}
    }
    if (figure) detectGender()
  }, [figure])

  const langToBCP47 = (lang: LangCode): string => {
    switch (lang) {
      case 'en': return 'en-US'
      case 'hi': return 'hi-IN'
      case 'es': return 'es-ES'
      case 'fr': return 'fr-FR'
      case 'de': return 'de-DE'
      case 'it': return 'it-IT'
      case 'ar': return 'ar-SA'
      case 'zh': return 'zh-CN'
      case 'ja': return 'ja-JP'
      case 'auto': return autoLangCode || 'en-US'
      default: return 'en-US'
    }
  }

  // Add speech variations like coughs and laughs
  const addSpeechVariations = (text: string): string => {
    const sentences = text.split(/([.!?]+)/).filter(s => s.trim())
    const variations = [
      { chance: 0.05, sound: '*cough* ' },
      { chance: 0.03, sound: '*chuckles* ' },
      { chance: 0.02, sound: '*thoughtful pause* ' },
    ]

    let result = ''
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      // Maybe add a variation before this sentence
      if (i > 0 && Math.random() < 0.1) {
        const variation = variations.find(v => Math.random() < v.chance)
        if (variation) result += variation.sound
      }
      result += sentence
    }
    return result
  }

  const speakText = async (text: string) => {
    // Stop any current audio
    stopSpeech()
    setIsSpeaking(true)

    // Add speech variations
    const textWithVariations = addSpeechVariations(text)

    try {
      // Try Murf AI TTS first with gender-based voice selection
      const response = await fetch('/api/elevenlabs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textWithVariations, gender: figureGender })
      })

      const data = await response.json()

      if (data.fallbackToBrowser) {
        // Fallback to browser TTS if Murf fails or is not configured
        useBrowserTTS(text)
        return
      }

      if (data.audioData) {
        // Convert base64 to blob and play
        const audioBlob = base64ToBlob(data.audioData, data.mimeType || 'audio/mpeg')
        const audioUrl = URL.createObjectURL(audioBlob)

        const audio = new Audio(audioUrl)
        audioRef.current = audio

        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }

        audio.onerror = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
          // Fallback to browser TTS on error
          useBrowserTTS(text)
        }

        await audio.play()
      } else {
        useBrowserTTS(text)
      }
    } catch (error) {
      console.error('Murf AI TTS error:', error)
      // Fallback to browser TTS
      useBrowserTTS(text)
    }
  }

  const useBrowserTTS = (text: string) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    const target = langToBCP47(language)
    utterance.lang = target
    const voice = voices.find(v => v.lang?.toLowerCase().startsWith(target.slice(0,2).toLowerCase()))
    if (voice) utterance.voice = voice
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    return new Blob(byteArrays, { type: mimeType })
  }

  const stopSpeech = () => {
    // Stop audio element
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    // Stop browser TTS
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  // Speech-to-Text: start/stop microphone and fill the input
  const toggleListening = () => {
    if (!sttSupported || loading) return
    if (isListening) {
      try { recognitionRef.current?.stop() } catch {}
      setIsListening(false)
      return
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = langToBCP47(language)
    rec.interimResults = true
    rec.maxAlternatives = 1
    let finalTranscript = ''
    rec.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        if (res.isFinal) finalTranscript += res[0].transcript
        else interim += res[0].transcript
      }
      const text = (finalTranscript || interim).trim()
      if (text) setInput(text)
    }
    rec.onend = () => { setIsListening(false); recognitionRef.current = null }
    rec.onerror = () => { setIsListening(false) }
    try {
      rec.start()
      recognitionRef.current = rec
      setIsListening(true)
    } catch {}
  }

  // Progress persistence helpers
  type StoredBadge = { id: string; name: string; description: string; icon: string }
  type Progress = {
    points: number
    badges: StoredBadge[]
    figures: { [name: string]: { quizzes: number; perfect: boolean } }
  }

  const getProgress = (): Progress => {
    if (typeof window === 'undefined') return { points: 0, badges: [], figures: {} }
    try {
      const raw = localStorage.getItem('historica-progress')
      if (!raw) return { points: 0, badges: [], figures: {} }
      const parsed = JSON.parse(raw)
      return {
        points: parsed.points ?? 0,
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
        figures: parsed.figures ?? {},
      }
    } catch {
      return { points: 0, badges: [], figures: {} }
    }
  }

  const saveProgress = (p: Progress) => {
    try { localStorage.setItem('historica-progress', JSON.stringify(p)) } catch {}
  }

  const resetJourney = () => {
    if (confirm('Are you sure you want to reset your entire journey? This will clear all progress, points, and badges.')) {
      try {
        localStorage.removeItem('historica-progress')
        alert('Your journey has been reset!')
        window.location.reload()
      } catch (error) {
        console.error('Error resetting journey:', error)
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figure,
          messages: [...messages, { role: "user", content: userMessage }],
          language,
        }),
      })
      if (!response.ok) throw new Error("Failed to get response")
      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }])
      speakText(data.message)
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I apologize, but I cannot continue this conversation at the moment." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleExportPdf = async () => {
    if (exporting) return
    try {
      setExporting(true)
      const resp = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ figure, messages, language }),
      })
      if (!resp.ok) throw new Error('Failed to create summary')
      const data = await resp.json()

      const title = `Chronos Guru - ${figure} Summary`
      const styles = `
        body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; padding:24px;color:#111}
        h1{font-size:24px;margin:0 0 8px}
        h2{font-size:18px;margin:24px 0 8px}
        .muted{color:#555}
        ul{margin:0 0 16px 20px}
        li{margin:6px 0}
        table{border-collapse:collapse;width:100%;margin-top:8px}
        th,td{border:1px solid #ddd;padding:8px;text-align:left}
        th{background:#f6f6f6}
        .footer{margin-top:24px;font-size:12px;color:#777}
      `
      const pointsHtml = Array.isArray(data.points) && data.points.length
        ? '<ul>' + data.points.map((p: string) => `<li>${p}</li>`).join('') + '</ul>'
        : '<p class="muted">No key points available.</p>'
      const timelineHtml = Array.isArray(data.timeline) && data.timeline.length
        ? '<table><thead><tr><th>Date</th><th>Event</th></tr></thead><tbody>' +
          data.timeline.map((t: any) => `<tr><td>${t.date}</td><td>${t.event}</td></tr>`).join('') +
          '</tbody></table>'
        : '<p class="muted">No timeline items available.</p>'

      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${styles}</style></head>
        <body>
          <h1>${figure}</h1>
          <div class="muted">Learning summary generated from your Chronos Guru conversation.</div>
          <h2>Important Points</h2>
          ${pointsHtml}
          <h2>Timeline</h2>
          ${timelineHtml}
          <div class="footer">Saved from Chronos Guru - ${new Date().toLocaleString()}</div>
          <script>window.onload = () => { window.print(); };</script>
        </body></html>`

      const w = window.open('', '_blank')
      if (w) {
        w.document.open()
        w.document.write(html)
        w.document.close()
      } else {
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      }
    } catch (e) {
      console.error(e)
      alert('Unable to generate PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col min-h-[60vh]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`
                  max-w-md px-4 py-3 rounded-lg group
                  ${
                    msg.role === "user"
                      ? "bg-[#d97706] text-white shadow-md"
                      : "bg-[#f5e6d3] dark:bg-slate-700 text-[#5f2712] dark:text-amber-50 shadow-sm border border-[#d4a574]"
                  }
                `}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => speakText(msg.content)}
                    className="mt-2 text-xs opacity-70 hover:opacity-100 transition-opacity text-[#8e7555] hover:text-[#5f2712]"
                    title="Play audio"
                  >
                    🔊 Read aloud
                  </button>
                )}
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#f5e6d3] dark:bg-slate-700 px-4 py-3 rounded-lg flex gap-2 border border-[#d4a574] shadow-sm">
                <Spinner className="w-4 h-4" />
                <span className="text-sm text-[#5f2712] dark:text-amber-50">{figure} is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3 items-center">
          <select
            value={language}
            className="border-2 border-[#d4a574] dark:border-slate-600 rounded px-2 py-2 bg-[#fffaf5] dark:bg-slate-800 text-sm text-[#5f2712] dark:text-amber-100 shadow-sm"
            onChange={(e) => setLanguage(e.target.value as LangCode)}
            title="Language"
          >
            <option value="en">English</option>
            <option value="auto">Figure's language</option>
          </select>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Ask ${figure} about their era...`}
            disabled={loading}
            className="border-2 border-[#d4a574] dark:border-slate-600 bg-[#fffaf5] text-[#5f2712] placeholder:text-[#a38d68] shadow-sm"
          />
          <Button
            onClick={toggleListening}
            disabled={loading || !sttSupported}
            className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-[#d97706] hover:bg-[#b45309]'} text-white`}
            title={sttSupported ? (isListening ? 'Stop listening' : 'Speak your question') : 'Speech input not supported in this browser'}
          >
            {isListening ? 'Stop Mic' : 'Speak'}
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-[#d97706] hover:bg-[#b45309] text-white"
          >
            Send
          </Button>
          <Button
            onClick={() => {
              setInput("")
              setMessages([
                { role: 'assistant', content: `Greetings! I am ${figure}. I am pleased to share knowledge about my era and expertise. What would you like to know?` },
              ])
            }}
            disabled={loading}
            variant="secondary"
            className="bg-[#f5e6d3] hover:bg-[#e8d4bb] text-[#5f2712] border-2 border-[#d4a574] dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white shadow-sm"
            title="Clear current chat"
          >
            Clear
          </Button>
          {isSpeaking && (
            <Button onClick={stopSpeech} className="bg-red-600 hover:bg-red-700 text-white" title="Stop audio">
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Floating actions */}
      <div className="fixed bottom-8 left-8 flex gap-3 z-40">
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="w-auto px-4 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-transform flex items-center justify-center text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed bg-[#d97706] hover:bg-[#b45309] text-white"
          title="Save important points and timeline as PDF"
        >
          {exporting ? 'Preparing…' : 'Save Summary PDF'}
        </button>

        <button
          onClick={() => setIsQuizOpen(true)}
          disabled={messages.length < 3}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-transform flex items-center justify-center text-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed bg-[#d97706] hover:bg-[#b45309] text-white"
          title="Take a quiz about what you learned"
        >
          🧪
        </button>

        <button
          onClick={resetJourney}
          className="w-auto px-4 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-transform flex items-center justify-center text-base font-semibold bg-red-600 hover:bg-red-700 text-white"
          title="Reset your entire journey (clears all progress, points, and badges)"
        >
          Reset Journey
        </button>
      </div>

      {/* Quiz modal */}
      <QuizModal
        figure={figure}
        messages={messages}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={async ({ score, total, wrong, badges }) => {
          try {
            const r = await fetch('/api/reflection', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ figure, score, total, wrong, language }),
            })
            if (r.ok) {
              const data = await r.json()
              setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
            } else {
              // Fallback if API fails
              const badgeList = badges.map((b) => `${b.icon} ${b.name}`).join(', ')
              const wrongList = wrong.length
                ? `\n\nOh! It seems a few details about me got a bit tangled. Let me clarify in my own words:` +
                  '\n' + wrong.map((w, i) => `\n${i + 1}) ${w.question}\n• You said: ${w.userAnswer}\n• Actually: ${w.correctAnswer}\n• My take: ${w.explanation}`).join('\n')
                : `\nBrilliant — you understood me perfectly!`
              const summary = `You scored ${score}/${total}.` + (badgeList ? `\nBadges earned: ${badgeList}.` : '') + `\n` + `As ${figure}, here’s how I’d put it:` + wrongList
              setMessages((prev) => [...prev, { role: 'assistant', content: summary }])
            }
          } catch {
            // Silent fallback handled above
          }

          // Update progress: 10 points per correct, +10 bonus for perfect
          const bonus = score === total ? 10 : 0
          const add = score * 10 + bonus
          const progress = getProgress()
          progress.points = (progress.points ?? 0) + add
          const existing = new Map<string, StoredBadge>()
          for (const b of progress.badges) existing.set(b.id, b)
          for (const b of badges) existing.set(b.id, { id: b.id, name: b.name, description: b.description, icon: b.icon })
          progress.badges = Array.from(existing.values())
          if (!progress.figures[figure]) progress.figures[figure] = { quizzes: 0, perfect: false }
          progress.figures[figure].quizzes += 1
          if (score === total) progress.figures[figure].perfect = true
          saveProgress(progress)
        }}
      />
    </>
  )
}
