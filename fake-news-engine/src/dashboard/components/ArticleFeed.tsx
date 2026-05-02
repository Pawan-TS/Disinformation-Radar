import { useState, useMemo } from 'react';
import { DetectionInference, ArticleMetadata } from '../../module_bindings/types';
import { ArticleCard } from './ArticleCard';

type FeedFilter = 'All' | 'Fake' | 'Real' | 'Unverified' | 'Pending';
type SortMode = 'newest' | 'highConf' | 'lowConf';

type ArticleFeedProps = {
  inferences: readonly DetectionInference[];
  metaMap: Map<string, ArticleMetadata>;
  onOverride: (articleId: bigint) => void;
};

const PAGE_SIZE = 50;

export function ArticleFeed({ inferences, metaMap, onOverride }: ArticleFeedProps) {
  const [filter, setFilter] = useState<FeedFilter>('All');
  const [sort, setSort] = useState<SortMode>('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredRows = useMemo(() => {
    let rows = inferences;

    if (filter === 'Pending') {
      rows = rows.filter(r => !r.isProcessed);
    } else if (filter !== 'All') {
      rows = rows.filter(r => r.classification === filter);
    }

    // Sort
    rows = [...rows].sort((a, b) => {
      if (sort === 'highConf') return b.confidenceScore - a.confidenceScore;
      if (sort === 'lowConf') return a.confidenceScore - b.confidenceScore;
      // newest — use articleId as a proxy (higher id = newer)
      return Number(b.articleId) - Number(a.articleId);
    });

    return rows;
  }, [inferences, filter, sort]);

  const visibleRows = filteredRows.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRows.length;

  const filterModes: FeedFilter[] = ['All', 'Fake', 'Real', 'Unverified', 'Pending'];

  return (
    <div className="article-feed-section">
      <div className="feed-controls">
        <nav className="filters" aria-label="Article filter tabs">
          {filterModes.map(mode => (
            <button
              key={mode}
              className={filter === mode ? 'active' : ''}
              onClick={() => { setFilter(mode); setVisibleCount(PAGE_SIZE); }}
              aria-label={`Filter by ${mode}`}
            >
              {mode}
            </button>
          ))}
        </nav>

        <div className="sort-dropdown">
          <label htmlFor="sort-select" className="sort-label">Sort:</label>
          <select
            id="sort-select"
            value={sort}
            onChange={e => setSort(e.target.value as SortMode)}
            aria-label="Sort articles"
          >
            <option value="newest">Newest First</option>
            <option value="highConf">Highest Confidence</option>
            <option value="lowConf">Lowest Confidence</option>
          </select>
        </div>
      </div>

      <div className="threat-grid">
        {visibleRows.length === 0 && (
          <div className="empty-state">
            <div className="skeleton-pulse" />
            <p>Awaiting data...</p>
          </div>
        )}
        {visibleRows.map(row => (
          <ArticleCard
            key={Number(row.articleId)}
            inference={row}
            meta={metaMap.get(row.articleId.toString())}
            onOverride={onOverride}
          />
        ))}
      </div>

      {hasMore && (
        <button
          className="load-more-btn"
          onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
          aria-label="Load more articles"
        >
          Load more ({filteredRows.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
