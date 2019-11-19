type stringOrNumber = string | number;
type itemString = 'stretch' | 'center' | 'start' | 'end' | 'baseline';

export interface containerConfig {
  gridAutoColumns?: string;
  gridAutoFlow?: string;
  gridAutoRows?: string;
  gridColumnGap?: stringOrNumber;
  gridRowGap?: stringOrNumber;
  gridTemplateAreas?: string[][];
  gridTemplateRows?: string | object;
  gridTemplateColumns?: string | object;
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
  gridColumnEnd?: stringOrNumber;
  gridColumnStart?: stringOrNumber;
  gridRowEnd?: stringOrNumber;
  gridRowStart?: stringOrNumber;
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
}
export type borderType = 'border' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft';
export type paddingType = 'padding' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft';
export type marginType = 'margin' | 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft';
export type combineType = borderType | paddingType | marginType;

export type gridConfig = containerConfig | nodeConfig;