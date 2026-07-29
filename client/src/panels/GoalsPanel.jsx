import { useGulchData } from '../hooks/useGulchData';

export default function GoalsPanel() {
  const { data: html, loading, error } = useGulchData('goals');

  if (loading) {
    return (
      <div style={{ color: 'rgba(255, 255, 255, 0.4)', padding: '5px 0' }}>
        &gt; ESTABLISHING CONNECTION...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#ff6b6b', padding: '5px 0' }}>
        &gt; {error}
      </div>
    );
  }

  return (
    <div 
      className="gulch-markdown-body"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}