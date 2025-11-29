import React, { useState, useRef, useEffect } from 'react';
import './Notebooks.css';

interface NotebookEntry {
  id: string;
  title: string;
  content: string;
  formattedContent?: string;
  lastEdited: string;
  createdAt: string;
  class: string;
  studentId?: string;
  attachedDocuments: string[];
}

interface TextFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
}

interface NotebooksProps {
  studentId?: string;
  availableDocuments?: any[];
}

export const Notebooks: React.FC<NotebooksProps> = ({ 
  studentId,
  availableDocuments = []
}) => {
  const [notebooks, setNotebooks] = useState<NotebookEntry[]>([
    {
      id: '1',
      title: 'Week 3 - Finger Technique',
      content: 'Focus on proper hand position and finger independence. Key points to cover:\n• Thumb positioning\n• Finger curvature\n• Practice scales daily',
      lastEdited: '2024-11-10',
      createdAt: '2024-11-10',
      class: 'Piano Basics 101',
      studentId: '1',
      attachedDocuments: []
    },
    {
      id: '2',
      title: 'Advanced Arpeggios',
      content: 'Introduction to complex arpeggio patterns. Topics:\n• Broken chord variations\n• Speed techniques\n• Musical expression',
      lastEdited: '2024-11-08',
      createdAt: '2024-11-05',
      class: 'Advanced Techniques',
      studentId: '2',
      attachedDocuments: []
    },
    {
      id: '3',
      title: 'Theory: Chord Progressions',
      content: 'Understanding common chord progressions in popular music',
      lastEdited: '2024-11-05',
      createdAt: '2024-11-01',
      class: 'Music Theory',
      attachedDocuments: []
    },
  ]);

  const [selectedNotebook, setSelectedNotebook] = useState<NotebookEntry | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editClass, setEditClass] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [textFormat, setTextFormat] = useState<TextFormat>({
    bold: false,
    italic: false,
    underline: false,
    strike: false
  });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // adjust textarea height when editing starts or content changes
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, editContent, selectedNotebook]);

  const handleCreateNew = () => {
    const now = new Date().toISOString().split('T')[0];
    const newNotebook: NotebookEntry = {
      id: Date.now().toString(),
      title: 'New Notebook',
      content: '',
      lastEdited: now,
      createdAt: now,
      class: 'Piano Basics 101',
      studentId: studentId,
      attachedDocuments: []
    };
    setNotebooks([newNotebook, ...notebooks]);
    setSelectedNotebook(newNotebook);
    setEditContent('');
    setEditTitle('New Notebook');
    setEditClass('Piano Basics 101');
    setIsEditing(true);
  };

  const handleSelectNotebook = (notebook: NotebookEntry) => {
    setSelectedNotebook(notebook);
    setEditContent(notebook.content);
    setEditTitle(notebook.title);
    setEditClass(notebook.class);
    setIsEditing(false);
    setShowDocumentSelector(false);
  };

  const handleSaveNotebook = () => {
    if (selectedNotebook) {
      const now = new Date().toISOString().split('T')[0];
      setNotebooks(notebooks.map(nb =>
        nb.id === selectedNotebook.id
          ? { 
              ...nb, 
              content: editContent,
              title: editTitle,
              class: editClass,
              lastEdited: now 
            }
          : nb
      ));
      setSelectedNotebook({ 
        ...selectedNotebook, 
        content: editContent,
        title: editTitle,
        class: editClass,
        lastEdited: now
      });
      setIsEditing(false);
    }
  };

  const handleDeleteNotebook = (id: string) => {
    setNotebooks(notebooks.filter(nb => nb.id !== id));
    if (selectedNotebook?.id === id) {
      setSelectedNotebook(null);
      setEditContent('');
      setIsEditing(false);
    }
  };

  const handleAttachDocument = (docId: string) => {
    if (selectedNotebook && !selectedNotebook.attachedDocuments.includes(docId)) {
      const updated = {
        ...selectedNotebook,
        attachedDocuments: [...selectedNotebook.attachedDocuments, docId]
      };
      setNotebooks(notebooks.map(nb => nb.id === selectedNotebook.id ? updated : nb));
      setSelectedNotebook(updated);
    }
    setShowDocumentSelector(false);
  };

  const handleDetachDocument = (docId: string) => {
    if (selectedNotebook) {
      const updated = {
        ...selectedNotebook,
        attachedDocuments: selectedNotebook.attachedDocuments.filter(d => d !== docId)
      };
      setNotebooks(notebooks.map(nb => nb.id === selectedNotebook.id ? updated : nb));
      setSelectedNotebook(updated);
    }
  };

  const getAttachedDocNames = () => {
    return selectedNotebook?.attachedDocuments.map(docId => {
      const doc = availableDocuments.find(d => d.id === docId);
      return doc?.title || `Document ${docId}`;
    }) || [];
  };

  // Apply or remove simple markup around the selected text.
  const toggleFormat = (format: keyof TextFormat) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const value = editContent;

    const markers: Record<string, string> = {
      bold: '**',
      italic: '*',
      strike: '~~'
    };

    // Helper to update textarea content and restore selection
    const applyChange = (newValue: string, selStart: number, selEnd: number) => {
      setEditContent(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = selStart;
          textareaRef.current.selectionEnd = selEnd;
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
      }, 0);
    };

    if (start === end) {
      // No selection: if caret is between matching markers, remove them; otherwise insert empty markers
      if (format === 'underline') {
        const insertion = '<u></u>';
        const pos = start + 3; // between <u>|</u>
        applyChange(value.slice(0, start) + insertion + value.slice(end), pos, pos);
        setTextFormat(prev => ({ ...prev, [format]: !prev[format] }));
        return;
      }
      const marker = markers[format];
      const markerLen = marker.length;
      const before = value.slice(Math.max(0, start - markerLen), start);
      const after = value.slice(start, Math.min(value.length, start + markerLen));

      // If caret is already between a pair of markers, remove them instead of inserting more
      if (before === marker && after === marker) {
        const newValue = value.slice(0, start - markerLen) + value.slice(start + markerLen);
        applyChange(newValue, start - markerLen, start - markerLen);
        setTextFormat(prev => ({ ...prev, [format]: false }));
        return;
      }

      // Insert markers
      const insertion = marker + marker;
      const pos = start + marker.length;
      applyChange(value.slice(0, start) + insertion + value.slice(end), pos, pos);
      setTextFormat(prev => ({ ...prev, [format]: !prev[format] }));
      return;
    }

    const selected = value.slice(start, end);
    if (format === 'underline') {
      if (selected.startsWith('<u>') && selected.endsWith('</u>')) {
        const unwrapped = selected.slice(3, selected.length - 4);
        applyChange(value.slice(0, start) + unwrapped + value.slice(end), start, start + unwrapped.length);
        setTextFormat(prev => ({ ...prev, underline: false }));
      } else {
        const wrapped = `<u>${selected}</u>`;
        applyChange(value.slice(0, start) + wrapped + value.slice(end), start, start + wrapped.length);
        setTextFormat(prev => ({ ...prev, underline: true }));
      }
      return;
    }

    const marker = markers[format];
    const markerLen = marker.length;

    // If the selected text itself is already wrapped with the marker, unwrap it
    if (selected.startsWith(marker) && selected.endsWith(marker)) {
      const unwrapped = selected.slice(markerLen, selected.length - markerLen);
      applyChange(value.slice(0, start) + unwrapped + value.slice(end), start, start + unwrapped.length);
      setTextFormat(prev => ({ ...prev, [format]: false }));
      return;
    }

    // Check if formatting markers surround the selection (outside the selection boundaries)
    const beforeStart = value.slice(Math.max(0, start - markerLen), start);
    const afterEnd = value.slice(end, Math.min(value.length, end + markerLen));
    const isWrapped = beforeStart.endsWith(marker) && afterEnd.startsWith(marker);

    if (isWrapped) {
      // Remove surrounding markers
      const newValue = value.slice(0, start - markerLen) + selected + value.slice(end + markerLen);
      applyChange(newValue, start - markerLen, start - markerLen + selected.length);
      setTextFormat(prev => ({ ...prev, [format]: false }));
    } else {
      // Add markers around selection
      const wrapped = marker + selected + marker;
      applyChange(value.slice(0, start) + wrapped + value.slice(end), start, start + wrapped.length);
      setTextFormat(prev => ({ ...prev, [format]: true }));
    }
  };

  // Render a small subset of markdown-like syntax to HTML for preview
  const renderFormatted = (raw: string | undefined) => {
    const text = raw || '';
    // preserve <u> tags temporarily
    const withPlaceholders = text.replace(/<u>/g, '[[UOPEN]]').replace(/<\/u>/g, '[[UCLOSE]]');

    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#39;');

    let out = escapeHtml(withPlaceholders);

    // convert bold first, then strike, then italic
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/~~(.+?)~~/g, '<del>$1</del>');
    out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // restore underline placeholders
    out = out.replace(/\[\[UOPEN\]\](.+?)\[\[UCLOSE\]\]/g, '<u>$1</u>');

    // convert newlines to <br>
    out = out.replace(/\n/g, '<br/>');
    return out;
  };

  // Convert an HTML string from contentEditable back into our simple markup
  const htmlToMarkup = (html: string) => {
    if (!html) return '';
    // Replace <br> with newline placeholders
    let out = html.replace(/<br\s*\/?>(\s*\n)?/gi, '\n');
    // Handle strong, em, del, u tags
    out = out.replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**');
    out = out.replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**');
    out = out.replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*');
    out = out.replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*');
    out = out.replace(/<del>([\s\S]*?)<\/del>/gi, '~~$1~~');
    out = out.replace(/<u>([\s\S]*?)<\/u>/gi, '<u>$1<\/u>');
    // Strip any other tags (keep text)
    out = out.replace(/<[^>]+>/g, '');
    // Convert HTML entities
    out = out.replace(/&nbsp;/g, ' ');
    out = out.replace(/&amp;/g, '&');
    out = out.replace(/&lt;/g, '<');
    out = out.replace(/&gt;/g, '>');
    out = out.replace(/&quot;/g, '"');
    out = out.replace(/&#39;/g, "'");
    return out;
  };

  // Keep contentEditable in sync with editContent (rendered HTML)
  useEffect(() => {
    if (isEditing && contentRef.current) {
      const html = renderFormatted(editContent || selectedNotebook?.content);
      // Only update if different to avoid resetting caret unnecessarily
      if (contentRef.current.innerHTML !== html) {
        contentRef.current.innerHTML = html;
      }
    }
  }, [isEditing, editContent, selectedNotebook]);

  return (
    <div className="notebooks">
      <div className="notebooks-header">
        <h2>Notebooks</h2>
        <p>Create elegant class notes with formatting, attachments, and organization</p>
      </div>

      <div className="notebooks-container">
        <div className="notebooks-sidebar">
          <button className="create-btn" onClick={handleCreateNew}>
            ✏️ New Notebook
          </button>

          <div className="notebooks-list">
            <h3>Your Notebooks</h3>
            {notebooks
              .filter(nb => !studentId || nb.studentId === studentId)
              .sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime())
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
                        if (window.confirm('Delete this notebook?')) {
                          handleDeleteNotebook(notebook.id);
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <p className="notebook-class">{notebook.class}</p>
                  <p className="notebook-date">
                    {new Date(notebook.lastEdited).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            {notebooks.filter(nb => !studentId || nb.studentId === studentId).length === 0 && (
              <p className="no-notebooks">No notebooks yet. Create one to get started!</p>
            )}
          </div>
        </div>

        <div className="notebooks-editor">
          {selectedNotebook ? (
            <div className="editor-content">
              <div className="editor-header">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      className="notebook-title-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Notebook Title"
                      autoFocus
                    />
                    <select 
                      className="notebook-class-select" 
                      value={editClass}
                      onChange={(e) => setEditClass(e.target.value)}
                    >
                      <option value="Piano Basics 101">Piano Basics 101</option>
                      <option value="Advanced Techniques">Advanced Techniques</option>
                      <option value="Music Theory">Music Theory</option>
                    </select>
                  </>
                ) : (
                  <>
                    <div className="header-display">
                      <h3>{editTitle}</h3>
                      <span className="class-badge">{editClass}</span>
                    </div>
                  </>
                )}
              </div>

              {isEditing && (
                <div className="formatting-toolbar">
                  <div className="toolbar-group">
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleFormat('bold')}
                          className={`format-btn ${textFormat.bold ? 'active' : ''}`}
                          title="Bold (Ctrl+B)"
                        >
                          <strong>B</strong>
                        </button>
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleFormat('italic')}
                          className={`format-btn ${textFormat.italic ? 'active' : ''}`}
                          title="Italic (Ctrl+I)"
                        >
                          <em>I</em>
                        </button>
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleFormat('underline')}
                          className={`format-btn ${textFormat.underline ? 'active' : ''}`}
                          title="Underline (Ctrl+U)"
                        >
                          <u>U</u>
                        </button>
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleFormat('strike')}
                          className={`format-btn ${textFormat.strike ? 'active' : ''}`}
                          title="Strikethrough (Ctrl+S)"
                        >
                          <s>S</s>
                        </button>
                  </div>
                </div>
              )}

              {isEditing ? (
                <div
                  ref={(el) => { contentRef.current = el; }}
                  className="notebook-editor-contenteditable"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => {
                    const html = (e.target as HTMLDivElement).innerHTML;
                    const markup = htmlToMarkup(html);
                    setEditContent(markup);
                  }}
                  onKeyDown={(e) => {
                    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                    const modKey = isMac ? e.metaKey : e.ctrlKey;
                    if (modKey) {
                      if (e.key === 'b' || e.key === 'B') {
                        e.preventDefault();
                        toggleFormat('bold');
                      } else if (e.key === 'i' || e.key === 'I') {
                        e.preventDefault();
                        toggleFormat('italic');
                      } else if (e.key === 'u' || e.key === 'U') {
                        e.preventDefault();
                        toggleFormat('underline');
                      } else if (e.key === 's' || e.key === 'S') {
                        e.preventDefault();
                        toggleFormat('strike');
                      }
                    }
                  }}
                />
              ) : (
                <div className="notebook-preview" aria-live="polite" dangerouslySetInnerHTML={{ __html: renderFormatted(editContent || selectedNotebook?.content) }} />
              )}

              <div className="editor-attachments">
                <div className="attachments-header">
                  <h4>📎 Attached Documents</h4>
                  {isEditing && (
                    <button 
                      className="attach-btn"
                      onClick={() => setShowDocumentSelector(!showDocumentSelector)}
                    >
                      + Attach
                    </button>
                  )}
                </div>

                {showDocumentSelector && (
                  <div className="document-selector">
                    {availableDocuments.length > 0 ? (
                      availableDocuments.map(doc => (
                        <div
                          key={doc.id}
                          className={`doc-option ${selectedNotebook.attachedDocuments.includes(doc.id) ? 'selected' : ''}`}
                          onClick={() => handleAttachDocument(doc.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedNotebook.attachedDocuments.includes(doc.id)}
                            onChange={() => handleAttachDocument(doc.id)}
                          />
                          <span>{doc.title}</span>
                        </div>
                      ))
                    ) : (
                      <p className="no-docs">No documents available. Create some in the Documents section.</p>
                    )}
                  </div>
                )}

                {selectedNotebook.attachedDocuments.length > 0 && (
                  <ul className="attachments-list">
                    {getAttachedDocNames().map((name, idx) => (
                      <li key={idx}>
                        <span>📄 {name}</span>
                        {isEditing && (
                          <button
                            className="remove-attachment"
                            onClick={() => handleDetachDocument(selectedNotebook.attachedDocuments[idx])}
                          >
                            ✕
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="editor-footer">
                <div className="editor-actions">
                  {isEditing ? (
                    <>
                      <button className="save-btn" onClick={handleSaveNotebook}>
                        ✓ Save Changes
                      </button>
                      <button 
                        className="cancel-btn" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditContent(selectedNotebook.content);
                          setEditTitle(selectedNotebook.title);
                          setEditClass(selectedNotebook.class);
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                      ✎ Edit
                    </button>
                  )}
                </div>
                <p className="last-saved">Last edited: {new Date(selectedNotebook.lastEdited).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="empty-state">
                <div className="empty-icon">📓</div>
                <h3>No Notebook Selected</h3>
                <p>Select an existing notebook or create a new one to get started</p>
                <button className="create-from-empty" onClick={handleCreateNew}>
                  Create New Notebook
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



