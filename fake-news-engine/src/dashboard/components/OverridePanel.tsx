import { useState } from 'react';
import { ArticleMetadata, DetectionInference } from '../../module_bindings/types';
import { reducers } from '../../module_bindings';
import { useReducer } from 'spacetimedb/react';

type OverridePanelProps = {
  articleId: bigint;
  meta: ArticleMetadata | undefined;
  inference: DetectionInference | undefined;
  onClose: () => void;
  onSuccess: () => void;
};

export function OverridePanel({ articleId, meta, inference, onClose, onSuccess }: OverridePanelProps) {
  const overrideClassification = useReducer(reducers.overrideClassification);
  const [classification, setClassification] = useState<string>(inference?.classification ?? 'Unverified');
  const [rationale, setRationale] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rationale.length < 10) {
      setError('Rationale must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await overrideClassification({ articleId, classification, rationale });
      onSuccess();
    } catch (e: any) {
      setError(e?.message ?? 'Override failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="override-backdrop" onClick={onClose}>
      <div className="override-panel" onClick={e => e.stopPropagation()}>
        <div className="override-panel-header">
          <h3>Override Classification</h3>
          <button className="override-close-btn" onClick={onClose} aria-label="Close override panel">
            ✕
          </button>
        </div>

        <div className="override-panel-body">
          <div className="override-article-info">
            <h4>{meta?.headline ?? '—'}</h4>
            <p className="domain">{meta?.domain}</p>
            <p className="current-class">
              Current: <span className={`badge ${inference?.classification.toLowerCase()}`}>
                {inference?.classification}
              </span>
            </p>
          </div>

          <label className="override-label" htmlFor="override-select">New Classification</label>
          <select
            id="override-select"
            className="override-select"
            value={classification}
            onChange={e => setClassification(e.target.value)}
            aria-label="Select new classification"
          >
            <option value="Real">Real</option>
            <option value="Fake">Fake</option>
            <option value="Unverified">Unverified</option>
          </select>

          <label className="override-label" htmlFor="override-rationale">Rationale (min 10 chars)</label>
          <textarea
            id="override-rationale"
            className="override-textarea"
            value={rationale}
            onChange={e => setRationale(e.target.value)}
            placeholder="Explain why this classification should be changed..."
            rows={4}
            aria-label="Override rationale"
          />

          {error && <p className="override-error">{error}</p>}

          <div className="override-actions">
            <button
              className="btn-cancel"
              onClick={onClose}
              disabled={submitting}
              aria-label="Cancel override"
            >
              Cancel
            </button>
            <button
              className="btn-confirm"
              onClick={handleSubmit}
              disabled={submitting || rationale.length < 10}
              aria-label="Confirm override"
            >
              {submitting ? 'Submitting...' : 'Confirm Override'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
