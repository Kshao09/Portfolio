import { PortfolioGame } from './core/game.js';

const canvas = document.getElementById('game-canvas');
const enterButton = document.getElementById('enter-world');
const game = new PortfolioGame(canvas);

if (game.init()) {
  enterButton.addEventListener('click', () => game.start());
}
