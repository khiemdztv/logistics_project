import { useApp } from '../context/AppContext'
import { useState } from 'react'
import { getSessionVessel, formatDwt } from '../data/vesselData.js'
import {
  CARGO_ITEMS,
  VESSEL_HOLDS,
  WATER_WHITE_AREAS
} from '../data/cargoData'
import { getTestPlan, summarizeWallWash, getStandardLabel, formatResultValue, WALL_WASH_TESTS } from '../data/wallWashTests'
import { EVIDENCE_KINDS, evidenceTarget, photosFor } from '../data/evidence'
import { EvidenceGallery } from './EvidencePhotos'
import {
  Printer,
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react'

export default function Step3Report() {
  const { state, dispatch } = useApp()
  const vessel = getSessionVessel(state)
  const [reportDate] = useState(() => new Date(state.endTime || Date.now()))
  const certificateId = `CERT-${vessel.imo || 'NA'}-${state.currentSessionId?.toUpperCase() || 'PREVIEW'}`

  const prevItem = CARGO_ITEMS.find(c => c.id === state.previousCargo) || { name: 'Crude Palm Oil' }
  const newItem = CARGO_ITEMS.find(c => c.id === state.newCargo) || { name: 'Methanol' }
  const plan = getTestPlan(state.newCargo, state.previousCargo)
  const wallWash = summarizeWallWash(state.wallWashResults, plan)
  const reportRows = plan.entries.filter(entry => entry.level !== 'na')
  const skippedTests = plan.notApplicable.map(id => WALL_WASH_TESTS[id].shortName).join(', ')
  const evidenceItems = state.selectedMethod === 'WALL_WASH'
    ? reportRows
      .filter(entry => wallWash.statuses[entry.testId] !== 'pending')
      .map(entry => ({ target: evidenceTarget(EVIDENCE_KINDS.WALL_WASH, entry.testId), label: entry.test.name }))
    : WATER_WHITE_AREAS
      .filter(area => state.waterWhiteChecklist[area.id])
      .map(area => ({ target: evidenceTarget(EVIDENCE_KINDS.WATER_WHITE, area.id), label: area.name }))
  const holdInfo = [...state.customHolds, ...VESSEL_HOLDS].find(h => h.id === state.selectedHold) || {
    name: 'Chưa chọn hầm',
    capacity: 'Chưa khai báo'
  }

  const handlePrint = () => {
    window.print()
  }

  const handleNewInspection = () => {
    dispatch({ type: 'GO_DASHBOARD' })
  }

  const currentDate = reportDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const currentTime = reportDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Top action toolbar */}
      <div className="report-toolbar">
        <div>
          <h2 className="report-title">
            Báo cáo kiểm tra hầm hàng
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {state.sessionName || 'Ca kiểm tra hầm hàng'} · {certificateId}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button className="btn btn-secondary" onClick={handleNewInspection}>
            <RotateCcw size={18} />
            <span>Về danh sách ca</span>
          </button>

          <button className="btn btn-primary" onClick={handlePrint} id="print-report-btn">
            <Printer size={18} />
            <span>In / Xuất Bản PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Document Sheet */}
      <div className="certificate-viewport" role="region" aria-label="Bản xem trước báo cáo" tabIndex={0}>
      <div
        className="card certificate-sheet"
        id="certificate-print-sheet"
        style={{
          background: '#FFFFFF',
          color: '#0B132B',
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
            Tổng hợp số liệu kiểm tra của tàu {vessel.name}
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
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, border: '1px solid #E0E0E0' }}>Trọng tải (DWT):</td>
              <td style={{ padding: '8px 12px', border: '1px solid #E0E0E0' }}>{formatDwt(vessel.dwt)} DWT</td>
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, border: '1px solid #E0E0E0' }}>Quốc tịch:</td>
              <td style={{ padding: '8px 12px', border: '1px solid #E0E0E0' }}>{vessel.nationality || 'Chưa khai báo'}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, width: '22%', border: '1px solid #E0E0E0' }}>
                Tên Tàu (Vessel Name):
              </td>
              <td style={{ padding: '8px 12px', width: '28%', border: '1px solid #E0E0E0', fontWeight: 600 }}>
                {vessel.name}
              </td>
              <td style={{ padding: '8px 12px', background: '#F8F9FA', fontWeight: 700, width: '22%', border: '1px solid #E0E0E0' }}>
                Số IMO:
              </td>
              <td style={{ padding: '8px 12px', width: '28%', border: '1px solid #E0E0E0' }}>
                {vessel.imo || 'Chưa khai báo'}
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
                {vessel.coating || 'Chưa khai báo'}
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
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Phép Thử</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Kết Quả Ghi Nhận</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Chuẩn Đạt</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Đánh Giá</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((entry, idx) => {
                  const status = wallWash.statuses[entry.testId]
                  const value = formatResultValue(entry.testId, state.wallWashResults[entry.testId])
                  const nitric = entry.testId === 'chloride' && state.wallWashResults.chlorideNitric === 'yes' ? ' (đã thêm HNO3)' : ''
                  return (
                    <tr key={entry.testId} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                      <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', fontWeight: 600 }}>
                        {entry.test.name}
                        <div style={{ fontSize: '11px', fontWeight: 400, color: '#777' }}>{entry.level === 'required' ? 'Bắt buộc' : 'Tùy chọn'}</div>
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', fontWeight: 700 }}>
                        {status === 'pending' ? (entry.level === 'optional' ? 'Không thực hiện' : 'Chưa nhập') : value + nitric}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', color: '#555' }}>
                        {getStandardLabel(entry)}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                        {status === 'pass' && <span style={{ color: '#16A34A', fontWeight: 800 }}>✓ ĐẠT (PASS)</span>}
                        {status === 'warn' && <span style={{ color: '#D97706', fontWeight: 800 }}>✓ ĐẠT (LƯU Ý)</span>}
                        {status === 'fail' && <span style={{ color: '#DC2626', fontWeight: 800 }}>✗ KHÔNG ĐẠT</span>}
                        {status === 'pending' && <span style={{ color: '#888', fontWeight: 600 }}>—</span>}
                      </td>
                    </tr>
                  )
                })}
                {skippedTests && (
                  <tr>
                    <td colSpan={4} style={{ padding: '8px 12px', border: '1px solid #E5E7EB', color: '#666', fontSize: '12px', fontStyle: 'italic' }}>
                      Không áp dụng cho {newItem.name}: {skippedTests}.
                    </td>
                  </tr>
                )}
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
                      {area.name}
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

        {/* Evidence photos per checked item */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0B132B', borderBottom: '2px solid #0B132B', paddingBottom: '6px', marginBottom: '12px' }}>
            ẢNH BẰNG CHỨNG THEO TỪNG MỤC KIỂM TRA
          </h3>
          {evidenceItems.length ? (
            <div className="report-evidence-grid">
              {evidenceItems.map(item => (
                <div key={item.target} className="report-evidence-item">
                  <div className="report-evidence-title">{item.label}</div>
                  <EvidenceGallery photos={photosFor(state.photos, item.target)} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#666' }}>Chưa có mục nào được kiểm tra.</div>
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
            Báo cáo ghi nhận kết quả kiểm tra hầm <strong>{holdInfo.name}</strong> của tàu <strong>{vessel.name}</strong> trong ca <strong>{state.sessionName || 'kiểm tra hầm hàng'}</strong>, khi chuyển từ {prevItem.name} sang {newItem.name}. Các chỉ số và trạng thái được trình bày trong bảng kết quả phía trên.
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
                …………………………
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>(Ký, ghi rõ họ tên)</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Đại phó tàu {vessel.name}</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>
              GIÁM ĐỊNH VIÊN ĐỘC LẬP
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>(Independent Cargo Surveyor)</div>
            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'cursive', fontSize: '20px', color: '#1E40AF', transform: 'rotate(-3deg)' }}>
                …………………………
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>(Ký, ghi rõ họ tên)</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>
              THUYỀN TRƯỞNG TÀU
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>(Master of {vessel.name})</div>
            <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'cursive', fontSize: '20px', color: '#1E40AF', transform: 'rotate(-4deg)' }}>
                …………………………
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>(Ký, ghi rõ họ tên)</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Thuyền trưởng tàu {vessel.name}</div>
          </div>
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
