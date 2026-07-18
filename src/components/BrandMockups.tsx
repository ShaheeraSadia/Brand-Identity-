import React, { useState } from 'react';
import { BrandBible } from '../types';
import { CreditCard, FileText, Monitor, Share2, Copy, Check } from 'lucide-react';

interface BrandMockupsProps {
  bible: BrandBible;
  isDark?: boolean;
}

export default function BrandMockups({ bible, isDark = false }: BrandMockupsProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'letterhead' | 'social' | 'website'>('card');
  const [isCopied, setIsCopied] = useState(false);

  // Helper to resolve color hexes safely
  const getBrandColor = (roleName: string, fallback: string) => {
    const found = bible.colorPalette.find(c => c.role.toLowerCase().includes(roleName.toLowerCase()));
    return found ? found.hex : fallback;
  };

  const primaryColor = getBrandColor('primary', '#4f46e5');
  const secondaryColor = getBrandColor('secondary', '#10b981');
  const accentColor = getBrandColor('accent', '#f59e0b');
  const darkNeutral = getBrandColor('dark', '#1e293b');
  const lightNeutral = getBrandColor('light', '#f8fafc');

  const headerFontFamily = `'${bible.typography.headerFont}', sans-serif`;
  const bodyFontFamily = `'${bible.typography.bodyFont}', sans-serif`;

  const handleCopyLink = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(`https://${bible.companyName.toLowerCase().replace(/\s+/g, '')}.com`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      id="brand-mockups-container"
      className={`border rounded-3xl p-8 shadow-sm transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-4 mb-6 gap-4 transition-colors duration-300 ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 block mb-1">07 / Brand Applications</span>
          <h2 className={`text-xl font-black flex items-center gap-2 font-sans tracking-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <Monitor className="w-5 h-5 text-indigo-600" />
            Interactive Brand Mockups
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            See how your generated colors, typography, and logo apply dynamically on professional real-world mediums.
          </p>
        </div>
        {/* Mockup Tabs */}
        <div className={`flex flex-wrap border p-1 rounded-full transition-colors duration-300 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            id="mockup-tab-card"
            onClick={() => setActiveTab('card')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === 'card'
                ? isDark
                  ? 'bg-slate-900 text-indigo-400 shadow-sm'
                  : 'bg-white text-indigo-600 shadow-sm'
                : isDark
                  ? 'text-slate-400 hover:text-slate-250'
                  : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Business Card
          </button>
          <button
            id="mockup-tab-letterhead"
            onClick={() => setActiveTab('letterhead')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === 'letterhead'
                ? isDark
                  ? 'bg-slate-900 text-indigo-400 shadow-sm'
                  : 'bg-white text-indigo-600 shadow-sm'
                : isDark
                  ? 'text-slate-400 hover:text-slate-250'
                  : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Letterhead
          </button>
          <button
            id="mockup-tab-social"
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === 'social'
                ? isDark
                  ? 'bg-slate-900 text-indigo-400 shadow-sm'
                  : 'bg-white text-indigo-600 shadow-sm'
                : isDark
                  ? 'text-slate-400 hover:text-slate-250'
                  : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Social Banner
          </button>
          <button
            id="mockup-tab-website"
            onClick={() => setActiveTab('website')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === 'website'
                ? isDark
                  ? 'bg-slate-900 text-indigo-400 shadow-sm'
                  : 'bg-white text-indigo-600 shadow-sm'
                : isDark
                  ? 'text-slate-400 hover:text-slate-250'
                  : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Landing Hero
          </button>
        </div>
      </div>

      {/* Main Sandbox Stage */}
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex justify-center items-center overflow-hidden min-h-[400px]">
        {/* 1. BUSINESS CARD MOCKUP */}
        {activeTab === 'card' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Front Side */}
            <div
              className="aspect-[1.75/1] rounded-2xl p-6 shadow-md border flex flex-col justify-between transition-all hover:scale-[1.02]"
              style={{ backgroundColor: lightNeutral, borderColor: '#e2e8f0' }}
            >
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center bg-white shadow-sm">
                  {bible.primaryLogo ? (
                    <img src={bible.primaryLogo} alt="Logo" className="max-h-8 max-w-8 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: primaryColor }} />
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: secondaryColor }}>
                    Corporate Office
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                  {bible.companyName}
                </h3>
                <p className="text-[10px] tracking-wide font-bold" style={{ fontFamily: bodyFontFamily, color: primaryColor }}>
                  {bible.industry}
                </p>
              </div>
            </div>

            {/* Back Side */}
            <div
              className="aspect-[1.75/1] rounded-2xl p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.02]"
              style={{ backgroundColor: darkNeutral }}
            >
              {/* Artistic Background accents */}
              <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full filter blur-2xl opacity-20 -mr-8 -mb-8" style={{ backgroundColor: primaryColor }} />
              <div className="absolute left-1/2 top-0 w-24 h-24 rounded-full filter blur-xl opacity-10 -mt-10" style={{ backgroundColor: accentColor }} />

              <div className="flex justify-between items-start z-10">
                <div>
                  <h4 className="text-sm font-bold tracking-wide" style={{ fontFamily: headerFontFamily }}>
                    Sarah Jenkins
                  </h4>
                  <p className="text-[9px] opacity-70" style={{ fontFamily: bodyFontFamily }}>
                    Director of Creative Strategy
                  </p>
                </div>
                {bible.primaryLogo && (
                  <img src={bible.primaryLogo} alt="Logo white" className="h-6 w-6 object-contain brightness-0 invert opacity-80" referrerPolicy="no-referrer" />
                )}
              </div>

              <div className="space-y-1.5 z-10 font-sans">
                <div className="w-full h-[1px] opacity-20 bg-white my-1" />
                <div className="flex justify-between text-[8px] opacity-80 font-bold">
                  <span>M: +1 (555) 234-5678</span>
                  <span>E: s.jenkins@{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
                </div>
                <div className="flex justify-between text-[8px] opacity-80 font-bold">
                  <span>O: Chicago HQ</span>
                  <span>W: www.{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. LETTERHEAD MOCKUP */}
        {activeTab === 'letterhead' && (
          <div className="bg-white w-full max-w-xl shadow-lg border border-slate-200 p-8 rounded-2xl min-h-[480px] flex flex-col justify-between font-sans">
            {/* Header branding */}
            <div className="border-b-2 pb-4 flex justify-between items-center" style={{ borderColor: primaryColor }}>
              <div className="flex items-center gap-3">
                {bible.primaryLogo ? (
                  <img src={bible.primaryLogo} alt="Logo" className="h-10 w-10 object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: primaryColor }} />
                )}
                <div>
                  <h3 className="text-base font-extrabold" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                    {bible.companyName}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-sans">
                    {bible.industry}
                  </p>
                </div>
              </div>
              <div className="text-right text-[8px] text-slate-500 font-sans font-bold">
                <p>100 Venture Boulevard, Suite 500</p>
                <p>San Francisco, CA 94107</p>
                <p>info@{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com</p>
              </div>
            </div>

            {/* Letter content placeholder */}
            <div className="py-6 space-y-4 flex-grow font-sans">
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>Ref: BRD-2026-04</span>
                <span>Date: July 14, 2026</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Dear Partners and Stakeholders,</p>
              <p className="text-[10px] text-slate-600 leading-relaxed font-sans" style={{ fontFamily: bodyFontFamily }}>
                As we initiate this new design phase, we are pleased to outline the primary operational rules of <span className="font-bold" style={{ color: primaryColor }}>{bible.companyName}</span>. 
                Our mission is simple: <span className="italic">"{bible.mission}"</span>.
                We expect all communication materials, products, and interactive setups to fully embody the core principles and color palette defined within this dynamic Brand Specification handbook.
              </p>
              <p className="text-[10px] text-slate-600 leading-relaxed font-sans" style={{ fontFamily: bodyFontFamily }}>
                To safeguard the integrity of our physical and web interfaces, pay careful attention to the designated typography combinations (<span className="font-medium">{bible.typography.headerFont}</span> & <span className="font-medium">{bible.typography.bodyFont}</span>) 
                and always reference our primary visual guidelines for proper safe spaces and background contrasts.
              </p>
              <div className="pt-4 text-[10px] text-slate-500 font-sans">
                <p>Warm regards,</p>
                <p className="font-bold mt-2 text-slate-800" style={{ fontFamily: headerFontFamily }}>The Executive Leadership Team</p>
                <p className="text-[9px]">{bible.companyName}</p>
              </div>
            </div>

            {/* Footer accents */}
            <div className="border-t pt-3 flex justify-between items-center text-[8px] text-slate-400 font-bold">
              <span>Confidential | &copy; 2026 {bible.companyName} All Rights Reserved</span>
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              </div>
            </div>
          </div>
        )}

        {/* 3. SOCIAL MEDIA BANNER */}
        {activeTab === 'social' && (
          <div
            className="w-full max-w-2xl aspect-[1.91/1] rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between p-8"
            style={{ backgroundColor: lightNeutral }}
          >
            {/* Geometric backgrounds colored dynamically */}
            <div className="absolute right-0 top-0 w-2/3 h-full opacity-10 transform skew-x-12 origin-top-right transition-all" style={{ backgroundColor: primaryColor }} />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full opacity-15 filter blur-3xl" style={{ backgroundColor: accentColor }} />

            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2.5">
                {bible.primaryLogo ? (
                  <img src={bible.primaryLogo} alt="Logo" className="h-8 w-8 object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-6 w-6 rounded-md" style={{ backgroundColor: primaryColor }} />
                )}
                <span className="text-xs font-black uppercase tracking-wider" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                  {bible.companyName}
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: secondaryColor }}>
                Launch Campaign
              </span>
            </div>

            <div className="space-y-3 z-10 my-auto">
              <h3 className="text-2xl md:text-3xl font-black leading-tight tracking-tight max-w-md" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                The Future of {bible.industry.split('&')[0].split('and')[0].trim()}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2 max-w-sm" style={{ fontFamily: bodyFontFamily }}>
                {bible.mission}
              </p>
            </div>

            <div className="flex justify-between items-center z-10 border-t border-slate-200/50 pt-3">
              <span className="text-[10px] font-mono font-bold tracking-wide text-slate-400">
                #{bible.companyName.replace(/\s+/g, '')}
              </span>
              <button
                id="social-copy-website-btn"
                onClick={handleCopyLink}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-4 py-1.5 text-[10px] font-bold rounded-full flex items-center gap-1 cursor-pointer transition"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {isCopied ? 'Copied' : 'Copy Web Address'}
              </button>
            </div>
          </div>
        )}

        {/* 4. WEBSITE HERO LANDING PAGE */}
        {activeTab === 'website' && (
          <div className="bg-white w-full rounded-2xl shadow-lg border border-slate-200 overflow-hidden font-sans">
            {/* Top Browser Bar */}
            <div className="bg-slate-50 border-b px-4 py-2 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="bg-white border text-[9px] text-slate-400 px-3 py-0.5 rounded-md ml-4 w-1/2 overflow-hidden text-ellipsis">
                https://www.{bible.companyName.toLowerCase().replace(/\s+/g, '')}.com
              </div>
            </div>

            {/* Nav Header */}
            <div className="px-6 py-3 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                {bible.primaryLogo ? (
                  <img src={bible.primaryLogo} alt="Logo" className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-5 w-5 rounded-md" style={{ backgroundColor: primaryColor }} />
                )}
                <span className="text-xs font-extrabold tracking-tight" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                  {bible.companyName}
                </span>
              </div>
              <div className="flex gap-4 text-[10px] text-slate-500 font-sans font-bold">
                <span className="hover:text-slate-800 cursor-pointer">Platform</span>
                <span className="hover:text-slate-800 cursor-pointer">Solutions</span>
                <span className="hover:text-slate-800 cursor-pointer">Pricing</span>
              </div>
              <button
                id="nav-cta-btn"
                className="px-4 py-1.5 rounded-full text-[10px] font-bold text-white transition cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Get Started
              </button>
            </div>

            {/* Hero Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-sans">Introducing our solutions</span>
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: headerFontFamily, color: darkNeutral }}>
                  Elevating the standard of <span style={{ color: primaryColor }}>{bible.industry.split('&')[0]}</span>.
                </h1>
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans" style={{ fontFamily: bodyFontFamily }}>
                  {bible.mission}
                </p>
                <div className="flex gap-2">
                  <button
                    id="website-primary-cta"
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-sm transition cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Request Demo
                  </button>
                  <button
                    id="website-secondary-cta"
                    className="px-5 py-2.5 rounded-full text-xs font-semibold border transition bg-white hover:bg-slate-50 cursor-pointer"
                    style={{ color: darkNeutral, borderColor: '#e2e8f0' }}
                  >
                    Learn More &rarr;
                  </button>
                </div>
              </div>

              {/* Graphical Hero Right Block */}
              <div className="h-36 rounded-2xl border relative overflow-hidden flex flex-col justify-center items-center" style={{ backgroundColor: lightNeutral, borderColor: '#f1f5f9' }}>
                <div className="absolute top-4 left-4 h-6 w-6 rounded-full" style={{ backgroundColor: accentColor, opacity: 0.2 }} />
                {bible.primaryLogo ? (
                  <img src={bible.primaryLogo} alt="Logo hero" className="h-20 w-20 object-contain drop-shadow-sm transition hover:scale-105" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-12 w-12 rounded-xl shadow-lg animate-bounce" style={{ backgroundColor: primaryColor }} />
                )}
                <div className="mt-2 text-[9px] font-semibold text-slate-400 font-mono tracking-wider">
                  PRIMARY LOGO SYSTEM
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
