import { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import WrongCountPicker from './WrongCountPicker.jsx';
import DurationPicker from './DurationPicker.jsx';
import { getModule } from '../../lib/modules.js';
import {
  formatDuration,
  accuracy,
  formatPercent,
  accuracyColorClass,
} from '../../lib/format.js';

/** 单个模块的结果卡片：用时（可修正）+ 正确率 + 错题数 */
function ResultCard({ index, result, onChange }) {
  const m = getModule(result.moduleId);
  const [editing, setEditing] = useState(false);
  const rate = accuracy({ totalCount: m.count, wrongCount: result.wrongCount });
  const over = result.durationSec > m.limitSec;

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{m.name}</div>
          <div className="mt-1 flex h-9 items-center gap-1.5 text-xs text-muted-foreground">
            {editing ? (
              <>
                <DurationPicker
                  valueSec={result.durationSec}
                  onChange={(s) => onChange({ durationSec: s })}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditing(false)}
                  aria-label="完成修改用时"
                >
                  <Check aria-hidden />
                </Button>
              </>
            ) : (
              <>
                用时
                <span
                  className={`text-sm font-medium tabular-nums ${
                    over ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  {formatDuration(result.durationSec)}
                </span>
                {over && <span className="text-destructive">超时</span>}
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-muted hover:text-foreground"
                  title="修改用时"
                  aria-label={`修改${m.name}用时`}
                >
                  <Pencil size={13} strokeWidth={2} aria-hidden />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={`text-xl font-semibold tabular-nums ${accuracyColorClass(rate)}`}>
            {formatPercent(rate)}
          </div>
          <div className="text-xs text-muted-foreground">正确率</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`result-wrong-${index}`}>错题数（共 {m.count} 题）</Label>
        <WrongCountPicker
          id={`result-wrong-${index}`}
          value={result.wrongCount}
          onChange={(n) => onChange({ wrongCount: n })}
          max={m.count}
        />
      </div>
    </Card>
  );
}

/**
 * 计时结束后逐个模块填写错题数，一次保存全部。
 * @param {Array<{moduleId:string,durationSec:number,wrongCount:number}>} results
 * @param {(index:number, patch:object)=>void} onChange
 * @param {boolean} [saving] 保存中（禁用按钮防重复提交）
 * @param {()=>void} onSubmit
 */
export default function ResultForm({ results, onChange, saving = false, onSubmit }) {
  return (
    <div className="space-y-3">
      {results.map((r, i) => (
        <ResultCard
          key={r.moduleId}
          index={i}
          result={r}
          onChange={(patch) => onChange(i, patch)}
        />
      ))}
      <Button size="lg" className="w-full" disabled={saving} onClick={onSubmit}>
        {saving
          ? '保存中…'
          : results.length > 1
            ? `保存全部成绩（${results.length} 条）`
            : '保存成绩'}
      </Button>
    </div>
  );
}
