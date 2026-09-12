import { useNavigate } from "react-router-dom";

const steps = [
  {
    n: "1",
    title: "Create an account",
    text: "Sign up once, then log in whenever you need a diagnosis. Your reports stay tied to your profile.",
  },
  {
    n: "2",
    title: "Tell us about the crop",
    text: "Choose the crop, mark visible symptoms, and add a short note if something unusual happened in the field.",
  },
  {
    n: "3",
    title: "Upload a leaf photo",
    text: "A clear, well-lit photo is enough. Our CNN model compares the leaf against trained disease patterns.",
  },
  {
    n: "4",
    title: "Read the result and map",
    text: "You get a disease label, confidence score, and care tips. Open the heatmap to see where similar risk is clustering nearby.",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .about-page {
          background: #f0f7f0;
          min-height: calc(100dvh - 74px);
          padding: 48px 24px 72px;
          font-family: 'DM Sans', sans-serif;
        }
        .about-page-inner { max-width: 860px; margin: 0 auto; }
        .about-page-kicker {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #5a9e4f;
          margin-bottom: 10px;
        }
        .about-page-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 46px);
          font-weight: 800;
          color: #1b4a17;
          line-height: 1.15;
          margin-bottom: 16px;
        }
        .about-page-lead {
          font-size: 16px;
          color: #4a6e45;
          line-height: 1.8;
          margin-bottom: 36px;
          max-width: 680px;
        }
        .about-step {
          background: white;
          border: 1.5px solid #d4ead0;
          border-radius: 16px;
          padding: 20px 22px;
          display: flex;
          gap: 16px;
          margin-bottom: 14px;
        }
        .about-step-n {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #3a7d32;
          color: white;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .about-step h3 { color: #1b4a17; font-size: 17px; margin-bottom: 6px; }
        .about-step p { color: #4a6e45; font-size: 14px; line-height: 1.7; }
        .about-page-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
        .about-page-btn {
          background: #3a7d32;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 22px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .about-page-btn.ghost {
          background: white;
          color: #3a7d32;
          border: 2px solid #3a7d32;
        }
      `}</style>

      <section className="about-page">
        <div className="about-page-inner">
          <div className="about-page-kicker">About AgriVision</div>
          <h1 className="about-page-title">How this website works</h1>
          <p className="about-page-lead">
            AgriVision helps farmers check plant health quickly. Photograph a leaf, let the AI model read the signs of disease, then use the heatmap to understand whether that risk is isolated or spreading in your area.
          </p>

          {steps.map((step) => (
            <div className="about-step" key={step.n}>
              <div className="about-step-n">{step.n}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}

          <div className="about-page-actions">
            <button className="about-page-btn" onClick={() => navigate("/analysis")}>Start a diagnosis</button>
            <button className="about-page-btn ghost" onClick={() => navigate("/heatmap")}>Open heatmap</button>
          </div>
        </div>
      </section>
    </>
  );
}
