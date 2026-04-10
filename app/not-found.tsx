export default function NotFound() {
  const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE

  return (
    <div className="min-h-screen bg-palace-black flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <p className="font-display text-[120px] md:text-[200px] font-light leading-none text-white/5 select-none absolute -translate-x-1/2 left-1/2 -translate-y-1/2 top-1/2 pointer-events-none">
          404
        </p>

        <p className="font-body text-xs tracking-[0.35em] uppercase text-gold-muted mb-6">
          QASR AFGHAN
        </p>

        <p className="text-gold text-3xl mb-4">◆</p>

        <h1 className="font-display text-4xl md:text-5xl font-light text-white tracking-wide mb-4">
          Lost in the Palace
        </h1>

        <p className="font-body text-sm text-white/40 max-w-sm leading-relaxed mb-10">
          The page you are looking for does not exist or has been moved. Let us guide you back.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/" className="bg-gold text-palace-black font-body font-semibold text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-none hover:bg-gold-light transition-colors">
            Return Home
          </a>
          <a href="/#menu" className="border border-gold/40 text-gold font-body text-xs tracking-[0.2em] uppercase px-8 py-4 rounded-none hover:border-gold hover:bg-gold/10 transition-all">
            View Menu
          </a>
        </div>

        {phone && (
          <p className="font-body text-xs text-white/20 mt-10">
            Need help?{' '}
            <a href={`tel:${phone}`} className="text-gold/50 hover:text-gold transition-colors">
              {phone}
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
