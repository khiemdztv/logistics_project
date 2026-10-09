import { Fragment, useState, useMemo, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { CARGO_ITEMS, getDiagnostic as getLocalDiagnostic, VESSEL_HOLDS } from '../data/cargoData'
import {
  getTestPlan,
  summarizeWallWash,
  getStandardLabel,
  formatResultValue,
  describeResult,
  STATUS_LABELS,
  PRESETS,
  presetAvailable,
  getPresetResults
} from '../data/wallWashTests'
import { EVIDENCE_KINDS, evidenceTarget, hasEvidence, missingEvidence, countEvidence } from '../data/evidence'
import { addDemoEvidence } from '../services/demoEvidence'
import EvidencePhotos from './EvidencePhotos'
import { analyzeTestFailures } from '../services/aiService'
import { getSessionVessel } from '../data/vesselData.js'
import { getInspectionOutcome } from '../data/inspectionOutcome.js'
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
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const LEVEL_LABELS = { required: 'Bắt buộc', optional: 'Tùy chọn', na: 'Không áp dụng' }
const testTarget = testId => evidenceTarget(EVIDENCE_KINDS.WALL_WASH, testId)

function StatusBadge({ status }) {
  if (status === 'pass') return <span className="badge badge-pass"><CheckCircle2 size={14} /> ĐẠT</span>
  if (status === 'warn') return <span className="badge badge-warning"><AlertTriangle size={14} /> ĐẠT (LƯU Ý)</span>
  if (status === 'fail') return <span className="badge badge-fail"><XCircle size={14} /> KHÔNG ĐẠT</span>
  if (status === 'pending') return <span className="badge badge-neutral">Chờ nhập</span>
  return <span className="test-na-dash">—</span>
}

export default function Step2WallWash() {
  const { state, dispatch } = useApp()
  const vessel = getSessionVessel(state)
  const testResults = state.wallWashResults

  const [aiDiagnostic, setAiDiagnostic] = useState(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [manualAiMessage, setManualAiMessage] = useState(null)
  const [openGuide, setOpenGuide] = useState(null)

  const holdInfo = [...state.customHolds, ...VESSEL_HOLDS].find(h => h.id === state.selectedHold) || {
    name: 'Chưa chọn hầm',
    capacity: 'Chưa khai báo'
  }
  const newItem = CARGO_ITEMS.find(c => c.id === state.newCargo)
  const prevItem = CARGO_ITEMS.find(c => c.id === state.previousCargo)

  const plan = useMemo(() => getTestPlan(state.newCargo, state.previousCargo), [state.newCargo, state.previousCargo])
  const evaluation = useMemo(() => summarizeWallWash(testResults, plan), [testResults, plan])
  const reagents = useMemo(() => {
    const list = []
    for (const entry of plan.entries) {
      if (entry.level === 'na') continue
      for (const item of entry.test.reagents) if (!list.includes(item)) list.push(item)
    }
    return list
  }, [plan])
  const requiredComplete = evaluation.requiredTotal > 0 && evaluation.requiredDone === evaluation.requiredTotal
  const applicableEntries = plan.entries.filter(entry => entry.level !== 'na')
  const filledTargets = applicableEntries
    .filter(entry => evaluation.statuses[entry.testId] !== 'pending')
    .map(entry => testTarget(entry.testId))
  const missingPhotos = missingEvidence(filledTargets, state.photos)
  const canContinue = getInspectionOutcome(state).canExport
  const photoCount = countEvidence(state.photos, EVIDENCE_KINDS.WALL_WASH)

  // Call the AI diagnostic when the set of failed tests changes
  useEffect(() => {
    let isMounted = true
    const fetchAi = async () => {
      if (evaluation.failed.length === 0) {
        setAiDiagnostic(null)
        return
      }
      setIsAiLoading(true)
      setManualAiMessage(null)
      const data = await analyzeTestFailures(
        evaluation.failed,
        testResults,
        state.previousCargo || 'palm_oil_crude',
        state.newCargo || 'methanol',
        state.vessel
      )
      if (isMounted) {
        if (data && data.causes && data.solutions) {
          setAiDiagnostic([data])
        } else {
          setAiDiagnostic(getLocalDiagnostic(evaluation.failed))
        }
        setIsAiLoading(false)
      }
    }
    const timeout = setTimeout(fetchAi, 800)
    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [evaluation.failed, testResults, state.previousCargo, state.newCargo, state.vessel])

  const handleManualAnalyze = async () => {
    if (!requiredComplete || isAiLoading) return
    setIsAiLoading(true)
    if (evaluation.failed.length > 0) {
      const data = await analyzeTestFailures(
        evaluation.failed,
        testResults,
        state.previousCargo || 'palm_oil_crude',
        state.newCargo || 'methanol',
        vessel
      )
      if (data && data.causes && data.solutions) {
        setAiDiagnostic([data])
      } else {
        setAiDiagnostic(getLocalDiagnostic(evaluation.failed))
      }
    } else {
      const lines = applicableEntries
        .filter(entry => evaluation.statuses[entry.testId] !== 'pending')
        .map(entry => `• ${describeResult(entry, testResults)}`)
      setManualAiMessage({
        title: 'Các phép thử bắt buộc đều đạt',
        content: `Đã đối chiếu kết quả với chuẩn cấu hình trên web cho ${newItem?.name || 'hàng mới'}:\n${lines.join('\n')}${evaluation.warned.length ? '\nCó kết quả đạt kèm lưu ý, nên ghi nhận vào báo cáo.' : ''}\nCó thể chuyển sang bước tổng hợp báo cáo.`
      })
    }
    setIsAiLoading(false)
  }

  const handleInputChange = (entry, value) => {
    if (!hasEvidence(state.photos, testTarget(entry.testId))) return
    dispatch({ type: 'SET_WALL_WASH_RESULT', testId: entry.testId, value })
    if (value !== '') {
      dispatch({
        type: 'ADD_LOG',
        text: `Ghi kết quả ${entry.test.name}: ${formatResultValue(entry.testId, value)}`,
        logType: 'info'
      })
    }
  }

  const handleExtraChange = (key, value) => {
    dispatch({ type: 'SET_WALL_WASH_RESULT', testId: key, value })
  }

  const loadPreset = async (preset) => {
    const results = getPresetResults(preset.id, plan)
    if (!results) return
    const filled = plan.entries.filter(entry => entry.level !== 'na' && results[entry.testId] !== '')
    await addDemoEvidence(dispatch, state.photos, filled.map(entry => {
      const verdict = summarizeWallWash(results, plan).statuses[entry.testId]
      return { target: testTarget(entry.testId), label: entry.test.shortName, verdict }
    }))
    for (const [key, value] of Object.entries(results)) {
      dispatch({ type: 'SET_WALL_WASH_RESULT', testId: key, value })
    }
    dispatch({ type: 'ADD_LOG', text: `Nạp bộ kết quả mẫu: ${preset.label}`, logType: preset.failTest ? 'fail' : 'pass' })
  }

  const handleReset = () => {
    dispatch({ type: 'RESET_WALL_WASH' })
    setAiDiagnostic(null)
    setManualAiMessage(null)
    dispatch({ type: 'ADD_LOG', text: 'Yêu cầu tráng rửa lại hầm hàng & xóa kết quả đã nhập', logType: 'warning' })
  }

  let orderCounter = 0

  return (
    <div className="step-content">
      {/* LEFT COLUMN: Test plan & results */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <FlaskConical className="card-title-icon" size={20} />
              Kiểm tra Wall Wash
            </h2>
            <p className="card-subtitle">
              Bảng đủ 8 phương pháp. Hàng mới quyết định phép thử nào bắt buộc, tùy chọn hay không áp dụng.
            </p>
          </div>
          <span className="badge badge-info">{holdInfo.name}</span>
        </div>

        <div className="plan-summary">
          <span className="badge badge-info">Hàng mới: {newItem?.name || 'Chưa chọn'}</span>
          {prevItem && <span className="badge badge-neutral">Hàng trước: {prevItem.name}</span>}
          <span className="badge badge-pass">{plan.required.length} bắt buộc</span>
          <span className="badge badge-neutral">{plan.optional.length} tùy chọn</span>
          <span className="badge badge-neutral">{plan.notApplicable.length} không áp dụng</span>
        </div>
        <p className="plan-note">{plan.profile.note}</p>
        {plan.adjustments.map(text => (
          <div key={text} className="alert alert-info plan-adjustment">
            <Info className="alert-icon" size={16} />
            <div className="alert-text">{text}</div>
          </div>
        ))}

        <div className="equipment-column-header" style={{ marginTop: '16px' }}>
          <Beaker size={14} color="var(--color-accent-cyan)" />
          <span>DỤNG CỤ & THUỐC THỬ CẦN CHUẨN BỊ</span>
        </div>
        <div className="reagent-chips">
          {reagents.map(item => <span key={item} className="reagent-chip">{item}</span>)}
        </div>
        <p className="plan-hint">
          Lấy mẫu: phun methanol tinh khiết lên vách, hứng bằng phễu và chai sạch, luôn đeo găng. Bấm “Hướng dẫn” ở từng phép thử để xem các bước và cách đọc kết quả.
        </p>
        <p className="card-subtitle evidence-rule" style={{ marginBottom: '14px' }}>
          <Camera size={13} /> Mỗi phép thử: chụp ống nghiệm / mẫu (hoặc tải ảnh lên) trước, sau đó mới chọn hiện tượng hoặc nhập số đo.
        </p>

        <div className="inspection-toolbar">
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Kết quả theo từng phép thử
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {PRESETS.filter(preset => presetAvailable(preset, plan)).map(preset => (
              <button
                key={preset.id}
                type="button"
                className="btn btn-sm btn-secondary"
                style={preset.failTest ? { color: preset.failTest === 'chloride' ? 'var(--color-warning)' : 'var(--color-fail)', border: `1px solid ${preset.failTest === 'chloride' ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}` } : undefined}
                onClick={() => loadPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginBottom: 'var(--space-xl)' }}>
          <table className="test-table test-table-plan">
            <thead>
              <tr>
                <th className="test-col-order">#</th>
                <th className="test-col-name">Phép thử &amp; chuẩn đạt</th>
                <th className="test-col-result">Kết quả quan sát / đo</th>
                <th className="test-col-status">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {plan.entries.map(entry => {
                const test = entry.test
                const isNa = entry.level === 'na'
                const status = evaluation.statuses[entry.testId]
                const value = testResults[entry.testId] ?? ''
                const order = isNa ? '—' : ++orderCounter
                const guideOpen = openGuide === entry.testId && !isNa
                const target = testTarget(entry.testId)
                const photoReady = hasEvidence(state.photos, target)

                return (
                  <Fragment key={entry.testId}>
                    <tr className={isNa ? 'test-row-na' : ''}>
                      <td className="test-order">{order}</td>
                      <td>
                        <div className="test-name">{test.name}</div>
                        {!isNa && <div className="test-standard">Đạt khi: {getStandardLabel(entry)}</div>}
                        <div className="test-meta">
                          <span className={`test-level test-level-${entry.level}`}>{LEVEL_LABELS[entry.level]}</span>
                          {!isNa && (
                            <button
                              type="button"
                              className="test-help-btn"
                              onClick={() => setOpenGuide(guideOpen ? null : entry.testId)}
                              aria-expanded={guideOpen}
                            >
                              Hướng dẫn {guideOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="test-result-cell">
                        {!isNa && <EvidencePhotos target={target} title={test.shortName} compact />}
                        {!isNa && status !== 'pending' && !photoReady && (
                          <div className="evidence-warning">Đã có kết quả nhưng ảnh đã bị xóa. Hãy thêm lại ảnh.</div>
                        )}
                        {isNa ? (
                          <span className="test-na-reason">{entry.reason}</span>
                        ) : test.inputType === 'choice' ? (
                          <div className={`choice-group ${photoReady ? '' : 'locked'}`} role="radiogroup" aria-label={test.name}>
                            {test.options.map(option => (
                              <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={value === option.value}
                                disabled={!photoReady}
                                title={photoReady ? '' : 'Chụp hoặc tải ảnh trước'}
                                className={`choice-btn ${value === option.value ? `selected ${option.verdict}` : ''}`}
                                onClick={() => handleInputChange(entry, value === option.value ? '' : option.value)}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="test-number">
                            <input
                              type="number"
                              step={test.step}
                              min="0"
                              className={`test-input ${status === 'fail' ? 'fail' : status === 'pass' ? 'pass' : ''}`}
                              value={value}
                              disabled={!photoReady}
                              title={photoReady ? '' : 'Chụp hoặc tải ảnh trước'}
                              placeholder="--"
                              onChange={(e) => handleInputChange(entry, e.target.value)}
                            />
                            <span className="test-input-unit">{test.unit}</span>
                          </div>
                        )}
                        {!isNa && entry.nitric && test.extra && (
                          <label className="test-check">
                            <input
                              type="checkbox"
                              disabled={!photoReady}
                              checked={testResults[test.extra.id] === 'yes'}
                              onChange={(e) => handleExtraChange(test.extra.id, e.target.checked ? 'yes' : '')}
                            />
                            {test.extra.label}
                          </label>
                        )}
                      </td>
                      <td className="test-col-status" style={{ textAlign: 'center' }}>
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                    {guideOpen && (
                      <tr className="test-guide-row">
                        <td colSpan={4}>
                          <div className="test-guide">
                            <div>
                              <div className="test-guide-title">MỤC ĐÍCH</div>
                              <p>{test.purpose}</p>
                            </div>
                            {entry.notes.length > 0 && (
                              <div className="alert alert-info" style={{ margin: 0 }}>
                                <Info className="alert-icon" size={16} />
                                <div className="alert-text">{entry.notes.join(' ')}</div>
                              </div>
                            )}
                            <div>
                              <div className="test-guide-title">DỤNG CỤ & THUỐC THỬ</div>
                              <p>{test.reagents.join(' · ')}</p>
                            </div>
                            <div>
                              <div className="test-guide-title">CÁC BƯỚC</div>
                              <ol>
                                {test.steps.map((step, index) => <li key={index}>{step}</li>)}
                              </ol>
                            </div>
                            <div>
                              <div className="test-guide-title">CÁCH ĐỌC KẾT QUẢ</div>
                              {test.inputType === 'choice' ? (
                                <div className="test-reading">
                                  {test.options.map(option => (
                                    <div key={option.value}>
                                      <span className={`verdict verdict-${option.verdict}`}>{STATUS_LABELS[option.verdict]}</span>
                                      <strong>{option.label}</strong>: {option.meaning}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p>{test.reading} Chuẩn trên web cho hàng này: {getStandardLabel(entry)}.</p>
                              )}
                            </div>
                            {test.caution && (
                              <div className="alert alert-warning" style={{ margin: 0 }}>
                                <AlertTriangle className="alert-icon" size={16} />
                                <div className="alert-text">{test.caution}</div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="inspection-actions">
          <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}>
            <ArrowLeft size={18} /> <span>Quay Lại Bước 1</span>
          </button>
          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
            {!canContinue && (
              <span className="plan-progress">
                {evaluation.hasFail
                  ? 'Có phép thử không đạt'
                  : missingPhotos.length
                    ? `${missingPhotos.length} phép thử thiếu ảnh`
                    : `Bắt buộc: ${evaluation.requiredDone}/${evaluation.requiredTotal} đã nhập`}
              </span>
            )}
            <button className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={18} /> <span>Yêu Cầu Rửa Lại</span>
            </button>
            <button className="btn btn-primary" disabled={!canContinue} onClick={() => dispatch({ type: 'COMPLETE_INSPECTION' })}>
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
            <span className="badge badge-neutral">{photoCount} ảnh bằng chứng</span>
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
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Vách hầm Mạn Trái (Portside Bulkhead) · Lấy mẫu rửa bằng Methanol tinh khiết
              </div>
            </div>
          </div>
        </div>

        {/* AI DIAGNOSTIC PANEL */}
        <div className="card diagnostic-card" style={{ borderColor: evaluation.hasFail ? 'var(--color-fail-border)' : 'var(--color-border)' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                Phân tích kết quả
              </h3>
              <p className="card-subtitle">Đối chiếu hiện tượng quan sát với chuẩn cấu hình và tài liệu tham khảo</p>
            </div>
            <div className="diagnostic-header-actions">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={handleManualAnalyze}
                disabled={isAiLoading || !requiredComplete}
              >
                Phân tích lại
              </button>
            </div>
          </div>

          {isAiLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
              <Loader2 className="animate-spin" size={32} style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Đang phân tích kết quả kiểm tra...</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Đối chiếu hiện tượng, chuẩn trên web và tài liệu liên quan</div>
            </div>
          ) : aiDiagnostic && aiDiagnostic.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {aiDiagnostic.map((diag, idx) => (
                <div key={idx} className="alert alert-fail" style={{ flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-fail)' }}>
                    <AlertTriangle size={18} />
                    <span>{diag.title || 'PHÁT HIỆN PHÉP THỬ KHÔNG ĐẠT'}</span>
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
          ) : evaluation.allRequiredPassed && missingPhotos.length > 0 ? (
            <div className="alert alert-warning">
              <Camera className="alert-icon" size={20} color="var(--color-warning)" />
              <div className="alert-content">
                <div className="alert-title" style={{ color: 'var(--color-warning)' }}>Thiếu ảnh bằng chứng</div>
                <div className="alert-text">{missingPhotos.length} phép thử đã có kết quả nhưng chưa có ảnh. Thêm ảnh để mở khóa xuất báo cáo.</div>
              </div>
            </div>
          ) : evaluation.allRequiredPassed ? (
            <div className="alert alert-pass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 className="alert-icon" size={20} color="var(--color-pass)" />
                <div className="alert-content">
                  <div className="alert-title" style={{ color: 'var(--color-pass)' }}>
                    {evaluation.warned.length ? 'Các phép thử bắt buộc đạt, có kết quả cần lưu ý' : 'Các phép thử bắt buộc đều đạt'}
                  </div>
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
              Chọn hiện tượng quan sát hoặc nhập số đo cho các phép thử bắt buộc. Kết quả không đạt sẽ được phân tích kèm hướng xử lý tham khảo.
            </div>
          )}
          {aiDiagnostic?.[0]?.mode && <p className="diagnostic-provider">{aiDiagnostic[0].mode === 'local' ? 'Tra cứu cục bộ · AI chưa kết nối' : `Phân tích với ${aiDiagnostic[0].model || 'AI'}`}</p>}
        </div>
      </div>
    </div>
  )
}
