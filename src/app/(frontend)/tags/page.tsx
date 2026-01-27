// app/(frontend)/tags/page.tsx

import Link from 'next/link'
import Image from 'next/image'
import type { Product, Tag } from '@/payload-types'
import TagCloudClient from '@/components/TagCloudClient'

// ✅ 明確禁用靜態生成：構建時完全跳過此頁面
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface TagItem {
  value: string
  count: number
}

async function getProducts(): Promise<{ docs: Product[] }> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/products?where[published][equals]=true&locale=zh-TW&limit=0`
  const res = await fetch(url, {
    cache: 'no-store', // 不緩存，每次請求都重新獲取
  })

  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

// 類型守衞函數
function isTag(obj: any): obj is Tag {
  return obj && typeof obj === 'object' && 'name' in obj
}

// ✅ 所有邏輯移到組件內部
export default async function ProductList() {
  // ✅ 在組件內 await，此時 dynamic 生效
  const { docs: products } = await getProducts()
  const tagsData = products.map((p) => p.tags).flat()
  const validTags = tagsData.filter(isTag)

  const countMap = new Map<string, number>()
  validTags.forEach((item) => {
    countMap.set(item.name, (countMap.get(item.name) || 0) + 1)
  })

  const data = Array.from(countMap.entries()).map(([value, count]) => ({
    value,
    count,
  }))

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-xl font-bold text-center mb-8">全部分類</h1>
      <div className="flex items-center justify-center">
        <TagCloudClient tags={data} />
      </div>
    </div>
  )
}
