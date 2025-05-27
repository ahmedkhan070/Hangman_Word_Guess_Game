// List of words computer can pick from (lowercase)
const computerWords = [
  "hangman", "javascript", "programming", "developer", "computer",
  "function", "variable", "internet", "algorithm", "software"
];

let userWord = "";
let computerWord = "";

let userDisplay = [];
let computerDisplay = [];

let userGuessedLetters = [];
let computerGuessedLetters = [];

let userWrongGuesses = 0;
let computerWrongGuesses = 0;
const maxWrong = 6;

let userTurn = true; // true = user's turn, false = computer's turn

// Letter frequency for computer guessing (English letter frequency order)
const letterFrequency = "etaoinshrdlcumwfgypbvkjxqz".split("");

const userWordInput = document.getElementById("userWordInput");
const startButton = document.getElementById("startButton");
const setupMessage = document.getElementById("setupMessage");

const gameScreen = document.getElementById("gameScreen");
const setupScreen = document.getElementById("setupScreen");

const computerWordDisplay = document.getElementById("computerWordDisplay");
const userWordDisplay = document.getElementById("userWordDisplay");

const userMessage = document.getElementById("userMessage");
const computerMessage = document.getElementById("computerMessage");

const letterInput = document.getElementById("letterInput");
const guessButton = document.getElementById("guessButton");
const restartButton = document.getElementById("restartButton");

const userHangmanCanvas = document.getElementById("userHangmanCanvas");
const userCtx = userHangmanCanvas.getContext("2d");

const computerHangmanCanvas = document.getElementById("computerHangmanCanvas");
const computerCtx = computerHangmanCanvas.getContext("2d");

// ======= Setup and start game =======

startButton.addEventListener("click", () => {
  let val = userWordInput.value.trim().toLowerCase();
  if (!val.match(/^[a-z]{3,15}$/)) {
    setupMessage.innerText = "Please enter a valid word (3-15 letters, a-z only).";
    return;
  }
  userWord = val;
  setupMessage.innerText = "";
  startGame();
});

function startGame() {
  // Pick random word for computer
  computerWord = computerWords[Math.floor(Math.random() * computerWords.length)];

  // Initialize displays with underscores
  userDisplay = Array(userWord.length).fill("_");
  computerDisplay = Array(computerWord.length).fill("_");

  // Clear guesses and counters
  userGuessedLetters = [];
  computerGuessedLetters = [];
  userWrongGuesses = 0;
  computerWrongGuesses = 0;

  // Reset messages
  userMessage.innerText = "";
  computerMessage.innerText = "";
  
  // Clear canvases
  clearCanvas(userCtx);
  clearCanvas(computerCtx);

  // Show game screen, hide setup
  setupScreen.style.display = "none";
  gameScreen.style.display = "block";

  updateDisplays();

  userTurn = true;
  letterInput.disabled = false;
  guessButton.disabled = false;
  letterInput.value = "";
  letterInput.focus();

  restartButton.style.display = "none";

  userMessage.innerText = "Your turn to guess a letter!";
  computerMessage.innerText = "Computer is waiting...";
}

// ======= Game flow =======

guessButton.addEventListener("click", () => {
  if (userTurn) {
    handleUserGuess();
  }
});

letterInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && userTurn) {
    e.preventDefault();
    handleUserGuess();
  }
});

restartButton.addEventListener("click", () => {
  location.reload();
});

// ======= User guesses computer's word =======

function handleUserGuess() {
  const letter = letterInput.value.trim().toLowerCase();
  letterInput.value = "";
  letterInput.focus();

  if (!letter.match(/^[a-z]$/)) {
    alert("Please enter a single letter (a-z).");
    return;
  }

  if (userGuessedLetters.includes(letter)) {
    userMessage.innerText = `You already guessed "${letter}". Try another letter.`;
    return;
  }

  userGuessedLetters.push(letter);

  if (computerWord.includes(letter)) {
    // Reveal all matching letters
    for (let i = 0; i < computerWord.length; i++) {
      if (computerWord[i] === letter) {
        computerDisplay[i] = letter;
      }
    }
    userMessage.innerText = `Good guess! "${letter}" is in the word.`;
  } else {
    userWrongGuesses++;
    drawHangmanPart(userCtx, userWrongGuesses);
    userMessage.innerText = `Wrong guess! "${letter}" is not in the word. (${userWrongGuesses}/${maxWrong})`;
  }

  updateDisplays();
  checkGameOver();

  if (!isGameOver()) {
    // Switch turn to computer
    userTurn = false;
    userMessage.innerText += " Waiting for computer's guess...";
    letterInput.disabled = true;
    guessButton.disabled = true;

    setTimeout(computerTurn, 1500);
  }
}

// ======= Computer guesses user's word =======

function computerTurn() {
  if (computerWrongGuesses >= maxWrong) return; // Already lost
  if (!userDisplay.includes("_")) return; // Already won

  // Pick next letter to guess from letterFrequency not guessed yet
  let letter = letterFrequency.find(l => !computerGuessedLetters.includes(l));
  if (!letter) {
    // If no letters left, end game (shouldn't happen)
    computerMessage.innerText = "Computer has no letters left to guess!";
    endGame();
    return;
  }

  computerGuessedLetters.push(letter);

  if (userWord.includes(letter)) {
    for (let i = 0; i < userWord.length; i++) {
      if (userWord[i] === letter) {
        userDisplay[i] = letter;
      }
    }
    computerMessage.innerText = `Computer guessed "${letter}" correctly!`;
  } else {
    computerWrongGuesses++;
    drawHangmanPart(computerCtx, computerWrongGuesses);
    computerMessage.innerText = `Computer guessed "${letter}" wrong! (${computerWrongGuesses}/${maxWrong})`;
  }

  updateDisplays();
  checkGameOver();

  if (!isGameOver()) {
    // Switch turn back to user
    userTurn = true;
    userMessage.innerText = "Your turn to guess a letter!";
    letterInput.disabled = false;
    guessButton.disabled = false;
    letterInput.focus();
  }
}

// ======= Update displayed words =======

function updateDisplays() {
  computerWordDisplay.textContent = computerDisplay.join(" ");
  userWordDisplay.textContent = userDisplay.join(" ");
}

// ======= Check for game end =======

function isGameOver() {
  // Win conditions
  if (!computerDisplay.includes("_") || !userDisplay.includes("_")) return true;
  // Lose conditions
  if (userWrongGuesses >= maxWrong || computerWrongGuesses >= maxWrong) return true;
  return false;
}

function checkGameOver() {
  if (!computerDisplay.includes("_")) {
    userMessage.innerText = "🎉 You guessed the computer's word! You win!";
    computerMessage.innerText = "Computer lost! You won!";
    endGame();
  } else if (!userDisplay.includes("_")) {
    computerMessage.innerText = "🤖 Computer guessed your word! Computer wins!";
    userMessage.innerText = "You lost! Computer won!";
    endGame();
  } else if (userWrongGuesses >= maxWrong) {
    userMessage.innerText = `💀 You lost! Hangman completed. The word was "${computerWord}".`;
    computerMessage.innerText = "Computer wins!";
    endGame();
  } else if (computerWrongGuesses >= maxWrong) {
    computerMessage.innerText = `💀 Computer lost! Hangman completed. Your word was "${userWord}".`;
    userMessage.innerText = "You win!";
    endGame();
  }
}

function endGame() {
  letterInput.disabled = true;
  guessButton.disabled = true;
  restartButton.style.display = "inline-block";
}

// ======= Drawing hangman parts =======

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, 200, 250);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#222";
}

function drawHangmanPart(ctx, step) {
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#222";

  switch (step) {
    case 1:
      // Base
      ctx.beginPath();
      ctx.moveTo(10, 230);
      ctx.lineTo(190, 230);
      ctx.stroke();
      break;
    case 2:
      // Pole
      ctx.beginPath();
      ctx.moveTo(50, 230);
      ctx.lineTo(50, 20);
      ctx.stroke();
      break;
    case 3:
      // Beam
      ctx.beginPath();
      ctx.moveTo(50, 20);
      ctx.lineTo(140, 20);
      ctx.stroke();
      break;
    case 4:
      // Rope
      ctx.beginPath();
      ctx.moveTo(140, 20);
      ctx.lineTo(140, 50);
      ctx.stroke();
      break;
    case 5:
      // Head (circle)
      ctx.beginPath();
      ctx.arc(140, 75, 25, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 6:
      // Body
      ctx.beginPath();
      ctx.moveTo(140, 100);
      ctx.lineTo(140, 160);
      ctx.stroke();
      break;
    case 7:
      // Left Arm
      ctx.beginPath();
      ctx.moveTo(140, 110);
      ctx.lineTo(100, 140);
      ctx.stroke();
      break;
    case 8:
      // Right Arm
      ctx.beginPath();
      ctx.moveTo(140, 110);
      ctx.lineTo(180, 140);
      ctx.stroke();
      break;
    case 9:
      // Left Leg
      ctx.beginPath();
      ctx.moveTo(140, 160);
      ctx.lineTo(110, 200);
      ctx.stroke();
      break;
    case 10:
      // Right Leg
      ctx.beginPath();
      ctx.moveTo(140, 160);
      ctx.lineTo(170, 200);
      ctx.stroke();
      break;
    default:
      break;
  }
}

// Because maxWrong is 6, draw only steps 1 to 6
function drawHangmanPart(ctx, step) {
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#222";

  switch (step) {
    case 1:
      // Base
      ctx.beginPath();
      ctx.moveTo(10, 230);
      ctx.lineTo(190, 230);
      ctx.stroke();
      break;
    case 2:
      // Pole
      ctx.beginPath();
      ctx.moveTo(50, 230);
      ctx.lineTo(50, 20);
      ctx.stroke();
      break;
    case 3:
      // Beam
      ctx.beginPath();
      ctx.moveTo(50, 20);
      ctx.lineTo(140, 20);
      ctx.stroke();
      break;
    case 4:
      // Rope
      ctx.beginPath();
      ctx.moveTo(140, 20);
      ctx.lineTo(140, 50);
      ctx.stroke();
      break;
    case 5:
      // Head (circle)
      ctx.beginPath();
      ctx.arc(140, 75, 25, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 6:
      // Body
      ctx.beginPath();
      ctx.moveTo(140, 100);
      ctx.lineTo(140, 160);
      ctx.stroke();
      break;
  }
}
