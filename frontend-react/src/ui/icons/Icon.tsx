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
  color: _color = 'currentColor',
  className,
}: IconProps) => {
  const svgUrl = iconMap[name];

  return (
    <img
      src={svgUrl}
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={className}
      alt={name}
      aria-hidden
    />
  );
};
