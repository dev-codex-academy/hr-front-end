import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardList, FileText,
  Bell, GraduationCap, Star, Clock, CircleUser, Briefcase,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import notificationService from '@/services/notificationService'

function deriveRole(user) {
  if (!user) return 'student'
  if (user.is_staff) return 'staff'
  const perms = new Set(user.permissions ?? [])
  if (perms.has('app.change_jobapplication')) return 'staff'
  if (perms.has('app.add_tahourslog'))        return 'ta'
  if (perms.has('app.add_studentspotlight'))  return 'instructor'
  return 'student'
}

const FOOTER_BY_ROLE = {
  staff: [
    { label: 'Dashboard',    to: '/dashboard',       Icon: LayoutDashboard },
    { label: 'Employees',    to: '/employees',        Icon: Users           },
    { label: 'Jobs',         to: '/jobs',             Icon: ClipboardList   },
    { label: 'Applications', to: '/job-applications', Icon: FileText        },
    { label: 'Alerts',       to: '/notifications',    Icon: Bell, badge: true },
  ],
  instructor: [
    { label: 'Dashboard',  to: '/dashboard',            Icon: LayoutDashboard },
    { label: 'Community',  to: '/community/spotlights', Icon: Star            },
    { label: 'Profile',    to: '/profile',              Icon: CircleUser      },
    { label: 'Alerts',     to: '/notifications',        Icon: Bell, badge: true },
  ],
  ta: [
    { label: 'Dashboard', to: '/dashboard',    Icon: LayoutDashboard },
    { label: 'My Logs',   to: '/ta/logs',      Icon: Clock           },
    { label: 'Profile',   to: '/profile',      Icon: CircleUser      },
    { label: 'Alerts',    to: '/notifications', Icon: Bell, badge: true },
  ],
  student: [
    { label: 'Home',         to: '/dashboard',            Icon: GraduationCap },
    { label: 'Career',       to: '/codexhub/jobs',        Icon: Briefcase     },
    { label: 'Profile',      to: '/profile',              Icon: CircleUser    },
    { label: 'Applications', to: '/job-applications',     Icon: FileText      },
    { label: 'Instructors',  to: '/codexhub/instructors', Icon: Star          },
    { label: 'Alerts',       to: '/notifications',        Icon: Bell, badge: true },
  ],
}

export default function MobileFooterNav() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const role  = deriveRole(user)
  const items = FOOTER_BY_ROLE[role] ?? []

  useEffect(() => {
    notificationService.getAll({ ordering: '-created_at', page_size: 50 })
      .then(res => {
        const list = res.data?.results ?? res.data ?? []
        setUnreadCount(list.filter(n => !n.is_read).length)
      })
      .catch(() => {})
  }, [])

  return (
    <nav className="mobile-footer-nav">
      {items.map(({ label, to, Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/dashboard'}
          className={({ isActive }) =>
            `mobile-footer-nav__item${isActive ? ' mobile-footer-nav__item--active' : ''}`
          }
        >
          <span className="mobile-footer-nav__icon-wrap">
            <Icon size={22} strokeWidth={2} />
            {badge && unreadCount > 0 && (
              <span className="mobile-footer-nav__badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </span>
          <span className="mobile-footer-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
