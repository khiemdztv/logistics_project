import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

let cachedKnowledge = null

function getKnowledge() {
  if (cachedKnowledge) return cachedKnowledge
  try {
    const p = path.join(process.cwd(), 'public', 'rag_context.txt')
    if (fs.existsSync(p)) {
      cachedKnowledge = fs.readFileSync(p, 'utf8')
      return cachedKnowledge
    }
  } catch (err) {
    console.error('Error reading rag_context.txt in serverless function:', err)
  }
  return ''
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const groqApiKey = 
    process.env.GROQ_API_KEY || 
    process.env.VITE_GROQ_API_KEY || 
    (req.body?.customApiKey && req.body.customApiKey.startsWith('gsk_') ? req.body.customApiKey : '')

  const geminiApiKey = 
    process.env.GEMINI_API_KEY || 
    process.env.VITE_GEMINI_API_KEY || 
    (req.body?.customApiKey && req.body.customApiKey.startsWith('AIzaSy') ? req.body.customApiKey : '')

  const customKey = req.body?.customApiKey || ''

  const { userMessage, chatHistory = [], isDiagnostic = false, diagnosticData } = req.body

  if (!userMessage && !isDiagnostic) {
    return res.status(400).json({ error: 'Missing userMessage' })
  }

  const knowledge = getKnowledge()

  const systemInstruction = `Bạn là Dolphin Maritime Copilot - Chuyên gia Cố vấn AI Hàng hải và Giám định viên Kỹ thuật siêu tốc cho Website Quản lý & Làm sạch Hầm hàng Tàu Hóa chất Dolphin 01 (Pure Epoxy Coating, 34,000 DWT).

VỀ WEBSITE DOLPHIN TANKOPS:
Website gồm 3 bước chính:
- Bước 1 (Khởi tạo & Phân tích tương thích): Nhập hàng cũ vừa dỡ, hàng mới sắp nhận, chọn hầm hàng. Web tự động tra cứu FOSFA Banned List (Luật cấm 3 chuyến), kiểm tra ma trận tương thích lớp bọc Pure Epoxy, và phân nhánh phương pháp kiểm tra:
  + WALL WASH STANDARD: Bắt buộc cho hàng tinh khiết (Methanol, MEG, IPA, Benzene, Acetone), Nhiên liệu bay Jet A-1.
  + WATER WHITE STANDARD: Cho dầu thô, dầu nhiên liệu DPP/HFO/MGO và hàng thông thường.
- Bước 2 (Thực hiện kiểm tra):
  + Nếu Water White: Sĩ quan kiểm tra cảm quan 7 khu vực (Trần hầm, vách mũi, vách lái, vách mạn trái/phải, đáy hầm, đường ống/giếng thu), chụp ảnh bằng chứng.
  + Nếu Wall Wash: Nhập kết quả test hóa chất 5 chỉ tiêu: Độ mặn Clorua (<= 2 ppm), PTT (>= 50 phút), Màu APHA (<= 20), Hydrocarbon Miscibility (<= 35 ppm, không đục), NVM (< 10 ppm). Nếu có chỉ số không đạt, AI tự động chẩn đoán nguyên nhân và đề xuất phương án rửa lại.
- Bước 3 (Báo cáo & Nghiệm thu): Tổng hợp số liệu, checklist, ảnh chụp, chữ ký sĩ quan và xuất Chứng chỉ vệ sinh hầm hàng (Cargo Hold Cleanliness Certificate) chuẩn INTERTANKO phục vụ việc trao Thông báo sẵn sàng (NOR) cho chủ hàng/giám định viên.

VỀ LÝ THUYẾT LÀM SẠCH HẦM HÀNG:
- Nguyên lý: Loại bỏ hoàn toàn màng cặn, mùi, độ ẩm và tạp chất hữu cơ/vô cơ từ chuyến hàng trước để ngăn ngừa nhiễm bẩn chéo (cross-contamination) cho chuyến hàng sau.
- Quy trình hóa lý:
  + Dầu mỏ: Rửa dầu thô COW, rửa nước nóng với chất tẩy nhũ hóa dầu (Unitor Seaclean Plus/Marclean HCR).
  + Dầu thực vật (CPO): Rửa xả trôi nước mát (<40°C) trước để tránh chín dầu, sau đó rửa kiềm nóng (Unitor Alkaclean 75-85°C) để xà phòng hóa axit béo.
  + Dung môi tinh khiết: Xông hơi dung môi trung gian (Methanol/Acetone), tráng nước khử khoáng DI Water, sấy khô bằng khí sạch không dầu.
- Tiêu chuẩn tham chiếu: MARPOL Annex II (MEPC.2-Circ.29/31), FOSFA Banned Cargoes, CHRIS Manual, INTERTANKO Cleanliness Standards, ASTM D1722, ASTM D1363, ASTM D512.

YÊU CẦU TRẢ LỜI:
- Trả lời bằng tiếng Việt, thông minh, thân thiện, súc tích, logic và chuyên nghiệp.
- Khi người dùng hỏi bất kỳ câu hỏi nào về web, lý thuyết làm sạch, khái niệm hay sự cố test, hãy giải thích cặn kẽ và chuẩn xác.
- Trình bày định dạng Markdown chuẩn (**in đậm**, danh sách gạch đầu dòng, code block).

--- KHO DỮ LIỆU TRI THỨC ĐẦY ĐỦ (RAG CONTEXT) ---
${knowledge.substring(0, 40000)}
`

  // 1. Prioritize GROQ API if available
  const activeGroqKey = groqApiKey || (customKey.startsWith('gsk_') ? customKey : '')
  if (activeGroqKey) {
    try {
      const groq = new Groq({ apiKey: activeGroqKey })

      if (isDiagnostic) {
        const diagnosticPrompt = `Bạn là chuyên gia giám định hóa chất (Cargo Surveyor). Sĩ quan vừa test Wall Wash cho hầm tàu Dolphin 01:
Hàng cũ: ${diagnosticData.previousCargo}
Hàng mới: ${diagnosticData.newCargo}
Các chỉ tiêu KHÔNG ĐẠT:
${diagnosticData.failedTests.map(t => `- ${t.toUpperCase()}: ${diagnosticData.allResults[t]}`).join('\n')}

Dựa vào tài liệu CHRIS Manual / Tank Cleaning Guide:
1. Nêu 2-3 nguyên nhân khả dĩ (causes).
2. Đề xuất quy trình RỬA LẠI (solutions) cụ thể, chi tiết các hóa chất cần dùng và nhiệt độ.

Trả lời đúng JSON format:
{
  "title": "AI CHẨN ĐOÁN & HƯỚNG DẪN KHẮC PHỤC",
  "causes": ["Nguyên nhân 1", "Nguyên nhân 2"],
  "solutions": ["Bước 1...", "Bước 2..."]
}
`
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'Bạn là hệ thống AI giám định hàng hải trả lời strictly bằng JSON hợp lệ.' },
            { role: 'user', content: diagnosticPrompt }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })

        const content = completion.choices[0]?.message?.content || '{}'
        return res.status(200).json(JSON.parse(content))
      }

      // Normal Chat with Groq Llama 3.3 70B
      const messages = [
        { role: 'system', content: systemInstruction },
        ...chatHistory
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          })),
        { role: 'user', content: userMessage }
      ]

      const completion = await groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        max_tokens: 1500,
      })

      const reply = completion.choices[0]?.message?.content || ''
      return res.status(200).json({ reply, model: 'Groq Llama 3.3 70B' })
    } catch (groqErr) {
      console.warn('Groq API failed, trying fallback:', groqErr.message)
    }
  }

  // 2. Secondary fallback: Gemini API if key exists
  const activeGeminiKey = geminiApiKey || (customKey.startsWith('AIzaSy') ? customKey : '')
  if (activeGeminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(activeGeminiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemInstruction,
      })

      const history = chatHistory
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))

      const chat = model.startChat({
        history,
        generationConfig: { maxOutputTokens: 1200, temperature: 0.4 }
      })

      const result = await chat.sendMessage(userMessage)
      const response = await result.response
      return res.status(200).json({ reply: response.text(), model: 'Gemini 2.5 Flash' })
    } catch (geminiErr) {
      console.warn('Gemini API fallback failed:', geminiErr.message)
    }
  }

  return res.status(400).json({
    error: 'NO_API_KEY',
    message: 'Vui lòng thiết lập GROQ_API_KEY trên Vercel hoặc nhập khóa trên giao diện.'
  })
}
