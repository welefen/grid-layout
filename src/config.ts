export type stringOrNumber = string | number;
type itemString = 'stretch' | 'center' | 'start' | 'end' | 'baseline';
import { Node } from './node';

export interface containerConfig {
  gridAutoFlow?: string | autoFlow;
  gridAutoColumns?: string | trackList;
  gridAutoRows?: string | trackList;
  gridColumnGap?: stringOrNumber;
  gridRowGap?: stringOrNumber;
  gridTemplateAreas?: string | string[][];
  gridTemplateRows?: string | trackList;
  gridTemplateColumns?: string | trackList;
  width: number;
  height: number;
  alignItems?: itemString;
  justifyItems?: itemString;
  alignContent?: itemString;
  justifyContent?: itemString;
  direction?: string;
  writingMode?: string;
}

export interface nodeConfig {
  gridArea?: string;
  gridColumnEnd?: stringOrNumber | gridLine;
  gridColumnStart?: stringOrNumber | gridLine;
  gridRowEnd?: stringOrNumber | gridLine;
  gridRowStart?: stringOrNumber | gridLine;
  alignSelf?: itemString;
  justifySelf?: itemString;
  paddingTop?: stringOrNumber;
  paddingRight?: stringOrNumber;
  paddingBottom?: stringOrNumber;
  paddingLeft?: stringOrNumber;
  padding?: any;
  marginTop?: stringOrNumber;
  marginRight?: stringOrNumber;
  marginBottom?: stringOrNumber;
  marginLeft?: stringOrNumber;
  margin?: stringOrNumber;
  borderTop?: stringOrNumber;
  borderRight?: stringOrNumber;
  borderBottom?: stringOrNumber;
  borderLeft?: stringOrNumber;
  border?: any;
  width?: stringOrNumber;
  height?: stringOrNumber;
  boxSizing?: string;
  order?: number;
  minWidth?: stringOrNumber;
  maxWidth?: stringOrNumber;
  minHeight?: stringOrNumber;
  maxHeight?: stringOrNumber;
  minContentWidth?: number;
  minContentHeight?: number;
  maxContentWidth?: number;
  maxContentHeight?: number;
}
export type borderType = 'border' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft';
export type paddingType = 'padding' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft';
export type marginType = 'margin' | 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft';
export type combineType = borderType | paddingType | marginType;

export type gridConfig = containerConfig | nodeConfig;
export type trackType = 'row' | 'column';

export interface trackItem {
  type: string; // auto/%/fr/min-content/max-content/fit-content/minmax/repeat/
  value?: number;
  args?: Array<number | string | trackItem | trackList>;
  baseSize?: number;
  growthLimit?: number;
  lineNamesStart?: string[];
  lineNamesEnd?: string[];
  repeat?: string; // expand from auto-fill repeat or auto-fit repeat
}

export type trackList = trackItem[];

// grid ceil
export interface ceil {
  row: number; // row index in ceil
  column: number; // column index in ceil
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  name?: string; // ceil name
  node?: Node[]; // nodes in grid
}

export interface position {
  row: number;
  column: number;
}

export type gridLineType = 'gridRowStart' | 'gridRowEnd' | 'gridColumnStart' | 'gridColumnEnd';

export type trackListType = 'gridTemplateRows' | 'gridTemplateColumns' | 'gridAutoRows' | 'gridAutoColumns';

/**
 * grid line define for grid-column-start/end, grid-row-start/end
 */
export interface gridLine {
  span?: boolean;
  customIndent?: string;
  integer?: number;
}

/**
 * grid-auto-grow
 */
export interface autoFlow {
  row?: boolean;
  column?: boolean;
  dense?: boolean
}

export interface placement {
  row: {start: number, end: number};
  column: {start: number, end: number}
}