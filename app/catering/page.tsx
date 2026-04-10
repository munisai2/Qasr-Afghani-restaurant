import type { Metadata } from 'next'
import { fetchCateringPlans, fetchRestaurantInfo } from '@/lib/fetchData'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import CateringHero from '@/components/catering/CateringHero'
import CateringPlansSection from '@/components/catering/CateringPlansSection'
import CateringQuoteForm from '@/components/catering/CateringQuoteForm'

export const metadata: Metadata = {
  title: 'Catering | Qasr Afghan — Buffalo, NY',
  description: 'Host your next event at Qasr Afghan. Premium Afghan catering for corporate and private events.',
}

export default async function CateringPage() {
  const [plans, info] = await Promise.all([
    fetchCateringPlans(),
    fetchRestaurantInfo(),
  ])

  return (
    <>
      <SiteNav
        logo={info?.logo ?? null}
        restaurantName={info?.name ?? 'Qasr Afghan'}
        reservationUrl={info?.reservationUrl ?? ''}
      />

      <main>
        <CateringHero info={info} />
        <CateringPlansSection plans={plans} />
        <CateringQuoteForm planTitles={plans.map(p => p.title)} />
      </main>

      <SiteFooter
        restaurantName={info?.name ?? 'Qasr Afghan'}
        logo={info?.logo ?? null}
        address={info?.address ?? ''}
        phone={info?.phone ?? ''}
        email={info?.email ?? ''}
        instagramUrl={info?.instagramUrl ?? ''}
        reservationUrl={info?.reservationUrl ?? ''}
        openingHours={info?.openingHours}
      />
    </>
  )
}
