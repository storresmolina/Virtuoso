import React, { useState } from 'react';

interface ScheduleEntry {
  id: string;
  date: string;
  topic: string;
  notes?: string;
  materials?: string[];
}

export const Schedule: React.FC<{ studentId?: string }> = ({ studentId }) => {
  const [schedules] = useState<ScheduleEntry[]>([
    {
      id: '1',
      date: '2024-11-20',
      topic: 'Finger Technique - Week 4',
      notes: 'Focus on hand position and finger independence. Review Hanon exercises.',
      materials: ['Finger_Exercises.pdf', 'Hand_Position_Guide.pdf'],
    },
    {
      id: '2',
      date: '2024-11-27',
      topic: 'Sight Reading Practice',
      notes: 'Work through beginner to intermediate sight reading pieces.',
      materials: ['Sight_Reading_Book.pdf'],
    },
    {
      id: '3',
      date: '2024-12-04',
      topic: 'Performance Preparation',
      notes: 'Prepare for recital - polish pieces and work on stage presence.',
      materials: ['Recital_Pieces.pdf', 'Performance_Tips.pdf'],
    },
  ]);

  return (
    <div className="schedule-container">
      <div className="schedule-list">
        {schedules.map(entry => (
          <div key={entry.id} className="schedule-card">
            <div className="schedule-date">
              <span className="date-label">📅</span>
              <span className="date-value">{entry.date}</span>
            </div>
            <div className="schedule-content">
              <h4>{entry.topic}</h4>
              {entry.notes && <p className="schedule-notes">{entry.notes}</p>}
              {entry.materials && entry.materials.length > 0 && (
                <div className="schedule-materials">
                  <span className="materials-label">Materials:</span>
                  <ul>
                    {entry.materials.map((material, idx) => (
                      <li key={idx}>{material}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
