'use client'

import { useState, useEffect } from 'react'
import { motion, useTransform, useMotionValue } from 'framer-motion'
import Image from 'next/image'
import { optimizedImage } from '@/sanity.client'
import { CATEGORY_LABELS } from '@/lib/fetchData'
import AddToCartButton from './AddToCartButton'
import KebabBuilder from './KebabBuilder'
import type { MenuItem } from '@/types/sanity'

interface MenuItemCardProps {
  item: MenuItem
  index: number
}

export default function MenuItemCard({ item, index }: MenuItemCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState('')
  
  // Motion value for Y rotation
  const rotateY = useMotionValue(0)

  // Tie the gold edge opacity to the rotateY rotation
  const edgeOpacity = useTransform(rotateY, [-180, -90, -0], [0, 1, 0])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Drive the motion value
    rotateY.set(flipped ? -180 : 0)
  }, [flipped, rotateY])

  const toggleFlip = () => {
    if (!isMobile) return // Hover handles desktop
    setFlipped(f => !f)
  }

  // Common styling structures
  const cardHeightClass = isMobile ? 'h-auto' : 'h-[460px]'

  // If mobile, we just render a flattened grid card without 3D context as requested
  if (isMobile) {
    return (
      <div 
        className="w-full bg-palace-smoke border border-palace-stone flex flex-col mb-4 overflow-hidden"
      >
        <div className="relative aspect-video">
          {item.image ? (
            <>
              <Image src={optimizedImage(item.image, { width: 600, height: 400 })} alt={item.name} fill sizes="100vw" style={{ objectFit: 'cover' }} />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-palace-smoke to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-palace-charcoal flex items-center justify-center">
              <span className="text-gold/20 text-2xl">◆</span>
            </div>
          )}
          {item.isSignature && (
            <div className="absolute top-3 right-3 bg-palace-maroon text-cream font-body text-[9px] tracking-widest uppercase px-2 py-1">
              ✦ Signature
            </div>
          )}
          <div className="absolute top-3 left-3 bg-palace-black/70 backdrop-blur-sm px-2 py-1">
            <span className="text-gold-muted font-body text-[9px] tracking-widest uppercase">
              {CATEGORY_LABELS[item.category] ?? item.category}
            </span>
          </div>
        </div>

        <div className="px-4 pt-4 pb-5 flex flex-col flex-1">
          <h3 className="font-display text-lg font-light text-cream">{item.name}</h3>
          <span className="font-display text-xl text-gold mt-1">${item.price?.toFixed(2)}</span>
          <p className="font-body text-sm text-cream/45 mt-2 line-clamp-2 leading-relaxed">
            {item.description || 'A palace-worthy dish, prepared fresh daily with authentic Afghan spices.'}
          </p>
          
          <textarea 
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Special Instructions (e.g. no onions)"
            className="w-full bg-transparent border border-palace-stone/30 text-white text-xs px-3 py-2 mt-4 focus:outline-none focus:border-gold resize-none form-input"
            rows={2}
          />

          <div className="mt-4 pt-4 border-t border-palace-stone/50 w-full">
             <AddToCartButton
                item={{
                  id: item._id,
                  name: item.name,
                  category: item.category,
                  price: item.price,
                  prepTime: item.prepTime,
                  image: item.image ? optimizedImage(item.image, { width: 128, height: 128 }) : undefined,
                  specialInstructions
                }}
                variant="full"
              />
          </div>
        </div>
      </div>
    )
  }

  // DESKTOP FULL 3D LAYOUT
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ perspective: '1000px' }}
      className={`w-full relative ${cardHeightClass}`}
      onHoverStart={() => !isMobile && setFlipped(true)}
      onHoverEnd={() => !isMobile && setFlipped(false)}
      onClick={isMobile ? toggleFlip : undefined}
    >
      <motion.div
        className="w-full h-full absolute top-0 left-0"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? -180 : 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      >
        {/* GOLD EDGE SHIMMER LAYER (sits in the middle) */}
        <motion.div 
          className="absolute z-[5] w-[2px] h-[98%] top-[1%]" 
          style={{ opacity: edgeOpacity, right: '-1px', background: 'linear-gradient(to bottom, transparent, #C9A84C, transparent)' }} 
        />

        {/* ── FRONT FACE ── */}
        <div 
          className="absolute inset-0 bg-palace-smoke border border-palace-stone" 
          style={{ backfaceVisibility: 'hidden', zIndex: flipped ? 1 : 2 }}
        >
          {/* Top 60% Image */}
          <div className="relative h-[60%]">
            {item.image ? (
              <>
                <Image src={optimizedImage(item.image, { width: 600, height: 400 })} alt={item.name} fill sizes="(max-width: 600px) 100vw, 600px" style={{ objectFit: 'cover' }} />
                <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-palace-smoke to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-palace-charcoal flex items-center justify-center">
                <span className="text-gold/20 text-2xl">◆</span>
              </div>
            )}
            
            {item.isSignature && (
              <div className="absolute top-3 right-3 bg-palace-maroon text-cream font-body text-[9px] tracking-widest uppercase px-2 py-1">
                ✦ Signature
              </div>
            )}
            <div className="absolute top-3 left-3 bg-palace-black/70 backdrop-blur-sm px-2 py-1">
              <span className="text-gold-muted font-body text-[9px] tracking-widest uppercase">
                {CATEGORY_LABELS[item.category] ?? item.category}
              </span>
            </div>
          </div>

          {/* Bottom 40% Typography */}
          <div className="h-[40%] bg-palace-smoke px-5 pt-4 pb-5 relative">
            <h3 className="font-display text-lg font-light text-cream">{item.name}</h3>
            <div className="font-display text-xl text-gold mt-1">${item.price?.toFixed(2)}</div>
            <p className="absolute bottom-3 right-4 font-body text-[9px] text-cream/20 tracking-wide uppercase">
              Hover to explore
            </p>
          </div>
        </div>


        {/* ── BACK FACE ── */}
        <div 
          className="absolute inset-0 bg-palace-smoke"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)',
            border: '1px solid rgba(125,26,26,0.3)',
            zIndex: flipped ? 2 : 1
          }}
        >
          {flipped && <KebabBuilder />}

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
          
          <div className="p-5 flex flex-col h-full">
            {/* Top Section */}
            <div>
              <h3 className="font-display text-xl font-light text-cream">{item.name}</h3>
              <div className="font-display text-2xl text-gold mt-1">${item.price?.toFixed(2)}</div>
              <div className="flex items-center w-full mt-4">
                <div className="h-px bg-palace-stone flex-1" />
                <span className="text-gold/50 text-[10px] mx-3">◆</span>
                <div className="h-px bg-palace-stone flex-1" />
              </div>
            </div>

            {/* Middle Section */}
            <div className="flex-1 mt-4 relative">
              {item.description ? (
                <p className="font-body text-sm text-cream/60 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              ) : (
                <p className="text-cream/30 italic font-body text-sm leading-relaxed line-clamp-2">
                  A palace-worthy dish, prepared fresh daily with authentic Afghan spices.
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {item.spiceLevel && item.spiceLevel !== 'none' && (
                  <span className="text-[9px] tracking-widest uppercase border border-red-500/30 text-red-400 px-2 py-0.5 font-body">
                    {item.spiceLevel} 🌶️
                  </span>
                )}
                {item.dietary?.map((tag, i) => (
                  <span key={i} className="text-[9px] tracking-widest uppercase border border-gold/20 text-gold/50 px-2 py-0.5 font-body">
                    {tag}
                  </span>
                ))}
              </div>

              {item.includes && item.includes.length > 0 && (
                <div className="mt-3">
                  <span className="font-body text-[10px] uppercase tracking-widest text-[#C9A84C]">Includes: </span>
                  <span className="font-body text-xs text-cream/60">{item.includes.join(', ')}</span>
                </div>
              )}

              <textarea 
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Special Instructons (e.g. no onions)"
                className="w-full bg-transparent border border-palace-stone/30 text-white text-xs px-3 py-2 mt-3 focus:outline-none focus:border-gold resize-none form-input relative z-10"
                rows={2}
              />
            </div>

            {/* Bottom Section */}
            <div className="mt-auto w-full pt-4">
              <AddToCartButton
                item={{
                  id: item._id,
                  name: item.name,
                  category: item.category,
                  price: item.price,
                  prepTime: item.prepTime,
                  image: item.image ? optimizedImage(item.image, { width: 128, height: 128 }) : undefined,
                  specialInstructions
                }}
                variant="full"
              />
            </div>
          </div>
        </div>

      </motion.div>
    </motion.div>
  )
}
