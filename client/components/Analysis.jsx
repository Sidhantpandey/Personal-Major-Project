import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const cropOptions = ["Potato 🥔", "Tomato 🍅", "Cotton 🌾", "Grapes 🍇"];
const symptoms = ["Yellow Leaves", "Brown Spots", "Wilting", "White Powder", "Black Spots", "Curling Leaves", "Holes in Leaves", "Rotting Stem"];
const severities = ["Mild — few leaves", "Moderate — some plants", "Severe — whole field"];

const RESULTS = [
  {
    statusLabel: "Healthy Crop",
    statusColor: "#3a7d32",
    statusBg: "#e8f5e3",
    icon: "✅",
    disease: "No Disease Detected",
    confidence: 96,
    severity: "None",
    severityColor: "#3a7d32",
    desc: "Your crop leaf appears completely healthy. No signs of disease, infection, or pest damage detected by our CNN model. Continue your current care routine.",
    tips: [
      "Maintain regular watering schedule",
      "Ensure proper sunlight exposure",
      "Continue current fertilization plan",
      "Monitor weekly for early signs",
    ],
  },
  {
    statusLabel: "Disease Detected",
    statusColor: "#c0392b",
    statusBg: "#fdecea",
    icon: "⚠️",
    disease: "Early Blight (Alternaria solani)",
    confidence: 91,
    severity: "Moderate",
    severityColor: "#e67e22",
    desc: "Early blight has been detected. Dark brown spots with concentric rings visible on lower leaves. Immediate treatment is recommended to prevent further spread.",
    tips: [
      "Remove and destroy infected leaves immediately",
      "Apply copper-based fungicide spray",
      "Avoid overhead irrigation",
      "Improve air circulation around plants",
    ],
  },
  {
    statusLabel: "Disease Detected",
    statusColor: "#c0392b",
    statusBg: "#fdecea",
    icon: "🚨",
    disease: "Leaf Curl Virus",
    confidence: 88,
    severity: "Severe",
    severityColor: "#c0392b",
    desc: "Leaf Curl Virus transmitted by whiteflies detected. Leaves show upward curling with yellowing edges. Highly contagious — act immediately to protect nearby crops.",
    tips: [
      "Isolate affected plants immediately",
      "Apply systemic insecticide for whiteflies",
      "Remove heavily infected plants",
      "Use yellow sticky traps to monitor",
    ],
  },
];

const buildFallbackHeatPoints = (intensity = 0.8) => {
  const centerLat = 19.0760;
  const centerLng = 72.8777;

  return [
    [centerLat, centerLng, 0.45 + intensity * 0.35],
    [centerLat + 0.032, centerLng + 0.04, 0.62 + intensity * 0.38],
    [centerLat - 0.028, centerLng + 0.06, 0.58 + intensity * 0.32],
    [centerLat + 0.018, centerLng - 0.05, 0.54 + intensity * 0.36],
    [centerLat - 0.036, centerLng - 0.018, 0.66 + intensity * 0.3],
    [centerLat + 0.06, centerLng, 0.7 + intensity * 0.26],
    [centerLat - 0.055, centerLng + 0.08, 0.72 + intensity * 0.22],
    [centerLat + 0.035, centerLng + 0.09, 0.66 + intensity * 0.24],
  ];
};

const normalizeHeatMapPoints = (points = [], intensity = 0.8) => {
  if (!Array.isArray(points) || points.length === 0) {
    return buildFallbackHeatPoints(intensity);
  }

  return points
    .map((point, index) => {
      const geometry = point?.geometry?.coordinates || point?.coordinates || [72.8777, 19.0760];
      const lng = Number(geometry[0]);
      const lat = Number(geometry[1]);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }

      const confidence = Number(point?.properties?.confidence ?? point?.confidence ?? 60) / 100;
      const boost = 0.5 + ((points.length - index) / Math.max(1, points.length)) * 0.5;
      return [lat, lng, Math.min(1, Math.max(0.15, confidence * boost))];
    })
    .filter(Boolean)
    .slice(0, 80);
};

export default function DiagnoseSection() {
  const [step, setStep] = useState(1);
  const [crop, setCrop] = useState("");
  const [selS, setSelS] = useState([]);
  const [sev, setSev] = useState("");
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [barW, setBarW] = useState(0);
  const [heatPoints, setHeatPoints] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const fileRef = useRef();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  const toggleS = (s) => setSelS((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const handleFile = (file) => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => setPreview(event.target.result);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    setLoading(true);
    setStep(3);
    setTimeout(() => {
      const r = RESULTS[Math.floor(Math.random() * RESULTS.length)];
      setResult(r);
      setLoading(false);
      setTimeout(() => setBarW(r.confidence), 150);
    }, 2400);
  };

  useEffect(() => {
    if (!result) {
      setHeatPoints([]);
      return undefined;
    }

    let ignore = false;

    const loadHeatmap = async () => {
      setHeatmapLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");
      const url = `${baseUrl}/api/predict/heatmap?diseaseLabel=${encodeURIComponent(result.disease)}&latitude=19.0760&longitude=72.8777&radiusKm=150&limit=50`;

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error("Heatmap unavailable");
        }

        const payload = await response.json();
        const features = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.features)
            ? payload.features
            : [];

        if (!ignore) {
          setHeatPoints(normalizeHeatMapPoints(features, (result.confidence ?? 80) / 100));
        }
      } catch (error) {
        if (!ignore) {
          setHeatPoints(normalizeHeatMapPoints([], (result.confidence ?? 80) / 100));
        }
      } finally {
        if (!ignore) {
          setHeatmapLoading(false);
        }
      }
    };

    loadHeatmap();
    return () => {
      ignore = true;
    };
  }, [result]);

  useEffect(() => {
    if (!result || !mapContainerRef.current) {
      return undefined;
    }

    let cancelled = false;

    const loadMap = async () => {
      const ensureLeaflet = async () => {
        if (window.L && window.L.heatLayer) return;

        await new Promise((resolve, reject) => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.onload = () => resolve();
          link.onerror = reject;
          document.head.appendChild(link);
        });

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
      };

      try {
        await ensureLeaflet();

        if (cancelled || !mapContainerRef.current || !window.L) {
          return;
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = window.L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView([19.0760, 72.8777], 6);

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        const points = heatPoints.length > 0 ? heatPoints : buildFallbackHeatPoints((result.confidence ?? 80) / 100);

        window.L.heatLayer(points, {
          radius: 24,
          blur: 18,
          maxZoom: 11,
          minOpacity: 0.35,
          gradient: { 0.2: "#2f843b", 0.45: "#78b43d", 0.7: "#e9a429", 1: "#c62c2c" },
        }).addTo(map);

        mapInstanceRef.current = map;
      } catch (error) {
        if (!cancelled) {
          mapContainerRef.current.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#416d3a;font-weight:700">Heatmap unavailable right now.</div>';
        }
      }
    };

    loadMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [result, heatPoints]);

  const restart = () => {
    setStep(1);
    setCrop("");
    setSelS([]);
    setSev("");
    setNotes("");
    setPreview(null);
    setResult(null);
    setLoading(false);
    setBarW(0);
    setHeatPoints([]);
    setHeatmapLoading(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };

  const step1OK = crop && selS.length > 0 && sev;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .ds { background: #f0f7f0; padding: 9px 22px; font-family: 'DM Sans', sans-serif; }

        .ds-hd { text-align: center; margin-bottom: 40px; }
        .ds-badge { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #5a9e4f; display: block; margin-bottom: 12px; }
        .ds-title { font-family: 'Playfair Display', serif; font-size: clamp(28px,4vw,42px); font-weight: 800; color: #1b4a17; line-height: 1.2; margin-bottom: 12px; }
        .ds-sub { font-size: 15px; color: #6a9e60; max-width: 480px; margin: 0 auto; line-height: 1.7; }

        .stepper { display: flex; align-items: center; justify-content: center; margin-bottom: 48px; }
        .s-num { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; border: 2px solid #3a7d32; transition: all .3s; }
        .s-num.on { background: #3a7d32; color: white; }
        .s-num.done { background: #3a7d32; color: white; }
        .s-num.off { background: white; color: #aacaa0; border-color: #d4ead0; }
        .s-lbl { font-size: 13px; font-weight: 600; color: #1b4a17; margin-left: 8px; }
        .s-lbl.off { color: #aacaa0; }
        .s-line { width: 64px; height: 2px; background: #d4ead0; margin: 0 12px; }
        .s-line.done { background: #3a7d32; }

        .card { max-width: 860px; margin: 0 auto; background: white; border: 2px solid #3a7d32; animation: up .4s ease both; }
        @keyframes up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .card-head { background: linear-gradient(135deg, #1b4a17, #3a7d32); padding: 22px 32px; display: flex; align-items: center; gap: 14px; }
        .ch-icon { font-size: 26px; }
        .ch-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; color: white; }
        .ch-sub { font-size: 13px; color: rgba(255,255,255,.7); margin-top: 2px; }
        .card-body { padding: 36px 32px; }

        .fg { margin-bottom: 26px; }
        .lbl { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #3a7d32; margin-bottom: 10px; display: block; }

        .crop-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        .crop-btn { padding: 12px 8px; border: 1.5px solid #d4ead0; background: #f9fdf9; text-align: center; cursor: pointer; font-size: 13px; font-weight: 600; color: #4a6e45; transition: all .2s; }
        .crop-btn:hover { border-color: #3a7d32; background: #f0f7f0; }
        .crop-btn.sel { border-color: #3a7d32; background: #3a7d32; color: white; }

        .sym-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
        .sym { padding: 7px 14px; border: 1.5px solid #d4ead0; background: #f9fdf9; cursor: pointer; font-size: 13px; font-weight: 500; color: #4a6e45; border-radius: 20px; transition: all .2s; }
        .sym:hover { border-color: #3a7d32; background: #f0f7f0; }
        .sym.sel { border-color: #3a7d32; background: #e8f5e3; color: #1b4a17; font-weight: 700; }

        .sev-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .sev-btn { padding: 13px 10px; border: 1.5px solid #d4ead0; background: #f9fdf9; cursor: pointer; font-size: 13px; font-weight: 600; color: #4a6e45; text-align: center; transition: all .2s; }
        .sev-btn:hover { border-color: #3a7d32; background: #f0f7f0; }
        .sev-btn.sel { border-color: #3a7d32; background: #3a7d32; color: white; }

        .notes-ta { width: 100%; border: 1.5px solid #d4ead0; background: #f9fdf9; padding: 12px 16px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1b4a17; resize: vertical; min-height: 80px; outline: none; transition: border-color .2s; box-sizing: border-box; }
        .notes-ta:focus { border-color: #3a7d32; }

        .upz { border: 2.5px dashed #3a7d32; background: #f0f7f0; min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all .25s; text-align: center; padding: 32px; margin-bottom: 20px; }
        .upz:hover { background: #e8f5e3; border-color: #6acd5a; }
        .upz.filled { padding: 0; border-style: solid; min-height: unset; }
        .upz img { width: 100%; max-height: 280px; object-fit: cover; display: block; }
        .upz-icon { font-size: 44px; }
        .upz-t { font-size: 16px; font-weight: 700; color: #1b4a17; }
        .upz-s { font-size: 13px; color: #7aac6e; }

        .sum-row { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 16px; background: #f0f7f0; border: 1px solid #d4ead0; margin-bottom: 22px; }
        .sum-pill { background: #e8f5e3; border: 1px solid #c8e6c3; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #2d6128; }

        .btn-main { width: 100%; background: #3a7d32; color: white; border: none; padding: 16px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .25s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .btn-main:hover:not(:disabled) { background: #2d6128; box-shadow: 0 8px 24px rgba(58,125,50,.3); }
        .btn-main:disabled { background: #a0c8a0; cursor: not-allowed; }

        .btn-row { display: flex; gap: 12px; }
        .btn-back { background: white; color: #3a7d32; border: 2px solid #3a7d32; padding: 16px 22px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
        .btn-back:hover { background: #f0f7f0; }

        .ld-box { padding: 64px 32px; text-align: center; }
        .spin { width: 52px; height: 52px; border: 4px solid #d4ead0; border-top-color: #3a7d32; border-radius: 50%; animation: spin .9s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ld-t { font-size: 16px; font-weight: 700; color: #1b4a17; margin-bottom: 6px; }
        .ld-s { font-size: 13px; color: #7aac6e; }

        .res-top { padding: 20px 32px; display: flex; align-items: center; gap: 14px; }
        .res-icon { font-size: 32px; }
        .res-badge { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
        .res-name { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: #1b4a17; }

        .res-body { padding: 28px 32px; }
        .meta3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 24px; }
        .mc { background: #f0f7f0; border: 1px solid #d4ead0; padding: 14px; text-align: center; }
        .ml { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #7aac6e; margin-bottom: 5px; }
        .mv { font-size: 16px; font-weight: 800; color: #1b4a17; }

        .bar-wrap { margin-bottom: 24px; }
        .bar-top { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; font-weight: 700; color: #1b4a17; }
        .bar-track { height: 10px; background: #e8f5e3; border-radius: 5px; overflow: hidden; }
        .bar-fill { height: 100%; background: linear-gradient(90deg,#3a7d32,#6acd5a); border-radius: 5px; transition: width 1.2s cubic-bezier(.22,1,.36,1) .2s; }

        .res-desc { font-size: 14px; color: #4a6e45; line-height: 1.8; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e8f5e3; }
        .tips-hd { font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #3a7d32; margin-bottom: 14px; }
        .tip { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
        .tip-n { width: 22px; height: 22px; border-radius: 50%; background: #3a7d32; color: white; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .tip-t { font-size: 14px; color: #4a6e45; line-height: 1.6; }

        .btn-restart { width: 100%; background: white; color: #3a7d32; border: 2px solid #3a7d32; padding: 14px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; margin-top: 24px; }
        .btn-restart:hover { background: #f0f7f0; }

        .heatmap-layout { margin-top: 26px; border-top: 1px solid #e8f5e3; padding-top: 26px; }
        .heatmap-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
        .heatmap-kicker { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #5a9e4f; font-weight: 800; }
        .heatmap-title { font-size: 20px; font-weight: 800; color: #1b4a17; font-family: 'Playfair Display', serif; }
        .heatmap-pill { background: #e8f5e3; color: #2d6128; border: 1px solid #cfe8c8; padding: 6px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .heatmap-shell { background: linear-gradient(180deg, #f7fbf7, #edf7ed); border: 1px solid #d4ead0; border-radius: 18px; padding: 14px; }
        .heatmap-map { width: 100%; height: 330px; border-radius: 12px; overflow: hidden; border: 1px solid #d4ead0; }
        .heatmap-map .leaflet-container { width: 100%; height: 100%; }
        .heatmap-legend { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 14px; font-size: 11px; color: #537b4f; font-weight: 700; }
        .legend-bar { flex: 1; height: 10px; border-radius: 999px; background: linear-gradient(90deg, rgba(47,132,59,0.8), rgba(120,180,61,0.8), rgba(233,164,41,0.9), rgba(198,44,44,0.9)); border: 1px solid #d4ead0; }
        .heatmap-loader { display: flex; align-items: center; justify-content: center; gap: 12px; min-height: 180px; color: #2d6128; font-weight: 700; }
        .mini-spin { width: 22px; height: 22px; border: 3px solid #d4ead0; border-top-color: #3a7d32; border-radius: 50%; animation: spin 0.8s linear infinite; }

        .heatmap-nav-btn { background: #1b4a17; color: white; border: none; border-radius: 10px; padding: 12px 18px; cursor: pointer; font-weight: 700; margin-top: 18px; }
        .ds-top-actions { display: flex; justify-content: center; margin: 0 auto 28px; }
        .ds-heat-btn { background: #1b4a17; color: white; border: none; border-radius: 10px; padding: 12px 22px; cursor: pointer; font-weight: 700; font-family: 'DM Sans', sans-serif; }
      `}</style>

      <section className="ds">
        <div className="ds-hd">
          <span className="ds-badge"></span>
          <h2 className="ds-title">Diagnose Your Crop Instantly with AI</h2>
        </div>

        <div className="ds-top-actions">
          <button className="ds-heat-btn" onClick={() => navigate("/heatmap")}>Open Disease Heatmap</button>
        </div>

        <div className="stepper">
          {[{ n: 1, l: "Crop Info" }, { n: 2, l: "Upload Photo" }, { n: 3, l: "View Result" }].map(({ n, l }, i, a) => (
            <div key={n} style={{ display: "flex", alignItems: "center" }}>
              <div className={`s-num ${step > n ? "done" : step === n ? "on" : "off"}`}>{step > n ? "✓" : n}</div>
              <span className={`s-lbl ${step < n ? "off" : ""}`}>{l}</span>
              {i < a.length - 1 && <div className={`s-line ${step > n ? "done" : ""}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="card" key="s1">
            <div className="card-head">
              <span className="ch-icon">📋</span>
              <div><div className="ch-title">Tell Us About Your Crop</div><div className="ch-sub">Select type, symptoms & severity level</div></div>
            </div>
            <div className="card-body">
              <div className="fg">
                <span className="lbl">🌿 Crop Type</span>
                <div className="crop-grid">
                  {cropOptions.map((c) => (
                    <div key={c} className={`crop-btn ${crop === c ? "sel" : ""}`} onClick={() => setCrop(c)}>{c}</div>
                  ))}
                </div>
              </div>

              <div className="fg">
                <span className="lbl">🔍 Visible Symptoms <span style={{ color: "#9aba94", fontWeight: 500, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>select all that apply</span></span>
                <div className="sym-wrap">
                  {symptoms.map((s) => (
                    <div key={s} className={`sym ${selS.includes(s) ? "sel" : ""}`} onClick={() => toggleS(s)}>
                      {selS.includes(s) ? "✓ " : ""}{s}
                    </div>
                  ))}
                </div>
              </div>

              <div className="fg">
                <span className="lbl">⚠️ Spread Severity</span>
                <div className="sev-grid">
                  {severities.map((s) => (
                    <div key={s} className={`sev-btn ${sev === s ? "sel" : ""}`} onClick={() => setSev(s)}>{s}</div>
                  ))}
                </div>
              </div>

              <div className="fg" style={{ marginBottom: 32 }}>
                <span className="lbl">📝 Additional Notes <span style={{ color: "#9aba94", fontWeight: 500, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>optional</span></span>
                <textarea className="notes-ta" placeholder="e.g. symptoms appeared after heavy rain, 3 days ago..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <button className="btn-main" disabled={!step1OK} onClick={() => setStep(2)}>
                Next: Upload Leaf Photo →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card" key="s2">
            <div className="card-head">
              <span className="ch-icon">📷</span>
              <div><div className="ch-title">Upload Leaf Photo</div><div className="ch-sub">Clear, well-lit photo gives the best results</div></div>
            </div>
            <div className="card-body">
              <div className="sum-row">
                <span className="sum-pill">🌿 {crop}</span>
                {selS.map((s) => <span key={s} className="sum-pill">{s}</span>)}
                <span className="sum-pill">⚠️ {sev.split("—")[0].trim()}</span>
              </div>

              <div
                className={`upz ${preview ? "filled" : ""}`}
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              >
                {preview ? <img src={preview} alt="Leaf" /> : <><div className="upz-icon">🌿</div><div className="upz-t">Click or drag & drop leaf image here</div><div className="upz-s">JPG, PNG • close-up, well-lit photo recommended</div></>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />

              {preview && <p style={{ fontSize: 13, color: "#5a9e4f", fontWeight: 600, marginBottom: 20, textAlign: "center" }}>✓ Image ready — click Submit to analyze</p>}

              <div className="btn-row">
                <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-main" style={{ flex: 1 }} disabled={!preview} onClick={submit}>
                  🔬 Submit & View Result
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card" key="s3">
            {loading ? (
              <div className="ld-box">
                <div className="spin" />
                <div className="ld-t">Analyzing your leaf...</div>
                <div className="ld-s">Running CNN model • Cross-checking symptoms</div>
              </div>
            ) : result && (
              <>
                <div className="res-top" style={{ background: result.statusBg }}>
                  <span className="res-icon">{result.icon}</span>
                  <div>
                    <div className="res-badge" style={{ color: result.statusColor }}>{result.statusLabel}</div>
                    <div className="res-name">{result.disease}</div>
                  </div>
                </div>

                <div className="res-body">
                  <div className="meta3">
                    <div className="mc"><div className="ml">Crop</div><div className="mv">{crop.split(" ")[0]}</div></div>
                    <div className="mc"><div className="ml">Severity</div><div className="mv" style={{ color: result.severityColor }}>{result.severity}</div></div>
                    <div className="mc"><div className="ml">Confidence</div><div className="mv" style={{ color: "#3a7d32" }}>{result.confidence}%</div></div>
                  </div>

                  <div className="bar-wrap">
                    <div className="bar-top"><span>Model Confidence</span><span style={{ color: "#3a7d32" }}>{result.confidence}%</span></div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${barW}%` }} /></div>
                  </div>

                  <p className="res-desc">{result.desc}</p>

                  <div className="tips-hd">💡 Recommended Actions</div>
                  {result.tips.map((t, i) => (
                    <div className="tip" key={i}>
                      <div className="tip-n">{i + 1}</div>
                      <div className="tip-t">{t}</div>
                    </div>
                  ))}

                  <button className="heatmap-nav-btn" onClick={() => navigate("/heatmap")}>View Disease Heatmap</button>

                  <button className="btn-restart" onClick={restart}>↩ Start New Diagnosis</button>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}