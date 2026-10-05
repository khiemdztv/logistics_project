import { useApp } from '../context/AppContext'
import { Check, ShieldAlert, Sparkles } from 'lucide-react'

export default function Stepper() {
  const { state, dispatch } = useApp()

  const getStep2Title = () => {
    if (state.selectedMethod === 'WALL_WASH') {
      return 'Bước 2: Kiểm tra Wall Wash Standard'
    } else if (state.selectedMethod === 'WATER_WHITE') {
      return 'Bước 2: Kiểm tra Water White Standard'
    }
    return 'Bước 2: Kiểm tra hầm hàng'
  }

  const steps = [
    { number: 1, title: 'Bước 1: Khởi tạo & Phân tích' },
    { number: 2, title: getStep2Title() },
    { number: 3, title: 'Bước 3: Hoàn thành & Báo cáo' }
  ]

  const handleStepClick = (stepNum) => {
    // Only allow navigating back or to current
    if (stepNum < state.currentStep) {
      dispatch({ type: 'SET_STEP', step: stepNum })
    }
  }

  return (
    <div className="stepper" id="workflow-stepper">
      {steps.map((step, idx) => {
        const isCompleted = state.currentStep > step.number
        const isActive = state.currentStep === step.number
        const isAccessible = step.number <= state.currentStep

        return (
          <div key={step.number} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
            <div
              className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => handleStepClick(step.number)}
              style={{ cursor: isAccessible ? 'pointer' : 'default' }}
            >
              <div className="stepper-step-number">
                {isCompleted ? <Check size={16} strokeWidth={3} /> : step.number}
              </div>
              <span className="stepper-step-title">{step.title}</span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`stepper-connector ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
