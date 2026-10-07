import { useState, useMemo, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import {
  WALL_WASH_THRESHOLDS,
  evaluateTestResult,
  getDiagnostic as getLocalDiagnostic,
  VESSEL_HOLDS
} from '../data/cargoData'
import { analyzeTestFailures } from '../services/aiService'
import { getSessionVessel } from '../data/vesselData.js'
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Camera,
  Info,
  Beaker,
  Loader2
} from 'lucide-react'

export default function Step2WallWash() {
  const { state, dispatch } = useApp()
  const vessel = getSessionVessel(state)
  const selectedPhotoIndex = 0
  
  // Real AI diagnostic states
  const [aiDiagnostic, setAiDiagnostic] = useState(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [manualAiMessage, setManualAiMessage] = useState(null)

  const holdInfo = [...state.customHolds, ...VESSEL_HOLDS].find(h => h.id === state.selectedHold) || {
    name: 'Chưa chọn hầm',
    capacity: 'Chưa khai báo'
  }

  // Evaluate tests
  const testResults = useApp().state.wallWashResults

  const evaluation = useMemo(() => {
    const statuses = {}
    const failedList = []
    let totalPass = 0
    let filledCount = 0

    Object.keys(WALL_WASH_THRESHOLDS).forEach(testId => {
      const val = testResults[testId]
      const status = evaluateTestResult(testId, val)
      statuses[testId] = status
      if (status !== 'pending') filledCount++
      if (status === 'pass') totalPass++
      if (status === 'fail') failedList.push(testId)
    })

    const allPassed = filledCount === 5 && failedList.length === 0
    const hasFail = failedList.length > 0

    return { statuses, failedList, totalPass, filledCount, allPassed, hasFail }
  }, [testResults])

  // Call real AI API when fails change
  useEffect(() => {
    let isMounted = true
    const fetchAi = async () => {
      if (evaluation.failedList.length === 0) {
        setAiDiagnostic(null)
        return
      }

      setIsAiLoading(true)
      setManualAiMessage(null)
      const data = await analyzeTestFailures(
        evaluation.failedList, 
        testResults, 
        state.previousCargo || 'Dầu Cọ Thô (Crude Palm Oil)', 
        state.newCargo || 'Methanol', state.vessel
      )
      
      if (isMounted) {
        if (data && data.causes && data.solutions) {
          setAiDiagnostic([data])
        } else {
          setAiDiagnostic(getLocalDiagnostic(evaluation.failedList))
        }
        setIsAiLoading(false)
      }
    }
    
    // Add a slight debounce
    const timeout = setTimeout(fetchAi, 800)
    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [evaluation.failedList, testResults, state.previousCargo, state.newCargo, state.vessel])

  const handleManualAnalyze = async () => {
    if (evaluation.filledCount !== 5 || isAiLoading) return
    setIsAiLoading(true)
    if (evaluation.failedList.length > 0) {
      const data = await analyzeTestFailures(
        evaluation.failedList, 
        testResults, 
        state.previousCargo || 'Dầu Cọ Thô (Crude Palm Oil)', 
        state.newCargo || 'Methanol', vessel
      )
      if (data && data.causes && data.solutions) {
        setAiDiagnostic([data])
      } else {
        setAiDiagnostic(getLocalDiagnostic(evaluation.failedList))
      }
    } else {
      setManualAiMessage({
        title: 'Các chỉ số đạt ngưỡng cấu hình',
        content: `Đã đối chiếu 5 chỉ số với ngưỡng đang cấu hình trên web:\n${Object.entries(WALL_WASH_THRESHOLDS).map(([id, test]) => `• ${test.name}: ${testResults[id]} ${test.unit} (${test.comparison} ${test.max ?? test.min}) — Đạt`).join('\n')}\nCó thể chuyển sang bước tổng hợp báo cáo.`
      })
    }
    setIsAiLoading(false)
  }

  const handleInputChange = (testId, value) => {
    dispatch({ type: 'SET_WALL_WASH_RESULT', testId, value })
    dispatch({
      type: 'ADD_LOG',
      text: `Nhập chỉ số ${WALL_WASH_THRESHOLDS[testId].name}: ${value} ${WALL_WASH_THRESHOLDS[testId].unit}`,
      logType: 'info'
    })
  }

  // Presets for quick testing
  const loadPreset = (type) => {
    if (type === 'pass') {
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'salinity', value: '12' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'ptt', value: '15' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'apha', value: '10' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'hydrocarbon', value: '25' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'chloride', value: '0.8' })
      dispatch({ type: 'ADD_LOG', text: 'Nạp bộ chỉ số mẫu: ĐẠT TẤT CẢ', logType: 'pass' })
    } else if (type === 'fail_ptt') {
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'salinity', value: '12' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'ptt', value: '6.8' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'apha', value: '15' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'hydrocarbon', value: '35' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'chloride', value: '1.2' })
      dispatch({ type: 'ADD_LOG', text: 'Nạp bộ chỉ số mẫu: PTT Thấp (6.8 min - Kích hoạt AI Chẩn đoán)', logType: 'fail' })
    } else if (type === 'fail_chloride') {
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'salinity', value: '45' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'ptt', value: '12' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'apha', value: '12' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'hydrocarbon', value: '20' })
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: 'chloride', value: '4.5' })
      dispatch({ type: 'ADD_LOG', text: 'Nạp bộ chỉ số mẫu: Nhiễm mặn Chloride (4.5 ppm - Kích hoạt AI Chẩn đoán)', logType: 'fail' })
    }
  }

  const handleReset = () => {
    dispatch({ type: 'RESET_WALL_WASH' })
    setAiDiagnostic(null)
    setManualAiMessage(null)
    dispatch({ type: 'ADD_LOG', text: 'Yêu cầu tráng rửa lại hầm hàng & thiết lập lại chỉ số test', logType: 'warning' })
  }

  const holdPhotos = [
    { id: 1, title: 'Vách hầm Mạn Trái (Portside Bulkhead)', desc: 'Lấy mẫu rửa bằng Methanol tinh khiết', status: 'normal' },
    { id: 2, title: 'Đáy hầm & Giếng gom (Tank Top & Suction)', desc: 'Kiểm tra cặn lắng và dịch đọng', status: evaluation.hasFail ? 'recheck' : 'clean' },
    { id: 3, title: 'Trần hầm & Khung giàn (Deckhead Framing)', desc: 'Soi đèn UV kiểm tra màng dầu bám', status: 'clean' },
    { id: 4, title: 'Mẫu thử thuốc tím PTT (KMnO4)', desc: 'Đo thời gian đổi màu chuẩn', status: evaluation.statuses.ptt === 'fail' ? 'fail' : 'pass' }
  ]

  return (
    <div className="step-content">
      {/* LEFT COLUMN: Test Results Table & Tools */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <FlaskConical className="card-title-icon" size={20} />
              Kiểm tra Wall Wash
            </h2>
            <p className="card-subtitle">
              Đo lường 5 chỉ số độ tinh khiết hóa học dịch rửa bề mặt hầm hàng
            </p>
          </div>
          <span className="badge badge-info">{holdInfo.name}</span>
        </div>

        <div className="equipment-instructions-grid">
          {/* Left column: Dụng Cụ Đo */}
          <div className="equipment-column">
            <div className="equipment-column-header">
              <Beaker size={14} color="var(--color-accent-cyan)" />
              <span>DỤNG CỤ & THUỐC THỬ</span>
            </div>
            <div className="equipment-list">
              <div className="equipment-item">
                <span className="equipment-dot" style={{ background: '#3A86FF' }}></span>
                <span>Methanol Spectro 99.8%</span>
              </div>
              <div className="equipment-item">
                <span className="equipment-dot" style={{ background: '#00E5FF' }}></span>
                <span>Ống Nessler 50ml</span>
              </div>
              <div className="equipment-item">
                <span className="equipment-dot" style={{ background: '#F59E0B' }}></span>
                <span>Dung dịch AgNO3 0.1N</span>
              </div>
              <div className="equipment-item">
                <span className="equipment-dot" style={{ background: '#7B61FF' }}></span>
                <span>Thuốc tím KMnO4 0.1g/L</span>
              </div>
              <div className="equipment-item">
                <span className="equipment-dot" style={{ background: '#10B981' }}></span>
                <span>Bình xịt PTFE 500ml</span>
              </div>
              <div className="equipment-item">
                <span className="equipment-dot" style={{ background: '#EF4444' }}></span>
                <span>Găng tay Nitrile (không bột)</span>
              </div>
            </div>
          </div>

          {/* Right column: Hướng Dẫn Cách Test */}
          <div className="instructions-column">
            <div className="equipment-column-header">
              <Info size={14} color="var(--color-pass)" />
              <span>HƯỚNG DẪN THAO TÁC TEST</span>
            </div>
            <div className="instructions-steps">
              <div className="instruction-step">
                <span className="instruction-number">1</span>
                <span>Phun 200ml Methanol lên vách hầm từ trên xuống dưới theo đường thẳng đứng</span>
              </div>
              <div className="instruction-step">
                <span className="instruction-number">2</span>
                <span>Hứng dịch rửa bằng khay inox sạch tại đáy vách — đảm bảo không chạm tay trần</span>
              </div>
              <div className="instruction-step">
                <span className="instruction-number">3</span>
                <span>Đổ dịch rửa vào ống Nessler, thêm thuốc thử tương ứng cho từng chỉ tiêu</span>
              </div>
              <div className="instruction-step">
                <span className="instruction-number">4</span>
                <span>So sánh màu / đo thời gian đổi màu / ghi giá trị đo được</span>
              </div>
              <div className="instruction-step">
                <span className="instruction-number">5</span>
                <span>Nhập kết quả vào bảng chỉ số bên dưới để hệ thống tự động đánh giá</span>
              </div>
            </div>
          </div>
        </div>

        <div className="inspection-toolbar">
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Chỉ số hóa nghiệm
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-sm btn-secondary" onClick={() => loadPreset('pass')} type="button">Mẫu đạt</button>
            <button className="btn btn-sm btn-secondary" style={{ color: 'var(--color-fail)', border: '1px solid rgba(239,68,68,0.4)' }} onClick={() => loadPreset('fail_ptt')} type="button">Mẫu PTT thấp</button>
            <button className="btn btn-sm btn-secondary" style={{ color: 'var(--color-warning)', border: '1px solid rgba(245,158,11,0.4)' }} onClick={() => loadPreset('fail_chloride')} type="button">Mẫu nhiễm mặn</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginBottom: 'var(--space-xl)' }}>
          <table className="test-table">
            <thead>
              <tr>
                <th>Chỉ Tiêu Hóa Nghiệm</th>
                <th style={{ textAlign: 'center' }}>Kết Quả</th>
                <th>Đơn Vị</th>
                <th>Ngưỡng Chuẩn</th>
                <th style={{ textAlign: 'center' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(WALL_WASH_THRESHOLDS).map(testId => {
                const threshold = WALL_WASH_THRESHOLDS[testId]
                const val = testResults[testId]
                const status = evaluation.statuses[testId]

                return (
                  <tr key={testId}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{threshold.name}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        step="0.1"
                        className={`test-input ${status === 'fail' ? 'fail' : status === 'pass' ? 'pass' : ''}`}
                        value={val}
                        placeholder="--"
                        onChange={(e) => handleInputChange(testId, e.target.value)}
                      />
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{threshold.unit}</td>
                    <td><span className="badge badge-neutral">{threshold.comparison} {threshold.max || threshold.min}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      {status === 'pass' && <span className="badge badge-pass"><CheckCircle2 size={14} /> ĐẠT</span>}
                      {status === 'fail' && <span className="badge badge-fail"><XCircle size={14} /> KHÔNG ĐẠT</span>}
                      {status === 'pending' && <span className="badge badge-neutral">Chờ nhập</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="inspection-actions">
          <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}>
            <ArrowLeft size={18} /> <span>Quay Lại Bước 1</span>
          </button>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={18} /> <span>Yêu Cầu Rửa Lại</span>
            </button>
            <button className="btn btn-primary" disabled={!evaluation.allPassed} onClick={() => dispatch({ type: 'COMPLETE_INSPECTION' })}>
              <span>Tiếp Tục Xuất Báo Cáo</span> <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Visualizer + AI Diagnostic Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Camera className="card-title-icon" size={18} />
                Hình Ảnh Hầm Hàng
              </h3>
              <p className="card-subtitle">Vị trí kiểm tra: {holdInfo.name}</p>
            </div>
            <span className="badge badge-neutral">4 điểm lấy mẫu</span>
          </div>

          <div
            style={{
              position: 'relative',
              height: '240px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, #091325 0%, #152544 100%)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px'
            }}
          >
            <svg viewBox="0 0 400 200" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.6 }}>
              <defs>
                <linearGradient id="holdWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3A86FF" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <polygon points="50,30 350,30 310,170 90,170" fill="url(#holdWallGrad)" stroke="#3A86FF" strokeWidth="2" />
              <line x1="80" y1="30" x2="110" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="140" y1="30" x2="150" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="200" y1="30" x2="200" y2="170" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
              <line x1="260" y1="30" x2="250" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="320" y1="30" x2="290" y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,3" />
              <rect x="180" y="170" width="40" height="15" fill="#EF4444" opacity={evaluation.hasFail ? 0.7 : 0.2} rx="2" />
              <circle cx="85" cy="80" r="8" fill="#00E5FF" opacity="0.8" />
              <circle cx="200" cy="160" r="8" fill={evaluation.hasFail ? '#EF4444' : '#10B981'} opacity="0.8" />
              <circle cx="310" cy="80" r="8" fill="#00E5FF" opacity="0.8" />
              <circle cx="200" cy="45" r="8" fill="#00E5FF" opacity="0.8" />
            </svg>

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between' }}>
              <span className="badge badge-info">Lớp phủ: {vessel.coating || 'chưa khai báo'}</span>
              <span className={`badge ${evaluation.hasFail ? 'badge-fail' : 'badge-pass'}`}>
                {evaluation.hasFail ? 'Phát hiện vị trí cần tráng rửa' : 'Bề mặt sạch chuẩn'}
              </span>
            </div>
            
            <div style={{ position: 'relative', zIndex: 2, background: 'rgba(11,19,43,0.85)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{holdPhotos[selectedPhotoIndex].title}</div>
            </div>
          </div>
        </div>

        {/* AI CHẨN ĐOÁN & ĐỀ XUẤT KHẮC PHỤC PANEL */}
        <div className="card diagnostic-card" style={{ borderColor: evaluation.hasFail ? 'var(--color-fail-border)' : 'var(--color-border)' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                Phân tích kết quả
              </h3>
              <p className="card-subtitle">Đối chiếu chỉ số với ngưỡng cấu hình và tài liệu tham khảo</p>
            </div>
            <div className="diagnostic-header-actions">
              <button 
                type="button" 
                className="btn btn-sm btn-secondary" 
                onClick={handleManualAnalyze}
                disabled={isAiLoading || evaluation.filledCount !== 5}
              >
                Phân tích lại
              </button>

            </div>
          </div>

          {isAiLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
              <Loader2 className="animate-spin" size={32} style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Đang phân tích kết quả kiểm tra...</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Đối chiếu số liệu, ngưỡng trên web và tài liệu liên quan</div>
            </div>
          ) : aiDiagnostic && aiDiagnostic.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {aiDiagnostic.map((diag, idx) => (
                <div key={idx} className="alert alert-fail" style={{ flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-fail)' }}>
                    <AlertTriangle size={18} />
                    <span>{diag.title || 'PHÁT HIỆN CHỈ SỐ KHÔNG ĐẠT'}</span>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                      {diag.mode === 'local' ? 'NGUYÊN NHÂN CẦN KIỂM CHỨNG (GỢI Ý CỤC BỘ):' : 'NGUYÊN NHÂN KHẢ DĨ (AI PHÂN TÍCH):'}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {diag.causes.map((c, cIdx) => <li key={cIdx} style={{ marginBottom: '3px' }}>{c}</li>)}
                    </ul>
                  </div>

                  <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent-cyan)', marginBottom: '4px' }}>
                      HƯỚNG DẪN RỬA LẠI KHUYẾN NGHỊ (RE-CLEANING SOP):
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--color-text-primary)' }}>
                      {diag.solutions.map((s, sIdx) => <li key={sIdx} style={{ marginBottom: '4px' }}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : manualAiMessage ? (
            <div className="alert alert-pass" style={{ flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-pass)' }}>
                <CheckCircle2 size={18} />
                <span>{manualAiMessage.title}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-primary)', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                {manualAiMessage.content}
              </div>
            </div>
          ) : evaluation.allPassed ? (
            <div className="alert alert-pass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 className="alert-icon" size={20} color="var(--color-pass)" />
                <div className="alert-content">
                  <div className="alert-title" style={{ color: 'var(--color-pass)' }}>Tất cả chỉ số đạt ngưỡng cấu hình</div>
                  <div className="alert-text">Sẵn sàng xuất chứng nhận làm sạch hầm hàng.</div>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-sm btn-secondary" 
                onClick={handleManualAnalyze}
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                Xem tóm tắt
              </button>
            </div>
          ) : (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              Nhập chỉ số hóa nghiệm để đánh giá. Kết quả chưa đạt sẽ được phân tích kèm hướng xử lý tham khảo.
            </div>
          )}
          {aiDiagnostic?.[0]?.mode && <p className="diagnostic-provider">{aiDiagnostic[0].mode === 'local' ? 'Tra cứu cục bộ · AI chưa kết nối' : `Phân tích với ${aiDiagnostic[0].model || 'AI'}`}</p>}
        </div>
      </div>
    </div>
  )
}
