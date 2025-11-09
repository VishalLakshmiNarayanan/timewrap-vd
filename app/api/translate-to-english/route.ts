import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { text, sourceLanguage } = await request.json()
    if (!text || !sourceLanguage) {
      return Response.json({ error: 'Missing required fields: text, sourceLanguage' }, { status: 400 })
    }
    if (sourceLanguage === 'en') {
      return Response.json({ translation: String(text) })
    }

    const codeToName = (code?: string) => {
      switch (code) {
        case 'es': return 'Spanish'
        case 'fr': return 'French'
        case 'de': return 'German'
        case 'it': return 'Italian'
        case 'pt': return 'Portuguese'
        case 'ru': return 'Russian'
        case 'zh': return 'Chinese'
        case 'ja': return 'Japanese'
        case 'hi': return 'Hindi'
        case 'ar': return 'Arabic'
        default: return code || 'the source language'
      }
    }

    const { text: out } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: 'user',
          content: `Translate the following ${codeToName(sourceLanguage)} text to English. Provide ONLY the English translation, no explanations or additional text:\n\n${String(text)}`,
        },
      ],
      maxTokens: 256,
      temperature: 0.1,
    })

    return Response.json({ translation: out.trim() })
  } catch (error) {
    console.error('[translate-to-english] Error:', error)
    return Response.json({ error: 'Failed to translate text' }, { status: 500 })
  }
}
