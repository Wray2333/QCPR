import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

/**
 * 可折叠字段（基于 shadcn/Radix Collapsible）：默认只显示标签 + 当前值摘要，
 * 点击标题行展开内部内容（如拨轮）。
 * @param {string} label 字段标签
 * @param {string} summary 折叠态显示的当前值摘要
 * @param {boolean} [defaultOpen=false] 初始是否展开
 * @param {import('react').ReactNode} children 展开后的内容
 */
export default function CollapsibleField({
  label,
  summary,
  defaultOpen = false,
  children,
}) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="rounded-xl border border-border bg-card"
    >
      <CollapsibleTrigger className="group flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-2 px-3.5 py-2.5 text-left">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="flex items-center gap-1.5">
          <span className="text-base font-semibold tabular-nums text-foreground">
            {summary}
          </span>
          <ChevronDown
            size={18}
            strokeWidth={2}
            className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="border-t border-border p-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
