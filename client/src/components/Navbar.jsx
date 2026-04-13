import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { name: "Home", path: "/dashboard" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Plant Diseases", path: "/plant-diseases" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .nav-link {
          color: #2d5a27;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 6px 4px;
          position: relative;
          transition: color 0.2s;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 2px;
          background: #3a7d32;
          transition: width 0.3s;
        }
        .nav-link:hover::after,
        .nav-link.active::after { width: 100%; }

        .nav-demo-btn {
          background: #1b4a17;
          color: white;
          border: none;
          padding: 11px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-demo-btn:hover {
          background: #2d6128;
          transform: translateY(-1px);
        }
      `}</style>

      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(240,247,240,0.95)" : "rgba(240,247,240,0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid #d4ead0" : "1px solid transparent",
        transition: "all 0.3s",
        padding: "14px 0",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #3a7d32, #6acd5a)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20 }}>🌿</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 18, color: "#1b4a17", lineHeight: 1 }}>AgriVision</div>
              <div style={{ fontSize: 10, color: "#5a9e4f", letterSpacing: 1 }}>AI PLANT HEALTH</div>
            </div>
          </div>

          {/* Nav Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {navLinks.map(link => (
  <span
    key={link.name}
    className={`nav-link ${activeNav === link.name ? "active" : ""}`}
    onClick={() => {
      setActiveNav(link.name);
      navigate(link.path);
    }}
  >
    {link.name}
  </span>
))}
          </div>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 20, cursor: "pointer", color: "#3a7d32" }}>🔍</span>
            <span style={{ fontSize: 20, cursor: "pointer", color: "#3a7d32" }}>👤</span>
            <button 
              className="nav-demo-btn" 
              onClick={() => navigate("/analysis")}
            >
              Get A Demo
            </button>
            {isAuthenticated && (
              <button
                className="nav-demo-btn"
                style={{ background: '#e53e3e' }}
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </button>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}
