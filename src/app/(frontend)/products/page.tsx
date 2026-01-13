import ProductItem from '@/components/ProductItem'

import type { Product } from '@/payload-types'

async function getProducts(): Promise<{ docs: Product[] }> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/products?where[published][equals]=true&locale=zh-TW`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export default async function ProductList() {
  const { docs: products } = await getProducts()

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">🛍️ 商品列表</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p: Product) => (
          <ProductItem key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
