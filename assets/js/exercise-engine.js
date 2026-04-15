/* ============================================
   English Grammar Course - Exercise Practice Engine
   Interactive fill-in-the-blank exercises
   Students type answers and get per-card feedback
   Supports single and multi-blank cards
   ============================================ */

class ExercisePractice {
  constructor(slideEl) {
    this.slide = slideEl;
    this.cards = Array.from(slideEl.querySelectorAll('.exercise-card'));
    this.autoSizeInputs();
    this.bindEvents();
  }

  autoSizeInputs() {
    this.cards.forEach(card => {
      card.querySelectorAll('.exercise-input').forEach(input => {
        // Skip full-width block inputs (long-answer questions)
        if (input.style.display === 'block') return;
        const answer = input.dataset.answer || card.dataset.answer || '';
        const width = Math.max(answer.length + 4, 8);
        input.style.width = width + 'ch';
      });
    });
  }

  static initAll() {
    document.querySelectorAll('.exercise-slide').forEach(slide => {
      new ExercisePractice(slide);
    });
  }

  bindEvents() {
    this.cards.forEach(card => {
      const inputs = card.querySelectorAll('.exercise-input');
      const choiceButtons = card.querySelectorAll('.exercise-choice');
      const checkBtn = card.querySelector('.exercise-check-btn');

      if (inputs.length && checkBtn) {
        checkBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.checkAnswer(card);
        });
        inputs.forEach(input => {
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              this.checkAnswer(card);
            }
            // Prevent Reveal.js from capturing arrow keys while typing
            e.stopPropagation();
          });
        });
      } else if (choiceButtons.length) {
        choiceButtons.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (btn.disabled) return;
            choiceButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          });
        });
        if (checkBtn) {
          checkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.checkChoice(card);
          });
        }
      }
    });

    // Check All / Reset buttons
    const checkAllBtn = this.slide.querySelector('.exercise-check-all');
    const resetBtn = this.slide.querySelector('.exercise-reset');
    if (checkAllBtn) {
      checkAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.checkAll();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.resetAll();
      });
    }
  }

  // Contraction ↔ expansion mapping: [contracted, [expanded forms]]
  static CONTRACTIONS = [
    // Negative
    ["haven't", ["have not"]], ["hasn't", ["has not"]], ["hadn't", ["had not"]],
    ["don't", ["do not"]], ["doesn't", ["does not"]], ["didn't", ["did not"]],
    ["isn't", ["is not"]], ["aren't", ["are not"]],
    ["wasn't", ["was not"]], ["weren't", ["were not"]],
    ["won't", ["will not"]], ["can't", ["cannot", "can not"]],
    ["couldn't", ["could not"]], ["wouldn't", ["would not"]], ["shouldn't", ["should not"]],
    // Pronoun + have
    ["i've", ["i have"]], ["you've", ["you have"]],
    ["we've", ["we have"]], ["they've", ["they have"]],
    // Pronoun + had / would
    ["i'd", ["i had", "i would"]], ["you'd", ["you had", "you would"]],
    ["he'd", ["he had", "he would"]], ["she'd", ["she had", "she would"]],
    ["we'd", ["we had", "we would"]], ["they'd", ["they had", "they would"]],
    // Pronoun + am / is / are
    ["i'm", ["i am"]], ["you're", ["you are"]],
    ["we're", ["we are"]], ["they're", ["they are"]],
    // Pronoun + has / is (ambiguous)
    ["he's", ["he has", "he is"]], ["she's", ["she has", "she is"]],
    ["it's", ["it has", "it is"]],
    // Pronoun + will
    ["i'll", ["i will"]], ["you'll", ["you will"]], ["he'll", ["he will"]],
    ["she'll", ["she will"]], ["we'll", ["we will"]], ["they'll", ["they will"]],
    ["it'll", ["it will"]],
  ];

  normalize(str) {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      // Normalize unicode quotes/apostrophes to ASCII
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/&rsquo;|&lsquo;/g, "'")
      .replace(/&rdquo;|&ldquo;/g, '"')
      // Strip trailing punctuation (. ! ?)
      .replace(/[.!?]+$/, '')
      .trim();
  }

  // Generate all contraction/expansion variants of a normalized string
  expandVariants(normalized) {
    const variants = new Set([normalized]);
    for (const [contracted, expandedList] of ExercisePractice.CONTRACTIONS) {
      if (normalized.includes(contracted)) {
        for (const expanded of expandedList) {
          variants.add(normalized.replace(contracted, expanded));
        }
      }
      for (const expanded of expandedList) {
        if (normalized.includes(expanded)) {
          variants.add(normalized.replace(expanded, contracted));
        }
      }
    }
    return [...variants];
  }

  // Check if user input matches any accepted answer (with contraction variants)
  matchWithContractions(normalizedUser, acceptedAnswers) {
    const userVariants = this.expandVariants(normalizedUser);
    for (const ans of acceptedAnswers) {
      const normAns = this.normalize(ans);
      const ansVariants = this.expandVariants(normAns);
      if (userVariants.some(uv => ansVariants.includes(uv))) return true;
    }
    return false;
  }

  checkAnswer(card) {
    const inputs = card.querySelectorAll('.exercise-input');
    const feedback = card.querySelector('.exercise-feedback');
    if (!inputs.length || inputs[0].disabled) return;

    const isMulti = inputs.length > 1;

    if (isMulti) {
      // Multi-blank: each input has its own data-answer
      let allCorrect = true;
      inputs.forEach(input => {
        const expected = input.dataset.answer || '';
        const alts = input.dataset.alt ? input.dataset.alt.split('|') : [];
        const allAccepted = [expected, ...alts];
        const normalizedUser = this.normalize(input.value);
        const correct = this.matchWithContractions(normalizedUser, allAccepted);

        input.disabled = true;
        if (correct) {
          input.classList.add('correct');
        } else {
          input.classList.add('incorrect');
          allCorrect = false;
        }
      });

      card.querySelector('.exercise-check-btn').style.display = 'none';

      if (allCorrect) {
        if (feedback) feedback.innerHTML = '<span class="exercise-correct-mark">✓</span>';
      } else {
        // Show correct answers for incorrect inputs
        const corrections = Array.from(inputs)
          .filter(inp => inp.classList.contains('incorrect'))
          .map(inp => inp.dataset.answer);
        if (feedback) {
          feedback.innerHTML = `<span class="exercise-correct-answer">→ ${corrections.join(' / ')}</span>`;
        }
      }
    } else {
      // Single-blank: card-level data-answer
      const input = inputs[0];
      const userAnswer = input.value;
      const expected = card.dataset.answer || '';
      const alts = card.dataset.alt ? card.dataset.alt.split('|') : [];
      const allAccepted = [expected, ...alts];

      const normalizedUser = this.normalize(userAnswer);
      const isCorrect = this.matchWithContractions(normalizedUser, allAccepted);

      input.disabled = true;
      card.querySelector('.exercise-check-btn').style.display = 'none';

      if (isCorrect) {
        input.classList.add('correct');
        if (feedback) feedback.innerHTML = '<span class="exercise-correct-mark">✓</span>';
      } else {
        input.classList.add('incorrect');
        if (feedback) {
          feedback.innerHTML = `<span class="exercise-correct-answer">→ ${expected}</span>`;
        }
      }
    }

    // Add hint button if data-hint exists
    this.addHintButton(card);
  }

  checkChoice(card) {
    const choiceButtons = Array.from(card.querySelectorAll('.exercise-choice'));
    const selected = card.querySelector('.exercise-choice.selected');
    const feedback = card.querySelector('.exercise-feedback');
    const checkBtn = card.querySelector('.exercise-check-btn');
    if (!choiceButtons.length || !selected || selected.disabled) return;

    const expected = card.dataset.answer || '';
    const alts = card.dataset.alt ? card.dataset.alt.split('|') : [];
    const allAccepted = [expected, ...alts].map(a => this.normalize(a));
    const userValue = this.normalize(selected.dataset.value || selected.textContent);
    const isCorrect = allAccepted.includes(userValue);

    choiceButtons.forEach(b => { b.disabled = true; });
    selected.classList.remove('selected');
    if (checkBtn) checkBtn.style.display = 'none';

    if (isCorrect) {
      selected.classList.add('correct');
      if (feedback) feedback.innerHTML = '<span class="exercise-correct-mark">✓</span>';
    } else {
      selected.classList.add('incorrect');
      // Highlight the correct choice(s)
      choiceButtons.forEach(b => {
        const val = this.normalize(b.dataset.value || b.textContent);
        if (allAccepted.includes(val)) b.classList.add('correct');
      });
      if (feedback) {
        feedback.innerHTML = `<span class="exercise-correct-answer">→ ${expected}</span>`;
      }
    }

    this.addHintButton(card);
  }

  addHintButton(card) {
    const hint = card.dataset.hint;
    if (!hint) return;
    const feedback = card.querySelector('.exercise-feedback');
    if (!feedback) return;

    const hintBtn = document.createElement('span');
    hintBtn.className = 'exercise-hint-btn';
    hintBtn.textContent = '💡';
    hintBtn.title = '풀이 보기';
    hintBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const existing = card.querySelector('.exercise-hint-popover');
      if (existing) {
        existing.remove();
      } else {
        const popover = document.createElement('div');
        popover.className = 'exercise-hint-popover';
        popover.textContent = hint;
        card.appendChild(popover);
      }
    });
    feedback.appendChild(hintBtn);
  }

  checkAll() {
    this.cards.forEach(card => {
      const inputs = card.querySelectorAll('.exercise-input');
      const choiceButtons = card.querySelectorAll('.exercise-choice');
      if (inputs.length && !inputs[0].disabled) {
        this.checkAnswer(card);
      } else if (choiceButtons.length && !choiceButtons[0].disabled) {
        if (card.querySelector('.exercise-choice.selected')) {
          this.checkChoice(card);
        }
      }
    });
  }

  resetAll() {
    this.cards.forEach(card => {
      const inputs = card.querySelectorAll('.exercise-input');
      const choiceButtons = card.querySelectorAll('.exercise-choice');
      const feedback = card.querySelector('.exercise-feedback');
      const checkBtn = card.querySelector('.exercise-check-btn');

      inputs.forEach(input => {
        input.value = '';
        input.disabled = false;
        input.classList.remove('correct', 'incorrect');
      });
      choiceButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('selected', 'correct', 'incorrect');
      });
      const popover = card.querySelector('.exercise-hint-popover');
      if (popover) popover.remove();
      if (feedback) feedback.innerHTML = '';
      if (checkBtn) checkBtn.style.display = '';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => ExercisePractice.initAll());
