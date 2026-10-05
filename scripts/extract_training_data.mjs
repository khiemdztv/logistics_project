import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import AdmZip from 'adm-zip';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const rootDir = path.resolve('..');
const trainingDir = path.join(rootDir, 'training AI');
const publicDir = path.resolve('public');

console.log('Root dir:', rootDir);
console.log('Training dir:', trainingDir);

function extractXmlText(xmlContent) {
  return xmlContent
    .replace(/<w:p[^>]*>/g, '\n')
    .replace(/<a:p[^>]*>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function parseDocx(filePath) {
  try {
    const zip = new AdmZip(filePath);
    const xmlEntry = zip.getEntry('word/document.xml');
    if (!xmlEntry) return '';
    const xml = xmlEntry.getData().toString('utf8');
    return extractXmlText(xml);
  } catch (err) {
    console.error(`Error reading docx ${filePath}:`, err.message);
    return '';
  }
}

function parsePptx(filePath) {
  try {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();
    let text = '';
    for (const entry of entries) {
      if (entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')) {
        const slideXml = entry.getData().toString('utf8');
        text += `\n--- Slide: ${entry.entryName} ---\n` + extractXmlText(slideXml);
      }
    }
    return text;
  } catch (err) {
    console.error(`Error reading pptx ${filePath}:`, err.message);
    return '';
  }
}

async function parsePdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    await parser.load();
    const res = await parser.getText();
    if (typeof res === 'string') return res;
    if (res && res.text) return res.text;
    return '';
  } catch (err) {
    console.error(`Error reading pdf ${filePath}:`, err.message);
    return '';
  }
}

async function run() {
  const sections = [];

  // 1. Root files
  const rootFiles = ['mô tả chi tiết.docx', 'mô tả chi tiết cách web hoạt động.pptx'];
  for (const f of rootFiles) {
    const p = path.join(rootDir, f);
    if (fs.existsSync(p)) {
      console.log(`Processing root file: ${f}`);
      if (f.endsWith('.docx')) {
        sections.push({ title: f, text: parseDocx(p) });
      } else if (f.endsWith('.pptx')) {
        sections.push({ title: f, text: parsePptx(p) });
      }
    }
  }

  // 2. Training AI files
  const trainingFiles = fs.readdirSync(trainingDir);
  for (const f of trainingFiles) {
    const p = path.join(trainingDir, f);
    console.log(`Processing training file: ${f}`);
    if (f.endsWith('.txt')) {
      const text = fs.readFileSync(p, 'utf8');
      sections.push({ title: f, text });
    } else if (f.endsWith('.docx')) {
      sections.push({ title: f, text: parseDocx(p) });
    } else if (f.endsWith('.pdf')) {
      // For large pdfs, extract text
      const text = await parsePdf(p);
      console.log(`Extracted ${text.length} chars from ${f}`);
      sections.push({ title: f, text });
    }
  }

  console.log(`Total sections extracted: ${sections.length}`);
  
  // Format knowledge base into a structured document
  let fullKnowledge = `# TÀI LIỆU CƠ SỞ TRI THỨC VÀ HUẤN LUYỆN DOLPHIN TANKOPS (RAG KNOWLEDGE BASE)
Hệ thống Hỗ trợ Sĩ quan Vận hành & Giám định Làm sạch Hầm hàng Tàu Hóa chất Dolphin 01 (Pure Epoxy Coating).
Cập nhật đầy đủ tiêu chuẩn quốc tế: MARPOL Annex II, MEPC Circulars, FOSFA Banned/Acceptable Lists, INTERTANKO, CHRIS Manual, Wall Wash Test (WWT) & Water White Standard.
`;

  for (const s of sections) {
    fullKnowledge += `\n\n================================================================================\n`;
    fullKnowledge += `TÀI LIỆU NGUỒN: ${s.title}\n`;
    fullKnowledge += `================================================================================\n`;
    const cleanText = (s.text || '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    fullKnowledge += cleanText + `\n`;
  }

  const outputPath = path.join(publicDir, 'rag_context.txt');
  fs.writeFileSync(outputPath, fullKnowledge, 'utf8');
  console.log(`Successfully wrote ${fullKnowledge.length} characters (UTF-8) to ${outputPath}`);
}

run().catch(console.error);
