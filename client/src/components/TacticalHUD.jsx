import { useState, useEffect } from 'react';

export default function TacticalHUD() {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const iso = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setUtcTime(iso);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, padding: '70px 25px 25px 25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', letterSpacing: '0.15em' }}>
        <div>
          <div style={{ color: 'rgba(0, 240, 255, 0.7)' }}>&gt; SYS_STATUS: <span style={{ color: '#39ff14' }}>ONLINE</span></div>
          <div style={{ color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>ENCRYPTED_SESSION: AES-256-GCM</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(0, 240, 255, 0.7)' }}>&gt; {utcTime}</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>LATENCY: 14ms | UPTIME: 99.98%</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', letterSpacing: '0.15em' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.3)' }}>PRIMARY_NODE: NORSU_DUMAGUETE</div>
          <div style={{ color: 'rgba(0, 240, 255, 0.5)', marginTop: '4px' }}>COORDS: 09.3068° N / 123.3038° E</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)' }}>PROTOCOL: VANGUARD</div>
          <div style={{ color: '#39ff14', marginTop: '4px' }}>[ OPERATIONAL_STATE: SECURE ]</div>
        </div>
      </div>
    </div>
  );
}