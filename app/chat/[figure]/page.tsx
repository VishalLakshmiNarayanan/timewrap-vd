"use client"

import { useParams, useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { Button } from "@/components/ui/button"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const figure = decodeURIComponent(params.figure as string)

  return (
    <main className="min-h-screen">
      <div className="px-4 py-10">
        <div className="ancient-wrap">
          {/* Header */}
          <div className="ancient-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-2xl">
                  ←
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{figure}</h1>
                  <p className="text-sm opacity-75">Historical Figure</p>
                </div>
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
                <img
                  src="/icon.svg"
                  alt="Chronos Guru"
                  className="w-8 h-8 md:w-10 md:h-10"
                />
                <span className="hidden md:block text-lg font-bold bg-gradient-to-r from-amber-900 to-orange-700 bg-clip-text text-transparent">
                  Chronos Guru
                </span>
              </div>
            </div>
          </div>

          {/* Chat */}
          <ChatInterface figure={figure} />
        </div>
      </div>
    </main>
  )
}
