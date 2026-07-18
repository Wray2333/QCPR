import { Button as UiButton } from '@/components/ui/button';

// 兼容层：把旧 API（variant primary/danger、size md）映射到 shadcn Button。
// 内部完全渲染 shadcn 组件。
const VARIANT_MAP = {
  primary: 'default',
  secondary: 'secondary',
  danger: 'destructive',
  ghost: 'ghost',
  outline: 'outline',
};
const SIZE_MAP = { sm: 'sm', md: 'default', lg: 'lg', icon: 'icon' };

export default function Button({ variant = 'primary', size = 'md', ...props }) {
  return (
    <UiButton
      variant={VARIANT_MAP[variant] ?? variant}
      size={SIZE_MAP[size] ?? size}
      {...props}
    />
  );
}
