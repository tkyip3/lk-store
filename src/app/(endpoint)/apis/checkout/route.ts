// src/app/(endpoint)/apis/checkout/route.ts
import { NextResponse } from 'next/server'
import { Stripe } from 'stripe'

const FREIDHGT_PREPAID_COST = 30

export const POST = (req: Request) => {
  return req
    .formData()
    .then((data) =>
      Promise.resolve().then(() => {
        // ===== 判斷是單一商品還是多商品 =====
        const itemsParam = data.get('items')
        let items: Array<{
          productId: string
          productName: string
          quantity: number
          price: number
          images?: string[]
          description?: string
        }> = []

        if (itemsParam) {
          // 多商品：從 JSON 解析
          try {
            items = JSON.parse(String(itemsParam))
          } catch (err) {
            console.error('解析 items 失敗:', err)
            throw new Error('Invalid items format')
          }
        } else {
          // 單一商品：從 formData 讀取
          const productName = String(data.get('productName')) || "Can't get productName"
          const productId = String(data.get('productId')) || "Can't get productId"
          const quantity = Number(data.get('quantity')) || 0
          const price = Number(data.get('price')) || 999
          const images = String(data.get('images')) || '[]'
          const description = String(data.get('description')) || undefined

          items = [
            {
              productId,
              productName,
              quantity,
              price,
              images: JSON.parse(images),
              description,
            },
          ]
        }

        const stripe = new Stripe(process.env.PRIVATE_STRIPE_API_KEY, {
          httpClient: Stripe.createFetchHttpClient(),
        })

        // ===== 建立多個 line_items =====
        const line_items = items.map((item) => ({
          price_data: {
            currency: 'hkd',
            product_data: {
              name: item.productName,
              images: item.images || [],
              description: item.description || undefined,
            },
            unit_amount: Math.floor(item.price * 100),
          },
          quantity: item.quantity,
        }))

        // ===== 計算總金額（用於 metadata）=====
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

        return Promise.race([
          stripe.checkout.sessions.create({
            ui_mode: 'hosted',
            invoice_creation: {
              enabled: true,
            },
            line_items,
            mode: 'payment',
            billing_address_collection: 'auto',
            shipping_address_collection: {
              allowed_countries: ['HK'],
            },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: {
                    amount: 0,
                    currency: 'hkd',
                  },
                  display_name: '順豐速運 (運費到付)',
                  delivery_estimate: {
                    minimum: {
                      unit: 'business_day',
                      value: 1,
                    },
                    maximum: {
                      unit: 'business_day',
                      value: 5,
                    },
                  },
                },
              },
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: {
                    amount: FREIDHGT_PREPAID_COST * 100,
                    currency: 'hkd',
                  },
                  display_name: '順豐速運 (運費預付)',
                  delivery_estimate: {
                    minimum: {
                      unit: 'business_day',
                      value: 1,
                    },
                    maximum: {
                      unit: 'business_day',
                      value: 5,
                    },
                  },
                },
              },
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: {
                    amount: 0,
                    currency: 'hkd',
                  },
                  display_name: '自取',
                  delivery_estimate: {
                    minimum: {
                      unit: 'business_day',
                      value: 1,
                    },
                    maximum: {
                      unit: 'business_day',
                      value: 3,
                    },
                  },
                },
              },
            ],
            phone_number_collection: {
              enabled: true,
            },
            success_url: `${process.env.NEXT_PUBLIC_PAYLOAD_API}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_PAYLOAD_API}/checkout/cancel`,
            metadata: {
              totalAmount: totalAmount.toString(),
              itemCount: items.length.toString(),
              // 注意：metadata 有大小限制，不適合存整個 items
              // 可以考慮存入資料庫並用 sessionId 關聯
            },
          }),
          new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
            throw new Error('Timeout')
          }),
        ])
      }),
    )
    .then((session) => {
      return new Response(null, {
        status: 303,
        headers: {
          Location: session.url,
        },
      })
    })
    .catch((e) => {
      console.error(e)
      return new Response('Error creating checkout session', { status: 500 })
    })
}
