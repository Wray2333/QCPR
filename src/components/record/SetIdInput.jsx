import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { normalizeSetId } from '../../lib/format.js';

/**
 * 集合编号输入框（四位数字，shadcn Input）。录入时自动过滤非数字并限长 4 位。
 * @param {string} id input 的 id（用于 label 关联）
 * @param {string} value 当前值
 * @param {(v:string)=>void} onChange
 */
export default function SetIdInput({ id = 'set-id', value, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>集合编号（四位数字）</Label>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        placeholder="如 1866"
        value={value}
        onChange={(e) => onChange(normalizeSetId(e.target.value))}
        className="tabular-nums tracking-widest"
      />
    </div>
  );
}
