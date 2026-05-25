import React, { useEffect, useState } from 'react';
import { Plus, FolderOpen, Trash2, Pencil, Users, Search, FolderKanban } from 'lucide-react';
import { fetchProjects, createProject, updateProject, deleteProject } from '../api/projects';
import type { Project } from '../types';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '10px 14px',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const PROJECT_GRADIENTS = [
  { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.22)', icon: '#f59e0b' },
  { bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.22)', icon: '#3b82f6' },
  { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.22)',  icon: '#22c55e' },
  { bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.22)', icon: '#a855f7' },
  { bg: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.22)', icon: '#fb923c' },
  { bg: 'rgba(244,63,94,0.10)',  border: 'rgba(244,63,94,0.22)',  icon: '#f43f5e' },
];

const Projects: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [projects, setProjects]       = useState<Project[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm]               = useState({ title: '', description: '' });
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch {
      addToast('error', 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditProject(null); setForm({ title: '', description: '' }); setModalOpen(true); };
  const openEdit   = (p: Project) => { setEditProject(p); setForm({ title: p.title, description: p.description }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editProject) {
        const updated = await updateProject(editProject._id, form);
        setProjects(prev => prev.map(p => p._id === updated._id ? updated : p));
        addToast('success', 'Project updated');
      } else {
        const created = await createProject(form);
        setProjects(prev => [...prev, created]);
        addToast('success', 'Project created');
      }
      setModalOpen(false);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      addToast('success', 'Project deleted');
    } catch { addToast('error', 'Failed to delete'); }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const getFocusStyle = (field: string): React.CSSProperties =>
    focusedField === field ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-glow)' } : {};

  if (loading) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Projects</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
          </p>
        </div>
        {user?.role === 'Admin' && (
          <button onClick={openCreate} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 10,
            background: 'var(--accent)', color: '#0a0c10',
            fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(245,158,11,0.28)',
            transition: 'all 0.18s', fontFamily: 'var(--font-display)',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            <Plus size={15} strokeWidth={2.5} /> New Project
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 300 }}>
        <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 16px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <FolderKanban size={24} color="var(--text-muted)" strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>No projects found</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {user?.role === 'Admin' ? 'Create your first project to get started.' : "You haven't been added to any projects yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map((project, idx) => {
            const color = PROJECT_GRADIENTS[idx % PROJECT_GRADIENTS.length];
            return (
              <div key={project._id} className="card" style={{ padding: '20px 20px 16px', position: 'relative' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = color.border}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
              >
                {/* Admin actions */}
                {user?.role === 'Admin' && (
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.18s',
                  }}
                    className="project-actions"
                  >
                    <button onClick={() => openEdit(project)} style={{ padding: '5px', borderRadius: 7, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'all 0.18s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
                    ><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(project._id)} style={{ padding: '5px', borderRadius: 7, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'all 0.18s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
                    ><Trash2 size={13} /></button>
                  </div>
                )}

                {/* Icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: color.bg, border: `1px solid ${color.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  <FolderOpen size={20} color={color.icon} strokeWidth={1.8} />
                </div>

                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {project.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description || 'No description'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <Users size={13} strokeWidth={1.8} />
                  <span>{project.teamMembers.length} member{project.teamMembers.length !== 1 ? 's' : ''}</span>
                  <span style={{ marginLeft: 'auto' }}>by {project.createdBy?.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hover show actions via CSS */}
      <style>{`.card:hover .project-actions { opacity: 1 !important; }`}</style>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProject ? 'Edit Project' : 'New Project'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Title *</label>
            <input
              type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              onFocus={() => setFocusedField('title')} onBlur={() => setFocusedField(null)}
              placeholder="Project title"
              style={{ ...inputStyle, ...getFocusStyle('title') }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Description</label>
            <textarea
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              onFocus={() => setFocusedField('desc')} onBlur={() => setFocusedField(null)}
              placeholder="Brief description of the project..."
              rows={3}
              style={{ ...inputStyle, resize: 'none', ...getFocusStyle('desc') }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={() => setModalOpen(false)}
              style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.title.trim()}
              style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'var(--accent)', color: '#0a0c10', fontSize: 14, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.18s' }}
              onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
            >{saving ? 'Saving...' : editProject ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
