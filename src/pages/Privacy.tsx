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

const Privacy = () => (
  <div className="bg-[#F8FAFC] dark:bg-[#0B1120] min-h-full py-10 px-4">
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8 pb-4 border-b border-gray-200 dark:border-white/10">
        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-600 font-semibold mb-1">
          KATISHA ONLINE LTD
        </p>
        <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
          Website &amp; Application Privacy Policy
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
          <p className="text-[10px] text-gray-400 dark:text-gray-600">Effective: 13 May 2026</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-600">Kacyiru, Gasabo, Kigali, Rwanda</p>
          <a href="mailto:clmntmugisha@gmail.com" className="text-[10px] text-brand hover:underline">clmntmugisha@gmail.com</a>
        </div>
      </div>

      <Section num="1" title="Introduction">
        <p>
          This Policy is published by KATISHA ONLINE Ltd in compliance with Article 42 of Rwanda's Law No. 058/2021
          relating to the Protection of Personal Data and Privacy. It applies to all users of{" "}
          <a href="https://www.katisha.online" className="text-brand hover:underline">www.katisha.online</a> and
          the Katisha App.
        </p>
        <p>
          By accessing or using our platform you acknowledge that you have read and understood this Policy.
          If you do not agree, please discontinue use of our services.
        </p>
      </Section>

      <Section num="2" title="Information We Collect Automatically">
        <p>When you visit our website or use our application, we automatically collect:</p>
        <Bullet>IP address and approximate geographic location (country and city level only — not your precise location)</Bullet>
        <Bullet>Browser type, version, and device type (mobile, tablet, or desktop)</Bullet>
        <Bullet>Operating system and version</Bullet>
        <Bullet>Pages visited, time spent on each page, and navigation patterns</Bullet>
        <Bullet>Referring URL — the page that brought you to our platform</Bullet>
        <Bullet>Session duration, click events, and feature usage patterns</Bullet>
        <Bullet>Error logs and crash reports for technical support purposes</Bullet>
        <p className="mt-1">
          This information is collected using server logs and session identifiers.{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">We do not</span> use advertising
          tracking pixels, cross-site tracking cookies, or third-party analytics services such as Google Analytics.
        </p>
      </Section>

      <Section num="3" title="Information You Provide to Us">
        <p>You provide us with personal data when you:</p>
        <Bullet>Register for an account — name, email address, phone number, and password</Bullet>
        <Bullet>Book a ticket — boarding stop, alighting stop, travel date, number of seats, and (for guests) your name and phone number</Bullet>
        <Bullet>Top up your wallet — phone number used for MoMo or Airtel Money transaction</Bullet>
        <Bullet>Update your profile — optional profile photograph and notification preferences</Bullet>
        <Bullet>Contact our support team — any information you include in your message</Bullet>
        <Bullet>Provide feedback — any information you include in a review or feedback form</Bullet>
      </Section>

      <Section num="4" title="How We Use Your Information">
        <Bullet>To provide, maintain, and improve our intercity bus ticketing platform</Bullet>
        <Bullet>To process ticket bookings and coordinate payments through MTN MoMo and Airtel Money</Bullet>
        <Bullet>To manage your digital wallet — top-ups, deductions, and transaction history</Bullet>
        <Bullet>To send booking confirmations, departure reminders (1 hour before departure), and boarding notifications via SMS</Bullet>
        <Bullet>To notify you of refunds when a booking window expires before payment is confirmed</Bullet>
        <Bullet>To onboard transport operators and process their monthly billing invoices</Bullet>
        <Bullet>To respond to your support requests and complaints</Bullet>
        <Bullet>To detect, investigate, and prevent fraud, abuse, and security incidents</Bullet>
        <Bullet>To analyse platform usage patterns and improve the user experience</Bullet>
        <Bullet>To comply with our legal obligations under Rwandan law including RRA, RURA, and NCSA requirements</Bullet>
      </Section>

      <Section num="5" title="Legal Basis for Processing">
        <p>We process your personal data on the following legal grounds under the DPP Law:</p>
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">Consent (Articles 6 and 7):</span> When you create an account or provide optional information such as a profile photograph.</Bullet>
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">Contractual necessity:</span> To fulfil your ticket booking contract, process payments, manage your wallet, and deliver SMS notifications required for the service.</Bullet>
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">Legitimate interest:</span> For platform security monitoring, fraud prevention, and anonymised analytics, provided these interests do not override your fundamental rights.</Bullet>
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">Legal obligation:</span> To comply with requirements from Rwanda Revenue Authority (RRA), Rwanda Utilities Regulatory Authority (RURA), and the National Cyber Security Authority (NCSA).</Bullet>
      </Section>

      <Section num="6" title="Data Sharing">
        <p>We share your personal data only as described in this Policy. In summary:</p>
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">Transport operators</span> receive your name, phone number, and booking details for the specific trip you have booked — they see no data about bookings on other operators' services.</Bullet>
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">MTN Rwanda and Airtel Rwanda</span> receive your phone number and payment amount solely for payment processing. They do not receive any other personal data from us.</Bullet>
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">ITECPAY Ltd</span> receives your phone number and message content solely to deliver SMS notifications on our behalf.</Bullet>
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">Contabo GmbH (Germany)</span> hosts all our data infrastructure. A Data Processing Agreement is in place governing their handling of your data.</Bullet>
        <Bullet><span className="font-semibold text-gray-700 dark:text-gray-300">Regulatory authorities</span> (RURA, RRA, NCSA) receive data only to the extent required by law.</Bullet>
        <p className="mt-1">
          We do <span className="font-semibold text-gray-700 dark:text-gray-300">not</span> sell personal data.
          We do <span className="font-semibold text-gray-700 dark:text-gray-300">not</span> share data with advertisers or for marketing purposes without your explicit consent.
        </p>
      </Section>

      <Section num="7" title="Data Retention">
        <p>
          We retain personal data only for as long as necessary to fulfil the purpose for which it was collected or as required by law.
          As a summary: ticket and payment records are kept for 5 years for tax compliance; account data is kept for the duration of your account plus 2 years; SMS logs are deleted after 90 days.
        </p>
      </Section>

      <Section num="8" title="Your Rights">
        <p>
          You have rights under the DPP Law including the right to access, rectify, erase, port, and object to the processing of your data.
          To exercise any of these rights contact us at{" "}
          <a href="mailto:clmntmugisha@gmail.com" className="text-brand hover:underline">clmntmugisha@gmail.com</a>.
          We respond to all requests within 30 days. You may also lodge a complaint with NCSA at{" "}
          <a href="https://dpo.gov.rw" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">dpo.gov.rw</a>.
        </p>
      </Section>

      <Section num="9" title="Children">
        <p>
          Our platform is not directed at persons under the age of 16. We do not knowingly collect personal data from children.
          If you believe we have inadvertently collected data from a person under 16, please contact us at{" "}
          <a href="mailto:clmntmugisha@gmail.com" className="text-brand hover:underline">clmntmugisha@gmail.com</a> and we will delete it promptly.
        </p>
      </Section>

      <Section num="10" title="Third-Party Links">
        <p>
          Our platform may contain links to third-party websites including transport operator websites and payment provider pages.
          We are not responsible for the privacy practices of those third parties.
          We encourage you to read the privacy policies of any website you visit.
        </p>
      </Section>

      <Section num="11" title="Changes to This Policy">
        <p>
          We may update this Policy at any time. We will provide reasonable advance notice of material changes through the platform or by email to your registered address.
        </p>
      </Section>

      <Section num="12" title="Contact">
        <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden mt-1">
          {[
            ["Data Controller", "KATISHA ONLINE Ltd"],
            ["Address", "Kacyiru, Gasabo, Umujyi wa Kigali, Rwanda"],
            ["Privacy email", "clmntmugisha@gmail.com"],
            ["DPO", "Clement MUGISHA — clmntmugisha@gmail.com — +250 789428456"],
            ["Regulator", "NCSA Data Protection Office — dpo.gov.rw — dpp@ncsa.gov.rw"],
          ].map(([label, value], i) => (
            <div key={i} className={`flex gap-3 px-3 py-2 ${i % 2 === 0 ? 'bg-gray-50 dark:bg-white/[0.02]' : ''}`}>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wide w-28 shrink-0 pt-0.5">{label}</span>
              <span className="text-[11px] text-gray-700 dark:text-gray-300">{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer nav */}
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-white/10 flex gap-4">
        <Link to="/cookies" className="text-[10px] text-brand hover:underline">Cookie Policy</Link>
        <Link to="/" className="text-[10px] text-gray-400 hover:text-brand transition-colors">← Back to home</Link>
      </div>
    </div>
  </div>
);

export default Privacy;
