import React, { useEffect, useState } from 'react';
import {
  CheckCircle2, Clock, AlertTriangle, ListTodo,
  TrendingUp, Calendar, LogIn, Sparkles,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { fetchDashboardStats, fetchOverdueTasks } from '../api/dashboard';
import type { DashboardStats, Task } from '../types';
import { useAuthStore } from '../store/authStore';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import { format } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

const BAR_COLORS  = ['#6b7280', '#f59e0b', '#22c55e'];
const PIE_COLORS  = ['#6b7280', '#f59e0b', '#22c55e'];

const statCards = (stats: DashboardStats) => [
  {
    label: 'Total Tasks',   value: stats.totalTasks,
    icon: ListTodo,
    accent: '#3b82f6', accentBg: 'rgba(59,130,246,0.10)', accentBorder: 'rgba(59,130,246,0.20)',
  },
  {
    label: 'Completed',     value: stats.completedTasks,
    icon: CheckCircle2,
    accent: '#22c55e', accentBg: 'rgba(34,197,94,0.10)',  accentBorder: 'rgba(34,197,94,0.20)',
  },
  {
    label: 'In Progress',   value: stats.pendingTasks,
    icon: Clock,
    accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.10)', accentBorder: 'rgba(245,158,11,0.20)',
  },
  {
    label: 'Overdue',       value: stats.overdueTasks,
    icon: AlertTriangle,
    accent: '#f43f5e', accentBg: 'rgba(244,63,94,0.10)',  accentBorder: 'rgba(244,63,94,0.20)',
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [overdue, setOverdue] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setStats({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0, tasksByStatus: { Todo: 0, 'In Progress': 0, Done: 0 } });
        setOverdue([]);
        setLoading(false);
        return;
      }
      try {
        const [s, o] = await Promise.all([fetchDashboardStats(), fetchOverdueTasks()]);
        setStats(s);
        setOverdue(o);
      } catch {
        addToast('error', 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <Loader />;

  const barData = stats ? [
    { name: 'Todo',        count: stats.tasksByStatus.Todo },
    { name: 'In Progress', count: stats.tasksByStatus['In Progress'] },
    { name: 'Done',        count: stats.tasksByStatus.Done },
  ] : [];
  const pieData = barData.filter(d => d.count > 0);

  /* ── Guest banner ── */
  const GuestBanner = () => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      background: 'var(--accent-subtle)',
      border: '1px solid rgba(245,158,11,0.25)',
      borderRadius: 14, padding: '16px 20px',
      marginBottom: 24,
    }}>
      <Sparkles size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>You're viewing as a guest</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Sign in to see your real task data and manage your team.</p>
      </div>
      <button
        onClick={() => navigate('/login')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8,
          background: 'var(--accent)', color: '#0a0c10',
          fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        <LogIn size={13} /> Sign In
      </button>
    </div>
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{
          fontSize: 22, fontWeight: 800,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em',
        }}>
          {greeting},{' '}
          <span style={{ color: 'var(--accent)' }}>{user ? user.name.split(' ')[0] : 'Guest'}</span> 👋
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {user ? "Here's what's happening with your tasks today." : 'Sign in to manage your team tasks.'}
        </p>
      </div>

      {!user && <GuestBanner />}

      {/* Stat Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
          {statCards(stats).map(({ label, value, icon: Icon, accent, accentBg, accentBorder }) => (
            <div key={label} style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${accentBorder}`,
              borderRadius: 14, padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'transform 0.18s, box-shadow 0.18s',
              cursor: 'default',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: accentBg, border: `1px solid ${accentBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={20} color={accent} strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>{value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {/* Bar chart */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '22px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <TrendingUp size={16} color="var(--accent)" strokeWidth={1.8} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Tasks by Status</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 12 }}
                cursor={{ fill: 'rgba(245,158,11,0.05)' }}
              />
              <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '22px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <ListTodo size={16} color="var(--accent)" strokeWidth={1.8} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Distribution</span>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={40}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 12 }} />
                <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', fontSize: 13 }}>
              No task data yet
            </div>
          )}
        </div>
      </div>

      {/* Overdue tasks */}
      {overdue.length > 0 && (
        <div style={{
          background: 'rgba(244,63,94,0.05)',
          border: '1px solid rgba(244,63,94,0.20)',
          borderRadius: 14, padding: '20px 22px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Calendar size={15} color="var(--red)" strokeWidth={1.8} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Overdue Tasks</span>
            <span style={{
              marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--red)',
              background: 'rgba(244,63,94,0.15)', padding: '2px 8px', borderRadius: 6,
            }}>{overdue.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {overdue.slice(0, 5).map(task => (
              <div key={task._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{task.projectId?.title}</p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, flexShrink: 0, marginLeft: 12 }}>
                  {format(task.dueDate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
