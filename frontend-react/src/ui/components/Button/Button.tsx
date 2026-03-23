import { forwardRef } from 'react';
import { getButtonClasses } from './button.styles';
import type { ButtonProps } from './button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', fullWidth = false, className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={getButtonClasses({ variant, size, fullWidth, className })}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
