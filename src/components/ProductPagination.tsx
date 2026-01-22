// src/components/ProductPagination.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProductPaginationProps {
  totalPages: number
}

export default function ProductPagination({ totalPages }: ProductPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const [selectedPage, setSelectedPage] = useState<string>(String(currentPage))

  // 同步 URL 变化（如用户手动改地址栏）
  useEffect(() => {
    setSelectedPage(String(currentPage))
  }, [currentPage])

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    router.push(`/products?page=${page}`)
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
        {/* 上一页 */}
        <button
          className="join-item btn"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          «
        </button>

        {/* 页码选择器 */}
        <select
          id="page-selector"
          className="join-item select w-26 pl-6 pr-2 appearance-none bg-none"
          value={selectedPage}
          onChange={handleSelectChange}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <option key={pageNum} value={pageNum}>
              第 {pageNum}/{totalPages} 頁
            </option>
          ))}
        </select>

        {/* 下一页 */}
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
