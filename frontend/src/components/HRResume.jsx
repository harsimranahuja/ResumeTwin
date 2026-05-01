import { forwardRef } from 'react';
import './HRResume.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

const HRResume = forwardRef(function HRResume({ data, fitOnePage, template = 'template-1' }, ref) {
  const { personal, summary, experience, education, skills, certifications, projects } = data;

  return (
    <div className={`hr-resume ${fitOnePage ? 'hr-fit-one-page' : ''} ${template}`} ref={ref}>
      {/* SIDEBAR */}
      <div className="hr-sidebar">
        <div className="hr-sidebar-name">
          {personal.fullName || 'Your Name'}
        </div>
        {personal.jobTitle && (
          <div className="hr-sidebar-title">{personal.jobTitle}</div>
        )}

        {/* Contact */}
        <div className="hr-sidebar-section">
          <h3 className="hr-sidebar-section-title">Contact</h3>
          {personal.email && (
            <div className="hr-contact-item">
              <span className="hr-contact-icon">✉</span>
              <span>{personal.email}</span>
            </div>
          )}
          {personal.phone && (
            <div className="hr-contact-item">
              <span className="hr-contact-icon">📱</span>
              <span>{personal.phone}</span>
            </div>
          )}
          {personal.location && (
            <div className="hr-contact-item">
              <span className="hr-contact-icon">📍</span>
              <span>{personal.location}</span>
            </div>
          )}
          {personal.linkedin && (
            <div className="hr-contact-item">
              <span className="hr-contact-icon">🔗</span>
              <span>{personal.linkedin}</span>
            </div>
          )}
          {personal.website && (
            <div className="hr-contact-item">
              <span className="hr-contact-icon">🌐</span>
              <span>{personal.website}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="hr-sidebar-section">
            <h3 className="hr-sidebar-section-title">Skills</h3>
            {skills.slice(0, 10).map((skill, i) => (
              <div className="hr-skill-item" key={i}>
                <div className="hr-skill-name">{skill}</div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="hr-sidebar-section">
            <h3 className="hr-sidebar-section-title">Certifications</h3>
            {certifications.map((cert, i) => (
              <div className="hr-cert-item" key={i}>
                {cert}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="hr-main">
        {/* Summary */}
        {summary && (
          <div className="hr-section">
            <h2 className="hr-section-title">
              <span className="hr-section-icon">👤</span> About Me
            </h2>
            <p className="hr-summary-text">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && experience.some((e) => e.company || e.position) && (
          <div className="hr-section">
            <h2 className="hr-section-title">
              <span className="hr-section-icon">💼</span> Experience
            </h2>
            {experience.filter((e) => e.company || e.position).map((exp) => (
              <div className="hr-entry" key={exp.id}>
                <div className="hr-entry-header">
                  <div>
                    <div className="hr-entry-company">{exp.company}</div>
                    {exp.position && (
                      <div className="hr-entry-position">{exp.position}</div>
                    )}
                  </div>
                  <span className="hr-entry-date">
                    {formatDate(exp.startDate)}
                    {(exp.startDate || exp.endDate || exp.current) && ' – '}
                    {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <div className="hr-entry-body">{exp.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && education.some((e) => e.institution || e.degree) && (
          <div className="hr-section">
            <h2 className="hr-section-title">
              <span className="hr-section-icon">🎓</span> Education
            </h2>
            {education.filter((e) => e.institution || e.degree).map((edu) => (
              <div className="hr-edu-entry" key={edu.id}>
                <div className="hr-edu-institution">{edu.institution}</div>
                <div className="hr-edu-degree">
                  {edu.degree}
                  {edu.field && ` in ${edu.field}`}
                </div>
                <div className="hr-edu-date">
                  {formatDate(edu.startDate)}
                  {(edu.startDate || edu.endDate) && ' – '}
                  {formatDate(edu.endDate)}
                </div>
                {edu.gpa && <div className="hr-edu-gpa">{edu.gradeType || 'CGPA'}: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && projects.some((p) => p.name) && (
          <div className="hr-section">
            <h2 className="hr-section-title">
              <span className="hr-section-icon">🚀</span> Projects
            </h2>
            {projects.filter((p) => p.name).map((proj) => (
              <div className="hr-project" key={proj.id}>
                <div className="hr-project-title">{proj.name}</div>
                {proj.technologies && (
                  <div className="hr-project-tech">{proj.technologies}</div>
                )}
                {proj.description && (
                  <div className="hr-project-desc">{proj.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default HRResume;
