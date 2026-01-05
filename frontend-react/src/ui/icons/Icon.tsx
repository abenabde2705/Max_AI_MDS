import { iconMap } from './icon.map';
import type { IconProps } from './icon.types';

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
};



export const Icon = ({
  name,
  size = 'md',
  color = 'currentColor',
  className,
}: IconProps) => {
  const svgUrl = iconMap[name];

  return (
    <img
      src={svgUrl}
      width={sizeMap[size]}
      height={sizeMap[size]}
      style={{ filter: color !== 'currentColor' ? `invert(1) brightness(${color === '#d4ff00' ? 1.2 : 0.8})` : undefined }}
      className={className}
      alt={name}
      aria-hidden
    />
  );
};
