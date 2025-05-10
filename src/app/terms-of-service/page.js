"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function TermsOfService() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/grid.svg')] bg-repeat bg-fixed bg-gradient-to-br from-blue-50 to-teal-50 dark:from-background dark:to-background/80 py-8 px-2 relative">
      {/* Back to Home Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white/80 dark:bg-card/80 text-sm font-medium text-primary hover:bg-primary/10 transition-colors shadow"
        aria-label="Back to Home"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Home
      </button>
      <div className="w-full max-w-lg bg-white/80 dark:bg-card/80 rounded-2xl shadow-xl border border-border p-6 md:p-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#14b8a6]/10 rounded-lg p-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#14b8a6"/><path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z" fill="#fff"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#14b8a6' }}>Terms of Service</h1>
            <div className="text-xs text-muted-foreground mt-1">Update 16/02/2020</div>
          </div>
        </div>
        <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <section>
            <h2 className="text-lg font-semibold mb-1" style={{ color: '#14b8a6' }}> TERMS & CONDITIONS</h2>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
              <li><b>Acceptance of Terms</b><br/>By using REED, you accept these Terms & Conditions and agree to comply with them in full.</li>
              <li><b>Eligibility</b><br/>You must be at least 10 years old or the minimum age of digital consent in your jurisdiction to use REED.</li>
              <li><b>Account Registration</b><br/>You are responsible for keeping your login credentials confidential and all activities under your account.</li>
              <li><b>Use of the Service</b><br/>You agree to use REED for lawful, non-commercial purposes. Do not misuse, hack, or interfere with the platform.</li>
              <li><b>User-Generated Content</b><br/>You retain rights to content you create (e.g., Reeds), but grant REED a royalty-free, global license to display, promote, and distribute it within the app.</li>
              <li><b>Prohibited Content</b><br/>You must not post anything illegal, harmful, hateful, misleading, infringing, or offensive.</li>
              <li><b>AI-Generated Material</b><br/>AI-generated content may not be accurate or appropriate. You use it at your own risk.</li>
              <li><b>XP, Leaderboards, and Gamification</b><br/>Gamification elements like XP or badges hold no real-world monetary value and may be modified or reset at any time.</li>
              <li><b>Suspension and Termination</b><br/>We reserve the right to suspend or delete accounts for any breach of these terms, without prior notice.</li>
              <li><b>Ownership and Intellectual Property</b><br/>REED retains all rights to its branding, technology, and non-user-generated materials.</li>
              <li><b>Modifications to the Service</b><br/>We may change or discontinue features, content, or functionality at any time.</li>
              <li><b>Disclaimer of Warranty</b><br/>REED is provided &quot;as is&quot; without any warranties. We do not guarantee uninterrupted service or error-free operation.</li>
              <li><b>Limitation of Liability</b><br/>We are not liable for any indirect, incidental, or consequential damages arising from use of REED.</li>
              <li><b>Governing Law</b><br/>These terms shall be governed by and construed in accordance with the laws of [Insert Jurisdiction].</li>
              <li><b>Updates to Terms</b><br/>We may update these Terms. Continued use of REED implies acceptance of the updated terms.</li>
            </ol>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-1" style={{ color: '#14b8a6' }}> PRIVACY POLICY</h2>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
              <li><b>Information We Collect</b><br/>We may collect:<ul className="list-disc list-inside ml-4"><li>Account information (e.g., name, email)</li><li>Usage data (e.g., time spent, content engaged)</li><li>User-generated content</li><li>Device/browser information</li><li>Cookies for analytics and performance</li></ul></li>
              <li><b>How We Use Your Information</b><br/>We use your data to:<ul className="list-disc list-inside ml-4"><li>Provide and improve the REED experience</li><li>Track learning and engagement</li><li>Communicate with you (account updates, support)</li><li>Prevent misuse and ensure platform security</li></ul></li>
              <li><b>Third-Party Tools</b><br/>We may use services such as Google Analytics or OpenAI APIs that collect usage data anonymously.</li>
              <li><b>Sharing of Information</b><br/>We don&apos;t sell your data. We may share data with:<ul className="list-disc list-inside ml-4"><li>Hosting and infrastructure providers</li><li>Legal authorities when required</li></ul></li>
              <li><b>Data Retention</b><br/>We keep your data as long as necessary for providing services or as legally required. You can request deletion at any time.</li>
              <li><b>Your Rights</b><br/>You may request:<ul className="list-disc list-inside ml-4"><li>Access to your data</li><li>Correction of inaccurate info</li><li>Deletion of your account and data</li></ul></li>
              <li><b>Children&apos;s Privacy</b><br/>REED is not intended for users under 13. We do not knowingly collect data from children.</li>
              <li><b>Security Measures</b><br/>We implement security best practices to protect your data, but cannot guarantee 100% security.</li>
              <li><b>Cookies and Tracking</b><br/>We use cookies and similar technologies to improve performance and understand usage.</li>
              <li><b>Updates to This Policy</b><br/>We may revise this Privacy Policy from time to time. Updates will be posted on this page.</li>
            </ol>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-1" style={{ color: '#14b8a6' }}>Contact Us</h2>
            <p className="text-sm text-muted-foreground">
              If you have any questions or concerns about these Terms of Service or our Privacy Policy, please contact us at <a href="mailto:support@reedapp.com" className="underline text-primary">support@reedapp.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 