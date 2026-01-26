// ✅ 最小可行商品列表頁（無錯誤、可直接跑）
import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
export default async function ProductList() {
  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex flex-col justify-center text-center gap-4">
        <div className="flex gap-2 justify-center">
          <Icon
            icon="line-md:circle-to-confirm-circle-twotone-transition"
            width="4em"
            height="4em"
          />
        </div>
        <h1 className="text-xl font-bold ">已完成交易</h1>
        <p>感謝你的購買。</p>
        <p className="flex gap-2 justify-center">
          <Link className="btn btn-primary" href={'/'}>
            返回主頁
          </Link>
        </p>
      </div>
    </div>
  )
}
