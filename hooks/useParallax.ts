'use client'

import { useScroll, useTransform, MotionValue } from 'framer-motion'
import { RefObject } from 'react'

/**
 * useParallax
 * 
 * Generates a translated Y MotionValue relative to the scroll progress 
 * of a target ref container.
 * 
 * @param ref - The React ref of the container tracking scroll progress.
 * @param speedMultiplier - The speed of parallax. 
 *        1.0 is normal speed (no parallax). 
 *        < 1.0 (e.g. 0.5) creates background drag depth.
 *        > 1.0 (e.g. 1.5) creates foreground pull depth.
 * @param offset - Total pixel distance it should travel over the view frame (e.g., 300)
 */
export function useParallax(ref: RefObject<HTMLElement | null>, speedMultiplier: number = 1.0, offset: number = 200): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // calculate how much physical translation occurs from start of the view to the end
  const totalMovement = offset * (1 - speedMultiplier)
  
  const y = useTransform(scrollYProgress, [0, 1], [-totalMovement, totalMovement])

  return y
}
