import { useState, useEffect } from 'react';

export function useGulchData(folder, slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`http://localhost:3000/api/data/${folder.toLowerCase()}/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(`ERR: Document offline.`);
        return res.json();
      })
      .then((json) => {
        if (isMounted) { setData(json.html); setLoading(false); }
      })
      .catch((err) => {
        if (isMounted) { setError(err.message); setLoading(false); }
      });

    return () => { isMounted = false; };
  }, [folder, slug]);

  return { data, loading, error };
}