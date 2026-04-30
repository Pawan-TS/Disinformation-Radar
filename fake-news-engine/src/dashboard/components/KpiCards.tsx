type KpiCardsProps = {
  totalIngested: number;
  fakeRate: number;
  avgConfidence: number;
  uniqueDomains: number;
};

export function KpiCards({ totalIngested, fakeRate, avgConfidence, uniqueDomains }: KpiCardsProps) {
  return (
    <div className="kpi-cards-row">
      <div className="kpi-card">
        <div className="kpi-label">Total Articles Ingested</div>
        <div className="kpi-value">{totalIngested}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Fake News Rate</div>
        <div className="kpi-value">{fakeRate.toFixed(1)}%</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Avg. Confidence</div>
        <div className="kpi-value">{(avgConfidence * 100).toFixed(1)}%</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-label">Domains Monitored</div>
        <div className="kpi-value">{uniqueDomains}</div>
      </div>
    </div>
  );
}
