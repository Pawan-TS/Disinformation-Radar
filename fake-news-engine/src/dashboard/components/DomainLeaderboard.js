import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
export function DomainLeaderboard({ inferences, articles }) {
    const [sortBy, setSortBy] = useState('total');
    const domainData = useMemo(() => {
        // Build articleId → classification lookup
        const classMap = new Map(inferences.map(i => [i.articleId.toString(), i]));
        // Group articles by domain
        const domainMap = new Map();
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
                if (inf.classification === 'Fake')
                    existing.fake++;
                else if (inf.classification === 'Real')
                    existing.real++;
                else if (inf.classification === 'Unverified')
                    existing.unverified++;
            }
            existing.fakeRatio = existing.total > 0 ? existing.fake / existing.total : 0;
            domainMap.set(a.domain, existing);
        });
        const rows = Array.from(domainMap.values());
        rows.sort((a, b) => sortBy === 'fake' ? b.fake - a.fake : b.total - a.total);
        return rows.slice(0, 10);
    }, [inferences, articles, sortBy]);
    const maxTotal = domainData.length > 0 ? Math.max(...domainData.map(d => d.total)) : 1;
    return (_jsxs("div", { className: "chart-container domain-leaderboard", children: [_jsxs("div", { className: "leaderboard-header", children: [_jsx("h3", { children: "Top Domains" }), _jsxs("div", { className: "sort-toggle", children: [_jsx("button", { className: sortBy === 'total' ? 'active' : '', onClick: () => setSortBy('total'), "aria-label": "Sort by total count", children: "By Total" }), _jsx("button", { className: sortBy === 'fake' ? 'active' : '', onClick: () => setSortBy('fake'), "aria-label": "Sort by fake count", children: "By Fake" })] })] }), _jsxs("div", { className: "leaderboard-list", children: [domainData.length === 0 && (_jsx("div", { className: "empty-state", children: "Awaiting data..." })), domainData.map((row, idx) => (_jsxs("div", { className: `leaderboard-row ${row.fakeRatio > 0.5 ? 'high-risk' : ''}`, children: [_jsx("div", { className: "leaderboard-rank", children: idx + 1 }), _jsxs("div", { className: "leaderboard-info", children: [_jsxs("div", { className: "leaderboard-domain", children: [row.fakeRatio > 0.5 && _jsx("span", { className: "warning-icon", children: "\u26A0" }), row.domain] }), _jsxs("div", { className: "leaderboard-count", children: [row.total, " articles"] })] }), _jsxs("div", { className: "leaderboard-bar-track", children: [_jsx("div", { className: "leaderboard-bar-segment fake", style: { width: `${(row.fake / maxTotal) * 100}%` } }), _jsx("div", { className: "leaderboard-bar-segment real", style: { width: `${(row.real / maxTotal) * 100}%` } }), _jsx("div", { className: "leaderboard-bar-segment unverified", style: { width: `${(row.unverified / maxTotal) * 100}%` } })] })] }, row.domain)))] })] }));
}
