import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Layers,
  Palette,
  Type,
  ShieldCheck,
  Zap,
  BookOpen,
  ArrowRight,
  Cpu,
  CheckCircle2,
  Globe,
  Sliders,
  Ruler,
  HelpCircle,
  BarChart3,
  Lightbulb,
  FileText
} from 'lucide-react';

interface AboutPageProps {
  key?: React.Key;
  isDark?: boolean;
  onNavigateToGenerator: () => void;
}

export default function AboutPage({ isDark = false, onNavigateToGenerator }: AboutPageProps) {
  const capabilities = [
    {
      icon: Palette,
      title: 'Cohesive Color Systems',
      description: 'Generates mathematically balanced 5-color palettes complete with semantic accessibility ratios and custom color roles.'
    },
    {
      icon: Type,
      title: 'Google Fonts Typographic Scaling',
      description: 'Pairs header and body Google Fonts automatically with major-second and perfect-fourth modular scale calculations.'
    },
    {
      icon: Sparkles,
      title: 'AI Mark & Logo Synthesis',
      description: 'Generates primary vector mark prompts and rasterized logo assets with multi-scale export capabilities.'
    },
    {
      icon: Sliders,
      title: 'Archetype & Voice Engineering',
      description: 'Defines brand personality traits, archetypes, tonal sliders, and copy guidelines tailored to target audiences.'
    },
    {
      icon: Ruler,
      title: 'Automated Usage Rules',
      description: 'Programmatically calculates logo clear space, surface adaptability matrices, and minimum scaling requirements.'
    },
    {
      icon: FileText,
      title: 'Multi-Format Export Engine',
      description: 'Exports complete Brand Specification PDFs, high-res PNG snapshots, vector SVGs, and developer JSON kits.'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Define Brand DNA',
      desc: 'Provide your company name, mission statement, target audience, and brand personality level.'
    },
    {
      step: '02',
      title: 'AI Synthesis',
      desc: 'Gemini 3.5 models analyze your prompt to generate a full brand bible, color palette, and vector logo.'
    },
    {
      step: '03',
      title: 'Refine & Export',
      desc: 'Interactively customize palettes, test social mockups with the AI consultant, and export PDF brand kits.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-12 font-sans max-w-6xl mx-auto py-4"
    >
      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 border transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Subtle background glow */}
        <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30 ${
          isDark ? 'bg-indigo-600' : 'bg-indigo-200'
        }`} />
        <div className={`absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isDark ? 'bg-purple-600' : 'bg-purple-200'
        }`} />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Brand Intelligence Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Architecting world-class brand identities in seconds with AI.
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            The <strong>Brand Identity Generator Suite</strong> turns company missions and audience profiles into complete, production-ready brand bibles. From color contrast ratios and Google Font pairs to AI logo marks, dynamic mockups, and PDF guidelines — every design decision is executed with mathematical precision.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              id="about-cta-start-btn"
              onClick={onNavigateToGenerator}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Generator Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Core Capabilities Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-500">
            Design Engineering
          </span>
          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Everything you need for a complete Brand Bible
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Built for startup founders, creative directors, design agencies, and brand strategists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl border transition-all duration-300 hover:shadow-md flex flex-col justify-between space-y-4 ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works Workflow */}
      <div className={`p-8 sm:p-10 rounded-3xl border transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="mb-8">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-500 block mb-1">
            Seamless Process
          </span>
          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            How the Brand Studio Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {workflowSteps.map((s, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 relative ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-2">
                <span className="text-xs font-mono font-black text-indigo-500 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 inline-block">
                  {s.step}
                </span>
                <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {s.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack & Quality Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-8 rounded-3xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Powered by Google AI Studio
            </h3>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Leveraging Gemini 3.5 Flash for high-speed structured brand JSON reasoning and Veo image preview endpoint pipelines for primary mark generation.
          </p>
          <ul className="space-y-2 text-xs font-medium">
            {[
              'Gemini 3.5 Pro & Flash model integration',
              'Real-time SVG vector geometry synthesis',
              'Server-side API routes for credential security',
              'High-fidelity PDF document renderer'
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`p-8 rounded-3xl border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Strict Design System Standards
            </h3>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Every color palette, typographic rule, and logo clear space specification adheres strictly to modern web and print accessibility standards.
          </p>
          <ul className="space-y-2 text-xs font-medium">
            {[
              'WCAG AA 4.5:1 legibility contrast checks',
              'Modular scale typography ratios',
              'Responsive multi-device mockup preview',
              '100% Client-side privacy & local storage saving'
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
