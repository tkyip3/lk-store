// src/components/ProductItem.tsx
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/payload-types'

export default function ProductItem({ product }: { product: Product }) {
  const p = product

  return (
    <div key={p.id} className="card bg-base-100 w-full shadow-sm">
      {p.images &&
        (p.images.length > 1 ? (
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
        ) : p.images.length === 1 ? (
          <figure className="aspect-square relative">
            {typeof p.images[0].image === 'object' && p.images[0].image?.url && (
              <Image src={p.images[0].image.url} alt={p.name} fill className="object-cover" />
            )}
          </figure>
        ) : (
          <figure className="aspect-square flex items-center justify-center p-4">
            <span>No image</span>
          </figure>
        ))}

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
  )
}
