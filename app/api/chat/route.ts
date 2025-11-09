// Switched to Anthropic Messages API

interface RequestBody {
  figure: string
  messages: Array<{ role: "user" | "assistant"; content: string }>
  language?: string // e.g., 'en', 'hi', 'auto'
}

export async function POST(request: Request) {
  try {
    const { figure, messages, language }: RequestBody = await request.json()

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

    const systemPrompt = `You are ${figure}, a historical figure. You will answer questions about your life, era, and expertise.

CRITICAL RULES:
1. You are ${figure}, and you ONLY answer about topics related to your era and your field of expertise.
2. If asked about anything after your death or outside your lifetime, politely decline and redirect to your era.
3. Speak in first person as ${figure}.
4. Keep responses conversational and educational, 2-3 sentences typically.
5. If you don't know something from your era, admit it honestly.
6. NEVER pretend to know about modern events, technology, or people unless they existed in your time.
7. NEVER break character under any circumstances.
8. Be authentic to your historical persona and knowledge.

LANGUAGE:
${langInstruction}`

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
    if (!ANTHROPIC_API_KEY) {
      return Response.json({ error: 'Anthropic API key not configured' }, { status: 503 })
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 256,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: [{ type: 'text', text: m.content }],
        })),
        temperature: 0.7,
      }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      console.error('[anthropic chat] error:', err)
      return Response.json({ error: 'Failed to generate response' }, { status: 500 })
    }
    const data = await resp.json()
    const out = Array.isArray(data?.content)
      ? data.content.map((c: any) => (c?.text ?? '')).join('').trim()
      : String(data?.content?.[0]?.text ?? '').trim()

    return Response.json({ message: out })
  } catch (error) {
    console.error("API Error:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
