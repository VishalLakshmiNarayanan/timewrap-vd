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
          content: `Determine the gender of the historical figure "${figure}".
Return only JSON with this exact format:
{"gender":"male"} or {"gender":"female"}

Rules:
- Only return "male" or "female"
- Base on historical records
- If uncertain, return "male" as default
No commentary.`,
        },
      ],
      temperature: 0.1,
      maxTokens: 20,
    })

    const parsed = JSON.parse(text)
    return Response.json({ gender: parsed.gender || 'male' })
  } catch (error) {
    console.error("[figure-gender] Error:", error)
    return Response.json({ gender: 'male' })
  }
}
