import { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import HomePage from './pages/HomePage';
import FillDataPage from './pages/FillDataPage';
import UploadPage from './pages/UploadPage';
import PreviewPage from './pages/PreviewPage';
import HistoryPage from './pages/HistoryPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import WelcomeModal from './components/WelcomeModal';
import FeedbackModal from './components/FeedbackModal';


function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const modalRef = useRef(null);
  const feedbackRef = useRef(null);



  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const confirmLogout = () => {
    localStorage.removeItem('resumeTwin_user');
    sessionStorage.removeItem('resumeTwin_welcome_session_seen');
    setUser(null);
    setShowLogoutConfirm(false);
    window.location.reload();
  };

  return (
    <ResumeProvider>
      <WelcomeModal ref={modalRef} onLogin={setUser} onWarning={showToast} />
      <FeedbackModal ref={feedbackRef} user={user} />

      {showLogoutConfirm && (
        <div className="modal-overlay logout-confirm-overlay">
          <div className="modal-content glass-card animate-scale-in logout-confirm-card">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out? You will need your password to sync back in.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>No, Stay</button>
              <button className="btn btn-primary" onClick={confirmLogout}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}

      <BrowserRouter>
        {toast && <div className="system-toast animate-slide-down-global">{toast}</div>}
        <div className="app-header">
          <Link to="/" className="app-logo">
            <span>Resume</span><span className="twin">Twin</span>
          </Link>

          <div className="header-right">
            <Link to="/" className="nav-link home-nav-link">
              🏠 Home
            </Link>
            {user ? (
              <>
                <Link to="/history" className="history-nav-btn">
                  📋 History
                </Link>
                <div className="user-profile">
                  <div className="user-avatar">{user.fullName ? user.fullName[0] : 'U'}</div>
                  <div className="user-info">
                    <span className="user-name">{user.fullName}</span>
                    <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-buttons" style={{ display: 'flex', gap: '0.8rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => modalRef.current?.open('signin')}
                  style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)' }}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => modalRef.current?.open('signup')}
                  style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)' }}
                >
                  Sign Up
                </button>
              </div>
            )}
            <button
              className="nav-link feedback-trigger"
              onClick={() => feedbackRef.current?.open('feedback')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
            >
              💬 Feedback
            </button>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fill-data" element={<FillDataPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/preview" element={<PreviewPage user={user} />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
        <footer className="app-footer">
          <div className="footer-links">
            <button onClick={() => feedbackRef.current?.open('feedback')}>Feedback</button>
            <button onClick={() => feedbackRef.current?.open('problem')}>Report a Problem</button>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} ResumeTwin. All rights reserved.</p>
        </footer>
      </BrowserRouter>
    </ResumeProvider>
  );
}

export default App;
