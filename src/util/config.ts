import { Node } from '../node';

type SelfAlignment = 'stretch' | 'center' | 'start' | 'end' | 'auto';
type ContentAlignment = 'stretch' | 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';

export type GridLineProperty = 'gridRowStart' | 'gridRowEnd' | 'gridColumnStart' | 'gridColumnEnd';
export type TrackSizeProperty = 'gridTemplateRows' | 'gridTemplateColumns' | 'gridAutoRows' | 'gridAutoColumns';
export type StringOrNumber = string | number;
export type BorderProperty = 'border' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft';
export type PaddingProperty = 'padding' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft';
export type MarginProperty = 'margin' | 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft';
export type BorderPaddingMarginProperty = BorderProperty | PaddingProperty | MarginProperty;
export type TrackType = 'row' | 'column';
export type TrackList = TrackItem[];
export type AlignmentProperty = 'justifyContent' | 'alignContent' | 'alignItems' | 'justifyItems';


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
  minContentWidth?: StringOrNumber;
  minContentHeight?: StringOrNumber;
  maxContentWidth?: StringOrNumber;
  maxContentHeight?: StringOrNumber;
}

export interface TrackItem {
  type: string; // px/%/auto/fr/min-content/max-content/fit-content/minmax/repeat
  value?: number;
  args?: Array<number | string | TrackItem | TrackList>;
  baseSize?: number;
  growthLimit?: number;
  lineNamesStart?: string[];
  lineNamesEnd?: string[];
  autoFit?: boolean; // expand from auto-fit
  pos?: number; // track position
}



export interface BoundingRect {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
}

// grid cell
export interface GridCell extends BoundingRect {
  row: number; // row index in cell
  column: number; // column index in cell
  name?: string; // cell name
  node: Node[]; // nodes in grid
}

/**
 * grid line define for grid-column-start/end, grid-row-start/end
 */
export interface GridLine {
  span?: boolean;
  customIdent?: string;
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
  row: { start: number, end: number, size: number };
  column: { start: number, end: number, size: number }
}

export interface ContainerBoundingRect extends BoundingRect {
  children?: BoundingRect[]
}

interface Position {
  row: number;
  column: number;
}

export interface AreaNames {
  [key: string]: Position[];
}