import { useState } from "react";

const testimonials = [
  {
    name: "Rajesh D.",
    role: "Wheat Farmer, Punjab",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh&backgroundColor=b6e3f4",
    quote: "I'm a beginner in farming and often struggled with identifying plant diseases. AgriVision made it so easy! Just a quick photo upload and I got a diagnosis within seconds.",
  },
  {
    name: "Priya M.",
    role: "Gardening Enthusiast",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=d1fae5",
    quote: "AgriVision has been a game-changer for me! I accurately diagnosed a fungal infection in my tomatoes. The expert consultation afterward was incredibly helpful.",
  },
  {
    name: "David L.",
    role: "Plant Collector",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=fde68a",
    quote: "I've been using AgriVision for a while now and I'm impressed by its accuracy and efficiency. Consulting with knowledgeable botanists has elevated my plant care game.",
  },
  {
    name: "Sunita K.",
    role: "Cotton Grower, Gujarat",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita&backgroundColor=fecaca",
    quote: "Cotton leaf curl was destroying my yield every year. AgriVision detected it early and the treatment advice actually worked. My harvest this year was the best in a decade.",
  },
  {
    name: "Arjun P.",
    role: "Agricultural Researcher",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=c7d2fe",
    quote: "The CNN model accuracy is genuinely impressive. I use AgriVision as a quick first screening tool before detailed lab analysis. It saves us hours every week.",
  },
  {
    name: "Meena R.",
    role: "Tomato Farmer, Maharashtra",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meena&backgroundColor=a7f3d0",
    quote: "Previously I had to wait days for a lab report. Now I get results in seconds. My entire village has started using AgriVision — it has truly changed how we farm.",
  },
  {
    name: "Vikram S.",
    role: "Grape Vineyard Owner",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram&backgroundColor=e9d5ff",
    quote: "Powdery mildew was silently spreading through my vineyard. AgriVision caught it two weeks before I would have noticed. Saved lakhs worth of produce this season.",
  },
  {
    name: "Anita V.",
    role: "Agri-Professional, UP",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anita&backgroundColor=fed7aa",
    quote: "Simple to use, even for non-technical farmers. The diagnosis history feature helps me track field health over multiple seasons — something no other app offers.",
  },
];

// Duplicate for seamless infinite scroll
const doubled = [...testimonials, ...testimonials];

export default function TestimonialsSection() {
  const [paused, setPaused] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .ts-section {
          background: #f0f7f0;
          padding: 80px 0 90px;
          overflow: hidden;
          position: relative;
        }

        /* Fade masks on left & right edges */
        .ts-section::before,
        .ts-section::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 180px;
          z-index: 10;
          pointer-events: none;
        }
        .ts-section::before {
          left: 0;
          background: linear-gradient(to right, #f0f7f0 0%, transparent 100%);
        }
        .ts-section::after {
          right: 0;
          background: linear-gradient(to left, #f0f7f0 0%, transparent 100%);
        }

        .ts-header {
          text-align: center;
          padding: 0 32px;
          margin-bottom: 52px;
        }

        .ts-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #5a9e4f;
          font-family: 'DM Sans', sans-serif;
          display: block;
          margin-bottom: 12px;
        }

        .ts-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          color: #1b4a17;
          line-height: 1.2;
        }

        /* Scrolling track */
        .ts-track-wrap {
          overflow: hidden;
          width: 100%;
        }

        .ts-track {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: scroll-left 40s linear infinite;
        }
        .ts-track.paused {
          animation-play-state: paused;
        }

        @keyframes scroll-left {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }

        /* Card */
        .ts-card {
          width: 360px;
          flex-shrink: 0;
          background: white;
          border: 1.5px solid #d4ead0;
          border-radius: 0px;
          padding: 28px;
          position: relative;
          transition: border-color 0.3s, box-shadow 0.3s;
          cursor: default;
          font-family: 'DM Sans', sans-serif;
        }
        .ts-card:hover {
          border-color: #3a7d32;
          box-shadow: 0 12px 40px rgba(58,125,50,0.14);
        }

        /* Top green accent bar */
        .ts-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3a7d32, #6acd5a);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .ts-card:hover::before { opacity: 1; }

        .ts-quote-mark {
          font-size: 52px;
          color: #c8e6c3;
          font-family: Georgia, serif;
          font-weight: 900;
          line-height: 0.8;
          margin-bottom: 12px;
          display: block;
        }

        .ts-quote {
          font-size: 14px;
          color: #4a6e45;
          line-height: 1.75;
          margin-bottom: 24px;
          font-style: italic;
        }

        /* Divider */
        .ts-divider {
          height: 1px;
          background: linear-gradient(90deg, #3a7d32, #d4ead0);
          margin-bottom: 18px;
          opacity: 0.5;
        }

        .ts-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ts-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 2px solid #c8e6c3;
          overflow: hidden;
          flex-shrink: 0;
          background: #e8f5e3;
        }
        .ts-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .ts-name {
          font-weight: 700;
          color: #1b4a17;
          font-size: 15px;
        }
        .ts-role {
          font-size: 12px;
          color: #7aac6e;
          margin-top: 1px;
        }

        /* Green dot badge */
        .ts-verified {
          margin-left: auto;
          display: flex; align-items: center; gap: 5px;
          background: #e8f5e3;
          border: 1px solid #c8e6c3;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          color: #3a7d32;
        }
        .ts-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #3a7d32;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <section className="ts-section">
        {/* Header */}
        <div className="ts-header">
          <span className="ts-badge">CLIENT TESTIMONIALS</span>
          <h2 className="ts-title">What our farmers say</h2>
        </div>

        {/* Infinite scroll track */}
        <div className="ts-track-wrap">
          <div
            className={`ts-track ${paused ? "paused" : ""}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {doubled.map((t, i) => (
              <div className="ts-card" key={i}>
                <span className="ts-quote-mark">"</span>
                <p className="ts-quote">{t.quote}</p>
                <div className="ts-divider" />
                <div className="ts-author">
                  <div className="ts-avatar">
                    <img src={t.avatar} alt={t.name} />
                  </div>
                  <div>
                    <div className="ts-name">{t.name}</div>
                    <div className="ts-role">{t.role}</div>
                  </div>
                  <div className="ts-verified">
                    <div className="ts-dot" />
                    Verified
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
