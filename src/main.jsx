import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'
import './styles.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const languageOptions = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'Inglês' },
  { value: 'es', label: 'Espanhol' },
  { value: 'fr', label: 'Francês' },
  { value: 'de', label: 'Alemão' },
  { value: 'it', label: 'Italiano' },
  { value: 'ja', label: 'Japonês' },
  { value: 'ko', label: 'Coreano' },
  { value: 'zh', label: 'Chinês' }
]

const MAX_TEXT_LENGTH = 2000

function splitTextIntoChunks(text) {
  const chunks = []
  for (let i = 0; i < text.length; i += MAX_TEXT_LENGTH) {
    chunks.push(text.slice(i, i + MAX_TEXT_LENGTH))
  }
  return chunks
}

const offlineTranslations = {
  pt: {
    hello: 'olá',
    hi: 'oi',
    welcome: 'bem-vindo',
    document: 'documento',
    pdf: 'PDF',
    text: 'texto',
    file: 'arquivo',
    language: 'idioma',
    translation: 'tradução',
    converted: 'convertido',
    page: 'página',
    site: 'site',
    select: 'selecione',
    choose: 'escolha',
    continue: 'continue',
    initial: 'inicial',
    message: 'mensagem',
    good: 'bom',
    day: 'dia',
    afternoon: 'tarde',
    night: 'noite',
    ola: 'olá',
    documento: 'documento',
    bem: 'bem',
    vindo: 'vindo',
    texto: 'texto',
    arquivo: 'arquivo',
    idioma: 'idioma',
    tradução: 'tradução',
    convertido: 'convertido',
    página: 'página',
    selecione: 'selecione',
    escolha: 'escolha',
    continuar: 'continue',
    inicial: 'inicial',
    mensagem: 'mensagem'
  },
  en: {
    ola: 'hello',
    documento: 'document',
    bem: 'well',
    vindo: 'welcome',
    pdf: 'pdf',
    texto: 'text',
    arquivo: 'file',
    idioma: 'language',
    tradução: 'translation',
    convertido: 'converted',
    página: 'page',
    site: 'site',
    selecione: 'select',
    escolha: 'choose',
    continuar: 'continue',
    inicial: 'initial',
    mensagem: 'message',
    bom: 'good',
    dia: 'day',
    tarde: 'afternoon',
    noite: 'night'
  },
  es: {
    ola: 'hola',
    documento: 'documento',
    bem: 'bien',
    vindo: 'bienvenido',
    pdf: 'pdf',
    texto: 'texto',
    arquivo: 'archivo',
    idioma: 'idioma',
    tradução: 'traducción',
    convertido: 'convertido',
    página: 'página',
    site: 'sitio',
    selecione: 'seleccione',
    escolha: 'elige',
    continuar: 'continuar',
    inicial: 'inicial',
    mensagem: 'mensaje',
    bom: 'buen',
    dia: 'día',
    tarde: 'tarde',
    noite: 'noche'
  },
  fr: {
    ola: 'bonjour',
    documento: 'document',
    bem: 'bien',
    vindo: 'bienvenu',
    pdf: 'pdf',
    texto: 'texte',
    arquivo: 'fichier',
    idioma: 'langue',
    tradução: 'traduction',
    convertido: 'converti',
    página: 'page',
    site: 'site',
    selecione: 'sélectionnez',
    escolha: 'choisissez',
    continuar: 'continuer',
    inicial: 'initial',
    mensagem: 'message',
    bom: 'bon',
    dia: 'jour',
    tarde: 'après-midi',
    noite: 'nuit'
  },
  de: {
    ola: 'hallo',
    documento: 'dokument',
    bem: 'gut',
    vindo: 'willkommen',
    pdf: 'pdf',
    texto: 'text',
    arquivo: 'datei',
    idioma: 'sprache',
    tradução: 'übersetzung',
    convertido: 'umgewandelt',
    página: 'seite',
    site: 'website',
    selecione: 'auswählen',
    escolha: 'wählen',
    continuar: 'weiter',
    inicial: 'anfang',
    mensagem: 'nachricht',
    bom: 'gut',
    dia: 'tag',
    tarde: 'nachmittag',
    noite: 'nacht'
  },
  it: {
    ola: 'ciao',
    documento: 'documento',
    bem: 'bene',
    vindo: 'benvenuto',
    pdf: 'pdf',
    texto: 'testo',
    arquivo: 'file',
    idioma: 'lingua',
    tradução: 'traduzione',
    convertido: 'convertito',
    página: 'pagina',
    site: 'sito',
    selecione: 'seleziona',
    escolha: 'scegli',
    continuar: 'continua',
    inicial: 'iniziale',
    mensagem: 'messaggio',
    bom: 'buono',
    dia: 'giorno',
    tarde: 'pomeriggio',
    noite: 'notte'
  },
  ja: {
    ola: 'こんにちは',
    documento: 'ドキュメント',
    bem: '良い',
    vindo: 'ようこそ',
    pdf: 'pdf',
    texto: 'テキスト',
    arquivo: 'ファイル',
    idioma: '言語',
    tradução: '翻訳',
    convertido: '変換済み',
    página: 'ページ',
    site: 'サイト',
    selecione: '選択',
    escolha: '選ぶ',
    continuar: '続ける',
    inicial: '最初',
    mensagem: 'メッセージ',
    bom: '良い',
    dia: '日',
    tarde: '午後',
    noite: '夜'
  },
  ko: {
    ola: '안녕하세요',
    documento: '문서',
    bem: '좋은',
    vindo: '환영합니다',
    pdf: 'pdf',
    texto: '텍스트',
    arquivo: '파일',
    idioma: '언어',
    tradução: '번역',
    convertido: '변환됨',
    página: '페이지',
    site: '사이트',
    selecione: '선택',
    escolha: '선택하다',
    continuar: '계속',
    inicial: '초기',
    mensagem: '메시지',
    bom: '좋은',
    dia: '날',
    tarde: '오후',
    noite: '밤'
  },
  zh: {
    ola: '你好',
    documento: '文档',
    bem: '好',
    vindo: '欢迎',
    pdf: 'pdf',
    texto: '文本',
    arquivo: '文件',
    idioma: '语言',
    tradução: '翻译',
    convertido: '已转换',
    página: '页面',
    site: '网站',
    selecione: '选择',
    escolha: '选择',
    continuar: '继续',
    inicial: '初始',
    mensagem: '消息',
    bom: '好',
    dia: '天',
    tarde: '下午',
    noite: '晚上'
  }
}

const phraseTranslations = {
  pt: {
    'hello': 'olá',
    'welcome': 'bem-vindo',
    'welcome to the pdf': 'bem-vindo ao PDF',
    'to the pdf': 'ao PDF',
    'pdf': 'PDF',
    'document': 'documento',
    'text': 'texto',
    'file': 'arquivo',
    'language': 'idioma',
    'translation': 'tradução',
    'page': 'página',
    'site': 'site',
    'select': 'selecione',
    'choose': 'escolha',
    'continue': 'continue',
    'initial': 'inicial',
    'message': 'mensagem'
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function translateTextOffline(text, targetLanguage) {
  const dictionary = offlineTranslations[targetLanguage] || offlineTranslations.en
  const phraseMap = phraseTranslations[targetLanguage] || phraseTranslations.pt

  let translated = text

  if (targetLanguage === 'pt') {
    const orderedPhrases = Object.entries(phraseMap).sort((a, b) => b[0].length - a[0].length)
    for (const [source, value] of orderedPhrases) {
      const regex = new RegExp(escapeRegExp(source), 'gi')
      translated = translated.replace(regex, (match) => {
        const sourceLower = source.toLowerCase()
        if (match.toLowerCase() === sourceLower) return value
        return value
      })
    }
  }

  translated = translated
    .split(/(\s+|[.,;!?()\n\r]+)/)
    .map((part) => {
      if (!part || /\s+|[.,;!?()\n\r]+/.test(part)) {
        return part
      }

      const normalized = part.toLowerCase().trim()
      return dictionary[normalized] || part
    })
    .join('')

  return translated
}

async function fetchTranslation(chunk, targetLanguage) {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: chunk, targetLanguage })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    const candidate = data.translatedText || ''
    const isErrorText = typeof candidate === 'string' && /invalid source language|not supported|error|failed/i.test(candidate)

    if (candidate && !isErrorText) {
      return candidate
    }
  } catch (error) {
    console.warn('API local falhou, usando fallback:', error)
  }

  return ''
}

async function translateText(text, targetLanguage) {
  if (!text?.trim()) {
    return ''
  }

  const chunks = splitTextIntoChunks(text)
  const results = []

  for (const chunk of chunks) {
    let translatedText = await fetchTranslation(chunk, targetLanguage)

    if (!translatedText) {
      translatedText = translateTextOffline(chunk, targetLanguage)
    }

    results.push(translatedText || chunk)
  }

  return results.join('\n')
}

async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const text = textContent.items
      .map((item) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (text) {
      pages.push(text)
    }
  }

  return pages.join('\n\n')
}

async function renderPdfPage(page, scale = 1.4) {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)

  await page.render({ canvasContext: context, viewport }).promise

  return { canvas, viewport }
}

async function extractPdfLayout(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []
  let hasText = false

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1 })
    const textContent = await page.getTextContent()

    if (textContent.items.length > 0) {
      hasText = true
    }

    const items = textContent.items
      .map((item) => {
        const transform = item.transform || [1, 0, 0, 1, 0, 0]
        const text = String(item.str || '').trim()

        if (!text) {
          return null
        }

        return {
          text,
          x: transform[4],
          y: viewport.height - transform[5],
          fontSize: Math.max(8, Math.round(Math.hypot(transform[0], transform[1]))),
          width: item.width || 0,
          height: item.height || 0,
          fontName: item.fontName || 'Helvetica'
        }
      })
      .filter(Boolean)

    pages.push({ items, text: items.map((item) => item.text).join(' ') })
  }

  return { mode: hasText ? 'text' : 'image', pages }
}

async function translateLayoutPages(layoutPages, targetLanguage) {
  const translatedPages = []
  let fullText = ''

  for (const page of layoutPages) {
    const translatedItems = await Promise.all(
      page.items.map(async (item) => {
        const translated = await translateText(item.text, targetLanguage)
        return {
          ...item,
          text: translated.replace(/\s+/g, ' ').trim() || item.text
        }
      })
    )

    const pageText = translatedItems.map((item) => item.text).join(' ')
    fullText += `${pageText}\n\n`
    translatedPages.push({ items: translatedItems, text: pageText })
  }

  return { pages: translatedPages, text: fullText.trim() }
}

async function translateImageLayout(file, targetLanguage, onProgress) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const translatedPages = []
  let fullText = ''

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    onProgress?.(`Lendo página ${pageNumber} de ${pdf.numPages} com OCR...`)
    const page = await pdf.getPage(pageNumber)
    const { canvas, viewport } = await renderPdfPage(page, 1.6)
    const result = await Tesseract.recognize(canvas, 'eng+por', { logger: () => {} })
    const lines = (result.data.lines || [])
      .filter((line) => line.text && line.confidence > 40)
      .map((line) => ({
        text: line.text.trim(),
        x: line.bbox.x0,
        y: viewport.height - line.bbox.y1,
        width: line.bbox.x1 - line.bbox.x0,
        height: line.bbox.y1 - line.bbox.y0,
        fontSize: Math.max(11, Math.round((line.bbox.y1 - line.bbox.y0) * 0.7))
      }))

    onProgress?.(`Traduzindo página ${pageNumber} de ${pdf.numPages}...`)
    const translatedPage = await translateText(
      lines.map((line) => line.text).join('\n'),
      targetLanguage,
    )
    const translatedTextLines = translatedPage.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    const translatedLines = lines.map((line, index) => ({
      ...line,
      text: translatedTextLines[index] || line.text
    }))

    const pageText = translatedLines.map((line) => line.text).join('\n')
    fullText += `${pageText}\n\n`
    translatedPages.push({ items: translatedLines, text: pageText })
  }

  return { pages: translatedPages, text: fullText.trim() }
}

async function buildTranslatedPdf(file, translatedLayout, mode) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const sourcePage = await pdf.getPage(pageNumber)
    const viewport = sourcePage.getViewport({ scale: 1.3 })
    const { canvas } = await renderPdfPage(sourcePage, 1.3)

    const newPage = pdfDoc.addPage([viewport.width, viewport.height])
    const pngImage = await pdfDoc.embedPng(canvas.toDataURL('image/png'))
    newPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height
    })

    const items = translatedLayout.pages[pageNumber - 1]?.items || []

    const outputScale = 1.3
    const sourceScale = itemScaleForMode(mode)

    for (const item of items) {
      const text = String(item.text || '').replace(/\s+/g, ' ').trim()
      if (!text) continue

      const x = (item.x || 20) * outputScale / sourceScale
      const y = viewport.height - ((item.y || 20) * outputScale / sourceScale)
      const width = Math.max((item.width || text.length * (item.fontSize || 12) * 0.5) * outputScale / sourceScale, 8)
      const height = Math.max((item.height || item.fontSize || 12) * outputScale / sourceScale, 10)

      newPage.drawRectangle({
        x,
        y: Math.max(0, y - height),
        width,
        height: height * 1.25,
        color: rgb(1, 1, 1)
      })

      newPage.drawText(text, {
        x,
        y: Math.max(10, y),
        size: Math.max(8, (item.fontSize || 12) * outputScale / sourceScale),
        font,
        color: rgb(0, 0, 0)
      })
    }
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

function itemScaleForMode(mode) {
  return mode === 'image' ? 1.6 : 1
}

function App() {
  const [file, setFile] = useState(null)
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [translatedLayout, setTranslatedLayout] = useState({ pages: [], text: '' })
  const [pdfMode, setPdfMode] = useState('text')
  const [status, setStatus] = useState('Selecione um PDF e escolha o idioma de destino.')
  const [isLoading, setIsLoading] = useState(false)

  const selectedLanguageLabel = useMemo(
    () => languageOptions.find((option) => option.value === targetLanguage)?.label ?? 'Inglês',
    [targetLanguage],
  )

  async function handleFileChange(event) {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      return
    }

    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setFile(null)
      setSourceText('')
      setTranslatedText('')
      setStatus('Selecione um arquivo PDF válido.')
      return
    }

    setFile(selectedFile)
    setTranslatedText('')
    setTranslatedLayout({ pages: [], text: '' })
    setStatus(`Analisando ${selectedFile.name}...`)

    try {
      const layout = await extractPdfLayout(selectedFile)
      const text = layout.pages.map((page) => page.text).join('\n\n').trim()
      setSourceText(text)
      setPdfMode(layout.mode)
      setStatus(
        layout.mode === 'text'
          ? 'PDF com texto selecionável detectado. Tradução em modo de layout preservado.'
          : 'PDF com imagem/OCR detectado. Tradução em modo de imagem com preservação do layout.'
      )
    } catch (error) {
      setFile(selectedFile)
      setSourceText('')
      setStatus('Arquivo PDF detectado. O conteúdo será extraído durante a tradução.')
      console.error(error)
    }
  }

  async function handleTranslate() {
    if (!file) {
      setStatus('Selecione um arquivo PDF válido para tradução.')
      return
    }

    setIsLoading(true)
    setStatus(`Traduzindo para ${selectedLanguageLabel}...`)

    try {
      const originalLayout = await extractPdfLayout(file)
      const textFromLayout = originalLayout.pages.map((page) => page.text).join('\n\n').trim()

      if (textFromLayout) {
        setSourceText(textFromLayout)
      }

      setPdfMode(originalLayout.mode)

      const translatedResult =
        originalLayout.mode === 'text'
          ? await translateLayoutPages(originalLayout.pages, targetLanguage)
          : await translateImageLayout(file, targetLanguage, setStatus)

      setTranslatedText(translatedResult.text)
      setTranslatedLayout(translatedResult)
      setStatus(`Tradução concluída para ${selectedLanguageLabel}.`)
    } catch (error) {
      setStatus(error.message || 'Ocorreu um erro ao processar a tradução.')
    } finally {
      setIsLoading(false)
    }
  }

  function downloadText() {
    if (!translatedText.trim()) {
      return
    }

    const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'pdf-traduzido.txt'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  async function downloadPdf() {
    if (!file || !translatedLayout.pages.length) {
      return
    }

    const pdfBlob = await buildTranslatedPdf(file, translatedLayout, pdfMode)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(pdfBlob)
    link.download = 'pdf-traduzido-layout.pdf'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">PDF</div>
          <div>
            <p className="eyebrow">Conversor inteligente</p>
            <h1>Translator PDF</h1>
          </div>
        </div>
      </header>

      <main className="app-card">
        <section className="panel form-panel">
          <div className="input-group">
            <label htmlFor="pdf-upload">Arquivo PDF</label>
            <input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} />
          </div>

          <div className="input-group">
            <label htmlFor="language">Idioma de destino</label>
            <select id="language" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button className="primary-button" onClick={handleTranslate} disabled={isLoading || !file}>
            {isLoading ? 'Traduzindo...' : 'Traduzir PDF'}
          </button>

          <div className="status-box" aria-live="polite">
            {status}
          </div>

          <div className="download-row">
            <button className="secondary-button" onClick={downloadText} disabled={!translatedText}>Baixar texto</button>
            <button className="secondary-button" onClick={downloadPdf} disabled={!translatedLayout.pages.length}>Baixar PDF</button>
          </div>
        </section>

        <section className="panel preview-panel">
          <div className="preview-box">
            <h2>Texto original</h2>
            <pre>{sourceText || 'Nenhum texto carregado ainda.'}</pre>
          </div>

          <div className="preview-box">
            <h2>Texto traduzido</h2>
            <pre>{translatedText || 'A tradução aparecerá aqui.'}</pre>
          </div>
        </section>
      </main>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
