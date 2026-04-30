import { useState, useEffect } from 'react';

type StatsBarProps = {
  counts: { fake: number; real: number; unverified: number; pending: number };
};

export function StatsBar({ counts }: StatsBarProps) {
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

  return (
    <header className="stats-bar">
      <h1>Disinformation Radar</h1>
      <div className="stats">
        <span className="stat fake">Fake: {counts.fake}</span>
        <span className="stat real">Real: {counts.real}</span>
        <span className="stat unverified">Unverified: {counts.unverified}</span>
        <span className="stat pending">AI Processing: {counts.pending}</span>
      </div>
      <div className="live-timestamp">
        Last updated: {secondsAgo} seconds ago
      </div>
    </header>
  );
}
