/* FGG tile — ivory standing tile design reference:
   - IVORY body standing upright like a mahjong tile
   - Top CAP is BLANK ivory (the actual top surface — no markings)
   - Front face has ONE large circular CREST containing the number
   - The crest is a wreath/seal in the suit color
   - Tiny corner mini-mark in the bottom-right */

const SUITS = {
  sun:   { name: '해',   color: '#C8323D', glow: 'rgba(200, 50, 61, 0.35)' },
  moon:  { name: '달',   color: '#2A8C56', glow: 'rgba(42, 140, 86, 0.35)' },
  star:  { name: '별',   color: '#D88438', glow: 'rgba(216, 132, 56, 0.35)' },
  cloud: { name: '구름', color: '#1F2630', glow: 'rgba(31, 38, 48, 0.35)' },
};

const NUMBER_RANK = (n) => n === 2 ? 100 : (n === 1 ? 99 : n);
const SUIT_RANK = { sun: 4, moon: 3, star: 2, cloud: 1 };
function tileScore(t) { return NUMBER_RANK(t.n) * 10 + SUIT_RANK[t.s]; }

/* CREST — a circular wreath/seal in the suit color, with the number at center.
   Each suit has a slightly different decorative outline so they're distinguishable
   even at small sizes. */
function Crest({ suit, n, size }) {
  const { color } = SUITS[suit];
  const r = size / 2;
  const cx = r, cy = r;
  const stroke = Math.max(1.4, size * 0.05);

  // Outer wreath rings — different per suit
  let ornament = null;

  if (suit === 'sun') {
    // Pointed/spiky outer ring (sun's rays)
    const points = 16;
    const path = [];
    for (let i = 0; i < points * 2; i++) {
      const a = (i * Math.PI) / points - Math.PI / 2;
      const rad = i % 2 === 0 ? r * 0.96 : r * 0.84;
      const x = cx + Math.cos(a) * rad;
      const y = cy + Math.sin(a) * rad;
      path.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    ornament = <path d={path.join(' ') + ' Z'} fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />;
  } else if (suit === 'moon') {
    // Crescent + double ring
    ornament = (
      <g>
        <circle cx={cx} cy={cy} r={r * 0.92} fill="none" stroke={color} strokeWidth={stroke} />
        <path d={`
          M ${cx + r*0.65} ${cy - r*0.55}
          A ${r*0.85} ${r*0.85} 0 1 0 ${cx + r*0.65} ${cy + r*0.55}
          A ${r*0.62} ${r*0.62} 0 1 1 ${cx + r*0.65} ${cy - r*0.55}
          Z
        `} fill={color} opacity="0.95" />
      </g>
    );
  } else if (suit === 'star') {
    // Scalloped/petal outer ring (star)
    const petals = 12;
    const path = [];
    for (let i = 0; i <= petals; i++) {
      const a = (i * Math.PI * 2) / petals - Math.PI / 2;
      const aMid = a + Math.PI / petals;
      const x1 = cx + Math.cos(a) * r * 0.78;
      const y1 = cy + Math.sin(a) * r * 0.78;
      const xc = cx + Math.cos(aMid) * r * 0.98;
      const yc = cy + Math.sin(aMid) * r * 0.98;
      if (i === 0) path.push(`M ${x1} ${y1}`);
      else path.push(`Q ${cx + Math.cos(aMid - Math.PI / petals) * r * 0.98} ${cy + Math.sin(aMid - Math.PI / petals) * r * 0.98} ${x1} ${y1}`);
    }
    ornament = (
      <g>
        <path d={path.join(' ') + ' Z'} fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
        <circle cx={cx} cy={cy} r={r * 0.66} fill="none" stroke={color} strokeWidth={stroke * 0.7} />
      </g>
    );
  } else {
    // cloud — soft scalloped wreath, double ring
    const lobes = 8;
    const path = [];
    for (let i = 0; i <= lobes; i++) {
      const a = (i * Math.PI * 2) / lobes - Math.PI / 2;
      const aMid = a + Math.PI / lobes;
      const x1 = cx + Math.cos(a) * r * 0.72;
      const y1 = cy + Math.sin(a) * r * 0.72;
      const xc = cx + Math.cos(aMid) * r * 0.98;
      const yc = cy + Math.sin(aMid) * r * 0.98;
      if (i === 0) path.push(`M ${x1} ${y1}`);
      else path.push(`Q ${xc} ${yc} ${x1} ${y1}`);
    }
    ornament = (
      <g>
        <path d={path.join(' ') + ' Z'} fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
        <circle cx={cx} cy={cy} r={r * 0.62} fill="none" stroke={color} strokeWidth={stroke * 0.7} />
      </g>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* faint inner disc for legibility against ivory */}
      <circle cx={cx} cy={cy} r={r * 0.55} fill={color} opacity="0.06" />
      {ornament}
      {/* Inner ring framing the number */}
      <circle cx={cx} cy={cy} r={r * 0.5} fill="none" stroke={color} strokeWidth={stroke * 0.8} />
    </svg>
  );
}

function Tile({ n, s, size = 'md', selected = false, onClick, dimmed = false, faceDown = false }) {
  // No top cap; tile is a single front face (cap=0). Front face fills full height.
  const dims = {
    sm: { w: 32, h: 46,  cap: 0, crest: 30, num: 14, corner: 8,  radius: 5 },
    md: { w: 50, h: 72,  cap: 0, crest: 50, num: 24, corner: 12, radius: 7 },
    lg: { w: 64, h: 92,  cap: 0, crest: 64, num: 32, corner: 16, radius: 9 },
    xl: { w: 88, h: 128, cap: 0, crest: 88, num: 44, corner: 22, radius: 12 },
  }[size];

  const suit = SUITS[s];

  if (faceDown) {
    return (
      <div className={`mj-tile mj-tile--back ${selected ? 'is-selected' : ''}`}
        style={{ width: dims.w, height: dims.h, borderRadius: dims.radius }}>
        <div className="mj-tile__back-face" style={{ borderRadius: dims.radius }} />
        <span className="mj-tile__top-shine" />
      </div>
    );
  }

  return (
    <button type="button" onClick={onClick}
      className={`mj-tile ${selected ? 'is-selected' : ''} ${dimmed ? 'is-dimmed' : ''} ${onClick ? 'is-clickable' : ''}`}
      style={{
        width: dims.w, height: dims.h, borderRadius: dims.radius,
        transform: selected ? `translateY(-${Math.round(dims.h * 0.18)}px)` : undefined,
      }}
      aria-label={`${suit.name} ${n}`}>

      {/* Top edge highlight — a sharp specular line along the very top edge */}
      <span className="mj-tile__top-shine" />

      {/* CREST + NUMBER on the front face */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}>
        <div style={{ position: 'relative', width: dims.crest, height: dims.crest }}>
          <Crest suit={s} n={n} size={dims.crest} />
          <span style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--lx-font-num)',
            fontWeight: 800,
            fontSize: dims.num,
            lineHeight: 1,
            color: suit.color,
            textShadow: '0 1px 0 rgba(255, 250, 230, 0.7)',
            letterSpacing: '-0.03em',
          }}>{n}</span>
        </div>
      </div>

      {/* Bottom-right tiny corner mini-crest */}
      <span style={{
        position: 'absolute',
        right: Math.max(2, dims.w * 0.08),
        bottom: Math.max(2, dims.h * 0.05),
        zIndex: 2,
        opacity: 0.85,
      }}>
        <Crest suit={s} n={n} size={dims.corner} />
      </span>

      {/* Outer rim */}
      <span className="mj-tile__rim" style={{ borderRadius: dims.radius }} />
    </button>
  );
}

// Compatibility shim — older code (screens-guide etc.) can call SuitIcon
function SuitIcon({ suit, size = 24 }) {
  return <Crest suit={suit} n={'•'} size={size} />;
}

Object.assign(window, { Tile, Crest, SuitIcon, SUITS, SUIT_RANK, NUMBER_RANK, tileScore });
