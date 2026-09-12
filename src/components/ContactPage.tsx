import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Send,
  MessageSquare,
  Building,
  CheckCircle2,
  Clock,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Zap,
  Globe,
  LifeBuoy,
  Shield,
  Copy,
  Check,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import FormSecurityBadge from './FormSecurityBadge';
import {
  validateAndSanitizeEmail,
  analyzeInputThreats,
  isHoneypotTriggered,
  FormRateLimiter
} from '../utils/security';

interface ContactPageProps {
  key?: React.Key;
  isDark?: boolean;
}

export default function ContactPage({ isDark = false }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    inquiryType: 'general',
    subject: '',
    message: ''
  });

  const [honeypotToken, setHoneypotToken] = useState('');
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [blockedThreatsCount, setBlockedThreatsCount] = useState(0);
  const [lastThreatSanitized, setLastThreatSanitized] = useState<string | null>(null);
  const rateLimiterRef = useRef(new FormRateLimiter({ maxSubmissions: 4, windowMs: 60000, cooldownMs: 2000 }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    // 1. Anti-Hacker Honeypot Trap
    if (isHoneypotTriggered(honeypotToken)) {
      setSecurityAlert('Security Trap: Automated bot submission intercepted and rejected.');
      setBlockedThreatsCount(c => c + 1);
      setLastThreatSanitized('Automated Bot / Web Scraper Honeypot Trap');
      return;
    }

    // 2. Anti-Spam Rate Limiter
    const rateCheck = rateLimiterRef.current.check();
    if (!rateCheck.allowed) {
      setSecurityAlert(rateCheck.reason || 'Rate limit active. Please wait.');
      return;
    }
    rateLimiterRef.current.record();

    // 3. Email Validation & Header Injection Guard
    const emailResult = validateAndSanitizeEmail(formData.email);
    if (!emailResult.isValid) {
      setSecurityAlert(emailResult.error || 'Please enter a valid email address.');
      return;
    }

    // 4. Threat Analysis & XSS / Script Stripping
    const nameCheck = analyzeInputThreats(formData.name, 80);
    const companyCheck = analyzeInputThreats(formData.company, 100);
    const subjectCheck = analyzeInputThreats(formData.subject, 150);
    const messageCheck = analyzeInputThreats(formData.message, 2500);

    const detectedThreats = [
      ...nameCheck.threatTypes,
      ...companyCheck.threatTypes,
      ...subjectCheck.threatTypes,
      ...messageCheck.threatTypes
    ];

    if (detectedThreats.length > 0) {
      setBlockedThreatsCount(c => c + detectedThreats.length);
      setLastThreatSanitized(detectedThreats[0]);
      setSecurityAlert(`Security Notice: ${detectedThreats[0]} neutralized.`);
      setTimeout(() => setSecurityAlert(null), 5000);
    } else {
      setSecurityAlert(null);
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(generatedId);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      company: '',
      inquiryType: 'general',
      subject: '',
      message: ''
    });
  };

  const faqs = [
    {
      q: 'How does the Brand Identity Generator produce brand bibles?',
      a: 'The system utilizes Gemini 3.5 models to synthesize comprehensive brand guidelines—including 5-color palettes, Google Font typography scales, brand archetypes, voice guidelines, and logo clear space specifications based on your input parameters.'
    },
    {
      q: 'Can I export the generated assets for commercial use?',
      a: 'Yes! All generated color palettes, typography specs, SVG patterns, logo marks, and PDF brand guidelines belong entirely to you and can be used for commercial projects, client work, or startup branding.'
    },
    {
      q: 'Are my brand bibles saved securely?',
      a: 'Brand bibles are saved directly in your browser local storage and encoded in shareable URL hashes. Your data stays private to your session.'
    },
    {
      q: 'How do I download high-resolution PDF and PNG assets?',
      a: 'Inside the Brand Bible Dashboard, use the top export tools or section download buttons to capture 4K PNG snapshots, download vector SVG patterns, or generate complete PDF brand specification books.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-12 font-sans max-w-5xl mx-auto py-4"
    >
      {/* Header Banner */}
      <div className={`p-8 sm:p-10 rounded-3xl border transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Mail className="w-3.5 h-3.5" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Contact Brand Design Support &amp; Enquiries
          </h1>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Have questions about custom brand integrations, enterprise licensing, or feature suggestions? Send us a message and our team will assist you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Contact Form Column (7 cols) */}
        <div className={`lg:col-span-7 min-w-0 w-full p-8 rounded-3xl border transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="contact-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Send Us a Message
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fill out the details below and we will get back to you shortly.
                    </p>
                  </div>
                  <FormSecurityBadge
                    isDark={isDark}
                    blockedThreatsCount={blockedThreatsCount}
                    lastThreatSanitized={lastThreatSanitized}
                  />
                </div>

                {/* Invisible Decoy Honeypot: Traps automated bots */}
                <div className="opacity-0 absolute -top-[9999px] -left-[9999px] pointer-events-none h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="contact_hp_token">Leave this field empty</label>
                  <input
                    id="contact_hp_token"
                    type="text"
                    name="contact_hp_token"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypotToken}
                    onChange={(e) => setHoneypotToken(e.target.value)}
                  />
                </div>

                {/* Security Feedback Banner */}
                {securityAlert && (
                  <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                    securityAlert.includes('Rate') || securityAlert.includes('rejected') || securityAlert.includes('Security')
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  }`}>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{securityAlert}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSecurityAlert(null)}
                      className="text-[10px] underline hover:opacity-80 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-form-name"
                      type="text"
                      required
                      maxLength={80}
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-form-email"
                      type="email"
                      required
                      maxLength={120}
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Company / Organization
                    </label>
                    <input
                      id="contact-form-company"
                      type="text"
                      maxLength={100}
                      placeholder="Acme Studio"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Inquiry Type */}
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Inquiry Category
                    </label>
                    <select
                      id="contact-form-type"
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="general">General Support</option>
                      <option value="enterprise">Enterprise Brand Systems</option>
                      <option value="integration">Custom AI Model Integration</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Subject
                  </label>
                  <input
                    id="contact-form-subject"
                    type="text"
                    maxLength={150}
                    placeholder="e.g. Exporting brand specification PDF files"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Your Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-form-message"
                    required
                    maxLength={2500}
                    rows={4}
                    placeholder="Describe your inquiry or request in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium transition focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Submit Button */}
                <button
                  id="contact-form-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="contact-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Message Received!
                  </h3>
                  <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Thank you for reaching out, <strong>{formData.name}</strong>. Our brand support team has received your inquiry.
                  </p>
                </div>

                {/* Ticket ID Box */}
                <div className={`p-4 rounded-2xl border max-w-sm mx-auto space-y-2 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Support Reference ID
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-base font-black text-indigo-500">{ticketId}</span>
                    <button
                      id="copy-ticket-id-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(ticketId);
                        setCopiedTicket(true);
                        setTimeout(() => setCopiedTicket(false), 2000);
                      }}
                      className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 transition cursor-pointer"
                      title="Copy Reference Ticket ID"
                    >
                      {copiedTicket ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="contact-send-another-btn"
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Support Channels & Info Column (5 cols) */}
        <div className="lg:col-span-5 min-w-0 w-full space-y-6">
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h2 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Support Overview
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Average Response Time</h3>
                  <p className="text-slate-400 mt-0.5">Within 24 business hours for general support.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Enterprise Licensing</h3>
                  <p className="text-slate-400 mt-0.5">Custom brand systems and dedicated Gemini model fine-tuning available.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Data Security</h3>
                  <p className="text-slate-400 mt-0.5">Generative requests are handled securely via backend proxy layers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Accordion */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <h2 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl transition-colors overflow-hidden ${
                      isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <button
                      id={`faq-toggle-btn-${idx}`}
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className={`w-full p-3.5 text-left text-xs font-bold flex items-center justify-between gap-3 cursor-pointer ${
                        isDark ? 'text-slate-200 hover:text-white' : 'text-slate-800 hover:text-slate-900'
                      }`}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
                    </button>
                    {isOpen && (
                      <div className={`px-3.5 pb-3.5 text-[11px] leading-relaxed border-t pt-2 ${
                        isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-600 border-slate-200'
                      }`}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
