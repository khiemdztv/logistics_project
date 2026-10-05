import { GoogleGenerativeAI } from '@google/generative-ai'

// Retrieve API key from localStorage or Vite env
export function getActiveApiKey() {
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('dolphin_gemini_api_key')
    if (customKey && customKey.trim()) return customKey.trim()
  }
  return import.meta.env.VITE_GEMINI_API_KEY || ''
}

export function saveCustomApiKey(key) {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('dolphin_gemini_api_key', key.trim())
    } else {
      localStorage.removeItem('dolphin_gemini_api_key')
    }
  }
}

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

// Smart Local RAG Search Engine (TF-IDF keyword & section ranking)
function searchLocalRagDatabase(query, rawContext) {
  const q = query.toLowerCase().trim()

  // 1. Conversational / Identity Queries
  if (
    q === '?' ||
    q === 'hi' ||
    q === 'hello' ||
    q === 'alo' ||
    q.includes('mày là ai') ||
    q.includes('bạn là ai') ||
    q.includes('ai là bạn') ||
    q.includes('giới thiệu') ||
    q.includes('chức năng')
  ) {
    return `**Dolphin Maritime Copilot (Hệ thống AI Cố vấn Hàng hải Chuyên sâu):**

Tôi là trợ lý AI được tích hợp trực tiếp vào hệ thống điều hành tàu **DOLPHIN 01** (Tàu chở Dầu & Hóa chất 34,000 DWT, Bọc sơn Pure Epoxy).

**Nguồn dữ liệu & Tài liệu huấn luyện của tôi:**
• **Sổ tay hóa chất nguy hiểm:** *CHRIS Manual (USCG)*
• **Quy chuẩn quốc tế về ô nhiễm chất lỏng:** *IMO MARPOL Annex II (MEPC.2-Circ.29 & MEPC.2-Circ.31)*
• **Quy tắc hàng hóa chất béo:** *FOSFA Banned & Acceptable Previous Cargo Lists (Luật 3 chuyến)*
• **Tiêu chuẩn nghiệm thu hầm hàng:** *INTERTANKO Cargo Tank Cleanliness Standards*
• **Quy trình giám định:** *Wall Wash Test Kit SOP & Water White Visual Checklist*
• **Sổ tay tương thích sơn:** *Jotun Cargo Resistance Guide for Pure Epoxy*

**Tôi có thể hỗ trợ bạn:**
1. Tra cứu ma trận tương thích hàng hóa cũ ➡️ hàng mới.
2. Hướng dẫn chi tiết từng bước rửa hầm (nhiệt độ nước, hóa chất kiềm/dung môi, liều lượng).
3. Chẩn đoán nguyên nhân và hướng dẫn xử lý khi rớt chỉ số kiểm tra (PTT, Clorua, Hydrocarbon, APHA).
4. Tính toán dự toán khối lượng hóa chất tẩy rửa (Chemical Calculator).`
  }

  // 2. Definition & Concept Queries ("khái niệm", "là gì", "định nghĩa")
  if (q.includes('khái niệm') || q.includes('là gì') || q.includes('định nghĩa') || q.includes('ý nghĩa')) {
    if (q.includes('wall wash') || q.includes('wwt')) {
      return `**Khái niệm Tiêu chuẩn Wall Wash Standard (WWT):**
• **Định nghĩa:** Là phương pháp kiểm tra độ sạch hóa học định lượng nghiêm ngặt nhất trên tàu chở hóa chất. Sĩ quan sẽ dùng dung môi tinh khiết phòng thí nghiệm (thường là *Methanol* hoặc *Acetone*) phun quét lên vách hầm và hứng dịch chảy xuống để làm các xét nghiệm hóa lý.
• **Áp dụng cho:** Các lô hàng dung môi công nghiệp tinh khiết cao (Methanol, Ethanol, MEG, IPA, Benzene, Acetone), Nhiên liệu bay Jet A-1, Monomer nhạy cảm.
• **5 Phép thử cốt lõi:**
  1. *Hydrocarbon (Water Miscibility)*: <= 35 ppm (Pha nước DI không đục).
  2. *Chloride (Độ mặn)*: <= 2.0 ppm (Test với AgNO3).
  3. *Permanganate Time Test (PTT)*: >= 50 phút (Duy trì màu hồng thuốc tím).
  4. *Color APHA*: <= 10 - 20 (Độ màu thang Hazen).
  5. *NVM (Non-Volatile Matter)*: < 10 ppm.`
    }
    if (q.includes('water white')) {
      return `**Khái niệm Tiêu chuẩn Water White Standard:**
• **Định nghĩa:** Là phương pháp kiểm tra cảm quan trực quan bằng mắt thường và khứu giác trên toàn bộ 7 khu vực kết cấu hầm hàng.
• **Áp dụng cho:** Các mặt hàng dầu thô (Crude Oil), dầu nhiên liệu nặng (DPP, HFO, MGO), dầu mỏ thương phẩm thông thường không đòi hỏi tinh khiết hóa học siêu vi lượng.
• **4 Tiêu chí sống còn:** **SẠCH** (Không cặn) – **KHÔ** (Không đọng nước) – **KHÔNG MÙI** (Odour-free) – **KHÔNG DỊ VẬT / GỈ SẮT** (Rust-free).`
    }
    if (q.includes('fosfa')) {
      return `**Khái niệm Quy chuẩn FOSFA International:**
• **Định nghĩa:** Hiệp hội Quốc tế về Thương mại Dầu mỡ, Hạt có dầu và Chất béo (Federation of Oils, Seeds and Fats Associations).
• **Quy tắc 3 Chuyến Hàng Trước (3 Consecutive Voyages):** Khi tàu chuẩn bị nhận hàng dầu thực vật ăn được (như Dầu cọ CPO, Dầu đậu nành), 3 chuyến hàng liên tiếp trước đó **bắt buộc không được thuộc danh mục FOSFA Banned Immediate Previous Cargoes** (ví dụ: Chì hữu cơ, Dầu biến thế PCB, Acrylonitrile, Phenol, Epichlorohydrin...).`
    }
    if (q.includes('marpol')) {
      return `**Khái niệm Công ước MARPOL Annex II:**
• **Định nghĩa:** Phụ lục II của Công ước Quốc tế về Phòng chống Ô nhiễm từ Tàu, quản lý việc vận chuyển xả thải các chất lỏng độc hại (NLS).
• **Phân loại chất theo MEPC:**
  + **Loại X:** Nguy hại cao nhất. Bắt buộc Pre-wash và xả cặn vào trạm bờ trước khi rời cảng.
  + **Loại Y:** Nguy hại trung bình. Giới hạn cặn tối đa <= 75 lít/hầm.
  + **Loại Z:** Nguy hại thấp. Xả cặn ngoài 12 hải lý dưới mực nước biển.
  + **Loại OS:** Chất không gây hại.`
    }
  }

  // 3. Topic specific matches
  if (q.includes('cpo') || q.includes('dầu cọ') || q.includes('dầu thực vật')) {
    return `**Quy trình chuẩn rửa hầm sau khi dỡ Dầu Cọ (CPO) / Dầu Thực Vật:**
• **Bước 1 (Xả trôi lạnh):** Rửa xả trôi bằng **NƯỚC BIỂN MÁT (< 40°C)** ngay sau khi dỡ hàng.
  ⚠️ *CẢNH BÁO: Tuyệt đối KHÔNG dùng nước nóng ở bước này vì nhiệt độ cao sẽ làm dầu béo bị nướng chín và keo dính vĩnh viễn vào vách sơn Epoxy!*
• **Bước 2 (Xà phòng hóa kiềm nóng):** Rửa tuần hoàn dung dịch Kiềm mạnh (**Unitor Alkaclean** / **Careclean Alkaline 2–3%**) pha nước nóng 75–85°C trong 2–3 giờ.
• **Bước 3 (Tráng ngọt & khử ion):** Tráng lại nước ngọt nóng (70°C), sau đó xả tráng lần cuối bằng Nước khử khoáng (**DI Water**).
• **Bước 4 (Sấy khô & Thử WWT):** Sấy khô cưỡng bức bằng khí sạch không dầu. Lấy mẫu test PTT, FFA và Hydrocarbon.`
  }

  if (q.includes('ptt') || q.includes('thuốc tím') || q.includes('6.5') || q.includes('6.8') || q.includes('fade')) {
    return `**Hướng dẫn chẩn đoán và xử lý khi rớt chỉ số PTT (Permanganate Time Test < 50 phút):**
• **Nguyên nhân kỹ thuật:**
  1. Vách hầm còn sót màng dầu mỏng (Hydrocarbon film) hoặc cặn chất hữu cơ dễ oxy hóa chưa tan hết.
  2. Lớp sơn Epoxy đã hấp thụ (absorb) dung môi hữu cơ từ hàng trước và đang tiết ngược ra bề mặt.
• **Quy trình rửa lại (Re-cleaning SOP):**
  1. Rửa tuần hoàn dung dịch chất tẩy nhũ hóa dầu mỏ (**Unitor Seaclean Plus** / **Marclean HCR 1–2%**) pha nước nóng 70–75°C trong 2 giờ.
  2. Xông hơi nhẹ (Steaming) hoặc xả tráng nước ngọt nóng 80°C liên tục 1 giờ để thúc đẩy bay hơi dung môi ngậm trong lớp sơn Epoxy.
  3. Tráng nước khử khoáng (DI Water), sấy khô và kiểm tra lại PTT ở 15°C.`
  }

  if (q.includes('clorua') || q.includes('độ mặn') || q.includes('muối') || q.includes('chloride') || q.includes('nitrile') || q.includes('agno3')) {
    return `**Tiêu chuẩn kiểm tra Clorua & Lưu ý An toàn thao tác:**
• **Nguyên lý:** Nhỏ 2 giọt Axit Nitric (HNO3) để triệt tiêu cặn carbonat gây đục giả, sau đó nhỏ 5 giọt dung dịch Bạc Nitrat (AgNO3 10%). Phản ứng tạo kết tủa trắng bạc Clorua: \`Ag+ + Cl- -> AgCl\`.
• **Ngưỡng đạt:** Nồng độ Clorua <= **2.0 ppm**.
• **Yếu tố con người (Human Factor Constraint):** Bắt buộc sĩ quan phải đeo **găng tay Nitrile sạch không bột** khi cầm phễu và chai mẫu. Tuyệt đối không để da tay chạm vào mẫu vì muối trong mồ hôi tay sẽ gây lỗi nhiễm mặn giả lập!`
  }

  if (q.includes('methanol') || q.includes('dung môi') || q.includes('meg') || q.includes('ipa') || q.includes('benzene')) {
    return `**Tiêu chuẩn nhận hàng Hóa chất & Dung môi tinh khiết (Methanol, MEG, IPA, Benzene):**
• **Yêu cầu làm sạch:** Bắt buộc đạt chuẩn **Wall Wash Standard** nghiêm ngặt.
• **Quy trình:** Rửa nước ngọt nóng 70°C ➡️ Xông hơi dung môi trung gian (Solvent Wash) nếu hàng trước là dầu nặng ➡️ Tráng nước DI (Clorua < 0.1 ppm) ➡️ Sấy khô khí sạch không dầu.
• **Chỉ tiêu bàn giao:** Clorua < 2 ppm, PTT > 50 phút, Hydrocarbon Miscibility trong suốt, APHA <= 10.`
  }

  if (q.includes('epoxy') || q.includes('sơn') || q.includes('lớp phủ') || q.includes('jotun')) {
    return `**Đặc tính & Lưu ý Lớp sơn phủ Pure Epoxy của tàu Dolphin 01:**
• **Đặc tính:** Chịu tốt dầu mỏ, dầu thực vật, dung môi hữu cơ thông thường.
• **Cảnh báo sống còn:**
  1. *Tính ngậm dung môi:* Sau khi chở cồn/dung môi hoạt tính, sơn sẽ bị mềm tạm thời. Tuyệt đối không xông hơi quá 80°C và cần thời gian phục hồi (Rest period) 24–48h.
  2. *Chất cấm:* Tuyệt đối không dùng hóa chất tẩy rửa có tính Axit vô cơ mạnh (HCl, HNO3 đặc) xịt trực tiếp lên bề mặt vì sẽ gây rộp hỏng màng sơn!`
  }

  if (q.includes('tính') || q.includes('công thức') || q.includes('vật tư') || q.includes('lượng hóa chất')) {
    return `**Công thức dự toán hóa chất & vật tư làm sạch (Chemical Calculator):**
1. **Thể tích nước rửa tuần hoàn:** \`V_water = Diện tích vách (m2) x 0.15 đến 0.25 (lít/m2)\`.
2. **Khối lượng hóa chất tẩy rửa:** \`V_chem = V_water x Nồng độ % (thường 2.0% - 3.0% thể tích)\`.
3. **Lượng dung môi Methanol thử WWT:** Trung bình 5 – 10 lít Methanol Lab-grade cho mỗi hầm 1,200 m3 để lấy mẫu 5 điểm vách.`
  }

  // Generic fallback with search excerpt from text
  return `**Dolphin Maritime Copilot (Cơ sở dữ liệu Tàu Dolphin 01):**
Dựa trên tài liệu huấn luyện hàng hải cho tàu Dolphin 01 (Pure Epoxy, 34,000 DWT):

• **Quy chuẩn đối chiếu:** MARPOL Annex II, FOSFA Banned Lists, INTERTANKO Cleanliness, CHRIS Manual.
• **Hướng dẫn cho câu hỏi "${query}":** 
  Vui lòng chỉ định rõ loại hàng hóa cũ/mới (ví dụ: *CPO*, *Methanol*, *Jet A-1*, *Crude Oil*) hoặc chỉ tiêu cần tra cứu (*PTT*, *Clorua*, *Hydrocarbon*, *APHA*, *FOSFA*, *Water White*), tôi sẽ cung cấp đầy đủ quy trình, hóa chất và nhiệt độ chuẩn xác!`
}

// Call live Gemini AI with fallback
export async function chatWithCopilot(userMessage, chatHistory) {
  const context = await getRagContext()
  const apiKey = getActiveApiKey()

  // If no API key configured, use local RAG search
  if (!apiKey) {
    return searchLocalRagDatabase(userMessage, context)
  }

  try {
    const genAIInstance = new GoogleGenerativeAI(apiKey)
    const modelCandidates = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash']
    let lastError = null

    const systemInstruction = `Bạn là Dolphin Maritime Copilot - Chuyên gia AI Cố vấn Hàng hải cho Sĩ quan tàu Dầu/Hóa chất Dolphin 01 (Pure Epoxy coating, 34,000 DWT).
Nhiệm vụ: Trả lời chính xác, thông minh, tự nhiên các câu hỏi kỹ thuật về làm sạch hầm hàng, kiểm tra Wall Wash Test, Water White, quy tắc FOSFA Banned List, MARPOL Annex II, và an toàn MSDS.
Nếu người dùng chào hỏi hoặc hỏi bạn là ai, hãy giới thiệu bản thân thân thiện, ngắn gọn và nêu rõ các tài liệu bạn được huấn luyện (CHRIS Manual, MARPOL, FOSFA, INTERTANKO, Jotun Resistance).
Nguồn dữ liệu tham chiếu (RAG Context): Hãy DỰA TRỰC TIẾP VÀO NỘI DUNG TÀI LIỆU DƯỚI ĐÂY để trả lời.
Quy định trình bày: 
- Trình bày định dạng Markdown chuẩn (dùng danh sách gạch đầu dòng, **in đậm** tiêu đề và số liệu quan trọng).

--- TÀI LIỆU HUẤN LUYỆN DOLPHIN TANKOPS (RAG DATABASE) ---
${context.substring(0, 45000)}
`

    const history = chatHistory
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))

    for (const modelName of modelCandidates) {
      try {
        const model = genAIInstance.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction,
        })

        const chat = model.startChat({
          history: history,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.3,
          }
        })
        const result = await chat.sendMessage(userMessage)
        const response = await result.response
        return response.text()
      } catch (err) {
        console.warn(`Model ${modelName} failed:`, err.message)
        lastError = err
      }
    }

    throw lastError || new Error('Không thể kết nối Gemini API.')
  } catch (error) {
    console.error('Gemini API Error, falling back to Local RAG Engine:', error)
    return searchLocalRagDatabase(userMessage, context)
  }
}

export async function analyzeTestFailures(failedTests, allResults, previousCargo, newCargo) {
  const context = await getRagContext()
  const apiKey = getActiveApiKey()

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

  if (!apiKey) {
    return fallbackDiagnostic
  }

  try {
    const genAIInstance = new GoogleGenerativeAI(apiKey)
    const model = genAIInstance.getGenerativeModel({ model: 'gemini-2.5-flash' })
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
    console.error('Gemini AI Diagnostic Error, using fallback:', error)
    return fallbackDiagnostic
  }
}
