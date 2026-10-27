/* Збереження: один ключ ostriv.v1. Усі звернення до localStorage — у try/catch:
   якщо сховище недоступне (приватний режим), гра працює без збереження і мовчить. */
(function (O) {
  var KEY = 'ostriv.v1';
  var LOG_MAX = 3000;
  var s = null;

  function defaults() {
    return {
      v: 1,
      name: '',
      screen: null,
      hintLevel: 0,
      partial: null,
      zonesDone: [],
      fork1: null,
      supplies: { bread: 6, water: 4 },
      compass: 'has',
      sel4: null,
      river: null,
      fragments: [],
      signal: null,
      diaryPick: null,
      diaryRead: [],
      campOffered: [],
      cave31: null,
      rockOpened: 0,
      finished: false,
      lastSeen: 0,
      tappedNextIsland: 0,
      log: []
    };
  }

  function readRaw() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || d.v !== 1) return null;
      return d;
    } catch (e) { return null; }
  }

  function write() {
    s.lastSeen = Date.now();
    try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* без збереження */ }
  }

  O.state = {
    KEY: KEY,
    load: function () {
      var d = readRaw();
      var fresh = d ? Object.assign(defaults(), d) : defaults();
      if (!s) { s = fresh; return s; }
      /* Той самий об'єкт: екрани тримають посилання на нього */
      Object.keys(s).forEach(function (k) { delete s[k]; });
      Object.assign(s, fresh);
      return s;
    },
    get s() { return s; },
    /* Зміни і запис одним кроком */
    save: function (patch) {
      if (patch) Object.assign(s, patch);
      write();
    },
    /* Лише оновити «коли бачили востаннє» (при згортанні вкладки) */
    touch: function () {
      var d = readRaw();
      if (d && s && d.screen !== s.screen) return; // інша вкладка пішла далі — не перезаписуємо
      write();
    },
    reset: function () {
      var keep = { tappedNextIsland: s.tappedNextIsland, log: s.log };
      var fresh = Object.assign(defaults(), keep);
      Object.keys(s).forEach(function (k) { delete s[k]; });
      Object.assign(s, fresh);
      write();
    },
    log: function (type, data) {
      var e = { t: Date.now(), type: type, screen: s.screen };
      if (data) for (var k in data) e[k] = data[k];
      s.log.push(e);
      if (s.log.length > LOG_MAX) s.log.splice(0, s.log.length - LOG_MAX);
      write();
    },
    hasProgress: function () {
      return !!(s.name && s.screen && s.screen !== 'E0.0-title' && s.screen !== 'E0.1-name');
    },
    setPartial: function (p) { s.partial = p; write(); }
  };
})(window.OSTRIV);
