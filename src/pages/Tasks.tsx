import React, { useEffect, useState } from 'react';
import {
  Plus, CheckSquare, Trash2, Pencil, Calendar, Flag, User2,
  Search, Filter, ChevronDown, X,
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

  // Filters
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
      addToast('success', 'Task deleted');
    } catch {
      addToast('error', 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      const updated = await updateTask(taskId, { status });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
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
          <h2 className="text-xl font-bold text-white">Tasks</h2>
          <p className="text-sm text-gray-400">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all w-52"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
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
            className="pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
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
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/10"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckSquare className="w-12 h-12 text-gray-700 mb-3" />
          <p className="text-gray-400 font-medium">No tasks found</p>
          <p className="text-gray-600 text-sm mt-1">
            {user?.role === 'Admin' ? 'Create a new task to get started.' : 'No tasks assigned to you yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const overdue = isOverdue(task.dueDate) && task.status !== 'Done';
            return (
              <div
                key={task._id}
                className={`group bg-gray-900/60 border rounded-2xl p-4 hover:bg-gray-900/80 transition-all duration-200 ${overdue ? 'border-rose-500/30' : 'border-white/10 hover:border-purple-500/30'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Status toggle */}
                  <button
                    onClick={() => {
                      const next = task.status === 'Todo' ? 'In Progress' : task.status === 'In Progress' ? 'Done' : 'Todo';
                      handleStatusChange(task._id, next);
                    }}
                    className="mt-0.5 flex-shrink-0"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.status === 'Done'
                        ? 'border-emerald-500 bg-emerald-500'
                        : task.status === 'In Progress'
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-600 hover:border-purple-500'
                    }`}>
                      {task.status === 'Done' && <div className="w-2 h-2 bg-white rounded-full" />}
                      {task.status === 'In Progress' && <div className="w-2 h-2 bg-purple-400 rounded-full" />}
                    </div>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className={`text-sm font-semibold ${task.status === 'Done' ? 'line-through text-gray-500' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                      </div>
                      {user?.role === 'Admin' && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(task._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
                      <span className={`inline-flex items-center gap-1 text-xs ml-auto ${overdue ? 'text-rose-400' : 'text-gray-500'}`}>
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
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? 'Edit Task' : 'New Task'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Task description"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Due Date *</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Project *</label>
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            >
              <option value="">Select project</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>

          {user?.role === 'Admin' && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Assign To *</label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                <option value="">Select member</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
          )}

          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
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
