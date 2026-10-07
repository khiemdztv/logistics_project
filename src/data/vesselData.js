// The original project's vessel is retained for sessions created before fleet support.
export const DEFAULT_VESSEL = Object.freeze({
  id: 'dolphin_01', name: 'Dolphin 01', imo: '9876543', dwt: '34000', nationality: '', coating: 'Pure Epoxy',
})

export function normalizeVessel(input = {}) {
  const text = (value, max = 120) => String(value ?? '').trim().slice(0, max)
  const dwt = text(input.dwt, 30).replace(/[,\s]/g, '')
  return {
    id: text(input.id), name: text(input.name),
    imo: text(input.imo, 30).replace(/^IMO\s*/i, ''),
    dwt, nationality: text(input.nationality, 80), coating: text(input.coating),
  }
}

export function validateVessel(input, vessels = []) {
  const vessel = normalizeVessel(input)
  const errors = {}
  if (!vessel.name) errors.name = 'Vui lòng nhập tên tàu.'
  if (!/^\d{7}$/.test(vessel.imo)) errors.imo = 'Số IMO cần gồm 7 chữ số.'
  else if (vessels.some(item => item.imo === vessel.imo && item.id !== vessel.id)) errors.imo = 'IMO này đã có trong danh sách. Hãy chọn tàu đã lưu.'
  if (!vessel.dwt || !Number.isFinite(Number(vessel.dwt)) || Number(vessel.dwt) <= 0) errors.dwt = 'Trọng tải phải là số lớn hơn 0.'
  if (!vessel.nationality) errors.nationality = 'Vui lòng nhập quốc tịch tàu.'
  return errors
}

export function getSessionVessel(session = {}) {
  if (session.vessel?.name) return normalizeVessel({ ...session.vessel, id: session.vesselId || session.vessel.id })
  return normalizeVessel({ ...DEFAULT_VESSEL, dwt: session.dwt || DEFAULT_VESSEL.dwt })
}

export function formatDwt(value) {
  const number = Number(String(value ?? '').replace(/[,\s]/g, ''))
  return number > 0 && Number.isFinite(number) ? number.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : 'Chưa khai báo'
}

export function migrateSessions(sessions) {
  return (Array.isArray(sessions) ? sessions : []).filter(session => session && typeof session.id === 'string').map(session => {
    const vessel = getSessionVessel(session)
    return { ...session, vesselId: vessel.id, vessel, dwt: vessel.dwt, sessionName: session.sessionName || '' }
  })
}

export function loadFleet(saved, sessions) {
  const records = [DEFAULT_VESSEL, ...(Array.isArray(saved) ? saved : [])].filter(vessel => vessel?.id && vessel?.name)
  const fleet = new Map(records.map(vessel => [vessel.id, normalizeVessel(vessel)]))
  for (const session of sessions) {
    const vessel = getSessionVessel(session)
    if (!fleet.has(vessel.id)) fleet.set(vessel.id, vessel)
  }
  return [...fleet.values()]
}
