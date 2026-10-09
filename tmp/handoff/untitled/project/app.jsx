/* App entry — assembles all screens into a design canvas */

const { useState: useStateApp } = React;

// Tweaks defaults
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "playerCount": 4,
  "density": "comfortable",
  "tableVariant": "oval",
  "tileStyle": "realistic",
  "showRecommend": true,
  "showEmotes": true
}/*EDITMODE-END*/;

// ===== Frame helpers =====

function MobileLandscapeFrame({ width, height, children, label }) {
  // iPhone-style horizontal frame with rounded bezel
  return (
    <div style={{
      width: width + 28,
      height: height + 28,
      padding: 14,
      background: 'linear-gradient(135deg, #1a1a1a 0%, #050505 100%)',
      borderRadius: 48,
      boxShadow: '0 30px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
      position: 'relative',
    }}>
      <div style={{
        width, height,
        borderRadius: 36,
        overflow: 'hidden',
        position: 'relative',
        background: '#000',
      }}>
        {children}
        {/* Dynamic island (centered top in landscape = left side) */}
        <div style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 110,
          height: 30,
          borderRadius: 999,
          background: '#000',
          zIndex: 10,
        }} />
      </div>
    </div>
  );
}

function MobilePortraitFrame({ width, height, children }) {
  return (
    <div style={{
      width: width + 24,
      height: height + 24,
      padding: 12,
      background: 'linear-gradient(135deg, #1a1a1a 0%, #050505 100%)',
      borderRadius: 44,
      boxShadow: '0 30px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
      position: 'relative',
    }}>
      <div style={{
        width, height,
        borderRadius: 32,
        overflow: 'hidden',
        position: 'relative',
        background: '#000',
      }}>
        {children}
        {/* Notch */}
        <div style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 110,
          height: 28,
          borderRadius: 999,
          background: '#000',
          zIndex: 10,
        }} />
      </div>
    </div>
  );
}

function DesktopFrame({ width, height, children, title = 'fgg.app' }) {
  return (
    <div style={{
      width: width + 2,
      height: height + 36,
      borderRadius: 12,
      overflow: 'hidden',
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
    }}>
      {/* Browser chrome */}
      <div style={{ height: 34, background: '#1a1a1a', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 12, borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
        </div>
        <div style={{
          flex: 1,
          height: 22,
          background: '#0a0a0a',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#888',
          fontFamily: 'monospace',
        }}>{title}</div>
      </div>
      <div style={{ width, height, overflow: 'hidden', background: '#000' }}>
        {children}
      </div>
    </div>
  );
}

// ===== App =====

function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const pc = tweaks.playerCount;

  return (
    <>
      <DesignCanvas defaultZoom={0.45}>
        {/* === Section 0 — INTERACTIVE PLAYABLE DEMO === */}
        <DCSection id="playable" title="🎮 인터랙티브 플레이 데모 — 직접 클릭해보세요">
          <DCArtboard id="dt-playable" label="플레이 가능한 인게임 (실제 동작)" width={1282} height={836}>
            <DesktopFrame width={1280} height={800} title="fgg.app/play (live demo)">
              <PlayableDemo width={1280} height={800} />
            </DesktopFrame>
          </DCArtboard>
        </DCSection>

        {/* === Section 1 — IN-GAME (the main focus) === */}
        <DCSection id="ingame" title="인게임 — 메인 플레이 화면">
          <DCArtboard id="dt-ingame" label={`데스크톱 웹 · ${pc}인전`} width={1364} height={842}>
            <DesktopFrame width={1362} height={806} title={`fgg.app/room/LX-2847`}>
              <GameScreen
                playerCount={pc}
                density={tweaks.density}
                variant={tweaks.tableVariant}
                showRecommend={tweaks.showRecommend}
                showEmotes={tweaks.showEmotes}
                width={1362} height={806}
              />
            </DesktopFrame>
          </DCArtboard>

          <DCArtboard id="ml-ingame" label="모바일 가로 (앱)" width={872} height={418}>
            <MobileLandscapeFrame width={844} height={390}>
              <MobileLandscapeIngame width={844} height={390} />
            </MobileLandscapeFrame>
          </DCArtboard>

          <DCArtboard id="ingame-3p" label="3인전 레이아웃" width={1364} height={842}>
            <DesktopFrame width={1362} height={806} title="fgg.app · 3인전">
              <GameScreen playerCount={3} density={tweaks.density} variant={tweaks.tableVariant} width={1362} height={806} />
            </DesktopFrame>
          </DCArtboard>

          <DCArtboard id="ingame-5p" label="5인전 레이아웃" width={1364} height={842}>
            <DesktopFrame width={1362} height={806} title="fgg.app · 5인전">
              <GameScreen playerCount={5} density={tweaks.density} variant={tweaks.tableVariant} width={1362} height={806} />
            </DesktopFrame>
          </DCArtboard>
        </DCSection>

        {/* === Section 2 — Lobby + Rooms === */}
        <DCSection id="lobby" title="로비 · 방 만들기 · 대기실">
          <DCArtboard id="dt-lobby" label="데스크톱 웹 — 로비" width={1282} height={836}>
            <DesktopFrame width={1280} height={800} title="fgg.app">
              <LobbyScreen width={1280} height={800} />
            </DesktopFrame>
          </DCArtboard>

          <DCArtboard id="mp-lobby" label="모바일 세로 — 로비" width={414} height={804}>
            <MobilePortraitFrame width={390} height={780}>
              <MobilePortraitLobby width={390} height={780} />
            </MobilePortraitFrame>
          </DCArtboard>

          <DCArtboard id="dt-waiting" label="데스크톱 — 대기실" width={1282} height={836}>
            <DesktopFrame width={1280} height={800} title="fgg.app/room/LX-2847">
              <WaitingRoomScreen width={1280} height={800} />
            </DesktopFrame>
          </DCArtboard>
        </DCSection>

        {/* === Section 3 — Results === */}
        <DCSection id="results" title="라운드 정산 · 최종 결과">
          <DCArtboard id="dt-round" label="라운드 정산" width={1282} height={836}>
            <DesktopFrame width={1280} height={800} title="fgg.app · round 3 결과">
              <ScoreSettlementScreen width={1280} height={800} />
            </DesktopFrame>
          </DCArtboard>

          <DCArtboard id="dt-final" label="최종 결과" width={1282} height={836}>
            <DesktopFrame width={1280} height={800} title="fgg.app · 게임 종료">
              <FinalResultScreen width={1280} height={800} />
            </DesktopFrame>
          </DCArtboard>
        </DCSection>

        {/* === Section 4 — Guide & Tutorial & Profile === */}
        <DCSection id="guide" title="가이드 · 튜토리얼 · 프로필">
          <DCArtboard id="dt-guide" label="족보 가이드" width={1282} height={836}>
            <DesktopFrame width={1280} height={800} title="fgg.app/guide">
              <HandGuideScreen width={1280} height={800} />
            </DesktopFrame>
          </DCArtboard>

          <DCArtboard id="dt-tutorial" label="튜토리얼" width={1282} height={836}>
            <DesktopFrame width={1280} height={800} title="fgg.app/tutorial">
              <TutorialScreen width={1280} height={800} />
            </DesktopFrame>
          </DCArtboard>

          <DCArtboard id="dt-profile" label="프로필 / 통계" width={1282} height={836}>
            <DesktopFrame width={1280} height={800} title="fgg.app/profile">
              <ProfileScreen width={1280} height={800} />
            </DesktopFrame>
          </DCArtboard>
        </DCSection>

        {/* === Section 5 — Tile inspector === */}
        <DCSection id="tiles" title="타일 — 4가지 문양 × 15개 숫자">
          <DCArtboard id="all-tiles" label="전체 타일 시트" width={1100} height={420}>
            <div style={{ width: 1100, height: 420, background: 'var(--lx-bg-1)', padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['sun', 'moon', 'star', 'cloud'].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 60, fontSize: 12, color: SUITS[s].color, fontWeight: 600 }}>{SUITS[s].name}</div>
                  {Array.from({ length: 15 }, (_, i) => i + 1).map(n => (
                    <Tile key={n} n={n} s={s} size="md" />
                  ))}
                </div>
              ))}
            </div>
          </DCArtboard>

          <DCArtboard id="tile-zoom" label="타일 디테일 (확대)" width={520} height={380}>
            <div style={{ width: 520, height: 380, background: 'var(--lx-bg-1)', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              <Tile n={2} s="sun" size="xl" />
              <Tile n={1} s="moon" size="xl" />
              <Tile n={13} s="star" size="xl" />
              <Tile n={3} s="cloud" size="xl" />
            </div>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      {/* Tweaks panel */}
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection title="플레이어 / 레이아웃">
          <window.TweakRadio
            label="인원수"
            value={tweaks.playerCount}
            onChange={(v) => setTweak('playerCount', v)}
            options={[{ value: 3, label: '3인' }, { value: 4, label: '4인' }, { value: 5, label: '5인' }]}
          />
          <window.TweakRadio
            label="테이블"
            value={tweaks.tableVariant}
            onChange={(v) => setTweak('tableVariant', v)}
            options={[{ value: 'oval', label: '원형' }, { value: 'flat', label: '평면' }]}
          />
          <window.TweakRadio
            label="UI 밀도"
            value={tweaks.density}
            onChange={(v) => setTweak('density', v)}
            options={[{ value: 'compact', label: '조밀' }, { value: 'comfortable', label: '여유' }]}
          />
        </window.TweakSection>
        <window.TweakSection title="게임 보조">
          <window.TweakToggle label="추천 패 표시" value={tweaks.showRecommend} onChange={(v) => setTweak('showRecommend', v)} />
          <window.TweakToggle label="이모트 / 리액션" value={tweaks.showEmotes} onChange={(v) => setTweak('showEmotes', v)} />
        </window.TweakSection>
      </window.TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
