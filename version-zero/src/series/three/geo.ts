import * as THREE from 'three';

/** Lat/lon in degrees → point on a sphere (three-globe convention: lon 0 on +x, north on +y). */
export const latLonToVec3 = (lat: number, lon: number, r = 1) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};

/** Great-circle arc lifted off the surface; higher for longer hops. */
export const greatCircleArc = (a: [number, number], b: [number, number], samples = 48, r = 1) => {
  const va = latLonToVec3(a[0], a[1], 1);
  const vb = latLonToVec3(b[0], b[1], 1);
  const angle = va.angleTo(vb);
  const h = 0.03 + 0.32 * (angle / Math.PI);
  const pts: THREE.Vector3[] = [];
  const sinA = Math.sin(angle);
  for (let i = 0; i <= samples; i++) {
    const s = i / samples;
    const wa = Math.sin((1 - s) * angle) / sinA;
    const wb = Math.sin(s * angle) / sinA;
    const p = va.clone().multiplyScalar(wa).add(vb.clone().multiplyScalar(wb)).normalize();
    pts.push(p.multiplyScalar(r * (1.004 + h * Math.sin(Math.PI * s))));
  }
  return pts;
};
