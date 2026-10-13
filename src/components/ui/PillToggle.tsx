import type { LucideIcon } from 'lucide-react';

interface PillToggleOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface PillToggleProps<T extends string> {
  options: PillToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function PillToggle<T extends string>({
  options,
  value,
  onChange,
}: PillToggleProps<T>) {
  return (
    <div className="pill-toggle">
      {options.map(opt => {
        const Icon = opt.icon;
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`pill-toggle__btn${active ? ' pill-toggle__btn--active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {Icon && <Icon size={14} strokeWidth={active ? 2.5 : 1.8} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}