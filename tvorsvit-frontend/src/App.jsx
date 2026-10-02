import { Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard.jsx';
import About from './pages/About.jsx';
import Editor from './pages/Editor.jsx';
import Characters from './pages/Characters.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="/worlds/:id" element={<Editor />} />
      <Route path="/worlds/:id/characters" element={<Characters />} />
    </Routes>
  );
}

export default App;