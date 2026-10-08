import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { chatWithCopilot, analyzeTestFailures } from '../src/services/aiService.js'

const references = JSON.parse(fs.readFileSync(new URL('../public/rag_reference.json', import.meta.url), 'utf8'))
const raw = fs.readFileSync(new URL('../public/rag_context.txt', import.meta.url), 'utf8')

test('browser displays provider metadata and sends the question once with sanitized context', async t => {
  let body
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    body = JSON.parse(options.body)
    return Response.json({ reply: 'Câu trả lời tự nhiên.', model: 'Groq · test', mode: 'ai', sources: [] })
  })
  const data = await chatWithCopilot('Methanol cần bao nhiêu test?', [], { newCargo: 'methanol', photos: ['private'] })
  assert.equal(data.mode, 'ai')
  assert.equal(data.model, 'Groq · test')
  assert.equal(body.userMessage, 'Methanol cần bao nhiêu test?')
  assert.equal(body.chatHistory.length, 0)
  assert.ok(!Object.hasOwn(body.appContext, 'photos'))
})

test('quota error preserves the reason, answers from local documents and never claims Groq', async t => {
  t.mock.method(globalThis, 'fetch', async url => {
    if (url === '/api/chat') return Response.json({ message: 'AI đang hết hạn mức.' }, { status: 429 })
    if (url.endsWith('.json')) return Response.json(references)
    return new Response(raw)
  })
  const data = await chatWithCopilot('hàng methanol thì cần bao nhiêu test hóa chất')
  assert.equal(data.mode, 'local')
  assert.equal(data.model, null)
  assert.match(data.warning, /hết hạn mức/)
  assert.match(data.reply, /4 phép kiểm tra hóa học chính/)
  assert.match(data.reply, /3 phép thử bắt buộc/)
})

test('invalid diagnostic responses use explicit local hints instead of a fixed hot-wash recipe', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ causes: 'invalid', solutions: [] }))
  const data = await analyzeTestFailures(['chloride'], { chloride: 'turbid' }, 'palm_oil_crude', 'methanol')
  assert.equal(data.mode, 'local')
  assert.ok(Array.isArray(data.causes) && Array.isArray(data.solutions))
  assert.doesNotMatch(data.solutions.join(' '), /70|75|80|2%/)
})
