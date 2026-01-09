import GlassFilter from '@/components/GlassFilter'
export default function Header() {
  return (
    <header className="">
      <div className="container mx-auto">
        <div className="header-wrapper">
          <GlassFilter>
            <div className="wrapper-main">
              <a href="/" className="logo">
                <img src="/images/header/logo.png" alt="Logo" />
              </a>
              <div className="header-menu">
                <a href="/products" className="menu-item">
                  所有貨品
                </a>
                <a href="/categories" className="menu-item">
                  所有分類
                </a>
              </div>
            </div>
          </GlassFilter>
        </div>
      </div>
    </header>
  )
}
