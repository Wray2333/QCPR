import { Link } from 'react-router-dom';
import Button from './Button.jsx';

/**
 * 空数据引导。
 * @param {import('react').ComponentType} icon lucide 图标组件
 * @param {string} title 主文案
 * @param {string} [description] 补充说明
 * @param {string} [actionTo] 引导按钮跳转路径
 * @param {string} [actionLabel] 引导按钮文案
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionTo,
  actionLabel,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Icon size={28} strokeWidth={1.5} aria-hidden />
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {actionTo && actionLabel && (
        <Link to={actionTo} className="mt-5">
          <Button size="lg">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
