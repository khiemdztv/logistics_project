import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getSessionVessel, formatDwt } from '../data/vesselData.js'

export default function Header() {
  const { state } = useApp()
  const vessel = getSessionVessel(state)
  const isInspection = state.currentView === 'inspection'
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
          {isInspection ? <><span>{vessel.name}</span><span>IMO {vessel.imo || 'chưa khai báo'}</span><span>{formatDwt(vessel.dwt)} DWT</span><span>{vessel.nationality || 'Chưa khai báo quốc tịch'}</span></> : <><span>Quản lý đội tàu</span><span>{state.vessels.length} tàu</span><span>{state.sessions.length} ca làm việc</span></>}
        </div>
      </div>
      {isInspection && <div className="header-route"><span className="header-info-label">Hải trình</span><span>{state.route || 'Chưa khai báo'}</span></div>}
      <div className="header-time">
        <time dateTime={time.toISOString()}>{time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</time>
        <span>{time.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
      </div>
    </header>
  )
}
