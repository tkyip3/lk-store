// src/components/ProductItem.tsx
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/payload-types'

import { Icon } from '@iconify/react'
export default function ProductItem({ product }: { product: Product }) {
  const p = product

  return (
    <div
      key={p.id}
      className="card bg-gray-100/10 w-full shadow-sm  overflow-hidden backdrop-blur-sm"
    >
      <Link href={`/products/${p.slug}`} className="aspect-square relative ">
        {p.images &&
          (p.images.length > 1 ? (
            <figure className="hover-gallery">
              {p.images?.map((img) => {
                if (typeof img.image === 'object' && img.image?.url) {
                  return (
                    <Image
                      key={img.id}
                      src={img.image.url}
                      alt={p.name}
                      fill
                      className={`object-cover ${p.stock == 0 && 'grayscale'}`}
                      unoptimized
                    />
                  )
                }
              })}
            </figure>
          ) : p.images.length === 1 ? (
            <figure className="">
              {typeof p.images[0].image === 'object' && p.images[0].image?.url && (
                <Image
                  src={p.images[0].image.url}
                  alt={p.name}
                  fill
                  className={`object-cover ${p.stock == 0 && 'grayscale'}`}
                  unoptimized
                />
              )}
            </figure>
          ) : (
            <figure className="aspect-square flex items-center justify-center p-4 bg-gray-900/50">
              <Icon icon="line-md:image-twotone" width="6em" height="6em" />
            </figure>
          ))}
      </Link>

      <div className="card-body">
        <Link
          href={`/products/${p.slug}`}
          className="card-title font-normal hover:text-yellow-300 transition-all duration-300 ease-in-out"
        >
          {p.name}
        </Link>
        <div className="text-lg font-bold">
          {p.currency.toUpperCase()} {p.price}
        </div>
        {p.stock > 0 ? (
          <div className="badge badge-success w-max">有現貨</div>
        ) : (
          <div className="badge badge-error w-max">售罄</div>
        )}
      </div>
    </div>
  )
}
