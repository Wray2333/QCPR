import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Flag,
  ChevronsRight,
  Undo2,
  Camera,
  CircleCheck,
  ChartLine,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import ModulePicker from './ModulePicker.jsx';
import SetIdInput from './SetIdInput.jsx';
import Timer from './Timer.jsx';
import PracticeSteps from './PracticeSteps.jsx';
import ResultForm from './ResultForm.jsx';
import { useTimer } from '../../hooks/useTimer.js';
import { useWakeLock } from '../../hooks/useWakeLock.js';
import * as storage from '../../lib/storage.js';
import { getModule, MODULE_GROUPS } from '../../lib/modules.js';
import {
  formatDuration,
  formatPercent,
  accuracy,
  accuracyColorClass,
  isValidSetId,
} from '../../lib/format.js';
import { getLastSetId, setLastSetId } from '../../lib/lastSetId.js';
import {
  loadPracticeDraft,
  savePracticeDraft,
  clearPracticeDraft,
  getLastModules,
  setLastModules,
} from '../../lib/practiceDraft.js';

const ADVANCE_GUARD_MS = 800; // 「下一项」防连点
const UNDO_WINDOW_MS = 6000; // 误点「下一项」后可撤回的时长

const sameIds = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const moduleNames = (ids) => ids.map((id) => getModule(id).name).join(' + ');

/** 放弃按钮：已有用时记录时二次确认，避免误触丢数据 */
function AbandonButton({ doneCount, onConfirm }) {
  const className =
    'cursor-pointer rounded-lg px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-destructive';
  if (doneCount === 0) {
    return (
      <button type="button" className={className} onClick={onConfirm}>
        放弃本次
      </button>
    );
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button type="button" className={className}>
          放弃本次
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>放弃本次练习？</AlertDialogTitle>
          <AlertDialogDescription>
            已记录的 {doneCount} 项用时将被丢弃，不会保存。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>继续练习</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            放弃
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// 连续计时状态机：
// idle（选集合 + 有序多选模块）→ running（逐项计时，「下一项」无缝衔接）
// → review（拍照查错后逐项填错题数）→ done（已保存，可一键开始下一组）。
// running / review 实时落盘为草稿，切到相机或 AI 应用后回来可恢复。
export default function TimerPractice() {
  const navigate = useNavigate();
  const {
    elapsedSec,
    running,
    start,
    pause,
    reset,
    getElapsedMs,
    snapshot,
    restore,
  } = useTimer();
  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock();

  // 草稿只在首次渲染读取一次
  const draftRef = useRef(undefined);
  if (draftRef.current === undefined) draftRef.current = loadPracticeDraft();
  const draft = draftRef.current;

  const [phase, setPhase] = useState(draft?.phase ?? 'idle');
  const [setId, setSetId] = useState(() => draft?.setId ?? getLastSetId());
  const [queue, setQueue] = useState(() => draft?.queue ?? getLastModules());
  // 已完成项，与 queue 前缀一一对应；running 时当前项 = queue[results.length]
  const [results, setResults] = useState(draft?.results ?? []);
  const [saving, setSaving] = useState(false);
  const [undoable, setUndoable] = useState(false);
  const lastAdvanceRef = useRef(0);

  // 恢复草稿（须声明在落盘 effect 之前，保证落盘读到的是恢复后的计时器）
  useEffect(() => {
    if (!draft) return;
    if (draft.phase === 'running') restore(draft.timer);
    toast.info('已恢复未完成的练习', { id: 'practice-restored' });
  }, [draft, restore]);

  // 进行中状态落盘；回到 idle / done 时清除
  useEffect(() => {
    if (phase === 'running' || phase === 'review') {
      savePracticeDraft({ phase, setId, queue, results, timer: snapshot() });
    } else {
      clearPracticeDraft();
    }
  }, [phase, setId, queue, results, running, snapshot]);

  // 计时进行中保持屏幕常亮；暂停/结束/离开时释放
  useEffect(() => {
    if (running) requestWakeLock();
    else releaseWakeLock();
  }, [running, requestWakeLock, releaseWakeLock]);

  // 撤回入口限时显示
  useEffect(() => {
    if (!undoable) return;
    const t = setTimeout(() => setUndoable(false), UNDO_WINDOW_MS);
    return () => clearTimeout(t);
  }, [undoable, results.length]);

  const canStart = queue.length > 0 && isValidSetId(setId);

  const handleStart = (ids = queue) => {
    if (!ids.length || !isValidSetId(setId)) return;
    setQueue(ids);
    setLastModules(ids);
    setLastSetId(setId);
    setResults([]);
    setUndoable(false);
    reset();
    start();
    lastAdvanceRef.current = Date.now();
    setPhase('running');
  };

  // 结束当前项：记下用时，有下一项则立即开始计时，否则进入填错题
  const handleAdvance = () => {
    const now = Date.now();
    if (now - lastAdvanceRef.current < ADVANCE_GUARD_MS) return;
    lastAdvanceRef.current = now;
    // 用精确计算值而非渲染值，避免界面刷新被节流导致保存偏小
    const ms = getElapsedMs();
    const next = [
      ...results,
      {
        moduleId: queue[results.length],
        durationMs: ms,
        durationSec: Math.floor(ms / 1000),
        endedAt: now,
        wrongCount: 0,
      },
    ];
    setResults(next);
    reset();
    if (next.length < queue.length) start();
    else setPhase('review');
    setUndoable(true);
  };

  // 撤回误点：上一项接着走表，仿佛从未结束
  const handleUndo = () => {
    const last = results[results.length - 1];
    if (!last) return;
    setResults(results.slice(0, -1));
    restore({ accMs: last.durationMs, startedAt: last.endedAt });
    lastAdvanceRef.current = Date.now();
    setUndoable(false);
    setPhase('running');
  };

  const handleAbandon = () => {
    reset();
    setResults([]);
    setUndoable(false);
    setPhase('idle');
  };

  const handleResultChange = (index, patch) =>
    setResults((rs) => rs.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const handleSave = async () => {
    const bad = results.find((r) => r.durationSec <= 0);
    if (bad) {
      toast.error(`「${getModule(bad.moduleId).name}」用时无效，请修改`);
      return;
    }
    setSaving(true);
    let next = results;
    try {
      // 逐条保存；已保存的打上 savedId，失败重试时跳过，避免重复
      for (let i = 0; i < next.length; i++) {
        const r = next[i];
        if (r.savedId) continue;
        const full = await storage.addRecord({
          setId,
          moduleId: r.moduleId,
          date: new Date(r.endedAt).toISOString(),
          durationSec: r.durationSec,
          wrongCount: r.wrongCount,
          totalCount: getModule(r.moduleId).count,
          source: 'timer',
        });
        next = next.map((x, j) => (j === i ? { ...x, savedId: full.id } : x));
        setResults(next);
      }
      setLastSetId(setId);
      setUndoable(false);
      setPhase('done');
      toast.success(`已保存 ${next.length} 条成绩`);
    } catch (e) {
      // 保存失败停留在本页，已填内容随草稿保留
      toast.error(`保存失败：${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const undoButton = undoable && results.length > 0 && (
    <button
      type="button"
      onClick={handleUndo}
      className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
    >
      <Undo2 size={14} strokeWidth={2} aria-hidden />
      点错了？撤回，继续「{getModule(results[results.length - 1].moduleId).name}」计时
    </button>
  );

  // 阶段一：集合编号 + 模块（有序多选）
  if (phase === 'idle') {
    return (
      <div className="mx-auto max-w-md space-y-5">
        <SetIdInput value={setId} onChange={setSetId} />
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label>练习模块</Label>
            <span className="text-xs text-muted-foreground">可多选，按选择顺序连续计时</span>
          </div>
          <ModulePicker value={queue} onChange={setQueue} />
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={!canStart}
          onClick={() => handleStart()}
        >
          <Play size={18} strokeWidth={2.25} aria-hidden />
          {queue.length > 1 ? `开始连续计时（${queue.length} 项）` : '开始计时'}
        </Button>
      </div>
    );
  }

  // 阶段二：计时中（番茄钟式聚焦界面）
  if (phase === 'running') {
    const module = getModule(queue[results.length]);
    const nextId = queue[results.length + 1];
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 pt-2">
        {queue.length > 1 && <PracticeSteps queue={queue} results={results} />}

        <div className="text-center">
          <div className="text-base font-semibold text-foreground">{module.name}</div>
          <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">
            #{setId} · {module.count} 题 · 限时 {formatDuration(module.limitSec)}
          </div>
        </div>

        <Timer
          elapsedSec={elapsedSec}
          limitSec={module.limitSec}
          running={running}
          onToggle={running ? pause : start}
        />

        <div className="w-full space-y-2">
          <Button size="lg" className="w-full" onClick={handleAdvance}>
            {nextId ? (
              <>
                <ChevronsRight size={18} strokeWidth={2} aria-hidden />
                下一项
              </>
            ) : (
              <>
                <Flag size={18} strokeWidth={2} aria-hidden />
                结束
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {nextId
              ? `点「下一项」记录本项用时，并立即开始「${getModule(nextId).name}」`
              : '点「结束」后拍照查错，再填写错题数'}
          </p>
        </div>

        {undoButton}
        <AbandonButton doneCount={results.length} onConfirm={handleAbandon} />
      </div>
    );
  }

  // 阶段三：查错后填写各项错题数
  if (phase === 'review') {
    return (
      <div className="mx-auto max-w-md space-y-3 pt-2">
        <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <Camera size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-primary" aria-hidden />
          <div>
            <div className="text-sm font-medium text-foreground">
              计时完成 · #{setId}，拍照查错后填写错题数
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              可放心切到相机或 AI 应用，进度会自动保留。
            </div>
          </div>
        </div>
        {undoButton && <div className="flex justify-center">{undoButton}</div>}
        <ResultForm
          results={results}
          onChange={handleResultChange}
          saving={saving}
          onSubmit={handleSave}
        />
        <div className="flex justify-center">
          <AbandonButton doneCount={results.length} onConfirm={handleAbandon} />
        </div>
      </div>
    );
  }

  // 阶段四：已保存，可一键开始下一组
  const groupIndex = MODULE_GROUPS.findIndex((g) => sameIds(g, queue));
  const nextGroup = groupIndex >= 0 ? MODULE_GROUPS[groupIndex + 1] : null;
  return (
    <div className="mx-auto max-w-md space-y-4 pt-2">
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <CircleCheck size={18} strokeWidth={2} className="text-success" aria-hidden />
          已保存 {results.length} 条成绩 · #{setId}
        </div>
        <ul className="divide-y divide-border">
          {results.map((r) => {
            const m = getModule(r.moduleId);
            const rate = accuracy({ totalCount: m.count, wrongCount: r.wrongCount });
            return (
              <li key={r.moduleId} className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground">{m.name}</span>
                <span className="flex items-center gap-3 tabular-nums">
                  <span
                    className={
                      r.durationSec > m.limitSec ? 'text-destructive' : 'text-muted-foreground'
                    }
                  >
                    {formatDuration(r.durationSec)}
                  </span>
                  <span className={`w-10 text-right font-semibold ${accuracyColorClass(rate)}`}>
                    {formatPercent(rate)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      {nextGroup && (
        <div className="space-y-1.5">
          <Button size="lg" className="w-full" onClick={() => handleStart(nextGroup)}>
            <Play size={18} strokeWidth={2.25} aria-hidden />
            开始下一组计时
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {moduleNames(nextGroup)}
          </p>
        </div>
      )}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={() => {
            setQueue(nextGroup ?? queue);
            setResults([]);
            setPhase('idle');
          }}
        >
          <RotateCcw size={16} strokeWidth={2} aria-hidden />
          重新选择
        </Button>
        <Button
          variant={nextGroup ? 'secondary' : 'default'}
          size="lg"
          className="flex-1"
          onClick={() => navigate('/')}
        >
          <ChartLine size={16} strokeWidth={2} aria-hidden />
          查看分析
        </Button>
      </div>
    </div>
  );
}
