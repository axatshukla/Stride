import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import './Calendar.css';

export default function Calendar() {
  const { tasks, setEditingTask, setCreateModalOpen } = useApp();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // 1. Calculate Day 1 of current month day of week (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  interface CalendarDay {
    day: number;
    month: number;
    year: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }

  const days: CalendarDay[] = [];

  // Prev month filler days (e.g. Aug 30, Aug 31 when Sep starts on Tuesday)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDay = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const mStr = String(prevMonth + 1).padStart(2, '0');
    const dStr = String(prevDay).padStart(2, '0');
    days.push({
      day: prevDay,
      month: prevMonth,
      year: prevYear,
      dateStr: `${prevYear}-${mStr}-${dStr}`,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    const isToday =
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    days.push({
      day: d,
      month,
      year,
      dateStr: `${year}-${mStr}-${dStr}`,
      isCurrentMonth: true,
      isToday,
    });
  }

  // Next month filler days to complete standard 7-column rows (35 or 42 cells total)
  const remainder = days.length % 7;
  const trailingDays = remainder === 0 ? 0 : 7 - remainder;
  for (let t = 1; t <= trailingDays; t++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const mStr = String(nextMonth + 1).padStart(2, '0');
    const dStr = String(t).padStart(2, '0');
    days.push({
      day: t,
      month: nextMonth,
      year: nextYear,
      dateStr: `${nextYear}-${mStr}-${dStr}`,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Exact matching against YYYY-MM-DD prefix (handles ISO strings and date-only strings)
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      const formatted = t.dueDate.slice(0, 10);
      return formatted === dateStr;
    });
  };

  const getStatusClass = (status: string) => {
    const s = (status || '').toLowerCase().replace(/[_\s]+/g, '-');
    if (s.includes('done')) return 'status-done';
    if (s.includes('progress')) return 'status-in-progress';
    return 'status-todo';
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div className="calendar-title-wrap">
          <h1>Calendar</h1>
          <p>Schedule, manage, and track deliverables across timeline deadlines.</p>
        </div>

        <div className="calendar-controls">
          <div className="calendar-month-nav">
            <button className="calendar-nav-btn" onClick={handlePrevMonth} aria-label="Previous month">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="calendar-current-month">
              {monthNames[month]} {year}
            </span>
            <button className="calendar-nav-btn" onClick={handleNextMonth} aria-label="Next month">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            New Task
          </Button>
        </div>
      </div>

      <div className="calendar-grid-card">
        {/* 7 Header Columns: SUN, MON, TUE, WED, THU, FRI, SAT */}
        <div className="calendar-days-header">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="calendar-day-name">{d}</div>
          ))}
        </div>

        {/* 7-Column Date Grid */}
        <div className="calendar-days-grid">
          {days.map((item, idx) => {
            const dateTasks = getTasksForDate(item.dateStr);
            return (
              <div
                key={`${item.dateStr}-${idx}`}
                className={`calendar-cell ${!item.isCurrentMonth ? 'other-month' : ''} ${item.isToday ? 'today' : ''}`}
                onClick={(e) => {
                  // If clicked on cell whitespace, open task creator
                  if ((e.target as HTMLElement).closest('.calendar-task-item')) return;
                  setCreateModalOpen(true);
                }}
              >
                <div className="calendar-cell-top">
                  <span className="calendar-date-number">{item.day}</span>
                  {dateTasks.length > 0 && (
                    <span className="calendar-task-count">{dateTasks.length}</span>
                  )}
                </div>

                <div className="calendar-cell-tasks">
                  {dateTasks.map(t => (
                    <div
                      key={t.id}
                      className={`calendar-task-item ${getStatusClass(t.status)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(t);
                      }}
                      title={`${t.key}: ${t.title} (${t.status})`}
                    >
                      <span className="calendar-task-key">{t.key}</span>
                      <span className="calendar-task-title">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
