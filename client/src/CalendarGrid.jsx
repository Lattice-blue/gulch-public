import { useEffect, useState } from 'react';

// ONLY FIXED UNIVERSITY LECTURES
const FIXED_LECTURES = [
  // TUESDAY
  { day: 1, title: 'Math in Modern World', start: '08:30', end: '10:00', code: 'GE 4' },
  { day: 1, title: 'Understanding the Self', start: '11:30', end: '13:00', code: 'GE 1' },
  { day: 1, title: 'PATHFIT 1', start: '15:00', end: '16:00', code: 'PATHFIT 1' },

  // WEDNESDAY
  { day: 2, title: 'Contemporary World', start: '07:00', end: '08:30', code: 'GE 3' },
  { day: 2, title: 'Readings in Phil History', start: '10:00', end: '11:30', code: 'GE 2' },
  { day: 2, title: 'College Algebra', start: '13:00', end: '14:30', code: 'BSMATH 111' },
  { day: 2, title: 'Fundamentals of Computing 1', start: '14:30', end: '16:00', code: 'BSMATH 112' },

  // THURSDAY
  { day: 3, title: 'Math in Modern World (Online)', start: '08:30', end: '10:00', code: 'GE 4' },
  { day: 3, title: 'Understanding the Self', start: '11:30', end: '13:00', code: 'GE 1' },
  { day: 3, title: 'PATHFIT 1', start: '15:00', end: '16:00', code: 'PATHFIT 1' },

  // FRIDAY
  { day: 4, title: 'Contemporary World (F2F)', start: '07:00', end: '08:30', code: 'GE 3' },
  { day: 4, title: 'Readings in Phil History', start: '10:00', end: '11:30', code: 'GE 2' },
  { day: 4, title: 'College Algebra (F2F)', start: '13:00', end: '14:30', code: 'BSMATH 111' },
  { day: 4, title: 'Fundamentals of Computing 1', start: '14:30', end: '16:00', code: 'BSMATH 112' },

  // SUNDAY
  { day: 6, title: 'ROTC (NSTP 1)', start: '13:00', end: '17:00', code: 'NSTP 1' }
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 5); // 05:00 to 20:00
const START_DAY_MINUTES = 5 * 60;
const HOUR_HEIGHT = 30;

export default function CalendarGrid({ tasks = [] }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const liveTopOffset = ((currentMinutes - START_DAY_MINUTES) / 60) * HOUR_HEIGHT;
  const currentDayIndex = (now.getDay() + 6) % 7; // Mon = 0

  // Filter dynamic scheduled tasks from SQLite
  // AFTER (Safely handles string and number types)
const scheduledTasks = tasks.filter(t => 
  t.scheduledDay !== null && 
  t.scheduledDay !== undefined && 
  t.scheduledDay !== '' && 
  t.startTime && 
  t.endTime
);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflowX: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ minWidth: '850px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, flex: 1 }}>
        
        {/* DAYS HEADER */}
        <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', paddingBottom: '8px' }}>
          <div />
          {DAYS.map((day, idx) => (
            <div key={day} style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '0.1em', color: idx === currentDayIndex ? '#00f0ff' : 'rgba(255,255,255,0.4)', fontWeight: idx === currentDayIndex ? 'bold' : 'normal' }}>
              {day}
            </div>
          ))}
        </div>

        {/* TIME GRID */}
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', position: 'relative', minHeight: `${HOURS.length * HOUR_HEIGHT}px` }}>
            
            {/* Time Axis Column */}
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
              {HOURS.map(hour => (
                <div key={hour} style={{ height: `${HOUR_HEIGHT}px`, boxSizing: 'border-box', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 0, right: '8px', transform: 'translateY(-50%)', fontSize: '9px', color: 'rgba(255,255,255,0.4)', background: '#0d0d0d', padding: '0 2px', zIndex: 4 }}>
                    {String(hour).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* 7 DAY COLUMNS */}
            {DAYS.map((_, dayIdx) => (
              <div 
                key={dayIdx} 
                style={{ 
                  position: 'relative', 
                  borderLeft: dayIdx === currentDayIndex ? '1px solid rgba(0, 240, 255, 0.4)' : 'none',
                  borderRight: dayIdx === currentDayIndex ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.04)',
                  background: dayIdx === currentDayIndex ? 'rgba(0, 240, 255, 0.03)' : 'transparent',
                  boxShadow: dayIdx === currentDayIndex ? 'inset 0 0 20px rgba(0, 240, 255, 0.06)' : 'none',
                  zIndex: dayIdx === currentDayIndex ? 3 : 1
                }}
              >
                {HOURS.map(hour => (
                  <div key={hour} style={{ height: `${HOUR_HEIGHT}px`, borderBottom: '1px dashed rgba(255,255,255,0.03)' }} />
                ))}

                {/* 1. FIXED LECTURES */}
                {FIXED_LECTURES.filter(e => e.day === dayIdx).map((event, i) => {
                  const startMins = timeToMinutes(event.start);
                  const endMins = timeToMinutes(event.end);
                  const top = ((startMins - START_DAY_MINUTES) / 60) * HOUR_HEIGHT;
                  const height = ((endMins - startMins) / 60) * HOUR_HEIGHT;

                  return (
                    <div key={'f_' + i} style={{ position: 'absolute', top: `${top}px`, height: `${height - 2}px`, left: '2px', right: '2px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '2px', padding: '4px 6px', boxSizing: 'border-box', overflow: 'hidden', zIndex: 2 }}>
                      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                        [{event.code}] {event.start}-{event.end}
                      </div>
                      <div style={{ fontSize: '9px', color: '#fff', marginTop: '2px', lineHeight: '1.2' }}>
                        {event.title}
                      </div>
                    </div>
                  );
                })}

                {/* 2. DYNAMIC SCHEDULED TASKS FROM SQLITE */}
                {scheduledTasks.filter(t => Number(t.scheduledDay) === dayIdx).map((task) => {
                  const startMins = timeToMinutes(task.startTime);
                  const endMins = timeToMinutes(task.endTime);
                  const top = ((startMins - START_DAY_MINUTES) / 60) * HOUR_HEIGHT;
                  const height = ((endMins - startMins) / 60) * HOUR_HEIGHT;
                  const isCompleted = task.status === 'Completed';

                  return (
                    <div 
                      key={task.id} 
                      style={{ 
                        position: 'absolute', 
                        top: `${top}px`, 
                        height: `${height - 2}px`, 
                        left: '2px', 
                        right: '2px', 
                        background: isCompleted ? 'rgba(57, 255, 20, 0.1)' : 'rgba(0, 240, 255, 0.15)', 
                        border: isCompleted ? '1px solid #39ff14' : '1px solid #00f0ff', 
                        boxShadow: isCompleted ? '0 0 8px rgba(57,255,20,0.2)' : '0 0 10px rgba(0,240,255,0.2)',
                        borderRadius: '2px', 
                        padding: '4px 6px', 
                        boxSizing: 'border-box', 
                        overflow: 'hidden', 
                        zIndex: 4 
                      }}
                    >
                      <div style={{ fontSize: '8px', color: isCompleted ? '#39ff14' : '#00f0ff', fontWeight: 'bold' }}>
                        [{task.category}] {task.startTime}-{task.endTime}
                      </div>
                      <div style={{ fontSize: '9px', color: '#fff', marginTop: '2px', lineHeight: '1.2', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        {task.title}
                      </div>
                    </div>
                  );
                })}

              </div>
            ))}

            {/* LIVE RED INDICATOR LINE */}
            {liveTopOffset >= 0 && liveTopOffset <= HOURS.length * HOUR_HEIGHT && (
              <div style={{ position: 'absolute', top: `${liveTopOffset}px`, left: '50px', right: 0, height: '1px', background: '#ff3333', boxShadow: '0 0 8px #ff3333', zIndex: 5, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', left: '-50px', top: '-6px', fontSize: '8px', color: '#ff3333', fontWeight: 'bold' }}>
                  NOW
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}