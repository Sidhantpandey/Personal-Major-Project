const stats = [
  { value: "90%+", label: "Model Accuracy", sub: "Across all crop species" },
  { value: "4",    label: "Crop Species",   sub: "Potato, Tomato, Cotton, Grapes" },
  { value: "<2s",  label: "Diagnosis Time", sub: "Real-time AI inference" },
  { value: "3-Tier", label: "Architecture", sub: "React + Flask + MongoDB" },
];

export default function StatsBanner() {
  return (
    <div id="stats">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .stat-item { text-align: center; color: white; }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 40px;
          font-weight: 800;
          color: #6acd5a;
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-label {
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 4px;
          font-family: 'DM Sans', sans-serif;
        }
        .stat-sub {
          font-size: 13px;
          opacity: 0.65;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <section style={{ background: "#1b4a17", padding: "60px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {stats.map(({ value, label, sub }) => (
            <div className="stat-item" key={label}>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-sub">{sub}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
