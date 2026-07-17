import { NavLink } from 'react-router-dom';
import { ChartLine, Timer } from 'lucide-react';

const ITEMS = [
  { to: '/', label: '分析', icon: ChartLine, end: true },
  { to: '/record', label: '记录', icon: Timer, end: false },
];

/** 移动端底部 Tab Bar（md 以下显示）——图标+文字、44pt+ 触控、safe-area */
export function BottomTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-safe-b backdrop-blur md:hidden"
      aria-label="主导航"
    >
      <div className="mx-auto flex h-16 max-w-md">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-200 ${
                isActive ? 'text-brand' : 'text-ink-3 hover:text-ink-2'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

/** 桌面端顶部导航链接（md 及以上显示） */
export function TopNav() {
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              isActive
                ? 'bg-brand/10 text-brand'
                : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`
          }
        >
          <Icon size={16} strokeWidth={2} aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
