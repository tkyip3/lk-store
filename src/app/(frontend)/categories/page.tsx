// ✅ 最小可行商品列表頁（無錯誤、可直接跑）
import Link from 'next/link'
import Image from 'next/image'

import type { Category } from '@/payload-types'

import styles from './page.module.css'
async function getCategories(): Promise<{ docs: Category[] }> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/categories?where[published][equals]=true&locale=zh-TW&sort=name`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export default async function ProductList() {
  const { docs: categories } = await getCategories()

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">全部分類</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c: Category) => (
          <Link
            href={`/categories/${c.slug}`}
            key={c.id}
            className="relative aspect-3/1 rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0">
              {c.image && typeof c.image === 'object' && (
                <Image
                  key={c.image.id}
                  src={c.image.url}
                  alt={c.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <div className="relative flex flex-col items-center justify-center h-full bg-black/50 text-2xl text-shadow-lg/20 font-bold backdrop-blur-sm backdrop-saturate-130 scale-150 opacity-0 hover:scale-100 hover:opacity-100 transition-all duration-300 ease-in-out">
              {c.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
