import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { API_BASE_URL } from '../api';
import './WelcomeModal.css';

const WelcomeModal = forwardRef(({ onLogin, onWarning }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('signup'); // 'signup' or 'signin'
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    goal: 'Building a new resume'
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [infoPopup, setInfoPopup] = useState(null); // 'terms' or 'privacy'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useImperativeHandle(ref, () => ({
    open: (newMode) => {
      setMode(newMode);
      setIsOpen(true);
    }
  }));

  useEffect(() => {
    // Check if user is already logged in locally
    try {
      const savedUser = localStorage.getItem('resumeTwin_user');
      if (savedUser) {
        onLogin(JSON.parse(savedUser));
        return;
      }
    } catch (e) {
      console.error('Failed to parse saved user:', e);
      localStorage.removeItem('resumeTwin_user');
    }

    // Check if user has seen this modal in the CURRENT session
    const hasSeenModal = sessionStorage.getItem('resumeTwin_welcome_session_seen');
    if (!hasSeenModal) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []); // Only run on mount

  const handleClose = () => {
    onWarning('Warning: Without a profile, data cannot be synced.');
    sessionStorage.setItem('resumeTwin_welcome_session_seen', 'true');
    setIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signup' && !formData.fullName) {
      setError('Please fill in your name.');
      return;
    }
    if (!formData.username || !formData.password) {
      setError('Please fill in username and password.');
      return;
    }
    if (mode === 'signup' && !agreedToTerms) {
      setError('You must agree to the Terms and Conditions to sign up.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, mode, agreedToTerms }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('resumeTwin_user', JSON.stringify(data.user));
        onLogin(data.user);
        sessionStorage.setItem('resumeTwin_welcome_session_seen', 'true');
        setIsOpen(false);
      } else {
        throw new Error(data.error || 'Failed to save data. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Connection error, but you can continue!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (infoPopup === 'terms') {
    return (
      <div className="modal-overlay">
        <div className="modal-content glass-card animate-scale-in" style={{ padding: '2rem' }}>
          <button className="back-btn" onClick={() => setInfoPopup(null)} style={{ marginBottom: '1rem' }}>← Back to Sign Up</button>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Terms and <span className="gradient-text">Conditions</span></h2>
          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}><strong>1. Acceptance of Terms:</strong> By accessing and using ResumeTwin, you accept and agree to be bound by the terms and provision of this agreement.</p>
            <p style={{ marginBottom: '1rem' }}><strong>2. User Content:</strong> You retain all ownership rights. By submitting your resume data, you grant us a license to parse and display it for generating resumes.</p>
            <p style={{ marginBottom: '1rem' }}><strong>3. Data Privacy:</strong> We take your privacy seriously. All personal information provided during the use of our service is handled in accordance with our Privacy Policy.</p>
            <p style={{ marginBottom: '1rem' }}><strong>4. Use of Service:</strong> You agree not to use the service for unlawful purposes or in any way that could damage the service.</p>
            <p style={{ marginBottom: '1rem' }}><strong>5. Modifications:</strong> We reserve the right to modify these terms at any time. We will always post the most current version on our site.</p>
          </div>
        </div>
      </div>
    );
  }

  if (infoPopup === 'privacy') {
    return (
      <div className="modal-overlay">
        <div className="modal-content glass-card animate-scale-in" style={{ padding: '2rem' }}>
          <button className="back-btn" onClick={() => setInfoPopup(null)} style={{ marginBottom: '1rem' }}>← Back to Sign Up</button>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Privacy <span className="gradient-text">Policy</span></h2>
          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}><strong>1. Information Collection:</strong> We collect personal information, professional history, education, and skills provided during resume building.</p>
            <p style={{ marginBottom: '1rem' }}><strong>2. Use of Information:</strong> We use your information strictly to generate and format your ATS and HR resumes.</p>
            <p style={{ marginBottom: '1rem' }}><strong>3. Data Security:</strong> Your data is securely stored. You can wipe your data completely by clearing your history in the app.</p>
            <p style={{ marginBottom: '1rem' }}><strong>4. Sharing:</strong> We do not share personal information with third parties except as necessary for service infrastructure.</p>
            <p style={{ marginBottom: '1rem' }}><strong>5. Your Rights:</strong> You may request access to, correction, or deletion of your personal information at any time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card animate-scale-in">
        <button className="modal-close" onClick={handleClose}>×</button>

        <div className="modal-header">
          <div className="modal-badge">Welcome To ResumeTwin</div>
          <h2>{mode === 'signup' ? "Let's Get " : "Welcome "} <span className="gradient-text">{mode === 'signup' ? 'Started!' : 'Back!'}</span></h2>
          <p>{mode === 'signup' ? 'Create a secure profile to sync your resumes.' : 'Sign in to access your saved resumes.'}</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            New User
          </button>
          <button
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); }}
          >
            Existing User
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {mode === 'signup' && (
            <div className="modal-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
          )}

          <div className="modal-grid">
            <div className="modal-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="modal-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Secret key"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div className="modal-group">
                <label>What are you building?</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                >
                  <option>Building a new resume</option>
                  <option>Optimizing existing resume</option>
                  <option>Just exploring</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="modal-terms">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span>I agree to the <a href="#" onClick={(e) => { e.preventDefault(); setInfoPopup('terms'); }}>Terms and Conditions</a> and <a href="#" onClick={(e) => { e.preventDefault(); setInfoPopup('privacy'); }}>Privacy Policy</a></span>
                </label>
              </div>
            </>
          )}

          {error && <p className="modal-error">{error}</p>}

          <button type="submit" className="btn btn-primary modal-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : (mode === 'signup' ? 'Save & Start Creating →' : 'Sign In & Restore →')}
          </button>
        </form>

        <p className="modal-footer">Your data is secure and will be synced across your devices.</p>
      </div>
    </div>
  );
});

export default WelcomeModal;
