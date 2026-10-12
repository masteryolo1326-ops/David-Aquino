// Precomputes the stylized "dotted Earth": Fibonacci-sphere points that fall on land.
// Source data: Natural Earth (public domain) via the world-atlas package (land-110m).
// Output is committed so rendering never depends on this script or the network.
import {readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {feature} from 'topojson-client';
import {geoContains} from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-110m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);

const N = 42000;
const golden = Math.PI * (3 - Math.sqrt(5));
const dots = [];
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const theta = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = ((((theta * 180) / Math.PI) % 360) + 540) % 360 - 180;
  if (lat < -62) continue; // skip Antarctica: keeps the night-side silhouette clean
  if (geoContains(land, [lon, lat])) dots.push(+lat.toFixed(2), +lon.toFixed(2));
}
writeFileSync(new URL('../src/data/globe-dots.json', import.meta.url), JSON.stringify(dots));
console.log(`land dots: ${dots.length / 2}`);
