// src/app/(frontend)/cart/page.tsx
import CartPageClient from '@/components/CartPageClient'

export default function CartPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">🛒 購物車</h1>
        <CartPageClient />
      </div>
    </div>
  )
}
