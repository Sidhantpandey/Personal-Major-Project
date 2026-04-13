const crops = [
  { name: "Potato", diseases: "Early Blight, Late Blight" },
  { name: "Tomato", diseases: "Leaf Mold, Bacterial Spot" },
  { name: "Cotton", diseases: "Bollworm, Leaf Curl" },
  { name: "Grapes", diseases: "Powdery Mildew, Esca" },
];

const steps = [
  { step: "01", title: "Upload Your Leaf Image", desc: "Take or upload a clear photo of the affected plant leaf." },
  { step: "02", title: "AI Analysis", desc: "Our CNN model analyzes patterns and textures in the image." },
  { step: "03", title: "Instant Diagnosis", desc: "Receive disease identification with confidence score in seconds." },
  { step: "04", title: "Expert Recommendations", desc: "Get actionable treatment advice and prevention tips." },
];

export default function CropsSection() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .crop-card {
          background: white;
          border-radius: 14px;
          padding: 18px;
          border: 1px solid #d4ead0;
          transition: all 0.3s;
          font-family: 'DM Sans', sans-serif;
        }
        .crop-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(58,125,50,0.12);
        }
        .try-free-btn {
          background: white;
          color: #3a7d32;
          border: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          margin-top: 8px;
        }
        .try-free-btn:hover { background: #f0fff0; transform: translateY(-2px); }
      `}</style>

      <section style={{ padding: "80px 32px", background: "#f0f7f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>

          {/* LEFT: Crops */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#5a9e4f", fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
              SUPPORTED CROPS
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#1b4a17", lineHeight: 1.2, marginBottom: 20 }}>
              Disease Detection Across<br />Multiple Crop Species
            </h2>
            <p style={{ color: "#4a6e45", lineHeight: 1.7, marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>
              Our CNN models are specifically trained on four major crop species, achieving over 90% test accuracy. We're continuously expanding our crop library to support more agricultural needs.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {crops.map(({ name, diseases }) => (
                <div className="crop-card" key={name}>
                  <div style={{ fontWeight: 700, color: "#1b4a17", marginBottom: 4 }}>{name}</div>
                  <div style={{ fontSize: 12, color: "#6a9e60" }}>{diseases}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: How It Works */}
          <div style={{ background: "linear-gradient(145deg, #3a7d32, #5aab4e)", borderRadius: 24, padding: 40, color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: -30, left: -30, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, marginBottom: 24, position: "relative" }}>
              How It Works
            </h3>

            {steps.map(({ step, title, desc }) => (
              <div key={step} style={{ display: "flex", gap: 16, marginBottom: 22, position: "relative", fontFamily: "'DM Sans', sans-serif" }}>
                <div style={{ minWidth: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {step}
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>{desc}</div>
                </div>
              </div>
            ))}

            <button className="try-free-btn">Try For Free →</button>
          </div>

        </div>
      </section>
    </>
  );
}
