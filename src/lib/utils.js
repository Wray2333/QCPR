import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn 标准类名合并：clsx 组合 + tailwind-merge 去冲突 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
