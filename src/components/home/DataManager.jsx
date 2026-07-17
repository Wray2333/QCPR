import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';
import { exportJSON, importJSON } from '../../lib/storage.js';
import { toDateInputValue } from '../../lib/format.js';

/** 数据管理：导出备份 / 导入恢复（覆盖现有数据） */
export default function DataManager({ recordCount, onImported }) {
  const fileRef = useRef(null);

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
    } catch (err) {
      window.alert(`导出失败：${err.message}`);
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 允许重复选择同一文件
    if (!file) return;
    if (
      !window.confirm(
        `导入将覆盖当前 ${recordCount} 条记录，确定继续吗？（建议先导出备份）`
      )
    ) {
      return;
    }
    try {
      const text = await file.text();
      const n = await importJSON(text);
      onImported?.();
      window.alert(`导入成功，共 ${n} 条记录`);
    } catch (err) {
      window.alert(`导入失败：${err.message}`);
    }
  };

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-ink">数据管理</h2>
        <p className="mt-0.5 text-xs text-ink-3">
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
          onChange={handleImportFile}
        />
      </div>
    </Card>
  );
}
