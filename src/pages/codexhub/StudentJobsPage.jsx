import { useEffect, useState } from "react";
import {
  ExternalLinkIcon,
  MapPinIcon,
  SendIcon,
  CalendarIcon,
  BuildingIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import publicJobService from "@/services/publicJobService";
import { SectionHeading } from "./components/SectionHeading";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import "./CodexHubWideLayout.css";
import "./StudentJobsPage.css";

const formatDate = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

const formatType = (type) =>
  type
    ? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

const formatSalary = (job) => {
  if (!job.salary_min && !job.salary_max) return null;
  const fmt = (n) => `$${Number(n).toLocaleString()}`;
  const currency = job.salary_currency ? ` ${job.salary_currency}` : "";
  if (job.salary_min && job.salary_max)
    return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}${currency}`;
  if (job.salary_min) return `From ${fmt(job.salary_min)}${currency}`;
  return `Up to ${fmt(job.salary_max)}${currency}`;
};

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const res = await publicJobService.getAll({
          status: "open",
          ordering: "-posted_date",
        });
        const data = res.data?.results ?? res.data ?? [];
        setJobs(data);
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  return (
    <div className="codexhub-students">
      <div className="codexhub-wide-shell student-jobs-page">
        <div className="student-jobs-header-card">
          <div className="student-jobs-header-card__copy">
            <SectionHeading label="Jobs" />
            <h1 className="codexhub-title codexhub-title--sm">
              Open Opportunities
            </h1>
            <p className="codexhub-subtitle student-jobs-header-card__subtitle">
              Browse open roles curated by CodeX Academy.
            </p>
          </div>
          <Link
            to="/codexhub/students"
            className="codexhub-btn codexhub-btn--ghost student-jobs-header-card__action"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="codexhub-card codexhub-empty">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="codexhub-card codexhub-empty">
            No open jobs right now. Check back soon.
          </div>
        ) : (
          <div className="codexhub-jobs-grid">
            {jobs.map((job) => (
                <div
                  key={job.id}
                  className="codexhub-card codexhub-job"
                  onClick={() => setSelectedJob(job)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedJob(job)}
                >
                  <div className="codexhub-job-header">
                    <h2>{job.title}</h2>
                    <span className="codexhub-job-type">
                      {(job.job_type || "role").replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="codexhub-job-company">
                    {job.company_name || job.display_company || "CodeX Academy"}
                  </p>
                  <div className="codexhub-job-meta">
                    <MapPinIcon />
                    <span>
                      {job.location || (job.is_remote ? "Remote" : "Hybrid")}
                    </span>
                  </div>
                  <p className="codexhub-job-desc">
                    {job.description ||
                      "View details to learn more about this opportunity."}
                  </p>
                  <div className="codexhub-job-footer">
                    <Link
                      to={`/apply/${job.id}`}
                      className="codexhub-btn codexhub-btn--blue"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Apply <SendIcon />
                    </Link>
                    <button
                      className="codexhub-btn codexhub-btn--ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                      }}
                    >
                      Details
                    </button>
                    {job.external_url && (
                      <a
                        href={job.external_url}
                        className="codexhub-btn codexhub-btn--ghost"
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLinkIcon size={14} />
                      </a>
                    )}
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>

      {/* Job detail modal */}
      <Dialog
        open={!!selectedJob}
        onOpenChange={(open) => !open && setSelectedJob(null)}
      >
        <DialogContent className="job-detail-dialog">
          {selectedJob && (() => {
            const salary = formatSalary(selectedJob);
            const company =
              selectedJob.company_name || selectedJob.display_company;
            const location =
              selectedJob.location ||
              (selectedJob.is_remote ? "Remote" : "Hybrid");

            return (
              <>
                {/* Blue gradient header */}
                <div className="job-detail-hero">
                  {selectedJob.job_type && (
                    <span className="job-detail-hero__type">
                      {formatType(selectedJob.job_type)}
                    </span>
                  )}
                  <h2 className="job-detail-hero__title">{selectedJob.title}</h2>
                  <div className="job-detail-hero__meta">
                    {company && (
                      <span>
                        <BuildingIcon size={13} /> {company}
                      </span>
                    )}
                    <span>
                      <MapPinIcon size={13} /> {location}
                    </span>
                    {selectedJob.posted_date && (
                      <span>
                        <CalendarIcon size={13} /> Posted{" "}
                        {formatDate(selectedJob.posted_date)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="job-detail-body">
                  {salary && (
                    <div className="job-detail-salary">{salary}</div>
                  )}

                  {selectedJob.description && (
                    <div>
                      <p className="codexhub-job-section-title">About this role</p>
                      <p className="codexhub-job-text">{selectedJob.description}</p>
                    </div>
                  )}

                  {selectedJob.requirements && (
                    <div>
                      <p className="codexhub-job-section-title">Requirements</p>
                      <p className="codexhub-job-text">{selectedJob.requirements}</p>
                    </div>
                  )}

                  <div className="job-detail-actions">
                    <Link
                      to={`/apply/${selectedJob.id}`}
                      className="codexhub-btn codexhub-btn--blue"
                      onClick={() => setSelectedJob(null)}
                    >
                      Apply Now <SendIcon size={15} />
                    </Link>
                    {selectedJob.external_url && (
                      <a
                        href={selectedJob.external_url}
                        className="codexhub-btn codexhub-btn--ghost"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Full Listing <ExternalLinkIcon size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
