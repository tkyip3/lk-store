// src/app/(endpoint)/apis/notify-admin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Stripe } from 'stripe'
import nodemailer from 'nodemailer'

const stripe = new Stripe(process.env.PRIVATE_STRIPE_API_KEY!, {
  httpClient: Stripe.createFetchHttpClient(),
})

// 建立 Gmail 傳輸器
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

async function sendAdminEmail(session: any) {
  try {
    const amount = (session.amount_total / 100).toFixed(2)
    const customerEmail = session.customer_details?.email || 'unknown'
    const shipping = session.shipping_details?.address || {}
    const shippingName = session.shipping_details?.name || ''
    const phone = session.customer_details?.phone || ''

    // 獲取商品資訊
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    const mailOptions = {
      from: `"Online Store" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `💰 付款成功通知 - $${amount} HKD`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2ecc71; margin: 0;">🎉 有新訂單！</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Payment Successful</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2ecc71;">
            <h3 style="margin-top: 0; color: #2c3e50;">💳 付款資訊</h3>
            <p style="margin: 10px 0;"><strong>金額：</strong><span style="font-size: 18px; color: #e74c3c;">$${amount} HKD</span></p>
            <p style="margin: 10px 0;"><strong>顧客郵箱：</strong>${customerEmail}</p>
            ${phone ? `<p style="margin: 10px 0;"><strong>電話：</strong>${phone}</p>` : ''}
            <p style="margin: 10px 0;"><strong>付款時間：</strong>${new Date().toLocaleString('zh-TW')}</p>
          </div>

          <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">📦 購買商品</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">商品</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">數量</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">金額</th>
                </tr>
              </thead>
              <tbody>
                ${lineItems.data
                  .map(
                    (item) => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">
                      ${item.description || 'N/A'}
                    </td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                      ${item.quantity}
                    </td>
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #f0f0f0;">
                      $${((item.amount_total || 0) / 100).toFixed(2)}
                    </td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          ${
            shippingName
              ? `
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">
              <h3 style="margin-top: 0; color: #2c3e50;">🚚 收貨資訊</h3>
              <p style="margin: 10px 0;"><strong>收件人：</strong>${shippingName}</p>
              <p style="margin: 10px 0;"><strong>地址：</strong><br>
                ${shipping.line1 || ''} ${shipping.line2 || ''}<br>
                ${shipping.city || ''}, ${shipping.state || ''} ${shipping.postal_code || ''}<br>
                ${shipping.country || ''}
              </p>
            </div>
          `
              : ''
          }

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #7f8c8d;">👉 點擊下方按鈕查看完整訂單詳情</p>
            <a href="https://dashboard.stripe.com" 
               style="display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              前往 Stripe Dashboard
            </a>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ Admin email sent successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Email failed:', error)
    return { success: false, error: String(error) }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = (await request.json()) as { sessionId: string }

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    // 獲取 session 資料
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'shipping_details'],
    })

    // 確認付款成功
    if (session.payment_status === 'paid') {
      const result = await sendAdminEmail(session)
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }
  } catch (error) {
    console.error('Notify admin error:', error)
    return NextResponse.json({ error: 'Failed to notify admin' }, { status: 500 })
  }
}
