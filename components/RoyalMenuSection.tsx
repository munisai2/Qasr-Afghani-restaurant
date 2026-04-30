'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { buildCategoryLabels } from '@/lib/fetchData'
import MenuItemCard from './MenuItemCard'
import type { MenuItem, MenuCategory } from '@/types/sanity'

interface RoyalMenuSectionProps {
  menuByCategory: Record<string, MenuItem[]>
  restaurantName: string
  categories: MenuCategory[]
  showFullMenu?: boolean
}

export default function RoyalMenuSection({ menuByCategory, restaurantName, categories, showFullMenu = false }: RoyalMenuSectionProps) {
  const labels = buildCategoryLabels(categories)
  const allCategories = Object.keys(menuByCategory)
  const visibleCategories = showFullMenu ? allCategories : allCategories.slice(0, 2)
  const [activeCategory, setActiveCategory] = useState<string>(visibleCategories[0] ?? '')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTabIcon, setActiveTabIcon] = useState<string>('')

  const CATEGORY_EMOJIS: Record<string, string> = {
    lamb:       '🍖',
    chicken:    '🍗',
    family:     '🍽️',
    wings:      '🔥',
    gyro:       '🥙',
    appetizers: '🥗'
  }

  const handleTabClick = (cat: string) => {
    setActiveCategory(cat)
    
    // Animate Tab Emoji
    const emoji = CATEGORY_EMOJIS[cat.toLowerCase()] || '✨'
    setActiveTabIcon(emoji)
    setTimeout(() => setActiveTabIcon(''), 1200)

    const el = document.getElementById('menu-grid')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Cross-category search
  const allMatchingItems = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.toLowerCase()
    const all = Object.values(menuByCategory).flat()
    return all.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category?.title?.toLowerCase().includes(q) ||
      item.category?.slug?.toLowerCase().includes(q)
    )
  }, [menuByCategory, searchQuery])

  // Active tab items (when not searching)
  const activeItems = menuByCategory[activeCategory] ?? []

  // Display items — searchResults or activeTab
  const displayItems = allMatchingItems ?? activeItems
  const isSearching = allMatchingItems !== null

  return (
    <section id="menu" className="min-h-screen bg-palace-black border-t border-palace-stone pt-20 pb-32">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <motion.div className="text-center px-6 mb-12 pt-8" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: 'easeOut' }}>
        <p className="font-body text-xs tracking-[0.35em] uppercase text-gold-muted mb-4">THE ROYAL MENU</p>
        <h2 className="font-display text-5xl md:text-6xl font-light text-white tracking-wide mb-4">A Feast Fit for a{' '}<span className="text-shimmer">Palace</span></h2>
        <p className="font-body text-sm text-white/40 max-w-md mx-auto leading-relaxed">Authentic Afghan cuisine, crafted with centuries-old recipes and the finest ingredients.</p>
        <div className="relative flex items-center justify-center w-32 my-8 mx-auto"><div className="absolute inset-0 border-t border-gold/30 top-1/2" /><span className="relative bg-palace-black px-3 text-gold text-xs">◆</span></div>
      </motion.div>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto px-6 pt-2 pb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/30 pointer-events-none">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search the menu..."
          className="w-full bg-palace-smoke border border-palace-stone pl-10 pr-10 py-3 font-body text-sm text-white rounded-none placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-all duration-300"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category tabs — hidden during search */}
      {!isSearching && visibleCategories.length > 0 && (
        <div className="sticky top-[72px] z-30 bg-palace-black/95 backdrop-blur-sm border-b border-palace-stone">
          <div className="flex overflow-x-auto scrollbar-hide gap-0 max-w-7xl mx-auto">
            {visibleCategories.map((cat) => (
              <button key={cat} onClick={() => handleTabClick(cat)} className={`font-body text-xs tracking-[0.2em] uppercase px-4 md:px-6 py-3 md:py-4 whitespace-nowrap transition-all duration-300 relative overflow-visible ${activeCategory === cat ? 'text-gold' : 'text-white/35 hover:text-white/70'}`} aria-label={`View ${labels[cat] ?? cat}`}>
                {labels[cat] ?? cat}
                
                <AnimatePresence>
                  {activeCategory === cat && activeTabIcon && (
                    <motion.div
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-4xl pointer-events-none z-10 drop-shadow-[0_0_15px_rgba(201,168,76,0.6)]"
                      initial={{ y: -20, opacity: 0, scale: 0.5 }}
                      animate={{ y: 0, opacity: 1, scale: 1.2 }}
                      exit={{ y: 10, opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.6 }}
                    >
                      {activeTabIcon}
                    </motion.div>
                  )}
                </AnimatePresence>

                {activeCategory === cat && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-px bg-gold" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results header */}
      {isSearching && (
        <p className="font-body text-xs text-white/30 text-center mb-4 px-6">
          {displayItems.length} result{displayItems.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
        </p>
      )}

      <div id="menu-grid" className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={isSearching ? `search-${searchQuery}` : activeCategory} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
            {displayItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-10">
                {displayItems.map((item, i) => <MenuItemCard key={item._id} item={item} index={i} />)}
              </div>
            ) : isSearching ? (
              <div className="flex flex-col items-center justify-center py-32 px-6">
                <span className="text-gold/20 text-4xl mb-6">◆</span>
                <p className="font-display italic text-white/30 text-xl">No dishes match your search.</p>
                <p className="font-body text-xs text-white/20 mt-3">Try &ldquo;kebab&rdquo;, &ldquo;rice&rdquo;, or &ldquo;appetizer&rdquo;</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 px-6">
                <span className="text-gold/30 text-4xl mb-6">◆</span>
                <p className="font-display italic text-white/30 text-xl">Coming soon to our menu</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!showFullMenu && (
        <div className="text-center py-16 border-t border-palace-stone">
          <p className="font-body text-xs text-white/30 tracking-wide mb-6">
            Showing Lamb & Chicken Specials
          </p>
          <Link
            href="/menu"
            data-cursor-label="Menu"
            className="inline-flex items-center gap-3
                       border border-gold/40 text-gold
                       font-body text-xs tracking-[0.25em] uppercase
                       px-10 py-4 rounded-none
                       hover:bg-gold hover:text-palace-black
                       transition-all duration-300"
          >
            View Full Royal Menu
            <span className="text-base">→</span>
          </Link>
          <p className="font-body text-[10px] text-white/20 mt-4 tracking-wide">
            {Object.values(menuByCategory).flat().length} dishes across{' '}
            {Object.keys(menuByCategory).length} categories
          </p>
        </div>
      )}
    </section>
  )
}
