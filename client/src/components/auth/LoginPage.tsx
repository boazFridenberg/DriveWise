import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, openRegister, closeAuth } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ההתחברות נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-xl">
      <div className="absolute inset-0 bg-mesh-dark pointer-events-none" />
      <div className="relative w-full max-w-md glass-strong rounded-3xl p-8 neon-border-cyan shadow-neon-cyan">
        <button
          onClick={closeAuth}
          className="absolute top-4 left-4 text-zinc-500 hover:text-zinc-200 text-sm"
          aria-label="סגור"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            ברוכים השבים ל-<span className="text-gradient-cyan">DriveWise</span>
          </h2>
          <p className="text-zinc-400 text-sm">התחברו לחשבון שלכם</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">אימייל או טלפון</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="input-field"
              placeholder="name@email.com או 050-0000000"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'מתחבר...' : 'התחברות'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          אין לכם חשבון?{' '}
          <button onClick={() => openRegister()} className="text-neon-cyan hover:underline">
            הרשמה
          </button>
        </p>
      </div>
    </div>
  );
}
