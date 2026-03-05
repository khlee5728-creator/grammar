/* ============================================
   English Grammar Course - Quiz Engine
   Paginated: one question at a time
   Supports: multiple-choice, fill-blank, error-correction, true-false
   ============================================ */

class GrammarQuiz {
  constructor(container, questions, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.questions = questions;
    this.options = {
      showFeedback: true,
      showScore: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      ...options
    };
    this.score = 0;
    this.answered = 0;
    this.currentIndex = 0;
    this.results = [];
    this.answeredSet = new Set();   // track which questions have been answered
    this.cardCache = {};            // cache rendered cards for prev/next navigation

    if (this.options.shuffleQuestions) {
      this.questions = [...this.questions].sort(() => Math.random() - 0.5);
    }
    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.container.classList.add('quiz-container');

    // --- Absorb parent slide title into quiz header ---
    const parentSection = this.container.closest('section');
    let titleText = 'Grammar Quiz';
    if (parentSection) {
      parentSection.classList.add('quiz-slide');
      const h2 = parentSection.querySelector(':scope > h2');
      const pKo = parentSection.querySelector(':scope > p.ko');
      if (h2) { titleText = h2.textContent.trim(); h2.style.display = 'none'; }
      if (pKo) pKo.style.display = 'none';
      // Hide any extra description <p> between title and quiz-container
      Array.from(parentSection.querySelectorAll(':scope > p:not(.ko)')).forEach(p => {
        if (p !== this.container && !p.classList.contains('quiz-container')) p.style.display = 'none';
      });
    }

    // --- Header: title + score ---
    if (this.options.showScore) {
      const header = document.createElement('div');
      header.className = 'quiz-header';
      header.innerHTML = `
        <span class="quiz-title">${titleText}</span>
        <span class="quiz-score">Score: <span class="score-num" id="quiz-score-display">0</span> / ${this.questions.length}</span>
      `;
      this.container.appendChild(header);
    }

    // --- Progress bar ---
    const progress = document.createElement('div');
    progress.className = 'quiz-progress';
    progress.innerHTML = `
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" id="quiz-progress-fill" style="width: 0%"></div>
      </div>
      <div class="quiz-progress-text" id="quiz-progress-text">Question 1 / ${this.questions.length}</div>
    `;
    this.container.appendChild(progress);

    // --- Question area (single question displayed here) ---
    this.questionArea = document.createElement('div');
    this.questionArea.className = 'quiz-question-area';
    this.container.appendChild(this.questionArea);

    // --- Navigation buttons ---
    const nav = document.createElement('div');
    nav.className = 'quiz-nav';

    this.prevBtn = document.createElement('button');
    this.prevBtn.className = 'quiz-nav-btn prev';
    this.prevBtn.innerHTML = '← Prev';
    this.prevBtn.addEventListener('click', () => this.goPrev());

    this.nextBtn = document.createElement('button');
    this.nextBtn.className = 'quiz-nav-btn next';
    this.nextBtn.innerHTML = 'Next →';
    this.nextBtn.addEventListener('click', () => this.goNext());

    nav.appendChild(this.prevBtn);
    nav.appendChild(this.nextBtn);
    this.container.appendChild(nav);

    // Show first question
    this.showQuestion(0);
  }

  showQuestion(index) {
    this.currentIndex = index;
    this.questionArea.innerHTML = '';

    // Create or retrieve cached card
    if (!this.cardCache[index]) {
      const card = this.createQuestionCard(this.questions[index], index);
      this.cardCache[index] = card;
    }
    this.questionArea.appendChild(this.cardCache[index]);

    this.updateNavButtons();
    this.updateProgress();
  }

  updateNavButtons() {
    const idx = this.currentIndex;
    const total = this.questions.length;

    // Prev button
    this.prevBtn.disabled = idx === 0;

    // Next button
    const isLastQuestion = idx === total - 1;
    const isAnswered = this.answeredSet.has(idx);

    if (isLastQuestion) {
      if (this.answered === total) {
        // All questions answered — show "See Results"
        this.nextBtn.innerHTML = 'See Results ✓';
        this.nextBtn.classList.add('finish');
        this.nextBtn.disabled = false;
      } else {
        this.nextBtn.innerHTML = 'Finish';
        this.nextBtn.classList.add('finish');
        this.nextBtn.disabled = !isAnswered;
      }
    } else {
      this.nextBtn.innerHTML = 'Next →';
      this.nextBtn.classList.remove('finish');
      this.nextBtn.disabled = !isAnswered;
    }
  }

  updateProgress() {
    const fill = document.getElementById('quiz-progress-fill');
    const text = document.getElementById('quiz-progress-text');
    if (fill) {
      const pct = Math.round((this.answered / this.questions.length) * 100);
      fill.style.width = pct + '%';
    }
    if (text) {
      text.textContent = `Question ${this.currentIndex + 1} / ${this.questions.length}`;
    }
  }

  goNext() {
    if (this.currentIndex < this.questions.length - 1) {
      this.showQuestion(this.currentIndex + 1);
    } else {
      // Last question — show results
      this.showResultsPage();
    }
  }

  goPrev() {
    if (this.currentIndex > 0) {
      this.showQuestion(this.currentIndex - 1);
    }
  }

  showResultsPage() {
    // Hide nav and progress
    this.questionArea.innerHTML = '';
    this.prevBtn.style.display = 'none';
    this.nextBtn.style.display = 'none';

    const pct = Math.round((this.score / this.questions.length) * 100);
    let message = '';
    if (pct === 100) message = 'Perfect! Excellent work! 🎉';
    else if (pct >= 80) message = 'Great job! Keep it up! 👏';
    else if (pct >= 60) message = 'Good effort! Review the incorrect answers.';
    else message = 'Keep practicing! Review the grammar rules.';

    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'quiz-results';
    resultsDiv.innerHTML = `
      <div class="result-score">${this.score} / ${this.questions.length}</div>
      <div class="result-label">${pct}%</div>
      <div class="result-message">${message}</div>
      <div class="result-actions">
        <button class="retry-btn" onclick="location.reload()">Try Again</button>
        <button class="review-btn" id="quiz-review-btn">Review Answers</button>
      </div>
    `;
    this.questionArea.appendChild(resultsDiv);

    // Review button — go back to first question
    const reviewBtn = resultsDiv.querySelector('#quiz-review-btn');
    if (reviewBtn) {
      reviewBtn.addEventListener('click', () => {
        this.prevBtn.style.display = '';
        this.nextBtn.style.display = '';
        this.showQuestion(0);
      });
    }

    // Update progress to 100%
    const fill = document.getElementById('quiz-progress-fill');
    if (fill) fill.style.width = '100%';
    const text = document.getElementById('quiz-progress-text');
    if (text) text.textContent = `Complete! ${this.score} / ${this.questions.length} correct`;

    try {
      const tracker = window.GrammarProgress;
      if (tracker) tracker.saveQuizScore(this.score, this.questions.length);
    } catch(e) {}
  }

  createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `question-${index}`;

    const numEl = document.createElement('div');
    numEl.className = 'question-number';
    numEl.textContent = `Question ${index + 1}`;
    card.appendChild(numEl);

    switch (question.type) {
      case 'multiple-choice':
        this.renderMultipleChoice(card, question, index);
        break;
      case 'fill-blank':
        this.renderFillBlank(card, question, index);
        break;
      case 'error-correction':
        this.renderErrorCorrection(card, question, index);
        break;
      case 'true-false':
        this.renderTrueFalse(card, question, index);
        break;
      default:
        this.renderMultipleChoice(card, question, index);
    }

    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.id = `feedback-${index}`;
    card.appendChild(feedback);

    return card;
  }

  renderMultipleChoice(card, question, index) {
    const textEl = document.createElement('div');
    textEl.className = 'question-text';
    textEl.innerHTML = question.question;
    card.appendChild(textEl);

    const optionsList = document.createElement('ul');
    optionsList.className = 'options-list';

    const labels = ['A', 'B', 'C', 'D'];
    let opts = [...question.options];
    if (this.options.shuffleOptions) {
      const correctAnswer = opts[question.correct];
      opts = opts.sort(() => Math.random() - 0.5);
      question._shuffledCorrect = opts.indexOf(correctAnswer);
    }

    opts.forEach((opt, oi) => {
      const li = document.createElement('li');
      li.className = 'option-item';
      li.innerHTML = `<span class="option-marker">${labels[oi]}</span><span>${opt}</span>`;
      li.addEventListener('click', () => this.handleMultipleChoice(index, oi, question));
      optionsList.appendChild(li);
    });

    card.appendChild(optionsList);
  }

  handleMultipleChoice(qIndex, selectedIndex, question) {
    const card = document.getElementById(`question-${qIndex}`);
    if (card.classList.contains('answered-correct') || card.classList.contains('answered-incorrect')) return;

    const correctIndex = question._shuffledCorrect !== undefined ? question._shuffledCorrect : question.correct;
    const isCorrect = selectedIndex === correctIndex;
    const options = card.querySelectorAll('.option-item');

    options.forEach((opt, i) => {
      opt.style.pointerEvents = 'none';
      if (i === correctIndex) opt.classList.add('correct');
      if (i === selectedIndex && !isCorrect) opt.classList.add('incorrect');
      if (i === selectedIndex) opt.classList.add('selected');
    });

    this.recordAnswer(qIndex, isCorrect, question);
  }

  renderFillBlank(card, question, index) {
    const textEl = document.createElement('div');
    textEl.className = 'question-text';
    const parts = question.sentence.split('___');
    textEl.innerHTML = parts[0] + '<span class="blank" id="blank-display-' + index + '">___</span>' + (parts[1] || '');
    card.appendChild(textEl);

    const inputWrap = document.createElement('div');
    inputWrap.style.display = 'flex';
    inputWrap.style.alignItems = 'center';
    inputWrap.style.gap = '8px';
    inputWrap.style.marginTop = '10px';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'fill-blank-input';
    input.placeholder = 'Type your answer...';
    input.id = `fill-input-${index}`;

    const checkBtn = document.createElement('button');
    checkBtn.className = 'check-btn';
    checkBtn.textContent = 'Check';
    checkBtn.addEventListener('click', () => this.handleFillBlank(index, question));

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleFillBlank(index, question);
    });

    inputWrap.appendChild(input);
    inputWrap.appendChild(checkBtn);

    if (question.hint) {
      const hintBtn = document.createElement('button');
      hintBtn.className = 'hint-btn';
      hintBtn.textContent = 'Hint';
      hintBtn.addEventListener('click', () => {
        const hintEl = document.getElementById(`hint-${index}`);
        if (hintEl) hintEl.classList.toggle('visible');
      });
      inputWrap.appendChild(hintBtn);
    }

    card.appendChild(inputWrap);

    if (question.hint) {
      const hintEl = document.createElement('div');
      hintEl.className = 'hint-text';
      hintEl.id = `hint-${index}`;
      hintEl.textContent = question.hint;
      card.appendChild(hintEl);
    }
  }

  handleFillBlank(qIndex, question) {
    const input = document.getElementById(`fill-input-${qIndex}`);
    const card = document.getElementById(`question-${qIndex}`);
    if (card.classList.contains('answered-correct') || card.classList.contains('answered-incorrect')) return;

    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswers = Array.isArray(question.answer) ? question.answer : [question.answer];
    const isCorrect = correctAnswers.some(a => a.toLowerCase() === userAnswer);

    input.disabled = true;
    input.classList.add(isCorrect ? 'correct' : 'incorrect');

    const blankDisplay = document.getElementById(`blank-display-${qIndex}`);
    if (blankDisplay) {
      blankDisplay.textContent = correctAnswers[0];
      blankDisplay.style.color = isCorrect ? '#16a34a' : '#dc2626';
      blankDisplay.style.fontWeight = '600';
    }

    this.recordAnswer(qIndex, isCorrect, question);
  }

  renderErrorCorrection(card, question, index) {
    const instrEl = document.createElement('div');
    instrEl.className = 'question-text';
    instrEl.textContent = 'Find and correct the error in this sentence:';
    card.appendChild(instrEl);

    const sentenceEl = document.createElement('div');
    sentenceEl.className = 'error-sentence';

    const words = question.sentence.split(' ');
    words.forEach((word, wi) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word + ' ';
      span.addEventListener('click', () => this.handleErrorWordClick(index, wi, question));
      sentenceEl.appendChild(span);
    });
    card.appendChild(sentenceEl);

    const corrInput = document.createElement('div');
    corrInput.className = 'correction-input';
    corrInput.id = `correction-input-${index}`;

    const label = document.createElement('span');
    label.style.cssText = 'font-size:0.85em;color:#475569;';
    label.textContent = 'Correct to:';

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'Type correction...';
    textInput.id = `correction-text-${index}`;

    const checkBtn = document.createElement('button');
    checkBtn.className = 'check-btn';
    checkBtn.textContent = 'Check';
    checkBtn.addEventListener('click', () => this.submitCorrection(index));

    textInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.submitCorrection(index);
    });

    corrInput.appendChild(label);
    corrInput.appendChild(textInput);
    corrInput.appendChild(checkBtn);
    card.appendChild(corrInput);
  }

  handleErrorWordClick(qIndex, wordIndex, question) {
    const card = document.getElementById(`question-${qIndex}`);
    if (card.classList.contains('answered-correct') || card.classList.contains('answered-incorrect')) return;

    const words = card.querySelectorAll('.error-sentence .word');
    words.forEach(w => w.classList.remove('selected-error'));
    words[wordIndex].classList.add('selected-error');

    const corrInput = document.getElementById(`correction-input-${qIndex}`);
    corrInput.classList.add('visible');
    card._selectedWordIndex = wordIndex;
  }

  submitCorrection(qIndex) {
    const card = document.getElementById(`question-${qIndex}`);
    if (card.classList.contains('answered-correct') || card.classList.contains('answered-incorrect')) return;

    const question = this.questions[qIndex];
    const corrText = document.getElementById(`correction-text-${qIndex}`).value.trim().toLowerCase();
    const isCorrect = corrText === question.correctedWord.toLowerCase();

    this.recordAnswer(qIndex, isCorrect, question);
  }

  renderTrueFalse(card, question, index) {
    const textEl = document.createElement('div');
    textEl.className = 'question-text';
    textEl.innerHTML = `"${question.sentence}"`;
    card.appendChild(textEl);

    const optionsList = document.createElement('ul');
    optionsList.className = 'options-list';

    ['Correct', 'Incorrect'].forEach((opt, oi) => {
      const li = document.createElement('li');
      li.className = 'option-item';
      li.innerHTML = `<span class="option-marker">${opt === 'Correct' ? '✓' : '✗'}</span><span>${opt}</span>`;
      li.addEventListener('click', () => {
        const userChoice = oi === 0;
        this.handleTrueFalse(index, userChoice, question);
      });
      optionsList.appendChild(li);
    });

    card.appendChild(optionsList);
  }

  handleTrueFalse(qIndex, userChoice, question) {
    const card = document.getElementById(`question-${qIndex}`);
    if (card.classList.contains('answered-correct') || card.classList.contains('answered-incorrect')) return;

    const isCorrect = userChoice === question.isCorrect;
    const options = card.querySelectorAll('.option-item');
    const correctIdx = question.isCorrect ? 0 : 1;

    options.forEach((opt, i) => {
      opt.style.pointerEvents = 'none';
      if (i === correctIdx) opt.classList.add('correct');
      const userIdx = userChoice ? 0 : 1;
      if (i === userIdx && !isCorrect) opt.classList.add('incorrect');
      if (i === userIdx) opt.classList.add('selected');
    });

    this.recordAnswer(qIndex, isCorrect, question);
  }

  recordAnswer(qIndex, isCorrect, question) {
    const card = document.getElementById(`question-${qIndex}`);
    card.classList.add(isCorrect ? 'answered-correct' : 'answered-incorrect');

    if (!this.answeredSet.has(qIndex)) {
      this.answeredSet.add(qIndex);
      if (isCorrect) this.score++;
      this.answered++;
      this.results.push({ question: qIndex, correct: isCorrect });

      if (this.options.showScore) {
        const scoreDisplay = document.getElementById('quiz-score-display');
        if (scoreDisplay) scoreDisplay.textContent = this.score;
      }
    }

    if (this.options.showFeedback && question.explanation) {
      const feedback = document.getElementById(`feedback-${qIndex}`);
      if (feedback) {
        feedback.classList.add('visible', isCorrect ? 'correct' : 'incorrect');
        let html = `<span class="feedback-icon">${isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</span> ${question.explanation}`;
        if (question.explanationKo) {
          html += `<span class="ko">${question.explanationKo}</span>`;
        }
        feedback.innerHTML = html;
      }
    }

    // Enable Next button after answering
    this.updateNavButtons();
    this.updateProgress();

    // Scroll feedback + nav into view within the question area
    requestAnimationFrame(() => {
      const feedback = document.getElementById(`feedback-${qIndex}`);
      if (feedback && feedback.classList.contains('visible')) {
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
}

window.GrammarQuiz = GrammarQuiz;
