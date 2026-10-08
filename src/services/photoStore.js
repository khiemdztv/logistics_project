// Browser storage for evidence photos. Images go to IndexedDB (hundreds of MB
// available) instead of localStorage (about 5 MB, already used by sessions).
// Falls back to memory when IndexedDB is unavailable (private mode, tests).

const DB_NAME = 'dolphin_evidence'
const STORE = 'photos'
const MAX_SIDE = 1280
const QUALITY = 0.75
const memory = new Map()

let dbPromise
function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  if (!dbPromise) {
    dbPromise = new Promise(resolve => {
      try {
        const request = indexedDB.open(DB_NAME, 1)
        request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' })
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(null)
        request.onblocked = () => resolve(null)
      } catch {
        resolve(null)
      }
    })
  }
  return dbPromise
}

function run(mode, action) {
  return openDb().then(db => {
    if (!db) return null
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode)
      const request = action(tx.objectStore(STORE))
      tx.oncomplete = () => resolve(request?.result ?? null)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  })
}

export function newPhotoId() {
  return `ph_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export async function putPhoto(dataUrl, id = newPhotoId()) {
  const record = { id, dataUrl, createdAt: Date.now() }
  try {
    const stored = await run('readwrite', store => store.put(record))
    if (stored === null) memory.set(id, record)
  } catch {
    memory.set(id, record)
  }
  return id
}

const urlCache = new Map()
export async function getPhoto(id) {
  if (urlCache.has(id)) return urlCache.get(id)
  if (memory.has(id)) return memory.get(id).dataUrl
  try {
    const record = await run('readonly', store => store.get(id))
    if (record?.dataUrl) {
      urlCache.set(id, record.dataUrl)
      return record.dataUrl
    }
  } catch { /* missing photo shows as unavailable */ }
  return null
}

export async function deletePhotos(ids) {
  for (const id of ids) {
    memory.delete(id)
    urlCache.delete(id)
  }
  try {
    await run('readwrite', store => { ids.forEach(id => store.delete(id)) })
  } catch { /* ignore */ }
}

// Removes photos no session refers to any more (deleted, reset or copied sessions).
// Recent photos are kept so a photo saved a moment before its record lands is safe.
export async function removeOrphanPhotos(referencedIds, minAgeMs = 10 * 60 * 1000) {
  const keep = new Set(referencedIds)
  try {
    const all = await run('readonly', store => store.getAll())
    if (!Array.isArray(all)) return 0
    const orphans = all.filter(record => !keep.has(record.id) && Date.now() - (record.createdAt || 0) > minAgeMs).map(record => record.id)
    if (orphans.length) await deletePhotos(orphans)
    return orphans.length
  } catch {
    return 0
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Không đọc được file ảnh.'))
    image.src = src
  })
}

// Shrinks a picture to at most 1280 px on the long side, saved as JPEG.
export async function compressImage(source) {
  const isFile = typeof Blob !== 'undefined' && source instanceof Blob
  if (isFile && !source.type.startsWith('image/')) throw new Error('File không phải ảnh.')
  const objectUrl = isFile ? URL.createObjectURL(source) : null
  try {
    const image = await loadImage(objectUrl || source)
    const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale))
    canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', QUALITY)
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  }
}
