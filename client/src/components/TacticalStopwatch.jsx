export default function TacticalStopwatch({ seconds, isActive, onToggle, onReset }) {
  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return { hours: pad(h), mins: pad(m), secs: pad(s) };
  };

  const time = formatTime(seconds);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '10px',
      letterSpacing: '0.12em',
      background: 'rgba(0, 0, 0, 0.75)',
      padding: '16px 20px',
      border: '1px solid rgba(0, 240, 255, 0.3)',
      backdropFilter: 'blur(12px)',
      userSelect: 'none',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9), 0 0 15px rgba(0, 240, 255, 0.1)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
        <span>&gt; OPERATIONAL DEEP WORK TIMER</span>
        <span style={{ color: isActive ? '#39ff14' : 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>
          {isActive ? '[ RUNNING ]' : '[ PAUSED ]'}
        </span>
      </div>

      {/* TIMER READOUT */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px', margin: '6px 0', color: isActive ? '#00f0ff' : '#fff', textShadow: isActive ? '0 0 12px rgba(0, 240, 255, 0.6)' : 'none' }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{time.hours}:{time.mins}:{time.secs}</span>
      </div>

      {/* CONTROLS */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onToggle}
          style={{
            flex: 1,
            background: isActive ? 'rgba(255, 170, 0, 0.2)' : 'rgba(57, 255, 20, 0.2)',
            border: isActive ? '1px solid #ffaa00' : '1px solid #39ff14',
            color: isActive ? '#ffaa00' : '#39ff14',
            padding: '6px',
            fontFamily: 'inherit',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {isActive ? 'PAUSE' : 'START SESSION'}
        </button>
        <button
          onClick={onReset}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.6)',
            padding: '6px 12px',
            fontFamily: 'inherit',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          RESET
        </button>
      </div>
    </div>
  );
}