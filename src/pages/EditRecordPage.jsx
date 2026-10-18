import { useParams, useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecords } from '../hooks/useRecords.js';
import RecordForm from '../components/record/RecordForm.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

// 编辑一条历史成绩：复用补录表单，保存后回到首页。
export default function EditRecordPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { records, loading, update } = useRecords();
  const record = records.find((r) => r.id === id);

  if (loading) {
    return (
      <div className="mx-auto max-w-md" role="status" aria-label="加载中">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="pt-6">
        <EmptyState
          icon={FileQuestion}
          title="记录不存在"
          description="该记录可能已被删除。"
          actionTo="/"
          actionLabel="返回首页"
        />
      </div>
    );
  }

  const handleSubmit = async (fields) => {
    await update(record.id, fields);
    toast.success('已保存修改');
    navigate('/');
  };

  return (
    <div className="space-y-4">
      <h1 className="mx-auto max-w-md text-lg font-semibold text-foreground">
        编辑记录
      </h1>
      {/* key 绑定 id：切换记录时重置表单初值 */}
      <RecordForm
        key={record.id}
        initial={record}
        submitLabel="保存修改"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
