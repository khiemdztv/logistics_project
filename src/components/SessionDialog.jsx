import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getSessionVessel, normalizeVessel, validateVessel, formatDwt } from '../data/vesselData.js'

export default function SessionDialog({ mode = 'create', session, onClose }) {
  const { state, dispatch } = useApp()
  const dialogRef = useRef(null)
  const initialVessel = session ? getSessionVessel(session) : mode === 'vessel' ? {} : state.vessels.at(-1) || {}
  const [vessel, setVessel] = useState(() => normalizeVessel(initialVessel))
  const [selectedId, setSelectedId] = useState(initialVessel.id || 'new')
  const [sessionName, setSessionName] = useState(session?.sessionName || '')
  const [errors, setErrors] = useState({})
  const title = mode === 'vessel' ? 'Thêm tàu' : mode === 'edit' ? 'Sửa tên ca & thông tin tàu' : 'Tạo ca làm việc'

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    dialog.querySelector('input, select')?.focus()
    return () => dialog.close()
  }, [])

  const selectVessel = event => {
    const id = event.target.value
    setSelectedId(id)
    setVessel(normalizeVessel(id === 'new' ? {} : state.vessels.find(item => item.id === id) || (session && getSessionVessel(session))))
    setErrors({})
  }
  const setField = (field, value) => {
    setVessel(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: undefined }))
  }
  const submit = event => {
    event.preventDefault()
    const clean = normalizeVessel(vessel)
    const nextErrors = validateVessel(clean, state.vessels)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      dialogRef.current.querySelector(`#vessel-${Object.keys(nextErrors)[0]}`)?.focus()
      return
    }
    dispatch({ type: mode === 'vessel' ? 'ADD_VESSEL' : mode === 'edit' ? 'UPDATE_SESSION_DETAILS' : 'CREATE_SESSION',
      vessel: clean, sessionName, sessionId: session?.id })
    onClose()
  }

  const field = (name, label, placeholder, props = {}) => (
    <div className={`form-group vessel-field ${name === 'name' ? 'full-width' : ''}`}>
      <label className="form-label" htmlFor={`vessel-${name}`}>{label} {name !== 'coating' && <span className="field-required" aria-hidden="true">*</span>}</label>
      <input id={`vessel-${name}`} className="form-input" type="text" value={vessel[name]}
        placeholder={placeholder} required={name !== 'coating'} maxLength={name === 'imo' ? 30 : name === 'dwt' ? 30 : 120}
        onChange={event => setField(name, event.target.value)} aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `vessel-${name}-error` : undefined} {...props} />
      {errors[name] && <p className="form-error" id={`vessel-${name}-error`}>{errors[name]}</p>}
    </div>
  )

  return (
    <dialog ref={dialogRef} className="session-dialog" aria-labelledby="session-dialog-title"
      onCancel={event => { event.preventDefault(); onClose() }}>
      <form onSubmit={submit} noValidate>
        <div className="session-dialog-header">
          <div><p className="page-eyebrow">Quản lý đội tàu</p><h2 id="session-dialog-title">{title}</h2></div>
          <button className="dialog-close" type="button" onClick={onClose} aria-label="Đóng biểu mẫu"><X size={19} /></button>
        </div>
        <div className="session-dialog-body">
          {mode !== 'vessel' && <>
            <div className="form-group">
              <label className="form-label" htmlFor="session-name">Tên ca làm việc <span className="field-optional">(tùy chọn)</span></label>
              <input id="session-name" className="form-input" maxLength={120} value={sessionName} onChange={event => setSessionName(event.target.value)} placeholder="VD: Kiểm tra trước chuyến Singapore" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="session-vessel">Tàu thực hiện ca</label>
              <select id="session-vessel" className="form-select" value={selectedId} onChange={selectVessel}>
                {state.vessels.map(item => <option key={item.id} value={item.id}>{item.name} · IMO {item.imo || 'chưa khai báo'}</option>)}
                {session && !state.vessels.some(item => item.id === session.vesselId) && <option value={session.vesselId}>{getSessionVessel(session).name} (đã xóa khỏi đội tàu)</option>}
                <option value="new">+ Thêm tàu mới</option>
              </select>
              <p className="form-help">Chọn tàu đã lưu hoặc thêm tàu mới cho ca này.</p>
            </div>
          </>}
          <div className="vessel-form-heading"><h3>Hồ sơ tàu</h3><span>{selectedId === 'new' ? 'Tàu mới' : 'Tàu đã lưu'}</span></div>
          <div className="vessel-form-grid">
            {field('name', 'Tên tàu', 'VD: Dolphin 02')}
            {field('imo', 'Số IMO', '7 chữ số', { inputMode: 'numeric' })}
            {field('dwt', 'Trọng tải (DWT)', 'VD: 34000', { inputMode: 'decimal' })}
            {field('nationality', 'Quốc tịch', 'VD: Việt Nam')}
            {field('coating', 'Lớp phủ hầm', 'VD: Pure Epoxy (nếu biết)')}
          </div>
          <p className="form-help">{mode === 'vessel' ? 'Tàu được lưu để chọn khi tạo ca làm việc.' : 'Mỗi ca lưu riêng thông tin tàu tại thời điểm tạo hoặc sửa ca. Các ca khác giữ thông tin đã ghi nhận.'}</p>
          {vessel.name && vessel.dwt && <div className="vessel-form-preview"><strong>{vessel.name}</strong><span>{formatDwt(vessel.dwt)} DWT · {vessel.nationality || 'Chưa nhập quốc tịch'}</span></div>}
        </div>
        <div className="session-dialog-actions">
          <button className="btn btn-secondary" type="button" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" type="submit">{mode === 'vessel' ? 'Lưu tàu' : mode === 'edit' ? 'Lưu thay đổi' : 'Tạo ca & tiếp tục'}</button>
        </div>
      </form>
    </dialog>
  )
}
