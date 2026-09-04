import { GoogleGenAI } from '@google/genai'
import { XULOSA_SYSTEM_PROMPT, XULOSA_USER_MESSAGE } from './xulosaPrompt'
import { sourceToArrayBuffer, arrayBufferToBase64, detectMimeType } from './gemini'

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

// Modelning ichki (eski) bilim sanasiga emas, foydalanuvchi qurilmasidagi haqiqiy
// joriy sanaga tayanish uchun — aks holda "kelajakdagi sana" kabi xatolar chiqadi.
function formatToday() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

// `source` is either a File (user upload) or a string (direct hulosa_linki URL).
export async function evaluateXulosa(source) {
  const buffer = await sourceToArrayBuffer(source)
  const mimeType = detectMimeType(buffer)
  const base64Data = arrayBufferToBase64(buffer)

  const userMessage = `${XULOSA_USER_MESSAGE}\n\nBugungi sana: ${formatToday()}. Hujjatdagi barcha sanalarni solishtirishda aynan shu bugungi sanaga tayaning — o'zingizning ichki bilim chegarangizdagi sanaga emas.`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: userMessage },
          { inlineData: { mimeType, data: base64Data } },
        ],
      },
    ],
    config: {
      systemInstruction: XULOSA_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0,
    },
  })

  const text = response.text ?? ''
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('AI javobi JSON formatida emas')
  }
}
