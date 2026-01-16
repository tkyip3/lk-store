// src\app\(frontend)\categories\[slug]\page.tsx

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ProductItem from '@/components/ProductItem'
import type { Product, Category } from '@/payload-types'
import type { Metadata } from 'next'

interface ApiResponse<T> {
  docs: T[]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> // ✅ Promise<>
}): Promise<Metadata> {
  const { slug } = await params // 👈 await 解包
  const category = await getCategoryBySlug(slug)

  return {
    title: category ? `${category.name} | HK LK Store` : '商品未找到',
    description: category?.description || '商品详情',
  }
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

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const { slug } = resolvedParams

  // Step 1: 找 category
  const category = await getCategoryBySlug(slug)
  if (!category) {
    notFound() // 若分類不存在，返回 404
  }

  // Step 2: 找商品
  const { docs: products } = await getProductsByCategoryId(String(category.id))

  return (
    <div className="container mx-auto px-4">
      {typeof category.image === 'object' && category.image?.url && (
        <div className="flex aspect-5/1 mb-4">
          <div className="relative w-3/5 ">
            <Image
              src={category.image.url}
              alt={category.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex text-2xl items-center justify-center w-2/5 font-bold p-4 bg-gray-700 text-center">
            {category.name}
          </div>
        </div>
      )}

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
