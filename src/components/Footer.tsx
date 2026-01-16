'use client'

import GlassFilter from '@/components/GlassFilter'

import { Icon } from '@iconify/react'
import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="-mx-4 mt-8">
      <GlassFilter>
        <div className="container p-4 mx-auto">
          <div className="footer-top text-center flex justify-center gap-4 mb-4">
            <Link href={'#'}>
              <Icon icon="arcticons:whatsapp" width="2.4em" height="2.4em" />
            </Link>
            <Link href={'https://www.carousell.com.hk/u/arlok324/'} target="_blank">
              <Icon icon="arcticons:carousell" width="2.4em" height="2.4em" />
            </Link>
          </div>
          <div className="footer-bottom text-center">
            © {new Date().getFullYear()} HK LK Store All rights reserved.
          </div>
        </div>
      </GlassFilter>
    </footer>
  )
}
