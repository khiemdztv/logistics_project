import test from 'node:test'
import assert from 'node:assert/strict'
import { evidenceTarget, normalizePhotos, photosFor, hasEvidence, missingEvidence, countEvidence, createPhotoRecord, makeDemoPhoto, isValidPhotoRecord } from '../src/data/evidence.js'
import { appReducer, createInitialState } from '../src/context/appState.js'
import { putPhoto, getPhoto, deletePhotos } from '../src/services/photoStore.js'

const saved = new Map()
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: key => saved.get(key) || null,
  setItem: (key, value) => saved.set(key, value),
} })
const ship = { name: 'Pacific One', imo: '1234567', dwt: '45000', nationality: 'Singapore', coating: 'Epoxy' }
const fresh = () => { saved.clear(); return appReducer(createInitialState(), { type: 'CREATE_SESSION', vessel: ship, sessionName: 'Ca ảnh' }) }

test('photo records are tied to one checklist area or test', () => {
  const ceiling = evidenceTarget('wh', 'ceiling')
  const ptt = evidenceTarget('ww', 'ptt')
  const photos = [createPhotoRecord({ id: 'a', target: ceiling, source: 'camera' }), createPhotoRecord({ id: 'b', target: ptt }), { legacy: 'data:image/png' }, null]
  assert.equal(normalizePhotos(photos).length, 2)
  assert.deepEqual(photosFor(photos, ceiling).map(p => p.id), ['a'])
  assert.ok(hasEvidence(photos, ptt))
  assert.ok(!hasEvidence(photos, evidenceTarget('ww', 'chloride')))
  assert.deepEqual(missingEvidence([ceiling, evidenceTarget('wh', 'bottom')], photos), ['wh:bottom'])
  assert.equal(countEvidence(photos, 'ww'), 1)
  assert.equal(createPhotoRecord({ id: 'c', target: ptt, source: 'hack' }).source, 'upload')
  assert.ok(!isValidPhotoRecord({ id: 'x', target: 'other:ptt' }))
})

test('the reducer adds, removes and keeps photos with the session', () => {
  let state = fresh()
  const record = createPhotoRecord({ id: 'p1', target: 'wh:ceiling', source: 'camera' })
  state = appReducer(state, { type: 'ADD_PHOTO', photo: record })
  state = appReducer(state, { type: 'ADD_PHOTO', photo: { id: 'bad' } })
  assert.deepEqual(state.photos.map(p => p.id), ['p1'])
  state = appReducer(state, { type: 'SAVE_CURRENT_SESSION' })
  const sessionId = state.currentSessionId
  state = appReducer(state, { type: 'GO_DASHBOARD' })
  state = appReducer(state, { type: 'LOAD_SESSION', sessionId })
  assert.deepEqual(state.photos.map(p => p.id), ['p1'])
  state = appReducer(state, { type: 'REMOVE_PHOTO', photoId: 'p1' })
  assert.equal(state.photos.length, 0)
})

test('asking for a re-wash clears only that method\'s evidence; copies start without photos', () => {
  let state = fresh()
  state = appReducer(state, { type: 'ADD_PHOTO', photo: createPhotoRecord({ id: 'w1', target: 'ww:ptt' }) })
  state = appReducer(state, { type: 'ADD_PHOTO', photo: createPhotoRecord({ id: 'h1', target: 'wh:bottom' }) })
  state = appReducer(state, { type: 'RESET_WALL_WASH' })
  assert.deepEqual(state.photos.map(p => p.id), ['h1'])
  state = appReducer(state, { type: 'RESET_WATER_WHITE' })
  assert.equal(state.photos.length, 0)
  state = appReducer(state, { type: 'ADD_PHOTO', photo: createPhotoRecord({ id: 'w2', target: 'ww:ptt' }) })
  state = appReducer(state, { type: 'SAVE_CURRENT_SESSION' })
  const id = state.currentSessionId
  state = appReducer(state, { type: 'GO_DASHBOARD' })
  state = appReducer(state, { type: 'COPY_SESSION', sessionId: id })
  assert.deepEqual(state.sessions.at(-1).photos, [])
})

test('demo placeholder is a readable image and the store works without a browser database', async () => {
  const demo = makeDemoPhoto('Đáy hầm <1>', 'fail')
  assert.match(demo, /^data:image\/svg\+xml/)
  assert.match(decodeURIComponent(demo), /KHÔNG ĐẠT/)
  assert.match(decodeURIComponent(demo), /Đáy hầm &lt;1&gt;/)
  const id = await putPhoto(demo)
  assert.equal(await getPhoto(id), demo)
  await deletePhotos([id])
  assert.equal(await getPhoto(id), null)
})
