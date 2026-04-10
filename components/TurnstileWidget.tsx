'use client'

import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: () => void
}

export default function TurnstileWidget({ onSuccess, onError }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!siteKey || siteKey === 'your_site_key_here') return null

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onSuccess}
      onError={onError}
      options={{ theme: 'dark', size: 'invisible' }}
    />
  )
}
