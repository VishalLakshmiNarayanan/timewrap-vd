// Murf AI Voice IDs - Popular professional voices
const MURF_VOICES = {
  male: [
    'en-US-ken',        // Ken - Professional narrator
    'en-US-marcus',     // Marcus - Deep authoritative
    'en-US-wayne',      // Wayne - Warm storyteller
    'en-US-terrell',    // Terrell - Confident speaker
    'en-GB-clint',      // Clint - British professional
  ],
  female: [
    'en-US-natalie',    // Natalie - Professional narrator
    'en-US-aria',       // Aria - Clear articulate
    'en-US-ruby',       // Ruby - Warm friendly
    'en-US-liv',        // Liv - Confident speaker
    'en-GB-hazel',      // Hazel - British elegant
  ]
}

export async function POST(request: Request) {
  try {
    const { text, gender } = await request.json()
    if (!text) {
      return Response.json({ error: "Missing text" }, { status: 400 })
    }

    const MURF_API_KEY = process.env.MURF_API_KEY

    if (!MURF_API_KEY) {
      console.warn('No MURF_API_KEY found, falling back to browser TTS')
      return Response.json({
        error: "TTS service not configured",
        fallbackToBrowser: true
      }, { status: 503 })
    }

    // Select voice based on gender (default to male if not specified)
    const voiceGender = gender === 'female' ? 'female' : 'male'
    const voiceList = MURF_VOICES[voiceGender]
    const voiceId = voiceList[0] // Use the first voice from the list

    console.log(`[Murf TTS] Using ${voiceGender} voice: ${voiceId}`)

    const response = await fetch(
      'https://api.murf.ai/v1/speech/generate',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': MURF_API_KEY,
        },
        body: JSON.stringify({
          voiceId: voiceId,
          text: text,
          format: 'MP3',
          speed: 0,        // Normal speed
          pitch: 0,        // Normal pitch
          sampleRate: 48000,
          audioEncoding: 'MP3'
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Murf API error:', errorText)
      return Response.json({
        error: "TTS generation failed",
        fallbackToBrowser: true
      }, { status: response.status })
    }

    const data = await response.json()

    // Murf returns audio as base64 or URL depending on the plan
    if (data.audioFile) {
      // If Murf returns a URL, fetch the audio
      const audioResponse = await fetch(data.audioFile)
      const audioBuffer = await audioResponse.arrayBuffer()
      const base64Audio = Buffer.from(audioBuffer).toString('base64')

      return Response.json({
        audioData: base64Audio,
        mimeType: 'audio/mpeg'
      })
    } else if (data.audioContent) {
      // If Murf returns base64 directly
      return Response.json({
        audioData: data.audioContent,
        mimeType: 'audio/mpeg'
      })
    } else {
      throw new Error('No audio data received from Murf')
    }
  } catch (error) {
    console.error("[murf-tts] Error:", error)
    return Response.json({
      error: "TTS generation failed",
      fallbackToBrowser: true
    }, { status: 500 })
  }
}
