import { Metadata }          from 'next'
import { fetchMenuByCategory, fetchRestaurantInfo }
  from '@/lib/fetchData'
import SiteNav               from '@/components/SiteNav'
import SiteFooter            from '@/components/SiteFooter'
import MenuPageHero          from '@/components/MenuPageHero'
import RoyalMenuSection      from '@/components/RoyalMenuSection'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:
      'Menu — Qasr Afghani Grill & Kebab | Halal Afghan Food Buffalo NY',
    description:
      'Full halal Afghan menu in Buffalo, NY. Lamb specials, chicken ' +
      'kebabs, family packages, Buffalo wings, gyro wraps and ' +
      'appetizers. Fresh daily on Niagara Falls Blvd. Order online.',
    keywords: [
      'Afghan menu Buffalo NY',
      'halal menu Buffalo',
      'Afghan food Niagara Falls Blvd',
      'lamb kebab Buffalo NY',
      'chicken kebab Buffalo',
      'gyro Buffalo NY',
      'halal food near me Buffalo',
      'Afghan restaurant menu',
      'Qasr Afghani menu',
    ],
    openGraph: {
      title:
        'Menu | Qasr Afghani Grill & Kebab — Halal Food Buffalo NY',
      description:
        'Authentic halal Afghan dishes. Lamb, chicken, gyro, family ' +
        'packages. Fresh daily on Niagara Falls Blvd, Buffalo NY.',
      type: 'website',
    },
  }
}

export default async function MenuPage() {
  const [menuByCategory, info] = await Promise.all([
    fetchMenuByCategory(),
    fetchRestaurantInfo(),
  ])

  return (
    <>
      <SiteNav
        logo={info?.logo ?? null}
        restaurantName={info?.name ?? 'Qasr Afghani Grill & Kebab'}
        reservationUrl={info?.reservationUrl ?? ''}
      />
      <main>
        <MenuPageHero />
        <RoyalMenuSection
          menuByCategory={menuByCategory}
          restaurantName={info?.name ?? 'Qasr Afghani Grill & Kebab'}
          showFullMenu={true}
        />
      </main>
      <SiteFooter
        restaurantName={info?.name ?? 'Qasr Afghani Grill & Kebab'}
        logo={info?.logo ?? null}
        address={info?.address ?? ''}
        phone={info?.phone ?? ''}
        email={info?.email ?? ''}
        instagramUrl={info?.instagramUrl ?? ''}
        reservationUrl={info?.reservationUrl ?? ''}
      />
    </>
  )
}
