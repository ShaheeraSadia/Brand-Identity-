import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandBible } from '../types';
import { generateShareableUrl, encodeBrandBibleToHash } from '../utils/share';
import { Share2, Check, Copy, ExternalLink, X, Globe, Hash, Sparkles } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bible: BrandBible;
  isDark?: boolean;
}

export function ShareLinkModal({ isOpen, onClose, bible, isDark = false }: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = generateShareableUrl(bible);
  const hashString = encodeBrandBibleToHash(bible);

  const handleCopy = async () => {
    try {
      // Update hash in browser
      window.location.hash = `share=${hashString}`;
      window.history.replaceState(null, '', `#share=${hashString}`);

      let done = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          done = true;
        } catch {
          // fallback
        }
      }
      if (!done) {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border font-sans z-10 transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Shareable Link</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Encoded active Brand Bible in URL hash
                </p>
              </div>
            </div>
            <button
              id="close-share-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="mt-5 space-y-5">
            {/* Brand Summary Pill */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                {bible.companyName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black truncate">{bible.companyName}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                  "{bible.mission}"
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  {bible.colorPalette.slice(0, 5).map((color, idx) => (
                    <span
                      key={idx}
                      className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: color.hex }}
                      title={`${color.name}: ${color.hex}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* URL Display and Copy */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Shareable URL (With Base64 Hash)
              </label>
              <div className={`p-2.5 rounded-2xl border flex items-center gap-2 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/80 border-slate-200'
              }`}>
                <Hash className="w-4 h-4 text-indigo-500 shrink-0 ml-1" />
                <input
                  id="shareable-url-input"
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="bg-transparent text-xs font-mono w-full text-slate-700 dark:text-slate-300 focus:outline-hidden truncate"
                />
                <button
                  id="copy-share-modal-url-btn"
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Info notice */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
              isDark ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-300' : 'bg-indigo-50/70 border-indigo-100 text-indigo-900'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>How This Shareable Link Works</span>
              </div>
              <p className="text-[11px] opacity-90">
                The entire active Brand Bible (colors, typography, mission, archetype, guidelines) is serialized and encoded directly into the <code className="font-mono font-bold bg-indigo-200/50 dark:bg-indigo-900/50 px-1 py-0.5 rounded">#share=...</code> hash.
              </p>
              <p className="text-[11px] opacity-90">
                Anyone visiting this link will immediately reconstruct your complete creation with zero database dependencies.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="modal-primary-copy-btn"
                onClick={handleCopy}
                className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Shareable Link'}</span>
              </button>

              <a
                id="modal-open-share-link-btn"
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Link in New Tab</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
