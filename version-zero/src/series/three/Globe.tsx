import React, {useLayoutEffect, useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import dots from '../../data/globe-dots.json';
import {cities, links} from '../../data/cities';
import {ArcNetwork} from './ArcNetwork';
import {greatCircleArc, latLonToVec3} from './geo';
import {palette} from '../theme';
import {hash} from '../anim';

// Stylized night Earth: land as a dot matrix, cities as warm light (electricity),
// internet links as cyan arcs. Warm light and cyan links are deliberately separate layers
// so an episode can kill one without touching the other.

export type GlobeCam = {lat: number; lon: number; dist: number; lift: number; fov?: number};

export const GlobeCamera: React.FC<GlobeCam> = ({lat, lon, dist, lift, fov = 40}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    const p = latLonToVec3(lat, lon, dist);
    camera.position.copy(p);
    camera.up.set(0, 1, 0);
    camera.fov = fov;
    camera.near = 0.01;
    camera.far = 200;
    camera.updateProjectionMatrix();
    // Look slightly "above" the globe so it sits lower in the 9:16 frame.
    camera.lookAt(0, lift, 0);
  }, [camera, lat, lon, dist, lift, fov]);
  return null;
};

const landVert = /* glsl */ `
  attribute float aLight;
  attribute float aSeed;
  uniform float uScale;
  uniform float uSize;
  uniform float uMaxSize;
  varying float vLight;
  varying float vFacing;
  varying float vSeed;
  void main() {
    vLight = aLight; vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = dot(n, normalize(-mv.xyz));
    gl_PointSize = min(uMaxSize, uSize * uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const landFrag = /* glsl */ `
  uniform vec3 uLand;
  uniform vec3 uWarm;
  uniform float uWarmGain;
  uniform float uOpacity;
  varying float vLight;
  varying float vFacing;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.28, d);
    float limb = smoothstep(-0.05, 0.35, vFacing);
    vec3 col = mix(uLand, uWarm * (0.9 + 0.5 * vLight), clamp(vLight * uWarmGain, 0.0, 1.0));
    float a = soft * limb * uOpacity * (0.78 + 0.32 * clamp(vLight * 1.5, 0.0, 1.0));
    gl_FragColor = vec4(col * a, a);
  }
`;

const oceanVert = /* glsl */ `
  varying vec3 vN;
  varying vec3 vView;
  varying vec3 vObj;
  void main() {
    vObj = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const oceanFrag = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRim;
  uniform vec3 uGrid;
  varying vec3 vN;
  varying vec3 vView;
  varying vec3 vObj;
  void main() {
    float f = 1.0 - max(dot(vN, vView), 0.0);
    vec3 p = normalize(vObj);
    float lat = degrees(asin(p.y));
    float lon = degrees(atan(p.z, -p.x));
    float gl = 1.0 - smoothstep(0.0, 0.18, abs(fract(lat / 15.0 + 0.5) - 0.5) * 15.0);
    float gn = 1.0 - smoothstep(0.0, 0.18, abs(fract(lon / 15.0 + 0.5) - 0.5) * 15.0 * cos(radians(lat)));
    float grid = max(gl, gn) * 0.35 * (1.0 - f);
    vec3 col = uBase + uGrid * grid + uRim * pow(f, 3.0) * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;
const atmoVert = /* glsl */ `
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmoFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vN;
  void main() {
    float i = pow(max(0.0, 0.68 - dot(vN, vec3(0.0, 0.0, 1.0))), 3.2) * uIntensity;
    gl_FragColor = vec4(uColor * i, i);
  }
`;

const useLandGeometry = () =>
  useMemo(() => {
    const arr = dots as number[];
    const n = arr.length / 2;
    const pos = new Float32Array(n * 3);
    const light = new Float32Array(n);
    const seed = new Float32Array(n);
    const cityVecs = cities.map((c) => ({v: latLonToVec3(c.lat, c.lon), w: c.w}));
    const sigma = 0.042;
    for (let i = 0; i < n; i++) {
      const v = latLonToVec3(arr[i * 2], arr[i * 2 + 1], 1.003);
      pos.set([v.x, v.y, v.z], i * 3);
      const u = v.clone().normalize();
      let l = 0;
      for (const c of cityVecs) {
        const d = u.angleTo(c.v);
        if (d < sigma * 3.5) l += c.w * Math.exp(-(d * d) / (sigma * sigma));
      }
      // Scattered towns so inhabited land doesn't read as empty.
      if (hash(i * 1.37) > 0.9) l += 0.18 + 0.2 * hash(i * 7.1);
      light[i] = Math.min(1.2, l);
      seed[i] = hash(i * 3.3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aLight', new THREE.BufferAttribute(light, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return g;
  }, []);

const Stars: React.FC<{count?: number; opacity?: number}> = ({count = 900, opacity = 1}) => {
  const {geometry, material} = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = hash(i * 1.1) * 2 - 1;
      const th = hash(i * 2.3) * Math.PI * 2;
      const r = 60;
      const s = Math.sqrt(1 - u * u);
      pos.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
      const b = 0.25 + 0.75 * Math.pow(hash(i * 5.7), 3);
      col.set([b * 0.85, b * 0.9, b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false});
    return {geometry: g, material: m};
  }, [count]);
  useLayoutEffect(() => {
    material.opacity = opacity;
  }, [material, opacity]);
  return <points geometry={geometry} material={material} frustumCulled={false} />;
};

export type GlobeProps = {
  live: number;
  netTime: number;
  flash?: number;
  alarm?: number;
  warmGain?: number;
  dotOpacity?: number;
};

export const Globe: React.FC<GlobeProps> = ({live, netTime, flash = 0, alarm = 0, warmGain = 1, dotOpacity = 1}) => {
  const {size} = useThree();
  const landGeo = useLandGeometry();
  const landMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: landVert,
        fragmentShader: landFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uScale: {value: 1},
          uSize: {value: 0.0145},
          uMaxSize: {value: 22},
          uLand: {value: new THREE.Color('#6A7DFF')},
          uWarm: {value: new THREE.Color(palette.warmLight)},
          uWarmGain: {value: 1},
          uOpacity: {value: 1},
        },
      }),
    [],
  );
  const oceanMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: oceanVert,
        fragmentShader: oceanFrag,
        uniforms: {
          uBase: {value: new THREE.Color('#0A1238')},
          uRim: {value: new THREE.Color('#2F6BFF')},
          uGrid: {value: new THREE.Color('#1C2A7A')},
        },
      }),
    [],
  );
  const atmoMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmoVert,
        fragmentShader: atmoFrag,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {uColor: {value: new THREE.Color('#3A74FF')}, uIntensity: {value: 0.85}},
      }),
    [],
  );
  const arcPaths = useMemo(() => {
    const byName = new Map(cities.map((c) => [c.name, c]));
    return links.map(([a, b]) => {
      const ca = byName.get(a)!;
      const cb = byName.get(b)!;
      return greatCircleArc([ca.lat, ca.lon], [cb.lat, cb.lon]);
    });
  }, []);

  useLayoutEffect(() => {
    // Pixels per world unit at distance 1 for the current vertical FOV (40°).
    landMat.uniforms.uScale.value = size.height / (2 * Math.tan((40 * Math.PI) / 360));
    landMat.uniforms.uWarmGain.value = warmGain;
    landMat.uniforms.uOpacity.value = dotOpacity;
  }, [landMat, size.height, warmGain, dotOpacity]);

  return (
    <group>
      <Stars />
      <mesh material={oceanMat}>
        <sphereGeometry args={[1, 96, 96]} />
      </mesh>
      <mesh material={atmoMat} scale={1.13}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <points geometry={landGeo} material={landMat} frustumCulled={false} />
      <ArcNetwork paths={arcPaths} radius={0.0064} live={live} netTime={netTime} flash={flash} alarm={alarm} speed={0.42} base={0.42} />
    </group>
  );
};
