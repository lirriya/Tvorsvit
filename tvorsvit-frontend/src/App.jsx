import { Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard.jsx';
import About from './pages/About.jsx';
import Workspace from './pages/Workspace.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="/worlds/:id" element={<Workspace />} />
      <Route path="/worlds/:id/:section" element={<Workspace />} />
    </Routes>
  );
}

export default App;