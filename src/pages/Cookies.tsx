import { Link } from "react-router-dom";

const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <section className="mb-6">
    <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-1 mb-2">
      {num}. {title}
    </h2>
    <div className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400 space-y-1.5">
      {children}
    </div>
  </section>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-2">
    <span className="text-gray-400 dark:text-gray-600 shrink-0 mt-0.5">•</span>
    <span>{children}</span>
  </div>
);

const Cookies = () => (
  <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full py-10 px-4">
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8 pb-4 border-b border-gray-200 dark:border-white/10">
        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-600 font-semibold mb-1">
          KATISHA ONLINE LTD
        </p>
        <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
          Cookie Policy
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
          <p className="text-[10px] text-gray-400 dark:text-gray-600">Effective: 13 May 2026</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-600">Published at www.katisha.online/cookies</p>
          <a href="mailto:clmntmugisha@gmail.com" className="text-[10px] text-brand hover:underline">clmntmugisha@gmail.com</a>
        </div>
      </div>

      <Section num="1" title="What Are Cookies">
        <p>
          Cookies are small text files placed on your device (computer, tablet, or mobile phone) when you visit a website or use a web application.
          They help the website remember information about your visit and your preferences.
          Similar technologies such as local storage and session storage work in the same way.
        </p>
        <p>
          KATISHA ONLINE Ltd uses cookies and session storage in our web application at{" "}
          <a href="https://www.katisha.online" className="text-brand hover:underline">www.katisha.online</a>.
          This policy explains which cookies we use, what they do, and how you can manage them.
        </p>
      </Section>

      <Section num="2" title="Cookies We Use">
        <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden mt-1">
          {/* Header row */}
          <div className="grid grid-cols-4 gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5">
            {["Cookie Name", "Type", "Purpose", "Duration"].map((h) => (
              <span key={h} className="text-[9px] font-black uppercase tracking-wide text-gray-500 dark:text-gray-500">{h}</span>
            ))}
          </div>
          {[
            {
              name: "katisha_session",
              type: "Essential",
              purpose: "Maintains your authenticated session so you remain logged in while using the platform. Without this cookie the platform cannot identify who you are between page loads.",
              duration: "15 min, refreshed on activity",
            },
            {
              name: "katisha_refresh",
              type: "Essential",
              purpose: "Stores your refresh token securely so your access session can be renewed without requiring you to log in again on every visit.",
              duration: "8 hours rolling",
            },
            {
              name: "katisha_csrf",
              type: "Essential",
              purpose: "Cross-site request forgery protection token. Prevents malicious websites from submitting requests to Katisha on your behalf without your knowledge.",
              duration: "Session only",
            },
            {
              name: "katisha_prefs",
              type: "Functional",
              purpose: "Remembers your language preference and display settings so you do not need to set them again on each visit.",
              duration: "1 year",
            },
            {
              name: "katisha_recent",
              type: "Functional",
              purpose: "Stores your recently searched routes locally for a faster booking experience. This data never leaves your device and is not sent to our servers.",
              duration: "90 days",
            },
          ].map((row, i) => (
            <div key={row.name} className={`grid grid-cols-4 gap-2 px-3 py-2 ${i % 2 === 0 ? '' : 'bg-gray-50 dark:bg-white/[0.02]'}`}>
              <span className="text-[10px] font-mono font-semibold text-gray-700 dark:text-gray-300 break-all">{row.name}</span>
              <span className={`text-[10px] font-semibold ${row.type === 'Essential' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>{row.type}</span>
              <span className="text-[10px] text-gray-600 dark:text-gray-400 col-span-1">{row.purpose}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-500">{row.duration}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section num="3" title="What We Do Not Use">
        <p>We are committed to using only cookies that are necessary or that directly improve your experience. We do <span className="font-semibold text-gray-700 dark:text-gray-300">not</span> use:</p>
        <Bullet>Advertising or retargeting cookies of any kind</Bullet>
        <Bullet>Third-party analytics cookies (such as Google Analytics or Facebook Pixel)</Bullet>
        <Bullet>Social media tracking or sharing cookies</Bullet>
        <Bullet>Cross-site behavioural tracking</Bullet>
        <Bullet>Device fingerprinting beyond standard session management</Bullet>
      </Section>

      <Section num="4" title="Essential Cookies">
        <p>
          The essential cookies (<span className="font-mono text-[10px]">katisha_session</span>, <span className="font-mono text-[10px]">katisha_refresh</span>, <span className="font-mono text-[10px]">katisha_csrf</span>) are strictly necessary for our platform to function.
          You cannot opt out of these without breaking core functionality such as staying logged in, booking tickets, and processing payments.
          By using our platform you agree to the placement of these essential cookies.
        </p>
      </Section>

      <Section num="5" title="Functional Cookies">
        <p>
          Functional cookies (<span className="font-mono text-[10px]">katisha_prefs</span>, <span className="font-mono text-[10px]">katisha_recent</span>) enhance your experience but are not strictly necessary.
          You may disable these through your browser settings or through Account Settings &gt; Privacy in our app.
          Disabling functional cookies will not prevent you from booking tickets but may reduce convenience.
        </p>
      </Section>

      <Section num="6" title="How to Manage Cookies">
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">Browser settings:</span> Most modern browsers allow you to view, delete, and block cookies. Visit your browser's Help section for instructions specific to your browser (Chrome, Firefox, Safari, Edge).</Bullet>
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">App settings:</span> Within the Katisha app, navigate to Account &gt; Privacy Settings to manage your functional cookie and storage preferences.</Bullet>
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">Deleting your account:</span> Deleting your Katisha account will remove all session data, tokens, and preferences stored on our servers.</Bullet>
        <p className="mt-1">Please note that blocking or deleting essential cookies will prevent you from logging in and using our ticketing services.</p>
      </Section>

      <Section num="7" title="Changes to This Policy">
        <p>
          We may update this Cookie Policy to reflect changes in our use of cookies. The current version is always available at{" "}
          <a href="https://www.katisha.online/cookies" className="text-brand hover:underline">www.katisha.online/cookies</a>.
        </p>
      </Section>

      <Section num="8" title="Contact">
        <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden mt-1">
          {[
            ["Company", "KATISHA ONLINE Ltd"],
            ["DPO", "Clement MUGISHA — clmntmugisha@gmail.com"],
            ["Address", "Kacyiru, Gasabo, Umujyi wa Kigali, Rwanda"],
          ].map(([label, value], i) => (
            <div key={i} className={`flex gap-3 px-3 py-2 ${i % 2 === 0 ? 'bg-gray-50 dark:bg-white/[0.02]' : ''}`}>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wide w-20 shrink-0 pt-0.5">{label}</span>
              <span className="text-[11px] text-gray-700 dark:text-gray-300">{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer nav */}
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-white/10 flex gap-4">
        <Link to="/privacy" className="text-[10px] text-brand hover:underline">Privacy Policy</Link>
        <Link to="/" className="text-[10px] text-gray-400 hover:text-brand transition-colors">← Back to home</Link>
      </div>
    </div>
  </div>
);

export default Cookies;
