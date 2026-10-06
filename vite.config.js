import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { createChatHandler } from './api/chat.js'

function localCopilotAPI(env) {
  const handler = createChatHandler({ env })
  return {
    name: 'local-copilot-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        res.status = code => { res.statusCode = code; return res }
        res.json = data => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(data)) }
        try {
          if (req.method === 'POST') {
            let size = 0
            const chunks = []
            for await (const chunk of req) {
              size += chunk.length
              if (size > 32000) return res.status(413).json({ error: 'REQUEST_TOO_LARGE', message: 'Nội dung yêu cầu quá dài.' })
              chunks.push(chunk)
            }
            req.body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          }
        } catch {
          return res.status(400).json({ error: 'INVALID_JSON', message: 'Nội dung JSON không hợp lệ.' })
        }
        try { await handler(req, res) } catch {
          if (!res.writableEnded) res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Dịch vụ AI gặp lỗi xử lý.' })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const loaded = loadEnv(mode, process.cwd(), '')
  const serverEnv = { ...process.env }
  for (const key of ['GROQ_API_KEY', 'GEMINI_API_KEY', 'GROQ_MODEL', 'GEMINI_MODEL', 'VITE_GROQ_API_KEY', 'VITE_GEMINI_API_KEY']) {
    if (!serverEnv[key] && loaded[key]) serverEnv[key] = loaded[key]
  }
  return { plugins: [react(), localCopilotAPI(serverEnv)] }
})
