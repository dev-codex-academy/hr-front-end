import React, { useEffect, useMemo, useRef, useState } from "react";
import { UploadIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import applicantService from "@/services/applicantService";
import workExperienceService from "@/services/workExperienceService";
import jobApplicationService from "@/services/jobApplicationService";
import { useAuth } from "@/context/AuthContext";
import { safeParseJSON } from "./utils/storage";
import { SectionHeading } from "./components/SectionHeading";
import { SkillsSection } from "./components/SkillsSection";
import { WorkExperienceSection } from "./components/WorkExperienceSection";
import { ApplicationsSection } from "./components/ApplicationsSection";

const DEFAULT_SKILLS = [
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "AWS",
  "REST APIs",
  "Git",
  "Tailwind CSS",
];

const buildSkill = (name) => ({
  id:
    (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  name,
});

const buildProfileFormState = (data) => ({
  first_name: data?.first_name || "",
  last_name: data?.last_name || "",
  headline: data?.headline || data?.tags || "",
  summary: data?.summary || "",
  email: data?.email || "",
  phone: data?.phone || "",
  linkedin_url: data?.linkedin_url || "",
  portfolio_url: data?.portfolio_url || "",
  city: data?.city || "",
  state: data?.state || "",
  country: data?.country || "",
});

export default function CodexHubProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [applications, setApplications] = useState([]);
  const [fallbackApplications, setFallbackApplications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({});
  const [profileNotice, setProfileNotice] = useState("");
  const [uploadState, setUploadState] = useState("idle");
  const [uploadError, setUploadError] = useState("");
  const [profileSaveError, setProfileSaveError] = useState("");
  const [workExperiences, setWorkExperiences] = useState([]);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [editingExperience, setEditingExperience] = useState(null);
  const [experienceForm, setExperienceForm] = useState({
    company: "",
    title: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  });
  const [experienceError, setExperienceError] = useState("");
  const [experienceSaving, setExperienceSaving] = useState(false);
  const [experienceToast, setExperienceToast] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editingSkillValue, setEditingSkillValue] = useState("");
  const [skillMenuId, setSkillMenuId] = useState(null);
  const fileInputRef = useRef(null);
  const skillsHydratedRef = useRef(false);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await applicantService.getMyProfile();
        setProfileData(res.data);
        setProfileNotice("");
      } catch (error) {
        setProfileNotice(
          error?.response?.status === 403
            ? "Profile access is limited for this account. Contact an admin if this persists."
            : "Could not load your profile. Please try again.",
        );
      } finally {
        setProfileLoaded(true);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!profileData) return;
    setFormState(buildProfileFormState(profileData));
  }, [profileData]);

  useEffect(() => {
    if (!profileData) return;
    const base = profileData.work_experiences;
    setWorkExperiences(sortExperiences(Array.isArray(base) ? base : []));
  }, [profileData]);

  useEffect(() => {
    const raw = localStorage.getItem("studentSkills");
    if (!raw) {
      setSkills(DEFAULT_SKILLS.map(buildSkill));
      skillsHydratedRef.current = true;
      return;
    }
    const parsed = safeParseJSON(raw, []);
    setSkills(
      Array.isArray(parsed) && parsed.length
        ? parsed
        : DEFAULT_SKILLS.map(buildSkill),
    );
    skillsHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!skillsHydratedRef.current) return;
    localStorage.setItem("studentSkills", JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    if (!profileData) return;
    if (
      Array.isArray(user?.permissions) &&
      !user.permissions.includes("app.view_workexperience")
    ) {
      setWorkExperiences([]);
      return;
    }
    const fetchExperiences = async () => {
      try {
        const res = await workExperienceService.getAll({
          applicant: profileData.id,
        });
        const items = res.data?.results ?? res.data ?? [];
        setWorkExperiences(sortExperiences(Array.isArray(items) ? items : []));
      } catch (error) {
        if (error?.response?.status !== 403)
          console.error("Failed to fetch work experiences:", error);
        setWorkExperiences([]);
      }
    };
    fetchExperiences();
  }, [profileData]);

  useEffect(() => {
    if (!profileData) return;
    if (
      Array.isArray(user?.permissions) &&
      !user.permissions.includes("app.view_jobapplication")
    ) {
      setApplications([]);
      return;
    }
    const loadApplications = async () => {
      try {
        const res = await jobApplicationService.getAll({
          applicant: profileData.id,
        });
        const apps = res.data?.results ?? res.data ?? [];
        const safeApps = Array.isArray(apps) ? apps : [];
        setApplications(safeApps);
        const ids = safeApps
          .map((app) => app.job?.id || app.job)
          .filter(Boolean);
        if (ids.length)
          localStorage.setItem("appliedJobIds", JSON.stringify(ids));
      } catch (error) {
        if (error?.response?.status !== 403)
          console.error("Failed to load applications:", error);
        setApplications([]);
      }
    };
    loadApplications();
  }, [profileData]);



  useEffect(() => {
    const userKey =
      localStorage.getItem("applicantId") ||
      localStorage.getItem("username") ||
      "guest";
    const raw = localStorage.getItem(`appliedJobs:${userKey}`);
    if (!raw) return;
    const parsed = safeParseJSON(raw, []);
    if (Array.isArray(parsed)) setFallbackApplications(parsed);
  }, []);

  useEffect(() => {
    if (!experienceToast) return;
    const t = setTimeout(() => setExperienceToast(""), 3000);
    return () => clearTimeout(t);
  }, [experienceToast]);

  useEffect(() => {
    if (uploadState !== "success") return;
    const t = setTimeout(() => setUploadState("idle"), 3000);
    return () => clearTimeout(t);
  }, [uploadState]);

  // ── Derived ───────────────────────────────────────────────────
  const fullName = useMemo(() => {
    if (!profileData) return user?.first_name || user?.username || "Student";
    const name =
      `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim();
    return name || profileData.username || user?.username || "Student";
  }, [profileData, user]);

  const formatStage = (stage) => {
    if (!stage) return "Applied";
    return stage
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const resolveJobTitle = (app) =>
    app.job_title ||
    app.job?.title ||
    app.job?.position?.title ||
    "Job Application";

  //  Helpers 
  const sortExperiences = (items) => {
    try {
      return [...(Array.isArray(items) ? items : [])].sort((a, b) =>
        (b.start_date || "").localeCompare(a.start_date || ""),
      );
    } catch {
      return [];
    }
  };

  // profile
  const handleFieldChange = (field, value) =>
    setFormState((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!profileData) return;
    try {
      setProfileSaveError("");
      const res = await applicantService.updateMyProfile(formState);
      setProfileData(res.data);
      setIsEditing(false);
    } catch (error) {
      setProfileSaveError(
        error?.message || "Profile update failed. Please try again.",
      );
    }
  };

  const handleCancel = () => {
    if (!profileData) return;
    setFormState(buildProfileFormState(profileData));
    setIsEditing(false);
  };

  // CV Upload
  const handleUploadClick = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleCvUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      ![
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.type)
    ) {
      setUploadError("Please upload a PDF, DOC, or DOCX file.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be 5MB or smaller.");
      event.target.value = "";
      return;
    }
    if (!profileData) return;
    setUploadState("loading");
    setUploadError("");
    try {
      const res = await applicantService.uploadMyCV(profileData.id, file);
      setProfileData((prev) => ({ ...prev, ...res.data }));
      setUploadState("success");
    } catch (error) {
      setUploadState("error");
      setUploadError(
        error?.message ||
          "CV upload failed. The HR server may be down or misconfigured.",
      );
    } finally {
      event.target.value = "";
    }
  };

  // Skills
  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    setSkills((prev) => [buildSkill(trimmed), ...prev]);
    setNewSkill("");
  };

  const handleEditSkillStart = (skill) => {
    setEditingSkillId(skill.id);
    setEditingSkillValue(skill.name);
    setSkillMenuId(null);
  };

  const handleEditSkillSave = () => {
    const trimmed = editingSkillValue.trim();
    if (!trimmed) return;
    setSkills((prev) =>
      prev.map((s) => (s.id === editingSkillId ? { ...s, name: trimmed } : s)),
    );
    setEditingSkillId(null);
    setEditingSkillValue("");
  };

  const handleDeleteSkill = (skillId) => {
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
    setSkillMenuId(null);
    if (editingSkillId === skillId) {
      setEditingSkillId(null);
      setEditingSkillValue("");
    }
  };

  // work experience 
  const handleExperienceChange = (field, value) =>
    setExperienceForm((prev) => ({ ...prev, [field]: value }));

  const handleExperienceCancel = () => {
    setExperienceError("");
    setIsAddingExperience(false);
    setEditingExperienceId(null);
    setEditingExperience(null);
    setExperienceSaving(false);
    setExperienceForm({
      company: "",
      title: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
    });
  };

  const handleExperienceSave = async () => {
    if (!profileData) return;
    if (
      !experienceForm.company.trim() ||
      !experienceForm.title.trim() ||
      !experienceForm.start_date
    ) {
      setExperienceError("Company, title, and start date are required.");
      return;
    }
    setExperienceSaving(true);
    setExperienceError("");
    try {
      const payload = {
        applicant: profileData.id,
        company: experienceForm.company.trim(),
        title: experienceForm.title.trim(),
        location: experienceForm.location.trim() || undefined,
        start_date: experienceForm.start_date,
        end_date: experienceForm.is_current
          ? null
          : experienceForm.end_date || null,
        is_current: Boolean(experienceForm.is_current),
        description: experienceForm.description.trim() || undefined,
      };
      const res = await workExperienceService.create(payload);
      const created = res.data;
      setWorkExperiences((prev) => sortExperiences([created, ...prev]));
      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              work_experiences: [created, ...(prev.work_experiences || [])],
            }
          : prev,
      );
      setExperienceToast("Work experience saved.");
      handleExperienceCancel();
    } catch (error) {
      setExperienceError(error?.message || "Failed to save experience.");
      setExperienceSaving(false);
    }
  };

  const handleExperienceEditStart = (item) => {
    setExperienceError("");
    setEditingExperienceId(item.id);
    setEditingExperience({
      company: item.company || "",
      title: item.title || "",
      location: item.location || "",
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      is_current: Boolean(item.is_current),
      description: item.description || "",
    });
  };

  const handleExperienceEditChange = (field, value) =>
    setEditingExperience((prev) => ({ ...prev, [field]: value }));

  const handleExperienceUpdate = async () => {
    if (!editingExperienceId || !editingExperience) return;
    if (
      !editingExperience.company.trim() ||
      !editingExperience.title.trim() ||
      !editingExperience.start_date
    ) {
      setExperienceError("Company, title, and start date are required.");
      return;
    }
    setExperienceSaving(true);
    setExperienceError("");
    try {
      const payload = {
        applicant: profileData?.id,
        company: editingExperience.company.trim(),
        title: editingExperience.title.trim(),
        location: editingExperience.location.trim() || undefined,
        start_date: editingExperience.start_date,
        end_date: editingExperience.is_current
          ? null
          : editingExperience.end_date || null,
        is_current: Boolean(editingExperience.is_current),
        description: editingExperience.description.trim() || undefined,
      };
      const res = await workExperienceService.update(
        editingExperienceId,
        payload,
      );
      const updated = res.data;
      setWorkExperiences((prev) =>
        sortExperiences(
          prev.map((item) => (item.id === updated.id ? updated : item)),
        ),
      );
      setExperienceToast("Work experience updated.");
      handleExperienceCancel();
    } catch (error) {
      setExperienceError(error?.message || "Failed to update experience.");
      setExperienceSaving(false);
    }
  };

  const handleExperienceDelete = async (experienceId) => {
    if (!window.confirm("Delete this work experience? This cannot be undone."))
      return;
    try {
      await workExperienceService.remove(experienceId);
      setWorkExperiences((prev) =>
        prev.filter((item) => item.id !== experienceId),
      );
      setExperienceToast("Work experience deleted.");
      if (editingExperienceId === experienceId) handleExperienceCancel();
    } catch (error) {
      setExperienceError(error?.message || "Failed to delete experience.");
    }
  };

  
  if (!profileLoaded)
    return <div className="cxprofile-loading">Loading profile…</div>;

  if (!profileData)
    return (
      <div className="cxprofile-page">
        <div className="cxprofile-container">
          <div className="cxprofile-card">
            <SectionHeading label="Profile" />
            <p className="cxprofile-muted">
              We couldn't load your student profile yet. This usually means your
              account isn't linked to an applicant profile.
            </p>
            {profileNotice && (
              <p className="cxprofile-notice--error">{profileNotice}</p>
            )}
            <Link
              to="/register"
              className="codexhub-btn codexhub-btn--blue"
              style={{ marginTop: 20, display: "inline-flex" }}
            >
              Create applicant profile
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="cxprofile-page">
      <div className="cxprofile-container">
        {/* ── Top nav row ── */}
        

        {profileNotice && (
          <div className="cxprofile-notice--warning">{profileNotice}</div>
        )}

        {/*  Profile header */}
        <div className="cxprofile-header-card">
          <div className="cxprofile-header-info">
            <SectionHeading label="Profile" />
            <h1 className="cxprofile-name">{fullName}</h1>
            <p className="cxprofile-headline">
              {profileData.headline ||
                profileData.tags ||
                "Full Stack Developer | React · Node · AWS"}
            </p>
            <div className="cxprofile-badges">
              <span className="cxprofile-badge cxprofile-badge--blue">
                Spring 2026 Cohort
              </span>
              <span className="cxprofile-badge cxprofile-badge--green">
                Open to Work
              </span>
            </div>
          </div>
          <div className="cxprofile-header-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="codexhub-btn codexhub-btn--blue"
            >
              Edit Profile
            </button>
            <button
              onClick={handleUploadClick}
              className="codexhub-btn codexhub-btn--ghost"
            >
              <UploadIcon size={15} />
              {uploadState === "loading" ? "Uploading…" : "Upload Resume"}
            </button>
            {uploadState === "success" && (
              <p className="cxprofile-upload-success">
                Resume uploaded successfully.
              </p>
            )}
            {uploadError && (
              <p className="cxprofile-upload-error">{uploadError}</p>
            )}
            <Link
              to="/codexhub/students"
              className="codexhub-btn codexhub-btn--ghost"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleCvUpload}
            className="cxprofile-hidden"
          />
        </div>

        
        <div className="cxprofile-grid">
          {/* Left column */}
          <div className="cxprofile-main-col">
            <section className="cxprofile-card">
              <SectionHeading label="About" />
              <p className="cxprofile-body-text">
                {profileData.summary ||
                  "Passionate full stack developer with experience building responsive web applications using React, Node.js, and AWS. Strong foundation in modern JavaScript and backend architecture."}
              </p>
            </section>

            <SkillsSection
              skills={skills}
              newSkill={newSkill}
              onNewSkillChange={setNewSkill}
              onAddSkill={handleAddSkill}
              skillMenuId={skillMenuId}
              onToggleMenu={(id) =>
                setSkillMenuId(skillMenuId === id ? null : id)
              }
              onEditStart={handleEditSkillStart}
              onDelete={handleDeleteSkill}
              editingSkillId={editingSkillId}
              editingSkillValue={editingSkillValue}
              onEditValueChange={setEditingSkillValue}
              onEditSave={handleEditSkillSave}
              onEditCancel={() => {
                setEditingSkillId(null);
                setEditingSkillValue("");
              }}
            />

            <WorkExperienceSection
              workExperiences={workExperiences}
              experienceToast={experienceToast}
              onAddClick={() => setIsAddingExperience(true)}
              isAdding={isAddingExperience}
              experienceForm={experienceForm}
              onExperienceChange={handleExperienceChange}
              onSaveNew={handleExperienceSave}
              onCancelNew={handleExperienceCancel}
              experienceError={experienceError}
              experienceSaving={experienceSaving}
              editingExperienceId={editingExperienceId}
              editingExperience={editingExperience}
              onEditChange={handleExperienceEditChange}
              onEditStart={handleExperienceEditStart}
              onEditSave={handleExperienceUpdate}
              onEditCancel={handleExperienceCancel}
              onDelete={handleExperienceDelete}
            />
          </div>

          {/* Right sidebar */}
          <div className="cxprofile-sidebar-col">
            <section className="cxprofile-card">
              <SectionHeading label="Contact" />
              <div className="cxprofile-sidebar-list">
                <p>{profileData.email}</p>
                <p>{profileData.phone || "Add a phone number"}</p>
                <p>
                  {profileData.city || "City"}, {profileData.state || "State"}
                </p>
              </div>
            </section>

            <section className="cxprofile-card">
              <SectionHeading label="Links" />
              <div className="cxprofile-sidebar-list">
                <a
                  href={profileData.portfolio_url || "#"}
                  className="cxprofile-link"
                >
                  Portfolio Website
                </a>
                <a
                  href={profileData.linkedin_url || "#"}
                  className="cxprofile-link"
                >
                  LinkedIn
                </a>
                <a href="#" className="cxprofile-link">
                  GitHub
                </a>
              </div>
            </section>

            <ApplicationsSection
              applications={applications}
              fallbackApplications={fallbackApplications}
              resolveJobTitle={resolveJobTitle}
              formatStage={formatStage}
            />
          </div>
        </div>
      </div>



              {/* Modal */}
      {isEditing && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel() }}
        >
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Profile</h2>
              <button onClick={handleCancel} className="modal-close" type="button">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
              <div className="modal-body">
                <div className="form-grid-2">
                  {[
                    { label: "First name", field: "first_name", type: "text" },
                    { label: "Last name", field: "last_name", type: "text" },
                  ].map(({ label, field, type }) => (
                    <div key={field} className="form-group">
                      <label className="form-label">{label}</label>
                      <input
                        type={type}
                        value={formState[field]}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        className="form-input"
                      />
                    </div>
                  ))}

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Headline</label>
                    <input
                      type="text"
                      value={formState.headline}
                      onChange={(e) => handleFieldChange("headline", e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Summary</label>
                    <textarea
                      rows={4}
                      value={formState.summary}
                      onChange={(e) => handleFieldChange("summary", e.target.value)}
                      className="form-textarea"
                    />
                  </div>

                  {[
                    { label: "Email", field: "email", type: "email" },
                    { label: "Phone", field: "phone", type: "tel" },
                    { label: "LinkedIn", field: "linkedin_url", type: "url" },
                    { label: "Portfolio", field: "portfolio_url", type: "url" },
                    { label: "City", field: "city", type: "text" },
                    { label: "State", field: "state", type: "text" },
                    { label: "Country", field: "country", type: "text" },
                  ].map(({ label, field, type }) => (
                    <div key={field} className="form-group">
                      <label className="form-label">{label}</label>
                      <input
                        type={type}
                        value={formState[field]}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        className="form-input"
                      />
                    </div>
                  ))}
                </div>

                {profileSaveError && (
                  <p className="form-error">{profileSaveError}</p>
                )}
              </div>

              <div className="modal-footer">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


