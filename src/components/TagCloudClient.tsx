// app/components/TagCloudClient.tsx
'use client'

import { TagCloud } from 'react-tagcloud'

interface TagItem {
  value: string
  count: number
}

const customRenderer = (tag: TagItem, size: number, color: string) => (
  <div
    key={tag.value}
    style={{
      animationDelay: `${Math.random() * 2}s`,
      fontSize: `${size}vw`,
      backgroundColor: color,
    }}
  >
    <span>{tag.value}</span>
  </div>
)

const options = {
  luminosity: 'light',
  hue: 'yellow',
} as const

export default function TagCloudClient({ tags }: { tags: TagItem[] }) {
  return (
    <TagCloud
      minSize={5}
      maxSize={10}
      tags={tags}
      className="tags-cloud"
      colorOptions={options}
      renderer={customRenderer}
      onClick={(tag) => window.open(`/tags/${tag.value}`)}
    />
  )
}
