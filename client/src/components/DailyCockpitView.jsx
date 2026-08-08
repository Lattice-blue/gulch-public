import { useState, useEffect } from 'react';

// FIXED UNIVERSITY LECTURES
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

const getLocalDateString = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

export default function DailyCockpitView({ tasks = [], subjects = [], onToggleTask, onInspectTask }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = getLocalDateString(now);
  const todayDayIdx = (now.getDay() + 6) % 7; // Mon = 0

  // 1. Today's Fixed Lectures
  const todayLectures = FIXED_LECTURES.filter(l => l.day === todayDayIdx);

  // 2. Today's Scheduled Tasks
  const todayScheduledTasks = tasks.filter(t => 
    t.scheduledDate === todayStr && 
    t.status !== 'Completed' && 
    t.status !== 'Failed'
  );

  // 3. Tasks Due Today
  const todayDeadlines = tasks.filter(t => 
    t.deadline === todayStr && 
    t.status !== 'Completed' && 
    t.status !== 'Failed'
  );

  const dayFormatted = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).toUpperCase();

  return (
    <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px', overflowY: 'auto', fontFamily: "'JetBrains Mono', monospace", zIndex: 4 }}>
      
      {/* COCKPIT HEADER */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '9px', color: '#00f0ff', letterSpacing: '0.2em', marginBottom: '4px' }}>
            [ DAILY FLIGHT PLAN // COMMAND COCKPIT ]
          </div>
          <h1 style={{ fontSize: '20px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {dayFormatted}
          </h1>
        </div>
        
        <div style={{ textAlign: 'right', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
          <div>OBJECTIVES ACTIVE: <strong style={{ color: '#00f0ff' }}>{todayScheduledTasks.length + todayDeadlines.length}</strong></div>
          <div>LECTURES TODAY: <strong style={{ color: '#ffaa00' }}>{todayLectures.length}</strong></div>
        </div>
      </div>

      {/* THREE-COLUMN GRID FOR DAILY SECTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* PANEL 1: ACADEMIC LECTURES TODAY */}
        <div style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '10px', color: '#ffaa00', letterSpacing: '0.15em', marginBottom: '15px', borderBottom: '1px solid rgba(255,170,0,0.3)', paddingBottom: '8px' }}>
            // ACADEMIC LECTURES TODAY ({todayLectures.length})
          </div>

          {todayLectures.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textAlign: 'center', padding: '20px' }}>
              NO LECTURES SCHEDULED FOR TODAY
            </div>
          ) : (
            todayLectures.map((lec, idx) => (
              <div key={idx} style={{ background: 'rgba(255, 170, 0, 0.05)', borderLeft: '3px solid #ffaa00', padding: '10px 12px', marginBottom: '10px' }}>
                <div style={{ fontSize: '9px', color: '#ffaa00', fontWeight: 'bold' }}>
                  [{lec.code}] {lec.start} - {lec.end}
                </div>
                <div style={{ fontSize: '11px', color: '#fff', marginTop: '4px', fontWeight: 'bold' }}>
                  {lec.title}
                </div>
              </div>
            ))
          )}
        </div>

        {/* PANEL 2: TODAY'S SCHEDULED TIME BLOCKS */}
        <div style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(0, 240, 255, 0.3)', boxShadow: '0 0 20px rgba(0,240,255,0.05)', padding: '20px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '10px', color: '#00f0ff', letterSpacing: '0.15em', marginBottom: '15px', borderBottom: '1px solid rgba(0, 240, 255, 0.3)', paddingBottom: '8px' }}>
            // TODAY'S SCHEDULED WORK ({todayScheduledTasks.length})
          </div>

          {todayScheduledTasks.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textAlign: 'center', padding: '20px' }}>
              NO WORK BLOCKS SCHEDULED FOR TODAY
            </div>
          ) : (
            todayScheduledTasks.map(task => {
              const subject = subjects.find(s => s.id === task.subjectId);
              return (
                <div key={task.id} style={{ background: 'rgba(0, 240, 255, 0.05)', borderLeft: '3px solid #00f0ff', padding: '10px 12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: '#00f0ff' }}>
                      [{subject ? subject.name : task.subjectId}] {task.startTime}-{task.endTime}
                    </div>
                    <div 
                      onClick={() => onInspectTask && onInspectTask(task)} 
                      style={{ fontSize: '11px', color: '#fff', marginTop: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      title="Click to inspect task"
                    >
                      {task.title}
                    </div>
                  </div>
                  <button 
                    onClick={() => onToggleTask(task)} 
                    style={{ background: 'rgba(57, 255, 20, 0.15)', border: '1px solid #39ff14', color: '#39ff14', fontSize: '9px', padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    DONE
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* PANEL 3: DEADLINES DUE TODAY */}
        <div style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255, 77, 77, 0.3)', padding: '20px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '10px', color: '#ff4d4d', letterSpacing: '0.15em', marginBottom: '15px', borderBottom: '1px solid rgba(255,77,77,0.3)', paddingBottom: '8px' }}>
            // DEADLINES DUE TODAY ({todayDeadlines.length})
          </div>

          {todayDeadlines.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textAlign: 'center', padding: '20px' }}>
              NO DEADLINES DUE TODAY
            </div>
          ) : (
            todayDeadlines.map(task => {
              const subject = subjects.find(s => s.id === task.subjectId);
              return (
                <div key={task.id} style={{ background: 'rgba(255, 77, 77, 0.05)', borderLeft: '3px solid #ff4d4d', padding: '10px 12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: '#ff4d4d' }}>
                      [{subject ? subject.name : task.subjectId}] DUE TODAY
                    </div>
                    <div 
                      onClick={() => onInspectTask && onInspectTask(task)} 
                      style={{ fontSize: '11px', color: '#fff', marginTop: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      title="Click to inspect task"
                    >
                      {task.title}
                    </div>
                  </div>
                  <button 
                    onClick={() => onToggleTask(task)} 
                    style={{ background: 'rgba(57, 255, 20, 0.15)', border: '1px solid #39ff14', color: '#39ff14', fontSize: '9px', padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    DONE
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* FOOTER SKUNK WORKS QUOTE */}
      <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '10px', letterSpacing: '0.2em' }}>
        "BE QUICK, BE QUIET, BE ON TIME." — CLARENCE L. JOHNSON
      </div>
    </div>
  );
}