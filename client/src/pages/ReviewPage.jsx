import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { createReview } from '../services/reviewService';

import ReviewResult from '../components/ReviewResult';

import './ReviewPage.css';

const LANGUAGES = [
  'javascript',
  'python',
  'java',
  'c++',
  'go',
  'typescript',
];

function ReviewPage() {
  const location = useLocation();
  const githubFile = location.state?.githubFile || '';
  const [language, setLanguage] = useState(location.state?.language || LANGUAGES[0]);
  const [sourceCode, setSourceCode] = useState(location.state?.sourceCode || '');
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [error, setError] = useState('');
  const [review, setReview] = useState(null);


  async function handleSubmit(event) {
    event.preventDefault();

    setStatus('loading');
    setError('');
    setReview(null);

    try {
      const res = await createReview({
        language,
        sourceCode,
      });

      setReview(res.data);
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="review-page">
      <h1>Review your code</h1>

      <p className="page-subtitle">
        Paste a snippet, pick the language, and get a structured review.
      </p>
      {githubFile && <div className="github-context">GitHub file: <strong>{githubFile}</strong></div>}

      <form onSubmit={handleSubmit} className="review-form">
        {/* Language */}
        <label className="field">
          <span className="field-label">Language</span>

          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setReview(null);
            }}
            className="language-select"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>

        {/* Code */}
        <label className="field">
          <span className="field-label">Code</span>

          <textarea
            value={sourceCode}
            onChange={(e) => {
              setSourceCode(e.target.value);

              if (review) {
                setReview(null);
              }
            }}
            placeholder="Paste your code here..."
            className="code-editor"
            spellCheck="false"
            rows={16}
          />
        </label>

        {/* Review button */}
        <button
          type="submit"
          className={`review-button ${review ? 'reviewed' : ''}`}
          disabled={
            !sourceCode.trim() ||
            status === 'loading' ||
            !!review
          }
        >
          {status === 'loading'
            ? 'Reviewing...'
            : review
              ? '✓ Reviewed'
              : 'Review Code'}
        </button>
      </form>

      {/* Error message */}
      {status === 'error' && (
        <p className="error-message">
          Review failed: {error}
        </p>
      )}

      {/* Review result */}
      {review && <ReviewResult review={review} />}
    </div>
  );
}

export default ReviewPage;