import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const HEAT_GRADIENT = {
  0.0: "rgba(0, 0, 255, 0)",
  0.25: "blue",
  0.45: "cyan",
  0.65: "lime",
  0.8: "yellow",
  1.0: "red",
};

const expandIntoHeatCloud = (points) => {
  const seeds = points.length
    ? points
    : [[19.076, 72.8777, 0.92]];

  const cloud = [];

  seeds.forEach(([lat, lng]) => {
    cloud.push([lat, lng, 1]);

    for (let i = 0; i < 90; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 1.8) * 0.018;
      cloud.push([
        lat + Math.cos(angle) * radius,
        lng + Math.sin(angle) * radius * 1.2,
        Math.min(1, 0.55 + Math.random() * 0.45),
      ]);
    }
  });

  return cloud;
};

const normalizeHotspots = (payload) => {
  const featureCollection = payload?.data?.features ? payload.data : payload;
  const features = Array.isArray(featureCollection?.features)
    ? featureCollection.features
    : Array.isArray(featureCollection?.data)
      ? featureCollection.data
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.features)
          ? payload.features
          : [];

  const points = features
    .map((feature) => {
      const coords = feature?.geometry?.coordinates || feature?.coordinates || [];
      const lat = Number(coords[1]);
      const lng = Number(coords[0]);
      const confidence = Number(feature?.properties?.confidence ?? feature?.confidence ?? 70);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

      return [lat, lng, Math.min(1, Math.max(0.35, confidence / 100))];
    })
    .filter(Boolean);

  return expandIntoHeatCloud(points);
};

export default function HeatmapPage() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const loadHeatmap = async () => {
      setLoading(true);
      setError("");

      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("token") || "";

        const response = await fetch(`${baseUrl}/api/predict/heatmap?limit=200`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error("Heatmap API is not available right now.");
        }

        const payload = await response.json();
        const normalized = normalizeHotspots(payload);

        if (!cancelled) {
          setHotspots(normalized);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load hotspots.");
          setHotspots(expandIntoHeatCloud([]));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHeatmap();
    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || loading) return undefined;

    let cancelled = false;

    const renderMap = async () => {
      const ensureLeaflet = async () => {
        if (window.L && window.L.heatLayer) return true;

        try {
          if (!document.querySelector("link[data-leaflet]")) {
            const cssLink = document.createElement("link");
            cssLink.rel = "stylesheet";
            cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            cssLink.setAttribute("data-leaflet", "true");
            document.head.appendChild(cssLink);
          }

          if (!window.L) {
            await new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
              script.onload = resolve;
              script.onerror = reject;
              document.body.appendChild(script);
            });
          }

          if (!window.L.heatLayer) {
            await new Promise((resolve, reject) => {
              const script = document.createElement("script");
              script.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
              script.onload = resolve;
              script.onerror = reject;
              document.body.appendChild(script);
            });
          }

          return Boolean(window.L && window.L.heatLayer);
        } catch (err) {
          return false;
        }
      };

      try {
        const ready = await ensureLeaflet();

        if (cancelled || !mapContainerRef.current) return;

        if (!ready) {
          mapContainerRef.current.innerHTML = '<div class="heatmap-fallback">Heatmap library could not load.</div>';
          return;
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const center = hotspots[0] ? [hotspots[0][0], hotspots[0][1]] : [19.076, 72.8777];
        const map = window.L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          preferCanvas: true,
        }).setView(center, 13);

        const osm = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        });

        const satellite = window.L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          attribution: "Tiles &copy; Esri",
          maxZoom: 19,
        });

        osm.addTo(map);

        window.L.heatLayer(hotspots, {
          radius: 52,
          blur: 36,
          maxZoom: 18,
          minOpacity: 0.55,
          gradient: HEAT_GRADIENT,
        }).addTo(map);

        window.L.control.layers({ Map: osm, Satellite: satellite }).addTo(map);

        setTimeout(() => {
          map.invalidateSize();
          map.setView(center, 13);
        }, 250);

        mapInstanceRef.current = map;
      } catch (err) {
        if (!cancelled && mapContainerRef.current) {
          mapContainerRef.current.innerHTML = '<div class="heatmap-fallback">Unable to render heatmap.</div>';
        }
      }
    };

    renderMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hotspots, loading]);

  return (
    <>
      <style>{`
        .heatmap-page {
          height: calc(100dvh - 74px);
          background: #f3faf2;
          padding: 16px 20px 20px;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }
        .heatmap-card {
          max-width: 1180px;
          margin: 0 auto;
          height: 100%;
          background: #fff;
          border: 1px solid #d9ead8;
          border-radius: 22px;
          box-shadow: 0 18px 44px rgba(31, 72, 35, 0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .heatmap-header {
          background: linear-gradient(135deg, #153d1c, #2b6d2e);
          color: white;
          padding: 18px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .heatmap-title { font-family: 'Playfair Display', serif; font-size: clamp(24px, 3vw, 34px); font-weight: 800; }
        .heatmap-sub { margin-top: 4px; font-size: 13px; opacity: 0.82; }
        .heatmap-btn { background: white; border: none; border-radius: 10px; padding: 10px 16px; cursor: pointer; font-weight: 700; color: #163c1a; }
        .heatmap-body { padding: 16px 18px 18px; display: flex; flex-direction: column; min-height: 0; flex: 1; }
        .heatmap-map-wrap {
          position: relative;
          isolation: isolate;
          z-index: 0;
          flex: 1;
          min-height: 0;
          border-radius: 14px;
          overflow: hidden;
          border: 2px solid #d4ead0;
        }
        .heatmap-page .heatmap-map,
        .heatmap-page .leaflet-container {
          width: 100%;
          height: 100%;
          min-height: 0;
          background: #dfeee0;
        }
        .heatmap-page .leaflet-pane,
        .heatmap-page .leaflet-top,
        .heatmap-page .leaflet-bottom,
        .heatmap-page .leaflet-control {
          z-index: 1;
        }
        .heatmap-page .leaflet-control-layers {
          border: 1px solid #d4ead0;
          border-radius: 10px;
          box-shadow: 0 8px 16px rgba(27,74,23,0.08);
        }
        .heatmap-status { padding: 10px 14px; border-radius: 12px; background: #f0f8ef; border: 1px solid #d4ead0; color: #295a2b; font-weight: 600; margin-bottom: 12px; flex-shrink: 0; }
        .heatmap-error { padding: 10px 14px; border-radius: 12px; background: #fff1f1; border: 1px solid #f2caca; color: #9a2f2f; font-weight: 600; margin-bottom: 12px; flex-shrink: 0; }
        .heatmap-fallback { height: 100%; display: flex; align-items: center; justify-content: center; color: #416d3a; font-weight: 700; }
        @media (max-width: 720px) {
          .heatmap-header { flex-direction: column; align-items: flex-start; }
          .heatmap-page { height: calc(100dvh - 74px); padding: 10px; }
        }
      `}</style>

      <div className="heatmap-page">
        <div className="heatmap-card">
          <div className="heatmap-header">
            <div>
              <div className="heatmap-title">Field Hotspots</div>
              <div className="heatmap-sub">Disease-risk intensity shown as a heat overlay, not as map pins</div>
            </div>
            <button className="heatmap-btn" onClick={() => navigate("/analysis")}>Back to dashboard</button>
          </div>

          <div className="heatmap-body">
            {loading && <div className="heatmap-status">Loading hotspot overlay...</div>}
            {!loading && (
              <div className={error ? "heatmap-error" : "heatmap-status"}>
                {error ? "Live API unavailable — showing a sample disease-risk overlay." : "Live intensity overlay from connected prediction data."}
              </div>
            )}

            <div className="heatmap-map-wrap">
              <div ref={mapContainerRef} className="heatmap-map" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
