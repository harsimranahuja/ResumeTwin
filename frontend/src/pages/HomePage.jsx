import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('resumeTwin_user');
      setIsLoggedIn(!!savedUser);
    } catch { setIsLoggedIn(false); }
  }, []);

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-badge">
          <span className="dot"></span>
          AI-Powered Resume Builder
        </div>
        <h1 className="home-title">
          Craft Your <span className="gradient-text">Perfect Resume</span>
        </h1>
        <p className="home-subtitle">
          Create two professionally designed resumes — one optimized for ATS
          systems and another crafted to impress HR recruiters.
        </p>
      </div>

      <div className={`home-cards ${isLoggedIn ? 'has-history' : ''}`}>
        <Link to="/fill-data" className="glass-card home-card" id="fill-data-card">
          <div className="card-icon">📝</div>
          <h2 className="card-title">Fill Your Data</h2>
          <p className="card-desc">
            Enter your details step-by-step with our intuitive form. Perfect
            for building a resume from scratch.
          </p>
          <div className="card-arrow">
            Get Started <span>→</span>
          </div>
        </Link>

        <Link to="/upload" className="glass-card home-card" id="upload-resume-card">
          <div className="card-icon">📄</div>
          <h2 className="card-title">Upload Existing Resume</h2>
          <p className="card-desc">
            Upload your current resume (PDF or TXT) and we&apos;ll extract
            your data to generate optimized versions.
          </p>
          <div className="card-arrow">
            Upload Now <span>→</span>
          </div>
        </Link>

        {isLoggedIn && (
          <Link to="/history" className="glass-card home-card history-home-card" id="history-card">
            <div className="card-icon history-icon">📋</div>
            <h2 className="card-title">Resume History</h2>
            <p className="card-desc">
              View and edit your previously created resumes. Pick up right
              where you left off anytime.
            </p>
            <div className="card-arrow">
              View History <span>→</span>
            </div>
          </Link>
        )}
      </div>

      <div className="home-features">
        <div className="home-feature">
          <span className="feature-icon">✦</span> ATS-Optimized
        </div>
        <div className="home-feature">
          <span className="feature-icon">✦</span> HR-Friendly Design
        </div>
        <div className="home-feature">
          <span className="feature-icon">✦</span> PDF Export
        </div>
        <div className="home-feature">
          <span className="feature-icon">✦</span> 100% Free
        </div>
      </div>
    </div>
  );
}
