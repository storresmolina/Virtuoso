import React, { useState, useRef, useEffect } from 'react';
import './DocumentsDashboard.css';

interface DocumentFile {
  id: string;
  name: string; // filename
  title?: string; // editable title
  type: string;
  uploadDate: string;
  size: string;
  comments?: string;
  visible?: boolean;
  previewUrl?: string; // object URL for previewing uploaded files
  // optional association with a student (per-student classroom)
  studentId?: string;
}

// Accept optional studentId to show documents scoped to a student's classroom
export const DocumentsDashboard: React.FC<{ studentId?: string; onDocumentsChange?: (docs: any[]) => void }> = ({ studentId, onDocumentsChange }) => {
  const [documents, setDocuments] = useState<DocumentFile[]>([
    { id: '1', name: 'Chopin_Nocturne_Op9_No2.pdf', title: 'Chopin Nocturne Op.9 No.2', type: 'sheet_music', uploadDate: '2024-11-10', size: '2.4 MB', studentId: '1', visible: true },
    { id: '2', name: 'Finger_Exercises.pdf', title: 'Finger Exercises', type: 'reference', uploadDate: '2024-11-08', size: '1.8 MB', studentId: '2', visible: true },
    { id: '3', name: 'Assignment_Week3.pdf', title: 'Assignment Week 3', type: 'assignment', uploadDate: '2024-11-05', size: '0.9 MB', visible: false },
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ title?: string; comments?: string }>({});
  const createdUrlsRef = useRef<string[]>([]);

  // Notify parent when documents change
  useEffect(() => {
    if (onDocumentsChange) {
      const filtered = documents.filter(d => !studentId || d.studentId === studentId);
      onDocumentsChange(filtered.map(d => ({ id: d.id, name: d.name, title: d.title })));
    }
  }, [documents, studentId, onDocumentsChange]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      const newDocs: DocumentFile[] = Array.from(files).map(file => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const type = ext === 'pdf' ? 'sheet_music' : (ext === 'doc' || ext === 'docx' ? 'reference' : 'reference');
        const previewUrl = URL.createObjectURL(file);
        createdUrlsRef.current.push(previewUrl);
        return {
          id,
          name: file.name,
          title: file.name.replace(/\.[^.]+$/, ''),
          type,
          uploadDate: new Date().toISOString().slice(0,10),
          size: `${(file.size/1024/1024).toFixed(2)} MB`,
          studentId: studentId,
          visible: true,
          previewUrl,
        };
      });
      setDocuments(prev => [...newDocs, ...prev]);
      // reset input so same-file uploads are possible
      e.currentTarget.value = '';
    }
  };

  const deleteDocument = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc && doc.previewUrl) {
      try { URL.revokeObjectURL(doc.previewUrl); } catch {}
      createdUrlsRef.current = createdUrlsRef.current.filter(u => u !== doc.previewUrl);
    }
    setDocuments(documents.filter(doc => doc.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const toggleVisibility = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, visible: !d.visible } : d));
  };

  const startEdit = (doc: DocumentFile) => {
    setEditingId(doc.id);
    setEditFields({ title: doc.title, comments: doc.comments });
  };

  const saveEdit = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, title: editFields.title, comments: editFields.comments } : d));
    setEditingId(null);
    setEditFields({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFields({});
  };

  const getTypeIcon = (type: string): string => {
    switch(type) {
      case 'sheet_music': return '🎼';
      case 'assignment': return '✏️';
      case 'reference': return '📖';
      default: return '📄';
    }
  };

  // cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      createdUrlsRef.current.forEach(u => {
        try { URL.revokeObjectURL(u); } catch {}
      });
      createdUrlsRef.current = [];
    };
  }, []);

  const filtered = documents.filter(d => (!studentId || d.studentId === studentId) && (!filterType || d.type === filterType));

  const visibleDocuments = filtered.sort((a,b) => {
    if (sortBy === 'newest') return b.uploadDate.localeCompare(a.uploadDate);
    if (sortBy === 'oldest') return a.uploadDate.localeCompare(b.uploadDate);
    if (sortBy === 'name') return a.title?.localeCompare(b.title || a.name) || 0;
    return 0;
  });

  return (
    <div className="documents-dashboard">
      <div className="documents-header">
        <h2>Documents Dashboard</h2>
        <p>Manage sheet music, assignments, and class materials</p>
      </div>

      <div className="documents-controls">
        <div className="left-controls">
          <input ref={fileInputRef} type="file" multiple onChange={handleUpload} className="file-input-hidden" accept=".pdf" />
          <button className="primary-btn upload-main" onClick={openFilePicker}>+ Upload Document</button>
        </div>

        <div className="right-controls">
          <label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="filter-select-inline">
              <option value="">All types</option>
              <option value="sheet_music">Sheet Music</option>
              <option value="assignment">Assignments</option>
              <option value="reference">References</option>
            </select>
          </label>
          <label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select-inline">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
      </div>

      <div className="documents-grid">
        {visibleDocuments.map(doc => {
          const ext = doc.name.split('.').pop()?.toLowerCase() || '';
          return (
            <div key={doc.id} className="document-card">
              <div className="card-top">
                {doc.previewUrl ? (
                  ext === 'pdf' ? (
                    <DocumentPdfThumbnail url={doc.previewUrl} />
                  ) : (
                    <img src={doc.previewUrl} className="doc-preview-img" alt={doc.name} />
                  )
                ) : (
                  <div className="doc-icon">{getTypeIcon(doc.type)}</div>
                )}
              </div>

              <div className="doc-meta">
                <div className="doc-title">{doc.title || doc.name}</div>
                <div className="doc-sub">{doc.uploadDate} • {doc.size}</div>
              </div>

              {editingId === doc.id ? null : (
                <div className="card-actions">
                  <button className="action-small" title="Download">📥</button>
                  <button className="action-small" onClick={() => toggleVisibility(doc.id)} title="Toggle visibility">{doc.visible ? '👁️' : '🚫'}</button>
                  <button className="action-small" onClick={() => startEdit(doc)} title="Edit">✏️</button>
                  <button className="action-small delete" onClick={() => deleteDocument(doc.id)} title="Delete">🗑️</button>
                </div>
              )}

              {editingId === doc.id && (
                <div className="card-edit">
                  <input className="edit-input" value={editFields.title ?? ''} onChange={e => setEditFields(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" />
                  <textarea className="edit-textarea" value={editFields.comments ?? ''} onChange={e => setEditFields(prev => ({ ...prev, comments: e.target.value }))} placeholder="Comments / Notes" />
                  <div className="edit-actions">
                    <button className="primary-btn" onClick={() => saveEdit(doc.id)}>Save</button>
                    <button className="action-small" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Renders the first page of a PDF `url` into a small canvas thumbnail using pdfjs
const DocumentPdfThumbnail: React.FC<{ url: string }> = ({ url }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let loadingTask: any = null;

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const workerUrl = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).href;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

        loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        if (cancelled) { pdf.destroy?.(); return; }
        const page = await pdf.getPage(1);
        if (cancelled) { pdf.destroy?.(); return; }
        const viewport = page.getViewport({ scale: 1 });

        // target thumbnail size - larger for new layout
        const maxW = 200;
        const maxH = 280;
        const scale = Math.min(maxW / viewport.width, maxH / viewport.height, 1);
        const scaled = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) {
          pdf.destroy?.();
          return;
        }
        const context = canvas.getContext('2d');
        if (!context) {
          pdf.destroy?.();
          return;
        }
        canvas.width = Math.round(scaled.width);
        canvas.height = Math.round(scaled.height);

        const renderTask = page.render({ canvasContext: context, viewport: scaled });
        await renderTask.promise;
        pdf.destroy?.();
      } catch (err) {
        console.warn('PDF thumbnail render failed', err);
      }
    })();

    return () => {
      cancelled = true;
      try { loadingTask?.destroy?.(); } catch {}
    };
  }, [url]);

  return <canvas ref={canvasRef} className="doc-preview-canvas" aria-hidden />;
};

