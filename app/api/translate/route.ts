export async function POST(request: Request) {
  try {
    const { targetLanguage, texts } = await request.json() as { targetLanguage?: string; texts?: string[] }
    if (!targetLanguage || !Array.isArray(texts) || texts.length === 0) {
      return Response.json({ error: 'Missing targetLanguage or texts' }, { status: 400 })
    }

    const MURF_API_KEY = process.env.MURF_API_KEY
    if (!MURF_API_KEY) {
      return Response.json({ error: 'Translation service not configured' }, { status: 503 })
    }

    const resp = await fetch('https://api.murf.ai/v1/text/translate', {
      method: 'POST',
      headers: {
        'api-key': MURF_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ targetLanguage, texts }),
    })

    if (!resp.ok) {
      const err = await resp.text()
      console.error('[translate] Murf error:', err)
      return Response.json({ error: 'Translation failed' }, { status: resp.status })
    }

    const data = await resp.json()
    return Response.json(data)
  } catch (e) {
    console.error('[translate] Error:', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
