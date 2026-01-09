import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import type { Product } from '@/payload-types'

import GlassFilter from '@/components/GlassFilter'

import './styles.css'

async function getProducts(): Promise<{ docs: Product[] }> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/products?where[published][equals]=true&locale=zh-TW&limit=10&sort=-createdAt`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export default async function HomePage() {
  const { docs: products } = await getProducts()
  return (
    <div className="home">
      <div className="container mx-auto">
        <div className="home-products">
          <div className="divider text-4xl my-8 font-bold">最新商品</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((p: Product) => (
              <div key={p.id} className="card bg-base-100/50 backdrop-blur-sm w-full shadow-sm">
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
                </figure>

                <div className="card-body">
                  <h2 className="card-title">{p.name}</h2>

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
      </div>
    </div>
  )
}
