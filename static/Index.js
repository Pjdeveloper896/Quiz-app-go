const btn = document.getElementById("btn");
const quiz = document.getElementById("quiz");
let score = 0;
let userID = "user123"; // You can generate a userID or get it from session

btn.addEventListener("click", () => {
  generate();
});

async function generate() {
  quiz.innerHTML = '';
  score = 0; // Reset score when a new quiz is generated

  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;
  const difficulty = document.getElementById("difficulty").value;

  const url = `https://opentdb.com/api.php?amount=5&category=${category}&type=${type}&difficulty=${difficulty}`;
  const res = await fetch(url);
  const data = await res.json();

  data.results.forEach((q, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.innerHTML = `<p>${index + 1}. ${q.question}</p>`;
    quiz.appendChild(questionDiv);

    const answersDiv = document.createElement("div");
    answersDiv.classList.add("answers");
    const allAnswers = [...q.incorrect_answers, q.correct_answer];
    shuffleArray(allAnswers);

    allAnswers.forEach((answer) => {
      const answerButton = document.createElement("button");
      answerButton.classList.add("answer-button");
      answerButton.innerText = answer;

      answerButton.addEventListener("click", () => {
        checkAnswer(answerButton, answer, q.correct_answer, answersDiv);
      });

      answersDiv.appendChild(answerButton);
    });

    quiz.appendChild(answersDiv);
  });
}

function checkAnswer(button, selected, correct, container) {
  const allButtons = container.querySelectorAll(".answer-button");

  allButtons.forEach(btn => {
    btn.disabled = true;
    if (btn.innerText === correct) {
      btn.classList.add("correct");
    } else if (btn.innerText === selected) {
      btn.classList.add("incorrect");
    }
  });

  // Update score if the answer is correct
  if (selected === correct) {
    score++;
  }

  // Once all answers are selected, save the progress
  setTimeout(() => {
    saveProgress();
  }, 1000);
}

async function saveProgress() {
  const progress = {
    userId: userID,
    score: score
  };

  const res = await fetch("/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(progress)
  });

  if (res.ok) {
    alert(`Your progress has been saved! Score: ${score}`);
  } else {
    alert("Failed to save progress.");
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
