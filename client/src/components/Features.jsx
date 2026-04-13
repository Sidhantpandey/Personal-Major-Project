const features = [
  {
    icon: "🔬",
    title: "AI-Powered Diagnosis",
    highlight: "Detect disease in seconds",
    highlightSub: "CNN accuracy above 90%",
    desc: "Simply photograph any affected leaf. Our deep learning model instantly analyzes visual patterns to identify the disease, severity level, and affected crop area.",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=260&fit=crop&crop=center",
    date: "~ Real-Time",
  },
  {
    icon: "📊",
    title: "Smart Analytics",
    highlight: "Track every diagnosis",
    highlightSub: "seasonal trends & insights",
    desc: "Your personalized dashboard shows disease frequency, crop health scores, and predictive alerts — helping you make smarter farming decisions every season.",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=260&fit=crop&crop=center",
    date: "~ Full History",
  },
  {
    icon: "🌿",
    title: "Crop-Specific Advice",
    highlight: "Tailored treatment plans",
    highlightSub: "for Potato, Tomato, Cotton & Grapes",
    desc: "After each diagnosis, receive expert-curated treatment steps, pesticide recommendations, and prevention tips — all specific to your crop type and disease.",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=260&fit=crop&crop=center",
    date: "~ Expert Backed",
  },
];

export default function FeaturesSection() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .fc-section {
          background: #f0f7f0;
          padding: 90px 32px;
        }

        .fc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .fc-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #dff0da;
          box-shadow: 0 4px 24px rgba(58,125,50,0.07);
          transition: all 0.35s ease;
          position: relative;
          cursor: pointer;
        }
        .fc-card:hover {
          transform: translateY(-12px);
          border-color: #5aab4e;
          box-shadow: 0 24px 56px rgba(58,125,50,0.16);
        }

        /* IMAGE */
        .fc-img {
          position: relative;
          height: 210px;
          overflow: hidden;
        }
        .fc-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.45s ease;
          filter: brightness(0.82) saturate(0.9);
        }
        .fc-card:hover .fc-img img {
          transform: scale(1.08);
          filter: brightness(0.92) saturate(1.05);
        }
        .fc-img::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 65%;
          background: linear-gradient(to top, black 2%, transparent 100%);
        }
     

        /* BODY */
        .fc-body {
          padding: 4px 24px 24px;
        }
        .fc-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 800;
          color: #1b4a17;
          margin-bottom: 5px;
        }
        .fc-hl {
          font-size: 13px;
          font-weight: 700;
          color: #3a7d32;
          font-family: 'DM Sans', sans-serif;
        }
        .fc-hl-sub {
          font-size: 12px;
          color: #7aac6e;
          font-style: italic;
          margin-bottom: 14px;
          font-family: 'DM Sans', sans-serif;
        }
        .fc-desc {
          font-size: 14px;
          color: #5a7a55;
          line-height: 1.7;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 20px;
        }

        /* FOOTER */
        .fc-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid #e8f5e3;
        }
        .fc-date {
          font-size: 12px;
          color: #9aba94;
          font-style: italic;
          font-family: 'DM Sans', sans-serif;
        }
        .fc-tag {
          display: flex; align-items: center; gap: 5px;
          background: #e8f5e3;
          border: 1px solid #c8e6c3;
          border-radius: 20px;
          padding: 5px 13px;
          font-size: 12px;
          font-weight: 600;
          color: #3a7d32;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.25s;
        }
        .fc-card:hover .fc-tag {
          background: linear-gradient(135deg, #3a7d32, #5aab4e);
          color: white;
          border-color: transparent;
        }
          .fc-card{
          border: 8px}
        .fc-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #3a7d32;
          transition: background 0.25s;
          flex-shrink: 0;
        }
        .fc-card:hover .fc-dot { background: white; }
      `}</style>

      <section className="fc-section">

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#5a9e4f", fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>
            WHAT WE OFFER
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#1b4a17", lineHeight: 1.2 }}>
            Built for the Fields,<br />Powered by AI
          </h2>
        </div>

        {/* Cards */}
        <div className="fc-grid">
          {features.map(({ icon, title, highlight, highlightSub, desc, image, date }) => (
            <div className="fc-card" key={title}>

              {/* Top: Image */}
              <div className="fc-img">
                <img src={image} alt={title} />
             
              </div>

              {/* Bottom: Content */}
              <div className="fc-body">
                <div className="fc-title">{title}</div>
               
                <p className="fc-desc">{desc}</p>

                <div className="fc-foot">
                  <span className="fc-date">{date}</span>
                  <div className="fc-tag">
                    <div className="fc-dot" />
                    AgriVision
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </section>
    </>
  );
}
