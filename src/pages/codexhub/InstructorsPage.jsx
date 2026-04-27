import React, { useEffect, useState } from 'react'
import {
  GraduationCap, Users, MapPin, Mail, Calendar,
  BookOpen, ExternalLink, Award, Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import instructorService from '@/services/instructorService'
import { SectionHeading } from './components/SectionHeading'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import './CodexHubWideLayout.css'
import './InstructorsPage.css'

const ROLE_CONFIG = {
  Instructor: { label: 'Teacher', color: '#3d6e98', bg: '#EFF6FF', accent: 'linear-gradient(135deg,#3d6e98,#4E89BD)' },
  'Teaching Assistant': { label: 'Teaching Assistant', color: '#4E89BD', bg: '#f5f9ff', accent: 'linear-gradient(135deg,#4E89BD,#61afee)' },
}

const SKILL_LEVEL_COLOR = {
  expert:       { color: '#3d6e98', bg: '#EFF6FF' },
  advanced:     { color: '#4E89BD', bg: '#f5f9ff' },
  intermediate: { color: '#64748b', bg: '#f8fafc' },
  beginner:     { color: '#92400E', bg: '#FEF3C7' },
}

function Avatar({ person, size = 52, fontSize = 18 }) {
  const [imgError, setImgError] = useState(false)
  const initials = ((person.first_name?.[0] ?? '') + (person.last_name?.[0] ?? '')).toUpperCase()
  const role = ROLE_CONFIG[person.position_title]

  if (person.photo_url && !imgError) {
    return (
      <img
        src={person.photo_url}
        alt={`${person.first_name} ${person.last_name}`}
        onError={() => setImgError(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '3px solid rgba(255,255,255,0.6)' }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: role?.accent ?? 'linear-gradient(135deg,#3d6e98,#4E89BD)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 800,
        color: 'white',
        border: '3px solid rgba(255,255,255,0.3)',
      }}
    >
      {initials}
    </div>
  )
}

function InstructorProfileContent({ person }) {
  const role = ROLE_CONFIG[person.position_title] ?? {
    label: person.position_title ?? 'Staff',
    color: '#4E89BD',
    bg: '#EFF6FF',
    accent: 'linear-gradient(135deg,#3d6e98,#4E89BD)',
  }
  const hireYear = person.hire_date ? new Date(person.hire_date).getFullYear() : null
  const skills = person.skills ?? []

  return (
    <>
      <div className="instructor-detail-hero">
        <div className="instructor-detail-hero__inner">
          <Avatar person={person} size={68} fontSize={24} />
          <div>
            <h2 className="instructor-detail-hero__name">
              {person.first_name} {person.last_name}
            </h2>
            <span className="instructor-detail-hero__role" style={{ color: role.color, background: role.bg }}>
              {role.label}
            </span>
            {person.notes && (
              <p className="instructor-detail-hero__notes">{person.notes}</p>
            )}
          </div>
        </div>
      </div>

      <div className="instructor-detail-body">
        <div className="instructor-detail-info">
          {person.position_title && <InfoRow Icon={BookOpen} label="Role" value={person.position_title} />}
          {(person.city || person.state) && (
            <InfoRow Icon={MapPin} label="Location" value={[person.city, person.state, person.country].filter(Boolean).join(', ')} />
          )}
          {hireYear && <InfoRow Icon={Calendar} label="CodeX member since" value={String(hireYear)} />}
          {person.email && <InfoRow Icon={Mail} label="Email" value={person.email} href={`mailto:${person.email}`} />}
        </div>

        {person.calendly_url && (
          <a
            href={person.calendly_url}
            target="_blank"
            rel="noreferrer"
            className="instructor-detail-calendly"
          >
            <Calendar size={16} strokeWidth={2} />
            Schedule a Meeting
            <ExternalLink size={13} style={{ opacity: 0.8 }} />
          </a>
        )}

        {skills.length > 0 && (
          <div>
            <p className="instructor-detail-skills-label">Skills</p>
            <div className="instructor-detail-skills">
              {skills.map(s => {
                const lvl = SKILL_LEVEL_COLOR[s.level] ?? SKILL_LEVEL_COLOR.intermediate
                return (
                  <span key={s.id} className="instructor-detail-skill-badge" style={{ color: lvl.color, background: lvl.bg }}>
                    {s.skill_name}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function InfoRow({ Icon, label, value, href }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} strokeWidth={2} style={{ color: '#4E89BD' }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1px' }}>{label}</p>
        {href
          ? <a href={href} style={{ fontSize: '13px', color: '#4E89BD', fontWeight: 600, textDecoration: 'none' }}>{value}</a>
          : <p style={{ fontSize: '13px', color: '#1E293B', fontWeight: 600, margin: 0 }}>{value}</p>
        }
      </div>
    </div>
  )
}

function InstructorCard({ person, onSelect }) {
  const role = ROLE_CONFIG[person.position_title] ?? {
    label: person.position_title ?? 'Staff',
    color: '#4E89BD',
    bg: '#EFF6FF',
    accent: 'linear-gradient(135deg,#3d6e98,#4E89BD)',
  }
  const hireYear = person.hire_date ? new Date(person.hire_date).getFullYear() : null
  const skills = (person.skills ?? []).slice(0, 3)

  return (
    <div className="instructor-card" onClick={() => onSelect(person)}>
      <div className="instructor-card__bar" style={{ background: role.accent }} />

      <div className="instructor-card__body">
        <div className="instructor-card__top">
          <Avatar person={person} size={50} fontSize={17} />
          <div className="instructor-card__top-info">
            <p className="instructor-card__name">{person.first_name} {person.last_name}</p>
            <span className="instructor-card__role-badge" style={{ color: role.color, background: role.bg }}>
              {role.label}
            </span>
          </div>
        </div>

        <div className="instructor-card__meta">
          {(person.city || person.state) && (
            <p className="instructor-card__meta-row">
              <MapPin size={11} strokeWidth={2} />
              {person.city}{person.state ? `, ${person.state}` : ''}
            </p>
          )}
          {hireYear && (
            <p className="instructor-card__meta-row">
              <Calendar size={11} strokeWidth={2} />
              Member since {hireYear}
            </p>
          )}
          {person.calendly_url && (
            <p className="instructor-card__meta-row instructor-card__meta-row--calendly">
              <Star size={11} strokeWidth={2} />
              Schedule available
            </p>
          )}
        </div>

        {skills.length > 0 && (
          <div className="instructor-card__skills">
            {skills.map(s => {
              const lvl = SKILL_LEVEL_COLOR[s.level] ?? SKILL_LEVEL_COLOR.intermediate
              return (
                <span key={s.id} className="instructor-card__skill-badge" style={{ color: lvl.color, background: lvl.bg }}>
                  {s.skill_name}
                </span>
              )
            })}
            {(person.skills ?? []).length > 3 && (
              <span className="instructor-card__skill-more">+{(person.skills ?? []).length - 3} more</span>
            )}
          </div>
        )}

        <div className="instructor-card__footer">
          <span className="instructor-card__cta">View profile →</span>
          {person.calendly_url && (
            <span className="instructor-card__calendly-badge">Calendly</span>
          )}
        </div>
      </div>
    </div>
  )
}

function InstructorSection({ title, Icon, people, onSelect }) {
  return (
    <section className="instructors-section">
      <div className="instructors-section__heading">
        {/* <span className="instructors-section__icon" aria-hidden="true">
          <Icon size={15} />
        </span> */}
        <SectionHeading label={title} />
      </div>
      <div className="instructors-section__grid">
        {people.map(p => <InstructorCard key={p.id} person={p} onSelect={onSelect} />)}
      </div>
    </section>
  )
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    instructorService.getAll()
      .then(res => {
        const data = res.data?.results ?? res.data ?? []
        setInstructors(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const teachers = instructors.filter(i => i.position_title === 'Instructor')
  const tas = instructors.filter(i => i.position_title === 'Teaching Assistant')

  if (loading) return <p className="instructors-loading">Loading...</p>

  return (
    <div className="codexhub-students">
      <div className="codexhub-wide-shell instructors-page">
        <div className="instructors-header-card">
          <div className="instructors-header-card__copy">
            <SectionHeading label="Instructors" />
            <h1 className="codexhub-title codexhub-title--sm instructors-header-card__title">Meet Your Instructors</h1>
            <p className="codexhub-subtitle instructors-header-card__subtitle">The CodeX Academy team behind your learning journey.</p>
          </div>
          <Link
            to="/codexhub/students"
            className="codexhub-btn codexhub-btn--ghost instructors-header-card__action"
          >
            Back to Dashboard
          </Link>
        </div>

        {instructors.length === 0 ? (
          <div className="instructors-empty-state">
            <Users size={36} strokeWidth={1.2} className="instructors-empty-state__icon" />
            <p className="instructors-empty-state__title">No instructors found</p>
          </div>
        ) : (
          <div className="instructors-sections-grid">
            {teachers.length > 0 && <InstructorSection title="Teachers" Icon={GraduationCap} people={teachers} onSelect={setSelected} />}
            {tas.length > 0 && <InstructorSection title="Teaching Assistants" Icon={Award} people={tas} onSelect={setSelected} />}
          </div>
        )}

      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="instructor-detail-dialog">
          {selected && <InstructorProfileContent person={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
