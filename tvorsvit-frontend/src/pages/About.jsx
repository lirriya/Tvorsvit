import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar.jsx';

function About() {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="about">
        <h1>What is Tvorsvit?</h1>
        <p className="about-lead">
          твори світ — “create a world”. Tvorsvit is a cozy home for building fictional worlds: their lore,
          the people in them, and the quiet act of writing it all down.
        </p>

        <h2>How it works</h2>
        <ol className="about-steps">
          <li>
            <strong>Create a world</strong> — give it a name, a kind, and a color. It becomes a card on your
            dashboard.
          </li>
          <li>
            <strong>Write its lore</strong> — the editor is built for long, focused writing; press Ctrl/⌘+Shift+F
            for a distraction-free canvas that saves on its own.
          </li>
          <li>
            <strong>Add characters</strong> — the people who shape the world, so they are never lost in the
            prose.
          </li>
        </ol>

        <div className="about-actions">
          <Link to="/" className="btn btn-primary">
            Back to my worlds
          </Link>
        </div>
      </main>
    </div>
  );
}

export default About;