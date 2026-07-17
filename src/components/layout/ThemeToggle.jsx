import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.jsx';

/** 深浅色切换按钮（44pt 触控目标） */
export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-ink-2 transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
    >
      {isDark ? (
        <Sun size={20} strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon size={20} strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
