// src\app\(frontend)\products\[slug]\page.tsx
import Image from 'next/image'
import Link from 'next/link'

import BuyButtons from '@/components/BuyButtons'

import ProductGallery from '@/components/ProductGallery'

import type { Metadata } from 'next'
import type { Product } from '@/payload-types'
import { Icon } from '@iconify/react'

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
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_API
  const firstImageUrl =
    product?.images?.[0]?.image &&
    typeof product.images[0].image === 'object' &&
    'url' in product.images[0].image
      ? `${baseUrl}${(product.images[0].image as { url: string }).url}`
      : undefined

  const title = product ? `${product.name} | HK LK Store 網上商店` : '商品未找到'
  const description = product?.description || '商品详情'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: firstImageUrl ? [firstImageUrl] : [],
    },
    twitter: {
      title,
      description,
      images: firstImageUrl ? [firstImageUrl] : [],
    },
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
      <div className="container mx-auto px-4 h-full">
        <div className="flex flex-col justify-center text-center gap-4">
          <div className="flex gap-2 justify-center">
            <Icon icon="line-md:line-md:alert-loop" width="4em" height="4em" />
          </div>
          <h1 className="text-xl font-bold ">未找到相關商品</h1>
          <p className="">你所找的商品不存在或已經下架，歡迎遊覽其他商品。</p>
          <p className="flex gap-2 justify-center">
            <Link className="btn btn-primary" href={'/prouducts'}>
              返回購物頁面
            </Link>
            <Link className="btn btn-primary" href={'/'}>
              返回主頁
            </Link>
          </p>
        </div>
      </div>
    )
  }

  const displayPrice = product.price.toFixed(0)
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

  // const buyImages = (product.images ?? [])
  //   .filter((img) => {
  //     const image = img.image
  //     return image && typeof image !== 'number' && typeof image === 'object' && image.url
  //   })
  //   .map(
  //     (img) =>
  //       'https://lk-store-production.tkyip3.workers.dev' + (img.image as { url: string }).url,
  //   )

  const buyImages =
    galleryImages.length > 0
      ? [process.env.NEXT_PUBLIC_PAYLOAD_API + galleryImages[0].image.url]
      : []

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {product.images && product.images.length > 0 ? (
            <div className="relative w-full bg-gray-900/50 rounded-lg overflow-hidden backdrop-blur-sm">
              <ProductGallery images={galleryImages} sellout={product.stock === 0} />
            </div>
          ) : (
            <div className="aspect-square w-full bg-gray-900/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Icon icon="line-md:image-twotone" width="6em" height="6em" />
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
          {product.stock === 0 ? (
            <span className="badge badge-error mb-4">售罄</span>
          ) : (
            <span className="badge badge-success mb-4">有現貨</span>
          )}
          <h1 className="text-xl font-bold mb-2">{product.name}</h1>
          {product.categories.length > 0 && (
            <div>
              {product.categories.map((cat) => {
                if (typeof cat === 'number') return null
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="badge badge-primary mb-2 mr-2 hover:shadow-md/30 hover:-translate-y-[2px] transition"
                  >
                    {cat.name}
                  </Link>
                )
              })}
            </div>
          )}
          <p className="text-xl font-black mb-8">
            {product.currency?.toUpperCase()} {displayPrice}
          </p>

          {product.description && (
            <div className="prose max-w-none mb-6">
              <div className="divider divider-start font-bold text-xl divider-primary">
                商品描述
              </div>
              <pre>{product.description}</pre>
            </div>
          )}
          <div className="mt-6">
            <BuyButtons
              productName={String(product.name)}
              productId={String(product.id)}
              stock={product.stock ?? 0}
              price={parseFloat(displayPrice)}
              images={buyImages}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
