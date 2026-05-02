import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
export function ConfidenceDistribution({ inferences }) {
    const data = useMemo(() => {
        const bins = Array.from({ length: 10 }, (_, i) => ({
            name: `${i * 10}-${(i + 1) * 10}%`,
            fake: 0,
            real: 0,
            unverified: 0
        }));
        inferences.forEach(inf => {
            if (!inf.isProcessed)
                return;
            let binIndex = Math.floor(inf.confidenceScore * 10);
            if (binIndex === 10)
                binIndex = 9; // Handle 1.0
            if (inf.classification === 'Fake')
                bins[binIndex].fake++;
            else if (inf.classification === 'Real')
                bins[binIndex].real++;
            else if (inf.classification === 'Unverified')
                bins[binIndex].unverified++;
        });
        return bins;
    }, [inferences]);
    return (_jsxs("div", { className: "chart-container bar-chart", children: [_jsx("h3", { children: "Confidence Distribution" }), _jsx("div", { style: { width: '100%', height: 300 }, children: _jsx(ResponsiveContainer, { children: _jsxs(BarChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#333" }), _jsx(XAxis, { dataKey: "name", stroke: "#888", tick: { fill: '#888', fontSize: 12 } }), _jsx(YAxis, { stroke: "#888", tick: { fill: '#888', fontSize: 12 } }), _jsx(Tooltip, { contentStyle: { background: '#1f2833', border: '1px solid #333', borderRadius: '8px' }, labelStyle: { color: '#fff' }, itemStyle: { color: '#ccc' } }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "fake", stackId: "a", fill: "#ff3b30", name: "Fake" }), _jsx(Bar, { dataKey: "real", stackId: "a", fill: "#34c759", name: "Real" }), _jsx(Bar, { dataKey: "unverified", stackId: "a", fill: "#ffcc00", name: "Unverified" })] }) }) })] }));
}
