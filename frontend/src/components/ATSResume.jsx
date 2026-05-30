import { forwardRef } from 'react';
import './ATSResume.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

const ATSResume = forwardRef(function ATSResume({ data, fitOnePage, template = 'template-1' }, ref) {
  const {
    personal,
    summary,
    experience,
    internships = [],
    education,
    skills = [],
    technicalSkills = [],
    softSkills = [],
    hobbies = [],
    certifications = [],
    projects = [],
  } = data;

  return (
    <div className={`ats-resume ${fitOnePage ? 'ats-fit-one-page' : ''} ${template}`} ref={ref}>
      <h1>{personal.fullName || 'Your Name'}</h1>
      {personal.jobTitle && (
        <div style={{ fontSize: '12pt', color: '#333', marginBottom: '6px' }}>
          {personal.jobTitle}
        </div>
      )}
      <div className="ats-contact">
        {personal.email && (
          <span>
            <a href={`mailto:${personal.email}`} className="ats-contact-link">{personal.email}</a>
          </span>
        )}
        {personal.phone && <span>{personal.phone}</span>}
        {personal.location && <span>{personal.location}</span>}
        {personal.linkedin && (
          <span>
            <a href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="ats-contact-link">{personal.linkedin}</a>
          </span>
        )}
        {personal.website && (
          <span>
            <a href={personal.website.startsWith('http') ? personal.website : `https://${personal.website}`} target="_blank" rel="noopener noreferrer" className="ats-contact-link">{personal.website}</a>
          </span>
        )}
      </div>

      {summary && (
        <div className="ats-section">
          <h2 className="ats-section-title">Professional Summary</h2>
          <p className="ats-summary">{summary}</p>
        </div>
      )}

      {experience.length > 0 && experience.some((e) => e.company || e.position) && (
        <div className="ats-section">
          <h2 className="ats-section-title">Work Experience</h2>
          {experience.filter((e) => e.company || e.position).map((exp) => (
            <div className="ats-entry" key={exp.id}>
              <div className="ats-entry-header">
                <div>
                  <span className="ats-entry-title">{exp.company}</span>
                  {exp.position && (
                    <span className="ats-entry-subtitle"> — {exp.position}</span>
                  )}
                </div>
                <span className="ats-entry-date">
                  {formatDate(exp.startDate)}
                  {(exp.startDate || exp.endDate || exp.current) && ' – '}
                  {exp.current ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              {exp.description && (
                <div className="ats-entry-body">{exp.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {internships.length > 0 && internships.some((e) => e.company || e.role) && (
        <div className="ats-section">
          <h2 className="ats-section-title">Internships</h2>
          {internships.filter((e) => e.company || e.role).map((intern) => (
            <div className="ats-entry" key={intern.id}>
              <div className="ats-entry-header">
                <div>
                  <span className="ats-entry-title">{intern.company}</span>
                  {intern.role && (
                    <span className="ats-entry-subtitle"> — {intern.role}</span>
                  )}
                </div>
                <span className="ats-entry-date">
                  {formatDate(intern.startDate)}
                  {(intern.startDate || intern.endDate || intern.current) && ' – '}
                  {intern.current ? 'Present' : formatDate(intern.endDate)}
                </span>
              </div>
              {intern.description && (
                <div className="ats-entry-body">{intern.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && education.some((e) => e.institution || e.degree) && (
        <div className="ats-section">
          <h2 className="ats-section-title">Education</h2>
          {education.filter((e) => e.institution || e.degree).map((edu) => (
            <div className="ats-entry" key={edu.id}>
              <div className="ats-entry-header">
                <div>
                  <span className="ats-entry-title">{edu.institution}</span>
                  {edu.degree && (
                    <span className="ats-entry-subtitle">
                      {' — '}{edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </span>
                  )}
                </div>
                <span className="ats-entry-date">
                  {formatDate(edu.startDate)}
                  {(edu.startDate || edu.endDate) && ' – '}
                  {formatDate(edu.endDate)}
                </span>
              </div>
              {edu.gpa && (
                <div className="ats-entry-body">{edu.gradeType || 'CGPA'}: {edu.gpa}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {((technicalSkills && technicalSkills.length > 0) || (skills && skills.length > 0)) && (
        <div className="ats-section">
          <h2 className="ats-section-title">Technical Skills</h2>
          <div className="ats-skills-list">{(technicalSkills && technicalSkills.length > 0 ? technicalSkills : skills).join(', ')}</div>
        </div>
      )}

      {softSkills && softSkills.length > 0 && (
        <div className="ats-section">
          <h2 className="ats-section-title">Soft Skills</h2>
          <div className="ats-skills-list">{softSkills.join(', ')}</div>
        </div>
      )}

      {hobbies && hobbies.length > 0 && (
        <div className="ats-section">
          <h2 className="ats-section-title">Hobbies & Interests</h2>
          <div className="ats-skills-list">{hobbies.join(', ')}</div>
        </div>
      )}

      {certifications.length > 0 && (
        <div className="ats-section">
          <h2 className="ats-section-title">Certifications</h2>
          <ul className="ats-cert-list">
            {certifications.map((cert, i) => (
              <li key={i}>{cert}</li>
            ))}
          </ul>
        </div>
      )}

      {projects.length > 0 && projects.some((p) => p.name) && (
        <div className="ats-section">
          <h2 className="ats-section-title">Projects</h2>
          {projects.filter((p) => p.name).map((proj) => (
            <div className="ats-project" key={proj.id}>
              <span className="ats-project-title">{proj.name}</span>
              {proj.technologies && (
                <span className="ats-project-tech"> ({proj.technologies})</span>
              )}
              {proj.link && (
                <>
                  <span> — </span>
                  <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="ats-project-link">{proj.link}</a>
                </>
              )}
              {proj.description && (
                <div className="ats-project-desc">{proj.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default ATSResume;
