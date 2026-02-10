'use client'

import { useState } from 'react'

interface Subitem {
  id: string
  name: string
}

export function ProductOptions({ subitems }: { subitems: Subitem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(subitems[0]?.id || null)

  return (
    <div className="prose max-w-none mb-6">
      <div className="divider divider-start font-bold text-xl divider-primary">款式選擇</div>

      {selectedId && (
        <div className="mb-2 text-primary font-medium">
          已選擇：{subitems.find((item) => item.id === selectedId)?.name}
        </div>
      )}

      <div className="join w-full">
        {subitems.map((item) => (
          <input
            key={item.id}
            className={`join-item btn flex-1 ${selectedId === item.id ? 'btn-active' : ''}`}
            type="radio"
            name="subitem-options"
            value={item.id}
            checked={selectedId === item.id}
            onChange={(e) => setSelectedId(e.target.value)}
            aria-label={item.name}
          />
        ))}
      </div>
    </div>
  )
}
