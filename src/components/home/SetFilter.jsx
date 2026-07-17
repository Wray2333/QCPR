import { getSetIds } from '../../lib/analytics.js';

/**
 * 集合筛选器（下拉：全部集合 + 各 setId）。
 * @param {Array} records 全部记录（用于取集合列表）
 * @param {string} value 当前选中，'all' 表示全部
 * @param {(v:string)=>void} onChange
 */
export default function SetFilter({ records, value, onChange }) {
  const setIds = getSetIds(records);
  // 只有一个集合时无需筛选，直接不渲染
  if (setIds.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="set-filter" className="shrink-0 text-sm text-ink-2">
        集合
      </label>
      <select
        id="set-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm tabular-nums text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      >
        <option value="all">全部集合</option>
        {setIds.map((id) => (
          <option key={id} value={id}>
            #{id}
          </option>
        ))}
      </select>
    </div>
  );
}
