'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export default function NavigationProgressBar() {
  return (
    <ProgressBar
      height="2px"
      color="#C9A84C"
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}
