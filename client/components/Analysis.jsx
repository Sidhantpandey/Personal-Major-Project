import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Static options ──────────────────────────────────────────────────────── */
const cropOptions = [
  "Apple 🍎", "BellPepper 🌶️", "Blueberry 🫐", "Cherry 🍒",
  "Corn 🌽", "Grape 🍇", "Orange 🍊", "Peach 🍑",
  "Potato 🥔", "Raspberry 🫐", "Rice 🌾", "Soybean 🫘",
  "Squash 🎃", "Strawberry 🍓", "Tomato 🍅",
];
const symptoms = [
  "Yellow Leaves", "Brown Spots", "Wilting", "White Powder",
  "Black Spots", "Curling Leaves", "Holes in Leaves", "Rotting Stem",
];
const severities = ["Mild — few leaves", "Moderate — some plants", "Severe — whole field"];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const parseDiseaseLabel = (label = "") => {
  const parts = label.replace(/___/g, "|").split("|");
  const crop = (parts[0] || "Unknown").replace(/_/g, " ");
  const disease = (parts[1] || "").replace(/_/g, " ") || "Healthy";
  return { crop, disease };
};

const getSeverityMeta = (label = "", confidence = 0) => {
  const lower = label.toLowerCase();
  if (lower.includes("healthy")) {
    return { label: "Healthy", color: "#16a34a", bg: "rgba(22,163,74,0.12)", icon: "✅" };
  }
  if (confidence >= 85) return { label: "High Risk", color: "#dc2626", bg: "rgba(220,38,38,0.1)", icon: "🚨" };
  if (confidence >= 60) return { label: "Moderate", color: "#d97706", bg: "rgba(217,119,6,0.1)", icon: "⚠️" };
  return { label: "Low Risk", color: "#2563eb", bg: "rgba(37,99,235,0.1)", icon: "ℹ️" };
};

const getTopProbs = (allProbs = {}, n = 5) =>
  Object.entries(allProbs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([cls, pct]) => ({ cls, pct: Number(pct) }));

const buildFallbackHeatPoints = (intensity = 0.8) => {
  const lat = 19.076, lng = 72.8777;
  return [
    [lat, lng, 0.45 + intensity * 0.35],
    [lat + 0.032, lng + 0.04, 0.62 + intensity * 0.38],
    [lat - 0.028, lng + 0.06, 0.58 + intensity * 0.32],
    [lat + 0.018, lng - 0.05, 0.54 + intensity * 0.36],
    [lat - 0.036, lng - 0.018, 0.66 + intensity * 0.3],
    [lat + 0.06, lng, 0.7 + intensity * 0.26],
    [lat - 0.055, lng + 0.08, 0.72 + intensity * 0.22],
    [lat + 0.035, lng + 0.09, 0.66 + intensity * 0.24],
  ];
};

const normalizeHeatMapPoints = (points = [], intensity = 0.8) => {
  if (!Array.isArray(points) || points.length === 0) return buildFallbackHeatPoints(intensity);
  return points
    .map((p) => {
      const geo = p?.geometry?.coordinates || p?.coordinates || [72.8777, 19.076];
      const lng2 = Number(geo[0]), lat2 = Number(geo[1]);
      if (!Number.isFinite(lat2) || !Number.isFinite(lng2)) return null;
      const conf = Number(p?.properties?.confidence ?? p?.confidence ?? 60) / 100;
      return [lat2, lng2, Math.min(1, Math.max(0.15, conf))];
    })
    .filter(Boolean)
    .slice(0, 80);
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function DiagnoseSection() {
  const [step, setStep]               = useState(1);
  const [crop, setCrop]               = useState("");
  const [selS, setSelS]               = useState([]);
  const [sev, setSev]                 = useState("");
  const [notes, setNotes]             = useState("");
  const [preview, setPreview]         = useState(null);
  const [imageFile, setImageFile]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [loadingMsg, setLoadingMsg]   = useState("Uploading image…");
  const [result, setResult]           = useState(null);
  const [apiError, setApiError]       = useState(null);

  // Animation states
  const [confVal, setConfVal]         = useState(0);
  const [probsVisible, setProbsVisible] = useState(false);
  const [recsVisible, setRecsVisible]  = useState([]);
  const [barW, setBarW]               = useState(0);

  // Heatmap
  const [heatPoints, setHeatPoints]       = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  const fileRef          = useRef();
  const mapContainerRef  = useRef(null);
  const mapInstanceRef   = useRef(null);
  const navigate         = useNavigate();

  const toggleS = (s) => setSelS((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const handleFile = (file) => {
    if (!file?.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  /* ─── Get geolocation ─────────────────────────────────────────────────── */
  const getLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ latitude: 0, longitude: 0 });
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
        () => resolve({ latitude: 0, longitude: 0 }),
        { timeout: 4000 }
      );
    });

  /* ─── Real API submit ─────────────────────────────────────────────────── */
  const submit = useCallback(async () => {
    if (!imageFile) return;
    setLoading(true);
    setApiError(null);
    setResult(null);
    setStep(3);
    setConfVal(0);
    setProbsVisible(false);
    setRecsVisible([]);
    setBarW(0);

    try {
      setLoadingMsg("Uploading image…");
      const { latitude, longitude } = await getLocation();

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("cropType", crop.split(" ")[0]);
      formData.append("latitude", String(latitude || 0));
      formData.append("longitude", String(longitude || 0));
      formData.append("language", "en");
      formData.append("tta", "false");

      setLoadingMsg("Running AI model…");
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token   = localStorage.getItem("token");

      const res = await fetch(`${baseUrl}/api/predict/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      setLoadingMsg("Generating recommendations…");
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.message || `Server error ${res.status}`);
      }

      const data = payload?.data ?? payload;
      setResult(data);
      setLoading(false);

      // Kick off animations
      setTimeout(() => setBarW(data.confidence ?? 0), 100);
      setTimeout(() => animateCounter(data.confidence ?? 0), 200);
      setTimeout(() => setProbsVisible(true), 600);
      const recs = data.recommendations || [];
      recs.forEach((_, i) => {
        setTimeout(() => setRecsVisible((prev) => [...prev, i]), 900 + i * 220);
      });
    } catch (err) {
      setLoading(false);
      setApiError(err.message || "Prediction failed. Please try again.");
    }
  }, [imageFile, crop]);

  /* ─── Animate confidence counter ─────────────────────────────────────── */
  const animateCounter = (target) => {
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setConfVal(Math.round(eased * target * 10) / 10);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ─── Heatmap data fetch ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!result) { setHeatPoints([]); return; }
    let ignore = false;
    const load = async () => {
      setHeatmapLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const token   = localStorage.getItem("token");
        const label   = encodeURIComponent(result.diseaseLabel || "");
        const url     = `${baseUrl}/api/predict/heatmap?diseaseLabel=${label}&latitude=19.0760&longitude=72.8777&radiusKm=150&limit=50`;
        const r       = await fetch(url, { headers: { Authorization: token ? `Bearer ${token}` : "" } });
        if (!r.ok) throw new Error();
        const p = await r.json();
        const features = Array.isArray(p?.data) ? p.data : Array.isArray(p?.features) ? p.features : [];
        if (!ignore) setHeatPoints(normalizeHeatMapPoints(features, (result.confidence ?? 80) / 100));
      } catch {
        if (!ignore) setHeatPoints(buildFallbackHeatPoints((result?.confidence ?? 80) / 100));
      } finally {
        if (!ignore) setHeatmapLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [result]);

  /* ─── Leaflet heatmap render ──────────────────────────────────────────── */
  useEffect(() => {
    if (!result || !mapContainerRef.current) return;
    let cancelled = false;
    const loadMap = async () => {
      const ensureLeaflet = async () => {
        if (window.L?.heatLayer) return;
        if (!document.querySelector('link[href*="leaflet"]')) {
          await new Promise((res, rej) => {
            const l = document.createElement("link");
            l.rel = "stylesheet";
            l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            l.onload = res; l.onerror = rej;
            document.head.appendChild(l);
          });
        }
        if (!window.L) {
          await new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            s.onload = res; s.onerror = rej;
            document.body.appendChild(s);
          });
        }
        if (!window.L.heatLayer) {
          await new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
            s.onload = res; s.onerror = rej;
            document.body.appendChild(s);
          });
        }
      };
      try {
        await ensureLeaflet();
        if (cancelled || !mapContainerRef.current || !window.L) return;
        if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
        const map = window.L.map(mapContainerRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([19.076, 72.8777], 6);
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);
        const pts = heatPoints.length > 0 ? heatPoints : buildFallbackHeatPoints((result.confidence ?? 80) / 100);
        window.L.heatLayer(pts, { radius: 24, blur: 18, maxZoom: 11, minOpacity: 0.35, gradient: { 0.2: "#2f843b", 0.45: "#78b43d", 0.7: "#e9a429", 1: "#c62c2c" } }).addTo(map);
        mapInstanceRef.current = map;
      } catch {
        if (!cancelled && mapContainerRef.current)
          mapContainerRef.current.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#416d3a;font-weight:700">Heatmap unavailable right now.</div>';
      }
    };
    loadMap();
    return () => {
      cancelled = true;
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [result, heatPoints]);

  /* ─── Reset ───────────────────────────────────────────────────────────── */
  const restart = () => {
    setStep(1); setCrop(""); setSelS([]); setSev(""); setNotes("");
    setPreview(null); setImageFile(null); setResult(null); setApiError(null);
    setLoading(false); setConfVal(0); setProbsVisible(false); setRecsVisible([]);
    setBarW(0); setHeatPoints([]); setHeatmapLoading(false);
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
  };

  /* ─── Derived ─────────────────────────────────────────────────────────── */
  const step1OK = crop && selS.length > 0 && sev;
  const parsed  = result ? parseDiseaseLabel(result.diseaseLabel || "") : null;
  const sevMeta = result ? getSeverityMeta(result.diseaseLabel || "", result.confidence || 0) : null;
  const topProbs = result?.rawModelResponse?.all_probabilities
    ? getTopProbs(result.rawModelResponse.all_probabilities, 5)
    : result?.all_probabilities
      ? getTopProbs(result.all_probabilities, 5)
      : [];
  const recommendations = result?.recommendations || [];

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');

        * { box-sizing: border-box; }

        .ds {
          background: linear-gradient(135deg, #0a0f0a 0%, #0f1f0f 50%, #0a150a 100%);
          min-height: 100vh;
          padding: 48px 24px 80px;
          font-family: 'Inter', sans-serif;
          color: #e2f0e2;
        }

        /* ── Header ── */
        .ds-hd { text-align: center; margin-bottom: 48px; }
        .ds-badge {
          display: inline-block;
          font-size: 11px; font-weight: 700; letter-spacing: 3px;
          text-transform: uppercase;
          color: #4ade80;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.25);
          padding: 6px 16px; border-radius: 999px;
          margin-bottom: 16px;
        }
        .ds-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px,4.5vw,52px);
          font-weight: 800;
          background: linear-gradient(135deg, #86efac, #4ade80, #22c55e);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          line-height: 1.15; margin-bottom: 14px;
        }
        .ds-sub { font-size: 15px; color: rgba(226,240,226,0.55); max-width: 500px; margin: 0 auto; line-height: 1.7; }

        /* ── Stepper ── */
        .stepper { display: flex; align-items: center; justify-content: center; margin-bottom: 48px; gap: 0; }
        .s-num {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800;
          border: 2px solid rgba(74,222,128,0.3);
          transition: all .35s ease;
          flex-shrink: 0;
        }
        .s-num.on  { background: linear-gradient(135deg,#22c55e,#16a34a); color: white; border-color: #22c55e; box-shadow: 0 0 20px rgba(34,197,94,0.4); }
        .s-num.done { background: #166534; color: #4ade80; border-color: #16a34a; }
        .s-num.off  { background: rgba(255,255,255,0.04); color: rgba(226,240,226,0.3); }
        .s-lbl { font-size: 13px; font-weight: 600; color: #86efac; margin-left: 8px; white-space: nowrap; }
        .s-lbl.off { color: rgba(226,240,226,0.25); }
        .s-line { width: 56px; height: 2px; background: rgba(74,222,128,0.15); margin: 0 10px; flex-shrink: 0; transition: background .4s; }
        .s-line.done { background: #22c55e; }

        /* ── Card ── */
        .card {
          max-width: 900px; margin: 0 auto;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(74,222,128,0.15);
          border-radius: 20px;
          backdrop-filter: blur(16px);
          overflow: hidden;
          animation: cardUp .45s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes cardUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .card-head {
          background: linear-gradient(135deg, rgba(22,101,52,0.7), rgba(15,61,32,0.8));
          border-bottom: 1px solid rgba(74,222,128,0.12);
          padding: 22px 32px;
          display: flex; align-items: center; gap: 14px;
        }
        .ch-icon { font-size: 26px; }
        .ch-title { font-size: 19px; font-weight: 800; color: #dcfce7; }
        .ch-sub { font-size: 13px; color: rgba(220,252,231,0.55); margin-top: 2px; }
        .card-body { padding: 32px; }

        /* ── Form groups ── */
        .fg { margin-bottom: 28px; }
        .lbl { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #4ade80; margin-bottom: 12px; display: block; }

        .crop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
        .crop-btn {
          padding: 11px 8px;
          border: 1px solid rgba(74,222,128,0.15);
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          text-align: center; cursor: pointer;
          font-size: 13px; font-weight: 600; color: rgba(226,240,226,0.7);
          transition: all .2s;
        }
        .crop-btn:hover { border-color: rgba(74,222,128,0.4); background: rgba(74,222,128,0.06); color: #86efac; }
        .crop-btn.sel { border-color: #22c55e; background: rgba(34,197,94,0.15); color: #4ade80; }

        .sym-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
        .sym {
          padding: 7px 14px;
          border: 1px solid rgba(74,222,128,0.15); background: rgba(255,255,255,0.03);
          border-radius: 999px; cursor: pointer;
          font-size: 13px; font-weight: 500; color: rgba(226,240,226,0.6);
          transition: all .2s;
        }
        .sym:hover { border-color: rgba(74,222,128,0.35); color: #86efac; }
        .sym.sel { border-color: #22c55e; background: rgba(34,197,94,0.14); color: #4ade80; font-weight: 700; }

        .sev-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .sev-btn {
          padding: 13px 10px;
          border: 1px solid rgba(74,222,128,0.15); background: rgba(255,255,255,0.03);
          border-radius: 12px; cursor: pointer;
          font-size: 13px; font-weight: 600; color: rgba(226,240,226,0.6);
          text-align: center; transition: all .2s;
        }
        .sev-btn:hover { border-color: rgba(74,222,128,0.35); color: #86efac; }
        .sev-btn.sel { border-color: #22c55e; background: rgba(34,197,94,0.15); color: #4ade80; }

        .notes-ta {
          width: 100%;
          border: 1px solid rgba(74,222,128,0.15); background: rgba(255,255,255,0.03);
          border-radius: 12px; padding: 13px 16px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          color: #dcfce7; resize: vertical; min-height: 80px;
          outline: none; transition: border-color .2s;
        }
        .notes-ta::placeholder { color: rgba(226,240,226,0.3); }
        .notes-ta:focus { border-color: rgba(74,222,128,0.5); }

        /* ── Upload zone ── */
        .upz {
          border: 2px dashed rgba(74,222,128,0.3);
          background: rgba(74,222,128,0.03);
          border-radius: 16px;
          min-height: 220px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
          cursor: pointer; transition: all .25s; text-align: center; padding: 36px;
          margin-bottom: 20px;
        }
        .upz:hover { background: rgba(74,222,128,0.07); border-color: rgba(74,222,128,0.55); }
        .upz.filled { padding: 0; border-style: solid; min-height: unset; border-color: rgba(74,222,128,0.4); }
        .upz img { width: 100%; max-height: 300px; object-fit: cover; display: block; border-radius: 14px; }
        .upz-icon { font-size: 48px; filter: drop-shadow(0 0 18px rgba(74,222,128,0.4)); }
        .upz-t { font-size: 16px; font-weight: 700; color: #dcfce7; }
        .upz-s { font-size: 13px; color: rgba(226,240,226,0.4); }

        .sum-row { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 16px; background: rgba(74,222,128,0.05); border: 1px solid rgba(74,222,128,0.12); border-radius: 12px; margin-bottom: 22px; }
        .sum-pill { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #86efac; }

        /* ── Buttons ── */
        .btn-main {
          width: 100%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white; border: none; border-radius: 12px;
          padding: 16px; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all .25s; display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 4px 20px rgba(34,197,94,0.25);
        }
        .btn-main:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(34,197,94,0.4); }
        .btn-main:disabled { background: rgba(74,222,128,0.15); color: rgba(226,240,226,0.3); cursor: not-allowed; box-shadow: none; }

        .btn-row { display: flex; gap: 12px; }
        .btn-back {
          background: rgba(255,255,255,0.04); color: #86efac;
          border: 1px solid rgba(74,222,128,0.25); border-radius: 12px;
          padding: 16px 22px; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'Inter', sans-serif; transition: all .2s;
        }
        .btn-back:hover { background: rgba(74,222,128,0.08); border-color: rgba(74,222,128,0.45); }

        .btn-restart {
          width: 100%;
          background: rgba(255,255,255,0.04); color: #86efac;
          border: 1.5px solid rgba(74,222,128,0.25); border-radius: 12px;
          padding: 14px; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'Inter', sans-serif; transition: all .2s;
          margin-top: 20px;
        }
        .btn-restart:hover { background: rgba(74,222,128,0.07); }

        /* ── Loading ── */
        .ld-box { padding: 72px 32px; text-align: center; }
        .ld-orb {
          width: 72px; height: 72px; margin: 0 auto 28px;
          border-radius: 50%;
          border: 3px solid rgba(74,222,128,0.15);
          border-top-color: #4ade80;
          animation: spin .9s linear infinite;
          box-shadow: 0 0 30px rgba(74,222,128,0.2);
        }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ld-steps { display: flex; flex-direction: column; gap: 8px; align-items: center; margin-bottom: 16px; }
        .ld-step { font-size: 13px; font-weight: 600; color: rgba(226,240,226,0.5); }
        .ld-step.active { color: #4ade80; font-size: 15px; }
        .ld-t { font-size: 18px; font-weight: 800; color: #dcfce7; margin-bottom: 8px; }
        .ld-s { font-size: 14px; color: rgba(226,240,226,0.45); }

        /* ── Error ── */
        .err-box {
          margin: 32px;
          padding: 24px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 14px;
          text-align: center;
        }
        .err-icon { font-size: 36px; margin-bottom: 12px; }
        .err-title { font-size: 16px; font-weight: 700; color: #fca5a5; margin-bottom: 8px; }
        .err-msg { font-size: 13px; color: rgba(252,165,165,0.65); margin-bottom: 20px; line-height: 1.6; }

        /* ── Result banner ── */
        .res-banner {
          padding: 28px 32px;
          display: flex; align-items: center; gap: 20px;
          border-bottom: 1px solid rgba(74,222,128,0.1);
        }
        .res-image {
          width: 100px; height: 100px; border-radius: 14px;
          object-fit: cover; flex-shrink: 0;
          border: 2px solid rgba(74,222,128,0.2);
          box-shadow: 0 0 24px rgba(74,222,128,0.1);
        }
        .res-image-placeholder {
          width: 100px; height: 100px; border-radius: 14px;
          background: rgba(74,222,128,0.06); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; border: 2px solid rgba(74,222,128,0.15);
        }
        .res-info { flex: 1; min-width: 0; }
        .res-sev-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 5px 12px; border-radius: 999px;
          margin-bottom: 10px;
        }
        .res-crop { font-size: 13px; font-weight: 600; color: rgba(226,240,226,0.5); margin-bottom: 4px; }
        .res-disease { font-size: 22px; font-weight: 800; color: #dcfce7; line-height: 1.2; }

        /* ── Confidence gauge ── */
        .conf-section { padding: 24px 32px; border-bottom: 1px solid rgba(74,222,128,0.08); }
        .conf-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .conf-label { font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(226,240,226,0.4); }
        .conf-num { font-size: 36px; font-weight: 900; color: #4ade80; letter-spacing: -1px; font-variant-numeric: tabular-nums; }
        .conf-pct { font-size: 18px; color: rgba(74,222,128,0.6); }
        .bar-track { height: 10px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; position: relative; }
        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #16a34a, #22c55e, #4ade80, #86efac);
          border-radius: 999px;
          transition: width 1.4s cubic-bezier(.22,1,.36,1) .1s;
          position: relative;
        }
        .bar-fill::after {
          content: '';
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          width: 14px; height: 14px; border-radius: 50%;
          background: #4ade80; box-shadow: 0 0 12px rgba(74,222,128,0.8);
        }

        /* ── Top probabilities ── */
        .probs-section { padding: 24px 32px; border-bottom: 1px solid rgba(74,222,128,0.08); }
        .probs-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(226,240,226,0.35); margin-bottom: 16px; }
        .prob-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .prob-name { font-size: 12px; font-weight: 600; color: rgba(226,240,226,0.6); width: 200px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .prob-track { flex: 1; height: 7px; background: rgba(255,255,255,0.05); border-radius: 999px; overflow: hidden; }
        .prob-fill {
          height: 100%;
          border-radius: 999px;
          width: 0%;
          transition: width 1s cubic-bezier(.22,1,.36,1);
        }
        .prob-fill.top { background: linear-gradient(90deg, #16a34a, #4ade80); }
        .prob-fill.rest { background: rgba(74,222,128,0.35); }
        .prob-pct { font-size: 12px; font-weight: 700; color: rgba(226,240,226,0.5); width: 48px; text-align: right; flex-shrink: 0; }

        /* ── Recommendations ── */
        .recs-section { padding: 24px 32px; }
        .recs-title { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .recs-title-text { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(226,240,226,0.35); }
        .recs-badge { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #4ade80; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2); padding: 3px 10px; border-radius: 999px; }

        .rec-card {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 18px 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(74,222,128,0.1);
          border-radius: 14px;
          margin-bottom: 12px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity .4s ease, transform .4s cubic-bezier(.22,1,.36,1);
        }
        .rec-card.visible { opacity: 1; transform: translateY(0); }
        .rec-card:hover { border-color: rgba(74,222,128,0.25); background: rgba(74,222,128,0.04); }

        .rec-num {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.3));
          border: 1px solid rgba(74,222,128,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: #4ade80;
          flex-shrink: 0; margin-top: 1px;
        }
        .rec-text { font-size: 14px; color: rgba(226,240,226,0.75); line-height: 1.7; }

        /* ── Heatmap ── */
        .heatmap-layout { padding: 0 32px 32px; }
        .heatmap-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-top: 24px; border-top: 1px solid rgba(74,222,128,0.08); }
        .heatmap-kicker { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(74,222,128,0.5); font-weight: 700; }
        .heatmap-title { font-size: 17px; font-weight: 800; color: #dcfce7; margin-top: 2px; }
        .heatmap-shell { background: rgba(255,255,255,0.02); border: 1px solid rgba(74,222,128,0.12); border-radius: 16px; padding: 12px; }
        .heatmap-map { width: 100%; height: 320px; border-radius: 12px; overflow: hidden; }
        .heatmap-legend { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; font-size: 11px; color: rgba(226,240,226,0.45); font-weight: 600; }
        .legend-bar { flex: 1; height: 8px; border-radius: 999px; background: linear-gradient(90deg, rgba(47,132,59,.8), rgba(120,180,61,.8), rgba(233,164,41,.9), rgba(198,44,44,.9)); }
        .heatmap-loader { display: flex; align-items: center; justify-content: center; gap: 12px; min-height: 160px; color: #86efac; font-weight: 600; font-size: 14px; }
        .mini-spin { width: 20px; height: 20px; border: 2.5px solid rgba(74,222,128,0.2); border-top-color: #4ade80; border-radius: 50%; animation: spin .8s linear infinite; }

        /* ── Nav buttons ── */
        .ds-top-actions { display: flex; justify-content: center; margin-bottom: 32px; }
        .ds-heat-btn {
          background: rgba(74,222,128,0.08); color: #86efac;
          border: 1px solid rgba(74,222,128,0.25); border-radius: 12px;
          padding: 11px 22px; cursor: pointer; font-weight: 700;
          font-family: 'Inter', sans-serif; font-size: 14px;
          transition: all .2s;
        }
        .ds-heat-btn:hover { background: rgba(74,222,128,0.14); border-color: rgba(74,222,128,0.5); }

        .heatmap-nav-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(74,222,128,0.08); color: #86efac;
          border: 1px solid rgba(74,222,128,0.25); border-radius: 10px;
          padding: 11px 18px; cursor: pointer; font-weight: 700;
          font-size: 13px; font-family: 'Inter', sans-serif;
          transition: all .2s; margin-top: 8px;
        }
        .heatmap-nav-btn:hover { background: rgba(74,222,128,0.14); }

        @media (max-width: 600px) {
          .card-head, .card-body, .res-banner, .conf-section, .probs-section, .recs-section, .heatmap-layout { padding-left: 18px; padding-right: 18px; }
          .sev-grid { grid-template-columns: 1fr; }
          .crop-grid { grid-template-columns: repeat(3,1fr); }
          .prob-name { width: 110px; }
        }
      `}</style>

      <section className="ds">
        {/* Header */}
        <div className="ds-hd">
          <span className="ds-badge">🌿 AI Crop Diagnostics</span>
          <h2 className="ds-title">Diagnose Your Crop Instantly</h2>
          <p className="ds-sub">Upload a leaf photo — our OmniCrops AI detects 48 diseases across 15 crops and generates personalized treatment recommendations.</p>
        </div>

        <div className="ds-top-actions">
          <button className="ds-heat-btn" onClick={() => navigate("/heatmap")}>🗺️ Open Disease Heatmap</button>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {[{ n: 1, l: "Crop Info" }, { n: 2, l: "Upload Photo" }, { n: 3, l: "AI Results" }].map(({ n, l }, i, a) => (
            <div key={n} style={{ display: "flex", alignItems: "center" }}>
              <div className={`s-num ${step > n ? "done" : step === n ? "on" : "off"}`}>{step > n ? "✓" : n}</div>
              <span className={`s-lbl ${step < n ? "off" : ""}`}>{l}</span>
              {i < a.length - 1 && <div className={`s-line ${step > n ? "done" : ""}`} />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Crop Info ─────────────────────────────────────── */}
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
                <span className="lbl">🔍 Visible Symptoms <span style={{ color: "rgba(226,240,226,0.3)", fontWeight: 500, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>select all that apply</span></span>
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
                <span className="lbl">📝 Additional Notes <span style={{ color: "rgba(226,240,226,0.3)", fontWeight: 500, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>optional</span></span>
                <textarea className="notes-ta" placeholder="e.g. symptoms appeared after heavy rain, 3 days ago…" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <button className="btn-main" disabled={!step1OK} onClick={() => setStep(2)}>
                Next: Upload Leaf Photo →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Upload ───────────────────────────────────────── */}
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
                {preview
                  ? <img src={preview} alt="Leaf preview" />
                  : <>
                      <div className="upz-icon">🌿</div>
                      <div className="upz-t">Click or drag &amp; drop leaf image here</div>
                      <div className="upz-s">JPG, PNG, WebP • close-up, well-lit photo recommended</div>
                    </>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />

              {preview && <p style={{ fontSize: 13, color: "#4ade80", fontWeight: 600, marginBottom: 20, textAlign: "center" }}>✓ Image ready — click Analyze to run the AI model</p>}

              <div className="btn-row">
                <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-main" style={{ flex: 1 }} disabled={!preview} onClick={submit}>
                  🔬 Analyze with AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Results ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="card" key="s3">
            {/* Loading */}
            {loading && (
              <div className="ld-box">
                <div className="ld-orb" />
                <div className="ld-t">AI Model Running…</div>
                <div className="ld-steps">
                  <div className={`ld-step ${loadingMsg.includes("Uploading") ? "active" : ""}`}>1. Uploading image to cloud</div>
                  <div className={`ld-step ${loadingMsg.includes("Running") ? "active" : ""}`}>2. OmniCrops SwinV2 inference (48 classes)</div>
                  <div className={`ld-step ${loadingMsg.includes("Generat") ? "active" : ""}`}>3. GPT-4o-mini generating recommendations</div>
                </div>
                <div className="ld-s">{loadingMsg}</div>
              </div>
            )}

            {/* Error */}
            {apiError && !loading && (
              <div className="err-box">
                <div className="err-icon">🔌</div>
                <div className="err-title">Prediction Failed</div>
                <div className="err-msg">{apiError}<br /><br />Make sure the Python FastAPI service is running on port 8000 and the Node.js server is running on port 3000.</div>
                <button className="btn-main" style={{ maxWidth: 240, margin: "0 auto" }} onClick={restart}>Try Again</button>
              </div>
            )}

            {/* Result */}
            {result && !loading && (
              <>
                {/* ─ Disease banner */}
                <div className="res-banner" style={{ background: sevMeta ? `linear-gradient(135deg, ${sevMeta.bg}, rgba(0,0,0,0))` : "transparent" }}>
                  {preview
                    ? <img className="res-image" src={preview} alt="Analyzed leaf" />
                    : <div className="res-image-placeholder">🌿</div>
                  }
                  <div className="res-info">
                    <div className="res-sev-badge" style={{ color: sevMeta?.color, background: sevMeta?.bg, border: `1px solid ${sevMeta?.color}44` }}>
                      {sevMeta?.icon} {sevMeta?.label}
                    </div>
                    <div className="res-crop">{parsed?.crop || crop.split(" ")[0]}</div>
                    <div className="res-disease">{parsed?.disease || result.diseaseLabel}</div>
                  </div>
                </div>

                {/* ─ Confidence gauge */}
                <div className="conf-section">
                  <div className="conf-row">
                    <div>
                      <div className="conf-label">Model Confidence</div>
                      <div className="conf-num">
                        {confVal.toFixed(1)}<span className="conf-pct">%</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="conf-label">Model</div>
                      <div style={{ fontSize: 12, color: "rgba(226,240,226,0.4)", fontWeight: 600, marginTop: 6 }}>OmniCrops SwinV2+FPN</div>
                    </div>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${barW}%` }} />
                  </div>
                </div>

                {/* ─ Top-5 probabilities */}
                {topProbs.length > 0 && (
                  <div className="probs-section">
                    <div className="probs-title">Top Predictions</div>
                    {topProbs.map(({ cls, pct }, i) => {
                      const { disease: d } = parseDiseaseLabel(cls);
                      return (
                        <div className="prob-row" key={cls}>
                          <div className="prob-name" title={d}>{d}</div>
                          <div className="prob-track">
                            <div
                              className={`prob-fill ${i === 0 ? "top" : "rest"}`}
                              style={{ width: probsVisible ? `${Math.max(2, pct)}%` : "0%" }}
                            />
                          </div>
                          <div className="prob-pct">{pct.toFixed(1)}%</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ─ GPT Recommendations */}
                <div className="recs-section">
                  <div className="recs-title">
                    <span className="recs-title-text">Recommended Actions</span>
                    <span className="recs-badge">✨ GPT-4o-mini</span>
                  </div>
                  {recommendations.map((rec, i) => (
                    <div key={i} className={`rec-card ${recsVisible.includes(i) ? "visible" : ""}`}>
                      <div className="rec-num">{i + 1}</div>
                      <div className="rec-text">{rec}</div>
                    </div>
                  ))}
                  {recommendations.length === 0 && (
                    <div style={{ fontSize: 14, color: "rgba(226,240,226,0.35)", fontStyle: "italic" }}>No recommendations available.</div>
                  )}

                  <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="heatmap-nav-btn" onClick={() => navigate("/heatmap")}>🗺️ View Disease Heatmap</button>
                    <button className="heatmap-nav-btn" onClick={() => navigate("/history")}>📋 View History</button>
                  </div>

                  <button className="btn-restart" onClick={restart}>↩ Start New Diagnosis</button>
                </div>

                {/* ─ Inline heatmap */}
                <div className="heatmap-layout">
                  <div className="heatmap-header">
                    <div>
                      <div className="heatmap-kicker">Disease Spread</div>
                      <div className="heatmap-title">Regional Heatmap</div>
                    </div>
                  </div>
                  <div className="heatmap-shell">
                    {heatmapLoading
                      ? <div className="heatmap-loader"><div className="mini-spin" /> Loading heatmap data…</div>
                      : <div className="heatmap-map" ref={mapContainerRef} />
                    }
                    <div className="heatmap-legend">
                      <span>Low</span>
                      <div className="legend-bar" />
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}