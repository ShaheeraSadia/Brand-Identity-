import React from 'react';
import { motion } from 'motion/react';
import { FileCheck, Shield, AlertCircle, Scale, CheckCircle2, Globe } from 'lucide-react';

interface TermsPageProps {
  key?: React.Key;
  isDark?: boolean;
  onNavigateToStudio?: () => void;
}

export default function TermsPage({ isDark = false, onNavigateToStudio }: TermsPageProps) {
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
            <Scale className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Terms of Use &amp; Service</h1>
          <p className="text-xs text-slate-400">
            Last updated: <strong>{lastUpdated}</strong> • Binding Agreement for Brand Identity Generator Suite.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`p-8 sm:p-10 rounded-3xl border space-y-8 text-xs leading-relaxed transition-all duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the <strong>Brand Identity Generator Suite</strong> (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            2. Intellectual Property &amp; Ownership of Generated Assets
          </h2>
          <p>
            <strong>Your Commercial Ownership:</strong> All brand identities, color palettes, Google Font pairing recommendations, logo marks, social mockups, and exported PDF brand specification guides synthesized for you remain 100% your property. You are granted full commercial and non-commercial rights to use, modify, distribute, and trademark the generated outputs for your company or client work.
          </p>
          <p>
            <strong>Platform IP:</strong> The application interface, proprietary layout algorithms, mathematical scaling calculators, and software code are the intellectual property of Brand Identity Suite.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            3. Advertising &amp; Third-Party Services
          </h2>
          <p>
            Our website displays advertisements served by third-party advertising partners, including <strong>Google AdSense</strong>. By using our website, you acknowledge and agree that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Ads may be served contextually or based on user browsing history in accordance with our Privacy Policy.</li>
            <li>Users shall not click on advertisements deceitfully or use automated tools, bots, or invalid traffic mechanisms to manipulate advertising impressions.</li>
            <li>We adhere to Google AdSense Program Policies, requiring clean, clearly labeled advertisement placements.</li>
          </ul>
        </section>

        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            4. User Conduct &amp; Prohibited Uses
          </h2>
          <p>You agree not to use the platform to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Generate defamatory, abusive, infringing, or unlawful content.</li>
            <li>Interfere with, disrupt, or attack our server infrastructure or security layers.</li>
            <li>Reverse-engineer or systematically scrape generative models in violation of Google AI Studio terms.</li>
          </ul>
        </section>

        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            5. Disclaimer of Warranties
          </h2>
          <p>
            The services and all generated brand assets are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied. While we strive for design perfection, we do not guarantee that AI-generated marks are free of prior trademark conflicts in your jurisdiction. Users are encouraged to conduct standard trademark clearance before commercial filing.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            6. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, Brand Identity Suite shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </p>
        </section>

        <section className="space-y-2.5 border-t pt-6 border-slate-200 dark:border-slate-800">
          <h2 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            7. Contact Information
          </h2>
          <p>
            For any legal inquiries or questions concerning these Terms, contact: <strong>legal@brandidentitysuite.com</strong>
          </p>
        </section>
      </div>
    </motion.div>
  );
}
