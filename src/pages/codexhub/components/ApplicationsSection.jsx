import React from 'react'
import { SectionHeading } from './SectionHeading'

export const ApplicationsSection = ({
  applications,
  fallbackApplications,
  resolveJobTitle,
  formatStage,
}) => (
  <section className="codexhub-card rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
    <SectionHeading label="My Applications" />
    <div className="space-y-4">
      {applications.length ? (
        applications.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between rounded-xl border border-brand-blue/10 bg-brand-blue/5 p-4"
          >
            <div>
              <h3 className="font-bold text-brand-blue">
                {resolveJobTitle(app)}
              </h3>
              <p className="text-xs text-slate-500">
                Last updated{' '}
                {new Date(
                  app.stage_updated_at || app.created_at,
                ).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                app.stage === 'offer_sent' || app.stage === 'hired'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-brand-blue/10 text-brand-blue'
              }`}
            >
              {formatStage(app.stage)}
            </span>
          </div>
        ))
      ) : fallbackApplications?.length ? (
        fallbackApplications.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between rounded-xl border border-brand-blue/10 bg-brand-blue/5 p-4"
          >
            <div>
              <h3 className="font-bold text-brand-blue">
                {app.title || 'Job Application'}
              </h3>
              <p className="text-xs text-slate-500">
                Applied{' '}
                {app.applied_at
                  ? new Date(app.applied_at).toLocaleDateString()
                  : 'recently'}
              </p>
            </div>
            <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-bold uppercase text-brand-blue">
              Applied
            </span>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500">
          No applications yet. Apply to jobs from the job board to see them
          here.
        </p>
      )}
    </div>
  </section>
)
