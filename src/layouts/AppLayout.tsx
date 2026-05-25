import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/profile': 'Profile',
};

const AppLayout: React.FC = () => {
  const { pathname } = useLocation();
  const title = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ?? 'TaskFlow';

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 240, overflow: 'hidden' }}>
        <Navbar title={title} />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 32px',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
