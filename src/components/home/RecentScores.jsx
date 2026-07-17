import { X } from 'lucide-react';
import Card from '../common/Card.jsx';
import { getModule } from '../../lib/modules.js';
import { getRecentRecords } from '../../lib/analytics.js';
import {
  accuracy,
  formatPercent,
  formatDuration,
  formatDateTime,
  isOvertime,
  accuracyColorClass,
} from '../../lib/format.js';

/** 近期成绩列表 */
export default function RecentScores({ records, onDelete }) {
  const recent = getRecentRecords(records, 10);

  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold text-ink">近期成绩</h2>
      <ul className="divide-y divide-line">
        {recent.map((r) => {
          const m = getModule(r.moduleId);
          const rate = accuracy(r);
          const over = isOvertime(r);
          return (
            <li key={r.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink">
                    {m ? m.name : r.moduleId}
                  </span>
                  {r.source === 'manual' && (
                    <span className="shrink-0 rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-2">
                      补录
                    </span>
                  )}
                </div>
                <span className="text-xs tabular-nums text-ink-3">
                  {formatDateTime(r.date)}
                </span>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-semibold tabular-nums ${accuracyColorClass(rate)}`}
                >
                  {formatPercent(rate)}
                </div>
                <div
                  className={`text-xs tabular-nums ${over ? 'text-danger' : 'text-ink-3'}`}
                >
                  {formatDuration(r.durationSec)}
                </div>
              </div>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-3 transition-colors duration-200 hover:bg-danger/10 hover:text-danger"
                  title="删除该记录"
                  aria-label="删除该记录"
                >
                  <X size={16} strokeWidth={2} aria-hidden />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
