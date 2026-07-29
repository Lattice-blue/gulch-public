import { useState } from 'react';

export default function TaskInspectView({ task, subject, onBack, onUpdateTask }) {
  const [description, setDescription] = useState(task.description || '');
  const [assetPath, setAssetPath] = useState(task.assetPath || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateTask(task.id, { description, assetPath });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Clean path format for static Express server
  const cleanAssetPath = assetPath.replace(/^\/home\/zmarttrc\/Documents\//, '').replace(/^\//, '');
  const isImage = /\.(png|jpe?g|webp|gif|svg)$/i.test(cleanAssetPath);

  return (
    <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>
      
      {/* TOP NAV & BACK BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '15px' }}>
        <button 
          onClick={onBack}
          style={{ background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00f0ff', color: '#00f0ff', padding: '6px 14px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.15em' }}
        >
          ◄ BACK TO OPERATIONAL SCHEDULE
        </button>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
          TASK_ID: {task.id}
        </span>
      </div>

      {/* METADATA HEADER */}
      <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '9px', color: 'rgba(0, 240, 255, 0.6)', letterSpacing: '0.15em', marginBottom: '6px' }}>
            [ SUBJECT: {subject ? subject.name : task.subjectId} | {task.category} ]
          </div>
          <h2 style={{ fontSize: '18px', color: '#fff', textTransform: 'uppercase' }}>
            {task.title}
          </h2>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', display: 'flex', gap: '15px' }}>
            <span>DUE: <strong style={{ color: '#ffaa00' }}>{task.deadline}</strong></span>
            <span>PRIORITY: <strong style={{ color: task.priority === 'HIGH' ? '#ff4d4d' : '#ffaa00' }}>{task.priority}</strong></span>
            <span>STATUS: <strong style={{ color: task.status === 'Completed' ? '#39ff14' : '#00f0ff' }}>{task.status}</strong></span>
          </div>
        </div>

        <button 
          onClick={handleSave}
          style={{ background: isSaved ? '#39ff14' : '#00f0ff', color: '#000', border: 'none', padding: '10px 20px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.1em' }}
        >
          {isSaved ? '✓ SAVED' : 'SAVE DETAILS'}
        </button>
      </div>

      {/* CONTENT & ASSETS SPLIT */}
      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        
        {/* LEFT: DESCRIPTION & INSTRUCTIONS */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px' }}>
          <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
            &gt; INSTRUCTIONS &amp; OPERATIONAL NOTES
          </label>
          <textarea 
            placeholder="Type assignment details, syllabus notes, or instructions here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ flex: 1, minHeight: '200px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '12px', fontFamily: 'inherit', fontSize: '11px', lineHeight: '1.6', outline: 'none', resize: 'vertical' }}
          />
        </div>

        {/* RIGHT: LOCAL ASSET LINK & PREVIEW */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px' }}>
          <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
            &gt; ATTACHED LOCAL ASSET PATH (/home/zmarttrc/Documents/...)
          </label>
          
          <input 
            type="text" 
            placeholder="e.g. bsmath111/module_1_screenshot.png"
            value={assetPath}
            onChange={(e) => setAssetPath(e.target.value)}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#00f0ff', padding: '8px 12px', fontFamily: 'inherit', fontSize: '11px', outline: 'none' }}
          />

          {/* IMAGE PREVIEWER */}
          <div style={{ flex: 1, border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '10px', background: 'rgba(0,0,0,0.4)' }}>
            {cleanAssetPath ? (
              isImage ? (
                <img 
                  src={`http://localhost:3000/api/assets/${cleanAssetPath}`} 
                  alt="Assignment Attachment" 
                  style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', border: '1px solid rgba(255,255,255,0.2)' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{ fontSize: '11px', color: '#00f0ff', textAlign: 'center' }}>
                  📄 FILE ATTACHED: <br />
                  <a href={`http://localhost:3000/api/assets/${cleanAssetPath}`} target="_blank" rel="noreferrer" style={{ color: '#00f0ff', textDecoration: 'underline', marginTop: '8px', display: 'inline-block' }}>
                    Open /home/zmarttrc/Documents/{cleanAssetPath}
                  </a>
                </div>
              )
            ) : (
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
                [ NO LOCAL FILE ATTACHED ] <br />
                <span style={{ fontSize: '9px', opacity: 0.7 }}>Drop a screenshot into /home/zmarttrc/Documents/ and paste path above</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}