import React, { useEffect, useState, useRef } from 'react'
import {
  Bell, FileText, Video, CheckCircle2, XCircle, Star, CheckCheck,
  GraduationCap, Briefcase, User, FileText as FileTextIcon,
  ExternalLink, Heart, MessageCircle, Send,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import notificationService from '@/services/notificationService'
import postService from '@/services/postService'
import { SectionHeading } from './components/SectionHeading'
import './StudentsPage.css'

const NOTIF_META = {
  application_update: { label: 'Application Update', Icon: FileText, bg: '#EFF6FF', color: '#4E89BD' },
  interview_scheduled: { label: 'Interview Scheduled', Icon: Video, bg: '#FFFBEB', color: '#D97706' },
  offer_received: { label: 'Offer Received', Icon: CheckCircle2, bg: '#F0FDF4', color: '#16A34A' },
  hired: { label: 'Hired', Icon: Star, bg: '#F0FDF4', color: '#16A34A' },
  rejected: { label: 'Rejected', Icon: XCircle, bg: '#FFF1F2', color: '#E06C75' },
  general: { label: 'General', Icon: Bell, bg: '#F8FAFC', color: '#64748B' },
}

const ACTIONS = [
  { label: 'My Courses', desc: 'Lessons & assignments', Icon: GraduationCap, color: '#F97316', bg: '#FFF7ED', href: 'https://moodle.mycodexacademy.com/login/index.php?lang=en_us', external: true },
  { label: 'Career Center', desc: 'Browse open roles', Icon: Briefcase, color: '#4E89BD', bg: '#EFF6FF', to: '/codexhub/jobs' },
  { label: 'My Profile', desc: 'Resume & portfolio', Icon: User, color: '#8B5CF6', bg: '#F5F3FF', to: '/profile' },
  { label: 'Applications', desc: 'Track your pipeline', Icon: FileTextIcon, color: '#64748B', bg: '#F8FAFC', to: '/codexhub/applications' },
  { label: 'My Instructors', desc: 'Meet your teachers', Icon: Star, color: '#D97706', bg: '#FEF3C7', to: '/codexhub/instructors' },
]

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function PostCard({ post, currentUser, onToggleLike }) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)

  const authorInitials = (post.author_initials || post.author_name?.[0] || '?').toUpperCase()
  const liked = post.liked_by_me

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true)
      try {
        const res = await postService.getComments(post.id)
        setComments(res.data?.results ?? res.data ?? [])
      } catch {}
      setLoadingComments(false)
    }
    setShowComments(v => !v)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const res = await postService.addComment(post.id, { content: commentText.trim() })
      setComments(prev => [...prev, res.data])
      setCommentText('')
    } catch {}
    setSubmitting(false)
  }

  const POST_TYPE_BADGE = {
    student_spotlight: { label: 'Student Spotlight', color: '#D97706', bg: '#FEF3C7' },
    announcement: { label: 'Announcement', color: '#7C3AED', bg: '#EDE9FE' },
    general: { label: 'General', color: '#4E89BD', bg: '#EFF6FF' },
  }
  const badge = POST_TYPE_BADGE[post.post_type] || POST_TYPE_BADGE.general

  return (
    <article className="students-post-card">
      <div className="students-post-card__header">
        <div className="students-post-card__avatar">{authorInitials}</div>
        <div className="students-post-card__meta">
          <p className="students-post-card__author">{post.author_name || 'CodeX Academy'}</p>
          <p className="students-post-card__time">{timeAgo(post.created_at)}</p>
        </div>
        <span className="students-post-card__badge" style={{ color: badge.color, background: badge.bg }}>
          {badge.label}
        </span>
      </div>

      <div className="students-post-card__body">
        {post.title && <p className="students-post-card__title">{post.title}</p>}
        <p className="students-post-card__content">{post.content}</p>
      </div>

      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title || 'Post image'}
          className="students-post-card__image"
        />
      )}

      <div className={`students-post-card__actions${post.image_url ? '' : ' students-post-card__actions--bordered'}`}>
        <button
          onClick={() => onToggleLike(post.id)}
          className={`students-post-card__action-btn${liked ? ' students-post-card__action-btn--liked' : ''}`}
        >
          <Heart size={16} strokeWidth={2} fill={liked ? '#E06C75' : 'none'} />
          {post.like_count > 0 && post.like_count}
        </button>
        <button onClick={toggleComments} className="students-post-card__action-btn">
          <MessageCircle size={16} strokeWidth={2} />
          {post.comment_count > 0 && post.comment_count}
        </button>
      </div>

      {showComments && (
        <div className="students-post-card__comments">
          {loadingComments ? (
            <p className="students-post-card__comments-loading">Loading...</p>
          ) : comments.map(c => (
            <div key={c.id} className="students-post-card__comment">
              <div className="students-post-card__comment-avatar">
                {(c.author_initials || c.author_name?.[0] || '?').toUpperCase()}
              </div>
              <div className="students-post-card__comment-body">
                <p className="students-post-card__comment-author">{c.author_name}</p>
                <p className="students-post-card__comment-text">{c.content}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleAddComment} className="students-post-card__comment-form">
            <input
              ref={inputRef}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="students-post-card__comment-input"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="students-post-card__comment-submit"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </article>
  )
}

export default function StudentsPage({ userName }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    notificationService.getAll({ ordering: '-created_at' })
      .then(res => setNotifications(res.data?.results ?? res.data ?? []))
      .catch(() => {})
    postService.getAll({ ordering: '-created_at' })
      .then(res => setPosts(res.data?.results ?? res.data ?? []))
      .catch(() => {})
      .finally(() => setPostsLoading(false))
  }, [])

  const handleToggleLike = async (postId) => {
    try {
      const res = await postService.toggleLike(postId)
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, liked_by_me: res.data.liked, like_count: res.data.like_count }
        : p
      ))
    } catch {}
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch {}
  }

  const displayName = userName || user?.first_name || user?.username || 'Student'
  const initials = (user?.first_name?.[0] ?? user?.username?.[0] ?? 'S').toUpperCase()
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="codexhub-students">
      <div className="students-page-shell">
        <header className="students-page-hero">
          <Link to="/codexhub/profile" className="students-page-hero__avatar">{initials}</Link>
          <div className="students-page-hero__copy">
            <SectionHeading label="Student Dashboard" />
            <h1 className="students-page-hero__title">Welcome back, {displayName}!</h1>
            <p className="students-page-hero__subtitle">
              Explore new job opportunities, update your profile, and stay on top of everything in one place.
            </p>
          </div>
          {unreadCount > 0 && (
            <Link to="/notifications" className="students-page-hero__badge">
              <Bell size={13} strokeWidth={2.5} />
              {unreadCount} new
            </Link>
          )}
        </header>

        <div className="students-page-body">
          <div className="students-page-grid">
            <aside className="students-panel students-panel--notifications">
              <div className="students-panel__header">
                <div className="students-panel__heading-wrap">
                  <SectionHeading label="Notifications" />
                  {unreadCount > 0 && (
                    <span className="students-panel__count">{unreadCount}</span>
                  )}
                </div>
                <Link to="/notifications" className="students-panel__link">
                  See all
                </Link>
              </div>

              <div className="students-panel__body students-panel__body--scroll">
                {notifications.length === 0 ? (
                  <div className="students-empty-state students-empty-state--compact">
                    <Bell size={28} strokeWidth={1.4} className="students-empty-state__icon" />
                    <p className="students-empty-state__text">No notifications yet</p>
                  </div>
                ) : notifications.slice(0, 12).map((notif) => {
                  const meta = NOTIF_META[notif.notification_type] || NOTIF_META.general
                  const { Icon } = meta
                  return (
                    <div
                      key={notif.id}
                      className={`students-notification${notif.is_read ? '' : ' students-notification--unread'}`}
                    >
                      <div className="students-notification__icon" style={{ background: meta.bg }}>
                        <Icon size={14} strokeWidth={2} style={{ color: meta.color }} />
                      </div>
                      <div className="students-notification__content">
                        <p className={`students-notification__title${notif.is_read ? '' : ' students-notification__title--strong'}`}>
                          {notif.title}
                        </p>
                        <p className="students-notification__message">{notif.message}</p>
                        <div className="students-notification__meta">
                          <span className="students-notification__time">{timeAgo(notif.created_at)}</span>
                          {!notif.is_read && <span className="students-notification__dot" />}
                        </div>
                      </div>
                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          title="Mark as read"
                          className="students-notification__mark-read"
                        >
                          <CheckCheck size={13} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </aside>

            <main className="students-feed">
              <div className="students-feed__header">
                <SectionHeading label="Community Feed" />
              </div>
              {postsLoading ? (
                <div className="students-empty-state students-empty-state--feed">Loading feed...</div>
              ) : posts.length === 0 ? (
                <div className="students-empty-state students-empty-state--card">
                  <MessageCircle size={38} strokeWidth={1.2} className="students-empty-state__icon students-empty-state__icon--large" />
                  <p className="students-empty-state__title">No posts yet</p>
                  <p className="students-empty-state__desc">
                    Announcements and updates from CodeX Academy will appear here.
                  </p>
                </div>
              ) : posts.map(post => (
                <PostCard key={post.id} post={post} currentUser={user} onToggleLike={handleToggleLike} />
              ))}
            </main>

            <aside className="students-panel students-panel--actions">
              <div className="students-panel__header">
                <div className="students-panel__heading-wrap">
                  <SectionHeading label="Quick Access" />
                </div>
              </div>
              <div className="students-panel__body">
                {ACTIONS.map(({ label, desc, Icon, color, bg, href, to, external }) => {
                  const inner = (
                    <div className="students-action">
                      <div className="students-action__icon" style={{ background: bg }}>
                        <Icon size={17} strokeWidth={2} style={{ color }} />
                      </div>
                      <div className="students-action__content">
                        <p className="students-action__title">{label}</p>
                        <p className="students-action__desc">{desc}</p>
                      </div>
                      {external && <ExternalLink size={12} className="students-action__external" />}
                    </div>
                  )

                  return external ? (
                    <a key={label} href={href} target="_blank" rel="noreferrer" className="students-action-link">
                      {inner}
                    </a>
                  ) : (
                    <Link key={label} to={to} className="students-action-link">
                      {inner}
                    </Link>
                  )
                })}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
