/**
 * Line icons ported from the Claude Design handoff (24×24, stroke style).
 * Built on react-native-svg so they render identically on iOS / Android / web.
 */

import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
});

const strokeProps = (color: string, strokeWidth: number) => ({
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

/** 책장 — stacked books. */
export function BookshelfIcon({ size = 23, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M4 5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v15H4zM10 8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v12h-5zM16.5 6.3l2.4-.6a1 1 0 0 1 1.2.7l2.6 11"
        {...strokeProps(color, strokeWidth)}
      />
    </Svg>
  );
}

/** 통계 — bar chart. */
export function BarChartIcon({ size = 23, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Line x1="6" y1="20" x2="6" y2="12" {...strokeProps(color, strokeWidth)} />
      <Line x1="12" y1="20" x2="12" y2="6" {...strokeProps(color, strokeWidth)} />
      <Line x1="18" y1="20" x2="18" y2="14" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

/** Bars sitting on a baseline (stats empty-state illustration). */
export function BarChartBaseIcon({ size = 52, color = '#000', strokeWidth = 1.6 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Line x1="6" y1="20" x2="6" y2="14" {...strokeProps(color, strokeWidth)} />
      <Line x1="12" y1="20" x2="12" y2="10" {...strokeProps(color, strokeWidth)} />
      <Line x1="18" y1="20" x2="18" y2="16" {...strokeProps(color, strokeWidth)} />
      <Line x1="3" y1="20" x2="21" y2="20" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

/** 설정 — gear. */
export function SettingsIcon({ size = 23, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx="12" cy="12" r="3" {...strokeProps(color, strokeWidth)} />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        {...strokeProps(color, strokeWidth)}
      />
    </Svg>
  );
}

export function PlusIcon({ size = 26, color = '#fff', strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Line x1="12" y1="5" x2="12" y2="19" {...strokeProps(color, strokeWidth)} />
      <Line x1="5" y1="12" x2="19" y2="12" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function SearchIcon({ size = 20, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx="11" cy="11" r="7" {...strokeProps(color, strokeWidth)} />
      <Line x1="21" y1="21" x2="16.5" y2="16.5" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 14, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Polyline points="6 9 12 15 18 9" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 18, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Polyline points="9 18 15 12 9 6" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

/** Open book — empty-state illustration. */
export function OpenBookIcon({ size = 56, color = '#000', strokeWidth = 1.6 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5M12 6.5C13.5 5 16 4.5 20 5v13c-4-.5-6.5 0-8 1.5M12 6.5v13"
        {...strokeProps(color, strokeWidth)}
      />
    </Svg>
  );
}
