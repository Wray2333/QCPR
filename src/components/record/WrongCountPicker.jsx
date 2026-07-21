import { NativeSelect } from '@/components/ui/native-select';
import { cn } from '@/lib/utils';

const QUICK = [0, 1, 2, 3]; // 常用错题数，一键快选

/**
 * 错题数选择：快捷按钮（0–5，覆盖绝大多数情况）+ 原生 select 兜底选更大值
 * （原生 select 在 iOS 上是系统滚轮）。
 * @param {number} value 当前错题数
 * @param {(n:number)=>void} onChange
 * @param {number} max 题量上限
 * @param {string} [id] select 的 id（label 关联）
 */
export default function WrongCountPicker({ value, onChange, max, id }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1.5">
        {QUICK.filter((n) => n <= max).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={cn(
              'h-11 w-10 cursor-pointer rounded-md border text-sm font-medium tabular-nums transition-colors',
              value === n
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-foreground hover:bg-accent'
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {/* 更大值用原生 select（iOS 系统滚轮）兜底 */}
      <NativeSelect
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="错题数"
        className="w-24 tabular-nums"
      >
        {Array.from({ length: max + 1 }, (_, i) => i).map((n) => (
          <option key={n} value={n}>
            {n} 题
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
