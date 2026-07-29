import { useState, useEffect } from 'react';

export default function HorizonView() {
  const [horizonDocs, setHorizonDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('http://localhost:3000/api/docs/strategy')
      .then(res => res.json())
      .then(async (docsData) => {
        const fullDocs = await Promise.all(
          docsData.map(async (doc) => {
            const res = await fetch(`http://localhost:3000/api/data/strategy/${doc.slug}`);
            const data = await res.json();
            return { ...doc, html: data.html };
          })
        );
        if (isMounted) {
          setHorizonDocs(fullDocs);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load horizon docs:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div style={{ color: 'rgba(255,255,255,0.3)', padding: '50px', textAlign: 'center', fontSize: '11px', letterSpacing: '0.15em' }}>
        &gt; LOADING STRATEGIC ARCHITECTURE...
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '30px 20px 60px 20px' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: '14px', letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>
            // STRATEGIC HORIZON ARCHITECTURE
          </h2>
          <span style={{ fontSize: '9px', color: 'rgba(0, 240, 255, 0.6)', letterSpacing: '0.15em' }}>
            CONFIDENTIAL // SOVEREIGN DIRECTIVES
          </span>
        </div>

        {horizonDocs.map((doc) => (
          <div 
            key={doc.slug} 
            style={{
              background: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              padding: '30px',
              borderRadius: '2px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div className="gulch-markdown-body" dangerouslySetInnerHTML={{ __html: doc.html }} />
          </div>
        ))}
      </div>
    </div>
  );
}