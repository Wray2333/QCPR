import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * 原生 <select>，外观对齐 shadcn 控件（appearance-none + chevron 覆盖）。
 * 关键：保留原生 select，iOS Safari 会渲染为原生底部滚轮选择器，
 * 移动端录入用时/错题数更顺手。
 */
const NativeSelect = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        'flex h-11 w-full cursor-pointer appearance-none items-center rounded-md border border-input bg-background pl-3 pr-9 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-70"
      aria-hidden
    />
  </div>
));
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
