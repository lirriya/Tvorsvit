import { Link } from 'react-router-dom';

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>© 2026 Tvorsvit</span>
      <span className="footer-made">
        Made with
        <HeartIcon />
      </span>
      <a className="footer-link" href="https://github.com/lirriya" target="_blank" rel="noreferrer">
        GitHub
      </a>
      <Link className="footer-link" to="/about">
        About · How it works
      </Link>
    </footer>
  );
}

export default Footer;