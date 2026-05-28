import React, { useEffect, useState } from 'react';
import {
  Plus, CheckSquare, Trash2, Pencil, Calendar, Flag, User2,
  Search, Filter, ChevronDown, X, LayoutList, LayoutGrid, Briefcase,
} from 'lucide-react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import type { TaskPayload } from '../api/tasks';
import { fetchProjects } from '../api/projects';
import type { Task, Project } from '../types';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { format, isOverdue } from '../utils/dateUtils';
import api from '../api/axiosInstance';

const priorityColors = {
  Low: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  High: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

const statusColors = {
  'Todo': 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  'In Progress': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Done': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const statusBorderColors = {
  'Todo': 'border-gray-500/40 hover:border-gray-500/70',
  'In Progress': 'border-purple-500/40 hover:border-purple-500/70',
  'Done': 'border-emerald-500/40 hover:border-emerald-500/70',
};

const kanbanColumns: { id: Task['status']; label: string; accent: string; header: string }[] = [
  { id: 'Todo', label: 'Todo', accent: 'border-gray-500', header: 'bg-gray-500/10 text-gray-400' },
  { id: 'In Progress', label: 'In Progress', accent: 'border-purple-500', header: 'bg-purple-500/10 text-purple-400' },
  { id: 'Done', label: 'Done', accent: 'border-emerald-500', header: 'bg-emerald-500/10 text-emerald-400' },
];

interface SimpleUser { _id: string; name: string; email: string; }

const emptyForm: TaskPayload = {
  title: '', description: '', status: 'Todo',
  priority: 'Medium', dueDate: '', assignedTo: '', projectId: '',
};

const Tasks: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const load = async () => {
    try {
      const [t, p] = await Promise.all([fetchTasks(), fetchProjects()]);
      setTasks(t);
      setProjects(p);
      if (user?.role === 'Admin') {
        const res = await api.get<SimpleUser[]>('/auth/users');
        setUsers(res.data);
      }
    } catch {
      addToast('error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTask(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t: Task) => {
    setDetailTask(null);
    setEditTask(t);
    setForm({
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate?.split('T')[0] ?? '',
      assignedTo: t.assignedTo?._id ?? '',
      projectId: t.projectId?._id ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.dueDate) return;
    setSaving(true);
    try {
      if (editTask) {
        const updated = await updateTask(editTask._id, form);
        setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        addToast('success', 'Task updated');
      } else {
        const created = await createTask(form);
        setTasks((prev) => [...prev, created]);
        addToast('success', 'Task created');
      }
      setModalOpen(false);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      setDetailTask(null);
      addToast('success', 'Task deleted');
    } catch {
      addToast('error', 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      const updated = await updateTask(taskId, { status });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      if (detailTask?._id === taskId) setDetailTask(updated);
      addToast('success', 'Status updated');
    } catch {
      addToast('error', 'Failed to update status');
    }
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    const matchPriority = filterPriority ? t.priority === filterPriority : true;
    return matchSearch && matchStatus && matchPriority;
  });

  const clearFilters = () => { setSearch(''); setFilterStatus(''); setFilterPriority(''); };
  const hasFilters = search || filterStatus || filterPriority;

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-primary">Tasks</h2>
          <p className="text-sm text-secondary">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-elevated border border-subtle rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-400' : 'text-muted hover:text-primary'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              title="Kanban view"
              className={`p-2.5 transition-all ${viewMode === 'kanban' ? 'bg-purple-500/20 text-purple-400' : 'text-muted hover:text-primary'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {user?.role === 'Admin' && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 pr-4 py-2 bg-elevated border-subtle border rounded-xl text-sm text-primary placeholder:text-muted focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all w-40 sm:w-52"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-9 pr-8 py-2 bg-elevated border-subtle border rounded-xl text-sm text-primary focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        </div>

        <div className="relative">
          <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="pl-9 pr-8 py-2 bg-elevated border-subtle border rounded-xl text-sm text-primary focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-primary hover:bg-elevated rounded-xl transition-all border border-subtle"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckSquare className="w-12 h-12 text-gray-700 mb-3" />
          <p className="text-secondary font-medium">No tasks found</p>
          <p className="text-muted text-sm mt-1">
            {user?.role === 'Admin' ? 'Create a new task to get started.' : 'No tasks assigned to you yet.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* ── List View ── */
        <div className="space-y-3">
          {filtered.map((task) => {
            const overdue = isOverdue(task.dueDate) && task.status !== 'Done';
            return (
              <div
                key={task._id}
                onClick={() => setDetailTask(task)}
                className={`group bg-surface border rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${statusBorderColors[task.status]}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className={`text-sm font-semibold ${task.status === 'Done' ? 'line-through text-muted' : 'text-primary'}`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-secondary mt-0.5 line-clamp-1">{task.description}</p>
                      </div>
                      <div
                        className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(user?.role === 'Admin' || user?._id === task.assignedTo?._id) && (
                          <button
                            onClick={() => openEdit(task)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {user?.role === 'Admin' && (
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${statusColors[task.status]}`}>
                        {task.status}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                        <Flag className="w-2.5 h-2.5" />
                        {task.priority}
                      </span>
                      {task.assignedTo && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <User2 className="w-3 h-3" />
                          {task.assignedTo.name}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 text-xs ml-auto ${overdue ? 'text-rose-500' : 'text-muted'}`}>
                        <Calendar className="w-3 h-3" />
                        {overdue ? 'Overdue · ' : ''}{format(task.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Kanban View ── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className={`bg-surface border border-subtle rounded-2xl border-t-2 ${col.accent} flex flex-col`}>
                <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${col.header}`}>
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/20">{colTasks.length}</span>
                </div>
                <div className="p-3 space-y-2 flex-1">
                  {colTasks.length === 0 ? (
                    <p className="text-center text-xs text-muted py-6">No tasks</p>
                  ) : (
                    colTasks.map((task) => {
                      const overdue = isOverdue(task.dueDate) && task.status !== 'Done';
                      return (
                        <div
                          key={task._id}
                          onClick={() => setDetailTask(task)}
                          className={`bg-elevated rounded-xl p-3 border cursor-pointer transition-all hover:shadow-md ${statusBorderColors[task.status]}`}
                        >
                          <h4 className={`text-sm font-medium mb-2 ${task.status === 'Done' ? 'line-through text-muted' : 'text-primary'}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-secondary line-clamp-2 mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                              <Flag className="w-2.5 h-2.5" />
                              {task.priority}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-xs ${overdue ? 'text-rose-500' : 'text-muted'}`}>
                              <Calendar className="w-3 h-3" />
                              {format(task.dueDate)}
                            </span>
                          </div>
                          {task.assignedTo && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <User2 className="w-3 h-3" />
                              {task.assignedTo.name}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Task Detail Dialog ── */}
      <Modal isOpen={!!detailTask} onClose={() => setDetailTask(null)} title="Task Details" size="lg">
        {detailTask && (() => {
          const overdue = isOverdue(detailTask.dueDate) && detailTask.status !== 'Done';
          return (
            <div className="space-y-5">
              {/* Title + priority */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${detailTask.status === 'Done' ? 'line-through text-muted' : 'text-primary'}`}>
                    {detailTask.title}
                  </h3>
                  {detailTask.description && (
                    <p className="text-sm text-secondary mt-1 leading-relaxed">{detailTask.description}</p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${priorityColors[detailTask.priority]}`}>
                  <Flag className="w-3 h-3" />
                  {detailTask.priority}
                </span>
              </div>

              <div className="h-px bg-subtle" />

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <p className="text-xs text-muted mb-1.5 uppercase tracking-wide">Status</p>
                  <select
                    value={detailTask.status}
                    onChange={(e) => handleStatusChange(detailTask._id, e.target.value as Task['status'])}
                    className="input-base text-sm py-1.5"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                {/* Due date */}
                <div>
                  <p className="text-xs text-muted mb-1.5 uppercase tracking-wide">Due Date</p>
                  <span className={`inline-flex items-center gap-1.5 text-sm ${overdue ? 'text-rose-400' : 'text-secondary'}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    {overdue && <span className="text-rose-400 font-medium">Overdue · </span>}
                    {format(detailTask.dueDate)}
                  </span>
                </div>

                {/* Assigned to */}
                <div>
                  <p className="text-xs text-muted mb-1.5 uppercase tracking-wide">Assigned To</p>
                  {detailTask.assignedTo ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-secondary">
                      <User2 className="w-3.5 h-3.5" />
                      {detailTask.assignedTo.name}
                    </span>
                  ) : (
                    <span className="text-sm text-muted">Unassigned</span>
                  )}
                </div>

                {/* Project */}
                <div>
                  <p className="text-xs text-muted mb-1.5 uppercase tracking-wide">Project</p>
                  {detailTask.projectId ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-secondary">
                      <Briefcase className="w-3.5 h-3.5" />
                      {detailTask.projectId.title}
                    </span>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </div>

                {/* Created by */}
                {detailTask.createdBy && (
                  <div>
                    <p className="text-xs text-muted mb-1.5 uppercase tracking-wide">Created By</p>
                    <span className="text-sm text-secondary">{detailTask.createdBy.name}</span>
                  </div>
                )}

                {/* Created at */}
                <div>
                  <p className="text-xs text-muted mb-1.5 uppercase tracking-wide">Created</p>
                  <span className="text-sm text-secondary">{format(detailTask.createdAt)}</span>
                </div>
              </div>

              <div className="h-px bg-subtle" />

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDetailTask(null)}
                  className="flex-1 py-2.5 rounded-xl border border-subtle text-secondary hover:text-primary hover:bg-elevated text-sm font-medium transition-all"
                >
                  Close
                </button>
                {(user?.role === 'Admin' || user?._id === detailTask.assignedTo?._id) && (
                  <button
                    onClick={() => openEdit(detailTask)}
                    className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Task
                  </button>
                )}
                {user?.role === 'Admin' && (
                  <button
                    onClick={() => handleDelete(detailTask._id)}
                    className="p-2.5 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-subtle transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── Edit / Create Modal ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? 'Edit Task' : 'New Task'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-secondary mb-1.5">Title *</label>
            <input
              type="text"
              disabled={user?.role === 'Member'}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              className="input-base disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-secondary mb-1.5">Description</label>
            <textarea
              disabled={user?.role === 'Member'}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Task description"
              rows={2}
              className="input-base resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
              className="input-base"
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Priority</label>
            <select
              disabled={user?.role === 'Member'}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
              className="input-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Due Date *</label>
            <input
              type="date"
              disabled={user?.role === 'Member'}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="input-base disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">Project *</label>
            <select
              disabled={user?.role === 'Member'}
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="input-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select project</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>

          {user?.role === 'Admin' && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-secondary mb-1.5">Assign To *</label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="input-base"
              >
                <option value="">Select member</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
          )}

          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-subtle text-secondary hover:text-primary hover:bg-elevated text-sm font-medium transition-all">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.dueDate}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-all"
            >
              {saving ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
