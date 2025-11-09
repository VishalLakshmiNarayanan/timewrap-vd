import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { figure, messages, language } = await request.json()
    if (!figure || !messages || messages.length === 0) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const conversationText = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "user",
          content: `Extract a concise learning summary from a conversation with ${figure}.

Conversation:
${conversationText}

Return ONLY valid JSON with this exact structure (no markdown):
{
  "points": ["... up to 10 key points ..."],
  "timeline": [
    { "date": "YEAR or DATE", "event": "Short description" }
  ]
}

Rules:
- Keep points concise, factual, and based on the conversation.
- Timeline should be chronological and 3-10 entries when possible.
- If uncertain, omit rather than invent.
- Write ONLY in ${language === 'auto' ? `the language most associated with ${figure} (their native or primary language), otherwise English` : (language || 'English')} for all points and timeline text.
`,
        },
      ],
      maxTokens: 400,
      temperature: 0.3,
    })

    const parsed = JSON.parse(text)
    return Response.json({ points: parsed.points ?? [], timeline: parsed.timeline ?? [] })
  } catch (error) {
    console.error("[v0] Summary generation error:", error)
    return Response.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
