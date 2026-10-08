import { createContext, useContext, useReducer, useEffect } from 'react'

import { appReducer, createInitialState } from './appState.js'
import { normalizePhotos } from '../data/evidence.js'
import { removeOrphanPhotos } from '../services/photoStore.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState)

  // Persist sessions to localStorage
  useEffect(() => {
    localStorage.setItem('dolphin_sessions', JSON.stringify(state.sessions))
  }, [state.sessions])

  // Persist custom holds
  useEffect(() => {
    localStorage.setItem('dolphin_custom_holds', JSON.stringify(state.customHolds))
  }, [state.customHolds])

  useEffect(() => {
    localStorage.setItem('dolphin_vessels', JSON.stringify(state.vessels))
  }, [state.vessels])

  // Free the space of photos that no session uses any more (deleted or reset sessions).
  useEffect(() => {
    const timer = setTimeout(() => {
      const referenced = [...state.sessions.flatMap(session => normalizePhotos(session.photos)), ...normalizePhotos(state.photos)].map(photo => photo.id)
      removeOrphanPhotos(referenced)
    }, 3000)
    return () => clearTimeout(timer)
  }, [state.sessions, state.photos])

  // Auto-save current session periodically
  useEffect(() => {
    if (state.currentSessionId && state.currentView === 'inspection') {
      const timer = setTimeout(() => {
        dispatch({ type: 'SAVE_CURRENT_SESSION' })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [
    state.previousCargo, state.newCargo, state.selectedHold, state.route,
    state.wallWashResults, state.waterWhiteChecklist, state.photos, state.currentStep,
    state.startTime, state.endTime, state.currentSessionId, state.currentView,
    state.vessel, state.vesselId, state.sessionName, state.holdName
  ])

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
