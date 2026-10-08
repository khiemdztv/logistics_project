import { useEffect, useRef, useState } from 'react'
import { Camera, Upload, X, Trash2, Loader2, ImageOff } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { createPhotoRecord, photosFor, SOURCE_LABELS } from '../data/evidence'
import { compressImage, putPhoto, deletePhotos } from '../services/photoStore'
import { usePhotoUrls } from '../services/usePhotoUrls'

function CameraDialog({ title, onCapture, onClose, onFallback }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Trình duyệt này không cho mở camera trực tiếp.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
        if (cancelled) { stream.getTracks().forEach(track => track.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        setReady(true)
      } catch (err) {
        setError(err?.name === 'NotAllowedError'
          ? 'Bạn chưa cho phép web dùng camera. Bấm biểu tượng ổ khóa trên thanh địa chỉ để cho phép, hoặc dùng cách bên dưới.'
          : 'Không mở được camera trên thiết bị này.')
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const capture = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    onCapture(canvas.toDataURL('image/jpeg', 0.9))
  }

  return (
    <div className="evidence-overlay" role="dialog" aria-modal="true" aria-label={`Chụp ảnh: ${title}`} onClick={onClose}>
      <div className="evidence-dialog" onClick={event => event.stopPropagation()}>
        <div className="evidence-dialog-header">
          <strong>Chụp ảnh bằng chứng · {title}</strong>
          <button type="button" className="evidence-icon-btn" onClick={onClose} aria-label="Đóng"><X size={18} /></button>
        </div>
        {error ? (
          <div className="evidence-camera-error">
            <p>{error}</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onFallback}>
              <Camera size={16} /> Mở camera / thư viện ảnh của máy
            </button>
          </div>
        ) : (
          <>
            <div className="evidence-video-wrap">
              <video ref={videoRef} playsInline muted className="evidence-video" />
              {!ready && <div className="evidence-video-loading"><Loader2 className="animate-spin" size={28} /> Đang mở camera...</div>}
            </div>
            <div className="evidence-dialog-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Hủy</button>
              <button type="button" className="btn btn-primary" onClick={capture} disabled={!ready}>
                <Camera size={18} /> Chụp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PhotoViewer({ photo, url, title, onClose, onDelete }) {
  return (
    <div className="evidence-overlay" role="dialog" aria-modal="true" aria-label={`Ảnh: ${title}`} onClick={onClose}>
      <div className="evidence-dialog evidence-viewer" onClick={event => event.stopPropagation()}>
        <div className="evidence-dialog-header">
          <strong>{title}</strong>
          <button type="button" className="evidence-icon-btn" onClick={onClose} aria-label="Đóng"><X size={18} /></button>
        </div>
        {url ? <img src={url} alt={`Ảnh bằng chứng ${title}`} className="evidence-viewer-img" /> : <div className="evidence-missing"><ImageOff size={28} /> Không tìm thấy ảnh trên trình duyệt này</div>}
        <div className="evidence-dialog-actions">
          <span className="evidence-meta">
            {SOURCE_LABELS[photo.source] || 'Ảnh'} · {new Date(photo.takenAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
            {photo.name ? ` · ${photo.name}` : ''}
          </span>
          <button type="button" className="btn btn-secondary btn-sm evidence-delete" onClick={onDelete}>
            <Trash2 size={15} /> Xóa ảnh
          </button>
        </div>
      </div>
    </div>
  )
}

// Photo block for one checklist area or test: take a picture, upload files, view and delete.
export default function EvidencePhotos({ target, title, compact = false }) {
  const { state, dispatch } = useApp()
  const photos = photosFor(state.photos, target)
  const urls = usePhotoUrls(photos.map(photo => photo.id))
  const uploadRef = useRef(null)
  const nativeCameraRef = useRef(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const saveDataUrl = async (dataUrl, source, name) => {
    const smaller = await compressImage(dataUrl)
    const id = await putPhoto(smaller)
    dispatch({ type: 'ADD_PHOTO', photo: createPhotoRecord({ id, target, source, name }) })
  }

  const handleFiles = async (fileList, source) => {
    const files = [...(fileList || [])].filter(file => file.type.startsWith('image/'))
    if (!files.length) { setError('Chỉ nhận file ảnh (JPG, PNG, HEIC...).'); return }
    setBusy(true)
    setError('')
    try {
      for (const file of files) {
        const dataUrl = await compressImage(file)
        const id = await putPhoto(dataUrl)
        dispatch({ type: 'ADD_PHOTO', photo: createPhotoRecord({ id, target, source, name: file.name }) })
      }
      dispatch({ type: 'ADD_LOG', text: `Thêm ${files.length} ảnh bằng chứng: ${title}`, logType: 'info' })
    } catch (err) {
      setError(err.message || 'Không lưu được ảnh.')
    } finally {
      setBusy(false)
    }
  }

  const handleCapture = async dataUrl => {
    setCameraOpen(false)
    setBusy(true)
    setError('')
    try {
      await saveDataUrl(dataUrl, 'camera', '')
      dispatch({ type: 'ADD_LOG', text: `Chụp ảnh bằng chứng: ${title}`, logType: 'info' })
    } catch (err) {
      setError(err.message || 'Không lưu được ảnh.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async photo => {
    setViewing(null)
    dispatch({ type: 'REMOVE_PHOTO', photoId: photo.id })
    dispatch({ type: 'ADD_LOG', text: `Xóa một ảnh bằng chứng: ${title}`, logType: 'warning' })
    await deletePhotos([photo.id])
  }

  return (
    <div className={`evidence ${compact ? 'evidence-compact' : ''} ${photos.length ? 'has-photos' : 'no-photos'}`} onClick={event => event.stopPropagation()}>
      <div className="evidence-row">
        <button type="button" className="evidence-btn" onClick={() => setCameraOpen(true)} disabled={busy}>
          <Camera size={14} /> Chụp ảnh
        </button>
        <button type="button" className="evidence-btn" onClick={() => uploadRef.current?.click()} disabled={busy}>
          <Upload size={14} /> Tải ảnh lên
        </button>
        {busy && <Loader2 className="animate-spin" size={14} />}
        {photos.map(photo => (
          <button key={photo.id} type="button" className="evidence-thumb" onClick={() => setViewing(photo)} aria-label={`Xem ảnh ${title}`}>
            {urls[photo.id] ? <img src={urls[photo.id]} alt="" /> : <ImageOff size={14} />}
            {photo.source === 'demo' && <span className="evidence-thumb-tag">demo</span>}
          </button>
        ))}
        {!photos.length && !busy && <span className="evidence-hint">Cần ít nhất 1 ảnh trước khi đánh giá</span>}
      </div>
      {error && <div className="evidence-error">{error}</div>}

      <input ref={uploadRef} type="file" accept="image/*" multiple hidden onChange={event => { handleFiles(event.target.files, 'upload'); event.target.value = '' }} />
      <input ref={nativeCameraRef} type="file" accept="image/*" capture="environment" hidden onChange={event => { handleFiles(event.target.files, 'camera'); event.target.value = '' }} />

      {cameraOpen && (
        <CameraDialog
          title={title}
          onCapture={handleCapture}
          onClose={() => setCameraOpen(false)}
          onFallback={() => { setCameraOpen(false); nativeCameraRef.current?.click() }}
        />
      )}
      {viewing && (
        <PhotoViewer
          photo={viewing}
          url={urls[viewing.id]}
          title={title}
          onClose={() => setViewing(null)}
          onDelete={() => handleDelete(viewing)}
        />
      )}
    </div>
  )
}

// Read-only thumbnails for the report.
export function EvidenceGallery({ photos }) {
  const urls = usePhotoUrls(photos.map(photo => photo.id))
  if (!photos.length) return <span style={{ color: '#B45309', fontSize: '11px' }}>Chưa có ảnh</span>
  return (
    <div className="report-evidence">
      {photos.map(photo => (
        <figure key={photo.id}>
          {urls[photo.id] ? <img src={urls[photo.id]} alt="Ảnh bằng chứng" /> : <div className="report-evidence-missing">Ảnh không có trên máy này</div>}
          <figcaption>{SOURCE_LABELS[photo.source] || 'Ảnh'} · {new Date(photo.takenAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</figcaption>
        </figure>
      ))}
    </div>
  )
}
