import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { listWorlds } from '../api.js';
import CreateWorldModal from '../components/CreateWorldModal.jsx';
import Footer from '../components/Footer.jsx';
import TopBar from '../components/TopBar.jsx';
import WorldCard from '../components/WorldCard.jsx';

function Hero({ worlds, onCreate }) {
  if (!worlds) return null;

  if (worlds.length === 0) {
    return (
      <section className="hero">
        <h1 className="hero-title">Tvorsvit</h1>
        <p className="hero-tagline">твори світ — create a world</p>
        <p className="hero-about">
          A cozy home for building fictional worlds — lore, characters, and quiet writing time.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={onCreate}>
            Create your first world
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="hero hero-slim">
      <p className="hero-greeting">Welcome back</p>
      <p className="hero-counts">
        {worlds.length} {worlds.length === 1 ? 'world' : 'worlds'} on your shelf
      </p>
    </section>
  );
}

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

  const gridRef = useRef(null);
  const didAnimate = useRef(false);

  useLayoutEffect(() => {
    if (!worlds || didAnimate.current) return undefined;
    didAnimate.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      const items = gridRef.current?.querySelectorAll('.world-card, .create-tile');
      if (!items || items.length === 0) return;
      gsap.from(items, {
        y: 26,
        opacity: 0,
        scale: 0.95,
        duration: 0.55,
        ease: 'back.out(1.7)',
        stagger: 0.06,
        clearProps: 'all',
      });
    });
    return () => ctx.revert();
  }, [worlds]);

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
      <Hero worlds={worlds} onCreate={() => setShowCreate(true)} />

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
          <main className="world-grid" ref={gridRef}>
            <button type="button" className="create-tile" onClick={() => setShowCreate(true)}>
              <span className="create-tile-plus">+</span>
              <span>Create new world</span>
            </button>
            {worlds.map((world) => (
              <WorldCard key={world.id} world={world} />
            ))}
          </main>
          {worlds.length === 0 && (
            <div className="empty-state">
              <span className="empty-state-emoji" aria-hidden="true">
                📖
              </span>
              <p className="empty-state-text">
                Your worlds are dreaming here — use the “+ Create new world” tile to wake the first one up.
              </p>
            </div>
          )}
        </>
      )}

      <Footer />

      {showCreate && <CreateWorldModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
    </div>
  );
}

export default Dashboard;