import test from 'ava';
import { TrackParser } from '../../src/parser/track';
import { TrackCompute } from '../../src/compute/track';
import { Container } from '../../src/container';

test('100px', t => {
  const parser = new TrackParser('100px');
  const result = parser.parse();
  const container = new Container({
    width: 500,
    height: 500
  });
  const compute = new TrackCompute(result, container, 'column');
  console.log(compute.trackList);
});