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

export function ChevronLeftIcon({ size = 24, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Polyline points="15 18 9 12 15 6" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function CloseIcon({ size = 24, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Line x1="18" y1="6" x2="6" y2="18" {...strokeProps(color, strokeWidth)} />
      <Line x1="6" y1="6" x2="18" y2="18" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function MoreVerticalIcon({ size = 22, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx="12" cy="5" r="1.6" {...strokeProps(color, strokeWidth)} />
      <Circle cx="12" cy="12" r="1.6" {...strokeProps(color, strokeWidth)} />
      <Circle cx="12" cy="19" r="1.6" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function CheckIcon({ size = 18, color = '#000', strokeWidth = 2.4 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Polyline points="20 6 9 17 4 12" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function CameraIcon({ size = 22, color = '#000', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        {...strokeProps(color, strokeWidth)}
      />
      <Circle cx="12" cy="13" r="4" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function ImageIcon({ size = 22, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...strokeProps(color, strokeWidth)} />
      <Circle cx="8.5" cy="8.5" r="1.5" {...strokeProps(color, strokeWidth)} />
      <Polyline points="21 15 16 10 5 21" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function PencilIcon({ size = 18, color = '#000', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function TrashIcon({ size = 16, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Polyline points="3 6 5 6 21 6" {...strokeProps(color, strokeWidth)} />
      <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" {...strokeProps(color, strokeWidth)} />
      <Line x1="10" y1="11" x2="10" y2="17" {...strokeProps(color, strokeWidth)} />
      <Line x1="14" y1="11" x2="14" y2="17" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

/** Speech-bubble quote glyph (empty-state for 구절). */
export function QuoteIcon({ size = 30, color = '#000', strokeWidth = 1.6 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M3 21l1.5-4.5a8 8 0 1 1 3 3z" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function ClockIcon({ size = 20, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx="12" cy="12" r="10" {...strokeProps(color, strokeWidth)} />
      <Polyline points="12 6 12 12 16 14" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function SortIcon({ size = 20, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Line x1="3" y1="7" x2="21" y2="7" {...strokeProps(color, strokeWidth)} />
      <Line x1="3" y1="12" x2="21" y2="12" {...strokeProps(color, strokeWidth)} />
      <Line x1="3" y1="17" x2="21" y2="17" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function SunIcon({ size = 20, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx="12" cy="12" r="5" {...strokeProps(color, strokeWidth)} />
      <Line x1="12" y1="1" x2="12" y2="3" {...strokeProps(color, strokeWidth)} />
      <Line x1="12" y1="21" x2="12" y2="23" {...strokeProps(color, strokeWidth)} />
      <Line x1="4.2" y1="4.2" x2="5.6" y2="5.6" {...strokeProps(color, strokeWidth)} />
      <Line x1="18.4" y1="18.4" x2="19.8" y2="19.8" {...strokeProps(color, strokeWidth)} />
      <Line x1="1" y1="12" x2="3" y2="12" {...strokeProps(color, strokeWidth)} />
      <Line x1="21" y1="12" x2="23" y2="12" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function CloudIcon({ size = 20, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function DownloadIcon({ size = 20, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" {...strokeProps(color, strokeWidth)} />
      <Polyline points="7 10 12 15 17 10" {...strokeProps(color, strokeWidth)} />
      <Line x1="12" y1="15" x2="12" y2="3" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}

export function LogOutIcon({ size = 18, color = '#000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...strokeProps(color, strokeWidth)} />
      <Polyline points="16 17 21 12 16 7" {...strokeProps(color, strokeWidth)} />
      <Line x1="21" y1="12" x2="9" y2="12" {...strokeProps(color, strokeWidth)} />
    </Svg>
  );
}
