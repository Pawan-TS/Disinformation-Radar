import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DetectionInference } from '../../module_bindings/types';
import { useMemo } from 'react';

type ConfidenceDistributionProps = {
  inferences: DetectionInference[];
};

export function ConfidenceDistribution({ inferences }: ConfidenceDistributionProps) {
  const data = useMemo(() => {
    const bins = Array.from({ length: 10 }, (_, i) => ({
      name: `${i * 10}-${(i + 1) * 10}%`,
      fake: 0,
      real: 0,
      unverified: 0
    }));

    inferences.forEach(inf => {
      if (!inf.isProcessed) return;
      let binIndex = Math.floor(inf.confidenceScore * 10);
      if (binIndex === 10) binIndex = 9; // Handle 1.0
      
      if (inf.classification === 'Fake') bins[binIndex].fake++;
      else if (inf.classification === 'Real') bins[binIndex].real++;
      else if (inf.classification === 'Unverified') bins[binIndex].unverified++;
    });

    return bins;
  }, [inferences]);

  return (
    <div className="chart-container bar-chart">
      <h3>Confidence Distribution</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#1f2833', border: '1px solid #333', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#ccc' }}
            />
            <Legend />
            <Bar dataKey="fake" stackId="a" fill="#ff3b30" name="Fake" />
            <Bar dataKey="real" stackId="a" fill="#34c759" name="Real" />
            <Bar dataKey="unverified" stackId="a" fill="#ffcc00" name="Unverified" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
