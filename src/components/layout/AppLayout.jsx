import { Link } from 'react-router-dom';
import { BottomTabBar, TopNav } from './NavBar.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function AppLayout({ children }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-background/90 py-3 backdrop-blur">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-primary">QCPR</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">速算练习记录</span>
        </Link>
        <div className="flex items-center gap-1">
          <TopNav />
          <ThemeToggle />
        </div>
      </header>

      {/* 底部留出 TabBar + safe-area 空间，避免内容被遮挡 */}
      <main className="flex-1 py-2 pb-28 md:pb-10">{children}</main>

      <footer className="hidden py-4 text-center text-xs text-muted-foreground md:block">
        QCPR · 数据仅保存在本地浏览器
      </footer>

      <BottomTabBar />
    </div>
  );
}
