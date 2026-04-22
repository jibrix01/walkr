import { useState, useEffect, useCallback } from "react";

// ── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = "walkr_prefs";
const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { walkVibes: [], musicVibes: [] };
  } catch { return { walkVibes: [], musicVibes: [] }; }
};
const savePrefs = (p) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
};

// ── Palette & styles ─────────────────────────────────────────────────────────
const G = {
  bg: "#0d1a12",
  card: "#132218",
  cardBorder: "#1e3829",
  accent: "#4ade80",
  accentDim: "#166534",
  text: "#e2f0e8",
  muted: "#6b9a7a",
  warn: "#fbbf24",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${G.bg};
    color: ${G.text};
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* nav */
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 32px;
    border-bottom: 1px solid ${G.cardBorder};
    position: sticky; top: 0; z-index: 50;
    background: ${G.bg}dd;
    backdrop-filter: blur(12px);
  }
  .logo {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem;
    color: ${G.accent};
    letter-spacing: -0.5px;
  }
  .logo span { font-style: italic; color: ${G.text}; }
  .nav-links { display: flex; gap: 8px; }
  .nav-btn {
    background: none; border: none; cursor: pointer;
    padding: 8px 16px; border-radius: 999px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; font-weight: 500;
    color: ${G.muted}; transition: all 0.2s;
  }
  .nav-btn:hover { color: ${G.text}; background: ${G.card}; }
  .nav-btn.active { color: ${G.bg}; background: ${G.accent}; }

  /* main */
  main { flex: 1; padding: 32px 24px; max-width: 860px; margin: 0 auto; width: 100%; }

  /* cards */
  .card {
    background: ${G.card};
    border: 1px solid ${G.cardBorder};
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.25rem;
    color: ${G.accent};
    margin-bottom: 12px;
  }

  /* hero */
  .hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.2rem, 6vw, 3.4rem);
    line-height: 1.1;
    margin-bottom: 10px;
  }
  .hero-title em { color: ${G.accent}; font-style: italic; }
  .hero-sub { color: ${G.muted}; font-size: 1rem; margin-bottom: 28px; line-height: 1.6; }

  /* benefit grid */
  .benefit-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 12px;
  }
  .benefit-item {
    background: ${G.bg};
    border: 1px solid ${G.cardBorder};
    border-radius: 14px;
    padding: 16px;
    transition: border-color 0.2s;
  }
  .benefit-item:hover { border-color: ${G.accentDim}; }
  .benefit-icon { font-size: 1.6rem; margin-bottom: 6px; }
  .benefit-label { font-weight: 500; font-size: 0.95rem; margin-bottom: 4px; }
  .benefit-desc { color: ${G.muted}; font-size: 0.8rem; line-height: 1.5; }

  /* weather bar */
  .weather-bar {
    display: flex; gap: 20px; flex-wrap: wrap; align-items: center;
    padding: 16px 20px; background: ${G.bg};
    border: 1px solid ${G.cardBorder}; border-radius: 14px;
    margin-bottom: 20px;
  }
  .weather-item { display: flex; flex-direction: column; }
  .weather-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: ${G.muted}; }
  .weather-val { font-size: 1.1rem; font-weight: 500; }

  /* map placeholder */
  .map-wrap {
    border-radius: 16px; overflow: hidden;
    border: 1px solid ${G.cardBorder};
    height: 360px; position: relative;
    background: #0a150f;
  }
  .map-wrap iframe { width: 100%; height: 100%; border: none; }
  .map-overlay {
    position: absolute; top: 12px; left: 12px;
    background: ${G.bg}cc; backdrop-filter: blur(8px);
    border: 1px solid ${G.cardBorder}; border-radius: 10px;
    padding: 8px 14px; font-size: 0.85rem;
    color: ${G.accent};
  }

  /* suggestions */
  .suggestion-card {
    background: ${G.bg};
    border: 1px solid ${G.cardBorder};
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 14px;
    animation: fadeUp 0.4s ease forwards;
    opacity: 0;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .suggestion-card:nth-child(2) { animation-delay: 0.1s; }
  .suggestion-card:nth-child(3) { animation-delay: 0.2s; }
  .suggestion-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .suggestion-name { font-family: 'DM Serif Display', serif; font-size: 1.15rem; }
  .suggestion-tag {
    font-size: 0.72rem; padding: 3px 10px; border-radius: 999px;
    background: ${G.accentDim}33; color: ${G.accent};
    border: 1px solid ${G.accentDim};
    white-space: nowrap;
  }
  .suggestion-body { color: ${G.muted}; font-size: 0.88rem; line-height: 1.6; }
  .music-row { margin-top: 10px; display: flex; align-items: center; gap: 8px; }
  .music-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: #1a2e3a; border: 1px solid #2a4a5a;
    color: #7dd3fc; border-radius: 999px; padding: 4px 12px; font-size: 0.8rem;
  }

  /* vibe pickers */
  .vibe-section { margin-bottom: 24px; }
  .vibe-heading { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: ${G.muted}; margin-bottom: 10px; }
  .vibe-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    padding: 8px 18px; border-radius: 999px; cursor: pointer;
    border: 1px solid ${G.cardBorder};
    background: ${G.bg};
    font-size: 0.88rem; font-family: 'DM Sans', sans-serif;
    color: ${G.muted}; transition: all 0.18s;
  }
  .chip:hover { border-color: ${G.accentDim}; color: ${G.text}; }
  .chip.selected { background: ${G.accentDim}44; border-color: ${G.accent}; color: ${G.accent}; }
  .chip.idea { border-style: dashed; }

  /* btn */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${G.accent}; color: ${G.bg};
    border: none; border-radius: 999px;
    padding: 12px 28px; font-size: 1rem; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: opacity 0.2s, transform 0.15s;
  }
  .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    background: none; border: 1px solid ${G.cardBorder};
    color: ${G.muted}; border-radius: 999px;
    padding: 10px 22px; font-size: 0.9rem;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.18s;
  }
  .btn-outline:hover { border-color: ${G.accent}; color: ${G.accent}; }

  /* loader */
  .loader { display: inline-block; width: 16px; height: 16px; }
  .loader::after {
    content: '';
    display: block; width: 14px; height: 14px;
    border-radius: 50%;
    border: 2px solid ${G.bg};
    border-top-color: transparent;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* page transitions */
  .page { animation: pageFade 0.3s ease; }
  @keyframes pageFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

  /* misc */
  .divider { border: none; border-top: 1px solid ${G.cardBorder}; margin: 20px 0; }
  .tag-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
  .tag {
    font-size: 0.75rem; padding: 3px 10px; border-radius: 999px;
    background: ${G.accentDim}22; color: ${G.muted}; border: 1px solid ${G.cardBorder};
  }
  .saved-dot { width: 8px; height: 8px; border-radius: 50%; background: ${G.accent}; display: inline-block; margin-right: 6px; }
  .text-muted { color: ${G.muted}; }
  .text-sm { font-size: 0.85rem; }
  .mt-2 { margin-top: 8px; }
  .mt-4 { margin-top: 16px; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .gap-2 { gap: 8px; }
  .justify-between { justify-content: space-between; }
`;

// ── Benefits data ────────────────────────────────────────────────────────────
const BENEFITS = [
  { icon: "🧠", label: "Mental Clarity", desc: "Reduces anxiety and boosts creativity through rhythmic movement." },
  { icon: "❤️", label: "Heart Health", desc: "30 min/day lowers heart disease risk significantly." },
  { icon: "😴", label: "Better Sleep", desc: "Regular walkers fall asleep faster and sleep deeper." },
  { icon: "🦴", label: "Joint Strength", desc: "Low-impact exercise builds cartilage without stress." },
  { icon: "🌿", label: "Mood Lift", desc: "Triggers endorphins and serotonin within minutes." },
  { icon: "⚡", label: "Energy Boost", desc: "More effective than caffeine for sustained alertness." },
];

// ── Walk vibe options ────────────────────────────────────────────────────────
const WALK_VIBES = ["Urban", "Nature", "Waterfront", "Historic", "Night Stroll", "Sunrise", "Park Loop"];
const MUSIC_VIBES = ["Somber", "Cheerful", "Lo-fi Chill", "Epic Orchestral", "Jazz", "Podcast Mode", "Silence"];

// ── OpenWeather key (free tier) — user can set their own ────────────────────
const OW_KEY = "demo"; // replace with real key for live data

// ── Page: Home ───────────────────────────────────────────────────────────────
function HomePage({ weather, location }) {
  return (
    <div className="page">
      <div style={{ marginBottom: 32 }}>
        <h1 className="hero-title">Every walk is<br /><em>a small reset.</em></h1>
        <p className="hero-sub">
          Step outside. Your body and mind will thank you. Walkr helps you find the perfect route,
          soundtrack, and moment to just… go.
        </p>
        {weather && (
          <div className="weather-bar">
            <div className="weather-item">
              <span className="weather-label">Feels like</span>
              <span className="weather-val">{weather.feels}°C</span>
            </div>
            <div className="weather-item">
              <span className="weather-label">Condition</span>
              <span className="weather-val">{weather.description}</span>
            </div>
            <div className="weather-item">
              <span className="weather-label">Wind</span>
              <span className="weather-val">{weather.wind} km/h</span>
            </div>
            <div className="weather-item">
              <span className="weather-label">Humidity</span>
              <span className="weather-val">{weather.humidity}%</span>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span style={{ fontSize: "2.4rem" }}>{weather.icon}</span>
            </div>
          </div>
        )}
        {!weather && (
          <div className="weather-bar text-muted text-sm">
            📍 Allow location access to see live weather conditions
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Why walk today?</div>
        <div className="benefit-grid">
          {BENEFITS.map((b) => (
            <div className="benefit-item" key={b.label}>
              <div className="benefit-icon">{b.icon}</div>
              <div className="benefit-label">{b.label}</div>
              <div className="benefit-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {location && (
        <div className="card">
          <div className="card-title">Your area</div>
          <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
            📍 {location.city || "Detected location"} — {location.lat?.toFixed(4)}, {location.lon?.toFixed(4)}
          </p>
          <div className="tag-row">
            <span className="tag">Lat {location.lat?.toFixed(3)}</span>
            <span className="tag">Lon {location.lon?.toFixed(3)}</span>
            {weather && <span className="tag">{weather.temp}°C outside</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page: Map ────────────────────────────────────────────────────────────────
function MapPage({ location }) {
  const lat = location?.lat || 14.676;
  const lon = location?.lon || 121.0437;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.03},${lat - 0.02},${lon + 0.03},${lat + 0.02}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className="page">
      <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.8rem", marginBottom: 8 }}>
        Your Location
      </h2>
      <p className="text-muted text-sm" style={{ marginBottom: 20 }}>
        Powered by OpenStreetMap · {location ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : "Enable location for accuracy"}
      </p>
      <div className="map-wrap">
        <iframe title="Your location" src={mapSrc} />
        <div className="map-overlay">📍 You are here</div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">About this spot</div>
        <p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>
          This map shows your approximate location. Use the <strong style={{ color: G.text }}>Suggestions</strong> page
          to get AI-personalized walk routes nearby based on your vibes and current weather.
        </p>
        {location?.city && (
          <div className="tag-row mt-2">
            <span className="tag">📍 {location.city}</span>
            {location.country && <span className="tag">{location.country}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page: Suggestions ────────────────────────────────────────────────────────
function SuggestionsPage({ location, weather, prefs, setPrefs }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ideaInput, setIdeaInput] = useState({ walk: "", music: "" });
  const [showWalkIdea, setShowWalkIdea] = useState(false);
  const [showMusicIdea, setShowMusicIdea] = useState(false);

  const toggleVibe = (type, val) => {
    setPrefs((p) => {
      const key = type === "walk" ? "walkVibes" : "musicVibes";
      const arr = p[key] || [];
      const updated = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
      const next = { ...p, [key]: updated };
      savePrefs(next);
      return next;
    });
  };

  const addCustomVibe = (type) => {
    const val = type === "walk" ? ideaInput.walk.trim() : ideaInput.music.trim();
    if (!val) return;
    setPrefs((p) => {
      const key = type === "walk" ? "walkVibes" : "musicVibes";
      const arr = p[key] || [];
      const next = { ...p, [key]: arr.includes(val) ? arr : [...arr, val] };
      savePrefs(next);
      return next;
    });
    setIdeaInput((i) => ({ ...i, [type]: "" }));
    if (type === "walk") setShowWalkIdea(false);
    else setShowMusicIdea(false);
  };

const getSuggestions = async () => {
  setLoading(true);
  setError("");
  setSuggestions(null);

  const walkVibes = prefs.walkVibes?.length ? prefs.walkVibes.join(", ") : "any";
  const musicVibes = prefs.musicVibes?.length ? prefs.musicVibes.join(", ") : "any";
  const weatherDesc = weather
    ? `${weather.description}, ${weather.temp}°C, wind ${weather.wind}km/h, humidity ${weather.humidity}%`
    : "unknown weather";
  const locDesc = location
    ? `${location.city || "unknown city"} (lat ${location.lat?.toFixed(3)}, lon ${location.lon?.toFixed(3)})`
    : "unknown location";

  const prompt = `You are a helpful walking companion assistant. Given the following context, suggest 3 great walk destinations or routes with music playlist vibes. Be concise, specific, and inspiring.

Location: ${locDesc}
Weather: ${weatherDesc}
Walk vibes I like: ${walkVibes}
Music vibes I like: ${musicVibes}

Respond ONLY with a JSON array of 3 objects, no markdown, no extra text. Each object:
{
  "name": "short destination or route name",
  "tag": "one-word category (Urban/Nature/Historic/etc)",
  "description": "2-3 sentences: why to go, what to expect, best route tip",
  "music": "specific playlist or genre suggestion matching their music vibe",
  "distance": "estimated walk distance e.g. 1.5 km loop",
  "bestTime": "e.g. Golden hour, Morning, Anytime"
}`;

  try {
    const res = await fetch("http://localhost:3001/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });
    const data = await res.json();
    let raw = data.text.trim();
    raw = raw.replace(/```json|```/g, "").trim();
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]") + 1;
    if (start === -1) throw new Error("No JSON array found");
    const parsed = JSON.parse(raw.slice(start, end));
    setSuggestions(parsed);
  } catch (e) {
  console.error("Full error:", e);
  setError(e.message || "Couldn't generate suggestions. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="page">
      <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.8rem", marginBottom: 6 }}>
        Walk Suggestions
      </h2>
      <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
        Personalized for your vibe, location, and today's weather.
      </p>

      {/* Walk vibe picker */}
      <div className="vibe-section">
        <div className="vibe-heading">Walk vibe</div>
        <div className="vibe-chips">
          {WALK_VIBES.map((v) => (
            <button
              key={v}
              className={`chip ${prefs.walkVibes?.includes(v) ? "selected" : ""}`}
              onClick={() => toggleVibe("walk", v)}
            >{v}</button>
          ))}
          {/* custom vibes */}
          {(prefs.walkVibes || []).filter((v) => !WALK_VIBES.includes(v)).map((v) => (
            <button key={v} className="chip selected" onClick={() => toggleVibe("walk", v)}>{v} ✕</button>
          ))}
          {!showWalkIdea ? (
            <button className="chip idea" onClick={() => setShowWalkIdea(true)}>+ Add idea</button>
          ) : (
            <span style={{ display: "flex", gap: 6 }}>
              <input
                value={ideaInput.walk}
                onChange={(e) => setIdeaInput((i) => ({ ...i, walk: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addCustomVibe("walk")}
                placeholder="e.g. Cemetery"
                style={{
                  background: G.bg, border: `1px solid ${G.accentDim}`, color: G.text,
                  borderRadius: 999, padding: "7px 14px", fontSize: "0.88rem",
                  fontFamily: "'DM Sans',sans-serif", outline: "none", width: 140,
                }}
              />
              <button className="btn-outline" style={{ padding: "7px 14px", fontSize: "0.82rem" }} onClick={() => addCustomVibe("walk")}>Add</button>
            </span>
          )}
        </div>
      </div>

      {/* Music vibe picker */}
      <div className="vibe-section">
        <div className="vibe-heading">Music vibe</div>
        <div className="vibe-chips">
          {MUSIC_VIBES.map((v) => (
            <button
              key={v}
              className={`chip ${prefs.musicVibes?.includes(v) ? "selected" : ""}`}
              onClick={() => toggleVibe("music", v)}
            >{v}</button>
          ))}
          {(prefs.musicVibes || []).filter((v) => !MUSIC_VIBES.includes(v)).map((v) => (
            <button key={v} className="chip selected" onClick={() => toggleVibe("music", v)}>{v} ✕</button>
          ))}
          {!showMusicIdea ? (
            <button className="chip idea" onClick={() => setShowMusicIdea(true)}>+ Add idea</button>
          ) : (
            <span style={{ display: "flex", gap: 6 }}>
              <input
                value={ideaInput.music}
                onChange={(e) => setIdeaInput((i) => ({ ...i, music: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addCustomVibe("music")}
                placeholder="e.g. K-pop"
                style={{
                  background: G.bg, border: `1px solid ${G.accentDim}`, color: G.text,
                  borderRadius: 999, padding: "7px 14px", fontSize: "0.88rem",
                  fontFamily: "'DM Sans',sans-serif", outline: "none", width: 140,
                }}
              />
              <button className="btn-outline" style={{ padding: "7px 14px", fontSize: "0.82rem" }} onClick={() => addCustomVibe("music")}>Add</button>
            </span>
          )}
        </div>
      </div>

      {/* Saved indicator */}
      {(prefs.walkVibes?.length > 0 || prefs.musicVibes?.length > 0) && (
        <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
          <span className="saved-dot" />Preferences saved automatically
        </p>
      )}

      <button className="btn-primary" onClick={getSuggestions} disabled={loading}>
        {loading ? <><span className="loader" /> Generating…</> : "✦ Suggest walks"}
      </button>

      {error && (
        <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 12, background: "#3b1a1a", border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: "0.88rem" }}>
          {error}
        </div>
      )}

      {suggestions && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.1rem", marginBottom: 16, color: G.muted }}>
            Here's where to walk today —
          </div>
          {suggestions.map((s, i) => (
            <div className="suggestion-card" key={i}>
              <div className="suggestion-header">
                <div className="suggestion-name">{s.name}</div>
                <span className="suggestion-tag">{s.tag}</span>
              </div>
              <p className="suggestion-body">{s.description}</p>
              <div className="tag-row mt-2">
                {s.distance && <span className="tag">🚶 {s.distance}</span>}
                {s.bestTime && <span className="tag">🕐 {s.bestTime}</span>}
              </div>
              <div className="music-row">
                <span className="music-pill">🎵 {s.music}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [prefs, setPrefs] = useState(loadPrefs);

  // Get geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let city = "", country = "";
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const d = await r.json();
          city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || "";
          country = d.address?.country || "";
        } catch {}
        setLocation({ lat, lon, city, country });
      },
      () => {
        // fallback: Manila
        setLocation({ lat: 14.5995, lon: 120.9842, city: "Manila", country: "Philippines" });
      }
    );
  }, []);

  // Fetch weather (demo mode with mock data if no real key)
  useEffect(() => {
    if (!location) return;
    const fetchWeather = async () => {
      try {
        // Try real OW API first
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${OW_KEY}&units=metric`;
        const r = await fetch(url);
        const d = await r.json();
        if (d.cod === 200) {
          const icons = { Clear: "☀️", Clouds: "⛅", Rain: "🌧️", Drizzle: "🌦️", Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️" };
          setWeather({
            temp: Math.round(d.main.temp),
            feels: Math.round(d.main.feels_like),
            humidity: d.main.humidity,
            wind: Math.round(d.wind.speed * 3.6),
            description: d.weather[0].description,
            icon: icons[d.weather[0].main] || "🌤️",
          });
        } else throw new Error("demo");
      } catch {
        // Mock weather for demo
        setWeather({ temp: 28, feels: 31, humidity: 72, wind: 14, description: "Partly cloudy", icon: "⛅" });
      }
    };
    fetchWeather();
  }, [location]);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav>
          <div className="logo">walk<span>r</span></div>
          <div className="nav-links">
            {[["home", "Home"], ["map", "Map"], ["suggestions", "Suggest"]].map(([id, label]) => (
              <button key={id} className={`nav-btn ${page === id ? "active" : ""}`} onClick={() => setPage(id)}>
                {label}
              </button>
            ))}
          </div>
        </nav>
        <main>
          {page === "home" && <HomePage weather={weather} location={location} />}
          {page === "map" && <MapPage location={location} />}
          {page === "suggestions" && (
            <SuggestionsPage
              location={location}
              weather={weather}
              prefs={prefs}
              setPrefs={setPrefs}
            />
          )}
        </main>
      </div>
    </>
  );
}
