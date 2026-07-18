import { Card as UiCard } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// 兼容层：旧调用 <Card className>children</Card>，内部用 shadcn Card + 默认内边距。
export default function Card({ className, children, ...props }) {
  return (
    <UiCard className={cn('p-4', className)} {...props}>
      {children}
    </UiCard>
  );
}
