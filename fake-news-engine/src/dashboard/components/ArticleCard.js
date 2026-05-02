import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ArticleCard({ inference, meta, onOverride }) {
    const classification = inference.isProcessed ? inference.classification : 'Pending';
    const classLower = classification.toLowerCase();
    const confidencePct = (inference.confidenceScore * 100).toFixed(1);
    // Map classification to CSS color variable name
    const barColor = classification === 'Fake' ? 'var(--accent-fake)' :
        classification === 'Real' ? 'var(--accent-real)' :
            classification === 'Unverified' ? 'var(--accent-unverified)' :
                '#555';
    return (_jsxs("div", { className: `threat-card ${classLower} card-animate-in`, children: [_jsx("h4", { children: meta?.headline ?? '—' }), _jsx("p", { className: "domain", children: meta?.domain ?? 'unknown' }), _jsxs("div", { className: "confidence-bar-container", children: [_jsxs("div", { className: "confidence-bar-label", children: ["Confidence: ", _jsxs("strong", { children: [confidencePct, "%"] })] }), _jsx("div", { className: "confidence-bar-track", children: _jsx("div", { className: "confidence-bar-fill", style: {
                                width: `${confidencePct}%`,
                                background: barColor
                            } }) })] }), _jsx("div", { className: "card-meta-row", children: _jsx("span", { className: "model-version", children: inference.modelVersion }) }), _jsxs("div", { className: "badges", children: [_jsx("span", { className: `badge ${classLower}`, children: classification }), inference.flaggedByNewsguard && (_jsx("span", { className: "badge newsguard", children: "NewsGuard \u2713" }))] }), classification !== 'Real' && inference.isProcessed && (_jsx("button", { className: "override-btn", onClick: () => onOverride(inference.articleId), "aria-label": `Override classification for article ${inference.articleId}`, children: "Override" }))] }));
}
