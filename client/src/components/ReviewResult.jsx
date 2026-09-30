import './ReviewResult.css';

const SEVERITY_CLASS = {
  critical: 'sev-critical',
  high: 'sev-high',
  medium: 'sev-medium',
  low: 'sev-low',
};

const SCORE_ITEMS = [
  {
    key: 'correctness',
    label: 'Correctness',
    weight: '30%',
  },
  {
    key: 'security',
    label: 'Security',
    weight: '25%',
  },
  {
    key: 'performance',
    label: 'Performance',
    weight: '15%',
  },
  {
    key: 'maintainability',
    label: 'Maintainability',
    weight: '15%',
  },
  {
    key: 'quality',
    label: 'Code Quality',
    weight: '15%',
  },
];

function getScoreLevel(score) {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 60) return 'acceptable';
  if (score >= 40) return 'poor';
  return 'very-poor';
}

function ReviewResult({ review }) {
  const copyCode = async () => {
    if (review.improvedCode) await navigator.clipboard.writeText(review.improvedCode);
  };
  return (
    <div className="review-result">

      {/* Overall Score */}
      <div className="score-overview">
        <div className={`score-circle ${getScoreLevel(review.score)}`}>
          <span className="score">{review.score}</span>
          <span className="score-label">/ 100</span>
        </div>

        <div className="score-overview-text">
          <h2>Overall Score</h2>
          <p>
            Your code received a score of <strong>{review.score}/100</strong>.
          </p>
        </div>
      </div>

      {/* Score Breakdown */}
      {review.scoreBreakdown && (
        <div className="score-breakdown">
          <h2>Score Breakdown</h2>

          <div className="score-breakdown-list">
            {SCORE_ITEMS.map(({ key, label, weight }) => {
              const value = Number(review.scoreBreakdown[key]);

              if (!Number.isFinite(value)) {
                return null;
              }

              return (
                <div className="score-item" key={key}>
                  <div className="score-item-header">
                    <span className="score-item-label">
                      {label}
                    </span>

                    <span className="score-item-value">
                      {value}/100
                    </span>
                  </div>

                  <div className="score-bar">
                    <div
                      className={`score-bar-fill ${getScoreLevel(value)}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>

                  <span className="score-weight">
                    Weight: {weight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="result-summary"><div><span>AI Summary</span><p>{review.summary}</p></div><div className="issue-count">{review.issues?.length || 0}<small>issues</small></div></div>

      {/* Issues */}
      {review.issues?.length > 0 && (
        <div className="issues">
          <h2>Issues</h2>

          {review.issues.map((issue, i) => (
            <div
              key={i}
              className={`issue ${
                SEVERITY_CLASS[issue.severity] || ''
              }`}
            >
              <div className="issue-header">
                <span className="issue-severity">
                  {issue.severity}
                </span>

                <span className="issue-type">
                  {issue.type}
                </span>

                {issue.line != null && (
                  <span className="issue-line">
                    line {issue.line}
                  </span>
                )}
              </div>

              <p className="issue-title">
                {issue.title}
              </p>

              <p className="issue-explanation">
                {issue.explanation}
              </p>

              <p className="issue-suggestion">
                {issue.suggestion}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Strengths */}
      {review.strengths?.length > 0 && (
        <div className="strengths">
          <h2>Strengths</h2>

          <ul>
            {review.strengths.map((strength, i) => (
              <li key={i}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Improved Code */}
      {review.improvedCode && (
        <div className="improved-code">
          <div className="improved-heading"><h2>Suggested improved code</h2><button type="button" onClick={copyCode}>Copy code</button></div>

          <pre>
            <code>{review.improvedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

export default ReviewResult;