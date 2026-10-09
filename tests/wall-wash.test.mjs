import test from 'node:test'
import assert from 'node:assert/strict'
import {
  WALL_WASH_TESTS, WALL_WASH_TEST_ORDER, getTestPlan, summarizeWallWash, evaluateWallWashTest,
  getStandardLabel, describeResult, getPresetResults, PRESETS, presetAvailable, createBlankWallWashResults, isValidResultValue,
} from '../src/data/wallWashTests.js'
import { CARGO_ITEMS } from '../src/data/cargoData.js'
import { getKnowledgeIndex } from '../api/chat.js'
import { buildChatRequest, buildDiagnosticRequest, buildKnowledgeIndex, sanitizeAppContext } from '../lib/copilot.js'

test('the catalogue holds exactly the 8 methods from the input document', () => {
  assert.deepEqual(WALL_WASH_TEST_ORDER, ['hydrocarbon', 'chloride', 'ptt', 'acidWash', 'appearance', 'odour', 'nvm', 'uv'])
  for (const test of Object.values(WALL_WASH_TESTS)) {
    assert.ok(test.steps.length >= 3, `${test.id} has steps`)
    if (test.inputType === 'choice') {
      assert.ok(test.options.some(option => option.verdict === 'pass'), `${test.id} has a passing option`)
      assert.ok(test.options.some(option => option.verdict === 'fail'), `${test.id} has a failing option`)
    } else assert.ok(test.unit, `${test.id} has a unit`)
  }
  assert.ok(CARGO_ITEMS.every(item => item.testProfile), 'every cargo has a test profile')
})

test('methanol needs exactly three required tests and locks the other rows', () => {
  const plan = getTestPlan('methanol', 'palm_oil_refined')
  assert.deepEqual(plan.required, ['hydrocarbon', 'chloride', 'ptt', 'nvm'])
  const simple = getTestPlan('methanol')
  assert.deepEqual(simple.required, ['hydrocarbon', 'chloride', 'ptt'])
  assert.deepEqual(simple.optional, ['appearance', 'odour'])
  assert.deepEqual(simple.notApplicable, ['acidWash', 'nvm', 'uv'])
  assert.equal(simple.entries.length, 8)
  assert.equal(simple.entries[0].testId, 'hydrocarbon')
  assert.equal(simple.entries.at(-1).level, 'na')
  assert.equal(getStandardLabel(simple.byId.ptt), '≥ 50 phút')
})

test('the previous cargo changes how the same method is read', () => {
  const afterVegOil = getTestPlan('methanol', 'palm_oil_crude')
  assert.ok(afterVegOil.byId.chloride.nitric)
  assert.equal(afterVegOil.byId.nvm.level, 'required')
  assert.match(afterVegOil.adjustments.join(' '), /HNO3/)
  const afterBenzene = getTestPlan('methanol', 'benzene')
  assert.equal(afterBenzene.byId.acidWash.level, 'required')
  const afterDiesel = getTestPlan('styrene', 'diesel_do')
  assert.equal(afterDiesel.byId.hydrocarbon.level, 'required')
  assert.equal(afterDiesel.byId.odour.level, 'required')
  assert.equal(getTestPlan('benzene').byId.ptt.level, 'na')
  assert.equal(getTestPlan('palm_oil_crude').byId.ptt.min, 30)
})

test('observations and numbers are judged per method, including hydrocarbon traces', () => {
  const plan = getTestPlan('methanol')
  assert.equal(evaluateWallWashTest(plan.byId.hydrocarbon, 'clear'), 'pass')
  assert.equal(evaluateWallWashTest(plan.byId.hydrocarbon, 'bluish'), 'fail')
  assert.equal(evaluateWallWashTest(plan.byId.hydrocarbon, 'milky'), 'fail')
  assert.equal(evaluateWallWashTest(plan.byId.hydrocarbon, '25'), 'pending')
  assert.equal(evaluateWallWashTest(plan.byId.chloride, '0.8'), 'pending')
  assert.equal(evaluateWallWashTest(plan.byId.ptt, '50'), 'pass')
  assert.equal(evaluateWallWashTest(plan.byId.ptt, '49.9'), 'fail')
  assert.equal(evaluateWallWashTest(plan.byId.nvm, '3'), 'na')
  const results = { ...createBlankWallWashResults(), hydrocarbon: 'bluish', chloride: 'clear', ptt: '55' }
  const summary = summarizeWallWash(results, plan)
  assert.equal(summary.requiredDone, 3)
  assert.ok(!summary.allRequiredPassed)
  assert.deepEqual(summary.failed, ['hydrocarbon'])
  assert.deepEqual(summary.warned, [])
  const optionalFail = summarizeWallWash({ ...results, hydrocarbon: 'clear', odour: 'present' }, plan)
  assert.ok(!optionalFail.allRequiredPassed)
  assert.deepEqual(optionalFail.failed, ['odour'])
  assert.ok(!summarizeWallWash({ ...results, ptt: '' }, plan).allRequiredPassed)
  assert.ok(!isValidResultValue('chloride', 'bad'))
  assert.ok(isValidResultValue('ptt', 12))
})

test('Copilot receives the revised hydrocarbon verdicts and reagent storage instructions', () => {
  const index = getKnowledgeIndex()
  for (const question of ['Hydrocarbon ánh xanh nhạt có đạt không?', 'Trắng đục dạng sữa không có bọt có đạt không?']) {
    const request = buildChatRequest(question, [], index)
    assert.ok(request.chunks.some(chunk => chunk.id === 'app-guide-hydrocarbon'))
    assert.match(request.messages[0].content, /Ánh xanh nhạt, vẫn trong: không đạt/)
    assert.match(request.messages[0].content, /Trắng đục dạng sữa \(không có bọt\): không đạt/)
  }
  const storage = buildChatRequest('Dung dịch KMnO4 pha bằng nước gì và bảo quản như thế nào?', [], index)
  const passage = storage.chunks.find(chunk => chunk.id === 'app-guide-ptt')
  assert.ok(passage)
  assert.match(passage.text, /0,1 g trong 500 ml nước khử khoáng/)
  assert.match(passage.text, /bảo quản trong tủ lạnh một thời gian dài, tốt nhất là 1 tuần/)
  assert.match(passage.text, /khô ráo, mát mẻ, tối/)
  const diagnostic = buildDiagnosticRequest({ failedTests: ['hydrocarbon'], allResults: { hydrocarbon: 'bluish' }, newCargo: 'methanol' }, index)
  assert.match(diagnostic.messages.at(-1).content, /Ánh xanh nhạt, vẫn trong.*đánh giá không đạt/)
})

test('results are described in plain words for reports and the AI prompt', () => {
  const plan = getTestPlan('methanol', 'palm_oil_crude')
  const results = { chloride: 'turbid', chlorideNitric: 'yes', ptt: '6.5' }
  assert.equal(describeResult(plan.byId.chloride, results), 'Chloride (bạc nitrat): Đục hơn ống mẫu trắng (đã thêm HNO3); chuẩn web Trong như ống mẫu trắng; đánh giá không đạt')
  assert.match(describeResult(plan.byId.ptt, results), /6\.5 phút; chuẩn web ≥ 50 phút; đánh giá không đạt/)
  const request = buildDiagnosticRequest({ failedTests: ['chloride'], allResults: results, previousCargo: 'palm_oil_crude', newCargo: 'methanol' }, buildKnowledgeIndex(''))
  assert.match(request.messages.at(-1).content, /Đục hơn ống mẫu trắng \(đã thêm HNO3\)/)
  assert.deepEqual(sanitizeAppContext({ wallWashResults: { chloride: 'turbid', hydrocarbon: '25', ptt: '6.5', chlorideNitric: 'yes', salinity: '12' } }).wallWashResults, { chloride: 'turbid', ptt: '6.5', chlorideNitric: 'yes' })
})

test('quick presets only fill applicable rows and fail the chosen method', () => {
  const plan = getTestPlan('methanol')
  const pass = getPresetResults('pass', plan)
  assert.equal(pass.acidWash, '')
  assert.ok(summarizeWallWash(pass, plan).allRequiredPassed)
  const salty = getPresetResults('fail_chloride', plan)
  assert.deepEqual(summarizeWallWash(salty, plan).failed, ['chloride'])
  const oily = getPresetResults('fail_hydrocarbon', plan)
  assert.deepEqual(summarizeWallWash(oily, plan).failed, ['hydrocarbon'])
  const polymer = getTestPlan('styrene')
  assert.ok(!presetAvailable(PRESETS.find(preset => preset.id === 'fail_chloride'), polymer))
  assert.ok(summarizeWallWash(getPresetResults('pass', polymer), polymer).allRequiredPassed)
})
