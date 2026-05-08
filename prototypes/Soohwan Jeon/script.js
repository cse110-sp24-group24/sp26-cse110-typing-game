// Example snippets for the prototype. The player must type these exactly.
const codeSnippets = [
  'const score = 10;',
  'function sayHi() { return "Hello!"; }',
  '<button class="start">Start</button>',
  'body { margin: 0; }',
  'let isGameOver = false;',
  'console.log("Level complete!");'
];

// Get the HTML elements we need to update during the game.
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const snippetElement = document.getElementById('snippet');
const typingInput = document.getElementById('typingInput');
const messageElement = document.getElementById('message');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');

let score = 0;
let timeLeft = 30;
let currentSnippet = '';
let timerId = null;
let gameIsRunning = false;

// Pick a random snippet and show it on the screen.
function loadRandomSnippet() {
  const randomIndex = Math.floor(Math.random() * codeSnippets.length);
  currentSnippet = codeSnippets[randomIndex];
  snippetElement.textContent = currentSnippet;
  typingInput.value = '';
}

// Reset the visible score, timer, message, and input box.
function resetGame() {
  score = 0;
  timeLeft = 30;
  gameIsRunning = false;
  clearInterval(timerId);

  scoreElement.textContent = score;
  timeElement.textContent = timeLeft;
  snippetElement.textContent = 'Press Start to load a code snippet.';
  typingInput.value = '';
  typingInput.disabled = true;
  messageElement.textContent = 'Press Start to begin.';
  startButton.disabled = false;
}

// Start a new 30-second round.
function startGame() {
  resetGame();
  gameIsRunning = true;
  startButton.disabled = true;
  typingInput.disabled = false;
  messageElement.textContent = 'Type the snippet exactly.';
  loadRandomSnippet();
  typingInput.focus();

  timerId = setInterval(function () {
    timeLeft = timeLeft - 1;
    timeElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerId);
      gameIsRunning = false;
      typingInput.disabled = true;
      startButton.disabled = false;
      messageElement.textContent = 'Time is up! Final score: ' + score;
    }
  }, 1000);
}

// Check the typed text every time the player changes the input.
function checkAnswer() {
  if (!gameIsRunning) {
    return;
  }

  if (typingInput.value === currentSnippet) {
    score = score + 1;
    scoreElement.textContent = score;
    messageElement.textContent = 'Correct! New snippet loaded.';
    loadRandomSnippet();
  }
}

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
typingInput.addEventListener('input', checkAnswer);

// Set the first screen state when the page opens.
resetGame();
