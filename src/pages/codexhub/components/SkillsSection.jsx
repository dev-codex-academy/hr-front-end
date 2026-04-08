import React from 'react'
import { SectionHeading } from './SectionHeading'

export const SkillsSection = ({
  skills,
  newSkill,
  onNewSkillChange,
  onAddSkill,
  skillMenuId,
  onToggleMenu,
  onEditStart,
  onDelete,
  editingSkillId,
  editingSkillValue,
  onEditValueChange,
  onEditSave,
  onEditCancel,
}) => (
  <section className="codexhub-card codexhub-profile-card">
    <SectionHeading label="Technical Skills" />
    <div className="codexhub-skill-list">
      {skills.map((skill) => (
        <div key={skill.id} className="codexhub-skill-item">
          <button
            type="button"
            onClick={() => onToggleMenu(skill.id)}
            className="codexhub-skill-chip"
          >
            {skill.name}
          </button>
          {skillMenuId === skill.id && (
            <div className="codexhub-skill-menu">
              <button
                type="button"
                onClick={() => onEditStart(skill)}
                className="codexhub-skill-menu-btn"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(skill.id)}
                className="codexhub-skill-menu-btn danger"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>

    <div className="codexhub-form-row">
      <input
        value={newSkill}
        onChange={(event) => onNewSkillChange(event.target.value)}
        placeholder="Add a skill"
        className="codexhub-input"
      />
      <button
        type="button"
        onClick={onAddSkill}
        className="codexhub-btn codexhub-btn--blue"
      >
        Add skill
      </button>
    </div>

    {editingSkillId && (
      <div className="codexhub-form-row codexhub-form-row--compact">
        <input
          value={editingSkillValue}
          onChange={(event) => onEditValueChange(event.target.value)}
          className="codexhub-input"
        />
        <button
          type="button"
          onClick={onEditSave}
          className="codexhub-btn codexhub-btn--blue"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onEditCancel}
          className="codexhub-btn codexhub-btn--ghost"
        >
          Cancel
        </button>
      </div>
    )}
  </section>
)
