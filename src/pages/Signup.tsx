import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Layers, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { registerUser } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '11px 14px',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const Signup: React.FC = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<'Admin' | 'Member'>('Member');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { setUser } = useAuthStore();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { addToast('error', 'Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await registerUser(name, email, password, role);
      setUser(user);
      addToast('success', `Welcome to TaskFlow, ${user.name}!`);
      navigate('/dashboard');
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const getFocusStyle = (field: string): React.CSSProperties =>
    focusedField === field
      ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-glow)' }
      : {};

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, position: 'relative', overflow: 'hidden',
    }}>
      {/* BG decorations */}
      <div style={{
        position: 'absolute', top: -100, right: -100, width: 380, height: 380,
        background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -100, width: 380, height: 380,
        background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '48px 48px', opacity: 0.4, pointerEvents: 'none',
      }} />

      <div className="fade-in" style={{ position: 'relative', width: '100%', maxWidth: 430 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 14, background: 'var(--accent)',
            boxShadow: '0 8px 28px rgba(245,158,11,0.35)', marginBottom: 14,
          }}>
            <Layers size={24} color="#0a0c10" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontSize: 24, fontWeight: 800, color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', marginBottom: 6,
          }}>Create your account</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Start managing your team with TaskFlow
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
          borderRadius: 18, padding: '30px 28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Full Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                required placeholder="Jane Smith"
                style={{ ...inputStyle, ...getFocusStyle('name') }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                required placeholder="you@company.com"
                style={{ ...inputStyle, ...getFocusStyle('email') }}
              />
            </div>

            {/* Role */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['Member', 'Admin'] as const).map(r => (
                  <button
                    key={r} type="button" onClick={() => setRole(r)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.18s',
                      border: role === r ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      background: role === r ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                      color: role === r ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    {r === 'Member' ? <User size={14} /> : <ShieldCheck size={14} />}
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  required placeholder="Min. 6 characters"
                  style={{ ...inputStyle, paddingRight: 44, ...getFocusStyle('password') }}
                />
                <button type="button" onClick={() => setShow(!show)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4,
                  }}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 4, width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'var(--accent)', color: '#0a0c10',
                fontSize: 14, fontWeight: 700, padding: '13px 18px',
                borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                transition: 'all 0.2s', fontFamily: 'var(--font-display)',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'; }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : <><ArrowRight size={16} /> Create Account</>}
            </button>
          </form>

          <div style={{
            marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)',
            textAlign: 'center', fontSize: 13, color: 'var(--text-muted)',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
