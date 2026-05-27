import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  to: '/dashboard' },
  { icon: FolderKanban,    label: 'Projects',   to: '/projects'  },
  { icon: ClipboardList,   label: 'Tasks',      to: '/tasks'     },
];

const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px 10px' }}>
          Navigation
        </p>
        {navItems.map(({ icon: Icon, label, to }, i) => (
          <NavLink
            key={to}
            to={to}
            style={{ animationDelay: `${i * 40}ms` }}
            className="slide-in"
          >
            {({ isActive }) => (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: 14, fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.18s',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)';
                  (e.currentTarget as HTMLDivElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  (e.currentTarget as HTMLDivElement).style.color = 'var(--text-secondary)';
                }
              }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer – user info only */}
      {user && (
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#0a0c10',
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Powered by */}
      <div style={{
        padding: '10px 16px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em', fontWeight: 500 }}>
          Powered by{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>AlgoStrive</span>
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
