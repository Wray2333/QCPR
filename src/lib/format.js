// 格式化与派生指标工具 —— 时间、百分比、语义色统一收敛于此。
import { getModule } from './modules.js';

/** 秒 → "m:ss"，如 90 → "1:30" */
export function formatDuration(sec) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

/** 正确率（0~1） */
export function accuracy(record) {
  if (!record.totalCount) return 0;
  return (record.totalCount - record.wrongCount) / record.totalCount;
}

/** 正确率 → 百分比字符串，如 0.85 → "85%" */
export function formatPercent(rate) {
  return `${Math.round(rate * 100)}%`;
}

/** 是否超时 */
export function isOvertime(record) {
  const m = getModule(record.moduleId);
  return m ? record.durationSec > m.limitSec : false;
}

/** ISO 时间戳 → "MM-DD"（图表轴用） */
export function formatShortDate(iso) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/** ISO 时间戳 → "YYYY-MM-DD HH:mm"（列表用） */
export function formatDateTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** ISO 时间戳 → "YYYY-MM-DD"（date input 用） */
export function toDateInputValue(iso) {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ISO 时间戳 → "HH:mm"（time input 用，缺省取当前时刻） */
export function toTimeInputValue(iso) {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO 时间戳 → "MM-DD HH:mm"（图表 tooltip 用，一天多次练习可区分） */
export function formatShortDateTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

/** 正确率语义色的 Tailwind 文本类（token 随主题自动切换深浅值） */
export function accuracyColorClass(rate) {
  if (rate >= 0.9) return 'text-success';
  if (rate >= 0.7) return 'text-warning';
  return 'text-danger';
}
