// ✅ 最小可行商品列表頁（無錯誤、可直接跑）
import Link from 'next/link'
import Image from 'next/image'

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
          <div key={p.id} className="card bg-base-100 w-full shadow-sm">
            <figure className="hover-gallery aspect-square relative">
              {p.images?.map((img) => {
                if (typeof img.image === 'object' && img.image?.url) {
                  return (
                    <Image
                      key={img.id}
                      src={img.image.url}
                      alt={p.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )
                }
              })}
              {/* <Image
                src={p.images[0].image.url}
                alt={p.name}
                className="object-cover w-full h-full"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw"
              /> */}
            </figure>

            <div className="card-body">
              <h2 className="card-title">{p.name}</h2>
              {/* <img
                key={p.images?.[0]?.id || 'placeholder'}
                src={(() => {
                  const firstImage = p.images?.[0]?.image
                  if (firstImage && typeof firstImage !== 'number' && 'url' in firstImage) {
                    return firstImage.url
                  }
                  return ''
                })()}
                alt={p.name}
                width={200}
                height={200}
              /> */}

              <p>
                {p.price} {p.currency.toUpperCase()}
              </p>
              <div className="card-actions justify-end">
                <Link href={`/products/${p.slug}`} className="btn btn-primary">
                  查看詳情
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
