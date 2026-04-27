import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileFooterNav from './MobileFooterNav'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={sidebarOpen ? 'sidebar-open' : ''}>
      <Sidebar onClose={() => setSidebarOpen(false)} />
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />

      <div className="app-body">
        <TopBar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="main">
          <Outlet />
        </main>
      </div>

      <MobileFooterNav />
    </div>
  )
}
