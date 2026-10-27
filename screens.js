/* Екрани за ID зі STEP 3. Перша здача: епізоди 0–1, карта розвилки 1, привітання, скидання. */
(function (O) {
  var ui = O.ui, h = ui.h, A = O.art, T = O.text, S = {};
  O.screens = S;

  function addUnique(arr, v) { return arr.indexOf(v) >= 0 ? arr.slice() : arr.concat([v]); }

  /* ================= Епізод 0 — Корабель ================= */

  S['E0.0-title'] = {
    nosave: true,
    render: function () {
      var f = ui.frame({ bg: 'title', top: false, cls: 'title-screen' });
      f.col.appendChild(h('div', { class: 'title-block' },
        h('div', { class: 'title-1' }, T.title.line1),
        h('h1', { class: 'title-2' }, T.title.line2)));
      f.col.appendChild(h('div', { class: 'grow' }));
      f.col.appendChild(h('div', { class: 'actions' }, ui.btn(T.title.go, function () { O.show('E0.1-name'); })));
      return f.root;
    }
  };

  S['E0.1-name'] = {
    nosave: true,
    render: function (ctx) {
      var f = ui.frame({ bg: 'sea', top: false });
      var inp = h('input', {
        id: 'captain-name', class: 'name-input', type: 'text', autocomplete: 'off', autocorrect: 'off',
        spellcheck: 'false', autocapitalize: 'words', enterkeyhint: 'done', placeholder: T.name.placeholder,
        'aria-label': T.name.q
      });
      inp.value = ctx.s.name || '';
      var go = ui.btn(T.name.btn, submit);
      function clean() {
        var v = inp.value;
        var chars = Array.from(v);
        if (chars.length > T.name.max) v = chars.slice(0, T.name.max).join('');
        v = v.replace(/^(\s*)(\S)/, function (m, a, b) { return a + b.toUpperCase(); });
        if (v !== inp.value) {
          var pos = inp.selectionStart;
          inp.value = v;
          try { inp.setSelectionRange(pos, pos); } catch (e) { /* ignore */ }
        }
        go.disabled = !v.trim();
      }
      function submit() {
        clean();
        var name = inp.value.trim();
        if (!name) return;
        inp.blur();
        O.go('E0.2a', { name: name });
      }
      inp.addEventListener('input', clean);
      var form = h('form', { class: 'name-form', autocomplete: 'off' },
        h('label', { class: 'q', for: 'captain-name' }, T.name.q), inp, go);
      form.addEventListener('submit', function (e) { e.preventDefault(); if (!ui.locked) { ui.lock(); submit(); } });
      f.col.appendChild(h('div', { class: 'name-wrap' }, ui.mironEl('happy', 'small'), form));
      clean();
      setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); } }, 350);
      return f.root;
    }
  };

  S['E0.2a'] = {
    render: function (ctx) {
      return ui.t1({ bg: 'deck', top: false, pose: 'happy', text: T.ship.a(ctx.s.name), btn: T.next, onNext: function () { O.go('E0.2b'); } });
    }
  };
  S['E0.2b'] = {
    render: function () {
      return ui.t1({ bg: 'deck', top: false, pose: 'happy', text: T.ship.b, btn: T.next, onNext: function () { O.go('E0.2c'); } });
    }
  };
  S['E0.2c'] = {
    render: function () {
      return ui.t1({ bg: 'deck', top: false, pose: 'point', text: T.ship.c, btn: T.ship.openDiary, onNext: function () { O.go('E0.3-diary1'); } });
    }
  };

  S['E0.3-diary1'] = {
    render: function () {
      var t0 = Date.now();
      var f = ui.frame({ bg: 'sea', top: false });
      f.col.appendChild(h('div', { class: 'diary-wrap' }, ui.diaryPage(1)));
      f.col.appendChild(h('div', { class: 'actions' }, ui.btn(T.next, function () {
        var sec = Math.round((Date.now() - t0) / 1000);
        O.state.log('diary', { n: 1, sec: sec, skimmed: sec < 4 });
        O.go('E0.4-map', { diaryRead: addUnique(O.state.s.diaryRead, 1) });
      })));
      return f.root;
    }
  };

  S['E0.4-map'] = {
    render: function () {
      var f = ui.frame({ top: true, cls: 'map-screen first-map' });
      f.col.appendChild(h('div', { class: 'map-area', svg: A.islandMap({ revealed: ['bay'], flag: 'bay', uid: 'first' }) }));
      f.col.appendChild(h('div', { class: 'say-row' },
        h('div', { class: 'hint-head', svg: A.miron('happy', true) }),
        ui.bubble(T.firstMap.bubble, 'small')));
      f.col.appendChild(h('div', { class: 'actions' }, ui.btn(T.firstMap.btn, function () { O.go('E1.0'); })));
      return f.root;
    }
  };

  /* ================= Епізод 1 — Бухта ================= */

  S['E1.0'] = {
    render: function () {
      return ui.t1({ bg: 'bay', pose: 'surprised', text: T.bay.intro, btn: T.next, onNext: function () { O.go('E1.1-sort'); } });
    }
  };

  /* 1.1 Сортування слідів: тап на слід → тап на коробку */
  S['E1.1-sort'] = {
    render: function (ctx) {
      var s = ctx.s, B = T.bay;
      var types = T.trayOrder;
      var animals = T.animals.map(function (a) { return a.id; });
      var P = s.partial && s.partial.place ? s.partial : {
        place: types.map(function () { return null; }),
        locked: types.map(function () { return false; }),
        wrong: types.map(function () { return false; }),
        moved: false,
        done: null
      };
      var sel = null, busy = false, highlight = null, shakeNow = false, justLanded = -1;

      var f = ui.frame({ bg: 'bay', top: true });
      var pile = h('div', { class: 'pile', 'aria-hidden': 'true' },
        [0, 1, 2, 3].map(function () { return h('span', { class: 'pile-t', svg: A.bigTrack(30) }); }));
      var tray = h('div', { class: 'tray' });
      var boxes = h('div', { class: 'boxes' });
      var hint = ui.hintStrip();
      var acts = h('div', { class: 'actions' });
      f.col.append(h('div', { class: 'task' }, h('div', { class: 'zone-label' }, B.label), pile, tray, boxes), hint.el, acts);

      tray.addEventListener('click', function (e) {
        if (busy || P.done || sel == null || e.target.closest('.tile')) return;
        if (P.place[sel] != null) { P.place[sel] = null; P.wrong[sel] = false; }
        sel = null;
        persist(); draw();
      });

      function persist() { O.state.setPartial(P); }

      function tile(i, inBox) {
        var cls = 'tile';
        if (sel === i) cls += ' lifted';
        if (P.locked[i]) cls += ' locked';
        if (P.wrong[i]) cls += ' wrong' + (shakeNow ? ' shake' : '');
        if (highlight === i) cls += ' hl';
        if (justLanded === i) cls += ' landed';
        if (!P.moved && !inBox && i === 0 && sel == null) cls += ' bounce';
        var el = h('button', { class: cls, type: 'button', 'aria-label': 'Слід', svg: A.track(types[i], inBox ? 30 : 36) });
        if (P.locked[i] || P.done) el.setAttribute('aria-disabled', 'true');
        el.addEventListener('click', function (e) { e.stopPropagation(); tapTile(i); });
        return el;
      }

      function draw() {
        tray.replaceChildren();
        tray.hidden = P.place.every(function (x) { return x != null; });
        types.forEach(function (t, i) {
          tray.appendChild(P.place[i] == null ? tile(i, false) : h('span', { class: 'tile-slot' }));
        });
        boxes.replaceChildren();
        T.animals.forEach(function (a, bi) {
          var items = [];
          types.forEach(function (t, i) { if (P.place[i] === bi) items.push(tile(i, true)); });
          var box = h('div', { class: 'box' + (sel != null ? ' target' : '') + (P.done ? ' all-ok' : ''), role: 'button', tabindex: '0', 'aria-label': 'Коробка: ' + a.name },
            h('div', { class: 'box-head' }, h('span', { class: 'box-animal', svg: A.animal(a.id) }), h('span', { class: 'box-name' }, a.name)),
            h('div', { class: 'box-items' }, items));
          box.addEventListener('click', function () { tapBox(bi); });
          boxes.appendChild(box);
        });
        shakeNow = false;
        justLanded = -1;
      }

      function tapTile(i) {
        if (busy || P.done) return;
        /* Тримаємо слід і тицяємо в слід у коробці — кладемо в цю коробку */
        if (sel != null && sel !== i && P.place[i] != null) { tapBox(P.place[i]); return; }
        if (P.locked[i]) return;
        sel = sel === i ? null : i;
        draw();
      }

      function tapBox(bi) {
        if (busy || P.done || sel == null) return;
        var i = sel;
        P.place[i] = bi;
        P.wrong[i] = false;
        if (highlight === i) highlight = null;
        sel = null;
        if (!P.moved) { P.moved = true; if (!s.hintLevel) hint.hide(); }
        justLanded = i;
        persist(); draw();
        if (P.place.every(function (x) { return x != null; })) check();
      }

      function wrongList() {
        var w = [];
        types.forEach(function (t, i) { if (!P.locked[i]) w.push(i); });
        return w;
      }

      function check() {
        var wrong = [];
        types.forEach(function (t, i) {
          if (animals[P.place[i]] === t) { P.locked[i] = true; P.wrong[i] = false; }
          else { P.wrong[i] = true; wrong.push(i); }
        });
        if (!wrong.length) { P.done = 'ok'; persist(); O.state.log('solve', { step: '1.1', level: s.hintLevel }); finish(); return; }
        var lvl = Math.min(3, (s.hintLevel || 0) + 1);
        O.state.s.hintLevel = lvl;
        persist();
        O.state.log('miss', { step: '1.1', level: lvl });
        busy = true;
        shakeNow = true;
        setTimeout(function () { busy = false; }, 320);
        showHint(lvl);
      }

      function showHint(lvl) {
        if (lvl <= 1) { highlight = null; hint.say(B.hint1); draw(); return; }
        var w = wrongList();
        var i = w.filter(function (k) { return P.wrong[k]; })[0];
        if (i == null) i = w[0];
        highlight = i == null ? null : i;
        var boxIns = i == null ? T.animals[0].ins : T.animals[animals.indexOf(types[i])].ins;
        hint.say(B.hint2(boxIns), { pose: 'point', show: lvl >= 3 ? doShow : null });
        draw();
      }

      function doShow() {
        if (busy || P.done) return;
        busy = true;
        O.state.log('show', { step: '1.1' });
        hint.hide();
        highlight = null; sel = null;
        var queue = wrongList();
        (function next() {
          if (!queue.length) { P.done = 'shown'; persist(); finish(); return; }
          var i = queue.shift();
          P.place[i] = animals.indexOf(types[i]);
          P.wrong[i] = false;
          P.locked[i] = true;
          justLanded = i;
          draw();
          setTimeout(next, 450);
        })();
      }

      function finish() {
        busy = false;
        draw();
        if (P.done === 'ok') hint.say(T.surprise(), { pose: 'surprised' });
        else hint.say(B.shownSort);
        acts.replaceChildren(ui.btn(T.next, function () { O.go('E1.2-big'); }));
      }

      draw();
      if (P.done) finish();
      else if (s.hintLevel > 0) showHint(s.hintLevel);
      else if (!P.moved) hint.say(B.tutorial, { pose: 'point' });
      return f.root;
    }
  };

  /* 1.2 «Драконячі» сліди: лупа і три варіанти */
  S['E1.2-big'] = {
    render: function (ctx) {
      var s = ctx.s, B = T.bay;
      var P = s.partial && 'zoom' in s.partial ? s.partial : { zoom: false, done: null };
      var busy = false;
      var f = ui.frame({ bg: 'bay', top: true });
      var task = h('div', { class: 'task' });
      var hint = ui.hintStrip();
      var acts = h('div', { class: 'actions' });
      f.col.append(task, hint.el, acts);
      function persist() { O.state.setPartial(P); }

      function drawField() {
        var grid = h('div', { class: 'big-grid' });
        for (var k = 0; k < 4; k++) {
          var b = h('button', { class: 'big-tile', type: 'button', 'aria-label': 'Великий слід', svg: A.bigTrack(64) });
          b.style.setProperty('--rot', ([-8, 6, -3, 10])[k] + 'deg');
          b.addEventListener('click', function () {
            if (ui.locked) return;
            ui.lock();
            P.zoom = true; persist();
            O.state.log('zoom', { step: '1.2' });
            drawZoom();
          });
          grid.appendChild(b);
        }
        task.replaceChildren(h('div', { class: 'zone-label' }, B.label), grid);
        hint.say(B.bigIntro + ' ' + B.bigTap, { pose: 'surprised' });
      }

      var lupa, crabRef, opts = [];
      function drawZoom() {
        f.root.classList.add('dark-bg');
        lupa = h('div', { class: 'lupa', svg: A.bigTrack(150) });
        crabRef = h('div', { class: 'crab-ref', hidden: true }, h('span', { class: 'tile static', svg: A.track('crab', 36) }), h('span', { class: 'crab-cap' }, 'Краб'));
        opts = B.bigOptions.map(function (o) {
          var b = ui.btn(o.t, function () { pick(o, b); }, 'btn-opt');
          b.dataset.id = o.id;
          return b;
        });
        task.replaceChildren(
          h('div', { class: 'zone-label' }, B.label),
          h('div', { class: 'lupa-row' }, h('div', { class: 'lupa-wrap' }, lupa, h('span', { class: 'lupa-handle' })), crabRef),
          h('h2', { class: 'q' }, B.bigQ),
          h('div', { class: 'opts' }, opts));
        hint.hide();
        if (P.done) finish();
        else if (s.hintLevel > 0) showHint(s.hintLevel);
      }

      function pick(o, b) {
        if (busy || P.done) return;
        if (o.ok) {
          P.done = 'ok'; persist();
          O.state.log('solve', { step: '1.2', level: s.hintLevel });
          finish();
          return;
        }
        busy = true;
        b.classList.add('wrong');
        ui.shake(b);
        setTimeout(function () { busy = false; }, 350);
        setTimeout(function () { b.classList.remove('wrong'); }, 900);
        var lvl = Math.min(3, (s.hintLevel || 0) + 1);
        O.state.s.hintLevel = lvl;
        persist();
        O.state.log('miss', { step: '1.2', level: lvl, picked: o.id });
        showHint(lvl);
      }

      function showHint(lvl) {
        if (lvl <= 1) { hint.say(B.bigHint1); return; }
        crabRef.hidden = false;
        crabRef.classList.add('hl');
        hint.say(B.bigHint2, { pose: 'point', show: lvl >= 3 ? doShow : null });
      }

      function doShow() {
        if (busy || P.done) return;
        O.state.log('show', { step: '1.2' });
        P.done = 'shown'; persist();
        finish();
      }

      function finish() {
        opts.forEach(function (b) {
          b.disabled = true;
          if (b.dataset.id === 'turtlecrab') { b.classList.add('ok'); b.disabled = false; b.setAttribute('aria-disabled', 'true'); }
        });
        if (P.done === 'shown') { lupa.classList.add('split'); hint.say(B.bigShown); }
        else hint.say(T.surprise(), { pose: 'surprised' });
        acts.replaceChildren(ui.btn(T.next, function () { O.go('E1.3-fork'); }));
      }

      if (P.zoom) drawZoom(); else drawField();
      return f.root;
    }
  };

  S['E1.3-fork'] = {
    render: function () {
      var row = function (type, dir) {
        var g = h('div', { class: 'run run-' + dir });
        for (var k = 0; k < 4; k++) g.appendChild(h('span', { style: '--d:' + (k * 120) + 'ms', svg: A.track(type, 28) }));
        return g;
      };
      var anim = h('div', { class: 'fork-anim', 'aria-hidden': 'true' }, row('turtle', 'left'), row('dog', 'right'));
      return ui.t1({ bg: 'bay', pose: 'happy', above: anim, text: T.bay.fork, btn: T.next, onNext: function () { O.go('E1.4-find'); } });
    }
  };

  S['E1.4-find'] = {
    render: function (ctx) {
      return ui.t6({
        n: 1,
        onTake: function () {
          var s = O.state.s;
          O.go('MAP', { fragments: addUnique(s.fragments, 1), zonesDone: addUnique(s.zonesDone, 'bay') }, { delay: 450 });
          ui.refreshTop({ bump: true });
        }
      });
    }
  };

  /* ================= Карта ================= */

  /* Які зони відкриті для походу (STEP 3, розділ 3) */
  function zoneStatus(s) {
    var d = s.zonesDone, has = function (z) { return d.indexOf(z) >= 0; };
    var avail = [], locked = [];
    if (has('bay')) {
      if (!has('swamp') || !has('forest')) {
        if (!s.fork1) { avail = ['swamp', 'forest']; }
        else avail = ['swamp', 'forest'].filter(function (z) { return !has(z); });
        /* Після першої гілки печеру видно як закриту: тап пояснює, чому туди ще рано */
        if (has('swamp') || has('forest')) locked = ['cave'];
      } else if (!has('cave')) avail = ['cave'];
      else if (!has('river')) avail = ['river'];
      else if (!has('rock')) avail = ['rock'];
      else if (!has('camp')) { avail = ['camp']; locked = ['maw']; }
      else if (!has('maw')) avail = ['maw'];
    }
    /* Закрита печера лишається в тумані, видно лише її позначку */
    var revealed = d.concat(avail, locked.filter(function (z) { return z !== 'cave'; }));
    return { done: d.slice(), available: avail, locked: locked, revealed: revealed };
  }
  O.zoneStatus = zoneStatus;

  /* Куди веде кожна зона */
  var ZONE_SCREEN = { swamp: 'E2a.0', forest: 'E2b.0', cave: 'E3.0', river: 'E4.0-river', rock: 'E5.0', camp: 'E6.0', maw: 'E7.0' };

  S['MAP'] = {
    render: function (ctx) {
      var s = ctx.s;
      var st = zoneStatus(s);
      var selected = null;
      var f = ui.frame({ top: false, cls: 'map-screen' });
      var area = h('div', { class: 'map-area' });
      var sheet = h('div', { class: 'map-sheet' });
      f.col.append(area, sheet);

      function has2(z) { return s.zonesDone.indexOf(z) >= 0; }
      function drawMap() {
        area.innerHTML = A.islandMap({ revealed: st.revealed, done: st.done, available: st.available, locked: st.locked, selected: selected, uid: 'main' });
      }
      function drawSheet() {
        if (!selected) {
          sheet.replaceChildren(h('h2', { class: 'sheet-h' }, T.map.pick), h('p', { class: 'sheet-p' }, T.map.pickSub));
          return;
        }
        var z = T.map.zones[selected];
        var isAvail = st.available.indexOf(selected) >= 0;
        var isLocked = st.locked.indexOf(selected) >= 0;
        var off = null;
        if (isLocked) { off = ui.btn(T.map.enter, function () {}); off.disabled = true; }
        sheet.replaceChildren(
          h('h2', { class: 'sheet-h' }, z.name),
          isLocked ? h('div', { class: 'say-row' }, h('div', { class: 'hint-head', svg: A.miron('sad', true) }), h('p', { class: 'sheet-p' }, selected === 'cave' ? T.map.caveLocked(has2('swamp') ? 'forest' : 'swamp') : T.map.mawLocked))
            : z.desc ? h('p', { class: 'sheet-p' }, z.desc) : null,
          isAvail ? ui.btn(T.map.go, function () { enter(selected); }) : off);
      }
      area.addEventListener('click', function (e) {
        var g = e.target.closest('[data-zone]');
        if (!g) return;
        var id = g.getAttribute('data-zone');
        selected = id;
        drawMap(); drawSheet();
        if (st.locked.indexOf(id) >= 0) ui.shake(area.querySelector('[data-zone="' + id + '"]'));
      });
      function enter(zone) {
        var target = ZONE_SCREEN[zone];
        O.state.log('zone', { zone: zone });
        var patch = {};
        if ((zone === 'swamp' || zone === 'forest') && !s.fork1) patch.fork1 = zone === 'swamp' ? 'left' : 'right';
        if (zone === 'river') patch.compass = 'lost';
        if (zone === 'rock') patch.rockOpened = 0;
        O.go(target, patch);
      }
      drawMap(); drawSheet();
      return f.root;
    }
  };

  /* ================= Повернення після перерви ================= */

  function resetFlow() {
    ui.confirmReset(function () {
      O.state.log('reset');
      O.state.reset();
      O.show('E0.0-title');
    });
  }

  S['R-welcome'] = {
    nosave: true,
    render: function (ctx) {
      var s = ctx.s;
      O.state.log('welcome');
      return ui.t1({
        bg: 'sea', top: true, pose: 'happy',
        text: T.welcome(s.screen, s.fragments.length),
        btn: T.resume.go, onNext: function () { O.resume(); },
        quiet: [T.resume.reset, resetFlow]
      });
    }
  };

  S['R-finished'] = {
    nosave: true,
    render: function () {
      return ui.t1({
        bg: 'sea', top: false, pose: 'happy', text: T.finished.text, btn: T.finished.btn,
        onNext: function () { O.go(O.screens['E8.2-final-map'] ? 'E8.2-final-map' : 'MAP'); },
        quiet: [T.resume.reset, resetFlow]
      });
    }
  };

})(window.OSTRIV);

/* ================= Друга здача: епізоди 2–5, привал ================= */
(function (O) {
  var ui = O.ui, h = ui.h, A = O.art, T = O.text, S = O.screens;

  function addUnique(arr, v) { return arr.indexOf(v) >= 0 ? arr.slice() : arr.concat([v]); }
  function has(z) { return O.state.s.zonesDone.indexOf(z) >= 0; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function iconRow(ic, n, cls) {
    var r = h('span', { class: 'icon-row' + (cls ? ' ' + cls : '') });
    for (var i = 0; i < n; i++) r.appendChild(h('span', { svg: A.icon(ic, 20) }));
    return r;
  }
  function label(t) { return h('div', { class: 'zone-label' }, t); }
  function timers() {
    var list = [];
    return {
      set: function (fn, ms) { var id = setTimeout(fn, ms); list.push(id); return id; },
      clear: function () { list.forEach(clearTimeout); list = []; }
    };
  }

  /* ---------- Спільна задача «вибери відповідь» з моделлю підказок 1/2/3 ---------- */
  function choiceTask(o) {
    /* o: {step, host, hint, acts, options, hint1, hint2, onLevel2(), onShow(), shownText, next, intro} */
    var s = O.state.s;
    var P = s.partial && s.partial.ct ? s.partial : { ct: 1, done: null };
    var busy = false;
    var btns = o.options.map(function (op) {
      var b = ui.btn(op.t, function () { pick(op, b); }, 'btn-opt');
      b.dataset.id = op.id;
      return b;
    });
    o.host.replaceChildren.apply(o.host, btns);
    function persist() { O.state.setPartial(P); }
    function pick(op, b) {
      if (busy || P.done) return;
      if (op.ok) {
        P.done = 'ok'; persist();
        O.state.log('solve', { step: o.step, level: s.hintLevel, picked: op.id });
        finish(); return;
      }
      busy = true;
      b.classList.add('wrong');
      ui.shake(b);
      setTimeout(function () { busy = false; }, 350);
      setTimeout(function () { b.classList.remove('wrong'); }, 900);
      var lvl = Math.min(3, (s.hintLevel || 0) + 1);
      O.state.s.hintLevel = lvl;
      persist();
      O.state.log('miss', { step: o.step, level: lvl, picked: op.id });
      level(lvl);
      if (o.onMiss) o.onMiss();
    }
    function level(l) {
      if (l <= 1) { o.hint.say(o.hint1); return; }
      if (o.onLevel2) o.onLevel2();
      o.hint.say(o.hint2 || o.hint1, { pose: 'point', show: l >= 3 ? doShow : null });
    }
    function doShow() {
      if (busy || P.done) return;
      O.state.log('show', { step: o.step });
      P.done = 'shown'; persist();
      finish();
    }
    function finish() {
      btns.forEach(function (b) {
        var op = o.options.filter(function (x) { return x.id === b.dataset.id; })[0];
        b.disabled = true;
        if (op.ok) { b.classList.add('ok'); b.disabled = false; b.setAttribute('aria-disabled', 'true'); }
      });
      if (P.done === 'shown') { if (o.onShow) o.onShow(); o.hint.say(o.shownText || T.shown); }
      else o.hint.say(T.surprise(), { pose: 'surprised' });
      o.acts.replaceChildren(ui.btn(T.next, o.next));
    }
    if (P.done) finish();
    else if (s.hintLevel > 0) level(s.hintLevel);
    else if (o.intro) o.hint.say(o.intro.text, o.intro);
  }

  O.choiceTask = choiceTask;

  /* ================= Епізод 2 — Болото / Ліс ================= */

  var E2 = { a: 'swamp', b: 'forest' };
  function e2info(letter) {
    var zone = E2[letter], other = zone === 'swamp' ? 'forest' : 'swamp';
    return { letter: letter, zone: zone, Z: T.e2[zone], isShort: has(other), id: function (x) { return 'E2' + letter + '.' + x; } };
  }

  ['a', 'b'].forEach(function (L) {
    S['E2' + L + '.0'] = {
      render: function () {
        var I = e2info(L), again = false;
        var root = ui.t1({
          bg: I.zone, label: I.Z.label, pose: I.zone === 'forest' ? 'surprised' : 'happy', text: I.Z.intro, btn: T.next,
          onNext: function () {
            if (I.isShort && !again) {
              again = true;
              root.querySelector('.bubble').textContent = T.e2.again;
              return;
            }
            O.go(I.id('1-supplies'));
          }
        });
        return root;
      }
    };

    S['E2' + L + '.1-supplies'] = {
      render: function (ctx) {
        var I = e2info(L), Z = I.Z, E = T.e2, s = ctx.s;
        var nb = Z.crossings * Z.bread, nw = Z.crossings * Z.water;
        var hb = s.supplies.bread, hw = s.supplies.water;
        var f = ui.frame({ bg: I.zone, top: true, cls: 'dark-bg' });
        var per = h('div', { class: 'sup-line' }, h('span', { class: 'sup-k' }, E.perCrossing),
          iconRow('bread', Z.bread),
          Z.water ? iconRow('water', Z.water) : h('span', { class: 'no-water' }, h('span', { class: 'crossed', svg: A.icon('water', 20) }), h('span', { class: 'sup-k' }, E.stream)));
        /* Мініатюра шляху: точки-переходи */
        var dots = '';
        var W = 300, gap = W / Z.crossings;
        for (var i = 0; i <= Z.crossings; i++) dots += '<circle cx="' + (10 + i * gap * 0.93) + '" cy="16" r="' + (i === Z.crossings ? 0 : 7) + '" fill="#F4ECDC"/>';
        var flagX = 10 + Z.crossings * gap * 0.93;
        var mini = h('div', { class: 'mini-path', svg: '<svg viewBox="0 0 300 32" aria-hidden="true"><path d="M10 16 H' + flagX + '" stroke="#A9C3C4" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/>' + dots +
          '<path d="M' + (flagX - 6) + ' 30 V2" stroke="#F4ECDC" stroke-width="3"/><path d="M' + (flagX - 5) + ' 3 H' + (flagX + 10) + ' L' + (flagX + 6) + ' 8 L' + (flagX + 10) + ' 13 H' + (flagX - 5) + ' Z" fill="#FFC23D"/></svg>' });
        var needBox = h('div', { class: 'need', hidden: true });
        var rows = [];
        for (var k = 0; k < Z.crossings; k++) rows.push(h('div', { class: 'need-row' }, h('span', { class: 'need-n' }, (k + 1) + '.'), iconRow('bread', Z.bread), Z.water ? iconRow('water', Z.water) : null));
        needBox.appendChild(h('div', { class: 'sup-k' }, E.need));
        rows.forEach(function (r) { needBox.appendChild(r); });
        var packRow = h('div', { class: 'sup-line pack-line' }, h('span', { class: 'sup-k' }, E.inPack),
          h('span', { class: 'have' }, iconRow('bread', hb), h('span', { class: 'have-n' }, hb)),
          h('span', { class: 'have' }, iconRow('water', hw), h('span', { class: 'have-n' }, hw)));
        var compare = h('div', { class: 'compare', hidden: true },
          h('div', { class: 'cmp-row' }, h('span', { svg: A.icon('bread', 22) }), h('span', null, nb + ' / ' + hb)),
          h('div', { class: 'cmp-row' }, h('span', { svg: A.icon('water', 22) }), h('span', null, nw + ' / ' + hw)));
        var panel = h('div', { class: 'sup-panel' }, per, mini, needBox, compare, packRow);
        var opts = h('div', { class: 'opts' });
        var hint = ui.hintStrip();
        var acts = h('div', { class: 'actions' });
        f.col.append(h('div', { class: 'task' }, label(Z.label), panel, h('h2', { class: 'q' }, E.q), opts), hint.el, acts);

        var options;
        var exact = hb >= nb && hw >= nw && ((hb === nb && nb > 0) || (hw === nw && nw > 0));
        var enough = hb >= nb && hw >= nw;
        if (I.isShort) options = [{ id: 'yes', t: E.optYes, ok: enough }, { id: 'no', t: E.optNo, ok: !enough }];
        else options = [{ id: 'yes', t: E.optYes, ok: enough && !exact }, { id: 'no', t: E.optNo, ok: !enough }, { id: 'exact', t: E.optExact, ok: exact }];
        choiceTask({
          step: I.id('1'), host: opts, hint: hint, acts: acts, options: options,
          hint1: Z.water ? E.hint1 : E.hint1Forest, hint2: E.hint2,
          onLevel2: function () { needBox.hidden = false; needBox.classList.add('hl-box'); },
          onShow: function () { needBox.hidden = false; compare.hidden = false; },
          shownText: E.shown(nb, nw, hb, hw),
          next: function () { O.go(I.id('2-route')); }
        });
        return f.root;
      }
    };

    S['E2' + L + '.2-route'] = {
      render: function (ctx) {
        var I = e2info(L), Z = I.Z, E = T.e2, s = ctx.s;
        var rows = I.isShort ? Z.gridShort : Z.grid;
        var start, exit, kup = null;
        rows.forEach(function (row, r) { row.split('').forEach(function (ch, c) {
          if (ch === 'S') start = [r, c]; if (ch === 'E') exit = [r, c]; if (ch === 'k') kup = [r, c];
        }); });
        function kind(r, c) { return rows[r][c]; }
        function key(p) { return p[0] + ',' + p[1]; }
        var P = s.partial && s.partial.path ? s.partial : { path: [start], done: null };
        var busy = false;
        var f = ui.frame({ bg: I.zone, top: true, cls: 'dark-bg' });
        var board = h('div', { class: 'board' });
        var hint = ui.hintStrip();
        var acts = h('div', { class: 'actions' });
        f.col.append(h('div', { class: 'task task-route' }, label(Z.label), board), hint.el, acts);
        function persist() { O.state.setPartial(P); }
        function inPath(r, c) { for (var i = 0; i < P.path.length; i++) if (P.path[i][0] === r && P.path[i][1] === c) return i; return -1; }
        function last() { return P.path[P.path.length - 1]; }
        function adj(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1; }
        function freeNext() {
          var l = last(), out = [];
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            var r = l[0] + d[0], c = l[1] + d[1];
            if (r < 0 || r > 3 || c < 0 || c > 3) return;
            if (kind(r, c) === '#' || inPath(r, c) >= 0) return;
            out.push(key([r, c]));
          });
          return out;
        }
        var cells = {}, token;
        function build() {
          board.replaceChildren();
          for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
            (function (r, c) {
              var k = kind(r, c);
              var cell = h('button', { class: 'cell2 k-' + (k === '#' ? 'block' : 'free'), type: 'button', 'aria-label': k === '#' ? 'Не пройти' : 'Клітинка', svg: A.cellArt(k, I.zone) });
              cell.addEventListener('click', function () { tap(r, c, cell); });
              cells[key([r, c])] = cell;
              board.appendChild(cell);
            })(r, c);
          }
          board.appendChild(h('div', { class: 'route-layer' }));
          token = h('div', { class: 'token', svg: A.miron('happy', true) });
          board.appendChild(token);
        }
        function draw(showRoute) {
          var hl = s.hintLevel >= 2 && !P.done ? freeNext() : [];
          Object.keys(cells).forEach(function (k) {
            var p = k.split(',').map(Number), cell = cells[k];
            cell.classList.toggle('on-path', inPath(p[0], p[1]) >= 0);
            cell.classList.toggle('hl', hl.indexOf(k) >= 0);
          });
          var pts = P.path.map(function (p) { return (p[1] * 25 + 12.5) + ',' + (p[0] * 25 + 12.5); }).join(' ');
          var sr = '';
          if (showRoute) sr = '<polyline points="' + showRoute.map(function (p) { return (p[1] * 25 + 12.5) + ',' + (p[0] * 25 + 12.5); }).join(' ') + '" fill="none" stroke="#F4ECDC" stroke-width="2" stroke-dasharray="2 3" stroke-linecap="round"/>';
          board.querySelector('.route-layer').innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + sr +
            '<polyline points="' + pts + '" fill="none" stroke="#FFC23D" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" style="stroke-width:7px"/></svg>';
          var l = last();
          token.style.left = (l[1] * 25) + '%';
          token.style.top = (l[0] * 25) + '%';
        }
        function tap(r, c, cell) {
          if (busy || P.done) return;
          var idx = inPath(r, c), n = P.path.length;
          if (n > 1 && (idx === n - 1 || idx === n - 2)) {
            P.path.pop(); persist(); draw(); return;
          }
          if (idx >= 0) return;
          if (!adj(last(), [r, c])) { ui.shake(token); return; }
          if (kind(r, c) === '#') {
            ui.shake(cell);
            var lvl = Math.min(3, (s.hintLevel || 0) + 1);
            O.state.s.hintLevel = lvl; persist();
            O.state.log('miss', { step: I.id('2'), level: lvl });
            if (lvl <= 1) hint.say(Z.blockedTap, { pose: 'surprised' });
            else hint.say(Z.blockedTap + ' ' + E.routeHint2, { pose: 'point', show: lvl >= 3 ? doShow : null });
            draw();
            return;
          }
          P.path.push([r, c]); persist(); draw();
          if (kind(r, c) === 'k') hint.say(Z.kupina, { pose: 'surprised' });
          else if (n === 1 && !s.hintLevel) hint.hide();
          if (kind(r, c) === 'E') { P.done = 'ok'; persist(); O.state.log('solve', { step: I.id('2'), level: s.hintLevel }); finish(); }
        }
        function bestRoute() {
          var all = [];
          (function dfs(path) {
            var l = path[path.length - 1];
            if (l[0] === exit[0] && l[1] === exit[1]) { all.push(path.slice()); return; }
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
              var r = l[0] + d[0], c = l[1] + d[1];
              if (r < 0 || r > 3 || c < 0 || c > 3 || kind(r, c) === '#') return;
              for (var i = 0; i < path.length; i++) if (path[i][0] === r && path[i][1] === c) return;
              path.push([r, c]); dfs(path); path.pop();
            });
          })([start]);
          var withK = kup ? all.filter(function (p) { return p.some(function (x) { return x[0] === kup[0] && x[1] === kup[1]; }); }) : [];
          var pool = withK.length ? withK : all;
          pool.sort(function (a, b) { return a.length - b.length; });
          return pool[0];
        }
        O.routeCount = O.routeCount || {};
        function doShow() {
          if (busy || P.done) return;
          busy = true;
          O.state.log('show', { step: I.id('2') });
          var route = bestRoute();
          hint.hide();
          draw(route);
          setTimeout(function () {
            P.path = route; P.done = 'shown'; persist();
            busy = false; draw(); finish();
          }, 900);
        }
        function finish() {
          draw();
          if (P.done === 'shown') hint.say(E.routeShown);
          else hint.say(T.surprise(), { pose: 'surprised' });
          acts.replaceChildren(ui.btn(T.next, leave));
        }
        var left = false;
        function leave() {
          if (left) return;
          left = true;
          var usedK = kup && inPath(kup[0], kup[1]) >= 0;
          var db = Z.crossings * Z.bread, dw = Z.crossings * Z.water - (usedK ? Z.water : 0);
          var sup = { bread: Math.max(0, s.supplies.bread - db), water: Math.max(0, s.supplies.water - dw) };
          O.state.log('route', { zone: I.zone, kupina: !!usedK, steps: P.path.length - 1 });
          O.go(I.id('3-find'), { supplies: sup }, { delay: 900 });
          ui.refreshTop({ delta: { bread: -db, water: -dw } });
        }
        build();
        if (P.done) finish();
        else {
          draw();
          if (s.hintLevel >= 2) hint.say(Z.blockedTap + ' ' + E.routeHint2, { pose: 'point', show: s.hintLevel >= 3 ? doShow : null });
          else if (s.hintLevel === 1) hint.say(Z.blockedTap, { pose: 'surprised' });
          else if (P.path.length === 1) hint.say(E.routeTap, { pose: 'point' });
        }
        return f.root;
      }
    };

    S['E2' + L + '.3-find'] = {
      render: function () {
        var I = e2info(L);
        if (!I.isShort) {
          return ui.t1({
            bg: I.zone, label: I.Z.label, pose: 'happy', text: T.e2.firstDone, btn: T.next,
            onNext: function () { O.go('MAP', { zonesDone: addUnique(O.state.s.zonesDone, I.zone) }); }
          });
        }
        return ui.t6({
          n: 2,
          onTake: function () {
            var s = O.state.s;
            O.go(s.campOffered.indexOf('e2') >= 0 ? 'MAP' : 'MAP-camp',
              { fragments: addUnique(s.fragments, 2), zonesDone: addUnique(s.zonesDone, I.zone) }, { delay: 450 });
            ui.refreshTop({ bump: true });
          }
        });
      }
    };
  });

  /* ================= Привал ================= */

  S['MAP-camp'] = {
    render: function (ctx) {
      var s = ctx.s;
      var st = O.zoneStatus(s);
      var point = has('river') ? 'e4' : 'e2';
      var f = ui.frame({ top: false, cls: 'map-screen' });
      f.col.appendChild(h('div', { class: 'map-area', svg: A.islandMap({ revealed: st.revealed, done: st.done, available: st.available, locked: st.locked, uid: 'camp' }) }));
      function choose(stay) {
        O.state.log('camp', { point: point, stay: stay });
        O.go(stay ? 'CAMP-night' : 'MAP', { campOffered: addUnique(s.campOffered, point) });
      }
      f.col.appendChild(h('div', { class: 'map-sheet' },
        h('div', { class: 'say-row' }, h('div', { class: 'hint-head', svg: A.miron('happy', true) }), h('p', { class: 'sheet-p' }, T.map.camp)),
        ui.btn(T.map.campGo, function () { choose(false); }),
        ui.btn(T.map.campStay, function () { choose(true); }, 'btn-outline dark')));
      return f.root;
    }
  };

  S['CAMP-night'] = {
    render: function () {
      return ui.t1({
        bg: 'night', top: false, pose: 'sleep', narr: T.camp.text, cls: 'night',
        quiet: [T.camp.more, function () { O.go('MAP'); }]
      });
    }
  };

  /* ================= Епізод 3 — Печера ================= */

  S['E3.0'] = {
    render: function () {
      return ui.t1({ bg: 'cave', label: T.cave.label, pose: 'surprised', text: T.cave.intro, btn: T.next,
        onNext: function () { O.go('E3.1-intro', { cave31: { round: 0, clean: [] } }); } });
    }
  };

  function wallSymbols() {
    return h('div', { class: 'wall' }, ['wave', 'eye', 'arrow', 'star', 'circle', 'zigzag'].map(function (n) { return h('span', { svg: A.sym(n, 34) }); }));
  }

  S['E3.1-intro'] = {
    render: function () {
      return ui.t1({ bg: 'cave', label: T.cave.label, pose: 'point', above: wallSymbols(), text: T.cave.memIntro, btn: T.cave.memReady,
        onNext: function () {
          var c = O.state.s.cave31;
          O.go('E3.1-memory', c ? null : { cave31: { round: 0, clean: [] } });
        } });
    }
  };

  S['E3.1-memory'] = {
    render: function (ctx) {
      var C = T.cave, s = ctx.s;
      var state = s.cave31 || { round: 0, clean: [] };
      var tm = timers();
      ctx.onExit(tm.clear);
      var f = ui.frame({ bg: 'cave', top: true });
      var lamp = h('div', { class: 'lamp' });
      var cap = h('div', { class: 'lamp-cap' });
      var slots = h('div', { class: 'slots' });
      var keys = h('div', { class: 'keys' });
      var hint = ui.hintStrip();
      var acts = h('div', { class: 'actions' });
      f.col.append(h('div', { class: 'task' }, label(C.label), h('div', { class: 'lamp-wrap' }, lamp, cap), slots, keys), hint.el, acts);
      var SY = ['wave', 'eye', 'arrow', 'star', 'circle', 'zigzag'];
      var keyEls = {};
      SY.forEach(function (n) {
        var k = h('button', { class: 'key', type: 'button', 'aria-label': n, svg: A.sym(n, 36) });
        k.addEventListener('click', function () { press(n); });
        keyEls[n] = k; keys.appendChild(k);
      });
      var seq, input, phase, misses, shown;
      function startRound(extraMs) {
        tm.clear();
        var R = C.rounds[state.round];
        seq = R.seq; input = []; phase = 'show'; misses = misses || 0;
        drawSlots();
        keys.classList.add('off');
        acts.replaceChildren();
        cap.textContent = C.watch;
        lamp.innerHTML = '';
        var step = (R.ms + (extraMs || 0)) / seq.length;
        seq.forEach(function (n, i) {
          tm.set(function () { lamp.innerHTML = A.sym(n, 96); lamp.classList.add('lit'); }, 500 + i * step);
          tm.set(function () { lamp.innerHTML = ''; lamp.classList.remove('lit'); }, 500 + i * step + step * 0.78);
        });
        tm.set(function () { phase = 'input'; keys.classList.remove('off'); cap.textContent = C.yourTurn; }, 500 + seq.length * step);
      }
      function drawSlots() {
        slots.replaceChildren();
        seq.forEach(function (n, i) {
          var v = input[i];
          var el = h('button', { class: 'slot' + (v ? ' full' : ''), type: 'button', 'aria-label': 'Лунка ' + (i + 1), svg: v ? A.sym(v, 30) : '' });
          el.addEventListener('click', function () {
            if (phase !== 'input' || !input[i]) return;
            input = input.slice(0, i); drawSlots();
          });
          slots.appendChild(el);
        });
      }
      function press(n) {
        if (phase !== 'input' || input.length >= seq.length) return;
        input.push(n);
        keyEls[n].classList.remove('tap'); void keyEls[n].offsetWidth; keyEls[n].classList.add('tap');
        drawSlots();
        if (input.length === seq.length) check();
      }
      function check() {
        var good = 0;
        while (good < seq.length && input[good] === seq[good]) good++;
        if (good === seq.length) { roundDone(false); return; }
        misses++;
        input = input.slice(0, good);
        phase = 'busy';
        slots.classList.add('shake');
        tm.set(function () { slots.classList.remove('shake'); drawSlots(); phase = 'input'; }, 320);
        var lvl = Math.min(3, (s.hintLevel || 0) + 1);
        O.state.save({ hintLevel: lvl });
        O.state.log('miss', { step: '3.1-r' + (state.round + 1), level: lvl });
        if (lvl === 1) hint.say(good > 0 ? C.memHint1 : C.memHint1Zero);
        else if (lvl === 2) { hint.say(C.memHint2, { pose: 'point' }); tm.set(function () { input = []; startRound(2000); }, 700); }
        else hint.say(C.memHint2, { pose: 'point', show: doShow });
      }
      function doShow() {
        if (phase === 'show' || phase === 'done') return;
        O.state.log('show', { step: '3.1-r' + (state.round + 1) });
        phase = 'busy'; hint.hide(); input = []; drawSlots();
        seq.forEach(function (n, i) {
          tm.set(function () {
            keyEls[n].classList.add('glow');
            input.push(n); drawSlots();
            tm.set(function () { keyEls[n].classList.remove('glow'); }, 450);
          }, 300 + i * 650);
        });
        tm.set(function () { roundDone(true); }, 300 + seq.length * 650);
      }
      function roundDone(viaShow) {
        phase = 'done';
        keys.classList.add('off');
        cap.textContent = '';
        var clean = !viaShow && misses === 0;
        state.clean[state.round] = clean;
        O.state.log('round', { step: '3.1', round: state.round + 1, clean: clean });
        var more = state.round === 0 || (state.round === 1 && state.clean[0] && state.clean[1]);
        var say = viaShow ? T.shown : T.surprise();
        if (more) {
          var nextState = { round: state.round + 1, clean: state.clean.slice() };
          O.state.save({ cave31: nextState, hintLevel: 0 });
          hint.say(say + ' ' + C.again, { pose: viaShow ? 'happy' : 'surprised' });
          acts.replaceChildren(ui.btn(C.againBtn, function () {
            state = nextState; misses = 0; hint.hide(); startRound(0);
          }));
        } else {
          O.state.save({ cave31: { round: state.round, clean: state.clean.slice(), done: true } });
          hint.say(say, { pose: viaShow ? 'happy' : 'surprised' });
          acts.replaceChildren(ui.btn(T.next, function () { O.go('E3.2-intro'); }));
        }
      }
      /* Пауза: шторка рюкзака або згорнута вкладка → раунд з початку */
      var paused = false;
      ctx.on('pause', function () { if (phase === 'done') return; paused = true; tm.clear(); lamp.innerHTML = ''; lamp.classList.remove('lit'); });
      ctx.on('resume', function () { if (!paused) return; paused = false; input = []; startRound(0); });
      misses = 0;
      if (state.done) {
        seq = C.rounds[state.round].seq; input = seq.slice(); drawSlots(); phase = 'done'; keys.classList.add('off');
        hint.say(T.surprise(), { pose: 'surprised' });
        acts.replaceChildren(ui.btn(T.next, function () { O.go('E3.2-intro'); }));
      } else startRound(0);
      return f.root;
    }
  };

  function gameSym(color, sym, size) {
    return h('span', { class: 'gsym ' + (color === 'r' ? 'red' : 'blue'), svg: A.sym(sym, size || 64, 2.6) });
  }

  S['E3.2-intro'] = {
    render: function () {
      var C = T.cave;
      var f = ui.frame({ bg: 'cave', top: true });
      var hint = ui.hintStrip();
      var acts = h('div', { class: 'actions' });
      var blue = h('button', { class: 'gbtn', type: 'button', 'aria-label': 'Синій символ' }, gameSym('b', 'star', 56));
      var red = h('button', { class: 'gbtn', type: 'button', 'aria-label': 'Червоний символ' }, gameSym('r', 'star', 56));
      red.addEventListener('click', function () { red.classList.remove('blink'); void red.offsetWidth; red.classList.add('blink'); });
      blue.addEventListener('click', function () {
        blue.classList.add('flash');
        if (!acts.children.length) acts.appendChild(ui.btn(C.goBtn, function () { O.go('E3.2-gonogo'); }));
      });
      f.col.append(h('div', { class: 'task' }, label(C.label),
        h('div', { class: 'go-demo' },
          h('div', { class: 'go-col' }, blue, h('span', { class: 'go-cap' }, C.tapBlue)),
          h('div', { class: 'go-col' }, red, h('span', { class: 'go-cap' }, C.noRed)))), hint.el, acts);
      hint.say(C.goIntro, { pose: 'point' });
      return f.root;
    }
  };

  S['E3.2-gonogo'] = {
    render: function (ctx) {
      var C = T.cave;
      var tm = timers();
      ctx.onExit(tm.clear);
      var f = ui.frame({ bg: 'cave', top: true });
      var stage = h('div', { class: 'go-stage' });
      var track = h('div', { class: 'go-track' });
      var walker = h('div', { class: 'go-walker', svg: A.miron('happy', true) });
      track.appendChild(walker);
      var hint = ui.hintStrip();
      var acts = h('div', { class: 'actions' });
      f.col.append(h('div', { class: 'task' }, label(C.label), stage, track), hint.el, acts);
      var fast = false, running = false, items, ms, idx, steps, redTaps, missed, tappedCur, cur;
      function begin() {
        tm.clear();
        items = (fast ? C.gonogoFast : C.gonogo).map(function (x) { var p = x.split(':'); return { c: p[0], s: p[1] }; });
        ms = fast ? C.gonogoFastMs : C.gonogoMs;
        idx = -1; steps = 0; redTaps = 0; missed = 0; running = true; cur = null; tappedCur = false;
        acts.replaceChildren(); hint.hide(); stage.replaceChildren();
        moveWalker();
        tm.set(next, 800);
      }
      function moveWalker() {
        var blues = items.filter(function (x) { return x.c === 'b'; }).length;
        walker.style.left = 'calc((100% - 48px) * ' + Math.min(1, steps / blues).toFixed(3) + ')';
      }
      function next() {
        if (cur && cur.c === 'b' && !tappedCur) missed++;
        idx++;
        if (idx >= items.length) { end(); return; }
        cur = items[idx]; tappedCur = false;
        var b = h('button', { class: 'gbtn big appear', type: 'button', 'aria-label': cur.c === 'r' ? 'Червоний' : 'Синій' }, gameSym(cur.c, cur.s, 92));
        b.addEventListener('pointerdown', function (e) { e.preventDefault(); tapCur(b); });
        stage.replaceChildren(b);
        tm.set(function () { stage.replaceChildren(); }, ms * 0.85);
        tm.set(next, ms);
      }
      function tapCur(b) {
        if (!running || tappedCur) return;
        tappedCur = true;
        if (cur.c === 'b') { b.classList.add('flash'); steps++; moveWalker(); }
        else {
          redTaps++;
          f.root.classList.remove('lamp-blink'); void f.root.offsetWidth; f.root.classList.add('lamp-blink');
          hint.say(C.redTap, { pose: 'surprised' });
          tm.set(function () { if (running) hint.hide(); }, 1800);
        }
      }
      function end() {
        running = false;
        stage.replaceChildren();
        var clean = redTaps === 0 && missed <= 1;
        O.state.log('gonogo', { fast: fast, redTaps: redTaps, missed: missed, clean: clean });
        if (!fast && clean) {
          hint.say(C.faster, { pose: 'surprised' });
          acts.replaceChildren(
            ui.btn(C.fasterBtn, function () { fast = true; begin(); }),
            ui.btn(C.onward, function () { O.go('E3.3-diary2'); }, 'btn-outline'));
        } else {
          if (fast && clean) hint.say(T.surprise(), { pose: 'surprised' }); else hint.hide();
          acts.replaceChildren(ui.btn(C.onward, function () { O.go('E3.3-diary2'); }));
        }
      }
      var paused = false;
      ctx.on('pause', function () { if (!running) return; paused = true; running = false; tm.clear(); stage.replaceChildren(); });
      ctx.on('resume', function () { if (!paused) return; paused = false; tm.set(begin, 500); });
      begin();
      return f.root;
    }
  };

  /* Запис щоденника + запитання (3.3, 5.x) */
  function readingTask(ctx, o) {
    /* o: {bg, labelText, n, key, q, options, hint1, shownText, step, next} */
    var s = ctx.s;
    var t0 = Date.now(), logged = false;
    var f = ui.frame({ bg: o.bg, top: true, cls: 'dark-bg' });
    var pageBox = h('div', { class: 'diary-compact' });
    function page(ul) { pageBox.replaceChildren(ui.diaryPage(o.n, ul ? { underline: o.key } : null)); }
    page(s.hintLevel >= 2);
    var opts = h('div', { class: 'opts' });
    var hint = ui.hintStrip();
    var acts = h('div', { class: 'actions' });
    f.col.append(h('div', { class: 'task' }, label(o.labelText), pageBox, h('h2', { class: 'q' }, o.q), opts), hint.el, acts);
    opts.addEventListener('click', function () {
      if (logged) return;
      logged = true;
      var sec = Math.round((Date.now() - t0) / 1000);
      O.state.log('diary', { n: o.n, sec: sec, skimmed: sec < 4 });
    }, true);
    choiceTask({
      step: o.step, host: opts, hint: hint, acts: acts, options: o.options,
      hint1: o.hint1, hint2: o.hint1,
      onLevel2: function () { page(true); },
      onShow: function () { page(true); },
      shownText: o.shownText,
      next: o.next
    });
    return f.root;
  }

  S['E3.3-diary2'] = {
    render: function (ctx) {
      var C = T.cave;
      return readingTask(ctx, {
        bg: 'cave', labelText: C.label, n: 2, key: 2, q: C.q, options: C.opts, hint1: C.hint1, shownText: C.shown, step: '3.3',
        next: function () { O.go('E3.4-find', { diaryRead: addUnique(O.state.s.diaryRead, 2) }); }
      });
    }
  };

  S['E3.4-find'] = {
    render: function () {
      return ui.t6({
        n: 3, say: T.cave.remember,
        onTake: function () {
          var s = O.state.s;
          O.go('MAP', { fragments: addUnique(s.fragments, 3), zonesDone: addUnique(s.zonesDone, 'cave') }, { delay: 450 });
          ui.refreshTop({ bump: true });
        }
      });
    }
  };

  /* ================= Епізод 4 — Річка ================= */

  function sayOther() {
    return [T.river.sayOther, function () {
      O.state.log('sel4other', { from: O.currentScreen() });
      O.go('E4.1-choice', { compass: 'lost' });
    }];
  }

  S['E4.0-river'] = {
    render: function (ctx) {
      var R = T.river;
      var tm = timers();
      ctx.onExit(tm.clear);
      var stageM;
      var dots = h('div', { class: 'bubble dots', hidden: true }, R.dots);
      var root = ui.t1({
        bg: 'river', label: R.label, pose: 'back', above: dots, mironCls: 'big-tap',
        onMiron: function () { if (ui.locked) return; ui.lock(); O.go('E4.1-choice'); },
        mironRef: function (m) { stageM = m; }
      });
      tm.set(function () { ui.refreshTop({ compassFade: true }); }, 60);
      tm.set(function () { ui.refreshTop(); }, 1200);
      tm.set(function () { stageM.classList.add('breathe'); }, 3000);
      tm.set(function () { dots.hidden = false; }, 8000);
      tm.set(function () { stageM.classList.add('sob'); }, 16000);
      return root;
    }
  };

  S['E4.1-choice'] = {
    render: function (ctx) {
      var R = T.river;
      if (ctx.s.compass !== 'lost') O.state.save({ compass: 'lost' });
      var f = ui.frame({ bg: 'river', top: true });
      f.col.appendChild(label(R.label));
      f.col.appendChild(h('div', { class: 'stage' }, ui.mironEl('back')));
      var map = { accuse: 'E4.1A-reply', silent: 'E4.1B-walk', ask: 'E4.1C-reply' };
      var btns = shuffle(R.opts).map(function (o) {
        return ui.btn(o.t, function () {
          O.state.log('sel4try', { pick: o.id });
          O.go(map[o.id]);
        }, 'btn-paper');
      });
      f.col.appendChild(h('div', { class: 'sel-sheet' }, h('h2', { class: 'sel-q' }, R.q), btns));
      return f.root;
    }
  };

  /* Пошук компаса під каменями (гілки А і В) */
  function stoneSearch(ctx, o) {
    /* o: {tapsToFind, pointAt, next} */
    var R = T.river;
    var tm = timers();
    ctx.onExit(tm.clear);
    var f = ui.frame({ bg: 'river', top: true });
    var taps = 0, done = false;
    var grid = h('div', { class: 'stones' });
    for (var i = 0; i < 5; i++) {
      (function (i) {
        var st = h('button', { class: 'stone-btn' + (o.pointAt === i ? ' pointed' : ''), type: 'button', 'aria-label': 'Камінь' },
          h('span', { class: 'under' }), h('span', { class: 'stone-top', svg: A.stone() }));
        st.addEventListener('click', function () {
          if (done || st.classList.contains('lifted')) return;
          taps++;
          st.classList.add('lifted');
          if (taps >= o.tapsToFind) {
            done = true;
            st.querySelector('.under').innerHTML = A.icon('compass', 40);
            st.classList.add('found');
            O.state.log('compass', { taps: taps });
            if (quietBtn) quietBtn.disabled = true;
            tm.set(o.next, 1000);
          }
        });
        grid.appendChild(st);
      })(i);
    }
    f.col.append(label(R.label));
    if (o.pointAt == null) f.col.appendChild(ui.narr(R.searchAlone));
    f.col.appendChild(h('div', { class: 'task' }, grid));
    if (o.pointAt != null) f.col.appendChild(h('div', { class: 'say-row' }, h('div', { class: 'miron-wrap small', svg: A.miron('point') })));
    var q = sayOther();
    var quietBtn = ui.btn(q[0], q[1], 'btn-quiet');
    f.col.appendChild(h('div', { class: 'actions' }, quietBtn));
    return f.root;
  }

  S['E4.1A-reply'] = {
    render: function (ctx) {
      var tm = timers();
      ctx.onExit(tm.clear);
      var root = ui.t1({ bg: 'river', label: T.river.label, pose: 'sad', text: T.river.accuseReply, btn: T.next,
        onNext: function () {
          var m = root.querySelector('.miron-wrap');
          if (m) m.classList.add('walk-off');
          ui.lock(600);
          tm.set(function () { O.go('E4.1A-search'); }, 450);
        }, quiet: sayOther() });
      return root;
    }
  };
  S['E4.1A-search'] = { render: function (ctx) { return stoneSearch(ctx, { tapsToFind: 2, next: function () { O.go('E4.1A-back', { compass: 'has' }); } }); } };
  S['E4.1A-back'] = {
    render: function () {
      var root = ui.t1({ bg: 'river', label: T.river.label, pose: 'sad', mironCls: 'walk-in', btn: T.next,
        onNext: function () { O.go('E4.2-tide', { sel4: 'accuse' }); }, quiet: sayOther() });
      setTimeout(function () { ui.refreshTop({ compassBack: true }); }, 50);
      return root;
    }
  };
  S['E4.1B-walk'] = {
    render: function () {
      return ui.t1({ bg: 'river', label: T.river.label, pose: 'sad', narr: T.river.silentWalk, btn: T.next,
        onNext: function () { O.go('E4.2-tide', { sel4: 'silent' }); }, quiet: sayOther() });
    }
  };
  S['E4.1C-reply'] = {
    render: function () {
      return ui.t1({ bg: 'river', label: T.river.label, pose: 'sad', text: T.river.askReply, btn: T.next,
        onNext: function () { O.go('E4.1C-search'); }, quiet: sayOther() });
    }
  };
  S['E4.1C-search'] = { render: function (ctx) { return stoneSearch(ctx, { tapsToFind: 1, pointAt: 2, next: function () { O.go('E4.1C-thanks', { compass: 'has' }); } }); } };
  S['E4.1C-thanks'] = {
    render: function () {
      var root = ui.t1({ bg: 'river', label: T.river.label, pose: 'happy', text: T.river.thanks, btn: T.next,
        onNext: function () { O.go('E4.2-tide', { sel4: 'ask' }); }, quiet: sayOther() });
      setTimeout(function () { ui.refreshTop({ compassBack: true }); }, 50);
      return root;
    }
  };

  S['E4.2-tide'] = {
    render: function (ctx) {
      var R = T.river, s = ctx.s;
      var f = ui.frame({ bg: 'river', top: true, cls: 'dark-bg' });
      var hint = ui.hintStrip();
      var opts = h('div', { class: 'opts' });
      var sign = h('div', { class: 'tide-sign' },
        h('span', { class: 'tide-ic', svg: A.tideSign() }),
        h('p', null, R.sign));
      var ways = h('div', { class: 'ways' },
        h('div', { class: 'way' }, h('span', { class: 'way-name' }, R.ford), h('span', { class: 'way-n' }, R.fordBeats)),
        h('div', { class: 'way' }, h('span', { class: 'way-name' }, R.bridge), h('span', { class: 'way-n' }, R.bridgeBeats)));
      function pick(kind) {
        O.state.log('tide', { pick: kind });
        O.go(kind === 'ford' ? 'E4.3-ford' : 'E4.3-bridge', { river: kind });
      }
      var askBtn = ui.btn(R.tideAsk, function () {
        var sel = s.sel4 || 'ask';
        O.state.log('tide', { pick: 'askMiron' });
        hint.say(R.askMiron[sel], { pose: sel === 'accuse' ? 'back' : sel === 'silent' ? 'sad' : 'happy' });
        askBtn.remove();
      }, 'btn-opt');
      opts.append(ui.btn(R.tideYes, function () { pick('ford'); }, 'btn-opt'), ui.btn(R.tideNo, function () { pick('bridge'); }, 'btn-opt'), askBtn);
      f.col.append(h('div', { class: 'task' }, label(R.label), sign, ways, h('h2', { class: 'q' }, R.tideQ), opts), hint.el);
      return f.root;
    }
  };

  S['E4.3-ford'] = {
    render: function (ctx) {
      var R = T.river;
      var tm = timers();
      ctx.onExit(tm.clear);
      var f = ui.frame({ bg: 'river', top: true, cls: 'dark-bg' });
      var scene = h('div', { class: 'ford', svg:
        '<svg viewBox="0 0 300 300" aria-hidden="true">' +
        '<rect width="300" height="300" rx="20" fill="#2E7C86"/>' +
        '<rect y="0" width="300" height="44" fill="#7C8E86"/><rect y="256" width="300" height="44" fill="#7C8E86"/>' +
        '<g fill="#5F716A"><ellipse cx="150" cy="210" rx="22" ry="9"/><ellipse cx="140" cy="160" rx="22" ry="9"/><ellipse cx="156" cy="110" rx="22" ry="9"/><ellipse cx="146" cy="66" rx="22" ry="9"/></g>' +
        '<rect class="tide" x="0" y="44" width="300" height="212" fill="#7FC4CB" opacity=".55"/>' +
        '<g class="walkers"><circle cx="138" cy="0" r="12" fill="#FFC23D" stroke="#0C2328" stroke-width="3"/><circle cx="164" cy="8" r="10" fill="#F3C9A1" stroke="#0C2328" stroke-width="3"/></g>' +
        '</svg>' });
      var hint = ui.hintStrip();
      var acts = h('div', { class: 'actions' });
      f.col.append(h('div', { class: 'task' }, label(R.label), scene), hint.el, acts);
      tm.set(function () {
        hint.say(R.fordDone, { pose: 'surprised' });
        acts.replaceChildren(ui.btn(T.next, function () { O.go('E4.4-find'); }));
      }, 4300);
      return f.root;
    }
  };

  S['E4.3-bridge'] = {
    render: function () {
      return ui.t1({ bg: 'river', label: T.river.label, pose: 'happy', text: T.river.bridgeDone, btn: T.next, onNext: function () { O.go('E4.4-find'); } });
    }
  };

  S['E4.4-find'] = {
    render: function () {
      return ui.t6({
        n: 4,
        onTake: function () {
          var s = O.state.s;
          O.go(s.campOffered.indexOf('e4') >= 0 ? 'MAP' : 'MAP-camp',
            { fragments: addUnique(s.fragments, 4), zonesDone: addUnique(s.zonesDone, 'river') }, { delay: 450 });
          ui.refreshTop({ bump: true });
        }
      });
    }
  };

  /* ================= Епізод 5 — Дозорна скеля ================= */

  S['E5.0'] = {
    render: function (ctx) {
      var K = T.rock, opened = ctx.s.rockOpened || 0;
      var f = ui.frame({ bg: 'rock', top: true });
      var row = h('div', { class: 'rock-stones' });
      [0, 1, 2].forEach(function (i) {
        var cls = 'rstone' + (i < opened ? ' moved' : i === opened ? ' glow' : ' idle');
        var b = h('button', { class: cls, type: 'button', 'aria-label': 'Камінь ' + (i + 1) },
          h('span', { class: 'note-ic', svg: A.icon('book', 28) }), h('span', { class: 'stone-top', svg: A.stone('rock') }));
        b.addEventListener('click', function () {
          if (i !== opened || ui.locked) return;
          ui.lock(700);
          b.classList.add('moving');
          O.state.log('stone', { n: i + 1 });
          setTimeout(function () { O.go('E5.' + (i + 1)); }, 450);
        });
        row.appendChild(b);
      });
      var acts = h('div', { class: 'actions' });
      if (opened >= 3) acts.appendChild(ui.btn(T.next, function () { O.go('E5.4'); }));
      f.col.append(label(K.label), ui.narr(K.scene), h('div', { class: 'stage rock-stage' }, row), acts);
      return f.root;
    }
  };

  T.rock.notes.forEach(function (N, i) {
    S['E5.' + (i + 1)] = {
      render: function (ctx) {
        return readingTask(ctx, {
          bg: 'rock', labelText: T.rock.label, n: N.n, key: N.key, q: N.q, options: N.opts, hint1: T.rock.hint1, step: '5.' + (i + 1),
          next: function () {
            var s = O.state.s;
            O.go('E5.0', { rockOpened: Math.max(s.rockOpened || 0, i + 1), diaryRead: addUnique(s.diaryRead, N.n) });
          }
        });
      }
    };
  });

  S['E5.4'] = {
    render: function () {
      return ui.t1({ bg: 'rock', label: T.rock.label, pose: 'sad', text: T.rock.after, btn: T.next, onNext: function () { O.go('E5.5-find'); } });
    }
  };

  S['E5.5-find'] = {
    render: function () {
      return ui.t6({
        n: 5,
        onTake: function () {
          var s = O.state.s;
          O.go('MAP', { fragments: addUnique(s.fragments, 5), zonesDone: addUnique(s.zonesDone, 'rock') }, { delay: 450 });
          ui.refreshTop({ bump: true });
        }
      });
    }
  };
})(window.OSTRIV);

/* ================= Третя здача: епізоди 6–8 ================= */
(function (O) {
  var ui = O.ui, h = ui.h, A = O.art, T = O.text, S = O.screens;

  function addUnique(arr, v) { return arr.indexOf(v) >= 0 ? arr.slice() : arr.concat([v]); }
  function label(t) { return h('div', { class: 'zone-label' }, t); }
  function timers() {
    var list = [];
    return {
      set: function (fn, ms) { var id = setTimeout(fn, ms); list.push(id); return id; },
      clear: function () { list.forEach(clearTimeout); list = []; }
    };
  }

  /* ================= Епізод 6 — Табір дідуся ================= */
  var C6 = T.camp6;

  S['E6.0'] = {
    render: function () {
      var f = ui.frame({ bg: 'camp', top: true });
      var box = h('button', { class: 'crate', type: 'button', 'aria-label': C6.openBox, svg: A.crate(false) });
      var opened = false;
      function open() {
        if (opened) return;
        opened = true;
        box.innerHTML = A.crate(true);
        box.classList.add('opened');
        var s = O.state.s;
        var db = 6 - s.supplies.bread, dw = 4 - s.supplies.water;
        var next = s.sel4 === 'silent' && s.compass === 'lost' ? 'E6.0B-compass' : 'E6.0C-say';
        O.go(next, { supplies: { bread: 6, water: 4 } }, { delay: 1300 });
        ui.refreshTop({ delta: { bread: db, water: dw } });
        O.state.log('cans');
      }
      box.addEventListener('click', open);
      f.col.append(label(C6.label), ui.narr(C6.scene),
        h('div', { class: 'stage' }, h('div', { class: 'crate-wrap' }, box), ui.bubble(C6.box), ui.mironEl('point')),
        h('div', { class: 'actions' }, ui.btn(C6.openBox, open)));
      return f.root;
    }
  };

  S['E6.0B-compass'] = {
    render: function () {
      var held = h('div', { class: 'held-compass', svg: A.icon('compass', 44) });
      return ui.t1({ bg: 'camp', label: C6.label, pose: 'sad', above: held, text: C6.compass, btn: T.next,
        onNext: function () { O.compassJustBack = true; O.go('E6.0C-say', { compass: 'returned' }); } });
    }
  };

  S['E6.0C-say'] = {
    render: function () {
      var step = 0;
      var root = ui.t1({ bg: 'camp', label: C6.label, pose: 'happy', text: C6.cans, btn: T.next,
        onNext: function () {
          if (step === 0) {
            step = 1;
            root.querySelector('.bubble').textContent = C6.sign;
            return;
          }
          O.go('E6.1-signal');
        } });
      if (O.compassJustBack) { O.compassJustBack = false; setTimeout(function () { ui.refreshTop({ compassBack: true }); }, 50); }
      return root;
    }
  };

  /* Результат за пріоритетом: дим → прапор → зайчик → вогонь → каструля → нічого */
  function signalResult(sel) {
    var has = function (x) { return sel.indexOf(x) >= 0; };
    if (has('branches') && has('matches') && has('leaves')) return 'smoke';
    if (has('shirt') && has('rope')) return 'flag';
    if (has('mirror')) return 'mirror';
    if (has('branches') && has('matches')) return 'fire';
    if (has('pot')) return 'pot';
    return 'nothing';
  }
  O.signalResult = signalResult;

  S['E6.1-signal'] = {
    render: function (ctx) {
      var s = ctx.s;
      var P = s.partial && 'fails' in s.partial ? s.partial : { fails: 0, result: null };
      var hands = [];
      var busy = false;
      var tm = timers();
      ctx.onExit(tm.clear);
      var f = ui.frame({ bg: 'camp', top: true, cls: 'dark-bg' });
      var grid = h('div', { class: 'items' });
      var handsEl = h('div', { class: 'hands' });
      var result = h('div', { class: 'sig-result', hidden: true });
      var hint = ui.hintStrip();
      var acts = h('div', { class: 'actions' });
      var tryBtn = ui.btn(C6.tryBtn, attempt);
      f.col.append(h('div', { class: 'task' }, label(C6.label), grid, result, handsEl), hint.el, acts);
      function persist() { O.state.setPartial(P); }

      function draw() {
        grid.replaceChildren();
        C6.items.forEach(function (it) {
          var inHands = hands.indexOf(it.id) >= 0;
          var b = h('button', { class: 'item' + (inHands ? ' taken' : '') + (P.fails >= 4 && it.id === 'mirror' && !inHands ? ' hl' : ''), type: 'button', 'aria-label': it.aria, svg: inHands ? '' : A.item(it.id, 44) });
          b.addEventListener('click', function () { take(it.id); });
          grid.appendChild(b);
        });
        handsEl.replaceChildren();
        for (var i = 0; i < 3; i++) {
          (function (id) {
            var slot = h('button', { class: 'hand' + (id ? ' full' : ''), type: 'button', 'aria-label': id ? 'Повернути' : 'Порожньо', svg: id ? A.item(id, 40) : '' });
            if (id) slot.addEventListener('click', function () { give(id); });
            handsEl.appendChild(slot);
          })(hands[i]);
        }
        tryBtn.disabled = hands.length < 2;
      }
      function take(id) {
        if (busy || P.result) return;
        if (hands.indexOf(id) >= 0) { give(id); return; }
        if (hands.length >= 3) { ui.shake(handsEl); return; }
        hands.push(id); draw();
      }
      function give(id) {
        if (busy || P.result) return;
        hands.splice(hands.indexOf(id), 1); draw();
      }
      function showResult(kind) {
        result.hidden = false;
        result.innerHTML = A.signalArt(kind);
        grid.hidden = true; handsEl.hidden = true;
      }
      function hideResult() { result.hidden = true; grid.hidden = false; handsEl.hidden = false; }
      function attempt() {
        if (busy || hands.length < 2) return;
        var kind = signalResult(hands);
        O.state.log('signalTry', { items: hands.join('+'), result: kind });
        busy = true;
        showResult(kind);
        hint.say(C6.results[kind], { pose: kind === 'pot' ? 'surprised' : kind === 'nothing' ? 'sad' : 'surprised' });
        if (kind === 'smoke' || kind === 'flag' || kind === 'mirror') {
          P.result = kind; persist();
          O.state.save({ signal: kind });
          success();
        } else if (kind === 'fire') {
          acts.replaceChildren(
            ui.btn(C6.keep, function () { P.result = 'fire'; persist(); O.state.save({ signal: 'fire' }); O.go('E6.2-why'); }),
            ui.btn(C6.other, function () { busy = false; hands = []; hideResult(); hint.hide(); acts.replaceChildren(tryBtn); draw(); }, 'btn-outline'));
        } else {
          P.fails++; persist();
          acts.replaceChildren();
          tm.set(function () {
            hands = []; hideResult(); busy = false;
            acts.replaceChildren(tryBtn);
            draw();
            if (P.fails >= 4) hint.say(C6.hint4, { pose: 'point' });
            else if (P.fails >= 2) hint.say(C6.hint2);
          }, 2600);
        }
      }
      function success() {
        acts.replaceChildren(ui.btn(T.next, function () { O.go('E6.2-why'); }));
      }
      acts.appendChild(tryBtn);
      draw();
      if (P.result) {
        showResult(P.result);
        hint.say(C6.results[P.result], { pose: 'surprised' });
        busy = true;
        success();
      } else if (P.fails >= 4) hint.say(C6.hint4, { pose: 'point' });
      else if (P.fails >= 2) hint.say(C6.hint2);
      else hint.say(C6.pick, { pose: 'point' });
      return f.root;
    }
  };

  S['E6.2-why'] = {
    render: function (ctx) {
      var kind = ctx.s.signal || 'smoke';
      var f = ui.frame({ bg: 'camp', top: true, cls: 'dark-bg' });
      var opts = h('div', { class: 'opts' });
      var hint = ui.hintStrip();
      var acts = h('div', { class: 'actions' });
      f.col.append(h('div', { class: 'task' }, label(C6.label), h('div', { class: 'sig-result small', svg: A.signalArt(kind) }), h('h2', { class: 'q' }, C6.whyQ), opts), hint.el, acts);
      O.choiceTask({
        step: '6.2', host: opts, hint: hint, acts: acts, options: C6.why[kind],
        hint1: C6.whyHint, hint2: C6.whyHint,
        next: function () { O.go('E6.3-tent'); }
      });
      return f.root;
    }
  };

  S['E6.3-tent'] = {
    render: function (ctx) {
      var photo = h('figure', { class: 'photo' },
        h('div', { class: 'photo-img', svg: A.captainPhoto() }),
        h('figcaption', { class: 'photo-cap' }, C6.photoCaption(ctx.s.name)));
      return ui.t1({ bg: 'camp', label: C6.label, pose: 'surprised', above: photo, text: C6.photo, btn: T.next, onNext: function () { O.go('E6.4-find'); } });
    }
  };

  S['E6.4-find'] = {
    render: function () {
      return ui.t6({
        n: 6,
        onTake: function () {
          var s = O.state.s;
          O.go('MAP', { fragments: addUnique(s.fragments, 6), zonesDone: addUnique(s.zonesDone, 'camp') }, { delay: 450 });
          ui.refreshTop({ bump: true });
        }
      });
    }
  };

  /* ================= Епізод 7 — Паща дракона ================= */
  var M = T.maw;

  S['E7.0'] = {
    render: function () {
      return ui.t1({ bg: 'maw', label: M.label, pose: 'surprised', text: M.intro, btn: T.next, onNext: function () { O.go('E7.1-puzzle'); } });
    }
  };

  S['E7.1-puzzle'] = {
    render: function (ctx) {
      var s = ctx.s;
      var P = s.partial && s.partial.placed ? s.partial : { placed: [] };
      var sel = null, busy = false;
      var order = [3, 6, 1, 5, 2, 4]; /* порядок у лотку не збігається з порядком на острові */
      var f = ui.frame({ bg: 'maw', top: true, cls: 'dark-bg' });
      var board = h('div', { class: 'pz-board' });
      var tray = h('div', { class: 'pz-tray' });
      var hint = ui.hintStrip();
      var acts = h('div', { class: 'actions' });
      f.col.append(h('div', { class: 'task' }, label(M.label), board, tray), hint.el, acts);
      function persist() { O.state.setPartial(P); }
      function done() { return P.placed.length === 6; }
      function draw(pathNow) {
        board.innerHTML = A.puzzleMap(P.placed, pathNow || done());
        board.classList.toggle('target', sel != null);
        tray.replaceChildren();
        order.forEach(function (n) {
          if (P.placed.indexOf(n) >= 0) { tray.appendChild(h('span', { class: 'pz-slot' })); return; }
          var b = h('button', { class: 'pz-piece' + (sel === n ? ' lifted' : ''), type: 'button', 'aria-label': 'Фрагмент ' + T.fragments[n].name, svg: A.piece(n, 56) });
          b.addEventListener('click', function () { if (busy || done()) return; sel = sel === n ? null : n; draw(); });
          tray.appendChild(b);
        });
        tray.hidden = done();
      }
      board.addEventListener('click', function (e) {
        var g = e.target.closest('[data-socket]');
        if (!g || sel == null || busy) return;
        var n = Number(g.getAttribute('data-socket'));
        if (P.placed.indexOf(n) >= 0) return;
        if (n !== sel) {
          /* Інша форма: фрагмент просто повертається. Без реплік і лічильника. */
          var piece = tray.querySelector('.pz-piece.lifted');
          sel = null;
          if (piece) { piece.classList.remove('lifted'); ui.shake(piece); }
          board.classList.remove('target');
          return;
        }
        P.placed.push(n); sel = null; persist();
        O.state.log('piece', { n: n });
        hint.hide();
        draw();
        if (done()) finish();
      });
      function finish() {
        O.state.log('solve', { step: '7.1' });
        hint.say(M.puzzleDone, { pose: 'surprised' });
        acts.replaceChildren(ui.btn(T.next, function () { O.go('E7.2-door'); }));
      }
      draw();
      if (done()) finish();
      else if (!P.placed.length) hint.say(M.puzzleTap, { pose: 'point' });
      return f.root;
    }
  };

  S['E7.2-door'] = {
    render: function (ctx) {
      var s = ctx.s;
      var P = s.partial && s.partial.open ? s.partial : { open: [false, false, false], lvl: [0, 0, 0], shown: [false, false, false] };
      var active = P.open.indexOf(false);
      if (active < 0) active = 0;
      var busy = false, shownVal = [null, null, null];
      var tm = timers();
      ctx.onExit(tm.clear);
      var f = ui.frame({ bg: 'maw', top: true, cls: 'dark-bg' });
      var cellsEl = h('div', { class: 'door-cells' });
      var door = h('div', { class: 'door' }, h('div', { class: 'door-text' }, M.doorText), cellsEl);
      var aid = h('div', { class: 'door-aid', hidden: true });
      var keys = h('div', { class: 'door-keys' });
      var hint = ui.hintStrip();
      var acts = h('div', { class: 'actions' });
      f.col.append(h('div', { class: 'task' }, label(M.label), door, aid, keys), hint.el, acts);
      function persist() { O.state.setPartial(P); }
      function allOpen() { return P.open.every(Boolean); }
      function valueArt(i, v) {
        if (v == null) return '';
        if (i === 0) return arrowSvg(v, 34);
        if (i === 1) return A.sym(v, 34, 2.4);
        return '<span class="door-num">' + v + '</span>';
      }
      function arrowSvg(dir, size) {
        var rot = { left: 180, up: -90, right: 0, down: 90 }[dir];
        return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g transform="rotate(' + rot + ' 12 12)"><path d="M4 12h16M14 6l6 6-6 6"/></g></svg>';
      }
      function drawCells() {
        cellsEl.replaceChildren();
        M.cells.forEach(function (name, i) {
          var v = P.open[i] ? M.answers[i] : shownVal[i];
          var c = h('button', { class: 'door-cell' + (P.open[i] ? ' open' : '') + (i === active && !P.open[i] ? ' active' : '') + (shownVal[i] != null ? ' wrong' : ''), type: 'button', 'aria-label': name },
            i === 0 ? h('span', { class: 'cell-turtle', svg: A.animal('turtle') }) : null,
            h('span', { class: 'cell-val', svg: valueArt(i, v) }),
            h('span', { class: 'cell-name' }, name));
          c.addEventListener('click', function () {
            if (busy || P.open[i] || allOpen()) return;
            active = i; drawAll();
          });
          cellsEl.appendChild(c);
        });
      }
      function drawKeys() {
        keys.replaceChildren();
        if (allOpen()) { keys.hidden = true; return; }
        keys.hidden = false;
        var list;
        if (active === 0) { keys.className = 'door-keys k4'; list = M.arrows.map(function (a) { return { v: a.id, art: arrowSvg(a.id, 32), aria: a.aria }; }); }
        else if (active === 1) { keys.className = 'door-keys k6'; list = ['wave', 'eye', 'arrow', 'star', 'circle', 'zigzag'].map(function (n) { return { v: n, art: A.sym(n, 32, 2.4), aria: n }; }); }
        else { keys.className = 'door-keys k9'; list = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return { v: n, art: '<span class="door-num">' + n + '</span>', aria: String(n) }; }); }
        list.forEach(function (k) {
          var b = h('button', { class: 'door-key', type: 'button', 'aria-label': k.aria, svg: k.art });
          b.addEventListener('click', function () { press(k.v); });
          keys.appendChild(b);
        });
      }
      function drawAid() {
        var l = P.lvl[active];
        if (P.open[active] || l < 2) { aid.hidden = true; return; }
        aid.hidden = false;
        if (active === 0) aid.innerHTML = '<div class="aid-img">' + A.bayMini() + '</div>';
        else if (active === 1) {
          var row = '';
          s.fragments.slice().sort().forEach(function (n) {
            row += '<span class="aid-frag' + (n === 5 ? ' blink' : '') + '">' + A.sym(T.fragments[n].sym, 26) + '</span>';
          });
          aid.innerHTML = '<div class="aid-frags">' + row + '</div>';
        } else {
          aid.innerHTML = '<div class="aid-row"><div class="aid-sign"><span class="tide-ic">' + A.tideSign() + '</span><span>' + T.river.sign + '</span></div>' +
            '<span class="aid-four">' + A.fragmentPiece('four', 84) + '</span></div>';
        }
      }
      function sayHint() {
        var l = P.lvl[active];
        if (P.open[active] || allOpen()) return;
        if (l <= 0) { hint.hide(); return; }
        if (l === 1) hint.say(M.hints[active][0]);
        else hint.say(M.hints[active][1], { pose: 'point', show: l >= 3 ? doShow : null });
      }
      function drawAll() { drawCells(); drawKeys(); drawAid(); sayHint(); }
      function press(v) {
        if (busy || P.open[active]) return;
        var i = active;
        if (v === M.answers[i]) {
          P.open[i] = true; persist();
          O.state.log('solve', { step: '7.2-' + (i + 1), level: P.lvl[i] });
          hint.say(T.surprise(P.lvl[i] > 0), { pose: 'surprised' });
          afterOpen();
          return;
        }
        busy = true;
        shownVal[i] = v;
        P.lvl[i] = Math.min(3, P.lvl[i] + 1); persist();
        O.state.log('miss', { step: '7.2-' + (i + 1), level: P.lvl[i], picked: String(v) });
        drawCells();
        var cell = cellsEl.children[i];
        ui.shake(cell);
        tm.set(function () { shownVal[i] = null; busy = false; drawAll(); }, 1000);
      }
      function doShow() {
        if (busy || P.open[active]) return;
        var i = active;
        O.state.log('show', { step: '7.2-' + (i + 1) });
        P.open[i] = true; P.shown[i] = true; persist();
        hint.say(M.hints[i][2]);
        afterOpen();
      }
      function afterOpen() {
        if (allOpen()) {
          aid.hidden = true;
          drawCells(); drawKeys();
          door.classList.add('opening');
          acts.replaceChildren(ui.btn(T.next, function () { O.go('E7.3a'); }));
          if (!P.shown.some(Boolean)) hint.say(M.doorOpen, { pose: 'surprised' });
          return;
        }
        var next = P.open.indexOf(false);
        active = next;
        drawCells(); drawKeys(); drawAid();
        /* Репліку успіху лишаємо видимою; підказку нової комірки покажемо, коли дитина помилиться */
      }
      if (allOpen()) { drawCells(); keys.hidden = true; door.classList.add('opening'); hint.say(M.doorOpen, { pose: 'surprised' }); acts.replaceChildren(ui.btn(T.next, function () { O.go('E7.3a'); })); }
      else {
        drawAll();
        if (!P.open.some(Boolean) && P.lvl.every(function (x) { return !x; })) hint.say(M.doorIntro, { pose: 'point' });
      }
      return f.root;
    }
  };

  /* 7.3 — три екрани без верхньої панелі */
  S['E7.3a'] = {
    render: function () {
      var scene = h('div', { class: 'dragon-scene', svg: A.dragon() });
      return ui.t1({ bg: 'maw', top: false, pose: 'surprised', mironCls: 'hop-back', above: scene, narr: M.dragonA, noBubble: true, btn: T.next, onNext: function () { O.go('E7.3b'); } });
    }
  };
  S['E7.3b'] = {
    render: function () {
      var scene = h('div', { class: 'dragon-scene calm', svg: A.dragon() });
      return ui.t1({ bg: 'maw', top: false, pose: null, above: scene, narr: M.dragonB, btn: T.next, onNext: function () { O.go('E7.3c'); } });
    }
  };
  S['E7.3c'] = {
    render: function () {
      var note = h('article', { class: 'diary-page note' },
        M.note.map(function (t) { return h('p', { class: 'diary-line' }, t); }),
        h('p', { class: 'diary-sign' }, T.diarySign));
      return ui.t1({ bg: 'maw', top: false, pose: null, above: h('div', { class: 'diary-wrap' }, note), btn: T.next, onNext: function () { O.go('E7.4-diary'); } });
    }
  };

  S['E7.4-diary'] = {
    render: function (ctx) {
      var f = ui.frame({ bg: 'maw', top: true, cls: 'dark-bg' });
      var line = h('p', { class: 'kid-line' });
      var page = h('article', { class: 'diary-page kid' }, h('h2', { class: 'diary-head' }, M.diaryHead), line);
      var opts = h('div', { class: 'opts' });
      var picked = false;
      M.diaryOpts.forEach(function (o) {
        opts.appendChild(ui.btn(o.t, function () {
          if (picked) return;
          picked = true;
          line.textContent = o.t + '.';
          line.classList.add('writing');
          opts.classList.add('off');
          O.state.log('diaryPick', { pick: o.id });
          O.go('E8.0-log', { diaryPick: o.id, finished: true }, { delay: 1900 });
        }, 'btn-paper'));
      });
      f.col.append(h('div', { class: 'task' }, label(M.label), page, h('h2', { class: 'q' }, M.diaryQ), opts));
      return f.root;
    }
  };

  /* ================= Епізод 8 — Повернення ================= */
  var F8 = T.finale;

  S['E8.0-log'] = {
    render: function (ctx) {
      var tm = timers();
      ctx.onExit(tm.clear);
      if (!ctx.s.finished) O.state.save({ finished: true });
      var f = ui.frame({ bg: 'sea', top: false });
      var lines = F8.log(ctx.s.name);
      var list = h('div', { class: 'shiplog-lines' });
      var badgeEl = h('div', { class: 'badge', hidden: true }, h('span', { class: 'badge-img', svg: A.badge() }), h('span', { class: 'badge-cap' }, F8.badge));
      var book = h('article', { class: 'shiplog' }, h('h1', { class: 'shiplog-title' }, F8.logTitle), list, badgeEl);
      var acts = h('div', { class: 'actions' });
      f.col.append(h('div', { class: 'diary-wrap' }, book), acts);
      var shown = 0;
      function addLine() {
        if (shown >= lines.length) return;
        list.appendChild(h('p', { class: 'shiplog-line' }, lines[shown]));
        shown++;
        if (shown === lines.length) end();
      }
      var ended = false;
      function end() {
        if (ended) return;
        ended = true;
        tm.set(function () {
          badgeEl.hidden = false;
          acts.replaceChildren(ui.btn(T.next, function () { O.go('E8.1-miron'); }));
        }, 600);
      }
      function skip() {
        tm.clear();
        while (shown < lines.length) addLine();
        if (badgeEl.hidden) { badgeEl.hidden = false; acts.replaceChildren(ui.btn(T.next, function () { O.go('E8.1-miron'); })); }
      }
      book.addEventListener('click', skip);
      for (var i = 0; i < lines.length; i++) tm.set(addLine, 400 + i * 800);
      return f.root;
    }
  };

  S['E8.1-miron'] = {
    render: function () {
      return ui.t1({ bg: 'deck', top: false, pose: 'happy', text: F8.miron, btn: F8.toShip, onNext: function () { O.go('E8.2-final-map'); } });
    }
  };

  S['E8.2-final-map'] = {
    render: function (ctx) {
      var f = ui.frame({ top: false, cls: 'map-screen final-map' });
      var zones = Object.keys(A.ZONES);
      var area = h('div', { class: 'map-area' });
      var nameChip = h('div', { class: 'zone-chip', hidden: true });
      var sheet = h('div', { class: 'final-sheet' }, nameChip,
        ui.btn(T.resume.reset, function () {
          ui.confirmReset(function () {
            O.state.log('reset');
            O.state.reset();
            O.show('E0.0-title');
          });
        }, 'btn-quiet'));
      f.col.append(area, sheet);
      area.innerHTML = A.islandMap({ revealed: zones, done: zones, uid: 'final', noFog: true, next: true });
      area.addEventListener('click', function (e) {
        var nx = e.target.closest('[data-next]');
        if (nx) {
          var n = (O.state.s.tappedNextIsland || 0) + 1;
          O.state.save({ tappedNextIsland: n });
          O.state.log('nextIsland', { n: n });
          var w = nx.querySelector('.next-wobble');
          w.classList.remove('wobble'); void w.getBoundingClientRect(); w.classList.add('wobble');
          return;
        }
        var z = e.target.closest('[data-zone]');
        if (z) {
          nameChip.hidden = false;
          nameChip.textContent = T.map.zones[z.getAttribute('data-zone')].name;
        }
      });
      return f.root;
    }
  };
})(window.OSTRIV);
