import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Sparkles, X, Send, BookOpen, AlertCircle, Bot, User, Loader2 } from 'lucide-react'
import { chatWithCopilot } from '../services/aiService'

export default function AICopilotDrawer() {
  const { state, dispatch } = useApp()
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const isOpen = state.aiChatOpen
  const messages = state.aiMessages

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading])

  const suggestedPrompts = [
    'Quy trình chuẩn rửa hầm sau khi chở CPO?',
    'Phải làm gì khi PTT chỉ đạt 6.5 phút?',
    'Khác biệt giữa Wall Wash và Water White?',
    'Yêu cầu an toàn thông gió hầm theo MARPOL?'
  ]

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessageText = inputText
    setInputText('')
    
    // Add user message
    const newMsg = { role: 'user', content: userMessageText }
    dispatch({ type: 'ADD_AI_MESSAGE', message: newMsg })

    setIsLoading(true)

    try {
      // Call Gemini API
      const aiResponse = await chatWithCopilot(userMessageText, messages)
      
      dispatch({
        type: 'ADD_AI_MESSAGE',
        message: { 
          role: 'assistant', 
          content: aiResponse,
          source: 'Gemini 3.5 Flash Lite (RAG Mode)'
        }
      })
    } catch (error) {
      dispatch({
        type: 'ADD_AI_MESSAGE',
        message: { 
          role: 'assistant', 
          content: `Lỗi kết nối AI: ${error.message}`
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  const handlePromptClick = (prompt) => {
    setInputText(prompt)
    // Optionally trigger send immediately: setTimeout(() => handleSend(), 0)
  }

  if (!isOpen) {
    return (
      <button 
        className="ai-fab" 
        onClick={() => dispatch({ type: 'TOGGLE_AI_CHAT' })}
        title="Dolphin AI Copilot - Tra cứu chuyên sâu"
      >
        <Sparkles size={24} />
      </button>
    )
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-accent-gradient)', color: '#0B132B' }}>
          <Bot size={20} />
        </div>
        <div className="ai-panel-title">Dolphin Maritime Copilot</div>
        <button className="ai-panel-close" onClick={() => dispatch({ type: 'TOGGLE_AI_CHAT' })}>
          <X size={18} />
        </button>
      </div>

      <div className="ai-panel-messages">
        <div style={{ fontSize: '11px', textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          Mô hình: <strong>Google Gemini 3.5 Flash Lite (RAG Enabled)</strong>
        </div>
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px', color: 'var(--color-accent-cyan)' }}>
                <Sparkles size={14} />
                <span style={{ fontSize: '11px', fontWeight: 600 }}>Gemini AI</span>
              </div>
            )}
            
            {/* Simple markdown rendering logic */}
            <div dangerouslySetInnerHTML={{ 
              __html: msg.content.replace(/\\n/g, '<br/>')
                                 .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                                 .replace(/\\*(.*?)\\*/g, '<em>$1</em>') 
            }} />
            
            {msg.source && (
              <div className="ai-source">
                <BookOpen size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                {msg.source}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="ai-message assistant" style={{ opacity: 0.7 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-accent-cyan)' }}>
              <Loader2 size={16} className="animate-spin" />
              <span style={{ fontSize: '12px' }}>Đang tra cứu dữ liệu...</span>
            </div>
          </div>
        )}
        
        {/* Suggestion Prompts if only 1 message (greeting) */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>CÂU HỎI ĐỀ XUẤT:</div>
            {suggestedPrompts.map((prompt, idx) => (
              <button 
                key={idx}
                type="button"
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  background: 'var(--color-bg-input)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  color: 'var(--color-text-primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handlePromptClick(prompt)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-cyan)'
                  e.currentTarget.style.background = 'rgba(0, 229, 255, 0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.background = 'var(--color-bg-input)'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-panel-input">
        <input 
          type="text" 
          placeholder="Hỏi AI về quy trình chuẩn MARPOL..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={!inputText.trim() || isLoading}>
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
