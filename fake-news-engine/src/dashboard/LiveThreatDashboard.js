import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { tables } from '../module_bindings';
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
    const [allArticles] = useTable(tables.ArticleMetadata);
    const stats = useDerivedStats(allInferences, allArticles);
    const metaMap = new Map(allArticles.map(a => [a.id.toString(), a]));
    // Override panel state
    const [overrideArticleId, setOverrideArticleId] = useState(null);
    const [toast, setToast] = useState(null);
    const handleOverride = useCallback((articleId) => {
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
    return (_jsxs("div", { className: "dashboard", children: [_jsx(ErrorBoundary, { children: _jsx(StatsBar, { counts: counts }) }), _jsx(ErrorBoundary, { children: _jsx(KpiCards, { totalIngested: allArticles.length, fakeRate: stats.fakeRate, avgConfidence: stats.avgConfidence, uniqueDomains: stats.uniqueDomains }) }), _jsxs("div", { className: "charts-row", children: [_jsx(ErrorBoundary, { children: _jsx(ClassificationDonut, { counts: counts }) }), _jsx(ErrorBoundary, { children: _jsx(ConfidenceDistribution, { inferences: allInferences }) })] }), _jsxs("div", { className: "charts-row", children: [_jsx(ErrorBoundary, { children: _jsx(IngestionTimeline, { inferences: allInferences, articles: allArticles }) }), _jsx(ErrorBoundary, { children: _jsx(DomainLeaderboard, { inferences: allInferences, articles: allArticles }) })] }), _jsx(ErrorBoundary, { children: _jsx(ArticleFeed, { inferences: allInferences, metaMap: metaMap, onOverride: handleOverride }) }), overrideArticleId !== null && (_jsx(OverridePanel, { articleId: overrideArticleId, meta: overrideMeta, inference: overrideInference, onClose: handleOverrideClose, onSuccess: handleOverrideSuccess })), toast && (_jsx("div", { className: "toast-notification", children: toast }))] }));
}
