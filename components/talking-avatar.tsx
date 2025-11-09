"use client"

import { useEffect, useState } from "react"
import { X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TalkingAvatarProps {
  imageUrl: string
  isSpeaking: boolean
  isThinking?: boolean
  onRemove?: () => void
  onReplace?: () => void
}

export function TalkingAvatar({
  imageUrl,
  isSpeaking,
  isThinking = false,
  onRemove,
  onReplace
}: TalkingAvatarProps) {
  const [showControls, setShowControls] = useState(false)

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Avatar Container */}
      <div className={`
        relative w-32 h-32 rounded-full overflow-hidden
        border-4 transition-all duration-300
        ${isSpeaking
          ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-pulse-glow'
          : isThinking
          ? 'border-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.4)]'
          : 'border-amber-500/50 shadow-lg'
        }
      `}>
        {/* Avatar Image */}
        <div className={`
          w-full h-full transition-transform duration-200
          ${isSpeaking ? 'scale-110' : isThinking ? 'scale-105' : 'scale-100'}
        `}>
          <img
            src={imageUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Talking Animation Overlay */}
        {isSpeaking && (
          <>
            {/* Mouth Animation Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-8 animate-talk">
              <div className="w-full h-full bg-gradient-to-b from-transparent via-amber-500/20 to-transparent rounded-full animate-pulse" />
            </div>

            {/* Sound Wave Effect */}
            <div className="absolute inset-0 animate-wave-1">
              <div className="absolute inset-0 rounded-full border-2 border-amber-400/30" />
            </div>
            <div className="absolute inset-0 animate-wave-2">
              <div className="absolute inset-0 rounded-full border-2 border-amber-400/20" />
            </div>
          </>
        )}

        {/* Thinking Animation */}
        {isThinking && !isSpeaking && (
          <div className="absolute top-2 right-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="absolute bottom-1 right-1">
          <div className={`
            w-4 h-4 rounded-full border-2 border-background
            ${isSpeaking
              ? 'bg-green-500 animate-pulse'
              : isThinking
              ? 'bg-yellow-500 animate-pulse'
              : 'bg-gray-400'
            }
          `} />
        </div>
      </div>

      {/* Controls (on hover) */}
      {showControls && (onRemove || onReplace) && (
        <div className="absolute -top-2 -right-2 flex gap-1 animate-in fade-in zoom-in duration-200">
          {onReplace && (
            <Button
              onClick={onReplace}
              size="sm"
              className="w-8 h-8 p-0 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg"
              title="Replace avatar"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
          {onRemove && (
            <Button
              onClick={onRemove}
              size="sm"
              className="w-8 h-8 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
              title="Remove avatar"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Speaking Indicator Text */}
      {isSpeaking && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs font-semibold text-amber-500 animate-pulse">
            Speaking...
          </span>
        </div>
      )}
    </div>
  )
}

// Add these animations to your globals.css
export const avatarAnimations = `
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(245, 158, 11, 0.8);
  }
}

@keyframes talk {
  0%, 100% {
    transform: scaleY(0.8);
  }
  50% {
    transform: scaleY(1.2);
  }
}

@keyframes wave-1 {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

@keyframes wave-2 {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-talk {
  animation: talk 0.3s ease-in-out infinite;
}

.animate-wave-1 {
  animation: wave-1 1.5s ease-out infinite;
}

.animate-wave-2 {
  animation: wave-2 1.5s ease-out infinite 0.3s;
}
`
