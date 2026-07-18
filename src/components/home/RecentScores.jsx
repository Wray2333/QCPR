import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

/**
 * 近期成绩列表。
 * @param {(id:string)=>Promise<void>} onDelete 执行删除（确认由本组件的 AlertDialog 负责）
 */
export default function RecentScores({ records, onDelete }) {
  const recent = getRecentRecords(records, 10);

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-base font-semibold text-foreground">近期成绩</h2>
      <ul className="divide-y divide-border">
        {recent.map((r) => {
          const m = getModule(r.moduleId);
          const rate = accuracy(r);
          const over = isOvertime(r);
          return (
            <li key={r.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {m ? m.name : r.moduleId}
                  </span>
                  <Badge variant="secondary" className="shrink-0 tabular-nums">
                    {r.setId ? `#${r.setId}` : '未标注'}
                  </Badge>
                  {r.source === 'manual' && (
                    <Badge variant="outline" className="shrink-0">
                      补录
                    </Badge>
                  )}
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
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
                  className={`text-xs tabular-nums ${over ? 'text-destructive' : 'text-muted-foreground'}`}
                >
                  {formatDuration(r.durationSec)}
                </div>
              </div>
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="删除该记录"
                      aria-label="删除该记录"
                    >
                      <X size={16} strokeWidth={2} aria-hidden />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>删除该记录？</AlertDialogTitle>
                      <AlertDialogDescription>
                        {m ? m.name : r.moduleId}
                        {r.setId ? ` · #${r.setId}` : ''} · {formatDateTime(r.date)}
                        ，删除后不可恢复。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(r.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
