import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'node:fs'
import path from 'node:path'
import { buildKnowledgeIndex, buildChatRequest, buildDiagnosticRequest, GROQ_MODEL, MAX_MESSAGE_LENGTH, isValidDiagnostic } from '../lib/copilot.js'
import { WALL_WASH_THRESHOLDS } from '../src/data/cargoData.js'

let cachedIndex
export function getKnowledgeIndex() {
  if (cachedIndex) return cachedIndex
  const raw = fs.readFileSync(path.join(process.cwd(), 'public', 'rag_context.txt'), 'utf8')
  const references = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'rag_reference.json'), 'utf8'))
  cachedIndex = buildKnowledgeIndex(raw, references)
  return cachedIndex
}

function validateBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Nội dung yêu cầu không hợp lệ.'
  if (body.isDiagnostic !== undefined && typeof body.isDiagnostic !== 'boolean') return 'Loại yêu cầu không hợp lệ.'
  if (body.customApiKey !== undefined && (typeof body.customApiKey !== 'string' || body.customApiKey.length > 256)) return 'API key không hợp lệ.'
  if (body.chatHistory !== undefined && !Array.isArray(body.chatHistory)) return 'Lịch sử hội thoại không hợp lệ.'
  if (body.isDiagnostic === true) {
    const data = body.diagnosticData
    if (!data || !Array.isArray(data.failedTests) || !data.failedTests.length || data.failedTests.length > 5
      || data.failedTests.some(id => !Object.hasOwn(WALL_WASH_THRESHOLDS, id))
      || !data.allResults || typeof data.allResults !== 'object' || Array.isArray(data.allResults)
      || ['previousCargo', 'newCargo'].some(field => typeof data[field] !== 'string' || data[field].length > 120)
      || data.failedTests.some(id => data.allResults[id] === '' || !['string', 'number'].includes(typeof data.allResults[id]) || !Number.isFinite(Number(data.allResults[id])))) {
      return 'Dữ liệu chẩn đoán không hợp lệ.'
    }
  } else if (typeof body.userMessage !== 'string' || !body.userMessage.trim() || body.userMessage.length > MAX_MESSAGE_LENGTH) {
    return `Câu hỏi phải có từ 1 đến ${MAX_MESSAGE_LENGTH} ký tự.`
  }
  return null
}

function providerResult(content, diagnostic, model, sources) {
  if (typeof content !== 'string' || !content.trim()) throw new Error('EMPTY_RESPONSE')
  if (!diagnostic) return { reply: content.trim(), model, mode: 'ai', sources }
  const parsed = JSON.parse(content)
  if (!isValidDiagnostic(parsed)) throw new Error('INVALID_DIAGNOSTIC')
  return { title: parsed.title, causes: parsed.causes, solutions: parsed.solutions, model, mode: 'ai', sources }
}

// Injectable dependencies let regression tests exercise API failures without API credits.
export function createChatHandler({
  env = process.env,
  loadIndex = getKnowledgeIndex,
  createGroq = apiKey => new Groq({ apiKey, timeout: 18000, maxRetries: 0 }),
  createGemini = apiKey => new GoogleGenerativeAI(apiKey),
} = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    if (req.method === 'OPTIONS') return res.status(204).end()
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS')
      return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ POST.' })
    }
    const validationError = validateBody(req.body)
    if (validationError) return res.status(400).json({ error: 'INVALID_REQUEST', message: validationError })
    const body = req.body
    const key = (body.customApiKey || '').trim()
    // Legacy VITE_* deployments still work, but browser code never accesses deployment keys.
    const groqKey = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || (key.startsWith('gsk_') ? key : '')
    const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || (key.startsWith('AIza') ? key : '')
    if (!groqKey && !geminiKey) return res.status(503).json({ error: 'NO_API_KEY', message: 'Chưa cấu hình AI. Cần đặt GROQ_API_KEY trên server/Vercel.' })

    let request
    try {
      const index = loadIndex()
      request = body.isDiagnostic === true
        ? buildDiagnosticRequest(body.diagnosticData, index)
        : buildChatRequest(body.userMessage, body.chatHistory, index, body.appContext)
    } catch {
      console.error('Copilot knowledge files could not be loaded.')
      return res.status(503).json({ error: 'KNOWLEDGE_UNAVAILABLE', message: 'Chưa tải được kho tài liệu của project.' })
    }

    const errors = []
    if (groqKey) {
      try {
        const model = env.GROQ_MODEL || GROQ_MODEL
        const completion = await createGroq(groqKey).chat.completions.create({
          model, messages: request.messages, temperature: body.isDiagnostic ? 0.15 : 0.35,
          max_completion_tokens: body.isDiagnostic ? 1000 : 1200,
          ...(body.isDiagnostic ? { response_format: { type: 'json_object' } } : {}),
        })
        if (completion.choices?.[0]?.finish_reason === 'length') throw new Error('TRUNCATED_RESPONSE')
        return res.status(200).json(providerResult(completion.choices?.[0]?.message?.content, body.isDiagnostic, `Groq · ${model}`, request.sources))
      } catch (error) {
        errors.push({ provider: 'Groq', status: error.status })
        console.warn('Groq request failed:', error.status || error.name)
      }
    }
    if (geminiKey) {
      try {
        const modelName = env.GEMINI_MODEL || 'gemini-2.5-flash'
        const model = createGemini(geminiKey).getGenerativeModel({
          model: modelName, systemInstruction: request.messages[0].content,
          generationConfig: { maxOutputTokens: 2400, temperature: 0.35, thinkingConfig: { thinkingBudget: 0 }, ...(body.isDiagnostic ? { responseMimeType: 'application/json' } : {}) },
        }, { timeout: 18000 })
        const contents = request.messages.slice(1).map(message => ({
          role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.content }],
        }))
        const result = await model.generateContent({ contents })
        if (result.response.candidates?.[0]?.finishReason === 'MAX_TOKENS') throw new Error('TRUNCATED_RESPONSE')
        return res.status(200).json(providerResult(result.response.text(), body.isDiagnostic, `Gemini · ${modelName}`, request.sources))
      } catch (error) {
        errors.push({ provider: 'Gemini', status: error.status })
        console.warn('Gemini request failed:', error.status || error.name)
      }
    }
    const providers = errors.map(({ provider, status }) => ({ provider, status: Number.isInteger(status) ? status : null }))
    if (errors.some(error => error.status === 429)) return res.status(429).json({ error: 'RATE_LIMITED', message: 'AI đang hết hạn mức hoặc có quá nhiều yêu cầu. Hãy thử lại sau.', providers })
    if (errors.every(error => [401, 403].includes(error.status))) return res.status(503).json({ error: 'AI_AUTH_FAILED', message: 'Nhà cung cấp từ chối API key hoặc quyền dùng model. Kiểm tra khóa trong Vercel rồi redeploy.', providers })
    if (errors.some(error => error.status === 413)) return res.status(502).json({ error: 'AI_CONTEXT_TOO_LARGE', message: 'Yêu cầu vượt giới hạn ngữ cảnh của nhà cung cấp. Hãy rút ngắn câu hỏi hoặc bắt đầu hội thoại mới.', providers })
    return res.status(502).json({ error: 'AI_UNAVAILABLE', message: 'Không nhận được câu trả lời từ nhà cung cấp AI. Hãy kiểm tra API key và trạng thái dịch vụ.', providers })
  }
}

export default createChatHandler()
