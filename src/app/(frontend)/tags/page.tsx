// ✅ 最小可行商品列表頁（無錯誤、可直接跑）

import Link from 'next/link'
import Image from 'next/image'

import type { Product, Tag } from '@/payload-types'

import TagCloudClient from '@/components/TagCloudClient'

const { docs: products } = await getProducts()
const tagsData = products.map((p) => p.tags).flat()
// 过滤出真正的Tag对象
const validTags = tagsData.filter(isTag)

// 步驟 1：用 Map 統計每個 name 的出現次數
const countMap = new Map<string, number>()
validTags.forEach((item) => {
  countMap.set(item.name, (countMap.get(item.name) || 0) + 1)
})

// 步驟 2：轉換成你要的格式
const data = Array.from(countMap.entries()).map(([value, count]) => ({
  value,
  count,
}))

interface TagItem {
  value: string
  count: number
}

async function getProducts(): Promise<{ docs: Product[] }> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/products?where[published][equals]=true&locale=zh-TW`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

// 类型守卫函数
function isTag(obj: any): obj is Tag {
  return obj && typeof obj === 'object' && 'name' in obj
}

export default async function ProductList() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">全部分類</h1>
      <div className="flex items-center justify-center">
        <TagCloudClient tags={data} />
      </div>
    </div>
  )
}
