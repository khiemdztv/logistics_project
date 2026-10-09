import test from 'node:test'
import assert from 'node:assert/strict'
import { WATER_WHITE_AREAS } from '../src/data/cargoData.js'
import { getTestPlan, getPresetResults } from '../src/data/wallWashTests.js'
import { getInspectionOutcome, getSessionStatus } from '../src/data/inspectionOutcome.js'
import { appReducer, createInitialState } from '../src/context/appState.js'

const waterWhite = fail => ({ selectedMethod: 'WATER_WHITE',
  waterWhiteChecklist: Object.fromEntries(WATER_WHITE_AREAS.map(area => [area.id, area.id === fail ? 'fail' : 'pass'])),
  photos: WATER_WHITE_AREAS.map(area => ({ id: `photo_${area.id}`, target: `wh:${area.id}` })) })
const wallWash = preset => {
  const plan = getTestPlan('methanol', 'palm_oil_crude')
  return { selectedMethod: 'WALL_WASH', newCargo: 'methanol', previousCargo: 'palm_oil_crude',
    wallWashResults: getPresetResults(preset, plan), photos: plan.entries.filter(entry => entry.level !== 'na').map(entry => ({ id: `photo_${entry.testId}`, target: `ww:${entry.testId}` })) }
}

test('six passing areas and one failed area can export a failed Water White report', () => {
  const outcome = getInspectionOutcome(waterWhite('bottom'))
  assert.equal(outcome.canExport, true)
  assert.equal(outcome.verdict, 'fail')
  assert.equal(outcome.label, 'KHÔNG ĐẠT')
  assert.equal(outcome.failedItems.length, 1)
  assert.equal(getSessionStatus({ ...waterWhite('bottom'), endTime: new Date().toISOString() }), 'failed')
})

test('failed Wall Wash reports export with the actual failed test; passing tests remain passing', () => {
  const failed = getInspectionOutcome(wallWash('fail_hydrocarbon'))
  assert.equal(failed.canExport, true)
  assert.equal(failed.verdict, 'fail')
  assert.equal(failed.failedItems.length, 1)
  const passed = wallWash('pass')
  assert.equal(getInspectionOutcome(passed).verdict, 'pass')
  assert.equal(getSessionStatus({ ...passed, endTime: '2026-10-09T03:00:00Z' }), 'passed')
})

test('revised hydrocarbon failures can export and old bluish sessions reload as failed', () => {
  for (const observation of ['bluish', 'milky']) {
    const data = wallWash('pass')
    data.wallWashResults.hydrocarbon = observation
    const outcome = getInspectionOutcome(data)
    assert.equal(outcome.verdict, 'fail')
    assert.equal(outcome.canExport, true)
    assert.deepEqual(outcome.failedItems, ['Hydrocarbon (trộn nước)'])
  }
  const data = wallWash('pass')
  data.wallWashResults.hydrocarbon = 'bluish'
  const saved = [{ id: 'old_bluish', ...data, status: 'passed', endTime: '2026-10-09T03:00:00Z' }]
  const originalStorage = globalThis.localStorage
  globalThis.localStorage = { getItem: key => key === 'dolphin_sessions' ? JSON.stringify(saved) : null }
  try {
    const reloaded = createInitialState()
    assert.equal(reloaded.sessions[0].status, 'failed')
    assert.equal(reloaded.sessions[0].wallWashResults.hydrocarbon, 'bluish')
    const state = appReducer(reloaded, { type: 'LOAD_SESSION', sessionId: 'old_bluish' })
    assert.equal(getInspectionOutcome(state).label, 'KHÔNG ĐẠT')
    assert.deepEqual(state.photos, data.photos)
  } finally {
    if (originalStorage === undefined) delete globalThis.localStorage
    else globalThis.localStorage = originalStorage
  }
})

test('missing required results or photos do not produce a passing report or bypass evidence', () => {
  const missing = waterWhite()
  missing.waterWhiteChecklist.bottom = null
  assert.equal(getInspectionOutcome(missing).canExport, false)
  assert.equal(getInspectionOutcome(missing).verdict, 'pending')
  const missingPhoto = wallWash('pass')
  missingPhoto.photos = []
  assert.equal(getInspectionOutcome(missingPhoto).canExport, false)
  assert.equal(getSessionStatus({ ...missingPhoto, endTime: 'old' }), 'in_progress')
  const failedPhoto = waterWhite('bottom')
  failedPhoto.photos = []
  assert.equal(getInspectionOutcome(failedPhoto).verdict, 'fail')
  assert.equal(getInspectionOutcome(failedPhoto).canExport, false)
})

test('export saves a failed session immediately and preserves its result on reload', () => {
  const sessionId = 'failed_session'
  const data = waterWhite('bottom')
  let state = { ...createInitialState(), ...data, currentSessionId: sessionId, currentView: 'inspection', currentStep: 2,
    sessions: [{ id: sessionId, ...data }] }
  state = appReducer(state, { type: 'COMPLETE_INSPECTION' })
  assert.equal(state.currentStep, 3)
  assert.equal(state.sessions[0].status, 'failed')
  assert.ok(state.sessions[0].endTime)
  assert.equal(state.inspectionLog.at(-1).type, 'fail')
  state = appReducer(state, { type: 'GO_DASHBOARD' })
  state = appReducer(state, { type: 'LOAD_SESSION', sessionId })
  assert.equal(getInspectionOutcome(state).label, 'KHÔNG ĐẠT')
  assert.equal(state.waterWhiteChecklist.bottom, 'fail')
  state = appReducer(state, { type: 'RESET_WATER_WHITE' })
  assert.equal(state.endTime, null)
  assert.equal(getInspectionOutcome(state).verdict, 'pending')
})

test('completion rejects unjudged items even when an action bypasses the export button', () => {
  const state = createInitialState()
  assert.strictEqual(appReducer(state, { type: 'COMPLETE_INSPECTION' }), state)
})
