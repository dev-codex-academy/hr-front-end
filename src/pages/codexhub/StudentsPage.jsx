import React, { useEffect, useState } from 'react'
import {
  BriefcaseIcon,
  GraduationCapIcon,
  ExternalLinkIcon,
  UserIcon,
  MessageSquareIcon,
  FileTextIcon,
  HeartIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const SectionHeading = ({ label }) => (
  <div className="codexhub-section-heading">
    <span className="codexhub-section-accent" />
    <h2 className="codexhub-section-label">{label}</h2>
  </div>
)

export default function StudentsPage({ userName }) {
  const { user } = useAuth()
  const [appliedCount, setAppliedCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    const readCount = (key) => {
      try {
        const raw = localStorage.getItem(key)
        if (!raw) return 0
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.length : 0
      } catch {
        return 0
      }
    }

    setAppliedCount(readCount('appliedJobIds'))
    setSavedCount(readCount('savedJobIds'))
  }, [])

  const displayName = userName || user?.first_name || user?.username || 'Student'

  return (
    <div className="codexhub-students">
      <div className="codexhub-container">
        <SectionHeading label="Student Dashboard" />
        <div className="codexhub-hero">
          <h1 className="codexhub-title">
            Welcome back, <span>{displayName}</span>
          </h1>
          <p className="codexhub-subtitle">
            Your student dashboard for coursework, career tools, and community.
          </p>
        </div>

        <section className="codexhub-section">
          <SectionHeading label="Overview" />
          <div className="codexhub-stats">
            {[
              { label: 'Applications', value: appliedCount, caption: 'Submitted' },
              { label: 'Interviews', value: '0', caption: 'Upcoming' },
              { label: 'Saved Jobs', value: savedCount, caption: 'Active' },
            ].map((stat) => (
              <div key={stat.label} className="codexhub-card codexhub-stat">
                <p className="codexhub-stat-label">{stat.label}</p>
                <p className="codexhub-stat-value">{stat.value}</p>
                <p className="codexhub-stat-caption">{stat.caption}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="codexhub-section">
          <SectionHeading label="Student Actions" />
          <div className="codexhub-actions">
            <div className="codexhub-card codexhub-action">
              <div className="codexhub-icon codexhub-icon--orange">
                <GraduationCapIcon />
              </div>
              <h2>My Courses</h2>
              <p>Access lessons, assignments, and cohort materials inside Moodle.</p>
              <a
                href="https://moodledev.codexcrm.click/login/index.php"
                target="_blank"
                rel="noreferrer"
                className="codexhub-btn codexhub-btn--orange"
              >
                Go to Moodle <ExternalLinkIcon />
              </a>
            </div>

            <div className="codexhub-card codexhub-action">
              <div className="codexhub-icon codexhub-icon--blue">
                <BriefcaseIcon />
              </div>
              <h2>Career Center</h2>
              <p>Browse curated job openings, internships, and employer roles.</p>
              <Link to="/codexhub/jobs" className="codexhub-btn codexhub-btn--blue">
                Explore Jobs
              </Link>
            </div>

            <div className="codexhub-card codexhub-action">
              <div className="codexhub-icon codexhub-icon--green">
                <MessageSquareIcon />
              </div>
              <h2>Community</h2>
              <p>Join cohort discussions, connect with mentors, and stay updated.</p>
              <a href="#" className="codexhub-btn codexhub-btn--green">
                Open Slack
              </a>
            </div>

            <div className="codexhub-card codexhub-action">
              <div className="codexhub-icon codexhub-icon--purple">
                <UserIcon />
              </div>
              <h2>My Profile</h2>
              <p>Update your resume, portfolio links, and visibility.</p>
              <Link to="/codexhub/profile" className="codexhub-btn codexhub-btn--purple">
                View Profile
              </Link>
            </div>

            <div className="codexhub-card codexhub-action">
              <div className="codexhub-icon codexhub-icon--slate">
                <FileTextIcon />
              </div>
              <h2>Applications</h2>
              <p>Track submitted applications and pipeline progress.</p>
              <Link to="/codexhub/profile" className="codexhub-btn codexhub-btn--slate">
                View Applications
              </Link>
            </div>

            <div className="codexhub-card codexhub-action">
              <div className="codexhub-icon codexhub-icon--rose">
                <HeartIcon />
              </div>
              <h2>Saved Jobs</h2>
              <p>Keep track of roles you want to apply to later.</p>
              <Link to="/codexhub/profile" className="codexhub-btn codexhub-btn--rose">
                View Saved Jobs
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
