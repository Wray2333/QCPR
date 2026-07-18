import { AlertTriangle } from 'lucide-react';
import Card from '../common/Card.jsx';
import { getWeakModules } from '../../lib/analytics.js';
import { formatPercent, accuracyColorClass } from '../../lib/format.js';

/**
 * 弱模块分析：按评分升序（最弱在前）展示，附建议。
 * 无记录的模块沉底并标注。
 */
export default function WeakModuleAnalysis({ records }) {
  const ranked = getWeakModules(records);
  const analyzed = ranked.filter((r) => r.sampleCount > 0);
  const untested = ranked.filter((r) => r.sampleCount === 0);

  return (
    <Card>
      <h2 className="mb-1 text-base font-semibold text-foreground">弱模块分析</h2>
      <p className="mb-3 text-xs text-muted-foreground">
        综合正确率、用时与近期趋势，越靠前越需加强
      </p>

      <ul className="space-y-2">
        {analyzed.map((m, i) => (
          <li
            key={m.moduleId}
            className={`flex items-start gap-3 rounded-xl border p-3 ${
              i === 0 ? 'border-destructive/30 bg-destructive/5' : 'border-border'
            }`}
          >
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                i === 0 ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {m.name}
                  {i === 0 && (
                    <AlertTriangle size={14} className="text-destructive" aria-hidden />
                  )}
                </span>
                <span
                  className={`text-sm font-semibold tabular-nums ${accuracyColorClass(m.avgAccuracy)}`}
                >
                  {formatPercent(m.avgAccuracy)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.advice}</p>
            </div>
          </li>
        ))}
      </ul>

      {untested.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          尚未练习：{untested.map((m) => m.name).join('、')}
        </p>
      )}
    </Card>
  );
}
