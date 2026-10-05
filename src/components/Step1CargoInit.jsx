import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { CARGO_ITEMS, CARGO_GROUPS, VESSEL_HOLDS, checkCompatibility } from '../data/cargoData'
import { Package, ShieldCheck, ShieldAlert, ArrowRight, Sparkles, AlertTriangle, Layers, Droplets, Flame } from 'lucide-react'

export default function Step1CargoInit() {
  const { state, dispatch } = useApp()

  // Initialize defaults if empty
  useEffect(() => {
    if (!state.previousCargo) {
      dispatch({ type: 'SET_FIELD', field: 'previousCargo', value: 'palm_oil_crude' })
    }
    if (!state.newCargo) {
      dispatch({ type: 'SET_FIELD', field: 'newCargo', value: 'methanol' })
    }
    if (!state.selectedHold) {
      dispatch({ type: 'SET_FIELD', field: 'selectedHold', value: 'hold_2p' })
    }
  }, [])

  // Auto calculate compatibility whenever cargo changes
  useEffect(() => {
    if (state.previousCargo && state.newCargo) {
      const result = checkCompatibility(state.previousCargo, state.newCargo)
      dispatch({ type: 'SET_COMPATIBILITY', data: result })
      if (!state.selectedMethod) {
        dispatch({ type: 'SET_METHOD', method: result.method })
      }
    }
  }, [state.previousCargo, state.newCargo])

  const handlePrevCargoChange = (e) => {
    const val = e.target.value
    dispatch({ type: 'SET_FIELD', field: 'previousCargo', value: val })
    const result = checkCompatibility(val, state.newCargo)
    dispatch({ type: 'SET_COMPATIBILITY', data: result })
    dispatch({ type: 'SET_METHOD', method: result.method })
  }

  const handleNewCargoChange = (e) => {
    const val = e.target.value
    dispatch({ type: 'SET_FIELD', field: 'newCargo', value: val })
    const result = checkCompatibility(state.previousCargo, val)
    dispatch({ type: 'SET_COMPATIBILITY', data: result })
    dispatch({ type: 'SET_METHOD', method: result.method })
  }

  const prevItem = CARGO_ITEMS.find(c => c.id === state.previousCargo)
  const newItem = CARGO_ITEMS.find(c => c.id === state.newCargo)
  const prevGroup = prevItem ? CARGO_GROUPS[prevItem.group] : null
  const newGroup = newItem ? CARGO_GROUPS[newItem.group] : null
  const compat = state.compatibility

  const handleStartInspection = () => {
    if (!compat?.allowed) {
      alert('CẢNH BÁO: Lô hàng này thuộc danh mục CẤM xếp nối tiếp theo chuẩn FOSFA/IMO! Không thể tiến hành kiểm tra làm sạch.')
      return
    }
    dispatch({ type: 'START_INSPECTION' })
  }

  return (
    <div className="step-content">
      {/* LEFT COLUMN: Cargo & Hold Info */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Package className="card-title-icon" size={20} />
              Thông Tin Lô Hàng & Hầm Chứa
            </h2>
            <p className="card-subtitle">
              Nhập chi tiết chuyến hàng trước và chuyến kế tiếp để phân tích tương thích
            </p>
          </div>
          <span className="badge badge-info">Dolphin 01 • Epoxy</span>
        </div>

        {/* Previous cargo */}
        <div className="form-group">
          <label className="form-label" htmlFor="prev-cargo-select">
            1. Lô Hàng Vừa Dỡ (Chuyến Trước) <span style={{ color: 'var(--color-fail)' }}>*</span>
          </label>
          <select
            id="prev-cargo-select"
            className="form-select"
            value={state.previousCargo}
            onChange={handlePrevCargoChange}
          >
            {Object.keys(CARGO_GROUPS).map(groupKey => {
              const group = CARGO_GROUPS[groupKey]
              const items = CARGO_ITEMS.filter(c => c.group === groupKey)
              return (
                <optgroup key={groupKey} label={group.name}>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </optgroup>
              )
            })}
          </select>
          {prevGroup && (
            <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-neutral">Nhóm: {prevGroup.type}</span>
              <span style={{ fontStyle: 'italic' }}>{prevGroup.notes}</span>
            </div>
          )}
        </div>

        {/* New cargo */}
        <div className="form-group">
          <label className="form-label" htmlFor="new-cargo-select">
            2. Lô Hàng Sắp Nhận (Chuyến Kế Tiếp) <span style={{ color: 'var(--color-accent-cyan)' }}>*</span>
          </label>
          <select
            id="new-cargo-select"
            className="form-select"
            value={state.newCargo}
            onChange={handleNewCargoChange}
          >
            {Object.keys(CARGO_GROUPS).map(groupKey => {
              const group = CARGO_GROUPS[groupKey]
              const items = CARGO_ITEMS.filter(c => c.group === groupKey)
              return (
                <optgroup key={groupKey} label={group.name}>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </optgroup>
              )
            })}
          </select>
          {newGroup && (
            <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-info">Nhóm: {newGroup.type}</span>
              <span style={{ fontStyle: 'italic' }}>Phương pháp chuẩn: {newGroup.testMethod === 'WALL_WASH' ? 'Wall Wash' : 'Water White'}</span>
            </div>
          )}
        </div>

        {/* Hold Selection */}
        <div className="form-group">
          <label className="form-label" htmlFor="hold-select">
            3. Hầm Hàng Đang Xử Lý
          </label>
          <select
            id="hold-select"
            className="form-select"
            value={state.selectedHold}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'selectedHold', value: e.target.value })}
          >
            {VESSEL_HOLDS.map(hold => (
              <option key={hold.id} value={hold.id}>
                {hold.name} (Dung tích: {hold.capacity})
              </option>
            ))}
          </select>
        </div>

        {/* Voyage Route */}
        <div className="form-group">
          <label className="form-label" htmlFor="route-input">
            4. Hải Trình & Cảng Nhận Hàng
          </label>
          <input
            id="route-input"
            type="text"
            className="form-input"
            placeholder="VD: Hải Phòng ➔ Singapore ➔ Rotterdam"
            value={state.route || 'Hải Phòng ➔ Singapore'}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'route', value: e.target.value })}
          />
        </div>

        {/* Additional Notes */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="notes-textarea">
            5. Ghi Chú Của Đại Phó / Giám Sát Hầm
          </label>
          <textarea
            id="notes-textarea"
            className="form-textarea"
            placeholder="Ghi chú về tình trạng hầm hàng, lịch sử xông hơi, nhật ký trước đó..."
            value={state.additionalNotes}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'additionalNotes', value: e.target.value })}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Automated Analysis & Recommendation */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Sparkles className="card-title-icon" size={20} />
              Phân Tích Tương Thích & Đề Xuất Quy Trình
            </h2>
            <p className="card-subtitle">
              Hệ thống tự động tra cứu CSDL FOSFA Banned List và tiêu chuẩn MARPOL
            </p>
          </div>
        </div>

        {/* Compatibility Result Banner */}
        {compat && (
          <div className={`compat-result ${compat.allowed ? 'allowed' : 'forbidden'}`}>
            <div className="compat-result-icon">
              {compat.allowed ? (
                <ShieldCheck size={32} color="var(--color-pass)" />
              ) : (
                <ShieldAlert size={32} color="var(--color-fail)" />
              )}
            </div>
            <div>
              <div className="compat-result-text" style={{ color: compat.allowed ? 'var(--color-pass)' : 'var(--color-fail)' }}>
                {compat.allowed
                  ? 'ĐƯỢC PHÉP XẾP HÀNG NỐI TIẾP'
                  : 'CẤM XẾP NỐI TIẾP THEO QUY ĐỊNH QUỐC TẾ!'}
              </div>
              <div className="compat-result-note">
                {compat.allowed
                  ? 'Hàng hóa tương thích theo ma trận an toàn FOSFA & MARPOL Annex II. Sẵn sàng vệ sinh kiểm tra.'
                  : 'Lô hàng cũ nằm trong danh mục cấm xếp trước theo FOSFA Banned Immediate Previous Cargoes. Nguy cơ nhiễm bẩn nghiêm trọng!'}
              </div>
            </div>
          </div>
        )}

        {/* Specific Notes & Warnings */}
        {compat && compat.notes.length > 0 && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              CHỈ DẪN KỸ THUẬT QUAN TRỌNG:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {compat.notes.map((note, idx) => (
                <div key={idx} className="alert alert-info" style={{ padding: '10px 14px' }}>
                  <AlertTriangle size={18} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Method Selection */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            PHƯƠNG PHÁP KIỂM TRA ĐỀ XUẤT:
          </div>

          <div className="method-selector">
            {/* Wall Wash Option */}
            <div
              className={`method-option ${state.selectedMethod === 'WALL_WASH' ? 'selected' : ''} ${compat?.method === 'WALL_WASH' ? 'recommended' : ''}`}
              onClick={() => dispatch({ type: 'SET_METHOD', method: 'WALL_WASH' })}
            >
              <div className="method-radio" />
              <div>
                <div className="method-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Droplets size={18} color="var(--color-accent-cyan)" />
                  WALL WASH STANDARD (Kiểm Tra Bằng Hóa Chất)
                </div>
                <div className="method-desc">
                  Thực hiện phun dung môi (Methanol/Acetone), hứng dịch rửa và kiểm tra 5 chỉ tiêu hóa nghiệm: Độ mặn, PTT, APHA, Hydrocarbon, Chloride. Bắt buộc cho hàng tinh khiết.
                </div>
              </div>
            </div>

            {/* Water White Option */}
            <div
              className={`method-option ${state.selectedMethod === 'WATER_WHITE' ? 'selected' : ''} ${compat?.method === 'WATER_WHITE' ? 'recommended' : ''}`}
              onClick={() => dispatch({ type: 'SET_METHOD', method: 'WATER_WHITE' })}
            >
              <div className="method-radio" />
              <div>
                <div className="method-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="var(--color-pass)" />
                  WATER WHITE STANDARD (Kiểm Tra Cảm Quan Mắt Thường)
                </div>
                <div className="method-desc">
                  Kiểm tra cảm quan theo tiêu chuẩn SẠCH - KHÔ - KHÔNG MÙI - KHÔNG DỊ VẬT trên 7 vùng kết cấu hầm. Áp dụng cho các mặt hàng dầu thô, dầu nhiên liệu hoặc hàng thông thường.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cleaning Procedure Timeline */}
        {prevGroup && (
          <div className="wash-procedure">
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              QUY TRÌNH RỬA HẦM TIÊU CHUẨN (HẢI TRÌNH):
            </div>
            {prevGroup.cleaning.map((stepDesc, idx) => (
              <div key={idx} className="wash-step">
                <div className="wash-step-number">{idx + 1}</div>
                <div className="wash-step-content">
                  <div className="wash-step-title">Giai đoạn {idx + 1}</div>
                  <div className="wash-step-desc">{stepDesc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to action */}
        <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleStartInspection}
            disabled={!compat?.allowed}
            id="start-inspection-btn"
          >
            <span>Tiến Hành Kiểm Tra Hầm Hàng</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
