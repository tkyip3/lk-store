// src/components/BuyButtons.tsx
'use client'

import { useState } from 'react'

export default function BuyButtons({
  productName,
  productId,
  stock,
  price,
  images,
}: {
  productName: string
  productId: string
  stock: number
  price: number
  images: string[]
}) {
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)

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
        body: JSON.stringify({ productId, quantity, price }),
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
      {/* <button className="btn btn-primary w-full" disabled={stock === 0} onClick={handleAddToCart}>
        {stock === 0 ? '已售罄' : '加入購物車'}
      </button> */}

      <form action="/apis/checkout" method="post">
        <input type="hidden" name="productName" value={productName} />
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={quantity} />
        <input type="hidden" name="price" value={price} />
        <input type="hidden" name="images" value={JSON.stringify(images)} />

        {stock > 1 && (
          <label htmlFor="" className="input w-full mb-2">
            <span className="label">購買數量</span>
            <input
              className=""
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                const q = isNaN(val) ? 1 : val
                setQuantity(Math.min(stock, Math.max(1, q)))
              }}
            />
          </label>
        )}

        <button
          className="btn btn-accent w-full"
          disabled={stock === 0 || loading}
          // onClick={handleBuyNow}
        >
          {loading ? '處理中...' : stock === 0 ? '已售罄' : '馬上購買'}
        </button>
      </form>
    </div>
  )
}
