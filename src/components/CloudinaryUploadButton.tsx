// components/CloudinaryUploadButton.tsx
'use client'

import { useState, useRef } from 'react'

export default function CloudinaryUploadButton({
  onUpload,
}: {
  onUpload: (publicId: string, url: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'stripe-products') // ← 你的 preset name
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!)

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        },
      )
      const data = await res.json()

      /* @ts-ignore */
      if (data.public_id) {
        // ✅ 生成 Stripe 專用 512x512 縮圖 URL
        /* @ts-ignore */
        const stripeUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_512,h_512,c_fill,q_auto,f_auto/${data.public_id}.webp`
        /* @ts-ignore */
        onUpload(data.public_id, stripeUrl)
      }
    } catch (err) {
      console.error('Upload failed:', err)
      alert('上傳失敗')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="cloudinary-upload"
      />
      <label htmlFor="cloudinary-upload" className={`btn ${uploading ? 'btn-disabled' : ''}`}>
        {uploading ? '上傳中...' : '📁 上傳圖片到 Cloudinary'}
      </label>
    </div>
  )
}
