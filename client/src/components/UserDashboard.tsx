import { useEffect, useState, type FormEvent } from 'react';
import type { IVehicle, TcoCalculationResponse, IStructuredAddress } from '../../../types';
import { CURRENCY_SYMBOL, LOCALE } from '../i18n/hebrew';
import { fetchVehicles, calculateTco } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AddressAutocomplete from './AddressAutocomplete';

type CalcStep = 'idle' | 'distance' | 'finance' | 'complete';

const DEFAULT_HOME: IStructuredAddress = { street: 'הנביאים', houseNumber: '8', apartment: '', city: 'חיפה' };
const DEFAULT_WORK: IStructuredAddress = { street: 'הרצל', houseNumber: '45', apartment: '', city: 'תל אביב' };

export default function UserDashboard() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [home, setHome] = useState<IStructuredAddress>(DEFAULT_HOME);
  const [work, setWork] = useState<IStructuredAddress>(DEFAULT_WORK);
  const [workDays, setWorkDays] = useState(5);
  const [weeks, setWeeks] = useState(48);
  const [step, setStep] = useState<CalcStep>('idle');
  const [result, setResult] = useState<TcoCalculationResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) fetchVehicles(undefined, undefined, token).then(setVehicles);
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !vehicleId) return;
    setError('');
    setResult(null);
    setStep('distance');
    await delay(700);
    setStep('finance');
    await delay(500);
    try {
      const res = await calculateTco({ vehicleId, home, work, workDaysPerWeek: workDays, weeksPerYear: weeks }, token);
      setResult(res);
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'החישוב נכשל');
      setStep('idle');
    }
  };

  const progress = step === 'distance' ? 40 : step === 'finance' ? 75 : step === 'complete' ? 100 : 0;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold mb-2">מחשבון <span className="text-gradient-cyan">עלות בעלות</span></h2>
        <p className="text-zinc-400">חישוב מדויק לפי מסלול נסיעה, תעריף דלק מעודכן וביטוח ישראלי.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="xl:col-span-2 glass rounded-2xl p-6 space-y-6 neon-border-purple">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">בחירת רכב</label>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="input-field" required>
              <option value="">בחרו רכב...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.make} {v.model} ({v.year})</option>
              ))}
            </select>
          </div>

          <AddressAutocomplete label="כתובת מגורים" value={home} onChange={setHome} />
          <AddressAutocomplete label="כתובת עבודה" value={work} onChange={setWork} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">ימי עבודה בשבוע</label>
              <input type="number" min={1} max={7} value={workDays} onChange={(e) => setWorkDays(+e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">שבועות בשנה</label>
              <input type="number" min={1} max={52} value={weeks} onChange={(e) => setWeeks(+e.target.value)} className="input-field" />
            </div>
          </div>

          <button type="submit" disabled={step !== 'idle' && step !== 'complete'} className="btn-primary w-full disabled:opacity-50">
            חשב עלות בעלות
          </button>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </form>

        <div className="xl:col-span-3 space-y-6">
          {step !== 'idle' && (
            <div className="glass rounded-2xl p-6 neon-border-cyan">
              <div className="flex justify-between mb-3 text-sm">
                <span className="text-zinc-300">מחשב...</span>
                <span className="font-mono text-neon-cyan">{progress}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-8 text-center neon-border-emerald">
                <p className="text-sm text-zinc-400 mb-1">עלות חודשית כוללת</p>
                <p className="text-5xl font-extrabold text-gradient-cyan">
                  {CURRENCY_SYMBOL}{result.breakdown.total.monthly.toLocaleString(LOCALE)}
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  {CURRENCY_SYMBOL}{result.breakdown.total.annual.toLocaleString(LOCALE)} לשנה · {result.annualMileage.toLocaleString(LOCALE)} ק"מ
                </p>
                <p className="text-xs text-zinc-600 mt-1">דלק: ₪{result.fuelPricePerLiter}/ל' · {result.fuelTariff.source}</p>
              </div>

              <CostGrid result={result} />

              <div className="glass rounded-xl p-4 flex items-center gap-4 text-sm">
                <span className="w-2 h-2 rounded-full bg-neon-emerald animate-pulse" />
                <span className="text-zinc-400">{result.distance.origin} ← {result.distance.destination}</span>
                <span className="mr-auto font-mono text-neon-cyan">{result.distance.distanceKm} ק"מ · {result.distance.durationMinutes} דק'</span>
              </div>
            </div>
          )}

          {!result && step === 'idle' && (
            <div className="glass rounded-2xl p-12 text-center border border-dashed border-zinc-700 text-zinc-500">
              מלאו את הפרטים ולחצו על חשב עלות בעלות
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CostGrid({ result }: { result: TcoCalculationResponse }) {
  const rows: { label: string; annual: number; monthly: number }[] = [
    { label: 'דלק / חשמל', ...result.breakdown.fuel },
    { label: 'ביטוח חובה', ...result.breakdown.insuranceCompulsory },
    { label: 'ביטוח מקיף', ...result.breakdown.insuranceComprehensive },
    { label: 'פחת', ...result.breakdown.depreciation },
    { label: 'אחזקה וטיפולים', ...result.breakdown.maintenance },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden neon-border-cyan">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-zinc-500 text-xs">
            <th className="text-right px-5 py-3 font-medium">פריט</th>
            <th className="text-right px-5 py-3 font-medium">חודשי</th>
            <th className="text-right px-5 py-3 font-medium">שנתי</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-white/5 hover:bg-zinc-800/20">
              <td className="px-5 py-3 text-zinc-300">{row.label}</td>
              <td className="px-5 py-3 font-mono text-neon-cyan">{CURRENCY_SYMBOL}{row.monthly.toLocaleString(LOCALE)}</td>
              <td className="px-5 py-3 font-mono text-zinc-400">{CURRENCY_SYMBOL}{row.annual.toLocaleString(LOCALE)}</td>
            </tr>
          ))}
          <tr className="bg-zinc-800/40 font-bold">
            <td className="px-5 py-4">סה"כ</td>
            <td className="px-5 py-4 font-mono text-neon-emerald">{CURRENCY_SYMBOL}{result.breakdown.total.monthly.toLocaleString(LOCALE)}</td>
            <td className="px-5 py-4 font-mono text-neon-emerald">{CURRENCY_SYMBOL}{result.breakdown.total.annual.toLocaleString(LOCALE)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
