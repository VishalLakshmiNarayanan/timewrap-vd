export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    const voiceId = (form.get('voice_id') as string) || 'en-US-terrell'

    if (!file) {
      return Response.json({ error: 'Missing file' }, { status: 400 })
    }

    const MURF_API_KEY = process.env.MURF_API_KEY
    if (!MURF_API_KEY) {
      return Response.json({ error: 'TTS service not configured', fallbackToBrowser: true }, { status: 503 })
    }

    const outgoing = new FormData()
    outgoing.append('file', file, file.name || 'upload.mp3')
    outgoing.append('voice_id', voiceId)

    const resp = await fetch('https://api.murf.ai/v1/voice-changer/convert', {
      method: 'POST',
      headers: {
        'api-key': MURF_API_KEY,
      },
      body: outgoing,
    })

    if (!resp.ok) {
      const text = await resp.text()
      console.error('[voice-convert] Murf error:', text)
      return Response.json({ error: 'Conversion failed' }, { status: resp.status })
    }

    const data = await resp.json()

    if (data.encoded_audio) {
      return Response.json({ audioData: data.encoded_audio, mimeType: 'audio/mpeg' })
    }

    if (data.audio_file) {
      try {
        const ar = await fetch(data.audio_file)
        const buf = await ar.arrayBuffer()
        const base64 = Buffer.from(buf).toString('base64')
        return Response.json({ audioData: base64, mimeType: 'audio/mpeg' })
      } catch (e) {
        console.error('[voice-convert] Failed to fetch audio_file:', e)
      }
    }

    return Response.json({ error: 'No audio returned from provider' }, { status: 502 })
  } catch (error) {
    console.error('[voice-convert] Error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}

