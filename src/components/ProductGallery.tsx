// src/components/ProductGallery.tsx
'use client'

import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation, Thumbs } from 'swiper/modules'
import Image from 'next/image' // 引入 next/image

import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

type ImageItem = {
  image: {
    url: string
    alt?: string
  }
}

interface ProductGalleryProps {
  images: ImageItem[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
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
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper2 !rounded-lg overflow-hidden"
      >
        {images.map((item, i) => (
          <SwiperSlide key={i}>
            <div className="relative aspect-square w-full">
              <Image
                src={item.image.url}
                alt={item.image.alt || `商品图片 ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 缩略图 Swiper（仅当图片 > 1 时显示） */}
      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={Math.min(4, images.length)}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="mySwiper mt-4 !h-20"
        >
          {images.map((item, i) => (
            <SwiperSlide key={i} className="!h-full">
              <div className="relative w-full h-full rounded border border-base-300 overflow-hidden">
                <Image
                  src={item.image.url}
                  alt={`缩略图 ${i + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  )
}
