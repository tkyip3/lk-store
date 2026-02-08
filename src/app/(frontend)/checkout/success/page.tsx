// src\app\(frontend)\checkout\success\page.tsx
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { getPayload } from 'payload'
import { Stripe } from 'stripe'
import config from '@/payload.config'

// 更新庫存的函數
async function updateStock(sessionId: string) {
  'use server'
  try {
    const stripe = new Stripe(process.env.PRIVATE_STRIPE_API_KEY, {
      httpClient: Stripe.createFetchHttpClient(),
    })

    // 獲取 checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })

    // 檢查支付狀態
    if (session.payment_status !== 'paid') {
      return { success: false, message: 'Payment not completed' }
    }

    const payload = await getPayload({ config })

    // 遍歷所有商品項目
    if (session.line_items?.data) {
      for (const item of session.line_items.data) {
        // 從 metadata 獲取產品 ID
        const productIdValue = session.metadata?.productId || item.price?.product
        const productId = typeof productIdValue === 'string' ? productIdValue : productIdValue?.id

        if (productId && item.quantity) {
          try {
            // 獲取產品
            const product = await payload.findByID({
              collection: 'products',
              id: productId,
            })

            if (product && product.stock >= item.quantity) {
              // 更新庫存
              await payload.update({
                collection: 'products',
                id: productId,
                data: {
                  stock: product.stock - item.quantity,
                },
              })
            }
          } catch (error) {
            console.error(`Error updating stock for product ${productId}:`, error)
          }
        }
      }
    }

    return { success: true, message: 'Stock updated successfully' }
  } catch (error) {
    console.error('Error in updateStock:', error)
    return { success: false, message: 'Failed to update stock' }
  }
}

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  // 如果有 session_id，更新庫存
  let stockUpdateResult = null
  if ((await searchParams).session_id) {
    stockUpdateResult = await updateStock((await searchParams).session_id)
  }

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex flex-col justify-center text-center gap-4">
        <div className="flex gap-2 justify-center">
          <Icon
            icon="line-md:circle-to-confirm-circle-twotone-transition"
            width="4em"
            height="4em"
          />
        </div>

        <h1 className="text-xl font-bold">已完成交易</h1>

        {/* {stockUpdateResult?.success ? (
          <p className="text-green-600">✓ 庫存已更新</p>
        ) : stockUpdateResult ? (
          <p className="text-yellow-600">⚠ 訂單已完成，但庫存更新遇到問題</p>
        ) : null} */}

        <p>感謝你的購買。</p>

        <p className="flex gap-2 justify-center">
          <Link className="btn btn-primary" href={'/'}>
            返回主頁
          </Link>
        </p>
      </div>
    </div>
  )
}
