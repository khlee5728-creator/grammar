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
        const correct = allAccepted.some(ans => this.normalize(ans) === normalizedUser);

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
      const isCorrect = allAccepted.some(ans => this.normalize(ans) === normalizedUser);

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
      if (inputs.length && !inputs[0].disabled) {
        this.checkAnswer(card);
      }
    });
  }

  resetAll() {
    this.cards.forEach(card => {
      const inputs = card.querySelectorAll('.exercise-input');
      const feedback = card.querySelector('.exercise-feedback');
      const checkBtn = card.querySelector('.exercise-check-btn');

      inputs.forEach(input => {
        input.value = '';
        input.disabled = false;
        input.classList.remove('correct', 'incorrect');
      });
      const popover = card.querySelector('.exercise-hint-popover');
      if (popover) popover.remove();
      if (feedback) feedback.innerHTML = '';
      if (checkBtn) checkBtn.style.display = '';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => ExercisePractice.initAll());
