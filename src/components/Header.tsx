export default function Header() {
  return (
    <header className="navbar bg-base-100 shadow-md sticky top-0 z-50">
      <div className="navbar-start">
        <a href="/" className="btn btn-ghost normal-case text-xl">
          <img src="/images/header/logo.png" alt="Logo" className="h-8 w-auto" />
        </a>
      </div>
      {/* 可從 Payload API 抓選單項目（進階） */}
    </header>
  )
}
