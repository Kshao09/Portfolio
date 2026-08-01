import * as THREE from 'three';
import { COLLECTIBLES, INTERACTIONS, ZONES } from '../config/content.js';

const shared = {};

export function createWorld(scene) {
  scene.background = new THREE.Color(0x06111f);
  scene.fog = new THREE.FogExp2(0x06111f, 0.0125);

  const hemi = new THREE.HemisphereLight(0x8edcff, 0x07111c, 1.7);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xd8f2ff, 2.2);
  sun.position.set(20, 35, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -55;
  sun.shadow.camera.right = 55;
  sun.shadow.camera.top = 55;
  sun.shadow.camera.bottom = -55;
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(110, 110, 28, 28),
    new THREE.MeshStandardMaterial({ color: 0x091827, roughness: 0.91, metalness: 0.08 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  addGrid(scene);
  addStars(scene);
  addPaths(scene);
  addZonePlatforms(scene);

  const neural = createNeuralForest(scene);
  const data = createDataLake(scene);
  const lab = createProjectLab(scene);
  const cloud = createCloudRidge(scene);
  const portal = createContactPortal(scene);
  const hub = createInferenceHub(scene);

  const beacons = INTERACTIONS.map(item => createBeacon(scene, item));
  const collectibles = COLLECTIBLES.map(item => createCollectible(scene, item));
  const ambientParticles = createAmbientParticles(scene);

  return {
    beacons,
    collectibles,
    zones: ZONES,
    colliders: [...neural.colliders, ...data.colliders, ...lab.colliders, ...cloud.colliders, ...portal.colliders, ...hub.colliders],
    animated: [...neural.animated, ...data.animated, ...lab.animated, ...cloud.animated, ...portal.animated, ...hub.animated],
    ambientParticles,
    scanRings: []
  };
}

export function animateWorld(world, elapsed, delta) {
  for (const item of world.animated) item.update(elapsed, delta);

  for (let i = 0; i < world.beacons.length; i++) {
    const beacon = world.beacons[i];
    beacon.group.rotation.y += delta * 0.32;
    beacon.ring.rotation.z += delta * (i % 2 ? -0.7 : 0.7);
    beacon.marker.position.y = 2.8 + Math.sin(elapsed * 1.6 + i) * 0.16;
    const pulse = 1 + Math.sin(elapsed * 2.4 + i) * 0.07;
    beacon.marker.scale.setScalar(pulse);
  }

  for (let i = 0; i < world.collectibles.length; i++) {
    const item = world.collectibles[i];
    if (item.collected) continue;
    item.group.rotation.y += delta * 1.4;
    item.group.position.y = item.baseY + Math.sin(elapsed * 2.2 + i) * 0.22;
    item.material.emissiveIntensity = 1.25 + Math.sin(elapsed * 3 + i) * 0.35;
  }

  const positions = world.ambientParticles.geometry.attributes.position.array;
  for (let i = 1; i < positions.length; i += 3) {
    positions[i] += delta * 0.22;
    if (positions[i] > 10) positions[i] = 0.2;
  }
  world.ambientParticles.geometry.attributes.position.needsUpdate = true;

  world.scanRings = world.scanRings.filter(ring => {
    ring.age += delta;
    const scale = 1 + ring.age * 9;
    ring.mesh.scale.setScalar(scale);
    ring.material.opacity = Math.max(0, 0.7 * (1 - ring.age / 1.25));
    if (ring.age >= 1.25) {
      ring.mesh.parent?.remove(ring.mesh);
      ring.mesh.geometry.dispose();
      ring.material.dispose();
      return false;
    }
    return true;
  });
}

export function emitScan(scene, world, position) {
  const material = new THREE.MeshBasicMaterial({ color: 0x5ff7df, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.9, 64), material);
  ring.rotation.x = -Math.PI / 2;
  ring.position.copy(position).setY(0.08);
  scene.add(ring);
  world.scanRings.push({ mesh: ring, material, age: 0 });

  world.beacons.forEach(beacon => {
    beacon.marker.material.opacity = 1;
    beacon.marker.scale.setScalar(1.28);
  });
}

function addGrid(scene) {
  const grid = new THREE.GridHelper(110, 55, 0x1c6f78, 0x102b3a);
  grid.position.y = 0.025;
  grid.material.transparent = true;
  grid.material.opacity = 0.29;
  scene.add(grid);
}

function addStars(scene) {
  const count = 700;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 55 + Math.random() * 45;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = 16 + Math.random() * 38;
    positions[i * 3 + 2] = Math.sin(angle) * r;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xaedfff, size: 0.18, transparent: true, opacity: 0.7, depthWrite: false });
  scene.add(new THREE.Points(geometry, material));
}

function addPaths(scene) {
  const material = new THREE.MeshStandardMaterial({ color: 0x0d2c3b, emissive: 0x03151b, roughness: 0.75 });
  const paths = [
    { x: 0, z: -11, w: 4, d: 38, r: 0 },
    { x: 0, z: 8, w: 52, d: 3.2, r: 0 },
    { x: 0, z: 22, w: 52, d: 3.2, r: 0 },
    { x: -13, z: 15, w: 3.2, d: 16, r: 0 },
    { x: 13, z: 15, w: 3.2, d: 16, r: 0 }
  ];
  paths.forEach(path => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(path.w, 0.12, path.d), material);
    mesh.position.set(path.x, 0.05, path.z);
    mesh.receiveShadow = true;
    scene.add(mesh);
  });
}

function addZonePlatforms(scene) {
  ZONES.forEach((zone, index) => {
    const color = new THREE.Color(zone.color);
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(zone.radius * 0.72, zone.radius * 0.78, 0.28, 48),
      new THREE.MeshStandardMaterial({ color: color.clone().multiplyScalar(0.16), emissive: color.clone().multiplyScalar(0.055), roughness: 0.72, metalness: 0.25 })
    );
    platform.position.set(zone.center[0], -0.06, zone.center[2]);
    platform.receiveShadow = true;
    scene.add(platform);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(zone.radius * 0.66, zone.radius * 0.69, 72),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: index === 0 ? 0.35 : 0.17, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(zone.center[0], 0.1, zone.center[2]);
    scene.add(ring);
  });
}

function createInferenceHub(scene) {
  const animated = [];
  const colliders = [];
  const center = new THREE.Vector3(0, 0, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0x16354a, metalness: 0.65, roughness: 0.25 });
  for (let i = 0; i < 6; i++) {
    const angle = i / 6 * Math.PI * 2;
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4.5, 0.55), material);
    pillar.position.set(center.x + Math.cos(angle) * 5.5, 2.25, center.z + Math.sin(angle) * 5.5);
    pillar.rotation.y = -angle;
    pillar.castShadow = true;
    scene.add(pillar);
    colliders.push({ x: pillar.position.x, z: pillar.position.z, radius: 0.55 });
  }

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(4.2, 0.07, 12, 96),
    new THREE.MeshBasicMaterial({ color: 0x5ff7df, transparent: true, opacity: 0.35 })
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.set(0, 4.6, 8);
  scene.add(halo);
  animated.push({ update: (_t, d) => { halo.rotation.z += d * 0.22; } });
  return { animated, colliders };
}

function createNeuralForest(scene) {
  const animated = [];
  const colliders = [];
  const center = new THREE.Vector3(-24, 0, -8);
  const nodes = [];
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x182842, roughness: 0.78 });
  const nodeMaterial = new THREE.MeshStandardMaterial({ color: 0x8c7cff, emissive: 0x25165f, emissiveIntensity: 1.1, roughness: 0.25 });

  for (let i = 0; i < 13; i++) {
    const angle = i / 13 * Math.PI * 2 + (i % 2) * 0.3;
    const radius = 4.5 + (i % 3) * 2.1;
    const x = center.x + Math.cos(angle) * radius;
    const z = center.z + Math.sin(angle) * radius;
    const height = 2.5 + (i % 4) * 0.65;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.28, height, 7), trunkMaterial);
    trunk.position.set(x, height / 2, z);
    trunk.castShadow = true;
    scene.add(trunk);

    const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.46 + (i % 2) * 0.12, 1), nodeMaterial.clone());
    node.position.set(x, height + 0.22, z);
    node.castShadow = true;
    scene.add(node);
    nodes.push(node);
    colliders.push({ x, z, radius: 0.5 });
    animated.push({ update: t => { node.position.y = height + 0.22 + Math.sin(t * 1.8 + i) * 0.13; node.rotation.y = t * 0.24 + i; } });
  }

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x8c7cff, transparent: true, opacity: 0.2 });
  for (let i = 0; i < nodes.length; i++) {
    const next = nodes[(i + 2) % nodes.length];
    const geometry = new THREE.BufferGeometry().setFromPoints([nodes[i].position.clone(), next.position.clone()]);
    scene.add(new THREE.Line(geometry, lineMaterial));
  }
  return { animated, colliders };
}

function createDataLake(scene) {
  const animated = [];
  const colliders = [];
  const center = new THREE.Vector3(24, 0, -8);
  const lake = new THREE.Mesh(
    new THREE.CircleGeometry(9.3, 64),
    new THREE.MeshPhysicalMaterial({ color: 0x1a7aa4, transparent: true, opacity: 0.33, roughness: 0.13, metalness: 0.28, transmission: 0.08, side: THREE.DoubleSide })
  );
  lake.rotation.x = -Math.PI / 2;
  lake.position.copy(center).setY(0.12);
  scene.add(lake);
  animated.push({ update: t => { lake.material.opacity = 0.3 + Math.sin(t * 1.2) * 0.04; } });

  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x54c6ff, emissive: 0x073856, emissiveIntensity: 1.2, transparent: true, opacity: 0.78, roughness: 0.25 });
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.6 + Math.random() * 6.6;
    const size = 0.26 + Math.random() * 0.44;
    const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), cubeMaterial.clone());
    const baseY = 0.8 + Math.random() * 3.2;
    cube.position.set(center.x + Math.cos(angle) * radius, baseY, center.z + Math.sin(angle) * radius);
    cube.rotation.set(Math.random(), Math.random(), Math.random());
    scene.add(cube);
    animated.push({ update: (t, d) => { cube.rotation.x += d * 0.35; cube.rotation.y += d * 0.5; cube.position.y = baseY + Math.sin(t * 1.7 + i) * 0.3; } });
  }

  const bridgeMaterial = new THREE.MeshStandardMaterial({ color: 0x16364b, metalness: 0.55, roughness: 0.36 });
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, 11), bridgeMaterial);
  bridge.position.set(center.x, 0.25, center.z + 1.2);
  bridge.receiveShadow = true;
  scene.add(bridge);
  return { animated, colliders };
}

function createProjectLab(scene) {
  const animated = [];
  const colliders = [];
  const center = new THREE.Vector3(0, 0, -32);
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x26313e, metalness: 0.72, roughness: 0.29 });
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffb75e, transparent: true, opacity: 0.56 });

  const arch = new THREE.Group();
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.6, 7, 0.6), frameMaterial);
  const right = left.clone();
  const top = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 0.6), frameMaterial);
  left.position.set(-6, 3.5, 0); right.position.set(6, 3.5, 0); top.position.set(0, 6.7, 0);
  arch.add(left, right, top);
  arch.position.copy(center);
  scene.add(arch);
  colliders.push({ x: -6, z: -32, radius: 0.5 }, { x: 6, z: -32, radius: 0.5 });

  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 11.5, 12), glowMaterial);
  beam.rotation.z = Math.PI / 2;
  beam.position.set(0, 6.7, -32);
  scene.add(beam);
  animated.push({ update: t => { beam.material.opacity = 0.42 + Math.sin(t * 2.4) * 0.15; } });

  [[-7,-29],[7,-29],[-7,-36],[7,-36]].forEach(([x,z], index) => {
    const terminal = createTerminal(index);
    terminal.position.set(x, 0, z);
    terminal.lookAt(center.x, 1.2, center.z);
    scene.add(terminal);
    colliders.push({ x, z, radius: 1.05 });
    animated.push({ update: t => { terminal.userData.screen.material.emissiveIntensity = 1.15 + Math.sin(t * 2 + index) * .35; } });
  });
  return { animated, colliders };
}

function createTerminal(index) {
  const group = new THREE.Group();
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x202e3a, metalness: .65, roughness: .32 });
  const colors = [0xffb75e, 0xff6f91, 0x8c7cff, 0x5ff7df];
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.75, .95, .7, 8), baseMaterial);
  base.position.y = .35;
  base.castShadow = true;
  group.add(base);
  const stem = new THREE.Mesh(new THREE.BoxGeometry(.22, 1.55, .22), baseMaterial);
  stem.position.y = 1.4;
  group.add(stem);
  const screenMaterial = new THREE.MeshStandardMaterial({ color: colors[index], emissive: colors[index], emissiveIntensity: 1.2, transparent: true, opacity: .84, side: THREE.DoubleSide });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.05), screenMaterial);
  screen.position.set(0, 2.08, -.04);
  group.add(screen);
  group.userData.screen = screen;
  return group;
}

function createCloudRidge(scene) {
  const animated = [];
  const colliders = [];
  const center = new THREE.Vector3(25, 0, 24);
  const islandMaterial = new THREE.MeshStandardMaterial({ color: 0x16413b, emissive: 0x041711, roughness: .77 });
  for (let i = 0; i < 7; i++) {
    const angle = i / 7 * Math.PI * 2;
    const radius = i === 0 ? 0 : 4.2 + (i % 2) * 2.3;
    const island = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.2, .7, 10), islandMaterial);
    const baseY = i === 0 ? .35 : 1.1 + (i % 3) * .55;
    island.position.set(center.x + Math.cos(angle) * radius, baseY, center.z + Math.sin(angle) * radius);
    island.castShadow = true;
    island.receiveShadow = true;
    scene.add(island);
    animated.push({ update: t => { if (i > 0) island.position.y = baseY + Math.sin(t * .7 + i) * .18; } });
  }

  const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0xc5fff3, transparent: true, opacity: .35, emissive: 0x1c5147, emissiveIntensity: .7, roughness: .6 });
  for (let i = 0; i < 10; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(.55 + Math.random() * .45, 16, 10), cloudMaterial);
      puff.position.set(j * .55, Math.random() * .35, Math.random() * .4);
      cloud.add(puff);
    }
    const baseX = center.x - 8 + Math.random() * 16;
    const baseZ = center.z - 8 + Math.random() * 16;
    cloud.position.set(baseX, 4.3 + Math.random() * 3.6, baseZ);
    scene.add(cloud);
    animated.push({ update: (t, d) => { cloud.position.x += d * (.12 + i * .01); if (cloud.position.x > center.x + 10) cloud.position.x = center.x - 10; cloud.position.y += Math.sin(t + i) * d * .03; } });
  }
  return { animated, colliders };
}

function createContactPortal(scene) {
  const animated = [];
  const colliders = [];
  const center = new THREE.Vector3(-25, 0, 24);
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x43243d, metalness: .72, roughness: .28 });
  const portalMaterial = new THREE.MeshBasicMaterial({ color: 0xff6f91, transparent: true, opacity: .33, side: THREE.DoubleSide });
  const frame = new THREE.Mesh(new THREE.TorusGeometry(3.5, .28, 16, 80), frameMaterial);
  frame.position.set(center.x, 3.5, center.z);
  scene.add(frame);
  colliders.push({ x: center.x - 3.4, z: center.z, radius: .4 }, { x: center.x + 3.4, z: center.z, radius: .4 });

  const portal = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), portalMaterial);
  portal.position.copy(frame.position).setZ(center.z + .08);
  scene.add(portal);
  animated.push({ update: (t, d) => { frame.rotation.z += d * .18; portal.material.opacity = .26 + Math.sin(t * 2.2) * .09; portal.rotation.z -= d * .1; } });

  const light = new THREE.PointLight(0xff6f91, 3.5, 15, 2);
  light.position.set(center.x, 3.5, center.z + 1.5);
  scene.add(light);
  return { animated, colliders };
}

function createBeacon(scene, item) {
  const group = new THREE.Group();
  group.position.set(...item.position);
  const color = new THREE.Color(item.color);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: color.clone().multiplyScalar(.35), emissive: color.clone().multiplyScalar(.12), metalness: .58, roughness: .34 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.72, .95, .55, 10), baseMaterial);
  base.position.y = .28;
  base.castShadow = true;
  group.add(base);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(.78, .055, 10, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .65 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.15;
  group.add(ring);

  const markerMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .92, depthWrite: false });
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(.42, 0), markerMaterial);
  marker.position.y = 2.8;
  group.add(marker);

  const line = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 1.35, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .35 }));
  line.position.y = 1.92;
  group.add(line);

  const label = createLabel(item.label, item.color);
  label.position.set(0, 3.65, 0);
  group.add(label);

  scene.add(group);
  return { ...item, group, marker, ring, label, radius: 3.3 };
}

function createCollectible(scene, item) {
  const group = new THREE.Group();
  group.position.set(...item.position);
  const material = new THREE.MeshStandardMaterial({ color: 0xffb75e, emissive: 0xff7b20, emissiveIntensity: 1.4, metalness: .35, roughness: .18 });
  const node = new THREE.Mesh(new THREE.IcosahedronGeometry(.34, 1), material);
  node.castShadow = true;
  group.add(node);
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(.58, .025, 8, 40), new THREE.MeshBasicMaterial({ color: 0x5ff7df, transparent: true, opacity: .72 }));
  orbit.rotation.x = Math.PI / 2.7;
  group.add(orbit);
  scene.add(group);
  return { ...item, group, material, baseY: item.position[1], collected: false };
}

function createAmbientParticles(scene) {
  const count = 260;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = -50 + Math.random() * 100;
    positions[i * 3 + 1] = Math.random() * 10;
    positions[i * 3 + 2] = -50 + Math.random() * 100;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x5ff7df, size: .07, transparent: true, opacity: .48, depthWrite: false });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return points;
}

function createLabel(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(3, 11, 20, 0.86)';
  roundRect(ctx, 8, 12, 624, 104, 22);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  roundRect(ctx, 8, 12, 624, 104, 22);
  ctx.stroke();
  ctx.fillStyle = '#edf8ff';
  ctx.font = '700 31px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.length > 31 ? `${text.slice(0, 29)}…` : text, 320, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: .9 });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(5.8, 1.16, 1);
  return sprite;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}
