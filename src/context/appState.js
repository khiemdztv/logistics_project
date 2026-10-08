import { DEFAULT_VESSEL, normalizeVessel, validateVessel, getSessionVessel, migrateSessions, loadFleet } from '../data/vesselData.js'
import { createBlankWallWashResults } from '../data/wallWashTests.js'
import { normalizePhotos } from '../data/evidence.js'

const loadSaved = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

// Load sessions from localStorage
const loadSessions = () => {
  try {
    const saved = localStorage.getItem('dolphin_sessions')
    return migrateSessions(saved ? JSON.parse(saved) : [])
  } catch { return [] }
}

const loadCustomHolds = () => {
  try {
    const saved = localStorage.getItem('dolphin_custom_holds')
    const holds = saved ? JSON.parse(saved) : []
    return Array.isArray(holds) ? holds.filter(hold => hold?.id).map(hold => ({ ...hold, vesselId: hold.vesselId || DEFAULT_VESSEL.id })) : []
  } catch { return [] }
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

const createBlankSessionData = (vessel = DEFAULT_VESSEL) => ({
  sessionName: '',
  vesselId: vessel.id,
  vessel: { ...vessel },
  previousCargo: '',
  newCargo: '',
  selectedHold: '',
  holdName: '',
  route: '',
  dwt: vessel.dwt,
  additionalNotes: '',
  compatibility: null,
  selectedMethod: null,
  wallWashResults: createBlankWallWashResults(),
  waterWhiteChecklist: {
    ceiling: null,
    bow_wall: null,
    stern_wall: null,
    port_wall: null,
    starboard_wall: null,
    bottom: null,
    piping: null,
  },
  photos: [],
  inspectionLog: [],
  inspector: 'Sĩ quan trực ca',
  startTime: null,
  endTime: null,
})

export function createInitialState() {
  const sessions = loadSessions()
  return {
    // View management
    currentView: 'dashboard', // 'dashboard' or 'inspection'
    currentStep: 1,

    // Session management
    sessions,
    vessels: loadFleet(loadSaved('dolphin_vessels'), sessions),
    sessionName: '',
    vesselId: DEFAULT_VESSEL.id,
    vessel: { ...DEFAULT_VESSEL },
    currentSessionId: null,
    customHolds: loadCustomHolds(),

    // Step 1 data
    previousCargo: '',
    newCargo: '',
    selectedHold: '',
    holdName: '', // custom hold name
    route: '',
    dwt: DEFAULT_VESSEL.dwt,
    additionalNotes: '',

    // Analysis result
    compatibility: null,
    selectedMethod: null,

    // Step 2 - Wall Wash results
    wallWashResults: createBlankWallWashResults(),

    // Step 2 - Water White checklist
    waterWhiteChecklist: {
      ceiling: null,
      bow_wall: null,
      stern_wall: null,
      port_wall: null,
      starboard_wall: null,
      bottom: null,
      piping: null,
    },

    // Evidence photos
    photos: [],

    // Inspection log
    inspectionLog: [],

    // Inspector info
    inspector: 'Sĩ quan trực ca',
    startTime: null,
    endTime: null,

    // AI Chat
    aiChatOpen: false,
    aiMessages: [
      {
        role: 'assistant',
        content: 'Chào bạn, mình là Dolphin Copilot. Bạn cần tra cứu về hàng hóa, kiểm tra hầm hay cách sử dụng web? Hãy cho mình biết câu hỏi và thông tin ca làm việc nếu có.',
      }
    ],
  }

}

// Helper: extract session-saveable data from state
function extractSessionData(state) {
  return {
    sessionName: state.sessionName,
    vesselId: state.vesselId,
    vessel: { ...state.vessel },
    previousCargo: state.previousCargo,
    newCargo: state.newCargo,
    selectedHold: state.selectedHold,
    holdName: state.holdName,
    route: state.route,
    dwt: state.dwt,
    additionalNotes: state.additionalNotes,
    compatibility: state.compatibility,
    selectedMethod: state.selectedMethod,
    wallWashResults: { ...state.wallWashResults },
    waterWhiteChecklist: { ...state.waterWhiteChecklist },
    photos: normalizePhotos(state.photos),
    inspectionLog: [...state.inspectionLog],
    inspector: state.inspector,
    startTime: state.startTime,
    endTime: state.endTime,
    currentStep: state.currentStep,
  }
}

// Helper: determine session status from data
function determineStatus(data) {
  if (data.endTime) return 'passed'
  if (data.startTime) return 'in_progress'
  if (data.previousCargo || data.newCargo) return 'in_progress'
  return 'in_progress'
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }

    case 'SET_STEP':
      return { ...state, currentStep: action.step }

    case 'SET_COMPATIBILITY':
      return { ...state, compatibility: action.data }

    case 'SET_METHOD':
      return { ...state, selectedMethod: action.method }

    case 'SET_WALL_WASH_RESULT':
      return {
        ...state,
        wallWashResults: {
          ...state.wallWashResults,
          [action.testId]: action.value
        }
      }

    case 'SET_WATER_WHITE_CHECK':
      return {
        ...state,
        waterWhiteChecklist: {
          ...state.waterWhiteChecklist,
          [action.areaId]: action.status
        }
      }

    case 'ADD_PHOTO':
      if (!normalizePhotos([action.photo]).length) return state
      return { ...state, photos: [...normalizePhotos(state.photos), action.photo] }

    case 'REMOVE_PHOTO':
      return { ...state, photos: normalizePhotos(state.photos).filter(photo => photo.id !== action.photoId) }

    case 'ADD_LOG':
      return {
        ...state,
        inspectionLog: [...state.inspectionLog, {
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          text: action.text,
          type: action.logType || 'info'
        }]
      }

    case 'TOGGLE_AI_CHAT':
      return { ...state, aiChatOpen: !state.aiChatOpen }

    case 'ADD_AI_MESSAGE':
      return { ...state, aiMessages: [...state.aiMessages, action.message] }

    case 'START_INSPECTION':
      return {
        ...state,
        startTime: new Date(),
        currentStep: 2,
        inspectionLog: [{
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          text: 'Bắt đầu kiểm tra hầm hàng',
          type: 'start'
        }]
      }

    case 'COMPLETE_INSPECTION':
      return {
        ...state,
        endTime: new Date(),
        currentStep: 3,
        inspectionLog: [...state.inspectionLog, {
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          text: 'Kiểm tra hoàn tất',
          type: 'complete'
        }]
      }

    case 'RESET_WALL_WASH':
      return {
        ...state,
        wallWashResults: createBlankWallWashResults(),
        // After a re-wash the old evidence no longer describes the tank.
        photos: normalizePhotos(state.photos).filter(photo => !photo.target.startsWith('ww:'))
      }

    case 'RESET_WATER_WHITE':
      return {
        ...state,
        photos: normalizePhotos(state.photos).filter(photo => !photo.target.startsWith('wh:')),
        waterWhiteChecklist: {
          ceiling: null,
          bow_wall: null,
          stern_wall: null,
          port_wall: null,
          starboard_wall: null,
          bottom: null,
          piping: null,
        }
      }

    // ===== SESSION MANAGEMENT =====
    case 'CREATE_SESSION': {
      const vessel = normalizeVessel(action.vessel)
      if (Object.keys(validateVessel(vessel, state.vessels)).length) return state
      if (!vessel.id) vessel.id = 'vessel_' + generateId()
      const vessels = [...state.vessels.filter(item => item.id !== vessel.id), vessel]
      const blank = createBlankSessionData(vessel)
      const sessionName = String(action.sessionName || '').trim().slice(0, 120) || `Ca kiểm tra · ${vessel.name}`
      const newId = generateId()
      const newSession = {
        id: newId,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        ...blank,
        sessionName,
      }
      return {
        ...state,
        ...blank,
        sessionName,
        vessels,
        sessions: [...state.sessions, newSession],
        currentSessionId: newId,
        currentView: 'inspection',
        currentStep: 1,
      }
    }

    case 'LOAD_SESSION': {
      const session = state.sessions.find(s => s.id === action.sessionId)
      if (!session) return state
      const vessel = getSessionVessel(session)
      return {
        ...state,
        currentSessionId: action.sessionId,
        currentView: 'inspection',
        currentStep: session.currentStep || 1,
        sessionName: session.sessionName || '',
        vesselId: vessel.id,
        vessel,
        previousCargo: session.previousCargo || '',
        newCargo: session.newCargo || '',
        selectedHold: session.selectedHold || '',
        holdName: session.holdName || '',
        route: session.route || '',
        dwt: vessel.dwt,
        additionalNotes: session.additionalNotes || '',
        compatibility: session.compatibility || null,
        selectedMethod: session.selectedMethod || null,
        wallWashResults: session.wallWashResults || createBlankSessionData().wallWashResults,
        waterWhiteChecklist: session.waterWhiteChecklist || createBlankSessionData().waterWhiteChecklist,
        photos: normalizePhotos(session.photos),
        inspectionLog: session.inspectionLog || [],
        inspector: session.inspector || 'Sĩ quan trực ca',
        startTime: session.startTime || null,
        endTime: session.endTime || null,
      }
    }

    case 'SAVE_CURRENT_SESSION': {
      if (!state.currentSessionId) return state
      const sessionData = extractSessionData(state)
      const updatedSessions = state.sessions.map(s =>
        s.id === state.currentSessionId
          ? { ...s, ...sessionData, status: determineStatus(sessionData) }
          : s
      )
      return { ...state, sessions: updatedSessions }
    }

    case 'COPY_SESSION': {
      const source = state.sessions.find(s => s.id === action.sessionId)
      if (!source) return state
      const newId = generateId()
      const copied = {
        ...source,
        id: newId,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        sessionName: `${source.sessionName || 'Ca kiểm tra'} (bản sao)`.slice(0, 120),
        vessel: { ...getSessionVessel(source) },
        // Keep cargo config but reset results
        wallWashResults: createBlankSessionData().wallWashResults,
        waterWhiteChecklist: createBlankSessionData().waterWhiteChecklist,
        inspectionLog: [],
        photos: [],
        startTime: null,
        endTime: null,
        currentStep: 1,
      }
      return { ...state, sessions: [...state.sessions, copied] }
    }

    case 'RESET_SESSION': {
      const source = state.sessions.find(session => session.id === action.sessionId)
      if (!source) return state
      const blank = { ...createBlankSessionData(getSessionVessel(source)), sessionName: source.sessionName || '' }
      const updatedSessions = state.sessions.map(s =>
        s.id === action.sessionId
          ? { ...s, ...blank, status: 'in_progress', currentStep: 1 }
          : s
      )
      // If resetting current session, also reset working state
      if (state.currentSessionId === action.sessionId) {
        return { ...state, ...blank, sessions: updatedSessions, currentStep: 1 }
      }
      return { ...state, sessions: updatedSessions }
    }

    case 'DELETE_SESSION': {
      const filtered = state.sessions.filter(s => s.id !== action.sessionId)
      const extra = state.currentSessionId === action.sessionId
        ? { currentSessionId: null, currentView: 'dashboard' }
        : {}
      return { ...state, sessions: filtered, ...extra }
    }

    case 'ADD_VESSEL': {
      const vessel = normalizeVessel(action.vessel)
      if (Object.keys(validateVessel(vessel, state.vessels)).length) return state
      if (!vessel.id) vessel.id = 'vessel_' + generateId()
      return { ...state, vessels: [...state.vessels.filter(item => item.id !== vessel.id), vessel] }
    }

    case 'UPDATE_SESSION_DETAILS': {
      if (!state.sessions.some(session => session.id === action.sessionId)) return state
      const vessel = normalizeVessel(action.vessel)
      if (Object.keys(validateVessel(vessel, state.vessels)).length) return state
      if (!vessel.id) vessel.id = 'vessel_' + generateId()
      const details = { vesselId: vessel.id, vessel, dwt: vessel.dwt,
        sessionName: String(action.sessionName || '').trim().slice(0, 120) || `Ca kiểm tra · ${vessel.name}` }
      return { ...state,
        ...(state.currentSessionId === action.sessionId ? details : {}),
        vessels: [...state.vessels.filter(item => item.id !== vessel.id), vessel],
        sessions: state.sessions.map(session => session.id === action.sessionId ? { ...session, ...details } : session),
      }
    }

    case 'GO_DASHBOARD': {
      // Save current session before going back
      let updatedSessions = state.sessions
      if (state.currentSessionId) {
        const sessionData = extractSessionData(state)
        updatedSessions = state.sessions.map(s =>
          s.id === state.currentSessionId
            ? { ...s, ...sessionData, status: determineStatus(sessionData) }
            : s
        )
      }
      return { ...state, sessions: updatedSessions, currentView: 'dashboard', currentSessionId: null }
    }

    // Custom holds
    case 'ADD_CUSTOM_HOLD': {
      const newHold = {
        id: 'custom_' + generateId(),
        name: action.name,
        capacity: action.capacity || 'Tùy chỉnh',
        vesselId: state.vesselId,
      }
      return { ...state, customHolds: [...state.customHolds, newHold], selectedHold: newHold.id }
    }

    case 'RESET_ALL':
      return { ...createInitialState(), sessions: state.sessions, customHolds: state.customHolds, vessels: state.vessels }

    default:
      return state
  }
}
