export type IconName =
  | 'add'
  | 'arrow'
  | 'back'
  | 'close'
  | 'historic'
  | 'send';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
  className?: string;
}
