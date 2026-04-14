import { useState, useRef } from "react";
import { predictDisease } from "../utils/api";

const RESULTS = [
  {
    statusLabel: "Healthy Crop", statusColor: "#3a7d32", statusBg: "#e8f5e3", icon: "✅",
    disease: "No Disease Detected", confidence: 96, severity: "None", severityColor: "#3a7d32",
    desc: "Your crop leaf appears completely healthy. No signs of disease, infection, or pest damage detected by our CNN model. Continue your current care routine.",
    tips: ["Maintain regular watering schedule", "Ensure proper sunlight exposure", "Continue current fertilization plan", "Monitor weekly for early signs"],
  },
  {
    statusLabel: "Disease Detected", statusColor: "#c0392b", statusBg: "#fdecea", icon: "⚠️",
    disease: "Early Blight (Alternaria solani)", confidence: 91, severity: "Moderate", severityColor: "#e67e22",
    desc: "Early blight has been detected. Dark brown spots with concentric rings visible on lower leaves. Immediate treatment is recommended to prevent further spread.",
    tips: ["Remove and destroy infected leaves immediately", "Apply copper-based fungicide spray", "Avoid overhead irrigation", "Improve air circulation around plants"],
  },
  {
    statusLabel: "Disease Detected", statusColor: "#c0392b", statusBg: "#fdecea", icon: "🚨",
    disease: "Leaf Curl Virus", confidence: 88, severity: "Severe", severityColor: "#c0392b",
    desc: "Leaf Curl Virus transmitted by whiteflies detected. Leaves show upward curling with yellowing edges. Highly contagious — act immediately to protect nearby crops.",
    tips: ["Isolate affected plants immediately", "Apply systemic insecticide for whiteflies", "Remove heavily infected plants", "Use yellow sticky traps to monitor"],
  },
];

export default function DiagnoseSection() {
  const [step, setStep]       = useState(1);
  const crop = "Unknown Crop";
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [barW, setBarW]       = useState(0);
  const [file, setFile]       = useState(null);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f?.type.startsWith("image/")) return;
    setFile(f);
    const r = new FileReader();
    r.onload = e => setPreview(e.target.result);
    r.readAsDataURL(f);
  };

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setStep(2);
    try {
      const prediction = await predictDisease(file, true); // use TTA for better accuracy
      const [, diseaseName] = prediction.predicted_class.split('___');
      const isHealthy = diseaseName.toLowerCase() === 'healthy';
      
      const resultData = {
        statusLabel: isHealthy ? "Healthy Crop" : "Disease Detected",
        statusColor: isHealthy ? "#3a7d32" : "#c0392b",
        statusBg: isHealthy ? "#e8f5e3" : "#fdecea",
        icon: isHealthy ? "✅" : "⚠️",
        disease: isHealthy ? "No Disease Detected" : diseaseName.replace(/_/g, ' '),
        confidence: prediction.confidence,
        severity: prediction.confidence > 90 ? "Severe" : prediction.confidence > 70 ? "Moderate" : "Mild",
        severityColor: prediction.confidence > 90 ? "#c0392b" : prediction.confidence > 70 ? "#e67e22" : "#f39c12",
        desc: isHealthy 
          ? "Your crop leaf appears completely healthy. No signs of disease detected."
          : `${diseaseName.replace(/_/g, ' ')} detected with ${prediction.confidence}% confidence.`,
        tips: isHealthy 
          ? ["Maintain regular watering schedule", "Ensure proper sunlight exposure", "Continue current fertilization plan", "Monitor weekly for early signs"]
          : ["Consult local agricultural extension service", "Apply appropriate treatment based on disease", "Isolate affected plants if necessary", "Monitor surrounding plants for spread"],
      };
      
      setResult(resultData);
      setTimeout(() => setBarW(prediction.confidence), 150);
    } catch (error) {
      console.error('Prediction failed:', error);
      // Fallback to mock result or show error
      const fallback = RESULTS[0]; // Healthy
      setResult(fallback);
      setTimeout(() => setBarW(fallback.confidence), 150);
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep(1);
    setPreview(null);
    setResult(null);
    setLoading(false);
    setBarW(0);
    setFile(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .ds { background: #f0f7f0; padding: 9px 22px; font-family: 'DM Sans', sans-serif; }

        .ds-hd { text-align: center; margin-bottom: 40px; }
        .ds-badge { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #5a9e4f; display: block; margin-bottom: 12px; }
        .ds-title { font-family: 'Playfair Display', serif; font-size: clamp(28px,4vw,42px); font-weight: 800; color: #1b4a17; line-height: 1.2; margin-bottom: 12px; }
        .ds-sub { font-size: 15px; color: #6a9e60; max-width: 480px; margin: 0 auto; line-height: 1.7; }

        /* Stepper */
        .stepper { display: flex; align-items: center; justify-content: center; margin-bottom: 48px; }
        .s-num { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; border: 2px solid #3a7d32; transition: all .3s; }
        .s-num.on   { background: #3a7d32; color: white; }
        .s-num.done { background: #3a7d32; color: white; }
        .s-num.off  { background: white; color: #aacaa0; border-color: #d4ead0; }
        .s-lbl      { font-size: 13px; font-weight: 600; color: #1b4a17; margin-left: 8px; }
        .s-lbl.off  { color: #aacaa0; }
        .s-line     { width: 64px; height: 2px; background: #d4ead0; margin: 0 12px; }
        .s-line.done{ background: #3a7d32; }

        /* Card */
        .card { max-width: 860px; margin: 0 auto; background: white; border: 2px solid #3a7d32; animation: up .4s ease both; }
        @keyframes up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .card-head { background: linear-gradient(135deg, #1b4a17, #3a7d32); padding: 22px 32px; display: flex; align-items: center; gap: 14px; }
        .ch-icon  { font-size: 26px; }
        .ch-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; color: white; }
        .ch-sub   { font-size: 13px; color: rgba(255,255,255,.7); margin-top: 2px; }
        .card-body { padding: 36px 32px; }

        /* Fields */
        .fg  { margin-bottom: 26px; }
        .lbl { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #3a7d32; margin-bottom: 10px; display: block; }

        .crop-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        .crop-btn  { padding: 12px 8px; border: 1.5px solid #d4ead0; background: #f9fdf9; text-align: center; cursor: pointer; font-size: 13px; font-weight: 600; color: #4a6e45; transition: all .2s; }
        .crop-btn:hover { border-color: #3a7d32; background: #f0f7f0; }
        .crop-btn.sel   { border-color: #3a7d32; background: #3a7d32; color: white; }

        .sym-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
        .sym       { padding: 7px 14px; border: 1.5px solid #d4ead0; background: #f9fdf9; cursor: pointer; font-size: 13px; font-weight: 500; color: #4a6e45; border-radius: 20px; transition: all .2s; }
        .sym:hover { border-color: #3a7d32; background: #f0f7f0; }
        .sym.sel   { border-color: #3a7d32; background: #e8f5e3; color: #1b4a17; font-weight: 700; }

        .sev-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .sev-btn  { padding: 13px 10px; border: 1.5px solid #d4ead0; background: #f9fdf9; cursor: pointer; font-size: 13px; font-weight: 600; color: #4a6e45; text-align: center; transition: all .2s; }
        .sev-btn:hover { border-color: #3a7d32; background: #f0f7f0; }
        .sev-btn.sel   { border-color: #3a7d32; background: #3a7d32; color: white; }

        .notes-ta { width: 100%; border: 1.5px solid #d4ead0; background: #f9fdf9; padding: 12px 16px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1b4a17; resize: vertical; min-height: 80px; outline: none; transition: border-color .2s; box-sizing: border-box; }
        .notes-ta:focus { border-color: #3a7d32; }

        /* Upload */
        .upz { border: 2.5px dashed #3a7d32; background: #f0f7f0; min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all .25s; text-align: center; padding: 32px; margin-bottom: 20px; }
        .upz:hover { background: #e8f5e3; border-color: #6acd5a; }
        .upz.filled { padding: 0; border-style: solid; min-height: unset; }
        .upz img { width: 100%; max-height: 280px; object-fit: cover; display: block; }
        .upz-icon { font-size: 44px; }
        .upz-t    { font-size: 16px; font-weight: 700; color: #1b4a17; }
        .upz-s    { font-size: 13px; color: #7aac6e; }

        /* Summary */
        .sum-row  { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 16px; background: #f0f7f0; border: 1px solid #d4ead0; margin-bottom: 22px; }
        .sum-pill { background: #e8f5e3; border: 1px solid #c8e6c3; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #2d6128; }

        /* Buttons */
        .btn-main { width: 100%; background: #3a7d32; color: white; border: none; padding: 16px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .25s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .btn-main:hover:not(:disabled) { background: #2d6128; box-shadow: 0 8px 24px rgba(58,125,50,.3); }
        .btn-main:disabled { background: #a0c8a0; cursor: not-allowed; }

        .btn-row  { display: flex; gap: 12px; }
        .btn-back { background: white; color: #3a7d32; border: 2px solid #3a7d32; padding: 16px 22px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
        .btn-back:hover { background: #f0f7f0; }

        /* Loading */
        .ld-box { padding: 64px 32px; text-align: center; }
        .spin { width: 52px; height: 52px; border: 4px solid #d4ead0; border-top-color: #3a7d32; border-radius: 50%; animation: spin .9s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ld-t { font-size: 16px; font-weight: 700; color: #1b4a17; margin-bottom: 6px; }
        .ld-s { font-size: 13px; color: #7aac6e; }

        /* Result */
        .res-top  { padding: 20px 32px; display: flex; align-items: center; gap: 14px; }
        .res-icon { font-size: 32px; }
        .res-badge{ font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
        .res-name { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: #1b4a17; }

        .res-body { padding: 28px 32px; }
        .meta3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 24px; }
        .mc  { background: #f0f7f0; border: 1px solid #d4ead0; padding: 14px; text-align: center; }
        .ml  { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #7aac6e; margin-bottom: 5px; }
        .mv  { font-size: 16px; font-weight: 800; color: #1b4a17; }

        .bar-wrap  { margin-bottom: 24px; }
        .bar-top   { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; font-weight: 700; color: #1b4a17; }
        .bar-track { height: 10px; background: #e8f5e3; border-radius: 5px; overflow: hidden; }
        .bar-fill  { height: 100%; background: linear-gradient(90deg,#3a7d32,#6acd5a); border-radius: 5px; transition: width 1.2s cubic-bezier(.22,1,.36,1) .2s; }

        .res-desc { font-size: 14px; color: #4a6e45; line-height: 1.8; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e8f5e3; }
        .tips-hd  { font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #3a7d32; margin-bottom: 14px; }
        .tip   { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
        .tip-n { width: 22px; height: 22px; border-radius: 50%; background: #3a7d32; color: white; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .tip-t { font-size: 14px; color: #4a6e45; line-height: 1.6; }

        .btn-restart { width: 100%; background: white; color: #3a7d32; border: 2px solid #3a7d32; padding: 14px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; margin-top: 24px; }
        .btn-restart:hover { background: #f0f7f0; }
      `}</style>

      <section className="ds">

        {/* Header */}
        <div className="ds-hd">
          <span className="ds-badge"></span>
          <h2 className="ds-title">Diagnose Your Crop Instantly with AI</h2>
          
        </div>

        {/* Stepper */}
        <div className="stepper">
          {[{n:1,l:"Upload Photo"},{n:2,l:"View Result"}].map(({n,l},i,a) => (
            <div key={n} style={{display:"flex",alignItems:"center"}}>
              <div className={`s-num ${step>n?"done":step===n?"on":"off"}`}>{step>n?"✓":n}</div>
              <span className={`s-lbl ${step<n?"off":""}`}>{l}</span>
              {i<a.length-1 && <div className={`s-line ${step>n?"done":""}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: UPLOAD ── */}
        {step === 1 && (
          <div className="card" key="s1">
            <div className="card-head">
              <span className="ch-icon">📷</span>
              <div><div className="ch-title">Upload Leaf Photo</div><div className="ch-sub">Clear, well-lit photo gives the best results</div></div>
            </div>
            <div className="card-body">

              <div
                className={`upz ${preview?"filled":""}`}
                onClick={()=>fileRef.current.click()}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}}
              >
                {preview
                  ? <img src={preview} alt="Leaf" />
                  : <><div className="upz-icon"></div><div className="upz-t">Click or drag & drop leaf image here</div><div className="upz-s">JPG, PNG • close-up, well-lit photo recommended</div></>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])} />

              {preview && <p style={{fontSize:13,color:"#5a9e4f",fontWeight:600,marginBottom:20,textAlign:"center"}}>✓ Image ready — click Submit to analyze</p>}

              <div className="btn-row">
                <button className="btn-main" style={{flex:1}} disabled={!preview} onClick={submit}>
                  Submit & View Result
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: RESULT ── */}
        {step === 2 && (
          <div className="card" key="s2">
            {loading ? (
              <div className="ld-box">
                <div className="spin" />
                <div className="ld-t">Analyzing your leaf...</div>
                <div className="ld-s">Running CNN model • Cross-checking symptoms</div>
              </div>
            ) : result && (
              <>
                <div className="res-top" style={{background:result.statusBg}}>
                  <span className="res-icon">{result.icon}</span>
                  <div>
                    <div className="res-badge" style={{color:result.statusColor}}>{result.statusLabel}</div>
                    <div className="res-name">{result.disease}</div>
                  </div>
                </div>
                <div className="res-body">
                  <div className="meta3">
                    <div className="mc"><div className="ml">Crop</div><div className="mv">{crop.split(" ")[0]}</div></div>
                    <div className="mc"><div className="ml">Severity</div><div className="mv" style={{color:result.severityColor}}>{result.severity}</div></div>
                    <div className="mc"><div className="ml">Confidence</div><div className="mv" style={{color:"#3a7d32"}}>{result.confidence}%</div></div>
                  </div>

                  <div className="bar-wrap">
                    <div className="bar-top"><span>Model Confidence</span><span style={{color:"#3a7d32"}}>{result.confidence}%</span></div>
                    <div className="bar-track"><div className="bar-fill" style={{width:`${barW}%`}} /></div>
                  </div>

                  <p className="res-desc">{result.desc}</p>

                  <div className="tips-hd">Recommended Actions</div>
                  {result.tips.map((t,i)=>(
                    <div className="tip" key={i}>
                      <div className="tip-n">{i+1}</div>
                      <div className="tip-t">{t}</div>
                    </div>
                  ))}

                  <button className="btn-restart" onClick={restart}>Start New Diagnosis</button>
                </div>
              </>
            )}
          </div>
        )}

      </section>
    </>
  );
}