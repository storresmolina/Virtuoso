import React, { useState, useRef, useEffect } from 'react';
import './Schedule.css';
import { useAuth } from '../../auth/AuthContext';
import type { ScheduleEntry as ApiScheduleEntry } from '../../data/supabaseApi';
import { getClassroomSchedule, getInstructorGlobalSchedule, createScheduleEntry, updateScheduleEntry, deleteScheduleEntry } from '../../data/supabaseApi';

interface ScheduleEntry {
  id: string;
  date: string;
  topic: string;
  notes?: string;
  bullets?: string[];
  attached_documents?: string[];
  attached_notebooks?: string[];
  classroom_id?: string;
  instructor_id?: string;
}

interface DocumentFile {
  id: string;
  name: string;
  title?: string;
}

interface ScheduleProps {
  studentId?: string;
  classroomId?: string;
  isGlobal?: boolean; // true for instructor's global schedule, false for classroom-specific
  availableDocuments?: DocumentFile[];
  isReadOnly?: boolean; // true for students viewing schedule
}

export const Schedule: React.FC<ScheduleProps> = ({ 
  classroomId,
  isGlobal = false,
  availableDocuments = [],
  isReadOnly = false
}) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const filteredSchedules = schedules || [];
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<ScheduleEntry>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Load schedule data on mount
  useEffect(() => {
    loadSchedule();
  }, [classroomId, isGlobal, user?.id]);

  async function loadSchedule() {
    setLoading(true);
    setError(null);
    try {
      let data: ApiScheduleEntry[] = [];
      
      if (isGlobal && user?.id) {
        // Instructor's global schedule
        data = await getInstructorGlobalSchedule(user.id);
      } else if (classroomId) {
        // Classroom-specific schedule
        data = await getClassroomSchedule(classroomId);
      }
      
      setSchedules(data.map(e => ({
        ...e,
        classroom_id: e.classroom_id,
        instructor_id: e.instructor_id
      })) as ScheduleEntry[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedule');
      console.error('Schedule load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const openAddForm = () => {
    setShowAddForm(true);
    setEditFields({
      date: new Date().toISOString().slice(0, 10),
      topic: '',
      notes: '',
      bullets: [],
      attached_documents: [],
      attached_notebooks: [],
    });
  };

  const addEvent = async () => {
    if (!editFields.date || !editFields.topic) {
      alert('Please fill in the date and topic');
      return;
    }

    if (!classroomId && !isGlobal) {
      alert('No classroom context available');
      return;
    }

    if (!user?.id) {
      alert('Not authenticated');
      return;
    }

    setIsSaving(true);
    try {
      const cid = classroomId || user.id; // Use user ID as fallback for global schedule
      const newEntry = await createScheduleEntry(
        cid,
        user.id,
        {
          date: editFields.date || '',
          topic: editFields.topic || '',
          notes: editFields.notes,
          bullets: editFields.bullets,
          attached_documents: editFields.attached_documents,
          attached_notebooks: editFields.attached_notebooks
        }
      );

      setSchedules(prev => [...prev, {
        ...newEntry,
        classroom_id: newEntry.classroom_id,
        instructor_id: newEntry.instructor_id
      }].sort((a, b) => a.date.localeCompare(b.date)));
      setShowAddForm(false);
      setEditFields({});
    } catch (err: any) {
      setError(err.message || 'Failed to create schedule entry');
      console.error('Create error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (entry: ScheduleEntry) => {
    setEditingId(entry.id);
    setEditFields({ ...entry });
  };

  const saveEdit = async () => {
    if (!editFields.id) return;

    setIsSaving(true);
    try {
      const updated = await updateScheduleEntry(editFields.id, {
        date: editFields.date || '',
        topic: editFields.topic || '',
        notes: editFields.notes,
        bullets: editFields.bullets,
        attached_documents: editFields.attached_documents,
        attached_notebooks: editFields.attached_notebooks
      });

      setSchedules(prev =>
        prev.map(e =>
          e.id === editFields.id
            ? { ...updated, classroom_id: updated.classroom_id, instructor_id: updated.instructor_id }
            : e
        ).sort((a, b) => a.date.localeCompare(b.date))
      );
      setEditingId(null);
      setEditFields({});
    } catch (err: any) {
      setError(err.message || 'Failed to update schedule entry');
      console.error('Update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this schedule entry?')) return;

    setIsSaving(true);
    try {
      await deleteScheduleEntry(id);
      setSchedules(prev => prev.filter(e => e.id !== id));
      if (editingId === id) setEditingId(null);
      setOpenMenuId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete schedule entry');
      console.error('Delete error:', err);
    } finally {
      setIsSaving(false);
    }
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

  const toggleDocumentAttachment = (docId: string) => {
    const attached = editFields.attached_documents || [];
    if (attached.includes(docId)) {
      setEditFields(prev => ({
        ...prev,
        attached_documents: attached.filter(d => d !== docId),
      }));
    } else {
      setEditFields(prev => ({
        ...prev,
        attached_documents: [...attached, docId],
      }));
    }
  };

  // Close open menus when clicking outside
  useEffect(() => {
    const onDocClick = () => setOpenMenuId(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  if (loading) {
    return <div className="schedule-container"><p>Loading schedule...</p></div>;
  }

  if (error) {
    return <div className="schedule-container"><p style={{ color: 'red' }}>Error: {error}</p></div>;
  }

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>Schedule</h2>
        {!isReadOnly && (
          <button 
            className="primary-btn add-event-btn" 
            onClick={openAddForm}
            disabled={isSaving}
          >
            + Add Event
          </button>
        )}
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
                      checked={(editFields.attached_documents || []).includes(doc.name)}
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
                              checked={(editFields.attached_documents || []).includes(doc.name)}
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
                          {entry.bullets.map((bullet: string, idx: number) => (
                            bullet && <li key={idx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.attached_documents && entry.attached_documents.length > 0 && (
                      <div className="schedule-documents">
                        <span className="documents-label">📎 Attached Materials:</span>
                        <ul>
                          {entry.attached_documents.map((doc: string, idx: number) => (
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
