import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

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

      lastError = new Error(`provedor respondeu HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    } finally {
      clearTimeout(timeout)
    }

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }

  throw lastError || new Error('provedor de tradução indisponível')
}

app.post('/api/translate', async (req, res) => {
  const { text, targetLanguage } = req.body || {}

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'text e targetLanguage são obrigatórios' })
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLanguage)}&dt=t&ie=UTF-8&oe=UTF-8&q=${encodeURIComponent(text)}`
    const response = await requestTranslation(url)

    const data = await response.text()
    const parsed = JSON.parse(data)
    const translatedText = parsed?.[0]?.map((item) => item?.[0] || '').join('') || ''

    return res.json({ translatedText })
  } catch (error) {
    console.error('Erro ao traduzir:', error)
    return res.status(500).json({ error: 'falha ao processar tradução' })
  }
})

app.listen(3001, () => {
  console.log('Backend de tradução rodando em http://localhost:3001')
})
