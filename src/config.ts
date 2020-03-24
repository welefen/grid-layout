import { Node } from './node';

type SelfAlignment = 'stretch' | 'center' | 'start' | 'end' | 'auto';
type ContentAlignment = 'stretch' | 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';


export type StringOrNumber = string | number;

export interface ContainerConfig {
  gridAutoFlow?: string | GridAutoFlow;
  gridAutoColumns?: string | TrackList;
  gridAutoRows?: string | TrackList;
  gridColumnGap?: StringOrNumber;
  gridRowGap?: StringOrNumber;
  gridTemplateAreas?: string | string[][];
  gridTemplateRows?: string | TrackList;
  gridTemplateColumns?: string | TrackList;
  width: number;
  height: number;
  alignItems?: SelfAlignment;
  justifyItems?: SelfAlignment;
  alignContent?: ContentAlignment;
  justifyContent?: ContentAlignment;
}

export interface NodeConfig {
  gridArea?: string;
  gridColumnEnd?: StringOrNumber | GridLine;
  gridColumnStart?: StringOrNumber | GridLine;
  gridRowEnd?: StringOrNumber | GridLine;
  gridRowStart?: StringOrNumber | GridLine;
  alignSelf?: SelfAlignment;
  justifySelf?: SelfAlignment;
  paddingTop?: StringOrNumber;
  paddingRight?: StringOrNumber;
  paddingBottom?: StringOrNumber;
  paddingLeft?: StringOrNumber;
  padding?: any;
  marginTop?: StringOrNumber;
  marginRight?: StringOrNumber;
  marginBottom?: StringOrNumber;
  marginLeft?: StringOrNumber;
  margin?: StringOrNumber;
  borderTop?: StringOrNumber;
  borderRight?: StringOrNumber;
  borderBottom?: StringOrNumber;
  borderLeft?: StringOrNumber;
  border?: any;
  width?: StringOrNumber;
  height?: StringOrNumber;
  boxSizing?: string;
  order?: number;
  minWidth?: StringOrNumber;
  maxWidth?: StringOrNumber;
  minHeight?: StringOrNumber;
  maxHeight?: StringOrNumber;
  minContentWidth?: number;
  minContentHeight?: number;
  maxContentWidth?: number;
  maxContentHeight?: number;
}
export type BorderProperty = 'border' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft';
export type PaddingProperty= 'padding' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft';
export type MarginProperty = 'margin' | 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft';
export type BorderPaddingMarginProperty = BorderProperty | PaddingProperty | MarginProperty;

export type TrackType = 'row' | 'column';

export interface TrackItem {
  type: string; // auto/%/fr/min-content/max-content/fit-content/minmax/repeat/
  value?: number;
  args?: Array<number | string | TrackItem | TrackList>;
  baseSize?: number;
  growthLimit?: number;
  lineNamesStart?: string[];
  lineNamesEnd?: string[];
  repeat?: string; // expand from auto-fill repeat or auto-fit repeat
  pos?: number; // track position
}

export type TrackList = TrackItem[];

// grid cell
export interface GridCell {
  row: number; // row index in cell
  column: number; // column index in cell
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  name?: string; // cell name
  node?: Node[]; // nodes in grid
}

export interface nodePos {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
}

export interface layout extends nodePos {
  children?: nodePos[]
}

export interface position {
  row: number;
  column: number;
}

export type GridLineProperty = 'gridRowStart' | 'gridRowEnd' | 'gridColumnStart' | 'gridColumnEnd';

export type TrackSizeProperty = 'gridTemplateRows' | 'gridTemplateColumns' | 'gridAutoRows' | 'gridAutoColumns';

/**
 * grid line define for grid-column-start/end, grid-row-start/end
 */
export interface GridLine {
  span?: boolean;
  customIndent?: string;
  integer?: number;
}

/**
 * grid-auto-grow
 */
export interface GridAutoFlow {
  row?: boolean;
  column?: boolean;
  dense?: boolean
}

/**
 * parsed grid position
 */
export interface GridPlacement {
  row: { start: number, end: number };
  column: { start: number, end: number }
}