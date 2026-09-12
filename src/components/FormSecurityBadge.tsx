import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Bot,
  Code2,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  RefreshCw,
  EyeOff
} from 'lucide-react';
import { analyzeInputThreats } from '../utils/security';

interface FormSecurityBadgeProps {
  isDark?: boolean;
  blockedThreatsCount?: number;
  lastThreatSanitized?: string | null;
  className?: string;
  variant?: 'compact' | 'full';
}

export default function FormSecurityBadge({
  isDark = false,
  blockedThreatsCount = 0,
  lastThreatSanitized = null,
  className = '',
  variant = 'compact'
}: FormSecurityBadgeProps) {
  const [showModal, setShowModal] = useState(false);
  const [demoInput, setDemoInput] = useState("<script>alert('HACKED!')</script>");
  const [demoResult, setDemoResult] = useState<{ hasThreat: boolean; threats: string[]; sanitized: string } | null>(null);

  const handleTestDemo = () => {
    const analysis = analyzeInputThreats(demoInput);
    setDemoResult({
      hasThreat: analysis.hasThreat,
      threats: analysis.threatTypes,
      sanitized: analysis.sanitized
    });
  };

  return (
    <>
      {/* Visual Badge */}
      <div
        id="form-security-status-badge"
        className={`inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer select-none ${
          isDark
            ? 'bg-slate-950/80 border-emerald-900/40 text-emerald-300 hover:border-emerald-700/60'
            : 'bg-emerald-50/90 border-emerald-200 text-emerald-800 hover:border-emerald-300'
        } ${className}`}
        onClick={() => setShowModal(true)}
        title="Form is actively protected against hackers, bots, and injection attacks. Click to inspect security status."
      >
        <div className="flex items-center gap-1.5 font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Hacker &amp; Bot Defense Active</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] opacity-75 border-l pl-2 border-emerald-500/20">
          <span>Honeypot Trap</span>
          <span>•</span>
          <span>XSS Filter</span>
          <span>•</span>
          <span>Rate Limited</span>
        </div>

        {blockedThreatsCount > 0 && (
          <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
            {blockedThreatsCount} Neutralized
          </span>
        )}
      </div>

      {/* Security Details Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-6 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">Form Security &amp; Anti-Hacker Shield</h3>
                    <p className="text-xs text-slate-400">Multi-layer defense protecting user data &amp; system integrity</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-500/10 transition text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active Shields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3 rounded-2xl border space-y-1 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Bot Honeypot Trap</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Invisible decoy inputs silently catch and immediately reject automated bot and web scraper submissions.
                  </p>
                </div>

                <div className={`p-3 rounded-2xl border space-y-1 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>XSS &amp; HTML Stripper</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Strips &lt;script&gt;, javascript: URIs, inline event handlers (onload, onerror), and angle bracket injection.
                  </p>
                </div>

                <div className={`p-3 rounded-2xl border space-y-1 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Flood &amp; Rate Limiter</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Sliding window limiter blocks automated macro spam, double-clicks, and brute-force DDoS payload attempts.
                  </p>
                </div>

                <div className={`p-3 rounded-2xl border space-y-1 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Prompt &amp; SQL Armor</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Guards LLM system instructions against jailbreak overrides, prototype pollution, and SQL delimiter escapes.
                  </p>
                </div>
              </div>

              {/* Status Alert if recent threat intercepted */}
              {lastThreatSanitized && (
                <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Recent Threat Neutralized: </span>
                    <span className="text-amber-400 font-mono text-[11px]">{lastThreatSanitized}</span>
                  </div>
                </div>
              )}

              {/* Interactive Defense Test Sandbox */}
              <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    Interactive Anti-Hacker Sandbox Demo
                  </span>
                  <button
                    onClick={handleTestDemo}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Test Defense
                  </button>
                </div>

                <input
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="Paste a hacker payload to test sanitization..."
                  className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono transition focus:outline-hidden ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />

                {demoResult && (
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Threat Detected:</span>
                      {demoResult.hasThreat ? (
                        <span className="text-rose-500 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {demoResult.threats.join(', ')}
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          None (Safe Payload)
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Sanitized Result:</span>
                      <div className={`p-2 rounded-lg border mt-1 text-[11px] truncate ${
                        isDark ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-white border-slate-200 text-emerald-700'
                      }`}>
                        {demoResult.sanitized || '<empty / completely neutralized>'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
