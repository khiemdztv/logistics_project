// Wall Wash test catalogue: 8 methods from "thông tin đầu vào web.pptx",
// which cargo uses which method, and how each result is read.
import { CARGO_ITEMS } from './cargoData.js'

export const SOLUTION_STORAGE_NOTE = 'Các dung dịch được bảo quản ở nơi khô ráo, mát mẻ, tối.'

export const WALL_WASH_TESTS = {
  hydrocarbon: {
    id: 'hydrocarbon',
    name: 'Hydrocarbon (trộn nước)',
    shortName: 'Hydrocarbon',
    purpose: 'Phát hiện cặn dầu / hydrocarbon còn bám trên vách hầm.',
    inputType: 'choice',
    reagents: ['Nước khử khoáng (DI)', 'Ống nghiệm chia độ 100 ml', 'Methanol tinh khiết (mẫu trắng)', 'Nền đen, đèn pin'],
    steps: [
      'Rót 25 ml mẫu rửa vách vào ống nghiệm chia độ (tối thiểu 100 ml), thêm 75 ml nước khử khoáng.',
      'Pha ống mẫu trắng để đối chiếu: 25 ml methanol + 75 ml nước khử khoáng.',
      'Đặt hai ống cạnh nhau, giữ yên 20 phút, đặt nền đen phía dưới và phía sau ống.',
      'Tắt đèn, chiếu đèn pin từ bên cạnh, nhìn từ trên xuống dọc theo cột chất lỏng.',
      'So với ống mẫu trắng rồi chọn hiện tượng quan sát được.',
    ],
    options: [
      { value: 'clear', label: 'Trong suốt như mẫu trắng', verdict: 'pass', meaning: 'Hoàn toàn không còn hydrocarbon.' },
      { value: 'bluish', label: 'Ánh xanh nhạt, vẫn trong', verdict: 'fail', meaning: 'Còn vết hydrocarbon nên không đạt, phải rửa lại.' },
      { value: 'milky', label: 'Trắng đục dạng sữa (không có bọt)', verdict: 'fail', meaning: 'Còn hydrocarbon mức trung bình đến nhiều; không có bọt vẫn không đạt, phải rửa lại.' },
    ],
    standard: 'Trong suốt như mẫu trắng',
  },
  chloride: {
    id: 'chloride',
    name: 'Chloride (bạc nitrat)',
    shortName: 'Chloride',
    purpose: 'Phát hiện muối biển còn sót sau khi rửa hầm bằng nước biển.',
    inputType: 'choice',
    reagents: ['Bạc nitrat AgNO3 10%', 'Axit nitric HNO3 (khi hàng trước là dầu thực vật)', 'Nước khử khoáng (DI)', 'Găng tay nitrile'],
    steps: [
      'Nếu test Hydrocarbon đạt, dùng lại chính ống mẫu đó. Nếu không, pha ống mới: 25 ml mẫu + 25 ml methanol + 50 ml nước khử khoáng.',
      'Thêm 5 giọt AgNO3 10% vào ống mẫu và 5 giọt vào ống mẫu trắng.',
      'Đậy nắp, dốc ngược để trộn, đặt hai ống lên nền đen khoảng 15 phút.',
      'Tắt đèn, chiếu đèn pin từ bên cạnh, nhìn từ trên xuống và so độ đục hai ống.',
      'Nếu hầm từng chở dầu thực vật: thêm 2 giọt HNO3 trước khi cho AgNO3. Nếu vẫn đục thì mới là muối clorua.',
    ],
    caution: 'Luôn đeo găng tay. Mồ hôi tay có muối, chạm vào ống nghiệm sẽ làm kết quả đục giả.',
    options: [
      { value: 'clear', label: 'Trong như ống mẫu trắng', verdict: 'pass', meaning: 'Không còn muối clorua (tương đương dưới 2 ppm).' },
      { value: 'turbid', label: 'Đục hơn ống mẫu trắng', verdict: 'fail', meaning: 'Còn muối biển, cần tráng lại bằng nước ngọt / nước khử khoáng.' },
    ],
    extra: { id: 'chlorideNitric', label: 'Đã thêm 2 giọt HNO3 trước khi cho AgNO3' },
    standard: 'Trong như ống mẫu trắng',
  },
  ptt: {
    id: 'ptt',
    name: 'PTT (thời gian phai màu thuốc tím)',
    shortName: 'PTT',
    purpose: 'Phát hiện tạp chất hữu cơ dễ bị oxy hóa trong rượu và ketone.',
    inputType: 'number',
    unit: 'phút',
    step: 1,
    reagents: ['Dung dịch KMnO4 (0,1 g trong 500 ml nước khử khoáng, bảo quản trong tủ lạnh một thời gian dài, tốt nhất là 1 tuần)', 'Dung dịch chuẩn màu Platinum-Cobalt', 'Ống nghiệm 50 ml có nắp', 'Bể làm mát, pipet 2 ml, đồng hồ bấm giờ'],
    steps: [
      'Đổ mẫu vào ống nghiệm 50 ml có nắp, làm mát và giữ ở 15°C ±1°C (methanol) hoặc 25°C ±1°C (acetone).',
      'Chuẩn bị ống mẫu trắng bằng methanol phòng thí nghiệm, đặt cạnh ống mẫu.',
      'Dùng pipet thêm 2 ml dung dịch KMnO4 vào mỗi ống, đậy nắp, dốc ngược để trộn. Ghi giờ bắt đầu.',
      'Giữ ống trong thiết bị làm mát, tránh ánh sáng, kiểm tra màu sau mỗi 10 phút.',
      'Ghi số phút cho đến khi màu trùng dung dịch chuẩn Platinum-Cobalt (tím đậm, rồi hồng cá hồi, rồi vàng nhạt).',
    ],
    caution: 'Dùng quả bóp cao su để hút, tuyệt đối không hút bằng miệng.',
    reading: 'Màu giữ càng lâu càng sạch. Phai nhanh thành vàng rơm chỉ sau vài phút là không đạt.',
  },
  acidWash: {
    id: 'acidWash',
    name: 'Acid Wash Colour (màu rửa axit)',
    shortName: 'Acid Wash',
    purpose: 'Phát hiện cặn hydrocarbon thơm (benzene, toluene, xylene).',
    inputType: 'number',
    unit: 'số màu chuẩn (0 – 14)',
    step: 0.5,
    reagents: ['Axit sunfuric đậm đặc H2SO4 96% hoặc 78%', 'Bộ chuẩn màu rửa axit số 0 – 14', 'Ống đong 30 ml có nắp (loại để lắc)', 'Găng tay nhựa dùng một lần'],
    steps: [
      'Đổ H2SO4 theo nhóm mẫu (96% cho benzene, toluene, xylene; 78% cho dung môi nặng) vào ống đong 30 ml khô sạch đến vạch 7 ml.',
      'Thêm mẫu đến vạch 28 ml, đậy nắp.',
      'Lắc mạnh 150 chu kỳ trong 40 – 50 giây, biên độ 10 – 25 cm.',
      'Để yên tránh nắng: 15 phút với benzene, toluene, xylene cấp nitrat hóa; 5 phút với xylene công nghiệp, naphtha, dung môi nặng.',
      'Dốc ngược nhẹ 1 – 2 lần, so màu lớp axit với bộ chuẩn 0 – 14 trên nền trắng, ghi số gần nhất.',
    ],
    caution: 'Axit đậm đặc gây bỏng nặng. Dính axit phải rửa ngay bằng thật nhiều nước.',
    reading: 'Số càng nhỏ lớp axit càng nhạt màu, hầm càng sạch. Tài liệu không nêu số chuẩn, web dùng ngưỡng tạm theo nhóm hàng.',
  },
  appearance: {
    id: 'appearance',
    name: 'Cảm quan và màu sắc',
    shortName: 'Cảm quan',
    purpose: 'Phát hiện hạt lơ lửng, đổi màu hoặc mờ đục so với mẫu trắng.',
    inputType: 'choice',
    reagents: ['Methanol tinh khiết (mẫu trắng)', 'Nền trắng'],
    steps: [
      'Chuẩn bị ống mẫu trắng là methanol tinh khiết.',
      'Xoay tròn lọ mẫu để chất lỏng chuyển động, nhìn trên nền trắng.',
      'Tìm hạt lơ lửng (vảy sơn, gỉ sét, cặn hàng cũ), khác màu hoặc mờ đục so với mẫu trắng.',
      'Làm phép thử này đầu tiên, trước khi chia mẫu sang các phép thử khác.',
    ],
    options: [
      { value: 'ok', label: 'Trong, không hạt, cùng màu mẫu trắng', verdict: 'pass', meaning: 'Bề mặt sạch về mặt cảm quan.' },
      { value: 'particles', label: 'Có hạt lơ lửng (vảy sơn, gỉ, cặn)', verdict: 'fail', meaning: 'Rửa chưa hết cặn hoặc lớp sơn bong tróc.' },
      { value: 'color', label: 'Khác màu so với mẫu trắng', verdict: 'fail', meaning: 'Còn dư lượng có màu từ hàng cũ.' },
      { value: 'hazy', label: 'Mờ đục', verdict: 'fail', meaning: 'Còn tạp chất lơ lửng rất mịn.' },
    ],
    standard: 'Trong, không hạt, cùng màu mẫu trắng',
  },
  odour: {
    id: 'odour',
    name: 'Mùi',
    shortName: 'Mùi',
    purpose: 'Phát hiện mùi hàng cũ còn bám, có thể lây sang lô hàng mới.',
    inputType: 'choice',
    reagents: ['Giấy lọc', 'Dung dịch chuẩn để so'],
    steps: [
      'Nhúng một tờ giấy lọc vào mẫu và một tờ vào dung dịch chuẩn.',
      'Ngửi ngay lập tức, vì một số mùi bay nhanh khỏi giấy.',
      'Không ngửi trực tiếp ống nghiệm khi hàng trước là chất độc hại.',
    ],
    options: [
      { value: 'none', label: 'Không có mùi lạ', verdict: 'pass', meaning: 'Không còn mùi hàng cũ.' },
      { value: 'present', label: 'Còn mùi hàng cũ', verdict: 'fail', meaning: 'Lớp sơn còn giữ mùi, cần thông gió và rửa lại.' },
    ],
    standard: 'Không có mùi lạ',
  },
  nvm: {
    id: 'nvm',
    name: 'NVM (chất không bay hơi)',
    shortName: 'NVM',
    purpose: 'Cân lượng cặn còn lại sau khi làm bay hơi mẫu.',
    inputType: 'number',
    unit: 'ppm',
    step: 0.1,
    reagents: ['Đĩa Petri', 'Cân phân tích', 'Nguồn nhiệt làm bay hơi'],
    steps: [
      'Lấy một lượng mẫu rửa vách xác định, cân khối lượng ban đầu.',
      'Làm bay hơi mẫu trên đĩa Petri bằng nhiệt.',
      'Cân phần cặn còn lại, chia cho khối lượng mẫu ban đầu để ra ppm.',
      'So với mức chủ hàng / người thuê tàu quy định.',
    ],
    reading: 'Cặn càng ít càng sạch. Mức cho phép do chủ hàng quy định, web dùng ngưỡng tạm.',
  },
  uv: {
    id: 'uv',
    name: 'UV (quang phổ)',
    shortName: 'UV',
    purpose: 'Phát hiện hydrocarbon hấp thụ tia UV bằng máy quang phổ.',
    inputType: 'choice',
    reagents: ['Máy quang phổ UV', 'Methanol tinh khiết (mẫu đối chiếu)'],
    steps: [
      'Chuẩn bị mẫu thử và mẫu đối chiếu chỉ chứa methanol tinh khiết.',
      'Đo trên máy quang phổ UV, quét dải 220 – 350 nm.',
      'Đồ thị phẳng là đạt; đỉnh hấp thụ nhọn cho thấy còn tạp chất hydrocarbon.',
    ],
    options: [
      { value: 'flat', label: 'Đồ thị phẳng, không có đỉnh', verdict: 'pass', meaning: 'Không phát hiện tạp chất hấp thụ UV.' },
      { value: 'peaks', label: 'Có đỉnh hấp thụ', verdict: 'fail', meaning: 'Còn hydrocarbon hoặc tạp chất hữu cơ.' },
    ],
    standard: 'Đồ thị phẳng, không có đỉnh',
    requiresLab: true,
  },
}

export const WALL_WASH_TEST_ORDER = Object.keys(WALL_WASH_TESTS)
export const RESULT_EXTRA_KEYS = ['chlorideNitric']

// Which tests each cargo profile needs. R = required, O = optional.
// Number thresholds: min = must be at least, max = must not exceed.
const R = 'required'
const O = 'optional'
export const TEST_PROFILES = {
  ALCOHOL_KETONE: {
    name: 'Rượu và ketone (Methanol, Ethanol, IPA, Acetone, MEK, MIBK)',
    note: 'Bộ ba Hydrocarbon, Chloride, PTT theo hướng dẫn bộ dụng cụ Wall Wash cho methanol.',
    tests: { hydrocarbon: { level: R }, chloride: { level: R }, ptt: { level: R, min: 50 }, appearance: { level: O }, odour: { level: O } },
  },
  AROMATIC: {
    name: 'Hydrocarbon thơm (Benzene, Toluene, Xylene)',
    note: 'Dùng Acid Wash Colour thay cho PTT vì hàng thơm không phản ứng với thuốc tím.',
    tests: { chloride: { level: R }, acidWash: { level: R, max: 2, provisional: true }, appearance: { level: R }, odour: { level: O }, uv: { level: O } },
  },
  GLYCOL: {
    name: 'Glycol (MEG)',
    note: 'Hàng tan trong nước, cần sạch dầu và muối; kiểm tra thêm cảm quan màu sắc.',
    tests: { hydrocarbon: { level: R }, chloride: { level: R }, appearance: { level: R }, odour: { level: O }, uv: { level: O } },
  },
  CPP: {
    name: 'Dầu trắng CPP (Xăng, DO, Dầu hỏa, Jet A-1, ULSD)',
    note: 'Theo tổng hợp nhóm: Hydrocarbon, Chloride, Mùi và Cảm quan; UV khi có máy.',
    tests: { hydrocarbon: { level: R }, chloride: { level: R }, appearance: { level: R }, odour: { level: R }, uv: { level: O } },
  },
  VEGETABLE_OIL: {
    name: 'Dầu thực vật (dầu cọ, đậu nành, dừa, hướng dương)',
    note: 'Cặn dầu thực vật có thể gây đục giả ở test Chloride; cần thêm HNO3 và cân NVM.',
    tests: { hydrocarbon: { level: R }, chloride: { level: R, nitric: true }, ptt: { level: R, min: 30 }, appearance: { level: O }, odour: { level: R }, nvm: { level: R, max: 10, provisional: true } },
  },
  POLYMER: {
    name: 'Polymer (Styrene, VAM)',
    note: 'Chủ yếu kiểm tra cặn không bay hơi để tránh polymer bám cứng vào vách.',
    tests: { appearance: { level: R }, nvm: { level: R, max: 10 } },
  },
  GREEN_METHANOL: {
    name: 'Bio-Methanol, E-Methanol',
    note: 'Áp dụng bộ phép thử của methanol. Yêu cầu hàm lượng nước (Karl Fischer) không nằm trong 8 phương pháp.',
    tests: { hydrocarbon: { level: R }, chloride: { level: R }, ptt: { level: R, min: 50 }, appearance: { level: O }, odour: { level: O } },
  },
  AMMONIA: {
    name: 'Green Ammonia',
    note: 'Tài liệu chỉ nêu Karl Fischer và độ dẫn điện, không nằm trong 8 phương pháp. Web chỉ kiểm tra cảm quan và mùi.',
    tests: { appearance: { level: R }, odour: { level: R } },
  },
  GENERAL: {
    name: 'Kiểm tra chung',
    note: 'Nhóm hàng này thường dùng Water White. Nếu vẫn làm Wall Wash thì kiểm tra cảm quan, mùi và hydrocarbon.',
    tests: { appearance: { level: R }, odour: { level: R }, hydrocarbon: { level: O } },
  },
}

const NA_REASONS = {
  hydrocarbon: 'Không yêu cầu cho nhóm hàng này.',
  chloride: 'Không yêu cầu cho nhóm hàng này.',
  ptt: 'Chỉ dùng cho rượu, ketone và dầu thực vật.',
  acidWash: 'Chỉ dùng khi hàng mới hoặc hàng trước là hydrocarbon thơm.',
  appearance: 'Không yêu cầu cho nhóm hàng này.',
  odour: 'Không yêu cầu cho nhóm hàng này.',
  nvm: 'Chỉ dùng cho dầu thực vật và polymer.',
  uv: 'Cần máy quang phổ, không yêu cầu cho nhóm hàng này.',
}

const LEVEL_RANK = { required: 0, optional: 1, na: 2 }

export function getTestProfileId(cargoId) {
  return CARGO_ITEMS.find(item => item.id === cargoId)?.testProfile || 'GENERAL'
}

function cargoGroupOf(cargoId) {
  return CARGO_ITEMS.find(item => item.id === cargoId)?.group || null
}

// Builds the 8-row plan for a cargo change: required first, optional next, not applicable last.
export function getTestPlan(newCargoId, previousCargoId) {
  const profileId = getTestProfileId(newCargoId)
  const profile = TEST_PROFILES[profileId]
  const previousProfile = previousCargoId ? getTestProfileId(previousCargoId) : null
  const previousGroup = cargoGroupOf(previousCargoId)
  const adjustments = []
  const entries = WALL_WASH_TEST_ORDER.map(testId => {
    const config = profile.tests[testId]
    return {
      testId,
      test: WALL_WASH_TESTS[testId],
      level: config?.level || 'na',
      min: config?.min,
      max: config?.max,
      provisional: Boolean(config?.provisional),
      nitric: Boolean(config?.nitric),
      reason: config ? '' : NA_REASONS[testId],
      notes: [],
    }
  })
  const byId = Object.fromEntries(entries.map(entry => [entry.testId, entry]))

  if (previousGroup === 'VEGETABLE_OIL') {
    byId.chloride.nitric = true
    byId.chloride.notes.push('Hàng trước là dầu thực vật: thêm 2 giọt HNO3 trước AgNO3, còn đục mới là muối.')
    if (byId.chloride.level === 'na') { byId.chloride.level = R; byId.chloride.reason = '' }
    if (byId.nvm.level !== R) {
      byId.nvm.level = R
      byId.nvm.reason = ''
      byId.nvm.max = byId.nvm.max ?? 10
      byId.nvm.provisional = true
      byId.nvm.notes.push('Bắt buộc vì hàng trước là dầu thực vật, cặn không bay hơi dễ còn sót.')
    }
    adjustments.push('Hàng trước là dầu thực vật nên Chloride cần thêm HNO3 và NVM trở thành bắt buộc.')
  }
  if (previousProfile === 'AROMATIC' && byId.acidWash.level !== R) {
    byId.acidWash.level = R
    byId.acidWash.reason = ''
    byId.acidWash.max = byId.acidWash.max ?? 2
    byId.acidWash.provisional = true
    byId.acidWash.notes.push('Bắt buộc vì hàng trước là hydrocarbon thơm.')
    adjustments.push('Hàng trước là hydrocarbon thơm nên Acid Wash Colour trở thành bắt buộc.')
  }
  if (['CRUDE_OIL', 'DARK_FUEL', 'CLEAN_FUEL'].includes(previousGroup)) {
    let changed = false
    for (const testId of ['hydrocarbon', 'odour']) {
      if (byId[testId].level !== R) {
        byId[testId].level = R
        byId[testId].reason = ''
        byId[testId].notes.push('Bắt buộc vì hàng trước là dầu / nhiên liệu.')
        changed = true
      }
    }
    if (changed) adjustments.push('Hàng trước là dầu hoặc nhiên liệu nên Hydrocarbon và Mùi trở thành bắt buộc.')
  }

  const ordered = [...entries].sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || WALL_WASH_TEST_ORDER.indexOf(a.testId) - WALL_WASH_TEST_ORDER.indexOf(b.testId))
  return {
    profileId,
    profile,
    entries: ordered,
    byId,
    adjustments,
    required: ordered.filter(entry => entry.level === R).map(entry => entry.testId),
    optional: ordered.filter(entry => entry.level === O).map(entry => entry.testId),
    notApplicable: ordered.filter(entry => entry.level === 'na').map(entry => entry.testId),
  }
}

export function getStandardLabel(entry) {
  const test = entry.test
  if (test.inputType === 'choice') return test.standard
  if (entry.min !== undefined) return `≥ ${entry.min} ${test.unit}`
  if (entry.max !== undefined) return `≤ ${entry.max} ${test.unit}${entry.provisional ? ' (ngưỡng tạm)' : ''}`
  return 'Theo spec chủ hàng'
}

export function isValidResultValue(testId, value) {
  const test = WALL_WASH_TESTS[testId]
  if (!test || value === '' || value === null || value === undefined) return false
  if (test.inputType === 'choice') return test.options.some(option => option.value === value)
  return (typeof value === 'string' || typeof value === 'number') && Number.isFinite(Number(value))
}

// 'na' | 'pending' | 'pass' | 'warn' | 'fail'
export function evaluateWallWashTest(entry, value) {
  if (!entry || entry.level === 'na') return 'na'
  if (!isValidResultValue(entry.testId, value)) return 'pending'
  const test = entry.test
  if (test.inputType === 'choice') return test.options.find(option => option.value === value).verdict
  const number = Number(value)
  if (entry.min !== undefined) return number >= entry.min ? 'pass' : 'fail'
  if (entry.max !== undefined) return number <= entry.max ? 'pass' : 'fail'
  return 'pass'
}

export function summarizeWallWash(results = {}, plan) {
  const statuses = {}
  const failed = []
  const warned = []
  let requiredDone = 0
  let filledCount = 0
  for (const entry of plan.entries) {
    const status = evaluateWallWashTest(entry, results[entry.testId])
    statuses[entry.testId] = status
    if (['pass', 'warn', 'fail'].includes(status)) {
      filledCount++
      if (entry.level === 'required') requiredDone++
    }
    if (status === 'fail') failed.push(entry.testId)
    if (status === 'warn') warned.push(entry.testId)
  }
  const requiredTotal = plan.required.length
  const allRequiredPassed = requiredTotal > 0 && requiredDone === requiredTotal && failed.length === 0
  return { statuses, failed, warned, requiredDone, requiredTotal, filledCount, allRequiredPassed, hasFail: failed.length > 0 }
}

export function formatResultValue(testId, value) {
  const test = WALL_WASH_TESTS[testId]
  if (!test || value === '' || value === null || value === undefined) return '--'
  if (test.inputType === 'choice') return test.options.find(option => option.value === value)?.label || '--'
  return `${value} ${test.unit}`
}

export const STATUS_LABELS = { pass: 'Đạt', warn: 'Đạt (lưu ý)', fail: 'Không đạt', pending: 'Chưa nhập', na: 'Không áp dụng' }

// One line per test, in plain words, for reports and AI prompts.
export function describeResult(entry, results = {}) {
  const status = evaluateWallWashTest(entry, results[entry.testId])
  const value = formatResultValue(entry.testId, results[entry.testId])
  const nitric = entry.testId === 'chloride' && results.chlorideNitric === 'yes' ? ' (đã thêm HNO3)' : ''
  return `${entry.test.name}: ${value}${nitric}; chuẩn web ${getStandardLabel(entry)}; đánh giá ${STATUS_LABELS[status].toLowerCase()}`
}

export function createBlankWallWashResults() {
  const blank = {}
  for (const testId of WALL_WASH_TEST_ORDER) blank[testId] = ''
  for (const key of RESULT_EXTRA_KEYS) blank[key] = ''
  return blank
}

function passValue(entry) {
  const test = entry.test
  if (test.inputType === 'choice') return test.options.find(option => option.verdict === 'pass').value
  if (entry.min !== undefined) return String(entry.min + 10)
  if (entry.max !== undefined) return String(Math.max(0, Math.round((entry.max / 2) * 10) / 10))
  return '0'
}

function failValue(entry) {
  const test = entry.test
  if (test.inputType === 'choice') return test.options.find(option => option.verdict === 'fail').value
  if (entry.min !== undefined) return String(Math.max(0, Math.round(entry.min * 0.2)))
  if (entry.max !== undefined) return String(entry.max * 2 + 1)
  return '0'
}

export const PRESETS = [
  { id: 'pass', label: 'Mẫu đạt', failTest: null },
  { id: 'fail_hydrocarbon', label: 'Mẫu còn hydrocarbon', failTest: 'hydrocarbon' },
  { id: 'fail_chloride', label: 'Mẫu nhiễm mặn', failTest: 'chloride' },
]

// Fills every applicable test with a passing value, then fails one test when asked.
export function getPresetResults(presetId, plan) {
  const preset = PRESETS.find(item => item.id === presetId)
  if (!preset) return null
  const results = createBlankWallWashResults()
  for (const entry of plan.entries) {
    if (entry.level === 'na') continue
    results[entry.testId] = passValue(entry)
  }
  if (preset.failTest) {
    const target = plan.byId[preset.failTest]?.level !== 'na' ? plan.byId[preset.failTest] : plan.entries.find(entry => entry.level === 'required')
    if (target) results[target.testId] = failValue(target)
  }
  return results
}

export function presetAvailable(preset, plan) {
  return !preset.failTest || plan.byId[preset.failTest]?.level !== 'na'
}

export function planSummaryText(newCargoId, previousCargoId) {
  const plan = getTestPlan(newCargoId, previousCargoId)
  const names = ids => ids.map(id => WALL_WASH_TESTS[id].shortName).join(', ') || 'không có'
  return `Bắt buộc (${plan.required.length}): ${names(plan.required)}. Tùy chọn (${plan.optional.length}): ${names(plan.optional)}. Không áp dụng: ${names(plan.notApplicable)}.`
}
