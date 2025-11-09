import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface WrongItem {
  index: number
  question: string
  userAnswer: string
  correctAnswer: string
  explanation: string
}

export async function POST(request: Request) {
  try {
    const { figure, score, total, wrong, language } = await request.json()
    if (!figure || typeof score !== 'number' || typeof total !== 'number' || !Array.isArray(wrong)) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 })
    }

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
      ? `Write ONLY in the language most associated with ${figure} (their native or historically primary language). If uncertain, use English.`
      : language
        ? `Write ONLY in ${codeToName(language)}. All your writing must be in ${codeToName(language)}.`
        : `Write ONLY in English unless the context implies otherwise.`

    const wrongBlock = wrong.map((w: WrongItem, i: number) => (
      `${i + 1}) ${w.question}\n- User said: ${w.userAnswer}\n- Correct: ${w.correctAnswer}\n- Context: ${w.explanation}`
    )).join("\n\n")

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "user",
          content: `You are ${figure} speaking in first person. Create a concise, friendly quiz reflection.
Tone: warm, natural, a bit playful; begin with a short acknowledgment like "Oh! It seems a few details about me got a bit tangled—let me clarify." Use first person throughout.
Content: Mention the score (${score}/${total}). If there are mistakes, explain each one briefly in your own words.
Format: plain text only, no markdown, no emojis unless they fit naturally. Keep it under 12 lines.
${langInstruction}

WRONG ANSWERS:
${wrongBlock || 'None'}
`
        },
      ],
      maxTokens: 300,
      temperature: 0.7,
    })

    return Response.json({ message: text })
  } catch (error) {
    console.error("[v0] Reflection generation error:", error)
    return Response.json({ error: "Failed to generate reflection" }, { status: 500 })
  }
}
