'use client'

import { useEffect } from 'react'

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
  }, [error])

  const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE

  return (
    <div className="min-h-screen bg-palace-black flex flex-col items-center justify-center px-6 text-center">
      <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">
        QASR AFGHAN
      </p>
      <h1 className="font-display text-4xl font-light text-white tracking-wide">
        Something went wrong
      </h1>
      <p className="font-body text-sm text-white/40 max-w-sm mt-4 leading-relaxed">
        We could not process your order online. Please call us and we will take your order personally.
      </p>
      {phone && (
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-2 bg-gold text-palace-black font-body font-bold text-sm tracking-[0.2em] uppercase px-10 py-4 mt-8 rounded-none"
        >
          📞  {phone}
        </a>
      )}
      <button
        onClick={reset}
        className="font-body text-xs text-white/20 underline mt-6 hover:text-white/40 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
