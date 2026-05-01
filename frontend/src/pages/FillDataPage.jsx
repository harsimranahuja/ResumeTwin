import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { ROLE_TEMPLATES } from '../utils/roleTemplates';
import { COUNTRY_CODES } from '../utils/countryCodes';
import './FillDataPage.css';

const STEPS = [
  'Personal',
  'Summary',
  'Experience',
  'Education',
  'Skills',
  'Extra',
];

const MonthYearInput = ({ value, onChange, disabled }) => {
  const [year, month] = (value || '').split('-');
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <select
        className="form-input"
        style={{ flex: 1, padding: '0.75rem 0.5rem' }}
        value={month || ''}
        disabled={disabled}
        onChange={(e) => onChange(`${year || new Date().getFullYear()}-${e.target.value}`)}
      >
        <option value="">Month</option>
        <option value="01">Jan</option>
        <option value="02">Feb</option>
        <option value="03">Mar</option>
        <option value="04">Apr</option>
        <option value="05">May</option>
        <option value="06">Jun</option>
        <option value="07">Jul</option>
        <option value="08">Aug</option>
        <option value="09">Sep</option>
        <option value="10">Oct</option>
        <option value="11">Nov</option>
        <option value="12">Dec</option>
      </select>
      <input
        className="form-input"
        style={{ width: '90px', padding: '0.75rem 0.5rem' }}
        type="number"
        placeholder="Year"
        min="1950" max="2050"
        value={year || ''}
        disabled={disabled}
        onChange={(e) => onChange(`${e.target.value}-${month || '01'}`)}
      />
    </div>
  );
};

export default function FillDataPage() {
  const { state, dispatch } = useResume();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [roleKey, setRoleKey] = useState('general');
  
  const tmpl = ROLE_TEMPLATES[roleKey] || ROLE_TEMPLATES.general;

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleGenerate = () => {
    navigate('/preview');
  };

  const renderProgress = () => (
    <div className="progress-bar">
      {STEPS.map((label, i) => (
        <div className="progress-step" key={label}>
          {i > 0 && (
            <div className={`step-line ${i <= step ? 'completed' : ''}`} />
          )}
          <div
            className={`step-number ${i === step ? 'active' : ''} ${
              i < step ? 'completed' : ''
            }`}
            onClick={() => setStep(i)}
            style={{ cursor: 'pointer' }}
          >
            {i < step ? '✓' : i + 1}
          </div>
          <span className="step-label">{label}</span>
        </div>
      ))}
    </div>
  );

  const renderPersonal = () => (
    <div className="form-section">
      <h2 className="form-section-title">Personal Information</h2>
      <p className="form-section-subtitle">
        Let&apos;s start with your basic details
      </p>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            className="form-input"
            type="text"
            placeholder="John Doe"
            value={state.personal.fullName}
            onChange={(e) =>
              dispatch({
                type: 'SET_PERSONAL',
                payload: { fullName: e.target.value },
              })
            }
          />
        </div>
        <div className="form-group">
          <label className="form-label">Job Title</label>
          <input
            className="form-input"
            type="text"
            placeholder={tmpl.jobTitle}
            value={state.personal.jobTitle}
            onChange={(e) =>
              dispatch({
                type: 'SET_PERSONAL',
                payload: { jobTitle: e.target.value },
              })
            }
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            className="form-input"
            type="email"
            placeholder="john@example.com"
            value={state.personal.email}
            onChange={(e) =>
              dispatch({
                type: 'SET_PERSONAL',
                payload: { email: e.target.value },
              })
            }
          />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(() => {
              const phoneStr = state.personal.phone || '';
              let currentCode = '+91';
              let currentNum = phoneStr;
              
              const match = phoneStr.match(/^(\+\d{1,4})\s*(.*)$/);
              if (match) {
                currentCode = match[1];
                currentNum = match[2];
              } else if (/^\d/.test(phoneStr)) {
                currentNum = phoneStr;
              }
              
              return (
                <>
                  <select
                    className="form-input"
                    style={{ width: '80px', flexShrink: 0, padding: '0.75rem 0.5rem', textAlign: 'left' }}
                    value={currentCode}
                    onChange={(e) => {
                      dispatch({
                        type: 'SET_PERSONAL',
                        payload: { phone: `${e.target.value} ${currentNum}`.trim() },
                      });
                    }}
                  >
                    <option value={currentCode} hidden>{currentCode}</option>
                    
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.label} value={c.code}>
                        {c.flag} {c.code} ({c.label})
                      </option>
                    ))}
                  </select>
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    type="tel"
                    placeholder="98765 43210"
                    value={currentNum}
                    onChange={(e) => {
                      dispatch({
                        type: 'SET_PERSONAL',
                        payload: { phone: `${currentCode} ${e.target.value}`.trim() },
                      });
                    }}
                  />
                </>
              );
            })()}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input
            className="form-input"
            type="text"
            placeholder="New York, NY"
            value={state.personal.location}
            onChange={(e) =>
              dispatch({
                type: 'SET_PERSONAL',
                payload: { location: e.target.value },
              })
            }
          />
        </div>
        <div className="form-group">
          <label className="form-label">LinkedIn</label>
          <input
            className="form-input"
            type="url"
            placeholder="linkedin.com/in/johndoe"
            value={state.personal.linkedin}
            onChange={(e) =>
              dispatch({
                type: 'SET_PERSONAL',
                payload: { linkedin: e.target.value },
              })
            }
          />
        </div>
        <div className="form-group full-width">
          <label className="form-label">Website / Portfolio</label>
          <input
            className="form-input"
            type="url"
            placeholder="https://johndoe.com"
            value={state.personal.website}
            onChange={(e) =>
              dispatch({
                type: 'SET_PERSONAL',
                payload: { website: e.target.value },
              })
            }
          />
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="form-section">
      <h2 className="form-section-title">Professional Summary</h2>
      <p className="form-section-subtitle">
        Write a brief summary of your professional background
      </p>
      <div className="form-group">
        <textarea
          className="form-textarea"
          placeholder={tmpl.summary}
          rows={6}
          value={state.summary}
          onChange={(e) =>
            dispatch({ type: 'SET_SUMMARY', payload: e.target.value })
          }
        />
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="form-section">
      <h2 className="form-section-title">Work Experience</h2>
      <p className="form-section-subtitle">
        Add your work history, starting with the most recent
      </p>
      {state.experience.map((exp, idx) => (
        <div className="entry-card" key={exp.id}>
          <div className="entry-card-header">
            <h4>Experience #{idx + 1}</h4>
            {state.experience.length > 1 && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() =>
                  dispatch({ type: 'REMOVE_EXPERIENCE', payload: exp.id })
                }
              >
                Remove
              </button>
            )}
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Company</label>
              <input
                className="form-input"
                type="text"
                placeholder="Acme Inc."
                value={exp.company}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_EXPERIENCE',
                    payload: { id: exp.id, data: { company: e.target.value } },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Position</label>
              <input
                className="form-input"
                type="text"
                placeholder={tmpl.expPosition}
                value={exp.position}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_EXPERIENCE',
                    payload: { id: exp.id, data: { position: e.target.value } },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <MonthYearInput
                value={exp.startDate}
                onChange={(val) =>
                  dispatch({
                    type: 'UPDATE_EXPERIENCE',
                    payload: {
                      id: exp.id,
                      data: { startDate: val },
                    },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <MonthYearInput
                value={exp.endDate}
                disabled={exp.current}
                onChange={(val) =>
                  dispatch({
                    type: 'UPDATE_EXPERIENCE',
                    payload: {
                      id: exp.id,
                      data: { endDate: val },
                    },
                  })
                }
              />
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id={`current-${exp.id}`}
                  checked={exp.current}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_EXPERIENCE',
                      payload: {
                        id: exp.id,
                        data: { current: e.target.checked, endDate: '' },
                      },
                    })
                  }
                />
                <label htmlFor={`current-${exp.id}`}>Currently working here</label>
              </div>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder={tmpl.expDesc}
                value={exp.description}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_EXPERIENCE',
                    payload: {
                      id: exp.id,
                      data: { description: e.target.value },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      ))}
      <button
        className="add-entry-btn"
        onClick={() => dispatch({ type: 'ADD_EXPERIENCE' })}
      >
        + Add Another Experience
      </button>
    </div>
  );

  const renderEducation = () => (
    <div className="form-section">
      <h2 className="form-section-title">Education</h2>
      <p className="form-section-subtitle">Add your educational background</p>
      {state.education.map((edu, idx) => (
        <div className="entry-card" key={edu.id}>
          <div className="entry-card-header">
            <h4>Education #{idx + 1}</h4>
            {state.education.length > 1 && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() =>
                  dispatch({ type: 'REMOVE_EDUCATION', payload: edu.id })
                }
              >
                Remove
              </button>
            )}
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Institution</label>
              <input
                className="form-input"
                type="text"
                placeholder="MIT"
                value={edu.institution}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_EDUCATION',
                    payload: {
                      id: edu.id,
                      data: { institution: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Degree</label>
              <input
                className="form-input"
                type="text"
                placeholder="Bachelor of Science"
                value={edu.degree}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_EDUCATION',
                    payload: {
                      id: edu.id,
                      data: { degree: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Field of Study</label>
              <input
                className="form-input"
                type="text"
                placeholder="Computer Science"
                value={edu.field}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_EDUCATION',
                    payload: {
                      id: edu.id,
                      data: { field: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Score
                <div style={{ display: 'flex', gap: '4px', fontSize: '0.75rem', textTransform: 'none' }}>
                  <button 
                    type="button"
                    style={{ background: edu.gradeType === 'Percentage' ? 'transparent' : 'var(--accent-primary)', color: edu.gradeType === 'Percentage' ? 'var(--text-secondary)' : '#fff', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => dispatch({ type: 'UPDATE_EDUCATION', payload: { id: edu.id, data: { gradeType: 'CGPA' } } })}
                  >CGPA</button>
                  <button 
                    type="button"
                    style={{ background: edu.gradeType === 'Percentage' ? 'var(--accent-primary)' : 'transparent', color: edu.gradeType === 'Percentage' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => dispatch({ type: 'UPDATE_EDUCATION', payload: { id: edu.id, data: { gradeType: 'Percentage' } } })}
                  >Percentage</button>
                </div>
              </label>
              <input
                className="form-input"
                type="text"
                placeholder={edu.gradeType === 'Percentage' ? '85%' : '8.5/10'}
                value={edu.gpa}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_EDUCATION',
                    payload: {
                      id: edu.id,
                      data: { gpa: e.target.value },
                    },
                  })
                }
                onBlur={(e) => {
                  if (edu.gradeType === 'Percentage' && e.target.value && !e.target.value.includes('%')) {
                    dispatch({
                      type: 'UPDATE_EDUCATION',
                      payload: { id: edu.id, data: { gpa: e.target.value + '%' } }
                    });
                  }
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <MonthYearInput
                value={edu.startDate}
                onChange={(val) =>
                  dispatch({
                    type: 'UPDATE_EDUCATION',
                    payload: {
                      id: edu.id,
                      data: { startDate: val },
                    },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <MonthYearInput
                value={edu.endDate}
                onChange={(val) =>
                  dispatch({
                    type: 'UPDATE_EDUCATION',
                    payload: {
                      id: edu.id,
                      data: { endDate: val },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      ))}
      <button
        className="add-entry-btn"
        onClick={() => dispatch({ type: 'ADD_EDUCATION' })}
      >
        + Add Another Education
      </button>
    </div>
  );

  const renderSkills = () => (
    <div className="form-section">
      <h2 className="form-section-title">Skills</h2>
      <p className="form-section-subtitle">
        Add your key technical and soft skills
      </p>
      <div className="skills-input-row">
        <input
          className="form-input"
          type="text"
          placeholder="Type a skill and press Enter or Add"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && skillInput.trim()) {
              e.preventDefault();
              dispatch({ type: 'ADD_SKILL', payload: skillInput.trim() });
              setSkillInput('');
            }
          }}
        />
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (skillInput.trim()) {
              dispatch({ type: 'ADD_SKILL', payload: skillInput.trim() });
              setSkillInput('');
            }
          }}
        >
          Add
        </button>
      </div>

      <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>Suggested skills for {tmpl.label}:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tmpl.suggestions.map(s => (
            <button 
              key={s} 
              className="btn btn-sm" 
              style={{ padding: '0.3rem 0.6rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-full)' }}
              onClick={() => {
                if(!state.skills.includes(s)) dispatch({ type: 'ADD_SKILL', payload: s });
              }}
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      <div className="skills-tags">
        {state.skills.map((skill) => (
          <span className="skill-tag" key={skill}>
            {skill}
            <button
              onClick={() =>
                dispatch({ type: 'REMOVE_SKILL', payload: skill })
              }
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  const renderExtras = () => (
    <div className="form-section">
      <h2 className="form-section-title">Certifications & Projects</h2>
      <p className="form-section-subtitle">
        Optional but great to showcase your achievements
      </p>

      {/* Certifications */}
      <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
        Certifications
      </h3>
      <div className="skills-input-row">
        <input
          className="form-input"
          type="text"
          placeholder="AWS Solutions Architect, Google Cloud..."
          value={certInput}
          onChange={(e) => setCertInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && certInput.trim()) {
              e.preventDefault();
              dispatch({
                type: 'ADD_CERTIFICATION',
                payload: certInput.trim(),
              });
              setCertInput('');
            }
          }}
        />
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (certInput.trim()) {
              dispatch({
                type: 'ADD_CERTIFICATION',
                payload: certInput.trim(),
              });
              setCertInput('');
            }
          }}
        >
          Add
        </button>
      </div>
      <div className="cert-list">
        {state.certifications.map((cert, i) => (
          <div className="cert-item" key={i}>
            🏅 {cert}
            <button
              onClick={() =>
                dispatch({ type: 'REMOVE_CERTIFICATION', payload: cert })
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Projects */}
      <h3
        style={{
          fontSize: '1rem',
          margin: 'var(--space-xl) 0 var(--space-sm)',
          color: 'var(--text-secondary)',
        }}
      >
        Projects
      </h3>
      {state.projects.map((proj, idx) => (
        <div className="entry-card" key={proj.id}>
          <div className="entry-card-header">
            <h4>Project #{idx + 1}</h4>
            {state.projects.length > 1 && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() =>
                  dispatch({ type: 'REMOVE_PROJECT', payload: proj.id })
                }
              >
                Remove
              </button>
            )}
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input
                className="form-input"
                type="text"
                placeholder={tmpl.projName}
                value={proj.name}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_PROJECT',
                    payload: { id: proj.id, data: { name: e.target.value } },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Technologies</label>
              <input
                className="form-input"
                type="text"
                placeholder={tmpl.projTech}
                value={proj.technologies}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_PROJECT',
                    payload: {
                      id: proj.id,
                      data: { technologies: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder={tmpl.projDesc}
                value={proj.description}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_PROJECT',
                    payload: {
                      id: proj.id,
                      data: { description: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Link</label>
              <input
                className="form-input"
                type="url"
                placeholder="https://github.com/johndoe/project"
                value={proj.link}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_PROJECT',
                    payload: {
                      id: proj.id,
                      data: { link: e.target.value },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      ))}
      <button
        className="add-entry-btn"
        onClick={() => dispatch({ type: 'ADD_PROJECT' })}
      >
        + Add Another Project
      </button>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return renderPersonal();
      case 1:
        return renderSummary();
      case 2:
        return renderExperience();
      case 3:
        return renderEducation();
      case 4:
        return renderSkills();
      case 5:
        return renderExtras();
      default:
        return null;
    }
  };

  return (
    <div className="fill-data-page">
      <div className="fill-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div style={{ flex: 1 }}></div>
          <div style={{ flex: 2, textAlign: 'center' }}>
            <h1>
              Fill Your <span className="gradient-text">Details</span>
            </h1>
            <p>Complete each step to build your professional resume</p>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {(state.personal.fullName || state.experience[0].company || state.skills.length > 0) && (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all data and start fresh?')) {
                    dispatch({ type: 'RESET' });
                    setStep(0);
                  }
                }}
              >
                🔄 Start Fresh
              </button>
            )}
          </div>
        </div>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-accent)' }}>Target Role Focus:</label>
          <select 
            value={roleKey} 
            onChange={e => setRoleKey(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '0.4rem 1.5rem 0.4rem 1rem', display: 'inline-block', backgroundColor: 'var(--bg-secondary)', fontWeight: 600 }}
          >
            {Object.entries(ROLE_TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {renderProgress()}

      <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
        {renderStepContent()}

        <div className="form-nav">
          <button
            className="btn btn-secondary"
            onClick={step === 0 ? () => navigate('/') : prevStep}
          >
            {step === 0 ? '← Home' : '← Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Next Step →
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleGenerate}
            >
              🚀 Generate Resumes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
