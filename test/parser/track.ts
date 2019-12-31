import test from 'ava';
import { TrackParser } from '../../src/parser/track';

test('100px', t => {
  const instance = new TrackParser('100px');
  const result = instance.parse();
  // console.log(JSON.stringify(result))
  t.deepEqual(result, { "tracks": [{ "value": 100, "type": "", "baseSize": 100, "growthLimit": 100, "lineNames": [] }], "lineNames": [] });
});

test('[linename1] 100px', t => {
  const instance = new TrackParser('[linename1] 100px');
  const result = instance.parse();
  // console.log(JSON.stringify(result))
  t.deepEqual(result, { "tracks": [{ "value": 100, "type": "", "baseSize": 100, "growthLimit": 100, "lineNames": ["linename1"] }], "lineNames": [] })
});

test('[linename1] 100px [lineend]', t => {
  const instance = new TrackParser('[linename1] 100px [lineend]');
  const result = instance.parse();
  // console.log(JSON.stringify(result))
  t.deepEqual(result, { "tracks": [{ "value": 100, "type": "", "baseSize": 100, "growthLimit": 100, "lineNames": ["linename1"] }], "lineNames": ["lineend"] });
});

test('[linename1 linename2] 100px', t => {
  const instance = new TrackParser('[linename1 linename2] 100px');
  const result = instance.parse();
  // console.log(JSON.stringify(result))
  t.deepEqual(result, { "tracks": [{ "value": 100, "type": "", "baseSize": 100, "growthLimit": 100, "lineNames": ["linename1", "linename2"] }], "lineNames": [] });
});

test('1fr', t => {
  const instance = new TrackParser('1fr');
  const result = instance.parse();
  // console.log(JSON.stringify(result))
  t.deepEqual(result, { "tracks": [{ "value": 1, "type": "fr", "baseSize": 0, "growthLimit": 0, "lineNames": [] }], "lineNames": [] })
});

test('auto 1fr', t => {
  const instance = new TrackParser('auto 1fr');
  const result = instance.parse();
  // console.log(JSON.stringify(result))
  t.deepEqual(result, { "tracks": [{ "type": "auto", "baseSize": 0, "growthLimit": Infinity, "lineNames": [] }, { "value": 1, "type": "fr", "baseSize": 0, "growthLimit": 0, "lineNames": [] }], "lineNames": [] })
});

test('150px [item1-start] 1fr [item1-end]', t => {
  const instance = new TrackParser('150px [item1-start] 1fr [item1-end]');
  const result = instance.parse();
  // console.log(JSON.stringify(result))
  t.deepEqual(result, { "tracks": [{ "value": 150, "type": "", "baseSize": 150, "growthLimit": 150, "lineNames": [] }, { "value": 1, "type": "fr", "baseSize": 0, "growthLimit": 0, "lineNames": ["item1-start"] }], "lineNames": ["item1-end"] });
});

test('1fr minmax(min-content, 1fr)', t => {
  const instance = new TrackParser('1fr minmax(min-content, 1fr)');
  const result = instance.parse();
  // console.log(JSON.stringify(result))
  t.deepEqual(result, { "tracks": [{ "value": 1, "type": "fr", "baseSize": 0, "growthLimit": 0, "lineNames": [] }, { "type": "minmax", "args": [{ "type": "min-content", "baseSize": 0, "growthLimit": Infinity }, { "value": 1, "type": "fr", "baseSize": 0, "growthLimit": 0 }], "baseSize": 0, "growthLimit": Infinity, "lineNames": [] }], "lineNames": [] });
});

test('repeat(auto-fill, minmax(25, 1fr))', t => {
  const instance = new TrackParser('repeat(auto-fill, minmax(25, 1fr))');
  const result = instance.parse();
  // console.log(JSON.stringify(result))
  t.deepEqual(result, { "tracks": [{ "type": "auto-fill-repeat", "args": ["auto-fill", { "tracks": [{ "type": "minmax", "args": [{ "value": 25, "type": "", "baseSize": 25, "growthLimit": 25 }, { "value": 1, "type": "fr", "baseSize": 0, "growthLimit": 0 }], "baseSize": 0, "growthLimit": Infinity, "lineNames": [] }], "lineNames": [] }], "lineNames": [] }], "lineNames": [] });
});

test('[a] auto [b] minmax(min-content, 1fr) [b c d] repeat(2, [e] 40px) repeat(5, auto)', t => {
  const instance = new TrackParser('[a] auto [b] minmax(min-content, 1fr) [b c d] repeat(2, [e] 40px) repeat(5, auto)');
  const result = instance.parse();
  // console.log(JSON.stringify(result))
  t.deepEqual(result, { "tracks": [{ "type": "auto", "baseSize": 0, "growthLimit": Infinity, "lineNames": ["a"] }, { "type": "minmax", "args": [{ "type": "min-content", "baseSize": 0, "growthLimit": Infinity }, { "value": 1, "type": "fr", "baseSize": 0, "growthLimit": 0 }], "baseSize": 0, "growthLimit": Infinity, "lineNames": ["b"] }, { "type": "fix-repeat", "args": [2, { "tracks": [{ "value": 40, "type": "", "baseSize": 40, "growthLimit": 40, "lineNames": ["e"] }], "lineNames": [] }], "lineNames": ["b", "c", "d"] }, { "type": "fix-repeat", "args": [5, { "tracks": [{ "type": "auto", "baseSize": 0, "growthLimit": Infinity, "lineNames": [] }], "lineNames": [] }], "lineNames": [] }], "lineNames": [] });
});