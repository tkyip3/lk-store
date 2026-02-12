// src\app\(frontend)\checkout\success\page.tsx
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { getPayload } from 'payload'
import { Stripe } from 'stripe'
import config from '@/payload.config'
import nodemailer from 'nodemailer'

// ===== 發送郵件給 admin 的函數 =====
async function sendAdminEmail(session: any) {
  'use server'
  try {
    const amount = (session.amount_total / 100).toFixed(2)
    const customerEmail = session.customer_details?.email || 'unknown'
    const shippingAddress = session.customer_details?.address || {}
    const shippingName = session.customer_details?.name || 'N/A'
    const phone = session.customer_details?.phone || ''

    // 獲取商品資訊
    const stripe = new Stripe(process.env.PRIVATE_STRIPE_API_KEY!, {
      httpClient: Stripe.createFetchHttpClient(),
    })
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    // 建立 Gmail 傳輸器
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      from: `"HK LK Store" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `💰 付款成功通知 - $${amount} HKD`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><div style=text-align:center;margin-bottom:30px><h1 style=color:#422ad5;margin:0;text-decoration:none>💵 你收到一張新訂單！🛒</h1><p style="color:#404040;margin:10px 0 0 0">成功支付</div><div style="background:#edf1fe;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #422ad5"><h3 style=margin-top:0;color:#2c3e50>💳 付款資訊</h3><p style="margin:10px 0"><strong>金額：</strong><span style=font-size:18px;color:#e74c3c>$${amount} HKD</span><p style="margin:10px 0"><strong>顧客郵箱：</strong>${customerEmail}</p>${phone ? `<p style="margin:10px 0"><strong>電話：</strong>${phone}</p>` : ''}<p style="margin:10px 0"><strong>付款時間：</strong>${new Date().toLocaleString('zh-TW')}</div><div style="background:#fdf9e8;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #df6f00"><h3 style=margin-top:0;color:#2c3e50>📦 購買商品</h3><table style=width:100%;border-collapse:collapse><thead><tr style=background:#fcb700><th style="padding:10px;text-align:left;border:1px solid #fdf9e8">商品<th style="padding:10px;text-align:center;border:1px solid #fdf9e8">數量<th style="padding:10px;text-align:right;border:1px solid #fdf9e8">金額<tbody>${lineItems.data.map((item: any) => `<tr><td style="padding:10px;border:1px solid #fcb700">${item.description || 'N/A'}<td style="padding:10px;text-align:center;border:1px solid #fcb700">${item.quantity}<td style="padding:10px;text-align:right;border:1px solid #fcb700">$${((item.amount_total || 0) / 100).toFixed(2)}</tr>`).join('')}</table></div>${shippingAddress ? `<div style="background:#edf7fd;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #00bafe"><h3 style=margin-top:0;color:#2c3e50>🚚 收貨資訊</h3><p style="margin:10px 0"><strong>收件人：</strong>${shippingName}<p style="margin:10px 0"><strong>地址：</strong><br>${shippingAddress.country || ''} ${shippingAddress.state || ''}<br>${shippingAddress.city || ''}, ${shippingAddress.line1 || ''} ${shippingAddress.line2 || ''} <br>${shippingAddress.postal_code || ''}</div>` : ''}<div style="margin-top:30px;padding-top:20px;border-top:2px solid #eee;text-align:center"><p style="margin:0 0 15px 0;color:#404040">👉 點擊下方按鈕查看完整訂單詳情 👈</p><a href=https://dashboard.stripe.com style="display:inline-block;background:#422ad5;color:#e0e7ff;padding:12px 30px;text-decoration:none;border-radius:5px;font-weight:700">前往 Stripe Dashboard</a></div></div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ Admin email sent successfully')
    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    console.error('❌ Email failed:', error)
    return { success: false, message: `Email failed: ${error}` }
  }
}
// 更新庫存的函數
async function updateStock(sessionId: string) {
  'use server'
  try {
    const stripe = new Stripe(process.env.PRIVATE_STRIPE_API_KEY!, {
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

    console.log('=== 開始更新庫存 ===')
    console.log('Session ID:', sessionId)
    console.log('Line Items 數量:', session.line_items?.data?.length || 0)

    // 遍歷所有商品項目
    if (session.line_items?.data) {
      // 👇 從 session metadata 獲取 payloadProductIds 陣列
      const payloadProductIdsArray = session.metadata?.payloadProductIds
        ? JSON.parse(session.metadata.payloadProductIds)
        : []

      console.log('Payload Product IDs Array:', payloadProductIdsArray)

      for (let index = 0; index < session.line_items.data.length; index++) {
        const item = session.line_items.data[index]
        // 👇 直接用 index 取值
        const payloadProductIdsString = payloadProductIdsArray[index]

        console.log('=== Item Debug ===')
        console.log('Index:', index)
        console.log('Description:', item.description)
        console.log('Quantity:', item.quantity)
        console.log('Payload Product ID:', payloadProductIdsString)

        if (payloadProductIdsString && item.quantity) {
          // 拆分可能的多個 ID
          const payloadProductIds = payloadProductIdsString
            .split(',')
            .map((id: string) => id.trim())
            .filter(Boolean)

          console.log('Parsed Product IDs:', payloadProductIds)

          // 遍歷每個 Product ID
          for (const payloadProductId of payloadProductIds) {
            try {
              // 獲取產品
              const product = await payload.findByID({
                collection: 'products',
                id: payloadProductId,
              })

              if (product && product.stock >= item.quantity) {
                // 每個產品都減去相同的數量
                await payload.update({
                  collection: 'products',
                  id: payloadProductId,
                  data: {
                    stock: product.stock - item.quantity,
                  },
                })
                console.log(`✅ 庫存更新成功: ${payloadProductId} - ${item.quantity} 件`)
              } else {
                console.warn(`⚠️ 庫存不足或產品不存在: ${payloadProductId}`)
              }
            } catch (error) {
              console.error(`❌ 更新庫存失敗 ${payloadProductId}:`, error)
            }
          }
        } else {
          console.warn(`⚠️ 找不到 Payload Product ID 或數量`)
        }
      }
    }

    console.log('=== 庫存更新完成 ===')
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
  let emailResult = null
  if ((await searchParams).session_id) {
    const sessionId = (await searchParams).session_id

    // 1. 先更新庫存
    stockUpdateResult = await updateStock(sessionId)

    // 2. 然後發送郵件給 admin
    if (stockUpdateResult?.success) {
      const stripe = new Stripe(process.env.PRIVATE_STRIPE_API_KEY!, {
        httpClient: Stripe.createFetchHttpClient(),
      })
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      emailResult = await sendAdminEmail(session)
    }
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
