import { Link } from 'react-router-dom';
import Spinner from '../../../components/ui/Spinner';

/**
 * CardHealthIndicator
 *
 * Props:
 *   cardHealth: { score: number (0-100), missing: [{ field, label, href }] }
 *   loading: bool
 *   error: string | null
 */
export default function CardHealthIndicator({ cardHealth, loading, error }) {
  if (loading) {
    return (
      <div className="card-health card-health--loading">
        <Spinner size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-health card-health--error">
        <p className="card-health__error-text">Couldn't load card health. <button onClick={() => window.location.reload()}>Retry</button></p>
      </div>
    );
  }

  const score = cardHealth?.score ?? 0;
  const missing = cardHealth?.missing ?? [];
  const isComplete = score === 100;

  const scoreColor =
    score >= 80 ? 'var(--color-success)' :
    score >= 50 ? 'var(--color-warning)' :
    'var(--color-danger)';

  // SVG ring constants
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card-health">
      <h3 className="card-health__title">Card health</h3>

      <div className="card-health__score-row">
        {/* Circular progress ring */}
        <div className="card-health__ring-wrap" aria-label={`${score}% complete`}>
          <svg width="84" height="84" viewBox="0 0 84 84">
            <circle
              cx="42" cy="42" r={radius}
              fill="none"
              stroke="var(--color-surface-raised)"
              strokeWidth="8"
            />
            <circle
              cx="42" cy="42" r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 42 42)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <span className="card-health__score-label" style={{ color: scoreColor }}>
            {score}%
          </span>
        </div>

        <div className="card-health__score-meta">
          {isComplete ? (
            <p className="card-health__complete-msg">
              Your profile is fully set up. Brands can find everything they need.
            </p>
          ) : (
            <p className="card-health__incomplete-msg">
              Complete your profile to appear higher in search and win more enquiries.
            </p>
          )}
        </div>
      </div>

      {missing.length > 0 && (
        <ul className="card-health__missing-list">
          {missing.map(({ field, label, href }) => (
            <li key={field} className="card-health__missing-item">
              <span className="card-health__missing-dot" aria-hidden="true" />
              <Link to={href} className="card-health__missing-link">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}