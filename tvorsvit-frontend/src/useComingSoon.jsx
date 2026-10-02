import { useEffect, useRef, useState } from 'react';

export function useComingSoon() {
  const [label, setLabel] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  const comingSoon = (name) => {
    window.clearTimeout(timer.current);
    setLabel(name);
    timer.current = window.setTimeout(() => setLabel(null), 2600);
  };

  const toast = label ? (
    <div className="toast" role="status">
      {label} — coming soon
    </div>
  ) : null;

  return [comingSoon, toast];
}