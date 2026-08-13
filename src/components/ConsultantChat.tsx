import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, BrandBible, Color } from '../types';
import { safeFetchJson } from '../utils/api';
import { Send, Sparkles, User, BrainCircuit, AlertCircle, Palette, Check, RefreshCw, Target, ArrowRight } from 'lucide-react';

interface ConsultantChatProps {
  brandBible: BrandBible | null;
  onUpdatePalette?: (newPalette: Color[]) => void;
  onUpdateBrandBible?: (newBible: BrandBible) => void;
  isDark?: boolean;
}

const CHATBOT_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Fast general strategy & advice' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', desc: 'Complex reasoning & creative writing' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', desc: 'Lightweight responsive feedback' }
];

const PALETTE_VARIATION_PRESETS = [
  { label: '🎨 Monochromatic', type: 'Monochromatic', prompt: 'Generate a Monochromatic color palette variation for my brand' },
  { label: '☯️ Complementary', type: 'Complementary', prompt: 'Generate a Complementary color palette variation for my brand' },
  { label: '⚡ High-Contrast', type: 'High-Contrast', prompt: 'Generate a High-Contrast color palette variation for my brand' },
  { label: '🌿 Analogous', type: 'Analogous', prompt: 'Generate an Analogous color palette variation for my brand' },
  { label: '🔥 Warm & Earthy', type: 'Warm & Earthy', prompt: 'Generate a Warm & Earthy color palette variation for my brand' },
  { label: '💎 Cool & Modern', type: 'Cool & Modern', prompt: 'Generate a Cool & Modern color palette variation for my brand' },
];

const MISSION_REANALYSIS_PRESETS = [
  { label: '🚀 Scale & Enterprise', prompt: 'Re-analyze mission: To empower modern global teams with enterprise-grade automated tools' },
  { label: '🌱 Sustainability & Impact', prompt: 'Re-analyze mission: To pioneer eco-friendly solutions and drive sustainable growth worldwide' },
  { label: '🔒 Trust & Transparency', prompt: 'Re-analyze mission: To deliver radical transparency, data privacy, and uncompromising trust' },
  { label: '⚡ Velocity & Innovation', prompt: 'Re-analyze mission: To accelerate human creativity through high-velocity AI breakthroughs' }
];

const PRESET_QUESTIONS = [
  "Write a tagline & marketing copy",
  "How should we apply colors on packaging?",
  "Draft a 1-week launch social schedule",
  "Brainstorm 3 domain name ideas"
];

export default function ConsultantChat({ brandBible, onUpdatePalette, onUpdateBrandBible, isDark = false }: ConsultantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I am your AI Brand Design & Strategy Consultant. Once you configure your brand foundation, I can help you compose copy, align packaging, re-analyze your company mission, or generate 5-color palette variations (Monochromatic, Complementary, High-Contrast, etc.). Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [activeChipTab, setActiveChipTab] = useState<'palette' | 'mission' | 'strategy'>('palette');
  const [showMissionInput, setShowMissionInput] = useState(false);
  const [customMissionText, setCustomMissionText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (brandBible?.mission) {
      setCustomMissionText(brandBible.mission);
    }
  }, [brandBible?.mission]);

  // Handle brand bible updates
  useEffect(() => {
    if (brandBible) {
      setMessages(prev => {
        if (prev.length > 1) {
          return [
            ...prev,
            {
              id: `update-${Date.now()}`,
              role: 'model',
              text: `✨ Excellent! I have updated my consultation model with your brand guidelines for "${brandBible.companyName}". Mission: "${brandBible.mission}". Ask me to write website copy, re-analyze your brand specification, or generate color palette variations!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
        }
        return [
          {
            id: 'welcome',
            role: 'model',
            text: `Hello! I am your Brand Design & Strategy Consultant loaded with "${brandBible.companyName}'s" brand specification! You can ask me to write copy, re-analyze your mission, or generate color palette variations!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      });
    }
  }, [brandBible?.id]);

  const handleSendMessage = async (
    textToSend: string, 
    paletteType?: string,
    isReanalyzeMission?: boolean,
    refinedMissionText?: string
  ) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setShowMissionInput(false);
    setIsLoading(true);
    setError(null);

    try {
      const data = await safeFetchJson('/api/brand/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.concat(userMsg),
          message: textToSend,
          brandBible,
          selectedModel,
          requestedPaletteType: paletteType,
          isReanalyzeMission: isReanalyzeMission || Boolean(refinedMissionText),
          refinedMission: refinedMissionText
        })
      });

      setMessages(prev => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          role: 'model',
          text: data.text || "I was unable to formulate a response.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          colorPalette: data.colorPalette,
          paletteType: data.paletteType || paletteType,
          brandBibleUpdate: data.brandBibleUpdate
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPalette = (msgId: string, palette: Color[]) => {
    if (onUpdatePalette) {
      onUpdatePalette(palette);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isApplied: true } : m));
    }
  };

  const handleApplyBrandBible = (msgId: string, updatedBible: BrandBible) => {
    if (onUpdateBrandBible) {
      onUpdateBrandBible(updatedBible);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isApplied: true } : m));
    }
  };

  return (
    <div
      id="consultant-chat-widget"
      className={`border rounded-3xl p-6 shadow-sm flex flex-col h-[560px] transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div className={`flex flex-col gap-1 border-b pb-4 mb-4 transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600">04 / Consultant</span>
          {/* Model Selection */}
          <div className="relative font-sans">
            <select
              id="chat-model-selector"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isLoading}
              className={`text-[10px] border px-2.5 py-1 rounded-full focus:outline-none focus:border-indigo-500 font-bold cursor-pointer transition-all duration-300 ${
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
        <h2 className={`text-lg font-black tracking-tight flex items-center gap-2 font-sans mt-1 transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          AI Strategy Suite
        </h2>
        <p className={`text-[11px] font-sans mt-0.5 leading-relaxed transition-colors duration-300 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Re-analyze missions, generate palettes, or compose copy in 1-click.
        </p>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-3 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[92%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors duration-300 ${
              msg.role === 'user'
                ? isDark
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-slate-100 text-slate-600'
                : isDark
                  ? 'bg-indigo-950/60 text-indigo-300'
                  : 'bg-indigo-50 text-indigo-600'
            }`}>
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble */}
            <div className="space-y-2 flex-1 min-w-0">
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

                {/* Inline Refined Brand Specification Card */}
                {msg.brandBibleUpdate && (
                  <div className={`mt-3 p-3.5 rounded-2xl border transition-all duration-300 ${
                    isDark ? 'bg-indigo-950/40 border-indigo-800/60' : 'bg-indigo-50/60 border-indigo-200/80 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-200/50 dark:border-indigo-800/40">
                      <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-black text-xs text-indigo-900 dark:text-indigo-200">
                        Refined Brand Specification Set
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px] mb-3">
                      <div>
                        <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[9px] block">Refined Mission</span>
                        <p className="font-medium text-slate-800 dark:text-slate-200 italic">"{msg.brandBibleUpdate.mission}"</p>
                      </div>

                      {msg.brandBibleUpdate.archetype && (
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-lg border border-indigo-100 dark:border-slate-800">
                          <div>
                            <span className="text-[9px] font-extrabold text-indigo-600 block">PRIMARY ARCHETYPE</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{msg.brandBibleUpdate.archetype.primaryArchetype}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 max-w-[150px] truncate italic">{msg.brandBibleUpdate.archetype.tagline}</span>
                        </div>
                      )}

                      {/* Color Palette Swatches preview */}
                      {msg.brandBibleUpdate.colorPalette && (
                        <div>
                          <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[9px] block mb-1">Updated 5-Color Palette</span>
                          <div className="grid grid-cols-5 gap-1">
                            {msg.brandBibleUpdate.colorPalette.map((c, i) => (
                              <div key={i} className="h-6 rounded shadow-inner border border-black/10" style={{ backgroundColor: c.hex }} title={`${c.name} (${c.hex})`} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Apply Button */}
                    {msg.isApplied ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                        Refined Specification Applied to Dashboard!
                      </div>
                    ) : (
                      <button
                        id={`apply-brand-bible-btn-${msg.id}`}
                        type="button"
                        onClick={() => handleApplyBrandBible(msg.id, msg.brandBibleUpdate!)}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Apply Refined Brand Bible to App
                      </button>
                    )}
                  </div>
                )}

                {/* Inline 5-Color Palette Swatch Card */}
                {msg.colorPalette && Array.isArray(msg.colorPalette) && msg.colorPalette.length > 0 && !msg.brandBibleUpdate && (
                  <div className={`mt-3 p-3 rounded-xl border transition-all duration-300 ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-extrabold text-[11px] text-indigo-600">
                          {msg.paletteType || 'Palette Variation'} (5 Colors)
                        </span>
                      </div>
                    </div>

                    {/* 5 Swatches Row */}
                    <div className="grid grid-cols-5 gap-1 mb-2.5">
                      {msg.colorPalette.map((col, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div
                            className="w-full h-8 rounded-lg shadow-inner border border-black/10 transition-transform hover:scale-105"
                            style={{ backgroundColor: col.hex }}
                            title={`${col.name} (${col.hex}) - ${col.role}`}
                          />
                          <span className="font-mono text-[9px] font-semibold text-slate-500 truncate w-full text-center">
                            {col.hex}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Compact Color Details */}
                    <div className="space-y-1 mb-3">
                      {msg.colorPalette.map((col, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px] font-sans gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2 h-2 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: col.hex }} />
                            <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{col.name}</span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                            {col.role}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Apply Button */}
                    {msg.isApplied ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                        Palette Applied to Brand Specification!
                      </div>
                    ) : (
                      <button
                        id={`apply-palette-btn-${msg.id}`}
                        type="button"
                        onClick={() => handleApplyPalette(msg.id, msg.colorPalette!)}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Apply {msg.paletteType || 'Variation'} to Brand Bible
                      </button>
                    )}
                  </div>
                )}
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
            <div className={`w-7 h-7 rounded-full flex items-center justify-center animate-pulse transition-colors duration-300 ${
              isDark ? 'bg-indigo-950/60 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className={`p-3.5 rounded-2xl rounded-tl-none transition-colors duration-300 border ${
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

      {/* Inline Mission Input Drawer */}
      {showMissionInput && (
        <div className={`p-3 rounded-2xl border mb-3 space-y-2 text-xs font-sans animate-fadeIn ${
          isDark ? 'bg-slate-950 border-indigo-900/60' : 'bg-indigo-50/70 border-indigo-200'
        }`}>
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-indigo-600 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> Refine Company Mission Statement
            </span>
            <button
              type="button"
              onClick={() => setShowMissionInput(false)}
              className="text-slate-400 hover:text-slate-600 text-[10px] font-bold"
            >
              Cancel
            </button>
          </div>
          <textarea
            id="chat-mission-refine-textarea"
            rows={2}
            value={customMissionText}
            onChange={(e) => setCustomMissionText(e.target.value)}
            placeholder="Type your refined or updated mission statement..."
            className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none focus:border-indigo-500 font-medium ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}
          />
          <button
            id="chat-run-mission-reanalysis-btn"
            type="button"
            disabled={isLoading || !customMissionText.trim()}
            onClick={() => handleSendMessage(
              `Re-analyze mission: ${customMissionText}`,
              undefined,
              true,
              customMissionText
            )}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Run Mission Re-Analysis
          </button>
        </div>
      )}

      {/* Quick Prompt Tabs: Palette Variations vs Mission Re-Analysis vs Strategy */}
      <div className="space-y-2 mb-3 font-sans">
        <div className="flex items-center gap-1.5 text-[10px] font-bold overflow-x-auto pb-0.5 scrollbar-thin">
          <button
            type="button"
            onClick={() => { setActiveChipTab('palette'); setShowMissionInput(false); }}
            className={`px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 shrink-0 ${
              activeChipTab === 'palette'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-3 h-3" />
            Palette
          </button>
          <button
            type="button"
            onClick={() => { setActiveChipTab('mission'); }}
            className={`px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 shrink-0 ${
              activeChipTab === 'mission'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Target className="w-3 h-3" />
            Re-Analyze Mission
          </button>
          <button
            type="button"
            onClick={() => { setActiveChipTab('strategy'); setShowMissionInput(false); }}
            className={`px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 shrink-0 ${
              activeChipTab === 'strategy'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BrainCircuit className="w-3 h-3" />
            Strategy
          </button>
        </div>

        {/* Chips Container */}
        <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-0.5 scrollbar-thin">
          {activeChipTab === 'palette' && (
            PALETTE_VARIATION_PRESETS.map((p) => (
              <button
                id={`chat-preset-palette-${p.type.toLowerCase()}`}
                key={p.type}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(p.prompt, p.type)}
                className={`text-[10px] px-2.5 py-1 border rounded-full font-bold transition-all duration-200 text-left cursor-pointer flex items-center gap-1 ${
                  isDark
                    ? 'bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-800/60 text-indigo-300'
                    : 'bg-indigo-50/80 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                }`}
              >
                {p.label}
              </button>
            ))
          )}

          {activeChipTab === 'mission' && (
            <>
              <button
                id="chat-toggle-custom-mission-btn"
                type="button"
                onClick={() => setShowMissionInput(!showMissionInput)}
                className="text-[10px] px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Target className="w-3 h-3" />
                Custom Mission Text...
              </button>
              {MISSION_REANALYSIS_PRESETS.map((mp, idx) => (
                <button
                  id={`chat-preset-mission-${idx}`}
                  key={mp.label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    const missionVal = mp.prompt.replace('Re-analyze mission: ', '');
                    handleSendMessage(mp.prompt, undefined, true, missionVal);
                  }}
                  className={`text-[10px] px-2.5 py-1 border rounded-full font-bold transition-all duration-200 text-left cursor-pointer flex items-center gap-1 ${
                    isDark
                      ? 'bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-800/60 text-indigo-300'
                      : 'bg-indigo-50/80 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                  }`}
                >
                  {mp.label}
                </button>
              ))}
            </>
          )}

          {activeChipTab === 'strategy' && (
            PRESET_QUESTIONS.map((q) => (
              <button
                id={`chat-preset-${q.replace(/\s+/g, '-').toLowerCase()}`}
                key={q}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(q)}
                className={`text-[10px] px-2.5 py-1 border rounded-full transition-all duration-200 text-left cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                {q}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Input controls */}
      <div className="flex gap-2 font-sans">
        <input
          id="chat-user-input"
          type="text"
          placeholder={
            brandBible
              ? "Type query or e.g. 'Re-analyze mission: ...'"
              : "Generate a Brand Bible first to start consultation!"
          }
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage(userInput);
          }}
          disabled={isLoading}
          className={`flex-1 px-4 py-2 text-xs rounded-full transition-all duration-300 focus:outline-none focus:border-indigo-500 disabled:opacity-60 ${
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
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md shadow-indigo-100 disabled:opacity-40 disabled:shadow-none transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


