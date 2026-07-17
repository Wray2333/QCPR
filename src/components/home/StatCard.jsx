import Card from '../common/Card.jsx';

/**
 * 概览指标卡（stat tile）。
 * @param {string} label 指标名
 * @param {string|number} value 主数值（大号）
 * @param {string} [sub] 补充说明
 * @param {string} [valueClass] 数值颜色类
 */
export default function StatCard({ label, value, sub, valueClass = 'text-ink' }) {
  return (
    <Card className="flex flex-col p-3.5 sm:p-4">
      <span className="text-xs font-medium text-ink-2">{label}</span>
      <span
        className={`mt-1 text-2xl font-bold leading-none tabular-nums sm:text-3xl ${valueClass}`}
      >
        {value}
      </span>
      {sub && <span className="mt-1.5 text-xs text-ink-3">{sub}</span>}
    </Card>
  );
}
