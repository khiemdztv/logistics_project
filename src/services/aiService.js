import { GoogleGenerativeAI } from '@google/generative-ai'

// The API Key is loaded from the environment variable (.env.local) or Vercel Environment Variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(API_KEY)

let cachedContext = null

// Load the compiled document knowledge (RAG Context)
async function getRagContext() {
  if (cachedContext) return cachedContext
  try {
    const res = await fetch('/rag_context.txt')
    if (res.ok) {
      cachedContext = await res.text()
    } else {
      cachedContext = 'Không thể tải tài liệu huấn luyện.'
    }
  } catch (e) {
    console.error('Error fetching RAG context:', e)
    cachedContext = 'Lỗi truy cập dữ liệu cục bộ.'
  }
  return cachedContext
}

export async function chatWithCopilot(userMessage, chatHistory) {
  if (!API_KEY) {
    return 'Lỗi: Chưa cấu hình VITE_GEMINI_API_KEY. Vui lòng thiết lập biến môi trường.'
  }

  try {
    const context = await getRagContext()
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash-lite',
      systemInstruction: `Bạn là trợ lý AI Dolphin Maritime Copilot cho sĩ quan tàu dầu/hóa chất.
Nhiệm vụ của bạn: Trả lời các câu hỏi về quy trình làm sạch hầm hàng, chuẩn MARPOL, FOSFA, kiểm tra Wall Wash/Water White, và an toàn hóa chất.
Nguồn dữ liệu: Hãy DỰA CHỦ YẾU VÀO TÀI LIỆU SAU ĐÂY để trả lời. Nếu tài liệu không có, hãy dùng kiến thức chung về hàng hải và nói rõ.
Quy định: Trả lời ngắn gọn, chuyên nghiệp, chính xác. Format bằng Markdown (dùng bullet point, in đậm nếu cần).

--- TÀI LIỆU HUẤN LUYỆN (RAG CONTEXT) ---
${context.substring(0, 30000)} // Giới hạn context để tối ưu
`
    })

    // Convert chat history to Gemini format (excluding system instruction and source info)
    const history = chatHistory
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.2,
      },
    })

    const result = await chat.sendMessage(userMessage)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API Error:', error)
    return `Lỗi hệ thống AI: ${error.message}`
  }
}

export async function analyzeTestFailures(failedTests, allResults, previousCargo, newCargo) {
  if (!API_KEY) {
    return null
  }

  try {
    const context = await getRagContext()
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' })
    
    const prompt = `Bạn là chuyên gia giám định hóa chất (Cargo Surveyor). Sĩ quan tàu Dolphin 01 vừa thực hiện kiểm tra Wall Wash Standard.
Hàng cũ vừa dỡ: ${previousCargo}
Hàng sắp nhận: ${newCargo}
Các chỉ tiêu đã ĐẠT: ${Object.keys(allResults).filter(k => !failedTests.includes(k)).join(', ')}
Các chỉ tiêu KHÔNG ĐẠT (Cần phân tích):
${failedTests.map(testId => `- ${testId.toUpperCase()}: ${allResults[testId]}`).join('\n')}

Dựa vào tài liệu CHRIS Manual / Tank Cleaning Guide:
1. Nêu NGẮN GỌN nguyên nhân khả dĩ (causes) khiến các chỉ tiêu này không đạt. (2-3 ý ngắn gọn)
2. Đề xuất quy trình RỬA LẠI (solutions) cụ thể, chi tiết các hóa chất cần dùng và nhiệt độ. (2-3 bước)

Trả lời bắt buộc theo định dạng JSON sau:
{
  "title": "AI CHẨN ĐOÁN & HƯỚNG DẪN KHẮC PHỤC",
  "causes": ["Nguyên nhân 1", "Nguyên nhân 2"],
  "solutions": ["Bước 1...", "Bước 2..."]
}

--- TÀI LIỆU THAM KHẢO ---
${context.substring(0, 20000)}
`
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    })
    
    const responseText = await result.response.text()
    return JSON.parse(responseText)
  } catch (error) {
    console.error('Gemini AI Diagnostic Error:', error)
    return null
  }
}
