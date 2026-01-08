import { redirect } from 'next/navigation'
import { Stripe } from 'stripe'

export const POST = (req: Request) => {
  return req
    .formData()
    .then((data) =>
      // return req
      //   .json<{ productId: string; quantity: number; price: number }>()
      //   .then(({ productId, quantity, price }) =>
      Promise.race([
        Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
          throw new Error('Timeout')
        }),
      ]).then(() => {
        const productId = String(data.get('productId')) || "Can't get productId"
        const quantity = Number(data.get('quantity')) || 0
        const price = Number(data.get('price')) || 999

        console.log('start')
        console.log(process.env.PRIVATE_STRIPE_API_KEY)
        console.log(productId)
        console.log(quantity)
        console.log(price)
        const stripe = new Stripe(process.env.PRIVATE_STRIPE_API_KEY)
        return stripe.checkout.sessions.create({
          ui_mode: 'hosted',
          line_items: [
            {
              price_data: {
                currency: 'hkd',
                product_data: {
                  name: `ID(${productId})`,
                  images: [],
                },
                unit_amount: Math.floor(100 * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          // return_url: 'http://localhost:3000/success',
          // success_url: 'http://localhost:3000/success',
          success_url: 'https://google.com',
          cancel_url: 'https://google.com',
        })
      }),
    )
    .then((session) => {
      console.log(session)
      console.log('done')
      redirect(session.url)
      // return new Response(session.url, { status: 307 })
    })
}
