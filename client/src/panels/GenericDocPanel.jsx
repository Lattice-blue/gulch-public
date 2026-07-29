import { useGulchData } from '../hooks/useGulchData';

export default function GenericDocPanel({ folder, slug }) {
  const { data: html, loading, error } = useGulchData(folder, slug);

  if (loading) return <div style={{ color: 'rgba(255, 255, 255, 0.4)', padding: '5px' }}>&gt; CONNECTING...</div>;
  if (error) return <div style={{ color: '#ff6b6b', padding: '5px' }}>&gt; {error}</div>;

  return <div className="gulch-markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
}