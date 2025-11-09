"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function Home() {
  const [figure, setFigure] = useState("")
  const [loading, setLoading] = useState(false)
  const [points, setPoints] = useState(0)
  const [badges, setBadges] = useState<{ id: string; name: string; icon: string }[]>([])
  const [figuresLearned, setFiguresLearned] = useState<{ name: string; perfect: boolean }[]>([])
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!figure.trim()) return

    setLoading(true)
    // Encode the figure name for URL
    const encodedFigure = encodeURIComponent(figure.trim())
    router.push(`/chat/${encodedFigure}`)
  }

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('historica-progress') : null
      if (!raw) return
      const data = JSON.parse(raw)
      setPoints(data.points ?? 0)
      if (Array.isArray(data.badges)) {
        setBadges(data.badges.map((b: any) => ({ id: b.id, name: b.name, icon: b.icon })))
      }
      const figs: { name: string; perfect: boolean }[] = []
      if (data.figures) {
        for (const key of Object.keys(data.figures)) {
          figs.push({ name: key, perfect: !!data.figures[key]?.perfect })
        }
      }
      setFiguresLearned(figs)
    } catch {}
  }, [])

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-amber-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-900 to-orange-700 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
            Chronos Guru
          </h1>
          <p className="text-amber-800 dark:text-amber-200 mt-2">
            Where History Talks Back
            Chat with the minds that shaped our world. Powered by Claude AI to bring historical figures to life.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-16 min-h-[calc(100vh-120px)]">
        <Card className="w-full p-8 mb-8 bg-white dark:bg-slate-800 border-amber-200 dark:border-slate-700 holo-card">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Who would you like to talk to?
              </h2>
              <p className="text-amber-800 dark:text-amber-200">
                Enter the name of any historical figure, and they'll share their knowledge with you about their era.
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                placeholder="e.g., Leonardo da Vinci, Cleopatra, Albert Einstein, Marie Curie..."
                value={figure}
                onChange={(e) => setFigure(e.target.value)}
                disabled={loading}
                className="text-lg py-6 border-amber-200 dark:border-slate-600"
              />
              <Button
                type="submit"
                disabled={loading || !figure.trim()}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-6 text-lg font-semibold"
              >
                {loading ? "Loading..." : "Start Conversation"}
              </Button>
            </form>

            <div className="pt-6 border-t border-amber-200 dark:border-slate-600">
              <p className="text-sm text-amber-700 dark:text-amber-300 font-semibold mb-3">
                Try these historical figures:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {["Socrates", "Leonardo da Vinci", "Joan of Arc", "Isaac Newton", "Ada Lovelace", "Cleopatra"].map(
                  (name) => (
                    <button
                      key={name}
                      onClick={() => {
                        setFigure(name)
                        setTimeout(() => {
                          handleSearch({ preventDefault: () => {} } as React.FormEvent)
                        }, 0)
                      }}
                      className="text-left text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline"
                    >
                      {name}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Engagement Section */}
        <Card className="w-full p-8 bg-white/90 dark:bg-slate-800/80 border-amber-200 dark:border-slate-700 holo-card">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 dark:text-amber-100 mb-2">Your Journey</h2>
              <p className="text-amber-800 dark:text-amber-200">Track your progress, badges, and the figures you've learned about.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-slate-700">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Points</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">{points}</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-slate-700">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Badges</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {badges.length === 0 ? (
                    <span className="text-sm text-amber-700 dark:text-amber-300">No badges yet</span>
                  ) : (
                    badges.map((b) => (
                      <span key={b.id} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-600 text-sm text-amber-900 dark:text-amber-100">
                        <span>{b.icon}</span> {b.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-slate-700">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Perfect Scores</p>
                <div className="mt-2 text-sm text-amber-900 dark:text-amber-100">
                  {figuresLearned.filter((f) => f.perfect).length === 0 ? (
                    <span className="text-amber-700 dark:text-amber-300">None yet</span>
                  ) : (
                    figuresLearned
                      .filter((f) => f.perfect)
                      .map((f) => (
                        <span key={f.name} className="block">⏳ {f.name}</span>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">Figures Learned</p>
              <div className="flex flex-wrap gap-2">
                {figuresLearned.length === 0 ? (
                  <span className="text-sm text-amber-700 dark:text-amber-300">Start a conversation to begin learning.</span>
                ) : (
                  figuresLearned.map((f) => (
                    <span key={f.name} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-slate-600">
                      <span className="font-medium">{f.name}</span>
                      {f.perfect && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 dark:bg-slate-600">Perfect</span>}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-amber-200 dark:border-slate-600">
              <Button
                onClick={() => {
                  if (confirm('Are you sure you want to reset your entire journey? This will clear all progress, points, and badges.')) {
                    try {
                      localStorage.removeItem('historica-progress')
                      alert('Your journey has been reset!')
                      window.location.reload()
                    } catch (error) {
                      console.error('Error resetting journey:', error)
                    }
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Reset Journey
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
