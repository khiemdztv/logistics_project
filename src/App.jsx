import { useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Stepper from './components/Stepper'
import Dashboard from './components/Dashboard'
import Step1CargoInit from './components/Step1CargoInit'
import Step2WallWash from './components/Step2WallWash'
import Step2WaterWhite from './components/Step2WaterWhite'
import Step3Report from './components/Step3Report'
import AICopilotDrawer from './components/AICopilotDrawer'
import './App.css'

function MainContent() {
  const { state } = useApp()
  
  // Dashboard view
  if (state.currentView === 'dashboard') {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Header />
          <div className="app-content">
            <Dashboard />
          </div>
        </main>
        <AICopilotDrawer />
      </div>
    )
  }

  // Inspection view - render current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step1CargoInit />
      case 2:
        return state.selectedMethod === 'WALL_WASH' 
          ? <Step2WallWash /> 
          : <Step2WaterWhite />
      case 3:
        return <Step3Report />
      default:
        return <Step1CargoInit />
    }
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="app-main">
        <Header />
        <Stepper />
        
        {/* Scrollable Workspace */}
        <div className="app-content">
          {renderStep()}
        </div>
      </main>

      {/* Floating AI Assistant */}
      <AICopilotDrawer />
    </div>
  )
}

function App() {
  return <MainContent />
}

export default App
