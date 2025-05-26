const wordList = ["javascript", "hangman", "coding", "developer"];
const maxWrong = 6;
let wrongGuesses = 0;
const word = wordList[Math.floor(Math.random() * wordList.length)];
let guessedLetters = [word[0], word[word.length - 1]];
let display = word.split("").map((char, i) => {
  return (i === 0 || i === word.length - 1) ? char : "_";
});

const wordDisplay = document.getElementById("wordDisplay");
const message = document.getElementById("message");
const canvas = document.getElementById("hangmanCanvas");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restartButton");
const letterInput = document.getElementById("letterInput");

updateWordDisplay();

function updateWordDisplay() {
  wordDisplay.innerHTML = display.map(letter => {
    if (letter === "_") {
      return `<span>_</span>`;
    } else {
      return `<span class="filled">${letter}</span>`;
    }
  }).join("");
}

function drawHangmanPart(part) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#333";

  switch (part) {
    case 1:
      ctx.beginPath();
      ctx.moveTo(10, 240);
      ctx.lineTo(190, 240);
      ctx.stroke();
      break;
    case 2:
      ctx.beginPath();
      ctx.moveTo(50, 240);
      ctx.lineTo(50, 20);
      ctx.stroke();
      break;
    case 3:
      ctx.beginPath();
      ctx.moveTo(50, 20);
      ctx.lineTo(130, 20);
      ctx.lineTo(130, 40);
      ctx.stroke();
      break;
    case 4:
      ctx.beginPath();
      ctx.arc(130, 50, 10, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 5:
      ctx.beginPath();
      ctx.moveTo(130, 60);
      ctx.lineTo(130, 100);
      ctx.stroke();
      break;
    case 6:
      ctx.beginPath();
      ctx.moveTo(130, 70);
      ctx.lineTo(110, 90);
      ctx.moveTo(130, 70);
      ctx.lineTo(150, 90);
      ctx.moveTo(130, 100);
      ctx.lineTo(110, 130);
      ctx.moveTo(130, 100);
      ctx.lineTo(150, 130);
      ctx.stroke();
      break;
  }
}

function guessLetter() {
  const letter = letterInput.value.toLowerCase();
  letterInput.value = "";
  letterInput.focus();

  if (!letter.match(/^[a-z]$/)) {
    alert("Please enter a valid letter.");
    return;
  }

  if (guessedLetters.includes(letter)) {
    if (display.includes(letter)) {
      // Letter is already visible, let the player guess it again silently
    } else {
      message.innerText = `You already guessed "${letter}".`;
      return;
    }
  }

  guessedLetters.push(letter);

  if (word.includes(letter)) {
    for (let i = 0; i < word.length; i++) {
      if (word[i] === letter) {
        display[i] = letter;
      }
    }
    updateWordDisplay();
    message.innerText = "";

    if (!display.includes("_")) {
      message.innerText = "🎉 You Win!";
      letterInput.disabled = true;
      restartButton.style.display = "inline-block";
    }
  } else {
    wrongGuesses++;
    drawHangmanPart(wrongGuesses);
    message.innerText = `Wrong guess! (${wrongGuesses}/${maxWrong})`;

    if (wrongGuesses === maxWrong) {
      message.innerText = `💀 Game Over! The word was "${word}"`;
      letterInput.disabled = true;
      restartButton.style.display = "inline-block";
    }
  }
}

letterInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    guessLetter();
  }
});

function restartGame() {
  window.location.reload();
}
