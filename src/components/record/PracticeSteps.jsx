import { Check } from 'lucide-react';
import { getModule } from '../../lib/modules.js';
import { formatDuration } from '../../lib/format.js';
import { cn } from '@/lib/utils';

/**
 * 连续计时进度条：已完成（✓ + 用时）/ 进行中 / 待开始。
 * @param {string[]} queue 计时顺序
 * @param {Array<{durationSec:number}>} results 已完成项（与 queue 前缀对齐）
 */
export default function PracticeSteps({ queue, results }) {
  return (
    <ol className="flex w-full flex-wrap justify-center gap-1.5" aria-label="计时进度">
      {queue.map((id, i) => {
        const done = results[i];
        const current = i === results.length;
        return (
          <li
            key={id}
            aria-current={current ? 'step' : undefined}
            className={cn(
              'flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium tabular-nums',
              done && 'border-transparent bg-muted text-muted-foreground',
              current && 'border-primary bg-primary/10 text-primary',
              !done && !current && 'border-dashed border-border text-muted-foreground'
            )}
          >
            {done && <Check size={13} strokeWidth={2.5} aria-hidden />}
            {getModule(id).name}
            {done && <span className="ml-0.5">{formatDuration(done.durationSec)}</span>}
          </li>
        );
      })}
    </ol>
  );
}
