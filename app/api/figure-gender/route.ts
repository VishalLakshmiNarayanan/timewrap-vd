export async function POST(request: Request) {
  try {
    const { figure } = await request.json()
    if (!figure) {
      return Response.json({ error: "Missing figure" }, { status: 400 })
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
    if (!ANTHROPIC_API_KEY) {
      return Response.json({ gender: 'male' })
    }

    const prompt = `Determine the gender of the historical figure "${figure}".
Return only JSON with this exact format:
{"gender":"male"} or {"gender":"female"}

Rules:
- Only return "male" or "female"
- Base on historical records
- If uncertain, return "male" as default
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
        max_tokens: 40,
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        temperature: 0.1,
      }),
    })
    const data = await resp.json()
    const out = Array.isArray(data?.content) ? (data.content[0]?.text ?? '') : ''
    const parsed = JSON.parse(out || '{"gender":"male"}')
    return Response.json({ gender: parsed.gender || 'male' })
  } catch (error) {
    console.error("[figure-gender] Error:", error)
    return Response.json({ gender: 'male' })
  }
}
