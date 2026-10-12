// "What if SCP-173 was livestreamed?" — deterministic 3D renderer.
// The page exposes window.renderFrame(t); tools/render.mjs calls it once per
// frame and screenshots the result. Nothing here depends on wall-clock time.
import * as THREE from 'three';

const TL = await (await fetch('./timeline.json')).json();
const params = new URLSearchParams(location.search);
const HANDLE = params.get('handle') || '@versionzero.tv';
const W = 1080, H = 1920;
const SHIFT = -0.30; // lens shift: subject sits in the upper third, text below
const C = TL.cues;

// ---------------------------------------------------------------- helpers
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const pulse = (t, at, len) => (t >= at && t < at + len ? 1 - (t - at) / len : 0);
const inWin = (t, a, len) => t >= a && t < a + len;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (n) => rng(n * 9973 + 17)();
const $ = (s) => document.querySelector(s);
const fmt = (n) => Math.round(n).toLocaleString('en-US');

// --------------------------------------------------------------- textures
function canvasTex(w, h, draw, { repeat = [1, 1], color = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 4;
  return t;
}

function grime(g, w, h, R, n, alpha) {
  for (let k = 0; k < n; k++) {
    const v = R() < 0.5 ? 0 : 255;
    g.fillStyle = `rgba(${v},${v},${v},${R() * alpha})`;
    g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2);
  }
}
function blotches(g, w, h, R, n, rgb, alpha, rmin, rmax) {
  for (let k = 0; k < n; k++) {
    const x = R() * w, y = R() * h, r = rmin + R() * (rmax - rmin);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${rgb},${alpha * R()})`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
}

const tileTex = canvasTex(1024, 1024, (g, w, h) => {
  const R = rng(7);
  g.fillStyle = '#44474d';
  g.fillRect(0, 0, w, h);
  const n = 4, s = w / n, gap = 7;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const v = 112 + Math.floor(R() * 12);
    g.fillStyle = `rgb(${v},${v + 4},${v + 10})`;
    g.fillRect(i * s + gap / 2, j * s + gap / 2, s - gap, s - gap);
    g.fillStyle = 'rgba(255,255,255,0.06)';
    g.fillRect(i * s + gap / 2, j * s + gap / 2, s - gap, 5);
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(i * s + gap / 2, (j + 1) * s - gap / 2 - 5, s - gap, 5);
  }
  grime(g, w, h, R, 14000, 0.07);
  blotches(g, w, h, R, 16, '25,22,18', 0.16, 60, 260);
}, { repeat: [5, 2.86] });

const sideTex = tileTex.clone();
sideTex.repeat.set(4.3, 2.86);
sideTex.needsUpdate = true;

const floorTex = canvasTex(1024, 1024, (g, w, h) => {
  const R = rng(11);
  g.fillStyle = '#3a3c40';
  g.fillRect(0, 0, w, h);
  grime(g, w, h, R, 40000, 0.12);
  blotches(g, w, h, R, 22, '10,10,10', 0.35, 40, 220);
  blotches(g, w, h, R, 4, '60,28,20', 0.25, 40, 120); // the infamous stains
  g.strokeStyle = 'rgba(0,0,0,0.35)';
  g.lineWidth = 3;
  for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(0, i * h / 2); g.lineTo(w, i * h / 2); g.stroke(); }
}, { repeat: [3, 4] });

function concrete(g, w, h, R) {
  g.fillStyle = '#a49c8d';
  g.fillRect(0, 0, w, h);
  blotches(g, w, h, R, 50, '255,250,240', 0.22, 30, 160);
  blotches(g, w, h, R, 50, '70,62,52', 0.22, 30, 160);
  for (let k = 0; k < 26000; k++) { g.fillStyle = `rgba(40,36,30,${R() * 0.16})`; g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); }
  for (let k = 0; k < 5000; k++) { g.fillStyle = `rgba(230,225,215,${R() * 0.07})`; g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); }
  g.fillStyle = 'rgba(60,54,46,0.55)';
  for (let k = 0; k < 260; k++) { g.beginPath(); g.arc(R() * w, R() * h, 0.5 + R() * 1.4, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(55,48,40,0.45)';
  g.lineWidth = 1.4;
  for (let k = 0; k < 7; k++) {
    let x = R() * w, y = R() * h;
    g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 18; s++) { x += (R() - 0.5) * 30; y += R() * 22; g.lineTo(x, y); }
    g.stroke();
  }
}
const red = (a) => `rgba(168,30,22,${a})`;
const green = (a) => `rgba(44,104,58,${a})`;
const dark = (a) => `rgba(20,26,22,${a})`;
function spray(g, x, y, rx, ry, col, R, density = 1) {
  for (let i = 0; i < 1800 * density; i++) {
    const a = R() * Math.PI * 2, d = Math.pow(R(), 0.55);
    g.fillStyle = col(0.04 + 0.22 * (1 - d));
    g.fillRect(x + Math.cos(a) * d * rx * 1.7, y + Math.sin(a) * d * ry * 1.7, 1.6, 1.6);
  }
  g.beginPath();
  for (let k = 0; k <= 26; k++) {
    const a = (k / 26) * Math.PI * 2, rr = 0.72 + R() * 0.38;
    g.lineTo(x + Math.cos(a) * rx * rr, y + Math.sin(a) * ry * rr);
  }
  g.closePath();
  g.fillStyle = col(0.92);
  g.fill();
}
function drip(g, x, y, len, wid, col) {
  g.fillStyle = col(0.85);
  g.fillRect(x - wid / 2, y, wid, len);
  g.beginPath(); g.arc(x, y + len, wid * 0.75, 0, 7); g.fill();
}

const headTex = canvasTex(1024, 512, (g, w, h) => {
  const R = rng(21);
  concrete(g, w, h, R);
  const fx = 256;
  spray(g, fx - 50, 214, 30, 24, green, R, 0.25);
  spray(g, fx + 50, 210, 29, 25, green, R, 0.25);
  spray(g, fx - 50, 216, 27, 22, dark, R, 0.9);
  spray(g, fx + 50, 212, 26, 23, dark, R, 0.9);
  drip(g, fx - 56, 232, 60, 5, red);
  drip(g, fx + 46, 230, 84, 5, red);
  spray(g, fx, 330, 66, 16, red, R, 1.2);
  drip(g, fx - 34, 336, 80, 6, red);
  drip(g, fx + 6, 338, 120, 5, red);
  drip(g, fx + 42, 334, 56, 5, red);
  spray(g, fx - 100, 290, 12, 40, red, R, 0.5);
  spray(g, fx + 100, 286, 12, 34, red, R, 0.5);
});

const bodyTex = canvasTex(1024, 1024, (g, w, h) => {
  const R = rng(33);
  concrete(g, w, h, R);
  const fx = 512;
  spray(g, fx + 30, 150, 46, 26, green, R, 0.6);
  drip(g, fx - 20, 20, 240, 7, red);
  drip(g, fx + 14, 10, 330, 6, red);
  drip(g, fx + 60, 30, 170, 5, red);
  spray(g, fx - 80, 420, 22, 60, red, R, 0.5);
});

const eyeTex = canvasTex(256, 160, (g, w, h) => {
  g.fillStyle = '#0c1015'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#9fb6c9'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#eef3f6';
  g.beginPath(); g.moveTo(40, 80); g.quadraticCurveTo(128, 18, 216, 80); g.quadraticCurveTo(128, 142, 40, 80); g.fill();
  g.fillStyle = '#16191e'; g.beginPath(); g.arc(128, 80, 28, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(138, 70, 8, 0, 7); g.fill();
  g.fillStyle = '#e3262a'; g.beginPath(); g.arc(22, 22, 8, 0, 7); g.fill();
});

const paperTex = canvasTex(768, 980, (g, w, h) => {
  const R = rng(5);
  g.fillStyle = '#e9e3d3'; g.fillRect(0, 0, w, h);
  grime(g, w, h, R, 6000, 0.05);
  g.fillStyle = '#1d1d1f';
  g.font = '800 46px Inter, sans-serif'; g.fillText('CONTAINMENT', 56, 110); g.fillText('PROCEDURES', 56, 162);
  g.font = '600 32px "DejaVu Sans Mono", monospace'; g.fillStyle = '#4a4a4f'; g.fillText('ITEM #: SCP-173', 56, 222);
  g.fillStyle = '#2a2a2e'; g.fillRect(56, 248, w - 112, 3);
  g.font = '500 40px Inter, sans-serif'; g.fillStyle = '#1d1d1f';
  ['At all times, two', 'persons must keep', 'direct eye contact', 'with SCP-173.'].forEach((l, i) => g.fillText(l, 56, 320 + i * 58));
  g.strokeStyle = 'rgba(200,24,20,0.9)'; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.moveTo(54, 452); g.quadraticCurveTo(160, 462, 268, 450); g.stroke();
  g.save(); g.translate(70, 640); g.rotate(-0.07);
  g.fillStyle = 'rgba(200,24,20,0.95)'; g.font = 'italic 900 70px Inter, sans-serif';
  g.fillText('+ NO SCREENS.', 0, 0);
  g.restore();
  g.fillStyle = 'rgba(214,200,160,0.7)';
  g.save(); g.translate(w / 2, 12); g.rotate(0.03); g.fillRect(-90, -24, 180, 52); g.restore();
});

// ------------------------------------------------------------------ scene
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const BG = new THREE.Color(0x0b0c0e);
const scene = new THREE.Scene();
scene.background = BG.clone();
scene.fog = new THREE.Fog(0x0b0c0e, 11, 26);

const room = new THREE.Group();
scene.add(room);
{
  const wall = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.82 });
  const side = new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.82 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), wall);
  back.position.set(0, 4, -4);
  back.receiveShadow = true;
  const left = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), side);
  left.position.set(-5, 4, 2); left.rotation.y = Math.PI / 2; left.receiveShadow = true;
  const right = left.clone();
  right.position.x = 5; right.rotation.y = -Math.PI / 2;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 14), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.92 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 3); floor.receiveShadow = true;
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(10, 14), new THREE.MeshStandardMaterial({ color: 0x1b1c1f, roughness: 1 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 7, 3);
  room.add(back, left, right, floor, ceil);
}

const hemi = new THREE.HemisphereLight(0xc4cfdf, 0x1c1c1e, 1.0);
const spot = new THREE.SpotLight(0xfff0dc, 130, 0, 0.72, 0.6, 2);
spot.position.set(0.2, 6.6, -0.4);
spot.target.position.set(0, 0, -1.2);
spot.castShadow = true;
spot.shadow.mapSize.set(1024, 1024);
spot.shadow.bias = -0.0005;
spot.shadow.radius = 5;
const fill = new THREE.PointLight(0xa8bbd0, 8, 0, 2);
fill.position.set(0.5, 2.6, 5.5);
const faceLight = new THREE.PointLight(0xffe6d0, 0, 0, 2);
scene.add(hemi, spot, spot.target, fill, faceLight);

function shadowy(obj) { obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return obj; }

function makeStatue() {
  // Tall, thin and slightly hunched: a crude concrete figure, head tilted down at you.
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ map: bodyTex, bumpMap: bodyTex, bumpScale: 2.2, roughness: 0.96 });
  const headMat = new THREE.MeshStandardMaterial({ map: headTex, bumpMap: headTex, bumpScale: 1.6, roughness: 0.94 });
  const pts = [[0, 0.82], [0.2, 0.82], [0.25, 0.9], [0.24, 1.1], [0.27, 1.35], [0.31, 1.55], [0.32, 1.7], [0.27, 1.82], [0.15, 1.9], [0.08, 1.94], [0, 1.95]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), bodyMat);
  body.rotation.y = Math.PI; // texture seam to the back, paint to the front
  body.scale.set(1, 1, 0.82);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.26, 16), bodyMat);
  neck.position.set(0, 2.0, 0.03);
  neck.rotation.x = 0.18;
  // hand-made look: a lumpy, slightly asymmetric head instead of a clean egg
  const headGeo = new THREE.SphereGeometry(0.25, 64, 40);
  const pos = headGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const n = 1 + 0.035 * Math.sin(x * 23 + y * 7) * Math.cos(z * 19 - y * 11) + 0.02 * Math.sin(y * 31 + z * 13)
      - (z > 0.12 ? 0.06 * (z - 0.12) / 0.13 : 0) + (y < -0.1 ? 0.05 * (-0.1 - y) / 0.15 : 0);
    pos.setXYZ(i, x * n, y * n, z * n);
  }
  headGeo.computeVertexNormals();
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(0, 2.25, 0.08);
  head.scale.set(0.86, 1.22, 0.9);
  head.rotation.set(0.2, 0, 0.09);
  g.add(body, neck, head);
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.72, 6, 14), bodyMat);
    leg.position.set(s * 0.12, 0.45, 0);
    leg.rotation.z = -s * 0.03;
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.058, 0.86, 6, 14), bodyMat);
    arm.position.set(s * 0.36, 1.25, 0.04);
    arm.rotation.set(-0.05, 0, s * 0.07);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), bodyMat);
    hand.position.set(s * 0.39, 0.78, 0.06);
    hand.scale.set(0.9, 1.3, 0.9);
    g.add(leg, arm, hand);
  }
  return shadowy(g);
}

function makeHuman(color, rough = 0.5) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough });
  const part = (geo, x, y, z = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.z = rz; g.add(o); return o; };
  part(new THREE.SphereGeometry(0.13, 24, 16), 0, 1.67);
  part(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 12), 0, 1.53);
  part(new THREE.CapsuleGeometry(0.17, 0.4, 6, 16), 0, 1.2);
  part(new THREE.SphereGeometry(0.16, 16, 12), 0, 0.93).scale.set(1.05, 0.7, 0.8);
  for (const s of [-1, 1]) {
    part(new THREE.CapsuleGeometry(0.07, 0.72, 6, 12), s * 0.1, 0.47);
    part(new THREE.CapsuleGeometry(0.05, 0.56, 6, 12), s * 0.26, 1.12, 0, s * 0.08);
  }
  return shadowy(g);
}

function makeTripod() {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x1e2024, roughness: 0.45, metalness: 0.6 });
  const up = V(0, 1, 0);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + Math.PI / 6;
    const top = V(0, 1.6, 0), foot = V(Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36);
    const dir = foot.clone().sub(top);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, dir.length(), 8), metal);
    leg.position.copy(top.clone().add(foot).multiplyScalar(0.5));
    leg.quaternion.setFromUnitVectors(up, dir.clone().normalize());
    g.add(leg);
  }
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), metal);
  col.position.y = 1.66;
  g.add(col);
  const head = new THREE.Group();
  head.position.y = 1.78;
  const bodyM = new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.5, metalness: 0.3 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.36), bodyM);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.14, 24), bodyM);
  lens.rotation.x = Math.PI / 2; lens.position.z = 0.24;
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), new THREE.MeshStandardMaterial({ color: 0x0a1630, roughness: 0.1, metalness: 0.9 }));
  glass.position.z = 0.312;
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xff2a20 });
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), ledMat);
  led.position.set(0.08, 0.11, 0.14);
  head.add(box, lens, glass, led);
  g.add(head);
  g.userData = { head, led, ledMat };
  return shadowy(g);
}

const statue = makeStatue();
const human = makeHuman(0xe9e6df);
const researcher = makeHuman(0x16171a, 0.8);
const tripod = makeTripod();
scene.add(statue, human, researcher, tripod);

// Theory 1: rings of screens all staring at it
const screens = new THREE.Group();
const rings = [];
{
  const front = new THREE.MeshBasicMaterial({ map: eyeTex, toneMapped: false });
  const backM = new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.6 });
  const geo = new THREE.PlaneGeometry(0.42, 0.26);
  // a curved wall of screens behind it, every one of them staring at its face
  [[2.0, 0.75, 9], [2.35, 1.6, 11], [2.7, 2.45, 13]].forEach(([r, y, n], k) => {
    const ring = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (1.06 + 0.88 * (i / (n - 1)));
      const s = new THREE.Group();
      const f = new THREE.Mesh(geo, front);
      const b = new THREE.Mesh(geo, backM);
      b.rotation.y = Math.PI; b.position.z = -0.006;
      s.add(f, b);
      s.position.set(Math.cos(a) * r, y + Math.sin(i * 1.7) * 0.08, Math.sin(a) * r);
      s.lookAt(0, 2.1, 0);
      ring.add(s);
    }
    ring.userData.phase = k * 1.3;
    screens.add(ring);
    rings.push(ring);
  });
  const lineM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 });
  [1.45, 1.95, 2.45].forEach((r) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(r - 0.012, r + 0.012, 96), lineM);
    m.rotation.x = -Math.PI / 2; m.position.y = 0.012;
    screens.add(m);
  });
  screens.userData.pulses = [0, 1].map(() => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.98, 1.0, 96), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.014;
    screens.add(m);
    return m;
  });
}
scene.add(screens);

const paper = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.91), new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.9 }));
paper.position.set(-1.35, 2.25, -3.97);
paper.rotation.z = 0.025;
paper.receiveShadow = true;
scene.add(paper);

const cam = new THREE.PerspectiveCamera(55, W / H, 0.05, 100);
const feedCam = new THREE.PerspectiveCamera(55, W / H, 0.05, 100);

// ------------------------------------------------------------- placement
const TRIPOD = V(-1.0, 0, 2.1);
const AIM = V(0.35, 1.95, -1.5);
const HOME = V(0.35, 0, -1.5);

function aimTripod(pos, aim) {
  tripod.position.copy(pos);
  const head = tripod.userData.head;
  const hp = V(pos.x, pos.y + head.position.y, pos.z);
  tripod.rotation.set(0, Math.atan2(aim.x - hp.x, aim.z - hp.z), 0);
  head.rotation.set(Math.atan2(hp.y - aim.y, Math.hypot(aim.x - hp.x, aim.z - hp.z)), 0, 0);
}
function lensPose() {
  tripod.updateMatrixWorld(true);
  const head = tripod.userData.head;
  return { pos: head.localToWorld(V(0, 0, 0.34)), look: head.localToWorld(V(0, 0, 5)) };
}
// A floor spot `d` metres in front of the tripod's lens, on its line of sight.
function alongLens(d) {
  const dir = V(AIM.x - TRIPOD.x, 0, AIM.z - TRIPOD.z).normalize();
  const lens = lensPose().pos;
  return V(lens.x + dir.x * d, 0, lens.z + dir.z * d);
}
function face(obj, target) { obj.rotation.set(0, Math.atan2(target.x - obj.position.x, target.z - obj.position.z), 0); }

function setCam(c, pos, target, fov, shift, shake = 0, seed = 0) {
  c.fov = fov;
  c.position.copy(pos);
  if (shake) c.position.add(V((hash(seed) - 0.5) * shake, (hash(seed + 1) - 0.5) * shake, 0));
  c.lookAt(target);
  c.updateProjectionMatrix();
  c.projectionMatrix.elements[9] = shift;
  c.projectionMatrixInverse.copy(c.projectionMatrix).invert();
  c.updateMatrixWorld(true);
}
function toScreen(p, c = cam) {
  const v = p.clone().project(c);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
}

// -------------------------------------------------------------- overlays
const ui = {
  handle: $('#handle'), hud: $('#hud'), hudL: $('#hud .l'), hudV: $('#hud .v'),
  kicker: $('#kicker'), kL: $('#kicker .l'), kT: $('#kicker .t'), kS: $('#kicker .s'),
  banner: $('#banner'), text: $('#text'), label: $('#text .label'), title: $('#text .title'), body: $('#text .body'),
  feed: $('#feed'), feedNoise: $('#feed canvas.noise'), clock: $('#feed .clock'), feedLive: $('#feed .live'),
  inset: $('#inset'), insetLabel: $('#insetLabel'), insetNoise: $('#inset canvas.noise'), insetOff: $('#inset .off'),
  arrow: $('#arrow'), arrowLine: $('#arrow line'), eye: $('#eye'), eyeOpen: $('#eye .open'), eyeClosed: $('#eye .closed'),
  labA: $('#labA'), labB: $('#labB'), sfx: $('#sfxText'), chat: $('#chat'),
  dim: $('#dim'), spinner: $('#spinner'), buf: $('#bufText'), flash: $('#flash'), black: $('#black'),
};
ui.handle.textContent = HANDLE;

const COPY = {
  hook: { label: 'WHAT IF...', title: 'SCP-173 was livestreamed?', body: 'A researcher points a camera into its cell and streams it to the whole world. Nobody approved this.', kicker: ['THE EXPERIMENT', 'A livestream', 'Never approved'] },
  rule: { label: 'THE RULE', title: 'Blink, and it moves', body: "It can't move while you're looking at it. The moment you blink, it does. But does a screen count?", kicker: ['THE RULE', 'Seen = frozen', 'A blink is all it needs'] },
  nickname: { label: "WHY IT'S FEARED", title: 'The Sculpture', body: 'Concrete and rebar. When no one is inside its cell, guards hear stone scraping.', kicker: ['NICKNAME', '“The Sculpture”', 'Concrete and rebar'] },
  moment: { label: 'THE MOMENT', title: 'The stream goes live', body: 'A million people tune in. Every one of them is looking right at it.', kicker: ['THE MOMENT', 'Going live', '1,000,000 viewers'], hud: 'VIEWERS' },
  theory1: { label: 'THEORY 1', title: 'Frozen forever', body: 'With a million viewers, someone is always watching. It might never move again.', kicker: ['THEORY 1', 'Frozen forever', "Someone's always watching"], hud: 'EYES ON IT' },
  theory2: { label: 'THEORY 2', title: 'Every lag is a blink', body: 'Streams buffer. Every time it does, the whole world blinks at once.', kicker: ['THEORY 2', 'The buffer', 'Lag = blink'], hud: 'MOVES' },
  theory3: { label: 'THEORY 3', title: "Screens don't count", body: "A camera isn't really looking. Then a million people get to watch it move.", kicker: ['THEORY 3', 'Free to move', 'Live, for everyone'], hud: 'REAL EYES' },
  problem: { label: 'THE REAL PROBLEM', title: "You're watching the past", body: "Every stream runs a few seconds behind. The statue you're watching isn't where it is right now.", kicker: ['THE REAL PROBLEM', 'Stream delay', 'You see the past'], hud: 'DELAY' },
  ending: { label: "MAYBE THAT'S WHY", title: 'Direct eyes only', body: 'Its real file demands direct eye contact. Two people, always. Now you know why it says “direct.”', kicker: ['NEW RULE', 'No screens', 'Ever'] },
};

const CHAT = [
  ['nightshift_k', 'it MOVED 😳', '#e85d4a'],
  ['dr.bright.fan', 'wait rewind rewind', '#4aa3e8'],
  ['zzz_owl', 'did anyone else see that??', '#9b6ae8'],
  ['site19_intern', "cameras don't count lmao", '#e8b44a'],
  ['mtf_epsilon', "BRO IT'S CLOSER 💀", '#4ae88f'],
  ['lurker_404', 'why is it facing the camera', '#e84a9b'],
];
const chatEls = CHAT.map(([n, t, c]) => {
  const el = document.createElement('div');
  el.className = 'msg';
  el.innerHTML = `<div class="av" style="background:${c}"></div><div><div class="n">${n}</div><div class="t">${t}</div></div>`;
  ui.chat.appendChild(el);
  return el;
});

let shownScene = null;
let titleSpans = [];
function setCopy(id) {
  if (shownScene === id) return;
  shownScene = id;
  const c = COPY[id];
  ui.label.textContent = c.label;
  ui.title.innerHTML = c.title.split(' ').map((w) => `<span>${w}</span>`).join('');
  titleSpans = [...ui.title.querySelectorAll('span')];
  ui.body.textContent = c.body;
  [ui.kL.textContent, ui.kT.textContent, ui.kS.textContent] = c.kicker;
  ui.hudL.textContent = c.hud || '';
}

function noise(cv, seed, alpha = 255) {
  const g = cv.getContext('2d');
  const img = g.createImageData(cv.width, cv.height);
  const R = rng(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = R() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = alpha;
  }
  g.putImageData(img, 0, 0);
}

const show = (el, on, disp = 'block') => { el.style.display = on ? disp : 'none'; };

// -------------------------------------------------------------- per frame
let F; // frame state, rebuilt every frame
function resetFrame() {
  room.visible = true;
  scene.background.copy(BG);
  scene.fog.near = 11; scene.fog.far = 26;
  statue.visible = true; statue.position.copy(HOME); statue.rotation.set(0, 0, 0);
  human.visible = researcher.visible = tripod.visible = screens.visible = paper.visible = false;
  hemi.intensity = 1.0; spot.intensity = 130; fill.intensity = 8; faceLight.intensity = 0;
  aimTripod(TRIPOD, AIM);
  F = {
    camPos: V(0, 1.9, 6.0), camTarget: V(0.15, 1.2, -1.4), fov: 55, shift: SHIFT, shake: 0,
    feed: false, inset: null, dim: 0, flash: 0, flashColor: '#ff2a1a', led: true,
    ui: true, hud: null, banner: 0, canvasX: 0,
  };
  for (const el of [ui.arrow, ui.eye, ui.labA, ui.labB, ui.sfx, ui.chat, ui.spinner, ui.buf, ui.inset, ui.insetLabel]) show(el, false);
}

function useFeed(t, frozenAt = null) {
  // Point the main camera through the tripod's lens and dress the frame as a stream.
  F.feed = true;
  const { pos, look } = lensPose();
  F.camPos = pos; F.camTarget = look; F.fov = 56; F.shift = -0.14;
  tripod.visible = false;
  const ft = frozenAt ?? t;
  noise(ui.feedNoise, Math.floor(ft * 30));
  const secs = Math.max(0, ft - C.momentLive);
  ui.clock.textContent = `LIVE ${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;
}

const SCENES = {
  hook(t, u, s) {
    tripod.visible = true;
    const slide = easeOut(ramp(t, C.tripodIn - 0.7, C.tripodIn + 0.5));
    aimTripod(V(lerp(-3.4, TRIPOD.x, slide), 0, TRIPOD.z), AIM);
    researcher.visible = t < C.tripodIn + 2.2;
    const walk = smooth(ramp(t, C.tripodIn + 0.5, C.tripodIn + 2.2));
    researcher.position.set(lerp(-3.9, -1.55, slide) - walk * 2.6, 0, TRIPOD.z + 0.35);
    researcher.rotation.y = walk > 0 ? -Math.PI / 2 : Math.PI / 2;
    const p = smooth(u / (s.end - s.start));
    F.camPos = V(lerp(-0.3, -0.4, p), lerp(2.05, 1.95, p), lerp(7.2, 6.1, p));
    F.camTarget = V(-0.25, 1.45, -1.0);
    F.led = Math.floor(t * 1.6) % 2 === 0;
    F.flash = 0.35 * pulse(t, 0.05, 0.35);
  },

  rule(t, u, s) {
    room.visible = false;
    scene.fog.near = 30; scene.fog.far = 60;
    hemi.intensity = 1.25; spot.intensity = 70; fill.intensity = 10;
    spot.target.position.set(0, 0, 0);
    human.visible = true;
    human.position.set(-0.95, 0, 0); human.rotation.y = Math.PI / 2 - 0.35;
    const moved = t >= C.ruleBlink + 0.12;
    if (moved) { statue.position.set(-0.38, 0, -0.5); face(statue, V(-0.95, 0, 0.2)); }
    else { statue.position.set(1.0, 0, 0); statue.rotation.y = -Math.PI / 2 + 0.6; }
    F.camPos = V(0, 1.45, 7.6); F.camTarget = V(0.05, 1.25, 0); F.fov = 50;
    setCam(cam, F.camPos, F.camTarget, F.fov, F.shift);

    const blinking = inWin(t, C.ruleBlink, 0.32);
    F.dim = blinking ? 0.88 : 0;
    F.flash = 0.45 * pulse(t, C.ruleBlink + 0.32, 0.3);
    F.shake = 0.06 * pulse(t, C.ruleBlink + 0.32, 0.4);

    const head = toScreen(V(-0.95, 1.67, 0));
    show(ui.eye, t >= s.start + 0.25);
    ui.eye.style.left = `${head.x}px`; ui.eye.style.top = `${head.y - 105}px`;
    ui.eyeOpen.style.display = blinking ? 'none' : '';
    ui.eyeClosed.style.display = blinking ? '' : 'none';

    const showArrow = t >= C.ruleLooking - 0.25 && !moved;
    show(ui.arrow, showArrow);
    if (showArrow) {
      const a = toScreen(V(-0.72, 1.55, 0)), b = toScreen(V(0.7, 1.55, 0));
      const grow = easeOut(ramp(t, C.ruleLooking - 0.25, C.ruleLooking + 0.25));
      ui.arrowLine.setAttribute('x1', a.x); ui.arrowLine.setAttribute('y1', a.y);
      ui.arrowLine.setAttribute('x2', lerp(a.x, b.x, grow)); ui.arrowLine.setAttribute('y2', a.y);
    }
    const fa = toScreen(V(-0.95, 0, 0.3)), fb = toScreen(moved ? V(-0.38, 0, -0.2) : V(1.0, 0, 0.3));
    show(ui.labA, true); show(ui.labB, true);
    ui.labA.style.left = `${fa.x - (moved ? 60 : 0)}px`; ui.labA.style.top = `${fa.y + 14}px`;
    ui.labA.textContent = blinking ? 'BLINKING' : 'LOOKING'; ui.labA.style.color = '#8b9099';
    ui.labB.style.left = `${fb.x + (moved ? 110 : 0)}px`; ui.labB.style.top = `${fb.y + 14}px`;
    ui.labB.textContent = moved ? 'MOVED' : 'FROZEN'; ui.labB.style.color = '#ff4a3d';
    F.banner = smooth(ramp(t, C.ruleScreen - 0.1, C.ruleScreen + 0.15));
  },

  nickname(t, u, s) {
    const p = smooth(u / (s.end - s.start));
    F.camPos = V(lerp(0.3, 0.15, p), lerp(2.05, 1.95, p), lerp(6.6, 5.4, p));
    F.camTarget = V(0.15, 1.5, -1.0);
    const flick = 0.82 + 0.18 * Math.sin(t * 37) * Math.sin(t * 13.3);
    spot.intensity = 105 * flick; hemi.intensity = 0.8;
    const b1 = inWin(t, C.nickFlicker1, 0.3), b2 = inWin(t, C.nickFlicker2, 0.34);
    if (b1 || b2) { spot.intensity = 0; hemi.intensity = 0.04; fill.intensity = 0.3; }
    if (t >= C.nickFlicker2 + 0.34) { statue.position.set(0.65, 0, 0.75); statue.rotation.y = -0.3; }
    else if (t >= C.nickFlicker1 + 0.3) { statue.position.set(-0.6, 0, -0.5); statue.rotation.y = 0.4; }
    F.shake = 0.05 * (pulse(t, C.nickFlicker1 + 0.3, 0.35) + pulse(t, C.nickFlicker2 + 0.34, 0.35));
    setCam(cam, F.camPos, F.camTarget, F.fov, F.shift);
    const sfxOn = (t >= C.nickFlicker1 && t < C.nickFlicker1 + 1.0) || (t >= C.nickFlicker2 && t < C.nickFlicker2 + 1.1);
    show(ui.sfx, sfxOn);
    if (sfxOn) {
      const hp = toScreen(statue.position.clone().add(V(0, 2.5, 0)));
      const since = t >= C.nickFlicker2 ? t - C.nickFlicker2 : t - C.nickFlicker1;
      ui.sfx.style.left = `${clamp(hp.x + 190, 200, 880)}px`; ui.sfx.style.top = `${hp.y - 30}px`;
      ui.sfx.style.opacity = since < 0.4 ? 1 : 1 - smooth((since - 0.4) / 0.6);
    }
  },

  moment(t, u, s) {
    face(statue, TRIPOD);
    useFeed(t);
    F.fov = lerp(60, 52, smooth(u / (s.end - s.start)));
    const p = ramp(t, C.momentLive, C.momentMillion);
    F.hud = t < C.momentLive ? '0' : fmt(1e6 * Math.pow(p, 2.6));
    ui.feedLive.style.opacity = t < C.momentLive ? 0.35 : 1;
    F.flash = 0.3 * pulse(t, C.momentMillion, 0.4) + 0.15 * pulse(t, C.momentLive, 0.25);
  },

  theory1(t, u, s) {
    screens.visible = true;
    statue.position.set(0, 0, 0);
    rings.forEach((r) => { r.rotation.y = Math.sin(t * 0.7 + r.userData.phase) * 0.1; });
    screens.userData.pulses.forEach((m, i) => {
      const ph = ((u + i * 0.6) % 1.2) / 1.2;
      m.scale.setScalar(lerp(0.6, 3.2, ph));
      m.material.opacity = 0.35 * (1 - ph);
    });
    const a = lerp(-0.28, 0.26, smooth(u / (s.end - s.start)));
    F.camPos = V(Math.sin(a) * 6.6, 2.4, Math.cos(a) * 6.6);
    F.camTarget = V(0, 1.55, 0);
    spot.target.position.set(0, 0, 0);
    F.hud = '1,000,000';
  },

  theory2(t, u, s) {
    const path = [HOME, alongLens(2.7), alongLens(2.0), alongLens(1.3)];
    const bufs = [C.t2Buf1, C.t2Buf2, C.t2Buf3];
    const BUF = 0.55;
    const done = bufs.filter((b) => t >= b + BUF).length;
    const active = bufs.find((b) => t >= b && t < b + BUF);
    statue.position.copy(path[done]);
    face(statue, TRIPOD);
    useFeed(t, active ?? null);
    F.fov = 56;
    F.hud = String(done);
    if (active !== undefined) {
      F.dim = 0.5;
      show(ui.spinner, true); show(ui.buf, true);
      ui.spinner.style.transform = `rotate(${(t - active) * 540}deg)`;
    }
    const resumed = bufs.find((b) => t >= b + BUF && t < b + BUF + 0.14);
    if (resumed !== undefined) { F.canvasX = (hash(Math.floor(t * 30)) - 0.5) * 40; F.flash = 0.14; F.flashColor = '#ffffff'; }
  },

  theory3(t, u, s) {
    tripod.visible = true;
    F.camPos = V(-0.15, 2.2, 7.6);
    F.camTarget = V(-0.15, 1.4, -0.4);
    const spots = [HOME, V(-0.3, 0, -1.0), V(0.7, 0, -0.6), V(-0.1, 0, -0.1), V(0.4, 0, 0.45), alongLens(1.1)];
    const k = Math.min(spots.length - 1, Math.max(0, Math.floor((u - 0.45) / 0.55) + 1));
    statue.position.copy(spots[k]);
    face(statue, k % 2 && k < spots.length - 1 ? F.camPos : TRIPOD);
    F.shake = 0.035 * (k > 0 ? pulse((u - 0.45) % 0.55, 0, 0.2) : 0);
    F.led = Math.floor(t * 1.6) % 2 === 0;
    F.hud = '0';
    show(ui.chat, true);
    const shown = chatEls.map((_, i) => s.start + 0.4 + i * 0.52);
    const vis = shown.filter((ts) => t >= ts).length;
    chatEls.forEach((el, i) => {
      const ti = shown[i];
      if (t < ti) { el.style.display = 'none'; return; }
      el.style.display = 'flex';
      const fromBottom = vis - 1 - i;
      const enter = easeOut(ramp(t, ti, ti + 0.2));
      el.style.top = `${600 - (fromBottom + 1) * 92 + (1 - enter) * 30}px`;
      el.style.opacity = enter * (fromBottom > 4 ? 0 : 1 - fromBottom * 0.12);
    });
  },

  problem(t, u, s) {
    tripod.visible = true;
    const { pos: lens } = lensPose();
    const now = alongLens(1.15);
    statue.position.copy(now);
    face(statue, TRIPOD);
    F.camPos = V(1.9, 2.15, 6.0);
    F.camTarget = V(-0.15, 1.45, 1.1);
    F.led = t < C.pOffline ? Math.floor(t * 1.6) % 2 === 0 : false;
    F.hud = '2.4 s';
    setCam(cam, F.camPos, F.camTarget, F.fov, F.shift);
    const f = toScreen(now.clone().add(V(0, 2.75, 0)));
    show(ui.labB, t >= C.pBehind);
    ui.labB.textContent = 'RIGHT NOW'; ui.labB.style.color = '#ff4a3d';
    ui.labB.style.left = `${f.x}px`; ui.labB.style.top = `${f.y - 34}px`;
    const caught = t >= C.pCatch;
    F.inset = {
      statuePos: caught ? now : HOME.clone(),
      lens,
      state: t < C.pOffline - 0.35 ? 'live' : t < C.pOffline ? 'static' : 'off',
    };
    F.flash = 0.2 * pulse(t, C.pCatch, 0.3);
  },

  ending(t, u, s) {
    paper.visible = true;
    const p = smooth(ramp(t, s.start, C.finalBlink));
    F.camPos = V(lerp(0.1, -0.5, p), lerp(2.05, 2.0, p), lerp(6.6, 3.6, p));
    F.camTarget = V(lerp(-0.15, -0.75, p), lerp(1.6, 1.85, p), -2.4);
    if (t >= C.finalBlink) {
      F.ui = false;
      F.dim = t < C.finalFace ? 1 : 0;
      const k = ramp(t, C.finalFace, TL.duration);
      const eye = V(-0.5, 2.15, 3.6);
      statue.position.set(eye.x, 0, eye.z - 1.3 + k * 0.1);
      statue.rotation.y = 0;
      F.camPos = eye;
      F.camTarget = V(eye.x, 2.15, 0);
      F.shift = -0.04;
      faceLight.position.set(eye.x + 0.15, 1.55, eye.z - 0.45);
      faceLight.color.set(0xffc9b0);
      faceLight.intensity = t >= C.finalFace ? 1.6 : 0;
      spot.intensity = 40; hemi.intensity = 0.35; fill.intensity = 0;
      F.flash = 0.55 * pulse(t, C.finalFace, 0.5);
      F.shake = 0.07 * pulse(t, C.finalFace, 0.6);
    }
  },
};

function sceneAt(t) {
  for (const s of TL.scenes) if (t < s.end) return s;
  return TL.scenes[TL.scenes.length - 1];
}

function renderUI(t, s) {
  const u = t - s.start, d = s.end - s.start;
  const out = s.id === 'ending' ? 1 : smooth((s.end - t) / 0.16);
  const on = F.ui ? 1 : 0;
  setCopy(s.id);
  ui.label.style.opacity = smooth((u - 0.03) / 0.18) * out * on;
  titleSpans.forEach((sp, i) => {
    const k = smooth((u - 0.08 - i * 0.07) / 0.16);
    sp.style.opacity = k * out * on;
    sp.style.transform = `translateY(${(1 - k) * 22}px)`;
  });
  const bodyAt = s.id === 'hook' ? C.hookBody - s.start - 0.15 : 0.45;
  ui.body.style.opacity = smooth((u - bodyAt) / 0.3) * out * on;
  const kp = smooth(u / 0.25);
  ui.kicker.style.opacity = kp * out * on;
  ui.kicker.style.transform = `translateX(${(1 - kp) * 40}px)`;
  const hasHud = F.hud !== null && COPY[s.id].hud;
  show(ui.hud, hasHud && on);
  if (hasHud) {
    ui.hudV.textContent = F.hud;
    const hp = smooth((u - 0.12) / 0.25);
    ui.hud.style.opacity = hp * out;
    ui.hud.style.transform = `translateX(${(hp - 1) * 30}px)`;
  }
  ui.banner.style.opacity = F.banner * out * on;
  ui.banner.style.display = F.banner > 0 ? 'block' : 'none';
  ui.handle.style.opacity = on;

  show(ui.feed, F.feed);
  ui.dim.style.opacity = F.dim;
  ui.flash.style.opacity = F.flash;
  ui.flash.style.background = F.flashColor;
  canvas.style.transform = F.canvasX ? `translateX(${F.canvasX}px)` : '';
  canvas.style.filter = F.feed ? 'contrast(1.12) saturate(0.45) brightness(0.96)' : '';

  // quick dip to black on every cut, like the original
  let blk = 0;
  for (const sc of TL.scenes.slice(1)) blk = Math.max(blk, 1 - Math.abs(t - sc.start) / 0.13);
  ui.black.style.opacity = clamp(blk) * 0.92;
}

function renderInset(t) {
  const I = F.inset;
  show(ui.inset, true); show(ui.insetLabel, true);
  ui.insetNoise.style.display = I.state === 'static' ? 'block' : 'none';
  ui.insetOff.style.display = I.state === 'off' ? 'flex' : 'none';
  if (I.state === 'static') noise(ui.insetNoise, Math.floor(t * 30) + 999);
  if (I.state !== 'live') return;
  const keep = { pos: statue.position.clone(), rot: statue.rotation.y, tv: tripod.visible };
  statue.position.copy(I.statuePos);
  face(statue, TRIPOD);
  tripod.visible = false;
  const r = { x: 563, y: 333, w: 464, h: 324 };
  feedCam.aspect = r.w / r.h;
  setCam(feedCam, I.lens, AIM, 54, 0);
  renderer.setScissorTest(true);
  renderer.setViewport(r.x, H - r.y - r.h, r.w, r.h);
  renderer.setScissor(r.x, H - r.y - r.h, r.w, r.h);
  renderer.render(scene, feedCam);
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, W, H);
  statue.position.copy(keep.pos); statue.rotation.y = keep.rot; tripod.visible = keep.tv;
}

window.renderFrame = (t) => {
  resetFrame();
  const s = sceneAt(t);
  SCENES[s.id](t, t - s.start, s);
  tripod.userData.ledMat.color.set(F.led ? 0xff2a20 : 0x2a0a08);
  setCam(cam, F.camPos, F.camTarget, F.fov, F.shift, F.shake, Math.floor(t * 30));
  renderer.render(scene, cam);
  if (F.inset) renderInset(t);
  renderUI(t, s);
  return s.id;
};

window.TIMELINE = { duration: TL.duration, fps: TL.fps };
await document.fonts.ready;
window.renderFrame(0);
window.READY = true;
