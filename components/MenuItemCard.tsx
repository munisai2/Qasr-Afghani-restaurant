'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { optimizedImage } from '@/sanity.client'
import { CATEGORY_LABELS } from '@/lib/fetchData'
import { useModal } from '@/context/ModalContext'
import AddToCartButton from './AddToCartButton'
import type { MenuItem } from '@/types/sanity'

interface MenuItemCardProps {
  item: MenuItem
  index: number
}

const cardVariants = {
  rest: { y: 0, boxShadow: '0 0 0 0 rgba(201,168,76,0)' },
  hover: { y: -8, boxShadow: '0 20px 60px rgba(201,168,76,0.2), 0 0 0 1px rgba(201,168,76,0.4)' },
}
const lineVariants = {
  rest: { width: '0%' },
  hover: { width: '100%' },
}

export default function MenuItemCard({ item, index }: MenuItemCardProps) {
  const { openModal } = useModal()

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.div
        className="group bg-palace-smoke border border-palace-stone rounded-none overflow-hidden flex flex-col h-full"
        style={{ transformStyle: 'preserve-3d' }}
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Image — clickable to open modal */}
        <div
          className="relative h-52 cursor-pointer"
          onClick={() => openModal(item)}
        >
          {item.image ? (
            <>
              <Image src={optimizedImage(item.image, { width: 600, height: 400 })} alt={item.name} fill sizes="(max-width: 600px) 100vw, 600px" style={{ objectFit: 'cover' }} />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-palace-smoke to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-palace-charcoal flex items-center justify-center">
              <span className="text-gold/20 text-2xl">◆</span>
            </div>
          )}
          {item.isSignature && (
            <div className="absolute top-3 right-3 bg-gold text-palace-black font-body text-[9px] tracking-[0.2em] uppercase px-2 py-1 z-[1]">
              ✦ Signature
            </div>
          )}
          {/* View Details overlay */}
          <div className="absolute inset-0 bg-palace-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[1]">
            <span className="font-body text-xs tracking-widest uppercase text-white flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                <path d="M6 2l8 8M14 2v8h-8" />
              </svg>
              View Details
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-3">
            <h3
              onClick={() => openModal(item)}
              className={`font-display text-lg font-light tracking-wide cursor-pointer hover:text-gold transition-colors duration-200 ${item.isSignature ? 'text-shimmer' : 'text-white'}`}
            >
              {item.name}
            </h3>
            {item.price != null && (
              <span className="font-display text-lg text-gold font-light flex-shrink-0">${item.price.toFixed(2)}</span>
            )}
          </div>
          <span className="inline-block self-start font-body text-[9px] tracking-[0.2em] uppercase text-gold-muted border border-gold/20 px-2 py-0.5 mt-1">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
          {item.description && (
            <p className="font-body text-sm text-white/45 mt-3 leading-relaxed line-clamp-3">{item.description}</p>
          )}

          <div className="mt-auto pt-4 flex justify-end">
            <AddToCartButton
              item={{
                id: item._id,
                name: item.name,
                category: item.category,
                price: item.price,
                image: item.image ? optimizedImage(item.image, { width: 128, height: 128 }) : undefined,
              }}
              variant="card"
            />
          </div>
        </div>

        <motion.div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" variants={lineVariants} transition={{ duration: 0.4, ease: 'easeOut' }} />
      </motion.div>
    </motion.div>
  )
}
