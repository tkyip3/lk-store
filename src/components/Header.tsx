'use client'

import GlassFilter from '@/components/GlassFilter'
import { useState } from 'react'

import { Icon } from '@iconify/react'

export default function Header() {
  const [menuActive, setMenuActive] = useState(false)

  const menuToggle = () => {
    setMenuActive(!menuActive)
  }

  return (
    <header className="">
      <div className="container mx-auto">
        <div className="header-wrapper">
          <GlassFilter>
            <div className="wrapper-main">
              <a href="/" className="logo">
                <img src="/images/header/logo.png" alt="Logo" />
              </a>
              <div className={`header-menu ${menuActive ? 'active' : ''}`}>
                <a href="/products" className="menu-item">
                  所有貨品
                </a>
                <a href="/categories" className="menu-item">
                  所有分類
                </a>
                <a href="/cart" className="menu-item">
                  購物車
                </a>
                <a href="/admin" className="menu-item" target="_blank">
                  管理員登入
                </a>
                <button onClick={() => setMenuActive(false)} className="header-close">
                  <Icon icon="line-md:close" width="1.6em" height="1.6em" />
                </button>
              </div>
              <button onClick={() => setMenuActive(true)} className="header-btn">
                <Icon icon="line-md:close-to-menu-transition" width="1.6em" height="1.6em" />
              </button>
            </div>
          </GlassFilter>
        </div>
      </div>
    </header>
  )
}
