export default function CTAAndFooter() {
  return (
    <div id="footer">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .cta-primary-btn {
          background: #3a7d32;
          color: white;
          border: none;
          padding: 16px 40px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'DM Sans', sans-serif;
        }
        .cta-primary-btn:hover {
          background: #2d6128;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(58,125,50,0.35);
        }
        .cta-outline-btn {
          background: white;
          color: #3a7d32;
          border: 2px solid #3a7d32;
          padding: 14px 40px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'DM Sans', sans-serif;
        }
        .cta-outline-btn:hover {
          background: #f0fff0;
          transform: translateY(-2px);
        }
        .footer-link {
          font-size: 14px;
          opacity: 0.7;
          margin-bottom: 10px;
          cursor: pointer;
          transition: opacity 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .footer-link:hover { opacity: 1; }
      `}</style>

      {/* CTA SECTION */}
    
      {/* FOOTER */}
      <footer style={{ background: "#1b4a17", color: "white", padding: "48px 32px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>

            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.15)", borderRadius: 10 }} />
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 18 }}>AgriVision</div>
              </div>
              <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.7, maxWidth: 280, fontFamily: "'DM Sans', sans-serif" }}>
                AI-powered plant disease detection for sustainable farming. Built with CNN models achieving 90%+ accuracy.
              </p>
            </div>

            {/* Links */}
            {[
              { title: "Platform", links: ["Home", "Services", "Plant Diseases", "Analytics"] },
              { title: "Support",  links: ["Documentation", "Contact Us", "FAQ", "Blog"] },
              { title: "Tech Stack", links: ["React.js", "Flask/FastAPI", "MongoDB", "TensorFlow"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div style={{ fontWeight: 700, marginBottom: 16, color: "#6acd5a", fontFamily: "'DM Sans', sans-serif" }}>{title}</div>
                {links.map(link => (
                  <div key={link} className="footer-link">{link}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, opacity: 0.6, fontFamily: "'DM Sans', sans-serif" }}>
            <span>© 2025 AgriVision — KIET Group of Institutions.</span>
            <span>AI-Powered • Sustainable Farming</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
