import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import ATSResume from '../components/ATSResume';
import HRResume from '../components/HRResume';
import { exportToPdf } from '../utils/exportPdf';
import './PreviewPage.css';

export default function PreviewPage({ user }) {
  const { state } = useResume();
  const navigate = useNavigate();
  const atsRef = useRef(null);
  const hrRef = useRef(null);
  const [activeTab, setActiveTab] = useState('both');
  const [downloading, setDownloading] = useState('');
  const [fitToPage, setFitToPage] = useState(false);
  const [compressedSize, setCompressedSize] = useState(false);
  const [paperFormat, setPaperFormat] = useState('a4');
  const [atsTemplate, setAtsTemplate] = useState('template-1');
  const [hrTemplate, setHrTemplate] = useState('template-1');
  const [saved, setSaved] = useState(false);
  const hasSavedRef = useRef(false);

  // Auto-save to history when preview loads (if user is signed in)
  useEffect(() => {
    if (hasSavedRef.current) return;
    const hasData =
      state.personal.fullName ||
      state.summary ||
      state.experience.some((e) => e.company) ||
      state.skills.length > 0;

    if (!hasData) return;

    let username = user?.username;
    if (!username) {
      try {
        const savedUser = localStorage.getItem('resumeTwin_user');
        if (savedUser) username = JSON.parse(savedUser).username;
      } catch { }
    }
    if (!username) return;

    hasSavedRef.current = true;

    // Strip internal _historyId from the data we save
    const { _historyId, ...resumeData } = state;

    fetch('http://localhost:5000/api/history/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: username,
        resumeData,
        title: state.personal.fullName || 'Untitled Resume',
        id: _historyId || null
      })
    })
      .then(res => res.json())
      .then((data) => {
        setSaved(true);
        // Store the history ID so future saves update the same entry
        if (data.id && !_historyId) {
          dispatch({ type: 'SET_HISTORY_ID', payload: data.id });
        }
      })
      .catch(() => { });
  }, [state, user]);

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      const ref = type === 'ats' ? atsRef : hrRef;
      const filename =
        type === 'ats'
          ? `${state.personal.fullName || 'Resume'}_ATS.pdf`
          : `${state.personal.fullName || 'Resume'}_HR.pdf`;
      await exportToPdf(ref.current, filename, {
        compressed: compressedSize,
        format: paperFormat
      });
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading('');
    }
  };

  const hasData =
    state.personal.fullName ||
    state.summary ||
    state.experience.some((e) => e.company) ||
    state.skills.length > 0;

  return (
    <div className="preview-page">
      <div className="preview-header">
        <h1>
          Your <span className="gradient-text">Resumes</span>
        </h1>
        <p>
          {hasData
            ? 'Preview and download your professionally generated resumes'
            : 'No data found. Please fill your details or upload a resume first.'}
        </p>
      </div>

      <div className="preview-actions-top">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Go Back & Edit
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          🏠 Home
        </button>
        <button
          className={`btn ${fitToPage ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFitToPage(!fitToPage)}
        >
          {fitToPage ? '📄 Fit One Page: ON' : '📄 Fit One Page: OFF'}
        </button>
        <button
          className={`btn ${compressedSize ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setCompressedSize(!compressedSize)}
        >
          {compressedSize ? '🗜️ Smaller File Size' : '📁 Default File Size'}
        </button>
        <button
          className={`btn ${paperFormat === 'letter' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setPaperFormat(paperFormat === 'a4' ? 'letter' : 'a4')}
        >
          📏 {paperFormat === 'a4' ? 'A4 Paper' : 'Letter Paper'}
        </button>
      </div>

      {hasData && (
        <div className="preview-content-with-sidebar">
          <div className="template-sidebar">
            <h3>Choose Template</h3>

            {(activeTab === 'both' || activeTab === 'ats') && (
              <div className="template-group">
                <h4>ATS Templates</h4>
                <div className="template-grid">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={`ats-${i + 1}`}
                      className={`template-btn ${atsTemplate === `template-${i + 1}` ? 'active' : ''}`}
                      onClick={() => setAtsTemplate(`template-${i + 1}`)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'both' || activeTab === 'hr') && (
              <div className="template-group">
                <h4>HR Templates</h4>
                <div className="template-grid">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={`hr-${i + 1}`}
                      className={`template-btn ${hrTemplate === `template-${i + 1}` ? 'active' : ''}`}
                      onClick={() => setHrTemplate(`template-${i + 1}`)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="preview-main-area">
            <div className="preview-tabs">
              <button
                className={`preview-tab ${activeTab === 'both' ? 'active' : ''}`}
                onClick={() => setActiveTab('both')}
              >
                Side by Side
              </button>
              <button
                className={`preview-tab ${activeTab === 'ats' ? 'active' : ''}`}
                onClick={() => setActiveTab('ats')}
              >
                ATS Resume
              </button>
              <button
                className={`preview-tab ${activeTab === 'hr' ? 'active' : ''}`}
                onClick={() => setActiveTab('hr')}
              >
                HR Resume
              </button>
            </div>

            {activeTab === 'both' && (
              <div className="preview-side-by-side">
                <div className="preview-column">
                  <div className="preview-column-title">
                    ATS-Friendly <span className="tag tag-ats">ATS</span>
                  </div>
                  <div className="resume-scroll">
                    <div className="resume-wrapper">
                      <ATSResume data={state} fitOnePage={fitToPage} template={atsTemplate} ref={atsRef} />
                    </div>
                  </div>
                  <div className="download-section">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDownload('ats')}
                      disabled={downloading === 'ats'}
                    >
                      {downloading === 'ats'
                        ? '⏳ Generating...'
                        : '📥 Download ATS PDF'}
                    </button>
                  </div>
                </div>

                <div className="preview-column">
                  <div className="preview-column-title">
                    HR Recruitment <span className="tag tag-hr">HR</span>
                  </div>
                  <div className="resume-scroll">
                    <div className="resume-wrapper">
                      <HRResume data={state} fitOnePage={fitToPage} template={hrTemplate} ref={hrRef} />
                    </div>
                  </div>
                  <div className="download-section">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDownload('hr')}
                      disabled={downloading === 'hr'}
                    >
                      {downloading === 'hr'
                        ? '⏳ Generating...'
                        : '📥 Download HR PDF'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ats' && (
              <div className="resume-container">
                <div>
                  <div className="resume-scroll">
                    <div className="resume-wrapper">
                      <ATSResume data={state} fitOnePage={fitToPage} template={atsTemplate} ref={atsRef} />
                    </div>
                  </div>
                  <div className="download-section">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => handleDownload('ats')}
                      disabled={downloading === 'ats'}
                    >
                      {downloading === 'ats'
                        ? '⏳ Generating PDF...'
                        : '📥 Download ATS-Friendly Resume'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hr' && (
              <div className="resume-container">
                <div>
                  <div className="resume-scroll">
                    <div className="resume-wrapper">
                      <HRResume data={state} fitOnePage={fitToPage} template={hrTemplate} ref={hrRef} />
                    </div>
                  </div>
                  <div className="download-section">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => handleDownload('hr')}
                      disabled={downloading === 'hr'}
                    >
                      {downloading === 'hr'
                        ? '⏳ Generating PDF...'
                        : '📥 Download HR Recruitment Resume'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasData && (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/fill-data')}
          >
            📝 Fill Your Data
          </button>
        </div>
      )}
    </div>
  );
}
