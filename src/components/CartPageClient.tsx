// src/components/CartPageClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { Icon } from '@iconify/react'

interface CartItem {
  productId: string
  productName: string
  slug: string
  quantity: number
  price: number
  image: string
  addedAt: number
}

const CART_KEY = 'cart'

// ===== LocalStorage 工具函數 =====
const getCartFromStorage = (): CartItem[] => {
  try {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(CART_KEY)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error('讀取購物車失敗:', err)
    return []
  }
}

const setCartToStorage = (cartItems: CartItem[]) => {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems))
  } catch (err) {
    console.error('儲存購物車失敗:', err)
  }
}

// ===== 購物車項目組件 =====
function CartItemRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: CartItem
  onUpdate: (productId: string, quantity: number) => void
  onDelete: (productId: string) => void
}) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setQuantity(item.quantity)
  }, [item.quantity])

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return
    setQuantity(newQty)
    setIsUpdating(true)
    onUpdate(item.productId, newQty)
    setIsUpdating(false)
  }

  const subtotal = item.price * item.quantity

  return (
    <tr className="border-b hover:bg-base-200 transition-colors">
      {/* 圖片 */}
      <td className="p-4 w-24">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-base-300 flex items-center justify-center">
          {item.image != '' ? (
            <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
          ) : (
            <Icon icon="line-md:image-twotone" width="3em" height="3em" />
          )}
        </div>
      </td>

      {/* 商品名稱 */}
      <td className="p-4 font-medium">
        <Link href={`/products/${item.slug}`} className="link link-hover hover:text-primary">
          {item.productName}
        </Link>
      </td>

      {/* 價格 */}
      <td className="p-4 whitespace-nowrap">${item.price.toLocaleString()}</td>

      {/* 數量 */}
      <td className="p-4 w-32">
        <div className="join">
          <button
            className="btn btn-sm join-item btn-outline"
            onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
            disabled={isUpdating}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val) && val >= 1) {
                handleQuantityChange(val)
              }
            }}
            className="input input-sm join-item input-bordered w-16 text-center"
          />
          <button
            className="btn btn-sm join-item btn-outline"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isUpdating}
          >
            +
          </button>
        </div>
      </td>

      {/* 小計 */}
      <td className="p-4 font-semibold whitespace-nowrap">${subtotal.toLocaleString()}</td>

      {/* 刪除 */}
      <td className="p-4 w-12">
        <button
          className="btn btn-sm btn-ghost text-error hover:bg-error/10"
          onClick={() => onDelete(item.productId)}
          title="移除商品"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </td>
    </tr>
  )
}

// ===== 結帳按鈕組件（改用 form submit）=====
function CheckoutForm({
  total,
  itemCount,
  disabled,
  cartItems,
}: {
  total: number
  itemCount: number
  disabled: boolean
  cartItems: CartItem[]
}) {
  // ===== 驗證圖片 URL =====
  const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false
    if (url.trim() === '') return false
    if (url === '/placeholder.jpg') return false
    if (url.startsWith('data:')) return false
    return true
  }

  // 將購物車資料轉成 JSON（在 render 時生成）
  const cartJson = JSON.stringify(
    cartItems.map((item) => {
      const images = isValidImageUrl(item.image) ? [item.image] : []
      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        images: images,
      }
    }),
  )

  return (
    <form action="/apis/checkout" method="post" className="w-full">
      <input type="hidden" name="items" value={cartJson} />

      <button type="submit" className="btn btn-accent btn-lg w-full md:w-auto" disabled={disabled}>
        💳 立即結帳 (${total.toLocaleString()})
      </button>
    </form>
  )
}

// ===== 空購物車組件 =====
function EmptyCart() {
  return (
    <div className="text-center py-16 bg-base-200 rounded-2xl">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold mb-2">購物車是空的</h2>
      <p className="text-base-content/70 mb-6">快去挑選喜歡的商品吧！</p>
      <Link href="/" className="btn btn-primary">
        前往商品列表
      </Link>
    </div>
  )
}

// ===== 主組件 =====
export default function CartPageClient() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // 初次載入和監聽 localStorage 變化
  useEffect(() => {
    const loadCart = () => {
      const items = getCartFromStorage()
      setCartItems(items)
      setLoading(false)
    }

    loadCart()

    // 監聽其他頁籤的 localStorage 變化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_KEY) {
        loadCart()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 更新數量
  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      )
      setCartToStorage(updated)
      return updated
    })
  }

  // 刪除商品
  const deleteItem = (productId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.productId !== productId)
      setCartToStorage(updated)
      return updated
    })
  }

  // 清空購物車
  const clearCart = () => {
    if (confirm('確定要清空購物車嗎？')) {
      setCartItems([])
      localStorage.removeItem(CART_KEY)
    }
  }

  // 計算總價
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className="space-y-6">
      {/* 購物車表格 */}
      <div className="overflow-x-auto bg-base-100 rounded-2xl border">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200">
              <th className="w-24"></th>
              <th>商品</th>
              <th className="whitespace-nowrap">單價</th>
              <th className="w-32">數量</th>
              <th className="whitespace-nowrap">小計</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onUpdate={updateQuantity}
                onDelete={deleteItem}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* 總計和操作按鈕 */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {/* 左側：總計 */}
        <div className="card bg-base-200 flex-1">
          <div className="card-body">
            <h3 className="card-title text-lg font-bold">購物車摘要</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>商品數量</span>
                <span className="font-semibold">{itemCount} 件</span>
              </div>
              <div className="flex justify-between">
                <span>商品種類</span>
                <span className="font-semibold">{cartItems.length} 種</span>
              </div>
              <div className="divider my-1"></div>
              <div className="flex justify-between text-lg">
                <span className="font-bold">總計</span>
                <span className="font-bold text-primary">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：按鈕 */}
        <div className="flex flex-col gap-3 w-full md:w-auto">
          {/* 改用 form submit */}
          <CheckoutForm
            total={total}
            itemCount={itemCount}
            disabled={itemCount === 0}
            cartItems={cartItems}
          />
          <button className="btn btn-outline btn-error w-full" onClick={clearCart}>
            🗑️ 清空購物車
          </button>
          <Link href="/" className="btn btn-outline w-full">
            ← 繼續購物
          </Link>
        </div>
      </div>
    </div>
  )
}
