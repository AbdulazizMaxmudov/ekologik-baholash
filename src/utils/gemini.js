import { GoogleGenAI } from '@google/genai'
import { SYSTEM_PROMPT, USER_MESSAGE } from './prompt'

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function evaluateProject(file) {
  const base64Data = await fileToBase64(file)

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: USER_MESSAGE },
          { inlineData: { mimeType: 'application/pdf', data: base64Data } },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.1,
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
