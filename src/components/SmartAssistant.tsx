'use client';

import { useState, useRef, useEffect } from 'react';
import { useVenue } from '@/lib/venueContext';
import { useGeminiChat } from '@/hooks/useGeminiChat';

const QUICK_PROMPTS = [
  { 
    label: 'Fastest Entry Point', 
    query: 'What is the fastest gate to enter right now?',
    icon: <svg className="w-5 h-5 text-[#ccff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    desc: 'Find the gate with the shortest wait time.'
  },
  { 
    label: 'Nearest Restrooms', 
    query: 'Where are the nearest restrooms?',
    icon: <svg className="w-5 h-5 text-[#60a5fa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    desc: 'Locate washrooms near your sector.'
  },
  { 
    label: 'Food & Beverages', 
    query: 'Where can I get food and drinks?',
    icon: <svg className="w-5 h-5 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m5-6V3m7 6V3m-7 8h7m-7-4h7m2 14v-4m-12 4v-4m5 4h2" /></svg>,
    desc: 'Find concession stands and bars.'
  },
  { 
    label: 'Parking & Transport', 
    query: 'Where is parking and which lot is closest?',
    icon: <svg className="w-5 h-5 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
    desc: 'Lot status and transit information.'
  },
];

export default function SmartAssistant() {
  const { venueState } = useVenue();
  const { messages, isLoading, error, sendMessage, clearChat } = useGeminiChat(venueState);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'auto' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    const q = input.trim();
    if (!q || isLoading) return;
    sendMessage(q);
    setInput('');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 z-[100] w-20 h-20 bg-[#ccff00] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(204,255,0,0.3)] hover:scale-105 transition-transform group"
      >
        <span className="absolute inset-0 rounded-full border-[3px] border-[#ccff00] opacity-0 group-hover:animate-ping" />
        <svg className="w-10 h-10 text-[#0c0c0e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 z-[110] w-full max-w-[500px] flex flex-col bg-[#0c0c0e] border-l border-[#27272a] shadow-2xl animate-fade-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-[#27272a] bg-[#111114]">
          <div>
            <h3 className="text-[20px] font-black text-white flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#ccff00] animate-pulse shadow-[0_0_10px_#ccff00]" />
              AI Venue Navigator
            </h3>
            <p className="text-[14px] text-[#71717a] font-medium mt-1">Live contextual assistance</p>
          </div>
          <div className="flex items-center gap-4">
            {messages.length > 0 && (
              <button 
                onClick={clearChat} 
                className="text-[13px] font-bold text-[#a1a1aa] hover:text-white transition-colors bg-[#18181b] px-4 py-2 rounded-lg"
              >
                Reset
              </button>
            )}
            <button 
              onClick={() => setIsOpen(false)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-[#18181b] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 sm:px-12 py-10 space-y-8 w-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-col min-h-full flex-1 items-center justify-between">
              <div className="flex flex-col items-center justify-center text-center mt-8 mb-8 w-full px-4">
                <div className="w-20 h-20 bg-[#18181b] border border-[#27272a] shadow-lg rounded-3xl flex items-center justify-center mb-8 shrink-0 relative">
                  <span className="w-3 h-3 rounded-full bg-[#ccff00] absolute top-2 right-2 animate-pulse shadow-[0_0_8px_#ccff00]" />
                  <span className="text-[28px] font-black tracking-tighter text-white">SF</span>
                </div>
                <h4 className="text-[28px] lg:text-[32px] font-black text-white mb-3 leading-tight tracking-tight">How can I assist you?</h4>
                <p className="text-[15px] text-[#a1a1aa] font-medium max-w-[90%] mx-auto leading-relaxed">
                  Powered by Gemini 2.5 Flash. I know the entire stadium layout, parking flow, and live wait times.
                </p>
              </div>
              
              <div className="flex flex-col gap-3 mt-auto">
                <div className="flex items-center gap-3 px-2 mb-4">
                  <div className="h-px bg-[#27272a] w-4"></div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#71717a] whitespace-nowrap">
                    Suggested Commands
                  </span>
                  <div className="h-px bg-[#27272a] flex-1"></div>
                </div>
                <div className="grid grid-cols-1 gap-3 px-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => sendMessage(p.query)}
                      className="group flex items-center gap-4 w-full p-4 border border-[#27272a] bg-[#111114] rounded-2xl text-left hover:bg-[#18181b] hover:border-[#3f3f46] hover:-translate-y-0.5 transition-all shadow-lg shadow-black/20"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-[#18181b] group-hover:bg-[#27272a] transition-colors rounded-full flex items-center justify-center border border-[#27272a]">
                        {p.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-black text-[#e4e4e7] group-hover:text-white transition-colors">
                          {p.label}
                        </span>
                        <span className="text-[12px] font-medium text-[#71717a]">
                          {p.desc}
                        </span>
                      </div>
                      <div className="ml-auto text-[#3f3f46] group-hover:text-[#ccff00] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[85%] p-5 rounded-xl text-[15px] leading-relaxed font-medium shadow-md break-words
                  ${msg.role === 'user'
                    ? 'bg-[#18181b] text-white border border-[#27272a] rounded-br-sm'
                    : 'bg-[#111114] border border-[#27272a] text-[#d4d4d8] rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex items-start">
              <div className="p-5 bg-[#111114] border border-[#27272a] rounded-xl rounded-bl-sm max-w-[80%]">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse delay-75" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse delay-150" />
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-4 border border-[#ef4444]/30 bg-[#ef4444]/5 text-[#fca5a5] text-[14px] font-bold rounded-xl">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-8 sm:px-12 pt-8 pb-16 sm:pb-20 border-t border-[#27272a] bg-[#111114] w-full mt-auto shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 relative">
          <div className="flex items-center gap-3 bg-[#18181b] border border-[#3f3f46] rounded-xl p-2 focus-within:border-[#ccff00] focus-within:ring-1 focus-within:ring-[#ccff00] transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask anything about the venue..."
              className="flex-1 h-[56px] bg-transparent px-4 text-[16px] font-medium text-white placeholder-[#71717a] focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-[56px] w-[56px] flex items-center justify-center bg-[#ccff00] text-[#0c0c0e] rounded-lg hover:opacity-90 disabled:opacity-20 transition-opacity"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
          <p className="text-center text-[11px] font-medium text-[#52525b] mt-4">Press Enter to send. Powered by StadiumFlow.</p>
        </div>
      </div>
    </>
  );
}
