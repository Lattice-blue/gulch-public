import { useState, useEffect } from 'react';
import NavBar from './NavBar';
import GlobeBackground from './GlobeBackground';
import CalendarGrid from './CalendarGrid';

import TacticalHUD from './components/TacticalHUD';
import HorizonCountdown from './components/HorizonCountdown';
import TimeRatioGauge from './components/TimeRatioGauge';
import HorizonView from './components/HorizonView';
import TacticalStopwatch from './components/TacticalStopwatch';
import TaskInspectView from './components/TaskInspectView';

import './App.css';

function App() {
  const [activeScreen, setActiveScreen] = useState('OVERVIEW');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [inspectedTask, setInspectedTask] = useState(null);
  const [subjectScope, setSubjectScope] = useState('UNIVERSITY');
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  // ROOT-LEVEL PERSISTENT STOPWATCH STATE
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isStopwatchActive, setIsStopwatchActive] = useState(false);

  // LIVE SQLITE STATE
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('ASSIGNMENT');
  const [newTaskPriority, setNewTaskPriority] = useState('HIGH');

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCategory, setNewSubjCategory] = useState('Systems');

  const [schedulingTaskId, setSchedulingTaskId] = useState(null);
  const [schedDay, setSchedDay] = useState(0);
  const [schedStart, setSchedStart] = useState('06:00');
  const [schedEnd, setSchedEnd] = useState('08:00');

  const overlayOpacity = activeScreen === 'OVERVIEW' ? 0.35 : 0.85;

  // 1. ROOT PERSISTENT TIMER TICK
  useEffect(() => {
    let interval = null;
    if (isStopwatchActive) {
      interval = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isStopwatchActive]);

  // 2. GLOBAL DYNAMIC BROWSER TAB TITLE UPDATER
  useEffect(() => {
    if (isStopwatchActive) {
      const h = Math.floor(stopwatchSeconds / 3600);
      const m = Math.floor((stopwatchSeconds % 3600) / 60);
      const s = stopwatchSeconds % 60;
      const pad = (n) => String(n).padStart(2, '0');
      
      const formatted = h > 0 
        ? `${pad(h)}:${pad(m)}:${pad(s)}` 
        : `${pad(m)}:${pad(s)}`;
      
      document.title = `⏱️ ${formatted} | GULCH`;
    } else {
      document.title = 'GULCH // OPERATING PICTURE';
    }
  }, [stopwatchSeconds, isStopwatchActive]);

  // Fetch SQLite data
  useEffect(() => {
    fetch('http://localhost:3000/api/subjects')
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(err => console.error(err));

    fetch('http://localhost:3000/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error(err));
  }, []);

  const getSubjectStatus = (subjectId) => {
    const activeTasks = tasks.filter(t => t.subjectId === subjectId && t.status !== 'Completed');
    if (activeTasks.length === 0) return 'green';
    const hasHighPriority = activeTasks.some(t => t.priority === 'HIGH');
    return hasHighPriority ? 'red' : 'yellow';
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedSubject) return;

    const newTask = {
      id: 't_' + Date.now(),
      subjectId: selectedSubject.id,
      title: newTaskTitle,
      category: newTaskCategory,
      priority: newTaskPriority,
      deadline: newTaskDeadline || 'NO DEADLINE',
      status: 'Unassigned'
    };

    fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    })
      .then(res => res.json())
      .then(() => {
        setTasks(prev => [...prev, newTask]);
        setNewTaskTitle('');
        setNewTaskDeadline('');
        setNewTaskCategory('ASSIGNMENT');
        setNewTaskPriority('HIGH');
      })
      .catch(err => console.error(err));
  };

  const handleToggleTask = (task) => {
    const newStatus = task.status === 'Completed' ? 'Unassigned' : 'Completed';
    fetch(`http://localhost:3000/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(() => {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      })
      .catch(err => console.error(err));
  };

  const handleDeleteTask = (taskId) => {
    fetch(`http://localhost:3000/api/tasks/${taskId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      })
      .catch(err => console.error(err));
  };

  const handleScheduleTask = (taskId, e) => {
    e.preventDefault();
    fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Scheduled',
        scheduledDay: parseInt(schedDay),
        startTime: schedStart,
        endTime: schedEnd
      })
    })
      .then(res => res.json())
      .then(() => {
        setTasks(prev => prev.map(t => t.id === taskId ? {
          ...t,
          status: 'Scheduled',
          scheduledDay: parseInt(schedDay),
          startTime: schedStart,
          endTime: schedEnd
        } : t));
        setSchedulingTaskId(null);
      })
      .catch(err => console.error(err));
  };

  const handleUpdateTaskDetails = (taskId, { description, assetPath }) => {
    fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, assetPath })
    })
      .then(res => res.json())
      .then(() => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, description, assetPath } : t));
        if (inspectedTask && inspectedTask.id === taskId) {
          setInspectedTask(prev => ({ ...prev, description, assetPath }));
        }
      })
      .catch(err => console.error(err));
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    const newSubj = {
      id: 's_' + Date.now(),
      name: newSubjName,
      category: newSubjCategory,
      type: 'SOVEREIGN'
    };

    fetch('http://localhost:3000/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubj)
    })
      .then(res => res.json())
      .then(() => {
        setSubjects(prev => [...prev, { ...newSubj, status: 'green' }]);
        setNewSubjName('');
        setShowSubjectModal(false);
      })
      .catch(err => console.error(err));
  };

  const handleDeleteSubject = (subjectId) => {
    if (!window.confirm('Delete this sovereign subject and all associated tasks?')) return;

    fetch(`http://localhost:3000/api/subjects/${subjectId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setSubjects(prev => prev.filter(s => s.id !== subjectId));
        setTasks(prev => prev.filter(t => t.subjectId !== subjectId));
        setSelectedSubject(null);
      })
      .catch(err => console.error(err));
  };

  const visibleSubjects = subjects.filter(s => (s.type || 'UNIVERSITY') === subjectScope);
  const currentSubjectTasks = selectedSubject ? tasks.filter(t => t.subjectId === selectedSubject.id) : [];
  const isSovereign = subjectScope === 'SOVEREIGN';

  return (
    <div style={{ backgroundImage: activeScreen !== 'OVERVIEW' ? 'url(/globe.jpg)' : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#050505', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {activeScreen === 'OVERVIEW' && <GlobeBackground />}
      
      <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(5, 5, 5, ${overlayOpacity})`, zIndex: 1, pointerEvents: 'none', transition: 'background-color 0.8s ease' }} />

      <div style={{ position: 'relative', zIndex: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavBar activeScreen={activeScreen} onScreenChange={setActiveScreen} />

        {/* SCREEN 1: OVERVIEW */}
        {activeScreen === 'OVERVIEW' && (
          <>
            <TacticalHUD />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
              <div style={{ textAlign: 'center', letterSpacing: '0.2em', userSelect: 'none', filter: 'drop-shadow(0px 4px 16px rgba(0,0,0,0.95))' }}>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px' }}>
                  "Be quick, be quiet, be on time."
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
                  — Clarence L. Johnson | Skunk Works
                </div>
              </div>
            </div>

            {/* RIGHT SIDE TACTICAL HUD STACK */}
            <div style={{ 
              position: 'absolute', 
              right: '25px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              zIndex: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              width: '310px' 
            }}>
              <TacticalStopwatch 
                seconds={stopwatchSeconds} 
                isActive={isStopwatchActive} 
                onToggle={() => setIsStopwatchActive(!isStopwatchActive)}
                onReset={() => { setIsStopwatchActive(false); setStopwatchSeconds(0); }}
              />
              <TimeRatioGauge tasks={tasks} subjects={subjects} />
              <HorizonCountdown />
            </div>
          </>
        )}

        {/* SCREEN 2: OPERATIONAL SCHEDULE */}
        {activeScreen === 'OPERATIONS' && (
          inspectedTask ? (
            <TaskInspectView 
              task={inspectedTask} 
              subject={subjects.find(s => s.id === inspectedTask.subjectId)}
              onBack={() => setInspectedTask(null)}
              onUpdateTask={handleUpdateTaskDetails}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', gap: '10px', padding: '12px 20px 0 20px', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <button 
                  onClick={() => { setSubjectScope('UNIVERSITY'); setSelectedSubject(null); }}
                  style={{ background: 'none', border: 'none', color: subjectScope === 'UNIVERSITY' ? '#39ff14' : 'rgba(255,255,255,0.4)', fontFamily: 'inherit', fontSize: '10px', letterSpacing: '0.15em', paddingBottom: '8px', borderBottom: subjectScope === 'UNIVERSITY' ? '2px solid #39ff14' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.3s ease' }}
                >
                  [ ACADEMIC CURRICULUM ]
                </button>
                <button 
                  onClick={() => { setSubjectScope('SOVEREIGN'); setSelectedSubject(null); }}
                  style={{ background: 'none', border: 'none', color: subjectScope === 'SOVEREIGN' ? '#00f0ff' : 'rgba(255,255,255,0.4)', fontFamily: 'inherit', fontSize: '10px', letterSpacing: '0.15em', paddingBottom: '8px', borderBottom: subjectScope === 'SOVEREIGN' ? '2px solid #00f0ff' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.3s ease', textShadow: subjectScope === 'SOVEREIGN' ? '0 0 10px rgba(0, 240, 255, 0.6)' : 'none' }}
                >
                  [ SOVEREIGN STACK ]
                </button>
              </div>

              <div className="subject-row">
                {visibleSubjects.map(subject => {
                  const liveStatus = getSubjectStatus(subject.id);
                  return (
                    <button key={subject.id} className={`subject-btn status-${liveStatus}`} onClick={() => setSelectedSubject(subject)}>
                      <span style={{ fontSize: '8px', opacity: 0.6, marginRight: '6px' }}>[{subject.category}]</span>
                      {subject.name}
                    </button>
                  );
                })}

                {subjectScope === 'SOVEREIGN' && (
                  <button onClick={() => setShowSubjectModal(true)} style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px dashed rgba(0, 240, 255, 0.4)', color: '#00f0ff', fontFamily: 'inherit', fontSize: '10px', padding: '8px 14px', cursor: 'pointer', borderRadius: '2px', boxShadow: '0 0 10px rgba(0,240,255,0.2)' }}>
                    + NEW SOVEREIGN TRACK
                  </button>
                )}
              </div>

              {showSubjectModal && subjectScope === 'SOVEREIGN' && (
                <form onSubmit={handleAddSubject} style={{ display: 'flex', gap: '10px', padding: '10px 20px', background: 'rgba(0, 240, 255, 0.05)', borderBottom: '1px solid rgba(0, 240, 255, 0.2)' }}>
                  <input type="text" placeholder="Subject/Project Name..." value={newSubjName} onChange={e => setNewSubjName(e.target.value)} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 10px', fontSize: '10px', fontFamily: 'inherit' }} />
                  <select value={newSubjCategory} onChange={e => setNewSubjCategory(e.target.value)} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 10px', fontSize: '10px', fontFamily: 'inherit' }}>
                    <option value="Classical">Classical</option>
                    <option value="Systems">Systems</option>
                    <option value="Writing">Writing</option>
                    <option value="Research">Research</option>
                  </select>
                  <button type="submit" style={{ background: 'rgba(0, 240, 255, 0.2)', border: '1px solid #00f0ff', color: '#00f0ff', padding: '0 15px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    SAVE TRACK
                  </button>
                  <button type="button" onClick={() => setShowSubjectModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    CANCEL
                  </button>
                </form>
              )}

              <div style={{ display: 'flex', flex: 1, padding: '20px', gap: '20px', overflow: 'hidden' }}>
                <div style={{ flex: isLeftPanelCollapsed ? '0 0 36px' : '0 0 440px', display: 'flex', flexDirection: 'column', border: isSovereign ? '1px solid rgba(0, 240, 255, 0.35)' : '1px solid rgba(255,255,255,0.1)', boxShadow: isSovereign ? '0 0 30px rgba(0, 240, 255, 0.15), inset 0 0 15px rgba(0, 240, 255, 0.05)' : 'none', background: 'rgba(0,0,0,0.75)', padding: isLeftPanelCollapsed ? '15px 5px' : '20px', backdropFilter: 'blur(10px)', overflowY: 'auto', overflowX: 'hidden', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative' }}>
                  {isLeftPanelCollapsed ? (
                    <div onClick={() => setIsLeftPanelCollapsed(false)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', color: isSovereign ? '#00f0ff' : '#39ff14', fontSize: '11px', letterSpacing: '0.2em', userSelect: 'none' }} title="Click to Expand Task Panel">
                      <div style={{ marginBottom: '25px', fontSize: '12px', fontWeight: 'bold' }}>►</div>
                      <div style={{ writingMode: 'vertical-rl', textTransform: 'uppercase', transform: 'rotate(180deg)', whiteSpace: 'nowrap', opacity: 0.8 }}>
                        {selectedSubject ? selectedSubject.name : 'TASKS & OPERATIONS'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ fontSize: '9px', color: isSovereign ? '#00f0ff' : 'rgba(0, 240, 255, 0.6)', letterSpacing: '0.15em' }}>
                          {selectedSubject ? `[ CATEGORY: ${selectedSubject.category} | ${selectedSubject.type || 'UNIVERSITY'} ]` : '[ OPERATIONS ]'}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          {selectedSubject?.type === 'SOVEREIGN' && (
                            <button onClick={() => handleDeleteSubject(selectedSubject.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '9px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.1em' }}>
                              [ DELETE ]
                            </button>
                          )}
                          <button onClick={() => setIsLeftPanelCollapsed(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: '9px', padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.1em' }}>
                            ◄ HIDE
                          </button>
                        </div>
                      </div>

                      {selectedSubject ? (
                        <>
                          <h3 style={{ fontSize: '14px', color: '#fff', marginBottom: '20px', textTransform: 'uppercase' }}>
                            {selectedSubject.name} 
                          </h3>

                          <form onSubmit={handleAddTask} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input type="text" placeholder="&gt; Enter new task..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} style={{ background: 'transparent', border: isSovereign ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 12px', fontFamily: 'inherit', fontSize: '11px', outline: 'none' }} />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <select value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} style={{ flex: 1, background: '#111', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', padding: '8px', fontFamily: 'inherit', fontSize: '10px', outline: 'none', cursor: 'pointer' }}>
                                <option value="ASSIGNMENT">ASSIGNMENT</option>
                                <option value="PROJECT">PROJECT</option>
                                <option value="GROUP PROJECT">GROUP PROJECT</option>
                                <option value="EXAM PREP">EXAM PREP</option>
                                <option value="READING">READING</option>
                                <option value="MISC">MISC</option>
                              </select>
                              <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} style={{ flex: '0 0 110px', background: '#111', border: '1px solid rgba(255,255,255,0.2)', color: newTaskPriority === 'HIGH' ? '#ff4d4d' : '#ffaa00', padding: '8px', fontFamily: 'inherit', fontSize: '10px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}>
                                <option value="HIGH">HIGH (RED)</option>
                                <option value="LOW">LOW (YEL)</option>
                              </select>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input type="date" value={newTaskDeadline} onChange={(e) => setNewTaskDeadline(e.target.value)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', padding: '8px', fontFamily: 'inherit', fontSize: '10px', outline: 'none' }} />
                              <button type="submit" style={{ background: isSovereign ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0, 240, 255, 0.15)', border: '1px solid rgba(0, 240, 255, 0.5)', color: '#00f0ff', padding: '0 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '10px', textTransform: 'uppercase' }}>
                                ADD TASK
                              </button>
                            </div>
                          </form>

                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                            {currentSubjectTasks.length === 0 ? (
                              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', marginTop: '20px' }}>
                                NO PENDING OPERATIONS
                              </div>
                            ) : (
                              currentSubjectTasks.map(task => (
                                <div key={task.id} style={{ display: 'flex', flexDirection: 'column', marginBottom: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderLeft: task.status === 'Completed' ? '2px solid #39ff14' : task.status === 'Scheduled' ? '2px solid #00f0ff' : '2px solid #ffaa00' }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div onClick={() => handleToggleTask(task)} style={{ color: task.status === 'Completed' ? '#39ff14' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px', marginTop: '2px' }}>
                                      {task.status === 'Completed' ? '[X]' : '[ ]'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div onClick={() => setInspectedTask(task)} style={{ fontSize: '12px', color: task.status === 'Completed' ? 'rgba(255,255,255,0.4)' : '#fff', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', cursor: 'pointer' }} title="Click to inspect task details & attachments">
                                        &gt; {task.title}
                                      </div>
                                      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '2px', color: '#fff' }}>
                                          {task.category}
                                        </span>
                                        <span style={{ color: task.priority === 'HIGH' ? '#ff6b6b' : '#ffaa00', fontWeight: 'bold' }}>
                                          [{task.priority}]
                                        </span>
                                        <span>DUE: {task.deadline}</span>
                                        <span style={{ color: task.status === 'Scheduled' ? '#00f0ff' : 'inherit' }}>STATUS: {task.status}</span>
                                      </div>
                                    </div>
                                    <button onClick={() => setSchedulingTaskId(schedulingTaskId === task.id ? null : task.id)} style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)', color: '#00f0ff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '9px', padding: '2px 6px' }}>
                                      {schedulingTaskId === task.id ? 'CANCEL' : 'SCHED'}
                                    </button>
                                    <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,50,50,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '10px' }}>
                                      DEL
                                    </button>
                                  </div>

                                  {schedulingTaskId === task.id && (
                                    <form onSubmit={(e) => handleScheduleTask(task.id, e)} style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.1)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                      <select value={schedDay} onChange={e => setSchedDay(e.target.value)} style={{ background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '9px', padding: '4px' }}>
                                        <option value={0}>MON</option>
                                        <option value={1}>TUE</option>
                                        <option value={2}>WED</option>
                                        <option value={3}>THU</option>
                                        <option value={4}>FRI</option>
                                        <option value={5}>SAT</option>
                                        <option value={6}>SUN</option>
                                      </select>
                                      <input type="text" placeholder="06:00" value={schedStart} onChange={e => setSchedStart(e.target.value)} style={{ width: '50px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '9px', padding: '4px' }} />
                                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', alignSelf: 'center' }}>to</span>
                                      <input type="text" placeholder="09:00" value={schedEnd} onChange={e => setSchedEnd(e.target.value)} style={{ width: '50px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '9px', padding: '4px' }} />
                                      <button type="submit" style={{ background: '#00f0ff', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '9px', padding: '4px 10px', cursor: 'pointer' }}>
                                        SAVE
                                      </button>
                                    </form>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      ) : (
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', marginTop: '50px' }}>
                          &gt; SELECT A SUBJECT TO VIEW PENDING OPERATIONS
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div style={{ flex: 1, border: isSovereign ? '1px solid rgba(0, 240, 255, 0.35)' : '1px solid rgba(255,255,255,0.1)', boxShadow: isSovereign ? '0 0 30px rgba(0, 240, 255, 0.15), inset 0 0 15px rgba(0, 240, 255, 0.05)' : 'none', background: 'rgba(0,0,0,0.5)', padding: '20px', backdropFilter: 'blur(10px)', transition: 'all 0.4s ease' }}>
                  <CalendarGrid tasks={tasks} />
                </div>
              </div>
            </div>
          )
        )}

        {/* SCREEN 3: HORIZON GOALS */}
        {activeScreen === 'HORIZON' && <HorizonView />}

      </div>
    </div>
  );
}

export default App;