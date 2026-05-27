import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogIn, Sun, Moon, Layers } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

interface NavbarProps {
  title: string;
}

const iconBtn: React.CSSProperties = {
  width: 36, height: 36,
  borderRadius: 10,
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  transition: 'all 0.18s',
  flexShrink: 0,
};

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  return (
    <header style={{
      height: 64,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      backdropFilter: 'blur(12px)',
    }}>

      {/* ── Left: brand + page title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {/* Logo */}
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(245,158,11,0.30)',
          flexShrink: 0,
        }}>
          <Layers size={17} color="#0a0c10" strokeWidth={2.5} />
        </div>
        {/* Name + subtitle */}
        <div style={{ lineHeight: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            TaskFlow
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>
            Team Manager
          </p>
        </div>
        {/* Separator */}
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
        {/* Current page */}
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
      </div>

      {/* ── Center: search (fills available space) ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '7px 14px',
          width: '100%',
          maxWidth: 400,
          transition: 'border-color 0.18s, box-shadow 0.18s',
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px var(--accent-subtle)';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
        >
          <Search size={14} color="var(--text-muted)" strokeWidth={1.8} />
          <input
            type="text"
            placeholder="Search..."
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: 13, color: 'var(--text-primary)', width: '100%',
            }}
          />
        </div>
      </div>

      {/* ── Right: actions + user info ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={iconBtn}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          {theme === 'dark' ? <Sun size={15} strokeWidth={1.8} /> : <Moon size={15} strokeWidth={1.8} />}
        </button>

        {/* Notification bell */}
        <button
          style={{ ...iconBtn, position: 'relative' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          <Bell size={15} strokeWidth={1.8} />
          {user && (
            <span style={{
              position: 'absolute', top: 7, right: 7,
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--accent)',
              border: '1.5px solid var(--bg-surface)',
            }} />
          )}
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />

        {/* User info */}
        {user ? (
          <div
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '5px 10px 5px 5px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)';
              (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)';
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#0a0c10',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(245,158,11,0.30)',
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            {/* Name + role */}
            <div style={{ lineHeight: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {user.name}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                {user.role}
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 10,
              background: 'var(--accent)', color: '#0a0c10',
              fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              transition: 'all 0.18s',
              boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            <LogIn size={13} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
