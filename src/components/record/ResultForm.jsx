import { useState } from 'react';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import {
  formatDuration,
  accuracy,
  formatPercent,
  accuracyColorClass,
} from '../../lib/format.js';

const inputClass =
  'w-full min-h-[44px] rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

/**
 * 计时结束后填写本次结果（错题数）。
 * @param {object} module 模块定义
 * @param {number} durationSec 用时
 * @param {boolean} [saving] 保存中（禁用按钮防重复提交）
 * @param {(wrongCount:number)=>void} onSubmit
 * @param {()=>void} onCancel
 */
export default function ResultForm({
  module,
  durationSec,
  saving = false,
  onSubmit,
  onCancel,
}) {
  const [wrongCount, setWrongCount] = useState(0);
  const rate = accuracy({
    totalCount: module.count,
    wrongCount: Number(wrongCount) || 0,
  });

  const clampAndSet = (v) => {
    const n = Math.max(0, Math.min(module.count, Math.floor(Number(v) || 0)));
    setWrongCount(n);
  };

  return (
    <Card className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-surface-2 px-4 py-3">
          <div className="text-xs text-ink-3">本次用时</div>
          <div className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
            {formatDuration(durationSec)}
          </div>
        </div>
        <div className="rounded-xl bg-surface-2 px-4 py-3">
          <div className="text-xs text-ink-3">正确率</div>
          <div
            className={`mt-0.5 text-lg font-semibold tabular-nums ${accuracyColorClass(rate)}`}
          >
            {formatPercent(rate)}
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="result-wrong-count"
          className="mb-1.5 block text-sm font-medium text-ink-2"
        >
          错题数（共 {module.count} 题）
        </label>
        <input
          id="result-wrong-count"
          type="number"
          inputMode="numeric"
          min={0}
          max={module.count}
          value={wrongCount}
          onChange={(e) => clampAndSet(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          disabled={saving}
          onClick={onCancel}
        >
          取消
        </Button>
        <Button
          size="lg"
          className="flex-1"
          disabled={saving}
          onClick={() => onSubmit(Number(wrongCount) || 0)}
        >
          {saving ? '保存中…' : '保存成绩'}
        </Button>
      </div>
    </Card>
  );
}
