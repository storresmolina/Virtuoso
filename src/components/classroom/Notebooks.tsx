import React, { useState } from 'react';
import './Notebooks.css';

interface NotebookEntry {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
  class: string;
  studentId?: string;
}

// Accept optional studentId to scope notebooks to a student's classroom
export const Notebooks: React.FC<{ studentId?: string }> = ({ studentId }) => {
  const [notebooks, setNotebooks] = useState<NotebookEntry[]>([
    {
      id: '1',
      title: 'Week 3 - Finger Technique',
      content: 'Focus on proper hand position and finger independence...',
      lastEdited: '2024-11-10',
      class: 'Piano Basics 101',
      studentId: '1'
    },
    {
      id: '2',
      title: 'Advanced Arpeggios',
      content: 'Introduction to complex arpeggio patterns...',
      lastEdited: '2024-11-08',
      class: 'Advanced Techniques',
      studentId: '2'
    },
    {
      id: '3',
      title: 'Theory: Chord Progressions',
      content: 'Understanding common chord progressions in popular music...',
      lastEdited: '2024-11-05',
      class: 'Music Theory'
    },
  ]);

  const [selectedNotebook, setSelectedNotebook] = useState<NotebookEntry | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleCreateNew = () => {
    const newNotebook: NotebookEntry = {
      id: Date.now().toString(),
      title: 'New Notebook',
      content: '',
      lastEdited: new Date().toISOString().split('T')[0],
      class: 'Piano Basics 101',
      studentId: studentId
    };
    setNotebooks([newNotebook, ...notebooks]);
    setSelectedNotebook(newNotebook);
    setEditContent('');
  };

  const handleSelectNotebook = (notebook: NotebookEntry) => {
    setSelectedNotebook(notebook);
    setEditContent(notebook.content);
  };

  const handleSaveNotebook = () => {
    if (selectedNotebook) {
      setNotebooks(notebooks.map(nb =>
        nb.id === selectedNotebook.id
          ? { ...nb, content: editContent, lastEdited: new Date().toISOString().split('T')[0] }
          : nb
      ));
      setSelectedNotebook({ ...selectedNotebook, content: editContent });
    }
  };

  const handleDeleteNotebook = (id: string) => {
    setNotebooks(notebooks.filter(nb => nb.id !== id));
    if (selectedNotebook?.id === id) {
      setSelectedNotebook(null);
      setEditContent('');
    }
  };

  const handleTitleChange = (newTitle: string) => {
    if (selectedNotebook) {
      const updatedNotebook = { ...selectedNotebook, title: newTitle };
      setNotebooks(notebooks.map(nb =>
        nb.id === selectedNotebook.id ? updatedNotebook : nb
      ));
      setSelectedNotebook(updatedNotebook);
    }
  };

  return (
    <div className="notebooks">
      <div className="notebooks-header">
        <h2>Notebooks</h2>
        <p>Plan your classes and organize teaching materials</p>
      </div>

      <div className="notebooks-container">
        <div className="notebooks-sidebar">
          <button className="create-btn" onClick={handleCreateNew}>
            ➕ New Notebook
          </button>

          <div className="notebooks-list">
            <h3>Your Notebooks</h3>
            {notebooks
              .filter(nb => !studentId || nb.studentId === studentId)
              .map(notebook => (
                <div
                  key={notebook.id}
                  className={`notebook-item ${selectedNotebook?.id === notebook.id ? 'active' : ''}`}
                  onClick={() => handleSelectNotebook(notebook)}
                >
                  <div className="notebook-item-header">
                    <h4>{notebook.title}</h4>
                    <button
                      className="delete-notebook-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotebook(notebook.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <p className="notebook-class">{notebook.class}</p>
                  <p className="notebook-date">{notebook.lastEdited}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="notebooks-editor">
          {selectedNotebook ? (
            <div className="editor-content">
              <div className="editor-header">
                <input
                  type="text"
                  className="notebook-title-input"
                  value={selectedNotebook.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Notebook Title"
                />
                <select className="notebook-class-select" defaultValue={selectedNotebook.class}>
                  <option value="Piano Basics 101">Piano Basics 101</option>
                  <option value="Advanced Techniques">Advanced Techniques</option>
                  <option value="Music Theory">Music Theory</option>
                </select>
              </div>

              <textarea
                className="notebook-editor-textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Start typing your class notes..."
              />

              <div className="editor-actions">
                <button className="save-btn" onClick={handleSaveNotebook}>
                  💾 Save Changes
                </button>
                <p className="last-saved">Last edited: {selectedNotebook.lastEdited}</p>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>📓 Select a notebook to start editing or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
