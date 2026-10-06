import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { chatWithCopilot } from '../services/aiService'

function renderFormattedMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\s*[-•*]\s+(.+)$/gm, '<div class="ai-markdown-item"><span class="ai-markdown-marker">•</span><span>$1</span></div>')
    .replace(/^\s*(\d+)\.\s+(.+)$/gm, '<div class="ai-markdown-item"><span class="ai-markdown-marker">$1.</span><span>$2</span></div>')
    .replace(/\n/g, '<br/>')
}

const suggestedPrompts = [
  'Hàng methanol cần bao nhiêu test hóa chất?',
  'Lý thuyết về việc dọn hầm là gì?',
  'Quy trình chuẩn rửa hầm sau khi chở CPO?',
  'Phải làm gì khi PTT chỉ đạt 6.5 phút?'
]

export default function AICopilotDrawer() {
  const { state, dispatch } = useApp()
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const sendingRef = useRef(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const triggerRef = useRef(null)
  const isOpen = state.aiChatOpen
  const messages = state.aiMessages

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
    const onEscape = (event) => {
      if (isOpen && event.key === 'Escape') {
        dispatch({ type: 'TOGGLE_AI_CHAT' })
        requestAnimationFrame(() => triggerRef.current?.focus())
      }
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [isOpen, dispatch])

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    })
  }, [messages, isOpen, isLoading])

  const handleSend = async (customPrompt) => {
    const textToSend = (typeof customPrompt === 'string' ? customPrompt : inputText).trim()
    if (!textToSend || sendingRef.current) return
    sendingRef.current = true
    setInputText('')
    dispatch({ type: 'ADD_AI_MESSAGE', message: { role: 'user', content: textToSend } })
    setIsLoading(true)
    try {
      const response = await chatWithCopilot(textToSend, messages, {
        previousCargo: state.previousCargo, newCargo: state.newCargo,
        holdName: state.holdName, selectedHold: state.selectedHold,
        selectedMethod: state.selectedMethod, currentStep: state.currentStep,
        wallWashResults: state.wallWashResults,
      })
      dispatch({ type: 'ADD_AI_MESSAGE', message: {
        role: 'assistant', content: response.reply, mode: response.mode,
        warning: response.warning, sources: response.sources,
        source: response.mode === 'ai' ? `${response.model} · Tài liệu RAG` : 'Tra cứu tài liệu cục bộ · AI chưa kết nối'
      } })
    } catch (error) {
      dispatch({ type: 'ADD_AI_MESSAGE', message: {
        role: 'assistant', content: `Không thể xử lý câu hỏi: ${error.message}`, mode: 'error'
      } })
    } finally {
      setIsLoading(false)
      sendingRef.current = false
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  const closePanel = () => {
    dispatch({ type: 'TOGGLE_AI_CHAT' })
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  if (!isOpen) return (
    <button ref={triggerRef} className="ai-fab" onClick={() => dispatch({ type: 'TOGGLE_AI_CHAT' })}
      aria-expanded={false} aria-controls="copilot-panel" aria-label="Mở trợ lý Dolphin Copilot">
      <MessageCircle size={18} aria-hidden="true" /><span>Trợ lý</span>
    </button>
  )

  return (
    <section className="ai-panel" id="copilot-panel" role="dialog" aria-labelledby="copilot-title">
      <div className="ai-panel-header">
        <div className="ai-panel-heading">
          <h2 className="ai-panel-title" id="copilot-title">Dolphin Copilot</h2>
          <p className="ai-panel-subtitle">Hỏi đáp hàng hải & hỗ trợ thao tác</p>
        </div>
        <button className="ai-panel-close" onClick={closePanel} aria-label="Đóng trợ lý"><X size={18} /></button>
      </div>
      <div className="ai-panel-messages" role="log" aria-label="Hội thoại với trợ lý" aria-busy={isLoading}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.role}`}>
            {msg.role === 'assistant' && <p className="ai-message-label">Dolphin Copilot</p>}
            {msg.warning && <p role="status" className="ai-message-warning">{msg.warning}</p>}
            <div className="ai-message-body" dangerouslySetInnerHTML={{ __html: renderFormattedMarkdown(msg.content) }} />
            {(msg.source || msg.sources?.length > 0) && (
              <details className="ai-source">
                <summary>{msg.mode === 'local' ? 'Tra cứu cục bộ & nguồn tham khảo' : 'Nguồn tham khảo'}</summary>
                {msg.source && <p className="ai-source-provider">{msg.source}</p>}
                {msg.sources?.length > 0 && <ol>
                  {msg.sources.map((source, i) => <li key={source.id || i}>{source.source} · {source.title}</li>)}
                </ol>}
              </details>
            )}
          </div>
        ))}
        {isLoading && <div className="ai-loading" role="status">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />Đang tìm tài liệu và soạn câu trả lời…
        </div>}
        {messages.length === 1 && <div className="ai-suggestions">
          <p>Bạn có thể hỏi</p>
          {suggestedPrompts.map(prompt => <button key={prompt} type="button" className="ai-suggestion"
            disabled={isLoading} onClick={() => handleSend(prompt)}>{prompt}</button>)}
        </div>}
        <div ref={messagesEndRef} />
      </div>
      <form className="ai-panel-input" onSubmit={event => { event.preventDefault(); handleSend() }}>
        <input ref={inputRef} type="text" aria-label="Câu hỏi cho trợ lý" placeholder="Nhập câu hỏi của bạn…"
          value={inputText} onChange={event => setInputText(event.target.value)} disabled={isLoading} maxLength={4000}
          onKeyDown={event => { if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault() }} />
        <button type="submit" disabled={!inputText.trim() || isLoading} aria-label="Gửi câu hỏi">
          <Send size={16} aria-hidden="true" />
        </button>
      </form>
    </section>
  )
}
