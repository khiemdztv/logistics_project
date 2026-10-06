import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { WATER_WHITE_AREAS, VESSEL_HOLDS } from '../data/cargoData'
import {
  Layers,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Eye,
  ShieldCheck,
  Check
} from 'lucide-react'

export default function Step2WaterWhite() {
  const { state, dispatch } = useApp()
  const [selectedAreaId, setSelectedAreaId] = useState('ceiling')
  const [notes, setNotes] = useState('')

  const holdInfo = VESSEL_HOLDS.find(h => h.id === state.selectedHold) || {
    name: 'Hold #2P (Portside)',
    capacity: '1,200 m³'
  }

  const checklist = state.waterWhiteChecklist

  // Calculate status summary
  const summary = useMemo(() => {
    let passCount = 0
    let failCount = 0
    let uncheckedCount = 0
    const failedAreas = []

    WATER_WHITE_AREAS.forEach(area => {
      const status = checklist[area.id]
      if (status === 'pass') passCount++
      else if (status === 'fail') {
        failCount++
        failedAreas.push(area.name)
      } else uncheckedCount++
    })

    const allPassed = passCount === WATER_WHITE_AREAS.length
    const hasFail = failCount > 0

    return { passCount, failCount, uncheckedCount, failedAreas, allPassed, hasFail }
  }, [checklist])

  const handleStatusChange = (areaId, status) => {
    dispatch({ type: 'SET_WATER_WHITE_CHECK', areaId, status })
    const area = WATER_WHITE_AREAS.find(a => a.id === areaId)
    dispatch({
      type: 'ADD_LOG',
      text: `Kiểm tra ${area?.name}: ${status === 'pass' ? 'ĐẠT' : 'KHÔNG ĐẠT'}`,
      logType: status
    })
  }

  const handlePassAll = () => {
    WATER_WHITE_AREAS.forEach(area => {
      dispatch({ type: 'SET_WATER_WHITE_CHECK', areaId: area.id, status: 'pass' })
    })
    dispatch({ type: 'ADD_LOG', text: 'Đánh giá cảm quan Water White: TẤT CẢ 7 KHU VỰC ĐỀU ĐẠT', logType: 'pass' })
  }

  const handleSimulateFail = () => {
    WATER_WHITE_AREAS.forEach(area => {
      const status = area.id === 'bottom' ? 'fail' : 'pass'
      dispatch({ type: 'SET_WATER_WHITE_CHECK', areaId: area.id, status })
    })
    dispatch({ type: 'ADD_LOG', text: 'Phát hiện vết bẩn/ẩm tại Đáy hầm - Cần lau khô và rửa lại', logType: 'fail' })
  }

  const handleReset = () => {
    dispatch({ type: 'RESET_WATER_WHITE' })
    dispatch({ type: 'ADD_LOG', text: 'Thiết lập lại danh mục kiểm tra cảm quan hầm', logType: 'warning' })
  }

  const selectedArea = WATER_WHITE_AREAS.find(a => a.id === selectedAreaId)

  return (
    <div className="step-content">
      {/* LEFT COLUMN: Digital Checklist */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Layers className="card-title-icon" size={20} />
              Checklist Kiểm Tra Cảm Quan (Water White Standard)
            </h2>
            <p className="card-subtitle">
              Tiêu chuẩn: SẠCH KHÔ TUYỆT ĐỐI • KHÔNG MÙI • KHÔNG GỈ VẢY • KHÔNG DỊ VẬT
            </p>
          </div>
          <span className="badge badge-info">{holdInfo.name}</span>
        </div>

        {/* 4 Core Inspection Criteria */}
        <div className="inspection-criteria">
          <div style={{ padding: '8px', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent-cyan)' }}>SẠCH BỀ MẶT</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Không cặn dầu/bẩn</div>
          </div>
          <div style={{ padding: '8px', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent-cyan)' }}>KHÔ RÁO</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Không đọng nước/ẩm</div>
          </div>
          <div style={{ padding: '8px', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent-cyan)' }}>KHÔNG MÙI</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Hết hơi hàng cũ</div>
          </div>
          <div style={{ padding: '8px', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent-cyan)' }}>KHÔNG DỊ VẬT</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Không giẻ/gỉ sắt</div>
          </div>
        </div>

        {/* Quick fill buttons */}
        <div className="inspection-toolbar">
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Các khu vực cần kiểm tra
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn btn-sm btn-secondary"
              onClick={handlePassAll}
              type="button"
            >
              <Check size={14} /> Tất cả ĐẠT
            </button>
            <button
              className="btn btn-sm btn-secondary"
              style={{ color: 'var(--color-fail)' }}
              onClick={handleSimulateFail}
              type="button"
            >
              Mô phỏng lỗi Đáy hầm
            </button>
          </div>
        </div>

        {/* 7 Area Checklist Items */}
        <div className="checklist" style={{ marginBottom: 'var(--space-xl)' }}>
          {WATER_WHITE_AREAS.map((area, idx) => {
            const status = checklist[area.id]
            const isSelected = selectedAreaId === area.id

            return (
              <div
                key={area.id}
                className={`checklist-item ${status === 'pass' ? 'checked-pass' : status === 'fail' ? 'checked-fail' : ''}`}
                style={{
                  outline: isSelected ? '2px solid var(--color-accent-cyan)' : 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedAreaId(area.id)}
              >
                <div className="checklist-area-name">
                  <span style={{ color: 'var(--color-text-muted)', marginRight: '6px' }}>#{idx + 1}</span>
                  {area.name}
                </div>

                <div className="checklist-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`checklist-btn pass-btn ${status === 'pass' ? 'active' : ''}`}
                    onClick={() => handleStatusChange(area.id, 'pass')}
                    type="button"
                  >
                    ĐẠT
                  </button>
                  <button
                    className={`checklist-btn fail-btn ${status === 'fail' ? 'active' : ''}`}
                    onClick={() => handleStatusChange(area.id, 'fail')}
                    type="button"
                  >
                    KHÔNG ĐẠT
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Note input */}
        <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
          <label className="form-label" htmlFor="inspection-notes">
            Ghi Chú Giám Định Chi Tiết
          </label>
          <input
            id="inspection-notes"
            type="text"
            className="form-input"
            placeholder="VD: Đã soi đèn rọi hầm, không phát hiện màng film dầu thực vật..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Actions Footer */}
        <div className="inspection-actions">
          <button
            className="btn btn-secondary"
            onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
          >
            <ArrowLeft size={18} />
            <span>Quay Lại Bước 1</span>
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              title="Xóa trắng danh mục"
            >
              <RotateCcw size={18} />
              <span>Thiết Lập Lại</span>
            </button>

            <button
              className="btn btn-primary"
              disabled={!summary.allPassed}
              onClick={() => dispatch({ type: 'COMPLETE_INSPECTION' })}
              id="complete-waterwhite-btn"
            >
              <span>Tiếp Tục Xuất Báo Cáo</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Visual Inspection Preview & Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        {/* Hold Area Visualizer */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Eye className="card-title-icon" size={18} />
                Vùng Kết Cấu Đang Giám Định
              </h3>
              <p className="card-subtitle">{selectedArea?.name || 'Trần hầm'}</p>
            </div>
            <span className={`badge ${checklist[selectedAreaId] === 'pass' ? 'badge-pass' : checklist[selectedAreaId] === 'fail' ? 'badge-fail' : 'badge-neutral'}`}>
              {checklist[selectedAreaId] === 'pass' ? 'Đã kiểm tra: ĐẠT' : checklist[selectedAreaId] === 'fail' ? 'Cần xử lý lại' : 'Chưa kiểm tra'}
            </span>
          </div>

          {/* Area Diagram visual box */}
          <div
            style={{
              height: '240px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #0B132B 0%, #17274D 100%)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              padding: '20px'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {selectedArea?.icon}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {selectedArea?.name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '6px', maxWidth: '300px' }}>
              Kiểm tra tình trạng sơn Epoxy, các góc gân gia cường, giếng hút khô cặn và đường ống hoa tiêu.
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-sm btn-pass"
                onClick={() => handleStatusChange(selectedAreaId, 'pass')}
              >
                Xác Nhận ĐẠT
              </button>
              <button
                className="btn btn-sm btn-fail"
                onClick={() => handleStatusChange(selectedAreaId, 'fail')}
              >
                Báo KHÔNG ĐẠT
              </button>
            </div>
          </div>
        </div>

        {/* Overall Assessment Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                Tổng hợp kiểm tra hầm hàng
              </h3>
              <p className="card-subtitle">Tiến độ kiểm tra cảm quan</p>
            </div>
          </div>

          {/* Summary counters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: 'var(--space-lg)' }}>
            <div style={{ padding: '12px', background: 'var(--color-pass-bg)', border: '1px solid var(--color-pass-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-pass)' }}>
                {summary.passCount}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>KHU VỰC ĐẠT</div>
            </div>

            <div style={{ padding: '12px', background: 'var(--color-fail-bg)', border: '1px solid var(--color-fail-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-fail)' }}>
                {summary.failCount}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>KHÔNG ĐẠT</div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(100, 116, 139, 0.15)', border: '1px solid rgba(100, 116, 139, 0.2)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-muted)' }}>
                {summary.uncheckedCount}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>CHƯA KIỂM TRA</div>
            </div>
          </div>

          {/* Decision feedback */}
          {summary.hasFail ? (
            <div className="alert alert-fail">
              <AlertTriangle className="alert-icon" size={20} color="var(--color-fail)" />
              <div className="alert-content">
                <div className="alert-title" style={{ color: 'var(--color-fail)' }}>
                  Yêu Cầu Làm Sạch Lại: {summary.failedAreas.join(', ')}
                </div>
                <div className="alert-text">
                  Phát hiện cặn bẩn hoặc ẩm ướt tại các vị trí trên. Sĩ quan cần chỉ đạo đội thủ công vào hầm lau khô và xịt rửa lại cục bộ trước khi cho phép cấp chứng chỉ.
                </div>
              </div>
            </div>
          ) : summary.allPassed ? (
            <div className="alert alert-pass">
              <ShieldCheck className="alert-icon" size={20} color="var(--color-pass)" />
              <div className="alert-content">
                <div className="alert-title" style={{ color: 'var(--color-pass)' }}>
                  Hầm Hàng Đạt Chuẩn Water White 7/7 Vị Trí
                </div>
                <div className="alert-text">
                  Bề mặt sơn Epoxy sáng bóng, khô ráo, hoàn toàn không có mùi hàng cũ. Đủ điều kiện nhận hàng nối tiếp an toàn.
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              <div className="alert-content">
                <div className="alert-title">Tiếp tục kiểm tra các vị trí còn lại</div>
                <div className="alert-text">
                  Cần hoàn tất đánh giá đủ 7 vị trí kết cấu để hệ thống mở khóa chức năng xuất biên bản.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
