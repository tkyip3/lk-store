// ✅ 最小可行商品列表頁（無錯誤、可直接跑）
'use client'
import Link from 'next/link'
import Image from 'next/image'

import type { Product, Tag } from '@/payload-types'

import { TagCloud } from 'react-tagcloud'

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

const customRenderer = (tag: TagItem, size: number, color: string) => (
  <span
    key={tag.value}
    style={{
      animation: 'blinker 3s linear infinite',
      animationDelay: `${Math.random() * 2}s`,
      fontSize: `${size / 2}em`,
      border: `2px solid ${color}`,
      margin: '3px',
      padding: '3px',
      display: 'inline-block',
      color: 'white',
    }}
  >
    {tag.value}
  </span>
)

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
  console.log(data)
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">全部分類</h1>
      <div className="flex items-center justify-center">
        <TagCloud
          minSize={12}
          maxSize={35}
          tags={data}
          className="simple-cloud "
          renderer={customRenderer}
          onClick={(tag) => alert(`'${tag.value}' was selected!`)}
        />
      </div>
    </div>
  )
}
