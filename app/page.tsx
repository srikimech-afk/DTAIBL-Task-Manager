"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Status = "Not started" | "In progress" | "Completed";
type Priority = "Low" | "Medium" | "High";
type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  startDate: string;
  priority: Priority;
  status: Status;
  progress: number;
  createdAt: string;
};

const STORAGE_KEY = "momentum-tasks-v1";
const today = () => new Date().toISOString().slice(0, 10);
const dateLabel = (value: string) => value
  ? new Date(value + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  : "No date";

const starterTasks: Task[] = [
  { id: "sample-1", title: "Plan the week", description: "Choose the three most important outcomes for this week.", startDate: today(), dueDate: today(), priority: "High", status: "In progress", progress: 60, createdAt: new Date().toISOString() },
  { id: "sample-2", title: "Review project milestones", description: "Check deadlines and update the project timeline.", startDate: today(), dueDate: "", priority: "Medium", status: "Not started", progress: 0, createdAt: new Date().toISOString() },
  { id: "sample-3", title: "Organise workspace", description: "Tidy up notes, files, and open browser tabs.", startDate: today(), dueDate: "", priority: "Low", status: "Completed", progress: 100, createdAt: new Date().toISOString() }
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("All tasks");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", startDate: today(), dueDate: "",
    priority: "Medium" as Priority, status: "Not started" as Status, progress: 0
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setTasks(saved ? JSON.parse(saved) : starterTasks);
    } catch {
      setTasks(starterTasks);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  const completed = tasks.filter(t => t.status === "Completed").length;
  const active = tasks.filter(t => t.status === "In progress").length;
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < today() && t.status !== "Completed").length;
  const overall = tasks.length ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length) : 0;

  const visibleTasks = useMemo(() => tasks
    .filter(t => filter === "All tasks" || t.status === filter)
    .filter(t => (t.title + " " + t.description).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }), [tasks, filter, search]);

  function openNew() {
    setEditing(null);
    setForm({ title: "", description: "", startDate: today(), dueDate: "", priority: "Medium", status: "Not started", progress: 0 });
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setForm({ title: task.title, description: task.description, startDate: task.startDate, dueDate: task.dueDate, priority: task.priority, status: task.status, progress: task.progress });
    setModalOpen(true);
  }

  function saveTask(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const progress = form.status === "Completed" ? 100 : form.status === "Not started" ? Math.min(form.progress, 99) : Math.max(1, Math.min(form.progress, 99));
    if (editing) {
      setTasks(current => current.map(t => t.id === editing.id ? { ...t, ...form, title: form.title.trim(), progress } : t));
    } else {
      setTasks(current => [{ ...form, title: form.title.trim(), progress, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current]);
    }
    setModalOpen(false);
  }

  function updateProgress(task: Task, value: number) {
    const progress = Math.max(0, Math.min(100, value));
    const status: Status = progress === 100 ? "Completed" : progress === 0 ? "Not started" : "In progress";
    setTasks(current => current.map(t => t.id === task.id ? { ...t, progress, status } : t));
  }

  function updateStatus(task: Task, status: Status) {
    setTasks(current => current.map(t => t.id === task.id ? { ...t, status, progress: status === "Completed" ? 100 : status === "Not started" ? 0 : Math.max(1, t.progress === 100 ? 50 : t.progress) } : t));
  }

  function deleteTask(id: string) {
    if (window.confirm("Delete this task? This cannot be undone.")) setTasks(current => current.filter(t => t.id !== id));
  }

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">m</span><span>momentum</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className={`nav-item ${filter === "All tasks" ? "selected" : ""}`} onClick={() => setFilter("All tasks")}><span>▦</span> All tasks <b>{tasks.length}</b></button>
        <button className={`nav-item ${filter === "In progress" ? "selected" : ""}`} onClick={() => setFilter("In progress")}><span>◷</span> In progress <b>{active}</b></button>
        <button className={`nav-item ${filter === "Completed" ? "selected" : ""}`} onClick={() => setFilter("Completed")}><span>✓</span> Completed <b>{completed}</b></button>
        <div className="sidebar-bottom">
          <div className="tip-card">
            <div className="tip-icon">✦</div>
            <strong>Small steps add up.</strong>
            <p>Keep moving forward. Progress beats perfection.</p>
          </div>
          <div className="profile"><div className="avatar">Y</div><div><strong>Your workspace</strong><small>Personal plan</small></div><span className="dots">···</span></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Overview</div>
          <div className="top-actions"><span className="today-chip">◷ &nbsp; {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span><div className="avatar small">Y</div></div>
        </header>

        <div className="content">
          <section className="welcome-row">
            <div><div className="eyebrow">YOUR PERSONAL DASHBOARD</div><h1>{greeting} <span>✳</span></h1><p className="subheading">Here's what's happening with your tasks today.</p></div>
            <button className="primary-btn" onClick={openNew}><span>＋</span> New task</button>
          </section>

          <section className="stats-grid">
            <div className="stat-card"><div className="stat-top"><span>Total tasks</span><span className="stat-icon lavender">▦</span></div><div className="stat-value">{tasks.length}</div><div className="stat-foot">Across your workspace</div></div>
            <div className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon blue">◷</span></div><div className="stat-value">{active}</div><div className="stat-foot">Tasks you're working on</div></div>
            <div className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon green">✓</span></div><div className="stat-value">{completed}</div><div className="stat-foot">{tasks.length ? Math.round(completed / tasks.length * 100) : 0}% of all tasks</div></div>
            <div className="stat-card"><div className="stat-top"><span>Overdue</span><span className="stat-icon orange">!</span></div><div className="stat-value">{overdue}</div><div className="stat-foot">Need your attention</div></div>
          </section>

          <section className="overview-grid">
            <div className="panel progress-panel">
              <div className="panel-heading"><div><h2>Overall progress</h2><p>Your workspace at a glance</p></div><span className="more">···</span></div>
              <div className="progress-content">
                <div className="ring" style={{ "--progress": `${overall}%` } as React.CSSProperties}><div><strong>{overall}%</strong><small>complete</small></div></div>
                <div className="progress-legend"><div><i className="dot dot-purple"></i><span>Completed</span><b>{completed}</b></div><div><i className="dot dot-blue"></i><span>In progress</span><b>{active}</b></div><div><i className="dot dot-grey"></i><span>Not started</span><b>{tasks.filter(t => t.status === "Not started").length}</b></div></div>
              </div>
            </div>
            <div className="panel focus-panel">
              <div className="panel-heading"><div><h2>Stay on track</h2><p>A little progress every day</p></div><span className="focus-spark">✦</span></div>
              <div className="focus-quote">“The secret of getting ahead is getting started.”</div>
              <div className="focus-author">— Mark Twain</div>
              <div className="focus-bottom"><span>YOUR DAILY REMINDER</span><span>✧</span></div>
            </div>
          </section>

          <section className="tasks-section">
            <div className="tasks-heading"><div><h2>Tasks</h2><p>Manage your work and keep an eye on deadlines.</p></div><button className="outline-btn" onClick={openNew}>＋ Add task</button></div>
            <div className="toolbar">
              <div className="filter-tabs">{["All tasks", "Not started", "In progress", "Completed"].map(item => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
              <label className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." /></label>
            </div>
            <div className="task-list">
              {visibleTasks.length === 0 ? <div className="empty-state"><div>✦</div><strong>No tasks found</strong><p>Add a task or change your search to get started.</p><button className="primary-btn" onClick={openNew}>＋ Create a task</button></div> :
                visibleTasks.map(task => {
                  const isOverdue = task.dueDate && task.dueDate < today() && task.status !== "Completed";
                  return <article className="task-row" key={task.id}>
                    <div className={`task-check ${task.status === "Completed" ? "checked" : ""}`} onClick={() => updateStatus(task, task.status === "Completed" ? "Not started" : "Completed")} role="button" tabIndex={0} aria-label="Toggle task completion">{task.status === "Completed" ? "✓" : ""}</div>
                    <div className="task-main"><button className={`task-title ${task.status === "Completed" ? "done" : ""}`} onClick={() => openEdit(task)}>{task.title}</button><p>{task.description || "No description added"}</p><div className="task-meta"><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority} priority</span><span className={isOverdue ? "due overdue" : "due"}>◷ &nbsp;{task.dueDate ? (isOverdue ? "Overdue · " : "Due ") + dateLabel(task.dueDate) : "No due date"}</span></div></div>
                    <div className="task-progress"><div className="progress-label"><span>Progress</span><b>{task.progress}%</b></div><div className="bar"><span style={{ width: `${task.progress}%` }} /></div><input aria-label={`Update ${task.title} progress`} type="range" min="0" max="100" step="5" value={task.progress} onChange={e => updateProgress(task, Number(e.target.value))} /></div>
                    <div className="task-status"><select aria-label="Task status" value={task.status} onChange={e => updateStatus(task, e.target.value as Status)}><option>Not started</option><option>In progress</option><option>Completed</option></select></div>
                    <div className="task-actions"><button title="Edit task" onClick={() => openEdit(task)}>✎</button><button title="Delete task" onClick={() => deleteTask(task.id)}>×</button></div>
                  </article>
                })
              }
            </div>
            <div className="list-footer"><span>Showing {visibleTasks.length} of {tasks.length} tasks</span><span>Changes save automatically</span></div>
          </section>
          <footer>Made for focus. Built for progress. <span>✦</span></footer>
        </div>
      </section>

      {modalOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <form className="task-modal" onSubmit={saveTask}>
          <div className="modal-heading"><div><div className="eyebrow">{editing ? "UPDATE YOUR WORK" : "MAKE IT HAPPEN"}</div><h2>{editing ? "Edit task" : "Create a new task"}</h2></div><button type="button" className="close-btn" onClick={() => setModalOpen(false)}>×</button></div>
          <label className="field-label">Task name <span>*</span><input autoFocus required maxLength={100} placeholder="e.g. Prepare project proposal" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
          <label className="field-label">Description <textarea rows={3} placeholder="Add a few details about this task..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <div className="form-grid"><label className="field-label">Start date<input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></label><label className="field-label">Due date<input type="date" min={form.startDate || undefined} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></label></div>
          <div className="form-grid"><label className="field-label">Priority<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })}><option>Low</option><option>Medium</option><option>High</option></select></label><label className="field-label">Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}><option>Not started</option><option>In progress</option><option>Completed</option></select></label></div>
          <label className="field-label range-field">Progress <strong>{form.status === "Completed" ? 100 : form.progress}%</strong><input type="range" min="0" max="100" step="5" value={form.status === "Completed" ? 100 : form.progress} onChange={e => setForm({ ...form, progress: Number(e.target.value), status: Number(e.target.value) === 0 ? "Not started" : "In progress" })} /></label>
          <div className="modal-actions"><button type="button" className="cancel-btn" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-btn" type="submit">{editing ? "Save changes" : "Create task"}</button></div>
        </form>
      </div>}
    </main>
  );
}
