import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import WrongCountPicker from './WrongCountPicker.jsx';
import {
  formatDuration,
  accuracy,
  formatPercent,
  accuracyColorClass,
} from '../../lib/format.js';

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
  const rate = accuracy({ totalCount: module.count, wrongCount });

  return (
    <Card className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted px-4 py-3">
          <div className="text-xs text-muted-foreground">本次用时</div>
          <div className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
            {formatDuration(durationSec)}
          </div>
        </div>
        <div className="rounded-xl bg-muted px-4 py-3">
          <div className="text-xs text-muted-foreground">正确率</div>
          <div
            className={`mt-0.5 text-lg font-semibold tabular-nums ${accuracyColorClass(rate)}`}
          >
            {formatPercent(rate)}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="result-wrong">错题数（共 {module.count} 题）</Label>
        <WrongCountPicker
          id="result-wrong"
          value={wrongCount}
          onChange={setWrongCount}
          max={module.count}
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
          onClick={() => onSubmit(wrongCount)}
        >
          {saving ? '保存中…' : '保存成绩'}
        </Button>
      </div>
    </Card>
  );
}

