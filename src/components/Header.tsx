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
                  <Icon className="item-icon" icon="material-symbols-light:package-2-outline" />
                  <span className="item-text">所有貨品</span>
                </a>
                <a href="/categories" className="menu-item">
                  <Icon className="item-icon" icon="material-symbols-light:category-outline" />
                  <span className="item-text">所有分類</span>
                </a>
                <a href="/cart" className="menu-item">
                  <Icon className="item-icon" icon="material-symbols-light:shopping-cart-outline" />
                  <span className="item-text">購物車</span>
                </a>
                <a href="/admin" className="menu-item" target="_blank">
                  <Icon
                    className="item-icon"
                    icon="material-symbols-light:admin-panel-settings-outline"
                  />
                  <span className="item-text">管理員登入</span>
                </a>
                <button onClick={() => setMenuActive(false)} className="header-close">
                  <Icon className="item-icon" icon="line-md:close" width="1.6em" height="1.6em" />
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
