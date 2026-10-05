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

  const apiKey = 
    process.env.GEMINI_API_KEY || 
    process.env.VITE_GEMINI_API_KEY || 
    req.body?.customApiKey || 
    ''

  if (!apiKey) {
    return res.status(400).json({ 
      error: 'NO_API_KEY',
      message: 'Chưa cấu hình GEMINI_API_KEY trên Vercel hoặc chưa nhập khóa.' 
    })
  }

  const { userMessage, chatHistory = [], isDiagnostic = false, diagnosticData } = req.body

  if (!userMessage && !isDiagnostic) {
    return res.status(400).json({ error: 'Missing userMessage' })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const knowledge = getKnowledge()

    const systemInstruction = `Bạn là Dolphin Maritime Copilot - Chuyên gia Cố vấn AI Hàng hải và Giám định viên Kỹ thuật cho Website Quản lý & Làm sạch Hầm hàng Tàu Hóa chất Dolphin 01 (Pure Epoxy Coating, 34,000 DWT).

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
- Trả lời thân thiện, thông minh, chuyên nghiệp, tự nhiên.
- Luôn giải thích rõ ràng, chi tiết, logic khi người dùng hỏi về tính năng web, lý thuyết làm sạch, nguyên nhân lỗi test hoặc quy trình hóa chất.
- Trình bày định dạng Markdown chuẩn (**in đậm**, danh sách gạch đầu dòng, code block).

--- KHO DỮ LIỆU TRI THỨC ĐẦY ĐỦ (RAG CONTEXT) ---
${knowledge.substring(0, 50000)}
`

    if (isDiagnostic) {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
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
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: diagnosticPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
      })
      const resp = await result.response
      return res.status(200).json(JSON.parse(resp.text()))
    }

    const modelCandidates = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash']
    let lastError = null

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction,
        })

        const history = chatHistory
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          }))

        const chat = model.startChat({
          history: history,
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.4,
          }
        })

        const result = await chat.sendMessage(userMessage)
        const response = await result.response
        return res.status(200).json({ reply: response.text(), model: modelName })
      } catch (err) {
        console.warn(`Serverless Gemini with ${modelName} error:`, err.message)
        lastError = err
      }
    }

    throw lastError || new Error('Không thể kết nối Gemini API')
  } catch (error) {
    console.error('Serverless Chatbot API Error:', error)
    return res.status(500).json({ error: 'AI_ERROR', message: error.message })
  }
}
