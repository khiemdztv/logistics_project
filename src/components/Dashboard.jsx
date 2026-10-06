import { useApp } from '../context/AppContext'
import { CARGO_ITEMS, VESSEL_HOLDS } from '../data/cargoData'
import { 
  Plus, Clock, CheckCircle2, XCircle, Loader2, 
  Copy, Trash2, RotateCcw, Ship, Anchor,
  MoreVertical, Calendar, MapPin
} from 'lucide-react'
import { useState } from 'react'

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const [menuOpenId, setMenuOpenId] = useState(null)

  const sessions = state.sessions || []

  const getStatusBadge = (status) => {
    switch (status) {
      case 'passed':
        return (
          <span className="badge badge-pass" style={{ gap: '4px' }}>
            <CheckCircle2 size={12} /> Đạt
          </span>
        )
      case 'failed':
        return (
          <span className="badge badge-fail" style={{ gap: '4px' }}>
            <XCircle size={12} /> Chưa đạt
          </span>
        )
      default:
        return (
          <span className="badge badge-info" style={{ gap: '4px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Loader2 size={12} /> Đang làm
          </span>
        )
    }
  }

  const getCargoName = (cargoId) => {
    const item = CARGO_ITEMS.find(c => c.id === cargoId)
    return item ? item.name : cargoId || 'Chưa chọn'
  }

  const getHoldName = (holdId) => {
    // Check custom holds first
    const custom = (state.customHolds || []).find(h => h.id === holdId)
    if (custom) return custom.name
    const hold = VESSEL_HOLDS.find(h => h.id === holdId)
    return hold ? hold.name : holdId || 'Chưa chọn'
  }

  const handleCreateNew = () => {
    dispatch({ type: 'CREATE_SESSION' })
  }

  const handleOpenSession = (sessionId) => {
    dispatch({ type: 'LOAD_SESSION', sessionId })
    setMenuOpenId(null)
  }

  const handleCopySession = (e, sessionId) => {
    e.stopPropagation()
    dispatch({ type: 'COPY_SESSION', sessionId })
    setMenuOpenId(null)
  }

  const handleResetSession = (e, sessionId) => {
    e.stopPropagation()
    dispatch({ type: 'RESET_SESSION', sessionId })
    setMenuOpenId(null)
  }

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation()
    if (window.confirm('Bạn có chắc muốn xóa phiên làm việc này?')) {
      dispatch({ type: 'DELETE_SESSION', sessionId })
    }
    setMenuOpenId(null)
  }

  const toggleMenu = (e, id) => {
    e.stopPropagation()
    setMenuOpenId(menuOpenId === id ? null : id)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
           ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            <Anchor size={28} className="dashboard-title-icon" />
            Lịch Sử Ca Làm Việc
          </h1>
          <p className="dashboard-subtitle">
            Quản lý các phiên kiểm tra hầm hàng — Tàu DOLPHIN 01
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleCreateNew}>
          <Plus size={20} />
          <span>Tạo Ca Làm Việc Mới</span>
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="dashboard-grid">
        {sessions.map(session => (
          <div 
            key={session.id} 
            className={`dashboard-card ${session.status}`}
            onClick={() => handleOpenSession(session.id)}
          >
            {/* Card Header */}
            <div className="dashboard-card-header">
              <div className="dashboard-card-hold">
                <Ship size={16} />
                <span>{session.holdName || getHoldName(session.selectedHold)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {getStatusBadge(session.status)}
                {/* Menu button */}
                <div style={{ position: 'relative' }}>
                  <button 
                    className="dashboard-card-menu-btn"
                    onClick={(e) => toggleMenu(e, session.id)}
                    type="button"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpenId === session.id && (
                    <div className="dashboard-card-menu" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => handleCopySession(e, session.id)}>
                        <Copy size={14} /> Nhân bản
                      </button>
                      <button onClick={(e) => handleResetSession(e, session.id)}>
                        <RotateCcw size={14} /> Reset dữ liệu
                      </button>
                      <button className="danger" onClick={(e) => handleDeleteSession(e, session.id)}>
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="dashboard-card-body">
              <div className="dashboard-card-cargo">
                <div className="dashboard-card-cargo-label">Hàng cũ:</div>
                <div className="dashboard-card-cargo-value">{getCargoName(session.previousCargo)}</div>
              </div>
              <div className="dashboard-card-arrow">→</div>
              <div className="dashboard-card-cargo">
                <div className="dashboard-card-cargo-label">Hàng mới:</div>
                <div className="dashboard-card-cargo-value">{getCargoName(session.newCargo)}</div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="dashboard-card-footer">
              <div className="dashboard-card-meta">
                <Calendar size={12} />
                <span>{formatDate(session.createdAt)}</span>
              </div>
              {session.route && (
                <div className="dashboard-card-meta">
                  <MapPin size={12} />
                  <span>{session.route}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Create New Card */}
        <div className="dashboard-card dashboard-card-new" onClick={handleCreateNew}>
          <div className="dashboard-card-new-content">
            <div className="dashboard-card-new-icon">
              <Plus size={32} />
            </div>
            <div className="dashboard-card-new-text">Tạo Ca Làm Việc Mới</div>
            <div className="dashboard-card-new-hint">Click để bắt đầu phiên kiểm tra hầm hàng</div>
          </div>
        </div>
      </div>
    </div>
  )
}
