import React, { useState, useEffect } from 'react';
import { Sparkles, Info, ShieldCheck, Check, ExternalLink, Settings } from 'lucide-react';

export interface AdBannerProps {
  id?: string;
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'leaderboard';
  isDark?: boolean;
  className?: string;
}

export default function AdBanner({
  id = 'adsense-banner-slot',
  slotId = '1234567890',
  format = 'horizontal',
  isDark = false,
  className = ''
}: AdBannerProps) {
  const [publisherId, setPublisherId] = useState<string>(() => {
    try {
      return localStorage.getItem('brand_suite_adsense_pub_id') || '';
    } catch {
      return '';
    }
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempPubId, setTempPubId] = useState(publisherId);
  const [copiedAdsTxt, setCopiedAdsTxt] = useState(false);

  // Initialize real Google AdSense if publisherId is set
  useEffect(() => {
    if (publisherId && typeof window !== 'undefined') {
      try {
        // Check if script exists
        const scriptId = 'google-adsense-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.async = true;
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
            publisherId
          )}`;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }

        // Push ad unit
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense initialization notice:', e);
      }
    }
  }, [publisherId, slotId]);

  const handleSavePubId = () => {
    try {
      localStorage.setItem('brand_suite_adsense_pub_id', tempPubId.trim());
      setPublisherId(tempPubId.trim());
      setShowConfigModal(false);
    } catch {}
  };

  const adsTxtSnippet = `google.com, ${publisherId || 'pub-0000000000000000'}, DIRECT, f08c47fec0942fa0`;

  return (
    <div id={id} className={`w-full my-6 font-sans ${className}`}>
      {/* Mandatory Google AdSense Placement Label */}
      <div className="flex items-center justify-between mb-1.5 px-2">
        <span className="text-[9px] uppercase tracking-widest font-extrabold text-slate-400">
          Advertisement
        </span>
        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="text-[9px] font-bold text-slate-400 hover:text-indigo-500 flex items-center gap-1 transition cursor-pointer"
          title="Google AdSense Configuration & Verification"
        >
          <Settings className="w-3 h-3" />
          <span>AdSense Ready</span>
        </button>
      </div>

      {/* Ad Container */}
      <div
        className={`w-full rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col items-center justify-center relative min-h-[90px] ${
          isDark
            ? 'bg-slate-900/60 border-slate-800 text-slate-300'
            : 'bg-slate-50/80 border-slate-200 text-slate-600'
        }`}
      >
        {publisherId ? (
          // Live Google AdSense Unit
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '90px' }}
            data-ad-client={publisherId}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          // AdSense Compliant Banner Placeholder
          <div className="py-4 px-6 text-center space-y-1.5 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Google AdSense Approved Placement Slot</span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              High-value programmatic ad display area. Labeled and formatted according to Google AdSense Quality &amp; Placement policies.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Configure Your Publisher ID (ca-pub-...)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AdSense Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 sm:p-8 space-y-5 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-black tracking-tight">Google AdSense Integration &amp; Setup</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 cursor-pointer text-base font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              This application has been engineered to pass Google AdSense verification with compliance pages, ads.txt, robots.txt, and labeled ad slots.
            </p>

            {/* Checklist */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">AdSense Approval Checklist:</div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>GDPR &amp; CCPA Privacy Policy with DoubleClick disclosures</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Terms of Service with commercial IP rights</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>EU User Consent / Cookie Notice Banner</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Crawlable robots.txt for Googlebot &amp; Mediapartners-Google</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Standard ads.txt in public root folder</span>
              </div>
            </div>

            {/* Publisher ID Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold">Google AdSense Publisher Client ID</label>
              <input
                type="text"
                value={tempPubId}
                onChange={(e) => setTempPubId(e.target.value)}
                placeholder="ca-pub-1234567890123456"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              <p className="text-[10px] text-slate-400">
                Found in your Google AdSense account under <em>Account &gt; Settings &gt; Publisher ID</em>.
              </p>
            </div>

            {/* ads.txt helper */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Your ads.txt entry</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(adsTxtSnippet);
                    setCopiedAdsTxt(true);
                    setTimeout(() => setCopiedAdsTxt(false), 2000);
                  }}
                  className="text-indigo-500 hover:underline text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedAdsTxt ? 'Copied!' : 'Copy snippet'}
                </button>
              </div>
              <pre className="p-2.5 rounded-xl bg-slate-950 text-slate-300 text-[10px] font-mono border border-slate-800 overflow-x-auto">
                {adsTxtSnippet}
              </pre>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePubId}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Save Publisher ID
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
