/* Запуск і роутер. Екран = ID зі STEP 3; цей самий ID — ключ `screen` у збереженні. */
(function (O) {
  var app = null;
  var current = null;
  var exitFns = [];
  var TEN_MIN = 10 * 60 * 1000;

  function cleanup() {
    exitFns.forEach(function (f) { try { f(); } catch (e) { /* ignore */ } });
    exitFns = [];
  }

  function mount(id) {
    var def = O.screens[id];
    if (!def) { id = 'E0.0-title'; def = O.screens[id]; }
    cleanup();
    current = id;
    var ctx = {
      id: id,
      s: O.state.s,
      onExit: function (f) { exitFns.push(f); },
      on: function (ev, f) { exitFns.push(O.on(ev, f)); }
    };
    var el = def.render(ctx);
    app.replaceChildren(el);
    el.classList.add('enter');
    if (O.config.DEBUG) console.log('[ostriv] screen', id, JSON.parse(JSON.stringify(O.state.s)));
  }

  /* Перехід: усі зміни стану + новий екран — одним записом, ДО анімації */
  O.go = function (id, patch, opts) {
    opts = opts || {};
    var def = O.screens[id] || {};
    var p = {};
    if (patch) for (var k in patch) p[k] = patch[k];
    if (!def.nosave) { p.screen = id; p.hintLevel = 0; p.partial = null; }
    O.state.save(p);
    O.state.log('enter', { to: id });
    if (opts.delay) {
      /* Поки триває анімація переходу, жоден тап не діє (інакше подвійний тап повторить дію) */
      O.ui.lock(opts.delay + 150);
      if (app) app.classList.add('leaving');
      setTimeout(function () { if (app) app.classList.remove('leaving'); mount(id); }, opts.delay);
    }
    else mount(id);
  };

  /* Показати екран без запису (титул, привітання, підтвердження) */
  O.show = function (id) { mount(id); };

  /* Куди повертати після перерви (STEP 3, розділ 13) */
  function resumeTarget(screen) {
    var s = O.state.s;
    if (screen === 'CAMP-night') return 'MAP';
    if (screen === 'E3.0' || screen === 'E3.1-memory') return 'E3.1-intro';
    if (/^E3\.2/.test(screen || '')) return 'E3.2-intro';
    if (screen === 'E4.0-river') return 'E4.1-choice';
    if (/^E4\.1[ABC]-/.test(screen || '') && !/-(back|walk|thanks)$/.test(screen)) return 'E4.1-choice';
    if (/^E5\./.test(screen || '')) return 'E5.0';
    if (/^E7\.[34]/.test(screen || '')) return 'E7.3a';
    if (screen && O.screens[screen]) return screen;
    return s.zonesDone.length ? 'MAP' : 'E0.0-title';
  }
  O.resume = function () { mount(resumeTarget(O.state.s.screen)); };
  O.currentScreen = function () { return current; };

  function boot() {
    app = document.getElementById('app');
    var s = O.state.load();
    var gap = s.lastSeen ? Date.now() - s.lastSeen : null;

    /* Інструменти дорослого: ?log / ?debug в адресі (або #log / #debug) */
    var q = location.search + ' ' + location.hash;
    if (/[?&#]log\b/.test(q)) { O.show('LOG'); return; }
    if (/[?&#]debug\b/.test(q)) { O.show('DEBUG'); return; }

    if (s.name) O.state.log('open', { gapMin: gap == null ? null : Math.round(gap / 60000) });

    if (s.finished) O.show('R-finished');
    else if (O.state.hasProgress()) {
      if (gap != null && gap < TEN_MIN) O.resume();
      else O.show('R-welcome');
    } else O.show('E0.0-title');
  }

  /* Згорнули вкладку / втратили фокус: пауза для задач на час і мітка lastSeen */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { O.emit('pause', 'hidden'); O.state.touch(); }
    else O.emit('resume', 'hidden');
  });
  window.addEventListener('pagehide', function () { O.state.touch(); });

  /* Гра відкрита у двох вкладках: перемагає остання дія.
     Реагуємо лише тоді, коли інша вкладка справді перейшла на інший екран
     (а не просто оновила мітку часу під час закриття). */
  window.addEventListener('storage', function (e) {
    if (e.key !== O.state.KEY || !app || !current) return;
    var before = O.state.s ? O.state.s.screen : null;
    var tool = current === 'LOG' || current === 'DEBUG';
    var d = null;
    try { d = e.newValue ? JSON.parse(e.newValue) : null; } catch (err) { return; }
    O.state.load();
    if (tool) return;
    if (!d || !d.screen) {
      if (before) O.show('E0.0-title');
      return;
    }
    if (d.screen !== before) O.resume();
  });

  /* Офлайн-режим: лише на http(s), наприклад GitHub Pages. На file:// і в пісочниці мовчки пропускаємо. */
  function registerOffline() {
    try {
      if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
      navigator.serviceWorker.register('sw.js').catch(function () { /* без офлайну */ });
    } catch (e) { /* без офлайну */ }
  }
  window.addEventListener('load', registerOffline);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.OSTRIV);
