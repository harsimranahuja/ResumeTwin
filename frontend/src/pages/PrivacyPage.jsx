import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <div className="legal-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Privacy <span className="gradient-text">Policy</span></h1>
        <p>Last updated: April 2026</p>
      </div>

      <div className="legal-content glass-card">
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us when building a resume. This includes personal information (like your name, email, and phone number), professional history, education, and skills.</p>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to operate, maintain, and provide the features of ResumeTwin to you, specifically formatting and generating your ATS and HR-friendly resumes.</p>

        <h2>3. Data Storage and Security</h2>
        <p>We use reasonable security measures to protect your resume data. Your data is stored securely on our servers and can be wiped completely by clearing your history in the app.</p>

        <h2>4. Sharing of Information</h2>
        <p>We do not share your personal information with third parties except as necessary to provide the service (like cloud hosting), or when required by law.</p>

        <h2>5. Your Rights</h2>
        <p>You may request access to, correction, or deletion of your personal information at any time through our built-in History manager or by contacting us.</p>
        
        <h2>6. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@resumetwin.com.</p>
      </div>
    </div>
  );
}
