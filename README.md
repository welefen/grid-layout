# grid-layout


<a href="http://badge.fury.io/js/@welefen/grid-layout">
  <img src="https://img.shields.io/npm/v/@welefen/grid-layout.svg?style=flat-square" alt="NPM version" />
</a>

grid-layout is a layout engine which implements grid, can use in canvas/node-canvas.

it's support most of features from https://www.w3.org/TR/css-grid-1/#overview-grid except `direction/writing-mode` styles.

## install

```
npm i @welefen/grid-layout
```

## How to use

```js
import { Container, Node } from '@welefen/grid-layout';
const container = new Container(containerOptions);
nodes.forEach(nodeOptions => {
  const node = new Node(nodeOptions);
  container.appendChild(node);
})
container.calculateLayout();
const result = container.getAllComputedLayout();
// result is
/**
 * {
 *  top: 0
    left: 0
    width: 500
    height: 500,
    children: [{
      top: 0,
      left: 0,
      width: 100,
      height: 100
    }, ...]
 * }
 * /
```

### containerOptions


```js
{
  gridAutoFlow?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;
  gridColumnGap?: StringOrNumber;
  gridRowGap?: StringOrNumber;
  gridTemplateAreas?: string | string[][];
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
  width: number;
  height: number;
  alignItems?: SelfAlignment;
  justifyItems?: SelfAlignment;
  alignContent?: ContentAlignment;
  justifyContent?: ContentAlignment;
}
```
```js
type SelfAlignment = 'stretch' | 'center' | 'start' | 'end' | 'auto';
type ContentAlignment = 'stretch' | 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
type StringOrNumber = string | number;

```
### nodeOptions

```js
{
  gridArea?: string;
  gridColumnEnd?: StringOrNumber;
  gridColumnStart?: StringOrNumber;
  gridRowEnd?: StringOrNumber;
  gridRowStart?: StringOrNumber;
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
```
## Playground

```sh
git clone git@github.com:welefen/grid-layout.git;
npm i;
npm run build;
cd web;
npm i;
npm start;
# then visit http://127.0.0.1:8360/
```