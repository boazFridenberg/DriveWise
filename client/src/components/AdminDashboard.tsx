import { useEffect, useState } from 'react';
import type { IUser, AssignableRole, CreateUserRequest, UpdateUserRequest } from '../../../types';
import { ROLE_LABELS_HE } from '../i18n/hebrew';
import { fetchAdminUsers, createAdminUser, updateAdminUser, banUser } from '../api/client';
import { useAuth } from '../context/AuthContext';

type ModalMode = 'add' | 'edit' | null;

const EMPTY_FORM: CreateUserRequest = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'USER',
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateUserRequest>(EMPTY_FORM);
  const [msg, setMsg] = useState('');

  const load = () => {
    if (!token) return;
    setLoading(true);
    fetchAdminUsers(token).then(setUsers).catch(() => setUsers([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal('add');
  };

  const openEdit = (user: IUser) => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
    });
    setEditId(user.id);
    setModal('edit');
  };

  const handleSave = async () => {
    if (!token) return;
    try {
      if (modal === 'add') {
        await createAdminUser(form, token);
        setMsg('המשתמש נוסף בהצלחה');
      } else if (modal === 'edit' && editId) {
        const updates: UpdateUserRequest = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          role: form.role,
        };
        if (form.password) updates.password = form.password;
        await updateAdminUser(editId, updates, token);
        setMsg('הפרטים עודכנו');
      }
      setModal(null);
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'שגיאה');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleBan = async (userId: string) => {
    if (!token) return;
    try {
      await banUser(userId, token);
      setMsg('המשתמש נחסם');
      load();
    } catch {
      setMsg('הפעולה נכשלה');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">ניהול <span className="text-gradient-purple">משתמשים</span></h2>
          <p className="text-zinc-400 text-sm mt-1">הוספה, עריכה וניהול הרשאות</p>
        </div>
        <div className="flex gap-3">
          {msg && <span className="px-4 py-2 rounded-xl bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald text-sm">{msg}</span>}
          <button onClick={openAdd} className="btn-primary !bg-gradient-to-r from-neon-purple to-purple-400 shadow-neon-purple">
            + הוספת משתמש
          </button>
        </div>
      </header>

      <section className="glass rounded-2xl overflow-hidden neon-border-cyan">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-semibold text-zinc-300">משתמשים רשומים</h3>
          {loading && <div className="w-4 h-4 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 text-xs">
                <th className="text-right px-5 py-3">שם משתמש</th>
                <th className="text-right px-5 py-3">אימייל</th>
                <th className="text-right px-5 py-3">טלפון</th>
                <th className="text-right px-5 py-3">הרשאה</th>
                <th className="text-right px-5 py-3">סטטוס</th>
                <th className="text-left px-5 py-3">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-zinc-800/30">
                  <td className="px-5 py-4 font-medium">{user.firstName} {user.lastName}</td>
                  <td className="px-5 py-4 text-zinc-400 font-mono text-xs">{user.email}</td>
                  <td className="px-5 py-4 text-zinc-400">{user.phone}</td>
                  <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                  <td className="px-5 py-4"><StatusBadge banned={user.isBanned ?? false} /></td>
                  <td className="px-5 py-4 text-left space-x-2 space-x-reverse">
                    <button onClick={() => openEdit(user)} className="px-3 py-1.5 rounded-lg text-xs text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 hover:bg-neon-cyan/20">
                      עריכה
                    </button>
                    {!user.isBanned && user.role !== 'ADMIN' && (
                      <button onClick={() => handleBan(user.id)} className="px-3 py-1.5 rounded-lg text-xs text-red-400 bg-red-400/10 border border-red-400/20">
                        חסימת משתמש
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md">
          <div className="glass-strong rounded-2xl p-6 w-full max-w-lg neon-border-purple space-y-4">
            <h3 className="text-lg font-bold">{modal === 'add' ? 'הוספת משתמש חדש' : 'עריכת משתמש'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="שם פרטי" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" />
              <input placeholder="שם משפחה" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" />
            </div>
            <input type="email" placeholder="אימייל" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            <input type="tel" placeholder="טלפון" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            <input type="password" placeholder={modal === 'edit' ? 'סיסמה חדשה (אופציונלי)' : 'סיסמה'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AssignableRole })} className="input-field">
              <option value="USER">משתמש</option>
              <option value="ADMIN">מנהל</option>
            </select>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="btn-primary flex-1">שמירה</button>
              <button onClick={() => setModal(null)} className="btn-ghost flex-1">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: IUser['role'] }) {
  const styles: Record<IUser['role'], string> = {
    GUEST: 'bg-zinc-700/30 text-zinc-400',
    USER: 'bg-neon-cyan/10 text-neon-cyan',
    ADMIN: 'bg-neon-purple/10 text-neon-purple',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[role]}`}>{ROLE_LABELS_HE[role]}</span>;
}

function StatusBadge({ banned }: { banned: boolean }) {
  return banned ? (
    <span className="text-red-400 text-xs">חסום</span>
  ) : (
    <span className="text-neon-emerald text-xs">פעיל</span>
  );
}
