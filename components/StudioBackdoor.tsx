'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function StudioBackdoor() {
  const router = useRouter()
  const [clickCount, setClickCount] = useState(0)
  const [lastClick, setLastClick] = useState(0)

  function handleClick() {
    const now = Date.now()
    const newCount = (now - lastClick < 1500) ? clickCount + 1 : 1
    setClickCount(newCount)
    setLastClick(now)
    if (newCount >= 3) {
      setClickCount(0)
      router.push('/studio')
    }
  }

  return (
    <span
      onClick={handleClick}
      title=""
      aria-hidden="true"
      style={{
        color: 'rgba(201, 168, 76, 0.12)',
        fontSize: '10px',
        cursor: 'default',
        userSelect: 'none',
        transition: 'color 0.3s',
        padding: '4px',
      }}
      onMouseDown={(e) => { e.currentTarget.style.color = 'rgba(201, 168, 76, 0.5)' }}
      onMouseUp={(e) => { const el = e.currentTarget; setTimeout(() => { if (el) el.style.color = 'rgba(201, 168, 76, 0.12)' }, 200) }}
    >
      ◆
    </span>
  )
}
