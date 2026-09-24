import { useState } from 'react';
import './App.css';

function App() {
  const [textDraft, setTextDraft] = useState('');

  const handleSave = async () => {
    if (!textDraft.trim()) {
      alert("Please write something before saving!");
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/save-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textContent: textDraft }),
      });

      if (response.ok) {
        alert("Text successfully broadcasted to Java backend!");
      } else {
        alert("Server responded, but something went wrong.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Could not connect to Java backend. Is the server running?");
    }
  };

  return (
    <div className="workspace">
      <h1>Tvorsvit Workspace</h1>

      <textarea
        placeholder="Start writing your world's history here..."
        value={textDraft}
        onChange={(e) => setTextDraft(e.target.value)}
        rows={15}
        cols={60}
      />

      <br />

      <button onClick={handleSave} className="save-btn">
        Save Draft to PC
      </button>
    </div>
  );
}

export default App;