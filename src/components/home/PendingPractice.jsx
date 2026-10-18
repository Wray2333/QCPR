import { Link } from 'react-router-dom';
import { Hourglass, ChevronRight } from 'lucide-react';
import { loadPracticeDraft } from '../../lib/practiceDraft.js';
import { getModule } from '../../lib/modules.js';

/** 首页提醒：有尚未保存的连续计时练习（计时中或待填错题），点击回到记录页继续 */
export default function PendingPractice() {
  const draft = loadPracticeDraft();
  if (!draft) return null;

  const names = draft.queue.map((id) => getModule(id).name).join(' + ');
  const title =
    draft.phase === 'running' ? '有一组练习正在计时' : '有一组练习待填写错题数';

  return (
    <Link
      to="/record"
      className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3 transition-colors hover:bg-primary/10"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Hourglass size={18} strokeWidth={2} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="truncate text-xs text-muted-foreground">
          #{draft.setId} · {names}
        </div>
      </div>
      <span className="flex shrink-0 items-center text-sm font-medium text-primary">
        继续
        <ChevronRight size={16} strokeWidth={2} aria-hidden />
      </span>
    </Link>
  );
}
