import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Building2, Target, HelpCircle, Palette, Layers, Globe, Sliders, CheckCircle2, RotateCcw, ArrowRight, ArrowLeft, Mic, MicOff, Volume2, AlertCircle, History } from 'lucide-react';

interface BrandConfigFormProps {
  onSubmit: (data: {
    companyName: string;
    mission: string;
    industry: string;
    targetAudience: string;
    customInstructions: string;
    logoSize: '1K' | '2K' | '4K';
    brandPersonality: number;
  }) => void;
  isLoading: boolean;
  isDark?: boolean;
}

interface RecentPrompt {
  id: string;
  label: string;
  mission: string;
  customInstructions: string;
  companyName?: string;
  timestamp: number;
}

const DEFAULT_RECENT_PROMPTS: RecentPrompt[] = [
  {
    id: 'sample-1',
    label: 'Lumina Solar — Clean Solar Energy Subscription',
    mission: 'To empower everyday citizens with access to hyper-efficient, clean solar energy units through an elegant, accessible subscription model, bringing clean energy independence to every neighborhood.',
    customInstructions: 'Emerald & gold accents, warm, serene, vintage luxury',
    companyName: 'Lumina Solar',
    timestamp: Date.now() - 3600000
  },
  {
    id: 'sample-2',
    label: 'Kroma AI — AI Generative Design Suite',
    mission: 'Creating AI-powered generative design tools for indie creators and modern branding teams to craft complete brand identity systems instantly.',
    customInstructions: 'Minimalist & Elegant, dark mode high precision',
    companyName: 'Kroma AI',
    timestamp: Date.now() - 7200000
  },
  {
    id: 'sample-3',
    label: 'Solstice Roast — Artisanal Organic Coffee',
    mission: 'Crafting organic, single-origin artisanal coffees delivered straight to urban professionals and eco-conscious coffee lovers.',
    customInstructions: 'Organic & Earthy, warm terracotta and sage green',
    companyName: 'Solstice Roast',
    timestamp: Date.now() - 10800000
  },
  {
    id: 'sample-4',
    label: 'ByteFlow — Micro-learning Platform for Engineers',
    mission: 'Building seamless bite-sized micro-learning platforms for remote engineering and product teams to stay ahead of modern tech stacks.',
    customInstructions: 'Futuristic & Tech-focused, neon cyan and deep indigo',
    companyName: 'ByteFlow',
    timestamp: Date.now() - 14400000
  },
  {
    id: 'sample-5',
    label: 'Aura Apparel — Sustainable Luxury Loungewear',
    mission: 'Designing sustainable luxury loungewear made from 100% recycled ocean plastics and organic cotton for conscious everyday comfort.',
    customInstructions: 'Playful & High-energy, pastel sunset tones',
    companyName: 'Aura Apparel',
    timestamp: Date.now() - 18000000
  }
];

const INDUSTRY_PRESETS = [
  'Technology & AI',
  'Health & Wellness',
  'Creative Agency',
  'Sustainable Fashion',
  'Artisanal Coffee & Food',
  'Fintech & Finance',
  'Education & E-learning'
];

const AUDIENCE_PRESETS = [
  'Gen Z & Trendsetters',
  'Tech Professionals & Creators',
  'Eco-conscious Consumers',
  'Families & Parents',
  'B2B Executives & Enterprises'
];

const VIBE_PRESETS = [
  'Minimalist & Elegant',
  'Futuristic & Tech-focused',
  'Organic & Earthy',
  'Playful & High-energy',
  'Corporate & Trustworthy',
  'Bold & Brutalist'
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    scenario: "Scenario 1: Brand First Impression",
    question: "When a customer opens your homepage or product, what impression should they feel within 3 seconds?",
    options: [
      { text: "Restrained, high-precision, executive & institutional", value: 10, tag: "Formal / Minimalist" },
      { text: "Modern, warm, balanced, and approachable", value: 50, tag: "Balanced / Versatile" },
      { text: "Expressive, high-energy, vibrant, and bold", value: 90, tag: "Playful / Vibrant" }
    ]
  },
  {
    id: 2,
    scenario: "Scenario 2: Brand Voice & Product Updates",
    question: "How does your brand announce a major milestone or feature release?",
    options: [
      { text: "\"We are pleased to publish release notes for version 2.0, focusing on security and architectural reliability.\"", value: 15, tag: "Executive Tone" },
      { text: "\"Version 2.0 is live! Here is how our new features make your day-to-day workflow easier.\"", value: 50, tag: "Friendly & Direct" },
      { text: "\"🚀 Big news! Version 2.0 is officially here and it's absolute magic. Let's dive in!\"", value: 85, tag: "High-Energy" }
    ]
  },
  {
    id: 3,
    scenario: "Scenario 3: Spatial & Aesthetic Mood",
    question: "If your brand were a physical workspace or coffee studio, what environment fits best?",
    options: [
      { text: "A sleek obsidian boardroom with monochrome architecture and silent precision", value: 10, tag: "Monochrome / Luxe" },
      { text: "A sunlit Scandinavian loft with warm oak wood, neutral linen, and green flora", value: 50, tag: "Organic / Clean" },
      { text: "A pop-art creative loft with dynamic neon typography, vibrant art, and upbeat music", value: 90, tag: "Vibrant / Pop" }
    ]
  },
  {
    id: 4,
    scenario: "Scenario 4: Customer Care & Interaction",
    question: "A customer reaches out via support chat. What greeting best matches your brand?",
    options: [
      { text: "\"Welcome to Customer Support. Please state your reference ID to proceed.\"", value: 15, tag: "Formal Precision" },
      { text: "\"Hi there! Welcome. How can our team assist you today?\"", value: 50, tag: "Warm Professional" },
      { text: "\"Hey friend! 👋 So glad you reached out—let's get this sorted for you right away!\"", value: 85, tag: "Conversational & Enthusiastic" }
    ]
  }
];

export default function BrandConfigForm({ onSubmit, isLoading, isDark = false }: BrandConfigFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [mission, setMission] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [logoSize, setLogoSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [brandPersonality, setBrandPersonality] = useState(50);

  // Interactive Personality Quiz states
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizStep, setQuizStep] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Web Speech API Voice Dictation States
  const [isListeningMission, setIsListeningMission] = useState<boolean>(false);
  const [isListeningCustom, setIsListeningCustom] = useState<boolean>(false);
  const [speechErrorMessage, setSpeechErrorMessage] = useState<string | null>(null);
  const activeRecognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (activeRecognitionRef.current) {
        try {
          activeRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceDictation = (
    field: 'mission' | 'customInstructions',
    currentValue: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    setIsListening: React.Dispatch<React.SetStateAction<boolean>>,
    isCurrentlyListening: boolean
  ) => {
    setSpeechErrorMessage(null);

    const SpeechRecognition = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setSpeechErrorMessage("Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.");
      setTimeout(() => setSpeechErrorMessage(null), 5000);
      return;
    }

    if (activeRecognitionRef.current) {
      try {
        activeRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      activeRecognitionRef.current = null;
      setIsListeningMission(false);
      setIsListeningCustom(false);

      if (isCurrentlyListening) {
        return;
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      const baseText = currentValue.trim();

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let sessionTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          sessionTranscript += event.results[i][0].transcript;
        }
        const updatedText = baseText
          ? `${baseText} ${sessionTranscript.trim()}`
          : sessionTranscript.trim();
        setValue(updatedText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        activeRecognitionRef.current = null;
        if (event.error === 'not-allowed') {
          setSpeechErrorMessage("Microphone access was denied. Please allow microphone permissions in browser settings.");
        } else if (event.error !== 'no-speech') {
          setSpeechErrorMessage(`Voice recognition notice: ${event.error}`);
        }
        setTimeout(() => setSpeechErrorMessage(null), 5000);
      };

      recognition.onend = () => {
        setIsListening(false);
        activeRecognitionRef.current = null;
      };

      activeRecognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition start error:', err);
      setIsListening(false);
      setSpeechErrorMessage("Could not activate microphone. Please check permissions.");
      setTimeout(() => setSpeechErrorMessage(null), 5000);
    }
  };

  const handleSelectQuizOption = (value: number) => {
    const updatedAnswers = [...quizAnswers];
    updatedAnswers[quizStep] = value;
    setQuizAnswers(updatedAnswers);

    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate average personality score
      const sum = updatedAnswers.reduce((a, b) => a + b, 0);
      const calculatedScore = Math.round(sum / updatedAnswers.length);
      setBrandPersonality(calculatedScore);
      setQuizCompleted(true);
    }
  };

  // Recent Prompts State
  const [recentPrompts, setRecentPrompts] = useState<RecentPrompt[]>(() => {
    try {
      const saved = localStorage.getItem('brand_generator_recent_prompts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      }
    } catch (e) {
      console.warn('Failed to parse recent prompts:', e);
    }
    return DEFAULT_RECENT_PROMPTS;
  });

  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [autofillSuccessMsg, setAutofillSuccessMsg] = useState<string | null>(null);

  const handleSelectRecentPrompt = (promptId: string) => {
    setSelectedPromptId(promptId);
    if (!promptId) return;

    const found = recentPrompts.find(p => p.id === promptId);
    if (found) {
      setMission(found.mission);
      setCustomInstructions(found.customInstructions || '');
      if (found.companyName) {
        setCompanyName(found.companyName);
      }
      setAutofillSuccessMsg(`Auto-filled Mission and Styling Directives from "${found.companyName || 'Recent Prompt'}"!`);
      setTimeout(() => setAutofillSuccessMsg(null), 3500);
    }
  };

  const handleResetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers([]);
    setQuizCompleted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !mission) return;

    // Save prompt to recent prompts history (max 5)
    const newPrompt: RecentPrompt = {
      id: `prompt-${Date.now()}`,
      label: companyName ? `${companyName} — ${mission.slice(0, 25)}...` : mission.slice(0, 35) + '...',
      mission,
      customInstructions,
      companyName,
      timestamp: Date.now()
    };

    const updatedPrompts = [
      newPrompt,
      ...recentPrompts.filter(p => p.mission !== mission || p.customInstructions !== customInstructions)
    ].slice(0, 5);

    setRecentPrompts(updatedPrompts);
    try {
      localStorage.setItem('brand_generator_recent_prompts', JSON.stringify(updatedPrompts));
    } catch (err) {
      console.warn('Failed to save recent prompts to localStorage:', err);
    }

    onSubmit({
      companyName,
      mission,
      industry,
      targetAudience,
      customInstructions,
      logoSize,
      brandPersonality
    });
  };

  return (
    <form
      id="brand-config-form"
      onSubmit={handleSubmit}
      className={`space-y-6 border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className={`space-y-2 border-b pb-5 transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <h2 className={`text-xl font-bold flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}>
          <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
          Brand Foundation
        </h2>
        <p className={`text-xs font-sans leading-relaxed transition-colors duration-300 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Provide your core business mission, and our AI design suite will draft a complete, cohesive Brand Identity System.
        </p>
      </div>

      {/* Recent Prompts Dropdown */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 space-y-2 font-sans ${
        isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label htmlFor="recent-prompts-select" className={`text-xs font-bold flex items-center gap-1.5 transition-colors duration-300 ${
            isDark ? 'text-indigo-300' : 'text-slate-800'
          }`}>
            <History className="w-4 h-4 text-indigo-500" />
            <span>Recent Prompts</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              Last 5 Used
            </span>
          </label>

          {selectedPromptId && (
            <button
              id="clear-prompt-selection-btn"
              type="button"
              onClick={() => setSelectedPromptId('')}
              className="text-[10px] text-slate-400 hover:text-indigo-500 font-sans cursor-pointer"
            >
              Clear Selection
            </button>
          )}
        </div>

        <select
          id="recent-prompts-select"
          value={selectedPromptId}
          onChange={(e) => handleSelectRecentPrompt(e.target.value)}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-xl text-xs font-sans transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-indigo-500'
              : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500'
          }`}
        >
          <option value="">-- Select a recent prompt to auto-fill mission &amp; instructions --</option>
          {recentPrompts.map((prompt, index) => (
            <option key={prompt.id} value={prompt.id}>
              {index + 1}. {prompt.label}
            </option>
          ))}
        </select>

        {autofillSuccessMsg && (
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{autofillSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Company Name */}
      <div className="space-y-1">
        <label htmlFor="company-name" className={`block text-xs font-semibold font-sans transition-colors duration-300 ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Company Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="company-name"
            type="text"
            required
            placeholder="e.g. Lumina Energy"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500'
            }`}
          />
        </div>
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <label htmlFor="industry" className={`block text-xs font-semibold font-sans transition-colors duration-300 ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Industry / Sector
        </label>
        <div className="relative">
          <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="industry"
            type="text"
            placeholder="e.g. Clean Tech & Solar Energy"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500'
            }`}
          />
        </div>
        {/* Industry Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {INDUSTRY_PRESETS.map((preset) => (
            <button
              id={`industry-preset-${preset.replace(/\s+/g, '-').toLowerCase()}`}
              key={preset}
              type="button"
              disabled={isLoading}
              onClick={() => setIndustry(preset)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-200 font-sans cursor-pointer ${
                industry === preset
                  ? isDark
                    ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300 font-bold'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600 font-semibold'
                  : isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Target Audience */}
      <div className="space-y-2">
        <label htmlFor="target-audience" className={`block text-xs font-semibold font-sans transition-colors duration-300 ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Target Audience
        </label>
        <div className="relative">
          <Target className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="target-audience"
            type="text"
            placeholder="e.g. Modern homeowners & eco-activists"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500'
            }`}
          />
        </div>
        {/* Audience Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {AUDIENCE_PRESETS.map((preset) => (
            <button
              id={`audience-preset-${preset.replace(/\s+/g, '-').toLowerCase()}`}
              key={preset}
              type="button"
              disabled={isLoading}
              onClick={() => setTargetAudience(preset)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-200 font-sans cursor-pointer ${
                targetAudience === preset
                  ? isDark
                    ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300 font-bold'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600 font-semibold'
                  : isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Speech Error Banner */}
      {speechErrorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{speechErrorMessage}</span>
        </div>
      )}

      {/* Mission statement */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <label htmlFor="mission" className={`block text-xs font-semibold font-sans transition-colors duration-300 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Company Mission & Core Purpose <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              id="voice-input-mission-btn"
              type="button"
              disabled={isLoading}
              onClick={() => toggleVoiceDictation('mission', mission, setMission, setIsListeningMission, isListeningMission)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold font-sans flex items-center gap-1.5 transition duration-200 cursor-pointer border ${
                isListeningMission
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse shadow-md'
                  : isDark
                    ? 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300 hover:text-white'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
              }`}
              title={isListeningMission ? "Stop voice dictation" : "Speak mission using Web Speech API"}
            >
              {isListeningMission ? (
                <>
                  <MicOff className="w-3 h-3 text-white animate-spin" />
                  <span>Listening... Click to Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3 text-indigo-500" />
                  <span>Voice Dictate</span>
                </>
              )}
            </button>

            <button
              id="mission-helper-btn"
              type="button"
              disabled={isLoading}
              onClick={() => setMission("To empower everyday citizens with access to hyper-efficient, clean solar energy units through an elegant, accessible subscription model, bringing clean energy independence to every neighborhood.")}
              className="text-[10px] text-indigo-500 hover:text-indigo-600 hover:underline flex items-center gap-1 font-sans cursor-pointer"
            >
              <Sparkles className="w-3 h-3" /> Sample Mission
            </button>
          </div>
        </div>

        {/* Listening Indicator Badge for Mission */}
        {isListeningMission && (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speak now — Transcribing speech directly into Mission statement...</span>
          </div>
        )}

        <textarea
          id="mission"
          required
          rows={3}
          placeholder="Describe what your company does, who it serves, and what core problems it solves. Speak or type your core mission."
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 resize-y font-sans ${
            isListeningMission ? 'border-rose-500 ring-2 ring-rose-500/30' : ''
          } ${
            isDark
              ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500'
              : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500'
          }`}
        />
      </div>

      {/* Brand Aesthetic / Directives */}
      <div className="space-y-2">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <label htmlFor="custom-instructions" className={`block text-xs font-semibold font-sans transition-colors duration-300 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Custom Brand Aesthetic / Styling Directives (Optional)
          </label>

          <button
            id="voice-input-custom-directives-btn"
            type="button"
            disabled={isLoading}
            onClick={() => toggleVoiceDictation('customInstructions', customInstructions, setCustomInstructions, setIsListeningCustom, isListeningCustom)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold font-sans flex items-center gap-1.5 transition duration-200 cursor-pointer border ${
              isListeningCustom
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse shadow-md'
                : isDark
                  ? 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300 hover:text-white'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
            }`}
            title={isListeningCustom ? "Stop voice dictation" : "Speak custom directives using Web Speech API"}
          >
            {isListeningCustom ? (
              <>
                <MicOff className="w-3 h-3 text-white animate-spin" />
                <span>Listening... Click to Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-3 h-3 text-indigo-500" />
                <span>Voice Dictate</span>
              </>
            )}
          </button>
        </div>

        {/* Listening Indicator Badge for Custom Instructions */}
        {isListeningCustom && (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speak now — Transcribing speech into Custom Styling Directives...</span>
          </div>
        )}

        <div className="relative">
          <Palette className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="custom-instructions"
            type="text"
            placeholder="e.g. Emerald & gold accents, warm, serene, vintage luxury"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 ${
              isListeningCustom ? 'border-rose-500 ring-2 ring-rose-500/30' : ''
            } ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500'
            }`}
          />
        </div>
        {/* Vibe Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {VIBE_PRESETS.map((preset) => (
            <button
              id={`vibe-preset-${preset.replace(/\s+/g, '-').toLowerCase()}`}
              key={preset}
              type="button"
              disabled={isLoading}
              onClick={() => setCustomInstructions(preset)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-200 font-sans cursor-pointer ${
                customInstructions === preset
                  ? isDark
                    ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300 font-bold'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600 font-semibold'
                  : isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Personality Spectrum Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <label htmlFor="brand-personality" className={`block text-xs font-semibold font-sans transition-colors duration-300 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Brand Personality Spectrum
          </label>

          <div className="flex items-center gap-2">
            <button
              id="open-personality-quiz-btn"
              type="button"
              disabled={isLoading}
              onClick={() => {
                setShowQuiz(!showQuiz);
                if (!showQuiz) {
                  handleResetQuiz();
                }
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-sans flex items-center gap-1 transition cursor-pointer border ${
                showQuiz
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : isDark
                    ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300 hover:bg-indigo-900/80'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              <HelpCircle className="w-3 h-3" />
              {showQuiz ? 'Hide Quiz' : 'Quiz: Find Personality'}
            </button>

            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300 px-2.5 py-0.5 rounded-full font-bold font-sans">
              {brandPersonality < 30 ? 'Minimalist / Professional' : brandPersonality > 70 ? 'Playful / Vibrant' : 'Balanced / Versatile'} ({brandPersonality}%)
            </span>
          </div>
        </div>

        {/* Interactive Scenario Quiz Card */}
        {showQuiz && (
          <div className={`p-4 border rounded-2xl transition-all duration-300 space-y-4 font-sans ${
            isDark ? 'bg-slate-950/90 border-indigo-900/50' : 'bg-indigo-50/40 border-indigo-200/80'
          }`}>
            <div className="flex items-center justify-between border-b pb-2 border-indigo-200/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span className={`text-xs font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-950'}`}>
                  Brand Personality Scenario Quiz
                </span>
              </div>
              
              {!quizCompleted && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold text-slate-400">
                    Question {quizStep + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                  <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-300" 
                      style={{ width: `${((quizStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {!quizCompleted ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 block mb-0.5">
                    {QUIZ_QUESTIONS[quizStep].scenario}
                  </span>
                  <h4 className={`text-xs sm:text-sm font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {QUIZ_QUESTIONS[quizStep].question}
                  </h4>
                </div>

                <div className="space-y-2">
                  {QUIZ_QUESTIONS[quizStep].options.map((opt, idx) => {
                    const isSelected = quizAnswers[quizStep] === opt.value;
                    return (
                      <button
                        key={idx}
                        id={`quiz-option-${quizStep}-${idx}`}
                        type="button"
                        onClick={() => handleSelectQuizOption(opt.value)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all duration-200 flex items-start justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : isDark
                              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-850'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <span className="font-medium leading-relaxed">{opt.text}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold shrink-0 uppercase tracking-wider font-mono ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300'
                        }`}>
                          {opt.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2 text-xs">
                  {quizStep > 0 ? (
                    <button
                      id="quiz-prev-btn"
                      type="button"
                      onClick={() => setQuizStep(quizStep - 1)}
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                  ) : <div />}

                  <button
                    id="quiz-reset-btn"
                    type="button"
                    onClick={handleResetQuiz}
                    className="text-[11px] text-slate-400 hover:text-indigo-500 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Quiz
                  </button>
                </div>
              </div>
            ) : (
              /* Quiz Completed Result Card */
              <div className="text-center py-2 space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                
                <div>
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Personality Profile Calculated!
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Based on your scenario responses, your brand aligns with a <span className="font-bold text-indigo-500">{brandPersonality}%</span> rating.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  isDark ? 'bg-slate-900 border-slate-800 text-indigo-300' : 'bg-white border-indigo-200 text-indigo-900'
                }`}>
                  {brandPersonality < 30 ? (
                    '👔 Executive / Minimalist — Clean, restrained, high-precision institutional presence.'
                  ) : brandPersonality > 70 ? (
                    '⚡ Playful & Vibrant — High-energy, expressive, conversational, and bold presence.'
                  ) : (
                    '⚖️ Balanced & Versatile — Approachable, modern, empathetic, and adaptable presence.'
                  )}
                </div>

                <p className="text-[10px] text-emerald-500 font-bold font-mono">
                  ✓ Spectrum slider updated to {brandPersonality}%
                </p>

                <div className="flex justify-center gap-2 pt-1">
                  <button
                    id="quiz-retake-btn"
                    type="button"
                    onClick={handleResetQuiz}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                  <button
                    id="quiz-close-btn"
                    type="button"
                    onClick={() => setShowQuiz(false)}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer font-sans"
                  >
                    Apply & Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="relative pt-1">
          <input
            id="brand-personality"
            type="range"
            min="0"
            max="100"
            value={brandPersonality}
            onChange={(e) => setBrandPersonality(parseInt(e.target.value, 10))}
            disabled={isLoading}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-all duration-200 bg-slate-200 dark:bg-slate-800"
            style={{
              background: `linear-gradient(to right, #6366f1 ${brandPersonality}%, ${isDark ? '#1e293b' : '#e2e8f0'} ${brandPersonality}%)`
            }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] text-slate-400 font-bold font-sans tracking-wide">
          <span className="uppercase">Minimalist & Prof</span>
          <span className="uppercase">Playful & Vibrant</span>
        </div>
      </div>

      {/* Advanced Logo Size Options */}
      <div className={`space-y-2 pt-2 border-t transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
        <div className="flex justify-between items-center">
          <label className={`text-xs font-semibold font-sans flex items-center gap-1 transition-colors duration-300 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Logo Image Output Quality
            <span className="text-[10px] text-slate-400 font-normal">(gemini-3-pro-image-preview)</span>
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['1K', '2K', '4K'] as const).map((size) => (
            <button
              id={`logo-size-btn-${size}`}
              key={size}
              type="button"
              disabled={isLoading}
              onClick={() => setLogoSize(size)}
              className={`py-2 text-xs font-medium border rounded-lg transition-all duration-200 font-mono flex flex-col items-center justify-center cursor-pointer ${
                logoSize === size
                  ? isDark
                    ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300 ring-1 ring-indigo-500'
                    : 'border-indigo-500 bg-indigo-50/50 text-indigo-600 ring-1 ring-indigo-500'
                  : isDark
                    ? 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span>{size}</span>
              <span className="text-[9px] text-slate-450 font-normal">
                {size === '1K' ? '1024 x 1024' : size === '2K' ? '2048 x 2048' : '4096 x 4096'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        id="generate-bible-submit-btn"
        type="submit"
        disabled={isLoading || !companyName || !mission}
        className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-semibold shadow-md shadow-indigo-100 disabled:opacity-50 disabled:shadow-none hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition duration-150 flex items-center justify-center gap-2 cursor-pointer font-sans"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing Mission & Generating Bible...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Brand Specification
          </>
        )}
      </button>
    </form>
  );
}
