// src\app\(frontend)\categories\[slug]\page.tsx

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ProductItem from '@/components/ProductItem'
import type { Product, Category } from '@/payload-types'

interface ApiResponse<T> {
  docs: T[]
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/categories?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    { next: { revalidate: 3600 } },
  )
  const data: ApiResponse<Category> = await res.json()
  return data.docs[0] || null
}

async function getProductsByCategoryId(categoryId: string): Promise<{ docs: Product[] }> {
  const url = new URL(`${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/products`)
  url.searchParams.set('where[published][equals]', 'true')
  url.searchParams.set('where[categories][in][0]', categoryId)
  url.searchParams.set('locale', 'zh-TW')
  // url.searchParams.set('depth', '1') // 如果你需要在 product 中取得 category 物件

  const res = await fetch(url.toString(), { next: { revalidate: 30 } })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json() as Promise<ApiResponse<Product>>
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  // Step 1: 找 category
  const category = await getCategoryBySlug(slug)
  if (!category) {
    notFound() // 若分類不存在，返回 404
  }

  // Step 2: 找商品
  const { docs: products } = await getProductsByCategoryId(String(category.id))

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">🛍️ 分類：{category.name}</h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">此分類下無商品</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p: Product) => (
            <ProductItem key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
