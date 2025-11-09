// Switched to Anthropic Messages API

export async function POST(request: Request) {
  try {
    const { figure, messages, language } = await request.json()
    if (!figure || !messages || messages.length === 0) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const conversationText = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
    if (!ANTHROPIC_API_KEY) {
      return Response.json({ error: 'Anthropic API key not configured' }, { status: 503 })
    }

    const prompt = `Extract a concise learning summary from a conversation with ${figure}.

Conversation:
${conversationText}

Return ONLY valid JSON with this exact structure (no markdown):
{
  "points": ["... up to 10 key points ..."],
  "timeline": [
    { "date": "YEAR or DATE", "event": "Short description" }
  ]
}

Rules:
- Keep points concise, factual, and based on the conversation.
- Timeline should be chronological and 3-10 entries when possible.
- If uncertain, omit rather than invent.
 - Write ONLY in ${language === 'auto' ? `the language most associated with ${figure} (their native or primary language), otherwise English` : (language || 'English')} for all points and timeline text.`

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
        temperature: 0.3,
      }),
    })
    if (!resp.ok) {
      const err = await resp.text()
      console.error('[anthropic summary] error:', err)
      return Response.json({ error: 'Failed to generate summary' }, { status: 500 })
    }
    const data = await resp.json()
    const out = Array.isArray(data?.content)
      ? data.content.map((c: any) => (c?.text ?? '')).join('')
      : String(data?.content?.[0]?.text ?? '')
    const parsed = JSON.parse(out)
    return Response.json({ points: parsed.points ?? [], timeline: parsed.timeline ?? [] })
  } catch (error) {
    console.error("[v0] Summary generation error:", error)
    return Response.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
