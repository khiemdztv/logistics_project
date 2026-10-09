import { useEffect, useRef } from 'react'
import { X, Trash2, Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatDwt } from '../data/vesselData.js'

export default function FleetManager({ onClose, onAdd }) {
  const { state, dispatch } = useApp()
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  const remove = vessel => {
    if (window.confirm(`Xóa tàu ${vessel.name} khỏi đội tàu? Các ca và báo cáo cũ vẫn giữ nguyên thông tin tàu.`)) {
      dispatch({ type: 'DELETE_VESSEL', vesselId: vessel.id })
    }
  }

  return (
    <dialog ref={dialogRef} className="session-dialog fleet-dialog" aria-labelledby="fleet-dialog-title"
      onCancel={event => { event.preventDefault(); onClose() }}>
      <div className="session-dialog-header">
        <div><p className="page-eyebrow">Đội tàu</p><h2 id="fleet-dialog-title">Quản lý tàu <span className="field-optional">({state.vessels.length})</span></h2></div>
        <button className="dialog-close" onClick={onClose} aria-label="Đóng danh sách tàu"><X size={19} /></button>
      </div>
      <div className="session-dialog-body">
        <p className="form-help">Xóa tàu khỏi danh sách chọn cho ca mới. Ca và báo cáo đã tạo vẫn giữ thông tin của tàu.</p>
        <div className="fleet-list">
          {state.vessels.map(vessel => <article className="fleet-list-item" key={vessel.id}>
            <div><h3>{vessel.name}</h3><p>IMO {vessel.imo || 'chưa khai báo'} · {formatDwt(vessel.dwt)} DWT</p><p>{vessel.nationality || 'Chưa khai báo quốc tịch'}</p><small>{state.sessions.filter(session => session.vesselId === vessel.id).length} ca đã tạo</small></div>
            <button className="btn btn-secondary btn-sm fleet-delete" onClick={() => remove(vessel)} aria-label={`Xóa tàu ${vessel.name}`}><Trash2 size={15} aria-hidden="true" />Xóa</button>
          </article>)}
          {!state.vessels.length && <p className="fleet-empty">Chưa có tàu trong danh sách. Bạn có thể thêm tàu để tạo ca mới.</p>}
        </div>
      </div>
      <div className="session-dialog-actions"><button className="btn btn-secondary" onClick={onClose}>Đóng</button><button className="btn btn-primary" onClick={onAdd}><Plus size={17} />Thêm tàu</button></div>
    </dialog>
  )
}
