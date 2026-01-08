// src/components/BuyButtons.tsx
'use client'

import { useState } from 'react'

export default function BuyButtons({
  productId,
  stock,
  price,
}: {
  productId: string
  stock: number
  price: number
}) {
  const [loading, setLoading] = useState(false)

  const handleAddToCart = () => {
    // TODO: 實作加入購物車（可呼叫 /api/cart）
    console.log('加入購物車', productId)
  }

  const handleBuyNow = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/apis/checkout', {
        method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1, price }),
      })
      if (!res.ok) throw new Error('建立訂單失敗')
      const url = await res.text()
      // if (res.ok && data.url) {
      window.location.href = url
      // } else {
      //   alert(data.error || '建立訂單失敗')
      // }
    } catch (err) {
      console.error(err)
      alert('網路錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <button className="btn btn-primary w-full" disabled={stock === 0} onClick={handleAddToCart}>
        {stock === 0 ? '已售罄' : '加入購物車'}
      </button>

      <form action="/apis/checkout" method="post">
        <button
          className="btn btn-accent w-full"
          disabled={stock === 0 || loading}
          // onClick={handleBuyNow}
        >
          {loading ? '處理中...' : '💳 馬上購買（Stripe 快速結帳）'}
        </button>
      </form>
    </div>
  )
}
