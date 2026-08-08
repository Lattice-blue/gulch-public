import { useState } from 'react';

export default function TaskArchiveView({ tasks, subjects, onToggleTask, onDeleteTask, onInspectTask }) {
  const [scopeFilter, setScopeFilter] = useState('ALL'); // 'ALL' | 'UNIVERSITY' | 'SOVEREIGN'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Completed' | 'Failed'
  const [selectedSubjectId, setSelectedSubjectId] = useState('ALL');

  // Filter tasks that are in history (Completed or Failed)
  const archivedTasks = tasks.filter(t => t.status === 'Completed' || t.status === 'Failed');

  // Apply UI Filters
  const filteredTasks = archivedTasks.filter(t => {
    const subject = subjects.find(s => s.id === t.subjectId);
    const subjectType = subject ? (subject.type || 'UNIVERSITY') : 'UNIVERSITY';

    if (scopeFilter !== 'ALL' && subjectType !== scopeFilter) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (selectedSubjectId !== 'ALL' && t.subjectId !== selectedSubjectId) return false;

    return true;
  });

  const completedCount = archivedTasks.filter(t => t.status === 'Completed').length;
  const failedCount = archivedTasks.filter(t => t.status === 'Failed').length;

  // Visible subjects for subject filter bar
  const visibleSubjects = subjects.filter(s => scopeFilter === 'ALL' || (s.type || 'UNIVERSITY') === scopeFilter);

  return (
    <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>
      {/* HEADER BAR */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h2 style={{ fontSize: '14px', letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>
            // OPERATIONAL TASK ARCHIVES &amp; AUDIT LOG
          </h2>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            TOTAL ARCHIVED: <strong style={{ color: '#fff' }}>{archivedTasks.length}</strong> | 
            COMPLETED: <strong style={{ color: '#39ff14' }}>{completedCount}</strong> | 
            FAILED/EXPIRED: <strong style={{ color: '#ff4d4d' }}>{failedCount}</strong>
          </div>
        </div>
        <span style={{ fontSize: '9px', color: 'rgba(0, 240, 255, 0.6)', letterSpacing: '0.15em' }}>
          SYSTEM LOG // HISTORICAL RECORDS
        </span>
      </div>

      {/* FILTER BAR 1: SCOPE & STATUS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', background: 'rgba(0,0,0,0.6)', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* SCOPE TOGGLES */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>SCOPE:</span>
          {['ALL', 'UNIVERSITY', 'SOVEREIGN'].map(scope => (
            <button
              key={scope}
              onClick={() => { setScopeFilter(scope); setSelectedSubjectId('ALL'); }}
              style={{
                background: scopeFilter === scope ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                border: scopeFilter === scope ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.15)',
                color: scopeFilter === scope ? '#00f0ff' : 'rgba(255,255,255,0.5)',
                fontSize: '9px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              [{scope}]
            </button>
          ))}
        </div>

        {/* STATUS TOGGLES */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>STATUS:</span>
          <button
            onClick={() => setStatusFilter('ALL')}
            style={{
              background: statusFilter === 'ALL' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: statusFilter === 'ALL' ? '#fff' : 'rgba(255,255,255,0.5)',
              fontSize: '9px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            [ALL]
          </button>
          <button
            onClick={() => setStatusFilter('Completed')}
            style={{
              background: statusFilter === 'Completed' ? 'rgba(57, 255, 20, 0.15)' : 'transparent',
              border: statusFilter === 'Completed' ? '1px solid #39ff14' : '1px solid rgba(255,255,255,0.2)',
              color: statusFilter === 'Completed' ? '#39ff14' : 'rgba(255,255,255,0.5)',
              fontSize: '9px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            [COMPLETED]
          </button>
          <button
            onClick={() => setStatusFilter('Failed')}
            style={{
              background: statusFilter === 'Failed' ? 'rgba(255, 77, 77, 0.15)' : 'transparent',
              border: statusFilter === 'Failed' ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.2)',
              color: statusFilter === 'Failed' ? '#ff4d4d' : 'rgba(255,255,255,0.5)',
              fontSize: '9px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            [FAILED]
          </button>
        </div>
      </div>

      {/* FILTER BAR 2: SUBJECT SELECTOR */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginRight: '6px' }}>SUBJECT:</span>
        <button
          onClick={() => setSelectedSubjectId('ALL')}
          style={{
            background: selectedSubjectId === 'ALL' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: selectedSubjectId === 'ALL' ? '#fff' : 'rgba(255,255,255,0.5)',
            fontSize: '9px', padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          SHOW ALL
        </button>
        {visibleSubjects.map(sub => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubjectId(sub.id)}
            style={{
              background: selectedSubjectId === sub.id ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              border: selectedSubjectId === sub.id ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.1)',
              color: selectedSubjectId === sub.id ? '#00f0ff' : 'rgba(255,255,255,0.5)',
              fontSize: '9px', padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* ARCHIVED TASK LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ background: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '50px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.15em' }}>
            [ NO HISTORICAL RECORDS MATCHING CURRENT FILTERS ]
          </div>
        ) : (
          filteredTasks.map(task => {
            const subject = subjects.find(s => s.id === task.subjectId);
            const isCompleted = task.status === 'Completed';

            return (
              <div 
                key={task.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderLeft: isCompleted ? '4px solid #39ff14' : '4px solid #ff4d4d',
                  padding: '15px 20px',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
                    [{subject ? subject.name : task.subjectId}] // {task.category}
                  </div>
                  <div 
                    onClick={() => onInspectTask && onInspectTask(task)}
                    style={{ fontSize: '13px', color: '#fff', cursor: 'pointer', textDecoration: isCompleted ? 'line-through' : 'none' }}
                    title="Click to view details"
                  >
                    {task.title}
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', display: 'flex', gap: '12px' }}>
                    <span>DEADLINE: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{task.deadline}</strong></span>
                    <span>PRIORITY: <strong style={{ color: task.priority === 'HIGH' ? '#ff4d4d' : '#ffaa00' }}>{task.priority}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span 
                    style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: isCompleted ? '#39ff14' : '#ff4d4d',
                      border: isCompleted ? '1px solid #39ff14' : '1px solid #ff4d4d',
                      padding: '4px 8px',
                      background: isCompleted ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {isCompleted ? '✓ COMPLETED' : '✕ FAILED'}
                  </span>

                  <button
                    onClick={() => onToggleTask(task)}
                    style={{
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                      color: '#00f0ff',
                      fontSize: '9px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      letterSpacing: '0.1em'
                    }}
                    title="Move back to active schedule"
                  >
                    RESTORE
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 50, 50, 0.6)',
                      fontSize: '9px',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    DEL
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}