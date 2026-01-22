// ✅ 最小可行商品列表頁（無錯誤、可直接跑）
import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'

export default async function ProductList() {
  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex flex-col justify-center text-center gap-4">
        <div className="flex gap-2 justify-center">
          <Icon icon="line-md:cancel-twotone" width="4em" height="4em" />
        </div>
        <h1 className="text-3xl font-bold ">交易失敗</h1>
        <p className="">如有需要，可以直接WhatsApp，與我們聯絡。</p>
        <p className="flex gap-2 justify-center">
          <Link
            className="btn btn-success"
            href={'https://wa.me/85294667228?text=你好，請問有關於交易失敗的問題，可以如何處理？'}
            target="_blank"
          >
            WhatsApp 聯絡
          </Link>
          <Link className="btn btn-primary" href={'/'}>
            返回主頁
          </Link>
        </p>
      </div>
    </div>
  )
}
