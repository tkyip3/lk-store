import type { Access, CollectionConfig } from 'payload'

const readAccess: Access = ({ req }) => {
  // return req.user.role === 'admin'
  return true
} // ✅ 允許未登入者讀取

export const Tag: CollectionConfig = {
  slug: 'tags',
  access: {
    read: readAccess, // ✅ 允許未登入者讀取
  },
  admin: { useAsTitle: 'name' },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        'zh-TW': '標籤名稱',
        en: 'Tag Name',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      label: {
        'zh-TW': '公開',
        en: 'Published',
      },
    },
  ],
}
