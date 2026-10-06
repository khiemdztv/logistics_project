import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function Header() {
  const { state } = useApp()
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])
  const viewName = state.currentView === 'dashboard' ? 'Tổng quan' : state.currentStep === 3 ? 'Báo cáo' : 'Kiểm tra hầm hàng'

  return (
    <header className="header" id="main-header">
      <div className="header-workspace">
        <div className="header-breadcrumb"><span>Dolphin TankOps</span><span aria-hidden="true">/</span><strong>{viewName}</strong></div>
        <div className="header-vessel-summary">
          <span>DOLPHIN 01</span><span>{state.dwt} DWT</span><span>Pure Epoxy</span>
        </div>
      </div>
      <div className="header-route"><span className="header-info-label">Hải trình</span><span>{state.route || 'Hải Phòng → Singapore'}</span></div>
      <div className="header-time">
        <time dateTime={time.toISOString()}>{time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time>
        <span>{time.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
      </div>
    </header>
  )
}
