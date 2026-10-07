import { useApp } from '../context/AppContext'
import { getSessionVessel, formatDwt } from '../data/vesselData.js'
import { ClipboardCheck, FileText, LayoutDashboard, MessageCircle } from 'lucide-react'

export default function Sidebar() {
  const { state, dispatch } = useApp()
  const isInspection = state.currentView === 'inspection'
  const vessel = getSessionVessel(state)
  const activeId = !isInspection ? 'dashboard' : state.currentStep === 3 ? 'report' : 'inspect'
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan', action: () => dispatch({ type: 'GO_DASHBOARD' }) },
    { id: 'inspect', icon: ClipboardCheck, label: 'Kiểm tra hầm', disabled: !isInspection, action: () => dispatch({ type: 'SET_STEP', step: 1 }) },
    { id: 'report', icon: FileText, label: 'Báo cáo', disabled: !isInspection, action: () => dispatch({ type: 'SET_STEP', step: 3 }) },
  ]
  return (
    <nav className="sidebar" id="main-sidebar" aria-label="Điều hướng chính">
      <button className="sidebar-brand" onClick={() => dispatch({ type: 'GO_DASHBOARD' })} aria-label="Dolphin TankOps — Tổng quan">
        <span className="sidebar-logo" aria-hidden="true">D</span>
        <span className="sidebar-brand-text"><strong>Dolphin</strong><span>Tank operations</span></span>
      </button>
      <span className="sidebar-section-label">Không gian làm việc</span>
      {items.map(({ id, icon: Icon, label, action, disabled }) => (
        <button key={id} className={`sidebar-item ${activeId === id ? 'active' : ''}`} onClick={action}
          disabled={disabled} aria-current={activeId === id ? 'page' : undefined}
          title={disabled ? 'Mở hoặc tạo ca làm việc để sử dụng' : label} id={`nav-${id}`}>
          <Icon size={19} aria-hidden="true" /><span className="sidebar-item-label">{label}</span>
        </button>
      ))}
      <div className="sidebar-spacer" />
      <div className="sidebar-vessel">{isInspection ? <><span className="sidebar-section-label">Tàu của ca này</span><strong>{vessel.name}</strong><span>IMO {vessel.imo || 'chưa khai báo'}</span><span className="sidebar-vessel-spec">{formatDwt(vessel.dwt)} DWT · {vessel.nationality || 'Chưa khai báo quốc tịch'}</span></> : <><span className="sidebar-section-label">Đội tàu</span><strong>{state.vessels.length} tàu đang lưu</strong><span>Chọn tàu khi tạo ca làm việc.</span></>}</div>
      <button className={`sidebar-item sidebar-help ${state.aiChatOpen ? 'active' : ''}`} id="nav-help" onClick={() => dispatch({ type: 'TOGGLE_AI_CHAT' })} aria-expanded={state.aiChatOpen} aria-controls="copilot-panel">
        <MessageCircle size={19} aria-hidden="true" /><span className="sidebar-item-label">Trợ lý & tra cứu</span>
      </button>
    </nav>
  )
}
