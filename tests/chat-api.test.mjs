import test from 'node:test'
import assert from 'node:assert/strict'
import { createChatHandler, getKnowledgeIndex } from '../api/chat.js'

function response() {
  return { statusCode: 200, headers: {}, setHeader(name, value) { this.headers[name] = value }, status(code) { this.statusCode = code; return this }, json(value) { this.body = value; return this }, end() { return this } }
}
const index = getKnowledgeIndex()
const call = async (handler, body, method = 'POST') => {
  const res = response()
  await handler({ method, body }, res)
  return res
}
function groqStub(callback) {
  return () => ({ chat: { completions: { create: callback } } })
}
const complete = content => ({ choices: [{ finish_reason: 'stop', message: { content } }] })
const validDiagnostic = { title: 'Kiểm tra PTT', causes: ['Có thể nhiễm tạp chất.'], solutions: ['Kiểm tra mẫu trắng và lấy mẫu lại.'] }

test('Groq receives a single question with selected sources, actual session and returns model metadata', async () => {
  let sent
  const handler = createChatHandler({ env: { GROQ_API_KEY: 'test-only' }, loadIndex: () => index, createGroq: groqStub(async payload => {
    sent = payload
    return complete('Methanol có các phép thử Wall Wash.')
  }) })
  const query = 'Methanol cần bao nhiêu test?'
  const res = await call(handler, { userMessage: query, chatHistory: [{ role: 'user', content: query }], appContext: { newCargo: 'methanol', wallWashResults: { ptt: '6.5' } } })
  assert.equal(res.statusCode, 200)
  assert.equal(res.body.mode, 'ai')
  assert.match(res.body.model, /Groq/)
  assert.ok(res.body.sources.length)
  assert.equal(sent.messages.filter(message => message.role === 'user' && message.content === query).length, 1)
  assert.match(sent.messages[0].content, /4 phép kiểm tra/)
  assert.match(sent.messages[0].content, /"ptt":"6.5"/)
  assert.equal(sent.model, 'openai/gpt-oss-120b')
  assert.equal(sent.max_completion_tokens, 3072)
  assert.equal(sent.include_reasoning, false)
})

test('invalid requests and malformed diagnostics return 400 before calling a provider', async () => {
  const handler = createChatHandler({ env: { GROQ_API_KEY: 'test-only' }, createGroq: () => { throw new Error('Should not call provider') } })
  for (const body of [undefined, {}, { userMessage: 10 }, { userMessage: ' ' }, { userMessage: 'x'.repeat(4001) },
    { userMessage: 'hello', chatHistory: {} }, { userMessage: 'hello', customApiKey: {} }, { userMessage: 'hello', isDiagnostic: 'false' },
    { isDiagnostic: true }, { isDiagnostic: true, diagnosticData: { failedTests: ['__proto__'], allResults: {}, previousCargo: '', newCargo: '' } },
    { isDiagnostic: true, diagnosticData: { failedTests: ['ptt'], allResults: { ptt: 'NaN' }, previousCargo: '', newCargo: '' } }]) {
    assert.equal((await call(handler, body)).statusCode, 400)
  }
})

test('missing key, method and missing knowledge have distinct errors', async () => {
  const handler = createChatHandler({ env: {} })
  assert.equal((await call(handler, { userMessage: 'hello' })).body.error, 'NO_API_KEY')
  assert.equal((await call(handler, undefined, 'GET')).statusCode, 405)
  assert.equal((await call(handler, undefined, 'OPTIONS')).statusCode, 204)
  const missingKnowledge = createChatHandler({ env: { GROQ_API_KEY: 'test-only' }, loadIndex: () => { throw new Error('missing file') } })
  assert.equal((await call(missingKnowledge, { userMessage: 'hello' })).body.error, 'KNOWLEDGE_UNAVAILABLE')
})

test('provider failure is not misreported as missing API key', async () => {
  const handler = createChatHandler({ env: { GROQ_API_KEY: 'test-only' }, loadIndex: () => index, createGroq: groqStub(async () => { throw Object.assign(new Error('SECRET SHOULD NOT BE RETURNED'), { status: 401 }) }) })
  const res = await call(handler, { userMessage: 'hello' })
  assert.equal(res.statusCode, 503)
  assert.equal(res.body.error, 'AI_AUTH_FAILED')
  assert.deepEqual(res.body.providers, [{ provider: 'Groq', status: 401 }])
  assert.doesNotMatch(JSON.stringify(res.body), /SECRET/)
})

test('Groq quota exhaustion returns 429', async () => {
  const handler = createChatHandler({ env: { GROQ_API_KEY: 'test-only' }, loadIndex: () => index, createGroq: groqStub(async () => { throw Object.assign(new Error('quota'), { status: 429 }) }) })
  assert.equal((await call(handler, { userMessage: 'hello' })).statusCode, 429)
})

test('empty or truncated Groq responses are rejected', async () => {
  for (const completion of [complete(''), { choices: [{ finish_reason: 'length', message: { content: 'partial' } }] }]) {
    const handler = createChatHandler({ env: { GROQ_API_KEY: 'test-only' }, loadIndex: () => index, createGroq: groqStub(async () => completion) })
    assert.equal((await call(handler, { userMessage: 'hello' })).statusCode, 502)
  }
})

test('diagnostic Groq calls include RAG and validate JSON schema', async () => {
  let sent
  const diagnosticBody = { isDiagnostic: true, diagnosticData: { failedTests: ['ptt'], allResults: { ptt: '6.5' }, previousCargo: 'palm_oil_crude', newCargo: 'methanol' } }
  const handler = createChatHandler({ env: { GROQ_API_KEY: 'test-only' }, loadIndex: () => index, createGroq: groqStub(async payload => { sent = payload; return complete(JSON.stringify(validDiagnostic)) }) })
  const res = await call(handler, diagnosticBody)
  assert.equal(res.statusCode, 200)
  assert.equal(res.body.title, validDiagnostic.title)
  assert.deepEqual(sent.response_format, { type: 'json_object' })
  assert.match(sent.messages[0].content, /TRÍCH ĐOẠN THAM KHẢO/)
  const invalid = createChatHandler({ env: { GROQ_API_KEY: 'test-only' }, loadIndex: () => index, createGroq: groqStub(async () => complete('{"causes":"bad"}')) })
  assert.equal((await call(invalid, diagnosticBody)).statusCode, 502)
})

test('Gemini fallback handles both chat and diagnostics with the same selected evidence', async () => {
  let options, request
  const createGemini = () => ({ getGenerativeModel(config) {
    options = config
    return { async generateContent(payload) {
      request = payload
      return { response: { text: () => options.generationConfig.responseMimeType ? JSON.stringify(validDiagnostic) : 'Câu trả lời Gemini.' } }
    } }
  } })
  const handler = createChatHandler({ env: { GROQ_API_KEY: 'test-only', GEMINI_API_KEY: 'test-only' }, loadIndex: () => index,
    createGroq: groqStub(async () => { throw new Error('Unavailable') }), createGemini })
  const chat = await call(handler, { userMessage: 'Methanol cần bao nhiêu test?' })
  assert.equal(chat.statusCode, 200)
  assert.match(chat.body.model, /Gemini/)
  assert.match(options.systemInstruction, /4 phép kiểm tra/)
  assert.equal(request.contents.at(-1).role, 'user')
  const diagnostic = await call(handler, { isDiagnostic: true, diagnosticData: { failedTests: ['chloride'], allResults: { chloride: '4.5' }, previousCargo: '', newCargo: 'methanol' } })
  assert.equal(diagnostic.statusCode, 200)
  assert.equal(options.generationConfig.responseMimeType, 'application/json')
  assert.equal(diagnostic.body.title, validDiagnostic.title)
})

test('deprecated custom Groq model returning 404 automatically migrates to the supported default', async () => {
  const models = []
  const handler = createChatHandler({ env: { GROQ_API_KEY: 'test-only', GROQ_MODEL: 'llama-3.3-70b-versatile' }, loadIndex: () => index,
    createGroq: groqStub(async payload => {
      models.push(payload.model)
      if (payload.model === 'llama-3.3-70b-versatile') throw Object.assign(new Error('Retired'), { status: 404 })
      return complete('Câu trả lời từ model đang hỗ trợ.')
    }) })
  const res = await call(handler, { userMessage: 'Methanol cần bao nhiêu test?' })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(models, ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b'])
  assert.match(res.body.model, /gpt-oss-120b/)
})
