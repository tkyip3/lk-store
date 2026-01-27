import ProductItem from '@/components/ProductItem'
import type { Product, Category, Tag } from '@/payload-types'
import FilterControls from '@/components/FilterControls'
import ProductPagination from '@/components/ProductPagination'

const PER_PAGE = 12

interface ProductsResponse {
  docs: Product[]
  totalPages: number // Payload 會返回 totalPages
}

async function getCategories(): Promise<{ docs: Category[] }> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/categories?where[published][equals]=true&locale=zh-TW&sort=order&limit=0`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

async function getTags(): Promise<{ docs: Tag[] }> {
  const url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/tags?where[published][equals]=true&locale=zh-TW&sort=order&limit=0`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

async function getProducts(
  page: number,
  category?: string,
  tag?: string,
): Promise<ProductsResponse> {
  let url = `${process.env.NEXT_PUBLIC_PAYLOAD_API}/api/products?where[published][equals]=true&locale=zh-TW&limit=${PER_PAGE}&page=${page}`

  // 添加 category 篩選（假設 category 是關係字段，傳的是 ID）
  if (category) {
    url += `&where[categories][in]=${encodeURIComponent(category)}`
  }

  // 添加 tag 篩選（假設 tags 是多選關係字段）
  if (tag) {
    url += `&where[tags][in][0]=${encodeURIComponent(tag)}`
  }

  const res = await fetch(url, {
    next: { revalidate: 30 },
    // 可選：在開發時臨時加 cache: 'no-store' 測試
  })
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export default async function ProductList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const page = Math.max(1, parseInt(searchParams?.page as string) || 1)
  const category = Array.isArray(searchParams?.category)
    ? searchParams.category[0]
    : searchParams?.category || ''
  const tag = Array.isArray(searchParams?.tag) ? searchParams.tag[0] : searchParams?.tag || ''
  const [productsResponse, { docs: categories }, { docs: tags }] = await Promise.all([
    getProducts(page, category, tag),
    getCategories(),
    getTags(),
  ])
  console.log(categories)

  const { docs: products, totalPages } = productsResponse

  // Transform categories and tags to match FilterControls props
  const transformedCategories = categories.map((cat) => ({
    id: String(cat.id),
    name: cat.name,
  }))
  const transformedTags = tags.map((tag) => ({
    id: String(tag.id),
    name: tag.name,
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-center mb-8">商品列表</h1>
      {/* 篩選欄 */}
      <FilterControls categories={transformedCategories} tags={transformedTags} />
      {products.length === 0 ? (
        <p className="text-center">未有相關商品</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p: Product) => (
            <ProductItem key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* 分頁 */}
      <ProductPagination totalPages={totalPages} category={category} tag={tag} />
    </div>
  )
}
