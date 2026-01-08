import { Stripe } from 'stripe'

export const POST = (req: Request) => {
  console.log('req: ', req)
  return req
    .json<{ productId: string; quantity: number; price: number }>()
    .then(({ productId, quantity, price }) => {
      return Promise.resolve()
        .then(() =>
          new Stripe(process.env.PRIVATE_STRIPE_API_KEY).checkout.sessions.create({
            ui_mode: 'hosted',
            line_items: [
              {
                price_data: {
                  currency: 'hkd',
                  product_data: {
                    name: `ID(${productId})`,
                    images: [],
                  },
                  unit_amount: Math.floor(price * 100),
                },
                quantity,
              },
            ],
            mode: 'payment',
            // return_url: 'http://localhost:3000/success',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
          }),
        )
        .then((session) => {
          return new Response(session.url)
        })
    })
}
