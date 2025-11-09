"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { QuizModal } from "./quiz-modal"
import { AddMemberModal } from "./add-member-modal"

interface Message {
  role: "user" | "assistant"
  content: string
  englishTranslation?: string
  speaker?: string // Name of the historical figure speaking
}

type LangCode = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'it' | 'ar' | 'zh' | 'ja' | 'pt' | 'ru' | 'ko' | 'nl' | 'pl' | 'tr' | 'sv' | 'da' | 'fi' | 'no'

export function ChatInterface({ figure }: { figure: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Greetings! I am ${figure}. I am pleased to share knowledge about my era and expertise. What would you like to know?`,
      speaker: figure,
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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [figureGender, setFigureGender] = useState<'male' | 'female'>('male')
  const [translatingIndex, setTranslatingIndex] = useState<number | null>(null)

  // Multi-figure conversation states
  const [figures, setFigures] = useState<string[]>([figure])
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)

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

  // Add new historical figure to conversation
  const handleAddMember = (newFigure: string) => {
    setFigures((prev: string[]) => [...prev, newFigure])
    setShowAddMemberModal(false)

    // Add introduction message from new figure
    const introMessage: Message = {
      role: "assistant",
      content: `Greetings! I am ${newFigure}. I have joined this fascinating discussion. ${figure}, it is an honor to converse with you!`,
      speaker: newFigure,
    }

    setMessages((prev: Message[]) => [...prev, introMessage])

    // System message about crossover mode
    const systemMessage: Message = {
      role: "assistant",
      content: `🌟 Cross-Era Debate Mode Activated! ${figure} and ${newFigure} are now in conversation. They can debate, agree, or discuss with each other based on your prompts!`,
      speaker: "System",
    }

    setMessages((prev: Message[]) => [...prev, systemMessage])
  }

  // Get color for each figure
  const getSpeakerColor = (speaker?: string) => {
    if (!speaker || speaker === "System") return "bg-gradient-to-r from-purple-500 to-pink-600"

    const colors = [
      "bg-gradient-to-r from-amber-500 to-orange-600",
      "bg-gradient-to-r from-blue-500 to-cyan-600",
      "bg-gradient-to-r from-green-500 to-emerald-600",
      "bg-gradient-to-r from-pink-500 to-rose-600",
      "bg-gradient-to-r from-indigo-500 to-purple-600",
    ]

    const index = figures.indexOf(speaker) % colors.length
    return colors[index]
  }

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
      case 'pt': return 'pt-PT'
      case 'ru': return 'ru-RU'
      case 'ko': return 'ko-KR'
      case 'nl': return 'nl-NL'
      case 'pl': return 'pl-PL'
      case 'tr': return 'tr-TR'
      case 'sv': return 'sv-SE'
      case 'da': return 'da-DK'
      case 'fi': return 'fi-FI'
      case 'no': return 'no-NO'
      default: return 'en-US'
    }
  }

  // Add speech variations like coughs and laughs
  const addSpeechVariations = (text: string): string => {
    const base = typeof text === 'string' ? text : String(text ?? '')
    const sentences = base.split(/([.!?]+)/).filter(s => s.trim())
    const variations = [
      { chance: 0.35, sound: '*cough* ' },
      { chance: 0.33, sound: '*chuckles* ' },
      { chance: 0.32, sound: '*thoughtful pause* ' },
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

  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      // Stop any current audio
      stopSpeech()
      setIsSpeaking(true)

      // Prepare text for speech (optionally translate, then add variations)
      let speechText: string = typeof text === 'string' ? text : String(text ?? '')

      const processAndSpeak = async () => {
        try {
          if (language && language !== 'en') {
            const target = langToBCP47(language)
            const tr = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetLanguage: target, texts: [text] })
            })
            if (tr.ok) {
              const data = await tr.json()
              let translated: any = ''
              if (Array.isArray(data?.translations)) {
                const first = data.translations[0]
                translated = (typeof first === 'string') ? first : (first?.text ?? first?.translatedText ?? '')
              } else if (Array.isArray(data?.translatedTexts)) {
                translated = data.translatedTexts[0]
              }
              if (translated) speechText = String(translated)
            }
          }
        } catch {}
        const textWithVariations = addSpeechVariations(speechText)

        try {
          // If non-English, prefer browser TTS so locale/voice matches immediately
          if (language !== 'en') {
            useBrowserTTS(textWithVariations, resolve)
            return
          }
          // Try Murf AI TTS first with gender-based voice selection
          const response = await fetch('/api/elevenlabs-tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textWithVariations, gender: figureGender, language })
          })

          const data = await response.json()

          if (data.fallbackToBrowser) {
            // Fallback to browser TTS if Murf fails or is not configured
            useBrowserTTS(textWithVariations, resolve)
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
              resolve()
            }

            audio.onerror = () => {
              setIsSpeaking(false)
              URL.revokeObjectURL(audioUrl)
              // Fallback to browser TTS on error
              useBrowserTTS(text, resolve)
            }

            await audio.play()
          } else {
            useBrowserTTS(textWithVariations, resolve)
          }
        } catch (error) {
          console.error('Murf AI TTS error:', error)
          // Fallback to browser TTS
          useBrowserTTS(textWithVariations, resolve)
        }
      }

      processAndSpeak()
    })
  }

  const translateMessageToEnglish = async (index: number) => {
    try {
      setTranslatingIndex(index)
      const msg = messages[index]
      if (!msg || msg.role !== 'assistant') return
      const resp = await fetch('/api/translate-to-english', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content, sourceLanguage: language })
      })
      if (!resp.ok) throw new Error('Translate failed')
      const data = await resp.json()
      const eng = String(data.translation || '')
      if (eng) {
        setMessages(prev => prev.map((m, i) => i === index ? { ...m, englishTranslation: eng } : m))
      }
    } catch (e) {
      console.error('Translate error', e)
    } finally {
      setTranslatingIndex(null)
    }
  }



  const useBrowserTTS = (text: string, onComplete?: () => void) => {
    window.speechSynthesis.cancel()

    const target = langToBCP47(language)
    const lang2 = target.slice(0, 2).toLowerCase()

    const findBestVoice = (): SpeechSynthesisVoice | undefined => {
      if (!voices || voices.length === 0) return undefined
      const byExact = voices.find((v: any) => v.lang?.toLowerCase() === target.toLowerCase())
      if (byExact) return byExact
      const byPrefix = voices.find((v: any) => v.lang?.toLowerCase().startsWith(lang2))
      if (byPrefix) return byPrefix
      const byGoogle = voices.find((v: any) => v.name?.toLowerCase().includes('google') && v.lang?.toLowerCase().startsWith(lang2))
      if (byGoogle) return byGoogle
      return voices[0]
    }

    const speakWithRetry = (utt: SpeechSynthesisUtterance, tries = 3) => {
      if (voices.length > 0 || tries <= 0) {
        window.speechSynthesis.speak(utt)
        return
      }
      setTimeout(() => speakWithRetry(utt, tries - 1), 250)
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1

    const best = findBestVoice()
    if (best) {
      utterance.voice = best
      if (best.lang) utterance.lang = best.lang
    } else {
      utterance.lang = target
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      if (onComplete) onComplete()
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      if (onComplete) onComplete()
    }
    utteranceRef.current = utterance
    speakWithRetry(utterance)
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

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev: Message[]) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      // Multi-figure mode: get responses from all figures
      if (figures.length > 1) {
        // First figure responds to user
        const respondingFigure = figures[Math.floor(Math.random() * figures.length)]

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            figure: respondingFigure,
            messages: [...messages, { role: "user", content: userMessage }],
            language,
            multiFigureMode: true,
            allFigures: figures,
          }),
        })
        if (!response.ok) throw new Error("Failed to get response")
        const data = await response.json()

        const assistantMessage: Message = {
          role: "assistant",
          content: data.message,
          speaker: respondingFigure,
        }

        setMessages((prev: Message[]) => [...prev, assistantMessage])

        // Wait for first speaker to finish talking before next speaker responds
        await speakText(data.message)

        // Collect all responses to build context for next speakers
        const debateResponses: { speaker: string; message: string }[] = [
          { speaker: respondingFigure, message: data.message }
        ]

        // Have ALL other figures respond to create a debate
        const otherFigures = figures.filter((f: string) => f !== respondingFigure)

        for (let i = 0; i < otherFigures.length; i++) {
          const otherFigure = otherFigures[i]

          // Small delay between speakers
          await new Promise(resolve => setTimeout(resolve, 800))

          setLoading(true)

          // Build context showing what previous speakers said
          const previousStatements = debateResponses
            .map(r => `${r.speaker} said: "${r.message}"`)
            .join('\n\n')

          // Create a modified user message that includes both the question AND what others said
          const debateQuestion = `Original question: "${userMessage}"\n\nOther perspectives in this debate:\n${previousStatements}\n\nNow respond to the question, and you may also address or reference what the others said.`

          const response2 = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              figure: otherFigure,
              messages: [
                ...messages,
                { role: "user", content: debateQuestion }
              ],
              language,
              multiFigureMode: true,
              allFigures: figures,
            }),
          })

          if (response2.ok) {
            const data2 = await response2.json()

            // Handle empty or invalid response
            if (!data2.message || data2.message.trim() === '') {
              console.warn(`Empty response from ${otherFigure}`)
              continue
            }

            const assistantMessage2: Message = {
              role: "assistant",
              content: data2.message,
              speaker: otherFigure,
            }

            // Add to UI
            setMessages((prev: Message[]) => [...prev, assistantMessage2])

            // Wait for this speaker to finish before next speaker
            await speakText(data2.message)

            // Add this response to debate context
            debateResponses.push({ speaker: otherFigure, message: data2.message })
          }
        }

        setLoading(false)
      } else {
        // Single figure mode (original behavior)
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

        const assistantMessage: Message = {
          role: "assistant",
          content: data.message,
          speaker: figure,
        }

        setMessages((prev: Message[]) => [...prev, assistantMessage])
        speakText(data.message)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev: Message[]) => [
        ...prev,
        { role: "assistant", content: "I apologize, but I cannot continue this conversation at the moment.", speaker: figure },
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
      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          currentFigures={figures}
          onAdd={handleAddMember}
          onClose={() => setShowAddMemberModal(false)}
        />
      )}

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
                {/* Speaker badge for multi-figure mode */}
                {msg.role === "assistant" && msg.speaker && figures.length > 1 && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-current/20">
                    <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getSpeakerColor(msg.speaker)}`}>
                      {msg.speaker}
                    </div>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                {msg.englishTranslation && language !== 'en' && (
                  <p className="text-xs mt-2 opacity-70 italic leading-relaxed whitespace-pre-line border-t border-current/20 pt-2">
                    {msg.englishTranslation}
                  </p>
                )}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => speakText(msg.content)}
                    className="mt-2 text-xs opacity-70 hover:opacity-100 transition-opacity text-[#8e7555] hover:text-[#5f2712]"
                    title="Play audio"
                  >
                    🔊 Read aloud
                  </button>
                )}
                {msg.role === 'assistant' && language !== 'en' && !msg.englishTranslation && (
                  <button
                    onClick={() => translateMessageToEnglish(idx)}
                    className="ml-3 mt-2 text-xs opacity-70 hover:opacity-100 transition-opacity text-[#8e7555] hover:text-[#5f2712]"
                    title="Show English transcript"
                    disabled={translatingIndex === idx}
                  >
                    {translatingIndex === idx ? 'Translating…' : 'Show English transcript'}
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
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
            <option value="nl">Dutch</option>
            <option value="pl">Polish</option>
            <option value="tr">Turkish</option>
            <option value="sv">Swedish</option>
            <option value="da">Danish</option>
            <option value="fi">Finnish</option>
            <option value="no">Norwegian</option>
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
          onClick={() => setShowAddMemberModal(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-transform flex items-center justify-center text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          title="Add another historical figure to the conversation"
        >
          👥
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
