import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card from '../common/Card.jsx';
import { MODULES, getModule } from '../../lib/modules.js';
import { getModuleTrend, getRecentRecords } from '../../lib/analytics.js';
import { useTheme } from '../../hooks/useTheme.jsx';
import {
  formatShortDate,
  formatShortDateTime,
  formatDuration,
  formatPercent,
} from '../../lib/format.js';

// 单序列折线图：一次显示一个模块 + 一个指标的时间趋势。
// Recharts 需要具体色值，因此按主题提供两套图表专用色板。
const CHART_THEME = {
  light: {
    grid: '#E7E5E4', // stone-200
    tick: '#A8A29E', // stone-400
    accuracy: '#DC2626', // 品牌红
    duration: '#2563EB', // blue-600
  },
  dark: {
    grid: '#292524', // stone-800
    tick: '#78716C', // stone-500
    accuracy: '#F87171', // red-400
    duration: '#60A5FA', // blue-400
  },
};

const METRICS = [
  { key: 'accuracy', label: '正确率' },
  { key: 'duration', label: '用时' },
];

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload || !payload.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-sm">
      {/* 显示到分钟，同一天多次练习可区分 */}
      <div className="text-ink-3">{formatShortDateTime(label)}</div>
      <div className="mt-0.5 font-semibold tabular-nums text-ink">
        {metric === 'accuracy' ? formatPercent(v) : formatDuration(v)}
      </div>
    </div>
  );
}

export default function TrendChart({ records }) {
  const { isDark } = useTheme();
  // null 表示"未手动选择"，跟随记录里最近有数据的模块；
  // 用户手动选择后记住其选择。
  const [picked, setPicked] = useState(null);
  const [metric, setMetric] = useState('accuracy');

  const colors = CHART_THEME[isDark ? 'dark' : 'light'];

  // 生效模块：优先用户选择；未选或所选模块在当前记录集无数据时，
  // 回落到最近练习过的模块（切换集合筛选后自动跟随）。
  const fallbackId = getRecentRecords(records, 1)[0]?.moduleId ?? MODULES[0].id;
  const pickedHasData =
    picked && records.some((r) => r.moduleId === picked);
  const moduleId = pickedHasData ? picked : fallbackId;

  const data = getModuleTrend(records, moduleId, metric);
  const module = getModule(moduleId);
  const lineColor = metric === 'accuracy' ? colors.accuracy : colors.duration;

  const yTickFormatter = (v) =>
    metric === 'accuracy' ? formatPercent(v) : formatDuration(v);

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink">进步趋势</h2>
        {/* 指标切换 */}
        <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetric(m.key)}
              className={`min-h-[36px] cursor-pointer rounded-lg px-3 text-xs font-medium transition-all duration-200 ${
                metric === m.key
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 模块切换 */}
      <select
        value={moduleId}
        onChange={(e) => setPicked(e.target.value)}
        aria-label="选择模块"
        className="min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand sm:w-auto"
      >
        {MODULES.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-ink-3">
          「{module.name}」暂无练习记录
        </div>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11, fill: colors.tick }}
                stroke={colors.grid}
              />
              <YAxis
                width={44}
                tickFormatter={yTickFormatter}
                tick={{ fontSize: 11, fill: colors.tick }}
                stroke={colors.grid}
                domain={metric === 'accuracy' ? [0, 1] : ['auto', 'auto']}
              />
              <Tooltip
                content={<CustomTooltip metric={metric} />}
                cursor={{ stroke: colors.tick, strokeDasharray: '3 3' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2}
                dot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
