import { useApp } from '../context/AppContext'
import { Check } from 'lucide-react'

export default function Stepper() {
  const { state, dispatch } = useApp()
  const steps = [
    { number: 1, title: 'Khởi tạo', detail: 'Hàng hóa & phương pháp' },
    { number: 2, title: 'Kiểm tra', detail: state.selectedMethod === 'WALL_WASH' ? 'Wall Wash' : state.selectedMethod === 'WATER_WHITE' ? 'Water White' : 'Đánh giá hầm hàng' },
    { number: 3, title: 'Báo cáo', detail: 'Tổng hợp & nghiệm thu' },
  ]
  return (
    <nav className="stepper" id="workflow-stepper" aria-label="Các bước kiểm tra">
      {steps.map(step => {
        const completed = state.currentStep > step.number
        const active = state.currentStep === step.number
        return (
          <button key={step.number} className={`stepper-step ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}
            disabled={step.number > state.currentStep} aria-current={active ? 'step' : undefined}
            onClick={() => { if (completed) dispatch({ type: 'SET_STEP', step: step.number }) }}>
            <span className="stepper-step-number" aria-hidden="true">{completed ? <Check size={15} /> : `0${step.number}`}</span>
            <span className="stepper-step-copy"><strong>{step.title}</strong><span>{step.detail}</span></span>
          </button>
        )
      })}
    </nav>
  )
}
