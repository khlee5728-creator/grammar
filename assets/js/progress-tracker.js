/* ============================================
   English Grammar Course - Progress Tracker
   localStorage-based progress tracking
   ============================================ */

class GrammarProgress {
  constructor() {
    this.storageKey = 'grammar-course-progress';
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : { weeks: {} };
    } catch (e) {
      return { weeks: {} };
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {}
  }

  getWeekKey() {
    const path = window.location.pathname;
    const match = path.match(/week(\d+)/);
    return match ? `week${match[1]}` : null;
  }

  saveQuizScore(score, total) {
    const weekKey = this.getWeekKey();
    if (!weekKey) return;

    if (!this.data.weeks[weekKey]) {
      this.data.weeks[weekKey] = { quizScores: [], visited: true };
    }

    this.data.weeks[weekKey].quizScores.push({
      date: new Date().toISOString().split('T')[0],
      score: score,
      total: total
    });

    this.save();
  }

  markVisited(weekNum) {
    const key = `week${String(weekNum).padStart(2, '0')}`;
    if (!this.data.weeks[key]) {
      this.data.weeks[key] = { quizScores: [], visited: true };
    }
    this.data.weeks[key].visited = true;
    this.save();
  }

  getWeekData(weekNum) {
    const key = `week${String(weekNum).padStart(2, '0')}`;
    return this.data.weeks[key] || { quizScores: [], visited: false };
  }

  getBestScore(weekNum) {
    const data = this.getWeekData(weekNum);
    if (!data.quizScores || data.quizScores.length === 0) return null;
    return data.quizScores.reduce((best, s) => {
      const pct = (s.score / s.total) * 100;
      return pct > best ? pct : best;
    }, 0);
  }

  getAllProgress() {
    const progress = {};
    for (let i = 1; i <= 15; i++) {
      const weekData = this.getWeekData(i);
      progress[i] = {
        visited: weekData.visited || false,
        bestScore: this.getBestScore(i),
        attempts: weekData.quizScores ? weekData.quizScores.length : 0
      };
    }
    return progress;
  }

  reset() {
    this.data = { weeks: {} };
    this.save();
  }
}

window.GrammarProgress = new GrammarProgress();
