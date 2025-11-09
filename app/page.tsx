"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function Home() {
  const [figure, setFigure] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!figure.trim()) return

    setLoading(true)
    // Encode the figure name for URL
    const encodedFigure = encodeURIComponent(figure.trim())
    router.push(`/chat/${encodedFigure}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-amber-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-900 to-orange-700 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
            Historica
          </h1>
          <p className="text-amber-800 dark:text-amber-200 mt-2">
            Step into history. Learn from any historical figure who shaped our world.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-16 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <Card className="w-full p-8 bg-white dark:bg-slate-800 border-amber-200 dark:border-slate-700">
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
      </div>
    </main>
  )
}
