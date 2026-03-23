import type { ButtonSize, ButtonVariant } from './button.types';

const base = 'ui-button';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'ui-button--sm',
  md: 'ui-button--md',
  lg: 'ui-button--lg',
  icon: 'ui-button--icon',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'ui-button--primary',
  secondary: 'ui-button--secondary',
  ghost: 'ui-button--ghost',
  outline: 'ui-button--outline',
};

export const getButtonClasses = ({
  variant,
  size,
  fullWidth,
  className,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) =>
  [base, sizeClasses[size], variantClasses[variant], fullWidth ? 'ui-button--full' : '', className]
    .filter(Boolean)
    .join(' ');