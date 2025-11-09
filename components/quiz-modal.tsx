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
    if (isOpen && messages.length > 1) setSelectedAnswers(new Array(5).fill(null))
  }, [isOpen, messages])

  const generateQuiz = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figure, messages }),
      })
      if (!res.ok) throw new Error("Failed to generate quiz")
      const data = await res.json()
      setQuestions(data.questions)
      setQuizStarted(true)
    } catch (e) {
      console.error(e)
      alert("Failed to generate quiz. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (i: number) => {
    const a = [...selectedAnswers]
    a[currentQuestion] = i
    setSelectedAnswers(a)
  }

  const finishQuiz = () => {
    let correct = 0
    questions.forEach((q, i) => { if (selectedAnswers[i] === q.correctAnswer) correct++ })
    setScore(correct)
    const earned = generateBadges(correct)
    const wrong = questions
      .map((q, i) => ({
        index: i,
        question: q.question,
        userAnswer: q.options[(selectedAnswers[i] ?? 0) as number],
        correctAnswer: q.options[q.correctAnswer],
        explanation: q.explanation,
        isCorrect: selectedAnswers[i] === q.correctAnswer,
      }))
      .filter((x) => !x.isCorrect)
      .map(({ isCorrect, ...rest }) => rest)
    setShowResults(true)
    onComplete?.({ score: correct, total: questions.length, wrong, badges: earned })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1)
    else finishQuiz()
  }

  const generateBadges = (s: number): Badge[] => {
    const b: Badge[] = [
      { id: "learner", name: "Curious Learner", description: "Completed your first quiz", icon: "🏅", earned: true },
    ]
    if (s >= 3) b.push({ id: "historian", name: "Historian", description: "Scored 3 or more correct answers", icon: "📜", earned: true })
    if (s === 5) b.push({ id: "master", name: "Time Master", description: "Perfect score on a quiz", icon: "🏆", earned: true })
    setBadges(b)
    return b
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
      <Card className="w-full max-w-2xl bg-[#fdf2e9] text-[#494234] border-[#a38d68] shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#fdf2e9]/95 p-6 border-b border-[#5f2712] flex justify-between items-center">
          <h2 className="text-2xl font-bold">Historical Genius Quiz</h2>
          <button onClick={onClose} className="text-xl font-bold hover:opacity-80 transition" aria-label="Close">Close</button>
        </div>

        <div className="p-8">
          {!quizStarted && !showResults && (
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-[#494234] mb-2">Test Your Knowledge</h3>
                <p className="text-[#494234]/80">Answer questions about {figure} based on your conversation. Each correct answer earns you points!</p>
              </div>

              <div className="bg-[#fff7ed] p-6 rounded-lg border border-[#a38d68]/50">
                <p className="text-sm font-semibold text-[#5f2712] mb-3">What you'll earn:</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-2xl">🏅</p><p className="text-xs font-medium mt-1">Curious Learner</p></div>
                  <div><p className="text-2xl">📜</p><p className="text-xs font-medium mt-1">3+ Correct</p></div>
                  <div><p className="text-2xl">🏆</p><p className="text-xs font-medium mt-1">Perfect Score</p></div>
                </div>
              </div>

              <Button onClick={generateQuiz} disabled={loading} className="w-full liquid py-6 text-lg font-semibold">
                {loading ? (<span className="flex items-center gap-2"><Spinner className="w-4 h-4" />Generating Quiz...</span>) : ("Start Quiz")}
              </Button>
            </div>
          )}

          {quizStarted && !showResults && questions.length > 0 && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">Question {currentQuestion + 1} of {questions.length}</span>
                  <span className="text-sm font-semibold text-[#a16207]">{selectedAnswers.filter(a => a !== null).length}/{questions.length} answered</span>
                </div>
                <div className="w-full bg-[#e7d5b8] rounded-full h-2">
                  <div className="bg-amber-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#494234] mb-4">{questions[currentQuestion].question}</h3>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, idx) => (
                    <button key={idx} onClick={() => handleAnswer(idx)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${selectedAnswers[currentQuestion] === idx ? "border-amber-600 bg-[#fff7ed] text-[#5f2712]" : "border-[#e4d5bb] hover:border-amber-400 text-[#494234]"}`}>
                      <span className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm ${selectedAnswers[currentQuestion] === idx ? "border-amber-600 bg-amber-600 text-white" : "border-[#d3c3a7]"}`}>
                          {selectedAnswers[currentQuestion] === idx && "✓"}
                        </span>
                        {option}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0} variant="outline" className="flex-1 border-[#a38d68] text-[#494234]">← Previous</Button>
                <Button onClick={handleNext} disabled={selectedAnswers[currentQuestion] === null} className="flex-1 liquid">{currentQuestion === questions.length - 1 ? "Finish" : "Next →"}</Button>
              </div>
            </div>
          )}

          {showResults && (
            <div className="text-center space-y-6">
              <div className="flex justify-center"><div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"><div className="text-center"><p className="text-5xl font-bold text-white">{score}</p><p className="text-white text-sm font-semibold">/5</p></div></div></div>
              <div><h3 className="text-2xl font-bold text-[#494234] mb-2">{score === 5 ? "Perfect! You're a Time Master!" : score >= 3 ? "Great job, Historian!" : "Good effort, keep learning!"}</h3><p className="text-[#494234]/80">You got {score} out of 5 questions correct</p></div>
              {badges.length > 0 && (<div><p className="text-sm font-semibold text-[#494234] mb-3">Badges Earned:</p><div className="flex flex-wrap gap-3 justify-center">{badges.map(b => (<div key={b.id} className="text-center"><div className="text-4xl mb-2">{b.icon}</div><p className="text-xs font-bold text-[#494234]">{b.name}</p><p className="text-xs text-[#494234]/80">{b.description}</p></div>))}</div></div>)}
              <div className="bg-[#fff7ed] p-6 rounded-lg text-left max-h-64 overflow-y-auto border border-[#a38d68]/50"><p className="font-semibold text-[#5f2712] mb-4">Answer Review:</p><div className="space-y-3">{questions.map((q, i) => (<div key={i} className="text-sm"><p className="font-medium text-[#494234] mb-1">{i + 1}. {q.question}</p><p className={`text-xs ${selectedAnswers[i] === q.correctAnswer ? "text-green-700" : "text-red-700"}`}>Your answer: {q.options[selectedAnswers[i] ?? 0]}</p>{selectedAnswers[i] !== q.correctAnswer && (<p className="text-xs text-[#494234]/80">Correct: {q.options[q.correctAnswer]}</p>)}<p className="text-xs text-[#494234]/80 italic mt-1">{q.explanation}</p></div>))}</div></div>
              <div className="flex gap-3"><Button onClick={resetQuiz} className="flex-1 liquid">Try Another Quiz</Button><Button onClick={onClose} variant="outline" className="flex-1 bg-transparent border-[#a38d68] text-[#494234]">Close</Button></div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

