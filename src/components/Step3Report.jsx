import { useApp } from '../context/AppContext'
import {
  CARGO_ITEMS,
  CARGO_GROUPS,
  VESSEL_HOLDS,
  WALL_WASH_THRESHOLDS,
  WATER_WHITE_AREAS
} from '../data/cargoData'
import {
  FileText,
  Printer,
  Download,
  RotateCcw,
  CheckCircle2,
  Anchor,
  Calendar,
  Clock,
  Award,
  ShieldCheck,
  UserCheck
} from 'lucide-react'

export default function Step3Report() {
  const { state, dispatch } = useApp()

  const prevItem = CARGO_ITEMS.find(c => c.id === state.previousCargo) || { name: 'Crude Palm Oil' }
  const newItem = CARGO_ITEMS.find(c => c.id === state.newCargo) || { name: 'Methanol' }
  const holdInfo = VESSEL_HOLDS.find(h => h.id === state.selectedHold) || {
    name: 'Hold #2P (Portside)',
    capacity: '1,200 m³'
  }

  const handlePrint = () => {
    window.print()
  }

  const handleNewInspection = () => {
    if (confirm('Bạn có chắc chắn muốn khởi tạo phiên kiểm tra mới? Dữ liệu hiện tại sẽ được lưu trữ vào nhật ký lưu trữ.')) {
      dispatch({ type: 'RESET_ALL' })
    }
  }

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const currentTime = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Top action toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Biên Bản Điện Tử & Chứng Nhận Làm Sạch Hầm Hàng
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Mã chứng chỉ: CERT-D01-{new Date().getFullYear()}-0892 • Lưu trữ bảo chứng số
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button className="btn btn-secondary" onClick={handleNewInspection}>
            <RotateCcw size={18} />
            <span>Kiểm Tra Hầm Mới</span>
          </button>

          <button className="btn btn-primary" onClick={handlePrint} id="print-report-btn">
            <Printer size={18} />
            <span>In / Xuất Bản PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Document Sheet */}
      <div
        className="card"
        id="certificate-print-sheet"
        style={{
          background: '#FFFFFF',
          color: '#0B132B',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Certificate Header */}
        <div
          style={{
            borderBottom: '3px double #0B132B',
            paddingBottom: '24px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  background: '#0B132B',
                  color: '#00E5FF',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '20px'
                }}
              >
                D
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '1px', margin: 0, color: '#0B132B' }}>
                  DOLPHIN TANKOPS MARITIME INSPECTION
                </h1>
                <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.5px' }}>
                  HỆ THỐNG GIÁM SÁT VÀ CHỨNG NHẬN LÀM SẠCH HẦM HÀNG TIÊU CHUẨN QUỐC TẾ
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                background: '#E8F5E9',
                border: '1px solid #4CAF50',
                borderRadius: '4px',
                color: '#2E7D32',
                fontWeight: 700,
                fontSize: '12px'
              }}
            >
              <CheckCircle2 size={16} /> ĐÃ DUYỆT ĐẠT CHUẨN
            </div>
            <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>
              Ngày cấp: {currentDate} • {currentTime}
            </div>
          </div>
        </div>

        {/* Certificate Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0B132B', margin: 0 }}>
            CHỨNG NHẬN KIỂM TRA ĐỘ TINH KHIẾT HẦM HÀNG
          </h2>
          <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#666', marginTop: '4px' }}>
            (TANK CLEANLINESS & WALL WASH INSPECTION CERTIFICATE)
          </div>
          <div style={{ fontSize: '12px', color: '#444', marginTop: '6px' }}>
            Tuân thủ Công ước MARPOL Annex II, FOSFA Code of Practice & Hướng dẫn Vận hành Dolphin 01
          </div>
        </div>

        {/* Vessel & Voyage Specifications Grid */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '24px',
            fontSize: '13px'
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, width: '22%', border: '1px solid #E0E0E0' }}>
                Tên Tàu (Vessel Name):
              </td>
              <td style={{ padding: '8px 12px', width: '28%', border: '1px solid #E0E0E0', fontWeight: 600 }}>
                M/T DOLPHIN 01
              </td>
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, width: '22%', border: '1px solid #E0E0E0' }}>
                Số IMO / Hô Hiệu:
              </td>
              <td style={{ padding: '8px 12px', width: '28%', border: '1px solid #E0E0E0' }}>
                9876543 / 3WDL2
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, border: '1px solid #E0E0E0' }}>
                Hầm Hàng Giám Định:
              </td>
              <td style={{ padding: '8px 12px', border: '1px solid #E0E0E0', fontWeight: 700, color: '#0B132B' }}>
                {holdInfo.name} ({holdInfo.capacity})
              </td>
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, border: '1px solid #E0E0E0' }}>
                Lớp Phủ Hầm (Coating):
              </td>
              <td style={{ padding: '8px 12px', border: '1px solid #E0E0E0' }}>
                Pure Epoxy Coating
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, border: '1px solid #E0E0E0' }}>
                Lô Hàng Vừa Dỡ (Previous):
              </td>
              <td style={{ padding: '8px 12px', border: '1px solid #E0E0E0' }}>
                {prevItem.name}
              </td>
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, border: '1px solid #E0E0E0' }}>
                Lô Hàng Sắp Nhận (Next):
              </td>
              <td style={{ padding: '8px 12px', border: '1px solid #E0E0E0', fontWeight: 600 }}>
                {newItem.name}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, border: '1px solid #E0E0E0' }}>
                Hải Trình / Cảng:
              </td>
              <td style={{ padding: '8px 12px', border: '1px solid #E0E0E0' }}>
                {state.route || 'Hải Phòng ➔ Singapore'}
              </td>
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, border: '1px solid #E0E0E0' }}>
                Phương Pháp Kiểm Tra:
              </td>
              <td style={{ padding: '8px 12px', border: '1px solid #E0E0E0', fontWeight: 700, color: '#1E88E5' }}>
                {state.selectedMethod === 'WALL_WASH'
                  ? 'WALL WASH STANDARD (Hóa Nghiệm)'
                  : 'WATER WHITE STANDARD (Cảm Quan)'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Detailed Results Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0B132B', borderBottom: '2px solid #0B132B', paddingBottom: '6px', marginBottom: '12px' }}>
            KẾT QUẢ KIỂM TRA ĐỘ TINH KHIẾT THỰC TẾ
          </h3>

          {state.selectedMethod === 'WALL_WASH' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#0B132B', color: '#FFF' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Chỉ Tiêu Hóa Nghiệm</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Kết Quả Đo</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Đơn Vị</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Ngưỡng Cho Phép</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Đánh Giá</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(WALL_WASH_THRESHOLDS).map((testId, idx) => {
                  const threshold = WALL_WASH_THRESHOLDS[testId]
                  const val = state.wallWashResults[testId] || '--'
                  return (
                    <tr key={testId} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                      <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', fontWeight: 600 }}>
                        {threshold.name}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'center', fontWeight: 700 }}>
                        {val}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'center', color: '#666' }}>
                        {threshold.unit}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                        {threshold.comparison} {threshold.max || threshold.min} {threshold.unit}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                        <span style={{ color: '#16A34A', fontWeight: 800 }}>✓ ĐẠT (PASS)</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#0B132B', color: '#FFF' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Khu Vực Kết Cấu Hầm</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Tiêu Chuẩn Đánh Giá</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Kết Quả</th>
                </tr>
              </thead>
              <tbody>
                {WATER_WHITE_AREAS.map((area, idx) => (
                  <tr key={area.id} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                    <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', fontWeight: 600 }}>
                      {area.icon} {area.name}
                    </td>
                    <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', color: '#555' }}>
                      Sạch cặn - Khô ráo - Không mùi - Không gỉ vảy
                    </td>
                    <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                      <span style={{ color: '#16A34A', fontWeight: 800 }}>✓ ĐẠT CHUẨN</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Conclusion Declaration */}
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            padding: '16px',
            borderRadius: '6px',
            marginBottom: '32px'
          }}
        >
          <div style={{ fontWeight: 800, color: '#166534', fontSize: '14px', marginBottom: '4px' }}>
            KẾT LUẬN GIÁM ĐỊNH (SURVEYOR DECLARATION):
          </div>
          <div style={{ fontSize: '13px', color: '#14532D', lineHeight: 1.6 }}>
            Căn cứ vào kết quả kiểm nghiệm hiện trường, hầm hàng <strong>{holdInfo.name}</strong> của tàu <strong>DOLPHIN 01</strong> đã hoàn thành các bước súc rửa bằng hóa chất chuyên dụng, khử mùi và tráng rửa nước ngọt ion hóa. Bề mặt sơn phủ Epoxy không còn dấu vết của lô hàng trước ({prevItem.name}). Hầm hàng chính thức được chứng nhận <strong>ĐỦ ĐIỀU KIỆN TIẾP NHẬN LÔ HÀNG {newItem.name.toUpperCase()}</strong>.
          </div>
        </div>

        {/* Signatures Block */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', paddingTop: '20px', borderTop: '1px solid #E0E0E0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>
              SĨ QUAN TRỰC CA / ĐẠI PHÓ
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>(Chief Officer / Duty Officer)</div>
            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'cursive', fontSize: '20px', color: '#1E40AF', transform: 'rotate(-5deg)' }}>
                Nguyen Van Hai
              </span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>Nguyễn Văn Hải</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Đại phó Tàu Dolphin 01</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>
              GIÁM ĐỊNH VIÊN ĐỘC LẬP
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>(Independent Cargo Surveyor)</div>
            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'cursive', fontSize: '20px', color: '#1E40AF', transform: 'rotate(-3deg)' }}>
                David J. Miller
              </span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>David J. Miller</div>
            <div style={{ fontSize: '11px', color: '#666' }}>SGS / Intertek Maritime</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>
              THUYỀN TRƯỞNG TÀU
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>(Master of Dolphin 01)</div>
            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'cursive', fontSize: '20px', color: '#1E40AF', transform: 'rotate(-4deg)' }}>
                Tran Quoc Tuan
              </span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>Trần Quốc Tuấn</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Thuyền trưởng M/T Dolphin 01</div>
          </div>
        </div>
      </div>

      {/* Operational Logs History Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Clock className="card-title-icon" size={18} />
              Nhật Ký Thao Tác Số Hóa (Digital Audit Trail)
            </h3>
            <p className="card-subtitle">
              Ghi nhận các mốc thời gian và hành động thực hiện theo thời gian thực
            </p>
          </div>
          <span className="badge badge-info">{state.inspectionLog.length} sự kiện</span>
        </div>

        <div className="timeline">
          {state.inspectionLog.length > 0 ? (
            state.inspectionLog.map((log, idx) => (
              <div key={idx} className="timeline-item">
                <div className={`timeline-dot ${log.type === 'pass' ? 'completed' : log.type === 'fail' ? 'current' : 'completed'}`}>
                  ✓
                </div>
                <div style={{ flex: 1 }}>
                  <div className="timeline-time">{log.time}</div>
                  <div className="timeline-text" style={{ color: log.type === 'fail' ? 'var(--color-fail)' : log.type === 'pass' ? 'var(--color-pass)' : 'var(--color-text-secondary)' }}>
                    {log.text}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '16px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              Quy trình kiểm tra đã được số hóa và chuẩn bị cho lưu trữ.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
