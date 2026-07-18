import WheelPicker from '../common/WheelPicker.jsx';

/**
 * 用时选择器：分（0–59）+ 秒（0–59）双拨轮，对外以总秒数交互。
 * @param {number} valueSec 当前总秒数
 * @param {(updater:(prevSec:number)=>number)|(totalSec:number)=>void} onChange
 *        建议传入支持函数式更新的 setter（如 useState 的 setter），
 *        以避免分、秒拨轮相近时刻回调时相互覆盖。
 */
export default function DurationPicker({ valueSec, onChange }) {
  const minutes = Math.floor(valueSec / 60);
  const seconds = valueSec % 60;

  // 用函数式更新读取最新值，避免分/秒两个拨轮基于同一快照相互覆盖
  const setMinutes = (m) => onChange((prev) => m * 60 + (prev % 60));
  const setSeconds = (s) => onChange((prev) => Math.floor(prev / 60) * 60 + s);

  const pad2 = (v) => String(v).padStart(2, '0');

  return (
    <div className="flex items-stretch justify-center gap-3 rounded-xl border border-border bg-card p-2">
      <div className="flex-1">
        <div className="mb-1 text-center text-xs text-muted-foreground">分</div>
        <WheelPicker
          value={minutes}
          onChange={setMinutes}
          min={0}
          max={59}
          formatLabel={pad2}
          ariaLabel="用时（分钟）"
          allowInput
        />
      </div>
      <div className="flex items-center pt-5 text-xl font-semibold text-muted-foreground">:</div>
      <div className="flex-1">
        <div className="mb-1 text-center text-xs text-muted-foreground">秒</div>
        <WheelPicker
          value={seconds}
          onChange={setSeconds}
          min={0}
          max={59}
          formatLabel={pad2}
          ariaLabel="用时（秒）"
          allowInput
        />
      </div>
    </div>
  );
}
