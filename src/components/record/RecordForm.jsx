import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import SetIdInput from './SetIdInput.jsx';
import DurationPicker from './DurationPicker.jsx';
import WrongCountPicker from './WrongCountPicker.jsx';
import { MODULES, getModule } from '../../lib/modules.js';
import {
  toDateInputValue,
  toTimeInputValue,
  isValidSetId,
} from '../../lib/format.js';

/**
 * 成绩表单（手动补录 / 编辑历史记录共用）。
 * @param {object} [initial] 初始记录；缺省为新建
 * @param {string} submitLabel 提交按钮文案
 * @param {(fields:object)=>Promise<void>} onSubmit 校验通过后调用，抛错则留在表单
 */
export default function RecordForm({ initial, submitLabel, onSubmit }) {
  const [setId, setSetId] = useState(initial?.setId ?? '');
  const [moduleId, setModuleId] = useState(initial?.moduleId ?? MODULES[0].id);
  const [date, setDate] = useState(toDateInputValue(initial?.date));
  const [time, setTime] = useState(toTimeInputValue(initial?.date));
  const [durationSec, setDurationSec] = useState(initial?.durationSec ?? 0);
  const [wrongCount, setWrongCount] = useState(initial?.wrongCount ?? 0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const module = getModule(moduleId);

  // 切换模块时把错题数收敛到新模块题量上限内
  const handleModuleChange = (id) => {
    setModuleId(id);
    const max = getModule(id).count;
    setWrongCount((w) => Math.min(w, max));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidSetId(setId)) {
      setError('集合编号应为四位数字');
      return;
    }
    if (durationSec <= 0) {
      setError('请填写有效的用时');
      return;
    }
    if (wrongCount < 0 || wrongCount > module.count) {
      setError(`错题数应在 0–${module.count} 之间`);
      return;
    }
    if (!date || !time) {
      setError('请选择练习日期和时间');
      return;
    }

    // 编辑时日期时间未改动 → 保留原始时间戳（含秒），避免被截断到分钟
    let iso;
    if (
      initial?.date &&
      date === toDateInputValue(initial.date) &&
      time === toTimeInputValue(initial.date)
    ) {
      iso = initial.date;
    } else {
      // "YYYY-MM-DDTHH:mm" 无时区后缀 → 按本地时区解析
      const dt = new Date(`${date}T${time}`);
      if (Number.isNaN(dt.getTime())) {
        setError('日期或时间格式不正确');
        return;
      }
      if (dt.getTime() > Date.now()) {
        setError('练习时间不能晚于当前时间');
        return;
      }
      iso = dt.toISOString();
    }

    setSaving(true);
    try {
      await onSubmit({
        setId,
        moduleId,
        date: iso,
        durationSec,
        wrongCount,
        totalCount: module.count,
      });
    } catch (err) {
      // 保存失败留在表单，已填内容不丢失
      setError(`保存失败：${err.message}`);
      toast.error(`保存失败：${err.message}`);
      setSaving(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SetIdInput id="manual-set-id" value={setId} onChange={setSetId} />

        <div className="space-y-1.5">
          <Label htmlFor="manual-module">模块</Label>
          <Select value={moduleId} onValueChange={handleModuleChange}>
            <SelectTrigger id="manual-module">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODULES.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}（{m.count} 题）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="manual-date">练习日期与时间</Label>
          <div className="flex gap-2">
            <Input
              id="manual-date"
              type="date"
              value={date}
              max={toDateInputValue()}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1"
            />
            <Input
              type="time"
              aria-label="练习时间"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-28 shrink-0"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>用时</Label>
          <DurationPicker valueSec={durationSec} onChange={setDurationSec} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="manual-wrong">错题数（共 {module.count} 题）</Label>
          <WrongCountPicker
            id="manual-wrong"
            value={wrongCount}
            onChange={setWrongCount}
            max={module.count}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving ? '保存中…' : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
