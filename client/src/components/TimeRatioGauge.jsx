export default function TimeRatioGauge({ tasks = [], subjects = [] }) {
  let mathMinutes = 9 * 60;
  let geMinutes = 15 * 60;

  tasks.forEach(t => {
    if (t.scheduledDay !== null && t.scheduledDay !== undefined && t.startTime && t.endTime) {
      const [h1, m1] = t.startTime.split(':').map(Number);
      const [h2, m2] = t.endTime.split(':').map(Number);
      const durationMins = (h2 * 60 + m2) - (h1 * 60 + m1);

      const subj = subjects.find(s => s.id === t.subjectId);
      const isMathOrSovereign = (subj?.category === 'Major' || subj?.type === 'SOVEREIGN' || subj?.id === 'ge4');

      if (isMathOrSovereign) {
        mathMinutes += durationMins;
      } else {
        geMinutes += durationMins;
      }
    }
  });

  const totalMinutes = mathMinutes + geMinutes;
  const mathHours = mathMinutes / 60;
  const geHours = geMinutes / 60;
  const mathPercent = totalMinutes > 0 ? Math.round((mathMinutes / totalMinutes) * 100) : 0;

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', gap: '8px', 
      fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.12em', 
      background: 'rgba(0, 0, 0, 0.75)', padding: '16px 20px', 
      border: '1px solid rgba(0, 240, 255, 0.3)', backdropFilter: 'blur(12px)', 
      userSelect: 'none', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9), 0 0 15px rgba(0, 240, 255, 0.1)', 
      width: '100%', boxSizing: 'border-box' 
    }}>
      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
        &gt; WEEKLY TIME ALLOCATION RATIO
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>STATUS:</span>
        <span style={{ color: mathPercent >= 50 ? '#39ff14' : '#ffaa00', fontWeight: 'bold', fontSize: '9px' }}>
          {mathPercent >= 50 ? '[ OPTIMAL ]' : '[ WARN: GE OVERFLOW ]'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00f0ff', fontWeight: 'bold' }}>
          <span>MATH/SOVEREIGN</span>
          <span>{mathHours.toFixed(1)}H ({mathPercent}%)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)' }}>
          <span>GE/ADMIN</span>
          <span>{geHours.toFixed(1)}H ({100 - mathPercent}%)</span>
        </div>
      </div>

      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', display: 'flex', marginTop: '4px' }}>
        <div style={{ width: `${mathPercent}%`, background: '#00f0ff', boxShadow: '0 0 8px #00f0ff', transition: 'width 0.5s ease' }} />
        <div style={{ width: `${100 - mathPercent}%`, background: 'rgba(255, 170, 0, 0.5)', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}