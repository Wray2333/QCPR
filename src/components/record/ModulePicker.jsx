import { MODULES } from '../../lib/modules.js';
import { formatDuration } from '../../lib/format.js';

/**
 * 模块选择器（卡片网格，44pt+ 触控目标）。
 * @param {string} value 当前选中 moduleId
 * @param {(id:string)=>void} onChange
 */
export default function ModulePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="选择练习模块">
      {MODULES.map((m) => {
        const active = m.id === value;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m.id)}
            className={`flex min-h-[64px] cursor-pointer flex-col items-start justify-center rounded-xl border p-3 text-left transition-all duration-200 active:scale-[0.97] ${
              active
                ? 'border-brand bg-brand/10 ring-1 ring-brand'
                : 'border-line bg-surface hover:border-ink-3'
            }`}
          >
            <span className={`text-sm font-semibold ${active ? 'text-brand' : 'text-ink'}`}>
              {m.name}
            </span>
            <span className="mt-0.5 text-xs tabular-nums text-ink-3">
              {m.count} 题 · {formatDuration(m.limitSec)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
