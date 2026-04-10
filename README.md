# Qasr Afghan — Digital Palace

Welcome to the digital storefront for **Qasr Afghan**, Buffalo's premier luxury Afghan restaurant. This completely bespoke Next.js web application was built from the ground up to reflect the regal, authentic, and modern experience of our physical location.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS with custom `palace` and `gold` color systems
- **Animations**: Framer Motion & Three.js (Hero Particles)
- **CMS / Database**: Sanity.io
- **Emails / Notifications**: Resend
- **Security**: Cloudflare Turnstile

## 💎 Features

- **Custom Ordering System**: A fully client-side shopping cart with browser persistence (`sessionStorage`), removing dependency on third-party aggregators while securing order processing locally.
- **3D-Lite UI**: A dynamic, geometric particle mesh built natively with `three.js` to create the ultimate "Palace" atmosphere without compromising performance.
- **Catering Management**: A dedicated form protected by Cloudflare Turnstile that routes priority emails directly to the owner for custom event curation.
- **CMS Synchronization**: Menu categories, dishes, catering tiers, and real-time testimonials are managed entirely within a native, custom-built Sanity Studio desk.

## 📦 Deployment Instructions (Vercel)

1. Clone or clone this repository to your Vercel account.
2. In the Vercel project settings, set the **Framework Preset** to Next.js.
3. Securely inject the following environment variables (refer to `.env.local.example` for context):
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `NEXT_PUBLIC_SANITY_API_VERSION`
   - `SANITY_API_READ_TOKEN`
   - `SANITY_API_WRITE_TOKEN`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (Must be a verified domain on Resend)
   - `OWNER_NOTIFICATION_EMAIL`
   - `RESEND_ENABLED` (Set to "true")
   - `NEXT_PUBLIC_RESTAURANT_PHONE`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Click Deploy. Vercel will process the build and connect to Sanity natively. Next.js handles `.webp` image processing intrinsically.

## 🛠 Develop Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. To access the Sanity Studio natively and manage website content, navigate to `http://localhost:3000/studio`.
