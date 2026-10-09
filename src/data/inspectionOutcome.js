import { WATER_WHITE_AREAS } from './cargoData.js'
import { getTestPlan, summarizeWallWash, WALL_WASH_TESTS } from './wallWashTests.js'
import { evidenceTarget, missingEvidence } from './evidence.js'

// Reports, export buttons and saved session badges use the same result.
export function getInspectionOutcome(data = {}) {
  let completed = false
  let targets = []
  let failedItems = []
  if (data.selectedMethod === 'WALL_WASH') {
    const plan = getTestPlan(data.newCargo, data.previousCargo)
    const summary = summarizeWallWash(data.wallWashResults || {}, plan)
    completed = summary.requiredTotal > 0 && summary.requiredDone === summary.requiredTotal
    failedItems = summary.failed.map(id => WALL_WASH_TESTS[id].name)
    targets = plan.entries.filter(entry => ['pass', 'warn', 'fail'].includes(summary.statuses[entry.testId]))
      .map(entry => evidenceTarget('ww', entry.testId))
  } else if (data.selectedMethod === 'WATER_WHITE') {
    const checklist = data.waterWhiteChecklist || {}
    const judged = WATER_WHITE_AREAS.filter(area => ['pass', 'fail'].includes(checklist[area.id]))
    completed = judged.length === WATER_WHITE_AREAS.length
    failedItems = judged.filter(area => checklist[area.id] === 'fail').map(area => area.name)
    targets = judged.map(area => evidenceTarget('wh', area.id))
  }
  const missingPhotos = missingEvidence(targets, data.photos)
  const canExport = completed && missingPhotos.length === 0
  const verdict = failedItems.length ? 'fail' : canExport ? 'pass' : 'pending'
  return { verdict, canExport, failedItems, missingPhotos, completed,
    label: verdict === 'fail' ? 'KHÔNG ĐẠT' : verdict === 'pass' ? 'ĐẠT' : 'CHƯA ĐỦ DỮ LIỆU' }
}

export function getSessionStatus(data = {}) {
  const outcome = getInspectionOutcome(data)
  if (outcome.verdict === 'fail') return 'failed'
  return data.endTime && outcome.verdict === 'pass' ? 'passed' : 'in_progress'
}
