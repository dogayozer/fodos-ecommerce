'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, BotMessageSquare } from 'lucide-react'
import Link from 'next/link'

export function SmartAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'welcome-message',
      role: 'assistant',
      content: 'Merhaba! Fodos ve Piaks akıllı alışveriş asistanına hoş geldiniz. Size nasıl yardımcı olabilirim?'
    }
  ])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    
    const userMessage = { id: Date.now().toString(), role: 'user', content: inputValue }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue('')
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })

      if (!res.ok) {
        let errMsg = res.statusText;
        try {
          const errData = await res.json();
          if (errData.error) errMsg = errData.error;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const data = await res.json()
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || '',
        toolInvocations: (data.toolResults || []).map((tr: any) => ({
          state: 'result',
          toolCallId: tr.toolCallId,
          toolName: tr.toolName,
          args: tr.input || tr.args,
          result: tr.output || tr.result
        }))
      }

      setMessages([...newMessages, aiMessage])
    } catch (err: any) {
      console.error("Chat Error:", err)
      const errorMsg = err.message?.toLowerCase() || "";
      
      if (errorMsg.includes("quota") || errorMsg.includes("rate") || errorMsg.includes("429")) {
        setMessages([...newMessages, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Şu an çok fazla müşteriye cevap veriyorum, yoğunluktan dolayı geçici olarak doluyum. Lütfen 1-2 dakika sonra tekrar deneyiniz. ⏳'
        }])
      } else {
        setMessages([...newMessages, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sistemde geçici bir teknik aksaklık oluştu. Lütfen daha sonra tekrar deneyiniz.'
        }])
      }
    } finally {
      setIsLoading(false)
    }
  }
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-trust-blue-600 text-white rounded-full shadow-2xl hover:bg-trust-blue-700 transition-all hover:scale-110 z-50 flex items-center justify-center group"
          aria-label="Akıllı Asistanı Aç"
        >
          <BotMessageSquare size={28} />
          <span className="absolute right-16 bg-white text-gray-800 px-3 py-1 rounded shadow-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Asistana Sor 🤖
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[550px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-trust-blue-600 to-trust-blue-800 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold">Fodos Akıllı Asistan</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse"></span>
                  Çevrimiçi
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {(messages || []).map((m: any) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-trust-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-1 opacity-70">
                    {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    <span className="text-[10px] uppercase tracking-wider font-bold">
                      {m.role === 'user' ? 'Sen' : 'Asistan'}
                    </span>
                  </div>
                  
                  {/* Tool Invocations Display */}
                  {(m.toolInvocations || []).map((toolInvocation: any) => {
                    const toolCallId = toolInvocation.toolCallId;
                    
                    if (toolInvocation.state === 'result') {
                      const { result } = toolInvocation;
                      if (result.success && result.products) {
                        return (
                          <div key={toolCallId} className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm">
                            <p className="font-bold text-trust-blue-600 text-xs mb-2 uppercase tracking-wide border-b pb-1">
                              🔍 Bulunan Ürünler:
                            </p>
                            <div className="space-y-3">
                              {(result.products || []).map((p: any) => (
                                <Link 
                                  href={`/urun/${p.slug}`} 
                                  key={p.id}
                                  className="block bg-white border border-gray-200 p-2 rounded-lg hover:border-trust-blue-400 transition-colors"
                                >
                                  <div className="font-semibold text-gray-800 text-xs line-clamp-2" title={p.title}>{p.title}</div>
                                  <div className="font-bold text-trust-blue-600 mt-1 text-xs">{p.sale_price?.toLocaleString('tr-TR')} TL</div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      if (!result.success) {
                         return (
                           <div key={toolCallId} className="mt-2 text-xs bg-red-50 text-red-600 p-2 rounded">
                             ❌ {result.message}
                           </div>
                         )
                      }
                    } else {
                      return (
                        <div key={toolCallId} className="mt-2 text-xs flex items-center gap-2 text-trust-blue-600 bg-blue-50 p-2 rounded">
                          <Loader2 size={12} className="animate-spin" /> Veritabanı taranıyor...
                        </div>
                      );
                    }
                  })}

                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-trust-blue-600" />
                  <span className="text-sm text-gray-500">Asistan yazıyor...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={onSubmit} className="relative flex items-center">
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Örn: iPhone 13 ekran var mı?"
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white transition-colors"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-1 p-2 bg-trust-blue-600 text-white rounded-full hover:bg-trust-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send size={16} className={isLoading ? 'opacity-50' : ''} />
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                Yapay Zeka Destekli <Bot size={10} />
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
