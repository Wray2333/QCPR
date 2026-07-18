import { useEffect, useMemo, useRef, useState } from 'react';

const ITEM_H = 40; // 每项高度(px)
const PAD = ITEM_H * 2; // 上下留白，使首/末项也能居中

/**
 * iOS 风格竖向拨轮选择器（原生 scroll-snap，触摸/滚轮/键盘均可）。
 * 当前值吸附居中并高亮；点击中央数值可切换为手动输入。
 *
 * @param {number} value 当前值
 * @param {(v:number)=>void} onChange
 * @param {number} min
 * @param {number} max
 * @param {number} [step=1]
 * @param {(v:number)=>string} [formatLabel] 项显示格式
 * @param {string} [ariaLabel]
 * @param {boolean} [allowInput=false] 是否允许点击数值切换为手动输入
 */
export default function WheelPicker({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatLabel = (v) => String(v),
  ariaLabel,
  allowInput = false,
}) {
  const items = useMemo(() => {
    const arr = [];
    for (let v = min; v <= max; v += step) arr.push(v);
    return arr;
  }, [min, max, step]);

  const index = Math.max(0, Math.min(items.length - 1, Math.round((value - min) / step)));

  const scrollRef = useRef(null);
  const settleTimer = useRef(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  // 外部 value 变化时同步滚动位置（用户滚动产生的变化不会二次触发，因位置已一致）
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || editing) return;
    const target = index * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 1) el.scrollTop = target;
  }, [index, editing]);

  const handleScroll = () => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)));
      const v = min + i * step;
      if (v !== value) onChange(v);
    }, 120);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.min(max, value + step));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.max(min, value - step));
    }
  };

  const openInput = () => {
    if (!allowInput) return;
    setDraft(String(value));
    setEditing(true);
  };

  const commitInput = () => {
    const n = Math.max(min, Math.min(max, Math.floor(Number(draft) || 0)));
    onChange(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        type="number"
        inputMode="numeric"
        autoFocus
        min={min}
        max={max}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitInput}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitInput();
          if (e.key === 'Escape') setEditing(false);
        }}
        // 编辑态用主色边框+浅底提示正在输入
        className="h-[200px] w-full rounded-xl border-2 border-primary bg-primary/5 px-3 text-center text-2xl font-semibold tabular-nums text-primary focus:outline-none"
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <div className="relative">
      {/* 中央高亮带（可点击进入编辑） */}
      <button
        type="button"
        onClick={openInput}
        tabIndex={-1}
        aria-hidden
        className={`pointer-events-${
          allowInput ? 'auto' : 'none'
        } absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-primary/10 ring-1 ring-ring/30 ${
          allowInput ? 'cursor-text' : ''
        }`}
        style={{ height: ITEM_H }}
      />
      <div
        ref={scrollRef}
        role="spinbutton"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={formatLabel(value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="hide-scrollbar snap-y snap-mandatory overflow-y-scroll overscroll-contain focus:outline-none"
        style={{
          height: ITEM_H * 5,
          scrollPaddingTop: PAD,
          // 上下渐隐，聚焦中央
          maskImage:
            'linear-gradient(to bottom, transparent, #000 32%, #000 68%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, #000 32%, #000 68%, transparent)',
        }}
      >
        <div style={{ paddingTop: PAD, paddingBottom: PAD }}>
          {items.map((v) => (
            <div
              key={v}
              className={`flex snap-center items-center justify-center tabular-nums ${
                v === value
                  ? 'text-xl font-semibold text-foreground'
                  : 'text-base text-muted-foreground'
              }`}
              style={{ height: ITEM_H }}
            >
              {formatLabel(v)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
