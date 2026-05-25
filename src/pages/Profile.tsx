import React from 'react';
import { User, Mail, Shield, Layers, Crown, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Profile: React.FC = () => {
  const { user } = useAuthStore();

  const infoRows = [
    { icon: User,   label: 'Full Name',     value: user?.name,  color: 'var(--accent)',  bg: 'var(--accent-subtle)',  border: 'rgba(245,158,11,0.20)' },
    { icon: Mail,   label: 'Email Address', value: user?.email, color: 'var(--blue)',    bg: 'var(--blue-subtle)',    border: 'rgba(59,130,246,0.20)'  },
    { icon: Shield, label: 'Account Role',  value: user?.role,  color: 'var(--green)',   bg: 'var(--green-subtle)',   border: 'rgba(34,197,94,0.20)'   },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 620, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Profile card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 18, overflow: 'hidden',
      }}>
        {/* Cover */}
        <div style={{
          height: 120,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(251,146,60,0.08) 50%, rgba(59,130,246,0.08) 100%)',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}>
          {/* Decorative grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '32px 32px', opacity: 0.5,
          }} />
          {/* Avatar */}
          <div style={{
            position: 'absolute', bottom: -28, left: 28,
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
            border: '3px solid var(--bg-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: '#0a0c10',
            fontFamily: 'var(--font-display)',
            boxShadow: '0 8px 24px rgba(245,158,11,0.30)',
          }}>
            {user?.name.charAt(0).toUpperCase() ?? '?'}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '44px 28px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                {user?.name}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={13} color="var(--accent)" />
                TaskFlow {user?.role ?? 'Guest'}
              </p>
            </div>
            {user?.role === 'Admin' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 8,
                background: 'var(--accent-subtle)',
                border: '1px solid rgba(245,158,11,0.25)',
                fontSize: 11, fontWeight: 700, color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                <Crown size={11} /> Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={14} color="var(--text-muted)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Account Details</span>
        </div>
        <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {infoRows.map(({ icon: Icon, label, value, color, bg, border }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 12,
              background: bg, border: `1px solid ${border}`,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={17} color={color} strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{value ?? '—'}</p>
              </div>
              {label === 'Account Role' && user?.role === 'Admin' && (
                <span style={{
                  marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                  color: 'var(--green)', background: 'var(--green-subtle)',
                  padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>Full Access</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
