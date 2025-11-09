// Switched to Anthropic Messages API

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

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
    if (!ANTHROPIC_API_KEY) {
      return Response.json({ translation: String(text) })
    }

    const prompt = `Translate the following ${codeToName(sourceLanguage)} text to English. Provide ONLY the English translation, no explanations or additional text:\n\n${String(text)}`
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
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        temperature: 0.1,
      }),
    })
    const data = await resp.json()
    const out = Array.isArray(data?.content)
      ? data.content.map((c: any) => (c?.text ?? '')).join('')
      : String(data?.content?.[0]?.text ?? '')

    return Response.json({ translation: out.trim() })
  } catch (error) {
    console.error('[translate-to-english] Error:', error)
    return Response.json({ error: 'Failed to translate text' }, { status: 500 })
  }
}
