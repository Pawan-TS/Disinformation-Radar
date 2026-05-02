import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { ArticleCard } from './ArticleCard';
const PAGE_SIZE = 50;
export function ArticleFeed({ inferences, metaMap, onOverride }) {
    const [filter, setFilter] = useState('All');
    const [sort, setSort] = useState('newest');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const filteredRows = useMemo(() => {
        let rows = inferences;
        if (filter === 'Pending') {
            rows = rows.filter(r => !r.isProcessed);
        }
        else if (filter !== 'All') {
            rows = rows.filter(r => r.classification === filter);
        }
        // Sort
        rows = [...rows].sort((a, b) => {
            if (sort === 'highConf')
                return b.confidenceScore - a.confidenceScore;
            if (sort === 'lowConf')
                return a.confidenceScore - b.confidenceScore;
            // newest — use articleId as a proxy (higher id = newer)
            return Number(b.articleId) - Number(a.articleId);
        });
        return rows;
    }, [inferences, filter, sort]);
    const visibleRows = filteredRows.slice(0, visibleCount);
    const hasMore = visibleCount < filteredRows.length;
    const filterModes = ['All', 'Fake', 'Real', 'Unverified', 'Pending'];
    return (_jsxs("div", { className: "article-feed-section", children: [_jsxs("div", { className: "feed-controls", children: [_jsx("nav", { className: "filters", "aria-label": "Article filter tabs", children: filterModes.map(mode => (_jsx("button", { className: filter === mode ? 'active' : '', onClick: () => { setFilter(mode); setVisibleCount(PAGE_SIZE); }, "aria-label": `Filter by ${mode}`, children: mode }, mode))) }), _jsxs("div", { className: "sort-dropdown", children: [_jsx("label", { htmlFor: "sort-select", className: "sort-label", children: "Sort:" }), _jsxs("select", { id: "sort-select", value: sort, onChange: e => setSort(e.target.value), "aria-label": "Sort articles", children: [_jsx("option", { value: "newest", children: "Newest First" }), _jsx("option", { value: "highConf", children: "Highest Confidence" }), _jsx("option", { value: "lowConf", children: "Lowest Confidence" })] })] })] }), _jsxs("div", { className: "threat-grid", children: [visibleRows.length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "skeleton-pulse" }), _jsx("p", { children: "Awaiting data..." })] })), visibleRows.map(row => (_jsx(ArticleCard, { inference: row, meta: metaMap.get(row.articleId.toString()), onOverride: onOverride }, Number(row.articleId))))] }), hasMore && (_jsxs("button", { className: "load-more-btn", onClick: () => setVisibleCount(v => v + PAGE_SIZE), "aria-label": "Load more articles", children: ["Load more (", filteredRows.length - visibleCount, " remaining)"] }))] }));
}
