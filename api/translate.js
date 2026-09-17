async function requestTranslation(url) {
  let lastError

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch(url, { signal: controller.signal })
      if (response.ok) {
        return response
      }

      lastError = new Error(`translation provider returned HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    } finally {
      clearTimeout(timeout)
    }

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }

  throw lastError || new Error('translation provider unavailable')
}

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    return response.status(204).end()
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'method not allowed' })
  }

  const { text, targetLanguage } = request.body || {}
  if (!text || !targetLanguage) {
    return response.status(400).json({ error: 'text and targetLanguage are required' })
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLanguage)}&dt=t&ie=UTF-8&oe=UTF-8&q=${encodeURIComponent(text)}`
    const upstream = await requestTranslation(url)
    const data = await upstream.json()
    const translatedText = data?.[0]?.map((item) => item?.[0] || '').join('') || ''

    return response.status(200).json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    return response.status(502).json({ error: 'translation provider failed' })
  }
}
