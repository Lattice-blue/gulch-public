export default function NavBar({ activeScreen, onScreenChange }) {
  return (
    <div className="navbar">
      {/* 1. OVERVIEW */}
      <button 
        className={`nav-btn ${activeScreen === 'OVERVIEW' ? 'active' : ''}`}
        onClick={() => onScreenChange('OVERVIEW')}
      >
        OVERVIEW
      </button>

      {/* 2. OPERATIONAL SCHEDULE */}
      <button 
        className={`nav-btn ${activeScreen === 'OPERATIONS' ? 'active' : ''}`}
        onClick={() => onScreenChange('OPERATIONS')}
      >
        OPERATIONAL SCHEDULE
      </button>

      {/* 3. TASK ARCHIVES (NEW) */}
      <button 
        className={`nav-btn ${activeScreen === 'ARCHIVES' ? 'active' : ''}`}
        onClick={() => onScreenChange('ARCHIVES')}
      >
        TASK ARCHIVES
      </button>

      {/* 4. HORIZON GOALS */}
      <button 
        className={`nav-btn ${activeScreen === 'HORIZON' ? 'active' : ''}`}
        onClick={() => onScreenChange('HORIZON')}
      >
        HORIZON GOALS
      </button>
      
      <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
        Noli turbare circulos meos.
      </div>
    </div>
  );
}