import { useApp } from '../context/AppContext'
import { Ship, ClipboardCheck, FileText, Settings, HelpCircle, Anchor } from 'lucide-react'

export default function Sidebar() {
  const { state, dispatch } = useApp()
  
  const navItems = [
    { id: 'home', icon: <Anchor size={20} />, label: 'Trang chủ', step: null },
    { id: 'inspect', icon: <ClipboardCheck size={20} />, label: 'Kiểm tra', step: 1 },
    { id: 'report', icon: <FileText size={20} />, label: 'Báo cáo', step: 3 },
    { id: 'settings', icon: <Settings size={20} />, label: 'Cài đặt', step: null },
  ]
  
  return (
    <nav className="sidebar" id="main-sidebar">
      <div className="sidebar-logo" title="Dolphin TankOps">
        D
      </div>
      
      {navItems.map(item => (
        <button
          key={item.id}
          className={`sidebar-item ${item.id === 'inspect' ? 'active' : ''}`}
          onClick={() => {
            if (item.step !== null) {
              dispatch({ type: 'SET_STEP', step: item.step })
            }
          }}
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
