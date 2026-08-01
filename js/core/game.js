import * as THREE from 'three';

import {
  createPlayer,
  updateCamera,
  updatePlayer
} from './player.js';

import {
  animateWorld,
  createWorld,
  emitScan
} from './world.js';

import {
  collectNearby,
  getCurrentZone,
  getNearestBeacon
} from './interactions.js';

import {
  UIController
} from './ui.js';

import {
  COLLECTIBLES
} from '../config/content.js';

export class PortfolioGame {
  constructor(canvas) {
    this.canvas = canvas;

    this.ui = new UIController();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      58,
      1,
      0.1,
      250
    );

    this.clock = new THREE.Clock();

    this.renderer = null;
    this.world = null;
    this.player = null;

    this.started = false;
    this.pointerLocked = false;

    this.nearestBeacon = null;
    this.collectedCount = 0;
    this.lastZoneId = 'hub';

    this.boundAnimate =
      this.animate.bind(this);
  }

  init() {
    try {
      this.renderer =
        new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          powerPreference: 'high-performance'
        });
    } catch (error) {
      console.error(
        'Unable to initialize WebGL:',
        error
      );

      this.ui.showError();
      return false;
    }

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        1.7
      )
    );

    this.renderer.shadowMap.enabled = true;

    this.renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    this.renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    this.renderer.toneMappingExposure =
      1.18;

    this.world =
      createWorld(this.scene);

    this.player =
      createPlayer(this.scene);

    this.updateSize();

    /*
     * Position the camera immediately so it does not begin at the
     * default origin before the animation loop starts.
     */
    updateCamera(
      this.camera,
      this.player,
      1
    );

    this.bindEvents();

    this.ui.hideLoading();

    this.renderer.setAnimationLoop(
      this.boundAnimate
    );

    return true;
  }

  start() {
    if (this.started) {
      return;
    }

    this.started = true;

    this.ui.startGame();

    this.requestPointerLock();

    this.ui.toast(
      '<strong>Simulation online.</strong> ' +
      'Follow the glowing beacons and collect knowledge nodes.'
    );
  }

  requestPointerLock() {
    if (
      !this.started ||
      this.ui.panelOpen ||
      this.ui.mapOpen
    ) {
      return;
    }

    this.canvas.requestPointerLock?.();
  }

  bindEvents() {
    window.addEventListener(
      'resize',
      () => this.updateSize()
    );

    /*
     * Clicking the canvas restores mouse control after the pointer
     * has been released.
     */
    this.canvas.addEventListener(
      'click',
      () => this.requestPointerLock()
    );

    document.addEventListener(
      'pointerlockchange',
      () => {
        this.pointerLocked =
          document.pointerLockElement ===
          this.canvas;

        this.ui.setPaused(
          !this.pointerLocked ||
          this.ui.panelOpen ||
          this.ui.mapOpen
        );
      }
    );

    document.addEventListener(
      'mousemove',
      event => {
        if (
          !this.pointerLocked ||
          !this.started ||
          this.ui.panelOpen ||
          this.ui.mapOpen
        ) {
          return;
        }

        /*
         * Standard third-person mouse look:
         *
         * Moving the mouse right increases yaw and turns the camera right.
         * Moving the mouse left decreases yaw and turns the camera left.
         */
        this.player.yaw +=
          event.movementX *
          0.0024;

        /*
         * Moving the mouse upward raises the view.
         * Moving the mouse downward lowers the view.
         */
        this.player.pitch =
          THREE.MathUtils.clamp(
            this.player.pitch -
            event.movementY *
            0.0017,
            -0.08,
            0.62
          );
      }
    );

    window.addEventListener(
      'keydown',
      event => {
        this.handleKey(
          event,
          true
        );
      }
    );

    window.addEventListener(
      'keyup',
      event => {
        this.handleKey(
          event,
          false
        );
      }
    );

    window.addEventListener(
      'blur',
      () => this.clearInput()
    );

    /*
     * The UI sends this event after a panel or map closes.
     */
    window.addEventListener(
      'portfolio:resume-requested',
      () => {
        if (!this.started) {
          return;
        }

        setTimeout(
          () => this.requestPointerLock(),
          80
        );
      }
    );
  }

  handleKey(
    event,
    pressed
  ) {
    const key = event.code;

    const movementMap = {
      KeyW: 'forward',
      ArrowUp: 'forward',

      KeyS: 'backward',
      ArrowDown: 'backward',

      KeyA: 'left',
      ArrowLeft: 'left',

      KeyD: 'right',
      ArrowRight: 'right',

      ShiftLeft: 'sprint',
      ShiftRight: 'sprint'
    };

    if (movementMap[key]) {
      event.preventDefault();

      this.player.input[
        movementMap[key]
      ] = pressed;

      return;
    }

    /*
     * The remaining controls should only run once when a key is first
     * pressed, not repeatedly while it is held.
     */
    if (
      !pressed ||
      event.repeat
    ) {
      return;
    }

    if (
      key === 'KeyE' &&
      this.nearestBeacon &&
      !this.ui.panelOpen &&
      !this.ui.mapOpen
    ) {
      document.exitPointerLock?.();

      this.ui.openPanel(
        this.nearestBeacon.panel
      );

      return;
    }

    if (
      key === 'Space' &&
      !this.ui.panelOpen &&
      !this.ui.mapOpen
    ) {
      event.preventDefault();

      emitScan(
        this.scene,
        this.world,
        this.player.group.position
      );

      this.ui.toast(
        '<strong>Scan pulse:</strong> ' +
        'nearby beacons highlighted.'
      );

      return;
    }

    if (key === 'KeyM') {
      document.exitPointerLock?.();

      this.ui.toggleMap();
      return;
    }

    if (key === 'Escape') {
      if (this.ui.panelOpen) {
        this.ui.closePanel();
      }

      if (this.ui.mapOpen) {
        this.ui.closeMap();
      }
    }
  }

  clearInput() {
    Object.keys(
      this.player.input
    ).forEach(key => {
      this.player.input[key] = false;
    });
  }

  updateSize() {
    if (!this.renderer) {
      return;
    }

    const width =
      this.canvas.clientWidth;

    const height =
      this.canvas.clientHeight;

    this.renderer.setSize(
      width,
      height,
      false
    );

    this.camera.aspect =
      width /
      Math.max(
        height,
        1
      );

    this.camera.updateProjectionMatrix();
  }

  animate() {
    const delta = Math.min(
      this.clock.getDelta(),
      0.05
    );

    const elapsed =
      this.clock.elapsedTime;

    const active =
      this.started &&
      this.pointerLocked &&
      !this.ui.panelOpen &&
      !this.ui.mapOpen;

    if (active) {
      updatePlayer(
        this.player,
        delta,
        this.world.colliders
      );
    }

    /*
     * Continue updating the camera even while the player is paused so
     * it remains smoothly attached to the avatar.
     */
    updateCamera(
      this.camera,
      this.player,
      delta
    );

    animateWorld(
      this.world,
      elapsed,
      delta
    );

    this.nearestBeacon =
      getNearestBeacon(
        this.player.group.position,
        this.world.beacons
      );

    if (
      this.nearestBeacon &&
      active
    ) {
      this.ui.showPrompt(
        this.nearestBeacon.label
      );
    } else {
      this.ui.hidePrompt();
    }

    collectNearby(
      this.player.group.position,
      this.world.collectibles,
      collectible => {
        this.collectedCount += 1;

        this.ui.updateNodeCount(
          this.collectedCount,
          COLLECTIBLES.length
        );

        this.ui.toast(
          '<strong>Knowledge node acquired:</strong> ' +
          collectible.message
        );
      }
    );

    const zone =
      getCurrentZone(
        this.player.group.position,
        this.world.zones
      );

    this.ui.updateZone(zone);

    this.ui.drawMiniMap(
      this.player,
      this.world.zones
    );

    this.renderer.render(
      this.scene,
      this.camera
    );
  }
}