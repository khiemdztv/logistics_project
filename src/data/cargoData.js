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
    tests: ['Hydrocarbon', 'Chloride (kèm HNO3)', 'PTT', 'Mùi', 'NVM'],
    notes: 'Dễ oxy hóa, dễ ôi thiu. Dùng kiềm mạnh (Alkaline Cleaner) để xà phòng hóa'
  },
  CHEMICAL_SOLVENT: {
    id: 'chemical_solvent',
    name: 'Hóa Chất & Dung Môi Công Nghiệp',
    type: 'Hóa chất tinh khiết',
    testMethod: 'WALL_WASH',
    cleaning: ['Nước ngọt/nước cất nóng', 'Methanol hoặc Acetone để rửa/xông', 'Nước cất tráng cuối'],
    tests: ['Hydrocarbon', 'Chloride', 'PTT (rượu, ketone)', 'Acid Wash Colour (hàng thơm)', 'Cảm quan', 'UV'],
    notes: 'Tính bay hơi cao, đòi hỏi độ tinh khiết tuyệt đối'
  },
  CLEAN_FUEL: {
    id: 'clean_fuel',
    name: 'Dầu Trắng (CPP: Xăng, DO, Jet A-1)',
    type: 'Nhiên liệu sạch',
    testMethod: 'WALL_WASH',
    cleaning: ['Seaclean Hydrocarbon + nước nóng', 'Nước ngọt tráng cuối'],
    tests: ['Hydrocarbon', 'Chloride', 'Cảm quan', 'Mùi', 'UV'],
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
    tests: ['Hydrocarbon', 'Chloride', 'PTT', 'Karl Fischer (ngoài web)', 'Conductivity (ngoài web)'],
    notes: 'Yêu cầu độ ngậm nước siêu vi lượng cực thấp'
  },
  POLYMER: {
    id: 'polymer',
    name: 'Hóa Chất Polymer (Styrene, VAM)',
    type: 'Polymer hóa',
    testMethod: 'WALL_WASH',
    cleaning: ['Rửa bằng Acetone phòng thí nghiệm'],
    tests: ['NVM (Non-Volatile Matter)', 'Cảm quan'],
    notes: 'Dễ tự liên kết tạo nhựa polymer bám cứng vĩnh viễn vào vách hầm'
  }
}

// Individual cargo items mapped to groups. testProfile picks the Wall Wash test set (see wallWashTests.js).
export const CARGO_ITEMS = [
  // Crude Oil
  { id: 'crude_arabian_light', name: 'Arabian Light Crude', group: 'CRUDE_OIL', testProfile: 'GENERAL' },
  { id: 'crude_bonny_light', name: 'Bonny Light Crude', group: 'CRUDE_OIL', testProfile: 'GENERAL' },
  { id: 'crude_generic', name: 'Dầu thô (chung)', group: 'CRUDE_OIL', testProfile: 'GENERAL' },

  // Vegetable Oils
  { id: 'palm_oil_crude', name: 'Dầu Cọ Thô (Crude Palm Oil)', group: 'VEGETABLE_OIL', testProfile: 'VEGETABLE_OIL' },
  { id: 'palm_oil_refined', name: 'Dầu Cọ Tinh Luyện (RBD Palm Oil)', group: 'VEGETABLE_OIL', testProfile: 'VEGETABLE_OIL' },
  { id: 'soybean_oil', name: 'Dầu Đậu Nành (Soybean Oil)', group: 'VEGETABLE_OIL', testProfile: 'VEGETABLE_OIL' },
  { id: 'coconut_oil', name: 'Dầu Dừa (Coconut Oil)', group: 'VEGETABLE_OIL', testProfile: 'VEGETABLE_OIL' },
  { id: 'sunflower_oil', name: 'Dầu Hướng Dương (Sunflower Oil)', group: 'VEGETABLE_OIL', testProfile: 'VEGETABLE_OIL' },

  // Chemical Solvents
  { id: 'methanol', name: 'Methanol', group: 'CHEMICAL_SOLVENT', testProfile: 'ALCOHOL_KETONE' },
  { id: 'ethanol', name: 'Ethanol', group: 'CHEMICAL_SOLVENT', testProfile: 'ALCOHOL_KETONE' },
  { id: 'acetone', name: 'Acetone', group: 'CHEMICAL_SOLVENT', testProfile: 'ALCOHOL_KETONE' },
  { id: 'benzene', name: 'Benzene', group: 'CHEMICAL_SOLVENT', testProfile: 'AROMATIC' },
  { id: 'toluene', name: 'Toluene', group: 'CHEMICAL_SOLVENT', testProfile: 'AROMATIC' },
  { id: 'xylene', name: 'Xylene', group: 'CHEMICAL_SOLVENT', testProfile: 'AROMATIC' },
  { id: 'meg', name: 'MEG (Mono Ethylene Glycol)', group: 'CHEMICAL_SOLVENT', testProfile: 'GLYCOL' },
  { id: 'ipa', name: 'IPA (Isopropyl Alcohol)', group: 'CHEMICAL_SOLVENT', testProfile: 'ALCOHOL_KETONE' },
  { id: 'mek', name: 'MEK (Methyl Ethyl Ketone)', group: 'CHEMICAL_SOLVENT', testProfile: 'ALCOHOL_KETONE' },
  { id: 'mibk', name: 'MIBK (Methyl Isobutyl Ketone)', group: 'CHEMICAL_SOLVENT', testProfile: 'ALCOHOL_KETONE' },

  // Clean Petroleum Products (CPP)
  { id: 'gasoline_a92', name: 'Xăng A92/A95 (Gasoline)', group: 'CLEAN_FUEL', testProfile: 'CPP' },
  { id: 'diesel_do', name: 'Diesel Oil (DO)', group: 'CLEAN_FUEL', testProfile: 'CPP' },
  { id: 'kerosene', name: 'Dầu Hỏa (Kerosene)', group: 'CLEAN_FUEL', testProfile: 'CPP' },
  { id: 'jet_a1', name: 'Jet A-1 (Nhiên liệu máy bay)', group: 'CLEAN_FUEL', testProfile: 'CPP' },
  { id: 'ulsd', name: 'ULSD (Ultra Low Sulfur Diesel)', group: 'CLEAN_FUEL', testProfile: 'CPP' },

  // Dark Petroleum Products (DPP)
  { id: 'fuel_oil', name: 'Fuel Oil (FO/HFO)', group: 'DARK_FUEL', testProfile: 'GENERAL' },
  { id: 'bitumen', name: 'Bitumen (Nhựa đường)', group: 'DARK_FUEL', testProfile: 'GENERAL' },

  // Green Energy
  { id: 'bio_methanol', name: 'Bio-Methanol', group: 'GREEN_ENERGY', testProfile: 'GREEN_METHANOL' },
  { id: 'e_methanol', name: 'E-Methanol', group: 'GREEN_ENERGY', testProfile: 'GREEN_METHANOL' },
  { id: 'green_ammonia', name: 'Green Ammonia', group: 'GREEN_ENERGY', testProfile: 'AMMONIA' },

  // Polymer
  { id: 'styrene', name: 'Styrene Monomer', group: 'POLYMER', testProfile: 'POLYMER' },
  { id: 'vam', name: 'Vinyl Acetate Monomer (VAM)', group: 'POLYMER', testProfile: 'POLYMER' },
]

// FOSFA Banned immediate previous cargoes (simplified)
export const FOSFA_BANNED = [
  'crude_generic', 'crude_arabian_light', 'crude_bonny_light',
  'fuel_oil', 'bitumen', 'benzene', 'toluene', 'xylene',
  'styrene', 'vam'
]

// Compatibility matrix: previousCargo -> newCargo restrictions
export function checkCompatibility(prevCargoId, newCargoId, coating = 'Pure Epoxy') {
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

  if (/epoxy/i.test(coating)) {
    notes.push('📌 Lớp phủ Epoxy: Kiểm tra ảnh hưởng của hàng trước và đối chiếu hướng dẫn của nhà sản xuất sơn trước khi làm sạch.')
  } else if (!coating) {
    notes.push('📌 Chưa khai báo lớp phủ hầm. Cần xác nhận loại sơn và quy trình làm sạch phù hợp với tàu này.')
  }

  // Determine test method based on new cargo
  const method = newGroup.testMethod

  return { allowed, notes, method, prevGroup, newGroup }
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

// Local diagnostic messages based on failed tests (used when AI is unavailable)
export function getDiagnostic(failedTests) {
  const diagnostics = []

  if (failedTests.includes('ptt')) {
    diagnostics.push({
      title: '⚠️ Thuốc tím phai màu quá nhanh (PTT thấp)',
      causes: [
        'Dư lượng dầu mỡ hoặc chất hữu cơ từ hàng cũ',
        'Chưa rửa sạch hoàn toàn lớp màng dầu',
        'Lớp phủ Epoxy đã hấp thụ cặn hữu cơ từ chuyến trước',
        'Dung dịch thuốc tím đã biến chất do để nóng hoặc gặp ánh sáng'
      ],
      solutions: [
        'Kiểm tra lại mẫu trắng, dung dịch thuốc tím mới và nhiệt độ thử',
        'Tăng thời gian rửa bằng dung môi phù hợp (Methanol/Acetone)',
        'Thông gió cưỡng bức ở nhiệt độ cao trước khi lấy mẫu (đặc biệt với hầm Epoxy)',
        'Lấy mẫu lại và đo PTT lần nữa'
      ]
    })
  }

  if (failedTests.includes('chloride')) {
    diagnostics.push({
      title: '⚠️ Ống mẫu bị đục khi nhỏ bạc nitrat (còn muối biển)',
      causes: [
        'Rửa hầm bằng nước biển chưa tráng đủ nước ngọt',
        'Dư lượng muối biển trên vách hầm',
        'Mồ hôi tay chạm vào ống nghiệm hoặc dụng cụ chưa sạch',
        'Nếu hàng trước là dầu thực vật: cặn không bay hơi gây đục giả, cần thêm HNO3 để phân biệt'
      ],
      solutions: [
        'Tráng rửa lại bằng nước ngọt / nước khử ion (DI Water) nhiều lần',
        'Đảm bảo lần rửa cuối cùng dùng nước ngọt',
        'Sử dụng găng tay Nitrile khi thao tác lấy mẫu',
        'Làm lại test Chloride sau khi rửa'
      ]
    })
  }

  if (failedTests.includes('hydrocarbon')) {
    diagnostics.push({
      title: '⚠️ Ống mẫu trắng đục dạng sữa (còn hydrocarbon)',
      causes: [
        'Hàng hóa cũ còn sót lại trên vách hầm',
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

  if (failedTests.includes('appearance')) {
    diagnostics.push({
      title: '⚠️ Mẫu có hạt lơ lửng, khác màu hoặc mờ đục',
      causes: [
        'Vảy sơn Epoxy bong tróc hoặc gỉ sắt',
        'Cặn hàng cũ chưa rửa hết',
        'Dư lượng có màu từ hàng trước'
      ],
      solutions: [
        'Kiểm tra tình trạng lớp phủ hầm, xử lý chỗ bong tróc / gỉ',
        'Rửa lại bằng dung môi phù hợp và tráng nước sạch',
        'Lấy mẫu lại ở vị trí đại diện rồi kiểm tra cảm quan lần nữa'
      ]
    })
  }

  if (failedTests.includes('odour')) {
    diagnostics.push({
      title: '⚠️ Còn mùi hàng cũ',
      causes: [
        'Lớp sơn Epoxy hấp thụ và giữ mùi hàng trước',
        'Thông gió chưa đủ sau khi rửa',
        'Còn cặn hàng cũ ở góc khuất, đường ống, giếng thu'
      ],
      solutions: [
        'Thông gió cưỡng bức ở nhiệt độ cao để giải phóng mùi',
        'Kiểm tra và rửa lại các vị trí lưu cặn',
        'Làm lại test mùi sau khi thông gió'
      ]
    })
  }

  if (failedTests.includes('nvm')) {
    diagnostics.push({
      title: '⚠️ Cặn không bay hơi (NVM) vượt mức',
      causes: [
        'Còn cặn dầu thực vật hoặc polymer trên vách',
        'Chưa xà phòng hóa hết chất béo bằng chất tẩy kiềm',
        'Rửa chưa tới các vùng khó tiếp cận'
      ],
      solutions: [
        'Rửa lại với chất tẩy phù hợp hàng trước theo hướng dẫn lớp sơn',
        'Tráng kỹ bằng nước ngọt rồi lấy mẫu lại',
        'Cân lại NVM sau khi rửa'
      ]
    })
  }

  if (failedTests.includes('acidWash')) {
    diagnostics.push({
      title: '⚠️ Lớp axit sẫm màu (còn cặn hydrocarbon thơm)',
      causes: [
        'Còn dư lượng benzene / toluene / xylene từ hàng trước',
        'Lớp Epoxy hấp thụ hydrocarbon thơm',
        'Dung môi lấy mẫu chưa đủ tinh khiết'
      ],
      solutions: [
        'Kiểm tra lại dung môi lấy mẫu và bộ chuẩn màu',
        'Rửa / xông lại bằng dung môi phù hợp, thông gió nhiệt độ cao',
        'Làm lại phép thử sau khi rửa'
      ]
    })
  }

  if (failedTests.includes('uv')) {
    diagnostics.push({
      title: '⚠️ Phổ UV có đỉnh hấp thụ',
      causes: [
        'Còn hydrocarbon hoặc tạp chất hữu cơ hấp thụ UV',
        'Mẫu đối chiếu không đủ tinh khiết'
      ],
      solutions: [
        'Kiểm tra lại mẫu đối chiếu và máy đo',
        'Rửa lại bằng dung môi phù hợp rồi đo lại'
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
