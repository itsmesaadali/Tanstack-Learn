import { getItemByIdAction } from '@/app/actions/get-item-by-id'
import { notFound } from 'next/navigation'
import ItemDetailClient from '../_components/item-detail-client'

type Props = {
  params: Promise<{
    itemId: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { itemId } = await params
  const item = await getItemByIdAction(itemId)

  if (!item) return {}

  return {
    title: item.title ?? 'Item Details',
    openGraph: {
      title: item.title ?? 'Item Details',
      images: item.ogImage ? [item.ogImage] : [],
    },
  }
}

export default async function ItemDetailPage({ params }: Props) {
  const { itemId } = await params
  const item = await getItemByIdAction(itemId)

  if (!item) notFound()

  return <ItemDetailClient data={item} />
}
