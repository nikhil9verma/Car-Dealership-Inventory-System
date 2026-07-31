import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, X, Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';

/**
 * ChatWidget — floating AI sales assistant powered by Groq.
 * Mounted once in App.tsx and visible on the dashboard.
 * All chat history is kept in local component state only (stateless per session).
 */
export const ChatWidget: React.FC = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your Incubyte Motors assistant. Ask me anything about our current inventory — makes, models, prices, or availability!',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
        },
      ]);
    } catch (err: any) {
      // Show an error bubble — do not crash the UI
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'error',
          content: 'Sorry, I couldn\'t reach the assistant. Please try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating toggle button — bottom right */}
      <button
        id="chat-widget-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#0F1B2D] border-3 border-[#E8A020] brutal-shadow flex items-center justify-center hover:-translate-y-1 hover:brutal-shadow-lg transition-all cursor-pointer"
        title="Open sales assistant"
        aria-label="Open chat assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-[#E8A020] stroke-[2.5px]" />
        ) : (
          <MessageSquare className="w-6 h-6 text-[#E8A020] stroke-[2.5px]" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          id="chat-widget-panel"
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col brutal-card border-4 border-[#0F1B2D] brutal-shadow-xl"
          style={{ maxHeight: '520px' }}
        >
          {/* Header */}
          <div className="bg-[#0F1B2D] px-4 py-3 flex items-center gap-3 border-b-3 border-[#E8A020]">
            <div className="bg-[#E8A020] p-1.5 border-2 border-[#E8A020]">
              <Bot className="w-4 h-4 text-[#0F1B2D] stroke-[2.5px]" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-white tracking-wider leading-none">
                SALES ASSISTANT
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                POWERED BY GROQ · LLAMA 3.3
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] font-bold text-[#10B981] uppercase">LIVE</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-[#F8F9FA]" style={{ minHeight: 0, maxHeight: '340px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`shrink-0 w-7 h-7 border-2 border-[#0F1B2D] flex items-center justify-center ${
                    msg.role === 'user'
                      ? 'bg-[#3B82F6]'
                      : msg.role === 'error'
                      ? 'bg-[#DC2626]'
                      : 'bg-[#E8A020]'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-3.5 h-3.5 text-white stroke-[2.5px]" />
                  ) : msg.role === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-white stroke-[2.5px]" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-[#0F1B2D] stroke-[2.5px]" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[78%] px-3 py-2 border-2 border-[#0F1B2D] text-xs font-semibold leading-relaxed brutal-shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#0F1B2D] text-white'
                      : msg.role === 'error'
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-white text-[#0F1B2D]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 flex-row">
                <div className="shrink-0 w-7 h-7 border-2 border-[#0F1B2D] bg-[#E8A020] flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-[#0F1B2D] stroke-[2.5px]" />
                </div>
                <div className="bg-white border-2 border-[#0F1B2D] px-3 py-2 flex items-center gap-1.5 brutal-shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 text-[#0F1B2D] animate-spin stroke-[2.5px]" />
                  <span className="text-xs font-black uppercase text-[#0F1B2D] tracking-wider">
                    TYPING...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t-3 border-[#0F1B2D] flex bg-white">
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about our inventory..."
              disabled={isTyping}
              className="flex-1 px-3 py-2.5 text-xs font-bold text-[#0F1B2D] placeholder:text-neutral-400 outline-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              id="chat-send-btn"
              onClick={sendMessage}
              disabled={isTyping || !inputValue.trim()}
              className="border-l-3 border-[#0F1B2D] bg-[#E8A020] hover:bg-[#D4911A] px-3 py-2.5 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Send message"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-[#0F1B2D] stroke-[2.5px]" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
