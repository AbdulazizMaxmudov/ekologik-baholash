import axios from 'axios'
import { GoogleGenAI } from '@google/genai'
import { SYSTEM_PROMPT, USER_MESSAGE } from './prompt'
import { extractAttachmentLinks } from './pdfLinks'

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

// `source` is either a File (user upload) or a string (direct file URL).
export async function sourceToArrayBuffer(source) {
  if (typeof source === 'string') {
    const res = await axios.get(source, { responseType: 'arraybuffer', timeout: 60000 })
    return res.data
  }
  return source.arrayBuffer()
}

export function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

export function detectMimeType(buffer) {
  const bytes = new Uint8Array(buffer.slice(0, 4))
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'application/pdf' // %PDF
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  return 'application/pdf'
}

async function fetchAttachment(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 })
  return { mimeType: detectMimeType(res.data), data: arrayBufferToBase64(res.data) }
}

export async function evaluateProject(source, onProgress = () => {}) {
  onProgress({ stage: 'reading' })
  const buffer = await sourceToArrayBuffer(source)
  const mainMimeType = detectMimeType(buffer)
  const base64Data = arrayBufferToBase64(buffer)

  onProgress({ stage: 'extracting' })
  let attachments = []
  try {
    attachments = await extractAttachmentLinks(buffer)
  } catch {
    attachments = []
  }

  const attachmentParts = []
  for (let i = 0; i < attachments.length; i++) {
    onProgress({ stage: 'downloading', total: attachments.length, done: i })
    try {
      const { mimeType, data } = await fetchAttachment(attachments[i].url)
      attachmentParts.push({ text: `Ilova hujjat: ${attachments[i].label}` })
      attachmentParts.push({ inlineData: { mimeType, data } })
    } catch {
      // Ilovani yuklab bo'lmasa, tahlilni davom ettiramiz
    }
  }
  onProgress({ stage: 'downloading', total: attachments.length, done: attachments.length })

  onProgress({ stage: 'analyzing' })
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: USER_MESSAGE },
          { text: 'Asosiy ariza hujjati:' },
          { inlineData: { mimeType: mainMimeType, data: base64Data } },
          ...attachmentParts,
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0,
    },
  })

  const text = response.text ?? ''
  let result
  try {
    result = JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) result = JSON.parse(match[0])
    else throw new Error('AI javobi JSON formatida emas')
  }

  return normalizeScore(result)
}

// Gemini ba'zan evaluation_matrix'dagi ballar yig'indisiga mos kelmaydigan
// summary.total_score qaytaradi. Haqiqiy jamini har doim matritsadan o'zimiz
// hisoblab, 0-95 oralig'ida ushlaymiz (100 ball hech qachon berilmaydi).
function normalizeScore(result) {
  const matrix = Array.isArray(result?.evaluation_matrix) ? result.evaluation_matrix : []
  const sum = matrix.reduce((s, m) => s + (Number(m.assigned_score) || 0), 0)
  const total = Math.max(0, Math.min(Math.round(sum * 10) / 10, 95))
  result.summary = { ...(result.summary || {}), total_score: total }
  return result
}
