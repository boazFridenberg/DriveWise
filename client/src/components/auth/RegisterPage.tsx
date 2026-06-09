import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register, openLogin, closeAuth } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ firstName, lastName, email, phone, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ההרשמה נכשלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-xl">
      <div className="absolute inset-0 bg-mesh-dark pointer-events-none" />
      <div className="relative w-full max-w-md glass-strong rounded-3xl p-8 neon-border-purple shadow-neon-purple max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeAuth}
          className="absolute top-4 left-4 text-zinc-500 hover:text-zinc-200 text-sm"
          aria-label="סגור"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            הצטרפו ל-<span className="text-gradient-purple">DriveWise</span>
          </h2>
          <p className="text-zinc-400 text-sm">צרו חשבון וחשבו את עלות הבעלות האמיתית</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">שם פרטי</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">שם משפחה</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">אימייל</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">טלפון</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="050-0000000" required />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">סיסמה</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" minLength={6} required />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'נרשם...' : 'יצירת חשבון'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-5">
          כבר רשומים?{' '}
          <button onClick={() => openLogin()} className="text-neon-purple hover:underline">
            התחברות
          </button>
        </p>
      </div>
    </div>
  );
}
