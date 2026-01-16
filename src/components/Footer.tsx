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
              <Icon
                className="hover:text-yellow-300 transition-all duration-300 ease-in-out"
                icon="arcticons:whatsapp"
                width="2em"
                height="2em"
              />
            </Link>
            <Link href={'https://www.carousell.com.hk/u/arlok324/'} target="_blank">
              <Icon
                className="hover:text-yellow-300 transition-all duration-300 ease-in-out"
                icon="arcticons:carousell"
                width="2em"
                height="2em"
              />
            </Link>
          </div>
          <div className="footer-bottom text-center font-light">
            © {new Date().getFullYear()} HK LK Store All rights reserved.
          </div>
        </div>
      </GlassFilter>
    </footer>
  )
}
