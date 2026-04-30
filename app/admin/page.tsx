'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'qasr2024'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true)
    } else {
      setError(true)
      setShake(true)
      setPassword('')
      setTimeout(() => setShake(false), 600)
    }
  }

  const handleDownloadThisMonth = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    window.location.href = `/api/export-orders?key=${password}&from=${firstDay}&to=${lastDay}`
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-palace-black flex items-center justify-center px-6 relative overflow-hidden">
        <div className="grain-overlay" />
        <div className="relative z-10 w-full max-w-md text-center">
          <p className="font-body text-[10px] tracking-[0.4em] uppercase text-gold-muted mb-3">
            QASR AFGHAN
          </p>
          <h1 className="font-display text-4xl font-light text-cream mb-10">
            Welcome, Admin
          </h1>

          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/studio"
              className="w-full bg-gold text-palace-black font-body font-semibold text-xs tracking-[0.2em] uppercase py-4 rounded-none hover:bg-gold-light transition-colors duration-200"
            >
              Go to Studio →
            </Link>

            <button
              onClick={() => window.location.href = `/api/export-orders?key=${password}`}
              className="w-full border border-gold text-gold font-body font-semibold text-xs tracking-[0.2em] uppercase py-4 rounded-none hover:bg-gold/10 transition-colors duration-200"
            >
              Download All Orders (CSV) ↓
            </button>

            <button
              onClick={handleDownloadThisMonth}
              className="font-body text-[10px] text-gold/50 hover:text-gold transition-colors tracking-widest uppercase mt-4"
            >
              Download This Month Only
            </button>
          </div>

          <p className="font-body text-[10px] text-cream/15 mt-12 tracking-wide">
            <button onClick={() => setIsLoggedIn(false)} className="hover:text-cream/30 transition-colors uppercase tracking-widest">
              Logout
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-palace-black flex items-center justify-center px-6 relative overflow-hidden">
      <div className="grain-overlay" />
      
      <div className={`w-full max-w-sm relative z-10 ${shake ? 'animate-shake' : ''}`}>
        
        {/* Logo / branding */}
        <div className="text-center mb-10">
          <p className="font-body text-[10px] tracking-[0.4em] uppercase text-gold-muted mb-3">
            QASR AFGHAN
          </p>
          <h1 className="font-display text-3xl font-light text-cream">
            Admin Access
          </h1>
          <p className="font-body text-xs text-cream/30 mt-2">
            Staff only — enter your admin password
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false) }}
            placeholder="Enter admin password"
            autoFocus
            className="w-full bg-transparent border border-palace-stone px-5 py-4 text-cream font-body text-sm rounded-none placeholder:text-cream/20 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-200 mb-3"
          />
          
          {error && (
            <p className="font-body text-xs text-red-400/80 mb-3 text-center animate-fade-up">
              Incorrect password. Please try again.
            </p>
          )}
          
          <button
            type="submit"
            className="w-full bg-gold text-palace-black font-body font-semibold text-xs tracking-[0.2em] uppercase py-4 rounded-none hover:bg-gold-light transition-colors duration-200"
          >
            Enter Admin Panel →
          </button>
        </form>
        
        <p className="text-center font-body text-[10px] text-cream/15 mt-8 tracking-wide">
          <Link href="/" className="hover:text-cream/30 transition-colors uppercase tracking-widest">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}
