import React, { useState, useRef, useEffect } from 'react';
import './Schedule.css';

interface ScheduleEntry {
  id: string;
  date: string;
  topic: string;
  notes?: string;
  bullets?: string[];
  attachedDocuments?: string[];
  studentId?: string;
}

interface DocumentFile {
  id: string;
  name: string;
  title?: string;
}

export const Schedule: React.FC<{ studentId?: string; availableDocuments?: DocumentFile[] }> = ({ studentId, availableDocuments = [] }) => {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([
    {
      id: '1',
      date: '2024-11-20',
      topic: 'Finger Technique - Week 4',
      notes: 'Focus on hand position and finger independence.',
      bullets: ['Review Hanon exercises', 'Practice finger independence drills', 'Check hand posture'],
      attachedDocuments: [],
      studentId: '1',
    },
    {
      id: '2',
      date: '2024-11-27',
      topic: 'Sight Reading Practice',
      notes: 'Work through beginner to intermediate sight reading pieces.',
      bullets: ['Start with easy exercises', 'Progress to intermediate pieces'],
      attachedDocuments: [],
      studentId: '2',
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<ScheduleEntry>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const openAddForm = () => {
    setShowAddForm(true);
    setEditFields({
      date: new Date().toISOString().slice(0, 10),
      topic: '',
      notes: '',
      bullets: [],
      attachedDocuments: [],
      studentId: studentId,
    });
  };

  const addEvent = () => {
    if (!editFields.date || !editFields.topic) {
      alert('Please fill in the date and topic');
      return;
    }

    const newEvent: ScheduleEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: editFields.date || '',
      topic: editFields.topic || '',
      notes: editFields.notes || '',
      bullets: editFields.bullets || [],
      attachedDocuments: editFields.attachedDocuments || [],
      studentId: studentId,
    };

    setSchedules(prev => [...prev, newEvent].sort((a, b) => a.date.localeCompare(b.date)));
    setShowAddForm(false);
    setEditFields({});
  };

  const startEdit = (entry: ScheduleEntry) => {
    setEditingId(entry.id);
    setEditFields({ ...entry });
  };

  const saveEdit = () => {
    if (!editFields.id) return;
    setSchedules(prev =>
      prev.map(e =>
        e.id === editFields.id
          ? { ...e, ...editFields }
          : e
      ).sort((a, b) => a.date.localeCompare(b.date))
    );
    setEditingId(null);
    setEditFields({});
  };

  const deleteEvent = (id: string) => {
    setSchedules(prev => prev.filter(e => e.id !== id));
    if (editingId === id) setEditingId(null);
    setOpenMenuId(null);
  };

  // Close open menus when clicking outside
  useEffect(() => {
    const onDocClick = () => setOpenMenuId(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const cancelEdit = () => {
    setEditingId(null);
    setEditFields({});
    setShowAddForm(false);
  };

  const addBullet = (list: string[] | undefined = []) => {
    setEditFields(prev => ({
      ...prev,
      bullets: [...(list || []), ''],
    }));
  };

  const updateBullet = (index: number, value: string) => {
    const bullets = editFields.bullets || [];
    const updated = [...bullets];
    updated[index] = value;
    setEditFields(prev => ({ ...prev, bullets: updated }));
  };

  const removeBullet = (index: number) => {
    const bullets = editFields.bullets || [];
    setEditFields(prev => ({
      ...prev,
      bullets: bullets.filter((_, i) => i !== index),
    }));
  };

  const toggleDocumentAttachment = (docName: string) => {
    const attached = editFields.attachedDocuments || [];
    if (attached.includes(docName)) {
      setEditFields(prev => ({
        ...prev,
        attachedDocuments: attached.filter(d => d !== docName),
      }));
    } else {
      setEditFields(prev => ({
        ...prev,
        attachedDocuments: [...attached, docName],
      }));
    }
  };

  const filteredSchedules = schedules.filter(s => !studentId || s.studentId === studentId);

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>Schedule</h2>
        <button className="primary-btn add-event-btn" onClick={openAddForm}>+ Add Event</button>
      </div>

      {showAddForm && (
        <div ref={formRef} className="schedule-form">
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              value={editFields.date || ''}
              onChange={e => setEditFields(prev => ({ ...prev, date: e.target.value }))}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Topic/Title:</label>
            <input
              type="text"
              value={editFields.topic || ''}
              onChange={e => setEditFields(prev => ({ ...prev, topic: e.target.value }))}
              className="form-input"
              placeholder="e.g., Class Session, Assignment Review"
            />
          </div>

          <div className="form-group">
            <label>Notes:</label>
            <textarea
              value={editFields.notes || ''}
              onChange={e => setEditFields(prev => ({ ...prev, notes: e.target.value }))}
              className="form-textarea"
              placeholder="General notes for this event"
            />
          </div>

          <div className="form-group">
            <label>What to Cover:</label>
            <div className="bullets-list">
              {(editFields.bullets || []).map((bullet, idx) => (
                <div key={idx} className="bullet-item">
                  <input
                    type="text"
                    value={bullet}
                    onChange={e => updateBullet(idx, e.target.value)}
                    className="form-input"
                    placeholder={`Bullet point ${idx + 1}`}
                  />
                  <button className="btn-remove" onClick={() => removeBullet(idx)}>✕</button>
                </div>
              ))}
            </div>
            <button className="btn-secondary" onClick={() => addBullet(editFields.bullets)}>+ Add Bullet Point</button>
          </div>

          {availableDocuments.length > 0 && (
            <div className="form-group">
              <label>Attach Documents:</label>
              <div className="documents-selector">
                {availableDocuments.map(doc => (
                  <label key={doc.id} className="doc-checkbox">
                    <input
                      type="checkbox"
                      checked={(editFields.attachedDocuments || []).includes(doc.name)}
                      onChange={() => toggleDocumentAttachment(doc.name)}
                    />
                    <span>{doc.title || doc.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="primary-btn" onClick={addEvent}>Add Event</button>
            <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}

      <div className="schedule-list">
        {filteredSchedules.length === 0 ? (
          <p className="empty-state">No events scheduled. Add one to get started!</p>
        ) : (
          filteredSchedules.map(entry => (
            <div key={entry.id} className={`schedule-card ${editingId === entry.id ? 'editing' : ''}`}>
              {editingId === entry.id ? (
                <div className="schedule-edit-form">
                  <div className="form-group">
                    <label>Date:</label>
                    <input
                      type="date"
                      value={editFields.date || ''}
                      onChange={e => setEditFields(prev => ({ ...prev, date: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Topic/Title:</label>
                    <input
                      type="text"
                      value={editFields.topic || ''}
                      onChange={e => setEditFields(prev => ({ ...prev, topic: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes:</label>
                    <textarea
                      value={editFields.notes || ''}
                      onChange={e => setEditFields(prev => ({ ...prev, notes: e.target.value }))}
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-group">
                    <label>What to Cover:</label>
                    <div className="bullets-list">
                      {(editFields.bullets || []).map((bullet, idx) => (
                        <div key={idx} className="bullet-item">
                          <input
                            type="text"
                            value={bullet}
                            onChange={e => updateBullet(idx, e.target.value)}
                            className="form-input"
                          />
                          <button className="btn-remove" onClick={() => removeBullet(idx)}>✕</button>
                        </div>
                      ))}
                    </div>
                    <button className="btn-secondary" onClick={() => addBullet(editFields.bullets)}>+ Add Bullet Point</button>
                  </div>

                  {availableDocuments.length > 0 && (
                    <div className="form-group">
                      <label>Attach Documents:</label>
                      <div className="documents-selector">
                        {availableDocuments.map(doc => (
                          <label key={doc.id} className="doc-checkbox">
                            <input
                              type="checkbox"
                              checked={(editFields.attachedDocuments || []).includes(doc.name)}
                              onChange={() => toggleDocumentAttachment(doc.name)}
                            />
                            <span>{doc.title || doc.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <button className="primary-btn" onClick={saveEdit}>Save</button>
                    <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="schedule-header-row">
                    <div className="schedule-date">
                      <span className="date-label">📅</span>
                      <span className="date-value">{entry.date}</span>
                    </div>
                    <div className="schedule-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="menu-toggle"
                        aria-haspopup="true"
                        aria-expanded={openMenuId === entry.id}
                        onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === entry.id ? null : entry.id); }}
                        title="More options"
                      >
                        ⋮
                      </button>

                      {openMenuId === entry.id && (
                        <div className="menu-dropdown" onClick={e => e.stopPropagation()}>
                          <button className="menu-item" onClick={() => { startEdit(entry); setOpenMenuId(null); }}>✏️ Edit</button>
                          <button className="menu-item delete" onClick={() => { deleteEvent(entry.id); }}>🗑️ Delete</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="schedule-content">
                    <h4>{entry.topic}</h4>
                    {entry.notes && <p className="schedule-notes">{entry.notes}</p>}

                    {entry.bullets && entry.bullets.length > 0 && (
                      <div className="schedule-bullets">
                        <span className="bullets-label">Topics to Cover:</span>
                        <ul>
                          {entry.bullets.map((bullet, idx) => (
                            bullet && <li key={idx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.attachedDocuments && entry.attachedDocuments.length > 0 && (
                      <div className="schedule-documents">
                        <span className="documents-label">📎 Attached Materials:</span>
                        <ul>
                          {entry.attachedDocuments.map((doc, idx) => (
                            <li key={idx}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
