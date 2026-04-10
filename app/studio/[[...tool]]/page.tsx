// ⚠️  OWNER ACCESS ONLY — navigate to /studio to manage content.
// This route should be protected in production (add auth in a later phase).
'use client'
import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'
export const dynamic = 'force-dynamic'
export default function StudioPage() {
  return <NextStudio config={config} />
}
