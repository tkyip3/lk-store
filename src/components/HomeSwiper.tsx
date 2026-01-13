// src/components/ProductGallery.tsx
'use client'

import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Pagination } from 'swiper/modules'
import Image from 'next/image' // 引入 next/image
import Link from 'next/link'

import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'swiper/css/pagination'

type ImageItem = {
  slug: string
  image: {
    url: string
    alt?: string
  }
}

interface HomeSwiperProps {
  images: ImageItem[]
}

export default function HomeSwiper({ images }: HomeSwiperProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null)

  if (!images || images.length === 0) {
    return (
      <div className="bg-base-200 aspect-square rounded-lg flex items-center justify-center">
        <span className="text-gray-500">暂无图片</span>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* 主图 Swiper */}
      <Swiper
        style={
          {
            '--swiper-navigation-color': 'rgb(255, 255, 255)',
            '--swiper-pagination-color': 'rgb(255, 255, 255)',
          } as React.CSSProperties
        }
        spaceBetween={10}
        pagination={true}
        modules={[FreeMode, Pagination]}
        className="overflow-hidden"
      >
        {images.map((item, i) => (
          <SwiperSlide key={i}>
            <div className="relative aspect-3/1 w-full">
              <Link href={`/category/${item.slug}`}>
                <Image
                  src={item.image.url}
                  alt={item.image.alt || `商品图片 ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
