'use client'

import GlassFilter from '@/components/GlassFilter'

import { Icon } from '@iconify/react'
import Link from 'next/link'
export default function Footer() {
  return (
    <footer>
      <GlassFilter>
        <div className="container p-4 mx-auto">
          <div className="footer-top">
            <div className="footer-menu">
              <Link
                href={'https://www.carousell.com.hk/u/arlok324/'}
                target="_blank"
                className="menu-item"
              >
                <Icon className="" icon="arcticons:carousell" width="2em" height="2em" />
              </Link>
              <Link href={'https://ebay.us/m/RFMXtf'} target="_blank" className="menu-item">
                <Icon className="" icon="arcticons:ebay" width="2em" height="2em" />
              </Link>
              <div className="divider divider-horizontal mx-0"></div>
              <Link href={'https://wa.me/85294667228?text='} target="_blank" className="menu-item">
                <Icon className="" icon="arcticons:whatsapp" width="2em" height="2em" />
              </Link>
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} HK LK Store All rights reserved.
          </div>
        </div>
      </GlassFilter>
    </footer>
  )
}
