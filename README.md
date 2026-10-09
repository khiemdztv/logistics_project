# Dolphin TankOps

Ứng dụng React/Vite hỗ trợ sinh viên logistics mô phỏng kiểm tra và làm sạch hầm hàng, quản lý nhiều tàu và các ca làm việc tương ứng.

## Đội tàu và ca làm việc

- **Thêm tàu** lưu tên tàu, IMO (7 chữ số), trọng tải DWT, quốc tịch và lớp phủ hầm tùy chọn. Một IMO chỉ có một hồ sơ tàu trong danh sách.
- **Tạo ca mới** mở form đặt tên ca (tùy chọn), chọn tàu đã lưu hoặc thêm tàu mới. Tên ca mặc định gồm tên tàu. Thông tin tàu xuất hiện trên thẻ ca, màn kiểm tra và báo cáo/PDF.
- Menu ba chấm trên thẻ ca có **Sửa tên ca & tàu**. Mỗi ca lưu một bản thông tin tàu riêng; cập nhật hồ sơ để dùng cho ca mới không thay đổi ca cũ. Nhân bản và đặt lại kết quả giữ liên kết tàu.
- **Quản lý tàu → Xóa** bỏ tàu khỏi danh sách chọn ca mới sau khi xác nhận. Ca, báo cáo và ảnh đã lưu vẫn giữ nguyên; thông tin xóa được lưu để tàu không tự xuất hiện lại khi tải trang. Có thể thêm lại tàu thành hồ sơ mới.
- Ca cũ được chuyển sang hồ sơ Dolphin 01 của bản trước, giữ dữ liệu kiểm tra. Quốc tịch trước đây chưa được lưu nên hiển thị “Chưa khai báo”; có thể bổ sung từ form sửa ca.
- Hầm có sẵn là mẫu Dolphin 01. Tàu khác có thể thêm hầm với tên/dung tích riêng; hầm tùy chỉnh được gắn với tàu và được dùng trong báo cáo.

Dữ liệu vẫn lưu trong **localStorage của trình duyệt** (`dolphin_vessels`, `dolphin_sessions`, `dolphin_custom_holds`), chưa đồng bộ giữa nhân viên hoặc thiết bị. Kho tài liệu và ngưỡng kiểm tra vẫn là cấu hình mô phỏng của project, không được tự thay đổi theo thông tin đăng ký tàu.

## Kiểm tra Wall Wash

- Bảng Wall Wash luôn hiện đủ **8 phương pháp** theo tài liệu "thông tin đầu vào web.pptx": Hydrocarbon, Chloride, PTT, Acid Wash Colour, Cảm quan và màu sắc, Mùi, NVM, UV. Cấu hình nằm trong `src/data/wallWashTests.js`.
- Hàng mới quyết định phép thử nào **bắt buộc**, **tùy chọn** hay **không áp dụng** (dòng không áp dụng bị khóa và mờ). Hàng trước có thể bổ sung: dầu thực vật thêm HNO3 cho Chloride và bắt buộc NVM; hydrocarbon thơm bắt buộc Acid Wash Colour; dầu/nhiên liệu bắt buộc Hydrocarbon và Mùi.
- Hydrocarbon, Chloride, Cảm quan, Mùi, UV nhập bằng cách **chọn hiện tượng quan sát**; PTT, Acid Wash Colour, NVM nhập số. Mỗi dòng có nút Hướng dẫn với các bước và cách đọc kết quả.
- Qua bước báo cáo khi mọi phép thử bắt buộc đã có kết quả và các mục đã kiểm tra đủ ảnh, kể cả khi có kết quả **không đạt**. Water White cần đánh giá đủ 7 khu vực. Báo cáo, kết luận và trạng thái ca lấy kết quả thực tế; thiếu dữ liệu không được ghi đạt. Kết quả "đạt (lưu ý)" (ví dụ Hydrocarbon ánh xanh nhạt) vẫn được ghi nhận. Ngưỡng Acid Wash Colour và NVM là ngưỡng tạm vì tài liệu không nêu số, cần nhóm xác nhận.
- **Ảnh bằng chứng**: mỗi khu vực Water White và mỗi phép thử Wall Wash có nút Chụp ảnh (mở camera qua trình duyệt, cần HTTPS hoặc localhost; nếu bị chặn thì mở camera/thư viện của máy) và Tải ảnh lên. Nút Đạt/Không đạt và ô nhập kết quả bị khóa đến khi mục đó có ít nhất 1 ảnh; thiếu ảnh thì không xuất báo cáo được. Ảnh được thu nhỏ (cạnh dài tối đa 1280 px) và lưu trong IndexedDB `dolphin_evidence` của trình duyệt, ca chỉ lưu mã ảnh. Ảnh không còn ca nào dùng tự xóa sau 10 phút. Báo cáo in ảnh theo từng mục. Nút demo tạo ảnh mẫu có chữ "ẢNH MẪU (DEMO)".

## Chạy local

```sh
npm ci
cp .env.example .env.local
# Điền GROQ_API_KEY trong .env.local
npm run dev
```

`npm run dev` phục vụ cả giao diện và `/api/chat`, sử dụng cùng handler với Vercel. `npm run preview` chỉ phục vụ bản build tĩnh; dùng dev hoặc Vercel để kiểm tra API.

## AI trên Vercel

- Đặt `GROQ_API_KEY` trong **Settings → Environment Variables**, chọn **Production** (và Preview nếu cần), rồi redeploy. Không commit API key.
- `GEMINI_API_KEY` là provider dự phòng tùy chọn. Model mặc định: `openai/gpt-oss-120b` / `gemini-3.8-flash`; có thể đổi qua `GROQ_MODEL` / `GEMINI_MODEL`. Nếu model Groq tùy chỉnh trả 404, thử lại với GPT-OSS 120B. Llama 3.3 cũ đã ngừng phục vụ Free/Developer từ 16/8/2026 theo [thông báo Groq](https://console.groq.com/docs/deprecations).
- Biến `VITE_GROQ_API_KEY` / `VITE_GEMINI_API_KEY` cũ vẫn được backend đọc để giữ tương thích. Nên chuyển sang tên không có `VITE_`; frontend không đọc khóa triển khai và không gọi provider trực tiếp.
- `vercel.json` đóng gói `public/rag_context.txt` và `public/rag_reference.json` vào function. Chọn root directory là thư mục chứa `package.json` này.

Chat trả `{ reply, model, mode, sources }`; chẩn đoán trả `{ title, causes, solutions, model, mode, sources }`. Lỗi phân biệt `NO_API_KEY` (503), `KNOWLEDGE_UNAVAILABLE` (503), `RATE_LIMITED` (429), `AI_AUTH_FAILED` (503), `AI_CONTEXT_TOO_LARGE` (502) và `AI_UNAVAILABLE` (502). Chỉ trả tên provider/mã HTTP, không trả lỗi thô có thể chứa key hoặc dữ liệu yêu cầu. Nếu provider lỗi, giao diện hiển thị nguyên nhân và nội dung tra cứu cục bộ với `mode: local`, không gắn nhãn Groq.

## Kho tài liệu và truy xuất

`lib/copilot.js` chia tài liệu thành đoạn có nguồn/mục, xếp hạng BM25 với chuẩn hóa tiếng Việt không dấu và từ đồng nghĩa chuyên ngành. Mỗi câu hỏi lấy tối đa 5 đoạn trong ngân sách 6.500 ký tự; giữ lịch sử có giới hạn, dùng câu trước cho câu hỏi tiếp và chỉ gửi dữ liệu phiên cần thiết. Danh sách 8 phép thử, bộ phép thử theo hàng và cách chấm đạt/rớt được lấy trực tiếp từ `src/data/wallWashTests.js` để tránh mâu thuẫn với màn hình.

Nguồn gồm cấu hình/chức năng ứng dụng, bản tổng hợp `rag_context.txt` và các mục trích từ TXT/DOCX gốc trong `rag_reference.json`. Tệp tham chiếu được commit để deployment không phụ thuộc thư mục tài liệu ngoài repo. Cập nhật từ thư mục `../training AI`:

```sh
npm run rag:extract
# Hoặc dùng một thư mục tài liệu khác:
npm run rag:extract -- "D:/path/to/training AI"
```

Script này xử lý TXT/DOCX, **chưa đưa các PDF gốc vào index**. `scripts/generate_master_rag.mjs` là bản tổng hợp cũ của project; không coi tên tiêu chuẩn nhắc trong đó là bằng chứng đã đọc toàn bộ tài liệu gốc. Các nguồn có thể khác nhau về ngưỡng; prompt phân biệt cấu hình mô phỏng với specification/SOP thực tế, không tự kết luận mọi lô methanol cần cùng một bộ test.

## Kiểm tra

```sh
npm test
npm run build
npm run lint
```

Các regression test kiểm tra câu methanol, tiếng Việt không dấu, câu hỏi tiếp, truy xuất phần cuối tài liệu, loại câu hỏi bị gửi lặp, ngữ cảnh phiên, chẩn đoán JSON, lỗi/quota provider, Gemini fallback và nhãn tra cứu cục bộ. Test dùng provider giả lập; kiểm tra phản hồi LLM thực tế cần API key hoạt động.

Tham khảo triển khai: [Groq Chat Completions](https://console.groq.com/docs/text-chat), [đóng gói tài liệu vào Vercel Functions](https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions).
