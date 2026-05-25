import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface NavbarProps {
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header style={{
      height: 60,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Left – title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>TaskFlow</span>
          <span style={{ color: 'var(--border-strong)', fontSize: 12 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        </div>
      </div>

      {/* Right – actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 12px',
          width: 200,
        }}>
          <Search size={13} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search..."
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: 13, color: 'var(--text-primary)', width: '100%',
            }}
          />
        </div>

        {/* Notification bell */}
        <button
          style={{
            width: 34, height: 34,
            borderRadius: 8,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            color: 'var(--text-muted)',
            transition: 'all 0.18s',
          }}
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
              position: 'absolute', top: 6, right: 6,
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--accent)',
              border: '1.5px solid var(--bg-surface)',
            }} />
          )}
        </button>

        {/* User avatar / Login button */}
        {user ? (
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#0a0c10',
            cursor: 'default',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
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
