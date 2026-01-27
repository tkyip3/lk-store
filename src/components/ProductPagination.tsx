// src/components/ProductPagination.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProductPaginationProps {
  totalPages: number
  type?: 'products' | 'categories' | 'tags'
  typeId?: string
  category?: string
  tag?: string
}

export default function ProductPagination({
  totalPages,
  type = 'products',
  typeId,
  category,
  tag,
}: ProductPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const [selectedPage, setSelectedPage] = useState<string>(String(currentPage))

  // 同步 URL 變化（如用户手動改地址欄）
  useEffect(() => {
    setSelectedPage(String(currentPage))
  }, [currentPage])

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    if (type === 'products') {
      let url = `/products?page=${page}`
      if (category) {
        url += `&category=${encodeURIComponent(category)}`
      }
      if (tag) {
        url += `&tag=${encodeURIComponent(tag)}`
      }
      router.push(url)
    } else {
      router.push(`/${type}/${typeId}?page=${page}`)
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPage = parseInt(e.target.value, 10)
    setSelectedPage(String(newPage))
    goToPage(newPage)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center py-4">
      <div className="join">
        {/* 上一頁 */}
        <button
          className="join-item btn"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          «
        </button>

        {/* 頁碼選擇器 */}
        <select
          id="page-selector"
          name="page-selector"
          className="join-item select select-bordered w-26 pl-6 pr-2 appearance-none bg-none"
          value={selectedPage}
          onChange={handleSelectChange}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <option key={pageNum} value={pageNum}>
              第 {pageNum}/{totalPages} 頁
            </option>
          ))}
        </select>

        {/* 下一頁 */}
        <button
          className="join-item btn"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          »
        </button>
      </div>
    </div>
  )
}
