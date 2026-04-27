import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import jobApplicationService from "@/services/jobApplicationService";
import applicantService from "@/services/applicantService";
import { SectionHeading } from "./components/SectionHeading";
import "./CodexHubWideLayout.css";
import "./StudentApplicationsPage.css";

const STAGE_COLORS = {
  applied: "blue",
  screening: "yellow",
  phone_interview: "yellow",
  interview: "orange",
  technical_test: "orange",
  background_check: "orange",
  offer_sent: "green",
  hired: "green",
  rejected: "red",
  withdrawn: "gray",
};

const formatStage = (stage) => {
  if (!stage) return "Applied";
  return stage
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatDate = (dt) => {
  if (!dt) return null;
  return new Date(dt).toLocaleDateString();
};

function ApplicationCard({ app }) {
  const color = STAGE_COLORS[app.stage] || "blue";
  const jobTitle =
    app.job_title || app.job?.title || app.job?.position?.title || "Job Application";
  const company = app.company_name || app.job?.company_name || null;
  const updated = formatDate(app.stage_updated_at || app.created_at);

  return (
    <div className="student-app-card">
      <div className="student-app-card__header">
        <div className="student-app-card__icon">
          <FileText size={20} strokeWidth={1.6} />
        </div>
        <span className={`student-app-badge student-app-badge--${color}`}>
          {formatStage(app.stage)}
        </span>
      </div>
      <h3 className="student-app-card__title">{jobTitle}</h3>
      {company && <p className="student-app-card__company">{company}</p>}
      {updated && (
        <p className="student-app-card__date">Last updated {updated}</p>
      )}
    </div>
  );
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const profileRes = await applicantService.getMyProfile();
        const profile = profileRes.data;
        const appsRes = await jobApplicationService.getAll({
          applicant: profile.id,
        });
        const apps = appsRes.data?.results ?? appsRes.data ?? [];
        setApplications(Array.isArray(apps) ? apps : []);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="codexhub-students">
      <div className="codexhub-wide-shell student-apps-page">
        <div className="student-apps-header-card">
          <div className="student-apps-header-card__copy">
            <SectionHeading label="My Applications" />
            <h1 className="codexhub-title codexhub-title--sm">
              Application Tracker
            </h1>
            <p className="codexhub-subtitle student-apps-header-card__subtitle">
              Track the status of every job you've applied to.
            </p>
          </div>
          <Link
            to="/codexhub/jobs"
            className="codexhub-btn codexhub-btn--ghost student-apps-header-card__action"
          >
            Browse Jobs
          </Link>
        </div>

        {loading ? (
          <div className="codexhub-card codexhub-empty">
            Loading your applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="codexhub-card codexhub-empty">
            <FileText size={32} strokeWidth={1.4} className="codexhub-empty__icon" />
            <p>No applications yet.</p>
            <p className="codexhub-empty__sub">
              Apply to open jobs from the job board to see them here.
            </p>
          </div>
        ) : (
          <div className="student-apps-grid">
            {applications.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
