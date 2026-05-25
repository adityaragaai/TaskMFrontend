import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  UserCircle,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  to: '/dashboard' },
  { icon: FolderKanban,    label: 'Projects',   to: '/projects'  },
  { icon: ClipboardList,   label: 'Tasks',      to: '/tasks'     },
  { icon: UserCircle,      label: 'Profile',    to: '/profile'   },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: 240,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0, top: 0,
        height: '100vh',
        zIndex: 30,
      }}
    >
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(245,158,11,0.30)',
            flexShrink: 0,
          }}>
            <Layers size={18} color="#0a0c10" strokeWidth={2.5} />
          </div>
          <div>
            <p style={{
              fontSize: 15, fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>TaskFlow</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Team Manager</p>
          </div>
        </div>
      </div>

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

      {/* Footer – user info + logout */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        {user ? (
          <div style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: 'var(--bg-elevated)',
            marginBottom: 6,
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
        ) : (
          <div style={{
            padding: '10px 12px', borderRadius: 10,
            background: 'var(--bg-elevated)', marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--bg-hover)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <UserCircle size={16} color="var(--text-muted)" />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Guest</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10,
            fontSize: 14, fontWeight: 500,
            color: 'var(--text-muted)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--red-subtle)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          <LogOut size={15} strokeWidth={1.8} />
          <span>{user ? 'Sign Out' : 'Sign In'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
