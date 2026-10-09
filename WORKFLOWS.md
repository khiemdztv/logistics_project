# Dolphin TankOps - Sơ đồ luồng hoạt động

Tài liệu kèm theo [README.md](README.md). Mỗi mục hiển thị ảnh sơ đồ đã render sẵn (PNG trong `docs/workflows/`) để đọc được ở mọi trình xem Markdown, kể cả nơi không hỗ trợ Mermaid. Mã Mermaid gốc nằm trong khối "Mã Mermaid - nguồn sơ đồ" ngay dưới ảnh để chỉnh sửa và render lại.

## Bảng màu sơ đồ

Mọi sơ đồ dùng chung các lớp `classDef` dưới đây, nên màu hiển thị giống nhau ở tất cả sơ đồ.

| Lớp | Màu | Ý nghĩa |
|---|---|---|
| `ui` | Xanh dương nhạt | Giao diện, component React |
| `data` | Vàng nhạt | Dữ liệu và lưu trữ |
| `ai` | Tím nhạt | Thành phần AI, RAG |
| `ok` | Xanh lá nhạt | Nhánh thành công, đạt |
| `bad` | Đỏ nhạt | Nhánh chặn, không đạt |
| `warn` | Hổ phách | Điều kiện, trạng thái chờ |
| `nav` | Navy | Điểm vào, hằng số trung tâm |

## Mục lục

1. [Kiến trúc tổng thể](#1-kiến-trúc-tổng-thể)
2. [Vòng đời ca làm việc](#2-vòng-đời-ca-làm-việc)
3. [Luồng nghiệp vụ 3 bước](#3-luồng-nghiệp-vụ-3-bước)
4. [Nhánh Wall Wash](#4-nhánh-wall-wash)
5. [Nhánh Water White](#5-nhánh-water-white)
6. [Luồng bằng chứng ảnh](#6-luồng-bằng-chứng-ảnh)
7. [Luồng AI Copilot và RAG](#7-luồng-ai-copilot-và-rag)
8. [Pipeline xây kho RAG](#8-pipeline-xây-kho-rag)
9. [Quản lý đội tàu và hầm](#9-quản-lý-đội-tàu-và-hầm)
10. [Bản đồ action của reducer](#10-bản-đồ-action-của-reducer)
11. [Luồng kiểm thử](#11-luồng-kiểm-thử)
12. [Render lại sơ đồ](#12-render-lại-sơ-đồ)

---

## 1. Kiến trúc tổng thể

![Kiến trúc tổng thể](docs/workflows/01-kien-truc-tong-the.png)

<details>
<summary>Mã Mermaid - nguồn sơ đồ</summary>

```mermaid
flowchart TB
  subgraph CLIENT["Browser - React 19 · Vite 8"]
    direction TB
    BOOT["main.jsx<br/>createRoot + StrictMode"] --> CTX["AppProvider<br/>src/context/AppContext.jsx"]
    CTX --> RED["appReducer<br/>src/context/appState.js"]
    RED --> ST[("state<br/>nguồn sự thật duy nhất")]
    ST --> VIEW{"currentView"}
    VIEW -->|dashboard| DASH["Dashboard.jsx<br/>SessionDialog · FleetManager"]
    VIEW -->|inspection| INSP["Stepper → Step1 → Step2 → Step3"]
    DASH --> FAB["AICopilotDrawer.jsx<br/>trợ lý nổi toàn cục"]
    INSP --> FAB
  end

  subgraph SERVER["api/chat.js - Vercel Function · cũng là Vite middleware khi npm run dev"]
    direction LR
    API["createChatHandler<br/>validateBody → build*Request"] --> GROQ["Groq<br/>openai/gpt-oss-120b"]
    API --> GEM["Gemini<br/>gemini-3.8-flash · dự phòng"]
    API --> LOC["localChatReply<br/>tra cứu cục bộ"]
  end

  subgraph STORE["Lưu trữ phía trình duyệt"]
    direction LR
    LS[("localStorage<br/>dolphin_sessions · dolphin_vessels<br/>dolphin_custom_holds · dolphin_deleted_vessels")]
    IDB[("IndexedDB · dolphin_evidence<br/>ảnh bằng chứng dạng dataURL")]
  end

  RAG[("public/rag_context.txt<br/>public/rag_reference.json")] --> API

  RED -.->|"useEffect persist"| LS
  INSP -.->|"EvidencePhotos"| IDB
  INSP -->|"chatWithCopilot"| API

  classDef ui fill:#e0f2fe,stroke:#0284c7,color:#0c2a44
  classDef data fill:#fef3c7,stroke:#d97706,color:#4a2c00
  classDef ai fill:#ede9fe,stroke:#7c3aed,color:#2e1065

  class BOOT,CTX,RED,FAB,DASH,INSP,VIEW ui
  class ST,LS,IDB,RAG data
  class API,GROQ,GEM,LOC ai
```

</details>

Không có router. `react-router-dom` nằm trong `package.json` nhưng không được import ở đâu; điều hướng hoàn toàn bằng `state.currentView` và `state.currentStep` trong [App.jsx](src/App.jsx).

---

## 2. Vòng đời ca làm việc

![Vòng đời ca làm việc](docs/workflows/02-vong-doi-ca-lam-viec.png)

<details>
<summary>Mã Mermaid - nguồn sơ đồ</summary>

```mermaid
flowchart LR
  START(["Mở ứng dụng"]) --> DASH["Dashboard<br/>danh sách ca · lọc trạng thái/tàu · tìm kiếm không dấu"]

  DASH -->|CREATE_SESSION| NEW["Tạo ca mới<br/>snapshot hồ sơ tàu"]
  DASH -->|LOAD_SESSION| OPEN["Mở ca đã lưu"]
  DASH -->|COPY_SESSION| COPY["Nhân bản cấu hình hàng<br/>xoá kết quả + ảnh + log"]
  DASH -->|RESET_SESSION| RS["Đặt lại dữ liệu ca"]
  DASH -->|DELETE_SESSION| DEL["Xoá ca"]

  NEW --> INSP
  OPEN --> INSP
  COPY --> INSP
  RS --> INSP

  INSP["Inspection view<br/>currentStep 1 → 2 → 3"]
  INSP --> SAVE["SAVE_CURRENT_SESSION<br/>auto-save sau 2 giây"]
  INSP -->|GO_DASHBOARD| DASH

  SAVE --> STATUS{"getSessionStatus"}
  STATUS -->|"verdict = fail"| FAILED["badge Chưa đạt"]
  STATUS -->|"endTime + pass"| PASSED["badge Đạt"]
  STATUS -->|còn lại| PROG["badge Đang thực hiện"]

  FAILED --> DASH
  PASSED --> DASH
  PROG --> DASH

  classDef nav fill:#0b132b,stroke:#00e5ff,color:#ffffff
  classDef ui fill:#e0f2fe,stroke:#0284c7,color:#0c2a44
  classDef ok fill:#dcfce7,stroke:#16a34a,color:#052e16
  classDef bad fill:#fee2e2,stroke:#dc2626,color:#450a0a
  classDef warn fill:#fef3c7,stroke:#d97706,color:#4a2c00

  class START nav
  class DASH,NEW,OPEN,COPY,RS,INSP,SAVE ui
  class PASSED ok
  class FAILED,DEL bad
  class PROG,STATUS warn
```

</details>

Cơ chế auto-save trong [AppContext.jsx](src/context/AppContext.jsx): mỗi khi field của ca thay đổi, một `setTimeout` 2 giây dispatch `SAVE_CURRENT_SESSION`; riêng `COMPLETE_INSPECTION` gọi đệ quy `SAVE_CURRENT_SESSION` ngay lập tức.

---

## 3. Luồng nghiệp vụ 3 bước

![Luồng nghiệp vụ 3 bước](docs/workflows/03-luong-nghiep-vu-3-buoc.png)

<details>
<summary>Mã Mermaid - nguồn sơ đồ</summary>

```mermaid
flowchart TD
  subgraph S1["STEP 1 - Step1CargoInit.jsx · Khởi tạo"]
    direction TB
    PREV["Hàng vừa dỡ<br/>previousCargo"]
    NEXT["Hàng sắp nhận<br/>newCargo"]
    COAT["Lớp phủ hầm<br/>vessel.coating"]
    COMPAT["checkCompatibility<br/>cargoData.js"]

    PREV --> COMPAT
    NEXT --> COMPAT
    COAT --> COMPAT

    COMPAT --> FOSFA{"Hàng mới là dầu thực vật<br/>và hàng trước nằm trong<br/>FOSFA_BANNED?"}
    FOSFA -->|Có| BLOCK["allowed = false<br/>chặn nút Bắt đầu kiểm tra"]
    FOSFA -->|Không| NOTES["notes kỹ thuật<br/>cùng nhóm · nặng→tinh khiết · epoxy"]
    NOTES --> METHOD["method = newGroup.testMethod"]
    BLOCK --> METHOD
    METHOD --> HOLD["Chọn hầm<br/>VESSEL_HOLDS + customHolds theo vesselId"]
    HOLD --> STARTBTN{"selectedHold hợp lệ?"}
    STARTBTN -->|Không| HOLD
    STARTBTN -->|Có| START["START_INSPECTION<br/>currentStep = 2"]
  end

  START --> SWITCH{"selectedMethod"}

  SWITCH -->|WALL_WASH| S2A["STEP 2A<br/>Step2WallWash.jsx"]
  SWITCH -->|"WATER_WHITE hoặc khác"| S2B["STEP 2B<br/>Step2WaterWhite.jsx"]

  S2A --> GATE
  S2B --> GATE

  GATE{"getInspectionOutcome().canExport<br/>đủ kết quả bắt buộc + đủ ảnh"}
  GATE -->|Không| WAIT["Nút xuất bị disable<br/>hiện lý do còn thiếu"]
  WAIT --> S2A
  GATE -->|Có| DONE["COMPLETE_INSPECTION<br/>currentStep = 3"]

  DONE --> S3["STEP 3 - Step3Report.jsx<br/>biên bản in · ảnh bằng chứng · audit trail"]
  S3 --> BACK["GO_DASHBOARD<br/>lưu ca + cập nhật status"]

  classDef ui fill:#e0f2fe,stroke:#0284c7,color:#0c2a44
  classDef ok fill:#dcfce7,stroke:#16a34a,color:#052e16
  classDef bad fill:#fee2e2,stroke:#dc2626,color:#450a0a
  classDef warn fill:#fef3c7,stroke:#d97706,color:#4a2c00

  class PREV,NEXT,COAT,COMPAT,NOTES,METHOD,HOLD,S2A,S2B,S3 ui
  class START,DONE,BACK ok
  class BLOCK bad
  class FOSFA,STARTBTN,SWITCH,GATE,WAIT warn
```

</details>

`getInspectionOutcome()` trong [inspectionOutcome.js](src/data/inspectionOutcome.js) là cổng gác duy nhất: nút bấm, badge trạng thái và nội dung báo cáo đều dùng chung một kết quả.

---

## 4. Nhánh Wall Wash

![Nhánh Wall Wash](docs/workflows/04-nhanh-wall-wash.png)

<details>
<summary>Mã Mermaid - nguồn sơ đồ</summary>

```mermaid
flowchart TD
  NC["newCargo.id"] --> PROF["getTestProfileId<br/>CARGO_ITEMS.testProfile"]
  PROF --> TPROF["TEST_PROFILES[profileId]"]
  PC["previousCargo.id"] --> ADJ

  TPROF --> ADJ{"Điều chỉnh theo hàng trước"}
  ADJ -->|"group = VEGETABLE_OIL"| A1["chloride.nitric = true<br/>NVM → bắt buộc"]
  ADJ -->|"profile = AROMATIC"| A2["acidWash → bắt buộc"]
  ADJ -->|"group ∈ CRUDE_OIL / DARK_FUEL / CLEAN_FUEL"| A3["hydrocarbon + odour → bắt buộc"]

  A1 --> PLAN
  A2 --> PLAN
  A3 --> PLAN
  ADJ -->|không đổi| PLAN

  PLAN["getTestPlan()<br/>8 dòng sắp xếp required → optional → na<br/>kèm adjustments[] hiển thị cảnh báo"]

  PLAN --> LOOP

  subgraph LOOP["Vòng lặp từng dòng phép thử"]
    direction TB
    PHOTO["EvidencePhotos<br/>target = ww:testId"]
    PHOTO --> STORE["compressImage ≤1280px · JPEG q=0.75<br/>→ putPhoto · IndexedDB"]
    STORE --> ADD["ADD_PHOTO<br/>state chỉ giữ id · target · source · name · takenAt"]
    ADD --> READY{"hasEvidence?"}
    READY -->|Không| LOCK["ô nhập bị khoá"]
    READY -->|Có| INPUT{"Loại nhập"}
    INPUT -->|choice| CH["Chọn hiện tượng quan sát"]
    INPUT -->|number| NUM["Nhập số đo"]
    CH --> EVAL
    NUM --> EVAL
    EVAL["evaluateWallWashTest<br/>na · pending · pass · warn · fail"]
  end

  EVAL --> SUM["summarizeWallWash<br/>statuses · failed[] · warned[]<br/>requiredDone/Total · allRequiredPassed · hasFail"]

  SUM --> CHK{"requiredDone === requiredTotal<br/>và không có fail?"}
  CHK -->|Không| WHY["Hiện lý do: thiếu ảnh / thiếu kết quả"]
  WHY --> LOOP
  CHK -->|Có| CANEXP["canExport = true → Tiếp tục xuất báo cáo"]

  SUM -.->|"evaluation.failed thay đổi · debounce 800ms"| DIAG
  DIAG["analyzeTestFailures<br/>aiService.js"] --> POST["POST /api/chat<br/>isDiagnostic: true"]
  POST --> BUILD["buildDiagnosticRequest<br/>Groq JSON mode"]
  BUILD --> VALID{"isValidDiagnostic đúng<br/>và hasTreatmentRecipe sai"}
  VALID -->|Có| AID["aiDiagnostic<br/>title · causes[] · solutions[]"]
  VALID -->|Không| LOCD["localDiagnostic<br/>mode = local"]

  classDef ui fill:#e0f2fe,stroke:#0284c7,color:#0c2a44
  classDef data fill:#fef3c7,stroke:#d97706,color:#4a2c00
  classDef ai fill:#ede9fe,stroke:#7c3aed,color:#2e1065
  classDef ok fill:#dcfce7,stroke:#16a34a,color:#052e16
  classDef bad fill:#fee2e2,stroke:#dc2626,color:#450a0a

  class NC,PC,PHOTO,EVAL,SUM,CH,NUM ui
  class PROF,TPROF,PLAN,A1,A2,A3,ADD,STORE data
  class DIAG,POST,BUILD,AID,LOCD ai
  class CANEXP ok
  class LOCK,VALID bad
```

</details>

Chốt an toàn: `hasTreatmentRecipe()` trong [lib/copilot.js](lib/copilot.js) loại mọi dòng chứa công thức phần trăm, độ C hoặc giờ khỏi chỉ mục RAG, và `providerResult()` ném `UNVERIFIED_TREATMENT_RECIPE` để rơi về gợi ý cục bộ.

---

## 5. Nhánh Water White

![Nhánh Water White](docs/workflows/05-nhanh-water-white.png)

<details>
<summary>Mã Mermaid - nguồn sơ đồ</summary>

```mermaid
flowchart TD
  AREAS["WATER_WHITE_AREAS - 7 khu vực<br/>trần · vách mũi · vách lái · mạn trái · mạn phải · đáy · piping"]
  AREAS --> LOOP

  subgraph LOOP["Vòng lặp từng khu vực"]
    direction TB
    PH["EvidencePhotos<br/>target = wh:areaId"]
    PH --> GATE{"hasEvidence?"}
    GATE -->|Không| LOCK["nút ĐẠT / KHÔNG ĐẠT bị khoá"]
    GATE -->|Có| SET["SET_WATER_WHITE_CHECK<br/>status = pass hoặc fail"]
    SET --> LOG["ADD_LOG<br/>ghi nhật ký audit trail"]
  end

  LOG --> SUM["summary<br/>passCount · failCount · uncheckedCount<br/>failedAreas[] · missingPhotos · photoCount · allPassed"]
  SUM --> EXP{"đủ 7/7 đã đánh giá<br/>và không mục nào thiếu ảnh?"}
  EXP -->|Không| BLOCK["Báo cáo chưa mở khoá"]
  BLOCK --> LOOP
  EXP -->|Có| OK["COMPLETE_INSPECTION → Step 3<br/>xuất được cả khi có mục KHÔNG ĐẠT"]

  classDef ui fill:#e0f2fe,stroke:#0284c7,color:#0c2a44
  classDef data fill:#fef3c7,stroke:#d97706,color:#4a2c00
  classDef ok fill:#dcfce7,stroke:#16a34a,color:#052e16
  classDef bad fill:#fee2e2,stroke:#dc2626,color:#450a0a

  class PH,SET,SUM ui
  class AREAS,LOG data
  class OK ok
  class LOCK,GATE,EXP,BLOCK bad
```

</details>

---

## 6. Luồng bằng chứng ảnh

![Luồng bằng chứng ảnh](docs/workflows/06-luong-bang-chung-anh.png)

<details>
<summary>Mã Mermaid - nguồn sơ đồ</summary>

```mermaid
flowchart LR
  subgraph IN["Nguồn ảnh"]
    direction TB
    CAM["Chụp ảnh<br/>CameraDialog · getUserMedia"]
    NAT["input capture=environment<br/>camera của máy"]
    UPL["Tải ảnh lên<br/>input file multiple"]
    DEMO["Preset demo<br/>makeDemoPhoto - SVG ẢNH MẪU"]
  end

  CAM -->|"lỗi quyền / không hỗ trợ"| NAT
  CAM --> PIPE
  NAT --> PIPE
  UPL --> PIPE
  DEMO --> PIPE

  PIPE["compressImage<br/>canvas · cạnh dài ≤1280px · JPEG 0.75"]
  PIPE --> PUT["putPhoto → IndexedDB dolphin_evidence"]
  PUT --> REC["ADD_PHOTO<br/>record nhỏ vào session"]
  REC --> SHOW["usePhotoUrls → getPhoto → img"]

  REC -.->|"sau 3 giây"| CLEAN["removeOrphanPhotos<br/>xoá ảnh không ca nào tham chiếu<br/>tuổi tối thiểu 10 phút"]

  RESET1["RESET_WALL_WASH"] -.->|"xoá target ww:"| CLEAN
  RESET2["RESET_WATER_WHITE"] -.->|"xoá target wh:"| CLEAN
  DEL["Xoá ảnh trong PhotoViewer"] -.->|"REMOVE_PHOTO + deletePhotos"| CLEAN

  classDef ui fill:#e0f2fe,stroke:#0284c7,color:#0c2a44
  classDef data fill:#fef3c7,stroke:#d97706,color:#4a2c00
  classDef warn fill:#fef3c7,stroke:#d97706,color:#4a2c00

  class CAM,NAT,UPL,DEMO,SHOW ui
  class PIPE,PUT,REC,CLEAN data
  class RESET1,RESET2,DEL warn
```

</details>

---

## 7. Luồng AI Copilot và RAG

![Luồng AI Copilot và RAG](docs/workflows/07-luong-ai-copilot-va-rag.png)

<details>
<summary>Mã Mermaid - nguồn sơ đồ</summary>

```mermaid
sequenceDiagram
  autonumber
  actor U as Người dùng
  participant D as AICopilotDrawer
  participant S as aiService.js
  participant A as api/chat.js
  participant C as lib/copilot.js
  participant P as Provider AI
  participant L as Tra cứu cục bộ

  U->>D: Nhập câu hỏi
  D->>D: ADD_AI_MESSAGE role user
  D->>S: chatWithCopilot text · messages · appContext
  S->>S: sanitizeHistory + sanitizeAppContext
  S->>A: POST /api/chat kèm customApiKey
  A->>A: validateBody → 400 nếu sai

  alt Thiếu khoá API
    A-->>S: 503 NO_API_KEY
  else Thiếu kho tài liệu
    A-->>S: 503 KNOWLEDGE_UNAVAILABLE
  else Hợp lệ
    A->>C: buildChatRequest
    C->>C: retrieveKnowledge - BM25 + alias tiếng Việt
    Note over C: top 5 đoạn · ngân sách 6500 ký tự<br/>câu hỏi tiếp dùng ngữ cảnh câu trước
    C-->>A: messages + sources

    A->>P: Groq openai/gpt-oss-120b
    alt Groq thành công
      P-->>A: nội dung trả lời
      A-->>S: 200 reply · model · mode ai · sources
    else Groq lỗi
      A->>P: Gemini gemini-3.8-flash
      alt Gemini thành công
        P-->>A: nội dung trả lời
        A-->>S: 200 reply · model · mode ai · sources
      else Cả hai lỗi
        A-->>S: 429 RATE_LIMITED hoặc 502 AI_UNAVAILABLE
      end
    end
  end

  S-->>D: kết quả hoặc lỗi
  alt Có kết quả AI
    D->>D: ADD_AI_MESSAGE mode ai
    D-->>U: Markdown + danh sách nguồn
  else Lỗi hoặc timeout 42 giây
    S->>L: localChatReply · loadLocalIndex
    L-->>S: reply cục bộ + warning
    S-->>D: mode local
    D-->>U: Nội dung tra cứu + nhãn chưa kết nối AI
  end
```

</details>

Ánh xạ mã lỗi:

| Mã HTTP | `error` | Ý nghĩa |
|:--:|---|---|
| 400 | `INVALID_REQUEST` | Body sai định dạng |
| 405 | `METHOD_NOT_ALLOWED` | Không phải POST/OPTIONS |
| 413 | `REQUEST_TOO_LARGE` | Vượt 32 KB - chỉ ở Vite middleware |
| 429 | `RATE_LIMITED` | Provider hết hạn mức |
| 502 | `AI_CONTEXT_TOO_LARGE` / `AI_UNAVAILABLE` | Vượt ngữ cảnh / không có phản hồi |
| 503 | `NO_API_KEY` · `KNOWLEDGE_UNAVAILABLE` · `AI_AUTH_FAILED` · `AI_MODEL_UNAVAILABLE` | Thiếu cấu hình hoặc provider từ chối |

---

## 8. Pipeline xây kho RAG

![Pipeline xây kho RAG](docs/workflows/08-pipeline-xay-kho-rag.png)

<details>
<summary>Mã Mermaid - nguồn sơ đồ</summary>

```mermaid
flowchart LR
  SRC[("../training AI<br/>*.txt · *.docx · *.pdf")]

  SRC -->|"npm run rag:extract<br/>extract_rag_references.mjs - đang dùng"| REF[("public/rag_reference.json<br/>id training-N + methanol-test-overview")]
  SRC -->|"extract_training_data.mjs<br/>không có trong package.json"| CTX[("public/rag_context.txt")]
  SRC -->|"generate_master_rag.mjs<br/>bản tổng hợp viết tay, ghi đè"| CTX

  REF --> IDX["buildKnowledgeIndex<br/>applicationDocuments + tách đoạn 1300 ký tự"]
  CTX --> IDX
  IDX --> BM["BM25 + chuẩn hoá tiếng Việt không dấu<br/>+ từ đồng nghĩa chuyên ngành"]
  BM --> DEP["Vercel includeFiles<br/>public/rag_*.txt · public/rag_*.json"]

  classDef data fill:#fef3c7,stroke:#d97706,color:#4a2c00
  classDef ai fill:#ede9fe,stroke:#7c3aed,color:#2e1065

  class SRC,REF,CTX data
  class IDX,BM,DEP ai
```

</details>

Hai script cùng ghi `public/rag_context.txt` và các PDF trong `training AI` chưa được đưa vào index, vì chỉ `extract_training_data.mjs` đọc PDF mà script này không có trong `package.json`.

---

## 9. Quản lý đội tàu và hầm

![Quản lý đội tàu và hầm](docs/workflows/09-quan-ly-doi-tau-va-ham.png)

<details>
<summary>Mã Mermaid - nguồn sơ đồ</summary>

```mermaid
flowchart TD
  DLG["SessionDialog<br/>mode = create · edit · vessel"]
  DLG --> NORM["normalizeVessel"]
  NORM --> VAL{"validateVessel"}
  VAL -->|"tên trống"| E1["Lỗi: nhập tên tàu"]
  VAL -->|"IMO khác 7 chữ số hoặc trùng"| E2["Lỗi: IMO không hợp lệ / đã tồn tại"]
  VAL -->|"DWT không phải số dương"| E3["Lỗi: trọng tải phải lớn hơn 0"]
  VAL -->|"thiếu quốc tịch"| E4["Lỗi: nhập quốc tịch"]
  E1 & E2 & E3 & E4 -->|"sửa lại trong form"| DLG
  VAL -->|"hợp lệ"| OK{"mode"}

  OK -->|vessel| ADDV["ADD_VESSEL<br/>chỉ thêm vào đội tàu, không tạo ca"]
  OK -->|create| CREATES["CREATE_SESSION<br/>snapshot hồ sơ tàu vào ca"]
  OK -->|edit| UPD["UPDATE_SESSION_DETAILS<br/>chỉ ca đó đổi, ca khác giữ nguyên"]

  FLEET["FleetManager"] --> DELV["DELETE_VESSEL<br/>bỏ khỏi vessels + ghi deletedVesselIds"]
  DELV --> KEEP["Ca và báo cáo cũ giữ snapshot<br/>loadFleet không seed lại tàu đã xoá"]

  HOLDS["ADD_CUSTOM_HOLD<br/>gắn vesselId = vesselId hiện hành"]
  HOLDS --> FILTER["Step1 lọc customHolds theo vesselId đang chọn"]

  classDef ui fill:#e0f2fe,stroke:#0284c7,color:#0c2a44
  classDef data fill:#fef3c7,stroke:#d97706,color:#4a2c00
  classDef bad fill:#fee2e2,stroke:#dc2626,color:#450a0a
  classDef ok fill:#dcfce7,stroke:#16a34a,color:#052e16

  class DLG,NORM,DELV,FLEET,HOLDS,FILTER ui
  class ADDV,CREATES,UPD,KEEP data
  class E1,E2,E3,E4 bad
  class VAL,OK ok
```

</details>

---

## 10. Bản đồ action của reducer

![Bản đồ action của reducer](docs/workflows/10-ban-do-action-cua-reducer.png)

<details>
<summary>Mã Mermaid - nguồn sơ đồ</summary>

```mermaid
flowchart TB
  R(("appReducer<br/>appState.js"))

  R --> G1["Điều hướng"]
  R --> G2["Bước 1 - Khởi tạo"]
  R --> G3["Bước 2 - Kiểm tra"]
  R --> G4["Bằng chứng và nhật ký"]
  R --> G5["Quản lý ca"]
  R --> G6["Đội tàu và hầm"]
  R --> G7["AI Copilot"]

  G1 --> A1["SET_STEP · GO_DASHBOARD · SET_FIELD"]
  G2 --> A2["SET_COMPATIBILITY · SET_METHOD · START_INSPECTION"]
  G3 --> A3["SET_WALL_WASH_RESULT · SET_WATER_WHITE_CHECK<br/>RESET_WALL_WASH · RESET_WATER_WHITE · COMPLETE_INSPECTION"]
  G4 --> A4["ADD_PHOTO · REMOVE_PHOTO · ADD_LOG"]
  G5 --> A5["CREATE_SESSION · LOAD_SESSION · SAVE_CURRENT_SESSION<br/>COPY_SESSION · RESET_SESSION · DELETE_SESSION · UPDATE_SESSION_DETAILS"]
  G6 --> A6["ADD_VESSEL · DELETE_VESSEL · ADD_CUSTOM_HOLD · RESET_ALL"]
  G7 --> A7["TOGGLE_AI_CHAT · ADD_AI_MESSAGE"]

  classDef nav fill:#0b132b,stroke:#00e5ff,color:#ffffff
  classDef ui fill:#e0f2fe,stroke:#0284c7,color:#0c2a44
  classDef ai fill:#ede9fe,stroke:#7c3aed,color:#2e1065
  classDef data fill:#fef3c7,stroke:#d97706,color:#4a2c00

  class R nav
  class G1,G2,G3,G4,G6 ui
  class A1,A2,A3,A4,A6 ui
  class G5,A5 data
  class G7,A7 ai
```

</details>

---

## 11. Luồng kiểm thử

![Luồng kiểm thử](docs/workflows/11-luong-kiem-thu.png)

<details>
<summary>Mã Mermaid - nguồn sơ đồ</summary>

```mermaid
flowchart LR
  CMD["npm test<br/>node --test tests/*.test.mjs"]
  CMD --> T1["wall-wash<br/>8 phương pháp · plan methanol<br/>hàng trước đổi cách đọc"]
  CMD --> T2["inspection-outcome<br/>xuất fail/pass · chặn thiếu kết quả hoặc ảnh"]
  CMD --> T3["evidence<br/>record ảnh · reducer · reset theo phương pháp"]
  CMD --> T4["fleet<br/>tàu · ca · migration · xoá tàu · custom hold"]
  CMD --> T5["copilot<br/>BM25 · tiếng Việt không dấu · follow-up · prompt"]
  CMD --> T6["chat-api<br/>handler với provider giả lập · mã lỗi"]
  CMD --> T7["ai-service<br/>fallback cục bộ · metadata provider"]

  classDef nav fill:#0b132b,stroke:#00e5ff,color:#ffffff
  classDef ui fill:#e0f2fe,stroke:#0284c7,color:#0c2a44

  class CMD nav
  class T1,T2,T3,T4,T5,T6,T7 ui
```

</details>

---

## 12. Render lại sơ đồ

Ảnh trong `docs/workflows/` được sinh tự động từ chính các khối Mermaid trong tài liệu này.

```sh
# Cài renderer một lần (không tải Chromium, dùng Chrome/Edge có sẵn trên máy)
npm install --no-save --no-audit --no-fund @mermaid-js/mermaid-cli@11

npm run docs:diagrams          # chỉ SVG
npm run docs:diagrams:png      # SVG + PNG (dùng cho ảnh nhúng trong tài liệu)
```

Script [scripts/render_workflow_diagrams.mjs](scripts/render_workflow_diagrams.mjs) tìm Chrome hoặc Edge theo biến `PUPPETEER_EXECUTABLE_PATH` hay các đường dẫn cài đặt mặc định, tách từng khối mã Mermaid trong tài liệu này, render thành `docs/workflows/NN-ten-so-do.svg` và ghi danh sách vào `docs/workflows/index.json`. Chạy lại script sau mỗi lần sửa sơ đồ rồi cập nhật ảnh nhúng.

---

## Ghi chú kiến trúc

| Điểm | Nhận xét |
|---|---|
| Một nguồn nghiệp vụ duy nhất | [src/data/wallWashTests.js](src/data/wallWashTests.js) được UI, báo cáo, `api/chat.js` và prompt AI import trực tiếp, nên ngưỡng không lệch giữa màn hình và AI |
| Không có router | `react-router-dom` là dependency thừa; điều hướng bằng state |
| Điều hướng Step 2 | Ternary trong `App.jsx`; nhánh mặc định luôn là Water White nếu `selectedMethod` không xác định |
| Lưu trữ tách tầng | Metadata ca ở `localStorage` (khoảng 5 MB); ảnh ở `IndexedDB` (hàng trăm MB) |
| Hai script RAG trùng chức năng | Chỉ `extract_rag_references.mjs` có trong `package.json` |
| Provider AI | Groq chính, Gemini dự phòng, tra cứu cục bộ là tầng cuối, luôn có câu trả lời |
