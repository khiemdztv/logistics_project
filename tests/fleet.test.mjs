import test from 'node:test'
import assert from 'node:assert/strict'
import { appReducer, createInitialState } from '../src/context/appState.js'
import { DEFAULT_VESSEL, getSessionVessel, normalizeVessel, validateVessel, migrateSessions, loadFleet, formatDwt } from '../src/data/vesselData.js'
import { sanitizeAppContext, buildChatRequest, buildDiagnosticRequest, buildKnowledgeIndex } from '../lib/copilot.js'

const saved = new Map()
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: key => saved.get(key) || null,
  setItem: (key, value) => saved.set(key, value),
} })
const shipA = { name: 'Pacific One', imo: '1234567', dwt: '45000', nationality: 'Singapore', coating: 'Stainless steel' }
const shipB = { name: 'Đại Dương 02', imo: '7654321', dwt: '28000', nationality: 'Việt Nam', coating: '' }
const blank = () => { saved.clear(); return createInitialState() }
const create = (state, vessel = shipA, sessionName = 'Ca Singapore') => appReducer(state, { type: 'CREATE_SESSION', vessel, sessionName })

test('ship form normalizes inputs and rejects empty, invalid or duplicate vessel details', () => {
  const normalized = normalizeVessel({ ...shipA, name: ' Pacific One ', imo: 'IMO 1234567', dwt: '45,000' })
  assert.equal(normalized.name, 'Pacific One')
  assert.equal(normalized.imo, '1234567')
  assert.equal(normalized.dwt, '45000')
  assert.deepEqual(validateVessel(normalized), {})
  assert.deepEqual(Object.keys(validateVessel({})).sort(), ['dwt', 'imo', 'name', 'nationality'])
  for (const dwt of ['0', '-1', 'abc', 'Infinity']) assert.ok(validateVessel({ ...shipA, dwt }).dwt)
  assert.ok(validateVessel({ ...shipA, imo: '123' }).imo)
  assert.ok(validateVessel(shipA, [{ ...shipA, id: 'a' }]).imo)
  assert.deepEqual(validateVessel({ ...shipA, id: 'a' }, [{ ...shipA, id: 'a' }]), {})
  assert.equal(formatDwt('45,000'), '45.000')
})

test('legacy sessions and custom holds retain Dolphin identity and data after migration', () => {
  blank()
  const legacy = { id: 'old', dwt: '35,000', previousCargo: 'methanol', currentStep: 2, wallWashResults: { ptt: '9' } }
  saved.set('dolphin_sessions', JSON.stringify([legacy]))
  saved.set('dolphin_custom_holds', JSON.stringify([{ id: 'custom_old', name: 'Old tank' }]))
  const state = createInitialState()
  assert.equal(state.sessions[0].vesselId, DEFAULT_VESSEL.id)
  assert.equal(state.sessions[0].vessel.name, 'Dolphin 01')
  assert.equal(state.sessions[0].vessel.dwt, '35000')
  assert.deepEqual(state.sessions[0].wallWashResults, { ptt: '9' })
  assert.equal(state.customHolds[0].vesselId, DEFAULT_VESSEL.id)
  assert.deepEqual(migrateSessions({ bad: true }), [])
  saved.set('dolphin_sessions', '{broken')
  saved.set('dolphin_vessels', '{}')
  saved.set('dolphin_custom_holds', '{}')
  assert.equal(createInitialState().sessions.length, 0)
  assert.equal(createInitialState().vessels.length, 1)
  assert.deepEqual(createInitialState().customHolds, [])
})

test('two ships create independent sessions and restore the correct vessel after a reload', () => {
  let state = create(blank())
  const firstId = state.currentSessionId
  state = appReducer(state, { type: 'SET_FIELD', field: 'selectedHold', value: 'hold_1p' })
  state = appReducer(state, { type: 'SET_FIELD', field: 'holdName', value: 'Pacific tank' })
  state = appReducer(state, { type: 'SET_WALL_WASH_RESULT', testId: 'ptt', value: '9' })
  state = appReducer(state, { type: 'GO_DASHBOARD' })
  state = create(state, shipB, 'Ca Hải Phòng')
  const secondId = state.currentSessionId
  assert.equal(state.holdName, '')
  assert.equal(state.wallWashResults.ptt, '')
  assert.notEqual(state.sessions[0].vesselId, state.sessions[1].vesselId)
  saved.set('dolphin_sessions', JSON.stringify(state.sessions))
  saved.set('dolphin_vessels', JSON.stringify(state.vessels))
  let reloaded = createInitialState()
  reloaded = appReducer(reloaded, { type: 'LOAD_SESSION', sessionId: firstId })
  assert.equal(reloaded.vessel.name, shipA.name)
  assert.equal(reloaded.vessel.nationality, 'Singapore')
  assert.equal(reloaded.dwt, '45000')
  assert.equal(reloaded.sessionName, 'Ca Singapore')
  assert.equal(reloaded.wallWashResults.ptt, '9')
  reloaded = appReducer(reloaded, { type: 'LOAD_SESSION', sessionId: secondId })
  assert.equal(reloaded.vessel.name, shipB.name)
  assert.equal(reloaded.vessel.nationality, 'Việt Nam')
  assert.equal(reloaded.wallWashResults.ptt, '')
})

test('saving a vessel profile for a new session preserves previous session snapshots', () => {
  let state = create(blank())
  const oldSession = state.sessions[0]
  const original = { ...oldSession.vessel }
  const updated = { ...original, name: 'Pacific Renamed', nationality: 'Panama', dwt: '46000' }
  state = appReducer(state, { type: 'GO_DASHBOARD' })
  state = create(state, updated, 'New trip')
  assert.deepEqual(state.sessions[0].vessel, original)
  assert.equal(state.sessions[1].vessel.name, updated.name)
  assert.equal(state.vessels.find(v => v.id === original.id).nationality, 'Panama')
  state = appReducer(state, { type: 'LOAD_SESSION', sessionId: oldSession.id })
  assert.equal(state.vessel.name, original.name)
  assert.equal(state.vessel.nationality, 'Singapore')
})

test('copy and reset preserve session vessel while clearing inspection results', () => {
  let state = create(blank())
  const originalId = state.currentSessionId
  state = appReducer(state, { type: 'SET_WALL_WASH_RESULT', testId: 'ptt', value: '15' })
  state = appReducer(state, { type: 'COMPLETE_INSPECTION' })
  state = appReducer(state, { type: 'GO_DASHBOARD' })
  state = appReducer(state, { type: 'COPY_SESSION', sessionId: originalId })
  assert.equal(state.sessions[1].sessionName, 'Ca Singapore (bản sao)')
  assert.deepEqual(state.sessions[1].vessel, state.sessions[0].vessel)
  assert.equal(state.sessions[1].wallWashResults.ptt, '')
  state = appReducer(state, { type: 'LOAD_SESSION', sessionId: originalId })
  state = appReducer(state, { type: 'RESET_SESSION', sessionId: originalId })
  assert.equal(state.sessionName, 'Ca Singapore')
  assert.equal(state.vessel.name, shipA.name)
  assert.equal(state.dwt, '45000')
  assert.equal(state.wallWashResults.ptt, '')
  assert.equal(state.endTime, null)
})

test('editing the vessel and name of one session does not change other sessions', () => {
  let state = create(blank())
  const first = state.sessions[0]
  state = appReducer(state, { type: 'GO_DASHBOARD' })
  state = create(state, { ...first.vessel }, 'Second')
  const second = state.sessions[1]
  state = appReducer(state, { type: 'UPDATE_SESSION_DETAILS', sessionId: second.id, vessel: shipB, sessionName: 'Changed' })
  assert.equal(state.sessions[0].vessel.name, shipA.name)
  assert.equal(state.sessions[0].sessionName, 'Ca Singapore')
  assert.equal(state.sessions[1].vessel.name, shipB.name)
  assert.equal(state.vessel.name, shipB.name)
  assert.equal(state.sessionName, 'Changed')
  state = appReducer(state, { type: 'SAVE_CURRENT_SESSION' })
  assert.equal(state.sessions[1].vessel.nationality, 'Việt Nam')
})

test('adding a ship alone does not create a session; duplicate IMO never creates another ship', () => {
  let state = blank()
  assert.strictEqual(appReducer(state, { type: 'CREATE_SESSION', vessel: {} }), state)
  state = appReducer(state, { type: 'ADD_VESSEL', vessel: shipA })
  assert.equal(state.sessions.length, 0)
  assert.equal(state.currentView, 'dashboard')
  assert.equal(state.vessels.length, 2)
  assert.strictEqual(appReducer(state, { type: 'ADD_VESSEL', vessel: shipA }), state)
  assert.strictEqual(create(state, shipA), state)
  const record = state.vessels.find(v => v.name === shipA.name)
  state = create(state, record, '')
  assert.equal(state.sessions.length, 1)
  assert.equal(state.vessels.length, 2)
  assert.equal(state.sessionName, 'Ca kiểm tra · Pacific One')
})

test('custom tanks belong to the active vessel and missing fleet records recover from sessions', () => {
  let state = create(blank())
  state = appReducer(state, { type: 'ADD_CUSTOM_HOLD', name: 'Tank 5', capacity: '800 m³' })
  assert.equal(state.customHolds[0].vesselId, state.vesselId)
  const fleet = loadFleet([], state.sessions)
  assert.equal(fleet.find(v => v.id === state.vesselId).name, shipA.name)
  assert.deepEqual(getSessionVessel(state.sessions[0]), state.vessel)
})

test('copilot receives the active vessel fields and excludes extra private fields', () => {
  const context = sanitizeAppContext({ vessel: { ...shipA, key: 'secret' }, sessionName: 'Pacific trip' })
  assert.deepEqual(context.vessel, shipA)
  const request = buildChatRequest('Ca này của tàu nào?', [], buildKnowledgeIndex(''), context)
  assert.match(request.messages[0].content, /Pacific One/)
  assert.match(request.messages[0].content, /1234567/)
  assert.doesNotMatch(request.messages[0].content, /secret/)
  const diagnosis = buildDiagnosticRequest({ previousCargo: 'palm_oil_crude', newCargo: 'methanol', failedTests: ['ptt'], allResults: { ptt: '6.5' }, vessel: shipA }, buildKnowledgeIndex(''))
  assert.match(diagnosis.messages[0].content, /"coating":"Stainless steel"/)
})

test('deleted ships stay deleted after reload while historical sessions and reports keep their identity', () => {
  let state = create(blank())
  state = appReducer(state, { type: 'GO_DASHBOARD' })
  const original = state.sessions[0]
  state = appReducer(state, { type: 'DELETE_VESSEL', vesselId: original.vesselId })
  assert.ok(!state.vessels.some(v => v.id === original.vesselId))
  assert.deepEqual(state.sessions[0], original)
  saved.set('dolphin_sessions', JSON.stringify(state.sessions))
  saved.set('dolphin_vessels', JSON.stringify(state.vessels))
  saved.set('dolphin_deleted_vessels', JSON.stringify(state.deletedVesselIds))
  state = createInitialState()
  assert.ok(!state.vessels.some(v => v.id === original.vesselId))
  state = appReducer(state, { type: 'LOAD_SESSION', sessionId: original.id })
  assert.equal(state.vessel.name, shipA.name)
  assert.equal(state.vessel.imo, shipA.imo)
  state = appReducer(state, { type: 'UPDATE_SESSION_DETAILS', sessionId: original.id, vessel: original.vessel, sessionName: 'Renamed historical trip' })
  assert.equal(state.sessionName, 'Renamed historical trip')
  assert.ok(!state.vessels.some(v => v.id === original.vesselId))
})

test('even the original Dolphin ship can be deleted without the fleet seeding it again', () => {
  let state = blank()
  state = appReducer(state, { type: 'DELETE_VESSEL', vesselId: DEFAULT_VESSEL.id })
  assert.deepEqual(state.vessels, [])
  saved.set('dolphin_deleted_vessels', JSON.stringify(state.deletedVesselIds))
  saved.set('dolphin_vessels', '[]')
  state = createInitialState()
  assert.deepEqual(state.vessels, [])
  state = create(state, shipA)
  assert.equal(state.vessels.length, 1)
  assert.equal(state.vessel.name, shipA.name)
})

test('adding the same IMO again creates a new ship while edits to old trips keep the deleted snapshot', () => {
  let state = create(blank())
  const original = state.sessions[0]
  state = appReducer(state, { type: 'DELETE_VESSEL', vesselId: original.vesselId })
  assert.strictEqual(create(state, original.vessel), state)
  state = appReducer(state, { type: 'ADD_VESSEL', vessel: shipA })
  const replacement = state.vessels.find(v => v.imo === shipA.imo)
  assert.notEqual(replacement.id, original.vesselId)
  state = appReducer(state, { type: 'UPDATE_SESSION_DETAILS', sessionId: original.id, vessel: original.vessel, sessionName: 'Historical trip' })
  assert.equal(state.sessions[0].sessionName, 'Historical trip')
  assert.equal(state.sessions[0].vesselId, original.vesselId)
  assert.ok(!state.vessels.some(v => v.id === original.vesselId))
})
