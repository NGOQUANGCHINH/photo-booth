let questions = [];
let currentIndex = 0;

function generateQuiz() {
  const rawInput = document.getElementById("inputArea").value.trim();
  if (!rawInput) {
    alert("Vui lòng nhập dữ liệu câu hỏi.");
    return;
  }
  const blocks = rawInput.split(/(?=^Câu\s*\d+:?)/gm).filter(Boolean);

  questions = blocks.map((block, idx) => {
    const lines = block.split("\n");
    let questionLines = [];
    let options = [];
    let foundOption = false;
    let currentOption = null;

    // Regex nhận dạng đáp án bắt đầu bằng:
    // (tùy chọn) dấu * hoặc •, tiếp theo là a-d/A-D rồi dấu chấm
    const optionRegex = /^([\*\•])?\s*([a-dA-D])\.\s*(.*)$/;

    for (let line of lines) {
      const trimLine = line.trim();

      const matchOption = trimLine.match(optionRegex);

      if (matchOption) {
        if (currentOption) options.push(currentOption);

        foundOption = true;

        const isCorrect = matchOption[1] === "*"; // chỉ * là đáp án đúng
        const label = matchOption[2].toUpperCase();
        const text = matchOption[3];

        currentOption = { label, text, isCorrect };
      } else if (foundOption && currentOption) {
        // nối tiếp dòng dài câu trả lời
        currentOption.text += " " + trimLine;
      } else if (!foundOption) {
        questionLines.push(line);
      }
    }
    if (currentOption) options.push(currentOption);

    const questionText = questionLines
      .join("\n")
      .replace(/^Câu\s*\d+:?/i, "")
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

  container.innerHTML = "";

  const titleDiv = document.createElement("div");
  titleDiv.className = "question-title";
  titleDiv.innerHTML = `Câu ${index + 1}:<br>${q.question.replace(/\n/g, "<br>")}`;
  container.appendChild(titleDiv);

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
  } else {
    resultDiv.textContent = "";
  }
  container.appendChild(resultDiv);

  renderQuestionList();
  highlightQuestionInList();
}

function selectAnswer(index) {
  const q = questions[currentIndex];
  if (q.answered) return;
  q.answered = true;
  q.userAnswerIndex = index;
  showQuestion(currentIndex);
}

function nextQuestion() {
  if (currentIndex < questions.length - 1) {
    showQuestion(currentIndex + 1);
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    showQuestion(currentIndex - 1);
  }
}

function restartQuiz() {
  questions.forEach((q) => {
    q.answered = false;
    q.userAnswerIndex = null;
    q.options = [...q.originalOptions];
  });
  showQuestion(0);
}

function shuffleAnswers() {
  questions.forEach((q) => {
    q.options = shuffleArray(q.originalOptions.map(opt => ({ ...opt })));
    q.answered = false;
    q.userAnswerIndex = null;
  });
  showQuestion(0);
}

function shuffleQuestions() {
  questions = shuffleArray(questions);
  currentIndex = 0;
  showQuestion(currentIndex);
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

    if (q.answered) {
      btn.classList.add(q.options[q.userAnswerIndex].isCorrect ? "correct" : "incorrect");
    } else {
      btn.classList.add("unanswered");
    }

    btn.textContent = `Câu ${i + 1}`;
    btn.addEventListener("click", () => {
      showQuestion(i);
    });

    listContainer.appendChild(btn);
  });
}

function highlightQuestionInList() {
  const items = document.querySelectorAll(".list-item");
  items.forEach((item, idx) => {
    if (idx === currentIndex) {
      item.classList.add("highlighted");
    } else {
      item.classList.remove("highlighted");
    }
  });
}
