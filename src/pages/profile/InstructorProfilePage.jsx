import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import {
  MapPin, Mail, Calendar, BookOpen, Pencil, X, Save,
  Camera, Link2, Plus, Trash2,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { useAuth } from '@/context/AuthContext'
import employeeService from '@/services/employeeService'
import skillService from '@/services/skillService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionHeading } from '@/pages/codexhub/components/SectionHeading'

const ROLE_BADGE = {
  Instructor: { label: 'Teacher', color: '#7C3AED', bg: '#EDE9FE' },
  'Teaching Assistant': { label: 'Teaching Assistant', color: '#16A34A', bg: '#F0FDF4' },
}

const LEVEL_COLORS = {
  beginner: { color: '#92400E', bg: '#FEF3C7' },
  intermediate: { color: '#1D4ED8', bg: '#DBEAFE' },
  advanced: { color: '#065F46', bg: '#D1FAE5' },
  expert: { color: '#6D28D9', bg: '#EDE9FE' },
}

function InfoRow({ Icon, label, value, href }) {
  if (!value) return null
  const text = href
    ? <a href={href} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: '#4E89BD', fontWeight: 500, textDecoration: 'none' }}>{value}</a>
    : <p style={{ fontSize: '14px', color: '#1E293B', fontWeight: 500 }}>{value}</p>

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} strokeWidth={2} style={{ color: '#4E89BD' }} />
      </div>
      <div>
        <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{label}</p>
        {text}
      </div>
    </div>
  )
}

export default function InstructorProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [allSkills, setAllSkills] = useState([])
  const [mySkills, setMySkills] = useState([])
  const [addSkillId, setAddSkillId] = useState('')
  const [addLevel, setAddLevel] = useState('intermediate')
  const [skillSaving, setSkillSaving] = useState(false)

  const photoInputRef = useRef(null)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    employeeService.getMe()
      .then(res => {
        setProfile(res.data)
        reset(res.data)
        setMySkills(res.data.skills ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    skillService.getAll()
      .then(res => setAllSkills(res.data?.results ?? res.data ?? []))
      .catch(() => {})
  }, [reset])

  const onSave = async (data) => {
    try {
      const res = await employeeService.updateMe({
        phone: data.phone,
        city: data.city,
        state: data.state,
        country: data.country,
        notes: data.notes,
        calendly_url: data.calendly_url,
      })
      setProfile(res.data)
      setEditing(false)
      Swal.fire({ icon: 'success', title: 'Profile updated!', timer: 1500, showConfirmButton: false })
    } catch {
      Swal.fire('Error', 'Could not save changes.', 'error')
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const res = await employeeService.uploadPhoto(file)
      setProfile(prev => ({ ...prev, photo_url: res.data.photo_url }))
    } catch {
      Swal.fire('Error', 'Could not upload photo.', 'error')
    }
    setUploadingPhoto(false)
    e.target.value = ''
  }

  const handleAddSkill = async () => {
    if (!addSkillId) return
    setSkillSaving(true)
    try {
      const res = await employeeService.addMySkill(addSkillId, addLevel)
      setMySkills(prev => {
        const existing = prev.find(s => s.id === res.data.id)
        return existing ? prev.map(s => s.id === res.data.id ? res.data : s) : [...prev, res.data]
      })
      setAddSkillId('')
    } catch {
      Swal.fire('Error', 'Could not add skill.', 'error')
    }
    setSkillSaving(false)
  }

  const handleRemoveSkill = async (skillEntryId) => {
    try {
      await employeeService.removeMySkill(skillEntryId)
      setMySkills(prev => prev.filter(s => s.id !== skillEntryId))
    } catch {
      Swal.fire('Error', 'Could not remove skill.', 'error')
    }
  }

  const pageContentStyle = { width: '100%' }

  if (loading) {
    return (
      <div className="cxprofile-page">
        <div className="cxprofile-container">
          <div style={pageContentStyle}>
            <p style={{ color: '#94A3B8', padding: '40px 0' }}>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="cxprofile-page">
        <div className="cxprofile-container">
          <div style={pageContentStyle}>
            <div className="cxprofile-card" style={{ textAlign: 'center', color: '#94A3B8' }}>
              <SectionHeading label="Profile" />
              <p>No employee profile found. Contact an administrator.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const initials = ((profile.first_name?.[0] ?? '') + (profile.last_name?.[0] ?? '')).toUpperCase() || (user?.username?.[0] ?? 'I').toUpperCase()
  const badge = ROLE_BADGE[profile.position_title] ?? { label: profile.position_title ?? 'Instructor', color: '#4E89BD', bg: '#EFF6FF' }
  const hireYear = profile.hire_date ? new Date(profile.hire_date).getFullYear() : null
  const location = [profile.city, profile.state, profile.country !== 'US' ? profile.country : null].filter(Boolean).join(', ')
  const usedSkillIds = new Set(mySkills.map(s => s.skill))
  const availableSkills = allSkills.filter(s => !usedSkillIds.has(s.id))

  return (
    <div className="cxprofile-page">
      <div className="cxprofile-container">
        <div style={pageContentStyle}>
          <div className="cxprofile-header-card" style={{ marginBottom: '20px' }}>
            <div className="cxprofile-header-info">
              <SectionHeading label="Profile" />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={initials}
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                        if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex'
                      }}
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.9)', display: 'block' }}
                    />
                  ) : null}
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: profile.photo_url ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, color: 'white', border: '4px solid rgba(255,255,255,0.9)' }}>
                    {initials}
                  </div>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    title="Change photo"
                    style={{ position: 'absolute', bottom: '2px', right: '2px', width: '24px', height: '24px', borderRadius: '50%', background: '#4E89BD', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Camera size={11} style={{ color: 'white' }} />
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handlePhotoChange} />
                </div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <h1 className="cxprofile-name">{profile.first_name} {profile.last_name}</h1>
                  <p className="cxprofile-headline">
                    {profile.position_title || 'Instructor'}{location ? ` • ${location}` : ''}
                  </p>
                  <div className="cxprofile-badges">
                    <span className="cxprofile-badge" style={{ color: badge.color, background: badge.bg }}>
                      {badge.label}
                    </span>
                    {hireYear && (
                      <span className="cxprofile-badge cxprofile-badge--blue">
                        CodeX since {hireYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {editing ? (
                <textarea
                  {...register('notes')}
                  rows={4}
                  placeholder="Write a short bio about your background and teaching style..."
                  style={{ width: '100%', border: '1px solid rgba(255,255,255,0.24)', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', color: '#ffffff', boxSizing: 'border-box', background: 'rgba(255,255,255,0.08)' }}
                />
              ) : (
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.86)', lineHeight: 1.7, margin: 0 }}>
                  {profile.notes || 'Add a short bio to introduce your background, teaching style, and areas of expertise.'}
                </p>
              )}
            </div>

            <div className="cxprofile-header-actions">
              {editing ? (
                <button onClick={() => { setEditing(false); reset(profile) }} className="codexhub-btn codexhub-btn--ghost">
                  <X size={14} /> Cancel
                </button>
              ) : (
                <button onClick={() => setEditing(true)} className="codexhub-btn codexhub-btn--blue">
                  <Pencil size={14} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="cxprofile-card" style={{ marginBottom: '20px' }}>
            <SectionHeading label="Contact" />

            {editing ? (
              <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '5px' }}>City</label>
                    <Input {...register('city')} placeholder="Austin" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '5px' }}>State</label>
                    <Input {...register('state')} placeholder="TX" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '5px' }}>Country</label>
                    <Input {...register('country')} placeholder="US" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '5px' }}>Calendly URL</label>
                  <Input {...register('calendly_url')} placeholder="https://calendly.com/your-link" />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                  <Button type="submit" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Save size={14} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <div style={{ marginTop: '4px' }}>
                <InfoRow Icon={BookOpen} label="Position" value={profile.position_title} />
                <InfoRow Icon={Mail} label="Email" value={profile.email} />
                <InfoRow Icon={MapPin} label="Location" value={location} />
                <InfoRow Icon={Calendar} label="CodeX member since" value={hireYear ? String(hireYear) : null} />
                <InfoRow Icon={Link2} label="Calendly" value={profile.calendly_url || null} href={profile.calendly_url || null} />
              </div>
            )}
          </div>

          <div className="cxprofile-card">
            <SectionHeading label="Skills" />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: mySkills.length ? '16px' : '0' }}>
              {mySkills.map(s => {
                const lc = LEVEL_COLORS[s.level] ?? LEVEL_COLORS.intermediate
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: lc.bg, border: `1px solid ${lc.color}22`, borderRadius: '20px', padding: '4px 10px 4px 12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: lc.color }}>{s.skill_name}</span>
                    <span style={{ fontSize: '11px', color: lc.color, opacity: 0.75 }}>· {s.level}</span>
                    <button onClick={() => handleRemoveSkill(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', display: 'flex', alignItems: 'center', color: lc.color, opacity: 0.6 }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                )
              })}
              {mySkills.length === 0 && (
                <p style={{ fontSize: '14px', color: '#94A3B8', fontStyle: 'italic' }}>No skills added yet.</p>
              )}
            </div>

            {availableSkills.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <select
                  value={addSkillId}
                  onChange={e => setAddSkillId(e.target.value)}
                  style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#475569', outline: 'none', background: 'white' }}
                >
                  <option value="">Select a skill...</option>
                  {availableSkills.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
                <select
                  value={addLevel}
                  onChange={e => setAddLevel(e.target.value)}
                  style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#475569', outline: 'none', background: 'white' }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <Button onClick={handleAddSkill} disabled={!addSkillId || skillSaving} style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                  <Plus size={14} /> Add
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
