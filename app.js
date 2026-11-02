const WEB_APP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_URL_HERE/exec";

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
