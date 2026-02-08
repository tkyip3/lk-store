// src/app/(endpoint)/apis/update-stock/route.ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config })
    const { productId, quantity } = (await req.json()) as { productId: string; quantity: number }

    // 獲取產品並更新庫存
    const product = await payload.findByID({
      collection: 'products',
      id: productId,
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    await payload.update({
      collection: 'products',
      id: productId,
      data: {
        stock: product.stock - quantity,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating stock:', error)
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 })
  }
}
