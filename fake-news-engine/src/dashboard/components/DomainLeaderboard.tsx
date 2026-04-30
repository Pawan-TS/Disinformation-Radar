import { useMemo, useState } from 'react';
import { DetectionInference, ArticleMetadata } from '../../module_bindings/types';

type DomainLeaderboardProps = {
  inferences: DetectionInference[];
  articles: ArticleMetadata[];
};

type DomainRow = {
  domain: string;
  total: number;
  fake: number;
  real: number;
  unverified: number;
  fakeRatio: number;
};

export function DomainLeaderboard({ inferences, articles }: DomainLeaderboardProps) {
  const [sortBy, setSortBy] = useState<'total' | 'fake'>('total');

  const domainData = useMemo(() => {
    // Build articleId → classification lookup
    const classMap = new Map(inferences.map(i => [i.articleId.toString(), i]));

    // Group articles by domain
    const domainMap = new Map<string, DomainRow>();
    articles.forEach(a => {
      const existing = domainMap.get(a.domain) || {
        domain: a.domain,
        total: 0,
        fake: 0,
        real: 0,
        unverified: 0,
        fakeRatio: 0
      };
      existing.total++;

      const inf = classMap.get(a.id.toString());
      if (inf) {
        if (inf.classification === 'Fake') existing.fake++;
        else if (inf.classification === 'Real') existing.real++;
        else if (inf.classification === 'Unverified') existing.unverified++;
      }

      existing.fakeRatio = existing.total > 0 ? existing.fake / existing.total : 0;
      domainMap.set(a.domain, existing);
    });

    const rows = Array.from(domainMap.values());
    rows.sort((a, b) => sortBy === 'fake' ? b.fake - a.fake : b.total - a.total);
    return rows.slice(0, 10);
  }, [inferences, articles, sortBy]);

  const maxTotal = domainData.length > 0 ? Math.max(...domainData.map(d => d.total)) : 1;

  return (
    <div className="chart-container domain-leaderboard">
      <div className="leaderboard-header">
        <h3>Top Domains</h3>
        <div className="sort-toggle">
          <button
            className={sortBy === 'total' ? 'active' : ''}
            onClick={() => setSortBy('total')}
            aria-label="Sort by total count"
          >
            By Total
          </button>
          <button
            className={sortBy === 'fake' ? 'active' : ''}
            onClick={() => setSortBy('fake')}
            aria-label="Sort by fake count"
          >
            By Fake
          </button>
        </div>
      </div>

      <div className="leaderboard-list">
        {domainData.length === 0 && (
          <div className="empty-state">Awaiting data...</div>
        )}
        {domainData.map((row, idx) => (
          <div
            key={row.domain}
            className={`leaderboard-row ${row.fakeRatio > 0.5 ? 'high-risk' : ''}`}
          >
            <div className="leaderboard-rank">{idx + 1}</div>
            <div className="leaderboard-info">
              <div className="leaderboard-domain">
                {row.fakeRatio > 0.5 && <span className="warning-icon">⚠</span>}
                {row.domain}
              </div>
              <div className="leaderboard-count">{row.total} articles</div>
            </div>
            <div className="leaderboard-bar-track">
              <div
                className="leaderboard-bar-segment fake"
                style={{ width: `${(row.fake / maxTotal) * 100}%` }}
              />
              <div
                className="leaderboard-bar-segment real"
                style={{ width: `${(row.real / maxTotal) * 100}%` }}
              />
              <div
                className="leaderboard-bar-segment unverified"
                style={{ width: `${(row.unverified / maxTotal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
