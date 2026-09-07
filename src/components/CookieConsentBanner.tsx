import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, ShieldCheck, Check, X, Settings } from 'lucide-react';

interface CookieConsentBannerProps {
  isDark?: boolean;
  onOpenPrivacyPolicy: () => void;
}

export default function CookieConsentBanner({ isDark = false, onOpenPrivacyPolicy }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [adPersonalizationConsent, setAdPersonalizationConsent] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('brand_suite_cookie_consent');
      if (!stored) {
        // Delay display slightly so it doesn't jarringly block initial render
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('brand_suite_cookie_consent', JSON.stringify({
        essential: true,
        analytics: true,
        advertising: true,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    try {
      localStorage.setItem('brand_suite_cookie_consent', JSON.stringify({
        essential: true,
        analytics: false,
        advertising: false,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    try {
      localStorage.setItem('brand_suite_cookie_consent', JSON.stringify({
        essential: true,
        analytics: analyticsConsent,
        advertising: adPersonalizationConsent,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 font-sans"
      >
        <div
          className={`p-5 rounded-3xl border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            isDark
              ? 'bg-slate-900/95 border-slate-700/80 text-white shadow-black/80'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/80'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black tracking-tight">Cookie &amp; Advertising Consent</h3>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">EU &amp; CCPA</span>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                We and our advertising partner (<strong>Google AdSense</strong>) use cookies to personalize content, measure traffic, and serve relevant advertisements in accordance with Google&apos;s EU User Consent policy.
              </p>

              {/* Custom Settings Drawer */}
              {showSettings && (
                <div className="pt-2 pb-1 space-y-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">Essential Cookies</div>
                      <div className="text-[10px] text-slate-400">Required for brand storage &amp; themes</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-500">Always On</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">Ad Personalization (Google)</div>
                      <div className="text-[10px] text-slate-400">DoubleClick &amp; AdSense relevant ads</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={adPersonalizationConsent}
                      onChange={(e) => setAdPersonalizationConsent(e.target.checked)}
                      className="accent-indigo-600 cursor-pointer h-4 w-4"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  id="cookie-accept-all-btn"
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition cursor-pointer shadow-xs"
                >
                  Accept All
                </button>

                <button
                  id="cookie-reject-non-essential-btn"
                  onClick={handleRejectNonEssential}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  Essential Only
                </button>

                {showSettings ? (
                  <button
                    onClick={handleSaveCustom}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-indigo-500 hover:underline cursor-pointer"
                  >
                    Save Preferences
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer ml-auto"
                    title="Customize Cookies"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onOpenPrivacyPolicy}
                  className="text-[10px] text-slate-400 hover:underline cursor-pointer ml-auto"
                >
                  Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
