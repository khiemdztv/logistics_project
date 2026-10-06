import { useApp } from '../context/AppContext'
import { Ship, ClipboardCheck, FileText, Settings, HelpCircle, Anchor, LayoutDashboard } from 'lucide-react'

export default function Sidebar() {
  const { state, dispatch } = useApp()
  
  const isInspection = state.currentView === 'inspection'
  
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', action: () => dispatch({ type: 'GO_DASHBOARD' }) },
    { id: 'inspect', icon: <ClipboardCheck size={20} />, label: 'Kiểm tra', action: () => { if (isInspection) dispatch({ type: 'SET_STEP', step: 1 }) } },
    { id: 'report', icon: <FileText size={20} />, label: 'Báo cáo', action: () => { if (isInspection) dispatch({ type: 'SET_STEP', step: 3 }) } },
    { id: 'settings', icon: <Settings size={20} />, label: 'Cài đặt', action: () => {} },
  ]

  const getActiveId = () => {
    if (state.currentView === 'dashboard') return 'dashboard'
    return 'inspect'
  }
  
  return (
    <nav className="sidebar" id="main-sidebar">
      <div 
        className="sidebar-logo" 
        title="Dolphin TankOps"
        onClick={() => dispatch({ type: 'GO_DASHBOARD' })}
      >
        D
      </div>
      
      {navItems.map(item => (
        <button
          key={item.id}
          className={`sidebar-item ${getActiveId() === item.id ? 'active' : ''}`}
          onClick={item.action}
          title={item.label}
          id={`nav-${item.id}`}
        >
          {item.icon}
          <span className="sidebar-item-label">{item.label}</span>
        </button>
      ))}
      
      <div className="sidebar-spacer" />
      
      <button
        className="sidebar-item"
        title="Trợ giúp"
        id="nav-help"
        onClick={() => dispatch({ type: 'TOGGLE_AI_CHAT' })}
      >
        <HelpCircle size={20} />
        <span className="sidebar-item-label">Trợ giúp</span>
      </button>
    </nav>
  )
}
