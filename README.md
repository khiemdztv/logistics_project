# Dolphin TankOps

Ứng dụng web hỗ trợ mô phỏng quy trình kiểm tra và làm sạch hầm hàng tàu chở dầu và hóa chất. Dự án hướng tới sinh viên logistics và sĩ quan vận hành: quản lý đội tàu, thực hiện kiểm tra theo hai tiêu chuẩn Wall Wash và Water White, thu thập ảnh bằng chứng, xuất biên bản kiểm tra và tra cứu tài liệu chuyên ngành qua trợ lý AI.

Xây dựng bằng React 19 và Vite 8, chạy hoàn toàn trong trình duyệt, có một hàm serverless duy nhất cho phần AI.

## Mục lục

- [1. Tính năng chính](#1-tính-năng-chính)
- [2. Kiến trúc](#2-kiến-trúc)
- [3. Sơ đồ luồng hoạt động](#3-sơ-đồ-luồng-hoạt-động)
- [4. Cài đặt và chạy local](#4-cài-đặt-và-chạy-local)
- [5. Triển khai trên Vercel](#5-triển-khai-trên-vercel)
- [6. Cấu hình AI](#6-cấu-hình-ai)
- [7. Kho tài liệu và truy xuất](#7-kho-tài-liệu-và-truy-xuất)
- [8. Kiểm thử và chất lượng mã](#8-kiểm-thử-và-chất-lượng-mã)
- [9. Cấu trúc thư mục](#9-cấu-trúc-thư-mục)
- [10. Giới hạn đã biết](#10-giới-hạn-đã-biết)
- [11. Tài liệu tham khảo](#11-tài-liệu-tham-khảo)

## 1. Tính năng chính

### 1.1 Đội tàu và ca làm việc

- Thêm tàu với tên, số IMO (7 chữ số), trọng tải DWT, quốc tịch và lớp phủ hầm tùy chọn. Mỗi IMO tương ứng một hồ sơ tàu.
- Tạo ca làm việc với tên tùy chọn, chọn tàu đã lưu hoặc thêm tàu mới. Tên ca mặc định gồm tên tàu.
- Mỗi ca lưu một bản thông tin tàu riêng. Sửa hồ sơ tàu cho ca mới không làm thay đổi các ca đã tạo.
- Menu trên thẻ ca cho phép sửa tên ca và thông tin tàu, nhân bản ca, đặt lại dữ liệu và xóa ca.
- Xóa tàu khỏi danh sách chỉ ảnh hưởng tới việc chọn tàu cho ca mới. Ca, báo cáo và ảnh đã lưu vẫn giữ nguyên thông tin tàu.
- Hầm có sẵn là mẫu Dolphin 01. Tàu khác có thể thêm hầm với tên và dung tích riêng; hầm tùy chỉnh gắn với tàu và xuất hiện trong báo cáo.
- Dashboard có lọc theo trạng thái và theo tàu, tìm kiếm theo tên ca, tên tàu, IMO, hầm, hàng hóa và hải trình.

Trạng thái ca gồm Đang thực hiện, Đạt và Chưa đạt, được tính lại từ kết quả kiểm tra thực tế mỗi lần tải trang.

### 1.2 Kiểm tra Wall Wash

- Bảng kiểm tra luôn hiển thị đủ **8 phương pháp** theo tài liệu đầu vào: Hydrocarbon, Chloride, PTT, Acid Wash Colour, Cảm quan và màu sắc, Mùi, NVM, UV. Cấu hình nằm trong `src/data/wallWashTests.js`.
- Hàng mới quyết định mỗi phép thử là **bắt buộc**, **tùy chọn** hay **không áp dụng**. Dòng không áp dụng bị khóa và hiển thị lý do.
- Hàng trước có thể bổ sung yêu cầu: dầu thực vật thêm HNO3 cho Chloride và bắt buộc NVM; hydrocarbon thơm bắt buộc Acid Wash Colour; dầu hoặc nhiên liệu bắt buộc Hydrocarbon và Mùi.
- Hydrocarbon, Chloride, Cảm quan, Mùi và UV nhập bằng cách chọn hiện tượng quan sát. PTT, Acid Wash Colour và NVM nhập số đo.
- Mỗi phép thử có nút Hướng dẫn hiển thị mục đích, dụng cụ và thuốc thử, các bước thực hiện, cách đọc kết quả và cảnh báo an toàn.
- Bộ kết quả mẫu giúp thử nhanh luồng đạt và các tình huống không đạt.

### 1.3 Kiểm tra Water White

- Checklist 7 khu vực kết cấu hầm: trần, vách mũi, vách lái, mạn trái, mạn phải, đáy và hệ thống đường ống.
- Tiêu chí đánh giá: sạch bề mặt, khô ráo, không mùi, không dị vật.
- Thẻ tổng hợp hiển thị số khu vực đạt, không đạt và chưa kiểm tra, kèm danh sách vị trí cần làm sạch lại.

### 1.4 Ảnh bằng chứng

- Mỗi khu vực Water White và mỗi phép thử Wall Wash đều có nút Chụp ảnh và Tải ảnh lên. Camera mở trực tiếp trong trình duyệt và cần HTTPS hoặc localhost; nếu bị chặn, ứng dụng chuyển sang camera hoặc thư viện ảnh của thiết bị.
- Nút Đạt, Không đạt và ô nhập kết quả bị khóa cho đến khi mục đó có ít nhất một ảnh. Thiếu ảnh thì không xuất được báo cáo.
- Ảnh được thu nhỏ với cạnh dài tối đa 1280 px và lưu trong IndexedDB `dolphin_evidence`. Ca chỉ lưu mã ảnh, không lưu dữ liệu ảnh.
- Ảnh không còn ca nào tham chiếu sẽ tự động được xóa sau 10 phút.
- Nút demo tạo ảnh mẫu có ghi rõ "ẢNH MẪU (DEMO)".

### 1.5 Báo cáo

- Biên bản kiểm tra dạng bản in, có thể xuất PDF bằng chức năng in của trình duyệt.
- Nội dung gồm thông tin tàu và chuyến đi, bảng kết quả từng phép thử hoặc từng khu vực, ảnh bằng chứng theo từng mục, kết luận đạt hoặc không đạt và khối chữ ký.
- Kết luận, trạng thái ca và nội dung báo cáo đều lấy từ một hàm duy nhất `getInspectionOutcome()`, nên không có trường hợp thiếu dữ liệu mà vẫn ghi đạt.
- Nhật ký thao tác ghi lại các mốc thời gian và hành động trong suốt ca kiểm tra.

### 1.6 Dolphin Copilot

- Trợ lý hỏi đáp chạy trong khung chat, trả lời về hàng hóa, phương pháp kiểm tra, cách đọc kết quả và cách sử dụng ứng dụng.
- Trả lời dựa trên kho tài liệu của dự án, có trích dẫn nguồn cho từng đoạn được dùng.
- Khi có phép thử không đạt, hệ thống tự động phân tích và đề xuất hướng kiểm chứng và làm sạch lại.
- Nếu nhà cung cấp AI lỗi hoặc quá thời gian chờ, ứng dụng chuyển sang tra cứu tài liệu cục bộ và ghi rõ nội dung không đến từ AI.

## 2. Kiến trúc

![Kiến trúc tổng thể](docs/workflows/01-kien-truc-tong-the.png)

Ứng dụng gồm ba phần:

- **Giao diện React** chạy trong trình duyệt. Toàn bộ trạng thái nằm trong một `useReducer` duy nhất tại `src/context/appState.js`, được chia sẻ qua Context.
- **Lưu trữ phía trình duyệt.** Metadata của ca và đội tàu nằm trong `localStorage`; ảnh bằng chứng nằm trong IndexedDB để tránh giới hạn dung lượng khoảng 5 MB của `localStorage`.
- **Hàm serverless `api/chat.js`** xử lý phần AI. Hàm này cũng được nạp như middleware của Vite trong lúc phát triển, nên môi trường local và môi trường triển khai dùng chung một đoạn mã.

Ứng dụng không dùng router. Điều hướng hoàn toàn dựa trên `state.currentView` và `state.currentStep`.

### Dòng dữ liệu chính

| Bước | Đầu vào | Xử lý | Đầu ra |
|---|---|---|---|
| Khởi tạo ca | Hàng trước, hàng mới, hầm, lớp phủ | `checkCompatibility()` đối chiếu danh mục FOSFA và ma trận tương thích | Phương pháp kiểm tra và các lưu ý kỹ thuật |
| Lập kế hoạch phép thử | Hàng mới và hàng trước | `getTestPlan()` sinh 8 dòng theo mức bắt buộc, tùy chọn, không áp dụng | Kế hoạch phép thử kèm ngưỡng đạt |
| Nhập kết quả | Ảnh bằng chứng và giá trị đo | `evaluateWallWashTest()` chấm từng phép thử | Trạng thái đạt, đạt kèm lưu ý, không đạt hoặc chưa nhập |
| Tổng hợp | Kết quả và ảnh của cả ca | `getInspectionOutcome()` kiểm tra điều kiện xuất báo cáo | Kết luận đạt, không đạt hoặc chưa đủ dữ liệu |
| Tra cứu AI | Câu hỏi và ngữ cảnh ca | Truy xuất BM25 rồi gọi nhà cung cấp AI | Câu trả lời kèm danh sách nguồn |

## 3. Sơ đồ luồng hoạt động

Tài liệu [WORKFLOWS.md](WORKFLOWS.md) trình bày 11 sơ đồ của hệ thống: kiến trúc tổng thể, vòng đời ca làm việc, luồng nghiệp vụ ba bước, hai nhánh kiểm tra, luồng bằng chứng ảnh, luồng AI Copilot và RAG, pipeline xây kho tài liệu, quản lý đội tàu, bản đồ action của reducer và luồng kiểm thử.

Mỗi mục trong tài liệu gồm ảnh đã render sẵn trong `docs/workflows/` và mã Mermaid gốc. Render lại toàn bộ sơ đồ sau khi chỉnh sửa:

```sh
# Cài renderer một lần. Không tải Chromium, dùng Chrome hoặc Edge có sẵn trên máy.
npm install --no-save --no-audit --no-fund @mermaid-js/mermaid-cli@11

npm run docs:diagrams        # chỉ xuất SVG
npm run docs:diagrams:png    # xuất cả SVG và PNG dùng cho ảnh nhúng
```

## 4. Cài đặt và chạy local

Yêu cầu Node.js 20.19 trở lên hoặc 22.12 trở lên.

```sh
npm ci
cp .env.example .env.local
# Điền GROQ_API_KEY trong .env.local
npm run dev
```

`npm run dev` phục vụ cả giao diện và API `/api/chat`. `npm run preview` chỉ phục vụ bản build tĩnh, không có API.

### Câu lệnh khác

| Câu lệnh | Tác dụng |
|---|---|
| `npm run build` | Build bản production vào `dist/` |
| `npm run preview` | Xem trước bản build tĩnh |
| `npm test` | Chạy toàn bộ regression test |
| `npm run lint` | Kiểm tra mã bằng oxlint |
| `npm run rag:extract` | Cập nhật kho tài liệu từ thư mục `../training AI` |
| `npm run docs:diagrams` | Render sơ đồ trong `WORKFLOWS.md` thành SVG |

## 5. Triển khai trên Vercel

1. Chọn root directory là thư mục chứa `package.json` của dự án.
2. Vào **Settings**, mục **Environment Variables**, thêm `GROQ_API_KEY` cho môi trường **Production** và **Preview** nếu cần.
3. Redeploy để biến môi trường có hiệu lực.

`vercel.json` đóng gói `public/rag_context.txt` và `public/rag_reference.json` vào hàm serverless và đặt thời gian chạy tối đa 60 giây.

Không commit API key vào mã nguồn.

## 6. Cấu hình AI

### Biến môi trường

| Biến | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|
| `GROQ_API_KEY` | Có, nếu không dùng Gemini | | Khóa Groq, chỉ đặt trên server |
| `GEMINI_API_KEY` | Không | | Nhà cung cấp dự phòng |
| `GROQ_MODEL` | Không | `openai/gpt-oss-120b` | Nếu model trả lỗi 404, hệ thống tự thử lại với model mặc định |
| `GEMINI_MODEL` | Không | `gemini-3.8-flash` | |

Các biến cũ `VITE_GROQ_API_KEY` và `VITE_GEMINI_API_KEY` vẫn được backend đọc để tương thích, nhưng nên chuyển sang tên không có tiền tố `VITE_`. Mã frontend không đọc khóa triển khai và không gọi trực tiếp nhà cung cấp AI.

### Giao diện API

Yêu cầu gửi tới `POST /api/chat`:

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `userMessage` | chuỗi | Từ 1 đến 4000 ký tự |
| `chatHistory` | mảng | Tùy chọn, tối đa 12 lượt gần nhất |
| `appContext` | đối tượng | Tùy chọn, được lọc trước khi gửi |
| `isDiagnostic` | boolean | Đặt `true` để yêu cầu phân tích kết quả không đạt |
| `diagnosticData` | đối tượng | Bắt buộc khi `isDiagnostic` là `true` |
| `customApiKey` | chuỗi | Tùy chọn, người dùng tự nhập và chỉ gửi tới server của dự án |

Phản hồi chat: `{ reply, model, mode, sources }`. Phản hồi chẩn đoán: `{ title, causes, solutions, model, mode, sources }`.

### Mã lỗi

| Mã HTTP | `error` | Ý nghĩa |
|---|---|---|
| 400 | `INVALID_REQUEST` | Nội dung yêu cầu sai định dạng |
| 405 | `METHOD_NOT_ALLOWED` | Không phải POST hoặc OPTIONS |
| 413 | `REQUEST_TOO_LARGE` | Vượt 32 KB, chỉ gặp ở middleware Vite |
| 429 | `RATE_LIMITED` | Nhà cung cấp hết hạn mức |
| 502 | `AI_CONTEXT_TOO_LARGE` | Yêu cầu vượt giới hạn ngữ cảnh |
| 502 | `AI_UNAVAILABLE` | Không nhận được phản hồi từ nhà cung cấp |
| 503 | `NO_API_KEY` | Chưa cấu hình khóa API |
| 503 | `KNOWLEDGE_UNAVAILABLE` | Chưa tải được kho tài liệu |
| 503 | `AI_AUTH_FAILED` | Nhà cung cấp từ chối khóa hoặc quyền dùng model |
| 503 | `AI_MODEL_UNAVAILABLE` | Model không khả dụng với tài khoản hiện tại |

Phản hồi lỗi chỉ chứa tên nhà cung cấp và mã trạng thái, không trả về lỗi thô có thể lộ khóa API hoặc dữ liệu yêu cầu.

## 7. Kho tài liệu và truy xuất

`lib/copilot.js` chia tài liệu thành các đoạn có nguồn và mục, sau đó xếp hạng bằng BM25 với chuẩn hóa tiếng Việt không dấu và từ điển đồng nghĩa chuyên ngành. Mỗi câu hỏi lấy tối đa 5 đoạn trong ngân sách 6500 ký tự. Lịch sử hội thoại được giới hạn, câu hỏi tiếp nối dùng ngữ cảnh của câu trước, và chỉ dữ liệu ca cần thiết được gửi lên server.

Danh sách 8 phép thử, bộ phép thử theo nhóm hàng và cách chấm đạt hoặc không đạt được lấy trực tiếp từ `src/data/wallWashTests.js`, dùng chung với giao diện. Nhờ vậy nội dung trợ lý trả lời không mâu thuẫn với những gì hiển thị trên màn hình.

Nguồn tài liệu gồm ba phần:

- Mô tả cấu hình và chức năng hiện tại của ứng dụng, sinh tự động từ mã nguồn.
- Bản tổng hợp `public/rag_context.txt`.
- Các mục trích từ tài liệu TXT và DOCX gốc trong `public/rag_reference.json`.

Cập nhật kho tài liệu từ thư mục `../training AI`:

```sh
npm run rag:extract
# Hoặc trỏ tới thư mục tài liệu khác:
npm run rag:extract -- "D:/path/to/training AI"
```

Script này xử lý TXT và DOCX, chưa đưa các PDF gốc vào chỉ mục. `scripts/generate_master_rag.mjs` là bản tổng hợp viết tay của giai đoạn trước; tên tiêu chuẩn được nhắc trong đó không phải bằng chứng đã đọc toàn bộ tài liệu gốc.

Các nguồn có thể khác nhau về ngưỡng. Prompt của hệ thống phân biệt rõ cấu hình mô phỏng của dự án với specification và SOP thực tế, và không kết luận mọi lô methanol đều cần cùng một bộ phép thử.

## 8. Kiểm thử và chất lượng mã

```sh
npm test
npm run build
npm run lint
```

Bộ test hiện có 52 ca, dùng nhà cung cấp AI giả lập nên không cần API key:

| Tệp | Phạm vi kiểm tra |
|---|---|
| `tests/wall-wash.test.mjs` | Danh mục 8 phương pháp, kế hoạch phép thử theo hàng, cách chấm điểm |
| `tests/inspection-outcome.test.mjs` | Điều kiện xuất báo cáo, trường hợp không đạt, chặn khi thiếu dữ liệu |
| `tests/evidence.test.mjs` | Bản ghi ảnh, reducer, đặt lại theo từng phương pháp |
| `tests/fleet.test.mjs` | Đội tàu, ca làm việc, migration dữ liệu cũ, hầm tùy chỉnh |
| `tests/copilot.test.mjs` | Truy xuất, tiếng Việt không dấu, câu hỏi tiếp nối, prompt |
| `tests/chat-api.test.mjs` | Handler API, mã lỗi, chuyển đổi nhà cung cấp |
| `tests/ai-service.test.mjs` | Chuyển sang tra cứu cục bộ, metadata nhà cung cấp |

Kiểm tra phản hồi của mô hình thật cần API key hoạt động.

## 9. Cấu trúc thư mục

```
dolphin-tankops/
├── api/
│   └── chat.js                 Hàm serverless xử lý chat và chẩn đoán
├── docs/workflows/             Ảnh sơ đồ đã render và index.json
├── lib/
│   └── copilot.js              Chỉ mục tri thức, truy xuất BM25, dựng prompt
├── public/
│   ├── rag_context.txt         Bản tổng hợp tài liệu
│   ├── rag_reference.json      Trích đoạn từ tài liệu gốc
│   └── favicon.svg, icons.svg
├── scripts/
│   ├── extract_rag_references.mjs      Cập nhật rag_reference.json
│   ├── extract_training_data.mjs       Trích xuất TXT, DOCX, PDF, PPTX
│   ├── generate_master_rag.mjs         Bản tổng hợp cũ
│   └── render_workflow_diagrams.mjs    Render sơ đồ Mermaid
├── src/
│   ├── components/             Giao diện: Dashboard, các bước kiểm tra, báo cáo, chat
│   ├── context/                Reducer và Context của ứng dụng
│   ├── data/                   Hàng hóa, tàu, phép thử, bằng chứng, kết luận
│   ├── services/               Gọi AI, lưu ảnh, tạo ảnh demo
│   └── App.jsx, main.jsx
├── tests/                      7 tệp regression test
├── WORKFLOWS.md                11 sơ đồ luồng hoạt động
├── package.json
└── vercel.json
```

Các điểm vào chính:

| Tệp | Vai trò |
|---|---|
| `src/context/appState.js` | Toàn bộ logic nghiệp vụ của ca làm việc và đội tàu |
| `src/data/wallWashTests.js` | Danh mục 8 phép thử, bộ phép thử theo hàng, cách chấm điểm |
| `src/data/inspectionOutcome.js` | Cổng gác duy nhất cho việc xuất báo cáo và trạng thái ca |
| `lib/copilot.js` | Truy xuất tri thức và dựng prompt cho AI |
| `api/chat.js` | Điểm vào duy nhất của phần AI |

## 10. Giới hạn đã biết

- Dữ liệu lưu trong trình duyệt, chưa đồng bộ giữa nhiều thiết bị hoặc nhiều người dùng. Xóa dữ liệu trình duyệt sẽ mất ca làm việc và ảnh.
- Danh mục FOSFA và ma trận tương thích trong dự án là mô hình đơn giản hóa, không thay thế dữ liệu kiểm định thực tế.
- Ngưỡng của Acid Wash Colour và NVM là ngưỡng tạm vì tài liệu đầu vào không nêu giá trị cụ thể.
- Các PDF trong thư mục tài liệu chưa được đưa vào chỉ mục truy xuất.
- `react-router-dom` còn trong `package.json` nhưng chưa được sử dụng.
- Camera trong trình duyệt yêu cầu HTTPS hoặc localhost.

## 11. Tài liệu tham khảo

- [Groq Chat Completions](https://console.groq.com/docs/text-chat)
- [Groq deprecations](https://console.groq.com/docs/deprecations)
- [Sử dụng tệp trong Vercel Functions](https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions)
- [Mermaid](https://mermaid.js.org/)
