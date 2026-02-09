// src/app/(frontend)/cart/page.tsx
import CartPageClient from '@/components/CartPageClient'

export default function CartPage() {
  return (
    <div className="container mx-auto ">
      <h1 className="text-3xl font-bold mb-8">購物車</h1>
      <CartPageClient />
    </div>
  )
}
