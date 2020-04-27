# grid-layout


<div>
  <a href="http://badge.fury.io/js/@welefen/grid-layout">
    <img src="https://img.shields.io/npm/v/@welefen/grid-layout.svg?style=flat-square" alt="NPM version" />
  </a>
  <a href="https://travis-ci.org/welefen/grid-layout">
    <img src="https://img.shields.io/travis/welefen/grid-layout.svg?style=flat-square" alt="travis-ci" />
  </a>
  <a href='https://coveralls.io/github/welefen/grid-layout?branch=master'><img src='https://coveralls.io/repos/github/welefen/grid-layout/badge.svg?branch=master' alt='Coverage Status' /></a>

  <!-- <a href="https://www.npmjs.com/package/@welefen/grid-layout">
    <img src="https://img.shields.io/npm/dm/@welefen/grid-layout.svg?style=flat-square" /> -->
  </a>
</div>


grid-layout is a layout engine which implements grid, can use in canvas/node-canvas.

it's support most of features from https://www.w3.org/TR/css-grid-1/ except `direction/writing-mode` styles.

## Install

```
npm i @welefen/grid-layout
```

## Usage

```html
<script src="https://unpkg.com/@welefen/grid-layout/dist/gridLayout.js"></script>
<script>
const { Container, Node } = GridLayout;
</script>
```

```js
import { Container, Node } from '@welefen/grid-layout';
const container = new Container({ // containerOptions
  width: 500,
  height: 500
});
[
  { width: 100, height: 100 },
  { width: 100, height: 100 }
].forEach(item => {
  const node = new Node(item); // nodeOptions
  container.appendChild(node);
});
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

### gridTemplateAreas config

```
// string
{
  gridTemplateAreas: `"a b c"
                      "d e f"`
}

// array
{
  gridTemplateAreas: [['a', 'b', 'c'],
                      ['d', 'e', 'f']]
}
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
# then visit http://127.0.0.1:8080/
```

online playground: https://welefen.com/lab/gridLayout/