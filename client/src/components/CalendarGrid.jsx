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

// Helper to format Date to YYYY-MM-DD
const formatDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CalendarGrid({ tasks = [], subjects = [] }) {
  const [now, setNow] = useState(new Date());
  const [viewMode, setViewMode] = useState('WEEK'); // 'MONTH' | 'WEEK' | 'DAY'
  const [currentDate, setCurrentDate] = useState(new Date());

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
  const todayStr = formatDateStr(now);

  // NAVIGATION HANDLERS
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'MONTH') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'WEEK') d.setDate(d.getDate() - 7);
    else if (viewMode === 'DAY') d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'MONTH') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'WEEK') d.setDate(d.getDate() + 7);
    else if (viewMode === 'DAY') d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => setCurrentDate(new Date());

  // GENERATE DATES FOR WEEK VIEW
  const getWeekDates = (refDate) => {
    const d = new Date(refDate);
    const dayIndex = (d.getDay() + 6) % 7; // Mon = 0
    d.setDate(d.getDate() - dayIndex);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const temp = new Date(d);
      temp.setDate(temp.getDate() + i);
      week.push(temp);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  // GENERATE DAYS FOR MONTH VIEW
  const getMonthDays = (refDate) => {
    const year = refDate.getFullYear();
    const month = refDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayIdx = (firstDayOfMonth.getDay() + 6) % 7; // Mon = 0

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDayIdx);

    const monthDays = [];
    for (let i = 0; i < 35; i++) { // 5-week grid
      const temp = new Date(startDate);
      temp.setDate(temp.getDate() + i);
      monthDays.push(temp);
    }
    return monthDays;
  };

  const monthDays = getMonthDays(currentDate);

  // HEADER TITLE TEXT
  const getTitleText = () => {
    const options = { month: 'long', year: 'numeric' };
    if (viewMode === 'MONTH') {
      return currentDate.toLocaleDateString('en-US', options).toUpperCase();
    } else if (viewMode === 'WEEK') {
      const start = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`.toUpperCase();
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    }
  };

// Helper to check if task belongs to a specific date string
// Helper to check if task belongs to a specific date string
  const isTaskOnDate = (t, dateStr) => {
    if (t.scheduledDate && t.scheduledDate.trim() !== '') {
      return t.scheduledDate === dateStr;
    }
    return false;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, fontFamily: "'JetBrains Mono', monospace" }}>
      
      {/* TOOLBAR: NAVIGATION & VIEW SWITCHER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.8)', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={handlePrev} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
            ◄ PREV
          </button>
          <button onClick={handleToday} style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid #00f0ff', color: '#00f0ff', fontSize: '10px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
            TODAY
          </button>
          <button onClick={handleNext} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
            NEXT ►
          </button>
          <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold', marginLeft: '10px', letterSpacing: '0.1em' }}>
            {getTitleText()}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['MONTH', 'WEEK', 'DAY'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                background: viewMode === mode ? 'rgba(0, 240, 255, 0.25)' : 'transparent',
                border: viewMode === mode ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.15)',
                color: viewMode === mode ? '#00f0ff' : 'rgba(255,255,255,0.5)',
                fontSize: '9px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              [{mode}]
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: MONTH VIEW */}
      {viewMode === 'MONTH' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
          {/* Days Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', padding: '6px 0' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
                {d}
              </div>
            ))}
          </div>

          {/* 35-Day Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, autoRows: '1fr', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
            {monthDays.map(dateObj => {
              const dateStr = formatDateStr(dateObj);
              const isToday = dateStr === todayStr;
              const isCurrentMonth = dateObj.getMonth() === currentDate.getMonth();
              const dayIdx = (dateObj.getDay() + 6) % 7;

              const dateTasks = tasks.filter(t => isTaskOnDate(t, dateStr, dayIdx) && t.status !== 'Completed' && t.status !== 'Failed');

              return (
                <div
                  key={dateStr}
                  style={{
                    background: isToday ? 'rgba(0, 240, 255, 0.08)' : 'rgba(0, 0, 0, 0.75)',
                    border: isToday ? '1px solid #00f0ff' : 'none',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: isCurrentMonth ? 1 : 0.35,
                    minHeight: '80px',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: isToday ? '#00f0ff' : 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
                    {dateObj.getDate()}
                  </div>

                  {/* Tasks Pills in Month Cell */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
                    {dateTasks.map(t => (
                      <div
                        key={t.id}
                        style={{
                          background: 'rgba(0, 240, 255, 0.2)',
                          border: '1px solid rgba(0, 240, 255, 0.5)',
                          color: '#fff',
                          fontSize: '8px',
                          padding: '2px 4px',
                          borderRadius: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        [{t.startTime || 'ALL-DAY'}] {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK VIEW (Hourly Timeline) */}
      {viewMode === 'WEEK' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowX: 'auto' }}>
          <div style={{ minWidth: '850px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Days Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', paddingBottom: '6px', paddingTop: '6px' }}>
              <div />
              {weekDates.map((dateObj, idx) => {
                const dateStr = formatDateStr(dateObj);
                const isToday = dateStr === todayStr;
                return (
                  <div key={idx} style={{ textAlign: 'center', fontSize: '10px', color: isToday ? '#00f0ff' : 'rgba(255,255,255,0.6)', fontWeight: isToday ? 'bold' : 'normal' }}>
                    {DAYS[idx]} {dateObj.getDate()}
                  </div>
                );
              })}
            </div>

            {/* Time Grid */}
            <div style={{ flex: 1, overflowY: 'auto', position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', position: 'relative', minHeight: `${HOURS.length * HOUR_HEIGHT}px` }}>
                
                {/* Time Axis */}
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                  {HOURS.map(hour => (
                    <div key={hour} style={{ height: `${HOUR_HEIGHT}px`, boxSizing: 'border-box', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: 0, right: '8px', transform: 'translateY(-50%)', fontSize: '9px', color: 'rgba(255,255,255,0.4)', background: '#0d0d0d', padding: '0 2px', zIndex: 4 }}>
                        {String(hour).padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* 7 Columns */}
                {weekDates.map((dateObj, dayIdx) => {
                  const dateStr = formatDateStr(dateObj);
                  const isToday = dateStr === todayStr;

                  return (
                    <div 
                      key={dayIdx} 
                      style={{ 
                        position: 'relative', 
                        borderLeft: isToday ? '1px solid rgba(0, 240, 255, 0.4)' : 'none',
                        borderRight: isToday ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.04)',
                        background: isToday ? 'rgba(0, 240, 255, 0.03)' : 'transparent',
                        zIndex: isToday ? 3 : 1
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

                      {/* 2. DYNAMIC SCHEDULED TASKS */}
                      {tasks.filter(t => isTaskOnDate(t, dateStr, dayIdx) && t.status !== 'Completed' && t.status !== 'Failed' && t.startTime && t.endTime).map(task => {
                        const startMins = timeToMinutes(task.startTime);
                        const endMins = timeToMinutes(task.endTime);
                        const top = ((startMins - START_DAY_MINUTES) / 60) * HOUR_HEIGHT;
                        const height = ((endMins - startMins) / 60) * HOUR_HEIGHT;

                        // Look up subject name
                        const subject = subjects.find(s => s.id === task.subjectId);
                        const subjName = subject ? subject.name : task.subjectId;

                        return (
                          <div 
                            key={task.id} 
                            style={{ 
                              position: 'absolute', 
                              top: `${top}px`, 
                              height: `${height - 2}px`, 
                              left: '2px', 
                              right: '2px', 
                              background: 'rgba(0, 240, 255, 0.2)', 
                              border: '1px solid #00f0ff', 
                              boxShadow: '0 0 10px rgba(0,240,255,0.25)',
                              borderRadius: '2px', 
                              padding: '3px 5px', 
                              boxSizing: 'border-box', 
                              overflow: 'hidden', 
                              zIndex: 4 
                            }}
                            title={`[${subjName}] ${task.title} (${task.startTime}-${task.endTime})`}
                          >
                            <div style={{ fontSize: '8px', color: '#00f0ff', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              [{subjName}]
                            </div>
                            <div style={{ fontSize: '9px', color: '#fff', marginTop: '1px', lineHeight: '1.1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.title}
                            </div>
                            {height >= 35 && (
                              <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                                {task.startTime}-{task.endTime}
                              </div>
                            )}
                          </div>
                        );
                      })}

                    </div>
                  );
                })}

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
      )}

      {/* VIEW 3: DAY VIEW (Hourly Timeline Grid with Live NOW Line) */}
      {viewMode === 'DAY' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowX: 'auto' }}>
          <div style={{ minWidth: '600px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            
            {/* Day Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.6)', padding: '8px 0' }}>
              <div />
              <div style={{ textAlign: 'center', fontSize: '11px', color: formatDateStr(currentDate) === todayStr ? '#00f0ff' : '#fff', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </div>
            </div>

            {/* Time Grid Area */}
            <div style={{ flex: 1, overflowY: 'auto', position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', position: 'relative', minHeight: `${HOURS.length * HOUR_HEIGHT}px` }}>
                
                {/* Left Time Axis Column */}
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                  {HOURS.map(hour => (
                    <div key={hour} style={{ height: `${HOUR_HEIGHT}px`, boxSizing: 'border-box', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: 0, right: '8px', transform: 'translateY(-50%)', fontSize: '9px', color: 'rgba(255,255,255,0.4)', background: '#0d0d0d', padding: '0 2px', zIndex: 4 }}>
                        {String(hour).padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* Single Day Column */}
                <div 
                  style={{ 
                    position: 'relative', 
                    background: formatDateStr(currentDate) === todayStr ? 'rgba(0, 240, 255, 0.03)' : 'transparent',
                    boxShadow: formatDateStr(currentDate) === todayStr ? 'inset 0 0 20px rgba(0, 240, 255, 0.06)' : 'none',
                    zIndex: 1
                  }}
                >
                  {/* Dashed Hour Lines */}
                  {HOURS.map(hour => (
                    <div key={hour} style={{ height: `${HOUR_HEIGHT}px`, borderBottom: '1px dashed rgba(255,255,255,0.04)' }} />
                  ))}

                  {/* 1. FIXED LECTURES ON THIS DAY */}
                  {FIXED_LECTURES.filter(e => e.day === ((currentDate.getDay() + 6) % 7)).map((event, i) => {
                    const startMins = timeToMinutes(event.start);
                    const endMins = timeToMinutes(event.end);
                    const top = ((startMins - START_DAY_MINUTES) / 60) * HOUR_HEIGHT;
                    const height = ((endMins - startMins) / 60) * HOUR_HEIGHT;

                    return (
                      <div 
                        key={'f_' + i} 
                        style={{ 
                          position: 'absolute', 
                          top: `${top}px`, 
                          height: `${height - 2}px`, 
                          left: '10px', 
                          right: '10px', 
                          background: 'rgba(255, 170, 0, 0.08)', 
                          border: '1px solid #ffaa00', 
                          borderRadius: '2px', 
                          padding: '6px 12px', 
                          boxSizing: 'border-box', 
                          overflow: 'hidden', 
                          zIndex: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <div style={{ fontSize: '9px', color: '#ffaa00', fontWeight: 'bold' }}>
                          [{event.code}] {event.start} - {event.end}
                        </div>
                        <div style={{ fontSize: '11px', color: '#fff', marginTop: '2px', fontWeight: 'bold' }}>
                          {event.title}
                        </div>
                      </div>
                    );
                  })}

                  {/* 2. DYNAMIC SCHEDULED TASKS ON THIS DAY */}
                  {tasks.filter(t => isTaskOnDate(t, formatDateStr(currentDate)) && t.status !== 'Completed' && t.status !== 'Failed' && t.startTime && t.endTime).map(task => {
                    const startMins = timeToMinutes(task.startTime);
                    const endMins = timeToMinutes(task.endTime);
                    const top = ((startMins - START_DAY_MINUTES) / 60) * HOUR_HEIGHT;
                    const height = ((endMins - startMins) / 60) * HOUR_HEIGHT;

                    return (
                      <div 
                        key={task.id} 
                        style={{ 
                          position: 'absolute', 
                          top: `${top}px`, 
                          height: `${height - 2}px`, 
                          left: '10px', 
                          right: '10px', 
                          background: 'rgba(0, 240, 255, 0.15)', 
                          border: '1px solid #00f0ff', 
                          boxShadow: '0 0 12px rgba(0,240,255,0.2)',
                          borderRadius: '2px', 
                          padding: '6px 12px', 
                          boxSizing: 'border-box', 
                          overflow: 'hidden', 
                          zIndex: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <div style={{ fontSize: '9px', color: '#00f0ff', fontWeight: 'bold' }}>
                          [{task.category}] {task.startTime} - {task.endTime} | PRIORITY: {task.priority}
                        </div>
                        <div style={{ fontSize: '11px', color: '#fff', marginTop: '2px', fontWeight: 'bold' }}>
                          {task.title}
                        </div>
                      </div>
                    );
                  })}

                  {/* LIVE RED INDICATOR LINE (Only visible when viewing today's date) */}
                  {formatDateStr(currentDate) === todayStr && liveTopOffset >= 0 && liveTopOffset <= HOURS.length * HOUR_HEIGHT && (
                    <div style={{ position: 'absolute', top: `${liveTopOffset}px`, left: '0', right: 0, height: '1px', background: '#ff3333', boxShadow: '0 0 10px #ff3333', zIndex: 5, pointerEvents: 'none' }}>
                      <div style={{ position: 'absolute', left: '-50px', top: '-6px', fontSize: '8px', color: '#ff3333', fontWeight: 'bold' }}>
                        NOW
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}