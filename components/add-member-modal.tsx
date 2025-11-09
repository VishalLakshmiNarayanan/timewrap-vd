"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, UserPlus, Sparkles } from "lucide-react"

interface AddMemberModalProps {
  onAdd: (figureName: string) => void
  onClose: () => void
  currentFigures: string[]
}

export function AddMemberModal({ onAdd, onClose, currentFigures }: AddMemberModalProps) {
  const [newFigure, setNewFigure] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const suggestedPairs: { [key: string]: string[] } = {
    "default": ["Socrates", "Plato", "Aristotle", "Sun Tzu", "Marcus Aurelius", "Confucius"],
    "scientists": ["Albert Einstein", "Isaac Newton", "Marie Curie", "Nikola Tesla", "Stephen Hawking", "Charles Darwin"],
    "leaders": ["Julius Caesar", "Cleopatra", "Napoleon Bonaparte", "Winston Churchill", "Mahatma Gandhi", "Nelson Mandela"],
    "artists": ["Leonardo da Vinci", "Vincent van Gogh", "Pablo Picasso", "Michelangelo", "Frida Kahlo", "Mozart"],
    "writers": ["William Shakespeare", "Jane Austen", "Mark Twain", "Edgar Allan Poe", "Maya Angelou", "Oscar Wilde"],
    "innovators": ["Steve Jobs", "Elon Musk", "Thomas Edison", "Henry Ford", "Benjamin Franklin", "Ada Lovelace"]
  }

  // Get relevant suggestions based on current figures
  const getSuggestions = () => {
    const allSuggestions = Object.values(suggestedPairs).flat()
    // Filter out current figures
    return allSuggestions
      .filter(fig => !currentFigures.some(cf => cf.toLowerCase() === fig.toLowerCase()))
      .slice(0, 6)
  }

  const handleAdd = async () => {
    if (!newFigure.trim()) return

    setIsLoading(true)

    // Simulate brief loading for better UX
    await new Promise(resolve => setTimeout(resolve, 300))

    onAdd(newFigure.trim())
    setNewFigure("")
    setIsLoading(false)
  }

  const handleSuggestionClick = (figure: string) => {
    setNewFigure(figure)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="relative w-full max-w-lg mx-4 p-8 bg-gradient-to-br from-background via-background to-purple-950/20 border-2 border-purple-500/30 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-accent rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Add Historical Figure
            </h2>
            <p className="text-muted-foreground">
              Invite another historical figure to join the conversation
            </p>
          </div>

          {/* Current Members */}
          <div className="bg-accent/50 rounded-lg p-3 border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Current Members:</p>
            <div className="flex flex-wrap gap-2">
              {currentFigures.map((fig, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm rounded-full font-semibold"
                >
                  {fig}
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label htmlFor="figure-name" className="text-sm font-semibold">
              Enter Historical Figure Name
            </label>
            <div className="flex gap-2">
              <Input
                id="figure-name"
                value={newFigure}
                onChange={(e) => setNewFigure(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="e.g., Nikola Tesla, Cleopatra..."
                className="flex-1 border-2 border-purple-500/30 focus:border-purple-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleAdd}
                disabled={!newFigure.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-sm font-semibold">Suggested Figures:</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {getSuggestions().map((figure, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(figure)}
                  className="px-3 py-2 text-sm border-2 border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 rounded-lg transition-all duration-200 text-left"
                >
                  {figure}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Cross-Era Debate Mode:</strong> The figures will engage in conversation with each other.
              You can ask questions or let them debate freely!
            </p>
          </div>

          {/* Cancel Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}
