'use client'

import Script from 'next/script'

interface GloriaFoodScriptProps {
  enabled: boolean
}

export default function GloriaFoodScript({ enabled }: GloriaFoodScriptProps) {
  if (!enabled) return null

  return (
    <Script
      id="gloriafood-loader"
      src="https://www.fbgcdn.com/embedder/js/ewm2.js"
      strategy="lazyOnload"
      defer
      async
    />
  )
}
