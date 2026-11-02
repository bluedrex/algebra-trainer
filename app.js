const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyJyZF28tMkCIDBfCz7z5PlVvgC7-mUPNDEdvw1IT2xt4fpPLI-1G_cYOL67E2Eqsz98A/exec";

async function submitQuizSession(sessionResults) {
  /*
    sessionResults example structure:
    {
      id: "Student_Name_101",
      l1: 0, l2: 5, l3: 5, l4: 0, l5: 0, l6: 0, // question counts per level
      correct: 8,                                // total correct out of 10
      xp: 450,                                   // base XP + speed bonus
      time: 210,                                 // time taken in seconds
      streak: 3                                  // current streak
    }
  */

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8" // Bypasses CORS preflight issues
      },
      body: JSON.stringify(sessionResults)
    });

    const result = await response.json();
    if (result.status === "success") {
      console.log("Score logged to Google Sheet successfully!");
    } else {
      console.error("Server error:", result.message);
    }
  } catch (error) {
    console.error("Network or submission failed:", error);
  }
}

// Global State
let selectedLevels = [];
let questionQueue = [];
let currentQuestionIndex = 0;
let userScore = 0;
let startTime = 0;
let levelCounts = { l1: 0, l2: 0, l3: 0, l4: 0, l5: 0, l6: 0 };

const WEB_APP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_URL_HERE/exec";

// 1. Initialize Quiz Session from Chapter Menu
function startQuizSession(totalQuestions = 10) {
  // Read checked boxes from UI (e.g., checkboxes with class 'chapter-checkbox')
  const checkedBoxes = document.querySelectorAll('.chapter-checkbox:checked');
  selectedLevels = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

  if (selectedLevels.length === 0) {
    alert("Please select at least one chapter!");
    return;
  }

  if (selectedLevels.length > 3 && selectedLevels.length < 6) {
    alert("Please select up to 3 chapters, or pick 'Select All / Mixed Marathon'.");
    return;
  }

  // Reset counters & state
  questionQueue = [];
  currentQuestionIndex = 0;
  userScore = 0;
  levelCounts = { l1: 0, l2: 0, l3: 0, l4: 0, l5: 0, l6: 0 };

  // Generate balanced queue across selected levels
  for (let i = 0; i < totalQuestions; i++) {
    // Pick a random level from the user's selected array
    const chosenLevel = selectedLevels[Math.floor(Math.random() * selectedLevels.length)];
    
    // Generate question object from generator.js
    const qObj = getRandomQuestion(chosenLevel);
    questionQueue.push(qObj);

    // Track how many questions were generated per level
    levelCounts[`l${chosenLevel}`]++;
  }

  startTime = Date.now();
  renderCurrentQuestion();
}

// 2. Render Question on Screen
function renderCurrentQuestion() {
  if (currentQuestionIndex >= questionQueue.length) {
    finishQuizSession();
    return;
  }

  const currentQ = questionQueue[currentQuestionIndex];
  
  // Render question text & level badge to UI elements
  document.getElementById("question-title").innerHTML = currentQ.question;
  document.getElementById("level-badge").innerText = `Level ${currentQ.level}: ${currentQ.type}`;
  document.getElementById("question-progress").innerText = `Question ${currentQuestionIndex + 1} of ${questionQueue.length}`;
  document.getElementById("user-answer-input").value = "";
  
  // Render LaTeX math using CodeCogs or MathJax if present
  if (window.MathJax) {
    MathJax.typesetPromise();
  }
}

// 3. Submit Answer & Advance
function submitAnswer() {
  const userInput = document.getElementById("user-answer-input").value.trim().replaceAll(" ", "");
  const currentQ = questionQueue[currentQuestionIndex];
  const correctAnswer = currentQ.answer.trim().replaceAll(" ", "");

  if (userInput === correctAnswer) {
    userScore++;
  }

  currentQuestionIndex++;
  renderCurrentQuestion();
}

// 4. Calculate Rewards & Post to Google Sheet Backend
async function finishQuizSession() {
  const totalTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const totalQuestions = questionQueue.length;
  const accuracy = userScore / totalQuestions;

  // XP & Speed Bonus Logic
  let xpEarned = userScore * 10; // 10 XP per correct answer
  
  // 70% Accuracy Gate for Speed Bonus
  if (accuracy >= 0.70) {
    if (totalTimeSeconds < 180) {
      xpEarned += 500; // < 3 mins
    } else if (totalTimeSeconds <= 480) {
      // 3 to 8 minutes: Decrements from 400 down to 100
      const minutesOver3 = (totalTimeSeconds - 180) / 60;
      const bonus = Math.max(100, Math.round(400 - (minutesOver3 * 60)));
      xpEarned += bonus;
    }
  }

  // Payload for Google Apps Script
  const sessionResults = {
    id: localStorage.getItem("student_id") || "Student_Demo",
    l1: levelCounts.l1,
    l2: levelCounts.l2,
    l3: levelCounts.l3,
    l4: levelCounts.l4,
    l5: levelCounts.l5,
    l6: levelCounts.l6,
    correct: userScore,
    xp: xpEarned,
    time: totalTimeSeconds,
    streak: parseInt(localStorage.getItem("user_streak") || "1")
  };

  // UI Feedback
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("results-container").innerHTML = `
    <h2>Session Complete!</h2>
    <p>Score: ${userScore} / ${totalQuestions}</p>
    <p>Time Taken: ${Math.floor(totalTimeSeconds / 60)}m ${totalTimeSeconds % 60}s</p>
    <p>XP Earned: +${xpEarned} XP</p>
  `;

  // Send score log to Apps Script
  try {
    await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(sessionResults)
    });
    console.log("Logged successfully to Google Sheet");
  } catch (err) {
    console.error("Submission failed:", err);
  }
}
