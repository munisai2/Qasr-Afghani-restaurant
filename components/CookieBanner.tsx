'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('qasr-cookies-accepted')
    if (!accepted) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('qasr-cookies-accepted', 'true')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('qasr-cookies-accepted', 'declined')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-[300] bg-palace-charcoal/98 backdrop-blur-md border-t border-gold/15 px-6 py-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, delay: 2 }}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="font-body text-xs text-white/50 max-w-lg leading-relaxed">
              🍪 We use cookies to improve your experience and analyze site traffic.{' '}
              <a href="/privacy" className="text-gold/60 hover:text-gold underline transition-colors">
                Learn more
              </a>
            </p>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={decline}
                className="border border-palace-stone text-white/30 font-body text-xs tracking-wide px-4 py-2 rounded-none hover:border-gold/30 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="bg-gold text-palace-black font-body text-xs tracking-[0.15em] uppercase px-5 py-2 rounded-none font-medium"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
