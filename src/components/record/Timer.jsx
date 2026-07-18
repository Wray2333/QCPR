import { formatDuration } from '../../lib/format.js';

const SIZE = 260;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * 番茄钟式圆环计时器。
 * 圆环表示剩余时间比例（随用时消耗），中央大数字显示已用时；
 * 超时后圆环与数字转为警示色。
 * @param {number} elapsedSec 已用秒数
 * @param {number} limitSec 限时
 */
export default function Timer({ elapsedSec, limitSec }) {
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
          className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${
            overtime ? 'text-destructive' : 'text-primary'
          }`}
        />
      </svg>

      {/* 中央读数 */}
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
          {overtime
            ? `已超时 +${formatDuration(elapsedSec - limitSec)}`
            : `剩余 ${formatDuration(limitSec - elapsedSec)}`}
        </span>
      </div>
    </div>
  );
}
