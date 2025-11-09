"use client"

import { useParams, useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { Button } from "@/components/ui/button"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const figure = decodeURIComponent(params.figure as string)

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-amber-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-2xl">
              ←
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">{figure}</h1>
              <p className="text-sm opacity-75 text-amber-700 dark:text-amber-300">Historical Figure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <ChatInterface figure={figure} />
    </main>
  )
}
