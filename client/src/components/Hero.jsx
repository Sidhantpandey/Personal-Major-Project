const LeafIcon = ({ style, className }) => (
  <svg viewBox="0 0 100 100" style={style} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 90 C30 40 70 10 95 5 C90 30 70 60 50 75 C60 55 75 35 85 15 C65 25 40 50 10 90Z" fill="currentColor" opacity="0.6" />
  </svg>
);

export default function HeroSection() {
  return (
    <>
      <style>{`        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 800;
          color: #1b4a17;
          line-height: 1.15;
          animation: fadeUp 0.8s ease both;
        }
        .badge-tag {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #5a9e4f;
          font-family: 'DM Sans', sans-serif;
          animation: fadeUp 0.6s ease both;
        }
        .hero-sub {
          color: #4a6e45;
          font-size: 16px;
          line-height: 1.7;
          max-width: 440px;
          font-family: 'DM Sans', sans-serif;
          animation: fadeUp 1s ease both;
          animation-delay: 0.2s;
        }
        .btn-primary {
          background: #3a7d32;
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary:hover {
          background: #2d6128;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(58,125,50,0.35);
        }
        .btn-outline {
          background: white;
          color: #3a7d32;
          border: 2px solid #3a7d32;
          padding: 12px 28px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-outline:hover {
          background: #f0fff0;
          transform: translateY(-2px);
        }
        .tag-pill {
          background: #e8f5e3;
          color: #2d5a27;
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 500;
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
        }
        .leaf-float { position: absolute; color: #3a7d32; opacity: 0.12; pointer-events: none; }
        .leaf-float-1 { top: 8%; right: 18%; width: 80px; transform: rotate(-20deg); animation: float1 6s ease-in-out infinite; }
        .leaf-float-2 { top: 60%; left: 5%; width: 55px; transform: rotate(40deg); animation: float2 8s ease-in-out infinite; }
        .leaf-float-3 { bottom: 12%; right: 8%; width: 65px; transform: rotate(-10deg); animation: float1 7s ease-in-out infinite 1s; }
        .dashed-ring {
          position: absolute; top: -20px; right: -20px;
          width: 300px; height: 320px;
          border: 2.5px dashed #3a7d32;
          border-radius: 50%; opacity: 0.3;
          animation: spin 20s linear infinite;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float1 { 0%,100% { transform: rotate(-20deg) translateY(0); } 50% { transform: rotate(-20deg) translateY(-14px); } }
        @keyframes float2 { 0%,100% { transform: rotate(40deg) translateY(0); } 50% { transform: rotate(40deg) translateY(-10px); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ background: "#f0f7f0", width: "100%" }}>
      <section style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "60px 32px 80px",
        position: "relative",
        minHeight: "calc(100vh - 80px)",
        display: "flex", alignItems: "center",
      }}>
        {/* Floating Leaves */}
        <LeafIcon className="leaf-float leaf-float-1" />
        <LeafIcon className="leaf-float leaf-float-2" />
        <LeafIcon className="leaf-float leaf-float-3" />

        {/* Radial glow */}
        <div style={{ position: "absolute", top: "10%", right: "10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(106,205,90,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", width: "100%" }}>

          {/* LEFT: Content */}
          <div>
            <div className="badge-tag" style={{ marginBottom: 16 }}>AI & MACHINE LEARNING</div>

            <h1 className="hero-title" style={{ marginBottom: 20 }}>
              Discover Plant Health<br />
              <span style={{ color: "#3a7d32" }}>with AgriVision!</span>
            </h1>

            <p className="hero-sub" style={{ marginBottom: 16 }}>
              Empowering farmers and agri-professionals through AI-powered leaf disease detection. Upload a photo, get instant results.
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
              {["Potato", "Tomato", "Cotton", "Grapes"].map(crop => (
                <span className="tag-pill" key={crop}>{crop}</span>
              ))}
            </div>

            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 40 }}>
              <button className="btn-primary">Get Started</button>
              <button className="btn-outline">Watch Demo</button>
            </div>

            {/* Trust Stats */}
          
          </div>

          {/* RIGHT: Image blob */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
            <div style={{ position: "relative" }}>
              <div className="dashed-ring" />
              <div style={{
                width: 360, height: 420,
                background: "linear-gradient(145deg, #3a7d32, #6acd5a)",
                borderRadius: "40% 60% 60% 40% / 50% 40% 60% 50%",
                overflow: "hidden",
              }}>
                <img
                  src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=480&fit=crop&crop=center"
                  alt="Farmer examining plant health"
                  style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply" }}
                />
              </div>

              {/* Diagnosis card */}
              <div style={{
                position: "absolute", bottom: 30, left: -60,
                background: "white", borderRadius: 14, padding: "14px 18px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                display: "flex", alignItems: "center", gap: 12,
                minWidth: 200, animation: "fadeUp 1.2s ease both 0.5s",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e8f5e3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔬</div>
                <div>
                  <div style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>DIAGNOSIS</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1b4a17" }}>Leaf Healthy ✓</div>
                </div>
              </div>

              {/* Accuracy card */}
              <div style={{
                position: "absolute", top: 30, right: -50,
                background: "#3a7d32", color: "white", borderRadius: 14, padding: "12px 18px",
                boxShadow: "0 8px 32px rgba(58,125,50,0.4)",
                textAlign: "center", animation: "fadeUp 1.2s ease both 0.7s",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>92%</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>CNN Accuracy</div>
              </div>
            </div>
          </div>

        </div>
      </section>
      </div>
    </>
  );
}
