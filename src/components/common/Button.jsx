const VARIANTS = {
  primary:
    'bg-brand text-on-brand hover:opacity-90 disabled:opacity-40 shadow-sm',
  secondary:
    'bg-surface text-ink border border-line hover:bg-surface-2 disabled:opacity-40',
  danger: 'bg-danger text-on-brand hover:opacity-90 disabled:opacity-40',
  ghost: 'bg-transparent text-ink-2 hover:bg-surface-2 disabled:opacity-40',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-sm min-h-[44px]',
  lg: 'px-6 py-3.5 text-base min-h-[52px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
