import { useState, useEffect, useRef } from 'react';
import type { IStructuredAddress, IAddressSuggestion } from '../../../types';
import { searchAddresses } from '../api/client';

interface AddressAutocompleteProps {
  label: string;
  value: IStructuredAddress;
  onChange: (addr: IStructuredAddress) => void;
}

const EMPTY: IStructuredAddress = { street: '', houseNumber: '', apartment: '', city: '' };

export default function AddressAutocomplete({ label, value, onChange }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<IAddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      searchAddresses(query, value.city || undefined)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(t);
  }, [query, value.city]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (s: IAddressSuggestion) => {
    onChange({
      street: s.street,
      houseNumber: s.houseNumber,
      apartment: s.apartment ?? '',
      city: s.city,
    });
    setQuery(s.label);
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>

      <div ref={ref} className="relative">
        <input
          type="text"
          value={query || `${value.street} ${value.houseNumber}, ${value.city}`.replace(/^ , |, $/g, '')}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            onChange({ ...value, street: e.target.value });
          }}
          onFocus={() => setOpen(true)}
          className="input-field"
          placeholder="התחילו להקליד כתובת..."
          autoComplete="off"
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 glass-strong rounded-xl border border-zinc-700 overflow-hidden shadow-glass max-h-48 overflow-y-auto">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => select(s)}
                  className="w-full text-right px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800/80 hover:text-neon-cyan transition-colors"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[10px] text-zinc-600 mb-1">רחוב</label>
          <input value={value.street} onChange={(e) => onChange({ ...value, street: e.target.value })} className="input-field !py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-600 mb-1">מספר בית</label>
          <input value={value.houseNumber} onChange={(e) => onChange({ ...value, houseNumber: e.target.value })} className="input-field !py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-600 mb-1">דירה</label>
          <input value={value.apartment ?? ''} onChange={(e) => onChange({ ...value, apartment: e.target.value })} className="input-field !py-2 text-sm" />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-600 mb-1">עיר</label>
          <input value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })} className="input-field !py-2 text-sm" required />
        </div>
      </div>
    </div>
  );
}

export { EMPTY as EMPTY_ADDRESS };
