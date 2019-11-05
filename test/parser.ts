import test from 'ava';
import {GridLineParser} from '../src/parse';
import {
  GridLineLength,
  GridLineFlex,
  GridLineAuto,
  GridLineMinMax,
  GridLineMinContent
} from '../src/gridLines';

test('100px', t => {
  const instance = new GridLineParser('100px');
  const result = instance.parse();
  t.is(result.lines.length, 1);
  t.is(result.lines[0] instanceof GridLineLength, true)
  t.is(result.lines[0].value, 100)
});

test('[linename1] 100px', t => {
  const instance = new GridLineParser('[linename1] 100px');
  const result = instance.parse();
  t.is(result.lines.length, 1);
  t.is(result.lines[0] instanceof GridLineLength, true)
  t.is(result.lines[0].value, 100)
  t.is(result.lines[0].lineNames[0], 'linename1')
});

test('[linename1] 100px [lineend]', t => {
  const instance = new GridLineParser('[linename1] 100px [lineend]');
  const result = instance.parse();
  t.is(result.lines.length, 1);
  t.is(result.lines[0] instanceof GridLineLength, true)
  t.is(result.lines[0].value, 100)
  t.is(result.lines[0].lineNames[0], 'linename1')
  t.deepEqual(result.lineNames, ['lineend'])
});

test('[linename1 linename2] 100px', t => {
  const instance = new GridLineParser('[linename1 linename2] 100px');
  const result = instance.parse();
  t.is(result.lines.length, 1);
  t.is(result.lines[0] instanceof GridLineLength, true)
  t.is(result.lines[0].value, 100)
  t.deepEqual(result.lines[0].lineNames, ['linename1', 'linename2'])
});

test('1fr', t => {
  const instance = new GridLineParser('1fr');
  const result = instance.parse();
  t.is(result.lines.length, 1);
  t.is(result.lines[0] instanceof GridLineFlex, true)
  t.is(result.lines[0].value, 1)
});

test('auto 1fr', t => {
  const instance = new GridLineParser('auto 1fr');
  const result = instance.parse();
  t.is(result.lines.length, 2);
  t.is(result.lines[0] instanceof GridLineAuto, true)
});

test('150px [item1-start] 1fr [item1-end]', t => {
  const instance = new GridLineParser('150px [item1-start] 1fr [item1-end]');
  const result = instance.parse();
  t.is(result.lines.length, 2);
  t.deepEqual(result.lineNames, ['item1-end'])
  t.is(result.lines[0] instanceof GridLineLength, true)
  t.deepEqual(result.lines[1].lineNames, ['item1-start']);
});

test('1fr minmax(min-content, 1fr)', t => {
  const instance = new GridLineParser('1fr minmax(min-content, 1fr)');
  const result = instance.parse();
  t.is(result.lines.length, 2);
  t.is(result.lines[1] instanceof GridLineMinMax, true)
  t.is(result.lines[1].min instanceof GridLineMinContent, true);
  t.is(result.lines[1].max instanceof GridLineFlex, true)
});