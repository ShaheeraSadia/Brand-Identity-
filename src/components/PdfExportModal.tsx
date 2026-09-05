import React, { useState } from 'react';
import { BrandBible, StyleAuditReport } from '../types';
import { downloadBrandPdf, previewBrandPdfInNewTab, PdfExportOptions } from '../utils/brandPdfGenerator';
import { FileText, Download, ExternalLink, X, CheckCircle2, Sparkles, Layers, ShieldCheck, Palette, Type, Check, RefreshCw, Printer, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bible: BrandBible;
  isDark: boolean;
  auditReport?: StyleAuditReport | null;
  onShowToast?: (message: string, hex?: string) => void;
}

export function PdfExportModal({
  isOpen,
  onClose,
  bible,
  isDark,
  auditReport,
  onShowToast
}: PdfExportModalProps) {
  const [docType, setDocType] = useState<'executive' | 'comprehensive'>('comprehensive');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [includeAudit, setIncludeAudit] = useState<boolean>(Boolean(auditReport));
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const primaryColor = bible.colorPalette[0]?.hex || '#6366f1';

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      setExportSuccess(null);
      const options: Partial<PdfExportOptions> = {
        documentType: docType,
        theme: themeMode,
        pageSize,
        includeAuditReport: includeAudit,
        auditReport: includeAudit ? auditReport : null
      };

      const fileName = await downloadBrandPdf(bible, options);
      setExportSuccess(fileName);
      if (onShowToast) {
        onShowToast(`Successfully downloaded "${fileName}"`, primaryColor);
      }
      setTimeout(() => {
        setExportSuccess(null);
      }, 4000);
    } catch (err: any) {
      console.error('PDF export error:', err);
      if (onShowToast) {
        onShowToast(`Export failed: ${err.message || 'Unknown error'}`, '#ef4444');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviewInTab = async () => {
    try {
      setIsPreviewing(true);
      const options: Partial<PdfExportOptions> = {
        documentType: docType,
        theme: themeMode,
        pageSize,
        includeAuditReport: includeAudit,
        auditReport: includeAudit ? auditReport : null
      };

      await previewBrandPdfInNewTab(bible, options);
      if (onShowToast) {
        onShowToast('Opened PDF preview in new window', primaryColor);
      }
    } catch (err: any) {
      console.error('PDF preview error:', err);
      if (onShowToast) {
        onShowToast(`Preview error: ${err.message || 'Could not open preview'}`, '#ef4444');
      }
    } finally {
      setIsPreviewing(false);
    }
  };

  const calculatedPages = docType === 'executive' ? 1 : (includeAudit && auditReport ? 4 : 3);

  return (
    <AnimatePresence>
      <div
        id="pdf-export-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isExporting) {
            onClose();
          }
        }}
      >
        <motion.div
          id="pdf-export-modal-dialog"
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-2xl rounded-3xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Modal Header */}
          <div className={`px-6 py-5 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/70'
          }`}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight">Export Brand Specification PDF</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    jsPDF Engine
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Export {bible.companyName}&apos;s identity marks, 5-color palette, typography &amp; mission into a professional document.
                </p>
              </div>
            </div>

            <button
              id="close-pdf-export-modal-btn"
              onClick={onClose}
              disabled={isExporting}
              className={`p-2 rounded-full border transition cursor-pointer disabled:opacity-50 ${
                isDark
                  ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body / Scrollable Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
            {/* Success notification banner if downloaded */}
            {exportSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <div className="flex-1 font-medium">
                  PDF document <span className="font-mono font-bold">{exportSuccess}</span> was generated and saved to your device.
                </div>
              </motion.div>
            )}

            {/* Document Type Selection Cards */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                1. Select Document Layout &amp; Depth
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Comprehensive Manual Card */}
                <button
                  type="button"
                  id="select-comprehensive-pdf-btn"
                  onClick={() => setDocType('comprehensive')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    docType === 'comprehensive'
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : isDark
                        ? 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <Layers className="w-4 h-4" />
                        Comprehensive Brand Manual
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                        3-4 Pages
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Complete multi-page governance book: Identity marks &amp; clearspace, 5-color specifications with 60-30-10 rules &amp; WCAG matrix, typography hierarchy, brand voice, and do&apos;s &amp; don&apos;ts.
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Best for full agency &amp; dev handoffs</span>
                    {docType === 'comprehensive' && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    )}
                  </div>
                </button>

                {/* Executive 1-Sheet Card */}
                <button
                  type="button"
                  id="select-executive-pdf-btn"
                  onClick={() => setDocType('executive')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    docType === 'executive'
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : isDark
                        ? 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-4 h-4" />
                        Executive Brand Specification Sheet
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                        1 Page
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      High-density single-page reference sheet. Consolidates the master mark, executive mission, 5-color palette with HEX/RGB/CMYK/WCAG ratings, and typography pairings into one clean overview.
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Best for quick partner summaries</span>
                    {docType === 'executive' && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Document Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  2. Document Style &amp; Header Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-slate-900 text-white border-indigo-500 ring-1 ring-indigo-500'
                        : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 inline-block" />
                    <span>Executive Slate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-indigo-500 ring-1 ring-indigo-500'
                        : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Ink-Saver</span>
                  </button>
                </div>
              </div>

              {/* Page Format */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  3. Standard Paper Dimensions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSize('a4')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      pageSize === 'a4'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>ISO A4</span>
                    <span className="text-[10px] opacity-75 font-normal">(210 × 297mm)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPageSize('letter')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      pageSize === 'letter'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>US Letter</span>
                    <span className="text-[10px] opacity-75 font-normal">(8.5 × 11 in)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Audit Inclusion (if comprehensive manual) */}
            {docType === 'comprehensive' && auditReport && (
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">
                      Include Style Audit Quality Report (Adds Page 4)
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Appends automated scores for color contrast, typography legibility, and architectural recommendations.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="include-audit-checkbox"
                  checked={includeAudit}
                  onChange={(e) => setIncludeAudit(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            )}

            {/* Active Content Snapshot Card */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Active Content Manifest
                </span>
                <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {calculatedPages} {calculatedPages === 1 ? 'Page' : 'Pages'} • ~240 KB Vector
                </span>
              </div>

              {/* Quick specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Palette className="w-3 h-3" /> Palette
                  </span>
                  <div className="flex items-center gap-1">
                    {bible.colorPalette.slice(0, 5).map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-black/10 shadow-xs shrink-0"
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name} (${c.hex})`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Type className="w-3 h-3" /> Header Font
                  </span>
                  <p className="font-bold truncate text-[11px]">{bible.typography?.headerFont || 'Playfair Display'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Type className="w-3 h-3" /> Body Font
                  </span>
                  <p className="font-bold truncate text-[11px]">{bible.typography?.bodyFont || 'Plus Jakarta Sans'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Compass className="w-3 h-3" /> Archetype
                  </span>
                  <p className="font-bold truncate text-[11px] text-indigo-600 dark:text-indigo-400">
                    {bible.archetype?.primaryArchetype || 'The Creator'}
                  </p>
                </div>
              </div>

              {/* Mission snippet */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <span className="text-slate-400 font-medium">Mission: </span>
                <span className={`italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  &ldquo;{bible.mission.length > 130 ? bible.mission.substring(0, 127) + '...' : bible.mission}&rdquo;
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/70'
          }`}>
            <button
              type="button"
              id="preview-pdf-btn"
              onClick={handlePreviewInTab}
              disabled={isPreviewing || isExporting}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer disabled:opacity-50 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
              title="Open the generated PDF document in a new browser tab for immediate inspection"
            >
              {isPreviewing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5" />
              )}
              <span>{isPreviewing ? 'Rendering Preview...' : 'Preview in New Tab'}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isExporting}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                id="modal-download-pdf-btn"
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-full text-xs font-extrabold flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {isExporting
                    ? 'Synthesizing PDF...'
                    : `Download ${docType === 'executive' ? '1-Page Sheet' : 'Manual (PDF)'}`}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
