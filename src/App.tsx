import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandBible } from './types';
import { safeFetchJson } from './utils/api';
import { SAMPLE_BRAND_BIBLES } from './utils/sampleData';
import { decodeBrandBibleFromHash, encodeBrandBibleToHash, generateShareableUrl } from './utils/share';
import BrandConfigForm from './components/BrandConfigForm';
import BrandBibleDashboard from './components/BrandBibleDashboard';
import BrandMockups from './components/BrandMockups';
import ConsultantChat from './components/ConsultantChat';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import { PdfExportModal } from './components/PdfExportModal';
import { ShareLinkModal } from './components/ShareLinkModal';
import { KeyboardShortcutsTooltip } from './components/KeyboardShortcutsTooltip';
import { Sparkles, Layers, BookOpen, Clock, AlertCircle, Trash2, Check, RefreshCw, FileText, Monitor, Briefcase, Sun, Moon, Palette, Type, Compass, Zap, Plus, Info, Mail, Mic, Share2, Keyboard } from 'lucide-react';

export default function App() {
  const [activeBible, setActiveBible] = useState<BrandBible | null>(null);
  const [showPdfExportModal, setShowPdfExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [headerShareCopied, setHeaderShareCopied] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceCommandFeedback, setVoiceCommandFeedback] = useState<string | null>(null);
  const voiceRecognitionRef = React.useRef<any>(null);
  const [shortcutFeedback, setShortcutFeedback] = useState<{ message: string; keyBadge?: string } | null>(null);
  const shortcutFeedbackTimerRef = React.useRef<any>(null);

  const triggerShortcutFeedback = (message: string, keyBadge?: string) => {
    if (shortcutFeedbackTimerRef.current) clearTimeout(shortcutFeedbackTimerRef.current);
    setShortcutFeedback({ message, keyBadge });
    shortcutFeedbackTimerRef.current = setTimeout(() => {
      setShortcutFeedback(null);
    }, 2800);
  };

  const isMac = typeof window !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator?.userAgent || '');
  const [savedBibles, setSavedBibles] = useState<BrandBible[]>([]);
  const [isLoadingBible, setIsLoadingBible] = useState(false);
  const [isLoadingLogo, setIsLoadingLogo] = useState(false);
  const [logoSize, setLogoSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [error, setError] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'bible' | 'mockups'>('bible');
  const [activeViewPage, setActiveViewPage] = useState<'studio' | 'about' | 'contact'>('studio');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('brand_generator_theme');
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  // Voice-controlled theme switching listener
  const toggleVoiceThemeListener = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setVoiceCommandFeedback('Web Speech API is not supported in this browser.');
      setTimeout(() => setVoiceCommandFeedback(null), 4000);
      return;
    }

    if (isVoiceListening) {
      if (voiceRecognitionRef.current) {
        try {
          voiceRecognitionRef.current.stop();
        } catch {}
      }
      setIsVoiceListening(false);
      setVoiceCommandFeedback(null);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setVoiceCommandFeedback('Listening for voice commands: "switch to dark mode" or "switch to light mode"...');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript.toLowerCase() + ' ';
        }

        if (
          transcript.includes('switch to dark mode') ||
          transcript.includes('turn on dark mode') ||
          transcript.includes('enable dark mode') ||
          transcript.includes('activate dark mode') ||
          transcript.includes('dark mode') ||
          transcript.includes('dark theme') ||
          transcript.includes('set theme to dark')
        ) {
          setIsDark(true);
          setVoiceCommandFeedback('Voice command recognized: Switched to Dark Mode');
          setTimeout(() => setVoiceCommandFeedback(null), 3500);
        } else if (
          transcript.includes('switch to light mode') ||
          transcript.includes('turn on light mode') ||
          transcript.includes('enable light mode') ||
          transcript.includes('activate light mode') ||
          transcript.includes('light mode') ||
          transcript.includes('light theme') ||
          transcript.includes('set theme to light')
        ) {
          setIsDark(false);
          setVoiceCommandFeedback('Voice command recognized: Switched to Light Mode');
          setTimeout(() => setVoiceCommandFeedback(null), 3500);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Voice command recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceCommandFeedback('Microphone access denied. Please allow microphone permissions.');
        } else if (event.error !== 'no-speech') {
          setVoiceCommandFeedback(`Voice listener notice: ${event.error}`);
        }
        setIsVoiceListening(false);
        setTimeout(() => setVoiceCommandFeedback(null), 4000);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      voiceRecognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start voice listener:', err);
      setVoiceCommandFeedback('Could not start voice listener.');
      setIsVoiceListening(false);
      setTimeout(() => setVoiceCommandFeedback(null), 3500);
    }
  };

  // Listen to cross-component voice theme commands (e.g. from ConsultantChat)
  useEffect(() => {
    const handleVoiceEvent = (e: any) => {
      const mode = e.detail;
      if (mode === 'dark') {
        setIsDark(true);
        setVoiceCommandFeedback('Voice command recognized: Switched to Dark Mode');
        setTimeout(() => setVoiceCommandFeedback(null), 3500);
      } else if (mode === 'light') {
        setIsDark(false);
        setVoiceCommandFeedback('Voice command recognized: Switched to Light Mode');
        setTimeout(() => setVoiceCommandFeedback(null), 3500);
      }
    };
    window.addEventListener('app-voice-theme-command', handleVoiceEvent);
    return () => window.removeEventListener('app-voice-theme-command', handleVoiceEvent);
  }, []);

  // Sync dark mode preference with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('brand_generator_theme', isDark ? 'dark' : 'light');
    } catch (err) {
      console.error("Error writing theme to local storage:", err);
    }
  }, [isDark]);

  // Load saved bibles from LocalStorage & URL hash on mount
  useEffect(() => {
    let localBibles: BrandBible[] = [];
    try {
      const stored = localStorage.getItem('brand_bibles_history');
      if (stored) {
        localBibles = JSON.parse(stored) as BrandBible[];
        setSavedBibles(localBibles);
      }
    } catch (err) {
      console.error("Error reading saved brand bibles from local storage:", err);
    }

    const parseAndSelectFromHash = () => {
      const hash = window.location.hash;
      if (!hash) {
        if (localBibles.length > 0) {
          setActiveBible(prev => prev || localBibles[0]);
        }
        return;
      }

      // 1. Encoded brand bible in hash: #share=...
      if (hash.includes('share=')) {
        const rawData = hash.split('share=')[1];
        if (rawData) {
          const decoded = decodeBrandBibleFromHash(rawData);
          if (decoded) {
            saveBibleToStorage(decoded);
            setActiveBible(decoded);
            return;
          }
        }
      }

      // 2. Direct ID in hash: #brand=xyz or #xyz
      const cleanHash = hash.replace(/^#/, '');
      const idMatch = cleanHash.startsWith('brand=') ? cleanHash.replace('brand=', '') : cleanHash;
      if (idMatch) {
        const foundInSaved = localBibles.find(b => b.id === idMatch);
        if (foundInSaved) {
          setActiveBible(foundInSaved);
          return;
        }
        const foundInSample = SAMPLE_BRAND_BIBLES.find(b => b.id === idMatch);
        if (foundInSample) {
          setActiveBible(foundInSample);
          return;
        }
      }

      // Fallback
      if (localBibles.length > 0) {
        setActiveBible(prev => prev || localBibles[0]);
      }
    };

    parseAndSelectFromHash();

    window.addEventListener('hashchange', parseAndSelectFromHash);
    return () => window.removeEventListener('hashchange', parseAndSelectFromHash);
  }, []);

  // Sync current active brand ID to URL hash when selected
  useEffect(() => {
    if (activeBible?.id && !window.location.hash.includes('share=')) {
      window.history.replaceState(null, '', `#brand=${activeBible.id}`);
    }
  }, [activeBible?.id]);

  // Sync active typography font sheets dynamically to document head
  useEffect(() => {
    if (activeBible?.typography) {
      const { headerFont, bodyFont } = activeBible.typography;
      const fontsToLoad: string[] = [];
      if (headerFont) fontsToLoad.push(headerFont.replace(/ /g, '+'));
      if (bodyFont) fontsToLoad.push(bodyFont.replace(/ /g, '+'));

      if (fontsToLoad.length > 0) {
        const linkId = 'brand-dynamic-font-loader';
        let link = document.getElementById(linkId) as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
        link.href = `https://fonts.googleapis.com/css2?family=${fontsToLoad.join('&family=')}:wght@400;500;600;700;800&display=swap`;
      }
    }
  }, [activeBible?.id, activeBible?.typography]);

  // Helper to save a Brand Bible to the list and LocalStorage
  const saveBibleToStorage = (updatedBible: BrandBible) => {
    setSavedBibles(prev => {
      const index = prev.findIndex(b => b.id === updatedBible.id);
      let newBibles = [...prev];
      if (index >= 0) {
        newBibles[index] = updatedBible;
      } else {
        newBibles = [updatedBible, ...newBibles];
      }
      localStorage.setItem('brand_bibles_history', JSON.stringify(newBibles));
      return newBibles;
    });
    setActiveBible(updatedBible);
  };

  // 1. Core Generator Handler
  const handleGenerateBible = async (formData: {
    companyName: string;
    mission: string;
    industry: string;
    targetAudience: string;
    customInstructions: string;
    logoSize: '1K' | '2K' | '4K';
    brandPersonality: number;
  }) => {
    setIsLoadingBible(true);
    setIsLoadingLogo(true);
    setError(null);
    setLogoSize(formData.logoSize);

    try {
      // Step A: Generate Structured Bible Specifications
      const generatedSpec = await safeFetchJson('/api/brand/generate-bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const newBible: BrandBible = {
        ...generatedSpec,
        id: `bible-${Date.now()}`,
        createdAt: new Date().toLocaleDateString(),
        brandPersonality: formData.brandPersonality
      };

      // Set intermediate active Bible so text, palette & typography load instantly
      setActiveBible(newBible);
      setIsLoadingBible(false); // Specs are done!

      // Step B: Auto-synthesize Primary Logo Image in the background
      console.log("Triggering auto-synthesis of brand logo:", newBible.logoPrompt);
      try {
        const logoData = await safeFetchJson('/api/brand/generate-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: newBible.logoPrompt,
            size: formData.logoSize
          })
        });

        const completeBible: BrandBible = {
          ...newBible,
          primaryLogo: logoData.imageUrl,
          previousLogos: [logoData.imageUrl]
        };

        // Save to persistence
        saveBibleToStorage(completeBible);
      } catch (logoErr: any) {
        console.warn("Logo synthesis failed:", logoErr);
        // Still save specs even if logo generation errored
        saveBibleToStorage(newBible);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate Brand specification.");
    } finally {
      setIsLoadingBible(false);
      setIsLoadingLogo(false);
    }
  };

  // 2. Custom Logo Regeneration Handler
  const handleRegenerateLogo = async (customPrompt?: string) => {
    if (!activeBible) return;
    setIsLoadingLogo(true);
    setError(null);

    const promptToUse = customPrompt || activeBible.logoPrompt;

    try {
      const data = await safeFetchJson('/api/brand/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          size: logoSize
        })
      });

      const currentPrev = activeBible.previousLogos || (activeBible.primaryLogo ? [activeBible.primaryLogo] : []);
      const updatedBible: BrandBible = {
        ...activeBible,
        logoPrompt: promptToUse,
        primaryLogo: data.imageUrl,
        previousLogos: currentPrev.includes(data.imageUrl) ? currentPrev : [...currentPrev, data.imageUrl]
      };

      saveBibleToStorage(updatedBible);
    } catch (err: any) {
      console.error(err);
      setError(`Logo generation failed: ${err.message}`);
    } finally {
      setIsLoadingLogo(false);
    }
  };

  const handleDeleteBible = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedBibles(prev => {
      const updated = prev.filter(b => b.id !== id);
      localStorage.setItem('brand_bibles_history', JSON.stringify(updated));
      if (activeBible?.id === id) {
        setActiveBible(updated.length > 0 ? updated[0] : null);
      }
      return updated;
    });
  };

  // Global Keyboard Shortcuts (Ctrl+S: Save, Ctrl+M: Toggle Mockups, Ctrl+G: Regenerate Logo, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      const isModifier = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const modLabel = isMac ? '⌘' : 'Ctrl';

      // 1. Ctrl+S: Save active Brand Bible
      if (isModifier && key === 's') {
        e.preventDefault();
        if (activeBible) {
          saveBibleToStorage(activeBible);
          triggerShortcutFeedback(`Saved "${activeBible.companyName}" to Local Storage`, `${modLabel}+S`);
        } else {
          triggerShortcutFeedback('No active brand to save yet. Generate or load a brand first.', `${modLabel}+S`);
        }
        return;
      }

      // 2. Ctrl+M: Toggle mockups view
      if (isModifier && key === 'm') {
        e.preventDefault();
        if (activeBible) {
          setActiveViewPage('studio');
          setActiveMainTab(prev => {
            const next = prev === 'mockups' ? 'bible' : 'mockups';
            triggerShortcutFeedback(
              `Switched to ${next === 'mockups' ? 'Dynamic Mockups' : 'Brand Bible Dashboard'}`,
              `${modLabel}+M`
            );
            return next;
          });
        } else {
          triggerShortcutFeedback('Select or generate a brand first to view mockups.', `${modLabel}+M`);
        }
        return;
      }

      // 3. Ctrl+G: Regenerate logo
      if (isModifier && key === 'g') {
        e.preventDefault();
        if (activeBible) {
          if (!isLoadingLogo) {
            triggerShortcutFeedback(`Regenerating AI Brand Logo for "${activeBible.companyName}"...`, `${modLabel}+G`);
            handleRegenerateLogo();
          } else {
            triggerShortcutFeedback('Logo is currently generating. Please wait a moment...', `${modLabel}+G`);
          }
        } else {
          triggerShortcutFeedback('No active brand to regenerate logo for.', `${modLabel}+G`);
        }
        return;
      }

      // 4. Ctrl+E: Export PDF Book modal
      if (isModifier && key === 'e') {
        e.preventDefault();
        if (activeBible) {
          setShowPdfExportModal(true);
          triggerShortcutFeedback('Opened Brand Specification PDF Export', `${modLabel}+E`);
        }
        return;
      }

      // 5. Ctrl+Shift+L: Share link
      if (isModifier && e.shiftKey && key === 'l') {
        e.preventDefault();
        if (activeBible) {
          setShowShareModal(true);
          triggerShortcutFeedback('Opened Shareable Link Modal', `${modLabel}+Shift+L`);
        }
        return;
      }

      // 6. '?' key or Ctrl+K: Toggle shortcuts info tooltip/popover
      if ((key === '?' || (isModifier && key === 'k')) && !isInput) {
        e.preventDefault();
        const shortcutBtn = document.getElementById('shortcuts-info-tooltip-btn');
        if (shortcutBtn) {
          shortcutBtn.click();
        }
        return;
      }

      // 7. Escape: close modals and popovers
      if (e.key === 'Escape') {
        setShowPdfExportModal(false);
        setShowShareModal(false);
        const closeBtn = document.getElementById('close-shortcuts-popover-btn');
        if (closeBtn) {
          closeBtn.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBible, isLoadingLogo, isMac]);

  return (
    <div id="main-app-shell" className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Decorative colored thin accent bar at top of the app */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full" />

      {/* App Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300 ${
        isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-lg shadow-slate-950/20' : 'bg-white/90 border-slate-200/80 text-slate-800 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveViewPage('studio')}>
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-base font-black tracking-tight font-sans transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Brand Identity Generator
              </h1>
              <p className={`text-[10px] font-sans font-medium transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                Chief Design Suite & Brand Bible Dashboard
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1 p-1 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100/80 border-slate-200'
          }">
            <button
              id="nav-studio-btn"
              onClick={() => setActiveViewPage('studio')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
                activeViewPage === 'studio'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>

            <button
              id="nav-about-btn"
              onClick={() => setActiveViewPage('about')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
                activeViewPage === 'about'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>

            <button
              id="nav-contact-btn"
              onClick={() => setActiveViewPage('contact')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
                activeViewPage === 'contact'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {/* Quick Shareable Link Button (Visible when Brand Bible is active) */}
            {activeBible && (
              <button
                id="header-shareable-link-btn"
                onClick={() => {
                  try {
                    const base64Str = encodeBrandBibleToHash(activeBible);
                    window.location.hash = `share=${base64Str}`;
                    window.history.replaceState(null, '', `#share=${base64Str}`);
                    const shareUrl = generateShareableUrl(activeBible);
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(shareUrl).catch(() => {});
                    }
                    setHeaderShareCopied(true);
                    setTimeout(() => setHeaderShareCopied(false), 2500);
                  } catch (e) {
                    console.error("Failed to share link:", e);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-sans flex items-center gap-1.5 transition border shadow-xs cursor-pointer ${
                  headerShareCopied
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
                title="Encode active brand bible into a base64 string and update URL hash to share with others"
              >
                {headerShareCopied ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span className="hidden sm:inline">{headerShareCopied ? "Link Copied!" : "Shareable Link"}</span>
              </button>
            )}

            {/* Quick Export PDF Modal Button (Visible when Brand Bible is active) */}
            {activeBible && (
              <button
                id="header-export-pdf-modal-btn"
                onClick={() => setShowPdfExportModal(true)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold font-sans flex items-center gap-1.5 transition bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-xs cursor-pointer"
                title="Export Brand Specification PDF (Ctrl+E / ⌘E)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            )}

            {/* Keyboard Shortcuts Info Tooltip */}
            <KeyboardShortcutsTooltip
              isDark={isDark}
              activeBibleName={activeBible?.companyName}
              externalFeedback={shortcutFeedback ? shortcutFeedback.message : null}
              onTriggerSave={() => {
                if (activeBible) {
                  saveBibleToStorage(activeBible);
                  triggerShortcutFeedback(`Saved "${activeBible.companyName}" to Local Storage`, `${isMac ? '⌘' : 'Ctrl'}+S`);
                } else {
                  triggerShortcutFeedback('No active brand to save yet.', `${isMac ? '⌘' : 'Ctrl'}+S`);
                }
              }}
              onTriggerMockups={() => {
                if (activeBible) {
                  setActiveViewPage('studio');
                  setActiveMainTab(prev => {
                    const next = prev === 'mockups' ? 'bible' : 'mockups';
                    triggerShortcutFeedback(
                      `Switched to ${next === 'mockups' ? 'Dynamic Mockups' : 'Brand Bible Dashboard'}`,
                      `${isMac ? '⌘' : 'Ctrl'}+M`
                    );
                    return next;
                  });
                } else {
                  triggerShortcutFeedback('Select or generate a brand first.', `${isMac ? '⌘' : 'Ctrl'}+M`);
                }
              }}
              onTriggerRegenerateLogo={() => {
                if (activeBible) {
                  if (!isLoadingLogo) {
                    triggerShortcutFeedback(`Regenerating AI Brand Logo for "${activeBible.companyName}"...`, `${isMac ? '⌘' : 'Ctrl'}+G`);
                    handleRegenerateLogo();
                  } else {
                    triggerShortcutFeedback('Logo is currently generating...', `${isMac ? '⌘' : 'Ctrl'}+G`);
                  }
                } else {
                  triggerShortcutFeedback('No active brand to regenerate logo for.', `${isMac ? '⌘' : 'Ctrl'}+G`);
                }
              }}
              onTriggerExportPdf={() => {
                if (activeBible) {
                  setShowPdfExportModal(true);
                  triggerShortcutFeedback('Opened Brand Specification PDF Export', `${isMac ? '⌘' : 'Ctrl'}+E`);
                }
              }}
              onTriggerShareLink={() => {
                if (activeBible) {
                  setShowShareModal(true);
                  triggerShortcutFeedback('Opened Shareable Link Modal', `${isMac ? '⌘' : 'Ctrl'}+Shift+L`);
                }
              }}
            />

            {/* Voice Theme Listener Button */}
            <button
              id="voice-theme-listener-btn"
              onClick={toggleVoiceThemeListener}
              className={`p-2.5 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer relative ${
                isVoiceListening
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg ring-2 ring-rose-400/50 animate-pulse'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title={
                isVoiceListening
                  ? 'Listening for voice commands (e.g. "switch to dark mode"). Click to stop.'
                  : 'Voice Command: click to speak "switch to dark mode" or "switch to light mode"'
              }
            >
              <Mic className={`w-4 h-4 ${isVoiceListening ? 'animate-bounce text-white' : ''}`} />
              {isVoiceListening && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-ping" />
              )}
            </button>

            {/* Global Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={() => setIsDark(!isDark)}
              className={`p-2.5 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 hover:scale-105 shadow-inner'
                  : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200 hover:scale-105 shadow-sm'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <span className={`text-[10px] font-mono font-bold hidden lg:inline-flex border px-2 py-1 rounded-md transition-colors duration-300 ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}>
              POWERED BY GEMINI 3.5 & VEO IMAGE PREVIEW
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error notification banner */}
        {error && (
          <div className={`mb-6 p-4 border rounded-xl text-xs flex items-start gap-3 shadow-sm font-sans animate-bounce ${
            isDark ? 'bg-rose-950/30 border-rose-900/50 text-rose-300' : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Generation Error</p>
              <p className={`mt-0.5 leading-relaxed ${isDark ? 'text-rose-400' : 'text-rose-600/90'}`}>{error}</p>
            </div>
          </div>
        )}

        {/* View Switcher Container */}
        <AnimatePresence mode="wait">
          {activeViewPage === 'about' ? (
            <AboutPage
              key="about-page"
              isDark={isDark}
              onNavigateToGenerator={() => setActiveViewPage('studio')}
            />
          ) : activeViewPage === 'contact' ? (
            <ContactPage
              key="contact-page"
              isDark={isDark}
            />
          ) : (
            <motion.div
              key="studio-workspace"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Saved Brands Quick bar */}
              {savedBibles.length > 0 && (
                <div className={`border rounded-3xl p-6 shadow-sm font-sans transition-all duration-300 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="flex justify-between items-center mb-4 px-1">
                    <div className={`flex items-center gap-2 text-xs font-black ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span className="uppercase tracking-wider">Your Saved Brand Identities ({savedBibles.length})</span>
                    </div>
                    <button
                      id="create-new-brand-btn"
                      type="button"
                      onClick={() => {
                        setActiveBible(null);
                        setError(null);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Brand</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {savedBibles.map((bible) => (
                      <button
                        id={`history-brand-btn-${bible.id}`}
                        key={bible.id}
                        onClick={() => {
                          setActiveBible(bible);
                          setError(null);
                        }}
                        className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-3 transition-all duration-200 border text-left cursor-pointer ${
                          activeBible?.id === bible.id
                            ? isDark
                              ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/20'
                              : 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-500/10'
                            : isDark
                              ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        <div>
                          <span className="block font-extrabold">{bible.companyName}</span>
                          <span className="text-[9px] text-slate-400 font-bold">{bible.createdAt}</span>
                        </div>
                        <span
                          id={`delete-brand-btn-${bible.id}`}
                          onClick={(e) => handleDeleteBible(bible.id, e)}
                          className={`p-1.5 rounded-full transition ml-1 ${
                            isDark ? 'hover:bg-rose-950/50 hover:text-rose-400' : 'hover:bg-rose-50 hover:text-rose-600'
                          }`}
                          title="Delete Saved Brand"
                        >
                          <Trash2 className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Master Three-Panel Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Column A: Foundation Input Form (Takes up 4 cols on lg screen) */}
                <div className="lg:col-span-4 space-y-6">
                  <BrandConfigForm
                    onSubmit={handleGenerateBible}
                    isLoading={isLoadingBible || isLoadingLogo}
                    isDark={isDark}
                  />
                </div>

                {/* Column B: Dynamic Output Sandbox + Tab Control (Takes up 5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {activeBible ? (
                    <div className="space-y-4">
                      {/* View Toggles */}
                      <div className={`flex border p-1.5 rounded-full shadow-sm transition-all duration-300 ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <button
                          id="main-tab-bible"
                          onClick={() => setActiveMainTab('bible')}
                          className={`flex-1 py-2.5 text-xs font-black font-sans rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeMainTab === 'bible'
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                              : isDark
                                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                          1. Brand Bible
                        </button>
                        <button
                          id="main-tab-mockups"
                          onClick={() => setActiveMainTab('mockups')}
                          className={`flex-1 py-2.5 text-xs font-black font-sans rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeMainTab === 'mockups'
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                              : isDark
                                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                          }`}
                          title={`Toggle Mockups (${isMac ? '⌘M' : 'Ctrl+M'})`}
                        >
                          <Monitor className="w-4 h-4" />
                          <span>2. Dynamic Applications</span>
                          <kbd
                            className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition-colors ${
                              activeMainTab === 'mockups'
                                ? 'bg-indigo-700/80 border-indigo-400 text-indigo-100'
                                : isDark
                                ? 'bg-slate-800 border-slate-700 text-slate-400'
                                : 'bg-slate-100 border-slate-300 text-slate-500'
                            }`}
                          >
                            {isMac ? '⌘M' : 'Ctrl+M'}
                          </kbd>
                        </button>
                      </div>

                      {/* Sub Tab View Rendering */}
                      <AnimatePresence mode="wait">
                        {activeMainTab === 'bible' ? (
                          <motion.div
                            key="bible"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <BrandBibleDashboard
                              bible={activeBible}
                              onUpdateLogo={(url) => {
                                const currentPrev = activeBible.previousLogos || (activeBible.primaryLogo ? [activeBible.primaryLogo] : []);
                                const updated = {
                                  ...activeBible,
                                  primaryLogo: url,
                                  previousLogos: currentPrev.includes(url) ? currentPrev : [...currentPrev, url]
                                };
                                saveBibleToStorage(updated);
                              }}
                              onUpdatePalette={(newPalette) => {
                                const updated = {
                                  ...activeBible,
                                  colorPalette: newPalette
                                };
                                saveBibleToStorage(updated);
                              }}
                              onUpdateArchetype={(newArchetype) => {
                                const updated = {
                                  ...activeBible,
                                  archetype: newArchetype
                                };
                                saveBibleToStorage(updated);
                              }}
                              onUpdatePattern={(newPattern) => {
                                const updated = {
                                  ...activeBible,
                                  pattern: newPattern
                                };
                                saveBibleToStorage(updated);
                              }}
                              onUpdateFavicon={(newFavicon) => {
                                const updated = {
                                  ...activeBible,
                                  favicon: newFavicon
                                };
                                saveBibleToStorage(updated);
                              }}
                              onUpdateVoice={(newVoice) => {
                                const updated = {
                                  ...activeBible,
                                  brandVoice: newVoice
                                };
                                saveBibleToStorage(updated);
                              }}
                              onUpdateBible={(newBible) => {
                                saveBibleToStorage(newBible);
                              }}
                              onUpdateMission={(newMission) => {
                                const updated = {
                                  ...activeBible,
                                  mission: newMission
                                };
                                saveBibleToStorage(updated);
                              }}
                              onUpdateTagline={(newTagline) => {
                                const updated = {
                                  ...activeBible,
                                  archetype: activeBible.archetype ? {
                                    ...activeBible.archetype,
                                    tagline: newTagline
                                  } : undefined
                                };
                                saveBibleToStorage(updated);
                              }}
                              isLoadingLogo={isLoadingLogo}
                              onRegenerateLogo={handleRegenerateLogo}
                              logoSize={logoSize}
                              isDark={isDark}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="mockups"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <BrandMockups bible={activeBible} isDark={isDark} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    /* Welcome Placeholder Screen */
                    <div className={`border rounded-3xl p-8 sm:p-10 text-center flex flex-col justify-center items-center min-h-[480px] font-sans shadow-sm relative overflow-hidden transition-all duration-300 ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      {/* Subtle decorative glow element */}
                      <div className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-40 ${
                        isDark ? 'bg-indigo-900/40' : 'bg-indigo-100/80'
                      }`} />
                      <div className={`absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-40 ${
                        isDark ? 'bg-purple-900/30' : 'bg-purple-100/60'
                      }`} />

                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-5 shadow-md border transition-transform duration-300 hover:scale-105 ${
                        isDark ? 'bg-slate-850 text-indigo-400 border-slate-700 shadow-indigo-950/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100'
                      }`}>
                        <BookOpen className="w-8 h-8" />
                      </div>

                      <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Your Brand Identity Sandbox
                      </h2>
                      <p className={`text-xs mt-2 max-w-md leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Submit your company mission on the left to synthesize color systems, typographic pair scales, brand archetypes, and interactive mockups.
                      </p>

                      {/* Instant Sample Loader Triggers */}
                      <div className="mt-6 w-full max-w-md">
                        <span className={`text-[10px] uppercase tracking-widest font-extrabold block mb-2.5 ${
                          isDark ? 'text-slate-400' : 'text-slate-400'
                        }`}>
                          Or test immediately with a pre-crafted sample brand:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {SAMPLE_BRAND_BIBLES.map((sample) => (
                            <button
                              id={`load-sample-btn-${sample.id}`}
                              key={sample.id}
                              type="button"
                              onClick={() => {
                                saveBibleToStorage(sample);
                                setError(null);
                              }}
                              className={`p-3 border rounded-2xl text-left transition-all duration-200 cursor-pointer flex items-center gap-3 group ${
                                isDark
                                  ? 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-200'
                                  : 'bg-slate-50/80 border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-800'
                              }`}
                            >
                              <div className="h-8 w-8 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Zap className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {sample.companyName}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {sample.industry}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Feature Highlights Grid */}
                      <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-md text-left text-[11px] font-sans">
                        <div className={`p-3.5 border rounded-2xl flex items-center gap-2.5 transition-all duration-300 ${
                          isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' : 'bg-slate-50/60 border-slate-100 text-slate-600'
                        }`}>
                          <Palette className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-[11px]">5-Color cohesive palette & roles</span>
                        </div>
                        <div className={`p-3.5 border rounded-2xl flex items-center gap-2.5 transition-all duration-300 ${
                          isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' : 'bg-slate-50/60 border-slate-100 text-slate-600'
                        }`}>
                          <Type className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-[11px]">Google Fonts typographic pairing</span>
                        </div>
                        <div className={`p-3.5 border rounded-2xl flex items-center gap-2.5 transition-all duration-300 ${
                          isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' : 'bg-slate-50/60 border-slate-100 text-slate-600'
                        }`}>
                          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-[11px]">Vector & AI Image Logo synthesis</span>
                        </div>
                        <div className={`p-3.5 border rounded-2xl flex items-center gap-2.5 transition-all duration-300 ${
                          isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' : 'bg-slate-50/60 border-slate-100 text-slate-600'
                        }`}>
                          <Monitor className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-[11px]">Interactive product & web mockups</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column C: AI Brand Consultant Drawer (Takes up 3 cols) */}
                <div className="lg:col-span-3">
                  <ConsultantChat
                    brandBible={activeBible}
                    onUpdatePalette={(newPalette) => {
                      if (!activeBible) return;
                      const updated = {
                        ...activeBible,
                        colorPalette: newPalette
                      };
                      saveBibleToStorage(updated);
                    }}
                    onUpdateBrandBible={(newBible) => {
                      saveBibleToStorage(newBible);
                    }}
                    isDark={isDark}
                  />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className={`border-t mt-12 py-8 text-xs font-sans transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">Brand Identity Generator Suite</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <button
              id="footer-nav-studio-btn"
              onClick={() => setActiveViewPage('studio')}
              className="hover:text-indigo-500 transition cursor-pointer"
            >
              Studio
            </button>
            <button
              id="footer-nav-about-btn"
              onClick={() => setActiveViewPage('about')}
              className="hover:text-indigo-500 transition cursor-pointer"
            >
              About
            </button>
            <button
              id="footer-nav-contact-btn"
              onClick={() => setActiveViewPage('contact')}
              className="hover:text-indigo-500 transition cursor-pointer"
            >
              Contact
            </button>
            <button
              id="footer-shortcuts-trigger-btn"
              type="button"
              onClick={() => {
                const btn = document.getElementById('shortcuts-info-tooltip-btn');
                if (btn) btn.click();
              }}
              className="hover:text-indigo-500 transition cursor-pointer flex items-center gap-1.5"
              title={`Keyboard Shortcuts (${isMac ? '⌘S, ⌘M, ⌘G' : 'Ctrl+S, Ctrl+M, Ctrl+G'})`}
            >
              <Keyboard className="w-3.5 h-3.5 text-indigo-500" />
              <span>Shortcuts</span>
              <kbd className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {isMac ? '⌘' : 'Ctrl'}+K
              </kbd>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">&copy; 2026 Brand Suite. Powered by Gemini 3.5 &amp; Google AI Studio.</p>
        </div>
      </footer>

      {/* Global Brand Specification PDF Export Modal */}
      {activeBible && (
        <PdfExportModal
          isOpen={showPdfExportModal}
          onClose={() => setShowPdfExportModal(false)}
          bible={activeBible}
          isDark={isDark}
        />
      )}

      {/* Global Share Link Modal */}
      {activeBible && (
        <ShareLinkModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          bible={activeBible}
          isDark={isDark}
        />
      )}

      {/* Global Keyboard Shortcut Feedback Banner */}
      <AnimatePresence>
        {shortcutFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full border shadow-2xl flex items-center gap-2.5 text-xs font-bold font-sans backdrop-blur-xl ${
              isDark
                ? 'bg-slate-900/95 border-indigo-500/50 text-slate-100 shadow-indigo-950/60 ring-1 ring-indigo-500/30'
                : 'bg-white/95 border-indigo-300 text-slate-900 shadow-slate-300/80 ring-1 ring-indigo-500/20'
            }`}
          >
            {shortcutFeedback.keyBadge && (
              <kbd className="px-2 py-0.5 rounded-md font-mono text-[10px] font-black bg-indigo-600 text-white shadow-xs">
                {shortcutFeedback.keyBadge}
              </kbd>
            )}
            <span className="font-semibold">{shortcutFeedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Command Feedback Banner */}
      <AnimatePresence>
        {voiceCommandFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full border shadow-xl flex items-center gap-2.5 text-xs font-bold font-sans ${
              isDark
                ? 'bg-slate-900/95 border-slate-700 text-indigo-300 backdrop-blur-md'
                : 'bg-white/95 border-slate-200 text-indigo-600 backdrop-blur-md'
            }`}
          >
            <Mic className={`w-4 h-4 ${isVoiceListening ? 'text-rose-500 animate-pulse' : 'text-indigo-500'}`} />
            <span>{voiceCommandFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
