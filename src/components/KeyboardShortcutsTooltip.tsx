import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Command, Save, Monitor, RefreshCw, FileText, Share2, HelpCircle, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KeyboardShortcutsTooltipProps {
  isDark: boolean;
  onTriggerSave?: () => void;
  onTriggerMockups?: () => void;
  onTriggerRegenerateLogo?: () => void;
  onTriggerExportPdf?: () => void;
  onTriggerShareLink?: () => void;
  activeBibleName?: string;
  externalFeedback?: string | null;
}

export function KeyboardShortcutsTooltip({
  isDark,
  onTriggerSave,
  onTriggerMockups,
  onTriggerRegenerateLogo,
  onTriggerExportPdf,
  onTriggerShareLink,
  activeBibleName,
  externalFeedback,
}: KeyboardShortcutsTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [activeShortcutKey, setActiveShortcutKey] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Detect macOS platform
    if (typeof window !== 'undefined' && window.navigator?.userAgent) {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(window.navigator.userAgent));
    }
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Flash active shortcut indicator when external feedback triggers
  useEffect(() => {
    if (externalFeedback) {
      if (externalFeedback.toLowerCase().includes('save')) {
        setActiveShortcutKey('save');
      } else if (externalFeedback.toLowerCase().includes('mockup') || externalFeedback.toLowerCase().includes('view')) {
        setActiveShortcutKey('mockups');
      } else if (externalFeedback.toLowerCase().includes('logo')) {
        setActiveShortcutKey('logo');
      } else if (externalFeedback.toLowerCase().includes('pdf')) {
        setActiveShortcutKey('export');
      }
      const t = setTimeout(() => setActiveShortcutKey(null), 2000);
      return () => clearTimeout(t);
    }
  }, [externalFeedback]);

  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcutsList = [
    {
      id: 'save',
      label: 'Save Brand Bible',
      description: 'Persist current brand specs to saved history & local storage',
      keys: [modKey, 'S'],
      icon: Save,
      color: 'text-emerald-500',
      action: onTriggerSave,
    },
    {
      id: 'mockups',
      label: 'Toggle Mockups',
      description: 'Toggle between Brand Bible spec and Dynamic Applications',
      keys: [modKey, 'M'],
      icon: Monitor,
      color: 'text-indigo-500',
      action: onTriggerMockups,
    },
    {
      id: 'logo',
      label: 'Regenerate Logo',
      description: 'Trigger AI model to synthesize a fresh primary brand logo',
      keys: [modKey, 'G'],
      icon: RefreshCw,
      color: 'text-purple-500',
      action: onTriggerRegenerateLogo,
    },
    {
      id: 'export',
      label: 'Export PDF Book',
      description: 'Open full-vector multi-page Brand Bible PDF export dialog',
      keys: [modKey, 'E'],
      icon: FileText,
      color: 'text-blue-500',
      action: onTriggerExportPdf,
    },
    {
      id: 'share',
      label: 'Shareable Link',
      description: 'Encode brand into URL hash and copy share link to clipboard',
      keys: [modKey, 'Shift', 'L'],
      icon: Share2,
      color: 'text-amber-500',
      action: onTriggerShareLink,
    },
    {
      id: 'help',
      label: 'Toggle Shortcuts',
      description: 'Show or hide this keyboard shortcuts reference guide',
      keys: ['?'],
      icon: HelpCircle,
      color: 'text-slate-400',
      action: () => setIsOpen(prev => !prev),
    },
  ];

  return (
    <div className="relative inline-block font-sans">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        id="shortcuts-info-tooltip-btn"
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer select-none ${
          isOpen
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
            : isDark
            ? 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/90'
            : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
        }`}
        title={`Keyboard Shortcuts (${modKey}+S, ${modKey}+M, ${modKey}+G, ?)`}
        aria-label="Keyboard Shortcuts"
      >
        <Keyboard className={`w-3.5 h-3.5 ${isOpen ? 'text-white' : 'text-indigo-500'}`} />
        <span className="hidden md:inline">Shortcuts</span>
        <kbd
          className={`hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-black border transition-colors ${
            isOpen
              ? 'bg-indigo-700/80 border-indigo-400 text-indigo-100'
              : isDark
              ? 'bg-slate-900 border-slate-700 text-slate-400'
              : 'bg-white border-slate-300 text-slate-500 shadow-2xs'
          }`}
        >
          {modKey}+K / ?
        </kbd>
      </button>

      {/* Popover / Tooltip Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            id="shortcuts-tooltip-popover"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 p-4 font-sans backdrop-blur-xl ${
              isDark
                ? 'bg-slate-900/98 border-slate-700/90 text-slate-100 shadow-slate-950/60 ring-1 ring-white/10'
                : 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-200/80 ring-1 ring-black/5'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Command className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-tight flex items-center gap-1.5">
                    <span>Keyboard Shortcuts</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80">
                      Global
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400">
                    {activeBibleName ? `Active on: ${activeBibleName}` : 'Available across all studio views'}
                  </p>
                </div>
              </div>
              <button
                id="close-shortcuts-popover-btn"
                type="button"
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                }`}
                title="Close shortcuts panel (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Feedback banner if active */}
            {externalFeedback && (
              <div className="mt-2.5 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-2 bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 shrink-0 animate-spin" />
                <span className="truncate">{externalFeedback}</span>
              </div>
            )}

            {/* Shortcuts Items List */}
            <div className="mt-3 space-y-1.5">
              {shortcutsList.map((item) => {
                const isItemTriggered = activeShortcutKey === item.id;
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      }
                    }}
                    className={`p-2 rounded-xl transition-all duration-150 flex items-center justify-between gap-3 group cursor-pointer border ${
                      isItemTriggered
                        ? 'bg-indigo-500/20 border-indigo-400 dark:border-indigo-500 scale-[1.02]'
                        : isDark
                        ? 'border-transparent hover:bg-slate-800/70 hover:border-slate-700'
                        : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                        } ${item.color}`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {isItemTriggered && (
                            <span className="text-[9px] font-black text-indigo-500 animate-pulse">
                              Executed!
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                          {item.description}
                        </div>
                      </div>
                    </div>

                    {/* Key combo badge */}
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, i) => (
                        <React.Fragment key={i}>
                          <kbd
                            className={`px-2 py-1 rounded-md text-[10px] font-mono font-black border shadow-2xs ${
                              isDark
                                ? 'bg-slate-800 border-slate-700 text-slate-200 shadow-slate-950/40'
                                : 'bg-white border-slate-300 text-slate-700 shadow-slate-200/50'
                            }`}
                          >
                            {k}
                          </kbd>
                          {i < item.keys.length - 1 && (
                            <span className="text-[10px] text-slate-400 font-mono">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tooltip Footer tip */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-400">
              <span>Press <kbd className="font-mono font-bold">Esc</kbd> to close</span>
              <span>Click any action to execute</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
