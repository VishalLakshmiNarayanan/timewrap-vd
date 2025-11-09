import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export async function POST(request: Request) {
  try {
    const { figure, messages } = await request.json()

    if (!figure || !messages || messages.length === 0) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Extract key facts from conversation
    const conversationText = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "user",
          content: `You are creating a quiz based on a conversation with ${figure}. 
          
Conversation:
${conversationText}

Create exactly 5 multiple-choice quiz questions based on the facts discussed in this conversation about ${figure}. 
Each question should have 4 options, with one correct answer.

Return ONLY valid JSON in this exact format, no markdown or extra text:
{
  "questions": [
    {
      "question": "What is...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "The correct answer is..."
    }
  ]
}`,
        },
      ],
    })

    const parsed = JSON.parse(text)
    return Response.json({ questions: parsed.questions })
  } catch (error) {
    console.error("[v0] Quiz generation error:", error)
    return Response.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}
