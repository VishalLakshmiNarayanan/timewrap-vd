// Switched to Anthropic Messages API

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

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
    if (!ANTHROPIC_API_KEY) {
      return Response.json({ error: 'Anthropic API key not configured' }, { status: 503 })
    }

    const prompt = `You are creating a quiz based on a conversation with ${figure}. 

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
}`

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 700,
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        temperature: 0.3,
      }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      console.error('[anthropic quiz] error:', err)
      return Response.json({ error: 'Failed to generate quiz' }, { status: 500 })
    }
    const data = await resp.json()
    const out = Array.isArray(data?.content)
      ? data.content.map((c: any) => (c?.text ?? '')).join('')
      : String(data?.content?.[0]?.text ?? '')

    const parsed = JSON.parse(out)
    return Response.json({ questions: parsed.questions })
  } catch (error) {
    console.error("[v0] Quiz generation error:", error)
    return Response.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}
