import { createContext, useContext, useReducer } from 'react'

const AppContext = createContext(null)

const initialState = {
  // Current step: 1, 2, 3
  currentStep: 1,
  
  // Step 1 data
  previousCargo: '',
  newCargo: '',
  selectedHold: '',
  route: '',
  dwt: '34,000',
  additionalNotes: '',
  
  // Analysis result
  compatibility: null,
  selectedMethod: null, // 'WALL_WASH' or 'WATER_WHITE'
  
  // Step 2 - Wall Wash results
  wallWashResults: {
    salinity: '',
    ptt: '',
    apha: '',
    hydrocarbon: '',
    chloride: '',
  },
  
  // Step 2 - Water White checklist
  waterWhiteChecklist: {
    ceiling: null,      // null = unchecked, 'pass', 'fail'
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
      content: 'Xin chào! Tôi là AI Maritime Copilot. Tôi có thể giúp bạn tra cứu quy trình rửa hầm, hóa chất kiểm tra, hoặc giải đáp thắc mắc về tiêu chuẩn MARPOL/FOSFA. Hãy đặt câu hỏi!',
    }
  ],
}

function appReducer(state, action) {
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
      return { ...state, photos: [...state.photos, action.photo] }
    
    case 'REMOVE_PHOTO':
      return { ...state, photos: state.photos.filter((_, i) => i !== action.index) }
    
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
        wallWashResults: {
          salinity: '',
          ptt: '',
          apha: '',
          hydrocarbon: '',
          chloride: '',
        }
      }
    
    case 'RESET_WATER_WHITE':
      return {
        ...state,
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
    
    case 'RESET_ALL':
      return { ...initialState }
    
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
