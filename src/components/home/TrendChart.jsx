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
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
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
    accuracy: '#0D9488', // 品牌青碧 teal-600
    duration: '#2563EB', // blue-600
  },
  dark: {
    grid: '#292524', // stone-800
    tick: '#78716C', // stone-500
    accuracy: '#2DD4BF', // teal-400
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
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-sm">
      {/* 显示到分钟，同一天多次练习可区分 */}
      <div className="text-muted-foreground">{formatShortDateTime(label)}</div>
      <div className="mt-0.5 font-semibold tabular-nums text-foreground">
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
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">进步趋势</h2>
        {/* 指标切换 */}
        <Tabs value={metric} onValueChange={setMetric}>
          <TabsList className="h-9">
            {METRICS.map((m) => (
              <TabsTrigger key={m.key} value={m.key} className="text-xs">
                {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 模块切换 */}
      <Select value={moduleId} onValueChange={setPicked}>
        <SelectTrigger aria-label="选择模块" className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODULES.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
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
