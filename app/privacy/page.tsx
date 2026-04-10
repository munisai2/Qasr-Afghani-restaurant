import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Qasr Afghan',
  robots: { index: false, follow: false },
}

export default function PrivacyPage() {
  const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE
  const restaurantName = process.env.NEXT_PUBLIC_RESTAURANT_NAME ?? 'Qasr Afghan'

  return (
    <div className="min-h-screen bg-palace-black">
      {/* Header */}
      <div className="border-b border-palace-stone py-20 px-6 text-center">
        <a href="/" className="font-body text-xs tracking-[0.3em] uppercase text-gold-muted hover:text-gold transition-colors">
          ← Back to {restaurantName}
        </a>
        <h1 className="font-display text-4xl md:text-5xl font-light text-white tracking-wide mt-6">
          Privacy Policy
        </h1>
        <p className="font-body text-xs text-white/30 mt-3">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Body */}
      <article className="max-w-2xl mx-auto px-6 py-16 space-y-10">
        <Section title="Information We Collect">
          <p>When you place an order through our website, we collect the following information:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Your name and contact details (phone number, email address if provided)</li>
            <li>Your order details and special requests</li>
            <li>Basic analytics data to improve the website experience</li>
          </ul>
        </Section>

        <Section title="How We Use Your Information">
          <p>We use your personal information solely for the following purposes:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>To process and fulfill your food orders</li>
            <li>To communicate with you about your order status</li>
            <li>To send email receipts (only if you provide your email)</li>
            <li>To respond to catering inquiries</li>
            <li>To improve our website and ordering experience through analytics</li>
          </ul>
        </Section>

        <Section title="Analytics">
          <p>
            We use Vercel Analytics and Speed Insights to understand how our website is used.
            This data is anonymized and helps us improve page load times and user experience.
            No personally identifiable information is shared with analytics providers.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Our website uses minimal cookies strictly for functionality:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Session storage for your active order (cleared when you close the tab)</li>
            <li>A cookie preference flag stored in your browser</li>
          </ul>
          <p>We do not use advertising cookies or sell your data to third parties.</p>
        </Section>

        <Section title="Data Sharing">
          <p>
            We do not sell, trade, or otherwise transfer your personal information to outside parties.
            Your order information is stored securely and accessed only by {restaurantName} staff
            for order fulfillment purposes.
          </p>
        </Section>

        <Section title="Data Retention">
          <p>
            Order records are retained for business accounting purposes. You may request
            deletion of your personal data at any time by contacting us.
          </p>
        </Section>

        <Section title="Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Request access to the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </Section>

        <Section title="Contact Us">
          <p>
            For any privacy-related questions or data requests, please contact us:
          </p>
          <div className="border border-palace-stone bg-palace-smoke p-4 mt-3 space-y-2">
            <p className="font-body text-sm text-white/60">{restaurantName}</p>
            {phone && (
              <p className="font-body text-sm">
                Phone:{' '}
                <a href={`tel:${phone}`} className="text-gold hover:text-gold-light transition-colors">
                  {phone}
                </a>
              </p>
            )}
          </div>
        </Section>
      </article>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl font-light text-white tracking-wide mb-3 border-l-2 border-gold pl-4">
        {title}
      </h2>
      <div className="font-body text-sm text-white/50 leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  )
}
