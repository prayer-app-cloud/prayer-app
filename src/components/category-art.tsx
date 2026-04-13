"use client";

// Shared SVG noise filter for warmth/grain texture
function GrainFilter({ id }: { id: string }) {
  return (
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
      <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
      <feBlend in="SourceGraphic" in2="gray" mode="multiply" result="blend" />
      <feComponentTransfer in="blend">
        <feFuncA type="linear" slope="0.08" />
      </feComponentTransfer>
      <feComposite in="SourceGraphic" in2="blend" operator="atop" />
    </filter>
  );
}

// ── Health: rolling green hills with soft sunrise ──
export function HealthArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <GrainFilter id="grain-health" />
        <linearGradient id="health-sky" x1="100" y1="0" x2="100" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF9E7" />
          <stop offset="100%" stopColor="#E8F5E4" />
        </linearGradient>
        <radialGradient id="health-sun" cx="100" cy="55" r="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="health-hill1" x1="100" y1="60" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="health-hill2" x1="100" y1="75" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g filter="url(#grain-health)">
        <rect width="200" height="120" fill="url(#health-sky)" />
        <circle cx="100" cy="58" r="36" fill="url(#health-sun)" />
        <circle cx="100" cy="58" r="12" fill="#FDE68A" fillOpacity="0.5" />
        {/* Back hills */}
        <ellipse cx="50" cy="95" rx="90" ry="35" fill="url(#health-hill1)" />
        <ellipse cx="160" cy="100" rx="80" ry="30" fill="url(#health-hill1)" />
        {/* Front hills */}
        <ellipse cx="30" cy="110" rx="80" ry="30" fill="url(#health-hill2)" />
        <ellipse cx="170" cy="112" rx="70" ry="28" fill="url(#health-hill2)" />
      </g>
    </svg>
  );
}

// ── Family: window frame with warm light ──
export function FamilyArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <GrainFilter id="grain-family" />
        <linearGradient id="family-bg" x1="100" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0F9FF" />
          <stop offset="100%" stopColor="#FFF8EE" />
        </linearGradient>
        <radialGradient id="family-glow" cx="100" cy="55" r="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#FDE68A" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="family-sky" x1="100" y1="22" x2="100" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <g filter="url(#grain-family)">
        <rect width="200" height="120" fill="url(#family-bg)" />
        {/* Window frame */}
        <rect x="55" y="15" width="90" height="90" rx="6" fill="url(#family-sky)" />
        <rect x="55" y="15" width="90" height="90" rx="6" stroke="#CBD5E1" strokeWidth="4" strokeOpacity="0.3" fill="none" />
        {/* Cross bar */}
        <line x1="100" y1="15" x2="100" y2="105" stroke="#CBD5E1" strokeWidth="3" strokeOpacity="0.25" />
        <line x1="55" y1="58" x2="145" y2="58" stroke="#CBD5E1" strokeWidth="3" strokeOpacity="0.25" />
        {/* Light streaming through */}
        <rect x="55" y="15" width="90" height="90" rx="6" fill="url(#family-glow)" />
        {/* Light rays below window */}
        <polygon points="65,105 55,120 145,120 135,105" fill="#FDE68A" fillOpacity="0.12" />
      </g>
    </svg>
  );
}

// ── Grief: single candle flame in darkness ──
export function GriefArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <GrainFilter id="grain-grief" />
        <linearGradient id="grief-bg" x1="100" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2E1065" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="grief-glow" cx="100" cy="50" r="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#FBBF24" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="grief-flame" x1="100" y1="28" x2="100" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <g filter="url(#grain-grief)">
        <rect width="200" height="120" fill="url(#grief-bg)" />
        {/* Ambient glow */}
        <circle cx="100" cy="50" r="50" fill="url(#grief-glow)" />
        {/* Candle body */}
        <rect x="96" y="60" width="8" height="30" rx="2" fill="#E8D5B7" fillOpacity="0.6" />
        {/* Wick */}
        <line x1="100" y1="55" x2="100" y2="60" stroke="#78716C" strokeWidth="1" strokeOpacity="0.5" />
        {/* Flame — teardrop shape */}
        <ellipse cx="100" cy="45" rx="6" ry="12" fill="url(#grief-flame)" />
        <ellipse cx="100" cy="43" rx="3" ry="7" fill="#FEF9C3" fillOpacity="0.8" />
        {/* Base/plate */}
        <ellipse cx="100" cy="92" rx="16" ry="4" fill="#D6D3D1" fillOpacity="0.3" />
      </g>
    </svg>
  );
}

// ── Finances: open palms with subtle light above ──
export function FinancesArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <GrainFilter id="grain-finances" />
        <linearGradient id="fin-bg" x1="100" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="fin-glow" cx="100" cy="35" r="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fin-palm" x1="100" y1="50" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D4A574" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#B8956A" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g filter="url(#grain-finances)">
        <rect width="200" height="120" fill="url(#fin-bg)" />
        {/* Light orb above */}
        <circle cx="100" cy="32" r="30" fill="url(#fin-glow)" />
        <circle cx="100" cy="32" r="10" fill="#FDE68A" fillOpacity="0.35" />
        {/* Left palm — curved shape */}
        <path d="M60,95 Q60,65 80,55 Q90,52 95,60 L95,95 Z" fill="url(#fin-palm)" />
        {/* Right palm — mirrored */}
        <path d="M140,95 Q140,65 120,55 Q110,52 105,60 L105,95 Z" fill="url(#fin-palm)" />
        {/* Subtle light particles */}
        <circle cx="90" cy="40" r="2" fill="#FDE68A" fillOpacity="0.4" />
        <circle cx="112" cy="38" r="1.5" fill="#FDE68A" fillOpacity="0.3" />
        <circle cx="98" cy="28" r="1.5" fill="#FDE68A" fillOpacity="0.5" />
      </g>
    </svg>
  );
}

// ── Inner Struggle: winding path through soft fog with light at end ──
export function InnerStruggleArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <GrainFilter id="grain-inner" />
        <linearGradient id="inner-bg" x1="100" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF1F2" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E7E5E4" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="inner-light" cx="175" cy="45" r="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#FDE68A" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="inner-fog1" x1="0" y1="60" x2="200" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D6D3D1" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#D6D3D1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#D6D3D1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g filter="url(#grain-inner)">
        <rect width="200" height="120" fill="url(#inner-bg)" />
        {/* Fog layers */}
        <ellipse cx="60" cy="55" rx="70" ry="20" fill="url(#inner-fog1)" />
        <ellipse cx="120" cy="70" rx="60" ry="15" fill="#D6D3D1" fillOpacity="0.12" />
        {/* Winding path */}
        <path
          d="M15,100 Q45,80 60,85 Q80,92 95,78 Q115,60 140,68 Q160,75 180,55"
          stroke="#FDA4AF" strokeWidth="4" strokeOpacity="0.3" strokeLinecap="round" fill="none"
        />
        <path
          d="M15,100 Q45,80 60,85 Q80,92 95,78 Q115,60 140,68 Q160,75 180,55"
          stroke="#FFF1F2" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" fill="none"
        />
        {/* Light at the end */}
        <circle cx="180" cy="50" r="35" fill="url(#inner-light)" />
        <circle cx="185" cy="48" r="8" fill="#FDE68A" fillOpacity="0.35" />
      </g>
    </svg>
  );
}

// ── Work: desk lamp casting warm circle of light ──
export function WorkArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <GrainFilter id="grain-work" />
        <linearGradient id="work-bg" x1="100" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="work-light" cx="115" cy="80" r="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#FDE68A" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g filter="url(#grain-work)">
        <rect width="200" height="120" fill="url(#work-bg)" />
        {/* Desk surface */}
        <rect x="30" y="90" width="140" height="4" rx="2" fill="#CBD5E1" fillOpacity="0.3" />
        {/* Lamp base */}
        <rect x="75" y="82" width="16" height="8" rx="3" fill="#94A3B8" fillOpacity="0.4" />
        {/* Lamp arm */}
        <line x1="83" y1="82" x2="100" y2="40" stroke="#94A3B8" strokeWidth="2.5" strokeOpacity="0.35" strokeLinecap="round" />
        {/* Lamp head */}
        <path d="M90,38 L100,40 L120,38 L115,45 L95,45 Z" fill="#94A3B8" fillOpacity="0.4" />
        {/* Light cone */}
        <polygon points="95,45 80,90 150,90 120,45" fill="url(#work-light)" />
        {/* Light pool on desk */}
        <ellipse cx="115" cy="90" rx="35" ry="5" fill="#FDE68A" fillOpacity="0.15" />
      </g>
    </svg>
  );
}

// ── School: open book with light rising from pages ──
export function SchoolArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <GrainFilter id="grain-school" />
        <linearGradient id="school-bg" x1="100" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EEF2FF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFF8EE" />
        </linearGradient>
        <radialGradient id="school-glow" cx="100" cy="55" r="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="school-page" x1="100" y1="60" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEFCE8" />
          <stop offset="100%" stopColor="#E8E5DE" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <g filter="url(#grain-school)">
        <rect width="200" height="120" fill="url(#school-bg)" />
        {/* Light rising */}
        <circle cx="100" cy="48" r="35" fill="url(#school-glow)" />
        {/* Light particles */}
        <circle cx="92" cy="35" r="2" fill="#FDE68A" fillOpacity="0.4" />
        <circle cx="108" cy="30" r="1.5" fill="#FDE68A" fillOpacity="0.35" />
        <circle cx="100" cy="25" r="2" fill="#FDE68A" fillOpacity="0.3" />
        {/* Left page */}
        <path d="M100,65 Q80,60 55,68 L55,100 Q80,92 100,98 Z" fill="url(#school-page)" />
        <path d="M100,65 Q80,60 55,68 L55,100 Q80,92 100,98 Z" stroke="#C7D2FE" strokeWidth="1" strokeOpacity="0.4" fill="none" />
        {/* Right page */}
        <path d="M100,65 Q120,60 145,68 L145,100 Q120,92 100,98 Z" fill="url(#school-page)" />
        <path d="M100,65 Q120,60 145,68 L145,100 Q120,92 100,98 Z" stroke="#C7D2FE" strokeWidth="1" strokeOpacity="0.4" fill="none" />
        {/* Spine */}
        <line x1="100" y1="65" x2="100" y2="100" stroke="#A5B4FC" strokeWidth="1.5" strokeOpacity="0.3" />
        {/* Faint text lines */}
        <line x1="65" y1="78" x2="90" y2="76" stroke="#C7D2FE" strokeWidth="1" strokeOpacity="0.2" />
        <line x1="65" y1="84" x2="88" y2="82" stroke="#C7D2FE" strokeWidth="1" strokeOpacity="0.15" />
        <line x1="110" y1="76" x2="135" y2="78" stroke="#C7D2FE" strokeWidth="1" strokeOpacity="0.2" />
        <line x1="112" y1="82" x2="135" y2="84" stroke="#C7D2FE" strokeWidth="1" strokeOpacity="0.15" />
      </g>
    </svg>
  );
}

// ── Other: open door with light streaming through ──
export function OtherArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <GrainFilter id="grain-other" />
        <linearGradient id="other-bg" x1="100" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FAF8F5" />
          <stop offset="100%" stopColor="#F5F0E8" />
        </linearGradient>
        <linearGradient id="other-doorlight" x1="105" y1="10" x2="105" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="other-glow" cx="105" cy="55" r="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g filter="url(#grain-other)">
        <rect width="200" height="120" fill="url(#other-bg)" />
        {/* Wall */}
        <rect x="50" y="10" width="100" height="105" rx="0" fill="#D6D3D1" fillOpacity="0.15" />
        {/* Door frame */}
        <rect x="72" y="15" width="56" height="95" rx="3" fill="url(#other-doorlight)" />
        <rect x="72" y="15" width="56" height="95" rx="3" stroke="#D6D3D1" strokeWidth="3" strokeOpacity="0.2" fill="none" />
        {/* Ambient glow from door */}
        <circle cx="100" cy="55" r="50" fill="url(#other-glow)" />
        {/* Door edge (ajar) */}
        <path d="M72,15 L80,18 L80,107 L72,110 Z" fill="#A8A29E" fillOpacity="0.15" />
        {/* Light rays from doorway */}
        <polygon points="82,30 60,10 55,15 82,38" fill="#FDE68A" fillOpacity="0.06" />
        <polygon points="82,50 50,55 50,65 82,60" fill="#FDE68A" fillOpacity="0.05" />
        <polygon points="82,80 55,100 60,105 82,85" fill="#FDE68A" fillOpacity="0.06" />
        {/* Door handle */}
        <circle cx="120" cy="62" r="2.5" fill="#A8A29E" fillOpacity="0.3" />
      </g>
    </svg>
  );
}

// ── Composite "Prayer Room" scene for onboarding ──
export function PrayerRoomArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <GrainFilter id="grain-room" />
        <linearGradient id="room-bg" x1="160" y1="0" x2="160" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="50%" stopColor="#FFF8EE" />
          <stop offset="100%" stopColor="#FAF8F5" />
        </linearGradient>
        <radialGradient id="room-glow" cx="160" cy="85" r="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="room-hill" x1="160" y1="130" x2="160" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="room-flame" x1="160" y1="55" x2="160" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <g filter="url(#grain-room)">
        <rect width="320" height="200" fill="url(#room-bg)" />
        {/* Soft background hills (Health) */}
        <ellipse cx="80" cy="175" rx="120" ry="40" fill="url(#room-hill)" />
        <ellipse cx="260" cy="180" rx="100" ry="35" fill="url(#room-hill)" />
        {/* Window (Family) — upper left */}
        <rect x="40" y="30" width="50" height="55" rx="4" fill="#BAE6FD" fillOpacity="0.15" />
        <rect x="40" y="30" width="50" height="55" rx="4" stroke="#CBD5E1" strokeWidth="2" strokeOpacity="0.15" fill="none" />
        <line x1="65" y1="30" x2="65" y2="85" stroke="#CBD5E1" strokeWidth="1.5" strokeOpacity="0.12" />
        <line x1="40" y1="56" x2="90" y2="56" stroke="#CBD5E1" strokeWidth="1.5" strokeOpacity="0.12" />
        {/* Central warm glow */}
        <circle cx="160" cy="85" r="80" fill="url(#room-glow)" />
        {/* Candle (Grief) — center */}
        <rect x="157" y="90" width="6" height="22" rx="2" fill="#E8D5B7" fillOpacity="0.4" />
        <ellipse cx="160" cy="80" rx="5" ry="11" fill="url(#room-flame)" />
        <ellipse cx="160" cy="78" rx="2.5" ry="6" fill="#FEF9C3" fillOpacity="0.7" />
        <ellipse cx="160" cy="114" rx="12" ry="3" fill="#D6D3D1" fillOpacity="0.2" />
        {/* Door (Other) — right side */}
        <rect x="240" y="35" width="40" height="75" rx="2" fill="#FDE68A" fillOpacity="0.12" />
        <rect x="240" y="35" width="40" height="75" rx="2" stroke="#D6D3D1" strokeWidth="2" strokeOpacity="0.15" fill="none" />
        <circle cx="273" cy="72" r="2" fill="#A8A29E" fillOpacity="0.25" />
        {/* Open book (School) — lower left */}
        <path d="M50,155 Q35,150 20,154 L20,170 Q35,166 50,172 Z" fill="#FEFCE8" fillOpacity="0.4" />
        <path d="M50,155 Q65,150 80,154 L80,170 Q65,166 50,172 Z" fill="#FEFCE8" fillOpacity="0.4" />
        <line x1="50" y1="155" x2="50" y2="172" stroke="#A5B4FC" strokeWidth="1" strokeOpacity="0.2" />
        {/* Floating light particles */}
        <circle cx="130" cy="50" r="2.5" fill="#FDE68A" fillOpacity="0.3" />
        <circle cx="190" cy="45" r="2" fill="#FDE68A" fillOpacity="0.25" />
        <circle cx="155" cy="38" r="1.5" fill="#FDE68A" fillOpacity="0.35" />
        <circle cx="175" cy="55" r="2" fill="#FDE68A" fillOpacity="0.2" />
        <circle cx="140" cy="65" r="1.5" fill="#FDE68A" fillOpacity="0.2" />
        {/* Winding path hint (Inner Struggle) — far background */}
        <path d="M100,190 Q120,175 140,180 Q160,185 180,170" stroke="#FDA4AF" strokeWidth="2" strokeOpacity="0.12" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// ── Lookup map ──
const CATEGORY_ART: Record<string, React.ComponentType<{ className?: string }>> = {
  health: HealthArt,
  family: FamilyArt,
  grief: GriefArt,
  finances: FinancesArt,
  inner_struggle: InnerStruggleArt,
  work: WorkArt,
  school: SchoolArt,
  work_school: WorkArt,
  other: OtherArt,
};

export function getCategoryArt(category: string): React.ComponentType<{ className?: string }> {
  return CATEGORY_ART[category] ?? OtherArt;
}
