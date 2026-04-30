import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ClassificationDonutProps = {
  counts: { fake: number; real: number; unverified: number };
};

export function ClassificationDonut({ counts }: ClassificationDonutProps) {
  const data = [
    { name: 'Fake', value: counts.fake, color: '#ff3b30' },
    { name: 'Real', value: counts.real, color: '#34c759' },
    { name: 'Unverified', value: counts.unverified, color: '#ffcc00' }
  ];

  const total = counts.fake + counts.real + counts.unverified;

  return (
    <div className="chart-container donut-chart">
      <h3>Classification Split</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1f2833', border: '1px solid #333', borderRadius: '8px' }}
              itemStyle={{ color: '#ccc' }}
            />
            <Legend verticalAlign="bottom" height={36} />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={24} fontWeight={800}>
              {total}
            </text>
            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize={12}>
              Processed
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
