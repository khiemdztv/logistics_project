// Cargo goods database with compatibility matrix and test methods
export const CARGO_GROUPS = {
  CRUDE_OIL: {
    id: 'crude_oil',
    name: 'Dầu Thô (Crude Oil)',
    type: 'Dầu thô',
    testMethod: 'WATER_WHITE',
    cleaning: ['COW áp lực cao', 'Seaclean dung môi dầu mỏ'],
    tests: ['Visual Inspection', 'LEL', 'O2', 'H2S'],
    notes: 'Độ nhớt cao, bám dính mạnh, nhiều cặn bùn paraffin/asphalt'
  },
  VEGETABLE_OIL: {
    id: 'vegetable_oil',
    name: 'Dầu Thực Vật',
    type: 'Dầu thực vật',
    testMethod: 'WALL_WASH',
    cleaning: ['Nước ấm ≤40°C rửa dầu thừa', 'Alkaclean 5% + nước nóng 80°C', 'Nước ngọt tráng cuối'],
    tests: ['Hydrocarbon', 'PTT', 'Chloride', 'Odour & Appearance'],
    notes: 'Dễ oxy hóa, dễ ôi thiu. Dùng kiềm mạnh (Alkaline Cleaner) để xà phòng hóa'
  },
  CHEMICAL_SOLVENT: {
    id: 'chemical_solvent',
    name: 'Hóa Chất & Dung Môi Công Nghiệp',
    type: 'Hóa chất tinh khiết',
    testMethod: 'WALL_WASH',
    cleaning: ['Nước ngọt/nước cất nóng', 'Methanol hoặc Acetone để rửa/xông', 'Nước cất tráng cuối'],
    tests: ['Hydrocarbon', 'PTT', 'APHA/Hazen Color', 'Chloride', 'UV Scan'],
    notes: 'Tính bay hơi cao, đòi hỏi độ tinh khiết tuyệt đối'
  },
  CLEAN_FUEL: {
    id: 'clean_fuel',
    name: 'Dầu Trắng (CPP: Xăng, DO, Jet A-1)',
    type: 'Nhiên liệu sạch',
    testMethod: 'WALL_WASH',
    cleaning: ['Seaclean Hydrocarbon + nước nóng', 'Nước ngọt tráng cuối'],
    tests: ['Hydrocarbon', 'Chloride', 'PTT', 'APHA Color', 'Particulate Matter'],
    notes: 'Tiêu chuẩn khắt khe, đặc biệt Jet A-1 tránh tắc bộ lọc máy bay'
  },
  DARK_FUEL: {
    id: 'dark_fuel',
    name: 'Dầu Đen (DPP: FO, Bitumen)',
    type: 'Nhiên liệu nặng',
    testMethod: 'WATER_WHITE',
    cleaning: ['Rửa nóng nhiều lần', 'Dung môi hydrocarbon nếu cần'],
    tests: ['Visual Inspection', 'Odour Test'],
    notes: 'Hàng nặng, chủ yếu kiểm tra cảm quan'
  },
  GREEN_ENERGY: {
    id: 'green_energy',
    name: 'Năng Lượng Xanh (Bio-Methanol, Ammonia)',
    type: 'Nhiên liệu tương lai',
    testMethod: 'WALL_WASH',
    cleaning: ['Phun rửa áp lực cao bằng nước cất siêu sạch'],
    tests: ['Karl Fischer (Hàm lượng nước)', 'Conductivity (Độ dẫn điện)'],
    notes: 'Yêu cầu độ ngậm nước siêu vi lượng cực thấp'
  },
  POLYMER: {
    id: 'polymer',
    name: 'Hóa Chất Polymer (Styrene, VAM)',
    type: 'Polymer hóa',
    testMethod: 'WALL_WASH',
    cleaning: ['Rửa bằng Acetone phòng thí nghiệm'],
    tests: ['NVM (Non-Volatile Matter)', 'Visual Inspection'],
    notes: 'Dễ tự liên kết tạo nhựa polymer bám cứng vĩnh viễn vào vách hầm'
  }
}

// Individual cargo items mapped to groups
export const CARGO_ITEMS = [
  // Crude Oil
  { id: 'crude_arabian_light', name: 'Arabian Light Crude', group: 'CRUDE_OIL' },
  { id: 'crude_bonny_light', name: 'Bonny Light Crude', group: 'CRUDE_OIL' },
  { id: 'crude_generic', name: 'Dầu thô (chung)', group: 'CRUDE_OIL' },
  
  // Vegetable Oils
  { id: 'palm_oil_crude', name: 'Dầu Cọ Thô (Crude Palm Oil)', group: 'VEGETABLE_OIL' },
  { id: 'palm_oil_refined', name: 'Dầu Cọ Tinh Luyện (RBD Palm Oil)', group: 'VEGETABLE_OIL' },
  { id: 'soybean_oil', name: 'Dầu Đậu Nành (Soybean Oil)', group: 'VEGETABLE_OIL' },
  { id: 'coconut_oil', name: 'Dầu Dừa (Coconut Oil)', group: 'VEGETABLE_OIL' },
  { id: 'sunflower_oil', name: 'Dầu Hướng Dương (Sunflower Oil)', group: 'VEGETABLE_OIL' },
  
  // Chemical Solvents
  { id: 'methanol', name: 'Methanol', group: 'CHEMICAL_SOLVENT' },
  { id: 'ethanol', name: 'Ethanol', group: 'CHEMICAL_SOLVENT' },
  { id: 'acetone', name: 'Acetone', group: 'CHEMICAL_SOLVENT' },
  { id: 'benzene', name: 'Benzene', group: 'CHEMICAL_SOLVENT' },
  { id: 'toluene', name: 'Toluene', group: 'CHEMICAL_SOLVENT' },
  { id: 'xylene', name: 'Xylene', group: 'CHEMICAL_SOLVENT' },
  { id: 'meg', name: 'MEG (Mono Ethylene Glycol)', group: 'CHEMICAL_SOLVENT' },
  { id: 'ipa', name: 'IPA (Isopropyl Alcohol)', group: 'CHEMICAL_SOLVENT' },
  { id: 'mek', name: 'MEK (Methyl Ethyl Ketone)', group: 'CHEMICAL_SOLVENT' },
  { id: 'mibk', name: 'MIBK (Methyl Isobutyl Ketone)', group: 'CHEMICAL_SOLVENT' },
  
  // Clean Petroleum Products (CPP)
  { id: 'gasoline_a92', name: 'Xăng A92/A95 (Gasoline)', group: 'CLEAN_FUEL' },
  { id: 'diesel_do', name: 'Diesel Oil (DO)', group: 'CLEAN_FUEL' },
  { id: 'kerosene', name: 'Dầu Hỏa (Kerosene)', group: 'CLEAN_FUEL' },
  { id: 'jet_a1', name: 'Jet A-1 (Nhiên liệu máy bay)', group: 'CLEAN_FUEL' },
  { id: 'ulsd', name: 'ULSD (Ultra Low Sulfur Diesel)', group: 'CLEAN_FUEL' },
  
  // Dark Petroleum Products (DPP)
  { id: 'fuel_oil', name: 'Fuel Oil (FO/HFO)', group: 'DARK_FUEL' },
  { id: 'bitumen', name: 'Bitumen (Nhựa đường)', group: 'DARK_FUEL' },
  
  // Green Energy
  { id: 'bio_methanol', name: 'Bio-Methanol', group: 'GREEN_ENERGY' },
  { id: 'e_methanol', name: 'E-Methanol', group: 'GREEN_ENERGY' },
  { id: 'green_ammonia', name: 'Green Ammonia', group: 'GREEN_ENERGY' },
  
  // Polymer
  { id: 'styrene', name: 'Styrene Monomer', group: 'POLYMER' },
  { id: 'vam', name: 'Vinyl Acetate Monomer (VAM)', group: 'POLYMER' },
]

// FOSFA Banned immediate previous cargoes (simplified)
export const FOSFA_BANNED = [
  'crude_generic', 'crude_arabian_light', 'crude_bonny_light',
  'fuel_oil', 'bitumen', 'benzene', 'toluene', 'xylene',
  'styrene', 'vam'
]

// Compatibility matrix: previousCargo -> newCargo restrictions
export function checkCompatibility(prevCargoId, newCargoId) {
  const prevItem = CARGO_ITEMS.find(c => c.id === prevCargoId)
  const newItem = CARGO_ITEMS.find(c => c.id === newCargoId)
  
  if (!prevItem || !newItem) {
    return { allowed: true, notes: [], method: 'WATER_WHITE' }
  }
  
  const prevGroup = CARGO_GROUPS[prevItem.group]
  const newGroup = CARGO_GROUPS[newItem.group]
  
  const notes = []
  let allowed = true
  
  // FOSFA check: vegetable oils cannot follow banned cargoes
  if (newItem.group === 'VEGETABLE_OIL' && FOSFA_BANNED.includes(prevCargoId)) {
    allowed = false
    notes.push('⛔ FOSFA: Hàng trước bị CẤM HOÀN TOÀN khi chở dầu thực vật')
    notes.push('Tham khảo: FOSFA List of Banned Immediate Previous Cargoes')
  }
  
  // Same group - easier cleaning
  if (prevItem.group === newItem.group) {
    notes.push('✅ Cùng nhóm hàng — quy trình rửa đơn giản hơn')
  }
  
  // Crude/Dark to Clean/Chemical - needs intensive cleaning
  if (['CRUDE_OIL', 'DARK_FUEL'].includes(prevItem.group) && 
      ['CLEAN_FUEL', 'CHEMICAL_SOLVENT', 'GREEN_ENERGY'].includes(newItem.group)) {
    notes.push('⚠️ Cần rửa cường độ cao: Hàng trước là dầu nặng, hàng mới yêu cầu độ tinh khiết')
    notes.push('Khuyến nghị: Rửa nhiều vòng + Wall Wash Test bắt buộc')
  }
  
  // Vegetable oil leaves residue
  if (prevItem.group === 'VEGETABLE_OIL' && newItem.group !== 'VEGETABLE_OIL') {
    notes.push('⚠️ Dầu thực vật để lại cặn NVM + axit béo, cần Alkaline Cleaner để xà phòng hóa')
  }
  
  // Epoxy coating note for Dolphin 01
  notes.push('📌 Tàu Dolphin 01 bọc Epoxy: Chú ý Epoxy hấp thụ mùi hàng trước, cần thông gió cưỡng bức')
  
  // Determine test method based on new cargo
  const method = newGroup.testMethod
  
  return { allowed, notes, method, prevGroup, newGroup }
}

// Wall Wash test thresholds
export const WALL_WASH_THRESHOLDS = {
  salinity: { name: 'Độ mặn (Salinity)', unit: 'ppm', max: 50, comparison: '≤' },
  ptt: { name: 'PTT (Permanganate Time)', unit: 'min', min: 8, comparison: '≥' },
  apha: { name: 'Độ màu (APHA/Hazen)', unit: 'APHA', max: 20, comparison: '≤' },
  hydrocarbon: { name: 'Hydrocarbon', unit: 'ppm', max: 50, comparison: '≤' },
  chloride: { name: 'Chloride', unit: 'ppm', max: 2, comparison: '≤' },
}

export function evaluateTestResult(testId, value) {
  const threshold = WALL_WASH_THRESHOLDS[testId]
  if (!threshold) return 'unknown'
  
  if (value === '' || value === null || value === undefined) return 'pending'
  
  const numVal = parseFloat(value)
  if (isNaN(numVal)) return 'pending'
  
  if (threshold.min !== undefined) {
    return numVal >= threshold.min ? 'pass' : 'fail'
  }
  if (threshold.max !== undefined) {
    return numVal <= threshold.max ? 'pass' : 'fail'
  }
  return 'unknown'
}

// Water White checklist areas
export const WATER_WHITE_AREAS = [
  { id: 'ceiling', name: 'Trần hầm', icon: '⬆️' },
  { id: 'bow_wall', name: 'Vách mũi', icon: '🔼' },
  { id: 'stern_wall', name: 'Vách lái', icon: '🔽' },
  { id: 'port_wall', name: 'Vách mạn trái', icon: '◀️' },
  { id: 'starboard_wall', name: 'Vách mạn phải', icon: '▶️' },
  { id: 'bottom', name: 'Đáy hầm', icon: '⬇️' },
  { id: 'piping', name: 'Hệ thống đường ống / Giếng thu', icon: '🔧' },
]

// AI diagnostic messages based on failed tests
export function getDiagnostic(failedTests) {
  const diagnostics = []
  
  if (failedTests.includes('ptt')) {
    diagnostics.push({
      title: '⚠️ Chỉ số PTT thấp',
      causes: [
        'Dư lượng dầu mỡ từ hàng cũ',
        'Chưa rửa sạch hoàn toàn lớp màng dầu',
        'Lớp phủ Epoxy đã hấp thụ cặn hữu cơ từ chuyến trước'
      ],
      solutions: [
        'Tăng thời gian rửa bằng dung môi phù hợp (Methanol/Acetone)',
        'Kiểm tra lại PTT sau khi rửa',
        'Thông gió cưỡng bức ở nhiệt độ cao trước khi lấy mẫu (đặc biệt với hầm Epoxy)',
        'Lặp lại quy trình nếu vẫn chưa đạt'
      ]
    })
  }
  
  if (failedTests.includes('chloride') || failedTests.includes('salinity')) {
    diagnostics.push({
      title: '⚠️ Hàm lượng Chloride / Độ mặn cao',
      causes: [
        'Rửa hầm bằng nước biển chưa tráng đủ nước ngọt',
        'Dư lượng muối biển trên vách hầm',
        'Có thể sĩ quan chạm tay vào ống nghiệm (mồ hôi chứa muối)'
      ],
      solutions: [
        'Tráng rửa lại bằng nước ngọt / nước khử ion (DI Water) nhiều lần',
        'Đảm bảo lần rửa cuối cùng dùng nước ngọt',
        'Sử dụng găng tay Nitrile khi thao tác lấy mẫu',
        'Kiểm tra lại Chloride sau khi rửa'
      ]
    })
  }
  
  if (failedTests.includes('hydrocarbon')) {
    diagnostics.push({
      title: '⚠️ Phát hiện cặn Hydrocarbon',
      causes: [
        'Hàng hóa tuần hoàn còn sót lại trên vách hầm',
        'Chưa rửa sạch hoàn toàn dầu/mỡ bám',
        'Lớp phủ Epoxy hấp thụ hydrocarbon từ chuyến trước'
      ],
      solutions: [
        'Lau lại toàn bộ bề mặt bồn bằng Methanol sạch',
        'Dùng Seaclean hoặc dung môi hydrocarbon chuyên dụng',
        'Thông gió cưỡng bức nhiệt độ cao để giải phóng cặn bám sâu trong Epoxy',
        'Thực hiện lại phép thử hydrocarbon sau khi rửa'
      ]
    })
  }
  
  if (failedTests.includes('apha')) {
    diagnostics.push({
      title: '⚠️ Độ màu APHA vượt ngưỡng',
      causes: [
        'Sự nhiễm bẩn có màu từ dư lượng hàng cũ',
        'Cặn hóa chất/dầu bám trên vách hầm',
        'Gỉ sắt hoặc vảy sơn Epoxy bong tróc'
      ],
      solutions: [
        'Rửa lại bằng dung môi phù hợp',
        'Kiểm tra tình trạng lớp phủ Epoxy',
        'Lau sạch gỉ sắt / cặn bám rồi test lại độ màu'
      ]
    })
  }
  
  return diagnostics
}

// Holds for Dolphin 01
export const VESSEL_HOLDS = [
  { id: 'hold_1p', name: 'Hold #1P (Portside)', capacity: '1,100 m³' },
  { id: 'hold_1s', name: 'Hold #1S (Starboard)', capacity: '1,100 m³' },
  { id: 'hold_2p', name: 'Hold #2P (Portside)', capacity: '1,200 m³' },
  { id: 'hold_2s', name: 'Hold #2S (Starboard)', capacity: '1,200 m³' },
  { id: 'hold_3p', name: 'Hold #3P (Portside)', capacity: '1,300 m³' },
  { id: 'hold_3s', name: 'Hold #3S (Starboard)', capacity: '1,300 m³' },
  { id: 'hold_4c', name: 'Hold #4C (Center)', capacity: '1,500 m³' },
]
