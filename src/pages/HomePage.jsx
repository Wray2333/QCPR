import { useState, useMemo } from 'react';
import { ChartLine, CloudAlert, RotateCw } from 'lucide-react';
import { useRecords } from '../hooks/useRecords.js';
import RecentSummary from '../components/home/RecentSummary.jsx';
import TrendChart from '../components/home/TrendChart.jsx';
import WeakModuleAnalysis from '../components/home/WeakModuleAnalysis.jsx';
import RecentScores from '../components/home/RecentScores.jsx';
import SetFilter from '../components/home/SetFilter.jsx';
import DataManager from '../components/home/DataManager.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';

export default function HomePage() {
  const { records, loading, error, remove, refresh } = useRecords();
  const [setFilter, setSetFilter] = useState('all');

  // 按集合筛选后的记录，供各分析组件消费
  const filtered = useMemo(
    () =>
      setFilter === 'all'
        ? records
        : records.filter((r) => r.setId === setFilter),
    [records, setFilter]
  );

  // 加载中：静默占位，避免先闪空态再出数据
  if (loading) {
    return (
      <div className="flex justify-center pt-16 text-sm text-ink-3" role="status">
        加载中…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 pt-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-danger">
          <CloudAlert size={28} strokeWidth={1.5} aria-hidden />
        </div>
        <div>
          <p className="text-base font-semibold text-ink">数据加载失败</p>
          <p className="mt-1 text-sm text-ink-2">{error}</p>
        </div>
        <Button variant="secondary" onClick={refresh}>
          <RotateCw size={15} strokeWidth={2} aria-hidden />
          重试
        </Button>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="space-y-4 pt-6">
        <EmptyState
          icon={ChartLine}
          title="还没有任何练习记录"
          description="去记录第一条速算成绩，这里就会显示你的近期表现、进步趋势与弱模块分析。"
          actionTo="/record"
          actionLabel="去记录成绩"
        />
        <DataManager recordCount={0} onImported={refresh} />
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!window.confirm('确定删除该记录吗？')) return;
    try {
      await remove(id);
    } catch (e) {
      window.alert(`删除失败：${e.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <SetFilter records={records} value={setFilter} onChange={setSetFilter} />
      <RecentSummary records={filtered} />
      <TrendChart records={filtered} />
      <WeakModuleAnalysis records={filtered} />
      <RecentScores records={filtered} onDelete={handleDelete} />
      <DataManager recordCount={records.length} onImported={refresh} />
    </div>
  );
}
