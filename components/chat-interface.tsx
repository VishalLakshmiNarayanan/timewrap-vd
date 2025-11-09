"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { QuizModal } from "./quiz-modal"

interface Message {
  role: "user" | "assistant"
  content: string
}

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
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const speakText = (text: string) => {
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utteranceRef.current = utterance

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeech = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
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
    try {
      localStorage.setItem('historica-progress', JSON.stringify(p))
    } catch {}
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
          figure: figure,
          messages: [...messages, { role: "user", content: userMessage }],
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
        {
          role: "assistant",
          content: "I apologize, but I cannot continue this conversation at the moment.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col h-screen">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`
                  max-w-md px-4 py-3 rounded-lg group
                  ${
                    msg.role === "user"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-50"
                  }
                `}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => speakText(msg.content)}
                    className="mt-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
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
              <div className="bg-amber-100 dark:bg-slate-700 px-4 py-3 rounded-lg flex gap-2">
                <Spinner className="w-4 h-4" />
                <span className="text-sm text-amber-900 dark:text-amber-50">{figure} is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Ask ${figure} about their era...`}
            disabled={loading}
            className="border-amber-200 dark:border-slate-600"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Send
          </Button>
          {isSpeaking && (
            <Button onClick={stopSpeech} className="bg-red-600 hover:bg-red-700 text-white" title="Stop audio">
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Floating quiz button */}
      <button
        onClick={() => setIsQuizOpen(true)}
        disabled={messages.length < 3}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-transform flex items-center justify-center text-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed z-40"
        title="Take a quiz about what you learned"
      >
        🎯
      </button>

      {/* Quiz modal */}
      <QuizModal
        figure={figure}
        messages={messages}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={({ score, total, wrong, badges }) => {
          const badgeList = badges.map((b) => `${b.icon} ${b.name}`).join(', ')
          const wrongList =
            wrong.length > 0
              ? `\n\nWhere you slipped:\n` +
                wrong
                  .map(
                    (w, i) =>
                      `${i + 1}) ${w.question}\n- Your answer: ${w.userAnswer}\n- Correct: ${w.correctAnswer}\n- Why: ${w.explanation}`,
                  )
                  .join('\n\n')
              : ''

          const summary = `As ${figure}, here is my reflection on your quiz.\n\nYou scored ${score}/${total}.` +
            (badgeList ? `\nBadges earned: ${badgeList}.` : '') + wrongList

          setMessages((prev) => [...prev, { role: 'assistant', content: summary }])

          // Update progress: 10 points per correct, +10 bonus for perfect
          const bonus = score === total ? 10 : 0
          const add = score * 10 + bonus
          const progress = getProgress()

          progress.points = (progress.points ?? 0) + add
          const existing = new Map<string, StoredBadge>()
          for (const b of progress.badges) existing.set(b.id, b)
          for (const b of badges) existing.set(b.id, { id: b.id, name: b.name, description: b.description, icon: b.icon })
          progress.badges = Array.from(existing.values())

          if (!progress.figures[figure]) {
            progress.figures[figure] = { quizzes: 0, perfect: false }
          }
          progress.figures[figure].quizzes += 1
          if (score === total) progress.figures[figure].perfect = true

          saveProgress(progress)
        }}
      />
    </>
  )
}
