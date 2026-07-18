import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getSetIds } from '../../lib/analytics.js';

/**
 * 集合筛选器（shadcn Select）。
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
      <Label htmlFor="set-filter" className="shrink-0 text-muted-foreground">
        集合
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="set-filter" className="w-full tabular-nums sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部集合</SelectItem>
          {setIds.map((id) => (
            <SelectItem key={id} value={id} className="tabular-nums">
              #{id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
