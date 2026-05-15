const languagePrograms = {
  html: {
    label: "HTML",
    fileName: "index.html",
    lines: [
      "<!DOCTYPE html>",
      "<html lang=\"en\">",
      "  <head>",
      "    <title>Code Race</title>",
      "  </head>",
      "  <body>",
      "    <button class=\"run-button\">Start</button>",
      "  </body>",
      "</html>"
    ]
  },
  css: {
    label: "CSS",
    fileName: "styles.css",
    lines: [
      ".run-button {",
      "  color: white;",
      "  background: #007acc;",
      "  border: 1px solid #2b9bea;",
      "  padding: 12px 18px;",
      "  border-radius: 4px;",
      "}"
    ]
  },
  javascript: {
    label: "JavaScript",
    fileName: "practice.js",
    lines: [
      "const playerName = 'Code Rookie';",
      "let typedLines = 0;",
      "function celebrateLine(lineNumber) {",
      "  const message = `Line ${lineNumber} compiled!`;",
      "  console.log(message);",
      "  return message;",
      "}",
      "celebrateLine(typedLines + 1);"
    ]
  },
  python: {
    label: "Python",
    fileName: "practice.py",
    lines: [
      "player_name = \"Code Rookie\"",
      "typed_lines = 0",
      "def celebrate_line(line_number):",
      "    message = f\"Line {line_number} compiled!\"",
      "    print(message)",
      "    return message",
      "celebrate_line(typed_lines + 1)"
    ]
  },
  java: {
    label: "Java",
    fileName: "Practice.java",
    lines: [
      "public class Practice {",
      "  public static void main(String[] args) {",
      "    String playerName = \"Code Rookie\";",
      "    int typedLines = 0;",
      "    System.out.println(playerName + typedLines);",
      "  }",
      "}"
    ]
  },
  c: {
    label: "C",
    fileName: "practice.c",
    lines: [
      "#include <stdio.h>",
      "int main(void) {",
      "  int typed_lines = 0;",
      "  printf(\"Line %d compiled!\\n\", typed_lines + 1);",
      "  return 0;",
      "}"
    ]
  },
  cpp: {
    label: "C++",
    fileName: "practice.cpp",
    lines: [
      "#include <iostream>",
      "int main() {",
      "  int typedLines = 0;",
      "  std::cout << \"Line compiled!\" << std::endl;",
      "  return typedLines;",
      "}"
    ]
  },
  csharp: {
    label: "C#",
    fileName: "Practice.cs",
    lines: [
      "using System;",
      "class Practice {",
      "  static void Main() {",
      "    int typedLines = 0;",
      "    Console.WriteLine($\"Line {typedLines + 1} compiled!\");",
      "  }",
      "}"
    ]
  }
};

const praiseMessages = [
  "Nice commit. That line compiled cleanly.",
  "Clean syntax. Keep the momentum going.",
  "Great line. The editor approves.",
  "Sharp typing. Build confidence increased.",
  "Beautiful. No red squiggles here."
];

const bestWpmStorageKey = "codeTypeStudioBestWpm";
const botTickRate = 120;
const botDifficultyLabels = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  impossible: "Impossible"
};

const languageModal = document.querySelector("#languageModal");
const resultModal = document.querySelector("#resultModal");
const languageOptionsElement = document.querySelector("#languageOptions");
const languageTab = document.querySelector("#languageTab");
const languageLabel = document.querySelector("#languageLabel");
const gameHeading = document.querySelector("#game-heading");
const selectedFileName = document.querySelector("#selectedFileName");
const playerCodeLinesElement = document.querySelector("#playerCodeLines");
const botCodeLinesElement = document.querySelector("#botCodeLines");
const typingInput = document.querySelector("#typingInput");
const restartButton = document.querySelector("#restartButton");
const changeLanguageButton = document.querySelector("#changeLanguageButton");
const currentWpmElement = document.querySelector("#currentWpm");
const bestWpmElement = document.querySelector("#bestWpm");
const accuracyElement = document.querySelector("#accuracy");
const botWpmElement = document.querySelector("#botWpm");
const statusMessageElement = document.querySelector("#statusMessage");
const progressStatusElement = document.querySelector("#progressStatus");
const playerProgressText = document.querySelector("#playerProgressText");
const botProgressText = document.querySelector("#botProgressText");
const playerPercent = document.querySelector("#playerPercent");
const botPercent = document.querySelector("#botPercent");
const playerProgressBar = document.querySelector("#playerProgressBar");
const botProgressBar = document.querySelector("#botProgressBar");
const ghostLine = document.querySelector("#ghostLine");
const resultTitle = document.querySelector("#resultTitle");
const resultSummary = document.querySelector("#resultSummary");
const resultPlayerWpm = document.querySelector("#resultPlayerWpm");
const resultPlayerAccuracy = document.querySelector("#resultPlayerAccuracy");
const resultPlayerProgress = document.querySelector("#resultPlayerProgress");
const resultBotWpm = document.querySelector("#resultBotWpm");
const resultBotAccuracy = document.querySelector("#resultBotAccuracy");
const resultBotProgress = document.querySelector("#resultBotProgress");
const resultResetButton = document.querySelector("#resultResetButton");
const soloModeButton = document.querySelector("#soloModeButton");
const botModeButton = document.querySelector("#botModeButton");
const difficultyGroup = document.querySelector("#difficultyGroup");
const difficultyButtons = Array.from(document.querySelectorAll(".difficulty-button"));

let selectedLanguageKey = null;
let currentLines = [];
let selectedMode = "solo";
let selectedDifficulty = "easy";
let activeLineIndex = 0;
let startTime = null;
let totalTypedEvents = 0;
let totalMistakes = 0;
let bestWpm = Number(localStorage.getItem(bestWpmStorageKey)) || 0;
let botLineIndex = 0;
let botCharacterProgress = 0;
let botIntervalId = null;
let botTargetWpm = 0;
let raceFinished = false;

function renderLanguageOptions() {
  languageOptionsElement.innerHTML = "";

  Object.entries(languagePrograms).forEach(([languageKey, program]) => {
    const button = document.createElement("button");
    button.className = "language-button";
    button.type = "button";
    button.textContent = program.label;
    button.dataset.languageKey = languageKey;
    button.addEventListener("click", () => selectLanguage(languageKey));
    languageOptionsElement.append(button);
  });
}

function selectLanguage(languageKey) {
  selectedLanguageKey = languageKey;
  currentLines = languagePrograms[languageKey].lines;
  hideLanguagePicker();
  restartGame();
}

function selectMode(mode) {
  selectedMode = mode;
  const isBotMode = selectedMode === "bot";

  soloModeButton.classList.toggle("active", !isBotMode);
  botModeButton.classList.toggle("active", isBotMode);
  difficultyGroup.classList.toggle("hidden", !isBotMode);
  document.body.classList.toggle("solo-mode", !isBotMode);
}

function selectDifficulty(difficulty) {
  selectedDifficulty = difficulty;

  difficultyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.difficulty === selectedDifficulty);
  });
}

function renderCodeLines(targetElement, owner) {
  targetElement.innerHTML = "";

  currentLines.forEach((line, index) => {
    const lineItem = document.createElement("li");
    lineItem.className = "code-line";
    lineItem.dataset.lineIndex = String(index);
    lineItem.dataset.owner = owner;

    const lineText = document.createElement("code");
    lineText.className = "line-text";
    lineText.innerHTML = highlightCode(line);

    lineItem.append(lineText);
    targetElement.append(lineItem);
  });
}

function highlightCode(line) {
  let highlightedLine = escapeHtml(line);
  const tokens = [];

  const stashMatches = (pattern, className) => {
    highlightedLine = highlightedLine.replace(pattern, (match) => {
      const placeholder = `@@TOKEN${getTokenName(tokens.length)}@@`;
      tokens.push({
        html: `<span class="${className}">${match}</span>`,
        placeholder
      });

      return placeholder;
    });
  };

  stashMatches(/"[^"]*"|'[^']*'|`[^`]*`/g, "string");
  stashMatches(/\b(celebrateLine|celebrate_line|console\.log|print|printf|System\.out\.println|Console\.WriteLine|std::cout)\b/g, "function-name");
  stashMatches(/\b(const|let|function|return|def|class|public|static|void|int|using|include|main|body|head|title|button|String)\b/g, "keyword");
  stashMatches(/\b\d+\b/g, "number");

  tokens.forEach((token) => {
    highlightedLine = highlightedLine.replaceAll(token.placeholder, token.html);
  });

  return highlightedLine;
}

function getTokenName(index) {
  let tokenName = "";
  let currentIndex = index;

  do {
    tokenName = String.fromCharCode(65 + (currentIndex % 26)) + tokenName;
    currentIndex = Math.floor(currentIndex / 26) - 1;
  } while (currentIndex >= 0);

  return tokenName;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function updateActiveLine() {
  getPlayerLineElements().forEach((lineElement, index) => {
    lineElement.classList.toggle("active", index === activeLineIndex);
    lineElement.classList.remove("error");
  });

  typingInput.value = "";
  renderGhostLine();
  progressStatusElement.textContent = `Line ${Math.min(activeLineIndex + 1, currentLines.length)} / ${currentLines.length}`;
}

function handleTypingInput(event) {
  if (!selectedLanguageKey || raceFinished) {
    return;
  }

  const sanitizedValue = stripLineBreaks(event.target.value);

  if (event.target.value !== sanitizedValue) {
    typingInput.value = sanitizedValue;
  }

  if (startTime === null && sanitizedValue.length > 0) {
    startRace();
  }

  const typedValue = normalizeForTyping(sanitizedValue);
  const expectedLine = getExpectedTypingLine();
  const activeLineElement = getActivePlayerLineElement();

  totalTypedEvents += 1;

  if (!expectedLine.startsWith(typedValue)) {
    totalMistakes += 1;
    typingInput.classList.add("input-error");
    typingInput.closest(".typing-box").classList.add("has-error");
    activeLineElement?.classList.add("error");
    statusMessageElement.textContent = "Almost there. Symbols and casing still matter; indentation does not.";
    renderGhostLine();
    updateStats();
    return;
  }

  typingInput.classList.remove("input-error");
  typingInput.closest(".typing-box").classList.remove("has-error");
  activeLineElement?.classList.remove("error");

  if (typedValue === expectedLine) {
    completeCurrentLine();
    return;
  }

  renderGhostLine();
  updateStats();
}

function startRace() {
  startTime = Date.now();

  if (isBotMode()) {
    botTargetWpm = getBotTargetWpm();
    botWpmElement.textContent = String(botTargetWpm);
    botProgressText.textContent = `${botDifficultyLabels[selectedDifficulty]} bot is typing`;
    statusMessageElement.textContent = "Race started. Beat the bot to the final line.";
    botIntervalId = window.setInterval(advanceBot, botTickRate);
    return;
  }

  botTargetWpm = 0;
  botWpmElement.textContent = "-";
  botProgressText.textContent = "Solo mode";
  statusMessageElement.textContent = "Solo run started. Finish every line cleanly.";
}

function completeCurrentLine() {
  const activeLineElement = getActivePlayerLineElement();
  const randomPraise = praiseMessages[Math.floor(Math.random() * praiseMessages.length)];

  activeLineElement.classList.remove("active");
  activeLineElement.classList.add("complete");
  activeLineIndex += 1;

  statusMessageElement.textContent = randomPraise;
  typingInput.value = "";
  updateStats();
  updatePlayerProgress();

  if (activeLineIndex >= currentLines.length) {
    finishRace(true);
    return;
  }

  window.setTimeout(updateActiveLine, 120);
}

function advanceBot() {
  if (!isBotMode() || raceFinished || startTime === null) {
    return;
  }

  const botCharactersPerTick = (botTargetWpm * 5 * botTickRate) / 60000;
  botCharacterProgress += botCharactersPerTick;

  while (botLineIndex < currentLines.length && botCharacterProgress >= getComparableLine(botLineIndex).length) {
    botCharacterProgress -= getComparableLine(botLineIndex).length;
    markBotLineComplete(botLineIndex);
    botLineIndex += 1;
  }

  updateBotProgress();

  if (botLineIndex >= currentLines.length) {
    finishRace(false);
  }
}

function finishRace(playerWon) {
  const finalWpm = calculateWpm();
  const bestWasUpdated = updateBestWpm(finalWpm);

  raceFinished = true;
  window.clearInterval(botIntervalId);
  typingInput.disabled = true;
  ghostLine.textContent = getFinishGhostText(playerWon);
  updateStats();

  if (playerWon || !isBotMode()) {
    statusMessageElement.textContent = bestWasUpdated
      ? `New personal best: ${bestWpm} WPM.`
      : getPlayerWinStatus(finalWpm);
    progressStatusElement.textContent = `Completed ${currentLines.length} / ${currentLines.length}`;
    showResultModal(true, finalWpm, bestWasUpdated);
    return;
  }

  statusMessageElement.textContent = bestWasUpdated
    ? `Build failed: Syntax Bot finished first, but ${bestWpm} WPM is your new best.`
    : `Build failed: Syntax Bot finished first. You reached ${finalWpm} WPM.`;
  progressStatusElement.textContent = "Race failed";
  getPlayerLineElements().forEach((lineElement, index) => {
    if (index >= activeLineIndex) {
      lineElement.classList.add("failed");
    }
  });
  showResultModal(false, finalWpm, bestWasUpdated);
}

function updateBestWpm(finalWpm) {
  if (finalWpm > bestWpm) {
    bestWpm = finalWpm;
    localStorage.setItem(bestWpmStorageKey, String(bestWpm));
    bestWpmElement.textContent = String(bestWpm);
    return true;
  }

  return false;
}

function restartGame() {
  if (!selectedLanguageKey) {
    showLanguagePicker();
    return;
  }

  const program = languagePrograms[selectedLanguageKey];

  activeLineIndex = 0;
  startTime = null;
  totalTypedEvents = 0;
  totalMistakes = 0;
  botLineIndex = 0;
  botCharacterProgress = 0;
  botTargetWpm = 0;
  raceFinished = false;

  window.clearInterval(botIntervalId);
  renderCodeLines(playerCodeLinesElement, "player");
  renderCodeLines(botCodeLinesElement, "bot");

  hideLanguagePicker();
  hideResultModal();
  document.body.classList.toggle("solo-mode", !isBotMode());
  languageLabel.textContent = isBotMode()
    ? `${program.label} ${botDifficultyLabels[selectedDifficulty]} Race`
    : `${program.label} Solo`;
  gameHeading.textContent = isBotMode()
    ? "Beat the bot by finishing every code line first."
    : "Practice the code cleanly at your own pace.";
  languageTab.textContent = program.fileName;
  selectedFileName.textContent = program.fileName;
  typingInput.disabled = false;
  typingInput.classList.remove("input-error");
  typingInput.closest(".typing-box").classList.remove("has-error");
  statusMessageElement.textContent = isBotMode()
    ? "Type the highlighted line to start the head-to-head race."
    : "Type the highlighted line to start solo practice.";
  currentWpmElement.textContent = "0";
  botWpmElement.textContent = isBotMode() ? "0" : "-";
  accuracyElement.textContent = "100%";
  botProgressText.textContent = isBotMode() ? "Waiting for your first key" : "Solo mode";

  updateActiveLine();
  updatePlayerProgress();
  updateBotProgress();
  botProgressText.textContent = isBotMode() ? "Waiting for your first key" : "Solo mode";
  typingInput.focus();
}

function showLanguagePicker() {
  raceFinished = true;
  window.clearInterval(botIntervalId);
  hideResultModal();
  languageModal.classList.remove("hidden");
  typingInput.disabled = true;
  typingInput.value = "";
  typingInput.classList.remove("input-error");
  typingInput.closest(".typing-box").classList.remove("has-error");
  ghostLine.textContent = "Choose a language to unlock the race...";
  statusMessageElement.textContent = "Choose a language to load your code challenge.";
  progressStatusElement.textContent = "Race not started";
}

function hideLanguagePicker() {
  languageModal.classList.add("hidden");
}

function showResultModal(playerWon, finalWpm, bestWasUpdated) {
  resultModal.classList.toggle("solo-result", !isBotMode());
  resultTitle.textContent = getResultTitle(playerWon);
  resultSummary.textContent = getResultSummary(playerWon, bestWasUpdated);
  resultPlayerWpm.textContent = String(finalWpm);
  resultPlayerAccuracy.textContent = `${calculateAccuracy()}%`;
  resultPlayerProgress.textContent = `${getPlayerProgressPercent()}%`;
  resultBotWpm.textContent = isBotMode() ? String(botTargetWpm) : "-";
  resultBotAccuracy.textContent = "100%";
  resultBotProgress.textContent = isBotMode() ? `${getBotProgressPercent()}%` : "-";
  resultModal.classList.remove("hidden");
}

function getResultTitle(playerWon) {
  if (!isBotMode()) {
    return "Solo run complete.";
  }

  return playerWon ? "You beat Syntax Bot." : "Syntax Bot finished first.";
}

function getResultSummary(playerWon, bestWasUpdated) {
  if (!isBotMode() && bestWasUpdated) {
    return "Solo run complete with a new personal best.";
  }

  if (!isBotMode()) {
    return "Clean solo practice run. Reset to try the same language again.";
  }

  if (playerWon && bestWasUpdated) {
    return "Victory and a new personal best. That run compiled beautifully.";
  }

  if (playerWon) {
    return "You finished first. Reset to race the same language again.";
  }

  if (bestWasUpdated) {
    return "You lost the race, but this was still your new personal best.";
  }

  return "Review both runs, then reset for another attempt.";
}

function hideResultModal() {
  resultModal.classList.add("hidden");
  resultModal.classList.remove("solo-result");
}

function updateStats() {
  currentWpmElement.textContent = String(calculateWpm());
  accuracyElement.textContent = `${calculateAccuracy()}%`;
  updatePlayerProgress();
}

function updatePlayerProgress() {
  const currentCharacters = normalizeForTyping(typingInput.value).length;
  const completedCharacters = getCompletedPlayerCharacters() + currentCharacters;
  const totalCharacters = getTotalComparableCharacters();
  const percent = getProgressPercent(completedCharacters, totalCharacters);

  playerProgressBar.style.width = `${percent}%`;
  playerPercent.textContent = `${percent}%`;
  playerProgressText.textContent = `${Math.min(activeLineIndex, currentLines.length)} of ${currentLines.length} lines`;
}

function updateBotProgress() {
  if (!isBotMode()) {
    botProgressBar.style.width = "0%";
    botPercent.textContent = "0%";
    botProgressText.textContent = "Solo mode";
    return;
  }

  const completedCharacters = getCompletedBotCharacters();
  const totalCharacters = getTotalComparableCharacters();
  const percent = getProgressPercent(completedCharacters, totalCharacters);

  getBotLineElements().forEach((lineElement, index) => {
    lineElement.classList.toggle("active", index === botLineIndex && botLineIndex < currentLines.length);
  });

  botProgressBar.style.width = `${percent}%`;
  botPercent.textContent = `${percent}%`;
  botProgressText.textContent = botLineIndex >= currentLines.length ? "Finished" : `${botLineIndex} of ${currentLines.length} lines`;
}

function renderGhostLine() {
  const targetLine = getExpectedTypingLine();
  const typedValue = normalizeForTyping(typingInput.value);
  const fragment = document.createDocumentFragment();
  const totalCharacters = Math.max(targetLine.length, typedValue.length);

  ghostLine.innerHTML = "";

  if (!targetLine) {
    ghostLine.textContent = typingInput.disabled ? ghostLine.textContent : "";
    return;
  }

  for (let index = 0; index < totalCharacters; index += 1) {
    const targetCharacter = targetLine[index] || "";
    const typedCharacter = typedValue[index];
    const characterSpan = document.createElement("span");

    characterSpan.className = getGhostCharacterClass(targetCharacter, typedCharacter);
    characterSpan.textContent = typedCharacter ?? targetCharacter;
    fragment.append(characterSpan);
  }

  ghostLine.append(fragment);
}

function getGhostCharacterClass(targetCharacter, typedCharacter) {
  if (typedCharacter === undefined) {
    return "ghost-character pending";
  }

  if (typedCharacter === targetCharacter) {
    return "ghost-character correct";
  }

  return "ghost-character incorrect";
}

function markBotLineComplete(lineIndex) {
  const lineElement = getBotLineElements()[lineIndex];

  if (lineElement) {
    lineElement.classList.remove("active");
    lineElement.classList.add("complete", "bot-complete");
  }
}

function calculateWpm() {
  if (startTime === null) {
    return 0;
  }

  const elapsedMinutes = Math.max((Date.now() - startTime) / 60000, 1 / 60000);
  const currentCharacters = normalizeForTyping(typingInput.value).length;
  const typedWords = (getCompletedPlayerCharacters() + currentCharacters) / 5;

  return Math.round(typedWords / elapsedMinutes);
}

function calculateAccuracy() {
  if (totalTypedEvents === 0) {
    return 100;
  }

  const correctEvents = Math.max(totalTypedEvents - totalMistakes, 0);
  return Math.round((correctEvents / totalTypedEvents) * 100);
}

function getBotTargetWpm() {
  const playerBestFloor = Math.max(bestWpm, 34);
  const difficultyTargets = {
    easy: Math.max(playerBestFloor - 14, 24),
    medium: Math.max(playerBestFloor + 2, 38),
    hard: Math.max(playerBestFloor + 16, 54),
    impossible: Math.max(playerBestFloor + 42, 96)
  };
  const target = difficultyTargets[selectedDifficulty];

  return Math.round(target);
}

function getFinishGhostText(playerWon) {
  if (!isBotMode()) {
    return "Solo run complete.";
  }

  return playerWon ? "You beat the bot." : "Bot won this round.";
}

function getPlayerWinStatus(finalWpm) {
  if (!isBotMode()) {
    return `Solo run complete: ${finalWpm} WPM.`;
  }

  return `Victory: ${finalWpm} WPM. You beat Syntax Bot.`;
}

function isBotMode() {
  return selectedMode === "bot";
}

function getExpectedTypingLine() {
  if (activeLineIndex >= currentLines.length) {
    return "";
  }

  return getComparableLine(activeLineIndex);
}

function getComparableLine(lineIndex) {
  if (lineIndex < 0 || lineIndex >= currentLines.length) {
    return "";
  }

  return normalizeForTyping(currentLines[lineIndex]);
}

function getTotalComparableCharacters() {
  return currentLines.reduce((total, line) => total + normalizeForTyping(line).length, 0);
}

function getCompletedPlayerCharacters() {
  return currentLines
    .slice(0, activeLineIndex)
    .reduce((total, line) => total + normalizeForTyping(line).length, 0);
}

function getCompletedBotCharacters() {
  const completedCharacters = currentLines
    .slice(0, botLineIndex)
    .reduce((total, line) => total + normalizeForTyping(line).length, 0);

  return completedCharacters + Math.min(botCharacterProgress, getComparableLine(botLineIndex).length);
}

function getProgressPercent(completedCharacters, totalCharacters) {
  if (totalCharacters === 0) {
    return 0;
  }

  return Math.min(Math.round((completedCharacters / totalCharacters) * 100), 100);
}

function getPlayerProgressPercent() {
  const currentCharacters = normalizeForTyping(typingInput.value).length;
  const completedCharacters = getCompletedPlayerCharacters() + currentCharacters;

  return getProgressPercent(completedCharacters, getTotalComparableCharacters());
}

function getBotProgressPercent() {
  return getProgressPercent(getCompletedBotCharacters(), getTotalComparableCharacters());
}

function getActivePlayerLineElement() {
  return document.querySelector('[data-owner="player"].active');
}

function getPlayerLineElements() {
  return Array.from(document.querySelectorAll('[data-owner="player"]'));
}

function getBotLineElements() {
  return Array.from(document.querySelectorAll('[data-owner="bot"]'));
}

function stripLineBreaks(value) {
  return value.replace(/[\r\n]/g, "");
}

function normalizeForTyping(value) {
  return stripLineBreaks(String(value)).trim();
}

function handleTypingKeydown(event) {
  if (event.key === "Enter" || event.key === "Tab") {
    event.preventDefault();
  }
}

renderLanguageOptions();
bestWpmElement.textContent = String(bestWpm);
selectMode("solo");
selectDifficulty("easy");
showLanguagePicker();

typingInput.addEventListener("input", handleTypingInput);
typingInput.addEventListener("keydown", handleTypingKeydown);
restartButton.addEventListener("click", restartGame);
changeLanguageButton.addEventListener("click", showLanguagePicker);
resultResetButton.addEventListener("click", restartGame);
soloModeButton.addEventListener("click", () => selectMode("solo"));
botModeButton.addEventListener("click", () => selectMode("bot"));
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => selectDifficulty(button.dataset.difficulty));
});
