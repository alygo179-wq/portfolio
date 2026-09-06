document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- theme toggle (persisted, respects system preference) ---------------- */
(function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage unavailable — theme just won't persist */ }
  }

  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) { /* ignore */ }

  if (saved === 'light' || saved === 'dark') {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  }
  // otherwise the dark default already set in the HTML stands

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  }
})();

/* ---------------- boot sequence ---------------- */
(function initBootSequence() {
  const bootLog = document.getElementById('bootLog');
  if (!bootLog) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return; // static fallback text already in the HTML; CSS fade is near-instant too

  const lines = [
    'booting portfolio.service...',
    'mounting /home/ali ... <span class="boot-ok">OK</span>',
    'loading skills.json ... <span class="boot-ok">OK</span>',
    'starting neural-net.py ... <span class="boot-ok">OK</span>',
    'welcome, visitor.'
  ];

  bootLog.innerHTML = '';
  let lineIndex = 0;

  function typeLine() {
    if (lineIndex >= lines.length) return;
    const raw = lines[lineIndex];
    // type the plain text fast, then swap in the highlighted "OK" span at the end of the line
    const plain = raw.replace(/<[^>]+>/g, '').replace('OK', '');
    let charIndex = 0;
    const lineEl = document.createElement('div');
    bootLog.appendChild(lineEl);

    function typeChar() {
      if (charIndex <= plain.length) {
        lineEl.textContent = plain.slice(0, charIndex);
        charIndex++;
        setTimeout(typeChar, 8);
      } else {
        lineEl.innerHTML = raw; // reveal the full line with its markup (e.g. the OK span)
        lineIndex++;
        setTimeout(typeLine, 90);
      }
    }
    typeChar();
  }
  typeLine();
})();

/* ---------------- nav toggle ---------------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

/* ---------------- scroll progress bar ---------------- */
const progressBar = document.getElementById('progressBar');
function updateProgress() {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
}
document.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ---------------- reveal on scroll ---------------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));
// hero reveals immediately
document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('is-visible'));

/* ---------------- terminal typewriter ---------------- */
(function typeCommand() {
  const el = document.getElementById('typedCmd');
  if (!el) return;
  const text = './explore_portfolio.sh --scroll';
  let i = 0;
  function tick() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(tick, 45);
    }
  }
  setTimeout(tick, 900);
})();

/* ---------------- custom cursor ---------------- */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

if (!isCoarsePointer && cursorDot && cursorRing) {
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top = my + 'px';
  });

  function ringLoop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top = ry + 'px';
    requestAnimationFrame(ringLoop);
  }
  ringLoop();

  document.querySelectorAll('a, button, .tilt, .tilt-soft, .skill-ring span, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
  });
}

/* ---------------- magnetic buttons ---------------- */
if (!isCoarsePointer) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ---------------- 3D tilt: photo frame, terminal window, cert cards ---------------- */
if (!isCoarsePointer) {
  document.querySelectorAll('.tilt').forEach(card => {
    const maxTilt = parseFloat(card.dataset.tiltMax) || 16;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rotateY = (px - 0.5) * maxTilt;
      const rotateX = (0.5 - py) * maxTilt;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });
}

/* ---------------- project cards: click/keyboard to flip ---------------- */
document.querySelectorAll('.project-card').forEach(card => {
  function toggleFlip() {
    const flipped = card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
  }
  card.addEventListener('click', toggleFlip);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFlip();
    }
  });
  // don't let clicking the back-face link also re-toggle the flip mid-navigation
  const link = card.querySelector('.card-link');
  if (link) link.addEventListener('click', (e) => e.stopPropagation());

  // subtle shine follows cursor on the front face too
  const front = card.querySelector('.card-front');
  if (front && !isCoarsePointer) {
    front.addEventListener('mousemove', (e) => {
      const r = front.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      front.style.setProperty('--mx', (px * 100) + '%');
      front.style.setProperty('--my', (py * 100) + '%');
    });
  }
});

/* ---------------- skill ring: single JS-driven rotation (auto-spin + drag + hover-pause) ---------------- */
const skillRing = document.getElementById('skillRing');
const skillRingWrap = document.getElementById('skillRingWrap');
if (skillRing) {
  const tags = skillRing.querySelectorAll('span');
  const n = tags.length;
  const radius = Math.max(210, n * 26);
  tags.forEach((tag, i) => {
    const angle = (360 / n) * i;
    tag.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
  });

  let rotation = 0;
  let isDragging = false;
  let isHoverPaused = false;
  let startX = 0;
  let dragBaseRotation = 0;
  const AUTO_DEGREES_PER_SEC = 360 / 22; // one full turn per ~22s, matching the old CSS timing

  skillRingWrap.addEventListener('mouseenter', () => { isHoverPaused = true; });
  skillRingWrap.addEventListener('mouseleave', () => { isHoverPaused = false; });

  skillRingWrap.addEventListener('pointerdown', (e) => {
    isDragging = true;
    isHoverPaused = true;
    startX = e.clientX;
    dragBaseRotation = rotation;
    skillRingWrap.setPointerCapture(e.pointerId);
  });

  skillRingWrap.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    rotation = dragBaseRotation + delta * 0.4;
  });

  window.addEventListener('pointerup', () => { isDragging = false; });

  let lastFrameTime = performance.now();
  function spinLoop(now) {
    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;
    if (!isDragging && !isHoverPaused) {
      rotation += AUTO_DEGREES_PER_SEC * dt;
    }
    skillRing.style.transform = `rotateY(${rotation}deg)`;
    requestAnimationFrame(spinLoop);
  }
  requestAnimationFrame(spinLoop);
}

/* ---------------- Three.js terrain hero (syntax-highlight palette + constellation) ---------------- */
(function initTerrain() {
  const canvas = document.getElementById('terrain-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const hero = document.getElementById('top');
  let width = hero.clientWidth, height = hero.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 5.5, 11);
  camera.lookAt(0, 0.5, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const segs = 46;
  const geo = new THREE.PlaneGeometry(26, 18, segs, segs);
  geo.rotateX(-Math.PI / 2.35);
  const pos = geo.attributes.position;
  function heightAt(x, z) {
    return (
      Math.sin(x * 0.35) * 1.1 +
      Math.cos(z * 0.28) * 1.0 +
      Math.sin((x + z) * 0.18) * 1.4 +
      Math.cos(x * 0.6 - z * 0.2) * 0.5
    );
  }
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, heightAt(pos.getX(i), pos.getY(i)));
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshBasicMaterial({ color: 0x7EE787, wireframe: true, transparent: true, opacity: 0.26 });
  const terrain = new THREE.Mesh(geo, mat);
  terrain.position.y = -1.2;
  scene.add(terrain);

  const mat2 = new THREE.MeshBasicMaterial({ color: 0xC792EA, wireframe: true, transparent: true, opacity: 0.13 });
  const terrainFar = new THREE.Mesh(geo, mat2);
  terrainFar.position.set(0, -1.0, -10);
  terrainFar.scale.set(1.6, 1, 1.6);
  scene.add(terrainFar);

  // floating nodes
  const nodeGroup = new THREE.Group();
  const nodeGeo = new THREE.IcosahedronGeometry(0.16, 0);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x82AAFF, wireframe: true, transparent: true, opacity: 0.5 });
  const nodes = [];
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(nodeGeo, nodeMat);
    m.position.set(
      (Math.random() - 0.5) * 16,
      Math.random() * 3 + 0.5,
      (Math.random() - 0.5) * 10 - 2
    );
    m.userData.speed = 0.2 + Math.random() * 0.3;
    m.userData.offset = Math.random() * Math.PI * 2;
    nodeGroup.add(m);
    nodes.push(m);
  }
  scene.add(nodeGroup);

  // constellation lines connecting nearby nodes — updated every frame
  const maxPairs = (nodes.length * (nodes.length - 1)) / 2;
  const linePositions = new Float32Array(maxPairs * 2 * 3);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x6FA8AE, transparent: true, opacity: 0.16 });
  const constellation = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(constellation);
  const CONNECT_DIST = 5.2;

  let targetRotY = 0, targetRotX = 0;
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  function onResize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();

    targetRotY += (mouseX * 0.35 - targetRotY) * 0.03;
    targetRotX += (mouseY * 0.15 - targetRotX) * 0.03;
    scene.rotation.y = targetRotY;
    scene.rotation.x = targetRotX;

    terrain.rotation.z = Math.sin(t * 0.05) * 0.02;
    terrainFar.rotation.z = -Math.sin(t * 0.04) * 0.02;

    nodes.forEach(n => {
      n.position.y += Math.sin(t * n.userData.speed + n.userData.offset) * 0.0025;
      n.rotation.x += 0.003;
      n.rotation.y += 0.004;
    });

    // rebuild constellation edges each frame
    let idx = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i].position, b = nodes[j].position;
        const d = a.distanceTo(b);
        if (d < CONNECT_DIST) {
          const base = idx * 6;
          linePositions[base] = a.x; linePositions[base + 1] = a.y; linePositions[base + 2] = a.z;
          linePositions[base + 3] = b.x; linePositions[base + 4] = b.y; linePositions[base + 5] = b.z;
          idx++;
        }
      }
    }
    lineGeo.setDrawRange(0, idx * 2);
    lineGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ---------------- Three.js neural network (currently exploring) ---------------- */
(function initNeuralNet() {
  const canvas = document.getElementById('neuralnet-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  const container = canvas.parentElement;

  let width = container.clientWidth, height = container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0.4, 7.5);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const group = new THREE.Group();
  scene.add(group);

  // three layers: input (data), hidden (AI/processing), output (insight)
  const layerSizes = [4, 6, 3];
  const layerX = [-2.6, 0, 2.6];
  const layerColors = [0x82AAFF, 0xC792EA, 0x7EE787];
  const layers = [];

  layerSizes.forEach((size, li) => {
    const layerNodes = [];
    for (let i = 0; i < size; i++) {
      const y = (i - (size - 1) / 2) * 0.85;
      const z = (Math.random() - 0.5) * 0.6;
      const geo = new THREE.SphereGeometry(0.11, 12, 12);
      const mat = new THREE.MeshBasicMaterial({ color: layerColors[li] });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(layerX[li], y, z);
      group.add(mesh);

      // faint outer ring for a glow-ish look
      const ringGeo = new THREE.SphereGeometry(0.2, 10, 10);
      const ringMat = new THREE.MeshBasicMaterial({ color: layerColors[li], wireframe: true, transparent: true, opacity: 0.25 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      mesh.add(ring);

      layerNodes.push(mesh);
    }
    layers.push(layerNodes);
  });

  // edges between consecutive layers
  const edgePairs = [];
  const edgeVerts = [];
  for (let li = 0; li < layers.length - 1; li++) {
    layers[li].forEach(a => {
      layers[li + 1].forEach(b => {
        edgePairs.push([a, b]);
        edgeVerts.push(a.position.x, a.position.y, a.position.z, b.position.x, b.position.y, b.position.z);
      });
    });
  }
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgeVerts, 3));
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x6B7685, transparent: true, opacity: 0.22 });
  const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
  group.add(edgeLines);

  // traveling "data" packets along random edges
  const packetCount = 10;
  const packetGeo = new THREE.SphereGeometry(0.055, 8, 8);
  const packets = [];
  for (let i = 0; i < packetCount; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(packetGeo, mat);
    const edge = edgePairs[Math.floor(Math.random() * edgePairs.length)];
    mesh.userData.edge = edge;
    mesh.userData.t = Math.random();
    mesh.userData.speed = 0.25 + Math.random() * 0.25;
    group.add(mesh);
    packets.push(mesh);
  }

  let mouseX = 0, mouseY = 0;
  container.addEventListener('mousemove', (e) => {
    const r = container.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width) - 0.5;
    mouseY = ((e.clientY - r.top) / r.height) - 0.5;
  });

  function onResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  let rotY = 0, rotX = 0;
  const clock = new THREE.Clock();
  function animate() {
    const dt = Math.min(clock.getDelta(), 0.05);

    rotY += (mouseX * 0.5 - rotY) * 0.04;
    rotX += (mouseY * 0.25 - rotX) * 0.04;
    group.rotation.y = rotY + Math.sin(clock.elapsedTime * 0.15) * 0.08;
    group.rotation.x = rotX;

    packets.forEach(p => {
      p.userData.t += dt * p.userData.speed;
      if (p.userData.t >= 1) {
        p.userData.t = 0;
        p.userData.edge = edgePairs[Math.floor(Math.random() * edgePairs.length)];
      }
      const [a, b] = p.userData.edge;
      p.position.lerpVectors(a.position, b.position, p.userData.t);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ---------------- Three.js signature orb (footer) ---------------- */
(function initSignatureOrb() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  const container = canvas.parentElement;

  let width = container.clientWidth, height = container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const group = new THREE.Group();
  scene.add(group);

  // core wireframe icosahedron
  const coreGeo = new THREE.IcosahedronGeometry(1.15, 0);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xC792EA, wireframe: true, transparent: true, opacity: 0.55 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // faint outer shell, counter-rotating, different color
  const shellGeo = new THREE.IcosahedronGeometry(1.55, 1);
  const shellMat = new THREE.MeshBasicMaterial({ color: 0x82AAFF, wireframe: true, transparent: true, opacity: 0.22 });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  group.add(shell);

  // a few orbiting points, like electrons
  const orbiters = [];
  const orbiterGeo = new THREE.SphereGeometry(0.05, 8, 8);
  for (let i = 0; i < 5; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: 0x7EE787 });
    const mesh = new THREE.Mesh(orbiterGeo, mat);
    mesh.userData.radius = 1.9 + Math.random() * 0.3;
    mesh.userData.speed = 0.3 + Math.random() * 0.4;
    mesh.userData.offset = Math.random() * Math.PI * 2;
    mesh.userData.tilt = Math.random() * Math.PI;
    group.add(mesh);
    orbiters.push(mesh);
  }

  let mouseX = 0, mouseY = 0;
  container.addEventListener('mousemove', (e) => {
    const r = container.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width) - 0.5;
    mouseY = ((e.clientY - r.top) / r.height) - 0.5;
  });

  function onResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  let rotY = 0, rotX = 0;
  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();

    rotY += (mouseX * 0.6 - rotY) * 0.05;
    rotX += (mouseY * 0.3 - rotX) * 0.05;

    core.rotation.y = t * 0.25 + rotY;
    core.rotation.x = t * 0.12 + rotX;
    shell.rotation.y = -t * 0.12 - rotY * 0.5;
    shell.rotation.x = t * 0.08;

    orbiters.forEach(o => {
      const a = t * o.userData.speed + o.userData.offset;
      const r = o.userData.radius;
      o.position.set(
        Math.cos(a) * r,
        Math.sin(a) * r * Math.cos(o.userData.tilt),
        Math.sin(a) * r * Math.sin(o.userData.tilt)
      );
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();