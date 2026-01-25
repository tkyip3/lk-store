import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import type { Product, Category } from '@/payload-types'
import HomeSwiper from '@/components/HomeSwiper'
import ProductItem from '@/components/ProductItem'

import './styles.css'

async function getProducts(): Promise<{ docs: Product[] }> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/products?where[published][equals]=true&where[homepageIndex][greater_than]=0&locale=zh-TW&limit=10&sort=homepageIndex`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

async function getCategories(): Promise<{ docs: Category[] }> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/categories?where[published][equals]=true&locale=zh-TW&sort=order`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export default async function HomePage() {
  const { docs: products } = await getProducts()
  const { docs: categories } = await getCategories()
  const categoriesImages = categories.map((cat: Category) => {
    return {
      name: cat.name,
      slug: cat.slug,
      image: {
        url: typeof cat.image === 'object' && cat.image ? cat.image.url : '',
        alt: typeof cat.image === 'object' && cat.image ? cat.image.alt : '',
      },
    }
  })
  return (
    <div className="home">
      <div className="container mx-auto">
        <div className="home-products">
          <HomeSwiper images={categoriesImages} />
          <div className="divider text-4xl my-8 font-bold">精選商品</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((p: Product) => (
              <ProductItem key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
