import { useCallback, useEffect, useState } from 'react';
import { listWorlds } from '../api.js';
import WorldCard from '../components/WorldCard.jsx';
import CreateWorldModal from '../components/CreateWorldModal.jsx';
import TopBar from '../components/TopBar.jsx';

function Dashboard() {
  const [worlds, setWorlds] = useState(null);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchWorlds = useCallback(() => {
    listWorlds()
      .then((data) => {
        setWorlds(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  useEffect(() => {
    fetchWorlds();
  }, [fetchWorlds]);

  const handleCreated = (world) => {
    setShowCreate(false);
    setWorlds((current) => (current ? [world, ...current] : [world]));
  };

  return (
    <div className="app-shell">
      <TopBar />

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button type="button" onClick={fetchWorlds}>
            Retry
          </button>
        </div>
      )}

      {!worlds && !error && <p className="status-text">Loading worlds…</p>}

      {worlds && (
        <>
          <main className="world-grid">
            <button type="button" className="create-tile" onClick={() => setShowCreate(true)}>
              <span className="create-tile-plus">+</span>
              <span>Create new world</span>
            </button>
            {worlds.map((world) => (
              <WorldCard key={world.id} world={world} />
            ))}
          </main>
          {worlds.length === 0 && (
            <p className="empty-hint">No worlds yet — use the “+ Create new world” tile to start your first one.</p>
          )}
        </>
      )}

      {showCreate && <CreateWorldModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </div>
  );
}

export default Dashboard;