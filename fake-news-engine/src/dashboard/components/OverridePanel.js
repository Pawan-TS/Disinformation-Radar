import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { reducers } from '../../module_bindings';
import { useReducer } from 'spacetimedb/react';
export function OverridePanel({ articleId, meta, inference, onClose, onSuccess }) {
    const overrideClassification = useReducer(reducers.overrideClassification);
    const [classification, setClassification] = useState(inference?.classification ?? 'Unverified');
    const [rationale, setRationale] = useState('');
    const [error, setError] = useState(null);
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
        }
        catch (e) {
            setError(e?.message ?? 'Override failed. Please try again.');
            setSubmitting(false);
        }
    };
    return (_jsx("div", { className: "override-backdrop", onClick: onClose, children: _jsxs("div", { className: "override-panel", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "override-panel-header", children: [_jsx("h3", { children: "Override Classification" }), _jsx("button", { className: "override-close-btn", onClick: onClose, "aria-label": "Close override panel", children: "\u2715" })] }), _jsxs("div", { className: "override-panel-body", children: [_jsxs("div", { className: "override-article-info", children: [_jsx("h4", { children: meta?.headline ?? '—' }), _jsx("p", { className: "domain", children: meta?.domain }), _jsxs("p", { className: "current-class", children: ["Current: ", _jsx("span", { className: `badge ${inference?.classification.toLowerCase()}`, children: inference?.classification })] })] }), _jsx("label", { className: "override-label", htmlFor: "override-select", children: "New Classification" }), _jsxs("select", { id: "override-select", className: "override-select", value: classification, onChange: e => setClassification(e.target.value), "aria-label": "Select new classification", children: [_jsx("option", { value: "Real", children: "Real" }), _jsx("option", { value: "Fake", children: "Fake" }), _jsx("option", { value: "Unverified", children: "Unverified" })] }), _jsx("label", { className: "override-label", htmlFor: "override-rationale", children: "Rationale (min 10 chars)" }), _jsx("textarea", { id: "override-rationale", className: "override-textarea", value: rationale, onChange: e => setRationale(e.target.value), placeholder: "Explain why this classification should be changed...", rows: 4, "aria-label": "Override rationale" }), error && _jsx("p", { className: "override-error", children: error }), _jsxs("div", { className: "override-actions", children: [_jsx("button", { className: "btn-cancel", onClick: onClose, disabled: submitting, "aria-label": "Cancel override", children: "Cancel" }), _jsx("button", { className: "btn-confirm", onClick: handleSubmit, disabled: submitting || rationale.length < 10, "aria-label": "Confirm override", children: submitting ? 'Submitting...' : 'Confirm Override' })] })] })] }) }));
}
