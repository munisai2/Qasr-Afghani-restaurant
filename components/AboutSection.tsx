'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { optimizedImage } from '@/sanity.client'
import type { SanityImage, TeamMember } from '@/types/sanity'

interface AboutSectionProps {
  title: string
  body: any[]
  image: SanityImage | null
  team: TeamMember[]
  openingYear?: string
}

const portableTextComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="font-body text-base text-white/55 leading-[1.9]">{children}</p>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="text-gold font-medium">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-white/70">{children}</em>
    ),
  },
}

export default function AboutSection({ title, body, image, team, openingYear }: AboutSectionProps) {
  // Apply shimmer to the last word of the title
  const titleWords = (title || 'A Palace of Flavors').split(' ')
  const lastWord = titleWords.pop()
  const titleStart = titleWords.join(' ')

  const stats = [
    { value: openingYear ?? '2024', label: 'Est.' },
    { value: '100%', label: 'Authentic Recipes' },
    { value: 'Buffalo', label: 'New York' },
  ]

  return (
    <section id="about" className="bg-palace-charcoal border-t border-palace-stone py-24 md:py-36 px-6 md:px-16 lg:px-24">
      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
        {/* LEFT — Text (60%) */}
        <div className="lg:col-span-3">
          <motion.p
            className="font-body text-xs tracking-[0.35em] uppercase text-gold-muted mb-6"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            OUR STORY
          </motion.p>

          <motion.h2
            className="font-display text-4xl md:text-6xl font-light text-white tracking-wide leading-tight mb-8"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {titleStart}{titleStart ? ' ' : ''}
            <span className="text-shimmer">{lastWord}</span>
          </motion.h2>

          {body && body.length > 0 ? (
            <motion.div
              className="space-y-5 max-w-xl"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <PortableText value={body} components={portableTextComponents} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="font-body text-base text-white/55 leading-[1.9] space-y-5 max-w-xl">
                <p>
                  Qasr Afghan brings the rich culinary heritage of Afghanistan to
                  the heart of Buffalo, New York. Our kitchen is built on recipes
                  passed down through generations — slow-cooked meats, fragrant
                  rice dishes, and hand-stretched bread fresh from the tandoor.
                </p>
                <p>
                  Every dish tells a story. From the smoky char of our royal kebabs
                  to the saffron-kissed rice of our Mandi, we cook with ingredients
                  sourced for authenticity and prepared with the care that only
                  comes from a lifetime of tradition.
                </p>
                <p>
                  Whether you are discovering Afghan cuisine for the first time or
                  returning to the flavors of home, you are welcome at our table.
                </p>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-yellow-500/50 text-xs mt-4 border border-yellow-500/20 p-2">
                  ⚠️ Dev note: This is placeholder text. Add your real story in
                  Sanity Studio → Restaurant Info → About / Story Text.
                </p>
              )}
            </motion.div>
          )}

          {/* Stats row */}
          <div className="flex gap-12 mt-10">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              >
                <div className="font-display text-3xl text-gold font-light">{s.value}</div>
                <div className="font-body text-xs tracking-widest uppercase text-white/30 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT — Image (40%) */}
        <motion.div
          className="lg:col-span-2 relative"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {image ? (
            <div className="relative">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={optimizedImage(image, { width: 800, height: 1067 })}
                  alt="About Qasr Afghan"
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              {/* Gold frame */}
              <div className="absolute inset-3 border border-gold/20 pointer-events-none z-10" />
              {/* Offset decorative box */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-gold/10 bg-palace-smoke -z-10" />
            </div>
          ) : (
            <div className="aspect-[3/4] bg-palace-smoke border border-palace-stone flex items-center justify-center">
              <span className="text-gold/20 text-6xl">◆</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Team Row */}
      {team.length > 0 && (
        <div className="max-w-7xl mx-auto mt-24">
          <motion.p
            className="font-body text-xs tracking-[0.3em] uppercase text-gold-muted text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            THE PEOPLE BEHIND THE PALACE
          </motion.p>

          <div className="flex flex-wrap justify-center gap-12">
            {team.slice(0, 4).map((member, i) => (
              <motion.div
                key={member._id}
                className="text-center w-48"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                {/* Photo */}
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-gold/30 hover:border-gold transition-colors duration-300">
                  {member.photo ? (
                    <Image
                      src={optimizedImage(member.photo, { width: 192, height: 192 })}
                      alt={member.name}
                      width={96}
                      height={96}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      priority={i === 0}
                    />
                  ) : (
                    <div className="w-full h-full bg-palace-smoke flex items-center justify-center">
                      <span className="font-display text-2xl text-gold/60">
                        {member.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h4 className="font-display text-base text-white mt-4">{member.name}</h4>
                <p className="font-body text-xs tracking-widest uppercase text-gold-muted mt-1">{member.role}</p>
                {member.bio && (
                  <p className="font-body text-xs text-white/35 mt-2 line-clamp-3">{member.bio}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
