// =================================================
// COIN SMASH
// JAVASCRIPT
// =================================================


// =================================================
// GOOGLE APPS SCRIPT
// =================================================

// GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT

const API_URL =
  "https://script.google.com/macros/s/AKfycbxTUZXG3aYuAgV2o4NRWmn3-FRsC-xlm8X6VjR1OAFkrePSlWGY-YfY6p8jZHf48sDk/exec";


// =================================================
// GAME SETTING
// =================================================

const GAME_TIME = 60;

const COIN_POINTS = 10;

const BOMB_PENALTY = 10;


// =================================================
// VARIABLE
// =================================================

let score = 0;

let timeLeft = GAME_TIME;

let combo = 0;

let username = "";

let phone = "";

let gameRunning = false;

let timerInterval;

let spawnInterval;


// =================================================
// ELEMENT
// =================================================

const homeScreen =
  document.getElementById(
    "homeScreen"
  );

const gameScreen =
  document.getElementById(
    "gameScreen"
  );

const gameOverScreen =
  document.getElementById(
    "gameOverScreen"
  );

const leaderboardScreen =
  document.getElementById(
    "leaderboardScreen"
  );


const gameArea =
  document.getElementById(
    "gameArea"
  );


const scoreElement =
  document.getElementById(
    "score"
  );


const timerElement =
  document.getElementById(
    "timer"
  );


const comboElement =
  document.getElementById(
    "combo"
  );


// =================================================
// AUDIO
// =================================================

let audioContext;

let musicInterval;


function initAudio() {

  if (!audioContext) {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

  }

}


// =================================================
// SOUND EFFECT COIN
// =================================================

function coinSound() {

  initAudio();


  const oscillator =
    audioContext.createOscillator();


  const gain =
    audioContext.createGain();


  oscillator.type =
    "sine";


  oscillator.frequency.setValueAtTime(
    700,
    audioContext.currentTime
  );


  oscillator.frequency.exponentialRampToValueAtTime(
    1200,
    audioContext.currentTime + .12
  );


  gain.gain.setValueAtTime(
    .2,
    audioContext.currentTime
  );


  gain.gain.exponentialRampToValueAtTime(
    .001,
    audioContext.currentTime + .15
  );


  oscillator.connect(gain);

  gain.connect(
    audioContext.destination
  );


  oscillator.start();

  oscillator.stop(
    audioContext.currentTime + .15
  );

}


// =================================================
// BOMB SOUND
// =================================================

function bombSound() {

  initAudio();


  const oscillator =
    audioContext.createOscillator();


  const gain =
    audioContext.createGain();


  oscillator.type =
    "sawtooth";


  oscillator.frequency.setValueAtTime(
    120,
    audioContext.currentTime
  );


  oscillator.frequency.exponentialRampToValueAtTime(
    40,
    audioContext.currentTime + .35
  );


  gain.gain.setValueAtTime(
    .35,
    audioContext.currentTime
  );


  gain.gain.exponentialRampToValueAtTime(
    .001,
    audioContext.currentTime + .35
  );


  oscillator.connect(gain);

  gain.connect(
    audioContext.destination
  );


  oscillator.start();

  oscillator.stop(
    audioContext.currentTime + .35
  );

}


// =================================================
// BACKGROUND MUSIC
// =================================================

function startMusic() {

  initAudio();


  stopMusic();


  const notes =
    [
      261.63,
      329.63,
      392.00,
      523.25
    ];


  let index = 0;


  musicInterval =
    setInterval(
      () => {

        if (!gameRunning)
          return;


        const oscillator =
          audioContext.createOscillator();


        const gain =
          audioContext.createGain();


        oscillator.type =
          "triangle";


        oscillator.frequency.value =
          notes[index];


        gain.gain.setValueAtTime(
          .025,
          audioContext.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
          .001,
          audioContext.currentTime + .35
        );


        oscillator.connect(gain);

        gain.connect(
          audioContext.destination
        );


        oscillator.start();

        oscillator.stop(
          audioContext.currentTime + .35
        );


        index =
          (index + 1) %
          notes.length;


      },
      400
    );

}


function stopMusic() {

  if (musicInterval) {

    clearInterval(
      musicInterval
    );

  }

}


// =================================================
// START GAME
// =================================================

document
  .getElementById(
    "startBtn"
  )
  .addEventListener(
    "click",
    startGame
  );


function startGame() {

  username =
    document
      .getElementById(
        "username"
      )
      .value
      .trim();


  phone =
    document
      .getElementById(
        "phone"
      )
      .value
      .trim();


  if (!username) {

    alert(
      "Masukkan username terlebih dahulu!"
    );

    return;

  }


  if (!phone) {

    alert(
      "Masukkan nomor WA terlebih dahulu!"
    );

    return;

  }


  if (
    phone.length < 8
  ) {

    alert(
      "Nomor WA tidak valid."
    );

    return;

  }


  initAudio();


  if (
    audioContext.state ===
    "suspended"
  ) {

    audioContext.resume();

  }


  score = 0;

  combo = 0;

  timeLeft =
    GAME_TIME;


  gameRunning =
    true;


  scoreElement
    .textContent =
    score;


  comboElement
    .textContent =
    combo;


  timerElement
    .textContent =
    timeLeft;


  homeScreen
    .classList.add(
      "hidden"
    );


  gameOverScreen
    .classList.add(
      "hidden"
    );


  leaderboardScreen
    .classList.add(
      "hidden"
    );


  gameScreen
    .classList.remove(
      "hidden"
    );


  gameArea
    .querySelectorAll(
      ".coin, .bomb, .score-pop, .explosion"
    )
    .forEach(
      element =>
        element.remove()
    );


  startMusic();


  startTimer();


  startSpawning();

}


// =================================================
// TIMER
// =================================================

function startTimer() {

  clearInterval(
    timerInterval
  );


  timerInterval =
    setInterval(
      () => {

        timeLeft--;


        timerElement
          .textContent =
          timeLeft;


        if (
          timeLeft <= 0
        ) {

          endGame();

        }

      },
      1000
    );

}


// =================================================
// SPAWN
// =================================================

function startSpawning() {

  clearInterval(
    spawnInterval
  );


  spawnObject();


  spawnInterval =
    setInterval(
      () => {

        if (
          gameRunning
        ) {

          spawnObject();

        }

      },
      650
    );

}


// =================================================
// SPAWN OBJECT
// =================================================

function spawnObject() {

  const object =
    document.createElement(
      "div"
    );


  const isBomb =
    Math.random() < .18;


  if (isBomb) {

    object.className =
      "bomb";

    object.textContent =
      "💣";

    object.addEventListener(
      "pointerdown",
      hitBomb,
      {
        once: true
      }
    );

  }

  else {

    object.className =
      "coin";

    object.addEventListener(
      "pointerdown",
      hitCoin,
      {
        once: true
      }
    );

  }


  const areaWidth =
    gameArea.clientWidth;


  const areaHeight =
    gameArea.clientHeight;


  const size =
    window.innerWidth < 500
      ? 58
      : 70;


  const x =
    Math.random() *
    Math.max(
      1,
      areaWidth - size
    );


  const y =
    110 +
    Math.random() *
    Math.max(
      1,
      areaHeight - 190
    );


  object.style.left =
    x + "px";


  object.style.top =
    y + "px";


  gameArea.appendChild(
    object
  );


  setTimeout(
    () => {

      if (
        object.parentNode
      ) {

        object.remove();

      }

    },
    1700
  );

}


// =================================================
// HIT COIN
// =================================================

function hitCoin(event) {

  if (!gameRunning)
    return;


  const coin =
    event.currentTarget;


  score +=
    COIN_POINTS;


  combo++;


  scoreElement
    .textContent =
    score;


  comboElement
    .textContent =
    combo;


  coinSound();


  createScorePopup(
    event.clientX,
    event.clientY,
    "+" + COIN_POINTS
  );


  createParticles(
    event.clientX,
    event.clientY
  );


  coin.remove();

}


// =================================================
// HIT BOMB
// =================================================

function hitBomb(event) {

  if (!gameRunning)
    return;


  const bomb =
    event.currentTarget;


  score =
    Math.max(
      0,
      score - BOMB_PENALTY
    );


  combo = 0;


  scoreElement
    .textContent =
    score;


  comboElement
    .textContent =
    combo;


  bombSound();


  createScorePopup(
    event.clientX,
    event.clientY,
    "-" + BOMB_PENALTY,
    true
  );


  createExplosion(
    event.clientX,
    event.clientY
  );


  bomb.remove();

}


// =================================================
// SCORE POPUP
// =================================================

function createScorePopup(
  x,
  y,
  text,
  isBomb = false
) {

  const popup =
    document.createElement(
      "div"
    );


  popup.className =
    "score-pop";


  if (isBomb) {

    popup.classList.add(
      "bomb-pop"
    );

  }


  popup.textContent =
    text;


  popup.style.left =
    x + "px";


  popup.style.top =
    y + "px";


  gameArea.appendChild(
    popup
  );


  setTimeout(
    () =>
      popup.remove(),
    700
  );

}


// =================================================
// PARTICLES
// =================================================

function createParticles(
  x,
  y
) {

  for (
    let i = 0;
    i < 8;
    i++
  ) {

    const particle =
      document.createElement(
        "div"
      );


    particle.textContent =
      "✨";


    particle.style.position =
      "absolute";


    particle.style.left =
      x + "px";


    particle.style.top =
      y + "px";


    particle.style.pointerEvents =
      "none";


    particle.style.fontSize =
      "20px";


    particle.style.zIndex =
      "30";


    const dx =
      (Math.random() -
        .5) *
      120;


    const dy =
      (Math.random() -
        .5) *
      120;


    particle.animate(

      [

        {
          transform:
            "translate(0,0) scale(1)",

          opacity: 1

        },

        {

          transform:
            `translate(${dx}px,${dy}px) scale(0)`,

          opacity: 0

        }

      ],

      {

        duration: 600,

        easing:
          "ease-out"

      }

    );


    gameArea.appendChild(
      particle
    );


    setTimeout(
      () =>
        particle.remove(),
      600
    );

  }

}


// =================================================
// EXPLOSION
// =================================================

function createExplosion(
  x,
  y
) {

  const explosion =
    document.createElement(
      "div"
    );


  explosion.className =
    "explosion";


  explosion.style.left =
    x + "px";


  explosion.style.top =
    y + "px";


  gameArea.appendChild(
    explosion
  );


  setTimeout(
    () =>
      explosion.remove(),
    500
  );

}


// =================================================
// END GAME
// =================================================

async function endGame() {

  if (!gameRunning)
    return;


  gameRunning =
    false;


  clearInterval(
    timerInterval
  );


  clearInterval(
    spawnInterval
  );


  stopMusic();


  gameScreen
    .classList.add(
      "hidden"
    );


  gameOverScreen
    .classList.remove(
      "hidden"
    );


  document
    .getElementById(
      "finalScore"
    )
    .textContent =
    score;


  let message;


  if (score >= 500) {

    message =
      "🔥 Luar biasa! Kamu jago banget!";

  }

  else if (score >= 250) {

    message =
      "⭐ Hebat! Skormu keren!";

  }

  else if (score >= 100) {

    message =
      "👍 Bagus! Coba pecahkan rekor!";

  }

  else {

    message =
      "🎮 Coba lagi dan kumpulkan lebih banyak coin!";

  }


  document
    .getElementById(
      "resultMessage"
    )
    .textContent =
    message;


  // SIMPAN KE GOOGLE SHEETS

  await saveScore();

}


// =================================================
// SAVE SCORE
// =================================================

async function saveScore() {

  if (
    API_URL.includes(
      "PASTE_URL"
    )
  ) {

    console.log(
      "API_URL belum diatur."
    );

    return;

  }


  try {

    const params =
      new URLSearchParams({

        action:
          "saveScore",

        username:
          username,

        phone:
          phone,

        score:
          score

      });


    await fetch(
      API_URL +
      "?" +
      params.toString()
    );


    console.log(
      "Score tersimpan."
    );

  }

  catch (error) {

    console.error(
      "Gagal menyimpan:",
      error
    );

  }

}


// =================================================
// LEADERBOARD
// =================================================

document
  .getElementById(
    "leaderboardBtn"
  )
  .addEventListener(
    "click",
    showLeaderboard
  );


async function showLeaderboard() {

  homeScreen
    .classList.add(
      "hidden"
    );


  gameScreen
    .classList.add(
      "hidden"
    );


  gameOverScreen
    .classList.add(
      "hidden"
    );


  leaderboardScreen
    .classList.remove(
      "hidden"
    );


  const list =
    document.getElementById(
      "leaderboardList"
    );


  list.innerHTML =
    `<div class="loading">
      ⏳ Memuat leaderboard...
    </div>`;


  if (
    API_URL.includes(
      "PASTE_URL"
    )
  ) {

    list.innerHTML =
      `<div class="loading">
        ⚠️ API Google Sheets belum dihubungkan.
      </div>`;

    return;

  }


  try {

    const params =
      new URLSearchParams({

        action:
          "leaderboard",

        limit:
          10

      });


    const response =
      await fetch(
        API_URL +
        "?" +
        params.toString()
      );


    const result =
      await response.json();


    if (
      !result.success
    ) {

      throw new Error(
        result.message
      );

    }


    renderLeaderboard(
      result.data
    );

  }

  catch (error) {

    console.error(
      error
    );


    list.innerHTML =
      `<div class="loading">
        ❌ Gagal mengambil leaderboard.
      </div>`;

  }

}


// =================================================
// RENDER LEADERBOARD
// =================================================

function renderLeaderboard(
  data
) {

  const list =
    document.getElementById(
      "leaderboardList"
    );


  if (
    !data ||
    data.length === 0
  ) {

    list.innerHTML =
      `<div class="loading">
        🏆 Belum ada skor.
      </div>`;

    return;

  }


  list.innerHTML =
    data
      .map(
        (player, index) => {

          let medal;


          if (
            index === 0
          )
            medal = "🥇";

          else if (
            index === 1
          )
            medal = "🥈";

          else if (
            index === 2
          )
            medal = "🥉";

          else
            medal =
              "#" +
              (index + 1);


          return `

            <div
              class="leader-row"
            >

              <div class="rank">
                ${medal}
              </div>


              <div class="player">

                <strong>
                  ${escapeHTML(
                    player.username
                  )}
                </strong>

                <small>
                  Pemain Coin Smash
                </small>

              </div>


              <div
                class="player-score"
              >
                ${player.score}
              </div>

            </div>

          `;

        }
      )
      .join("");

}


// =================================================
// BUTTON
// =================================================

document
  .getElementById(
    "playAgainBtn"
  )
  .addEventListener(
    "click",
    startGame
  );


document
  .getElementById(
    "homeBtn"
  )
  .addEventListener(
    "click",
    goHome
  );


document
  .getElementById(
    "backHomeBtn"
  )
  .addEventListener(
    "click",
    goHome
  );


document
  .getElementById(
    "quitBtn"
  )
  .addEventListener(
    "click",
    () => {

      if (
        confirm(
          "Keluar dari permainan?"
        )
      ) {

        endGame();

      }

    }
  );


// =================================================
// HOME
// =================================================

function goHome() {

  gameRunning =
    false;


  clearInterval(
    timerInterval
  );


  clearInterval(
    spawnInterval
  );


  stopMusic();


  gameScreen
    .classList.add(
      "hidden"
    );


  gameOverScreen
    .classList.add(
      "hidden"
    );


  leaderboardScreen
    .classList.add(
      "hidden"
    );


  homeScreen
    .classList.remove(
      "hidden"
    );

}


// =================================================
// ESCAPE HTML
// =================================================

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}
