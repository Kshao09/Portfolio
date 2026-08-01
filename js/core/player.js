import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);
const CAMERA_FORWARD = new THREE.Vector3();
const CAMERA_RIGHT = new THREE.Vector3();

/**
 * Returns the horizontal direction the camera is facing.
 *
 * yaw = 0 points toward +Z.
 * Increasing yaw rotates the view toward the right.
 */
export function getCameraForward(
  yaw,
  target = new THREE.Vector3()
) {
  return target
    .set(
      Math.sin(yaw),
      0,
      Math.cos(yaw)
    )
    .normalize();
}

export function createPlayer(scene) {
  const group = new THREE.Group();

  group.name = 'player-avatar';
  group.position.set(0, 0, 11);

  const dark = new THREE.MeshStandardMaterial({
    color: 0x13263a,
    roughness: 0.55,
    metalness: 0.2
  });

  const suit = new THREE.MeshStandardMaterial({
    color: 0x27d9c4,
    roughness: 0.35,
    metalness: 0.22,
    emissive: 0x062d2a
  });

  const glow = new THREE.MeshStandardMaterial({
    color: 0x9ffef0,
    emissive: 0x4de4d1,
    emissiveIntensity: 1.6,
    roughness: 0.2
  });

  const accent = new THREE.MeshStandardMaterial({
    color: 0xffb75e,
    emissive: 0x5b2d08,
    emissiveIntensity: 0.8
  });

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.48, 0.9, 6, 12),
    suit
  );

  torso.position.y = 1.45;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 24, 16),
    dark
  );

  head.position.y = 2.55;
  head.castShadow = true;
  group.add(head);

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.18, 0.08),
    glow
  );

  visor.position.set(0, 2.58, -0.36);
  group.add(visor);

  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.92, 0.26),
    dark
  );

  backpack.position.set(0, 1.48, 0.48);
  backpack.castShadow = true;
  group.add(backpack);

  const core = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 20),
    accent
  );

  core.position.set(0, 1.55, -0.49);
  core.rotation.y = Math.PI;
  group.add(core);

  const armGeometry = new THREE.CapsuleGeometry(
    0.12,
    0.62,
    4,
    8
  );

  const legGeometry = new THREE.CapsuleGeometry(
    0.14,
    0.68,
    4,
    8
  );

  const leftArm = new THREE.Mesh(armGeometry, dark);
  const rightArm = new THREE.Mesh(armGeometry, dark);

  leftArm.position.set(-0.59, 1.48, 0);
  rightArm.position.set(0.59, 1.48, 0);

  leftArm.castShadow = true;
  rightArm.castShadow = true;

  group.add(leftArm, rightArm);

  const leftLeg = new THREE.Mesh(legGeometry, dark);
  const rightLeg = new THREE.Mesh(legGeometry, dark);

  leftLeg.position.set(-0.23, 0.55, 0);
  rightLeg.position.set(0.23, 0.55, 0);

  leftLeg.castShadow = true;
  rightLeg.castShadow = true;

  group.add(leftLeg, rightLeg);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.72, 32),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    })
  );

  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  group.add(shadow);

  scene.add(group);

  return {
    group,

    parts: {
      torso,
      head,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      core
    },

    input: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false
    },

    /*
     * The camera initially looks toward +Z.
     *
     * The avatar model itself faces -Z, so its initial visual rotation
     * needs to be PI radians to face the same direction as the camera.
     */
    yaw: 0,
    pitch: 0.18,
    facing: Math.PI,

    walkTime: 0,
    isMoving: false,

    speed: 7.2,
    sprintMultiplier: 1.65,
    bounds: 48
  };
}

export function updatePlayer(
  player,
  delta,
  colliders = []
) {
  const { input, group } = player;

  const forwardAmount =
    Number(input.forward) -
    Number(input.backward);

  const sideAmount =
    Number(input.right) -
    Number(input.left);

  const direction = new THREE.Vector3();

  if (forwardAmount || sideAmount) {
    /*
     * Movement is relative to the camera.
     *
     * W moves in the direction the camera is looking.
     * S moves backward from the camera.
     * A moves toward the left side of the screen.
     * D moves toward the right side of the screen.
     */
    getCameraForward(
      player.yaw,
      CAMERA_FORWARD
    );

    CAMERA_RIGHT
      .crossVectors(
        UP,
        CAMERA_FORWARD
      )
      .normalize();

    direction.addScaledVector(
      CAMERA_FORWARD,
      forwardAmount
    );

    direction.addScaledVector(
      CAMERA_RIGHT,
      sideAmount
    );

    direction.normalize();

    const movementSpeed =
      player.speed *
      (
        input.sprint
          ? player.sprintMultiplier
          : 1
      );

    const previousPosition =
      group.position.clone();

    group.position.addScaledVector(
      direction,
      movementSpeed * delta
    );

    group.position.x = THREE.MathUtils.clamp(
      group.position.x,
      -player.bounds,
      player.bounds
    );

    group.position.z = THREE.MathUtils.clamp(
      group.position.z,
      -player.bounds,
      player.bounds
    );

    /*
     * Basic circular collision detection.
     */
    for (const collider of colliders) {
      const dx =
        group.position.x -
        collider.x;

      const dz =
        group.position.z -
        collider.z;

      const minimumDistance =
        collider.radius + 0.55;

      const distanceSquared =
        dx * dx +
        dz * dz;

      if (
        distanceSquared <
        minimumDistance * minimumDistance
      ) {
        group.position.copy(previousPosition);
        break;
      }
    }

    /*
     * Rotate the avatar toward its movement direction.
     *
     * The avatar mesh faces -Z by default, which is why the direction
     * values are negated when calculating the desired facing angle.
     */
    const desiredFacing = Math.atan2(
      -direction.x,
      -direction.z
    );

    player.facing = dampAngle(
      player.facing,
      desiredFacing,
      12,
      delta
    );

    group.rotation.y = player.facing;

    player.walkTime +=
      delta *
      (
        input.sprint
          ? 13
          : 8.5
      );

    player.isMoving = true;
  } else {
    player.isMoving = false;
    player.walkTime += delta * 2.5;
  }

  animateAvatar(player);
}

export function updateCamera(
  camera,
  player,
  delta
) {
  const target = player.group.position
    .clone()
    .add(
      new THREE.Vector3(
        0,
        1.75,
        0
      )
    );

  const horizontalDistance =
    7.8 *
    Math.cos(player.pitch);

  const height =
    2.7 +
    5.1 *
    Math.sin(player.pitch);

  const forward = getCameraForward(
    player.yaw,
    CAMERA_FORWARD
  );

  /*
   * Place the camera behind the direction the player is viewing.
   *
   * Subtracting the forward vector keeps the camera behind the avatar,
   * while camera.lookAt(target) keeps it pointed at the player.
   */
  const desiredPosition = target
    .clone()
    .addScaledVector(
      forward,
      -horizontalDistance
    )
    .add(
      new THREE.Vector3(
        0,
        height,
        0
      )
    );

  /*
   * Smooth camera following.
   */
  const followAmount =
    1 -
    Math.exp(
      -12 * delta
    );

  camera.position.lerp(
    desiredPosition,
    followAmount
  );

  camera.lookAt(target);
}

function animateAvatar(player) {
  const {
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    torso,
    core
  } = player.parts;

  const movementIntensity =
    player.isMoving
      ? 0.72
      : 0.08;

  const swing =
    Math.sin(player.walkTime) *
    movementIntensity;

  leftArm.rotation.x = swing;
  rightArm.rotation.x = -swing;

  leftLeg.rotation.x = -swing;
  rightLeg.rotation.x = swing;

  torso.position.y =
    1.45 +
    Math.abs(
      Math.sin(
        player.walkTime * 2
      )
    ) *
    (
      player.isMoving
        ? 0.045
        : 0.012
    );

  const currentTime =
    performance.now();

  core.scale.setScalar(
    1 +
    Math.sin(
      currentTime * 0.004
    ) *
    0.08
  );

  core.material.emissiveIntensity =
    0.7 +
    Math.sin(
      currentTime * 0.005
    ) *
    0.25;
}

function dampAngle(
  current,
  target,
  lambda,
  delta
) {
  let difference =
    (
      target -
      current +
      Math.PI
    ) %
    (
      Math.PI * 2
    ) -
    Math.PI;

  if (difference < -Math.PI) {
    difference += Math.PI * 2;
  }

  return (
    current +
    difference *
    (
      1 -
      Math.exp(
        -lambda * delta
      )
    )
  );
}