// src\app\(frontend)\products\[slug]\page.tsx
import Image from 'next/image'
import Link from 'next/link'

import BuyButtons from '@/components/BuyButtons'

import ProductGallery from '@/components/ProductGallery'

import type { Metadata } from 'next'
import type { Product } from '@/payload-types'

async function getProductBySlug(slug: string): Promise<Product | null> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/products?where[slug][equals]=${encodeURIComponent(slug)}&locale=zh-TW`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) return null
  /* @ts-ignore */
  const { docs } = await res.json()
  return docs[0] || null
}

// ✅ 修正 1：generateMetadata 的 params 也要 await + 类型修正
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> // ✅ Promise<>
}): Promise<Metadata> {
  const { slug } = await params // 👈 await 解包
  const product = await getProductBySlug(slug)

  return {
    title: product ? `${product.name} | 商店` : '商品未找到',
    description: product?.description || '商品详情',
  }
}

// ✅ 修正 2：主组件 params 类型修正（逻辑你已对，只差类型）
export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }> // ✅ 补全类型
}) {
  const { slug } = await params // ✅ 正确解包
  const product = await getProductBySlug(slug)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-error">⚠️ 商品未找到</h1>
        <Link href="/products" className="btn btn-link mt-4">
          返回商品列表
        </Link>
      </div>
    )
  }

  const displayPrice = product.price.toFixed(2)
  const galleryImages = (product.images ?? [])
    .filter((img) => {
      const image = img.image
      return image && typeof image !== 'number' && typeof image === 'object' && image.url
    })
    .map((img) => ({
      ...img,
      image: {
        url: (img.image as { url: string }).url ?? '',
        alt: (img.image as { url: string; alt?: string }).alt ?? '',
      },
    }))

  const handleBuyNow = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })

      const data = await res.json()
      /* @ts-ignore */
      if (res.ok && data.url) {
        /* @ts-ignore */
        window.location.href = data.url // ⚠️ 用 location.href 跳轉（Checkout 要整頁）
      } else {
        /* @ts-ignore */
        alert(`失敗：${data.error || '未知錯誤'}`)
      }
    } catch (err) {
      console.error(err)
      alert('建立訂單失敗，請稍後再試')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="btn btn-ghost btn-sm mb-4">
        ← 返回列表
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {product.images && product.images.length > 0 ? (
            <div className="relative  w-full bg-base-200 rounded-lg overflow-hidden">
              <ProductGallery images={galleryImages} />
            </div>
          ) : (
            <div className="aspect-square w-full bg-base-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">无图片</span>
            </div>
          )}

          {/* {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="relative w-16 h-16 flex-shrink-0 rounded border">
                  <Image
                    src={img.image.url}
                    alt={`${product.name} 图片 ${i + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )} */}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl font-semibold mb-4">
            {product.currency?.toUpperCase()} {displayPrice}
          </p>

          {product.stock === 0 ? (
            <span className="badge badge-error mb-4">售罄</span>
          ) : (
            <span className="badge badge-success mb-4">库存：{product.stock}</span>
          )}

          {product.description && (
            <div className="prose max-w-none mb-6">
              <h3 className="font-semibold">商品描述</h3>
              <pre>{product.description}</pre>
            </div>
          )}

          <div className="mt-6">
            <BuyButtons productId={String(product.id)} stock={product.stock ?? 0} />
          </div>
        </div>
      </div>
    </div>
  )
}
