import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Flag } from 'lucide-react';
import ModulePicker from './ModulePicker.jsx';
import SetIdInput from './SetIdInput.jsx';
import Timer from './Timer.jsx';
import ResultForm from './ResultForm.jsx';
import Button from '../common/Button.jsx';
import { useTimer } from '../../hooks/useTimer.js';
import { useRecords } from '../../hooks/useRecords.js';
import { getModule } from '../../lib/modules.js';
import { formatDuration, isValidSetId } from '../../lib/format.js';
import { getLastSetId, setLastSetId } from '../../lib/lastSetId.js';

// 练习状态机：idle（选模块）→ running（计时中）→ finished（填结果）
export default function TimerPractice() {
  const navigate = useNavigate();
  const { add } = useRecords();
  const { elapsedSec, running, start, pause, reset, getElapsedSec } = useTimer();

  const [phase, setPhase] = useState('idle');
  const [setId, setSetId] = useState(getLastSetId);
  const [moduleId, setModuleId] = useState(null);
  const [finalSec, setFinalSec] = useState(0);
  const [saving, setSaving] = useState(false);

  const module = moduleId ? getModule(moduleId) : null;
  const canStart = !!moduleId && isValidSetId(setId);

  const handleStart = () => {
    if (!canStart) return;
    reset();
    setPhase('running');
    start();
  };

  const handleFinish = () => {
    pause();
    // 用精确计算值而非渲染值，避免界面刷新被节流导致保存偏小
    setFinalSec(getElapsedSec());
    setPhase('finished');
  };

  const handleSave = async (wrongCount) => {
    setSaving(true);
    try {
      await add({
        setId,
        moduleId,
        durationSec: finalSec,
        wrongCount,
        totalCount: module.count,
        source: 'timer',
      });
      setLastSetId(setId); // 记住本次集合编号，下次预填
      reset();
      navigate('/');
    } catch (e) {
      // 保存失败不跳转，保留结果表单避免丢数据
      window.alert(`保存失败：${e.message}`);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    setPhase('idle');
  };

  // 阶段一：选择集合编号 + 模块
  if (phase === 'idle') {
    return (
      <div className="mx-auto max-w-md space-y-5">
        <SetIdInput value={setId} onChange={setSetId} />
        <ModulePicker value={moduleId} onChange={setModuleId} />
        <Button
          className="w-full"
          size="lg"
          disabled={!canStart}
          onClick={handleStart}
        >
          <Play size={18} strokeWidth={2.25} aria-hidden />
          开始计时
        </Button>
      </div>
    );
  }

  // 阶段二：计时中（番茄钟式聚焦界面）
  if (phase === 'running') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 pt-4">
        <div className="text-center">
          <div className="text-base font-semibold text-ink">{module.name}</div>
          <div className="mt-0.5 text-xs tabular-nums text-ink-3">
            #{setId} · {module.count} 题 · 限时 {formatDuration(module.limitSec)}
          </div>
        </div>

        <Timer elapsedSec={elapsedSec} limitSec={module.limitSec} />

        <div className="flex w-full gap-3">
          {running ? (
            <Button variant="secondary" size="lg" className="flex-1" onClick={pause}>
              <Pause size={18} strokeWidth={2} aria-hidden />
              暂停
            </Button>
          ) : (
            <Button variant="secondary" size="lg" className="flex-1" onClick={start}>
              <Play size={18} strokeWidth={2} aria-hidden />
              继续
            </Button>
          )}
          <Button size="lg" className="flex-1" onClick={handleFinish}>
            <Flag size={18} strokeWidth={2} aria-hidden />
            结束
          </Button>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          className="cursor-pointer rounded-lg px-4 py-2 text-xs text-ink-3 transition-colors hover:text-ink-2"
        >
          放弃本次
        </button>
      </div>
    );
  }

  // 阶段三：填写结果
  return (
    <div className="mx-auto max-w-md space-y-4 pt-2">
      <div className="text-center">
        <span className="text-sm font-medium text-ink-2">
          {module.name} · 记录成绩
        </span>
      </div>
      <ResultForm
        module={module}
        durationSec={finalSec}
        saving={saving}
        onSubmit={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
