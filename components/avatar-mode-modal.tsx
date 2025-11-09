"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, User, Sparkles } from "lucide-react"

interface AvatarModeModalProps {
  onSelect: (useAvatar: boolean) => void
  figureName: string
}

export function AvatarModeModal({ onSelect, figureName }: AvatarModeModalProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleSelection = (useAvatar: boolean) => {
    setIsVisible(false)
    setTimeout(() => onSelect(useAvatar), 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="relative w-full max-w-md mx-4 p-8 bg-gradient-to-br from-background via-background to-amber-950/20 border-2 border-amber-500/30 shadow-2xl">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
              Avatar Mode
            </h2>
            <p className="text-muted-foreground">
              Would you like to chat with {figureName} using an animated avatar?
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Button
              onClick={() => handleSelection(true)}
              className="w-full h-auto py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col items-center gap-2">
                <User className="w-6 h-6" />
                <div>
                  <div className="text-lg">Yes, Enable Avatar</div>
                  <div className="text-xs opacity-90">Upload image & see animated avatar</div>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleSelection(false)}
              variant="outline"
              className="w-full h-auto py-4 border-2 hover:bg-accent transition-all duration-300"
            >
              <div className="flex flex-col items-center gap-2">
                <X className="w-6 h-6" />
                <div>
                  <div className="text-lg">No, Text Only</div>
                  <div className="text-xs opacity-70">Continue with standard chat</div>
                </div>
              </div>
            </Button>
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground">
            You can change this setting later in the chat
          </p>
        </div>
      </Card>
    </div>
  )
}
