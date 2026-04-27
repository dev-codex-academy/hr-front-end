import { useEffect, useMemo, useRef, useState } from 'react'
import { UploadIcon } from 'lucide-react'
import applicantService from '@/services/applicantService'
import workExperienceService from '@/services/workExperienceService'
import jobApplicationService from '@/services/jobApplicationService'
import { useAuth } from '@/context/AuthContext'
import { safeParseJSON } from './utils/storage'
import { SkillsSection } from './components/SkillsSection'
import { WorkExperienceSection } from './components/WorkExperienceSection'
import { ApplicationsSection } from './components/ApplicationsSection'
import savedJobsService from './services/savedJobsService'

const DEFAULT_SKILLS = ['React', 'Node.js', 'Express', 'MongoDB', 'AWS', 'REST APIs', 'Git', 'Tailwind CSS']

const buildSkill = (name) => ({
  id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name,
})

const buildFormState = (data) => ({
  first_name: data?.first_name || '',
  last_name: data?.last_name || '',
  headline: data?.headline || '',
  summary: data?.summary || '',
  email: data?.email || '',
  phone: data?.phone || '',
  linkedin_url: data?.linkedin_url || '',
  portfolio_url: data?.portfolio_url || '',
  city: data?.city || '',
  state: data?.state || '',
  country: data?.country || '',
})

const BLANK_EXP = { company: '', title: '', location: '', start_date: '', end_date: '', is_current: false, description: '' }

const sortByDate = (items) =>
  [...items].sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''))

const TABS = ['About', 'Skills', 'Experience', 'Applications']

export default function CodexHubProfilePageMobile() {
  const { user } = useAuth()

  // ── data state ─────────────────────────────────────────────────
  const [profileData, setProfileData]   = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [applications, setApplications]  = useState([])
  const [fallbackApps, setFallbackApps]  = useState([])
  const [workExperiences, setWorkExp]    = useState([])
  const [skills, setSkills]              = useState([])

  // ── UI state ───────────────────────────────────────────────────
  const [activeTab, setActiveTab]         = useState('About')
  const [isEditing, setIsEditing]         = useState(false)
  const [formState, setFormState]         = useState({})
  const [formError, setFormError]         = useState('')
  const [uploadState, setUploadState]     = useState('idle') // idle | loading | success | error
  const [uploadError, setUploadError]     = useState('')

  // skill state
  const [newSkill, setNewSkill]               = useState('')
  const [editingSkillId, setEditingSkillId]   = useState(null)
  const [editingSkillValue, setEditingSkillValue] = useState('')
  const [skillMenuId, setSkillMenuId]         = useState(null)
  const skillsHydratedRef = useRef(false)

  // experience state
  const [isAddingExp, setIsAddingExp]             = useState(false)
  const [expForm, setExpForm]                     = useState(BLANK_EXP)
  const [expError, setExpError]                   = useState('')
  const [expSaving, setExpSaving]                 = useState(false)
  const [expToast, setExpToast]                   = useState('')
  const [editingExpId, setEditingExpId]           = useState(null)
  const [editingExp, setEditingExp]               = useState(null)

  const fileInputRef = useRef(null)

  // ── load ───────────────────────────────────────────────────────
  useEffect(() => {
    applicantService.getMyProfile()
      .then(res => { setProfileData(res.data) })
      .catch(() => {})
      .finally(() => setProfileLoaded(true))
  }, [])

  useEffect(() => {
    if (profileData) setFormState(buildFormState(profileData))
  }, [profileData])

  useEffect(() => {
    if (!profileData) return
    setWorkExp(sortByDate(profileData.work_experiences ?? []))
    workExperienceService.getAll({ applicant: profileData.id })
      .then(res => setWorkExp(sortByDate(res.data?.results ?? res.data ?? [])))
      .catch(() => {})
  }, [profileData])

  useEffect(() => {
    if (!profileData) return
    jobApplicationService.getAll({ applicant: profileData.id })
      .then(res => setApplications(res.data?.results ?? res.data ?? []))
      .catch(() => {})

    const userKey = localStorage.getItem('applicantId') || localStorage.getItem('username') || 'guest'
    const raw = localStorage.getItem(`appliedJobs:${userKey}`)
    if (raw) {
      const parsed = safeParseJSON(raw, [])
      if (Array.isArray(parsed)) setFallbackApps(parsed)
    }
  }, [profileData])

  useEffect(() => {
    const raw = localStorage.getItem('studentSkills')
    if (!raw) { setSkills(DEFAULT_SKILLS.map(buildSkill)); skillsHydratedRef.current = true; return }
    const parsed = safeParseJSON(raw, [])
    setSkills(Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_SKILLS.map(buildSkill))
    skillsHydratedRef.current = true
  }, [])

  useEffect(() => {
    if (skillsHydratedRef.current) localStorage.setItem('studentSkills', JSON.stringify(skills))
  }, [skills])

  useEffect(() => {
    if (!expToast) return
    const t = setTimeout(() => setExpToast(''), 3000)
    return () => clearTimeout(t)
  }, [expToast])

  useEffect(() => {
    if (uploadState === 'success') {
      const t = setTimeout(() => setUploadState('idle'), 3000)
      return () => clearTimeout(t)
    }
  }, [uploadState])

  // ── derived ────────────────────────────────────────────────────
  const fullName = useMemo(() => {
    if (!profileData) return user?.first_name || user?.username || 'Student'
    return `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || user?.username || 'Student'
  }, [profileData, user])

  const initials = (profileData?.first_name?.[0] || user?.first_name?.[0] || user?.username?.[0] || 'S').toUpperCase()
  const location = [profileData?.city, profileData?.state, profileData?.country].filter(Boolean).join(', ')

  const formatStage = (stage) =>
    stage ? stage.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') : 'Applied'
  const resolveJobTitle = (app) => app.job_title || app.job?.title || 'Job Application'

  // ── handlers — profile ─────────────────────────────────────────
  const handleSave = async () => {
    setFormError('')
    try {
      const res = await applicantService.updateMyProfile(formState)
      setProfileData(res.data)
      setIsEditing(false)
    } catch (err) {
      setFormError(err?.message || 'Failed to save.')
    }
  }

  // ── handlers — CV ──────────────────────────────────────────────
  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadState('loading'); setUploadError('')
    try {
      await applicantService.uploadMyCV(profileData.id, file)
      setUploadState('success')
    } catch {
      setUploadState('error'); setUploadError('Upload failed. Try again.')
    }
    e.target.value = ''
  }

  // ── handlers — skills ──────────────────────────────────────────
  const handleAddSkill = () => {
    const t = newSkill.trim()
    if (!t) return
    setSkills(prev => [buildSkill(t), ...prev])
    setNewSkill('')
  }
  const handleEditSkillStart = (skill) => {
    setEditingSkillId(skill.id); setEditingSkillValue(skill.name); setSkillMenuId(null)
  }
  const handleEditSkillSave = () => {
    const t = editingSkillValue.trim()
    if (!t) return
    setSkills(prev => prev.map(s => s.id === editingSkillId ? { ...s, name: t } : s))
    setEditingSkillId(null); setEditingSkillValue('')
  }
  const handleDeleteSkill = (id) => { setSkills(prev => prev.filter(s => s.id !== id)); setSkillMenuId(null) }

  // ── handlers — experience ──────────────────────────────────────
  const resetExp = () => {
    setExpForm(BLANK_EXP); setIsAddingExp(false); setEditingExpId(null)
    setEditingExp(null); setExpError(''); setExpSaving(false)
  }

  const handleExpSave = async () => {
    if (!expForm.company.trim() || !expForm.title.trim() || !expForm.start_date) {
      setExpError('Company, title and start date are required.'); return
    }
    setExpSaving(true)
    try {
      const res = await workExperienceService.create({
        applicant: profileData.id, ...expForm,
        end_date: expForm.is_current ? null : expForm.end_date || null,
      })
      setWorkExp(prev => sortByDate([res.data, ...prev]))
      setExpToast('Experience saved.')
      resetExp()
    } catch { setExpError('Failed to save.'); setExpSaving(false) }
  }

  const handleExpUpdate = async () => {
    if (!editingExp?.company.trim() || !editingExp.title.trim() || !editingExp.start_date) {
      setExpError('Company, title and start date are required.'); return
    }
    setExpSaving(true)
    try {
      const res = await workExperienceService.update(editingExpId, {
        applicant: profileData?.id, ...editingExp,
        end_date: editingExp.is_current ? null : editingExp.end_date || null,
      })
      setWorkExp(prev => sortByDate(prev.map(i => i.id === res.data.id ? res.data : i)))
      setExpToast('Experience updated.')
      resetExp()
    } catch { setExpError('Failed to update.'); setExpSaving(false) }
  }

  const handleExpEditStart = (item) => {
    setExpError(''); setEditingExpId(item.id)
    setEditingExp({
      company: item.company || '', title: item.title || '',
      location: item.location || '', start_date: item.start_date || '',
      end_date: item.end_date || '', is_current: Boolean(item.is_current),
      description: item.description || '',
    })
  }

  const handleExpDelete = async (id) => {
    if (!window.confirm('Delete this experience?')) return
    await workExperienceService.remove(id)
    setWorkExp(prev => prev.filter(i => i.id !== id))
    if (editingExpId === id) resetExp()
  }

  // ── guards ─────────────────────────────────────────────────────
  if (!profileLoaded) {
    return <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Loading profile…</div>
  }

  if (!profileData) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Could not load your profile.</p>
      </div>
    )
  }

  // ── render ─────────────────────────────────────────────────────
  return (
    <div>

      {/* ── Header gradient card ── */}
      <div style={{
        background: 'linear-gradient(135deg, #3d6e98 0%, #4e89bd 55%, #61afee 100%)',
        borderRadius: '24px', padding: '24px 20px', marginBottom: '18px',
      }}>
        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.34)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 800, color: '#fff',
          }}>{initials}</div>
          <div>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{fullName}</p>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
              {profileData.headline || 'Full Stack Developer'}
            </p>
            {location && (
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>{location}</p>
            )}
          </div>
        </div>

        {/* Status badges */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <span style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>
            Spring 2026
          </span>
          <span style={{ background: 'rgba(22,163,74,0.28)', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>
            Open to Work
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: 'rgba(255,255,255,0.95)', color: '#3d6e98',
              border: 'none', borderRadius: '20px', padding: '8px 18px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            }}
          >Edit Profile</button>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'rgba(255,255,255,0.18)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.34)', borderRadius: '20px',
              padding: '8px 16px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <UploadIcon size={13} />
            {uploadState === 'loading' ? 'Uploading…' : 'Upload CV'}
          </button>
        </div>

        {uploadState === 'success' && (
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#bbf7d0' }}>CV uploaded successfully.</p>
        )}
        {uploadState === 'error' && (
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#fca5a5' }}>{uploadError}</p>
        )}

        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} style={{ display: 'none' }} />
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '18px' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              color: activeTab === tab ? '#4E89BD' : '#94A3B8',
              background: 'none',
              borderBottom: `2px solid ${activeTab === tab ? '#4E89BD' : 'transparent'}`,
              marginBottom: '-2px', transition: 'color 0.15s, border-color 0.15s',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* ── Tab: About ── */}
      {activeTab === 'About' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {profileData.summary && (
            <div className="cxprofile-card">
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#4E89BD', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>About me</p>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, margin: 0 }}>{profileData.summary}</p>
            </div>
          )}

          <div className="cxprofile-card">
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#4E89BD', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {profileData.email && (
                <a href={`mailto:${profileData.email}`} style={{ fontSize: '14px', color: '#4E89BD', fontWeight: 600 }}>{profileData.email}</a>
              )}
              {profileData.phone && (
                <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>{profileData.phone}</p>
              )}
              {location && (
                <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>{location}</p>
              )}
            </div>
          </div>

          {(profileData.linkedin_url || profileData.portfolio_url) && (
            <div className="cxprofile-card">
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#4E89BD', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Links</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {profileData.linkedin_url && (
                  <a href={profileData.linkedin_url} target="_blank" rel="noreferrer"
                    style={{ fontSize: '14px', color: '#4E89BD', fontWeight: 600 }}>
                    LinkedIn →
                  </a>
                )}
                {profileData.portfolio_url && (
                  <a href={profileData.portfolio_url} target="_blank" rel="noreferrer"
                    style={{ fontSize: '14px', color: '#4E89BD', fontWeight: 600 }}>
                    Portfolio →
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Tab: Skills ── */}
      {activeTab === 'Skills' && (
        <SkillsSection
          skills={skills}
          newSkill={newSkill}
          onNewSkillChange={setNewSkill}
          onAddSkill={handleAddSkill}
          skillMenuId={skillMenuId}
          onToggleMenu={(id) => setSkillMenuId(skillMenuId === id ? null : id)}
          onEditStart={handleEditSkillStart}
          onDelete={handleDeleteSkill}
          editingSkillId={editingSkillId}
          editingSkillValue={editingSkillValue}
          onEditValueChange={setEditingSkillValue}
          onEditSave={handleEditSkillSave}
          onEditCancel={() => { setEditingSkillId(null); setEditingSkillValue('') }}
        />
      )}

      {/* ── Tab: Experience ── */}
      {activeTab === 'Experience' && (
        <WorkExperienceSection
          workExperiences={workExperiences}
          experienceToast={expToast}
          onAddClick={() => setIsAddingExp(true)}
          isAdding={isAddingExp}
          experienceForm={expForm}
          onExperienceChange={(field, value) => setExpForm(prev => ({ ...prev, [field]: value }))}
          onSaveNew={handleExpSave}
          onCancelNew={resetExp}
          experienceError={expError}
          experienceSaving={expSaving}
          editingExperienceId={editingExpId}
          editingExperience={editingExp}
          onEditChange={(field, value) => setEditingExp(prev => ({ ...prev, [field]: value }))}
          onEditStart={handleExpEditStart}
          onEditSave={handleExpUpdate}
          onEditCancel={resetExp}
          onDelete={handleExpDelete}
        />
      )}

      {/* ── Tab: Applications ── */}
      {activeTab === 'Applications' && (
        <ApplicationsSection
          applications={applications}
          fallbackApplications={fallbackApps}
          resolveJobTitle={resolveJobTitle}
          formatStage={formatStage}
        />
      )}

      {/* ── Edit Profile — bottom-sheet modal ── */}
      {isEditing && (
        <div
          onClick={() => setIsEditing(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 60, display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '24px 24px 0 0', width: '100%',
              maxHeight: '88vh', overflowY: 'auto', padding: '0 20px 48px',
            }}
          >
            {/* drag handle */}
            <div style={{ position: 'sticky', top: 0, background: '#fff', paddingTop: '12px', paddingBottom: '4px', zIndex: 1 }}>
              <div style={{ width: '36px', height: '4px', background: '#E2E8F0', borderRadius: '2px', margin: '0 auto 16px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#1E293B' }}>Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{ background: 'none', border: 'none', fontSize: '22px', color: '#94A3B8', cursor: 'pointer', lineHeight: 1 }}
                >×</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* two-column row for first / last name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[['First Name', 'first_name'], ['Last Name', 'last_name']].map(([label, field]) => (
                  <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                    <input
                      type="text"
                      value={formState[field] || ''}
                      onChange={e => setFormState(prev => ({ ...prev, [field]: e.target.value }))}
                      style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                  </label>
                ))}
              </div>

              {/* single-column fields */}
              {[
                ['Headline', 'headline', 'text'],
                ['Phone', 'phone', 'tel'],
                ['LinkedIn URL', 'linkedin_url', 'url'],
                ['Portfolio URL', 'portfolio_url', 'url'],
              ].map(([label, field, type]) => (
                <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                  <input
                    type={type}
                    value={formState[field] || ''}
                    onChange={e => setFormState(prev => ({ ...prev, [field]: e.target.value }))}
                    style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                  />
                </label>
              ))}

              {/* location row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[['City', 'city'], ['State', 'state']].map(([label, field]) => (
                  <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                    <input
                      type="text"
                      value={formState[field] || ''}
                      onChange={e => setFormState(prev => ({ ...prev, [field]: e.target.value }))}
                      style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                  </label>
                ))}
              </div>

              {/* summary */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Summary</span>
                <textarea
                  rows={4}
                  value={formState.summary || ''}
                  onChange={e => setFormState(prev => ({ ...prev, summary: e.target.value }))}
                  style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </label>
            </div>

            {formError && (
              <p style={{ color: '#E06C75', fontSize: '13px', marginTop: '10px' }}>{formError}</p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1, background: '#4E89BD', color: '#fff', border: 'none',
                  borderRadius: '14px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                }}
              >Save changes</button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none',
                  borderRadius: '14px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
