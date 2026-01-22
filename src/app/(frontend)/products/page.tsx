import ProductItem from '@/components/ProductItem'
import type { Product } from '@/payload-types'
import ProductPagination from '@/components/ProductPagination'

const PER_PAGE = 12

interface ProductsResponse {
  docs: Product[]
  totalDocs: number
  totalPages: number // Payload 会返回 totalPages
}

async function getProducts(page: number): Promise<ProductsResponse> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/products?where[published][equals]=true&locale=zh-TW&limit=${PER_PAGE}&page=${page}`

  // ⚠️ 添加 cache: 'no-store' 或确保 URL 唯一（推荐后者）
  const res = await fetch(url, {
    next: { revalidate: 30 },
    // 可选：在开发时临时加 cache: 'no-store' 测试
  })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

async function getTotalCount(): Promise<number> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/products?where[published][equals]=true&locale=zh-TW&limit=0`
  const res = await fetch(url, { next: { revalidate: 30 } })
  const data = (await res.json()) as { totalDocs: number }
  return data.totalDocs || 0
}

export default async function ProductList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const page = Math.max(1, parseInt(searchParams?.page as string) || 1)
  const { docs: products, totalDocs, totalPages } = await getProducts(page)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">商品列表</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p: Product) => (
          <ProductItem key={p.id} product={p} />
        ))}
      </div>

      {/* 分页 */}
      <ProductPagination totalPages={totalPages} />
    </div>
  )
}
