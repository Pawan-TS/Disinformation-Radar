import { tables }   from '../module_bindings';
import { useTable } from 'spacetimedb/react';
import { useState, useCallback } from 'react';

import { useDerivedStats } from './hooks/useDerivedStats';
import { StatsBar } from './components/StatsBar';
import { KpiCards } from './components/KpiCards';
import { ClassificationDonut } from './components/ClassificationDonut';
import { ConfidenceDistribution } from './components/ConfidenceDistribution';
import { DomainLeaderboard } from './components/DomainLeaderboard';
import { IngestionTimeline } from './components/IngestionTimeline';
import { ArticleFeed } from './components/ArticleFeed';
import { OverridePanel } from './components/OverridePanel';
import { ErrorBoundary } from './components/ErrorBoundary';

export function LiveThreatDashboard() {
  const [allInferences] = useTable(tables.DetectionInference);
  const [allArticles]   = useTable(tables.ArticleMetadata);

  const stats = useDerivedStats(allInferences, allArticles);
  const metaMap = new Map(allArticles.map(a => [a.id.toString(), a]));

  // Override panel state
  const [overrideArticleId, setOverrideArticleId] = useState<bigint | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleOverride = useCallback((articleId: bigint) => {
    setOverrideArticleId(articleId);
  }, []);

  const handleOverrideClose = useCallback(() => {
    setOverrideArticleId(null);
  }, []);

  const handleOverrideSuccess = useCallback(() => {
    setOverrideArticleId(null);
    setToast('Classification overridden successfully.');
    setTimeout(() => setToast(null), 3000);
  }, []);

  const overrideMeta = overrideArticleId !== null
    ? metaMap.get(overrideArticleId.toString())
    : undefined;

  const overrideInference = overrideArticleId !== null
    ? allInferences.find(i => i.articleId === overrideArticleId)
    : undefined;

  const counts = {
    fake: stats.fake.length,
    real: stats.real.length,
    unverified: stats.unverified.length,
    pending: stats.pending.length
  };

  return (
    <div className="dashboard">
      {/* Header with live stats */}
      <ErrorBoundary>
        <StatsBar counts={counts} />
      </ErrorBoundary>

      {/* KPI Summary Cards */}
      <ErrorBoundary>
        <KpiCards
          totalIngested={allArticles.length}
          fakeRate={stats.fakeRate}
          avgConfidence={stats.avgConfidence}
          uniqueDomains={stats.uniqueDomains}
        />
      </ErrorBoundary>

      {/* Charts Row 1: Donut + Confidence */}
      <div className="charts-row">
        <ErrorBoundary>
          <ClassificationDonut counts={counts} />
        </ErrorBoundary>
        <ErrorBoundary>
          <ConfidenceDistribution inferences={allInferences} />
        </ErrorBoundary>
      </div>

      {/* Charts Row 2: Timeline + Domains */}
      <div className="charts-row">
        <ErrorBoundary>
          <IngestionTimeline inferences={allInferences} articles={allArticles} />
        </ErrorBoundary>
        <ErrorBoundary>
          <DomainLeaderboard inferences={allInferences} articles={allArticles} />
        </ErrorBoundary>
      </div>

      {/* Live Article Feed */}
      <ErrorBoundary>
        <ArticleFeed
          inferences={allInferences}
          metaMap={metaMap}
          onOverride={handleOverride}
        />
      </ErrorBoundary>

      {/* Override Panel */}
      {overrideArticleId !== null && (
        <OverridePanel
          articleId={overrideArticleId}
          meta={overrideMeta}
          inference={overrideInference}
          onClose={handleOverrideClose}
          onSuccess={handleOverrideSuccess}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-notification">
          {toast}
        </div>
      )}
    </div>
  );
}