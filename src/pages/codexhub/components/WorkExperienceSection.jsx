import React from 'react'
import { SectionHeading } from './SectionHeading'

export const WorkExperienceSection = ({
  workExperiences,
  experienceToast,
  onAddClick,
  isAdding,
  experienceForm,
  onExperienceChange,
  onSaveNew,
  onCancelNew,
  experienceError,
  experienceSaving,
  editingExperienceId,
  editingExperience,
  onEditChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
}) => (
  <section className="codexhub-card rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <SectionHeading label="Work Experience" />
      <button
        onClick={onAddClick}
        className="codexhub-btn rounded-lg border border-brand-blue/30 px-4 py-2 text-sm font-semibold text-brand-blue transition hover:border-brand-red/50 hover:bg-brand-red/10 hover:text-brand-red"
      >
        Add experience
      </button>
    </div>

    {experienceToast && (
      <p className="mb-4 text-sm text-emerald-600">{experienceToast}</p>
    )}

    {workExperiences.length ? (
      <div className="space-y-4">
        {workExperiences.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-100 p-5"
          >
            {editingExperienceId === item.id && editingExperience ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">
                    Company
                    <input
                      value={editingExperience.company}
                      onChange={(event) =>
                        onEditChange('company', event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Title
                    <input
                      value={editingExperience.title}
                      onChange={(event) =>
                        onEditChange('title', event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Location
                    <input
                      value={editingExperience.location}
                      onChange={(event) =>
                        onEditChange('location', event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    Start date
                    <input
                      type="date"
                      value={editingExperience.start_date}
                      onChange={(event) =>
                        onEditChange('start_date', event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    End date
                    <input
                      type="date"
                      value={editingExperience.end_date}
                      onChange={(event) =>
                        onEditChange('end_date', event.target.value)
                      }
                      disabled={editingExperience.is_current}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-700">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingExperience.is_current}
                        onChange={(event) =>
                          onEditChange('is_current', event.target.checked)
                        }
                      />
                      Current role
                    </span>
                  </label>
                  <label className="text-sm font-medium text-slate-700 md:col-span-2">
                    Description
                    <textarea
                      rows={4}
                      value={editingExperience.description}
                      onChange={(event) =>
                        onEditChange('description', event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </label>
                </div>

                {experienceError && (
                  <p className="mt-3 text-sm text-rose-500">{experienceError}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={onEditSave}
                    disabled={experienceSaving}
                    className="rounded-lg bg-brand-blue px-6 py-3 font-semibold text-white transition hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {experienceSaving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button
                    onClick={onEditCancel}
                    className="rounded-lg border border-slate-200/80 px-6 py-3 font-semibold text-slate-600 transition hover:border-brand-red/40 hover:bg-rose-50 hover:text-brand-red"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-brand-blue">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {item.company}
                      {item.location ? ` • ${item.location}` : ''}
                    </p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {item.start_date}
                    {item.is_current
                      ? ' - Present'
                      : item.end_date
                        ? ` - ${item.end_date}`
                        : ''}
                  </p>
                </div>
                {item.description && (
                  <p className="mt-3 text-sm text-slate-600">
                    {item.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => onEditStart(item)}
                    className="rounded-lg border border-brand-blue/30 px-4 py-2 text-sm font-semibold text-brand-blue transition hover:border-brand-red/50 hover:bg-brand-red/10 hover:text-brand-red"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-slate-500">
        Add your work history to help employers get the full picture.
      </p>
    )}

    {isAdding && (
      <div className="mt-6 rounded-2xl border border-brand-blue/20 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Company
            <input
              value={experienceForm.company}
              onChange={(event) =>
                onExperienceChange('company', event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Title
            <input
              value={experienceForm.title}
              onChange={(event) =>
                onExperienceChange('title', event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Location
            <input
              value={experienceForm.location}
              onChange={(event) =>
                onExperienceChange('location', event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Start date
            <input
              type="date"
              value={experienceForm.start_date}
              onChange={(event) =>
                onExperienceChange('start_date', event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            End date
            <input
              type="date"
              value={experienceForm.end_date}
              onChange={(event) =>
                onExperienceChange('end_date', event.target.value)
              }
              disabled={experienceForm.is_current}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={experienceForm.is_current}
                onChange={(event) =>
                  onExperienceChange('is_current', event.target.checked)
                }
              />
              Current role
            </span>
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Description
            <textarea
              rows={4}
              value={experienceForm.description}
              onChange={(event) =>
                onExperienceChange('description', event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </label>
        </div>

        {experienceError && (
          <p className="mt-3 text-sm text-rose-500">{experienceError}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={onSaveNew}
            disabled={experienceSaving}
            className="rounded-lg bg-brand-blue px-6 py-3 font-semibold text-white transition hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-70"
          >
            {experienceSaving ? 'Saving...' : 'Save experience'}
          </button>
          <button
            onClick={onCancelNew}
            className="rounded-lg border border-slate-200/80 px-6 py-3 font-semibold text-slate-600 transition hover:border-brand-red/40 hover:bg-rose-50 hover:text-brand-red"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </section>
)
