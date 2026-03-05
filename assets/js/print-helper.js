// ============================================
// print-helper.js
// ?print-pdf 모드에서 인쇄 대화상자 자동 실행
// Reveal.js ready 이벤트 후 window.print() 호출
// ============================================
(function() {
  if (!/print-pdf/gi.test(window.location.search)) return;
  if (typeof Reveal === 'undefined') return;
  Reveal.on('ready', function() {
    setTimeout(function() { window.print(); }, 800);
  });
})();
