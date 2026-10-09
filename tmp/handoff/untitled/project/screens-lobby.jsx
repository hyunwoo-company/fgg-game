/* Lobby & Rooms screens */

const { useState: useStateLB } = React;

function LogoMark({ size = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: size, height: size,
        borderRadius: 6,
        background: 'linear-gradient(135deg, var(--lx-gold-bright), var(--lx-gold-deep))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--lx-font-display)',
        fontStyle: 'italic',
        fontWeight: 600,
        color: '#1A1408',
        fontSize: size * 0.55,
        boxShadow: '0 2px 8px rgba(212, 166, 86, 0.4)',
      }}>L</div>
      <div style={{
        fontFamily: 'var(--lx-font-display)',
        fontWeight: 500,
        fontSize: size * 0.85,
        letterSpacing: '0.08em',
        color: 'var(--lx-text)',
      }}>FGG</div>
    </div>
  );
}

function LobbyScreen({ width = 1280, height = 800 }) {
  const rooms = [
    { id: 'LX-2847', name: '주말의 한판', host: '용현', count: '3/4', status: '대기중', stake: 100, mode: '4인전' },
    { id: 'LX-2913', name: '초보환영 - 천천히', host: 'NeoTaco', count: '2/3', status: '대기중', stake: 50, mode: '3인전' },
    { id: 'LX-2904', name: '럭키 5', host: 'Mira', count: '5/5', status: '진행중', stake: 200, mode: '5인전', locked: true },
    { id: 'LX-2891', name: '점심시간 빠른판', host: '소영', count: '3/4', status: '대기중', stake: 100, mode: '4인전' },
    { id: 'LX-2880', name: '하이스테이크', host: 'Tiger', count: '4/5', status: '대기중', stake: 500, mode: '5인전', locked: true },
    { id: 'LX-2876', name: '실력자 모집', host: '도윤', count: '1/4', status: '대기중', stake: 300, mode: '4인전' },
  ];

  return (
    <div className="lx-screen" style={{ width, height, background: 'var(--lx-bg-0)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        borderBottom: '1px solid var(--lx-line)',
        background: 'linear-gradient(180deg, var(--lx-bg-1) 0%, var(--lx-bg-0) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <LogoMark size={32} />
          <nav style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <a style={{ color: 'var(--lx-gold-bright)', textDecoration: 'none', fontWeight: 600 }}>로비</a>
            <a style={{ color: 'var(--lx-text-dim)', textDecoration: 'none' }}>친구</a>
            <a style={{ color: 'var(--lx-text-dim)', textDecoration: 'none' }}>전적</a>
            <a style={{ color: 'var(--lx-text-dim)', textDecoration: 'none' }}>상점</a>
            <a style={{ color: 'var(--lx-text-dim)', textDecoration: 'none' }}>가이드</a>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="lx-chip">💰 28 칩</span>
          <span className="lx-chip">⭐ 1,247 점</span>
          <div className="lx-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>나</div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left rail */}
        <aside style={{
          width: 240,
          padding: 24,
          borderRight: '1px solid var(--lx-line)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <button className="lx-btn lx-btn--primary" style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '14px' }}>
            ＋ 방 만들기
          </button>
          <button className="lx-btn" style={{ width: '100%', justifyContent: 'center' }}>⚡ 빠른 시작</button>
          <button className="lx-btn lx-btn--ghost" style={{ width: '100%', justifyContent: 'center' }}>🤖 AI와 연습</button>

          <div style={{ marginTop: 20 }}>
            <div className="lx-eyebrow" style={{ marginBottom: 10 }}>필터</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              {['전체', '3인전', '4인전', '5인전', '대기중만'].map((f, i) => (
                <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, color: i === 0 ? 'var(--lx-gold-bright)' : 'var(--lx-text-dim)', cursor: 'pointer' }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: 3,
                    border: '1px solid var(--lx-line-strong)',
                    background: i === 0 ? 'var(--lx-gold)' : 'transparent',
                  }} />
                  {f}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, padding: 14, border: '1px solid var(--lx-line)', borderRadius: 'var(--r-md)', background: 'var(--lx-bg-1)' }}>
            <div className="lx-eyebrow" style={{ marginBottom: 6 }}>오늘의 도전</div>
            <div style={{ fontSize: 12, color: 'var(--lx-text)', marginBottom: 6 }}>스트레이트 5번 내기</div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: 'var(--lx-gold)' }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--lx-text-muted)', marginTop: 4 }}>3 / 5 · 보상 +50 칩</div>
          </div>
        </aside>

        {/* Room list */}
        <main style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <h1 className="lx-display" style={{ margin: 0, fontSize: 28, color: 'var(--lx-text)' }}>방 목록</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input placeholder="방 검색…" style={{
                background: 'var(--lx-bg-1)',
                border: '1px solid var(--lx-line)',
                color: 'var(--lx-text)',
                padding: '8px 14px',
                borderRadius: 'var(--r-md)',
                fontSize: 12,
                width: 180,
              }} />
              <button className="lx-btn lx-btn--ghost" style={{ padding: '8px 12px', fontSize: 11 }}>🔄</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, overflow: 'auto', paddingRight: 6 }}>
            {rooms.map(r => (
              <div key={r.id} className="lx-panel" style={{
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
              }}>
                <div className="lx-avatar" style={{ width: 40, height: 40 }}>{r.host[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--lx-text)' }}>{r.name}</span>
                    {r.locked && <span style={{ fontSize: 10, color: 'var(--lx-text-muted)' }}>🔒</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--lx-text-dim)' }}>
                    <span>{r.mode}</span>
                    <span>·</span>
                    <span>판돈 {r.stake}</span>
                    <span>·</span>
                    <span className="lx-mono">#{r.id}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                    background: r.status === '대기중' ? 'rgba(45, 186, 111, 0.15)' : 'rgba(230, 57, 70, 0.15)',
                    color: r.status === '대기중' ? '#5DDA9E' : '#FF8088',
                    border: `1px solid ${r.status === '대기중' ? 'rgba(45,186,111,0.4)' : 'rgba(230,57,70,0.4)'}`,
                  }}>{r.status}</span>
                  <span style={{ fontFamily: 'var(--lx-font-num)', fontSize: 16, color: 'var(--lx-gold-bright)' }}>{r.count}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { LobbyScreen, LogoMark });
