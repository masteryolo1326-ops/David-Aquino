import React, {useLayoutEffect, useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {ArcNetwork} from './ArcNetwork';
import {palette} from '../theme';
import {rng} from '../anim';

// Procedural night city. Deterministic from a seed: same city in every frame and every episode.
// Layers (each independently controllable by an episode):
//   windows/streetlights/cars/traffic signals  → electricity & local systems (never internet-dependent here)
//   rooftop links                                → internet connectivity (ArcNetwork)
//   status beacons                               → per-app state (online / waiting / timed out)

export const CITY = {pitch: 4.1, road: 0.9, blocks: 14, fog: '#151B4C'} as const;

export type Building = {x: number; z: number; w: number; d: number; h: number; seed: number};

export const makeCity = (seed = 7) => {
  const r = rng(seed);
  const buildings: Building[] = [];
  const {pitch, road, blocks} = CITY;
  const half = (blocks * pitch) / 2;
  for (let bx = 0; bx < blocks; bx++) {
    for (let bz = 0; bz < blocks; bz++) {
      const x0 = -half + bx * pitch + road;
      const z0 = -half + bz * pitch + road;
      const inner = pitch - road;
      if (r() < 0.06) continue; // park
      for (let lx = 0; lx < 2; lx++) {
        for (let lz = 0; lz < 2; lz++) {
          const lot = inner / 2;
          const w = lot * (0.62 + r() * 0.3);
          const d = lot * (0.62 + r() * 0.3);
          const cx = x0 + lot * (lx + 0.5);
          const cz = z0 + lot * (lz + 0.5);
          const dist = Math.hypot(cx, cz);
          const downtown = Math.exp(-Math.pow(dist / 13, 2));
          const h = 0.5 + 1.8 * Math.pow(r(), 1.6) + 9.5 * downtown * Math.pow(r(), 1.4);
          buildings.push({x: cx, z: cz, w, d, h, seed: r()});
        }
      }
    }
  }
  return buildings;
};

const bVert = /* glsl */ `
  attribute vec3 aDims;
  attribute float aSeed;
  uniform float uFogDensity;
  varying vec3 vLocal;
  varying vec3 vN;
  varying float vSeed;
  varying vec3 vDims;
  varying float vFog;
  void main() {
    vLocal = (position + vec3(0.0, 0.5, 0.0)) * aDims;
    vN = normal; vSeed = aSeed; vDims = aDims;
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vec4 mv = viewMatrix * wp;
    float d = length(mv.xyz);
    vFog = 1.0 - exp(-uFogDensity * uFogDensity * d * d);
    gl_Position = projectionMatrix * mv;
  }
`;
const bFrag = /* glsl */ `
  uniform vec3 uWallLow;
  uniform vec3 uWallHigh;
  uniform vec3 uGlass;
  uniform vec3 uWarm;
  uniform vec3 uCool;
  uniform vec3 uRim;
  uniform vec3 uFog;
  uniform float uPower;
  varying vec3 vLocal;
  varying vec3 vN;
  varying float vSeed;
  varying vec3 vDims;
  varying float vFog;
  float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec3 col;
    if (vN.y > 0.5) {
      vec2 e = min(vLocal.xz + vDims.xz * 0.5, vDims.xz * 0.5 - vLocal.xz);
      float edge = 1.0 - smoothstep(0.0, 0.05, min(e.x, e.y));
      col = vec3(0.075, 0.09, 0.22) + uRim * edge * 0.6;
    } else if (vN.y < -0.5) {
      col = vec3(0.0);
    } else {
      bool sideX = abs(vN.x) > 0.5;
      float faceW = sideX ? vDims.z : vDims.x;
      vec2 fc = vec2((sideX ? vLocal.z : vLocal.x) + faceW * 0.5, vLocal.y);
      vec2 cell = vec2(0.16, 0.23);
      vec2 id = floor(fc / cell);
      vec2 f = fract(fc / cell);
      float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.24, f.y) * step(f.y, 0.76);
      win *= step(0.3, vLocal.y) * step(fc.x, faceW - 0.05) * step(0.05, fc.x) * step(vLocal.y, vDims.y - 0.12);
      float faceSeed = vSeed * 31.0 + (sideX ? sign(vN.x) * 3.0 : sign(vN.z) * 7.0);
      float r = h21(id + faceSeed);
      float lit = step(0.56, r);
      float cool = step(0.9, h21(id * 1.7 + faceSeed));
      float bright = 0.55 + 0.45 * h21(id * 3.1 + faceSeed);
      float shade = sideX ? 0.72 : (vN.z > 0.0 ? 1.0 : 0.55);
      // Anti-alias: when a window cell shrinks below ~2px, fade to its average glow (no shimmer).
      vec2 fw = fwidth(fc / cell);
      float aa = clamp(max(fw.x, fw.y) * 2.2 - 0.35, 0.0, 1.0);
      float winAvg = 0.36 * step(0.3, vLocal.y);
      float w = mix(win, winAvg, aa);
      float glow = mix(win * lit * bright, winAvg * 0.44 * 0.78 * 1.35, aa) * 1.45;
      col = mix(uWallLow, uWallHigh, clamp(vLocal.y / 10.0, 0.0, 1.0)) * shade;
      col = mix(col, uGlass, w * 0.85);
      col += mix(uWarm, uCool * 0.6 + uWarm * 0.4, cool * (1.0 - aa)) * glow * uPower;
      float ex = min(fc.x, faceW - fc.x);
      col += uRim * (1.0 - smoothstep(0.0, 0.035, ex)) * 0.22;
    }
    col = mix(col, uFog, vFog);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const gVert = /* glsl */ `
  uniform float uFogDensity;
  varying vec2 vXZ;
  varying float vFog;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vXZ = wp.xz;
    vec4 mv = viewMatrix * wp;
    float d = length(mv.xyz);
    vFog = 1.0 - exp(-uFogDensity * uFogDensity * d * d);
    gl_Position = projectionMatrix * mv;
  }
`;
const gFrag = /* glsl */ `
  uniform float uPitch;
  uniform float uRoad;
  uniform float uHalf;
  uniform vec3 uFog;
  uniform vec3 uWarm;
  uniform float uPower;
  varying vec2 vXZ;
  varying float vFog;
  void main() {
    vec2 m = mod(vXZ + uHalf, uPitch);
    vec2 roadMask = step(m, vec2(uRoad));
    float road = max(roadMask.x, roadMask.y);
    vec3 col = mix(vec3(0.045, 0.055, 0.13), vec3(0.08, 0.095, 0.21), road);
    // centre dashes
    vec2 c = abs(m - uRoad * 0.5);
    float dashX = roadMask.x * (1.0 - roadMask.y) * step(c.x, 0.025) * step(0.5, fract(vXZ.y * 1.2));
    float dashZ = roadMask.y * (1.0 - roadMask.x) * step(c.y, 0.025) * step(0.5, fract(vXZ.x * 1.2));
    col += vec3(0.2, 0.24, 0.42) * (dashX + dashZ);
    // streetlight pools along road edges
    vec2 edge = abs(m - vec2(uRoad * 0.08));
    float lampX = roadMask.x * exp(-pow(length(vec2(edge.x, (fract(vXZ.y / 1.2) - 0.5) * 1.2)) / 0.22, 2.0));
    float lampZ = roadMask.y * exp(-pow(length(vec2(edge.y, (fract(vXZ.x / 1.2) - 0.5) * 1.2)) / 0.22, 2.0));
    col += uWarm * (lampX + lampZ) * 0.75 * uPower;
    col = mix(col, uFog, vFog);
    gl_FragColor = vec4(col, 1.0);
  }
`;
const skyFrag = /* glsl */ `
  varying vec3 vDir;
  void main() {
    float y = normalize(vDir).y;
    vec3 horizon = vec3(0.11, 0.12, 0.33);
    vec3 zenith = vec3(0.012, 0.016, 0.05);
    vec3 col = mix(horizon, zenith, smoothstep(-0.02, 0.45, y));
    col += vec3(0.18, 0.12, 0.08) * exp(-abs(y) * 18.0) * 0.35;
    gl_FragColor = vec4(col, 1.0);
  }
`;
const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const beaconVert = /* glsl */ `
  attribute vec4 aColor;
  uniform float uScale;
  varying vec4 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(0.5 * uScale / -mv.z, 6.0, 46.0) * (0.8 + 0.4 * aColor.a);
    gl_Position = projectionMatrix * mv;
  }
`;
const beaconFrag = /* glsl */ `
  varying vec4 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float ring = smoothstep(0.5, 0.42, d) * smoothstep(0.26, 0.34, d);
    float core = smoothstep(0.2, 0.1, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.25;
    float a = (ring + core + halo) * clamp(vColor.a, 0.0, 1.0);
    gl_FragColor = vec4(vColor.rgb * a, a);
  }
`;

export type CityCam = {pos: [number, number, number]; look: [number, number, number]; fov?: number};
export const CityCamera: React.FC<CityCam> = ({pos, look, fov = 50}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.up.set(0, 1, 0);
    camera.fov = fov;
    camera.near = 0.05;
    camera.far = 300;
    camera.updateProjectionMatrix();
    camera.lookAt(...look);
  }, [camera, pos[0], pos[1], pos[2], look[0], look[1], look[2], fov]);
  return null;
};

export type BeaconFn = (index: number, seed: number) => [number, number, number, number];

export type CityProps = {
  t: number; // seconds, drives cars and traffic signals (local systems keep running)
  live: number;
  netTime: number;
  flash?: number;
  alarm?: number;
  power?: number;
  beacon?: BeaconFn;
  beaconCount?: number;
};

export const City: React.FC<CityProps> = ({t, live, netTime, flash = 0, alarm = 0, power = 1, beacon, beaconCount = 46}) => {
  const {size} = useThree();
  const buildings = useMemo(() => makeCity(7), []);
  const fogDensity = 0.027;

  const {mesh: bMesh} = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const dims = new Float32Array(buildings.length * 3);
    const seeds = new Float32Array(buildings.length);
    buildings.forEach((b, i) => {
      dims.set([b.w, b.h, b.d], i * 3);
      seeds[i] = b.seed;
    });
    geo.setAttribute('aDims', new THREE.InstancedBufferAttribute(dims, 3));
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: bVert,
      fragmentShader: bFrag,
      uniforms: {
        uFogDensity: {value: fogDensity},
        uWallLow: {value: new THREE.Color('#0A0E2A')},
        uWallHigh: {value: new THREE.Color('#222A78')},
        uGlass: {value: new THREE.Color('#0D1640')},
        uWarm: {value: new THREE.Color('#FFCF8A')},
        uCool: {value: new THREE.Color('#9AD2FF')},
        uRim: {value: new THREE.Color('#4F7BFF')},
        uFog: {value: new THREE.Color(CITY.fog)},
        uPower: {value: 1},
      },
    });
    const mesh = new THREE.InstancedMesh(geo, mat, buildings.length);
    const m = new THREE.Matrix4();
    buildings.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, b.h / 2, b.z), new THREE.Quaternion(), new THREE.Vector3(b.w, b.h, b.d));
      mesh.setMatrixAt(i, m);
    });
    mesh.frustumCulled = false;
    return {mesh};
  }, [buildings]);

  const groundMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: gVert,
        fragmentShader: gFrag,
        uniforms: {
          uFogDensity: {value: fogDensity},
          uPitch: {value: CITY.pitch},
          uRoad: {value: CITY.road},
          uHalf: {value: (CITY.blocks * CITY.pitch) / 2},
          uFog: {value: new THREE.Color(CITY.fog)},
          uWarm: {value: new THREE.Color('#FFB866')},
          uPower: {value: 1},
        },
      }),
    [],
  );
  const skyMat = useMemo(
    () => new THREE.ShaderMaterial({vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false}),
    [],
  );

  // Rooftop links: each tall building talks to its nearest tall neighbours, plus uplinks leaving the city.
  const {linkPaths, beaconPos} = useMemo(() => {
    const tall = buildings
      .map((b, i) => ({b, i}))
      .filter(({b}) => b.h > 3.2)
      .sort((a, b) => b.b.h - a.b.h)
      .slice(0, 40);
    const paths: THREE.Vector3[][] = [];
    const seen = new Set<string>();
    const top = (b: Building) => new THREE.Vector3(b.x, b.h + 0.05, b.z);
    tall.forEach(({b, i}) => {
      const near = tall
        .filter((o) => o.i !== i)
        .map((o) => ({o, d: Math.hypot(o.b.x - b.x, o.b.z - b.z)}))
        .sort((a, c) => a.d - c.d)
        .slice(0, 2);
      near.forEach(({o, d}) => {
        const key = [Math.min(i, o.i), Math.max(i, o.i)].join('-');
        if (seen.has(key)) return;
        seen.add(key);
        const a = top(b);
        const c = top(o.b);
        const mid = a.clone().add(c).multiplyScalar(0.5);
        mid.y = Math.max(a.y, c.y) + d * 0.35;
        const curve = new THREE.QuadraticBezierCurve3(a, mid, c);
        paths.push(curve.getPoints(24));
      });
    });
    tall.slice(0, 12).forEach(({b}, k) => {
      const a = top(b);
      const ang = k * 2.39996;
      const far = new THREE.Vector3(b.x + Math.cos(ang) * 30, b.h + 26, b.z + Math.sin(ang) * 30);
      const mid = a.clone().lerp(far, 0.5);
      mid.y = a.y + 8;
      paths.push(new THREE.QuadraticBezierCurve3(a, mid, far).getPoints(28));
    });
    const r = rng(99);
    const candidates = buildings.filter((b) => b.h > 1.6 && Math.hypot(b.x, b.z) < 24);
    const pos: THREE.Vector3[] = [];
    while (pos.length < beaconCount && candidates.length) {
      const b = candidates.splice(Math.floor(r() * candidates.length), 1)[0];
      pos.push(new THREE.Vector3(b.x, b.h + 0.55, b.z));
    }
    return {linkPaths: paths, beaconPos: pos};
  }, [buildings, beaconCount]);

  const beacons = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const p = new Float32Array(beaconPos.length * 3);
    beaconPos.forEach((v, i) => p.set([v.x, v.y, v.z], i * 3));
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(beaconPos.length * 4), 4));
    const mat = new THREE.ShaderMaterial({
      vertexShader: beaconVert,
      fragmentShader: beaconFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {uScale: {value: 1}},
    });
    const stemGeo = new THREE.BufferGeometry();
    const sp = new Float32Array(beaconPos.length * 6);
    beaconPos.forEach((v, i) => sp.set([v.x, v.y - 0.5, v.z, v.x, v.y - 0.12, v.z], i * 6));
    stemGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    stemGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(beaconPos.length * 6), 3));
    const stemMat = new THREE.LineBasicMaterial({vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false});
    return {geo, mat, stemGeo, stemMat};
  }, [beaconPos]);

  // Cars: headlight dots driving the road grid. Purely local — they never stop.
  const cars = useMemo(() => {
    const r = rng(5);
    const list = Array.from({length: 150}, () => {
      const alongX = r() < 0.5;
      const line = Math.floor(r() * CITY.blocks);
      const dir = r() < 0.5 ? 1 : -1;
      return {alongX, line, dir, speed: 1.4 + r() * 1.6, phase: r() * 200, lane: dir * 0.2};
    });
    const geo = new THREE.BoxGeometry(0.14, 0.05, 0.07);
    const mat = new THREE.MeshBasicMaterial({color: new THREE.Color('#FFF1D6')});
    const mesh = new THREE.InstancedMesh(geo, mat, list.length);
    mesh.frustumCulled = false;
    return {list, mesh};
  }, []);

  const signals = useMemo(() => {
    const r = rng(11);
    const pts: Array<{x: number; z: number; offset: number}> = [];
    const half = (CITY.blocks * CITY.pitch) / 2;
    for (let i = 3; i < CITY.blocks - 2; i++) {
      for (let j = 3; j < CITY.blocks - 2; j++) {
        if (r() < 0.55) continue;
        pts.push({x: -half + i * CITY.pitch + 0.08, z: -half + j * CITY.pitch + 0.08, offset: r() * 8});
      }
    }
    const geo = new THREE.SphereGeometry(0.07, 10, 8);
    const mat = new THREE.MeshBasicMaterial({color: 0xffffff});
    const mesh = new THREE.InstancedMesh(geo, mat, pts.length);
    const m = new THREE.Matrix4();
    pts.forEach((p, i) => {
      m.makeTranslation(p.x, 0.42, p.z);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, new THREE.Color(0, 0, 0));
    });
    mesh.frustumCulled = false;
    return {pts, mesh};
  }, []);

  useLayoutEffect(() => {
    const half = (CITY.blocks * CITY.pitch) / 2;
    const span = CITY.blocks * CITY.pitch;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const yRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    cars.list.forEach((c, i) => {
      const s = ((((c.phase + c.speed * t * c.dir) % span) + span) % span) - half;
      const lineCoord = -half + c.line * CITY.pitch + CITY.road / 2 + c.lane;
      const pos = c.alongX ? new THREE.Vector3(s, 0.05, lineCoord) : new THREE.Vector3(lineCoord, 0.05, s);
      m.compose(pos, c.alongX ? q : yRot, new THREE.Vector3(1, 1, 1));
      cars.mesh.setMatrixAt(i, m);
    });
    cars.mesh.instanceMatrix.needsUpdate = true;

    const green = new THREE.Color('#3DFF8A');
    const amber = new THREE.Color(palette.amber);
    const red = new THREE.Color('#FF3B47');
    signals.pts.forEach((p, i) => {
      const ph = (t + p.offset) % 8;
      signals.mesh.setColorAt(i, ph < 3.6 ? green : ph < 4.4 ? amber : red);
    });
    if (signals.mesh.instanceColor) signals.mesh.instanceColor.needsUpdate = true;

    const mat = bMesh.material as THREE.ShaderMaterial;
    mat.uniforms.uPower.value = power;
    groundMat.uniforms.uPower.value = power;

    beacons.mat.uniforms.uScale.value = size.height / (2 * Math.tan((50 * Math.PI) / 360));
    const col = beacons.geo.attributes.aColor as THREE.BufferAttribute;
    const stem = beacons.stemGeo.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < beaconPos.length; i++) {
      const [rr, gg, bb, aa] = beacon ? beacon(i, (i * 0.6180339) % 1) : [0, 0, 0, 0];
      col.setXYZW(i, rr, gg, bb, aa);
      stem.setXYZ(i * 2, rr * aa * 0.1, gg * aa * 0.1, bb * aa * 0.1);
      stem.setXYZ(i * 2 + 1, rr * aa * 0.6, gg * aa * 0.6, bb * aa * 0.6);
    }
    col.needsUpdate = true;
    stem.needsUpdate = true;
  }, [t, power, beacon, cars, signals, bMesh, groundMat, beacons, beaconPos, size.height]);

  return (
    <group>
      <mesh material={skyMat} scale={150}>
        <sphereGeometry args={[1, 32, 16]} />
      </mesh>
      <mesh material={groundMat} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
      </mesh>
      <primitive object={bMesh} />
      <primitive object={cars.mesh} />
      <primitive object={signals.mesh} />
      <ArcNetwork paths={linkPaths} radius={0.028} live={live} netTime={netTime} flash={flash} alarm={alarm} speed={1.2} base={0.42} fogDensity={fogDensity} seed={3} />
      <lineSegments geometry={beacons.stemGeo} material={beacons.stemMat} frustumCulled={false} />
      <points geometry={beacons.geo} material={beacons.mat} frustumCulled={false} />
    </group>
  );
};
