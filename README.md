# Dolphin TankOps

Ứng dụng React/Vite hỗ trợ sinh viên logistics mô phỏng kiểm tra và làm sạch hầm hàng Dolphin 01.

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
- `GEMINI_API_KEY` là provider dự phòng tùy chọn. Model mặc định: `llama-3.3-70b-versatile` / `gemini-2.5-flash`; có thể đổi qua `GROQ_MODEL` / `GEMINI_MODEL`.
- Biến `VITE_GROQ_API_KEY` / `VITE_GEMINI_API_KEY` cũ vẫn được backend đọc để giữ tương thích. Nên chuyển sang tên không có `VITE_`; frontend không đọc khóa triển khai và không gọi provider trực tiếp.
- `vercel.json` đóng gói `public/rag_context.txt` và `public/rag_reference.json` vào function. Chọn root directory là thư mục chứa `package.json` này.

Chat trả `{ reply, model, mode, sources }`; chẩn đoán trả `{ title, causes, solutions, model, mode, sources }`. Lỗi phân biệt `NO_API_KEY` (503), `KNOWLEDGE_UNAVAILABLE` (503), `RATE_LIMITED` (429) và `AI_UNAVAILABLE` (502). Nếu provider lỗi, giao diện hiển thị nguyên nhân và nội dung tra cứu cục bộ với `mode: local`, không gắn nhãn Groq.

## Kho tài liệu và truy xuất

`lib/copilot.js` chia tài liệu thành đoạn có nguồn/mục, xếp hạng BM25 với chuẩn hóa tiếng Việt không dấu và từ đồng nghĩa chuyên ngành. Mỗi câu hỏi lấy tối đa 5 đoạn trong ngân sách 6.500 ký tự; giữ lịch sử có giới hạn, dùng câu trước cho câu hỏi tiếp và chỉ gửi dữ liệu phiên cần thiết. Các ngưỡng đánh giá web được lấy trực tiếp từ `WALL_WASH_THRESHOLDS` để tránh mâu thuẫn với màn hình.

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
