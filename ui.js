/* Будівельні блоки інтерфейсу: шаблони Т1–Т6, верхня панель, шторка рюкзака,
   смужка підказок, кнопки. Текст ставимо лише через текстові вузли (ім'я дитини безпечне). */
(function (O) {
  var A = O.art, T = O.text;

  /* ---------- Події (пауза/продовження для задач на час) ---------- */
  var handlers = {};
  O.on = function (ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); return function () { off(ev, fn); }; };
  function off(ev, fn) { var a = handlers[ev] || []; var i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); }
  var pauses = {};
  O.emit = function (ev, data) {
    /* Пауза може мати кілька причин (рюкзак відкрито + вкладку згорнуто).
       «resume» доходить до екрана лише тоді, коли не лишилось жодної. */
    if (ev === 'pause') { var was = Object.keys(pauses).length; pauses[data || 'x'] = true; if (was) return; }
    if (ev === 'resume') { delete pauses[data || 'x']; if (Object.keys(pauses).length) return; }
    (handlers[ev] || []).slice().forEach(function (fn) { fn(data); });
  };

  /* ---------- DOM ---------- */
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      for (var k in props) {
        var v = props[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'svg') el.innerHTML = v; // лише наша власна графіка з art.js
        else if (k === 'style') el.style.cssText = v;
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }

  /* ---------- Блок повторного тапу (≈400 мс) ---------- */
  var locked = false, lockT = 0;
  function lock(ms) {
    locked = true;
    clearTimeout(lockT);
    lockT = setTimeout(function () { locked = false; }, ms || 400);
  }
  function btn(label, onTap, cls) {
    var b = h('button', { class: cls || 'btn-main', type: 'button' }, label);
    b.addEventListener('click', function (e) {
      if (locked || b.disabled) return;
      lock();
      onTap(e, b);
    });
    return b;
  }

  function shake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(function () { el.classList.remove('shake'); }, 320);
  }

  /* ---------- Верхня панель ---------- */
  var topEl = null;
  function topbar() {
    topEl = h('div', { class: 'topbar' });
    fillTop();
    return topEl;
  }
  function fillTop(opts) {
    if (!topEl) return;
    opts = opts || {};
    var s = O.state.s;
    var compass;
    if (opts.compassFade) compass = h('span', { class: 'stat fade-away', svg: A.icon('compass', 22) });
    else if (s.compass === 'lost') compass = h('span', { class: 'stat' }, h('span', { class: 'compass-empty', 'aria-label': 'Компаса немає' }));
    else compass = h('span', { class: 'stat' + (opts.compassBack ? ' pop-in' : ''), svg: A.icon('compass', 22) });
    function supply(key, ic) {
      var d = opts.delta && opts.delta[key];
      return h('span', { class: 'stat' + (d ? ' changed' : '') },
        h('span', { svg: A.icon(ic, 22) }),
        h('span', { class: 'num' }, s.supplies[key]),
        d ? h('span', { class: 'delta' + (d > 0 ? ' plus' : '') }, (d > 0 ? '+' : '\u2212') + Math.abs(d)) : null);
    }
    var pack = h('button', { class: 'pack-btn', type: 'button', 'aria-label': T.pack.title },
      h('span', { class: 'pack-ic', svg: A.icon('pack', 24) }),
      supply('bread', 'bread'), supply('water', 'water'), compass);
    pack.addEventListener('click', function () { if (!locked) { lock(); openPack(); } });
    var frag = h('div', { class: 'frag-count' + (opts.bump ? ' bump' : '') },
      h('span', { class: 'jade', svg: A.icon('frag', 22) }),
      h('span', { class: 'num' }, s.fragments.length + '/6'));
    topEl.replaceChildren(pack, frag);
  }

  /* ---------- Шторка рюкзака ---------- */
  var sheetOpen = false, curBack = null;
  function openPack() {
    if (sheetOpen && curBack && curBack.isConnected) return;
    sheetOpen = true;
    O.emit('pause', 'pack');
    var s = O.state.s;
    var back = h('div', { class: 'sheet-back' });
    curBack = back;
    var sheet = h('div', { class: 'sheet sheet-dark', role: 'dialog', 'aria-label': T.pack.title });
    function close() {
      if (!sheetOpen) return;
      sheetOpen = false;
      back.classList.add('out');
      setTimeout(function () { back.remove(); }, 200);
      O.emit('resume', 'pack');
    }
    back.addEventListener('click', function (e) { if (e.target === back) close(); });

    function showPack() {
      var cells = [];
      for (var i = 1; i <= 6; i++) {
        var has = s.fragments.indexOf(i) >= 0;
        cells.push(h('span', { class: 'cell' + (has ? ' got' : ''), svg: has ? A.sym(T.fragments[i].sym, 20) : '' }));
      }
      var compassVal = s.compass === 'lost' ? T.pack.compassLost : T.pack.compassHas;
      sheet.replaceChildren(
        h('div', { class: 'sheet-grip' }),
        h('h2', { class: 'sheet-title' }, T.pack.title),
        h('div', { class: 'pack-rows' },
          row('bread', T.pack.bread, s.supplies.bread),
          row('water', T.pack.water, s.supplies.water),
          row('compass', T.pack.compass, compassVal)),
        h('div', { class: 'pack-sub' }, T.pack.fragments),
        h('div', { class: 'cells' }, cells),
        s.diaryRead.length ? btn(T.pack.diary, showDiary, 'btn-outline') : null,
        btn(T.pack.close, close, 'btn-quiet')
      );
    }
    function row(ic, label, val) {
      return h('div', { class: 'pack-row' }, h('span', { svg: A.icon(ic, 26) }), h('span', { class: 'pack-label' }, label), h('span', { class: 'pack-val' }, val));
    }
    function showDiary() {
      var pages = s.diaryRead.slice().sort(function (a, b) { return a - b; }).map(function (n) {
        return diaryPage(n);
      });
      if (s.diaryPick) {
        var pick = T.maw.diaryOpts.filter(function (o) { return o.id === s.diaryPick; })[0];
        if (pick) pages.push(h('article', { class: 'diary-page kid' }, h('h2', { class: 'diary-head' }, T.maw.diaryHead), h('p', { class: 'kid-line' }, pick.t + '.')));
      }
      sheet.replaceChildren(
        h('div', { class: 'sheet-grip' }),
        h('h2', { class: 'sheet-title' }, T.pack.diary),
        h('div', { class: 'diary-list' }, pages),
        btn(T.pack.back, showPack, 'btn-quiet')
      );
    }
    showPack();
    sheet.addEventListener('click', function (e) { e.stopPropagation(); });
    back.appendChild(sheet);
    document.getElementById('app').appendChild(back);
  }

  /* ---------- Сторінка щоденника ---------- */
  function diaryPage(n, opts) {
    var lines = T.diary[n] || [];
    return h('article', { class: 'diary-page' },
      h('span', { class: 'diary-mark', svg: A.icon('compass', 28) }),
      h('h2', { class: 'diary-head' }, T.pack.entry(n)),
      lines.map(function (t, i) { return h('p', { class: 'diary-line' + (opts && opts.underline === i ? ' underline' : '') }, t); }),
      h('p', { class: 'diary-sign' }, T.diarySign));
  }

  /* ---------- Бульбашка і Мирон ---------- */
  function narr(text) { return h('div', { class: 'narr' }, text); }
  function bubble(text, cls) { return h('div', { class: 'bubble' + (cls ? ' ' + cls : '') }, text); }
  function mironEl(pose, cls) { return h('div', { class: 'miron-wrap' + (cls ? ' ' + cls : ''), svg: A.miron(pose) }); }

  /* ---------- Смужка підказок (Т4) ---------- */
  function hintStrip() {
    var el = h('div', { class: 'hint', hidden: true });
    var head = h('div', { class: 'hint-head', svg: A.miron('happy', true) });
    var bub = h('div', { class: 'bubble small' });
    var acts = h('div', { class: 'hint-acts' });
    el.append(head, h('div', { class: 'hint-body' }, bub, acts));
    return {
      el: el,
      say: function (text, o) {
        o = o || {};
        el.hidden = false;
        bub.textContent = text;
        head.innerHTML = A.miron(o.pose || 'happy', true);
        acts.replaceChildren();
        if (o.show) acts.appendChild(btn('Покажи', o.show, 'btn-outline small'));
        el.classList.remove('in');
        void el.offsetWidth;
        el.classList.add('in');
      },
      hide: function () { el.hidden = true; }
    };
  }

  /* ---------- Каркас екрана ---------- */
  function frame(o) {
    /* o: {bg, top, cls} → {root, col} */
    var root = h('section', { class: 'screen' + (o.cls ? ' ' + o.cls : '') });
    if (o.bg) root.appendChild(h('div', { class: 'bg-wrap', svg: A.scene(o.bg) }));
    var col = h('div', { class: 'col' });
    if (o.top) col.appendChild(topbar());
    else topEl = null;
    root.appendChild(col);
    return { root: root, col: col };
  }

  /* Т1 Сцена/діалог: фон, Мирон, бульбашка, одна кнопка */
  function t1(o) {
    /* o: {bg, top, pose, text, btn, onNext, quiet:[label,fn], above, noBubble, mironCls} */
    var f = frame({ bg: o.bg, top: o.top !== false, cls: o.cls });
    if (o.label) f.col.appendChild(h('div', { class: 'zone-label' }, o.label));
    var stage = h('div', { class: 'stage' });
    if (o.above) stage.appendChild(o.above);
    if (o.narr) stage.appendChild(narr(o.narr));
    if (!o.noBubble && o.text) {
      var b = bubble(o.text);
      if (o.onNext) {
        b.classList.add('tappable');
        b.addEventListener('click', function () { if (!locked) { lock(); o.onNext(); } });
      }
      stage.appendChild(b);
    }
    if (o.pose !== null) {
      var m = mironEl(o.pose || 'happy', o.mironCls);
      if (o.onMiron) { m.classList.add('tappable'); m.setAttribute('role', 'button'); m.setAttribute('aria-label', 'Мирон'); m.addEventListener('click', o.onMiron); }
      stage.appendChild(m);
      if (o.mironRef) o.mironRef(m);
    }
    if (o.below) stage.appendChild(o.below);
    f.col.appendChild(stage);
    var acts = h('div', { class: 'actions' });
    if (o.btn) acts.appendChild(btn(o.btn, o.onNext));
    if (o.quiet) acts.appendChild(btn(o.quiet[0], o.quiet[1], 'btn-quiet'));
    f.col.appendChild(acts);
    return f.root;
  }

  /* Т6 Знахідка */
  function t6(o) {
    /* o: {n, onTake} */
    var f = frame({ bg: 'sea', top: true });
    var frg = T.fragments[o.n];
    var have = O.state.s.fragments.slice();
    if (have.indexOf(o.n) < 0) have.push(o.n);
    var cells = [];
    for (var i = 1; i <= 6; i++) cells.push(h('span', { class: 'cell' + (have.indexOf(i) >= 0 ? ' got' : '') + (i === o.n ? ' new' : '') }));
    var rays = '';
    for (var r = 0; r < 8; r++) {
      var a = r * Math.PI / 4, x1 = 150 + Math.cos(a) * 118, y1 = 150 + Math.sin(a) * 118, x2 = 150 + Math.cos(a) * 140, y2 = 150 + Math.sin(a) * 140;
      rays += '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" stroke="#36D399" stroke-width="4" stroke-linecap="round"/>';
    }
    var glow = '<svg viewBox="0 0 300 300" class="find-glow" aria-hidden="true"><circle cx="150" cy="150" r="140" fill="#36D399" opacity=".10"/><circle cx="150" cy="150" r="104" fill="#36D399" opacity=".14"/>' + rays + '</svg>';
    var body = h('div', { class: 'find' },
      h('div', { class: 'eyebrow jade' }, T.find.label),
      h('h1', { class: 'find-title' }, T.find.title),
      h('div', { class: 'find-art' }, h('div', { svg: glow }), h('div', { class: 'find-piece', svg: A.fragmentPiece(frg.sym) })),
      h('div', { class: 'cells' }, cells),
      h('p', { class: 'find-of' }, T.find.of(have.length, frg.name)));
    f.col.appendChild(body);
    if (o.say) f.col.appendChild(h('div', { class: 'say-row' }, h('div', { class: 'hint-head', svg: A.miron('happy', true) }), bubble(o.say, 'small')));
    f.col.appendChild(h('div', { class: 'actions' }, btn(T.find.btn, o.onTake)));
    return f.root;
  }

  /* Модальне підтвердження скидання */
  function confirmReset(onYes) {
    var back = h('div', { class: 'modal-back' });
    var card = h('div', { class: 'modal', role: 'dialog' },
      h('p', { class: 'modal-text' }, T.confirm.text),
      btn(T.confirm.no, function () { back.remove(); }),
      btn(T.confirm.yes, function () { back.remove(); onYes(); }, 'btn-outline dark'));
    back.appendChild(card);
    document.getElementById('app').appendChild(back);
  }

  O.ui = {
    h: h, btn: btn, lock: lock, shake: shake,
    get locked() { return locked; },
    topbar: topbar, refreshTop: fillTop,
    openPack: openPack, diaryPage: diaryPage,
    bubble: bubble, narr: narr, mironEl: mironEl, hintStrip: hintStrip,
    frame: frame, t1: t1, t6: t6, confirmReset: confirmReset
  };
})(window.OSTRIV);
