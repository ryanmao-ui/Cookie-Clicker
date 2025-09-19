// --- Cookie Clicker Deluxe ---
// Organized with Classes and Modules

// --- Pixel Effect Engine ---
class PixelCrumb {
  constructor(x, y, angle, speed, color) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 40 + Math.random() * 20;
    this.age = 0;
    this.size = 3 + Math.random() * 3;
    this.color = color;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.15; // gravity
    this.age++;
    this.size *= 0.98;
  }
  draw(ctx) {
    ctx.globalAlpha = Math.max(0, 1 - this.age / this.life);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
  isAlive() {
    return this.age < this.life;
  }
}

class PixelEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.pixels = [];
    this.running = false;
  }
  burst(n, x, y) {
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const colors = ['#d2b48c', '#f3e5ab', '#a67c52', '#fff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.pixels.push(new PixelCrumb(x, y, angle, speed, color));
    }
    if (!this.running) this.run();
  }
  run() {
    this.running = true;
    const loop = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.pixels = this.pixels.filter(p => p.isAlive());
      for (const p of this.pixels) {
        p.update();
        p.draw(this.ctx);
      }
      if (this.pixels.length > 0) {
        requestAnimationFrame(loop);
      } else {
        this.running = false;
      }
    };
    loop();
  }
}

// --- Game Classes ---
class GameState {
  constructor() {
    this.cookies = 0;
    this.cookiesPerClick = 1;
    this.cookiesPerSec = 0;
    this.upgrades = [];
    this.autoClickers = [];
    this.achievements = [];
  }
  toJSON() {
    return {
      cookies: this.cookies,
      cookiesPerClick: this.cookiesPerClick,
      cookiesPerSec: this.cookiesPerSec,
      upgrades: this.upgrades.map(u => u.level),
      autoClickers: this.autoClickers.map(a => a.level),
      achievements: this.achievements.map(a => a.unlocked)
    };
  }
  fromJSON(data) {
    this.cookies = data.cookies;
    this.cookiesPerClick = data.cookiesPerClick;
    this.cookiesPerSec = data.cookiesPerSec;
    this.upgrades.forEach((u, i) => u.level = data.upgrades[i]);
    this.autoClickers.forEach((a, i) => a.level = data.autoClickers[i]);
    this.achievements.forEach((a, i) => a.unlocked = data.achievements[i]);
  }
}

class Upgrade {
  constructor(name, baseCost, cpcGain, desc) {
    this.name = name;
    this.baseCost = baseCost;
    this.cpcGain = cpcGain;
    this.level = 0;
    this.desc = desc || "";
  }
  get cost() {
    return Math.floor(this.baseCost * Math.pow(1.25, this.level));
  }
  buy(game) {
    if (game.cookies >= this.cost) {
      game.cookies -= this.cost;
      this.level++;
      game.cookiesPerClick += this.cpcGain;
      return true;
    }
    return false;
  }
}

class AutoClicker {
  constructor(name, baseCost, cpsGain, desc) {
    this.name = name;
    this.baseCost = baseCost;
    this.cpsGain = cpsGain;
    this.level = 0;
    this.desc = desc || "";
  }
  get cost() {
    return Math.floor(this.baseCost * Math.pow(1.30, this.level));
  }
  buy(game) {
    if (game.cookies >= this.cost) {
      game.cookies -= this.cost;
      this.level++;
      game.cookiesPerSec += this.cpsGain;
      return true;
    }
    return false;
  }
}

class Achievement {
  constructor(name, desc, checkFunc) {
    this.name = name;
    this.desc = desc;
    this.checkFunc = checkFunc;
    this.unlocked = false;
  }
  check(game) {
    if (!this.unlocked && this.checkFunc(game)) {
      this.unlocked = true;
      return true;
    }
    return false;
  }
}

// --- Game Setup ---
const state = new GameState();
state.upgrades = [
  new Upgrade("Double Cookies", 25, 1, "Your clicks are twice as powerful."),
  new Upgrade("Super Clicks", 200, 5, "Supercharge your finger strength!"),
  new Upgrade("Mega Clicks", 1500, 30, "Clicks rain cookies!"),
  new Upgrade("Cookie Factory", 8000, 150, "Industrial clicking."),
  new Upgrade("Clickstorm", 32000, 500, "Unleash a storm of cookies."),
  new Upgrade("Quantum Tap", 150000, 2000, "Tap the quantum realm for cookies."),
  new Upgrade("Pixel Power", 600000, 8000, "Harness pixel energy."),
  new Upgrade("Golden Touch", 3200000, 40000, "Everything you touch turns into cookies!"),
  new Upgrade("Cookie Universe", 20000000, 150000, "Become the master of cookies.")
];
state.autoClickers = [
  new AutoClicker("Grandma", 100, 1, "Grandma bakes cookies for you."),
  new AutoClicker("Robot", 1000, 8, "Automate your cookie production."),
  new AutoClicker("Cookie Mine", 10000, 50, "Mine cookies from the earth."),
  new AutoClicker("Portal", 50000, 250, "Portal to the cookie dimension."),
  new AutoClicker("Time Machine", 250000, 1200, "Harvest cookies from the past."),
  new AutoClicker("Pixel Sprite", 900000, 5000, "Tiny sprite delivers pixel cookies."),
  new AutoClicker("Cookie Meteor", 4800000, 22000, "Meteor showers of cookies."),
  new AutoClicker("Galactic Oven", 20000000, 100000, "Intergalactic baking."),
  new AutoClicker("Cookie God", 80000000, 500000, "Divine cookie creation.")
];
state.achievements = [
  new Achievement("First Cookie", "Earn your first cookie.", g => g.cookies >= 1),
  new Achievement("Hundredaire", "Reach 100 cookies.", g => g.cookies >= 100),
  new Achievement("Shopper", "Purchase any upgrade.", g => g.upgrades.some(u => u.level > 0)),
  new Achievement("Auto Life", "Hire your first auto-clicker.", g => g.autoClickers.some(a => a.level > 0)),
  new Achievement("Millionaire", "Reach 1,000,000 cookies.", g => g.cookies >= 1_000_000),
  new Achievement("Clicker King", "Upgrade click power to 100+.", g => g.cookiesPerClick >= 100),
  new Achievement("Automation Overlord", "Reach 100+ cookies/sec.", g => g.cookiesPerSec >= 100),
  new Achievement("Pixel Burst", "Unlock the Pixel Power upgrade.", g => state.upgrades[6].level > 0),
  new Achievement("Golden Touch", "Unlock the Golden Touch upgrade.", g => state.upgrades[7].level > 0),
  new Achievement("Cookie God", "Hire the Cookie God auto-clicker.", g => state.autoClickers[8].level > 0),
];

// --- DOM Elements ---
const elCookies = document.getElementById('cookies');
const elCPS = document.getElementById('cookies-per-sec');
const elCookieBtn = document.getElementById('cookie-btn');
const elUpgrades = document.getElementById('upgrades');
const elAutoclickers = document.getElementById('autoclickers');
const elAchievements = document.getElementById('achievement-list');
const elSaveBtn = document.getElementById('save-btn');
const elLoadBtn = document.getElementById('load-btn');
const elResetBtn = document.getElementById('reset-btn');
const elPixelCanvas = document.getElementById('pixel-canvas');

// --- Pixel Engine Setup ---
const pixelEngine = new PixelEngine(elPixelCanvas);

// --- UI Rendering ---
function render() {
  elCookies.textContent = Math.floor(state.cookies);
  elCPS.textContent = state.cookiesPerSec.toFixed(1);

  // Upgrades
  elUpgrades.innerHTML = '';
  state.upgrades.forEach((u, i) => {
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.innerHTML = `<span>
      <strong>${u.name}</strong> (Lvl ${u.level})<br>
      +${u.cpcGain} cookies/click<br>
      <small>${u.desc}</small>
      </span>
      <span>Cost: ${u.cost} <button ${state.cookies<u.cost?'disabled':''} id="upgrade-${i}">Buy</button></span>`;
    elUpgrades.appendChild(div);
    div.querySelector('button').onclick = () => { u.buy(state); render(); };
  });

  // AutoClickers
  elAutoclickers.innerHTML = '';
  state.autoClickers.forEach((a, i) => {
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.innerHTML = `<span>
      <strong>${a.name}</strong> (Lvl ${a.level})<br>
      +${a.cpsGain} cookies/sec<br>
      <small>${a.desc}</small>
      </span>
      <span>Cost: ${a.cost} <button ${state.cookies<a.cost?'disabled':''} id="autoclicker-${i}">Buy</button></span>`;
    elAutoclickers.appendChild(div);
    div.querySelector('button').onclick = () => { a.buy(state); render(); };
  });

  // Achievements
  elAchievements.innerHTML = '';
  state.achievements.forEach(a => {
    const li = document.createElement('li');
    li.className = 'achievement' + (a.unlocked ? ' unlocked' : '');
    li.innerHTML = `<strong>${a.name}</strong>: ${a.desc}`;
    elAchievements.appendChild(li);
  });
}

function checkAchievements() {
  state.achievements.forEach(a => {
    if (a.check(state)) render();
  });
}

// --- Game Loop ---
elCookieBtn.onclick = (e) => {
  state.cookies += state.cookiesPerClick;
  render();
  checkAchievements();
  // Burst pixel crumbs at click
  const rect = elCookieBtn.getBoundingClientRect();
  pixelEngine.burst(18, 70, 70); // Center of canvas
};

setInterval(() => {
  state.cookies += state.cookiesPerSec / 10;
  render();
  checkAchievements();
}, 100);

// --- Save/Load/Reset ---
function saveGame() {
  localStorage.setItem('cookieClickerSave', JSON.stringify(state.toJSON()));
  alert('Game saved!');
}
function loadGame() {
  const data = localStorage.getItem('cookieClickerSave');
  if (!data) return alert('No save found!');
  state.fromJSON(JSON.parse(data));
  render();
  alert('Game loaded!');
}
function resetGame() {
  if (!confirm('Are you sure you want to reset all progress?')) return;
  state.cookies = 0;
  state.cookiesPerClick = 1;
  state.cookiesPerSec = 0;
  state.upgrades.forEach(u => u.level = 0);
  state.autoClickers.forEach(a => a.level = 0);
  state.achievements.forEach(a => a.unlocked = false);
  render();
  alert('Game reset!');
}
elSaveBtn.onclick = saveGame;
elLoadBtn.onclick = loadGame;
elResetBtn.onclick = resetGame;

// --- Initial Render ---
render();
