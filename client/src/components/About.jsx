export default function AboutSection() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

        .about-section {
          background: #f0f7f0;
          padding: 90px 32px;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── TOP: Image + Text row ── */
        .about-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto 64px;
        }

        /* Left: image stack */
        .about-img-wrap {
          position: relative;
        }
        .about-main-img {
          width: 100%;
          height: 360px;
          object-fit: cover;
          display: block;
          border: 3px solid #3a7d32;
        }

        /* Floating circle badge */
        .about-circle-badge {
          position: absolute;
          top: -28px;
          right: -28px;
          width: 140px;
          height: 140px;
          background: white;
          border-radius: 50%;
          border: 3px solid #d4ead0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: 0 8px 32px rgba(58,125,50,0.15);
          padding: 12px;
        }
        .about-circle-badge .since-label {
          font-size: 12px;
          font-weight: 600;
          color: #5a9e4f;
          letter-spacing: 0.5px;
          line-height: 1.3;
        }
        .about-circle-badge .since-stars {
          color: #3a7d32;
          font-size: 10px;
          letter-spacing: 2px;
          margin: 4px 0;
        }
        .about-circle-badge .since-year {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 800;
          color: #1b4a17;
          line-height: 1;
        }

        /* Floating stat bar */
        .about-stat-bar {
          position: absolute;
          bottom: -20px;
          left: 20px;
          background: #1b4a17;
          color: white;
          padding: 14px 22px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 8px 28px rgba(27,74,23,0.35);
        }
        .about-stat-bar .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 800;
          color: #6acd5a;
          line-height: 1;
        }
        .about-stat-bar .stat-icon {
          font-size: 26px;
        }
        .about-stat-bar .stat-label {
          font-size: 13px;
          font-weight: 600;
          line-height: 1.3;
          opacity: 0.9;
        }

        /* Right: text content */
        .about-text-wrap {
          padding-top: 16px;
        }
        .about-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #e8f5e3;
          border: 1.5px solid #3a7d32;
          border-radius: 6px;
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 700;
          color: #2d6128;
          margin-bottom: 22px;
          letter-spacing: 0.3px;
        }
        .about-tag span { font-size: 16px; }

        .about-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 900;
          color: #1b4a17;
          line-height: 1.15;
          margin-bottom: 22px;
        }

        .about-desc {
          font-size: 15px;
          color: #4a6e45;
          line-height: 1.8;
          margin-bottom: 36px;
          max-width: 480px;
        }

        .about-read-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #3a7d32;
          color: white;
          border: none;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          border-radius: 6px;
          transition: all 0.25s;
        }
        .about-read-btn:hover {
          background: #2d6128;
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(58,125,50,0.3);
        }
        .about-read-btn .btn-arrow {
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          transition: background 0.2s;
        }
        .about-read-btn:hover .btn-arrow {
          background: rgba(255,255,255,0.35);
        }

        /* ── BOTTOM: 3 award/feature cards ── */
        .about-bottom {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 24px;
          max-width: 1100px;
          margin: 56px auto 0;
          align-items: center;
        }

        .about-feat-card {
          background: white;
          border: 1.5px solid #d4ead0;
          padding: 28px 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          transition: all 0.3s;
          cursor: default;
        }
        .about-feat-card:hover {
          border-color: #3a7d32;
          box-shadow: 0 8px 32px rgba(58,125,50,0.12);
          transform: translateY(-4px);
        }
        .feat-icon-circle {
          width: 60px; height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1b4a17, #3a7d32);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          flex-shrink: 0;
          border: 2px dashed #6acd5a;
        }
        .feat-card-title {
          font-weight: 700;
          color: #1b4a17;
          font-size: 15px;
          margin-bottom: 4px;
        }
        .feat-card-sub {
          font-size: 13px;
          color: #7aac6e;
        }

        /* Center award badge */
        .about-award-center {
          text-align: center;
          padding: 0 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .award-laurel {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 28px;
        }
        .award-title {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 800;
          color: #1b4a17;
          line-height: 1.3;
          text-align: center;
          max-width: 180px;
        }
        .award-stars {
          color: #3a7d32;
          font-size: 11px;
          letter-spacing: 3px;
        }
        .award-sub {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #5a9e4f;
          text-transform: uppercase;
        }
      `}</style>

      <section className="about-section">

        {/* TOP ROW */}
        <div className="about-top">

          {/* Left: Image with overlays */}
          <div className="about-img-wrap">
            <img
              className="about-main-img"
              src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=700&h=460&fit=crop&crop=center"
              alt="Farmer in field with AgriVision"
            />

            {/* Circle badge top-right */}
            <div className="about-circle-badge">
              <span className="since-label">Diagnosing<br/>Since</span>
              <span className="since-stars">★★★★★</span>
              <span className="since-year">2024</span>
            </div>

            {/* Stat bar bottom-left */}
            <div className="about-stat-bar">
              <span className="stat-num">90%+</span>
              <span className="stat-icon">🌿</span>
              <span className="stat-label">CNN<br/>Accuracy</span>
            </div>
          </div>

          {/* Right: Text */}
          <div className="about-text-wrap">
            <div className="about-tag">
              About Us
            </div>

            <h2 className="about-heading">
              AI-Powered Care<br />for Every Crop
            </h2>

            <p className="about-desc">
              AgriVision bridges the gap between cutting-edge machine learning research and real-world farming. Our platform empowers farmers and agri-professionals to detect crop diseases instantly — just photograph a leaf and our CNN model does the rest. Built for the fields, trusted by thousands.
            </p>

            <button className="about-read-btn">
              <div className="btn-arrow">→</div>
              Read More
            </button>
          </div>

        </div>

        {/* BOTTOM ROW: 3 cards */}
        <div className="about-bottom">

          <div className="about-feat-card">
            <div className="feat-icon-circle" />
            <div>
              <div className="feat-card-title">Instant AI Diagnosis</div>
              <div className="feat-card-sub">Results in under 2 seconds.</div>
            </div>
          </div>

          {/* Center award */}
          <div className="about-award-center">
            <div className="award-laurel"><span style={{fontSize:14}}>Award</span></div>
            <div className="award-title">Excellence in AgriTech Innovation</div>
            <div className="award-stars">★★★★★</div>
            <div className="award-sub">KIET — 2025</div>
          </div>

          <div className="about-feat-card">
            <div className="feat-icon-circle" />
            <div>
              <div className="feat-card-title">Sustainable Farming</div>
              <div className="feat-card-sub">Eco-conscious crop care.</div>
            </div>
          </div>

        </div>

      </section>
    </>
  );
}