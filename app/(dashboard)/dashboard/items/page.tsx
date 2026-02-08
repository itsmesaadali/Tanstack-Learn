// app/dashboard/items/page.tsx
import { Suspense } from 'react'
import { getItemsAction } from '@/app/actions/get-items'
import { ItemListSkeleton } from './_components/itemsSkeleton'
import ItemsClient from './_components/ItemsClient'

export const metadata = {
  title: 'Saved Items',
  openGraph: {
    title: 'Saved Items',
  },
}

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: {
    query?: string
    status?: string
  }
}) {
  const itemsPromise = getItemsAction()

  return (
    <Suspense fallback={<ItemListSkeleton />}>
      <ItemsClient
        itemsPromise={itemsPromise}
        searchParams={searchParams}
      />
    </Suspense>
  )
}
