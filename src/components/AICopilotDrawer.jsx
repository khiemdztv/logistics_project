import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Sparkles, X, Send, BookOpen, Bot, Loader2, Zap } from 'lucide-react'
import { chatWithCopilot } from '../services/aiService'

function renderFormattedMarkdown(text) {
  if (!text) return ''
  
  // Clean string
  let html = text
    // Replace HTML brackets
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--color-accent-cyan, #00E5FF); font-weight: 700;">$1</strong>')
    // Italic: *text*
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11px;">$1</code>')
    // Bullet list items (- item or • item)
    .replace(/^\s*[-•*]\s+(.+)$/gm, '<div style="display: flex; gap: 6px; margin: 4px 0;"><span style="color: var(--color-accent-cyan, #00E5FF);">•</span><span>$1</span></div>')
    // Numbered lists (1. item)
    .replace(/^\s*(\d+)\.\s+(.+)$/gm, '<div style="display: flex; gap: 6px; margin: 4px 0;"><span style="color: var(--color-accent-cyan, #00E5FF); font-weight: 600;">$1.</span><span>$2</span></div>')
    // Double line breaks
    .replace(/\n\n/g, '<div style="height: 8px;"></div>')
    // Single line break
    .replace(/\n/g, '<br/>')

  return html
}

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
    'Tôi chưa hiểu gì về web này, giải thích đi',
    'Lý thuyết về việc dọn hầm là gì?',
    'Quy trình chuẩn rửa hầm sau khi chở CPO?',
    'Phải làm gì khi PTT chỉ đạt 6.5 phút?'
  ]

  const handleSend = async (customPrompt) => {
    const textToSend = typeof customPrompt === 'string' ? customPrompt : inputText
    if (!textToSend.trim() || isLoading) return

    setInputText('')
    
    // Add user message
    const newMsg = { role: 'user', content: textToSend }
    dispatch({ type: 'ADD_AI_MESSAGE', message: newMsg })

    setIsLoading(true)

    try {
      // Call Groq / AI + RAG Engine
      const aiResponse = await chatWithCopilot(textToSend, [...messages, newMsg])
      
      dispatch({
        type: 'ADD_AI_MESSAGE',
        message: { 
          role: 'assistant', 
          content: aiResponse,
          source: '⚡ Groq Llama 3.3 70B (Siêu tốc) + RAG Knowledge'
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
    handleSend(prompt)
  }

  if (!isOpen) {
    return (
      <button 
        className="ai-fab" 
        onClick={() => dispatch({ type: 'TOGGLE_AI_CHAT' })}
        title="Dolphin AI Copilot - Cố vấn Hàng hải Chuyên sâu"
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
        <div style={{ fontSize: '11px', textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <span style={{ color: '#F97316', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} fill="#F97316" /> Groq Llama 3.3 70B (Siêu tốc + RAG)
          </span>
        </div>
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', color: '#F97316' }}>
                <Sparkles size={14} />
                <span style={{ fontSize: '11px', fontWeight: 600 }}>Dolphin Maritime AI</span>
              </div>
            )}
            
            {/* Robust Markdown Rendering */}
            <div 
              style={{ lineHeight: '1.6', fontSize: '13px' }}
              dangerouslySetInnerHTML={{ 
                __html: renderFormattedMarkdown(msg.content)
              }} 
            />
            
            {msg.source && (
              <div className="ai-source" style={{ marginTop: '8px', fontSize: '10px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BookOpen size={12} style={{ color: '#F97316' }} />
                <span>{msg.source}</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="ai-message assistant" style={{ opacity: 0.85 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#F97316' }}>
              <Loader2 size={16} className="animate-spin" />
              <span style={{ fontSize: '12px' }}>Groq đang suy luận siêu tốc từ dữ liệu RAG...</span>
            </div>
          </div>
        )}
        
        {/* Suggestion Prompts if only 1 message (greeting) */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>CÂU HỎI NHANH CHO SĨ QUAN:</div>
            {suggestedPrompts.map((prompt, idx) => (
              <button 
                key={idx}
                type="button"
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  background: 'var(--color-bg-input)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  color: 'var(--color-text-primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  lineHeight: '1.4'
                }}
                onClick={() => handlePromptClick(prompt)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#F97316'
                  e.currentTarget.style.background = 'rgba(249, 115, 22, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.background = 'var(--color-bg-input)'
                }}
              >
                ⚡ {prompt}
              </button>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-panel-input">
        <input 
          type="text" 
          placeholder="Hỏi AI về tính năng web, lý thuyết làm sạch, chuẩn MARPOL..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button onClick={() => handleSend()} disabled={!inputText.trim() || isLoading}>
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
