import { useEffect, useState, useRef } from 'react'
import {
  Clock, BookCheck, Users, CircleUser, GraduationCap,
  ExternalLink, Heart, MessageCircle, Send, BarChart2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import postService from '@/services/postService'
import { SectionHeading } from './components/SectionHeading'
import './CodexHubWideLayout.css'
import './TAPage.css'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)     return 'just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const POST_TYPE_BADGE = {
  student_spotlight: { label: 'Student Spotlight', color: '#D97706', bg: '#FEF3C7' },
  announcement:      { label: 'Announcement',      color: '#3d6e98', bg: '#EFF6FF' },
  general:           { label: 'General',           color: '#4E89BD', bg: '#EFF6FF' },
}

function PostCard({ post, onToggleLike }) {
  const [showComments, setShowComments] = useState(false)
  const [comments,     setComments]     = useState([])
  const [loadingCmts,  setLoadingCmts]  = useState(false)
  const [commentText,  setCommentText]  = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const inputRef = useRef(null)

  const badge          = POST_TYPE_BADGE[post.post_type] || POST_TYPE_BADGE.general
  const authorInitials = (post.author_initials || post.author_name?.[0] || '?').toUpperCase()
  const liked          = post.liked_by_me

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingCmts(true)
      try {
        const res = await postService.getComments(post.id)
        setComments(res.data?.results ?? res.data ?? [])
      } catch {}
      setLoadingCmts(false)
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

  return (
    <div className="ta-post-card">
      <div className="ta-post-card__header">
        <div className="ta-post-card__avatar">{authorInitials}</div>
        <div>
          <p className="ta-post-card__author">{post.author_name || 'CodeX Academy'}</p>
          <p className="ta-post-card__time">{timeAgo(post.created_at)}</p>
        </div>
        <span className="ta-post-card__badge" style={{ color: badge.color, background: badge.bg }}>
          {badge.label}
        </span>
      </div>

      <div className="ta-post-card__body">
        {post.title && <p className="ta-post-card__title">{post.title}</p>}
        <p className="ta-post-card__content">{post.content}</p>
      </div>

      {post.image_url && (
        <img src={post.image_url} alt={post.title || 'Post'} className="ta-post-card__image" />
      )}

      <div className="ta-post-card__actions">
        <button
          onClick={() => onToggleLike(post.id)}
          className={`ta-post-card__action-btn${liked ? ' ta-post-card__action-btn--liked' : ''}`}
        >
          <Heart size={16} strokeWidth={2} fill={liked ? '#e06c75' : 'none'} />
          {post.like_count > 0 && post.like_count}
        </button>
        <button onClick={toggleComments} className="ta-post-card__action-btn">
          <MessageCircle size={16} strokeWidth={2} />
          {post.comment_count > 0 && post.comment_count}
        </button>
      </div>

      {showComments && (
        <div className="ta-post-card__comments">
          {loadingCmts ? (
            <p className="ta-post-card__comments-loading">Loading…</p>
          ) : comments.map(c => (
            <div key={c.id} className="ta-post-card__comment">
              <div className="ta-post-card__comment-avatar">
                {(c.author_initials || c.author_name?.[0] || '?').toUpperCase()}
              </div>
              <div className="ta-post-card__comment-body">
                <p className="ta-post-card__comment-author">{c.author_name}</p>
                <p className="ta-post-card__comment-text">{c.content}</p>
              </div>
            </div>
          ))}
          <form onSubmit={handleAddComment} className="ta-post-card__comment-form">
            <input
              ref={inputRef}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="ta-post-card__comment-input"
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="ta-post-card__comment-submit"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

const QUICK_ITEMS = [
 
  { label: 'My Reports',       desc: 'Hours & mentorship log', Icon: BarChart2,     color: '#AD545B', bg: '#FFF0F1', to: '/ta/logs' },
  { label: 'My Profile',       desc: 'Your employee card',     Icon: CircleUser,    color: '#4E89BD', bg: '#EFF6FF', to: '/profile' },
  { label: 'My Courses',       desc: 'Teaching platform',      Icon: GraduationCap, color: '#F97316', bg: '#FFF7ED', href: 'https://moodle.mycodexacademy.com/login/index.php?lang=en_us', external: true },
]

export default function TAPage() {
  const { user } = useAuth()
  const initials    = ((user?.first_name?.[0] ?? '') + (user?.last_name?.[0] ?? '')).toUpperCase() || 'TA'
  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username

  const [posts,        setPosts]        = useState([])
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
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

  return (
    <div className="codexhub-students">
      <div className="codexhub-wide-shell">
        <div className="ta-page-hero">
          <div className="ta-page-hero__avatar">{initials}</div>
          <div>
            <p className="ta-page-hero__label">Teaching Assistant</p>
            <h1 className="ta-page-hero__title">Welcome, {displayName}!</h1>
          </div>
        </div>

        <div className="codexhub-wide-grid codexhub-wide-grid--ta">
          {/* Feed */}
          <div className="ta-page-feed">
            <SectionHeading label="Community Feed" />
            {postsLoading ? (
              <p className="ta-page-feed__empty">Loading posts…</p>
            ) : posts.length === 0 ? (
              <p className="ta-page-feed__empty">No posts yet.</p>
            ) : posts.map(p => (
              <PostCard key={p.id} post={p} onToggleLike={handleToggleLike} />
            ))}
          </div>

          {/* Quick Access */}
          <div className="codexhub-wide-panel">
            <div className="ta-quick-panel__header">
              <SectionHeading label="Quick Access" />
            </div>
            {QUICK_ITEMS.map(({ label, desc, Icon, color, bg, to, href, external }) => {
              const inner = (
                <div className="ta-action">
                  <div className="ta-action__icon" style={{ background: bg }}>
                    <Icon size={17} strokeWidth={2} style={{ color }} />
                  </div>
                  <div>
                    <p className="ta-action__title">{label}</p>
                    <p className="ta-action__desc">{desc}</p>
                  </div>
                  {external && <ExternalLink size={12} className="ta-action__external" />}
                </div>
              )
              return external
                ? <a key={label} href={href} target="_blank" rel="noreferrer" className="ta-action-link">{inner}</a>
                : <Link key={label} to={to} className="ta-action-link">{inner}</Link>
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
