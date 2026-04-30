import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DetectionInference, ArticleMetadata } from '../../module_bindings/types';
import { useMemo } from 'react';

type IngestionTimelineProps = {
  inferences: DetectionInference[];
  articles: ArticleMetadata[];
};

/**
 * Safely convert a SpacetimeDB timestamp to a JS Date.
 * Timestamps may be: bigint (microseconds), number, { seconds, nanoseconds }, or Date.
 */
function toDate(ts: any): Date | null {
  try {
    if (ts instanceof Date) return ts;
    if (typeof ts === 'bigint') return new Date(Number(ts / 1000n));
    if (typeof ts === 'number') return new Date(ts);
    if (ts && typeof ts === 'object') {
      // SpacetimeDB Timestamp { seconds: bigint, nanoseconds: number }
      if ('seconds' in ts) return new Date(Number(ts.seconds) * 1000);
      if ('microsSinceEpoch' in ts) return new Date(Number(ts.microsSinceEpoch) / 1000);
    }
    return null;
  } catch {
    return null;
  }
}

export function IngestionTimeline({ inferences, articles }: IngestionTimelineProps) {
  const data = useMemo(() => {
    if (articles.length === 0) return [];

    const infMap = new Map(inferences.map(i => [i.articleId.toString(), i]));
    const buckets = new Map<string, { fake: number; real: number; unverified: number }>();

    articles.forEach(a => {
      // Prefer `ingestedAt`, fall back to `publishedAt` if `ingestedAt` is missing.
      const date = toDate(a.ingestedAt) ?? toDate((a as any).publishedAt);
      if (!date || isNaN(date.getTime())) return;

      const bucketKey = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours()
      ).toISOString();

      const entry = buckets.get(bucketKey) || { fake: 0, real: 0, unverified: 0 };
      const inf = infMap.get(a.id.toString());

      if (inf) {
        if (inf.classification === 'Fake') entry.fake++;
        else if (inf.classification === 'Real') entry.real++;
        else entry.unverified++;
      } else {
        entry.unverified++;
      }

      buckets.set(bucketKey, entry);
    });

    return Array.from(buckets.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([key, val]) => {
        const d = new Date(key);
        return {
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...val
        };
      });
  }, [inferences, articles]);

  // Debug: log input lengths and a short preview of the computed buckets.
  // Remove these logs after debugging.
  // eslint-disable-next-line no-console
  console.debug('IngestionTimeline', { inferencesLength: inferences.length, articlesLength: articles.length, preview: data.slice(0, 8) });

  if (data.length === 0) {
    return (
      <div className="chart-container timeline-chart">
        <h3>Ingestion Timeline</h3>
        <div className="empty-state">
          <div className="skeleton-pulse" />
          <p>Awaiting data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container timeline-chart">
      <h3>Ingestion Timeline</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradFake" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff3b30" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34c759" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34c759" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradUnverified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffcc00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ffcc00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="time" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#1f2833', border: '1px solid #333', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#ccc' }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#555" />
            <Area type="monotone" dataKey="fake" stroke="#ff3b30" fill="url(#gradFake)" name="Fake" />
            <Area type="monotone" dataKey="real" stroke="#34c759" fill="url(#gradReal)" name="Real" />
            <Area type="monotone" dataKey="unverified" stroke="#ffcc00" fill="url(#gradUnverified)" name="Unverified" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
