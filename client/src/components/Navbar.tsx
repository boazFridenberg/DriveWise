import type { UserRole } from '../../../types';
import { ROLE_LABELS_HE } from '../i18n/hebrew';
import { useAuth } from '../context/AuthContext';
import type { ViewId } from '../App';

const ROLE_COLORS: Record<UserRole, string> = {
  GUEST: 'bg-zinc-600/30 text-zinc-400 border-zinc-600/50',
  USER: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 shadow-neon-cyan',
  ADMIN: 'bg-neon-purple/10 text-neon-purple border-neon-purple/30 shadow-neon-purple',
};

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Navbar({ activeView, onNavigate, sidebarOpen, onToggleSidebar }: NavbarProps) {
  const { role, user, isAuthenticated, openLogin, openRegister, logout } = useAuth();

  const nav = (view: ViewId, label: string, protectedRoute = false) => (
    <button
      key={view}
      onClick={() => {
        if (protectedRoute && !isAuthenticated) openLogin(view);
        else onNavigate(view);
      }}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        activeView === view
          ? 'bg-zinc-800/80 text-neon-cyan neon-border-cyan'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
      <div className="max-w-[100vw] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-400 hover:text-neon-cyan border border-zinc-700/50 transition-all"
              aria-label={sidebarOpen ? 'סגור תפריט' : 'פתח תפריט'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                )}
              </svg>
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-neon-cyan">
              <svg className="w-5 h-5 text-obsidian" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Drive<span className="text-gradient-cyan">Wise</span>
              </h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {nav('dashboard', 'קטלוג')}
            {nav('calculator', 'מחשבון עלות בעלות', true)}
            {role === 'ADMIN' && nav('admin', 'ניהול')}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && (
              <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS_HE[role]}
              </span>
            )}

            {!isAuthenticated ? (
              <div className="flex gap-2">
                <button onClick={() => openLogin()} className="btn-ghost text-xs sm:text-sm">
                  התחברות
                </button>
                <button
                  onClick={() => openRegister()}
                  className="btn-primary text-xs sm:text-sm !px-4 !py-2"
                >
                  הרשמה
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="hidden lg:block text-sm text-zinc-400">
                  {user?.firstName} {user?.lastName}
                </span>
                <button onClick={logout} className="btn-ghost text-xs">
                  יציאה
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-white/5 px-4 py-2 flex gap-2 overflow-x-auto">
        {nav('dashboard', 'קטלוג')}
        {nav('calculator', 'מחשבון', true)}
        {role === 'ADMIN' && nav('admin', 'ניהול')}
      </div>
    </header>
  );
}
