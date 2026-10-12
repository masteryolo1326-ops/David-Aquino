import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {palette} from '../theme';

// Glowing network links with travelling data pulses, shared by the globe and the city.
// One merged tube geometry + one shader → a single draw call for hundreds of links.
//   live    1 = carrying traffic (cyan), 0 = dead (faint dashed line)
//   netTime network clock driving the pulses — hold it constant to freeze packets mid-flight
//   flash   brief over-brightness, e.g. the instant links come back
//   alarm   coral tint at the moment of failure

export type ArcPath = THREE.Vector3[];

const vert = /* glsl */ `
  attribute float aU;
  attribute float aSeed;
  attribute float aLen;
  varying float vU;
  varying float vSeed;
  varying float vLen;
  varying float vFog;
  uniform float uFogDensity;
  void main() {
    vU = aU; vSeed = aSeed; vLen = aLen;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float d = length(mv.xyz);
    vFog = 1.0 - exp(-uFogDensity * uFogDensity * d * d);
    gl_Position = projectionMatrix * mv;
  }
`;

const frag = /* glsl */ `
  uniform float uTime;
  uniform float uLive;
  uniform float uFlash;
  uniform float uAlarm;
  uniform float uSpeed;
  uniform float uBase;
  uniform vec3 uLiveColor;
  uniform vec3 uDeadColor;
  uniform vec3 uAlarmColor;
  varying float vU;
  varying float vSeed;
  varying float vLen;
  varying float vFog;
  void main() {
    float ends = smoothstep(0.0, 0.05, vU) * smoothstep(1.0, 0.95, vU);
    // Two pulses per link, speed normalised by link length so packets move at one "network speed".
    float phase = vU - uTime * uSpeed / max(vLen, 0.2) - vSeed;
    float p1 = pow(fract(phase), 18.0);
    float p2 = pow(fract(phase + 0.5), 18.0) * step(0.45, fract(vSeed * 13.7));
    float pulse = (p1 + p2) * 1.6;
    float dash = step(0.45, fract(vU * vLen * 9.0));
    float deadA = 0.16 * dash;
    float liveA = uBase + pulse;
    float a = mix(deadA, liveA, uLive) + uFlash * 0.9 + uAlarm * 0.6;
    vec3 col = mix(uDeadColor, uLiveColor, uLive);
    col = mix(col, uAlarmColor, uAlarm);
    col += vec3(1.0) * pulse * 0.35 * uLive + uFlash * 0.4;
    a *= ends * (1.0 - vFog);
    gl_FragColor = vec4(col * a, a);
  }
`;

export type ArcNetworkProps = {
  paths: ArcPath[];
  radius?: number;
  live: number;
  netTime: number;
  flash?: number;
  alarm?: number;
  speed?: number;
  base?: number;
  fogDensity?: number;
  seed?: number;
};

export const ArcNetwork: React.FC<ArcNetworkProps> = ({
  paths,
  radius = 0.006,
  live,
  netTime,
  flash = 0,
  alarm = 0,
  speed = 0.35,
  base = 0.38,
  fogDensity = 0,
  seed = 1,
}) => {
  const geometry = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    paths.forEach((pts, i) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const segs = Math.max(24, Math.min(140, Math.round(curve.getLength() * 40)));
      const tube = new THREE.TubeGeometry(curve, segs, radius, 5, false);
      const n = tube.attributes.position.count;
      const aU = new Float32Array(n);
      const aSeed = new Float32Array(n).fill(((i * 0.618034 + seed * 0.37) % 1 + 1) % 1);
      const aLen = new Float32Array(n).fill(curve.getLength());
      // TubeGeometry lays out (segs+1) rings of (radial+1) vertices.
      const ring = 6;
      for (let v = 0; v < n; v++) aU[v] = Math.floor(v / ring) / segs;
      tube.setAttribute('aU', new THREE.BufferAttribute(aU, 1));
      tube.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
      tube.setAttribute('aLen', new THREE.BufferAttribute(aLen, 1));
      tube.deleteAttribute('normal');
      tube.deleteAttribute('uv');
      geos.push(tube);
    });
    return mergeGeometries(geos);
  }, [paths, radius, seed]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: {value: 0},
          uLive: {value: 1},
          uFlash: {value: 0},
          uAlarm: {value: 0},
          uSpeed: {value: speed},
          uBase: {value: base},
          uFogDensity: {value: fogDensity},
          uLiveColor: {value: new THREE.Color(palette.cyan)},
          uDeadColor: {value: new THREE.Color('#5A6496')},
          uAlarmColor: {value: new THREE.Color(palette.coral)},
        },
      }),
    [speed, base, fogDensity],
  );

  useLayoutEffect(() => {
    material.uniforms.uTime.value = netTime;
    material.uniforms.uLive.value = live;
    material.uniforms.uFlash.value = flash;
    material.uniforms.uAlarm.value = alarm;
  }, [material, netTime, live, flash, alarm]);

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
};

/** Minimal attribute-merging (all inputs share the same attribute layout, all indexed). */
export function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const out = new THREE.BufferGeometry();
  const names = Object.keys(geos[0].attributes);
  let vtx = 0;
  const indices: number[] = [];
  for (const g of geos) {
    const idx = g.index!;
    for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + vtx);
    vtx += g.attributes.position.count;
  }
  for (const name of names) {
    const size = geos[0].attributes[name].itemSize;
    const arr = new Float32Array(vtx * size);
    let o = 0;
    for (const g of geos) {
      const a = g.attributes[name].array as Float32Array;
      arr.set(a, o);
      o += a.length;
    }
    out.setAttribute(name, new THREE.BufferAttribute(arr, size));
  }
  out.setIndex(indices);
  geos.forEach((g) => g.dispose());
  return out;
}
