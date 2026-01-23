// src/components/FilterControls.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent } from 'react'

interface FilterControlsProps {
  categories: Array<{ id: string; name: string }>
  tags: Array<{ id: string; name: string }>
}

export default function FilterControls({ categories, tags }: FilterControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || ''
  const currentTag = searchParams.get('tag') || ''

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // 切換篩選時重置頁碼
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Category */}
      <div className="flex-1">
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          分類
        </label>
        <select
          id="category"
          className="select appearance-none pl-3 pr-7 w-full"
          value={currentCategory}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            handleFilterChange('category', e.target.value)
          }
        >
          <option value="">全部分類</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tag */}
      <div className="flex-1">
        <label htmlFor="tag" className="block text-sm font-medium mb-1">
          標籤
        </label>
        <select
          id="tag"
          className="select appearance-none pl-3 pr-7 w-full"
          value={currentTag}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            handleFilterChange('tag', e.target.value)
          }
        >
          <option value="">全部標籤</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
