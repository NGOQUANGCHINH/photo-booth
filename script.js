let questions = [];
let currentIndex = 0;

window.addEventListener("keydown", function (e) {
  if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") nextQuestion();
  if (e.key === "ArrowLeft") prevQuestion();
  if (["1", "2", "3", "4"].includes(e.key)) selectAnswer(parseInt(e.key) - 1);
});

function generateQuiz() {
  const rawInput = document.getElementById("inputArea").value.trim();

  const cleaned = rawInput
    .replace(/Câu\s*\d+\s*:\s*\(.*?\)/gi, "") // Xóa (Một đáp án) nếu có
    .trim();

  // Tách câu hỏi bằng: Câu xx hoặc 1/
  const blocks = cleaned
    .split(/\n(?=(?:Câu\s*\d+|^\d+\/))/gm)
    .filter(Boolean);

  questions = blocks.map((block, idx) => {
    const lines = block.split("\n");
    let questionLines = [];
    let options = [];
    let foundOption = false;
    let currentOption = null;

    for (let line of lines) {
      line = line.trim();

      if (/^[\*•]\s*/.test(line)) {
        if (currentOption) options.push(currentOption);

        foundOption = true;
        const isCorrect = line.startsWith("*");
        const cleanLine = line.replace(/^[\*•]\s*/, "");

        const labelMatch = cleanLine.match(/^([A-Da-d])\.\s*/);
        const label = labelMatch ? labelMatch[1].toUpperCase() : "?";
        const text = labelMatch ? cleanLine.replace(/^([A-Da-d])\.\s*/, "") : cleanLine;

        currentOption = { label, text, isCorrect };
      } else if (foundOption && currentOption) {
        currentOption.text += " " + line;
      } else if (!foundOption) {
        questionLines.push(line);
      }
    }
    if (currentOption) options.push(currentOption);

    const questionText = questionLines
      .join(" ")
      .replace(/^Câu\s*\d+:?/i, "")
      .replace(/^\d+\s*\/\s*/, "")
      .trim();

    return {
      id: "q" + idx,
      question: questionText,
      originalOptions: [...options],
      options: [...options],
      answered: false,
      userAnswerIndex: null,
    };
  });

  if (questions.length > 0) {
    currentIndex = 0;
    document.getElementById("mainQuizArea").style.display = "flex";
    renderQuestionList();
    showQuestion(currentIndex);
  } else {
    alert("Không tìm thấy câu hỏi hợp lệ.");
  }
}

function showQuestion(index) {
  currentIndex = index;
  const q = questions[index];
  const container = document.getElementById("questionContainer");
  container.innerHTML = `<div class="question-title">Câu ${index + 1}:<br>${q.question.replace(/\n/g, "<br>")}</div>`;

  q.options.forEach((opt, i) => {
    const optDiv = document.createElement("div");
    optDiv.className = "option";
    if (q.answered) {
      if (i === q.userAnswerIndex) {
        optDiv.classList.add(opt.isCorrect ? "correct" : "incorrect");
      } else if (opt.isCorrect) {
        optDiv.classList.add("correct");
      }
      optDiv.classList.add("disabled");
    }
    optDiv.textContent = `${opt.label}. ${opt.text}`;
    optDiv.addEventListener("click", () => selectAnswer(i));
    container.appendChild(optDiv);
  });

  const resultDiv = document.createElement("div");
  resultDiv.className = "result";
  if (q.answered) {
    resultDiv.textContent = q.options[q.userAnswerIndex].isCorrect
      ? "✅ Chính xác!"
      : "❌ Sai rồi!";
  }
  container.appendChild(resultDiv);

  renderQuestionList();
  highlightQuestionInList();
}

function selectAnswer(index) {
  const q = questions[currentIndex];
  if (q.answered || index >= q.options.length) return;
  q.answered = true;
  q.userAnswerIndex = index;
  showQuestion(currentIndex);
}

function nextQuestion() {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    showQuestion(currentIndex);
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion(currentIndex);
  }
}

function restartQuiz() {
  questions.forEach((q) => {
    q.answered = false;
    q.userAnswerIndex = null;
    q.options = [...q.originalOptions];
  });
  currentIndex = 0;
  showQuestion(currentIndex);
  renderQuestionList();
}

function shuffleAnswers() {
  questions.forEach((q) => {
    q.options = shuffleArray(q.originalOptions.map((opt) => ({ ...opt })));
    q.answered = false;
    q.userAnswerIndex = null;
  });
  currentIndex = 0;
  showQuestion(currentIndex);
  renderQuestionList();
}

function shuffleQuestions() {
  questions = shuffleArray(questions);
  currentIndex = 0;
  showQuestion(currentIndex);
  renderQuestionList();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderQuestionList() {
  const listContainer = document.getElementById("listContainer");
  listContainer.innerHTML = "";
  questions.forEach((q, i) => {
    const btn = document.createElement("div");
    btn.className = "list-item";
    btn.setAttribute("data-id", q.id);
    if (q.answered) {
      btn.classList.add(q.options[q.userAnswerIndex].isCorrect ? "correct" : "incorrect");
    } else {
      btn.classList.add("unanswered");
    }
    btn.textContent = `Câu ${i + 1}`;
    btn.onclick = () => {
      const questionId = btn.getAttribute("data-id");
      currentIndex = questions.findIndex((q) => q.id === questionId);
      showQuestion(currentIndex);
    };
    listContainer.appendChild(btn);
  });
}

function highlightQuestionInList() {
  const items = document.querySelectorAll(".list-item");
  items.forEach((item, idx) => {
    item.style.border = idx === currentIndex ? "2px solid #000" : "none";
  });
}
