/* Уся графіка — SVG-рядки. Кольори — з токенів STEP 4 (частина E.3).
   Тут лише власний код, ніяких даних від дитини: безпечно для innerHTML. */
(function (O) {
  var INK = '#10262B', PAPER = '#F4ECDC', SAND = '#E7D3AE', BROWN = '#6B4A2B',
      SEA = '#12343B', DEEP = '#0C2328', DEPTH = '#1E4D55', LINE = '#2B5B63',
      SIGNAL = '#FFC23D', JADE = '#36D399', FOG = '#A9BFC0', SKIN = '#F3C9A1';

  /* ---------- Іконки 24×24 (E.6) ---------- */
  var ICONS = {
    pack: '<path d="M6 9a6 6 0 0 1 12 0v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M9 4h6M9 14h6v4H9z"/>',
    bread: '<path d="M5 11a4 4 0 0 1 2-7h10a4 4 0 0 1 2 7v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M9 9v2M13 9v2"/>',
    water: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 4-4 2 2-4z"/>',
    frag: '<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z"/><path d="M9 4v14M15 6v14"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21a2 2 0 0 1 2-2h13v2"/>'
  };
  function icon(name, size) {
    size = size || 24;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }

  /* ---------- Сліди 32×32 (E.6) ---------- */
  var TRACK = {
    gull: '<g stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 27V15M16 15L8 6M16 15V5M16 15l8-9"/><path d="M8 6q8 8 16 0" stroke-width="1.5"/></g>',
    crab: '<g stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"><path d="M11 9v6M21 9v6M11 19v4M21 19v4"/></g>',
    dog: '<g fill="currentColor"><ellipse cx="16" cy="21" rx="6" ry="5"/><circle cx="8.5" cy="13" r="2.5"/><circle cx="13" cy="9" r="2.5"/><circle cx="19" cy="9" r="2.5"/><circle cx="23.5" cy="13" r="2.5"/></g>',
    turtle: '<g stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7h16l-3 15H11z"/><path d="M16 22v6"/></g>'
  };
  function track(type, size) {
    size = size || 36;
    return '<svg viewBox="0 0 32 32" width="' + size + '" height="' + size + '" aria-hidden="true">' + TRACK[type] + '</svg>';
  }
  /* «Драконячий» слід: два шари, щоб [Покажи] міг їх розсунути */
  function bigTrack(size) {
    size = size || 64;
    return '<svg viewBox="0 0 32 32" width="' + size + '" height="' + size + '" class="bigtrack" aria-hidden="true">' +
      '<g class="layer-turtle">' + TRACK.turtle + '</g>' +
      '<g class="layer-crab">' + TRACK.crab + '</g></svg>';
  }

  /* ---------- Тварини на коробках 1.1: лінійний малюнок + видима лапа ---------- */
  var ANIMAL = {
    gull: '<path d="M10 30q8-14 24-10l10-4-6 9q0 9-12 11H18z" /><path d="M24 22q6 0 9 5"/><circle cx="37" cy="21" r="1.3" fill="currentColor"/><path d="M44 16l7 2-7 2" stroke="#FFC23D"/><path d="M24 36v6M30 36v6"/>',
    crab: '<ellipse cx="30" cy="30" rx="12" ry="8"/><path d="M18 26q-8-4-6-12M42 26q8-4 6-12M10 14l4-3M50 14l-4-3"/><path d="M20 35l-6 5M24 37l-3 6M40 35l6 5M36 37l3 6"/><circle cx="26" cy="22" r="1.3" fill="currentColor"/><circle cx="34" cy="22" r="1.3" fill="currentColor"/>',
    dog: '<path d="M14 24h22q6 0 6 6v6H14q-4 0-4-6z"/><path d="M36 24l4-9q6 0 8 6l-4 3"/><path d="M41 15l-2-5 4 3"/><circle cx="44" cy="19" r="1.3" fill="currentColor"/><path d="M10 26q-5-4-4-10"/><path d="M16 36v6M24 36v6M32 36v6M40 36v6"/>',
    turtle: '<path d="M12 34q2-16 18-16t18 16z"/><path d="M20 34l4-8h12l4 8M30 18v8"/><path d="M48 32q5-1 7-5"/><circle cx="53" cy="27" r="1" fill="currentColor"/><path d="M16 34l-4 7M44 34l4 7"/>'
  };
  function animal(type) {
    return '<svg viewBox="0 0 60 48" width="60" height="48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ANIMAL[type] + '</svg>';
  }

  /* ---------- Символи печери / фрагментів 24×24 ---------- */
  var SYM = {
    wave: '<path d="M2 13q2.5-5 5 0t5 0 5 0 5 0"/><path d="M2 18q2.5-5 5 0t5 0 5 0 5 0" opacity=".5"/>',
    eye: '<path d="M2 12q10-10 20 0-10 10-20 0z"/><circle cx="12" cy="12" r="3"/>',
    arrow: '<path d="M3 12h16M13 6l6 6-6 6"/>',
    star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"/>',
    circle: '<circle cx="12" cy="12" r="8"/>',
    zigzag: '<path d="M2 16l4-8 4 8 4-8 4 8 4-8"/>',
    four: '<text x="12" y="19.5" text-anchor="middle" font-family="Unbounded, system-ui, sans-serif" font-weight="700" font-size="18" fill="currentColor" stroke="none">4</text>'
  };
  function sym(name, size, sw) {
    size = size || 24;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SYM[name] + '</svg>';
  }

  /* ---------- Мирон (E.7) ---------- */
  function miron(pose, headOnly) {
    pose = pose || 'happy';
    var vb = headOnly ? '0 20 120 110' : '0 0 120 150';
    var p = [];
    var back = pose === 'back';
    if (back) {
      p.push('<circle cx="27" cy="68" r="7" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="3"/>');
      p.push('<circle cx="93" cy="68" r="7" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="3"/>');
    }
    if (pose === 'point') {
      p.push('<path d="M84 114 L110 92" stroke="' + INK + '" stroke-width="14" stroke-linecap="round"/>');
      p.push('<path d="M84 114 L110 92" stroke="' + PAPER + '" stroke-width="9" stroke-linecap="round"/>');
    }
    p.push('<path d="M30 150 L34 104 Q60 92 86 104 L90 150 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>');
    p.push('<path d="M33 117 H87 M32 130 H88 M31 143 H89" stroke="' + SEA + '" stroke-width="5"/>');
    p.push('<circle cx="60" cy="64" r="33" fill="' + (back ? '#8A5A3B' : SKIN) + '" stroke="' + INK + '" stroke-width="3"/>');
    p.push('<path d="M25 54 Q60 12 95 54 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>');
    p.push('<rect x="22" y="50" width="76" height="9" rx="4.5" fill="' + INK + '"/>');
    if (!back) {
      if (pose === 'surprised') {
        p.push('<ellipse cx="48" cy="70" rx="5" ry="6.5" fill="' + INK + '"/><ellipse cx="72" cy="70" rx="5" ry="6.5" fill="' + INK + '"/>');
        p.push('<ellipse cx="60" cy="87" rx="5" ry="6" fill="' + INK + '"/>');
      } else if (pose === 'sad') {
        p.push('<circle cx="48" cy="71" r="4.5" fill="' + INK + '"/><circle cx="72" cy="71" r="4.5" fill="' + INK + '"/>');
        p.push('<path d="M41 64 L53 61 M79 64 L67 61" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>');
        p.push('<path d="M52 87 H68" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>');
      } else if (pose === 'sleep') {
        p.push('<path d="M43 70 Q48 75 53 70 M67 70 Q72 75 77 70" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>');
        p.push('<path d="M55 86 Q60 89 65 86" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>');
      } else {
        p.push('<circle cx="48" cy="70" r="4.5" fill="' + INK + '"/><circle cx="72" cy="70" r="4.5" fill="' + INK + '"/>');
        p.push('<path d="M51 84 Q60 91 69 84" stroke="' + INK + '" stroke-width="3" fill="none" stroke-linecap="round"/>');
      }
      p.push('<circle cx="40" cy="80" r="2" fill="#D98A5F"/><circle cx="80" cy="80" r="2" fill="#D98A5F"/>');
    }
    return '<svg class="miron" viewBox="' + vb + '" aria-hidden="true">' + p.join('') + '</svg>';
  }

  /* ---------- Сцени 390×844 (E.8) ---------- */
  function wrap(inner) {
    return '<svg class="bg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + inner + '</svg>';
  }
  function waves(y0, rows, color, op) {
    var out = '';
    for (var r = 0; r < rows; r++) {
      var y = y0 + r * 46, x0 = (r % 2) * 60 + 20;
      for (var x = x0; x < 390; x += 120) {
        out += '<path d="M' + x + ' ' + y + 'q8-6 16 0t16 0" stroke="' + color + '" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="' + op + '"/>';
      }
    }
    return out;
  }
  function dragonSilhouette(color, tx, ty, sc) {
    var crest = '';
    var pts = [[90, 470], [120, 448], [150, 430], [182, 418], [214, 412], [246, 414], [276, 424]];
    for (var i = 0; i < pts.length; i++) {
      var x = pts[i][0], y = pts[i][1];
      crest += '<path d="M' + (x - 13) + ' ' + (y + 6) + 'L' + x + ' ' + (y - 20) + 'L' + (x + 13) + ' ' + (y + 6) + 'Z"/>';
    }
    return '<g transform="translate(' + tx + ' ' + ty + ') scale(' + sc + ')" fill="' + color + '">' +
      '<path d="M20 520 Q40 470 90 470 Q150 410 230 412 Q300 412 330 450 Q352 420 378 430 Q392 448 372 462 Q352 470 352 500 L360 520 Z"/>' +
      crest + '</g>';
  }
  var SCENES = {
    title: function () {
      return wrap(
        '<rect width="390" height="844" fill="' + SEA + '"/>' +
        '<circle cx="292" cy="440" r="46" fill="' + SIGNAL + '"/>' +
        dragonSilhouette(DEEP, -6, 40, 1) +
        '<rect y="560" width="390" height="284" fill="' + SEA + '"/>' +
        '<ellipse cx="120" cy="505" rx="170" ry="16" fill="' + FOG + '" opacity=".28"/>' +
        '<ellipse cx="300" cy="538" rx="150" ry="12" fill="' + FOG + '" opacity=".22"/>' +
        waves(600, 5, '#2B5B63', 0.9));
    },
    deck: function () {
      var planks = '';
      for (var y = 640; y < 844; y += 34) planks += '<path d="M0 ' + y + 'H390" stroke="#5A3D22" stroke-width="3"/>';
      return wrap(
        '<rect width="390" height="844" fill="' + SEA + '"/>' +
        waves(120, 9, '#2B5B63', 0.8) +
        '<path d="M40 0 V600" stroke="#5A3D22" stroke-width="12"/>' +
        '<path d="M46 60 L200 300 L46 300 Z" fill="' + PAPER + '" opacity=".9"/>' +
        '<rect y="600" width="390" height="244" fill="#7A5634"/>' + planks +
        '<rect y="586" width="390" height="18" rx="4" fill="#5A3D22"/>');
    },
    sea: function () {
      return wrap('<rect width="390" height="844" fill="' + SEA + '"/>' + waves(60, 3, '#1E4D55', 0.9));
    },
    bay: function () {
      var tr = '';
      var spots = [[60, 420, 'gull', -20], [300, 460, 'dog', 15], [150, 520, 'crab', 0], [240, 600, 'turtle', -10], [90, 680, 'turtle', 5], [320, 720, 'gull', 30]];
      for (var i = 0; i < spots.length; i++) {
        var s = spots[i];
        tr += '<g transform="translate(' + s[0] + ' ' + s[1] + ') rotate(' + s[3] + ')" color="' + BROWN + '" opacity=".28">' + TRACK[s[2]] + '</g>';
      }
      return wrap(
        '<rect width="390" height="844" fill="' + SAND + '"/>' +
        '<rect width="390" height="300" fill="' + SEA + '"/>' +
        waves(70, 5, '#2B5B63', 0.9) +
        '<path d="M0 290 Q60 312 120 296 T240 300 T390 294 V318 Q330 330 260 318 T130 322 T0 316 Z" fill="' + PAPER + '" opacity=".75"/>' + tr);
    },
    swamp: function () {
      var reeds = '';
      var rx = [24, 70, 300, 352, 120, 250];
      for (var i = 0; i < rx.length; i++) {
        var x = rx[i], y = 560 + (i % 3) * 70;
        reeds += '<path d="M' + x + ' ' + y + 'v-60M' + (x + 8) + ' ' + y + 'v-44M' + (x - 8) + ' ' + y + 'v-36" stroke="#3E5E50" stroke-width="4" stroke-linecap="round"/>' +
          '<ellipse cx="' + x + '" cy="' + (y - 64) + '" rx="4" ry="11" fill="#6B4A2B"/>';
      }
      return wrap(
        '<rect width="390" height="844" fill="#183F3A"/>' +
        '<rect y="420" width="390" height="424" fill="#24504A"/>' +
        '<ellipse cx="90" cy="520" rx="70" ry="14" fill="#2E6A62"/><ellipse cx="290" cy="640" rx="90" ry="16" fill="#2E6A62"/><ellipse cx="160" cy="760" rx="80" ry="14" fill="#2E6A62"/>' +
        '<ellipse cx="200" cy="300" rx="260" ry="40" fill="' + FOG + '" opacity=".18"/><ellipse cx="160" cy="400" rx="220" ry="26" fill="' + FOG + '" opacity=".14"/>' + reeds);
    },
    forest: function () {
      var trees = '';
      var tx = [[30, 520, 1.2], [110, 470, 1], [330, 500, 1.3], [250, 450, 0.9], [190, 560, 0.8], [360, 620, 1], [10, 650, 1.1]];
      for (var i = 0; i < tx.length; i++) {
        var t = tx[i];
        trees += '<g transform="translate(' + t[0] + ' ' + t[1] + ') scale(' + t[2] + ')"><rect x="-6" y="0" width="12" height="80" fill="#4A3622"/>' +
          '<path d="M0 -150 L48 -20 H-48 Z" fill="#244A3C"/><path d="M0 -110 L56 20 H-56 Z" fill="#2C5847"/></g>';
      }
      return wrap(
        '<rect width="390" height="844" fill="#14302C"/>' + trees +
        '<rect y="640" width="390" height="204" fill="#1F3F33"/>' +
        '<path d="M60 700 L180 676" stroke="#5A3D22" stroke-width="16" stroke-linecap="round"/><path d="M230 760 L340 740" stroke="#5A3D22" stroke-width="14" stroke-linecap="round"/>');
    },
    cave: function () {
      return wrap(
        '<rect width="390" height="844" fill="' + DEEP + '"/>' +
        '<path d="M0 0 H390 V140 Q330 220 260 170 Q200 120 130 190 Q60 250 0 180 Z" fill="#081A1E"/>' +
        '<circle cx="195" cy="330" r="190" fill="#FFC23D" opacity=".07"/><circle cx="195" cy="330" r="120" fill="#FFC23D" opacity=".07"/>' +
        '<path d="M0 844 V700 Q90 660 180 690 T390 680 V844 Z" fill="#081A1E"/>');
    },
    river: function () {
      return wrap(
        '<rect width="390" height="844" fill="' + SEA + '"/>' +
        '<rect y="170" width="390" height="300" fill="#2E7C86"/>' + waves(210, 6, '#7FC4CB', 0.8) +
        '<rect y="470" width="390" height="374" fill="#7C8E86"/>' +
        '<g fill="#5F716A"><ellipse cx="60" cy="520" rx="46" ry="20"/><ellipse cx="200" cy="560" rx="60" ry="22"/><ellipse cx="330" cy="520" rx="40" ry="18"/><ellipse cx="120" cy="660" rx="50" ry="20"/><ellipse cx="300" cy="700" rx="56" ry="22"/></g>');
    },
    rock: function () {
      return wrap(
        '<rect width="390" height="844" fill="' + SEA + '"/>' +
        '<path d="M-10 330 Q60 300 120 320 T260 300 T400 316" stroke="#2B5B63" stroke-width="3" fill="none"/>' +
        '<path d="M40 240 h70 M220 200 h90 M120 160 h60" stroke="#A9C3C4" stroke-width="3" stroke-linecap="round" opacity=".5"/>' +
        '<path d="M0 844 V460 L70 420 L150 440 L230 400 L320 430 L390 410 V844 Z" fill="#5F716A"/>' +
        '<path d="M0 844 V520 L90 490 L190 510 L300 480 L390 500 V844 Z" fill="#4C5D57"/>');
    },
    camp: function () {
      return wrap(
        '<rect width="390" height="844" fill="#22463F"/>' +
        '<rect y="560" width="390" height="284" fill="#2E5A4F"/>' +
        '<path d="M60 560 L150 380 L240 560 Z" fill="#C9B48A" stroke="' + DEEP + '" stroke-width="4" stroke-linejoin="round"/><path d="M150 380 L150 560" stroke="' + DEEP + '" stroke-width="3"/>');
    },
    maw: function () {
      return wrap(
        '<rect width="390" height="844" fill="#081A1E"/>' +
        '<path d="M-20 0 H410 V300 Q380 380 330 360 L300 330 L270 370 L240 330 L210 372 L180 330 L150 370 L120 330 L90 366 Q30 380 -20 300 Z" fill="#0C2328"/>' +
        '<ellipse cx="195" cy="600" rx="240" ry="160" fill="#FF9F5A" opacity=".10"/><ellipse cx="195" cy="620" rx="150" ry="100" fill="#FFC23D" opacity=".10"/>' +
        '<path d="M-20 844 V700 L90 690 L120 730 L150 690 L180 730 L210 690 L240 730 L270 690 L300 730 L330 690 L410 700 V844 Z" fill="#0C2328"/>');
    },
    night: function () {
      var stars = '';
      var st = [[40, 80], [120, 140], [210, 60], [300, 120], [350, 40], [80, 230], [260, 220], [180, 180], [330, 260], [20, 300]];
      for (var i = 0; i < st.length; i++) stars += '<circle cx="' + st[i][0] + '" cy="' + st[i][1] + '" r="' + (i % 3 ? 2 : 3) + '" fill="' + PAPER + '" opacity=".8"/>';
      return wrap(
        '<rect width="390" height="844" fill="#081A1E"/>' + stars +
        '<circle cx="320" cy="150" r="30" fill="' + PAPER + '" opacity=".9"/><circle cx="332" cy="140" r="26" fill="#081A1E"/>' +
        '<rect y="600" width="390" height="244" fill="#0F2A26"/>' +
        '<circle cx="195" cy="590" r="140" fill="#FF9F5A" opacity=".08"/>' +
        '<g transform="translate(195 600)"><path d="M-34 10 L34 -6 M-34 -6 L34 10" stroke="#5A3D22" stroke-width="10" stroke-linecap="round"/>' +
        '<path class="fire" d="M0 -64 Q26 -30 16 -6 Q8 6 0 6 Q-8 6 -16 -6 Q-26 -30 0 -64 Z" fill="#FF9F5A"/><path d="M0 -36 Q12 -18 6 -4 Q0 2 -6 -4 Q-12 -18 0 -36 Z" fill="' + SIGNAL + '"/></g>');
    }
  };
  function scene(name) { return (SCENES[name] || SCENES.sea)(); }

  /* ---------- Карта острова ---------- */
  var ZONES = {
    bay: [205, 468], swamp: [108, 372], forest: [292, 366], cave: [200, 290],
    river: [205, 212], rock: [104, 210], camp: [292, 176], maw: [322, 86]
  };
  var EDGES = [['bay', 'swamp'], ['bay', 'forest'], ['swamp', 'cave'], ['forest', 'cave'],
               ['cave', 'river'], ['river', 'rock'], ['rock', 'camp'], ['rock', 'maw'], ['camp', 'maw']];
  var ISLAND = 'M118 506 C70 506 46 470 74 446 C40 404 40 304 70 244 C92 184 140 146 208 134 ' +
    'C246 108 266 66 316 58 C356 54 380 88 356 116 C336 138 326 150 334 182 C352 244 352 334 322 404 ' +
    'C294 462 236 496 172 496 C150 498 134 506 118 506 Z';

  function islandMap(o) {
    /* o: {revealed:[], done:[], available:[], selected, flag, uid} */
    o = o || {};
    var uid = o.uid || 'm';
    var rev = o.revealed || [];
    var done = o.done || [];
    var avail = o.available || [];
    var lockedZ = o.locked || [];
    var crest = '';
    var cp = [[70, 300], [80, 262], [96, 226], [118, 194], [146, 168], [178, 148], [212, 132], [244, 104], [270, 80]];
    for (var i = 0; i < cp.length; i++) {
      var x = cp[i][0], y = cp[i][1];
      crest += '<path d="M' + (x - 11) + ' ' + (y + 8) + 'L' + (x - 12) + ' ' + (y - 14) + 'L' + (x + 10) + ' ' + (y - 2) + 'Z"/>';
    }
    var mask = '<mask id="fog-' + uid + '"><rect x="-20" y="-20" width="430" height="580" fill="white"/>';
    for (var r = 0; r < rev.length; r++) {
      var z = ZONES[rev[r]];
      mask += '<circle cx="' + z[0] + '" cy="' + z[1] + '" r="74" fill="black" filter="url(#soft-' + uid + ')"/>';
    }
    mask += '</mask>';
    /* Туман — лише над островом (clip), з м'якими «вікнами» навколо відкритих зон */
    var fog = '<g clip-path="url(#isl-' + uid + ')"><g mask="url(#fog-' + uid + ')">' +
      '<rect x="0" y="0" width="390" height="540" fill="' + FOG + '" opacity=".93"/>' +
      '<g fill="#C3D3D3" opacity=".55">' +
      '<ellipse cx="150" cy="190" rx="90" ry="34"/><ellipse cx="270" cy="250" rx="80" ry="28"/>' +
      '<ellipse cx="120" cy="320" rx="70" ry="26"/><ellipse cx="250" cy="420" rx="90" ry="30"/>' +
      '<ellipse cx="300" cy="110" rx="60" ry="24"/></g></g></g>';
    if (o.noFog) fog = '';
    var paths = '';
    for (var e = 0; e < EDGES.length; e++) {
      var a = EDGES[e][0], b = EDGES[e][1];
      if (rev.indexOf(a) < 0 || rev.indexOf(b) < 0) continue;
      var A = ZONES[a], B = ZONES[b];
      paths += '<path d="M' + A[0] + ' ' + A[1] + 'L' + B[0] + ' ' + B[1] + '" stroke="' + BROWN + '" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>';
    }
    var deco =
      /* ліс праворуч: дерева */
      '<g fill="#5E8C6A" stroke="' + DEEP + '" stroke-width="2">' +
      '<circle cx="262" cy="340" r="11"/><circle cx="318" cy="338" r="12"/><circle cx="276" cy="400" r="10"/><circle cx="318" cy="396" r="11"/><circle cx="296" cy="324" r="9"/></g>' +
      /* болото ліворуч: калюжі */
      '<g fill="#7E9A86" opacity=".9"><ellipse cx="86" cy="350" rx="16" ry="7"/><ellipse cx="130" cy="396" rx="18" ry="7"/><ellipse cx="80" cy="402" rx="12" ry="5"/></g>' +
      /* паща: темна печера біля голови */
      '<path d="M300 104 Q322 124 346 104 Q330 96 300 104 Z" fill="' + DEEP + '"/>' +
      /* око дракона */
      '<circle cx="322" cy="74" r="4" fill="' + DEEP + '"/>';
    var marks = '';
    var keys = Object.keys(ZONES);
    for (var k = 0; k < keys.length; k++) {
      var id = keys[k], zc = ZONES[id];
      var isDone = done.indexOf(id) >= 0, isAvail = avail.indexOf(id) >= 0, isLocked = lockedZ.indexOf(id) >= 0;
      if (!isDone && !isAvail && !isLocked) continue;
      var sel = o.selected === id;
      var label = O.text.map.zones[id].name;
      var lw = Math.round(label.length * 8.6 + 20);
      var circle;
      if (isDone) {
        circle = '<circle cx="' + zc[0] + '" cy="' + zc[1] + '" r="17" fill="' + JADE + '" stroke="' + DEEP + '" stroke-width="3"/>' +
          '<path d="M' + (zc[0] - 7) + ' ' + zc[1] + 'l5 5 9-10" stroke="' + DEEP + '" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
      } else if (isLocked) {
        circle = '<circle cx="' + zc[0] + '" cy="' + zc[1] + '" r="17" fill="' + DEEP + '" stroke="' + PAPER + '" stroke-width="3" stroke-dasharray="4 4"/>';
      } else {
        circle = (sel ? '<circle cx="' + zc[0] + '" cy="' + zc[1] + '" r="27" fill="none" stroke="' + SIGNAL + '" stroke-width="2.5" stroke-dasharray="5 5"/>' : '') +
          '<circle cx="' + zc[0] + '" cy="' + zc[1] + '" r="17" fill="' + DEPTH + '" stroke="' + (sel ? SIGNAL : PAPER) + '" stroke-width="' + (sel ? 4 : 3) + '"/>';
      }
      var plaque = '<rect x="' + (zc[0] - lw / 2) + '" y="' + (zc[1] + 24) + '" width="' + lw + '" height="24" rx="8" fill="' + (sel ? SIGNAL : PAPER) + '" stroke="' + DEEP + '" stroke-width="1.5"/>' +
        '<text x="' + zc[0] + '" y="' + (zc[1] + 41) + '" text-anchor="middle" font-family="Golos Text, system-ui, sans-serif" font-weight="600" font-size="15" fill="' + INK + '">' + label + '</text>';
      marks += '<g class="zone' + (isAvail ? ' zone-avail' : isLocked ? ' zone-locked' : ' zone-done') + '" data-zone="' + id + '">' +
        '<circle cx="' + zc[0] + '" cy="' + zc[1] + '" r="36" fill="transparent"/>' + circle + plaque + '</g>';
    }
    var flag = '';
    if (o.flag) {
      var fz = ZONES[o.flag];
      flag = '<g class="flag" transform="translate(' + (fz[0] + 4) + ' ' + (fz[1] - 50) + ')">' +
        '<path d="M0 0 V40" stroke="' + DEEP + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M1 1 H26 L20 9 L26 17 H1 Z" fill="' + SIGNAL + '" stroke="' + DEEP + '" stroke-width="2" stroke-linejoin="round"/></g>';
    }
    return '<svg class="map-svg" viewBox="0 0 390 540" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Карта острова">' +
      '<defs><filter id="soft-' + uid + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>' +
      '<clipPath id="isl-' + uid + '"><path d="' + ISLAND + '"/></clipPath></defs>' +
      mask +
      '<path d="' + ISLAND + '" fill="' + SAND + '" stroke="' + DEEP + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<g fill="#CDB78F" stroke="' + DEEP + '" stroke-width="2.5" stroke-linejoin="round">' + crest + '</g>' +
      deco + paths + fog +
      '<path d="' + ISLAND + '" fill="none" stroke="' + DEEP + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<g fill="#CDB78F" stroke="' + DEEP + '" stroke-width="2.5" stroke-linejoin="round">' + crest + '</g>' +
      '<circle cx="322" cy="74" r="4.5" fill="' + DEEP + '"/>' +
      marks + flag + (o.next ? nextIslandGroup() : '') + '</svg>';
  }

  /* Туманний острів у правому нижньому куті фінальної карти */
  function nextIslandGroup() {
    var label = O.text.finale.nextIsland;
    var lw = Math.round(label.length * 7.2 + 18);
    return '<g class="next-island" data-next="1" transform="translate(312 486)">' +
      '<g class="next-wobble">' +
      '<rect x="-64" y="-56" width="128" height="104" fill="transparent"/>' +
      '<ellipse cx="0" cy="-6" rx="62" ry="40" fill="' + FOG + '" opacity=".5"/>' +
      '<path d="M-38 6 Q-34 -18 -10 -22 Q0 -38 18 -32 Q42 -28 42 -2 Q42 12 18 14 L-24 16 Q-40 16 -38 6 Z" fill="#7C8E86" stroke="' + DEEP + '" stroke-width="2.5" opacity=".8"/>' +
      '<ellipse cx="-14" cy="-28" rx="38" ry="10" fill="' + FOG + '" opacity=".75"/><ellipse cx="24" cy="12" rx="36" ry="9" fill="' + FOG + '" opacity=".75"/></g>' +
      '<rect x="' + (-lw / 2) + '" y="26" width="' + lw + '" height="22" rx="8" fill="' + DEEP + '" opacity=".85"/>' +
      '<text x="0" y="41.5" text-anchor="middle" font-family="Golos Text, system-ui, sans-serif" font-weight="600" font-size="12.5" fill="' + PAPER + '">' + label + '</text></g>';
  }

  /* ---------- Рваний фрагмент карти (Т6) ---------- */
  function fragmentPiece(symName, size) {
    size = size || 190;
    return '<svg viewBox="0 0 190 190" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<path d="M18 14 L60 22 L88 10 L126 20 L172 12 L178 58 L168 96 L180 138 L170 178 L124 170 L92 182 L52 172 L14 178 L22 132 L10 94 L20 52 Z" fill="' + PAPER + '" stroke="' + BROWN + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M30 140 Q70 120 96 132 T160 120" stroke="' + BROWN + '" stroke-width="2" stroke-dasharray="3 7" fill="none" stroke-linecap="round" opacity=".55"/>' +
      '<g transform="translate(47 37) scale(4)" color="' + BROWN + '">' + sym(symName, 24, 1.6).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/^/, '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">') + '</g></g>' +
      '</svg>';
  }

  /* ---------- Клітинки маршруту 2.2 ---------- */
  function cellArt(kind, zone) {
    if (kind === '#') {
      if (zone === 'forest') {
        return '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="10" fill="#1A332B"/>' +
          '<path d="M10 40 L54 22" stroke="#6B4A2B" stroke-width="9" stroke-linecap="round"/><path d="M12 22 L50 46" stroke="#5A3D22" stroke-width="8" stroke-linecap="round"/>' +
          '<circle cx="54" cy="22" r="4.5" fill="#8A6A45"/></svg>';
      }
      return '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="10" fill="#203A33"/>' +
        '<ellipse cx="32" cy="34" rx="22" ry="14" fill="#2F4A3E"/><circle cx="24" cy="30" r="3.5" fill="#4E6B5E"/><circle cx="38" cy="36" r="2.5" fill="#4E6B5E"/><circle cx="40" cy="27" r="2" fill="#4E6B5E"/></svg>';
    }
    if (kind === 'k') {
      return '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="36" rx="18" ry="9" fill="#7FC4CB" opacity=".9"/><path d="M24 34 q4-3 8 0" stroke="' + PAPER + '" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    }
    if (kind === 'E') {
      return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 52 V12" stroke="' + DEEP + '" stroke-width="4" stroke-linecap="round"/><path d="M25 13 H48 L42 21 L48 29 H25 Z" fill="' + SIGNAL + '" stroke="' + DEEP + '" stroke-width="2.5" stroke-linejoin="round"/></svg>';
    }
    return '';
  }

  /* ---------- Камінь (річка, скеля) ---------- */
  function stone(variant) {
    var c = variant === 'rock' ? ['#8E9C94', '#6D7C74'] : ['#7C8E86', '#5F716A'];
    return '<svg viewBox="0 0 100 70" aria-hidden="true"><ellipse cx="50" cy="56" rx="44" ry="10" fill="#0C2328" opacity=".25"/>' +
      '<path d="M8 50 Q6 22 34 14 Q60 6 82 20 Q98 32 92 50 Q70 60 50 58 Q24 60 8 50 Z" fill="' + c[0] + '" stroke="' + DEEP + '" stroke-width="3"/>' +
      '<path d="M30 26 Q44 20 56 24" stroke="' + c[1] + '" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
  }

  /* ---------- Табличка приливу 4.2 ---------- */
  function tideSign() {
    return '<svg viewBox="0 0 120 60" aria-hidden="true"><rect x="56" y="30" width="8" height="30" fill="#5A3D22"/>' +
      '<path d="M44 4 L60 0 L76 4 L74 32 L46 32 Z" fill="#6B4A2B"/>' +
      '<g fill="' + SIGNAL + '"><path d="M55 12 Q60 6 65 12 V20 H55 Z"/><rect x="53" y="20" width="14" height="3" rx="1.5"/><circle cx="60" cy="25" r="2"/></g></svg>';
  }

  /* ---------- Предмети табору 6.1 (48×48, лінія currentColor) ---------- */
  var ITEM = {
    mirror: '<rect x="12" y="6" width="24" height="32" rx="5"/><path d="M18 16l8-6M18 24l12-10" stroke-width="2"/><path d="M16 38v4h16v-4"/>',
    branches: '<path d="M8 36L40 18M12 22l26 18M22 28l-6-10M30 24l4-9"/>',
    matches: '<rect x="8" y="22" width="32" height="18" rx="3"/><path d="M8 28h32"/><path d="M22 22L30 6"/><circle cx="31" cy="5" r="3" fill="currentColor"/>',
    leaves: '<path d="M10 38Q8 14 34 10q4 24-24 28z"/><path d="M10 38L28 18"/><path d="M38 26q2 4 0 6-2-2 0-6zM40 36q2 4 0 6-2-2 0-6z" fill="currentColor"/>',
    shirt: '<path d="M16 8l-10 8 5 7 5-3v20h16V20l5 3 5-7-10-8q-4 5-8 5t-8-5z"/>',
    rope: '<ellipse cx="24" cy="24" rx="16" ry="12"/><ellipse cx="24" cy="24" rx="10" ry="7"/><path d="M38 30q6 6 2 12"/>',
    pot: '<path d="M10 20h28v14a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z"/><path d="M6 20h36M18 14h12M4 26h6M38 26h6"/>'
  };
  function item(id, size) {
    size = size || 44;
    return '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ITEM[id] + '</svg>';
  }

  /* ---------- Результат сигналу 6.1 (200×140) ---------- */
  function signalArt(kind) {
    var ground = '<rect width="200" height="140" rx="16" fill="#1E4D55"/><path d="M0 104 Q50 92 100 100 T200 96 V140 H0 Z" fill="#2E5A4F"/>';
    var fireBase = '<g transform="translate(100 104)"><path d="M-18 4 L18 -4 M-18 -4 L18 4" stroke="#5A3D22" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M0 -34 Q14 -16 9 -3 Q4 3 0 3 Q-4 3 -9 -3 Q-14 -16 0 -34 Z" fill="#FF9F5A"/><path d="M0 -18 Q6 -9 3 -2 Q0 1 -3 -2 Q-6 -9 0 -18 Z" fill="#FFC23D"/></g>';
    var art = {
      smoke: ground + fireBase + '<g fill="#F4ECDC" opacity=".9"><circle cx="100" cy="62" r="12"/><circle cx="94" cy="44" r="14"/><circle cx="104" cy="26" r="15"/><circle cx="96" cy="10" r="13"/></g>',
      fire: ground + '<circle cx="164" cy="28" r="14" fill="#FFC23D"/>' + fireBase,
      mirror: ground + '<circle cx="34" cy="26" r="13" fill="#FFC23D"/><path d="M44 34 L96 80" stroke="#FFC23D" stroke-width="3" stroke-dasharray="4 5"/>' +
        '<circle cx="100" cy="84" r="9" fill="#F4ECDC" stroke="#0C2328" stroke-width="2.5"/><path d="M104 80 L190 20" stroke="#FFC23D" stroke-width="5" stroke-linecap="round"/>' +
        '<g stroke="#FFC23D" stroke-width="3" stroke-linecap="round"><path d="M186 6v8M178 18h-8M190 26l6 4"/></g>',
      flag: ground + '<rect x="60" y="30" width="10" height="76" fill="#5A3D22"/><circle cx="65" cy="30" r="24" fill="#3E7A5C"/><circle cx="48" cy="44" r="16" fill="#3E7A5C"/><circle cx="82" cy="44" r="16" fill="#3E7A5C"/>' +
        '<path d="M70 14 V-2" stroke="#5A3D22" stroke-width="3"/><path d="M71 -1 H124 Q118 10 124 22 H71 Z" transform="translate(0 6)" fill="#FFFFFF" stroke="#0C2328" stroke-width="2"/>',
      pot: ground + '<g transform="translate(70 64)"><path d="M6 12h48v20a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8z" fill="#A9BFC0" stroke="#0C2328" stroke-width="3"/><path d="M0 12h60" stroke="#0C2328" stroke-width="3"/></g>' +
        '<g stroke="#FFC23D" stroke-width="3" stroke-linecap="round" fill="none"><path d="M50 60q-8 10 0 20M40 54q-14 16 0 32M150 60q8 10 0 20M160 54q14 16 0 32"/></g>',
      nothing: ground + '<g transform="translate(76 70)" fill="#A9BFC0" stroke="#0C2328" stroke-width="2.5"><rect x="0" y="10" width="48" height="22" rx="6"/></g>' +
        '<g fill="#A9C3C4"><circle cx="150" cy="40" r="3"/><circle cx="160" cy="40" r="3"/><circle cx="170" cy="40" r="3"/></g>'
    };
    return '<svg viewBox="0 -6 200 146" aria-hidden="true">' + (art[kind] || art.nothing) + '</svg>';
  }

  /* ---------- Ящик з консервами ---------- */
  function crate(open) {
    var lid = open
      ? '<path d="M14 40 L30 8 L110 8 L94 40 Z" fill="#8A6A45" stroke="#0C2328" stroke-width="3" stroke-linejoin="round"/>'
      : '<rect x="10" y="34" width="100" height="16" rx="3" fill="#8A6A45" stroke="#0C2328" stroke-width="3"/>';
    var cans = open ? '<g stroke="#0C2328" stroke-width="2.5"><rect x="26" y="34" width="20" height="24" rx="3" fill="#A9BFC0"/><rect x="50" y="30" width="20" height="28" rx="3" fill="#E7D3AE"/><rect x="74" y="34" width="20" height="24" rx="3" fill="#A9BFC0"/></g>' : '';
    return '<svg viewBox="0 0 120 100" aria-hidden="true">' + cans +
      '<rect x="12" y="48" width="96" height="46" rx="4" fill="#6B4A2B" stroke="#0C2328" stroke-width="3"/><path d="M12 64h96M12 80h96" stroke="#5A3D22" stroke-width="3"/>' + lid + '</svg>';
  }

  /* ---------- «Фото капітана»: силует у капітанському капелюсі ---------- */
  function captainPhoto() {
    return '<svg viewBox="0 0 160 150" aria-hidden="true"><rect width="160" height="150" fill="#A9BFC0"/>' +
      '<g fill="#10262B"><path d="M30 150 Q34 108 80 104 Q126 108 130 150 Z"/><circle cx="80" cy="76" r="26"/>' +
      '<path d="M46 56 Q80 22 114 56 Z"/><rect x="40" y="52" width="80" height="9" rx="4"/></g>' +
      '<path d="M74 40 l6 -6 6 6 -6 6 z" fill="#FFC23D"/></svg>';
  }

  /* ---------- Дракон (власний дизайн): спить, прокидається, чхає ---------- */
  function dragon() {
    var BODY = '#5E9C7A', BELLY = '#E7D3AE', LINE = '#0C2328';
    return '<svg class="dragon" viewBox="0 0 260 170" aria-hidden="true">' +
      /* мапи під ним */
      '<g stroke="' + LINE + '" stroke-width="2"><path d="M20 140 L110 128 L120 160 L30 168 Z" fill="#F4ECDC"/><path d="M120 134 L230 126 L236 160 L126 166 Z" fill="#E7D3AE"/>' +
      '<path d="M40 150 q20 -8 40 0 t30 -4" fill="none" stroke="#6B4A2B" stroke-dasharray="3 5"/><path d="M140 146 q24 -6 40 2 t40 -6" fill="none" stroke="#6B4A2B" stroke-dasharray="3 5"/></g>' +
      /* хвіст */
      '<path d="M60 128 Q20 126 26 100 Q30 88 40 96" fill="none" stroke="' + BODY + '" stroke-width="12" stroke-linecap="round"/><path d="M36 92 l10 -8 2 12 z" fill="' + BODY + '" stroke="' + LINE + '" stroke-width="2"/>' +
      /* тіло */
      '<ellipse cx="110" cy="112" rx="56" ry="28" fill="' + BODY + '" stroke="' + LINE + '" stroke-width="3"/>' +
      '<ellipse cx="114" cy="122" rx="38" ry="12" fill="' + BELLY + '"/>' +
      /* крильце */
      '<path d="M96 92 Q100 62 128 70 Q118 76 122 86 Q110 82 108 94 Z" fill="#4A8466" stroke="' + LINE + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      /* голова */
      '<g class="dr-head"><circle cx="172" cy="96" r="26" fill="' + BODY + '" stroke="' + LINE + '" stroke-width="3"/>' +
      '<ellipse cx="194" cy="104" rx="16" ry="12" fill="' + BODY + '" stroke="' + LINE + '" stroke-width="3"/>' +
      '<circle cx="200" cy="100" r="2" fill="' + LINE + '"/><circle cx="204" cy="106" r="2" fill="' + LINE + '"/>' +
      '<path d="M160 72 l-4 -12 10 8 z M178 70 l2 -12 6 10 z" fill="#FFC23D" stroke="' + LINE + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path class="eye-shut" d="M162 92 q5 4 10 0" fill="none" stroke="' + LINE + '" stroke-width="3" stroke-linecap="round"/>' +
      '<g class="eye-open"><circle cx="167" cy="91" r="5.5" fill="#F4ECDC" stroke="' + LINE + '" stroke-width="2"/><circle cx="168" cy="92" r="2.6" fill="' + LINE + '"/></g></g>' +
      /* іскри чиху */
      '<g class="sparks" fill="#FFC23D" stroke="' + LINE + '" stroke-width="1.5"><path d="M222 98 l4 -8 4 8 -4 8z"/><path d="M236 86 l3 -6 3 6 -3 6z"/><path d="M234 112 l3 -6 3 6 -3 6z"/></g>' +
      '<g class="zzz" fill="#A9C3C4" font-family="Golos Text, system-ui, sans-serif" font-weight="700"><text x="196" y="66" font-size="14">z</text><text x="208" y="52" font-size="18">z</text></g>' +
      '</svg>';
  }

  /* ---------- Пазл 7.1: шість фрагментів різної форми ---------- */
  var PIECE = {
    1: 'M-30 -18 L30 -18 L22 18 L-22 18 Z',          /* трапеція */
    2: 'M0 -26 L28 20 L-28 20 Z',                    /* трикутник */
    3: 'M-20 -6 L0 -28 L20 -6 L20 26 L-20 26 Z',     /* будиночок */
    4: 'M-14 -24 L14 -24 L28 0 L14 24 L-14 24 L-28 0 Z', /* шестикутник */
    5: 'M0 -28 L26 0 L0 28 L-26 0 Z',                /* ромб */
    6: 'M-24 -24 L4 -24 L4 0 L24 0 L24 24 L-24 24 Z' /* «Г» */
  };
  /* Гнізда — там, де фрагмент знайшли */
  var SOCKET = { 1: [205, 452], 2: [200, 372], 3: [200, 290], 4: [214, 214], 5: [122, 226], 6: [292, 176] };
  function piece(n, size, empty) {
    size = size || 60;
    var symName = O.text.fragments[n].sym;
    var inner = empty ? '' : '<g transform="translate(-12 -9) scale(1)" color="#6B4A2B">' + symInner(symName) + '</g>';
    return '<svg viewBox="-34 -34 68 68" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<path d="' + PIECE[n] + '" fill="' + (empty ? 'none' : PAPER) + '" stroke="' + (empty ? PAPER : BROWN) + '" stroke-width="' + (empty ? 2.5 : 2.5) + '" stroke-dasharray="' + (empty ? '5 4' : 'none') + '" stroke-linejoin="round"/>' + inner + '</svg>';
  }
  function symInner(name) {
    return '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + SYM[name] + '</g>';
  }
  function puzzleMap(placed, path) {
    placed = placed || [];
    var base = islandMap({ revealed: Object.keys(ZONES), uid: 'pz', noFog: true });
    var out = '';
    if (path) {
      out += '<path class="pz-path" d="M205 468 L200 372 L200 290 L205 212 L104 210 L292 176 L322 92" fill="none" stroke="' + BROWN + '" stroke-width="5" stroke-dasharray="3 10" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    for (var n = 1; n <= 6; n++) {
      var c = SOCKET[n];
      var isIn = placed.indexOf(n) >= 0;
      out += '<g class="socket' + (isIn ? ' filled' : '') + '" data-socket="' + n + '" transform="translate(' + c[0] + ' ' + c[1] + ')">' +
        '<circle r="40" fill="transparent"/>' +
        '<path d="' + PIECE[n] + '" fill="' + (isIn ? PAPER : 'rgba(12,35,40,.35)') + '" stroke="' + (isIn ? BROWN : DEEP) + '" stroke-width="2.5" stroke-dasharray="' + (isIn ? 'none' : '5 4') + '" stroke-linejoin="round"/>' +
        (isIn ? '<g transform="translate(-12 -9)" color="' + BROWN + '">' + symInner(O.text.fragments[n].sym) + '</g>' : '') + '</g>';
    }
    return base.replace('</svg>', out + '</svg>');
  }

  /* ---------- Мініатюра бухти для підказки «Напрям» ---------- */
  function bayMini() {
    var t = '';
    for (var i = 0; i < 4; i++) t += '<g transform="translate(' + (150 - i * 30) + ' 50) rotate(-90) scale(.7)" color="' + BROWN + '">' + TRACK.turtle + '</g>';
    return '<svg viewBox="0 0 200 90" aria-hidden="true"><rect width="200" height="90" rx="12" fill="' + SAND + '"/><rect width="200" height="22" rx="12" fill="' + SEA + '"/>' + t +
      '<path d="M44 74 H14 M24 66 L14 74 L24 82" stroke="' + DEEP + '" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  /* ---------- Значок «Перша експедиція» ---------- */
  function badge() {
    return '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="' + DEEP + '" stroke="' + JADE + '" stroke-width="5"/>' +
      '<circle cx="60" cy="60" r="44" fill="none" stroke="' + JADE + '" stroke-width="2" stroke-dasharray="3 6"/>' +
      '<g transform="translate(36 36) scale(2)" fill="none" stroke="' + SIGNAL + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS.compass + '</g></svg>';
  }

  /* ---------- Острів «Наступна експедиція» для фінальної карти ---------- */
  function nextIslandSvg() {
    return '<svg viewBox="0 0 160 120" aria-hidden="true">' +
      '<ellipse cx="80" cy="64" rx="78" ry="50" fill="' + FOG + '" opacity=".55"/>' +
      '<path d="M30 80 Q36 50 66 46 Q78 26 100 34 Q130 38 132 70 Q132 88 100 90 L44 92 Q28 92 30 80 Z" fill="#7C8E86" stroke="' + DEEP + '" stroke-width="2.5" opacity=".75"/>' +
      '<ellipse cx="60" cy="40" rx="50" ry="14" fill="' + FOG + '" opacity=".7"/><ellipse cx="110" cy="86" rx="46" ry="12" fill="' + FOG + '" opacity=".7"/></svg>';
  }

  O.art = {
    icon: icon, track: track, bigTrack: bigTrack, animal: animal, sym: sym,
    miron: miron, scene: scene, islandMap: islandMap, fragmentPiece: fragmentPiece,
    cellArt: cellArt, stone: stone, tideSign: tideSign,
    item: item, signalArt: signalArt, crate: crate, captainPhoto: captainPhoto, dragon: dragon,
    piece: piece, puzzleMap: puzzleMap, bayMini: bayMini, badge: badge, nextIslandSvg: nextIslandSvg, PIECE: PIECE,
    ZONES: ZONES
  };
})(window.OSTRIV);
