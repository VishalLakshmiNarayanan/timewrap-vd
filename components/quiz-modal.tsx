"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
}

interface QuizResultSummary {
  score: number
  total: number
  wrong: Array<{
    index: number
    question: string
    userAnswer: string
    correctAnswer: string
    explanation: string
  }>
  badges: Badge[]
}

interface QuizModalProps {
  figure: string
  messages: Array<{ role: string; content: string }>
  isOpen: boolean
  onClose: () => void
  onComplete?: (summary: QuizResultSummary) => void
}

export function QuizModal({ figure, messages, isOpen, onClose, onComplete }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [loading, setLoading] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [badges, setBadges] = useState<Badge[]>([])

  useEffect(() => {
    if (isOpen && messages.length > 1) {
      // Initialize selected answers array
      setSelectedAnswers(new Array(5).fill(null))
    }
  }, [isOpen, messages])

  const generateQuiz = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figure, messages }),
      })

      if (!response.ok) throw new Error("Failed to generate quiz")

      const data = await response.json()
      setQuestions(data.questions)
      setQuizStarted(true)
    } catch (error) {
      console.error("[v0] Error generating quiz:", error)
      alert("Failed to generate quiz. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = optionIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = () => {
    let correctCount = 0
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++
      }
    })

    setScore(correctCount)
    const earnedBadges = generateBadges(correctCount)
    const wrong = questions
      .map((q, idx) => ({
        index: idx,
        question: q.question,
        userAnswer: q.options[(selectedAnswers[idx] ?? 0) as number],
        correctAnswer: q.options[q.correctAnswer],
        explanation: q.explanation,
        isCorrect: selectedAnswers[idx] === q.correctAnswer,
      }))
      .filter((x) => !x.isCorrect)
      .map(({ isCorrect, ...rest }) => rest)

    setShowResults(true)

    if (onComplete) {
      onComplete({ score: correctCount, total: questions.length, wrong, badges: earnedBadges })
    }
  }

  const generateBadges = (finalScore: number): Badge[] => {
    const newBadges: Badge[] = [
      {
        id: "learner",
        name: "Curious Learner",
        description: "Completed your first quiz",
        icon: "📚",
        earned: true,
      },
    ]

    if (finalScore >= 3) {
      newBadges.push({
        id: "historian",
        name: "Historian",
        description: "Scored 3 or more correct answers",
        icon: "🏛️",
        earned: true,
      })
    }

    if (finalScore === 5) {
      newBadges.push({
        id: "master",
        name: "Time Master",
        description: "Perfect score on a quiz",
        icon: "⭐",
        earned: true,
      })
    }

    const earned = newBadges.filter((b) => b.earned)
    setBadges(earned)
    return earned
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setShowResults(false)
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setScore(0)
    setBadges([])
    setQuestions([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-slate-800 border-[#d4a574] dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 flex justify-between items-center sticky top-0">
          <h2 className="text-2xl font-bold">Historical Genius Quiz</h2>
          <button onClick={onClose} className="text-2xl font-bold hover:opacity-80 transition" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="p-8">
          {!quizStarted && !showResults && (
            <div className="text-center space-y-6">
              <div>
                <p className="text-5xl mb-4">🎯</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Test Your Knowledge</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Answer questions about {figure} based on your conversation. Each correct answer earns you points!
                </p>
              </div>

              <div className="bg-[#fffaf5] dark:bg-slate-700 p-6 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-3">What you'll earn:</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl">📚</p>
                    <p className="text-xs font-medium mt-1">Curious Learner</p>
                  </div>
                  <div>
                    <p className="text-2xl">🏛️</p>
                    <p className="text-xs font-medium mt-1">3+ Correct</p>
                  </div>
                  <div>
                    <p className="text-2xl">⭐</p>
                    <p className="text-xs font-medium mt-1">Perfect Score</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={generateQuiz}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-6 text-lg font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Generating Quiz...
                  </span>
                ) : (
                  "Start Quiz"
                )}
              </Button>
            </div>
          )}

          {quizStarted && !showResults && questions.length > 0 && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    {selectedAnswers.filter((a) => a !== null).length}/{questions.length} answered
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {questions[currentQuestion].question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium
                        ${
                          selectedAnswers[currentQuestion] === idx
                            ? "border-[#d4a574] bg-[#fffaf5] dark:bg-slate-900 dark:border-amber-400 text-[#5f2712] dark:text-amber-100"
                            : "border-gray-200 dark:border-slate-600 hover:border-amber-300 text-gray-700 dark:text-gray-300"
                        }
                      `}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm
                          ${
                            selectedAnswers[currentQuestion] === idx
                              ? "border-amber-600 bg-amber-600 text-white"
                              : "border-gray-300 dark:border-slate-500"
                          }
                        `}
                        >
                          {selectedAnswers[currentQuestion] === idx && "✓"}
                        </span>
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="flex-1"
                >
                  ← Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestion] === null}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  {currentQuestion === questions.length - 1 ? "Finish" : "Next →"}
                </Button>
              </div>
            </div>
          )}

          {showResults && (
            <div className="text-center space-y-6">
              {/* Score Circle */}
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-white">{score}</p>
                    <p className="text-white text-sm font-semibold">/5</p>
                  </div>
                </div>
              </div>

              {/* Score Message */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {score === 5
                    ? "Perfect! You're a Time Master!"
                    : score >= 3
                      ? "Great job, Historian!"
                      : "Good effort, keep learning!"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">You got {score} out of 5 questions correct</p>
              </div>

              {/* Badges Earned */}
              {badges.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Badges Earned:</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {badges.map((badge) => (
                      <div key={badge.id} className="text-center">
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{badge.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{badge.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Review */}
              <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-lg text-left max-h-64 overflow-y-auto">
                <p className="font-semibold text-gray-900 dark:text-white mb-4">Answer Review:</p>
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">
                        {idx + 1}. {q.question}
                      </p>
                      <p
                        className={`text-xs ${
                          selectedAnswers[idx] === q.correctAnswer
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        Your answer: {q.options[selectedAnswers[idx] ?? 0]}
                      </p>
                      {selectedAnswers[idx] !== q.correctAnswer && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Correct: {q.options[q.correctAnswer]}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic mt-1">{q.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={resetQuiz}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  Try Another Quiz
                </Button>
                <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
