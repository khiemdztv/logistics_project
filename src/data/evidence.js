// Evidence photos: each checklist area / Wall Wash test needs at least one photo
// before it can be judged. Session state keeps only small records; the image
// bytes live in the browser photo store (src/services/photoStore.js).

export const EVIDENCE_KINDS = { WATER_WHITE: 'wh', WALL_WASH: 'ww' }

export function evidenceTarget(kind, itemId) {
  return `${kind}:${itemId}`
}

export function isValidPhotoRecord(photo) {
  return Boolean(photo && typeof photo === 'object' && typeof photo.id === 'string' && photo.id
    && typeof photo.target === 'string' && /^(wh|ww):[A-Za-z0-9_]+$/.test(photo.target))
}

// Older sessions stored an unused photos array; keep only records this version understands.
export function normalizePhotos(photos) {
  return Array.isArray(photos) ? photos.filter(isValidPhotoRecord) : []
}

export function photosFor(photos, target) {
  return normalizePhotos(photos).filter(photo => photo.target === target)
}

export function hasEvidence(photos, target) {
  return normalizePhotos(photos).some(photo => photo.target === target)
}

export function countEvidence(photos, kind) {
  return normalizePhotos(photos).filter(photo => photo.target.startsWith(`${kind}:`)).length
}

// Targets that already have a result but no photo (e.g. the photo was deleted later).
export function missingEvidence(targets, photos) {
  const covered = new Set(normalizePhotos(photos).map(photo => photo.target))
  return targets.filter(target => !covered.has(target))
}

export function createPhotoRecord({ id, target, source = 'upload', name = '' }) {
  return {
    id,
    target,
    source: ['camera', 'upload', 'demo'].includes(source) ? source : 'upload',
    name: String(name || '').slice(0, 120),
    takenAt: new Date().toISOString(),
  }
}

export const SOURCE_LABELS = { camera: 'Chụp trực tiếp', upload: 'Tải lên', demo: 'Ảnh mẫu (demo)' }

function escapeXml(text) {
  return String(text).replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char])
}

// Placeholder image used by the quick demo buttons so the flow still has evidence.
export function makeDemoPhoto(label, verdict = 'pass') {
  const color = verdict === 'fail' ? '#ef4444' : verdict === 'warn' ? '#f59e0b' : '#10b981'
  const status = verdict === 'fail' ? 'KHÔNG ĐẠT' : verdict === 'warn' ? 'ĐẠT (LƯU Ý)' : 'ĐẠT'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2f4a"/><stop offset="1" stop-color="#0b132b"/></linearGradient></defs>
<rect width="640" height="480" fill="url(#g)"/>
<rect x="24" y="24" width="592" height="432" rx="18" fill="none" stroke="#3a5675" stroke-width="3" stroke-dasharray="14 10"/>
<text x="320" y="190" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#8fb3d1">ẢNH MẪU (DEMO)</text>
<text x="320" y="245" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="#ffffff">${escapeXml(label)}</text>
<text x="320" y="305" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="${color}">${status}</text>
<text x="320" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#6f8aa6">Thay bằng ảnh chụp thật khi kiểm tra</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
