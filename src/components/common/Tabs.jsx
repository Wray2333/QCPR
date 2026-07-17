/**
 * 受控 Tabs（分段控件形态，移动端友好的大触控目标）。
 * @param {Array<{key:string,label:string,icon?:import('react').ComponentType}>} items
 * @param {string} value 当前选中 key
 * @param {(key:string)=>void} onChange
 */
export default function Tabs({ items, value, onChange, className = '' }) {
  return (
    <div
      className={`flex gap-1 rounded-xl bg-surface-2 p-1 ${className}`}
      role="tablist"
    >
      {items.map((it) => {
        const active = it.key === value;
        const Icon = it.icon;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.key)}
            className={`flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            {Icon && <Icon size={16} strokeWidth={2} aria-hidden />}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
