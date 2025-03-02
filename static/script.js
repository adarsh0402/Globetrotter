let timer, stopwatchTimer;
let timeLeft = 15;
let correctCount = 0;
let currentDestination = null;
let userId = null;
let username = null;
let gameOver = false;

// Show loader initially
document.getElementById("loader").style.display = "flex";
setTimeout(() => {
  document.getElementById("loader").style.display = "none";
  document.getElementById("start-screen").style.display = "flex";
  loadTopScores();
}, 2000);

// Load top scores
function loadTopScores() {
  fetch("/get_top_scores")
    .then((response) => response.json())
    .then((scores) => {
      const scoresList = document.getElementById("top-scores-list");
      scoresList.innerHTML = scores
        .map(
          (score) => `
                <div class="score-item">
                    <span>${score.username}</span>
                    <span>${score.score} points</span>
                </div>
            `
        )
        .join("");
    })
    .catch((error) => console.error("Error loading top scores:", error));
}

// Start Game
document.getElementById("start-game").addEventListener("click", () => {
  const usernameInput = document.getElementById("username");
  username = usernameInput.value.trim();

  if (!username) {
    showError("Please enter a username!");
    return;
  }

  fetch("/register_user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showError(data.error);
        return;
      }

      userId = data.user_id;
      gameOver = false;
      document.getElementById("player-username").textContent = username;
      document.getElementById("start-screen").style.display = "none";
      document.getElementById("game-screen").style.display = "flex";
      loadQuestion();
    })
    .catch((error) => {
      console.error("Error registering user:", error);
      showError("Failed to register. Please try again.");
    });
});

function showError(message) {
  const errorElement = document.getElementById("username-error");
  errorElement.textContent = message;
  errorElement.style.display = "block";
  setTimeout(() => {
    errorElement.style.display = "none";
  }, 3000);
}

// Load Question
function loadQuestion() {
  if (gameOver) return;

  clearTimers();
  document.getElementById("feedback").innerHTML = "";
  document.getElementById("stopwatch").style.display = "none";

  fetch("/get_destination")
    .then((response) => response.json())
    .then((data) => {
      currentDestination = data;
      document.getElementById("clues").innerHTML = data.clues
        .map((clue) => `<p>${clue}</p>`)
        .join("");

      document.getElementById("options").innerHTML = data.answers
        .map(
          (option) => `
            <button class="primary-button answer-btn" onclick="checkAnswer(this, '${option}', '${data.city}')">
                ${option}
            </button>
          `
        )
        .join("");

      startTimer();
    })
    .catch((error) => {
      console.error("Error loading question:", error);
      showPopup("Failed to load question. Please try again.");
    });
}

// Timer Functions
function startTimer() {
  timeLeft = 15;
  updateTimerDisplay();
  updateProgressBar();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    updateProgressBar();

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame("Time's up! ⏳");
    }
  }, 1000);
}

function updateTimerDisplay() {
  document.getElementById("time-left").innerText = timeLeft;
}

function updateProgressBar() {
  const progress = (timeLeft / 15) * 100;
  const progressBar = document.getElementById("timer-progress");
  progressBar.style.width = `${progress}%`;

  if (timeLeft <= 5) {
    progressBar.style.background = "linear-gradient(90deg, #ff4444, #cc0000)";
  } else if (timeLeft <= 10) {
    progressBar.style.background = "linear-gradient(90deg, #ffbb33, #ff8800)";
  } else {
    progressBar.style.background = "linear-gradient(90deg, #4CAF50, #45a049)";
  }
}

// Check Answer

function checkAnswer(button, selected, correct) {
  clearInterval(timer);

  // Disable only answer buttons, not popup buttons
  document.querySelectorAll(".answer-btn").forEach((btn) => {
    btn.disabled = true;
  });

  fetch("/check_answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      selectedAnswer: selected,
      correctAnswer: correct,
      userId: userId,
      finalScore: correctCount,
      isGameOver: selected !== correct,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const feedback = document.getElementById("feedback");
      if (data.correct) {
        correctCount++;
        document.getElementById("current-score").innerText = correctCount;

        const randomFact =
          currentDestination.facts[
            Math.floor(Math.random() * currentDestination.facts.length)
          ];
        feedback.innerHTML = `<p class="text-success">🎉 Correct!<br><small>${randomFact}</small></p>`;

        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

        startStopwatch();
      } else {
        button.style.backgroundColor = "#ff4444"; // Change wrong answer button to red
        button.style.color = "white";
        button.style.border = "5px solid #cc0000";

        const randomFact =
          currentDestination.facts[
            Math.floor(Math.random() * currentDestination.facts.length)
          ];
        feedback.innerHTML = `<p class="text-danger">😢 Incorrect!<br><small>${randomFact}</small></p>`;

        // Show sad-face animation
        const sadFace = document.createElement("div");
        sadFace.innerHTML = "😔";
        sadFace.style.fontSize = "4rem";
        sadFace.style.textAlign = "center";
        feedback.appendChild(sadFace);

        setTimeout(() => {
          endGame();
        }, 5000);
      }
    })
    .catch((error) => {
      console.error("Error checking answer:", error);
      showPopup("Failed to check answer. Please try again.");
    });
}

// Start Stopwatch for Next Question
function startStopwatch() {
  let secondsLeft = 5;
  const stopwatch = document.getElementById("stopwatch");
  const stopwatchTime = document.getElementById("stopwatch-time");

  stopwatch.style.display = "block";
  stopwatchTime.innerText = secondsLeft;

  stopwatchTimer = setInterval(() => {
    secondsLeft--;
    stopwatchTime.innerText = secondsLeft;
    if (secondsLeft <= 0) {
      clearInterval(stopwatchTimer);
      loadQuestion();
    }
  }, 1000);
}

// End Game
function endGame(message = "") {
  gameOver = true;
  clearTimers();
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("final-score").innerText = correctCount;
  showPopup(message || `Game Over! You scored ${correctCount} points!`);
}

// Clear Timers
function clearTimers() {
  if (timer) clearInterval(timer);
  if (stopwatchTimer) clearInterval(stopwatchTimer);
}

// Show Popup Only When Game Ends
function showPopup(message) {
  if (!gameOver) return;

  document.getElementById("popup-message").innerText = message;
  document.getElementById("popup").style.display = "flex";
}

// Reset Game for Play Again
document.getElementById("play-again").addEventListener("click", () => {
  correctCount = 0;
  gameOver = false;
  document.getElementById("current-score").innerText = "0";
  document.getElementById("popup").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";
  loadQuestion();
});

// Invite Friend - Show dialog box to enter username
document.getElementById("invite-friend").addEventListener("click", () => {
  const inviteDialog = document.getElementById("invite-dialog");
  inviteDialog.style.display = "flex"; // Show dialog
});

// Send Invitation - Register the entered username
document.getElementById("send-invite").addEventListener("click", () => {
  const friendUsername = document
    .getElementById("friend-username")
    .value.trim();

  if (!friendUsername) {
    alert("Please enter a username!");
    return;
  }

  fetch("/register_user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: friendUsername, isInvite: true }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        if (data.isexisting === true) {
          alert(`Can't invite! ${friendUsername} is already registered.`);
        } else {
          alert(`Invitation sent! ${friendUsername} is now registered.`);
        }
        document.getElementById("invite-dialog").style.display = "none"; // Hide dialog
      }
    })
    .catch((error) => {
      console.error("Error inviting friend:", error);
      alert("Failed to invite friend. Please try again.");
    });
});

// Close Invite Dialog
document.getElementById("close-invite").addEventListener("click", () => {
  document.getElementById("invite-dialog").style.display = "none";
});

// Back to Home - Redirect to the home page
document.getElementById("home").addEventListener("click", () => {
  window.location.href = "/"; // Redirect to the home page
});
