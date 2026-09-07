import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, CheckCircle2, Globe, Server, UserCheck, AlertCircle } from 'lucide-react';

interface PrivacyPolicyPageProps {
  key?: React.Key;
  isDark?: boolean;
  onNavigateToStudio?: () => void;
}

export default function PrivacyPolicyPage({ isDark = false, onNavigateToStudio }: PrivacyPolicyPageProps) {
  const lastUpdated = 'September 7, 2026';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="font-sans max-w-4xl mx-auto space-y-10 py-4"
    >
      {/* Header */}
      <div
        className={`p-8 sm:p-10 rounded-3xl border transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Legal &amp; Privacy Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400">
            Last updated: <strong>{lastUpdated}</strong> • Compliant with Google AdSense, GDPR, CCPA, and Google EU User Consent Policies.
          </p>
        </div>
      </div>

      {/* Main Legal Content Container */}
      <div
        className={`p-8 sm:p-10 rounded-3xl border space-y-8 text-xs leading-relaxed transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        {/* Section 1: Introduction */}
        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            1. Introduction &amp; Scope
          </h2>
          <p>
            Welcome to the <strong>Brand Identity Generator Suite</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We are committed to protecting your privacy and ensuring transparency in how information is processed across our brand design studio, interactive tools, and website services.
          </p>
          <p>
            This Privacy Policy outlines the types of information collected when you visit our website, how that data is utilized, and how third-party advertising partners (such as <strong>Google AdSense</strong>) deliver relevant advertisements to users.
          </p>
        </section>

        {/* Section 2: Google AdSense & DoubleClick Cookies (MANDATORY FOR ADSENSE APPROVAL) */}
        <section className={`p-6 rounded-2xl border space-y-3 ${
          isDark ? 'bg-indigo-950/20 border-indigo-500/30 text-slate-200' : 'bg-indigo-50/60 border-indigo-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm">
            <Globe className="w-4 h-4" />
            <h3>2. Google AdSense &amp; Third-Party Advertising Cookies</h3>
          </div>
          <p>
            We display advertisements served by <strong>Google AdSense</strong> and affiliated third-party advertising vendors to support our free design generation tools. Please review Google&apos;s advertising practices carefully:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Third-Party Vendors:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites across the Internet.
            </li>
            <li>
              <strong>Google Advertising Cookies:</strong> Google&apos;s use of advertising cookies (including the DoubleClick DART cookie) enables it and its partners to serve targeted ads to our users based on their visits to our site and/or other sites on the Internet.
            </li>
            <li>
              <strong>Opting Out of Personalized Advertising:</strong> Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:opacity-80"
              >
                Google Ads Settings
              </a>
              . Alternatively, users can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{' '}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:opacity-80"
              >
                www.aboutads.info
              </a>
              .
            </li>
          </ul>
        </section>

        {/* Section 3: Data We Collect */}
        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            3. Information We Collect
          </h2>
          <p>We believe in data minimization. When you use our application:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Client-Side Brand Data:</strong> Company names, mission statements, audience details, color palettes, and brand assets you generate are saved locally in your web browser via <code>localStorage</code> and transient URL hashes. We do not sell or monetize your personal brand specifications.
            </li>
            <li>
              <strong>Log Files &amp; Technical Identifiers:</strong> Like most websites, our servers automatically log standard web requests, including your IP address, browser user-agent, operating system, referring pages, date/time stamps, and clickstream data to diagnose infrastructure health.
            </li>
            <li>
              <strong>Contact &amp; Support Inquiries:</strong> If you voluntarily reach out via our contact page, we collect your name, email address, company name, and message strictly to respond to your support request.
            </li>
          </ul>
        </section>

        {/* Section 4: Cookies & Web Beacons */}
        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            4. Cookies, Web Beacons &amp; Tracking Technologies
          </h2>
          <p>
            Cookies are small text files stored on your device. We use cookies and similar technologies for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Remembering your UI theme preference (Light or Dark mode).</li>
            <li>Saving your cookie consent status and preferences.</li>
            <li>Allowing Google AdSense to serve frequency-capped, fraud-protected, and relevant advertisements.</li>
          </ul>
          <p>
            You can configure your browser to reject cookies or notify you when a cookie is placed. Note that disabling essential cookies may impact specific client-side features.
          </p>
        </section>

        {/* Section 5: GDPR & EU User Consent */}
        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            5. European Economic Area (EEA) &amp; GDPR Rights
          </h2>
          <p>
            In accordance with the <strong>General Data Protection Regulation (GDPR)</strong> and Google&apos;s <strong>EU User Consent Policy</strong>, visitors residing in the European Economic Area, the UK, and Switzerland have specific rights regarding their personal information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The right to access, rectify, or erase personal data.</li>
            <li>The right to withdraw consent for advertising cookies at any time via our Cookie Settings banner.</li>
            <li>The right to object to automated profiling or lodge a complaint with a supervisory authority.</li>
          </ul>
        </section>

        {/* Section 6: CCPA / CPRA California Rights */}
        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            6. California Consumer Privacy Act (CCPA / CPRA)
          </h2>
          <p>
            Under the California Consumer Privacy Act (CCPA), California residents possess the right to know what personal data is collected, request deletion of their data, and opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information.
          </p>
          <p>
            <strong>We do not sell personal information.</strong> Third-party ad networks (such as Google) may process online identifiers for contextual and interest-based advertising under your consent.
          </p>
        </section>

        {/* Section 7: Security & Storage */}
        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            7. Data Security
          </h2>
          <p>
            We implement administrative and technical security safeguards—including HTTPS encryption, TLS data transit, and server-side secret isolation—to protect your interactions with our service.
          </p>
        </section>

        {/* Section 8: Children's Privacy */}
        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            8. Children&apos;s Privacy (COPPA Compliance)
          </h2>
          <p>
            Our services are directed at business professionals, startup founders, and design practitioners. We do not knowingly collect personal identifiable information from children under the age of 13.
          </p>
        </section>

        {/* Section 9: Contact Information */}
        <section className="space-y-2.5 border-t pt-6 border-slate-200 dark:border-slate-800">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            9. Privacy Inquiries &amp; Data Protection Officer
          </h2>
          <p>
            For questions or requests regarding this Privacy Policy or our advertising practices, please contact our data team:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <p><strong>Email:</strong> privacy@brandidentitysuite.com</p>
            <p><strong>Support Desk:</strong> Available via our interactive Contact page.</p>
            <p><strong>Address:</strong> Brand Identity Generator Suite, Digital Systems Group.</p>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
