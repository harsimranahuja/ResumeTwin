import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <div className="legal-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Terms and <span className="gradient-text">Conditions</span></h1>
        <p>Last updated: April 2026</p>
      </div>

      <div className="legal-content glass-card">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using ResumeTwin, you accept and agree to be bound by the terms and provision of this agreement.</p>

        <h2>2. User Content</h2>
        <p>You retain all your ownership rights in your User Content. By submitting your resume data to ResumeTwin, you grant us a worldwide, non-exclusive, royalty-free license to parse, format, and display your data strictly for the purpose of generating your resume.</p>

        <h2>3. Data Privacy</h2>
        <p>We take your privacy seriously. All personal information provided during the use of our service is handled in accordance with our Privacy Policy.</p>

        <h2>4. Use of Service</h2>
        <p>You agree to not use the service for any unlawful purpose or in any way that could interrupt, damage, or impair the service.</p>

        <h2>5. Modifications changes</h2>
        <p>We reserve the right to modify these terms at any time. We will always post the most current version on our site.</p>
        
        <h2>6. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at legal@resumetwin.com.</p>
      </div>
    </div>
  );
}
