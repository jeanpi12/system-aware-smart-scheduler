export default function StatCard({ label, value, detail }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      <p className="stat-detail">{detail}</p>
    </div>
  );
}