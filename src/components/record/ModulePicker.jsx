import { Layers } from 'lucide-react';
import { MODULES, MODULE_GROUPS, getModule } from '../../lib/modules.js';
import { formatDuration } from '../../lib/format.js';
import { cn } from '@/lib/utils';

const sameIds = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * 模块多选器：按点选顺序依次计时（卡片角标显示顺序），上方提供常用组合一键选。
 * @param {string[]} value 已选 moduleId（有序）
 * @param {(ids:string[])=>void} onChange
 */
export default function ModulePicker({ value, onChange }) {
  const toggle = (id) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" aria-label="常用组合">
        {MODULE_GROUPS.map((ids) => {
          const active = sameIds(ids, value);
          return (
            <button
              key={ids.join()}
              type="button"
              onClick={() => onChange(ids)}
              aria-pressed={active}
              className={cn(
                'flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-muted-foreground'
              )}
            >
              <Layers size={14} strokeWidth={2} aria-hidden />
              {ids.map((id) => getModule(id).name).join(' + ')}
            </button>
          );
        })}
      </div>

      <div
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
        role="group"
        aria-label="选择练习模块（可多选）"
      >
        {MODULES.map((m) => {
          const order = value.indexOf(m.id);
          const active = order >= 0;
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(m.id)}
              className={`relative flex min-h-[64px] cursor-pointer flex-col items-start justify-center rounded-xl border p-3 text-left transition-all duration-200 active:scale-[0.97] ${
                active
                  ? 'border-primary bg-primary/10 ring-1 ring-ring'
                  : 'border-border bg-card hover:border-muted-foreground'
              }`}
            >
              <span className={`text-sm font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>
                {m.name}
              </span>
              <span className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                {m.count} 题 · {formatDuration(m.limitSec)}
              </span>
              {active && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold tabular-nums text-primary-foreground">
                  <span className="sr-only">第</span>
                  {order + 1}
                  <span className="sr-only">项</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
