'use client'

import GlassFilter from '@/components/GlassFilter'
import { useState } from 'react'

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
              </div>
              <button onClick={menuToggle} className="header-btn">
                選單
              </button>
            </div>
          </GlassFilter>
        </div>
      </div>
    </header>
  )
}
