document.addEventListener('DOMContentLoaded', () => {
  // Console log to confirm script execution
  console.log("script.js has loaded and DOM is ready!");

  // DOM Elements
  const elements = {
    userWordInput: document.getElementById('userWordInput'),
    startButton: document.getElementById('startButton'),
    setupMessage: document.getElementById('setupMessage'),
    gameScreen: document.getElementById('gameScreen'),
    setupScreen: document.getElementById('setupScreen'),
    computerWordDisplay: document.getElementById('computerWordDisplay'),
    userWordDisplay: document.getElementById('userWordDisplay'),
    userMessage: document.getElementById('userMessage'),
    computerMessage: document.getElementById('computerMessage'),
    letterInput: document.getElementById('letterInput'),
    guessButton: document.getElementById('guessButton'),
    restartButton: document.getElementById('restartButton'),
    userHangmanCanvas: document.getElementById('userHangmanCanvas'),
    computerHangmanCanvas: document.getElementById('computerHangmanCanvas'),
    userGuessedLetters: document.getElementById('userGuessedLetters'),
    computerGuessedLetters: document.getElementById('computerGuessedLetters'),
    userCard: document.getElementById('userCard'),
    computerCard: document.getElementById('computerCard'),
    commentsContainer: document.getElementById('commentsContainer'), // This was the missing element!
    userWrongCount: document.getElementById('userWrongCount'),
    computerWrongCount: document.getElementById('computerWrongCount')
  };

  // Game state
  const state = {
    words: {
      short: ["cat", "dog", "sun", "run", "fun", "bat", "rat", "mat", "hat", "map"],
      medium: ["apple", "house", "river", "cloud", "music", "light", "dream", "water", "earth", "smile"],
      long: ["computer", "elephant", "mountain", "keyboard", "sunshine", "adventure", "chocolate", "butterfly", "universe", "beautiful"]
    },
    userWord: "",
    computerWord: "",
    userDisplay: [],
    computerDisplay: [],
    userGuessed: [],
    computerGuessed: [],
    userWrongCount: 0,
    computerWrongCount: 0,
    maxWrong: 6,
    userTurn: true,
    letterFrequency: "etaoinshrdlcumwfgypbvkjxqz".split(""),
    computerComments: {
      0: [
        "Let's get started. This should be easy.",
        "A warm-up round for my circuits!",
        "Initializing guess protocols... 😎"
      ],
      1: [
        "Hmm, interesting choice...",
        "You're playing coy, I see.",
        "That letter should’ve worked... maybe."
      ],
      2: [
        "I see what you're doing.",
        "Is this word even real?",
        "Something feels off here..."
      ],
      3: [
        "Okay, that didn’t work. Let me think.",
        "I’m starting to doubt my algorithm.",
        "Not my finest moment..."
      ],
      4: [
        "This is getting frustrating!",
        "You think you’re clever, huh?",
        "Do you even know what you're doing?!"
      ],
      5: [
        "Why are you making this so difficult?!",
        "You're really testing my patience...",
        "One of us is going to snap, and it won’t be me. 😡"
      ],
      6: [
        "I CAN'T BELIEVE I'M LOSING TO A HUMAN!!!",
        "ERROR: Confidence levels plummeting!",
        "THIS. IS. WAR. 🔥"
      ]
    }
  };

  // Canvas contexts
  const contexts = {
    user: elements.userHangmanCanvas.getContext('2d'),
    computer: elements.computerHangmanCanvas.getContext('2d')
  };

  // Initialize game
  function init() {
    setupEventListeners();
    clearCanvas(contexts.user);
    clearCanvas(contexts.computer);
    elements.userWordInput.focus();
  }

  // Event listeners setup
  function setupEventListeners() {
    elements.startButton.addEventListener('click', startGame);
    elements.guessButton.addEventListener('click', handleUserGuess);
    // Event listener for "Enter" key on the word input field (setup screen)
    elements.userWordInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        startGame();
      }
    });
    // Event listener for "Enter" key on the letter guess input field (game screen)
    elements.letterInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleUserGuess();
    });
    elements.restartButton.addEventListener('click', resetGame);
    // Ensure input validation also clears messages correctly
    elements.userWordInput.addEventListener('input', validateWordInput);
  }

  // Validate word input and provide immediate feedback
  function validateWordInput() {
    let val = elements.userWordInput.value;
    let originalVal = val; // Store original value to check if replaced
    val = val.replace(/[^a-z]/gi, ''); // Remove non-alphabetic characters

    if (val !== originalVal) { // If characters were removed
      elements.userWordInput.value = val;
      elements.setupMessage.textContent = "Only letters (a-z) are allowed. Non-alphabetic characters removed.";
    } else if (val.length < 3 && val.length > 0) {
      elements.setupMessage.textContent = "Word must be at least 3 letters long.";
    } else if (val.length > 15) {
      elements.setupMessage.textContent = "Word cannot be longer than 15 letters.";
    } else {
      elements.setupMessage.textContent = ""; // Clear message if current input is valid
    }
  }

  // Start game
  function startGame() {
    const userWord = elements.userWordInput.value.trim().toLowerCase();
    
    // Clear any previous setup message before validation
    elements.setupMessage.textContent = ""; 

    if (!userWord.match(/^[a-z]{3,15}$/)) {
      elements.setupMessage.textContent = "Please enter a valid word (3-15 letters, a-z only).";
      return; // Stop function if validation fails
    }

    state.userWord = userWord;
    state.computerWord = getComputerWordByLength(userWord.length);
    
    resetGameState();
    showGameScreen();
    updateGameUI();
    addComputerComment("Starting game... Let's see what you've got!");
  }

  // Get computer word by length
  function getComputerWordByLength(length) {
    let category;
    if (length <= 4) category = "short";
    else if (length <= 6) category = "medium";
    else category = "long";
    
    const words = state.words[category];
    return words[Math.floor(Math.random() * words.length)];
  }

  // Reset game state
  function resetGameState() {
    state.userDisplay = initializeDisplay(state.computerWord);
    state.computerDisplay = initializeDisplay(state.userWord);
    state.userGuessed = [];
    state.computerGuessed = [];
    state.userWrongCount = 0;
    state.computerWrongCount = 0;
    state.userTurn = true;
    elements.commentsContainer.innerHTML = ''; // Clear previous comments

    clearCanvas(contexts.user);
    clearCanvas(contexts.computer);
  }

  // Initialize word display
  function initializeDisplay(word) {
    const length = word.length;
    const display = Array(length).fill('_');
    const positions = getRevealPositions(length);
    
    positions.forEach(pos => {
      display[pos] = word[pos];
    });
    
    return display;
  }

  // Get positions to reveal
  function getRevealPositions(length) {
    const mid = Math.floor(length / 2);
    const positions = new Set();
    
    // Always reveal first character
    positions.add(0);
    
    // Add 1-2 additional positions
    if (length > 5) positions.add(mid);
    if (length > 8) positions.add(length - 1);
    
    return Array.from(positions);
  }

  // Show game screen
  function showGameScreen() {
    elements.setupScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    elements.letterInput.disabled = false;
    elements.guessButton.disabled = false;
    elements.letterInput.focus(); // Focus on the guess input for user convenience
  }

  // Handle user guess
  function handleUserGuess() {
    if (!state.userTurn) {
      elements.userMessage.textContent = "It's not your turn!";
      return;
    }
    
    const letter = elements.letterInput.value.trim().toLowerCase();
    elements.letterInput.value = ''; // Clear the input field

    if (!isValidLetter(letter)) {
      // isValidLetter now sets the message, so just return
      return;
    }
    if (isDuplicateGuess(letter, state.userGuessed)) {
      elements.userMessage.textContent = `You already guessed "${letter.toUpperCase()}". Try another letter.`;
      return;
    }

    processGuess(letter, state.userGuessed, state.computerWord, state.userDisplay, 
      contexts.user, 'user');
    
    updateGameUI();
    checkGameStatus();
    
    // Only proceed to computer turn if game is not over
    if (!isGameOver()) {
      state.userTurn = false;
      updateTurnIndicator();
      elements.letterInput.disabled = true; // Disable user input during computer's turn
      elements.guessButton.disabled = true;
      setTimeout(computerTurn, 1200);
    }
  }

  // Computer turn
  function computerTurn() {
    if (isGameOver()) return;
    
    const letter = getComputerGuess();
    processGuess(letter, state.computerGuessed, state.userWord, state.computerDisplay, 
      contexts.computer, 'computer');
    
    // Add computer comment based on frustration level
    const frustration = Math.min(Math.floor(state.computerWrongCount / 2), 6);
    const pool = state.computerComments[frustration] || [];
    const text = pool[Math.floor(Math.random() * pool.length)] || "🤖 Processing...";
    addComputerComment(text);
    
    updateGameUI();
    checkGameStatus();
    
    // Only proceed to user turn if game is not over
    if (!isGameOver()) {
      state.userTurn = true;
      updateTurnIndicator();
      elements.letterInput.disabled = false; // Re-enable user input
      elements.guessButton.disabled = false;
      elements.letterInput.focus();
    }
  }

  // Add computer comment
function addComputerComment(forcedText = null) {
  const level = Math.min(Math.floor(state.computerWrongCount / 2), 6);
  const pool = state.computerComments[level];
  const text = forcedText || pool[Math.floor(Math.random() * pool.length)];

  const emojis = ["...", "😅", "🤔", "😬", "😳", "💢", "🔥"];
  const moods = ["🤖", "😐", "😏", "😠", "😤", "😵", "😡"];
  const mood = moods[Math.min(state.computerWrongCount, moods.length - 1)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  const commentEl = document.createElement('div');
  commentEl.className = 'comment computer';
  commentEl.innerHTML = `
    <div class="comment-header">${mood} Computer:</div>
    <div>${text} ${emoji}</div>
  `;
  elements.commentsContainer.prepend(commentEl);
}

  // Get computer guess
  function getComputerGuess() {
    // Filter out already guessed letters and prioritize frequent ones
    const availableLetters = state.letterFrequency.filter(l => !state.computerGuessed.includes(l));
    if (availableLetters.length > 0) {
      return availableLetters[0]; // Take the most frequent un-guessed letter
    }
    // Fallback: if all frequent letters are guessed, pick any un-guessed letter
    return 'abcdefghijklmnopqrstuvwxyz'.split('').find(l => !state.computerGuessed.includes(l));
  }

  // Process a guess (for both user and computer)
  function processGuess(letter, guessedLetters, targetWord, display, ctx, playerType) {
    // Add the letter to the guessed letters array if not already present
    if (!guessedLetters.includes(letter)) {
      guessedLetters.push(letter);
    }
    
    let isCorrect = false;
    targetWord.split('').forEach((char, i) => {
      if (char === letter) {
        display[i] = letter;
        isCorrect = true;
      }
    });
    
    if (isCorrect) {
      // Correct guess
      if (playerType === 'user') {
        elements.userMessage.textContent = `Good guess! "${letter.toUpperCase()}" is in the word.`;
      } else {
        elements.computerMessage.textContent = `Computer guessed "${letter.toUpperCase()}" correctly!`;
      }
    } else {
      // Wrong guess
      if (playerType === 'user') {
        state.userWrongCount++;
        drawHangmanPart(ctx, state.userWrongCount);
        elements.userMessage.textContent = `Wrong! "${letter.toUpperCase()}" is not in the word. (${state.userWrongCount}/${state.maxWrong})`;
      } else {
        state.computerWrongCount++;
        drawHangmanPart(ctx, state.computerWrongCount);
        elements.computerMessage.textContent = `Computer guessed "${letter.toUpperCase()}" wrong! (${state.computerWrongCount}/${state.maxWrong})`;
      }
    }
  }

  // Update game UI (word displays, guessed letters, wrong counts, messages)
  function updateGameUI() {
    elements.computerWordDisplay.textContent = state.userDisplay.join(' ');
    elements.userWordDisplay.textContent = state.computerDisplay.join(' ');
    
    // Sort guessed letters alphabetically for consistent display
    elements.userGuessedLetters.textContent = state.userGuessed.map(l => l.toUpperCase()).sort().join(', ');
    elements.computerGuessedLetters.textContent = state.computerGuessed.map(l => l.toUpperCase()).sort().join(', ');
    
    // Update wrong counts
    elements.userWrongCount.textContent = `${state.userWrongCount}/${state.maxWrong}`;
    elements.computerWrongCount.textContent = `${state.computerWrongCount}/${state.maxWrong}`;
    
    // Message updates are primarily handled by processGuess and checkGameStatus,
    // but ensure base messages are present when turns change.
    if (state.userTurn && !isGameOver()) {
      if (!elements.userMessage.textContent.includes("Good guess!") && !elements.userMessage.textContent.includes("Wrong!")) {
        elements.userMessage.textContent = "Your turn to guess a letter!";
      }
      elements.computerMessage.textContent = "Computer is waiting...";
    } else if (!state.userTurn && !isGameOver()) {
      elements.userMessage.textContent = "Waiting for computer's guess...";
      if (!elements.computerMessage.textContent.includes("Correct!") && !elements.computerMessage.textContent.includes("Wrong!")) {
        elements.computerMessage.textContent = "Computer is making a guess...";
      }
    }
    
    // Update turn indicator
    updateTurnIndicator();
  }
  
  // Update turn indicator and active player card
  function updateTurnIndicator() {
    const indicator = document.querySelector('.turn-indicator');
    if (state.userTurn) {
      indicator.textContent = "Your Turn to Guess";
      elements.userCard.classList.add('active');
      elements.computerCard.classList.remove('active');
    } else {
      indicator.textContent = "Computer's Turn";
      elements.computerCard.classList.add('active');
      elements.userCard.classList.remove('active');
    }
  }

  // Check game status (win/lose conditions)
  function checkGameStatus() {
    if (!isGameOver()) return; // Only proceed if game is actually over
    
    elements.letterInput.disabled = true;
    elements.guessButton.disabled = true;
    elements.restartButton.classList.remove('hidden');
    
    const userWon = !state.userDisplay.includes('_');
    const computerWon = !state.computerDisplay.includes('_');
    const userLostOnHangman = state.userWrongCount >= state.maxWrong;
    const computerLostOnHangman = state.computerWrongCount >= state.maxWrong;

    // Determine the overall winner or tie
    if (userWon && computerWon) {
        // This scenario means both completed their words on the same guess (unlikely but possible if a final letter completes both)
        elements.userMessage.textContent = "It's a tie! Both guessed their words!";
        elements.computerMessage.textContent = "It's a tie! Well played, human!";
        addComputerComment("A tie? I suppose I can accept that for a human.");
    } else if (userWon) {
        elements.userMessage.textContent = `🎉 You guessed the computer's word ("${state.computerWord.toUpperCase()}")! You win!`;
        elements.computerMessage.textContent = "Computer lost! You won!";
        addComputerComment("How did you guess it?! I demand a rematch!");
    } else if (computerWon) {
        elements.computerMessage.textContent = `､�Computer guessed your word ("${state.userWord.toUpperCase()}")! Computer wins!`;
        elements.userMessage.textContent = "You lost! Computer won!";
        addComputerComment("I knew it! Humans are no match for my algorithms!");
    } else if (userLostOnHangman) {
        elements.userMessage.textContent = `逐 You lost! The word was "${state.computerWord.toUpperCase()}".`;
        elements.computerMessage.textContent = "Computer wins!";
        addComputerComment("HAHA! Better luck next time, human!");
    } else if (computerLostOnHangman) {
        elements.computerMessage.textContent = `逐 Computer lost! Your word was "${state.userWord.toUpperCase()}".`;
        elements.userMessage.textContent = "You win!";
        addComputerComment("NOOOOO! This can't be happening! I demand a rematch!");
    }
  }

  // Helper functions
  function isValidLetter(letter) {
    if (!letter.match(/^[a-z]$/)) {
      elements.userMessage.textContent = "Please enter a single letter (a-z).";
      return false;
    }
    return true;
  }

  function isDuplicateGuess(letter, guessedLetters) {
    return guessedLetters.includes(letter);
  }

  function isGameOver() {
    return !state.userDisplay.includes('_') || // User guessed computer's word
           !state.computerDisplay.includes('_') || // Computer guessed user's word
           state.userWrongCount >= state.maxWrong || // User ran out of guesses
           state.computerWrongCount >= state.maxWrong; // Computer ran out of guesses
  }

  // Reset the game to the setup screen
  function resetGame() {
    elements.gameScreen.classList.add('hidden');
    elements.setupScreen.classList.remove('hidden');
    elements.userWordInput.value = ''; // Clear the input field
    elements.setupMessage.textContent = ''; // Clear any messages
    elements.restartButton.classList.add('hidden');
    elements.userWordInput.focus(); // Focus for new game setup
  }

  // Canvas drawing functions for hangman
  function clearCanvas(ctx) {
    ctx.clearRect(0, 0, 200, 250);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#2c3e50";
  }

  function drawHangmanPart(ctx, step) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#2c3e50";
    ctx.lineCap = 'round';

    switch (step) {
      case 1: // Base
        drawLines(ctx, [[10, 230, 190, 230], [50, 230, 50, 20]]);
        break;
      case 2: // Beam
        drawLines(ctx, [[50, 20, 140, 20], [140, 20, 140, 50]]);
        break;
      case 3: // Head
        ctx.beginPath();
        ctx.arc(140, 75, 25, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 4: // Body
        drawLines(ctx, [[140, 100, 140, 160]]);
        break;
      case 5: // Arms
        drawLines(ctx, [[140, 110, 100, 140], [140, 110, 180, 140]]);
        break;
      case 6: // Legs
        drawLines(ctx, [[140, 160, 110, 200], [140, 160, 170, 200]]);
        break;
    }
  }

  function drawLines(ctx, lines) {
    ctx.beginPath();
    lines.forEach(([x1, y1, x2, y2]) => {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    });
    ctx.stroke();
  }

  // Initialize game on page load
  init();
});