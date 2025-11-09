export async function POST(request: Request) {
  try {
    const { figure } = await request.json()
    if (!figure) {
      return Response.json({ error: "Missing figure" }, { status: 400 })
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
    if (!ANTHROPIC_API_KEY) {
      return Response.json({ code: 'en-US', name: 'English' })
    }

    const prompt = `Return only JSON with the likely primary language for the historical figure "${figure}".
Exact format:
{"code":"xx-XX","name":"Language Name"}
Rules:
- Use a valid BCP-47 or ISO-like code commonly used in TTS, e.g., en-US, hi-IN, es-ES, fr-FR, de-DE, it-IT, ar-SA, zh-CN, ja-JP, ru-RU, pt-PT.
- If uncertain, use {"code":"en-US","name":"English"}.
No commentary.`

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 60,
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        temperature: 0.2,
      }),
    })
    const data = await resp.json()
    const out = Array.isArray(data?.content) ? (data.content[0]?.text ?? '') : ''
    const parsed = JSON.parse(out || '{"code":"en-US","name":"English"}')
    return Response.json({ code: parsed.code ?? 'en-US', name: parsed.name ?? 'English' })
  } catch (error) {
    console.error("[v0] Language detect error:", error)
    return Response.json({ code: 'en-US', name: 'English' })
  }
}
