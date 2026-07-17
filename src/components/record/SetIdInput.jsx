import { normalizeSetId } from '../../lib/format.js';

const inputClass =
  'w-full min-h-[44px] rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand tabular-nums tracking-widest';

/**
 * 集合编号输入框（四位数字）。录入时自动过滤非数字并限长 4 位。
 * @param {string} id input 的 id（用于 label 关联）
 * @param {string} value 当前值
 * @param {(v:string)=>void} onChange
 */
export default function SetIdInput({ id = 'set-id', value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-2">
        集合编号（四位数字）
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        placeholder="如 1866"
        value={value}
        onChange={(e) => onChange(normalizeSetId(e.target.value))}
        className={inputClass}
      />
    </div>
  );
}
