import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'qcpr:theme';
const ThemeContext = createContext(null);
const media = window.matchMedia('(prefers-color-scheme: dark)');

function getSaved() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {
    /* ignore */
  }
  return null; // 无保存值 = 跟随系统
}

export function ThemeProvider({ children }) {
  // saved 为空表示跟随系统；有值表示用户手动锁定
  const [saved, setSaved] = useState(getSaved);
  const [systemDark, setSystemDark] = useState(media.matches);

  const theme = saved ?? (systemDark ? 'dark' : 'light');

  // 未锁定时实时跟随系统深浅变化
  useEffect(() => {
    const onChange = (e) => setSystemDark(e.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // 点击切换 = 手动锁定为对应模式
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setSaved(next);
    try {
      localStorage.setItem(KEY, next);
    } catch (e) {
      /* ignore */
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme 必须在 <ThemeProvider> 内使用');
  return ctx;
}
