import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { name: "Home", path: "/dashboard#top" },
  { name: "About", path: "#about" },
  { name: "Services", path: "#features" },
  { name: "Plant Diseases", path: "#crops" },
  { name: "Blog", path: "#testimonials" },
  { name: "Contact", path: "#footer" },
];

const INDIAN_LANGUAGES = [
  { code: "en",  name: "English",   native: "English"     },
  { code: "hi",  name: "Hindi",     native: "हिन्दी"      },
  { code: "bn",  name: "Bengali",   native: "বাংলা"       },
  { code: "te",  name: "Telugu",    native: "తెలుగు"      },
  { code: "mr",  name: "Marathi",   native: "मराठी"       },
  { code: "ta",  name: "Tamil",     native: "தமிழ்"       },
  { code: "gu",  name: "Gujarati",  native: "ગુજરાતી"     },
  { code: "kn",  name: "Kannada",   native: "ಕನ್ನಡ"       },
  { code: "ml",  name: "Malayalam", native: "മലയാളം"      },
  { code: "pa",  name: "Punjabi",   native: "ਪੰਜਾਬੀ"      },
  { code: "or",  name: "Odia",      native: "ଓଡ଼ିଆ"       },
  { code: "as",  name: "Assamese",  native: "অসমীয়া"     },
  { code: "ur",  name: "Urdu",      native: "اردو"        },
  { code: "sa",  name: "Sanskrit",  native: "संस्कृतम्"   },
];

function LoaderOverlay() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(240, 247, 240, 0.95)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 60,
          height: 60,
          margin: "0 auto 20px",
          border: "4px solid #d4ead0",
          borderTop: "4px solid #3a7d32",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{
          color: "#2d5a27",
          fontSize: 16,
          fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Loading ...
        </p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function changeLanguage(langCode) {
  // Show loader
  const loaderDiv = document.createElement('div');
  loaderDiv.id = 'language-loader';
  const root = ReactDOM.createRoot(loaderDiv);
  root.render(<LoaderOverlay />);
  document.body.appendChild(loaderDiv);

  setTimeout(() => {
    if (langCode === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      window.location.reload();
      return;
    }
    document.cookie = `googtrans=/en/${langCode}; path=/`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
    window.location.reload();
  }, 300);
}

function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => {
    const cookie = document.cookie.split("; ").find(c => c.startsWith("googtrans="));
    if (cookie) {
      const code = cookie.split("/").pop();
      return INDIAN_LANGUAGES.find(l => l.code === code) || INDIAN_LANGUAGES[0];
    }
    return INDIAN_LANGUAGES[0];
  });
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (lang) => {
    setActive(lang);
    setOpen(false);
    changeLanguage(lang.code);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "transparent",
          border: "1.5px solid #a8d5a0",
          borderRadius: 8, padding: "7px 12px",
          cursor: "pointer", fontSize: 13, fontWeight: 500,
          color: "#2d5a27", fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#e8f5e3"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        🌐 {active.native !== "English" ? active.native : active.name}
        <span style={{ fontSize: 10, marginLeft: 2 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "rgba(240,247,240,0.98)",
          backdropFilter: "blur(12px)",
          border: "1px solid #d4ead0",
          borderRadius: 12, padding: 8, zIndex: 200,
          width: 270,
          boxShadow: "0 8px 32px rgba(27,74,23,0.12)",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2,
        }}>
          <div style={{
            gridColumn: "1 / -1", fontSize: 10, color: "#5a9e4f",
            padding: "2px 8px 6px", letterSpacing: "0.08em",
            fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
          }}>
            Select Language
          </div>
          {INDIAN_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              style={{
                textAlign: "left",
                background: active.code === lang.code ? "#d4ead0" : "transparent",
                border: "none", borderRadius: 8,
                padding: "8px 10px", cursor: "pointer",
                display: "flex", flexDirection: "column", gap: 1,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (active.code !== lang.code) e.currentTarget.style.background = "#e8f5e3"; }}
              onMouseLeave={e => { if (active.code !== lang.code) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: active.code === lang.code ? "#1b4a17" : "#2d5a27", fontFamily: "'DM Sans', sans-serif" }}>
                {lang.name}
              </span>
              <span style={{ fontSize: 12, color: "#5a9e4f" }}>{lang.native}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (link) => {
    setActiveNav(link.name);
    if (link.path.startsWith("#")) {
      // Scroll to section
      const sectionId = link.path.substring(1);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(link.path);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      navigate("/");
    } finally {
      setLogoutLoading(false);
    }
  };

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

        .logout-btn {
          background: #dc2626;
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
        .logout-btn:hover {
          background: #b91c1c;
          transform: translateY(-1px);
        }
        .logout-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .logout-btn:disabled:hover {
          background: #dc2626;
          transform: none;
        }

        /* Google Translate ki default toolbar hide karo */
        .goog-te-banner-frame,
        .skiptranslate { display: none !important; }
        body { top: 0 !important; }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div id="google_translate_element" style={{ display: "none" }} />

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

          {/* Logo (Clickable to Home) */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
            title="Go to Home"
          >
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
                onClick={() => handleLinkClick(link)}
              >
                {link.name}
              </span>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LanguageSwitcher />
            <button className="nav-demo-btn" onClick={() => navigate("/analysis")}>
              Get A Demo
            </button>
            <button className="logout-btn" onClick={handleLogout} disabled={logoutLoading}>
              {logoutLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  Logging out...
                </div>
              ) : (
                'Logout'
              )}
            </button>
          </div>

        </div>
      </nav>
    </>
  );
}