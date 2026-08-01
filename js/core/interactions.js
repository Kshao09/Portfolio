import * as THREE from 'three';

const temp = new THREE.Vector3();

export function getNearestBeacon(playerPosition, beacons) {
  let nearest = null;
  let bestDistance = Infinity;
  for (const beacon of beacons) {
    temp.set(beacon.position[0], 0, beacon.position[2]);
    const distance = horizontalDistance(playerPosition, temp);
    if (distance < beacon.radius && distance < bestDistance) {
      nearest = beacon;
      bestDistance = distance;
    }
  }
  return nearest;
}

export function collectNearby(playerPosition, collectibles, onCollect) {
  for (const collectible of collectibles) {
    if (collectible.collected) continue;
    const distance = horizontalDistance(playerPosition, collectible.group.position);
    if (distance < 1.35) {
      collectible.collected = true;
      collectible.group.visible = false;
      onCollect(collectible);
    }
  }
}

export function getCurrentZone(playerPosition, zones) {
  let best = zones[0];
  let bestDistance = Infinity;
  for (const zone of zones) {
    temp.set(zone.center[0], 0, zone.center[2]);
    const distance = horizontalDistance(playerPosition, temp);
    if (distance <= zone.radius && distance < bestDistance) {
      best = zone;
      bestDistance = distance;
    }
  }
  return best;
}

function horizontalDistance(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}
