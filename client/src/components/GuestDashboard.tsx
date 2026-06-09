import { useEffect, useState, useCallback } from 'react';
import type { IVehicle, FuelType } from '../../../types';
import { FUEL_TYPE_LABELS_HE, CURRENCY_SYMBOL, LOCALE, FUEL_FILTER_LABELS } from '../i18n/hebrew';
import { fetchVehicles, fetchFuelTariff } from '../api/client';
import { useAuth } from '../context/AuthContext';

const FUEL_FILTERS: (FuelType | 'All')[] = ['All', 'Gasoline', 'Diesel', 'Electric', 'Hybrid'];

interface GuestDashboardProps {
  onCalculateClick?: () => void;
}

export default function GuestDashboard({ onCalculateClick }: GuestDashboardProps) {
  const { openLogin, isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [fuelPrice, setFuelPrice] = useState<number | null>(null);
  const [searchMake, setSearchMake] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [fuelFilter, setFuelFilter] = useState<FuelType | 'All'>('All');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchVehicles(searchMake || undefined, searchModel || undefined),
      fetchFuelTariff().catch(() => null),
    ])
      .then(([v, tariff]) => {
        setVehicles(v);
        if (tariff) setFuelPrice(tariff.pricePerLiter);
      })
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [searchMake, searchModel]);

  const filtered = fuelFilter === 'All' ? vehicles : vehicles.filter((v) => v.fuelType === fuelFilter);

  const handleCalculate = () => {
    if (!isAuthenticated) {
      openLogin('calculator');
      return;
    }
    onCalculateClick?.();
  };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl glass neon-border-cyan p-8 sm:p-12">
        <div className="absolute inset-0 bg-mesh-dark pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            עלות בעלות אמיתית, <span className="text-gradient-cyan">בשקיפות מלאה</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            השוו רכבים, חשבו עלויות נסיעה, ביטוח ופחת — הכל במקום אחד, מותאם לשוק הישראלי.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <StatPill label="רכבים בקטלוג" value={`${vehicles.length}`} color="cyan" />
            {fuelPrice !== null && (
              <StatPill label="מחיר דלק מוסדר" value={`₪${fuelPrice}/ל'`} color="purple" />
            )}
          </div>
          <button onClick={handleCalculate} className="btn-primary">
            חשבו את עלות הבעלות שלכם
          </button>
        </div>
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">חיפוש וסינון</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input type="text" placeholder="יצרן..." value={searchMake} onChange={(e) => setSearchMake(e.target.value)} className="input-field" />
          <input type="text" placeholder="דגם..." value={searchModel} onChange={(e) => setSearchModel(e.target.value)} className="input-field" />
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            {FUEL_FILTERS.map((fuel) => (
              <button
                key={fuel}
                onClick={() => setFuelFilter(fuel)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  fuelFilter === fuel ? 'bg-neon-cyan/20 text-neon-cyan neon-border-cyan' : 'bg-zinc-800/50 text-zinc-400'
                }`}
              >
                {FUEL_FILTER_LABELS[fuel]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">קטלוג <span className="text-gradient-purple">רכבים</span></h3>
          {loading && <Spinner />}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((vehicle, i) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} index={i} />
          ))}
        </div>
        {!loading && filtered.length === 0 && (
          <p className="text-center py-16 text-zinc-500">לא נמצאו רכבים התואמים לחיפוש.</p>
        )}
      </section>
    </div>
  );
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />;
}

function StatPill({ label, value, color }: { label: string; value: string; color: 'cyan' | 'purple' }) {
  const border = color === 'cyan' ? 'neon-border-cyan' : 'neon-border-purple';
  return (
    <div className={`glass rounded-xl px-5 py-3 ${border}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

function VehicleCard({ vehicle, index }: { vehicle: IVehicle; index: number }) {
  const [imgError, setImgError] = useState(false);
  const handleImgError = useCallback(() => setImgError(true), []);

  const fuelColors: Record<FuelType, string> = {
    Electric: 'text-neon-emerald bg-neon-emerald/10 border-neon-emerald/30',
    Hybrid: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30',
    Gasoline: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    Diesel: 'text-zinc-300 bg-zinc-700/30 border-zinc-600/30',
  };

  return (
    <article className="group glass rounded-2xl overflow-hidden hover:neon-border-cyan transition-all duration-300" style={{ animationDelay: `${index * 0.3}s` }}>
      <div className="relative h-44 overflow-hidden bg-zinc-900">
        {!imgError ? (
          <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} loading="lazy" referrerPolicy="no-referrer" onError={handleImgError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600 text-4xl">🚗</div>
        )}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${fuelColors[vehicle.fuelType]}`}>
          {FUEL_TYPE_LABELS_HE[vehicle.fuelType]}
        </span>
      </div>
      <div className="p-5 space-y-3">
        <h4 className="font-bold text-lg">{vehicle.make} {vehicle.model}</h4>
        <p className="text-xs text-zinc-500">{vehicle.year} · {vehicle.horsepower} כ"ס · דירוג בטיחות {vehicle.specs.safetyRating}★</p>
        <div className="text-[11px] text-zinc-500 space-y-0.5">
          <p>{vehicle.specs.engineLayout} · {vehicle.specs.transmission}</p>
          {vehicle.specs.batteryCapacityKwh && <p>סוללה: {vehicle.specs.batteryCapacityKwh} קוט"ש</p>}
        </div>
        <p className="text-xl font-bold text-gradient-cyan">
          {CURRENCY_SYMBOL}{vehicle.basePrice.toLocaleString(LOCALE)}
        </p>
      </div>
    </article>
  );
}
