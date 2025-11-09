import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { figure } = await request.json()
    if (!figure) {
      return Response.json({ error: "Missing figure" }, { status: 400 })
    }

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "user",
          content: `Return only JSON with the likely primary language for the historical figure "${figure}".
Exact format:
{"code":"xx-XX","name":"Language Name"}
Rules:
- Use a valid BCP-47 or ISO-like code commonly used in TTS, e.g., en-US, hi-IN, es-ES, fr-FR, de-DE, it-IT, ar-SA, zh-CN, ja-JP, ru-RU, pt-PT.
- If uncertain, use {"code":"en-US","name":"English"}.
No commentary.`,
        },
      ],
      temperature: 0.2,
      maxTokens: 60,
    })

    const parsed = JSON.parse(text)
    return Response.json({ code: parsed.code ?? 'en-US', name: parsed.name ?? 'English' })
  } catch (error) {
    console.error("[v0] Language detect error:", error)
    return Response.json({ code: 'en-US', name: 'English' })
  }
}
