import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';
import SetIdInput from './SetIdInput.jsx';
import { MODULES, getModule } from '../../lib/modules.js';
import { useRecords } from '../../hooks/useRecords.js';
import {
  toDateInputValue,
  toTimeInputValue,
  isValidSetId,
} from '../../lib/format.js';
import { getLastSetId, setLastSetId } from '../../lib/lastSetId.js';

const inputClass =
  'w-full min-h-[44px] rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

// 手动补录历史成绩。用时以「分:秒」两个输入框录入；
// 练习日期+时间可精确指定，支持一天多次练习。
export default function ManualEntry() {
  const navigate = useNavigate();
  const { add } = useRecords();

  const [setId, setSetId] = useState(getLastSetId);
  const [moduleId, setModuleId] = useState(MODULES[0].id);
  const [date, setDate] = useState(toDateInputValue());
  const [time, setTime] = useState(toTimeInputValue());
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [wrongCount, setWrongCount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const module = getModule(moduleId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidSetId(setId)) {
      setError('集合编号应为四位数字');
      return;
    }

    const min = Math.floor(Number(minutes) || 0);
    const sec = Math.floor(Number(seconds) || 0);
    const durationSec = min * 60 + sec;
    const wrong = Math.floor(Number(wrongCount) || 0);

    if (durationSec <= 0) {
      setError('请填写有效的用时');
      return;
    }
    if (sec > 59) {
      setError('秒数应在 0–59 之间');
      return;
    }
    if (wrong < 0 || wrong > module.count) {
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
        wrongCount: wrong,
        totalCount: module.count,
        source: 'manual',
      });
      setLastSetId(setId); // 记住本次集合编号，下次预填
      navigate('/');
    } catch (err) {
      // 保存失败留在表单，已填内容不丢失
      setError(`保存失败：${err.message}`);
      setSaving(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SetIdInput id="manual-set-id" value={setId} onChange={setSetId} />

        <div>
          <label
            htmlFor="manual-module"
            className="mb-1.5 block text-sm font-medium text-ink-2"
          >
            模块
          </label>
          <select
            id="manual-module"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className={inputClass}
          >
            {MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}（{m.count} 题）
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="manual-date"
            className="mb-1.5 block text-sm font-medium text-ink-2"
          >
            练习日期与时间
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="manual-date"
              type="date"
              value={date}
              max={toDateInputValue()}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
            <input
              type="time"
              aria-label="练习时间"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-2">用时</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              aria-label="用时（分钟）"
              min={0}
              placeholder="分"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className={inputClass}
            />
            <span className="text-ink-3">:</span>
            <input
              type="number"
              inputMode="numeric"
              aria-label="用时（秒）"
              min={0}
              max={59}
              placeholder="秒"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="manual-wrong"
            className="mb-1.5 block text-sm font-medium text-ink-2"
          >
            错题数（共 {module.count} 题）
          </label>
          <input
            id="manual-wrong"
            type="number"
            inputMode="numeric"
            min={0}
            max={module.count}
            placeholder="0"
            value={wrongCount}
            onChange={(e) => setWrongCount(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-sm text-danger" role="alert">
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
