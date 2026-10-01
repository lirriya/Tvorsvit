import { Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard.jsx';
import Editor from './pages/Editor.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/worlds/:id" element={<Editor />} />
    </Routes>
  );
}

export default App;