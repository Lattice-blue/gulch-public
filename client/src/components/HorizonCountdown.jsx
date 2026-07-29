import { useState, useEffect } from 'react';

const MILESTONES = [
  { id: 'sem1_end', label: 'SEMESTER_1_END', target: new Date('2026-10-18T00:00:00'), color: '#39ff14' },
  { id: 'yr1_completion', label: 'YEAR_1_COMPLETION', target: new Date('2027-05-31T00:00:00'), color: '#00f0ff' },
  { id: 'yr2_gauntlet', label: 'YEAR_2_GAUNTLET', target: new Date('2027-08-01T00:00:00'), color: '#ffaa00' },
  { id: 'rudin_digestion', label: 'RUDIN_DIGESTION', target: new Date('2028-06-01T00:00:00'), color: '#a855f7' },
  { id: 'thesis_defense', label: 'THESIS_DEFENSE_MARS', target: new Date('2030-05-15T00:00:00'), color: '#ff3333' }
];

export default function HorizonCountdown() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeDiff = (target) => {
    const diff = target - now;
    if (diff <= 0) return 'EXECUTED';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    const pad = (n) => String(n).padStart(2, '0');
    return `T-${days}D ${pad(hours)}H ${pad(mins)}M ${pad(secs)}S`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.12em', background: 'rgba(0, 0, 0, 0.75)', padding: '16px 20px', border: '1px solid rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)', userSelect: 'none', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9)', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', marginBottom: '4px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
        &gt; TEMPORAL HORIZON COUNTDOWNS
      </div>
      {MILESTONES.map(m => (
        <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px' }}>[{m.label}]</span>
          <span style={{ color: m.color, fontWeight: 'bold', fontSize: '9px' }}>{formatTimeDiff(m.target)}</span>
        </div>
      ))}
    </div>
  );
}