import { NextResponse } from 'next/server'
import { Stripe } from 'stripe'

export const FREIDHGT_PREPAID_COST = 30
export const POST = (req: Request) => {
  return req
    .formData()
    .then((data) =>
      // return req
      //   .json<{ productId: string; quantity: number; price: number }>()
      //   .then(({ productId, quantity, price }) =>
      Promise.resolve().then(() => {
        const productName = String(data.get('productName')) || "Can't get productName"
        const productId = String(data.get('productId')) || "Can't get productId"
        const quantity = Number(data.get('quantity')) || 0
        const price = Number(data.get('price')) || 999
        const images = String(data.get('images')) || '[]'

        // console.log('start')
        // console.log(process.env.PRIVATE_STRIPE_API_KEY)
        // console.log(productId)
        // console.log(quantity)
        // console.log(price)
        const stripe = new Stripe(process.env.PRIVATE_STRIPE_API_KEY, {
          httpClient: Stripe.createFetchHttpClient(),
        })

        return Promise.race([
          stripe.checkout.sessions.create({
            ui_mode: 'hosted',
            line_items: [
              {
                price_data: {
                  currency: 'hkd',
                  product_data: {
                    name: productName,
                    images: JSON.parse(images),
                  },
                  unit_amount: Math.floor(price * 100),
                },
                quantity,
              },
            ],
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
            //shipping_options: getShippingOptions(locale, cart.shipping).map(({ option }) => option),
            // return_url: 'http://localhost:3000/success',
            // success_url: 'http://localhost:3000/success',
            success_url: 'http://localhost:3000//checkout/success',
            cancel_url: 'http://localhost:3000//checkout/cancel',
          }),
          new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
            throw new Error('Timeout')
          }),
        ])
      }),
    )
    .then((session) => {
      // console.log(session)
      // console.log('done')
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
