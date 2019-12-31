import test from 'ava';
import { TrackTokenizer } from '../../src/tokenizer/track';

test('100px', t => {
  const instance = new TrackTokenizer('100px');
  const result = instance.getTokens();
  t.deepEqual(result, ['100px'])
});

test('1fr', t => {
  const instance = new TrackTokenizer('1fr');
  const result = instance.getTokens();
  t.deepEqual(result, ['1fr'])
});

test('[linename1]', t => {
  const instance = new TrackTokenizer('[linename1]');
  const result = instance.getTokens();
  t.deepEqual(result, ['[', 'linename1', ']'])
});

test('[linename1 linename2]', t => {
  const instance = new TrackTokenizer('[linename1 linename2]');
  const result = instance.getTokens();
  t.deepEqual(result, ['[', 'linename1', 'linename2', ']'])
});

test('150px [item1-start] 1fr [item1-end]', t => {
  const instance = new TrackTokenizer('150px [item1-start] 1fr [item1-end]');
  const result = instance.getTokens();
  t.deepEqual(result, ['150px', '[', 'item1-start', ']', '1fr', '[', 'item1-end', ']'])
});

test('repeat(4, 10px [col-start] 250px [col-end]) 10px', t => {
  const instance = new TrackTokenizer('repeat(4, 10px [col-start] 250px [col-end]) 10px');
  const result = instance.getTokens();
  t.deepEqual(result, ['repeat', '(', '4', ',', '10px', '[', 'col-start', ']', '250px', '[', 'col-end', ']', ')', '10px'])
});

test('1fr minmax(min-content, 1fr)', t => {
  const instance = new TrackTokenizer('1fr minmax(min-content, 1fr)');
  const result = instance.getTokens();
  t.deepEqual(result, ['1fr', 'minmax', '(', 'min-content', ',', '1fr', ')'])
});

test('10px repeat(2, 1fr auto minmax(30%, 1fr))', t => {
  const instance = new TrackTokenizer('10px repeat(2, 1fr auto minmax(30%, 1fr))');
  const result = instance.getTokens();
  t.deepEqual(result, ['10px', 'repeat', '(', '2', ',', '1fr', 'auto', 'minmax', '(', '30%', ',', '1fr', ')', ')'])
});