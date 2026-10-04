'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/hooks/useSocket';
import { useGameStore, type RoomInfo } from '@/store/gameStore';
import { getClientId, saveSession } from '@/lib/clientId';
import type { GameMode } from '@lexio/game-logic';

function modeBtn(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 1,
    padding: '10px 12px',
    borderRadius: 10,
    border: `1.5px solid ${active ? 'var(--fgg-gold)' : 'var(--fgg-line)'}`,
    background: active ? 'rgba(212, 166, 86, 0.14)' : 'rgba(10, 15, 13, 0.4)',
    color: active ? 'var(--fgg-gold-bright)' : 'var(--fgg-text)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 140ms',
    textAlign: 'left',
    lineHeight: 1.2,
  };
}

function LogoMark({ size = 88 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.18),
        background: 'linear-gradient(135deg, var(--fgg-gold-bright), var(--fgg-gold-deep))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--fgg-font-display)',
        fontStyle: 'italic',
        fontWeight: 600,
        color: '#1A1408',
        fontSize: size * 0.55,
        boxShadow:
          '0 8px 28px rgba(212, 166, 86, 0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
        lineHeight: 1,
      }}
    >
      F
    </div>
  );
}

export function LobbyScreen() {
  const nameRef = useRef<HTMLInputElement>(null);
  const joinCodeRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('recommended');
  const cleanupRef = useRef<(() => void) | null>(null);
  const router = useRouter();
  const { setRoom, setRoomInfo, setError } = useGameStore();

  const handleBack = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setMode('idle');
    setLoading(false);
    setErrorMsg('');
  };

  const handleCreate = () => {
    const name = nameRef.current?.value.trim() ?? '';
    if (!name) return;
    setLoading(true);
    setErrorMsg('');
    const socket = getSocket();

    const onCreated = ({ roomId, room }: { roomId: string; room: RoomInfo }) => {
      cleanup();
      setRoom(roomId, getClientId(), name);
      setRoomInfo(room);
      saveSession(roomId, name);
      router.push(`/room/${roomId}`);
    };
    const onError = ({ reason }: { reason: string }) => {
      cleanup();
      setError(reason);
      setErrorMsg(reason);
      setLoading(false);
    };
    const onConnectError = () => {
      cleanup();
      setErrorMsg('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
    };
    const cleanup = () => {
      socket.off('room:created', onCreated);
      socket.off('room:error', onError);
      socket.off('connect_error', onConnectError);
    };
    cleanupRef.current = cleanup;

    socket.on('room:created', onCreated);
    socket.on('room:error', onError);
    socket.on('connect_error', onConnectError);

    if (!socket.connected) socket.connect();
    socket.emit('room:create', { playerName: name, mode: gameMode });
  };

  const handleJoin = () => {
    const name = nameRef.current?.value.trim() ?? '';
    const joinCode = joinCodeRef.current?.value.trim().toUpperCase() ?? '';
    if (!name || !joinCode) return;
    setLoading(true);
    setErrorMsg('');
    const socket = getSocket();

    const onJoined = ({ roomId, room }: { roomId: string; room: RoomInfo }) => {
      cleanup();
      setRoom(roomId, getClientId(), name);
      setRoomInfo(room);
      saveSession(roomId, name);
      router.push(`/room/${roomId}`);
    };
    const onError = ({ reason }: { reason: string }) => {
      cleanup();
      setError(reason);
      setErrorMsg(reason);
      setLoading(false);
    };
    const onConnectError = () => {
      cleanup();
      setErrorMsg('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
    };
    const cleanup = () => {
      socket.off('room:joined', onJoined);
      socket.off('room:error', onError);
      socket.off('connect_error', onConnectError);
    };
    cleanupRef.current = cleanup;

    socket.on('room:joined', onJoined);
    socket.on('room:error', onError);
    socket.on('connect_error', onConnectError);

    if (!socket.connected) socket.connect();
    socket.emit('room:join', { roomId: joinCode, playerName: name });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--fgg-bg-1)',
    border: '1px solid var(--fgg-line)',
    color: 'var(--fgg-text)',
    padding: '12px 16px',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: 'var(--fgg-font-body, inherit)',
    outline: 'none',
    transition: 'border-color 120ms, box-shadow 120ms',
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(212,166,86,0.10) 0%, transparent 55%), radial-gradient(ellipse at top, rgba(212,166,86,0.05) 0%, transparent 65%), var(--fgg-bg-0)',
        color: 'var(--fgg-text)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── 사신수 floating background — 동서남북, vmin으로 적응형 ── */}
      {/* 위 (북): 현무 — 水/陰 */}
      <img
        src="/sasinsoo/hyunmu.png"
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: 'absolute',
          top: '4%',
          left: '50%',
          width: 'min(28vmin, 220px)',
          opacity: 0.16,
          filter: 'blur(0.5px) saturate(0.85)',
          mixBlendMode: 'screen',
          ['--tx' as string]: '-50%',
          ['--ty' as string]: '0px',
          animation: 'fgg-float 6s ease-in-out infinite',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />
      {/* 아래 (남): 주작 — 火/陽 */}
      <img
        src="/sasinsoo/jujak.png"
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: 'absolute',
          bottom: '4%',
          left: '50%',
          width: 'min(28vmin, 220px)',
          opacity: 0.14,
          filter: 'blur(0.5px) saturate(0.95)',
          mixBlendMode: 'screen',
          ['--tx' as string]: '-50%',
          ['--ty' as string]: '0px',
          animation: 'fgg-float 7s ease-in-out infinite -2s',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />
      {/* 좌 (동): 청룡 — 木 */}
      <img
        src="/sasinsoo/cheongryong.png"
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: 'absolute',
          top: '50%',
          left: '0%',
          width: 'min(34vmin, 260px)',
          opacity: 0.14,
          filter: 'blur(0.5px) saturate(0.85)',
          mixBlendMode: 'screen',
          ['--tx' as string]: '0',
          ['--ty' as string]: '-50%',
          animation: 'fgg-float 5.5s ease-in-out infinite -1s',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />
      {/* 우 (서): 백호 — 金 */}
      <img
        src="/sasinsoo/baekho.png"
        alt=""
        aria-hidden
        draggable={false}
        style={{
          position: 'absolute',
          top: '50%',
          right: '0%',
          width: 'min(28vmin, 220px)',
          opacity: 0.16,
          filter: 'blur(0.5px) saturate(0.85)',
          mixBlendMode: 'screen',
          ['--tx' as string]: '0',
          ['--ty' as string]: '-50%',
          animation: 'fgg-float 6.5s ease-in-out infinite -3s',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      />

      {/* 중앙 골드 spotlight */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(80vmin, 480px)',
          height: 'min(80vmin, 480px)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(242,200,120,0.24) 0%, rgba(212,166,86,0.08) 35%, transparent 70%)',
          animation: 'fgg-glow-pulse 5s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(8px)',
        }}
      />

      {/* ── Hero / 폼 ── */}
      <div
        className="flex flex-col items-center text-center"
        style={{
          marginBottom: 'clamp(16px, 4vw, 32px)',
          position: 'relative',
          zIndex: 1,
          animation: 'fgg-fade-up 700ms ease-out',
        }}
      >
        <LogoMark size={72} />
        <h1
          className="fgg-display"
          style={{
            margin: 'clamp(12px, 3vw, 20px) 0 6px',
            fontSize: 'clamp(44px, 11vw, 64px)',
            letterSpacing: '0.14em',
            color: 'var(--fgg-text)',
            background:
              'linear-gradient(180deg, var(--fgg-gold-bright) 0%, var(--fgg-gold) 60%, var(--fgg-gold-deep) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
          }}
        >
          FGG
        </h1>
        <div
          className="fgg-eyebrow"
          style={{ marginTop: 4, marginBottom: 10 }}
        >
          Four Guardian Gods
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: 'var(--fgg-text-dim)',
            letterSpacing: '0.02em',
          }}
        >
          사신수 타일 × 포커 족보 클라이밍 게임
        </p>
      </div>

      {/* Panel */}
      <div
        className="fgg-panel"
        style={{
          width: '100%',
          maxWidth: 380,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          position: 'relative',
          zIndex: 1,
          animation: 'fgg-fade-up 800ms ease-out 100ms backwards',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        <div>
          <label
            className="fgg-eyebrow"
            style={{ display: 'block', marginBottom: 8 }}
          >
            닉네임
          </label>
          <input
            ref={nameRef}
            id="player-name"
            defaultValue=""
            placeholder="이름 입력..."
            maxLength={12}
            style={inputStyle}
          />
        </div>

        {mode === 'join' && (
          <div>
            <label
              className="fgg-eyebrow"
              style={{ display: 'block', marginBottom: 8 }}
            >
              방 코드
            </label>
            <input
              ref={joinCodeRef}
              id="room-code"
              defaultValue=""
              placeholder="6자리 코드..."
              maxLength={6}
              style={{
                ...inputStyle,
                textAlign: 'center',
                letterSpacing: '0.4em',
                fontSize: 20,
                fontWeight: 700,
                fontFamily: 'var(--fgg-font-num)',
                color: 'var(--fgg-gold-bright)',
              }}
            />
          </div>
        )}

        {/* 게임 모드 선택 — '방 만들기' 클릭 후 mode==='create'일 때만 표시 */}
        {mode === 'create' && (
          <div>
            <label className="fgg-eyebrow" style={{ display: 'block', marginBottom: 8 }}>
              게임 모드
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setGameMode('recommended')}
                style={modeBtn(gameMode === 'recommended')}
              >
                <span style={{ fontWeight: 700, fontSize: 13 }}>기본</span>
                <span style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>인원수별</span>
                <span style={{ fontSize: 9, opacity: 0.55 }}>3인:1~9 / 4인:1~13 / 5인:1~15</span>
              </button>
              <button
                type="button"
                onClick={() => setGameMode('full')}
                style={modeBtn(gameMode === 'full')}
              >
                <span style={{ fontWeight: 700, fontSize: 13 }}>전체</span>
                <span style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>1~15 모두</span>
                <span style={{ fontSize: 9, opacity: 0.55 }}>3인:20장 / 4인:15장 / 5인:12장</span>
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {mode !== 'join' && (
            <button
              id="btn-create"
              onClick={() => (mode === 'idle' ? setMode('create') : handleCreate())}
              disabled={loading}
              className="fgg-btn fgg-btn--primary"
              style={{ padding: '14px 18px', fontSize: 14 }}
            >
              {mode === 'create'
                ? loading
                  ? '생성 중...'
                  : '이 모드로 시작'
                : '＋ 방 만들기'}
            </button>
          )}

          {mode !== 'create' && (
            <button
              id="btn-join"
              onClick={() => (mode === 'idle' ? setMode('join') : handleJoin())}
              disabled={loading}
              className="fgg-btn"
              style={{ padding: '14px 18px', fontSize: 14 }}
            >
              {mode === 'join' ? (loading ? '입장 중...' : '입장하기') : '방 입장'}
            </button>
          )}

          {mode !== 'idle' && (
            <button
              onClick={handleBack}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--fgg-text-muted)',
                fontSize: 12,
                padding: '6px',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                transition: 'color 120ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--fgg-text-dim)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--fgg-text-muted)';
              }}
            >
              ← 돌아가기
            </button>
          )}

          {errorMsg && (
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: '#FF8088',
                textAlign: 'center',
                padding: '8px 12px',
                background: 'rgba(230, 57, 70, 0.08)',
                border: '1px solid rgba(230, 57, 70, 0.3)',
                borderRadius: 8,
              }}
            >
              {errorMsg}
            </p>
          )}
        </div>

        {/* Help links — ghost gold */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            paddingTop: 14,
            marginTop: 4,
            borderTop: '1px solid var(--fgg-line)',
          }}
        >
          <Link
            href="/guide"
            className="fgg-help-link"
            style={{
              flex: 1,
              padding: '9px 12px',
              fontSize: 12,
              textAlign: 'center',
              borderRadius: 8,
              border: '1px solid var(--fgg-line)',
              background: 'transparent',
              color: 'var(--fgg-gold)',
              textDecoration: 'none',
              letterSpacing: '0.04em',
              fontWeight: 500,
              transition: 'border-color 120ms, color 120ms, background 120ms',
            }}
          >
            족보 보기
          </Link>
          <Link
            href="/tutorial"
            className="fgg-help-link"
            style={{
              flex: 1,
              padding: '9px 12px',
              fontSize: 12,
              textAlign: 'center',
              borderRadius: 8,
              border: '1px solid var(--fgg-line)',
              background: 'transparent',
              color: 'var(--fgg-gold)',
              textDecoration: 'none',
              letterSpacing: '0.04em',
              fontWeight: 500,
              transition: 'border-color 120ms, color 120ms, background 120ms',
            }}
          >
            튜토리얼
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 28,
          fontSize: 11,
          color: 'var(--fgg-text-muted)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          position: 'relative',
          zIndex: 1,
          animation: 'fgg-fade-up 900ms ease-out 200ms backwards',
        }}
      >
        3~5인 · 온라인 멀티플레이
      </div>
    </div>
  );
}
