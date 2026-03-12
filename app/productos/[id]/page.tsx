import { AdminLayout } from '@/components/admin-layout'
import { ProductDetail } from '@/components/products/product-detail'
import { PRODUCTS } from '@/lib/mock-data'
import { notFound } from 'next/navigation'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  const product = PRODUCTS.find(p => p.id === id)
  
  if (!product) {
    notFound()
  }

  return (
    <AdminLayout>
      <ProductDetail productId={id} />
    </AdminLayout>
  )
}
