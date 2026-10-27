/* Інструменти для дорослого: журнал тестування (?log) і перехід на будь-який екран (?debug).
   Дитина їх не бачить: відкриваються лише з адреси або довгим натиском (3 с) у правому верхньому куті. */
(function (O) {
  var ui = O.ui, h = ui.h, T = O.text, S = O.screens;

  /* ---------- Розбір журналу ---------- */
  var ITEM_NAMES = { mirror: 'дзеркальце', branches: 'гілки', matches: 'сірники', leaves: 'мокре листя', shirt: 'сорочка', rope: 'мотузка', pot: 'каструля' };
  var RESULT_NAMES = { smoke: 'дим', flag: 'прапор', mirror: 'зайчик', fire: 'вогонь', pot: 'каструля (весела невдача)', nothing: 'нічого' };
  var EP = [
    [/^E0\./, '0 Корабель'], [/^E1\./, '1 Бухта'], [/^E2a\./, '2a Болото'], [/^E2b\./, '2b Ліс'],
    [/^E3\./, '3 Печера'], [/^E4\./, '4 Річка'], [/^E5\./, '5 Скеля'], [/^E6\./, '6 Табір'],
    [/^E7\./, '7 Паща'], [/^E8\./, '8 Повернення'], [/^(MAP|CAMP)/, 'Карта і привали']
  ];
  function episodeOf(screen) {
    for (var i = 0; i < EP.length; i++) if (EP[i][0].test(screen || '')) return EP[i][1];
    return null;
  }
  function mmss(ms) {
    var sec = Math.round(ms / 1000), m = Math.floor(sec / 60);
    return m + ':' + ('0' + (sec % 60)).slice(-2);
  }
  function when(t) {
    var d = new Date(t);
    var p = function (n) { return ('0' + n).slice(-2); };
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  var BREAK = 10 * 60 * 1000;

  function analyse(s) {
    var log = (s.log || []).slice().sort(function (a, b) { return a.t - b.t; });
    var R = { time: {}, order: [], steps: {}, stepOrder: [], diary: [], sel: [], selOther: 0, tide: [], sessions: [], camps: [], signals: [], misc: [], total: 0, next: [] };
    function step(id) {
      if (!R.steps[id]) { R.steps[id] = { miss: 0, max: 0, show: false, solved: null }; R.stepOrder.push(id); }
      return R.steps[id];
    }
    for (var i = 0; i < log.length; i++) {
      var e = log[i], nx = log[i + 1];
      if (nx) {
        var d = nx.t - e.t;
        var ep = episodeOf(e.screen);
        if (d > 0 && d < BREAK && ep) {
          if (!(ep in R.time)) { R.time[ep] = 0; R.order.push(ep); }
          R.time[ep] += d; R.total += d;
        }
      }
      switch (e.type) {
        case 'miss': var st = step(e.step); st.miss++; st.max = Math.max(st.max, e.level || 0); break;
        case 'show': step(e.step).show = true; break;
        case 'solve': var so = step(e.step); if (so.solved == null) so.solved = e.level || 0; break;
        case 'diary': R.diary.push(e); break;
        case 'sel4try': R.sel.push(e.pick); break;
        case 'sel4other': R.selOther++; break;
        case 'tide': R.tide.push(e.pick); break;
        case 'open': R.sessions.push(e); break;
        case 'camp': R.camps.push(e); break;
        case 'signalTry': R.signals.push(e.items.split('+').map(function (x) { return ITEM_NAMES[x] || x; }).join(' + ') + ' → ' + (RESULT_NAMES[e.result] || e.result)); break;
        case 'nextIsland': R.next.push(e); break;
        case 'route': R.misc.push('Маршрут (' + (e.zone === 'swamp' ? 'болото' : 'ліс') + '): ' + e.steps + ' кроків' + (e.zone === 'swamp' ? (e.kupina ? ', через купину' : ', без купини') : '')); break;
        case 'round': R.misc.push('Печера 3.1, раунд ' + e.round + ': ' + (e.clean ? 'без помилок' : 'з помилками або [Покажи]')); break;
        case 'gonogo': R.misc.push('Печера 3.2' + (e.fast ? ' (швидкий)' : '') + ': тапів на червоний ' + e.redTaps + ', пропущено синіх ' + e.missed); break;
        case 'reset': R.misc.push(when(e.t) + ' — почато нову експедицію'); break;
      }
    }
    /* Повернення після привалу: наступне відкриття гри після вибору «Заночувати» */
    R.camps.forEach(function (c) {
      if (!c.stay) return;
      var back = R.sessions.filter(function (o) { return o.t > c.t; })[0];
      c.back = back ? back.gapMin : null;
    });
    return R;
  }

  var STEP_NAMES = {
    '1.1': '1.1 Сортування слідів', '1.2': '1.2 Великі сліди',
    'E2a.1': '2a.1 Запаси (болото)', 'E2a.2': '2a.2 Маршрут (болото)',
    'E2b.1': '2b.1 Запаси (ліс)', 'E2b.2': '2b.2 Маршрут (ліс)',
    '3.1-r1': '3.1 Пам\u2019ять, раунд 1', '3.1-r2': '3.1 Пам\u2019ять, раунд 2', '3.1-r3': '3.1 Пам\u2019ять, раунд 3',
    '3.3': '3.3 Запис 2', '5.1': '5.1 Запис 3', '5.2': '5.2 Запис 4', '5.3': '5.3 Запис 5',
    '6.2': '6.2 Чому спрацює', '7.1': '7.1 Пазл',
    '7.2-1': '7.2 Двері: напрям', '7.2-2': '7.2 Двері: знак', '7.2-3': '7.2 Двері: число'
  };
  var SEL_NAMES = { accuse: 'звинуватити', silent: 'промовчати', ask: 'спитати' };
  var TIDE_NAMES = { ford: 'бродом', bridge: 'в обхід', askMiron: 'спитати Мирона' };
  var SIG_NAMES = { smoke: 'дим', mirror: 'зайчик', flag: 'прапор', fire: 'вогонь' };

  function sections(s) {
    var R = analyse(s);
    var out = [];
    var crit = (s.tappedNextIsland || 0) >= 2;
    out.push({ title: 'Головне', rows: [
      ['Капітан', s.name || '—'],
      ['Експедицію завершено', s.finished ? 'так' : 'ні, зараз: ' + (s.screen || '—')],
      ['Тапів на «Наступна експедиція»', String(s.tappedNextIsland || 0) + (crit ? ' — критерій MVP пройдено' : ' — критерій MVP ще ні (треба 2+)')],
      ['Чистий час гри', mmss(R.total)]
    ] });
    out.push({ title: 'Час на епізодах', head: ['Епізод', 'хв:с'], rows: R.order.map(function (k) { return [k, mmss(R.time[k])]; }) });
    out.push({ title: 'Підказки по кроках', head: ['Крок', 'Помилок', 'Макс. підказка', '[Покажи]'],
      rows: R.stepOrder.map(function (k) { var x = R.steps[k]; return [STEP_NAMES[k] || k, String(x.miss), x.max ? String(x.max) : '—', x.show ? 'так' : '—']; }) });
    var selRows = [];
    selRows.push(['Спробувані варіанти 4.1', R.sel.length ? R.sel.map(function (p) { return SEL_NAMES[p] || p; }).join(' → ') : '—']);
    selRows.push(['«Сказати інакше»', String(R.selOther)]);
    selRows.push(['Остаточний вибір', s.sel4 ? SEL_NAMES[s.sel4] : '—']);
    selRows.push(['Приплив 4.2', R.tide.length ? R.tide.map(function (p) { return TIDE_NAMES[p] || p; }).join(' → ') : '—']);
    out.push({ title: 'Вибір біля річки (SEL)', rows: selRows });
    out.push({ title: 'Щоденник', head: ['Запис', 'Секунд', ''],
      rows: R.diary.map(function (d) { return ['Запис ' + d.n, String(d.sec), d.skimmed ? 'не читав' : '']; }) });
    var choice = [];
    choice.push(['Розвилка 1', s.fork1 === 'left' ? 'спершу болото' : s.fork1 === 'right' ? 'спершу ліс' : '—']);
    choice.push(['Сигнал', s.signal ? SIG_NAMES[s.signal] : '—']);
    if (R.signals.length) choice.push(['Спроби сигналу', R.signals.join('; ')]);
    choice.push(['Запис про дракона', s.diaryPick ? T.maw.diaryOpts.filter(function (o) { return o.id === s.diaryPick; })[0].t : '—']);
    R.misc.forEach(function (m) { choice.push(['', m]); });
    out.push({ title: 'Вибори і задачі', rows: choice });
    var ev = R.sessions.map(function (o) { return { t: o.t, text: 'відкрито гру' + (o.gapMin != null ? ', перерва ' + o.gapMin + ' хв' : '') }; })
      .concat(R.camps.map(function (c) {
        return { t: c.t, text: (c.stay ? 'Заночувати' : 'Йдемо далі') + ' (' + (c.point === 'e2' ? 'після еп. 2' : 'після еп. 4') + ')' + (c.stay && c.back != null ? ', ' + T.g('повернувся', 'повернулась') + ' через ' + c.back + ' хв' : '') };
      }))
      .concat(R.next.map(function (n) { return { t: n.t, text: 'тап на «Наступна експедиція» (#' + n.n + ')' }; }))
      .sort(function (a, b) { return a.t - b.t; });
    out.push({ title: 'Сесії, привали і туманний острів', head: ['Коли', 'Подія'], rows: ev.map(function (x) { return [when(x.t), x.text]; }) });
    return out;
  }

  function asText(secs) {
    var lines = ['Острів Дракона — журнал тестування', ''];
    secs.forEach(function (sec) {
      lines.push('## ' + sec.title);
      if (sec.head) lines.push(sec.head.join(' | '));
      if (!sec.rows.length) lines.push('—');
      sec.rows.forEach(function (r) { lines.push(r.filter(function (x) { return x !== ''; }).join(' | ')); });
      lines.push('');
    });
    return lines.join('\n');
  }

  function backToGame() {
    var s = O.state.s;
    if (s.finished) O.show('R-finished');
    else if (s.screen) O.resume();
    else O.show('E0.0-title');
  }

  S['LOG'] = {
    nosave: true,
    render: function (ctx) {
      var L = T.logScreen;
      var root = h('section', { class: 'screen tool-screen' });
      var col = h('div', { class: 'tool-col' });
      root.appendChild(col);
      var secs = sections(ctx.s);
      var text = asText(secs);
      var status = h('p', { class: 'tool-status', role: 'status' });
      var area = h('textarea', { id: 'log-text', class: 'tool-text', readonly: true, hidden: true });
      area.value = text;
      var copy = ui.btn(L.copy, function () {
        function fallback() { area.hidden = false; area.focus(); area.select(); status.textContent = L.copyFail; }
        try {
          navigator.clipboard.writeText(text).then(function () { status.textContent = L.copied; }, fallback);
        } catch (e) { fallback(); }
      });
      col.append(h('h1', { class: 'tool-h' }, L.title));
      if (!ctx.s.log || !ctx.s.log.length) col.appendChild(h('p', { class: 'tool-p' }, L.empty));
      secs.forEach(function (sec) {
        col.appendChild(h('h2', { class: 'tool-h2' }, sec.title));
        var table = h('table', { class: 'tool-table' });
        if (sec.head) table.appendChild(h('thead', null, h('tr', null, sec.head.map(function (x) { return h('th', null, x); }))));
        var tb = h('tbody');
        if (!sec.rows.length) tb.appendChild(h('tr', null, h('td', { colspan: String(sec.head ? sec.head.length : 2) }, '—')));
        sec.rows.forEach(function (r) { tb.appendChild(h('tr', null, r.map(function (x) { return h('td', null, x); }))); });
        table.appendChild(tb);
        col.appendChild(h('div', { class: 'tool-tablewrap' }, table));
      });
      var clear = ui.btn('Очистити журнал', function () {
        var back = h('div', { class: 'modal-back' });
        back.appendChild(h('div', { class: 'modal', role: 'dialog' },
          h('p', { class: 'modal-text' }, 'Стерти всі записи журналу і лічильник тапів на туманний острів? Прогрес гри лишиться.'),
          ui.btn('Ні, залишити', function () { back.remove(); }),
          ui.btn('Так, стерти журнал', function () {
            back.remove();
            O.state.save({ log: [], tappedNextIsland: 0 });
            O.show('LOG');
          }, 'btn-outline dark')));
        document.getElementById('app').appendChild(back);
      }, 'btn-quiet');
      col.append(h('div', { class: 'tool-actions' }, copy, status, area, ui.btn('Назад до гри', backToGame, 'btn-outline'), clear));
      return root;
    }
  };

  /* ---------- ?debug: стан «як після всього попереднього» для будь-якого екрана ---------- */
  function epIndex(id) {
    var m = /^E(\d)/.exec(id);
    return m ? Number(m[1]) : null;
  }
  function stateFor(id, o, epOverride) {
    var ep = epOverride != null ? epOverride : epIndex(id);
    var st = {
      name: O.state.s.name || 'Тарас', hintLevel: 0, partial: null, supplies: { bread: 6, water: 4 }, compass: 'has',
      sel4: null, river: null, signal: null, diaryPick: null, finished: false, cave31: null, rockOpened: 0,
      campOffered: [], zonesDone: [], fragments: [], diaryRead: [], fork1: null
    };
    if (ep >= 1 || id === 'E0.4-map') st.diaryRead = [1];
    if (ep >= 2) { st.zonesDone = ['bay']; st.fragments = [1]; st.fork1 = o.fork1; }
    var first = o.fork1 === 'left' ? 'swamp' : 'forest';
    if (ep === 2 && /^E2/.test(id)) {
      var letter = id.charAt(2), zone = letter === 'a' ? 'swamp' : 'forest';
      if (zone !== first) {
        st.zonesDone.push(first);
        st.supplies = first === 'swamp' ? { bread: 4, water: 2 } : { bread: 2, water: 4 };
      }
    }
    if (ep >= 3) { st.zonesDone = ['bay', 'swamp', 'forest']; st.fragments = [1, 2]; st.supplies = { bread: 0, water: 2 }; st.campOffered = ['e2']; }
    if (ep === 3 && id === 'E3.1-memory') st.cave31 = { round: 0, clean: [] };
    if (ep >= 4) { st.zonesDone.push('cave'); st.fragments.push(3); st.diaryRead = [1, 2]; }
    if (ep === 4) {
      st.compass = 'lost';
      if (/^E4\.1A-back|^E4\.1C-thanks/.test(id)) st.compass = 'has';
      if (/^E4\.[234]/.test(id)) { st.sel4 = o.sel4; st.compass = o.sel4 === 'silent' ? 'lost' : 'has'; }
      if (/^E4\.1A/.test(id)) st.sel4 = null;
      if (/^E4\.[34]/.test(id)) st.river = o.river;
    }
    if (ep >= 5) { st.zonesDone.push('river'); st.fragments.push(4); st.sel4 = o.sel4; st.river = o.river; st.compass = o.sel4 === 'silent' ? 'lost' : 'has'; st.campOffered = ['e2', 'e4']; }
    if (ep === 5) { var m = /^E5\.(\d)/.exec(id); st.rockOpened = m ? Math.min(3, Math.max(0, Number(m[1]) - 1)) : 0; if (id === 'E5.0') st.rockOpened = 0; }
    if (ep >= 6) { st.zonesDone.push('rock'); st.fragments.push(5); st.diaryRead = [1, 2, 3, 4, 5]; st.rockOpened = 3; }
    if (ep === 6 && /^E6\.(2|3|4)/.test(id)) st.signal = 'smoke';
    if (ep === 6 && /^E6\.(0C|1|2|3|4)/.test(id)) { st.supplies = { bread: 6, water: 4 }; if (o.sel4 === 'silent') st.compass = 'returned'; }
    if (ep >= 7) { st.zonesDone.push('camp'); st.fragments.push(6); st.signal = 'smoke'; st.supplies = { bread: 6, water: 4 }; if (o.sel4 === 'silent') st.compass = 'returned'; }
    if (ep >= 8) { st.zonesDone.push('maw'); st.diaryPick = 'sparks'; st.finished = true; }
    return st;
  }

  var MAP_POINTS = [
    ['MAP', 2, 'Карта · розвилка 1'],
    ['MAP', 3, 'Карта · печера відкрита'],
    ['MAP-camp', 3, 'Привал після еп. 2', { campOffered: [] }],
    ['CAMP-night', 3, '«Заночувати»'],
    ['MAP', 4, 'Карта · річка'],
    ['MAP-camp', 5, 'Привал після еп. 4', { campOffered: ['e2'] }],
    ['MAP', 5, 'Карта · скеля'],
    ['MAP', 6, 'Карта · розвилка 2 (паща закрита)'],
    ['MAP', 7, 'Карта · паща відкрита']
  ];

  S['DEBUG'] = {
    nosave: true,
    render: function () {
      var root = h('section', { class: 'screen tool-screen' });
      var col = h('div', { class: 'tool-col' });
      root.appendChild(col);
      var opts = { fork1: 'left', sel4: 'ask', river: 'ford' };
      function select(id, labelText, key, values) {
        var sel = h('select', { id: id, class: 'tool-select' }, values.map(function (v) { return h('option', { value: v[0] }, v[1]); }));
        sel.value = opts[key];
        sel.addEventListener('change', function () { opts[key] = sel.value; });
        return h('label', { class: 'tool-field', for: id }, h('span', null, labelText), sel);
      }
      function jump(id, ep, extra) {
        var st = stateFor(id, opts, ep);
        if (extra) for (var k in extra) st[k] = extra[k];
        if (id === 'MAP' && ep === 2) st.fork1 = null;
        O.go(id, st);
      }
      col.append(
        h('h1', { class: 'tool-h' }, 'Усі екрани (QA)'),
        h('p', { class: 'tool-p' }, 'Перехід перезаписує прогрес на цьому пристрої. Стан задається так, ніби все попереднє вже пройдено.'),
        h('div', { class: 'tool-fields' },
          select('dbg-fork', 'Розвилка 1', 'fork1', [['left', 'спершу болото'], ['right', 'спершу ліс']]),
          select('dbg-sel', 'Вибір 4.1', 'sel4', [['accuse', 'звинуватити'], ['silent', 'промовчати'], ['ask', 'спитати']]),
          select('dbg-river', 'Приплив', 'river', [['ford', 'брід'], ['bridge', 'обхід']])));
      var groups = {};
      var order = [];
      Object.keys(S).forEach(function (id) {
        var ep = epIndex(id);
        if (ep == null) return;
        var g = 'Епізод ' + ep;
        if (!groups[g]) { groups[g] = []; order.push(g); }
        groups[g].push(id);
      });
      order.sort();
      order.forEach(function (g) {
        col.appendChild(h('h2', { class: 'tool-h2' }, g));
        col.appendChild(h('div', { class: 'tool-grid' }, groups[g].map(function (id) {
          return ui.btn(id, function () { jump(id); }, 'btn-outline small');
        })));
      });
      col.appendChild(h('h2', { class: 'tool-h2' }, 'Карта і привали'));
      col.appendChild(h('div', { class: 'tool-grid' }, MAP_POINTS.map(function (m) {
        return ui.btn(m[2], function () { jump(m[0], m[1], m[3]); }, 'btn-outline small');
      })));
      col.appendChild(h('h2', { class: 'tool-h2' }, 'Сервіс'));
      col.appendChild(h('div', { class: 'tool-grid' },
        ui.btn('Привітання після перерви', function () {
          O.state.save({ lastSeen: Date.now() - 3600 * 1000 });
          O.show('R-welcome');
        }, 'btn-outline small'),
        ui.btn('Журнал тестування', function () { O.show('LOG'); }, 'btn-outline small'),
        ui.btn('Скинути прогрес', function () { O.state.reset(); O.show('E0.0-title'); }, 'btn-outline small')));
      return root;
    }
  };
  O.debugStateFor = stateFor;

  /* ---------- Прихований вхід у журнал для дорослого ----------
     На iPhone гра з домашнього екрана не має адресного рядка, тож «?log» не дописати.
     Довгий натиск 3 с у правому верхньому куті екрана відкриває журнал. */
  var holdT = 0, startX = 0, startY = 0;
  function cancelHold() { clearTimeout(holdT); holdT = 0; }
  document.addEventListener('pointerdown', function (e) {
    var top = 0;
    try { top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('padding-top')) || 0; } catch (err) { /* ignore */ }
    if (e.clientX < window.innerWidth - 72 || e.clientY > top + 76) return;
    startX = e.clientX; startY = e.clientY;
    cancelHold();
    holdT = setTimeout(function () { holdT = 0; O.show('LOG'); }, 3000);
  }, true);
  document.addEventListener('pointermove', function (e) { if (holdT && (Math.abs(e.clientX - startX) > 12 || Math.abs(e.clientY - startY) > 12)) cancelHold(); }, true);
  document.addEventListener('pointerup', cancelHold, true);
  document.addEventListener('pointercancel', cancelHold, true);
})(window.OSTRIV);
