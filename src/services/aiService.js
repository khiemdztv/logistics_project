import { buildKnowledgeIndex, localChatReply, localDiagnostic, isValidDiagnostic, sanitizeHistory, sanitizeAppContext, MAX_MESSAGE_LENGTH } from '../../lib/copilot.js'

// Optional user-supplied keys are sent only to our server; deployment keys stay there.
export function getActiveApiKey() {
  try {
    return (localStorage.getItem('dolphin_ai_api_key') || localStorage.getItem('dolphin_gemini_api_key') || '').trim()
  } catch { return '' }
}

export function saveCustomApiKey(key) {
  if (key?.trim()) localStorage.setItem('dolphin_ai_api_key', key.trim())
  else {
    localStorage.removeItem('dolphin_ai_api_key')
    localStorage.removeItem('dolphin_gemini_api_key')
  }
}

let cachedIndex
async function loadLocalIndex() {
  if (cachedIndex) return cachedIndex
  const responses = await Promise.allSettled(['/rag_context.txt', '/rag_reference.json'].map(async url => {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error('KNOWLEDGE_UNAVAILABLE')
    return url.endsWith('.json') ? response.json() : response.text()
  }))
  const raw = responses[0].status === 'fulfilled' ? responses[0].value : ''
  const references = responses[1].status === 'fulfilled' && Array.isArray(responses[1].value) ? responses[1].value : []
  const index = buildKnowledgeIndex(raw, references)
  if (responses.every(result => result.status === 'fulfilled')) cachedIndex = index
  return index
}

async function requestAI(payload) {
  const response = await fetch('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, customApiKey: getActiveApiKey() }),
    signal: AbortSignal.timeout(42000),
  })
  let data
  try { data = await response.json() } catch { throw new Error('Dịch vụ AI chưa sẵn sàng trên server.') }
  if (!response.ok) throw new Error(data.message || 'Không thể kết nối dịch vụ AI.')
  return data
}

export async function chatWithCopilot(userMessage, chatHistory = [], appContext = {}) {
  if (typeof userMessage !== 'string' || !userMessage.trim() || userMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Câu hỏi phải có từ 1 đến ${MAX_MESSAGE_LENGTH} ký tự.`)
  }
  const history = sanitizeHistory(chatHistory, userMessage)
  const context = sanitizeAppContext(appContext)
  try {
    const data = await requestAI({ userMessage, chatHistory: history, appContext: context })
    if (typeof data.reply !== 'string' || !data.reply.trim() || data.mode !== 'ai') throw new Error('AI trả về nội dung không hợp lệ.')
    return data
  } catch (error) {
    const data = localChatReply(userMessage, await loadLocalIndex(), history, context)
    return { ...data, warning: `${error.name === 'TimeoutError' ? 'AI phản hồi quá chậm.' : error.message} Nội dung dưới đây là tra cứu cục bộ.` }
  }
}

export async function analyzeTestFailures(failedTests, allResults, previousCargo, newCargo, vessel) {
  const diagnosticData = { failedTests, allResults, previousCargo, newCargo,
    ...(vessel ? { vessel: sanitizeAppContext({ vessel }).vessel } : {}) }
  try {
    const data = await requestAI({ isDiagnostic: true, diagnosticData })
    if (!isValidDiagnostic(data)) throw new Error('INVALID_DIAGNOSTIC')
    return data
  } catch {
    return localDiagnostic(diagnosticData)
  }
}
