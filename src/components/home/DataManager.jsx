import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { exportJSON, importJSON } from '../../lib/storage.js';
import { toDateInputValue } from '../../lib/format.js';

/** 数据管理：导出备份 / 导入恢复（覆盖现有数据） */
export default function DataManager({ recordCount, onImported }) {
  const fileRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);

  const handleExport = async () => {
    try {
      const json = await exportJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qcpr-records-${toDateInputValue()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('已导出备份');
    } catch (err) {
      toast.error(`导出失败：${err.message}`);
    }
  };

  // 选择文件后暂存，弹出确认框
  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 允许重复选择同一文件
    if (file) setPendingFile(file);
  };

  const confirmImport = async () => {
    const file = pendingFile;
    setPendingFile(null);
    if (!file) return;
    try {
      const text = await file.text();
      const n = await importJSON(text);
      onImported?.();
      toast.success(`导入成功，共 ${n} 条记录`);
    } catch (err) {
      toast.error(`导入失败：${err.message}`);
    }
  };

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">数据管理</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          数据仅存于本浏览器，建议定期导出备份
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download size={15} strokeWidth={2} aria-hidden />
          导出
        </Button>
        <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload size={15} strokeWidth={2} aria-hidden />
          导入
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFilePick}
        />
      </div>

      <AlertDialog
        open={!!pendingFile}
        onOpenChange={(o) => !o && setPendingFile(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>导入将覆盖现有数据</AlertDialogTitle>
            <AlertDialogDescription>
              导入会覆盖当前 {recordCount} 条记录，此操作不可恢复。建议先导出备份。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>确定导入</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
