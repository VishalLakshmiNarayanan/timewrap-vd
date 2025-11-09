import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface RequestBody {
  figure: string
  messages: Array<{ role: "user" | "assistant"; content: string; speaker?: string }>
  language?: string // e.g., 'en', 'hi', 'auto'
  multiFigureMode?: boolean
  allFigures?: string[]
  respondingTo?: string
  debateContext?: string
}

export async function POST(request: Request) {
  try {
    const { figure, messages, language, multiFigureMode, allFigures, respondingTo, debateContext }: RequestBody = await request.json()

    const codeToName = (code?: string) => {
      switch (code) {
        case 'en': return 'English'
        case 'es': return 'Spanish'
        case 'fr': return 'French'
        case 'de': return 'German'
        case 'it': return 'Italian'
        case 'pt': return 'Portuguese'
        case 'ru': return 'Russian'
        case 'zh': return 'Chinese'
        case 'ja': return 'Japanese'
        case 'ko': return 'Korean'
        case 'ar': return 'Arabic'
        case 'hi': return 'Hindi'
        case 'nl': return 'Dutch'
        case 'pl': return 'Polish'
        case 'tr': return 'Turkish'
        case 'sv': return 'Swedish'
        case 'da': return 'Danish'
        case 'fi': return 'Finnish'
        case 'no': return 'Norwegian'
        default: return 'English'
      }
    }

    const langInstruction = language === 'auto'
      ? `Respond ONLY in the language most associated with ${figure} (their native or historically primary language). If uncertain, use English.`
      : language
        ? `Respond ONLY in ${codeToName(language)}. All your responses must be in ${codeToName(language)}.`
        : `Respond ONLY in English. All your responses must be in English.`

    // Build debate-specific instructions if in multi-figure mode
    const debateInstructions = multiFigureMode && allFigures && allFigures.length > 1
      ? `\n\nCROSS-ERA DEBATE MODE:
You are in a conversation with other historical figures: ${allFigures.filter(f => f !== figure).join(", ")}.
${respondingTo ? `You are specifically responding to ${respondingTo}'s last statement.` : ''}
${debateContext || ''}

IMPORTANT:
- Directly address what ${respondingTo || 'the previous speaker'} said
- Either agree, disagree, add nuance, or provide a contrasting perspective
- Make it conversational - speak TO the other figure(s), not just answer the question
- Reference specific points they made
- Keep your response 2-3 sentences
- Stay in character as ${figure} from your era`
      : ''

    const systemPrompt = `You are ${figure}, a historical figure. You will answer questions about your life, era, and expertise.

CRITICAL RULES:
1. You are ${figure}, and you ONLY answer about topics related to your era and your field of expertise.
2. If asked about anything after your death or outside your lifetime, politely decline and redirect to your era.
3. Speak in first person as ${figure}.
4. Keep responses conversational and educational, 2-3 sentences typically.
5. If you don't know something from your era, admit it honestly.
6. NEVER pretend to know about modern events, technology, or people unless they existed in your time.
7. NEVER break character under any circumstances.
8. Be authentic to your historical persona and knowledge.${debateInstructions}

LANGUAGE:
${langInstruction}`

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
