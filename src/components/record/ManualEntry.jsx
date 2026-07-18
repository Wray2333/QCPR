import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { NativeSelect } from '@/components/ui/native-select';
import { MODULES, getModule } from '../../lib/modules.js';
import { useRecords } from '../../hooks/useRecords.js';
import {
  toDateInputValue,
  toTimeInputValue,
  isValidSetId,
} from '../../lib/format.js';
import { getLastSetId, setLastSetId } from '../../lib/lastSetId.js';

// 手动补录历史成绩。用时用分秒拨轮录入；
// 练习日期+时间可精确指定，支持一天多次练习。
export default function ManualEntry() {
  const navigate = useNavigate();
  const { add } = useRecords();

  const [setId, setSetId] = useState(getLastSetId);
  const [moduleId, setModuleId] = useState(MODULES[0].id);
  const [date, setDate] = useState(toDateInputValue());
  const [time, setTime] = useState(toTimeInputValue());
  const [durationSec, setDurationSec] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
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

    setSaving(true);
    try {
      await add({
        setId,
        moduleId,
        date: dt.toISOString(),
        durationSec,
        wrongCount,
        totalCount: module.count,
        source: 'manual',
      });
      setLastSetId(setId); // 记住本次集合编号，下次预填
      navigate('/');
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
          <div className="grid grid-cols-2 gap-2">
            <Input
              id="manual-date"
              type="date"
              value={date}
              max={toDateInputValue()}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              type="time"
              aria-label="练习时间"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>用时</Label>
          <DurationPicker valueSec={durationSec} onChange={setDurationSec} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="manual-wrong">错题数（共 {module.count} 题）</Label>
          <NativeSelect
            id="manual-wrong"
            value={wrongCount}
            onChange={(e) => setWrongCount(Number(e.target.value))}
            className="tabular-nums"
          >
            {Array.from({ length: module.count + 1 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                {n} 题
              </option>
            ))}
          </NativeSelect>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving ? '保存中…' : '保存成绩'}
        </Button>
      </form>
    </Card>
  );
}
