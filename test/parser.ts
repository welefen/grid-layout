import test from 'ava';
import {TrackListParser} from '../src/config/parser';
import { resolve } from 'dns';

test('100px', t => {
  const instance = new TrackListParser('100px');
  const result = instance.parse();
  t.deepEqual(result, { lines: [ { value: 100, unit: '', lineNames: [] } ], lineNames: [] });
});

test('[linename1] 100px', t => {
  const instance = new TrackListParser('[linename1] 100px');
  const result = instance.parse();
  t.deepEqual(result, {"lines":[{"value":100,"unit":"","lineNames":["linename1"]}],"lineNames":[]})
});

test('[linename1] 100px [lineend]', t => {
  const instance = new TrackListParser('[linename1] 100px [lineend]');
  const result = instance.parse();
  t.deepEqual(result, {"lines":[{"value":100,"unit":"","lineNames":["linename1"]}],"lineNames":["lineend"]});
});

test('[linename1 linename2] 100px', t => {
  const instance = new TrackListParser('[linename1 linename2] 100px');
  const result = instance.parse();
  t.deepEqual(result, {"lines":[{"value":100,"unit":"","lineNames":["linename1","linename2"]}],"lineNames":[]});
});

test('1fr', t => {
  const instance = new TrackListParser('1fr');
  const result = instance.parse();
  t.deepEqual(result, {"lines":[{"value":1,"unit":"fr","lineNames":[]}],"lineNames":[]})
});

test('auto 1fr', t => {
  const instance = new TrackListParser('auto 1fr');
  const result = instance.parse();
  t.deepEqual(result, {"lines":[{"value":"auto", "unit": "","lineNames":[]},{"value":1,"unit":"fr","lineNames":[]}],"lineNames":[]})
});

test('150px [item1-start] 1fr [item1-end]', t => {
  const instance = new TrackListParser('150px [item1-start] 1fr [item1-end]');
  const result = instance.parse();
  t.deepEqual(result, {"lines":[{"value":150,"unit":"","lineNames":[]},{"value":1,"unit":"fr","lineNames":["item1-start"]}],"lineNames":["item1-end"]});
});

test('1fr minmax(min-content, 1fr)', t => {
  const instance = new TrackListParser('1fr minmax(min-content, 1fr)');
  const result = instance.parse();
  t.deepEqual(result, {"lines":[{"value":1,"unit":"fr","lineNames":[]},{"type":"minmax","args":[{"value":"min-content", unit: ''},{"value":1,"unit":"fr"}],"lineNames":[]}],"lineNames":[]});
});

test('repeat(auto-fill, minmax(25, 1fr))', t => {
  const instance = new TrackListParser('repeat(auto-fill, minmax(25, 1fr))');
  const result = instance.parse();
  t.deepEqual(result, {"lines":[{"type":"repeat","args":["auto-fill",{"lines":[{"type":"minmax","args":[{"value":25,"unit":""},{"value":1,"unit":"fr"}],"lineNames":[]}],"lineNames":[]}],"lineNames":[]}],"lineNames":[]});
});

test('[a] auto [b] minmax(min-content, 1fr) [b c d] repeat(2, [e] 40px) repeat(5, auto)', t => {
  const instance = new TrackListParser('[a] auto [b] minmax(min-content, 1fr) [b c d] repeat(2, [e] 40px) repeat(5, auto)');
  const result = instance.parse();
  // console.log(JSON.stringify(result))
  t.deepEqual(result, {"lines":[{"value":"auto", unit: '',"lineNames":["a"]},{"type":"minmax","args":[{"value":"min-content", unit: ''},{"value":1,"unit":"fr"}],"lineNames":["b"]},{"type":"repeat","args":[2,{"lines":[{"value":40,"unit":"","lineNames":["e"]}],"lineNames":[]}],"lineNames":["b","c","d"]},{"type":"repeat","args":[5,{"lines":[{"value":"auto", unit: '', "lineNames":[]}],"lineNames":[]}],"lineNames":[]}],"lineNames":[]});
});