import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { CARGO_ITEMS, VESSEL_HOLDS } from '../data/cargoData'
import { Plus, Copy, Trash2, RotateCcw, MoreHorizontal, ArrowRight, Search, Pencil } from 'lucide-react'
import SessionDialog from './SessionDialog'
import { getSessionVessel, formatDwt } from '../data/vesselData.js'

const STATUS = {
  passed: { label: 'Đạt', className: 'badge-pass' },
  failed: { label: 'Chưa đạt', className: 'badge-fail' },
  in_progress: { label: 'Đang thực hiện', className: 'badge-warning' },
}
const FILTERS = [{ id: 'all', label: 'Tất cả' }, { id: 'in_progress', label: 'Đang thực hiện' }, { id: 'passed', label: 'Đạt' }, { id: 'failed', label: 'Chưa đạt' }]

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [vesselFilter, setVesselFilter] = useState('all')
  const [dialog, setDialog] = useState(null)
  const menuRef = useRef(null)
  const sessions = state.sessions || []
  const cargoName = id => CARGO_ITEMS.find(item => item.id === id)?.name || id || 'Chưa chọn hàng'
  const holdName = session => session.holdName || [...(state.customHolds || []), ...VESSEL_HOLDS].find(hold => hold.id === session.selectedHold)?.name || 'Chưa chọn hầm'
  const statusOf = session => STATUS[session.status] || STATUS.in_progress
  const normalize = text => text.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd')
  const visible = sessions.filter(session => (filter === 'all' || (session.status || 'in_progress') === filter)
    && (vesselFilter === 'all' || getSessionVessel(session).id === vesselFilter)
    && normalize([session.sessionName || '', getSessionVessel(session).name, getSessionVessel(session).imo, holdName(session), cargoName(session.previousCargo), cargoName(session.newCargo), session.route || ''].join(' ')).includes(normalize(search.trim())))
  const createNew = () => setDialog({ mode: 'create' })

  useEffect(() => {
    if (!menuOpenId) return
    const closeOutside = event => { if (!menuRef.current?.contains(event.target)) setMenuOpenId(null) }
    const closeEscape = event => { if (event.key === 'Escape') setMenuOpenId(null) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape) }
  }, [menuOpenId])

  const sessionAction = (type, sessionId) => {
    if (type !== 'DELETE_SESSION' || window.confirm('Bạn có chắc muốn xóa phiên làm việc này?')) dispatch({ type, sessionId })
    setMenuOpenId(null)
  }
  const formatDate = value => value ? new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Chưa ghi nhận thời gian'

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div><p className="page-eyebrow">Điều hành hầm hàng</p><h1 className="dashboard-title">Ca làm việc</h1><p className="dashboard-subtitle">Theo dõi kiểm tra, kết quả và báo cáo của đội tàu.</p></div>
        <div className="dashboard-header-actions"><button className="btn btn-secondary" onClick={() => setDialog({ mode: 'vessel' })}>Thêm tàu</button><button className="btn btn-primary" onClick={createNew}><Plus size={18} aria-hidden="true" />Tạo ca mới</button></div>
      </div>
      <div className="dashboard-stats" aria-label="Tổng hợp ca làm việc">
        {[{ label: 'Tổng số ca', value: sessions.length, type: 'all' }, ...FILTERS.slice(1).map(item => ({ label: item.label, value: sessions.filter(session => (session.status || 'in_progress') === item.id).length, type: item.id }))].map(stat => (
          <div className={`dashboard-stat ${stat.type}`} key={stat.type}><span className="dashboard-stat-label">{stat.label}</span><strong>{stat.value.toString().padStart(2, '0')}</strong><span className="dashboard-stat-note">{stat.type === 'all' ? 'Lưu trên thiết bị này' : stat.type === 'in_progress' ? 'Cần tiếp tục kiểm tra' : stat.type === 'passed' ? 'Hoàn tất kiểm tra' : 'Cần kiểm tra lại'}</span></div>
        ))}
      </div>
      <section className="session-section" aria-labelledby="session-list-title">
        <div className="session-section-heading"><h2 id="session-list-title">Danh sách ca làm việc <span>{sessions.length}</span></h2><p>{state.vessels.length} tàu · Mở một ca để tiếp tục thao tác.</p></div>
        <div className="dashboard-toolbar">
          <div className="dashboard-filters" role="group" aria-label="Lọc theo trạng thái">{FILTERS.map(item => <button key={item.id} className={filter === item.id ? 'active' : ''} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
          <div className="dashboard-search-controls"><select className="form-select vessel-filter" aria-label="Lọc ca theo tàu" value={vesselFilter} onChange={event => setVesselFilter(event.target.value)}><option value="all">Tất cả tàu</option>{state.vessels.map(vessel => <option key={vessel.id} value={vessel.id}>{vessel.name}</option>)}</select><label className="dashboard-search"><Search size={17} aria-hidden="true" /><input aria-label="Tìm ca, tên tàu, IMO, hầm hoặc hàng" type="search" placeholder="Tìm ca, tàu, IMO, hầm…" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
        </div>
        {visible.length ? (
          <div className="dashboard-grid">{visible.map(session => (
            <article key={session.id} className={`dashboard-card ${session.status || 'in_progress'}`}>
              <div className="dashboard-card-header"><span className={`badge ${statusOf(session).className}`}><span className="status-dot" aria-hidden="true" />{statusOf(session).label}</span>
                <div className="session-menu-wrap" ref={menuOpenId === session.id ? menuRef : undefined}>
                  <button className="dashboard-card-menu-btn" aria-label={`Thao tác với ${holdName(session)}`} aria-expanded={menuOpenId === session.id} onClick={() => setMenuOpenId(menuOpenId === session.id ? null : session.id)}><MoreHorizontal size={20} /></button>
                  {menuOpenId === session.id && <div className="dashboard-card-menu"><button onClick={() => { setDialog({ mode: 'edit', session }); setMenuOpenId(null) }}><Pencil size={15} />Sửa tên ca & tàu</button><button onClick={() => sessionAction('COPY_SESSION', session.id)}><Copy size={15} />Nhân bản ca</button><button onClick={() => sessionAction('RESET_SESSION', session.id)}><RotateCcw size={15} />Đặt lại dữ liệu</button><button className="danger" onClick={() => sessionAction('DELETE_SESSION', session.id)}><Trash2 size={15} />Xóa ca làm việc</button></div>}
                </div>
              </div>
              <button className="session-open" onClick={() => { dispatch({ type: 'LOAD_SESSION', sessionId: session.id }); setMenuOpenId(null) }} aria-label={`Mở ca ${session.sessionName || holdName(session)} của ${getSessionVessel(session).name}`}>
                <span className="session-vessel"><strong>{getSessionVessel(session).name}</strong><small>IMO {getSessionVessel(session).imo || 'chưa khai báo'} · {formatDwt(getSessionVessel(session).dwt)} DWT</small><small>{getSessionVessel(session).nationality || 'Chưa khai báo quốc tịch'}</small></span>
                <h3>{session.sessionName || 'Ca kiểm tra hầm hàng'}</h3>
                <span className="session-hold">{holdName(session)}</span>
                <span className="session-cargo-route"><span><small>Hàng vừa dỡ</small><strong>{cargoName(session.previousCargo)}</strong></span><ArrowRight size={16} aria-hidden="true" /><span><small>Hàng sắp nhận</small><strong>{cargoName(session.newCargo)}</strong></span></span>
                <span className="session-route">{session.route || 'Chưa ghi nhận hải trình'}</span>
                <span className="session-footer"><time>{formatDate(session.createdAt)}</time><span className="session-open-label">Mở ca <ArrowRight size={14} aria-hidden="true" /></span></span>
              </button>
            </article>
          ))}</div>
        ) : (
          <div className="dashboard-empty">
            <span className="empty-section-label">{sessions.length ? 'Kết quả tìm kiếm' : 'Bắt đầu công việc'}</span>
            <h3>{sessions.length ? 'Chưa tìm thấy ca phù hợp' : 'Ca làm việc đầu tiên của bạn'}</h3>
            <p>{sessions.length ? 'Thử từ khóa khác hoặc xem lại tất cả trạng thái.' : 'Tạo một ca để lưu thông tin hầm hàng, thực hiện kiểm tra và tổng hợp báo cáo.'}</p>
            {sessions.length ? <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilter('all'); setVesselFilter('all') }}>Xóa bộ lọc</button> : <button className="btn btn-primary" onClick={createNew}><Plus size={17} aria-hidden="true" />Tạo ca làm việc</button>}
            {!sessions.length && <div className="empty-workflow">{['Chọn hàng & hầm', 'Thực hiện kiểm tra', 'Tổng hợp báo cáo'].map((label, index) => <span key={label}><b>0{index + 1}</b>{label}</span>)}</div>}
          </div>
        )}
      </section>
      {dialog && <SessionDialog {...dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}
