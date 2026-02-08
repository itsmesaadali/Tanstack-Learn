import { getItemsAction } from '@/app/actions/get-items'
import { Suspense } from 'react'
import { ItemListSkeleton } from './_components/itemsSkeleton'
import ItemsClient from './_components/ItemsClient'

export const metadata = {
  title: 'Saved Items',
}

export default async function ItemsPage({

}) {
  const items = await getItemsAction()

  return (
    <Suspense fallback={<ItemListSkeleton />}>
      <ItemsClient
        items={items}
      />
    </Suspense>
  )
}
