/* Tutorial / onboarding rules walkthrough */

function TutorialScreen({ width = 1280, height = 800 }) {
  const steps = [
    {
      n: 1,
      title: 'FGG에 오신 것을 환영합니다',
      body: '동양의 마작 타일과 서양의 포커 족보가 만난 클라이밍 보드게임. 가장 먼저 손에 든 모든 패를 비우면 승리합니다.',
      visual: 'logo',
    },
    {
      n: 2,
      title: '4가지 문양 · 60개의 타일',
      body: '해 · 달 · 별 · 구름. 같은 숫자라면 해(빨강)가 가장 강하고 구름(파랑)이 가장 약합니다.',
      visual: 'suits',
    },
    {
      n: 3,
      title: '숫자 서열은 거꾸로',
      body: '2가 가장 강하고, 3이 가장 약합니다. 1은 두 번째로 강한 숫자입니다.',
      visual: 'numbers',
    },
    {
      n: 4,
      title: '같은 개수, 더 높게',
      body: '앞사람이 낸 개수만큼 받아쳐야 합니다. 1·2·3·5개만 가능 — 4개는 절대 낼 수 없습니다.',
      visual: 'counts',
    },
  ];
  const current = 2;
  const step = steps[current];

  return (
    <div className="lx-screen" style={{ width, height, background: 'var(--lx-bg-0)', display: 'flex', flexDirection: 'column' }}>
      {/* Progress */}
      <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button className="lx-btn lx-btn--ghost" style={{ padding: '6px 12px', fontSize: 11 }}>건너뛰기</button>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= current ? 'var(--lx-gold-bright)' : 'rgba(255,255,255,0.08)',
            }} />
          ))}
        </div>
        <span className="lx-mono" style={{ fontSize: 11, color: 'var(--lx-text-muted)' }}>{current + 1} / {steps.length}</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '0 80px', gap: 60 }}>
        <div>
          <div className="lx-eyebrow" style={{ marginBottom: 10 }}>STEP {step.n}</div>
          <h1 className="lx-display" style={{ fontSize: 44, margin: '0 0 18px', color: 'var(--lx-text)', lineHeight: 1.15 }}>{step.title}</h1>
          <p style={{ fontSize: 16, color: 'var(--lx-text-dim)', lineHeight: 1.6, margin: 0 }}>{step.body}</p>
        </div>

        {/* Visual: 4 suits demo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            {['sun', 'moon', 'star', 'cloud'].map((s, i) => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transform: `translateY(${i * 4}px)` }}>
                <Tile n={2} s={s} size="xl" />
                <div style={{
                  fontFamily: 'var(--lx-font-display)',
                  fontSize: 18,
                  color: SUITS[s].color,
                }}>{SUITS[s].name}</div>
                <div style={{ fontSize: 10, color: 'var(--lx-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {i === 0 ? '가장 강함' : i === 3 ? '가장 약함' : ''}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--lx-text-muted)' }}>
            <span style={{ color: SUITS.sun.color }}>해</span> ›
            <span style={{ color: SUITS.moon.color }}>달</span> ›
            <span style={{ color: SUITS.star.color }}>별</span> ›
            <span style={{ color: SUITS.cloud.color }}>구름</span>
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--lx-line)' }}>
        <button className="lx-btn">← 이전</button>
        <button className="lx-btn lx-btn--primary" style={{ padding: '12px 28px' }}>다음 ▸</button>
      </div>
    </div>
  );
}

Object.assign(window, { TutorialScreen });
