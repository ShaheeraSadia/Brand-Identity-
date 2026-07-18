import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, BrandBible } from '../types';
import { MessageSquare, Send, Sparkles, User, BrainCircuit, AlertCircle, HelpCircle } from 'lucide-react';

interface ConsultantChatProps {
  brandBible: BrandBible | null;
  isDark?: boolean;
}

const CHATBOT_MODELS = [
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', desc: 'General Strategy & Advice' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', desc: 'Complex reasoning & creative writing' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite', desc: 'Fast, responsive feedback' }
];

const PRESET_QUESTIONS = [
  "Write a tagline & marketing copy",
  "How should we apply colors on packaging?",
  "Draft a 1-week launch social schedule",
  "Brainstorm 3 domain name ideas"
];

export default function ConsultantChat({ brandBible, isDark = false }: ConsultantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I am your AI Brand Design & Strategy Consultant. Once you configure your brand foundation, I can help you compose copy, align packaging, draft launch strategies, or brainstorm name variations. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle brand bible updates
  useEffect(() => {
    if (brandBible) {
      setMessages(prev => {
        // If they already have messages beyond welcome, don't overwrite, but append a notice
        if (prev.length > 1) {
          return [
            ...prev,
            {
              id: `update-${Date.now()}`,
              role: 'model',
              text: `✨ Excellent! I have updated my consultation model with your new brand guidelines for "${brandBible.companyName}". How can I assist you with this new identity?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
        }
        return [
          {
            id: 'welcome',
            role: 'model',
            text: `Hello! I am your Brand Design & Strategy Consultant. I am fully loaded with "${brandBible.companyName}'s" brand specification! Ask me to write website copy, outline social campaigns, or structure packaging guidelines using your color palette and voice!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      });
    }
  }, [brandBible?.id]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/brand/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.concat(userMsg),
          message: textToSend,
          brandBible,
          selectedModel
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to contact Brand Consultant.");
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          role: 'model',
          text: data.text || "I was unable to formulate a response.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="consultant-chat-widget"
      className={`border rounded-3xl p-8 shadow-sm flex flex-col h-[520px] transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div className={`flex flex-col gap-1 border-b pb-5 mb-5 transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600">04 / Consultant</span>
          {/* Model Selection */}
          <div className="relative font-sans">
            <select
              id="chat-model-selector"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isLoading}
              className={`text-[10px] border px-2.5 py-1.5 rounded-full focus:outline-none focus:border-indigo-500 font-bold cursor-pointer transition-all duration-300 ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-300 focus:bg-slate-950'
                  : 'bg-slate-50 border-slate-200/80 text-slate-600 focus:bg-white'
              }`}
            >
              {CHATBOT_MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
        <h2 className={`text-xl font-black tracking-tight flex items-center gap-2 font-sans mt-2 transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          AI Strategy Suite
        </h2>
        <p className={`text-[11px] font-sans mt-0.5 leading-relaxed transition-colors duration-300 ${
          isDark ? 'text-slate-400' : 'text-slate-400'
        }`}>
          Discuss assets, compose web copy, or align launch schedules.
        </p>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors duration-300 ${
              msg.role === 'user'
                ? isDark
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-slate-100 text-slate-600'
                : isDark
                  ? 'bg-indigo-950/60 text-indigo-300'
                  : 'bg-indigo-50 text-indigo-600'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-1">
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans transition-colors duration-300 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : isDark
                    ? 'bg-slate-950 border border-slate-800/80 text-slate-200 rounded-tl-none'
                    : 'bg-slate-50 border border-slate-200/50 text-slate-800 rounded-tl-none'
              }`}>
                {msg.text.split('\n').map((para, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{para}</p>
                ))}
              </div>
              <span className={`block text-[9px] text-slate-400 font-sans ${
                msg.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center animate-pulse transition-colors duration-300 ${
              isDark ? 'bg-indigo-950/60 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className={`p-4 rounded-2xl rounded-tl-none transition-colors duration-300 border ${
              isDark ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 font-sans border transition-colors duration-300 ${
            isDark ? 'bg-rose-950/30 border-rose-900/40 text-rose-300' : 'bg-rose-50 border-rose-100 text-rose-600'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-1.5 mb-3 font-sans">
        {PRESET_QUESTIONS.map((q) => (
          <button
            id={`chat-preset-${q.replace(/\s+/g, '-').toLowerCase()}`}
            key={q}
            type="button"
            disabled={isLoading}
            onClick={() => handleSendMessage(q)}
            className={`text-[10px] px-3 py-1 border rounded-full transition-all duration-250 text-left cursor-pointer ${
              isDark
                ? 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input controls */}
      <div className="flex gap-2 font-sans">
        <input
          id="chat-user-input"
          type="text"
          placeholder={
            brandBible
              ? "Ask the Brand Consultant (e.g. 'Help me write a tagline')"
              : "Generate a Brand Bible first to start consultation!"
          }
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage(userInput);
          }}
          disabled={isLoading}
          className={`flex-1 px-4 py-2.5 text-xs rounded-full transition-all duration-300 focus:outline-none focus:border-indigo-500 disabled:opacity-60 ${
            isDark
              ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500'
              : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500'
          }`}
        />
        <button
          id="chat-send-btn"
          type="button"
          disabled={isLoading || !userInput.trim()}
          onClick={() => handleSendMessage(userInput)}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md shadow-indigo-100 disabled:opacity-40 disabled:shadow-none transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
