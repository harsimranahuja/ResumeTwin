import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import './HistoryPage.css';

export default function HistoryPage() {
  const { state, dispatch } = useResume();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('resumeTwin_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        fetchHistory(parsed.username);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  const fetchHistory = async (username) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/history/${encodeURIComponent(username)}`);
      const data = await res.json();
      if (res.ok) {
        setResumes(data.resumes || []);
      } else {
        setError(data.error || 'Failed to load history.');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resume) => {
    dispatch({ type: 'RESET' });
    dispatch({ type: 'SET_ALL', payload: resume.data });
    dispatch({ type: 'SET_HISTORY_ID', payload: resume.id });
    navigate('/fill-data');
  };

  const handlePreview = (resume) => {
    dispatch({ type: 'RESET' });
    dispatch({ type: 'SET_ALL', payload: resume.data });
    dispatch({ type: 'SET_HISTORY_ID', payload: resume.id });
    navigate('/preview');
  };

  const handleDelete = async (id) => {
    if (!user) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/history/${encodeURIComponent(user.username)}/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setResumes(prev => prev.filter(r => r.id !== id));
        // If the deleted resume is the one currently loaded, reset the context
        if (state._historyId === id) {
          dispatch({ type: 'RESET' });
        }
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    setClearing(true);
    try {
      const res = await fetch(`http://localhost:5000/api/history/${encodeURIComponent(user.username)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setResumes([]);
        dispatch({ type: 'RESET' });
      }
    } catch {
      // silently fail
    } finally {
      setClearing(false);
      setShowClearConfirm(false);
    }
  };

  const getSkillsPreview = (data) => {
    if (!data?.skills?.length) return '';
    const display = data.skills.slice(0, 4);
    const more = data.skills.length - 4;
    return display.join(' · ') + (more > 0 ? ` +${more} more` : '');
  };

  const getExperiencePreview = (data) => {
    if (!data?.experience?.length) return null;
    const first = data.experience.find(e => e.company);
    if (!first) return null;
    return `${first.position || 'Role'}${first.company ? ` at ${first.company}` : ''}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (!user) {
    return (
      <div className="history-page">
        <div className="history-header">
          <h1>Resume <span className="gradient-text">History</span></h1>
          <p>Sign in to view and manage your saved resumes</p>
        </div>
        <div className="history-empty">
          <div className="empty-icon">🔒</div>
          <h3>Sign In Required</h3>
          <p>Please sign in to access your resume history. Your resumes are securely stored and will be available whenever you log back in.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            ← Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      {/* Clear All Confirmation Overlay */}
      {showClearConfirm && (
        <div className="modal-overlay logout-confirm-overlay" style={{ zIndex: 30000 }}>
          <div className="modal-content glass-card animate-scale-in logout-confirm-card">
            <h3>🗑️ Clear All History</h3>
            <p>This will permanently delete all {resumes.length} saved resume{resumes.length !== 1 ? 's' : ''}. This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowClearConfirm(false)} disabled={clearing}>Cancel</button>
              <button className="btn btn-danger" onClick={handleClearAll} disabled={clearing}>
                {clearing ? 'Clearing...' : 'Yes, Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="history-header">
        <h1>Resume <span className="gradient-text">History</span></h1>
        <p>View, edit, and manage all your previously created resumes</p>
      </div>

      <div className="history-actions-top">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        {resumes.length > 0 && (
          <button className="btn btn-danger" onClick={() => setShowClearConfirm(true)}>
            🗑️ Clear All History
          </button>
        )}
      </div>

      {loading && (
        <div className="history-loading">
          <div className="history-spinner" />
          <p>Loading your resumes...</p>
        </div>
      )}

      {error && <div className="history-error">{error}</div>}

      {!loading && !error && resumes.length === 0 && (
        <div className="history-empty">
          <div className="empty-icon">📋</div>
          <h3>No Resumes Yet</h3>
          <p>Start building your first resume and it will appear here for easy access later.</p>
          <button className="btn btn-primary btn-lg" onClick={() => {
            dispatch({ type: 'RESET' });
            navigate('/fill-data');
          }}>
            📝 Create Your First Resume
          </button>
        </div>
      )}

      {!loading && resumes.length > 0 && (
        <div className="history-grid">
          {resumes.map((resume, idx) => (
            <div
              className="history-card glass-card"
              key={resume.id}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div className="history-card-header">
                <div className="history-card-avatar">
                  {(resume.data?.personal?.fullName || 'U')[0].toUpperCase()}
                </div>
                <div className="history-card-meta">
                  <h3 className="history-card-title">{resume.title || 'Untitled Resume'}</h3>
                  <span className="history-card-date">
                    {resume.updatedAt !== resume.createdAt ? '✏️ Updated' : '📅 Created'} {formatDate(resume.updatedAt || resume.createdAt)}
                  </span>
                </div>
              </div>

              <div className="history-card-body">
                {resume.data?.personal?.jobTitle && (
                  <div className="history-detail">
                    <span className="detail-icon">💼</span>
                    <span>{resume.data.personal.jobTitle}</span>
                  </div>
                )}
                {getExperiencePreview(resume.data) && (
                  <div className="history-detail">
                    <span className="detail-icon">🏢</span>
                    <span>{getExperiencePreview(resume.data)}</span>
                  </div>
                )}
                {resume.data?.personal?.email && (
                  <div className="history-detail">
                    <span className="detail-icon">📧</span>
                    <span>{resume.data.personal.email}</span>
                  </div>
                )}
                {getSkillsPreview(resume.data) && (
                  <div className="history-detail skills-detail">
                    <span className="detail-icon">⚡</span>
                    <span>{getSkillsPreview(resume.data)}</span>
                  </div>
                )}
              </div>

              <div className="history-card-stats">
                <div className="stat-chip">
                  <span>{resume.data?.experience?.filter(e => e.company).length || 0}</span> Exp
                </div>
                <div className="stat-chip">
                  <span>{resume.data?.education?.filter(e => e.institution).length || 0}</span> Edu
                </div>
                <div className="stat-chip">
                  <span>{resume.data?.skills?.length || 0}</span> Skills
                </div>
                <div className="stat-chip">
                  <span>{resume.data?.projects?.filter(p => p.name).length || 0}</span> Projects
                </div>
              </div>

              <div className="history-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleEdit(resume)}>
                  ✏️ Edit
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handlePreview(resume)}>
                  👁️ Preview
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(resume.id)}
                  disabled={deletingId === resume.id}
                >
                  {deletingId === resume.id ? '⏳' : '🗑️'} {deletingId === resume.id ? 'Deleting...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
