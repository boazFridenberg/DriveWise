import { useState, useEffect } from 'react';
import type { UserRole } from '../../types';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import GuestDashboard from './components/GuestDashboard';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

export type ViewId = 'dashboard' | 'calculator' | 'admin';

const PROTECTED_VIEWS: ViewId[] = ['calculator', 'admin'];

function AppContent() {
  const { role, isAuthenticated, authScreen, pendingPath, openLogin, clearPendingPath } = useAuth();
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (isAuthenticated && pendingPath) {
      setActiveView(pendingPath as ViewId);
      clearPendingPath();
    }
  }, [isAuthenticated, pendingPath, clearPendingPath]);

  const handleNavigate = (view: string, requiresAuth = false) => {
    const viewId = view as ViewId;
    if ((requiresAuth || PROTECTED_VIEWS.includes(viewId)) && !isAuthenticated) {
      return;
    }
    if (viewId === 'admin' && role !== 'ADMIN') return;
    if (viewId === 'calculator' && role === 'GUEST') return;
    setActiveView(viewId);
  };

  const renderView = () => {
    if (activeView === 'admin' && role === 'ADMIN') return <AdminDashboard />;
    if (activeView === 'calculator' && isAuthenticated) return <UserDashboard />;
    return (
      <GuestDashboard
        onCalculateClick={() => {
          if (!isAuthenticated) openLogin('calculator');
          else setActiveView('calculator');
        }}
      />
    );
  };

  const sidebarWidth = sidebarOpen ? 'lg:mr-64' : 'lg:mr-0';

  return (
    <div className="min-h-screen bg-obsidian bg-mesh-dark" dir="rtl">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />

      <div className="flex pt-16">
        <aside
          className={`hidden lg:flex flex-col w-64 fixed right-0 top-16 bottom-0 bg-zinc-900/50 backdrop-blur-md border-l border-zinc-800 p-6 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <SidebarContent role={role} activeView={activeView} onNavigate={handleNavigate} isAuthenticated={isAuthenticated} />
        </aside>

        <main className={`flex-1 p-6 sm:p-8 lg:p-10 transition-all duration-300 ease-in-out ${sidebarWidth} ${sidebarOpen ? 'max-w-7xl' : 'max-w-full w-full'}`}>
          {renderView()}
        </main>
      </div>

      {authScreen === 'login' && <LoginPage />}
      {authScreen === 'register' && <RegisterPage />}
    </div>
  );
}

function SidebarContent({
  role,
  activeView,
  onNavigate,
  isAuthenticated,
}: {
  role: UserRole;
  activeView: string;
  onNavigate: (view: string) => void;
  isAuthenticated: boolean;
}) {
  const { openLogin } = useAuth();

  const items: { id: ViewId; label: string; icon: string; protected?: boolean; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'קטלוג רכבים', icon: '🚗' },
    { id: 'calculator', label: 'מחשבון עלות בעלות', icon: '📊', protected: true },
    { id: 'admin', label: 'ניהול מערכת', icon: '⚙️', protected: true, adminOnly: true },
  ];

  return (
    <>
      <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-4">תפריט</p>
      <nav className="space-y-1">
        {items.map((item) => {
          if (item.adminOnly && role !== 'ADMIN') return null;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.protected && !isAuthenticated) {
                  openLogin(item.id);
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeView === item.id
                  ? 'bg-zinc-800/80 text-neon-cyan neon-border-cyan'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
