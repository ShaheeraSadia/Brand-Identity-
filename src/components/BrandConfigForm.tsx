import React, { useState } from 'react';
import { Sparkles, Building2, Target, HelpCircle, Palette, Layers, Globe, Sliders } from 'lucide-react';

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

export default function BrandConfigForm({ onSubmit, isLoading, isDark = false }: BrandConfigFormProps) {
  const [companyName, setCompanyName] = useState('');
  const [mission, setMission] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [logoSize, setLogoSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [brandPersonality, setBrandPersonality] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !mission) return;
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

      {/* Mission statement */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label htmlFor="mission" className={`block text-xs font-semibold font-sans transition-colors duration-300 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Company Mission & Core Purpose <span className="text-rose-500">*</span>
          </label>
          <button
            id="mission-helper-btn"
            type="button"
            disabled={isLoading}
            onClick={() => setMission("To empower everyday citizens with access to hyper-efficient, clean solar energy units through an elegant, accessible subscription model, bringing clean energy independence to every neighborhood.")}
            className="text-[10px] text-indigo-500 hover:text-indigo-600 hover:underline flex items-center gap-1 font-sans cursor-pointer"
          >
            <Sparkles className="w-3 h-3" /> Use sample Clean Tech mission
          </button>
        </div>
        <textarea
          id="mission"
          required
          rows={3}
          placeholder="Describe what your company does, who it serves, and what core problems it solves. This forms the absolute semantic foundation for the generated brand aesthetic, logos, colors, and design guidelines."
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 resize-y font-sans ${
            isDark
              ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-indigo-500'
              : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500'
          }`}
        />
      </div>

      {/* Brand Aesthetic / Directives */}
      <div className="space-y-2">
        <label htmlFor="custom-instructions" className={`block text-xs font-semibold font-sans transition-colors duration-300 ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Custom Brand Aesthetic / Styling Directives (Optional)
        </label>
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
        <div className="flex justify-between items-center">
          <label htmlFor="brand-personality" className={`block text-xs font-semibold font-sans transition-colors duration-300 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Brand Personality Spectrum
          </label>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300 px-2.5 py-0.5 rounded-full font-bold font-sans">
            {brandPersonality < 30 ? 'Minimalist / Professional' : brandPersonality > 70 ? 'Playful / Vibrant' : 'Balanced / Versatile'} ({brandPersonality}%)
          </span>
        </div>
        
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
