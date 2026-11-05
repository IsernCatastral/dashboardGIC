export const PROCEDURE_TYPE_COLORS = [
  '#2563EB',
  '#FDE68A',
  '#9333EA',
  '#86EFAC',
  '#F97316',
  '#A5F3FC',
  '#D946EF',
  '#D9F99D',
  '#92400E',
  '#FBCFE8',
  '#16A34A',
  '#93C5FD',
  '#F59E0B',
  '#D8B4FE',
  '#06B6D4',
  '#FDBA74',
  '#84CC16',
  '#0D9488',
  '#D2B48C',
  '#EC4899',
  '#64748B',
];

export const STATE_COLORS = [
  '#2563EB',
  '#F97316',
  '#9333EA',
  '#5EEAD4',
  '#EC4899',
  '#92400E',
  '#7DD3FC',
  '#0F766E',
  '#FDBA74',
  '#475569',
  '#C4B5FD',
];

export const colorFromPalette = (palette: string[], index: number): string =>
  palette[index % palette.length];
