import React, { useState, useRef, useEffect } from 'react';
import './DocumentsDashboard.css';
import { useAuth } from '../../auth/AuthContext';
import type { Document } from '../../data/supabaseApi';
import { 
  getClassroomDocuments, 
  createDocument, 
  updateDocument, 
  deleteDocument as deleteDocumentApi, 
  uploadFile, 
  getSignedUrl, 
  deleteStorageFile
} from '../../data/supabaseApi';

interface DocumentFile extends Document {
  previewUrl?: string; // object URL for previewing uploaded files
}

// Accept optional classroomId for scoped document access
export const DocumentsDashboard: React.FC<{ classroomId?: string; onDocumentsChange?: (docs: any[]) => void }> = ({ classroomId, onDocumentsChange }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ title?: string; comments?: string }>({});
  const createdUrlsRef = useRef<string[]>([]);

  // Load documents from database
  useEffect(() => {
    const loadDocuments = async () => {
      if (!user || !classroomId) return;
      
      try {
        setLoading(true);
        const data = await getClassroomDocuments(classroomId);
        setDocuments(data as DocumentFile[]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [user, classroomId]);

  // Notify parent when documents change
  useEffect(() => {
    if (onDocumentsChange) {
      onDocumentsChange(documents.map(d => ({ id: d.id, title: d.title, name: d.name })));
    }
  }, [documents, onDocumentsChange]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length || !user || !classroomId) return;

    try {
      setIsSaving(true);
      
      for (const file of Array.from(files)) {
        // 1. Upload file to Storage (private bucket)
        const { path } = await uploadFile(
          'classroom-documents',
          `${classroomId}/${Date.now()}-${file.name}`,
          file
        );

        // 2. Create document record in database (store path only, not public URL)
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const type = ext === 'pdf' ? 'sheet_music' : (ext === 'doc' || ext === 'docx' ? 'reference' : 'reference');
        
        const newDoc = await createDocument(
          classroomId,
          user.id,
          {
            title: file.name.replace(/\.[^.]+$/, ''),
            name: file.name,
            file_url: path,
            type,
            file_size_mb: Math.round(file.size / 1024 / 1024 * 100) / 100,
            upload_date: new Date().toISOString(),
            visible: true
          }
        );

        setDocuments(prev => [...prev, newDoc as DocumentFile]);
      }
      
      e.currentTarget.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload documents');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm('Delete this document?')) return;

    try {
      setIsSaving(true);
      const doc = documents.find(d => d.id === id);
      
      // Delete from Storage if it has a path
      if (doc && doc.file_url) {
        await deleteStorageFile('classroom-documents', doc.file_url);
      }
      
      // Delete from Database
      await deleteDocumentApi(id);
      
      setDocuments(documents.filter(d => d.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisibility = async (id: string) => {
    try {
      const doc = documents.find(d => d.id === id);
      if (!doc) return;

      const updated = await updateDocument(id, {
        visible: !doc.visible
      });

      setDocuments(prev => prev.map(d => d.id === id ? { ...d, visible: updated.visible } : d));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
    }
  };

  const startEdit = (doc: DocumentFile) => {
    setEditingId(doc.id);
    setEditFields({ title: doc.title, comments: doc.comments });
  };

  const saveEdit = async (id: string) => {
    try {
      setIsSaving(true);
      await updateDocument(id, {
        title: editFields.title,
        comments: editFields.comments
      });

      setDocuments(prev => prev.map(d => d.id === id ? { ...d, title: editFields.title, description: editFields.comments } : d));
      setEditingId(null);
      setEditFields({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFields({});
  };

  const handleDownload = async (doc: DocumentFile) => {
    if (!doc.file_url) return;

    try {
      setIsSaving(true);
      // Generate temporary signed URL (valid for 1 hour)
      const signedUrl = await getSignedUrl('classroom-documents', doc.file_url, 3600);
      
      // Download using the signed URL
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    } finally {
      setIsSaving(false);
    }
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

  const filtered = documents.filter(d => !filterType || d.type === filterType);

  const visibleDocuments = filtered.sort((a,b) => {
    if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    if (sortBy === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    if (sortBy === 'name') return a.title?.localeCompare(b.title || a.name) || 0;
    return 0;
  });

  return (
    <div className="documents-dashboard">
      <div className="documents-header">
        <h2>Documents Dashboard</h2>
        <p>Manage sheet music, assignments, and class materials</p>
      </div>

      {error && (
        <div className="error-banner" style={{ 
          padding: '12px 16px', 
          marginBottom: '16px', 
          backgroundColor: '#fee', 
          border: '1px solid #f99', 
          borderRadius: '4px',
          color: '#c33'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading documents...
        </div>
      ) : (
      <>
      <div className="documents-controls">
        <div className="left-controls">
          <input ref={fileInputRef} type="file" multiple onChange={handleUpload} className="file-input-hidden" accept=".pdf,.doc,.docx" />
          <button className="primary-btn upload-main" onClick={openFilePicker} disabled={isSaving}>
            {isSaving ? '⏳ Uploading...' : '+ Upload Document'}
          </button>
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
                <div className="doc-sub">{new Date(doc.created_at || 0).toLocaleDateString()} • {doc.file_size_mb} MB</div>
              </div>

              {editingId === doc.id ? null : (
                <div className="card-actions">
                  <button className="action-small" onClick={() => handleDownload(doc)} title="Download" disabled={isSaving}>📥</button>
                  <button className="action-small" onClick={() => toggleVisibility(doc.id)} title="Toggle visibility" disabled={isSaving}>{doc.visible ? '👁️' : '🚫'}</button>
                  <button className="action-small" onClick={() => startEdit(doc)} title="Edit" disabled={isSaving}>✏️</button>
                  <button className="action-small delete" onClick={() => deleteDocument(doc.id)} title="Delete" disabled={isSaving}>🗑️</button>
                </div>
              )}

              {editingId === doc.id && (
                <div className="card-edit">
                  <input className="edit-input" value={editFields.title ?? ''} onChange={e => setEditFields(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" />
                  <textarea className="edit-textarea" value={editFields.comments ?? ''} onChange={e => setEditFields(prev => ({ ...prev, comments: e.target.value }))} placeholder="Comments / Notes" />
                  <div className="edit-actions">
                    <button className="primary-btn" onClick={() => saveEdit(doc.id)} disabled={isSaving}>Save</button>
                    <button className="action-small" onClick={cancelEdit} disabled={isSaving}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      </>
      )}
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

