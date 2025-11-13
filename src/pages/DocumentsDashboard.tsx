import React, { useState } from 'react';
import './DocumentsDashboard.css';

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

export const DocumentsDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentFile[]>([
    { id: '1', name: 'Chopin_Nocturne_Op9_No2.pdf', type: 'sheet_music', uploadDate: '2024-11-10', size: '2.4 MB' },
    { id: '2', name: 'Finger_Exercises.pdf', type: 'reference', uploadDate: '2024-11-08', size: '1.8 MB' },
    { id: '3', name: 'Assignment_Week3.pdf', type: 'assignment', uploadDate: '2024-11-05', size: '0.9 MB' },
  ]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      console.log('Files selected:', files);
      // Handle file upload logic here
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const getTypeIcon = (type: string): string => {
    switch(type) {
      case 'sheet_music': return '🎼';
      case 'assignment': return '✏️';
      case 'reference': return '📖';
      default: return '📄';
    }
  };

  const getTypeLabel = (type: string): string => {
    return type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="documents-dashboard">
      <div className="documents-header">
        <h2>Documents Dashboard</h2>
        <p>Manage sheet music, assignments, and class materials</p>
      </div>

      <div className="upload-section">
        <div className="upload-box">
          <div className="upload-icon">📤</div>
          <h3>Upload New Document</h3>
          <p>Drag and drop or click to upload</p>
          <input
            type="file"
            multiple
            onChange={handleUpload}
            className="file-input"
            accept=".pdf,.doc,.docx,.pptx,.jpg,.png"
          />
          <button className="upload-btn">Choose Files</button>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Filter by type:</label>
            <select className="filter-select">
              <option value="">All Documents</option>
              <option value="sheet_music">Sheet Music</option>
              <option value="assignment">Assignments</option>
              <option value="reference">References</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Filter by class:</label>
            <select className="filter-select">
              <option value="">All Classes</option>
              <option value="piano">Piano Basics 101</option>
              <option value="advanced">Advanced Techniques</option>
              <option value="theory">Music Theory</option>
            </select>
          </div>
        </div>
      </div>

      <div className="documents-list">
        <h3>Recent Documents</h3>
        <div className="table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>File Name</th>
                <th>Upload Date</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td className="type-cell">
                    <span className="type-badge">{getTypeIcon(doc.type)}</span>
                    {getTypeLabel(doc.type)}
                  </td>
                  <td>{doc.name}</td>
                  <td>{doc.uploadDate}</td>
                  <td>{doc.size}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn download">📥</button>
                      <button className="action-btn delete" onClick={() => deleteDocument(doc.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
