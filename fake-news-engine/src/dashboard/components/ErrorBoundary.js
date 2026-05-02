import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('[ErrorBoundary]', error, info);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || (_jsxs("div", { className: "chart-container", style: { opacity: 0.5, textAlign: 'center', padding: '2rem' }, children: [_jsx("p", { style: { color: '#ff3b30', fontSize: '0.85rem' }, children: "\u26A0 Component failed to render" }), _jsx("p", { style: { color: '#555', fontSize: '0.75rem' }, children: this.state.error?.message })] }));
        }
        return this.props.children;
    }
}
