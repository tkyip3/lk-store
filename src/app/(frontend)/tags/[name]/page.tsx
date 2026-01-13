// src\app\(frontend)\categories\[slug]\page.tsx

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ProductItem from '@/components/ProductItem'
import type { Product, Tag } from '@/payload-types'

interface ApiResponse<T> {
  docs: T[]
}

async function getProductsByTag(tagName: string): Promise<{ docs: Product[] }> {
  // Step 1: 用中文 tagName 查找對應的 tag ID
  const tagApiUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/tags`
  const tagUrl = new URL(tagApiUrl)
  tagUrl.searchParams.set('where[name][equals]', tagName)

  const tagRes = await fetch(tagUrl.toString())
  if (!tagRes.ok) {
    console.error('Failed to fetch tag:', tagName, await tagRes.text())
    throw new Error('無法取得標籤資訊')
  }

  const tagData = (await tagRes.json()) as { docs: Array<{ id: string }> }

  if (tagData.docs.length === 0) {
    return { docs: [] } // 沒有對應的 tag
  }

  const tagId = tagData.docs[0].id

  // Step 2: 用 tag ID 查 products
  const productUrl = new URL(`${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/products`)
  productUrl.searchParams.set('where[published][equals]', 'true')
  productUrl.searchParams.set('where[tags][in]', tagId)

  const productRes = await fetch(productUrl.toString(), { next: { revalidate: 30 } })
  if (!productRes.ok) {
    console.error('Failed to fetch products by tag ID:', tagId)
    throw new Error('無法取得商品列表')
  }

  return productRes.json()
}

export default async function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = await params
  const { name } = resolvedParams

  // Step 2: 找商品
  const { docs: products } = await getProductsByTag(decodeURI(name))

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">🛍️ 分類：{decodeURI(name)}</h1>

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
