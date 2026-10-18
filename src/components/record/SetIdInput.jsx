import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { normalizeSetId, stepSetId } from '../../lib/format.js';

/**
 * 集合编号输入框（四位数字，shadcn Input）。录入时自动过滤非数字并限长 4 位；
 * 两侧加减按钮一键切到上一套 / 下一套（如 1866 → 1867）。
 * @param {string} id input 的 id（用于 label 关联）
 * @param {string} value 当前值
 * @param {(v:string)=>void} onChange
 */
export default function SetIdInput({ id = 'set-id', value, onChange }) {
  const n = Number(normalizeSetId(value) || 0);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>集合编号（四位数字）</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="shrink-0"
          disabled={!value || n <= 0}
          onClick={() => onChange(stepSetId(value, -1))}
          aria-label="上一个集合编号"
          title="上一个"
        >
          <Minus aria-hidden />
        </Button>
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          placeholder="如 1866"
          value={value}
          onChange={(e) => onChange(normalizeSetId(e.target.value))}
          className="h-11 text-center tabular-nums tracking-widest"
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="shrink-0"
          disabled={n >= 9999}
          onClick={() => onChange(stepSetId(value, 1))}
          aria-label="下一个集合编号"
          title="下一个"
        >
          <Plus aria-hidden />
        </Button>
      </div>
    </div>
  );
}
