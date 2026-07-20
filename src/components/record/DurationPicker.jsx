import { Input } from '@/components/ui/input';

const pad2 = (v) => String(v).padStart(2, '0');

/**
 * 用时选择器：复用原生 `<input type="time">`（与"练习时间"同款控件）。
 * 把时间控件的"时:分"两个滚轮映射为用时的"分:秒"——点一下弹出单个原生选择器，
 * 分、秒在同一弹窗里分开选。iOS 上渲染为系统原生滚轮。
 * 分钟上限 59（time 控件小时槽 0–59 不适用，实际按 0–59 分钟；速算用时远小于此）。
 * @param {number} valueSec 当前总秒数
 * @param {(totalSec:number)=>void} onChange
 */
export default function DurationPicker({ valueSec, onChange }) {
  const minutes = Math.floor(valueSec / 60);
  const seconds = valueSec % 60;
  // type=time 小时槽为 0–23，速算用时（≤ 6 分钟 + 超时）远在范围内
  const value = `${pad2(minutes)}:${pad2(seconds)}`;

  const handleChange = (e) => {
    const v = e.target.value; // "MM:SS" 或 ""
    if (!v) return onChange(0);
    const [m, s] = v.split(':').map((x) => Number(x) || 0);
    onChange(m * 60 + s);
  };

  return (
    <Input
      type="time"
      value={value}
      onChange={handleChange}
      aria-label="用时（分:秒）"
      className="w-28 tabular-nums"
    />
  );
}
