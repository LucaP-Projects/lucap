export interface ColorInfo {
  light: string;
  main: string;
}

export type ColorName =
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose';
export type ColorPalette = {
  [K in ColorName]: ColorInfo;
};
