import { useLocation, Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const TITLES = {
  '/dashboard':        'Dashboard',
  '/employees':        'Employees',
  '/positions':        'Positions',
  '/time-off':         'Time Off Requests',
  '/performance':      'Performance Reviews',
  '/jobs':             'Jobs',
  '/applicants':       'Applicants',
  '/job-applications': 'Job Applications',
  '/interviews':       'Interviews',
}

export default function TopBar({ onMenuToggle }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const title = TITLES[pathname] ?? 'CodeX Hub'

  const initials = user
    ? (user.first_name?.[0] ?? user.username?.[0] ?? 'U').toUpperCase()
    : ''
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : (user?.username ?? '')

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle sidebar">
        <Menu size={18} />
      </button>
      <img src="/codeX-logo.png" alt="CodeX" className="topbar-logo" />
      <h1 className="topbar-title">{title}</h1>
      {user && (
        <Link to="/profile" className="topbar-user">
          <div className="topbar-avatar">{initials}</div>
          <span className="topbar-user-name">{displayName}</span>
        </Link>
      )}
    </header>
  )
}
