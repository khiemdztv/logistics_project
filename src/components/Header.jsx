import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Anchor, Clock, MapPin, Gauge } from 'lucide-react'

export default function Header() {
  const { state } = useApp()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <header className="header" id="main-header">
      <div className="header-vessel-info">
        <span className="header-vessel-icon" title="Tàu Chở Dầu & Hóa Chất">
          <Anchor size={28} color="var(--color-accent-cyan)" />
        </span>
        <div>
          <div className="header-vessel-name">DOLPHIN 01</div>
          <div className="header-vessel-imo">IMO: 9876543 • Tàu Hóa Chất / Oil Tanker</div>
        </div>
      </div>

      <div className="header-divider" />

      <div className="header-info-item">
        <span className="header-info-label">Trọng tải DWT</span>
        <span className="header-info-value">{state.dwt} MT</span>
      </div>

      <div className="header-divider" />

      <div className="header-info-item">
        <span className="header-info-label">Tuyến hành trình</span>
        <span className="header-info-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={14} color="var(--color-accent-blue)" />
          {state.route || 'Hải Phòng ➔ Singapore'}
        </span>
      </div>

      <div className="header-divider" />

      <div className="header-info-item">
        <span className="header-info-label">Lớp phủ hầm</span>
        <span className="header-info-value" style={{ color: 'var(--color-accent-cyan)' }}>
          Pure Epoxy (Hạn chế xông nhiệt)
        </span>
      </div>

      <div className="header-spacer" />

      <div className="header-status">
        <span className="header-status-dot" />
        <span>Hệ thống trực tuyến</span>
      </div>

      <div className="header-time">
        <div className="header-time-clock">{formatTime(time)}</div>
        <div className="header-time-date">{formatDate(time)}</div>
      </div>
    </header>
  )
}
