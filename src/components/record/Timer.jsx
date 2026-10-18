import { Play, Pause } from 'lucide-react';
import { formatDuration } from '../../lib/format.js';

const SIZE = 260;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * 番茄钟式圆环计时器。
 * 圆环表示剩余时间比例（随用时消耗），中央大数字显示已用时；
 * 超时后圆环与数字转为警示色；圆环内置暂停 / 继续按钮，暂停时圆环变淡。
 * @param {number} elapsedSec 已用秒数
 * @param {number} limitSec 限时
 * @param {boolean} running 是否在走表
 * @param {()=>void} onToggle 暂停 / 继续
 */
export default function Timer({ elapsedSec, limitSec, running, onToggle }) {
  const overtime = elapsedSec > limitSec;
  const remainRatio = Math.max(0, 1 - elapsedSec / limitSec);
  // 未超时：弧长 = 剩余比例；超时：满环警示
  const dashOffset = overtime ? 0 : CIRCUMFERENCE * (1 - remainRatio);

  return (
    <div className="relative mx-auto h-[260px] w-[260px]" role="timer" aria-live="off">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full -rotate-90"
        aria-hidden
      >
        {/* 底环 */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-muted"
        />
        {/* 进度环：剩余弧 */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          stroke="currentColor"
          className={`transition-[stroke-dashoffset,opacity] duration-1000 ease-linear ${
            overtime ? 'text-destructive' : 'text-primary'
          } ${running ? '' : 'opacity-40'}`}
        />
      </svg>

      {/* 中央读数 + 暂停/继续 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-6xl font-bold tabular-nums tracking-tight transition-colors duration-200 ${
            overtime ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {formatDuration(elapsedSec)}
        </span>
        <span
          className={`mt-2 text-sm tabular-nums ${
            overtime ? 'font-medium text-destructive' : 'text-muted-foreground'
          }`}
        >
          {!running && '已暂停 · '}
          {overtime
            ? `超时 +${formatDuration(elapsedSec - limitSec)}`
            : `剩余 ${formatDuration(limitSec - elapsedSec)}`}
        </span>
        <button
          type="button"
          onClick={onToggle}
          aria-label={running ? '暂停计时' : '继续计时'}
          title={running ? '暂停' : '继续'}
          className={`mt-3 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            running
              ? 'bg-muted text-foreground hover:bg-muted/70'
              : 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
          }`}
        >
          {running ? (
            <Pause size={22} strokeWidth={2} fill="currentColor" aria-hidden />
          ) : (
            <Play size={22} strokeWidth={2} fill="currentColor" className="ml-0.5" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
