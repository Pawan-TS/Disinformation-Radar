import { DetectionInference, ArticleMetadata } from '../../module_bindings/types';

type ArticleCardProps = {
  inference: DetectionInference;
  meta: ArticleMetadata | undefined;
  onOverride: (articleId: bigint) => void;
};

export function ArticleCard({ inference, meta, onOverride }: ArticleCardProps) {
  const classification = inference.isProcessed ? inference.classification : 'Pending';
  const classLower = classification.toLowerCase();
  const confidencePct = (inference.confidenceScore * 100).toFixed(1);

  // Map classification to CSS color variable name
  const barColor =
    classification === 'Fake' ? 'var(--accent-fake)' :
    classification === 'Real' ? 'var(--accent-real)' :
    classification === 'Unverified' ? 'var(--accent-unverified)' :
    '#555';

  return (
    <div className={`threat-card ${classLower} card-animate-in`}>
      <h4>{meta?.headline ?? '—'}</h4>
      <p className="domain">{meta?.domain ?? 'unknown'}</p>

      <div className="confidence-bar-container">
        <div className="confidence-bar-label">
          Confidence: <strong>{confidencePct}%</strong>
        </div>
        <div className="confidence-bar-track">
          <div
            className="confidence-bar-fill"
            style={{
              width: `${confidencePct}%`,
              background: barColor
            }}
          />
        </div>
      </div>

      <div className="card-meta-row">
        <span className="model-version">{inference.modelVersion}</span>
      </div>

      <div className="badges">
        <span className={`badge ${classLower}`}>
          {classification}
        </span>
        {inference.flaggedByNewsguard && (
          <span className="badge newsguard">NewsGuard ✓</span>
        )}
      </div>

      {classification !== 'Real' && inference.isProcessed && (
        <button
          className="override-btn"
          onClick={() => onOverride(inference.articleId)}
          aria-label={`Override classification for article ${inference.articleId}`}
        >
          Override
        </button>
      )}
    </div>
  );
}
