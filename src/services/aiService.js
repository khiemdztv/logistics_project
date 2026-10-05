import { GoogleGenerativeAI } from '@google/generative-ai'

// API Key from Vite env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

let cachedContext = null

// Load compiled RAG Master Context
export async function getRagContext() {
  if (cachedContext) return cachedContext
  try {
    const res = await fetch('/rag_context.txt')
    if (res.ok) {
      cachedContext = await res.text()
    } else {
      cachedContext = 'Không thể tải tệp tri thức rag_context.txt.'
    }
  } catch (e) {
    console.error('Error fetching RAG context:', e)
    cachedContext = 'Lỗi kết nối bộ nhớ cục bộ.'
  }
  return cachedContext
}

// Helper to call Gemini with model fallback
async function generateWithFallback(systemInstruction, promptOrMessages, isChat = false, generationConfig = {}) {
  if (!genAI) {
    throw new Error('MISSING_API_KEY')
  }

  const modelCandidates = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash']
  let lastError = null

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
      })

      if (isChat) {
        const history = promptOrMessages.chatHistory
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          }))

        const chat = model.startChat({
          history: history,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.2,
            ...generationConfig
          }
        })
        const result = await chat.sendMessage(promptOrMessages.userMessage)
        const response = await result.response
        return response.text()
      } else {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: promptOrMessages }] }],
          generationConfig: {
            temperature: 0.1,
            ...generationConfig
          }
        })
        const response = await result.response
        return response.text()
      }
    } catch (err) {
      console.warn(`Attempt with model ${modelName} failed:`, err.message)
      lastError = err
    }
  }

  throw lastError || new Error('Không thể kết nối dịch vụ AI.')
}

// Built-in offline knowledge responder if API key is not provided on Vercel
function getOfflineRAGResponse(userQuery, context) {
  const q = userQuery.toLowerCase()
  
  if (q.includes('cpo') || q.includes('dầu cọ') || q.includes('dầu thực vật')) {
    return `**Quy trình chuẩn rửa hầm sau khi dỡ Dầu Cọ (CPO) / Dầu Thực Vật:**
- **Bước 1 (Xả trôi lạnh):** Rửa xả trôi bằng NƯỚC BIỂN MÁT (< 40°C) ngay sau khi dỡ hàng. *Tuyệt đối không dùng nước nóng ở bước này vì sẽ làm đông cứng axit béo vào lớp bọc hầm Epoxy.*
- **Bước 2 (Xà phòng hóa kiềm nóng):** Rửa tuần hoàn dung dịch Kiềm mạnh (Unitor Alkaclean / Careclean Alkaline 2-3%) pha nước nóng 75–85°C trong 2–3 giờ.
- **Bước 3 (Tráng ngọt & khử ion):** Tráng lại nước ngọt nóng (70°C), sau đó tráng nước khử khoáng (DI Water).
- **Bước 4 (Sấy khô & Kiểm tra):** Sấy khô bằng quạt gió không dầu. Tiến hành Wall Wash Test kiểm tra PTT và Hydrocarbon.`
  }

  if (q.includes('ptt') || q.includes('thuốc tím') || q.includes('6.5') || q.includes('6.8')) {
    return `**Hướng dẫn xử lý khi chỉ số PTT không đạt (Dưới 30 - 50 phút):**
- **Nguyên nhân chính:** Hầm còn sót màng dầu mỏng (Hydrocarbon film), cặn hữu cơ chưa bị phân hủy hết hoặc lớp sơn Epoxy đang ngậm dung môi cũ tiết ra.
- **Phương án khắc phục (Re-cleaning SOP):**
  1. Rửa tuần hoàn hầm bằng dung dịch chất tẩy rửa nhũ hóa dầu mỏ (**Unitor Seaclean Plus** / **Marclean HCR**) nồng độ 1-2% với nước nóng 70–75°C trong 2 giờ.
  2. Xông hơi nhẹ hoặc xả nước ngọt nóng 80°C liên tục để đẩy dung môi ngậm trong lớp sơn Epoxy ra ngoài.
  3. Tráng nước khử khoáng (DI Water), sấy khô và lấy mẫu kiểm tra lại.`
  }

  if (q.includes('wall wash') || q.includes('water white') || q.includes('khác biệt')) {
    return `**So sánh tiêu chuẩn Wall Wash Standard & Water White Standard:**
- **Water White Standard (Kiểm tra cảm quan):**
  + Áp dụng cho: Hàng dầu thô, dầu nhiên liệu (DPP), hàng thông thường.
  + Tiêu chí: Sạch - Khô - Không mùi - Không cặn bẩn/gỉ sét trên 7 khu vực hầm.
- **Wall Wash Standard (Kiểm tra hóa chất định lượng):**
  + Áp dụng cho: Hóa chất tinh khiết (Methanol, MEG, IPA, Benzene), Nhiên liệu bay Jet A-1.
  + Phương pháp: Dùng dung môi Methanol quét vách để đo 5 chỉ tiêu hóa nghiệm: Độ mặn Clorua (< 2 ppm), PTT (> 50 min), Độ màu APHA (< 20), Hydrocarbon (< 35 ppm), NVM.`
  }

  if (q.includes('clorua') || q.includes('độ mặn') || q.includes('muối') || q.includes('chloride')) {
    return `**Tiêu chuẩn và cách kiểm tra Clorua (Chloride Test):**
- **Nguyên lý:** Phản ứng giữa ion Cl- và Bạc Nitrat (AgNO3 10%) tạo kết tủa AgCl màu trắng đục.
- **Giới hạn đạt:** Clorua <= 2.0 ppm.
- **Lưu ý thao tác (Human Factor):** Bắt buộc sĩ quan phải đeo găng tay Nitrile sạch không bột khi lấy mẫu WWT, vì mồ hôi tay chứa muối sẽ gây lỗi nhiễm mặn giả lập.`
  }

  return `**Dolphin Maritime Copilot (RAG Knowledge Engine):**
Dữ liệu tra cứu chuẩn hàng hải tàu Dolphin 01:
- Tàu: DOLPHIN 01 (34,000 DWT, Bọc sơn Pure Epoxy).
- Quy chuẩn tham chiếu: MARPOL Annex II, FOSFA List, INTERTANKO Tank Cleanliness, CHRIS Manual.
- Đối với hàng tinh khiết (Methanol, Dung môi): Yêu cầu bắt buộc kiểm tra Wall Wash Standard (PTT > 50 min, Clorua < 2 ppm, APHA < 20).
- Bạn có thể hỏi chi tiết về: Quy trình rửa sau khi chở CPO, Cách xử lý khi rớt PTT, Tiêu chuẩn FOSFA Banned Cargoes, hoặc Công thức dự toán hóa chất.`
}

export async function chatWithCopilot(userMessage, chatHistory) {
  const context = await getRagContext()

  if (!API_KEY) {
    // Return structured offline RAG response
    return getOfflineRAGResponse(userMessage, context)
  }

  try {
    const systemInstruction = `Bạn là Dolphin Maritime Copilot - Chuyên gia AI Cố vấn Hàng hải cho Sĩ quan tàu Dầu/Hóa chất Dolphin 01 (Pure Epoxy coating, 34,000 DWT).
Nhiệm vụ: Trả lời chính xác các câu hỏi kỹ thuật về làm sạch hầm hàng, tiêu chuẩn kiểm tra Wall Wash Test, Water White, quy tắc FOSFA Banned List, công ước MARPOL Annex II, và an toàn hóa chất MSDS.
Nguồn kiến thức tham chiếu (RAG Context): Hãy DỰA TRỰC TIẾP VÀO NỘI DUNG TÀI LIỆU DƯỚI ĐÂY để trả lời.
Quy định trình bày: 
- Ngắn gọn, chuyên nghiệp, rõ ràng từng bước.
- Trình bày định dạng Markdown chuẩn (dùng danh sách gạch đầu dòng, **in đậm** tiêu đề và số liệu quan trọng).

--- TÀI LIỆU HUẤN LUYỆN DOLPHIN TANKOPS (RAG DATABASE) ---
${context.substring(0, 45000)}
`
    return await generateWithFallback(
      systemInstruction, 
      { userMessage, chatHistory }, 
      true
    )
  } catch (error) {
    console.error('Gemini API Error, falling back to built-in RAG:', error)
    return getOfflineRAGResponse(userMessage, context)
  }
}

export async function analyzeTestFailures(failedTests, allResults, previousCargo, newCargo) {
  const context = await getRagContext()

  // Default intelligent diagnostic if no API key
  const fallbackDiagnostic = {
    title: "AI CHẨN ĐOÁN & HƯỚNG DẪN KHẮC PHỤC (RAG SOP)",
    causes: failedTests.map(testId => {
      if (testId === 'ptt') return 'Chỉ số PTT thấp do còn màng dầu mỏng (Hydrocarbon film) hoặc lớp sơn Epoxy hấp thụ cặn hữu cơ từ hàng trước tiết ra.'
      if (testId === 'salinity' || testId === 'chloride') return 'Độ mặn/Clorua vượt ngưỡng do tráng nước ngọt chưa đủ lưu lượng sau khi rửa nước biển, hoặc đọng muối ở giếng thu đáy hầm.'
      if (testId === 'hydrocarbon') return 'Còn dư lượng dầu mỡ bám dính ở các góc khuất trần hầm hoặc đầu vòi phun chưa được tẩy sạch.'
      if (testId === 'apha') return 'Độ màu APHA cao do lẫn vết ố vàng oxit sắt từ kết cấu kim loại.'
      return `Chỉ số ${testId.toUpperCase()} vượt ngưỡng tiêu chuẩn cho phép đối với hàng ${newCargo}.`
    }),
    solutions: [
      `Rửa tuần hoàn nước nóng 70–75°C kết hợp hóa chất chuyên dụng (Unitor Seaclean Plus hoặc Alkaclean 2%) trong 2 giờ.`,
      `Xông hơi nhiệt hoặc tráng rửa áp lực cao toàn bộ vách và giếng thu bằng Nước khử khoáng (DI Water).`,
      `Sấy khô cưỡng bức bằng khí sạch không dầu và tiến hành kiểm tra lại các chỉ tiêu không đạt.`
    ]
  }

  if (!API_KEY) {
    return fallbackDiagnostic
  }

  try {
    const prompt = `Bạn là chuyên gia giám định hóa chất (Cargo Surveyor). Sĩ quan tàu Dolphin 01 vừa thực hiện kiểm tra Wall Wash Standard.
Hàng cũ vừa dỡ: ${previousCargo}
Hàng sắp nhận: ${newCargo}
Các chỉ tiêu KHÔNG ĐẠT:
${failedTests.map(testId => `- ${testId.toUpperCase()}: ${allResults[testId]}`).join('\n')}

Dựa vào tài liệu CHRIS Manual / Tank Cleaning Guide:
1. Nêu NGẮN GỌN nguyên nhân khả dĩ (causes) khiến các chỉ tiêu này không đạt. (2-3 ý)
2. Đề xuất quy trình RỬA LẠI (solutions) cụ thể, chi tiết các hóa chất cần dùng và nhiệt độ. (2-3 bước)

Trả lời bắt buộc theo định dạng JSON sau:
{
  "title": "AI CHẨN ĐOÁN & HƯỚNG DẪN KHẮC PHỤC",
  "causes": ["Nguyên nhân 1", "Nguyên nhân 2"],
  "solutions": ["Bước 1...", "Bước 2..."]
}

--- TÀI LIỆU THAM KHẢO ---
${context.substring(0, 30000)}
`
    const responseText = await generateWithFallback(
      'Bạn là hệ thống AI giám định hàng hải trả lời strictly bằng JSON hợp lệ.',
      prompt,
      false,
      { responseMimeType: "application/json" }
    )
    
    return JSON.parse(responseText)
  } catch (error) {
    console.error('Gemini AI Diagnostic Error, using fallback:', error)
    return fallbackDiagnostic
  }
}
