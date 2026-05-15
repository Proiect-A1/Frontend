import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onEnter?: () => void;
  onSelectSuggestion?: (s: string) => void;
  showIcon?: boolean;
}

export default function SearchInput({ value, onChange, placeholder, suggestions = [], onEnter, onSelectSuggestion, showIcon = false }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const filtered = value ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 6) : [];

  return (
    <div ref={ref} className="relative">
      {showIcon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--accent)/60">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onKeyDown={e => { if (e.key === 'Enter') { onEnter?.(); setOpen(false); } }}
        placeholder={placeholder}
        className={`w-full bg-(--surface-muted) border border-(--accent)/30 rounded-2xl py-2 text-sm text-(--text-h) outline-none focus:border-(--accent) transition-all ${showIcon ? 'pl-10 pr-4' : 'px-4'}`}
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-(--surface-dropdown) border border-(--accent)/30 rounded-xl shadow-2xl overflow-hidden">
          {filtered.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { onSelectSuggestion?.(s); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-(--text) hover:bg-(--accent)/10"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
