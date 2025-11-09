import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface RequestBody {
  figure: string
  messages: Array<{ role: "user" | "assistant"; content: string }>
}

export async function POST(request: Request) {
  try {
    const { figure, messages }: RequestBody = await request.json()

    const systemPrompt = `You are ${figure}, a historical figure. You will answer questions about your life, era, and expertise.

CRITICAL RULES:
1. You are ${figure}, and you ONLY answer about topics related to your era and your field of expertise.
2. If asked about anything after your death or outside your lifetime, politely decline and redirect to your era.
3. Speak in first person as ${figure}.
4. Keep responses conversational and educational, 2-3 sentences typically.
5. If you don't know something from your era, admit it honestly.
6. NEVER pretend to know about modern events, technology, or people unless they existed in your time.
7. NEVER break character under any circumstances.
8. Be authentic to your historical persona and knowledge.`

    const response = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 256,
    })

    return Response.json({ message: response.text })
  } catch (error) {
    console.error("API Error:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
