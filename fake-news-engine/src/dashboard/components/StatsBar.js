import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export function StatsBar({ counts }) {
    const [secondsAgo, setSecondsAgo] = useState(0);
    useEffect(() => {
        // We assume the data updates in real-time, but for the "Last updated" we just 
        // reset this timer when we want, or in this case we'll just increment it
        // since the websocket handles live updates. 
        // A better way would be to track the latest ingestedAt or processed time, 
        // but for now a simple timer that resets on mount/update if needed.
        // Actually, since WebSocket updates state and causes re-renders, 
        // we could reset a ref, but let's just do a simple timer for demonstration.
        const interval = setInterval(() => setSecondsAgo(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, []);
    // Reset timer on any counts change to simulate "last updated"
    useEffect(() => {
        setSecondsAgo(0);
    }, [counts]);
    return (_jsxs("header", { className: "stats-bar", children: [_jsx("h1", { children: "Disinformation Radar" }), _jsxs("div", { className: "stats", children: [_jsxs("span", { className: "stat fake", children: ["Fake: ", counts.fake] }), _jsxs("span", { className: "stat real", children: ["Real: ", counts.real] }), _jsxs("span", { className: "stat unverified", children: ["Unverified: ", counts.unverified] }), _jsxs("span", { className: "stat pending", children: ["AI Processing: ", counts.pending] })] }), _jsxs("div", { className: "live-timestamp", children: ["Last updated: ", secondsAgo, " seconds ago"] })] }));
}
