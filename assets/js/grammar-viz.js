/* ============================================
   English Grammar Course - Grammar Visualization
   Timeline, Sentence Structure, Verb Transformer
   ============================================ */

class TenseTimeline {
  constructor(container, config = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.config = {
      height: 120,
      colors: {
        past: '#ef4444',
        present: '#22c55e',
        future: '#3b82f6',
        axis: '#cbd5e1',
        now: '#ef4444'
      },
      ...config
    };
    if (this.container) this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.className = 'tense-timeline';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', this.config.height);
    svg.setAttribute('viewBox', '0 0 800 120');

    // Axis line
    const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axis.setAttribute('x1', '40');
    axis.setAttribute('y1', '70');
    axis.setAttribute('x2', '760');
    axis.setAttribute('y2', '70');
    axis.setAttribute('stroke', this.config.colors.axis);
    axis.setAttribute('stroke-width', '3');
    svg.appendChild(axis);

    // Now marker
    const nowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    nowCircle.setAttribute('cx', '400');
    nowCircle.setAttribute('cy', '70');
    nowCircle.setAttribute('r', '8');
    nowCircle.setAttribute('fill', this.config.colors.now);
    svg.appendChild(nowCircle);

    // Now label
    const nowLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nowLabel.setAttribute('x', '400');
    nowLabel.setAttribute('y', '100');
    nowLabel.setAttribute('text-anchor', 'middle');
    nowLabel.setAttribute('font-size', '12');
    nowLabel.setAttribute('fill', this.config.colors.now);
    nowLabel.setAttribute('font-weight', '700');
    nowLabel.textContent = 'NOW';
    svg.appendChild(nowLabel);

    // Past / Future labels
    const pastLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    pastLabel.setAttribute('x', '60');
    pastLabel.setAttribute('y', '100');
    pastLabel.setAttribute('font-size', '11');
    pastLabel.setAttribute('fill', '#94a3b8');
    pastLabel.textContent = 'PAST';
    svg.appendChild(pastLabel);

    const futureLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    futureLabel.setAttribute('x', '720');
    futureLabel.setAttribute('y', '100');
    futureLabel.setAttribute('font-size', '11');
    futureLabel.setAttribute('fill', '#94a3b8');
    futureLabel.textContent = 'FUTURE';
    svg.appendChild(futureLabel);

    // Arrows
    const arrowLeft = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrowLeft.setAttribute('points', '40,70 50,64 50,76');
    arrowLeft.setAttribute('fill', this.config.colors.axis);
    svg.appendChild(arrowLeft);

    const arrowRight = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrowRight.setAttribute('points', '760,70 750,64 750,76');
    arrowRight.setAttribute('fill', this.config.colors.axis);
    svg.appendChild(arrowRight);

    this.svg = svg;
    this.container.appendChild(svg);
  }

  addTense(label, startPct, endPct, color, yOffset = 0) {
    if (!this.svg) return;
    const x1 = 40 + (720 * startPct / 100);
    const x2 = 40 + (720 * endPct / 100);
    const y = 55 - yOffset * 25;

    // Range bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x1);
    rect.setAttribute('y', y);
    rect.setAttribute('width', x2 - x1);
    rect.setAttribute('height', '10');
    rect.setAttribute('rx', '5');
    rect.setAttribute('fill', color);
    rect.setAttribute('opacity', '0.4');
    this.svg.appendChild(rect);

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', (x1 + x2) / 2);
    text.setAttribute('y', y - 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '11');
    text.setAttribute('fill', color);
    text.setAttribute('font-weight', '600');
    text.textContent = label;
    this.svg.appendChild(text);
  }

  addPoint(label, positionPct, color) {
    if (!this.svg) return;
    const x = 40 + (720 * positionPct / 100);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', '70');
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', color);
    this.svg.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', '45');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '10');
    text.setAttribute('fill', color);
    text.setAttribute('font-weight', '600');
    text.textContent = label;
    this.svg.appendChild(text);
  }
}

class SentenceStructure {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.colors = {
      subject: '#059669',
      verb: '#2563eb',
      object: '#ea580c',
      complement: '#7c3aed',
      adverbial: '#0891b2',
      preposition: '#94a3b8'
    };
  }

  display(parts) {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.container.style.display = 'flex';
    this.container.style.flexWrap = 'wrap';
    this.container.style.gap = '12px';
    this.container.style.justifyContent = 'center';
    this.container.style.padding = '20px';

    parts.forEach(part => {
      const block = document.createElement('div');
      block.style.textAlign = 'center';
      block.style.padding = '10px 16px';
      block.style.borderRadius = '8px';
      block.style.background = this.hexToRgba(this.colors[part.role] || '#94a3b8', 0.1);
      block.style.borderBottom = `3px solid ${this.colors[part.role] || '#94a3b8'}`;

      const wordEl = document.createElement('div');
      wordEl.style.fontFamily = "'Noto Serif', Georgia, serif";
      wordEl.style.fontSize = '1.2em';
      wordEl.style.color = this.colors[part.role] || '#1e293b';
      wordEl.style.fontWeight = '600';
      wordEl.textContent = part.text;
      block.appendChild(wordEl);

      const labelEl = document.createElement('div');
      labelEl.style.fontSize = '0.65em';
      labelEl.style.textTransform = 'uppercase';
      labelEl.style.letterSpacing = '0.05em';
      labelEl.style.color = this.colors[part.role] || '#94a3b8';
      labelEl.style.marginTop = '4px';
      labelEl.textContent = part.role;
      block.appendChild(labelEl);

      this.container.appendChild(block);
    });
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}

window.TenseTimeline = TenseTimeline;
window.SentenceStructure = SentenceStructure;
