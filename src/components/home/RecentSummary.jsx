import { getRecentSummary } from '../../lib/analytics.js';
import { formatPercent, accuracyColorClass } from '../../lib/format.js';
import StatCard from './StatCard.jsx';

/** 顶部三张概览卡：总次数、近 7 天、平均正确率 */
export default function RecentSummary({ records }) {
  const { total, last7, avgAccuracy } = getRecentSummary(records);
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="练习总次数" value={total} sub="累计记录" />
      <StatCard label="近 7 天" value={last7} sub="次练习" />
      <StatCard
        label="平均正确率"
        value={formatPercent(avgAccuracy)}
        sub="全部模块"
        valueClass={accuracyColorClass(avgAccuracy)}
      />
    </div>
  );
}
