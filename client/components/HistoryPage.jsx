import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../src/api/axios";

const statusStyles = {
  completed: { label: "Completed", color: "#1b4a17", bg: "#e8f5e3" },
  pending: { label: "Pending", color: "#8a5a12", bg: "#fff4d6" },
  failed: { label: "Failed", color: "#8a1f16", bg: "#fdecea" },
};

const normalizeRecommendations = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
};

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLocation = (location) => {
  const coords = location?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return "Location not saved";
  const [lng, lat] = coords.map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "Location not saved";
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [openId, setOpenId] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setNeedsLogin(true);
        setLoading(false);
        setError("Log in to see scans saved to your account.");
        return;
      }

      setLoading(true);
      setError("");
      setNeedsLogin(false);

      try {
        const response = await api.get("/api/predict/history", {
          params: { limit: 50 },
        });
        const predictions = response.data?.data?.predictions || [];
        if (!cancelled) {
          setScans(predictions);
        }
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401) {
          setNeedsLogin(true);
          setError("Your session expired. Log in again to view history.");
        } else {
          setError(err.response?.data?.message || "Could not load scan history.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <style>{`
        .history-page {
          background: #f0f7f0;
          min-height: calc(100dvh - 74px);
          padding: 48px 24px 72px;
          font-family: 'DM Sans', sans-serif;
        }
        .history-inner { max-width: 860px; margin: 0 auto; }
        .history-kicker {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #5a9e4f;
          margin-bottom: 10px;
        }
        .history-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 46px);
          font-weight: 800;
          color: #1b4a17;
          line-height: 1.15;
          margin-bottom: 12px;
        }
        .history-lead {
          font-size: 16px;
          color: #4a6e45;
          line-height: 1.8;
          margin-bottom: 28px;
          max-width: 680px;
        }
        .history-card {
          background: white;
          border: 1.5px solid #d4ead0;
          border-radius: 16px;
          padding: 18px 20px;
          margin-bottom: 14px;
        }
        .history-card-top {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .history-thumb {
          width: 84px;
          height: 84px;
          border-radius: 12px;
          object-fit: cover;
          background: #e8f5e3;
          flex-shrink: 0;
          border: 1px solid #d4ead0;
        }
        .history-thumb.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }
        .history-meta { flex: 1; min-width: 0; }
        .history-crop {
          font-size: 12px;
          font-weight: 700;
          color: #5a9e4f;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        .history-disease {
          font-size: 20px;
          font-weight: 800;
          color: #1b4a17;
          margin-bottom: 6px;
        }
        .history-date,
        .history-loc {
          font-size: 13px;
          color: #4a6e45;
          margin-bottom: 4px;
        }
        .history-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .history-pill {
          font-size: 12px;
          font-weight: 700;
          border-radius: 999px;
          padding: 5px 10px;
        }
        .history-toggle {
          margin-top: 14px;
          background: #1b4a17;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 9px 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .history-toggle:hover { background: #2d6128; }
        .history-recs {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #d4ead0;
        }
        .history-recs h3 {
          font-size: 14px;
          color: #1b4a17;
          margin-bottom: 8px;
        }
        .history-recs li {
          color: #4a6e45;
          font-size: 14px;
          line-height: 1.6;
          margin-left: 18px;
          margin-bottom: 6px;
        }
        .history-empty,
        .history-error {
          background: white;
          border: 1.5px solid #d4ead0;
          border-radius: 16px;
          padding: 28px 24px;
          color: #4a6e45;
        }
        .history-cta {
          margin-top: 16px;
          background: #1b4a17;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 11px 18px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        @media (max-width: 640px) {
          .history-card-top { flex-direction: column; }
          .history-thumb { width: 100%; height: 180px; }
        }
      `}</style>

      <div className="history-page">
        <div className="history-inner">
          <div className="history-kicker">Scan archive</div>
          <h1 className="history-title">Your crop scan history</h1>
          <p className="history-lead">
            Past leaf scans stay on your account with the disease result and the care recommendations saved in the database.
          </p>

          {loading && <div className="history-empty">Loading saved scans…</div>}

          {!loading && error && (
            <div className="history-error">
              {error}
              {needsLogin && (
                <div>
                  <button className="history-cta" onClick={() => navigate("/")}>Log in</button>
                </div>
              )}
            </div>
          )}

          {!loading && !error && scans.length === 0 && (
            <div className="history-empty">
              No scans saved yet. Diagnose a crop leaf to start your history.
              <div>
                <button className="history-cta" onClick={() => navigate("/analysis")}>Diagnose a crop</button>
              </div>
            </div>
          )}

          {!loading && !error && scans.map((scan) => {
            const status = statusStyles[scan.status] || statusStyles.pending;
            const recommendations = normalizeRecommendations(scan.recommendations);
            const isOpen = openId === scan._id;
            const confidence = Number.isFinite(Number(scan.confidence))
              ? Math.round(Number(scan.confidence))
              : null;

            return (
              <article key={scan._id} className="history-card">
                <div className="history-card-top">
                  {scan.imageUrl ? (
                    <img className="history-thumb" src={scan.imageUrl} alt={scan.diseaseLabel || "Crop scan"} />
                  ) : (
                    <div className="history-thumb placeholder" aria-hidden>🌿</div>
                  )}
                  <div className="history-meta">
                    <div className="history-crop">{scan.cropType || "Unknown crop"}</div>
                    <div className="history-disease">{scan.diseaseLabel || "Result pending"}</div>
                    <div className="history-date">{formatDate(scan.createdAt)}</div>
                    <div className="history-loc">{formatLocation(scan.location)}</div>
                    <div className="history-pills">
                      <span className="history-pill" style={{ background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                      {confidence !== null && (
                        <span className="history-pill" style={{ background: "#e8f5e3", color: "#1b4a17" }}>
                          {confidence}% confidence
                        </span>
                      )}
                      <span className="history-pill" style={{ background: "#e8f5e3", color: "#1b4a17" }}>
                        {recommendations.length} recommendation{recommendations.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <button
                      className="history-toggle"
                      onClick={() => setOpenId(isOpen ? "" : scan._id)}
                    >
                      {isOpen ? "Hide recommendations" : "View recommendations"}
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div className="history-recs">
                    <h3>Saved recommendations</h3>
                    {recommendations.length > 0 ? (
                      <ul>
                        {recommendations.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No recommendations were stored for this scan.</p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
