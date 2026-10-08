/* ======================================================
   THE WEDDING CHASE - VERSION 2 GAME LOGIC
   ====================================================== */

// ---------- HTML elements ----------
const game = document.getElementById("game");
const bride = document.getElementById("bride");
const obstacles = document.getElementById("obstacles");
const scoreEl = document.getElementById("score");

const startScreen = document.getElementById("startScreen");
const crashScreen = document.getElementById("crashScreen");
const winScreen = document.getElementById("winScreen");
const crashText = document.getElementById("crashText");
const autoText = document.getElementById("autoText");

const startBtn = document.getElementById("startBtn");
const jumpBtn = document.getElementById("jumpBtn");
const restartBtn = document.getElementById("restartBtn");
const adBtn = document.getElementById("adBtn");
const againBtn = document.getElementById("againBtn");

// ---------- Game variables ----------
let running = false;
let isJumping = false;
let distance = 0;
let speed = 6;
let obstacleClock = null;
let scoreClock = null;
let animationFrame = null;
let autoRestartClock = null;
let obstacleNumber = 0;

// ---------- Start / restart the game ----------
function startGame() {
  stopEverything();
  clearObstacles();

  running = true;
  isJumping = false;
  distance = 0;
  speed = 6;
  obstacleNumber = 0;

  scoreEl.textContent = "0";
  bride.classList.remove("jumping");
  startScreen.classList.add("hidden");
  crashScreen.classList.add("hidden");
  winScreen.classList.add("hidden");

  // Create obstacles at intervals.
  obstacleClock = setInterval(createObstacle, 1250);

  // Increase distance without saving it anywhere.
  scoreClock = setInterval(() => {
    if (!running) return;

    distance += 1;
    scoreEl.textContent = distance;

    // Gradually make the chase faster.
    if (distance % 100 === 0 && speed < 10) speed += 0.5;

    // Finish at 1000 metres.
    if (distance >= 1000) winGame();
  }, 100);

  animationFrame = requestAnimationFrame(moveObstacles);
}

// ---------- Jump function ----------
function jump() {
  if (!running || isJumping) return;

  isJumping = true;
  bride.classList.add("jumping");

  setTimeout(() => {
    isJumping = false;
    bride.classList.remove("jumping");
  }, 640);
}

// ---------- Make a random obstacle ----------
function createObstacle() {
  if (!running) return;

  const obstacle = document.createElement("div");
  const types = ["car", "pothole", "stump"];

  // Prevent too many identical obstacles in a row.
  let type = types[Math.floor(Math.random() * types.length)];
  if (obstacleNumber % 4 === 3) type = "pothole";
  obstacleNumber++;

  obstacle.className = `obstacle ${type}`;
  obstacle.dataset.x = game.clientWidth + 90;
  obstacle.dataset.speed = speed + Math.random() * 1.6;

  obstacles.appendChild(obstacle);
}

// ---------- Move obstacles every animation frame ----------
function moveObstacles() {
  if (!running) return;

  document.querySelectorAll(".obstacle").forEach(obstacle => {
    let x = Number(obstacle.dataset.x);
    x -= Number(obstacle.dataset.speed);
    obstacle.dataset.x = x;
    obstacle.style.left = `${x}px`;

    if (x < -130) {
      obstacle.remove();
      return;
    }

    // Collision only counts when the bride is on the road.
    if (!isJumping && collides(bride, obstacle)) {
      const type = obstacle.classList.contains("car")
        ? "The bride ran into a car!"
        : obstacle.classList.contains("pothole")
          ? "The bride hit a pothole!"
          : "The bride hit a tree stump!";

      crashGame(type);
    }
  });

  animationFrame = requestAnimationFrame(moveObstacles);
}

// ---------- Fair collision detection ----------
function collides(a, b) {
  const A = a.getBoundingClientRect();
  const B = b.getBoundingClientRect();
  const padding = 10;

  return (
    A.left + padding < B.right - padding &&
    A.right - padding > B.left + padding &&
    A.top + padding < B.bottom - padding &&
    A.bottom - padding > B.top + padding
  );
}

// ---------- Crash handling ----------
function crashGame(message) {
  if (!running) return;

  running = false;
  stopGameLoops();
  crashText.textContent = message;
  crashScreen.classList.remove("hidden");

  // Automatically restart after 4 seconds.
  let seconds = 4;
  autoText.textContent = `Restarting automatically in ${seconds}...`;

  autoRestartClock = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(autoRestartClock);
      autoRestartClock = null;
      startGame();
    } else {
      autoText.textContent = `Restarting automatically in ${seconds}...`;
    }
  }, 1000);
}

// ---------- Watch-ad option ----------
// This is a local placeholder and does NOT connect to an advertising network.
function watchAdAndContinue() {
  if (autoRestartClock) {
    clearInterval(autoRestartClock);
    autoRestartClock = null;
  }

  autoText.textContent = "▶ Playing a short demo ad...";

  setTimeout(() => {
    startGame();
  }, 1500);
}

// ---------- Winning ----------
function winGame() {
  if (!running) return;

  running = false;
  stopGameLoops();
  clearObstacles();
  winScreen.classList.remove("hidden");
}

// ---------- Remove all obstacles ----------
function clearObstacles() {
  document.querySelectorAll(".obstacle").forEach(item => item.remove());
}

// ---------- Stop game loops ----------
function stopGameLoops() {
  if (obstacleClock) clearInterval(obstacleClock);
  if (scoreClock) clearInterval(scoreClock);
  if (animationFrame) cancelAnimationFrame(animationFrame);

  obstacleClock = null;
  scoreClock = null;
  animationFrame = null;
}

function stopEverything() {
  stopGameLoops();
  if (autoRestartClock) clearInterval(autoRestartClock);
  autoRestartClock = null;
}

// ---------- Buttons ----------
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
adBtn.addEventListener("click", watchAdAndContinue);
againBtn.addEventListener("click", startGame);
jumpBtn.addEventListener("click", jump);

// ---------- Keyboard: SPACE jumps ----------
document.addEventListener("keydown", event => {
  if (event.code === "Space") {
    event.preventDefault();
    jump();
  }
});

// ---------- Mobile touch ----------
jumpBtn.addEventListener("touchstart", event => {
  event.preventDefault();
  jump();
}, { passive: false });

// There is intentionally NO localStorage/sessionStorage/save system.
// Refreshing or leaving the page therefore loses all progress.
