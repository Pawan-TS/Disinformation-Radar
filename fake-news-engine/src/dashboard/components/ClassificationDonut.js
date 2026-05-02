import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export function ClassificationDonut({ counts }) {
    const data = [
        { name: 'Fake', value: counts.fake, color: '#ff3b30' },
        { name: 'Real', value: counts.real, color: '#34c759' },
        { name: 'Unverified', value: counts.unverified, color: '#ffcc00' }
    ];
    const total = counts.fake + counts.real + counts.unverified;
    return (_jsxs("div", { className: "chart-container donut-chart", children: [_jsx("h3", { children: "Classification Split" }), _jsx("div", { style: { width: '100%', height: 300 }, children: _jsx(ResponsiveContainer, { children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, innerRadius: 80, outerRadius: 120, paddingAngle: 5, dataKey: "value", children: data.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { background: '#1f2833', border: '1px solid #333', borderRadius: '8px' }, itemStyle: { color: '#ccc' } }), _jsx(Legend, { verticalAlign: "bottom", height: 36 }), _jsx("text", { x: "50%", y: "50%", textAnchor: "middle", dominantBaseline: "middle", fill: "#fff", fontSize: 24, fontWeight: 800, children: total }), _jsx("text", { x: "50%", y: "58%", textAnchor: "middle", dominantBaseline: "middle", fill: "#888", fontSize: 12, children: "Processed" })] }) }) })] }));
}
