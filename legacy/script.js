/* =========================================================
   Kenny Shao — Portfolio interactivity
   ========================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   Nav toggle
   --------------------------------------------------------- */
(function initNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelectorAll('.nav__link');
    if (!navToggle) return;

    navToggle.addEventListener('click', () => {
        document.body.classList.toggle('nav-open');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.body.classList.remove('nav-open');
        });
    });
})();

/* ---------------------------------------------------------
   Scroll reveal + capability bar fill
   --------------------------------------------------------- */
(function initReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('is-visible'));
        document.querySelectorAll('.capability__fill').forEach(fill => {
            fill.style.width = fill.dataset.score + '%';
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');

            const fill = entry.target.querySelector('.capability__fill');
            if (fill) fill.style.width = fill.dataset.score + '%';

            observer.unobserve(entry.target);
        });
    }, { threshold: 0.25 });

    revealEls.forEach(el => observer.observe(el));
})();

/* ---------------------------------------------------------
   Typing role line in the hero
   --------------------------------------------------------- */
(function initTyping() {
    const el = document.querySelector('.intro__role-text');
    if (!el) return;

    const roles = [
        'Full-Stack Developer',
        'AI / ML Enthusiast',
        'Neural Network Tinkerer',
        'Florida International University \'CS'
    ];

    if (prefersReducedMotion) {
        el.textContent = roles[0];
        return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const current = roles[roleIndex];

        if (!deleting) {
            charIndex++;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === current.length) {
                deleting = true;
                setTimeout(tick, 1400);
                return;
            }
        } else {
            charIndex--;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
            }
        }

        setTimeout(tick, deleting ? 35 : 65);
    }

    tick();
})();

/* ---------------------------------------------------------
   Ambient neural network canvas (hero background)
   --------------------------------------------------------- */
(function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, nodes;
    const NODE_COUNT = 46;
    const LINK_DIST = 150;
    const mouse = { x: null, y: null };

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
    }

    function makeNodes() {
        nodes = Array.from({ length: NODE_COUNT }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: Math.random() * 1.6 + 1,
            pulse: Math.random() * Math.PI * 2
        }));
    }

    function step() {
        ctx.clearRect(0, 0, width, height);

        nodes.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            n.pulse += 0.02;

            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;
        });

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i], b = nodes[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    ctx.strokeStyle = `rgba(139, 124, 255, ${0.16 * (1 - dist / LINK_DIST)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            if (mouse.x !== null) {
                const dx = nodes[i].x - mouse.x, dy = nodes[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 190) {
                    ctx.strokeStyle = `rgba(255, 180, 84, ${0.5 * (1 - dist / 190)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }

        nodes.forEach(n => {
            const glow = 0.6 + Math.sin(n.pulse) * 0.4;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(236, 238, 245, ${0.35 * glow})`;
            ctx.fill();
        });

        if (!prefersReducedMotion) requestAnimationFrame(step);
    }

    resize();
    makeNodes();
    step();
    if (prefersReducedMotion) step(); // draw a single static frame

    window.addEventListener('resize', () => { resize(); makeNodes(); });

    canvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });
})();

/* ---------------------------------------------------------
   Game 1: Perceptron Playground
   Click to drop labelled points, then train a linear
   perceptron live on canvas.
   --------------------------------------------------------- */
(function initPerceptron() {
    const canvas = document.getElementById('perceptron-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const W = 560, H = 360;
    canvas.width = W;
    canvas.height = H;

    let points = []; // {x, y, label: 1 | -1}
    let weights = { w1: 0, w2: 0, b: 0 };
    let training = false;
    let epoch = 0;
    let currentClass = 1;

    const classBtn = document.getElementById('perceptron-class');
    const trainBtn = document.getElementById('perceptron-train');
    const resetBtn = document.getElementById('perceptron-reset');
    const epochEl = document.getElementById('perceptron-epoch');
    const accEl = document.getElementById('perceptron-accuracy');

    function toFeature(px, py) {
        return { x: (px - W / 2) / (W / 2), y: (py - H / 2) / (H / 2) };
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // grid
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        for (let gx = 0; gx <= W; gx += 40) {
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
        }
        for (let gy = 0; gy <= H; gy += 40) {
            ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
        }

        // decision boundary: w1*x + w2*y + b = 0
        if (weights.w1 !== 0 || weights.w2 !== 0) {
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            const pts = [];
            [-1, 1].forEach(fx => {
                if (weights.w2 !== 0) {
                    const fy = -(weights.w1 * fx + weights.b) / weights.w2;
                    pts.push({ px: W / 2 + fx * (W / 2), py: H / 2 + fy * (H / 2) });
                }
            });
            if (pts.length === 2) {
                ctx.moveTo(pts[0].px, pts[0].py);
                ctx.lineTo(pts[1].px, pts[1].py);
                ctx.stroke();
            }
        }

        // points
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
            ctx.fillStyle = p.label === 1 ? '#ffb454' : '#8b7cff';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });
    }

    function accuracy() {
        if (!points.length) return 0;
        let correct = 0;
        points.forEach(p => {
            const f = toFeature(p.x, p.y);
            const pred = (weights.w1 * f.x + weights.w2 * f.y + weights.b) >= 0 ? 1 : -1;
            if (pred === p.label) correct++;
        });
        return Math.round((correct / points.length) * 100);
    }

    function updateStats() {
        epochEl.textContent = epoch;
        accEl.textContent = accuracy() + '%';
    }

    function trainStep() {
        let allCorrect = true;
        const lr = 0.15;

        points.forEach(p => {
            const f = toFeature(p.x, p.y);
            const pred = (weights.w1 * f.x + weights.w2 * f.y + weights.b) >= 0 ? 1 : -1;
            if (pred !== p.label) {
                allCorrect = false;
                weights.w1 += lr * p.label * f.x;
                weights.w2 += lr * p.label * f.y;
                weights.b += lr * p.label;
            }
        });

        epoch++;
        draw();
        updateStats();

        if (!allCorrect && epoch < 120 && training) {
            requestAnimationFrame(() => setTimeout(trainStep, prefersReducedMotion ? 0 : 60));
        } else {
            training = false;
            trainBtn.textContent = 'Train';
        }
    }

    canvas.addEventListener('pointerdown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        points.push({ x, y, label: currentClass });
        draw();
        updateStats();
    });

    classBtn.addEventListener('click', () => {
        currentClass *= -1;
        classBtn.textContent = currentClass === 1 ? 'Class: Signal ●' : 'Class: Noise ●';
        classBtn.classList.toggle('is-active', currentClass === -1);
    });

    trainBtn.addEventListener('click', () => {
        if (points.length < 2) return;
        training = !training;
        if (training) {
            trainBtn.textContent = 'Stop';
            trainStep();
        } else {
            trainBtn.textContent = 'Train';
        }
    });

    resetBtn.addEventListener('click', () => {
        points = [];
        weights = { w1: 0, w2: 0, b: 0 };
        epoch = 0;
        training = false;
        trainBtn.textContent = 'Train';
        draw();
        updateStats();
    });

    draw();
    updateStats();
})();

/* ---------------------------------------------------------
   Game 2: Weight Matching (memory match, ML-themed icons)
   --------------------------------------------------------- */
(function initMemory() {
    const grid = document.getElementById('memory-grid');
    if (!grid) return;

    const movesEl = document.getElementById('memory-moves');
    const winEl = document.getElementById('memory-win');
    const resetBtn = document.getElementById('memory-reset');

    const icons = ['🧠', '🔢', '📉', '🎯', '🔁', '🗂️'];

    let deck = [];
    let flipped = [];
    let matched = 0;
    let moves = 0;
    let lock = false;

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function build() {
        grid.innerHTML = '';
        deck = shuffle([...icons, ...icons]);
        flipped = [];
        matched = 0;
        moves = 0;
        lock = false;
        movesEl.textContent = '0';
        winEl.classList.remove('is-visible');

        deck.forEach((icon, i) => {
            const card = document.createElement('button');
            card.className = 'memory-card';
            card.setAttribute('aria-label', 'Hidden card');
            card.dataset.icon = icon;
            card.dataset.index = i;
            card.innerHTML = `
                <span class="memory-card__inner">
                    <span class="memory-card__face memory-card__face--back">?</span>
                    <span class="memory-card__face memory-card__face--front">${icon}</span>
                </span>`;
            card.addEventListener('click', () => flip(card));
            grid.appendChild(card);
        });
    }

    function flip(card) {
        if (lock) return;
        if (card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;
        if (flipped.length === 2) return;

        card.classList.add('is-flipped');
        flipped.push(card);

        if (flipped.length === 2) {
            moves++;
            movesEl.textContent = moves;
            const [a, b] = flipped;
            if (a.dataset.icon === b.dataset.icon) {
                a.classList.add('is-matched');
                b.classList.add('is-matched');
                flipped = [];
                matched++;
                if (matched === icons.length) {
                    winEl.classList.add('is-visible');
                }
            } else {
                lock = true;
                setTimeout(() => {
                    a.classList.remove('is-flipped');
                    b.classList.remove('is-flipped');
                    flipped = [];
                    lock = false;
                }, 750);
            }
        }
    }

    resetBtn.addEventListener('click', build);
    build();
})();