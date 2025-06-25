let questions = [];
let currentIndex = 0;

function generateQuiz() {
  const rawInput = document.getElementById('inputArea').value.trim();
  const blocks = rawInput.split(/(?=^Câu\s*\d+:?|^\d+\/)/gm).filter(Boolean);

  questions = blocks.map(block => {
    const lines = block.split('\n');
    let questionLines = [];
    let options = [];
    let foundOption = false;
    let currentOption = null;
    let autoLabel = 'A';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (/^[\*•]\s*[A-Da-d]?[\.\s]/.test(line)) {
        if (currentOption) options.push(currentOption);

        foundOption = true;
        const isCorrect = /^\*/.test(line);
        const cleanLine = line.replace(/^[\*•]\s*/, '');
        const labelMatch = cleanLine.match(/^([A-Da-d])?[\.\s]/);
        const label = labelMatch && labelMatch[1] ? labelMatch[1].toUpperCase() : autoLabel;
        const text = cleanLine.replace(/^([A-Da-d])?[\.\s]*/, '');

        currentOption = { label, text, isCorrect };
        autoLabel = String.fromCharCode(autoLabel.charCodeAt(0) + 1);
      } else if (foundOption && currentOption) {
        currentOption.text += ' ' + line;
      } else if (!foundOption) {
        questionLines.push(line);
      }
    }
    if (currentOption) options.push(currentOption);

    const questionText = questionLines.join(' ').replace(/^Câu\s*\d+:?/i, '').trim();

    return {
      question: questionText,
      originalOptions: [...options],
      options: [...options],
      answered: false,
      userAnswerIndex: null
    };
  });

  if (questions.length > 0) {
    currentIndex = 0;
    document.getElementById('mainQuizArea').style.display = 'flex';
    renderQuestionList();
    showQuestion(currentIndex);
  } else {
    alert('Không tìm thấy câu hỏi hợp lệ.');
  }
}

function showQuestion(index) {
  const q = questions[index];
  const container = document.getElementById('questionContainer');

  container.innerHTML = `
    <div class="question-title">Câu ${index + 1}:<br>${q.question.replace(/\n/g, '<br>')}</div>
    ${q.options.map((opt, i) => `
      <div class="option ${q.answered ? (i === q.userAnswerIndex ? (opt.isCorrect ? 'correct' : 'incorrect') : '') : ''} ${q.answered ? 'disabled' : ''}"
           onclick="selectAnswer(${i})">
        ${opt.label}. ${opt.text}
      </div>
    `).join('')}
    <div class="result" id="result">${q.answered ? (q.options[q.userAnswerIndex].isCorrect ? '✅ Chính xác!' : '❌ Sai rồi!') : ''}</div>
  `;

  highlightQuestionInList();
}

function selectAnswer(index) {
  const q = questions[currentIndex];
  if (q.answered) return;

  q.answered = true;
  q.userAnswerIndex = index;

  showQuestion(currentIndex);
  renderQuestionList();
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
  questions.forEach(q => {
    q.answered = false;
    q.userAnswerIndex = null;
    q.options = [...q.originalOptions];
  });
  currentIndex = 0;
  showQuestion(currentIndex);
  renderQuestionList();
}

function shuffleAnswers() {
  questions.forEach(q => {
    const correctLabel = q.options.find(o => o.isCorrect)?.label;
    const shuffled = shuffleArray(q.options.map(o => ({ ...o })));

    q.options = shuffled;
    q.answered = false;
    q.userAnswerIndex = null;
  });
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
  const listContainer = document.getElementById('listContainer');
  listContainer.innerHTML = '';
  questions.forEach((q, i) => {
    const btn = document.createElement('div');
    btn.className = 'list-item';
    if (q.answered) {
      btn.classList.add(q.options[q.userAnswerIndex].isCorrect ? 'correct' : 'incorrect');
    } else {
      btn.classList.add('unanswered');
    }
    btn.textContent = `Câu ${i + 1}`;
    btn.onclick = () => {
      currentIndex = i;
      showQuestion(currentIndex);
    };
    listContainer.appendChild(btn);
  });
}

function highlightQuestionInList() {
  const items = document.querySelectorAll('.list-item');
  items.forEach((item, idx) => {
    item.style.border = idx === currentIndex ? '2px solid #000' : 'none';
  });
}