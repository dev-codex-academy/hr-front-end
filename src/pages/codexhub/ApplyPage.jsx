import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  MapPinIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  SendIcon,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import publicJobService from '@/services/publicJobService'
import jobApplicationService from '@/services/jobApplicationService'
import applicantService from '@/services/applicantService'
import { SectionHeading } from './components/SectionHeading'
import './CodexHubWideLayout.css'
import './ApplyPage.css'

export default function ApplyPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [job, setJob] = useState(null)
  const [jobLoading, setJobLoading] = useState(true)
  const [jobError, setJobError] = useState('')

  const [applicantId, setApplicantId] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [coverLetter, setCoverLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [existingApplication, setExistingApplication] = useState(false)

  const resolvedJobId = job?.id ?? jobId

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      localStorage.setItem('pending_apply_job', jobId)
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, authLoading, jobId, navigate])

  useEffect(() => {
    if (!jobId) return
    publicJobService.getById(jobId)
      .then(res => setJob(res.data))
      .catch(() => setJobError('Job not found or no longer available.'))
      .finally(() => setJobLoading(false))
  }, [jobId])

  useEffect(() => {
    if (!isAuthenticated || authLoading) return
    setProfileLoading(true)
    applicantService.getMyProfile()
      .then(res => {
        setApplicantId(res.data.id)
        return jobApplicationService.getAll({ applicant: res.data.id, job: jobId })
          .then(appRes => {
            const apps = appRes.data?.results ?? appRes.data ?? []
            if (apps.length > 0) setExistingApplication(true)
          })
          .catch(() => {})
      })
      .catch(err => {
        setProfileError(err?.response?.status === 404 ? 'no-profile' : 'error')
      })
      .finally(() => setProfileLoading(false))
  }, [isAuthenticated, authLoading, jobId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!applicantId || !resolvedJobId) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await jobApplicationService.create({
        applicant: applicantId,
        job: resolvedJobId,
        cover_letter: coverLetter,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail
          || err.response?.data?.non_field_errors?.[0]
          || 'Could not submit application. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const isDisabled = !applicantId || existingApplication || submitting || !!profileError

  
  if (authLoading || jobLoading) {
    return (
      <div className="codexhub-students">
        <div className="codexhub-wide-shell">
          <div className="apply-page">
            <div className="apply-state-card"><p>Loading…</p></div>
          </div>
        </div>
      </div>
    )
  }

  
  if (jobError) {
    return (
      <div className="codexhub-students">
        <div className="codexhub-wide-shell">
          <div className="apply-page">
            <Link to="/codexhub/jobs" className="apply-back">
              <ArrowLeftIcon size={15} /> Back to jobs
            </Link>
            <div className="apply-state-card"><p>{jobError}</p></div>
          </div>
        </div>
      </div>
    )
  }

  
  if (submitted) {
    return (
      <div className="codexhub-students">
        <div className="codexhub-wide-shell">
          <div className="apply-page">
            <div className="apply-success-card">
              <div className="apply-success-card__top">
                <div className="apply-success-card__icon">
                  <CheckCircleIcon size={28} strokeWidth={2} />
                </div>
                <h2 className="apply-success-card__title">Application Submitted!</h2>
                <p className="apply-success-card__subtitle">
                  You've applied to <strong>{job?.title}</strong>
                  {job?.display_company || job?.company_name
                    ? ` at ${job.display_company || job.company_name}`
                    : ''}
                  . We'll be in touch soon.
                </p>
              </div>
              <div className="apply-success-card__body">
                <Link to="/codexhub/jobs" className="codexhub-btn codexhub-btn--ghost">
                  Browse more jobs
                </Link>
                <Link to="/codexhub/applications" className="codexhub-btn codexhub-btn--blue">
                  View my applications <SendIcon size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  
  return (
    <div className="codexhub-students">
      <div className="codexhub-wide-shell">
        <div className="apply-page">

          <Link to="/codexhub/jobs" className="apply-back">
            <ArrowLeftIcon size={15} /> Back to jobs
          </Link>

          {/* Job summary  */}
          {job && (
            <div className="apply-job-hero">
              <div className="apply-job-hero__icon">
                <BriefcaseIcon size={20} strokeWidth={1.8} />
              </div>
              <h1 className="apply-job-hero__title">{job.title}</h1>
              <p className="apply-job-hero__company">
                {job.display_company || job.company_name || 'CodeX Academy'}
              </p>
              <div className="apply-job-hero__meta">
                {job.location && (
                  <span className="apply-job-hero__meta-item">
                    <MapPinIcon size={13} /> {job.location}
                  </span>
                )}
                {job.job_type && (
                  <span className="apply-job-hero__meta-item">
                    <BriefcaseIcon size={13} />
                    {job.job_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                )}
              </div>
              {job.description && (
                <p className="apply-job-hero__desc">{job.description}</p>
              )}
            </div>
          )}

          {/* form */}
          <div className="apply-form-card">
        
              <SectionHeading label="Your Application"/>
        
          

            {existingApplication && (
              <div className="apply-alert apply-alert--warning">
                <AlertTriangleIcon size={16} />
                <span>
                  You've already applied to this position. Check your{' '}
                  <Link to="/codexhub/applications">applications</Link> to see the status.
                </span>
              </div>
            )}

            {profileLoading && (
              <div className="apply-alert apply-alert--warning">
                <span>Loading your profile…</span>
              </div>
            )}

            {profileError === 'no-profile' && (
              <div className="apply-alert apply-alert--error">
                <AlertCircleIcon size={16} />
                <span>
                  Your account doesn't have a student profile yet.{' '}
                  <Link to="/codexhub/profile">Create your profile</Link> before applying.
                </span>
              </div>
            )}

            {profileError === 'error' && (
              <div className="apply-alert apply-alert--error">
                <AlertCircleIcon size={16} />
                <span>Could not load your profile. Please refresh and try again.</span>
              </div>
            )}

            {submitError && (
              <div className="apply-alert apply-alert--error">
                <AlertCircleIcon size={16} />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label className="apply-textarea-label">
                Cover Letter <span>(optional)</span>
              </label>
              <textarea
                className="apply-textarea"
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're a great fit for this role…"
                rows={6}
                disabled={isDisabled && !submitting}
              />

              <div className="apply-form-actions">
                <button
                  type="submit"
                  disabled={isDisabled}
                  className="codexhub-btn codexhub-btn--blue"
                >
                  {submitting ? 'Submitting…' : 'Submit Application'}
                  {!submitting && <SendIcon size={15} />}
                </button>
                <Link to="/codexhub/profile" className="apply-profile-link">
                  Update my profile first
                </Link>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
