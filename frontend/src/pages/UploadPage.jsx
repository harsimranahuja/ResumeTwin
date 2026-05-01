import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { readFileContent, parseResumeText } from '../utils/parseResume';
import './UploadPage.css';

export default function UploadPage() {
  const { dispatch } = useResume();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFile = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'txt', 'docx', 'doc'].includes(ext)) {
      setError('Please upload a .pdf, .docx, or .txt file');
      return;
    }

    setError('');
    setFileName(file.name);
    setParsing(true);

    try {
      const text = await readFileContent(file);
      const data = parseResumeText(text);
      setParsed(data);
      dispatch({ type: 'RESET' });
      dispatch({ type: 'SET_ALL', payload: data });
    } catch (err) {
      setError('Failed to parse file. Please try a different format.');
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
    e.target.value = null;
  };

  return (
    <div className="upload-page">
      <div className="upload-header">
        <h1>
          Upload Your <span className="gradient-text">Resume</span>
        </h1>
        <p>
          We&apos;ll extract your data and generate optimized resume versions
        </p>
      </div>

      {!parsed && !parsing && (
        <div
          className={`upload-zone glass-card ${dragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          id="upload-dropzone"
        >
          <span className="upload-icon">📁</span>
          <h3>Drop your resume here</h3>
          <p>or click to browse files</p>
          <div className="upload-formats">
            <span className="format-badge">.PDF</span>
            <span className="format-badge">.DOCX</span>
            <span className="format-badge">.TXT</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx,.doc"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {parsing && (
        <div className="glass-card parsing-state">
          <div className="parsing-spinner" />
          <p>Parsing {fileName}...</p>
        </div>
      )}

      {parsed && (
        <div className="glass-card parsed-result" style={{ padding: 'var(--space-xl)' }}>
          <h3>
            ✅ Successfully parsed: <em>{fileName}</em>
          </h3>
          <div className="parsed-notice">
            💡 Review the extracted data below. You can fine-tune your resume
            data by clicking &quot;Edit in Form&quot; or proceed directly to
            generate your resumes.
          </div>

          {parsed.personal.fullName && (
            <div className="parsed-section">
              <h4>Personal Info</h4>
              <div className="parsed-content">
                <strong>{parsed.personal.fullName}</strong>
                {parsed.personal.email && <> • {parsed.personal.email}</>}
                {parsed.personal.phone && <> • {parsed.personal.phone}</>}
                {parsed.personal.linkedin && (
                  <> • {parsed.personal.linkedin}</>
                )}
              </div>
            </div>
          )}

          {parsed.summary && (
            <div className="parsed-section">
              <h4>Summary</h4>
              <div className="parsed-content">{parsed.summary}</div>
            </div>
          )}

          {parsed.experience.length > 0 &&
            parsed.experience[0].company && (
              <div className="parsed-section">
                <h4>
                  Experience ({parsed.experience.length} entries)
                </h4>
                {parsed.experience.map((exp, i) => (
                  <div className="parsed-content" key={i} style={{ marginBottom: '0.5rem' }}>
                    <strong>{exp.company}</strong>
                    {exp.position && <> — {exp.position}</>}
                    {exp.description && (
                      <p style={{ marginTop: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {exp.description.substring(0, 150)}
                        {exp.description.length > 150 && '...'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

          {parsed.skills.length > 0 && (
            <div className="parsed-section">
              <h4>Skills ({parsed.skills.length})</h4>
              <div className="parsed-content">
                {parsed.skills.join(' • ')}
              </div>
            </div>
          )}

          <div className="upload-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                navigate('/fill-data');
              }}
            >
              ✏️ Edit in Form
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/preview')}
            >
              🚀 Generate Resumes
            </button>
          </div>
        </div>
      )}

      {error && <div className="upload-error">{error}</div>}

      {!parsed && !parsing && (
        <div className="upload-actions" style={{ justifyContent: 'flex-start' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
