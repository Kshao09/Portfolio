import { ZONES } from '../config/content.js';

export class UIController {
  constructor() {
    this.shell = document.getElementById('game-shell');
    this.boot = document.getElementById('boot-screen');
    this.loading = document.getElementById('loading-screen');
    this.hud = document.getElementById('hud');
    this.zoneName = document.getElementById('zone-name');
    this.questText = document.getElementById('quest-text');
    this.nodeCount = document.getElementById('node-count');
    this.prompt = document.getElementById('interaction-prompt');
    this.promptLabel = document.getElementById('interaction-label');
    this.panel = document.getElementById('info-panel');
    this.panelKicker = document.getElementById('panel-kicker');
    this.panelTitle = document.getElementById('panel-title');
    this.panelBody = document.getElementById('panel-body');
    this.panelActions = document.getElementById('panel-actions');
    this.map = document.getElementById('world-map');
    this.toastStack = document.getElementById('toast-stack');
    this.miniMap = document.getElementById('mini-map');
    this.mapContext = this.miniMap.getContext('2d');
    this.currentZoneId = 'hub';
    this.panelOpen = false;
    this.mapOpen = false;

    document.querySelectorAll('[data-close-panel]').forEach(el => el.addEventListener('click', () => this.closePanel()));
    document.querySelectorAll('[data-close-map]').forEach(el => el.addEventListener('click', () => this.closeMap()));
  }

  hideLoading() {
    this.loading.classList.add('is-hidden');
    setTimeout(() => { this.loading.hidden = true; }, 380);
  }

  startGame() {
    this.boot.classList.add('is-hidden');
    this.hud.hidden = false;
  }

  showError() {
    this.loading.hidden = true;
    this.boot.hidden = true;
    document.getElementById('webgl-error').hidden = false;
  }

  setPaused(paused) { this.shell.classList.toggle('is-paused', paused); }

  updateZone(zone) {
    this.zoneName.textContent = zone.name;
    this.questText.textContent = zone.quest;
    if (this.currentZoneId !== zone.id) {
      this.currentZoneId = zone.id;
      this.toast(`<strong>Environment discovered:</strong> ${zone.name}`);
    }
  }

  updateNodeCount(count, total) {
    this.nodeCount.textContent = String(count);
    if (count === total) {
      this.questText.textContent = 'All knowledge nodes collected. The portfolio graph is fully connected.';
      this.toast('<strong>Graph converged:</strong> all knowledge nodes collected.');
    }
  }

  showPrompt(label) {
    this.promptLabel.textContent = label;
    this.prompt.hidden = false;
  }

  hidePrompt() { this.prompt.hidden = true; }

  openPanel(panel) {
    this.panelKicker.textContent = panel.kicker;
    this.panelTitle.textContent = panel.title;
    this.panelBody.innerHTML = panel.body;
    this.panelActions.innerHTML = '';
    for (const action of panel.actions || []) {
      const link = document.createElement('a');
      link.className = 'secondary-button';
      link.href = action.href;
      link.textContent = action.label;
      if (/^https?:/.test(action.href)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      this.panelActions.appendChild(link);
    }
    this.panel.hidden = false;
    this.panelOpen = true;
    this.setPaused(true);
  }

  closePanel() {
    if (!this.panelOpen) return;
    this.panel.hidden = true;
    this.panelOpen = false;
    this.setPaused(this.mapOpen);
    window.dispatchEvent(new CustomEvent('portfolio:resume-requested'));
  }

  toggleMap() {
    this.mapOpen ? this.closeMap() : this.openMap();
  }

  openMap() {
    this.map.hidden = false;
    this.mapOpen = true;
    this.setPaused(true);
  }

  closeMap() {
    if (!this.mapOpen) return;
    this.map.hidden = true;
    this.mapOpen = false;
    this.setPaused(this.panelOpen);
    window.dispatchEvent(new CustomEvent('portfolio:resume-requested'));
  }

  toast(html) {
    const item = document.createElement('div');
    item.className = 'toast';
    item.innerHTML = html;
    this.toastStack.appendChild(item);
    setTimeout(() => {
      item.classList.add('is-leaving');
      setTimeout(() => item.remove(), 320);
    }, 3000);
  }

  drawMiniMap(player, zones = ZONES) {
    const ctx = this.mapContext;
    const size = this.miniMap.width;
    const scale = size / 112;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);

    ctx.fillStyle = 'rgba(3, 11, 20, .82)';
    ctx.beginPath();
    ctx.arc(0, 0, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(95,247,223,.14)';
    ctx.lineWidth = 1;
    for (let r = 24; r < size / 2; r += 24) {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(-size/2,0); ctx.lineTo(size/2,0); ctx.moveTo(0,-size/2); ctx.lineTo(0,size/2); ctx.stroke();

    zones.forEach(zone => {
      ctx.fillStyle = zone.color;
      ctx.globalAlpha = zone.id === this.currentZoneId ? .95 : .48;
      ctx.beginPath();
      ctx.arc(zone.center[0] * scale, zone.center[2] * scale, zone.id === this.currentZoneId ? 5 : 3.2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.translate(player.group.position.x * scale, player.group.position.z * scale);
    ctx.rotate(-player.facing + Math.PI);
    ctx.fillStyle = '#edf8ff';
    ctx.strokeStyle = '#5ff7df';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(5.5, 6);
    ctx.lineTo(0, 3.8);
    ctx.lineTo(-5.5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
