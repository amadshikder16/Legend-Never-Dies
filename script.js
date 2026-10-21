const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const healthEl = document.getElementById('health');
const messageEl = document.getElementById('message');

// Player (Fighting Figure)
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 18,
  speed: 4.2,
  health: 100,
  color: '#c41e3a',
  angle: 0
};

// Bullets & Enemies
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let keys = {};
let mouse = { x: 0, y: 0, down: false };

// Spawn timer
let enemyTimer = 0;
let spawnRate = 90;

// Event listeners
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => mouse.down = true);
canvas.addEventListener('mouseup', () => mouse.down = false);

// Shoot
function shoot() {
  if (gameOver) return;
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  bullets.push({
    x: player.x,
    y: player.y,
    vx: Math.cos(angle) * 11,
    vy: Math.sin(angle) * 11,
    radius: 5
  });
}

// Auto fire while holding mouse
setInterval(() => {
  if (mouse.down && !gameOver) shoot();
}, 140);

// Spawn enemy
function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x, y;
  if (side === 0) { x = Math.random() * canvas.width; y = -30; }
  else if (side === 1) { x = canvas.width + 30; y = Math.random() * canvas.height; }
  else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 30; }
  else { x = -30; y = Math.random() * canvas.height; }

  enemies.push({
    x, y,
    radius: 16 + Math.random() * 8,
    speed: 1.4 + Math.random() * 1.6,
    color: '#555'
  });
}

// Draw player as a fighting figure
function drawPlayer() {
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  player.angle = angle;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(angle);

  // Body
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(0, -22, 10, 0, Math.PI * 2);
  ctx.fill();

  // Arms
  ctx.fillStyle = '#a01830';
  ctx.fillRect(8, -8, 18, 6);   // right arm (gun side)
  ctx.fillRect(-20, -6, 14, 5); // left arm

  // Legs
  ctx.fillRect(-8, 16, 6, 14);
  ctx.fillRect(2, 16, 6, 14);

  // Gun
  ctx.fillStyle = '#222';
  ctx.fillRect(20, -6, 16, 5);

  // Outline
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 20, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Update
function update() {
  if (gameOver) return;

  // Movement
  if (keys['w'] || keys['arrowup']) player.y -= player.speed;
  if (keys['s'] || keys['arrowdown']) player.y += player.speed;
  if (keys['a'] || keys['arrowleft']) player.x -= player.speed;
  if (keys['d'] || keys['arrowright']) player.x += player.speed;

  // Keep player inside
  player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
  player.y = Math.max(20, Math.min(canvas.height - 20, player.y));

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  }

  // Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle) * e.speed;
    e.y += Math.sin(angle) * e.speed;

    // Hit player
    const dist = Math.hypot(player.x - e.x, player.y - e.y);
    if (dist < 22 + e.radius) {
      player.health -= 12;
      enemies.splice(i, 1);
      if (player.health <= 0) {
        player.health = 0;
        gameOver = true;
        messageEl.style.display = 'block';
        messageEl.innerHTML = 'LEGEND NEVER DIES<br><span style="font-size:20px;color:#fff">Click to Restart</span>';
      }
    }
  }

  // Bullet hits enemy
  for (let i = enemies.length - 1; i >= 0; i--) {
    for (let j = bullets.length - 1; j >= 0; j--) {
      const dist = Math.hypot(enemies[i].x - bullets[j].x, enemies[i].y - bullets[j].y);
      if (dist < enemies[i].radius + bullets[j].radius) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
        break;
      }
    }
  }

  // Spawn enemies
  enemyTimer++;
  if (enemyTimer > spawnRate) {
    spawnEnemy();
    enemyTimer = 0;
    if (spawnRate > 35) spawnRate -= 0.8;
  }

  // UI
  scoreEl.textContent = `Score: ${score}`;
  healthEl.textContent = `Health: ${Math.max(0, Math.floor(player.health))}`;
}

// Draw
function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle grid
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Bullets
  ctx.fillStyle = '#ffcc00';
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Enemies
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw fighting figure player
  if (!gameOver) {
    drawPlayer();
  } else {
    // Still draw player when dead
    drawPlayer();
  }

  // Aim line
  if (!gameOver) {
    ctx.strokeStyle = 'rgba(196, 30, 58, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
  }
}

// Game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Restart
canvas.addEventListener('click', () => {
  if (gameOver) {
    player.health = 100;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    bullets = [];
    enemies = [];
    score = 0;
    spawnRate = 90;
    gameOver = false;
    messageEl.style.display = 'none';
  }
});

// Start
loop();
