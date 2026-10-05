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

// Smart Local RAG Search Engine
function searchLocalRagDatabase(query, rawContext) {
  const q = query.toLowerCase().trim()

  // 1. Web Explanation & Features
  if (
    q.includes('chưa hiểu gì về web') ||
    q.includes('giải thích web') ||
    q.includes('web này làm gì') ||
    q.includes('chức năng của web') ||
    q.includes('hướng dẫn sử dụng') ||
    q.includes('tính năng')
  ) {
    return `**HỆ THỐNG QUẢN LÝ & GIÁM ĐỊNH LÀM SẠCH HẦM HÀNG DOLPHIN TANKOPS**

Website được thiết kế chuyên biệt cho Sĩ quan tàu **Dolphin 01 (34,000 DWT, Bọc sơn Pure Epoxy)** nhằm tối ưu hóa quy trình rửa hầm, rút ngắn thời gian sẵn sàng trao NOR (Notice of Readiness) và ngăn ngừa rủi ro ô nhiễm chéo hàng hóa.

**Quy trình 3 Bước Cốt lõi:**
1. **Bước 1: Khởi tạo & Phân tích Tương thích (Step 1)**
   - Nhập thông tin: Lô hàng cũ vừa dỡ, lô hàng mới sắp nhận, số hầm hàng, hải trình.
   - Hệ thống tự động:
     • Đối chiếu danh mục cấm **FOSFA Banned Immediate Previous Cargoes** (Luật cấm 3 chuyến trước khi chở dầu thực vật).
     • Kiểm tra khả năng tương thích lớp bọc Pure Epoxy.
     • Đề xuất phương pháp kiểm tra: **Wall Wash Standard** (hàng tinh khiết/dung môi) hoặc **Water White Standard** (dầu thô/DPP).
     • Xuất quy trình rửa hầm tiêu chuẩn 5–7 bước chi tiết.

2. **Bước 2: Thực hiện Kiểm tra & Số hóa Bằng chứng (Step 2)**
   - **Nhánh Water White (Cảm quan):** Checklist số hóa 7 khu vực hầm (Trần hầm, vách mũi/lái/mạn, đáy hầm, giếng thu) theo 4 tiêu chí *Sạch – Khô – Không mùi – Không gỉ sắt*, kèm chức năng tải ảnh chụp bằng chứng.
   - **Nhánh Wall Wash (Định lượng hóa chất):** Nhập 5 chỉ số test phòng thí nghiệm (*Clorua <= 2 ppm, PTT >= 50 min, APHA <= 20, Hydrocarbon <= 35 ppm, NVM*). Nếu có chỉ số không đạt, AI tự động chẩn đoán nguyên nhân và hướng dẫn quy trình rửa lại.

3. **Bước 3: Tổng hợp Báo cáo & Nghiệm thu (Step 3)**
   - Đóng gói toàn bộ nhật ký kiểm tra, số liệu hóa nghiệm, ảnh chụp bằng chứng, chữ ký sĩ quan.
   - Xuất **Chứng chỉ Vệ sinh Hầm hàng (Cargo Hold Cleanliness Certificate)** chuẩn **INTERTANKO** phục vụ nghiệm thu với Giám định viên độc lập (Surveyor).`
  }

  // 2. Theory of Tank Cleaning ("lý thuyết về việc dọn hầm", "nguyên lý làm sạch")
  if (
    q.includes('lý thuyết về việc dọn hầm') ||
    q.includes('lý thuyết dọn hầm') ||
    q.includes('nguyên lý làm sạch') ||
    q.includes('tại sao phải làm sạch') ||
    q.includes('mục đích làm sạch')
  ) {
    return `**LÝ THUYẾT VÀ NGUYÊN LÝ LÀM SẠCH HẦM HÀNG TÀU DẦU / HÓA CHẤT (TANK CLEANING THEORY)**

**1. Mục đích Cốt lõi:**
- **Ngăn ngừa nhiễm bẩn chéo (Cross-Contamination):** Một lượng tạp chất siêu vi lượng (vài ppm Hydrocarbon hoặc Clorua) từ hàng cũ có thể làm hỏng toàn bộ lô hàng hóa chất tinh khiết trị giá hàng triệu USD.
- **Tuân thủ Công ước Quốc tế:** MARPOL Annex II (bảo vệ môi trường biển) và FOSFA (an toàn thực phẩm).
- **Đạt chứng nhận nghiệm thu:** Đạt chứng chỉ độ sạch từ Giám định viên (Cargo Surveyor) để đủ điều kiện trao thông báo sẵn sàng làm hàng (NOR).

**2. Cơ chế Hóa học & Vật lý trong Rửa Hầm:**
- **Cơ chế Nhũ hóa (Emulsification):** Dùng chất tẩy rửa gốc dầu mỏ (*Unitor Seaclean Plus, Marclean HCR*) để phân tán các phân tử dầu nặng, sáp paraffin không tan trong nước thành các hạt micelle lơ lửng dễ bị xối trôi.
- **Cơ chế Xà phòng hóa (Saponification):** Dùng chất tẩy tính Kiềm mạnh (*Unitor Alkaclean / Careclean Alkaline*) ở 75–85°C phản ứng với axit béo trong Dầu thực vật (CPO) tạo thành xà phòng tan hoàn toàn trong nước.
- **Cơ chế Tách ẩm & Bay hơi (Desorption & Evaporation):** Đối với lớp sơn Pure Epoxy bị ngậm dung môi hữu cơ (Benzene, Toluene), dùng phương pháp xông hơi (Steaming) hoặc thổi khí khô nóng cưỡng bức để kéo dung môi từ sâu trong màng sơn ra bề mặt.
- **Cơ chế Khử mặn (De-salination):** Rửa tráng áp lực cao bằng Nước khử khoáng (**DI Water**) sau khi rửa nước biển để triệt tiêu hoàn toàn ion Clorua (\`Cl-\`).

**3. Các Tiêu chuẩn Kiểm định Độ sạch:**
- **Water White Standard:** Đạt tiêu chuẩn cảm quan bằng mắt và khứu giác (*Sạch – Khô – Không mùi – Không dị vật*).
- **Wall Wash Standard:** Đạt 5 chỉ tiêu hóa nghiệm định lượng (*Clorua < 2 ppm, PTT > 50 min, Hydrocarbon không đục, APHA < 20, NVM < 10 ppm*).`
  }

  // 3. Conversational / Identity Queries
  if (
    q === '?' ||
    q === 'hi' ||
    q === 'hello' ||
    q === 'alo' ||
    q.includes('mày là ai') ||
    q.includes('bạn là ai') ||
    q.includes('ai là bạn') ||
    q.includes('giới thiệu')
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
1. Hướng dẫn toàn diện về **Tính năng và Quy trình của Website Dolphin TankOps**.
2. Giải thích **Lý thuyết làm sạch hầm hàng** và cơ chế phản ứng hóa chất.
3. Tra cứu **Ma trận tương thích hàng hóa FOSFA & MARPOL**.
4. Hướng dẫn quy trình rửa hầm từng loại hàng (CPO, Methanol, Jet A-1, Dầu thô).
5. Chẩn đoán và xử lý khi rớt chỉ số test (PTT, Clorua, Hydrocarbon, APHA).`
  }

  // 4. Definition & Concept Queries ("khái niệm", "là gì", "định nghĩa")
  if (q.includes('khái niệm') || q.includes('là gì') || q.includes('định nghĩa') || q.includes('ý nghĩa')) {
    if (q.includes('wall wash') || q.includes('wwt')) {
      return `**Khái niệm Tiêu chuẩn Wall Wash Standard (WWT):**
• **Định nghĩa:** Là phương pháp kiểm tra độ sạch hóa học định lượng nghiêm ngặt nhất trên tàu chở hóa chất. Sĩ quan sẽ dùng dung môi tinh khiết phòng thí nghiệm (*Methanol* hoặc *Acetone*) phun quét lên vách hầm và hứng dịch chảy xuống để làm các xét nghiệm hóa lý.
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

  // 5. CPO / Dầu thực vật
  if (q.includes('cpo') || q.includes('dầu cọ') || q.includes('dầu thực vật')) {
    return `**Quy trình chuẩn rửa hầm sau khi dỡ Dầu Cọ (CPO) / Dầu Thực Vật:**
• **Bước 1 (Xả trôi lạnh):** Rửa xả trôi bằng **NƯỚC BIỂN MÁT (< 40°C)** ngay sau khi dỡ hàng.
  ⚠️ *CẢNH BÁO: Tuyệt đối KHÔNG dùng nước nóng ở bước này vì nhiệt độ cao sẽ làm dầu béo bị nướng chín và keo dính vĩnh viễn vào vách sơn Epoxy!*
• **Bước 2 (Xà phòng hóa kiềm nóng):** Rửa tuần hoàn dung dịch Kiềm mạnh (**Unitor Alkaclean** / **Careclean Alkaline 2–3%**) pha nước nóng 75–85°C trong 2–3 giờ.
• **Bước 3 (Tráng ngọt & khử ion):** Tráng lại nước ngọt nóng (70°C), sau đó xả tráng lần cuối bằng Nước khử khoáng (**DI Water**).
• **Bước 4 (Sấy khô & Thử WWT):** Sấy khô cưỡng bức bằng khí sạch không dầu. Lấy mẫu test PTT, FFA và Hydrocarbon.`
  }

  // 6. PTT Failures
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

  // 7. Clorua / Chloride / Nitrile
  if (q.includes('clorua') || q.includes('độ mặn') || q.includes('muối') || q.includes('chloride') || q.includes('nitrile') || q.includes('agno3')) {
    return `**Tiêu chuẩn kiểm tra Clorua & Lưu ý An toàn thao tác:**
• **Nguyên lý:** Nhỏ 2 giọt Axit Nitric (HNO3) để triệt tiêu cặn carbonat gây đục giả, sau đó nhỏ 5 giọt dung dịch Bạc Nitrat (AgNO3 10%). Phản ứng tạo kết tủa trắng bạc Clorua: \`Ag+ + Cl- -> AgCl\`.
• **Ngưỡng đạt:** Nồng độ Clorua <= **2.0 ppm**.
• **Yếu tố con người (Human Factor Constraint):** Bắt buộc sĩ quan phải đeo **găng tay Nitrile sạch không bột** khi cầm phễu và chai mẫu. Tuyệt đối không để da tay chạm vào mẫu vì muối trong mồ hôi tay sẽ gây lỗi nhiễm mặn giả lập!`
  }

  return `**Dolphin Maritime Copilot (Cơ sở dữ liệu Hàng hải Tàu Dolphin 01):**

Dựa trên tài liệu huấn luyện chuyên ngành tàu hóa chất Dolphin 01 (Pure Epoxy, 34,000 DWT):

• **Tài liệu tham chiếu:** *CHRIS Manual, MARPOL Annex II (MEPC.2-Circ.29/31), FOSFA Banned Lists, INTERTANKO Standards, Jotun Resistance Guide*.
• **Giải đáp cho câu hỏi "${query}":**
  - Để tra cứu **Quy trình làm sạch:** Bạn có thể hỏi về các loại hàng như *CPO*, *Methanol*, *Jet A-1*, *Dầu thô*, *Styrene Monomer*.
  - Để tra cứu **Tiêu chuẩn kiểm tra:** Bạn có thể hỏi về *Wall Wash Test*, *Water White*, *Chỉ số PTT*, *Phép thử Clorua*, *Độ màu APHA*.
  - Để tìm hiểu **Tính năng Website:** Bạn có thể hỏi *"giải thích web"*, *"hướng dẫn sử dụng web"*, hoặc *"lý thuyết dọn hầm"*!`
}

// Unified chat function: Calls serverless /api/chat first, then client Gemini, then local RAG
export async function chatWithCopilot(userMessage, chatHistory) {
  const customApiKey = getActiveApiKey()

  // 1. Try serverless backend (/api/chat) on Vercel
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage,
        chatHistory,
        customApiKey
      })
    })

    if (res.ok) {
      const data = await res.json()
      if (data && data.reply) {
        return data.reply
      }
    }
  } catch (err) {
    console.warn('Serverless /api/chat not available, trying client-side AI...', err)
  }

  // 2. Try client-side Gemini if API Key is configured in localStorage or Vite env
  if (customApiKey) {
    try {
      const context = await getRagContext()
      const genAIInstance = new GoogleGenerativeAI(customApiKey)
      const model = genAIInstance.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: `Bạn là Dolphin Maritime Copilot - Chuyên gia Cố vấn AI Hàng hải cho Tàu Dolphin 01.
Nhiệm vụ: Trả lời thông minh, thân thiện mọi câu hỏi về tính năng web Dolphin TankOps, lý thuyết làm sạch hầm hàng, tiêu chuẩn kiểm tra Wall Wash/Water White, quy chuẩn MARPOL, FOSFA và an toàn hóa chất.
Nguồn dữ liệu tham chiếu:
${context.substring(0, 45000)}
`
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
      return response.text()
    } catch (clientErr) {
      console.error('Client-side Gemini call failed:', clientErr)
    }
  }

  // 3. Fallback to Smart Local Semantic RAG Search Engine
  const context = await getRagContext()
  return searchLocalRagDatabase(userMessage, context)
}

export async function analyzeTestFailures(failedTests, allResults, previousCargo, newCargo) {
  const customApiKey = getActiveApiKey()

  // Try serverless API first
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isDiagnostic: true,
        diagnosticData: { failedTests, allResults, previousCargo, newCargo },
        customApiKey
      })
    })

    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    console.warn('Serverless diagnostic failed, using fallback:', e)
  }

  // Fallback diagnostic
  return {
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
}
