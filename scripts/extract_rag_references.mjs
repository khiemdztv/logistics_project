import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import AdmZip from 'adm-zip'

const projectDir = fileURLToPath(new URL('..', import.meta.url))
const trainingDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(projectDir, '../training AI')
const documents = []
for (const name of fs.readdirSync(trainingDir).sort()) {
  let text
  if (name.endsWith('.txt')) text = fs.readFileSync(path.join(trainingDir, name), 'utf8')
  else if (name.endsWith('.docx')) {
    const xml = new AdmZip(path.join(trainingDir, name)).readAsText('word/document.xml')
    text = xml.replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
  } else continue
  const clean = text.replace(/\r/g, '').trim()
  const sections = clean.split(/\n(?=(?:[IVX]+\. |\d+\. |[a-c]\) |Xét nghiệm |Thử nghiệm |Màu \(APHA|Thị giác và|Kỹ thuật lấy mẫu|Đừng chạy theo))/)
  for (const section of sections) {
    documents.push({ id: `training-${documents.length + 1}`, source: name, title: section.split('\n')[0].slice(0, 120), kind: 'training', text: section.trim() })
  }
  if (name === 'TỔNG HỢP CHẤT TEST.docx') {
    documents.push({ id: 'methanol-test-overview', source: `${name} — tóm tắt biên tập`, title: 'Methanol / Metanol: cần bao nhiêu test hóa chất Wall Wash?', kind: 'training', text:
      'Tài liệu tổng hợp của project mô tả 4 phép kiểm tra hóa học chính: Hydrocarbon (Water Miscibility), Chloride, Permanganate Time Test (PTT/PMTT), và màu APHA/Hazen; cùng kiểm tra cảm quan. Với methanol, Hydrocarbon và PTT được mô tả riêng trong phần bộ Wall Wash Test Kit. NVM, UV và phép thử bổ sung được thảo luận theo loại tạp chất/hàng trước và yêu cầu chủ hàng. Đây là bộ kiểm tra tham khảo để giải thích, không phải specification nghiệm thu bắt buộc cho mọi lô methanol. Số ô trên web và số phép thử trong tài liệu có thể khác nhau.' })
  }
}
if (!documents.length) throw new Error('No TXT/DOCX training documents found; existing references were not overwritten.')
fs.writeFileSync(path.join(projectDir, 'public/rag_reference.json'), `${JSON.stringify(documents, null, 2)}\n`)
console.log(`Saved ${documents.length} sections from TXT/DOCX training documents. PDFs are not indexed by this script.`)
