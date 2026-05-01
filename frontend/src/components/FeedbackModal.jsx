import { useState, forwardRef, useImperativeHandle } from 'react';
import { API_BASE_URL } from '../api';
import './FeedbackModal.css';

const FeedbackModal = forwardRef(({ user }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('feedback'); // 'feedback' or 'problem'
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useImperativeHandle(ref, () => ({
    open: (initialType = 'feedback') => {
      setType(initialType);
      setIsOpen(true);
      setIsSuccess(false);
      setMessage('');
      setRating(5);
    },
    close: () => setIsOpen(false)
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          email: user?.username || 'Anonymous',
          rating: type === 'feedback' ? rating : null,
          message
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => setIsOpen(false), 2000);
      }
    } catch (err) {
      console.error('Feedback failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay feedback-modal-overlay animate-fade-in" onClick={() => setIsOpen(false)}>
      <div
        className="modal-content glass-card feedback-modal-content animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={() => setIsOpen(false)}>×</button>

        {isSuccess ? (
          <div className="success-state">
            <span className="success-icon">✨</span>
            <h3>Thank You!</h3>
            <p>Your {type === 'feedback' ? 'feedback' : 'report'} has been received.</p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <span className="modal-badge">{type === 'feedback' ? 'Help us improve' : 'Technical Support'}</span>
              <h2>{type === 'feedback' ? 'Share Feedback' : 'Report a Problem'}</h2>
              <p>
                {type === 'feedback'
                  ? 'We would love to hear your thoughts on ResumeTwin.'
                  : 'Found a bug? Tell us what went wrong.'}
              </p>
            </div>

            <div className="feedback-type-tabs">
              <button
                className={`feedback-type-tab ${type === 'feedback' ? 'active' : ''}`}
                onClick={() => setType('feedback')}
              >
                Feedback
              </button>
              <button
                className={`feedback-type-tab ${type === 'problem' ? 'active' : ''}`}
                onClick={() => setType('problem')}
              >
                Problem
              </button>
            </div>

            <form onSubmit={handleSubmit} className="feedback-form">
              {type === 'feedback' && (
                <div className="rating-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${rating >= star ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              )}

              <textarea
                className="feedback-textarea"
                placeholder={type === 'feedback' ? 'What do you like or what can we improve?' : 'Describe the issue in detail...'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />

              <button
                type="submit"
                className="btn btn-primary modal-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Submit Now'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
});

FeedbackModal.displayName = 'FeedbackModal';

export default FeedbackModal;
