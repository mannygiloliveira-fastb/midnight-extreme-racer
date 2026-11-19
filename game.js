/*
 * MIDNIGHT EXTREME RACER
 * Standalone browser racing game built on a Three.js garage and race engine.
 *
 * Files: index.html, styles.css, game.js
 * Serve the folder over http (for example "python3 -m http.server") so the car model and
 * the three.js module load. Opening index.html straight from disk blocks file loading.
 */

/* Set your own assets here. Leave a path empty to use the built in procedural version. */
const GAME_CONFIG = {
  carModel: "tt_detailed_6mb.txt", // path or URL to a .glb car, for example "tt_detailed_6mb.glb"
  raceCover: "", // image shown on the in garage TV when you start a race
  raceMusic: "", // audio file that plays during a race
  tvVideo: "", // video file for the garage TV
  garage: { len: 34, wid: 32, ht: 12, cars: 1 }, // size in feet and number of parked cars
};

(function () {
  var Qi = document.getElementById("game");
  if (!Qi) return;
  Qi.classList.add("lc-three");

  var gi = [0.95, 0.85, 0.75, 0.67, 0.6, 0.53, 0.48, 0.43, 0.39, 0.35, 0.32];
  function vs(e, a, r, n) {
    var i = r - n;
    return (5 * i * (e + a)) / (e * a);
  }
  function ms(e) {
    if (e <= 0) return gi[0];
    if (e >= 10) return gi[10];
    var a = Math.floor(e),
      r = e - a;
    return gi[a] + (gi[a + 1] - gi[a]) * r;
  }
  function En(e, a, r, n, i, o, s) {
    var l = ms(vs(e, a, r, n));
    return (o * i * l * s) / (e * a);
  }
  
    /*
   * Garage size comes from GAME_CONFIG. The engine reads the size through V("len"), V("wid") and V("ht"),
   * so these plain objects stand in for the old form fields.
   */
  var GARAGE_INPUTS = {
    len: { value: GAME_CONFIG.garage.len },
    wid: { value: GAME_CONFIG.garage.wid },
    ht: { value: GAME_CONFIG.garage.ht },
  };
  function V(e) {
    return e === "three" ? Qi : GARAGE_INPUTS[e] || null;
  }
  /* Engine settings. One built in light fixture drives the garage ceiling lights. */
  var ce = {
      carModel: GAME_CONFIG.carModel || "",
      raceCover: GAME_CONFIG.raceCover || "",
      raceMusic: GAME_CONFIG.raceMusic || "",
      tvVideo: GAME_CONFIG.tvVideo || "",
      outsidePhoto: "",
      workPlane: 2.5,
      llf: 0.8,
      lightsHelp: "",
      dimHelp: "",
      fixtures: [{ name: "Garage LED light", lumens: 3400, lengthFt: 4, widthIn: 3 }],
    },
    an = 0,
    Er = "white",
    Br = 0,
    Go = !1,
    zo = "";

  function Io(e) {
    return !!(e && e.alt && e.alt.lumens > 0 && e.alt.label);
  }
  function Oo(e) {
    if (!e) return e;
    var a = {},
      r;
    for (r in e) a[r] = e[r];
    return (
      Go &&
        Io(e) &&
        ((a.lumens = e.alt.lumens),
        (a.variant = e.alt.variant),
        (a.variantBlack = ""),
        (a.optLabel = e.alt.label),
        e.alt.widthIn > 0 && (a.widthIn = e.alt.widthIn)),
      a
    );
  }
  function nn(e) {
    return !!(e && e.k2 && e.k2.label && e.k2.variant);
  }

  var gs = ["#e9edf3"];

  function Fo(e) {
    return e.shape === "overhead" || /overhead/i.test(e.name || "");
  }

  function Al(e, a, r, n) {
    var i = n.lengthFt > 0 ? n.lengthFt : 4,
      o = Math.max(1, Math.min(Math.round(a / 11.5), Math.floor((a - 1) / i))),
      s = Math.max(2, Math.ceil(e / 8));
    return {
      kind: "grid",
      segs: 1,
      rows: s,
      cols: o,
      a: o,
      b: 0,
      nLong: s * o,
      nShort: 0,
      qty: s * o,
      lumens: s * o * n.lumens,
    };
  }
  function El(e, a, r, n) {
    var i = n.lengthFt > 0 ? n.lengthFt : 4,
      o = n.lumens,
      s = n.short && n.short.lumens > 0 ? n.short : null,
      l = s ? (s.lengthFt > 0 ? s.lengthFt : 4) : 0,
      c = s ? s.lumens : 0,
      f = a - 1.5,
      u,
      p;
    f < i
      ? ((u = s ? 0 : 1), (p = s ? Math.max(1, Math.floor(f / l)) : 0))
      : ((u = Math.floor(f / i)), (p = s ? Math.max(0, Math.floor((f - u * i) / l)) : 0));
    var v = 1;
    if (n.maxRun > 0 && u + p > n.maxRun) {
      for (
        v = Math.ceil((u + p) / n.maxRun), u = Math.floor(u / v), p = Math.floor(p / v);
        u + p > n.maxRun && u > 0;
      )
        u--;
      u + p < 1 && ((u = 1), (p = 0));
    }
    var w = v * (u * o + p * c),
      y = Math.max(1, Math.ceil(e / 8)),
      E = 8,
      M = (e - 8 * (y - 1)) / 2;
    return {
      kind: "run",
      segs: v,
      rows: y,
      a: u,
      b: p,
      nLong: y * v * u,
      nShort: y * v * p,
      qty: y * v * (u + p),
      lumens: y * w,
      spacing: E,
      margin: M,
    };
  }
  function xs(e, a, r, n) {
    return Fo(n) ? Al(e, a, r, n) : El(e, a, r, n);
  }
  var ws = 30,
    Bl = 7e4,
    bs = {};

  function Rl(e, a, r) {
    var n = [],
      i,
      o,
      s,
      l = a.lengthFt > 0 ? a.lengthFt : 4;
    if (e.kind === "grid") {
      var c = Math.min(l, r * 0.95);
      for (i = 0; i < e.cols; i++) n.push({ x: ((i + 0.5) * r) / e.cols - c / 2, len: c });
      return n;
    }
    var f = a.short && a.short.lengthFt > 0 ? a.short.lengthFt : 4,
      u = [],
      p = Math.floor(e.b / 2);
    for (i = 0; i < p; i++) u.push(f);
    for (i = 0; i < e.a; i++) u.push(l);
    for (i = 0; i < p; i++) u.push(f);
    e.b % 2 === 1 && u.push(f);
    var v = [];
    for (s = 0; s < e.segs; s++) v = v.concat(u);
    var w = v.reduce(function (y, E) {
      return y + E;
    }, 0);
    return (
      (o = (r - w) / 2),
      v.forEach(function (y) {
        (n.push({ x: o, len: y }), (o += y));
      }),
      n
    );
  }
  function Cs(e) {
    var a = e >= 20 ? 2.5 : 2,
      r = Math.min(e, 24),
      n = r - 2 * a;
    return {
      tallW: a,
      total: r,
      off: (e - r) / 2,
      run: n,
      n: Math.max(2, Math.round(n / 3.5)),
      up: Math.max(2, Math.round(n / 4)),
    };
  }
  function As(e, a, r) {
    var n = 1.3125,
      i = Math.min(2.625, e / 5, a / 5);
    if (r > 0) {
      var o = (r - 1) * Math.min(e / r, 8.6) + 5.85;
      i = Math.min(i, (e - o) / 2 - 0.35 - n, (a - 13.5) / 2 - 0.35 - n);
    }
    return { m: Math.max(0.3, i), b: n };
  }
  function ir(e, a, r) {
    var n = r > 0 ? Math.min(e / r, 8.6) : 0,
      i = [],
      o;
    if (r === 3)
      return [
        { c: -n / 2, w: 2 * n - 1.4 },
        { c: n, w: n - 1.4 },
      ];
    if (r === 4)
      return [
        { c: -n, w: 2 * n - 1.4 },
        { c: n, w: 2 * n - 1.4 },
      ];
    if (r >= 5) {
      var s = Math.floor(r / 2),
        l = r % 2,
        c = [],
        f = Math.ceil(s / 2),
        u = (-r * n) / 2,
        p;
      for (p = 0; p < s; p++) (l && p === f && c.push(1), c.push(2));
      return (
        l && c.indexOf(1) === -1 && c.push(1),
        c.forEach(function (w) {
          (i.push({ c: u + (w * n) / 2, w: w * n - 1.4 }), (u += w * n));
        }),
        i
      );
    }
    var v = r > 0 ? r : Math.max(1, Math.round(e / 9));
    for (o = 0; o < v; o++) i.push({ c: ((o + 0.5) * e) / v - e / 2, w: e / v - 1 });
    return i;
  }
  function Ti(e) {
    var a = Math.max(1, Math.round(e / 9)),
      r = e - 6.5,
      n = [],
      i;
    for (i = 0; i < a; i++) n.push(5 + ((i + 0.5) * r) / a);
    return n;
  }
  
  function Es(e) {
    var a = Br === 1 && nn(e);
    return a
      ? { core: "#fff7ea", edge: "#ffe3bf", glow: "#ffdcae", line: "#d9b27a", c3: 16775146, g3: 16768174 }
      : { core: "#ffffff", edge: "#dcebff", glow: "#cfe3ff", line: "#9fb0c6", c3: 16777215, g3: 13624319 };
  }
  function Bs(e) {
    var a = String((e && e.optLabel) || "").match(/\d+/);
    return a ? Math.min(8, Math.max(2, parseInt(a[0], 10))) : 4;
  }
  var ee = null,
    eo = !1,
    Fa = 3.1,
    wt = 6.6;
  function Ls(e, a) {
    var c = Math.floor(GAME_CONFIG.garage.cars);
    return c > 0 ? c : e >= 17 && a >= 8 ? Math.max(1, Math.floor(a / 10)) : 0;
  }
  function Rs(e, a) {
    var r = Ls(e, a),
      n = [],
      i;
    for (i = 0; i < r; i++) n.push({ x: (i - (r - 1) / 2) * Math.min(a / r, 8.6), z: 0, r: 0 });
    return n;
  }
  function to(e, a, r) {
    var n = (r * Math.PI) / 180,
      i = Math.abs(Math.cos(n)),
      o = Math.abs(Math.sin(n)),
      s = i * Fa + o * wt,
      l = o * Fa + i * wt;
    return {
      x: Math.max(0, e / 2 - s - 0.6),
      zMin: -(a / 2) + l + (e >= 10 ? 2.3 : 0.6),
      zMax: a / 2 - l - 0.6,
    };
  }
  function Mi(e, a, r) {
    var n = to(a, r, e.r),
      i = r / 2,
      o = a / 2,
      s = (e.r * Math.PI) / 180,
      l = Math.abs(Math.cos(s)),
      c = Math.abs(Math.sin(s)),
      f = l * Fa + c * wt,
      u = c * Fa + l * wt;
    function p(b, k, L) {
      return Math.max(k, Math.min(L, b));
    }
    if (e.z > i) {
      var v = null,
        w = ie ? ir(a, r, ie.cars) : [],
        y;
      if (ra) for (y = 0; y < w.length; y++) Math.abs(e.x - w[y].c) <= w[y].w / 2 - f - 0.25 && (v = w[y]);
      return (
        v && e.z - u < i + 0.3
          ? (e.x = p(e.x, v.c - (v.w / 2 - f - 0.25), v.c + (v.w / 2 - f - 0.25)))
          : ((e.z = Math.max(e.z, i + u + 0.3)), (e.x = p(e.x, -(o + 40), o + 40))),
        (e.z = Math.min(e.z, i + 60)),
        e
      );
    }
    if (ra && e.z > n.zMax && ie) {
      var E = ir(a, r, ie.cars),
        M = null,
        g;
      for (g = 0; g < E.length; g++) Math.abs(e.x - E[g].c) <= E[g].w / 2 - f - 0.25 && (M = E[g]);
      if (M) return ((e.x = p(e.x, M.c - (M.w / 2 - f - 0.25), M.c + (M.w / 2 - f - 0.25))), e);
    }
    return ((e.x = p(e.x, -n.x, n.x)), (e.z = n.zMax < n.zMin ? 0 : p(e.z, n.zMin, n.zMax)), e);
  }
  function Gs(e, a) {
    return ee
      ? ee.map(function (r) {
          return Mi({ x: r.x, z: r.z, r: r.r }, a, e);
        })
      : Rs(e, a);
  }
  function zs(e, a) {
    var r = 2.95,
      n = 6.5,
      i = (-e.r * Math.PI) / 180,
      o = (-a.r * Math.PI) / 180,
      s = [
        [Math.cos(i), -Math.sin(i)],
        [Math.sin(i), Math.cos(i)],
        [Math.cos(o), -Math.sin(o)],
        [Math.sin(o), Math.cos(o)],
      ],
      l = a.x - e.x,
      c = a.z - e.z,
      f,
      u,
      p,
      v,
      w;
    for (f = 0; f < 4; f++)
      if (
        ((u = s[f][0]),
        (p = s[f][1]),
        (v =
          r * Math.abs(u * Math.cos(i) - p * Math.sin(i)) + n * Math.abs(u * Math.sin(i) + p * Math.cos(i))),
        (w =
          r * Math.abs(u * Math.cos(o) - p * Math.sin(o)) + n * Math.abs(u * Math.sin(o) + p * Math.cos(o))),
        Math.abs(l * u + c * p) >= v + w)
      )
        return !1;
    return !0;
  }
  function Lr(e, a, r) {
    var n = 0,
      i;
    for (i = 0; i < e.length; i++) i !== a && zs(r, e[i]) && n++;
    return n;
  }
  function zl() {
    return ee
      ? ee
          .map(function (e) {
            return e.x + "," + e.z + "," + e.r;
          })
          .join(";")
      : "auto";
  }
  function Pl(e, a, r) {
    var n = null,
      i = 1e9,
      o,
      s,
      l,
      c = to(a, r, 0),
      f;
    for (s = Math.ceil(c.zMin); s <= c.zMax; s++)
      for (o = -Math.floor(c.x); o <= c.x; o++)
        ((l = { x: o, z: s, r: 0 }),
          !(Lr(e, -1, l) > 0) && ((f = o * o + (s - r * 0.2) * (s - r * 0.2)), f < i && ((i = f), (n = l))));
    return n;
  }
  function Ps(e, a, r) {
    var n = [],
      i = to(a, r, 0),
      o,
      s,
      l,
      c;
    for (c = 0; c < e; c++) {
      for (l = null, s = Math.ceil(i.zMin); s <= i.zMax && !l; s++)
        for (o = -Math.floor(i.x); o <= i.x; o++)
          if (Lr(n, -1, { x: o, z: s, r: 0 }) === 0) {
            l = { x: o, z: s, r: 0 };
            break;
          }
      if (!l) return null;
      n.push(l);
    }
    return n;
  }
  function X0(e, a, r) {
    var n = Math.max(1, Math.min(e, Math.floor(a / 7))),
      i = Math.ceil(e / n),
      o = [],
      s,
      l,
      c,
      f,
      u = Math.min(a / n, 8.6),
      p = Math.min(14.5, Math.max(6, (r - 5) / i));
    for (s = 0; s < e; s++)
      ((l = Math.floor(s / n)),
        (c = s % n),
        (f = Math.min(n, e - l * n)),
        o.push(Mi({ x: (c - (f - 1) / 2) * u, z: (l - (i - 1) / 2) * p, r: 0 }, a, r)));
    return o;
  }
  function ao(e) {
    return e.map(function (a) {
      return {
        x: Math.round(a.x * 10) / 10,
        z: Math.round(a.z * 10) / 10,
        r: ((Math.round(a.r) % 360) + 360) % 360,
      };
    });
  }
    function Il(e, a, r, n, i) {
    var o = Es(n),
      s = r.qty,
      l = [e, a, s, i, r.rows, r.segs, r.a, r.b, r.lumens, o.core, Er, parseFloat(V("ht").value) || 0, zl()].join("|");
    if (l !== zo) {
      zo = l;
      var L = Fo(n),
        k = r.rows,
        ze = Ls(e, a),
        ut = Gs(e, a),
        ia = Rl(r, n, a),
        Bt = r.spacing != null ? r.spacing : e / k,
        et = r.margin != null ? r.margin : Bt / 2;
      ie = {
        len: e,
        wid: a,
        plan: r,
        fixture: n,
        pieces: ia,
        rows: k,
        rowGap: Bt,
        rowMargin: et,
        cars: ze,
        spots: ut,
        isOver: L,
      };
      Rr && !eo && qs();
      eo = !1;
    }
  }

  var Rr = !1,
    ie = null,
    fe = null,
    qo = null,
    t = null,
    Fe = "all",
    on = 100,
    ct = !0,
    zt = "day",
    ra = !1,
    Ol = window.LC_THREE_URL || "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js",
    Wo = null,
    Ln = null,
    Yt = {
      asphalt: { map: "", normal: "", roughness: "" },
      ground: { map: "", normal: "", roughness: "" },
      steel: { normal: "", roughness: "" },
      pine: { map: "" },
      shrub: { map: "" },
    };
  window.LC_TEXTURE_ASSETS &&
    Object.keys(window.LC_TEXTURE_ASSETS).forEach(function (e) {
      Yt[e] = Object.assign({}, Yt[e], window.LC_TEXTURE_ASSETS[e]);
    });
  var qe = {
    exposure: 1.0,
    fogColor: 0x2b3558,
    fogDensity: 0.0035,
    skyTop: 0x1c2a60,
    skyBand: 0x6a5a9a,
    lampColor: 16772320,
    lampIntensity: 520,
    lampDistance: 58,
    lampCount: 5,
    bulbEmissive: 2.4,
    headColor: 15660799,
    headIntensity: 600,
    headDistance: 310,
    headAngle: Math.PI / 4.6,
    headPenumbra: 0.6,
    headDecay: 1.3,
    tailIntensity: 2,
    rearColor: 16716049,
    rearIntensity: 28,
    rearDistance: 16,
    bloomThreshold: 0.85,
    bloomStrength: 0.6,
    bloomRadius: 0.4,
    fovRest: 54,
    fovTop: 64,
  };
  function Is() {
    return window.LC_QUALITY === "high" || window.LC_QUALITY === "lite"
      ? window.LC_QUALITY
      : qn() || (navigator.hardwareConcurrency || 8) <= 4
        ? "lite"
        : "high";
  }
  function Rn(e, a, r, n) {
    var i = ca(r),
      o = document.createElement("canvas"),
      s,
      l;
    for (
      o.width = e,
        o.height = a,
        s = o.getContext("2d"),
        s.fillStyle = "rgb(" + (n.base || 128) + "," + (n.base || 128) + "," + (n.base || 128) + ")",
        s.fillRect(0, 0, e, a),
        l = 0;
      l < n.n;
      l++
    ) {
      var c = Math.floor(n.lo + i() * (n.hi - n.lo)),
        f = i() * e,
        u = i() * a,
        p = n.r * (0.4 + i());
      ((s.fillStyle = "rgba(" + c + "," + c + "," + c + "," + (0.25 + i() * 0.45).toFixed(2) + ")"),
        n.sx ? s.fillRect(f, u, p * n.sx, 1) : (s.beginPath(), s.arc(f, u, p, 0, 6.2832), s.fill()));
    }
    return o;
  }
  function No(e, a) {
    var r = e.width,
      n = e.height,
      i = e.getContext("2d").getImageData(0, 0, r, n).data,
      o = document.createElement("canvas"),
      s,
      l,
      c,
      f,
      u,
      p,
      v,
      w;
    ((o.width = r), (o.height = n), (s = o.getContext("2d")), (l = s.createImageData(r, n)));
    var y = function (E, M) {
      return i[(((M + n) % n) * r + ((E + r) % r)) * 4] / 255;
    };
    for (f = 0; f < n; f++)
      for (c = 0; c < r; c++)
        ((u = (y(c + 1, f) - y(c - 1, f)) * a),
          (p = (y(c, f + 1) - y(c, f - 1)) * a),
          (v = Math.sqrt(u * u + p * p + 1)),
          (w = (f * r + c) * 4),
          (l.data[w] = Math.round(((-u / v) * 0.5 + 0.5) * 255)),
          (l.data[w + 1] = Math.round(((p / v) * 0.5 + 0.5) * 255)),
          (l.data[w + 2] = Math.round(((1 / v) * 0.5 + 0.5) * 255)),
          (l.data[w + 3] = 255));
    return (s.putImageData(l, 0, 0), o);
  }
  var Gn = {
    asphaltN: function () {
      return No(Rn(128, 128, 21, { n: 2600, lo: 60, hi: 200, r: 1.3 }), 1);
    },
    asphaltR: function () {
      return Rn(128, 128, 22, { base: 235, n: 1800, lo: 175, hi: 252, r: 7 });
    },
    steelN: function () {
      return No(Rn(256, 64, 31, { n: 1300, lo: 70, hi: 190, r: 5, sx: 12 }), 1.4);
    },
    steelR: function () {
      return Rn(256, 64, 32, { base: 215, n: 900, lo: 150, hi: 255, r: 5, sx: 12 });
    },
    mossN: function () {
      return No(Rn(128, 128, 41, { n: 900, lo: 60, hi: 200, r: 4 }), 2);
    },
    mossR: function () {
      return Rn(128, 128, 42, { base: 245, n: 300, lo: 210, hi: 255, r: 6 });
    },
  };
  function sn(e, a, r, n, i, o, s) {
    var l = function (f) {
      return (
        (f.wrapS = f.wrapT = e.RepeatWrapping),
        f.repeat.set(n, i),
        (f.anisotropy = t.renderer.capabilities.getMaxAnisotropy()),
        r && e.SRGBColorSpace && (f.colorSpace = e.SRGBColorSpace),
        f
      );
    };
    if ((o && s(l(new e.CanvasTexture(o()))), !!a))
      try {
        var c = new e.TextureLoader();
        (c.setCrossOrigin("anonymous"),
          c.load(a, function (f) {
            (s(l(f)), ye());
          }));
      } catch {}
  }
  function Dl(e, a) {
    var r = new e.PMREMGenerator(a),
      n = new e.Scene(),
      i = new e.SphereGeometry(60, 32, 24),
      o = i.attributes.position,
      s = [],
      l,
      c,
      f = new e.Color(),
      u = new e.Color(qe.fogColor),
      p = new e.Color(qe.skyBand),
      v = new e.Color(qe.skyTop),
      w = new e.Color(462108);
    for (l = 0; l < o.count; l++)
      ((c = o.getY(l) / 60),
        c < 0
          ? f.copy(u).lerp(p, Math.max(0, 1 + c * 7))
          : (f.copy(p).lerp(v, Math.min(1, c / 0.3)), c > 0.3 && f.lerp(w, Math.min(1, (c - 0.3) / 0.7))),
        f.multiplyScalar(1.6),
        s.push(f.r, f.g, f.b));
    (i.setAttribute("color", new e.Float32BufferAttribute(s, 3)),
      n.add(new e.Mesh(i, new e.MeshBasicMaterial({ vertexColors: !0, side: e.BackSide }))));
    var y = new e.MeshBasicMaterial({ color: new e.Color(5, 4.6, 4.4) });
    [
      [-34, 18, -20],
      [34, 18, -20],
      [-34, 18, 22],
      [34, 18, 22],
      [0, 30, -50],
    ].forEach(function (M) {
      var g = new e.Mesh(new e.BoxGeometry(1.6, 0.8, 7), y);
      (g.position.set(M[0], M[1], M[2]), n.add(g));
    });
    var E = r.fromScene(n, 0.02).texture;
    return (r.dispose(), E);
  }
  function Os(e, a, r, n) {
    var i = [],
      o = [],
      s = [],
      l = [],
      c,
      f;
    for (c = 0; c < n; c++) {
      f = (c / n) * Math.PI;
      var u = (Math.cos(f) * a) / 2,
        p = (Math.sin(f) * a) / 2,
        v = c * 4;
      (i.push(-u, 0, -p, u, 0, p, u, r, p, -u, r, -p),
        o.push(0, 0, 1, 0, 1, 1, 0, 1),
        s.push(0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 1, 1, 1, 1, 1, 1),
        l.push(v, v + 1, v + 2, v, v + 2, v + 3));
    }
    var w = new e.BufferGeometry();
    (w.setAttribute("position", new e.Float32BufferAttribute(i, 3)),
      w.setAttribute("uv", new e.Float32BufferAttribute(o, 2)),
      w.setAttribute("color", new e.Float32BufferAttribute(s, 3)));
    var y = [],
      E;
    for (E = 0; E < i.length / 3; E++) {
      /* Normals fan out from the trunk so the canopy shades like a rounded shape, not a flat card. */
      var nx = i[E * 3] * 0.09,
        ny = 0.85,
        nz = i[E * 3 + 2] * 0.09,
        nl = Math.hypot(nx, ny, nz);
      y.push(nx / nl, ny / nl, nz / nl);
    }
    return (w.setAttribute("normal", new e.Float32BufferAttribute(y, 3)), w.setIndex(l), w);
  }
  function Fl() {
    var e = document.createElement("canvas");
    ((e.width = 512), (e.height = 384));
    var a = e.getContext("2d"),
      r = ca(5),
      n;
    for (a.scale(2, 2), n = 0; n < 150; n++) {
      var i = -Math.PI / 2 + (r() - 0.5) * 2.5,
        o = 40 + r() * 70,
        s = 128 + (r() - 0.5) * 60,
        l = 190,
        c = s + Math.cos(i) * o,
        f = l + Math.sin(i) * o * 1.1;
      ((a.strokeStyle = "hsl(" + (112 + r() * 28) + "," + (30 + r() * 20) + "%," + (10 + r() * 20) + "%)"),
        (a.lineWidth = 3 + r() * 5),
        (a.lineCap = "round"),
        a.beginPath(),
        a.moveTo(s, l),
        a.lineTo(c, f),
        a.stroke(),
        (a.fillStyle = "hsl(" + (105 + r() * 30) + "," + (35 + r() * 25) + "%," + (16 + r() * 26) + "%)"),
        a.beginPath(),
        a.ellipse(c, f, 9 + r() * 9, 5 + r() * 6, i, 0, 6.2832),
        a.fill());
    }
    return e;
  }
  function ql() {
    var e = document.createElement("canvas");
    ((e.width = 512), (e.height = 1024));
    var a = e.getContext("2d"),
      r = ca(9),
      n,
      i,
      j;
    a.scale(2, 2);
    var tg = a.createLinearGradient(0, 0, 16, 0);
    (tg.addColorStop(0, "#1c130d"), tg.addColorStop(0.5, "#3a281b"), tg.addColorStop(1, "#1c130d"));
    for (a.fillStyle = tg, a.fillRect(120, 430, 16, 82), n = 0; n < 11; n++) {
      var top = 14 + n * 40,
        wd = 26 + n * 11,
        bot = top + 96;
      a.save();
      a.beginPath();
      a.moveTo(128, top);
      for (i = 1; i <= 12; i++) a.lineTo(128 + (wd * i) / 12 + (r() - 0.3) * 7, top + ((bot - top) * i) / 12 + (i % 2 ? 5 : -3));
      a.lineTo(128, bot - 10);
      for (i = 12; i >= 1; i--) a.lineTo(128 - (wd * i) / 12 - (r() - 0.3) * 7, top + ((bot - top) * i) / 12 + (i % 2 ? 5 : -3));
      a.closePath();
      var tgr = a.createLinearGradient(0, top, 0, bot);
      (tgr.addColorStop(0, "hsl(" + (138 + r() * 8) + ",34%," + (13 + n * 0.9) + "%)"),
        tgr.addColorStop(1, "hsl(" + (140 + r() * 8) + ",30%," + (6 + n * 0.5) + "%)"));
      a.fillStyle = tgr;
      a.fill();
      a.clip();
      for (j = 0; j < 130; j++) {
        var ang = Math.PI / 2 + (r() - 0.5) * 2.4,
          sx = 128 + (r() - 0.5) * wd * 1.5,
          sy = top + r() * (bot - top) * 0.8,
          ln = 6 + r() * 14;
        ((a.strokeStyle = "hsl(" + (118 + r() * 34) + "," + (30 + r() * 20) + "%," + (9 + r() * 20 + n * 0.7) + "%)"),
          (a.lineWidth = 0.8 + r() * 1.4),
          (a.lineCap = "round"),
          a.beginPath(),
          a.moveTo(sx, sy),
          a.lineTo(sx + Math.cos(ang) * ln * 0.6, sy + Math.sin(ang) * ln),
          a.stroke());
      }
      a.restore();
    }
    return e;
  }
  function ql_old() {
    var e = document.createElement("canvas");
    ((e.width = 256), (e.height = 512));
    var a = e.getContext("2d"),
      r = ca(9),
      n,
      i;
    for (a.fillStyle = "#2a1e16", a.fillRect(120, 440, 16, 72), n = 0; n < 9; n++) {
      var o = 20 + n * 46,
        s = 22 + n * 12,
        l = o + 78;
      for (
        a.fillStyle = "hsl(" + (140 + r() * 12) + "," + (34 + r() * 12) + "%," + (9 + n * 1.1) + "%)",
          a.beginPath(),
          a.moveTo(128, o),
          i = 1;
        i <= 7;
        i++
      )
        a.lineTo(128 + (s * i) / 7 + (r() - 0.3) * 10, o + ((l - o) * i) / 7 + (i % 2 ? 6 : -4));
      for (a.lineTo(128, l - 8), i = 7; i >= 1; i--)
        a.lineTo(128 - (s * i) / 7 - (r() - 0.3) * 10, o + ((l - o) * i) / 7 + (i % 2 ? 6 : -4));
      for (
        a.closePath(),
          a.fill(),
          a.strokeStyle = "hsl(" + (130 + r() * 15) + ",32%," + (20 + n) + "%)",
          a.lineWidth = 2,
          i = 0;
        i < 10;
        i++
      ) {
        var c = 128 + (r() - 0.5) * s * 1.6,
          f = o + 10 + r() * 60;
        (a.beginPath(), a.moveTo(c, f), a.lineTo(c + (r() - 0.5) * 14, f + 10), a.stroke());
      }
    }
    return e;
  }
  function Ds(e, a, r) {
    var n = new e.MeshLambertMaterial({
        color: 16777215,
        vertexColors: !0,
        alphaTest: 0.35,
        alphaToCoverage: !0,
        emissive: 0x1d3424,
        side: e.DoubleSide,
      }),
      i = new e.CanvasTexture(a());
    n.onBeforeCompile = function (sh) {
      sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", "#include <map_fragment>\n diffuseColor.rgb = max(diffuseColor.rgb, vec3(0.013, 0.042, 0.016));");
    };
    if (
      ((i.anisotropy = t.renderer.capabilities.getMaxAnisotropy()),
      e.SRGBColorSpace && (i.colorSpace = e.SRGBColorSpace),
      (n.map = i),
      r)
    )
      try {
        var o = new e.TextureLoader();
        (o.setCrossOrigin("anonymous"),
          o.load(r, function (s) {
            ((s.anisotropy = i.anisotropy),
              e.SRGBColorSpace && (s.colorSpace = e.SRGBColorSpace),
              (n.map = s),
              (n.needsUpdate = !0),
              ye());
          }));
      } catch {}
    return n;
  }
  function Vo(e) {
    if (!(!t || !fe)) {
      var a = fe,
        r = t.renderer,
        n = t.cineLvl || 0,
        i = !!e && Is() === "high" && n < 3;
      if (
        ((t.cineOn = !!e),
        (t.cineHigh = i),
        (t.bloomOn = i && n < 1 && !(t.bl && t.bl.fail)),
        (r.outputColorSpace = a.SRGBColorSpace),
        (r.toneMapping = e ? a.ACESFilmicToneMapping : a.NoToneMapping),
        (r.toneMappingExposure = e ? qe.exposure : 1),
        e && !t.duskEnv)
      )
        try {
          t.duskEnv = Dl(a, r);
        } catch {
          t.duskEnv = null;
        }
      ((t.scene.environment = e && t.duskEnv ? t.duskEnv : null),
        (t.cineSw || []).forEach(function (s) {
          s.mesh.material = i ? s.pbr : s.basic;
        }));
      var o = [t.lampPoleM, t.lampHousM].filter(Boolean);
      (o.forEach(function (s) {
        (i
          ? (s.userData.keep ||
              (s.userData.keep = {
                c: s.color.clone(),
                r: s.roughness,
                m: s.metalness,
                e: s.envMapIntensity,
              }),
            (s.userData.noTint = !0),
            s.color.setHex(12107980),
            (s.metalness = 0.82),
            (s.roughness = 0.32),
            (s.envMapIntensity = 1.3))
          : s.userData.keep &&
            ((s.userData.noTint = !1),
            (s.roughness = s.userData.keep.r),
            (s.metalness = s.userData.keep.m),
            (s.envMapIntensity = s.userData.keep.e)),
          (s.needsUpdate = !0));
      }),
        (t.pl || []).forEach(function (s) {
          s.visible = !i;
        }),
        (t.slights || []).forEach(function (s) {
          ((s.visible = i), (s.userData.pole = -1));
        }),
        t.trackLamps && t.trackLamps.set(zt === "night"),
        t.pools && (t.pools.material.opacity = i ? 0.7 : 1),
        t.cineHigh && ((t.hemi.intensity = 0.7), (t.sun.intensity = 0.45)),
        t.envTone && t.envTone(zt === "night"),
        (t.cfWarm = 0),
        (t.cfBad = 0),
        (t.cfEma = 0.016),
        zn(),
        ye());
    }
  }
  function Wl(e) {
    var a = t.slights,
      r = t.trackLamps,
      n = t.drive;
    if (!(!a || !a.length || !r || !n || !t.cineHigh)) {
      var i = ee[n.i];
      if (i && ((t.cpT = (t.cpT || 0) + e), !(t.cpT < 0.1))) {
        t.cpT = 0;
        var o = i.x - (t.cpX === void 0 ? i.x : t.cpX),
          s = i.z - (t.cpZ === void 0 ? i.z : t.cpZ),
          l = Math.sqrt(o * o + s * s);
        ((t.cpX = i.x), (t.cpZ = i.z));
        var c = l > 0.05 ? o / l : t.cpFx || 0,
          f = l > 0.05 ? s / l : t.cpFz || 1;
        ((t.cpFx = c), (t.cpFz = f));
        var u = r.heads,
          p = (t.cineLvl || 0) >= 2 ? 2 : a.length,
          v = [],
          w;
        for (w = 0; w < u.length; w++) {
          var y = u[w][0] - i.x,
            E = u[w][2] - i.z;
          v.push([Math.sqrt(y * y + E * E) - 0.45 * (y * c + E * f), w]);
        }
        v.sort(function (k, L) {
          return k[0] - L[0];
        });
        var M = v.slice(0, p).map(function (k) {
            return k[1];
          }),
          g = {},
          b = [];
        (a.forEach(function (k, L) {
          if (L >= p) {
            k.visible = !1;
            return;
          }
          ((k.visible = !0),
            M.indexOf(k.userData.pole) !== -1 && !g[k.userData.pole] ? (g[k.userData.pole] = 1) : b.push(k));
        }),
          M.forEach(function (k) {
            if (!g[k]) {
              var L = b.pop();
              L && ((L.userData.pole = k), L.position.set(u[k][0], u[k][1] - 0.6, u[k][2]));
            }
          }));
      }
    }
  }
  function Nl() {
    var e = performance.now(),
      a = Math.min(0.1, (e - (t.cfT || e)) / 1e3);
    if (((t.cfT = e), Wl(a), !(a <= 0))) {
      if (
        ((t.cfEma = (t.cfEma || a) * 0.96 + a * 0.04),
        (t.cfWarm = (t.cfWarm || 0) + 1),
        t.raceOn &&
          !window.LC_NOADAPT &&
          t.cfWarm > 150 &&
          (t.cineLvl || 0) < 3 &&
          (t.cfEma > 0.027 ? (t.cfBad = (t.cfBad || 0) + 1) : (t.cfBad = Math.max(0, (t.cfBad || 0) - 1)),
          t.cfBad > 90))
      ) {
        ((t.cineLvl = (t.cineLvl || 0) + 1), Vo(!0));
        return;
      }
      /fps/.test(location.hash) &&
        (t.fpsEl ||
          ((t.fpsEl = document.createElement("div")),
          (t.fpsEl.style.cssText =
            "position:absolute;left:8px;top:8px;z-index:9;padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.65);color:#9f9;font:11px/1.3 monospace;pointer-events:none"),
          t.host.appendChild(t.fpsEl)),
        e - (t.fpsT || 0) > 400 &&
          ((t.fpsT = e),
          (t.fpsEl.textContent =
            Math.round(1 / (t.cfEma || 0.016)) +
            " fps  " +
            Is() +
            "  L" +
            (t.cineLvl || 0) +
            (t.bloomOn ? "  bloom" : "") +
            (t.cineHigh ? "  lights" : ""))));
    }
  }
  function Vl(e) {
    var a = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      r = (t.bl = { fail: !1, w: 0, h: 0, v: new e.Vector2(), z: new e.Vector2(0, 0) }),
      n = function () {
        return new e.WebGLRenderTarget(4, 4, {
          minFilter: e.LinearFilter,
          magFilter: e.LinearFilter,
          depthBuffer: !1,
        });
      };
    ((r.a = [n(), n(), n()]),
      (r.b = [n(), n(), n()]),
      (r.cam = new e.OrthographicCamera(-1, 1, 1, -1, 0, 1)),
      (r.scn = new e.Scene()),
      (r.quad = new e.Mesh(new e.PlaneGeometry(2, 2))),
      (r.quad.frustumCulled = !1),
      r.scn.add(r.quad));
    var i = { vertexShader: a, depthTest: !1, depthWrite: !1, toneMapped: !1 };
    return (
      (r.mBright = new e.ShaderMaterial(
        Object.assign(
          {
            uniforms: { tDiffuse: { value: null }, thr: { value: qe.bloomThreshold } },
            fragmentShader:
              "uniform sampler2D tDiffuse; uniform float thr; varying vec2 vUv; void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; float l = max(c.r, max(c.g, c.b)); float k = smoothstep(thr, thr + 0.1, l); gl_FragColor = vec4(c * k, 1.0); }",
          },
          i,
        ),
      )),
      (r.mBlur = new e.ShaderMaterial(
        Object.assign(
          {
            uniforms: { tDiffuse: { value: null }, dir: { value: new e.Vector2(1, 0) } },
            fragmentShader:
              "uniform sampler2D tDiffuse; uniform vec2 dir; varying vec2 vUv; void main(){ vec3 s = texture2D(tDiffuse, vUv).rgb * 0.227027; s += (texture2D(tDiffuse, vUv + dir).rgb + texture2D(tDiffuse, vUv - dir).rgb) * 0.1945946; s += (texture2D(tDiffuse, vUv + dir * 2.0).rgb + texture2D(tDiffuse, vUv - dir * 2.0).rgb) * 0.1216216; s += (texture2D(tDiffuse, vUv + dir * 3.0).rgb + texture2D(tDiffuse, vUv - dir * 3.0).rgb) * 0.054054; s += (texture2D(tDiffuse, vUv + dir * 4.0).rgb + texture2D(tDiffuse, vUv - dir * 4.0).rgb) * 0.016216; gl_FragColor = vec4(s, 1.0); }",
          },
          i,
        ),
      )),
      (r.mAdd = new e.ShaderMaterial(
        Object.assign(
          {
            uniforms: {
              t0: { value: null },
              t1: { value: null },
              t2: { value: null },
              str: { value: qe.bloomStrength },
            },
            transparent: !0,
            blending: e.AdditiveBlending,
            fragmentShader:
              "uniform sampler2D t0, t1, t2; uniform float str; varying vec2 vUv; void main(){ vec3 c = str * (texture2D(t0, vUv).rgb + 0.85 * texture2D(t1, vUv).rgb + 0.7 * texture2D(t2, vUv).rgb); gl_FragColor = vec4(c, 1.0); }",
          },
          i,
        ),
      )),
      r
    );
  }
  function Ho(e, a, r, n, i, o) {
    var s = t.bl;
    ((s.quad.material = a),
      (a.uniforms.tDiffuse.value = r),
      a === s.mBlur && a.uniforms.dir.value.set(i, o),
      e.setRenderTarget(n),
      e.render(s.scn, s.cam));
  }
  function Hl() {
    var e = fe,
      a = t.renderer,
      r = t.bl || Vl(e),
      n;
    if ((a.render(t.scene, t.camera), !r.fail))
      try {
        a.getDrawingBufferSize(r.v);
        var i = Math.max(8, Math.floor(r.v.x)),
          o = Math.max(8, Math.floor(r.v.y));
        if (i !== r.w || o !== r.h)
          for (
            r.w = i, r.h = o, r.fb && r.fb.dispose(), r.fb = new e.FramebufferTexture(i, o), n = 0;
            n < 3;
            n++
          ) {
            var s = Math.max(4, i >> (n + 1)),
              l = Math.max(4, o >> (n + 1));
            (r.a[n].setSize(s, l), r.b[n].setSize(s, l));
          }
        var c = 0.6 + qe.bloomRadius * 2.4,
          f = a.autoClear;
        for (a.copyFramebufferToTexture(r.z, r.fb), Ho(a, r.mBright, r.fb, r.a[0]), n = 0; n < 3; n++) {
          var u = n === 0 ? r.a[0] : r.a[n - 1];
          (Ho(a, r.mBlur, u.texture, r.b[n], (1 / u.width) * c, 0),
            Ho(a, r.mBlur, r.b[n].texture, r.a[n], 0, (1 / r.b[n].height) * c));
        }
        ((r.mAdd.uniforms.t0.value = r.a[0].texture),
          (r.mAdd.uniforms.t1.value = r.a[1].texture),
          (r.mAdd.uniforms.t2.value = r.a[2].texture),
          (r.quad.material = r.mAdd),
          (a.autoClear = !1),
          a.setRenderTarget(null),
          a.render(r.scn, r.cam),
          (a.autoClear = f));
      } catch {
        ((r.fail = !0), a.setRenderTarget(null), (a.autoClear = !0), (t.bloomOn = !1));
      }
  }
  /* Unpack a car file stored with lossless meshopt compression back into a plain glb for Ul. */
  function merMoUnpack(ab) {
    var dv = new DataView(ab), n = 12, js = null, bin = null;
    if (dv.getUint32(0, !0) !== 1179937895) return ab;
    while (n < ab.byteLength) {
      var len = dv.getUint32(n, !0), typ = dv.getUint32(n + 4, !0);
      typ === 1313821514 ? (js = JSON.parse(new TextDecoder().decode(new Uint8Array(ab, n + 8, len)))) : typ === 5130562 && (bin = new Uint8Array(ab, n + 8, len));
      n += 8 + len;
    }
    if (!js || (js.extensionsUsed || []).indexOf("EXT_meshopt_compression") < 0) return ab;
    var D = window.MeshoptDecoder;
    if (!D) throw new Error("The car decoder is missing.");
    return D.ready.then(function () {
      var parts = [], off = 0;
      js.bufferViews.forEach(function (bv) {
        var ex = bv.extensions && bv.extensions.EXT_meshopt_compression, data;
        if (ex) {
          data = new Uint8Array(ex.count * ex.byteStride);
          D.decodeGltfBuffer(data, ex.count, ex.byteStride, bin.subarray(ex.byteOffset || 0, (ex.byteOffset || 0) + ex.byteLength), ex.mode, ex.filter || "NONE");
          delete bv.extensions.EXT_meshopt_compression;
        } else data = bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
        var pad = (4 - (off % 4)) % 4;
        pad && (parts.push(new Uint8Array(pad)), (off += pad));
        bv.buffer = 0; bv.byteOffset = off; bv.byteLength = data.length;
        parts.push(data); off += data.length;
      });
      var tail = (4 - (off % 4)) % 4;
      tail && (parts.push(new Uint8Array(tail)), (off += tail));
      js.buffers = [{ byteLength: off }];
      js.extensionsUsed = (js.extensionsUsed || []).filter(function (x) { return x !== "EXT_meshopt_compression"; });
      js.extensionsRequired = (js.extensionsRequired || []).filter(function (x) { return x !== "EXT_meshopt_compression"; });
      var jb = new TextEncoder().encode(JSON.stringify(js)), jp = (4 - (jb.length % 4)) % 4, total = 12 + 8 + jb.length + jp + 8 + off,
        out = new Uint8Array(total), o = new DataView(out.buffer), p = 0;
      o.setUint32(0, 1179937895, !0); o.setUint32(4, 2, !0); o.setUint32(8, total, !0); p = 12;
      o.setUint32(p, jb.length + jp, !0); o.setUint32(p + 4, 1313821514, !0); out.set(jb, p + 8); for (var q = 0; q < jp; q++) out[p + 8 + jb.length + q] = 32; p += 8 + jb.length + jp;
      o.setUint32(p, off, !0); o.setUint32(p + 4, 5130562, !0); p += 8;
      parts.forEach(function (u) { out.set(u, p); p += u.length; });
      return out.buffer;
    });
  }
  function Ul(e, a) {
    var r = new DataView(a),
      n = 12,
      i = null,
      o = null;
    if (r.getUint32(0, !0) !== 1179937895) throw new Error("This is not a .glb file.");
    for (; n < a.byteLength;) {
      var s = r.getUint32(n, !0),
        l = r.getUint32(n + 4, !0);
      (l === 1313821514
        ? (i = JSON.parse(new TextDecoder().decode(new Uint8Array(a, n + 8, s))))
        : l === 5130562 && (o = a.slice(n + 8, n + 8 + s)),
        (n += 8 + s));
    }
    var c = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 },
      f = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 },
      u = { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 };
    function p(M, g, b, k) {
      return k === 5126
        ? g.getFloat32(b, !0)
        : k === 5125
          ? g.getUint32(b, !0)
          : k === 5123
            ? g.getUint16(b, !0)
            : k === 5122
              ? g.getInt16(b, !0)
              : k === 5121
                ? g.getUint8(b)
                : g.getInt8(b);
    }
    var v = new DataView(o);
    function w(M, g) {
      var b = i.accessors[M],
        k = i.bufferViews[b.bufferView],
        L = f[b.type],
        x = c[b.componentType],
        P = k.byteStride || L * x,
        h = (k.byteOffset || 0) + (b.byteOffset || 0),
        B = g
          ? b.componentType === 5125
            ? new Uint32Array(b.count)
            : new Uint16Array(b.count)
          : new Float32Array(b.count * L),
        G,
        z,
        Q;
      for (G = 0; G < b.count; G++)
        for (z = 0; z < L; z++)
          ((Q = p(b, v, h + G * P + z * x, b.componentType)),
            b.normalized && u[b.componentType] && (Q = Math.max(Q / u[b.componentType], -1)),
            (B[G * L + z] = Q));
      return B;
    }
    function y(M) {
      var g = i.nodes[M],
        b = new e.Group();
      return (
        (b.name = g.name || ""),
        g.matrix
          ? (b.matrix.fromArray(g.matrix), b.matrix.decompose(b.position, b.quaternion, b.scale))
          : (g.translation && b.position.fromArray(g.translation),
            g.rotation && b.quaternion.fromArray(g.rotation),
            g.scale && b.scale.fromArray(g.scale)),
        g.mesh !== void 0 &&
          i.meshes[g.mesh].primitives.forEach(function (k) {
            var L = new e.BufferGeometry();
            (L.setAttribute("position", new e.BufferAttribute(w(k.attributes.POSITION), 3)),
              k.attributes.NORMAL !== void 0
                ? L.setAttribute("normal", new e.BufferAttribute(w(k.attributes.NORMAL), 3))
                : L.computeVertexNormals(),
              k.indices !== void 0 && L.setIndex(new e.BufferAttribute(w(k.indices, !0), 1)));
            var x = new e.MeshStandardMaterial();
            ((x.name = (i.materials && k.material !== void 0 && i.materials[k.material].name) || ""),
              b.add(new e.Mesh(L, x)));
          }),
        (g.children || []).forEach(function (k) {
          b.add(y(k));
        }),
        b
      );
    }
    var E = new e.Group();
    return (
      i.scenes[i.scene || 0].nodes.forEach(function (M) {
        E.add(y(M));
      }),
      E
    );
  }
  function Xl(e) {
    return ce.carModel
      ? (Wo ||
          (Wo = (window.MER_CAR_P || Promise.resolve())
            .then(function () {
              if (window.MER_CAR_B64) {
                for (var bin = atob(window.MER_CAR_B64), u8 = new Uint8Array(bin.length), k = 0; k < bin.length; k++) u8[k] = bin.charCodeAt(k);
                /* car.js stores the car gzip compressed so the hosted page stays small */
                return window.MER_CAR_GZ ? new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer() : u8.buffer;
              }
              return fetch(ce.carModel).then(function (a) {
                if (!a.ok) throw new Error("The 3D car file was not found.");
                return /\.txt$/i.test(ce.carModel)
                  ? a.text().then(function (t64) {
                      for (var bin = atob(t64.trim()), u8 = new Uint8Array(bin.length), k = 0; k < bin.length; k++) u8[k] = bin.charCodeAt(k);
                      return u8.buffer;
                    })
                  : a.arrayBuffer();
              });
            })
            .then(merMoUnpack)
            .then(function (a) {
              merBoot("car", 0.5, "Decoding car");var _p=Ul(e,a);return ((Ln = jl(e, _p)), Ln);
            })
            .catch(function (a) {
              return (
                window.console &&
                  console.warn(
                    "Midnight Extreme Racer: the 3D car model did not load, so the built in car is used.",
                    a,
                  ),
                (Ln = null),
                null
              );
            })),
        Wo)
      : Promise.resolve(null);
  }
  function jl(e, a) {
    var r = new e.Box3().setFromObject(a),
      n = new e.Vector3(),
      i = new e.Vector3();
    (r.getSize(n), r.getCenter(i));
    var o = n.x > n.z;
    a.position.set(-i.x, -r.min.y, -i.z);
    var s = new e.Group();
    s.add(a);
    var l = new e.Group();
    l.add(s);
    var c = 14.6 / Math.max(n.x, n.z);
    (l.scale.setScalar(c), (l.rotation.y = o ? -Math.PI / 2 : Math.PI));
    var f = 0;
    a.traverse(function (x) {
      x.isMesh &&
        (f += (x.geometry.index ? x.geometry.index.count : x.geometry.attributes.position.count) / 3);
    });
    var u = f > 15e4;
    a.traverse(function (x) {
      if (x.isMesh) {
        if (((x.frustumCulled = !1), !u)) {
          var P = x.geometry;
          ((x.geometry = Zl(e, Yl(e, P, 52))), x.geometry !== P && P.dispose());
        }
        var h = String((x.material && x.material.name) || "").toLowerCase(),
          B;
        if (((x.userData.matName = h), h.indexOf("logo") !== -1)) {
          x.visible = !1;
          return;
        }
        if (h.indexOf("body_color") !== -1 || h === "car paint") {
          ((x.userData.body = !0), (x.material.side = e.DoubleSide));
          return;
        }
        h.indexOf("tyre") !== -1 || h.indexOf("tire") !== -1
          ? (B = new e.MeshStandardMaterial({ color: 1316637, roughness: 0.9 }))
          : h.indexOf("red") !== -1 || h.indexOf("tail_light") !== -1
            ? (B = new e.MeshStandardMaterial({ color: 10493470, emissive: 7999504, roughness: 0.3 }))
            : h.indexOf("black") !== -1 || h.indexOf("bkgr") !== -1
              ? (B = new e.MeshStandardMaterial({ color: 1382431, roughness: 0.55 }))
              : h.indexOf("tint") !== -1 ||
                  h.indexOf("matte glass") !== -1 ||
                  h.indexOf("glass_window") !== -1
                ? (B = new e.MeshPhysicalMaterial({ color: 0x080b10, roughness: 0.08, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.4 }))
                : h.indexOf("chrome") !== -1 || h.indexOf("mirror") !== -1
                  ? (B = new e.MeshStandardMaterial({ color: 13818339, roughness: 0.2, metalness: 1 }))
                  : h.indexOf("rim") !== -1 ||
                      h.indexOf("alumin") !== -1 ||
                      h.indexOf("silver") !== -1 ||
                      h.indexOf("metal") !== -1 ||
                      h.indexOf("brake") !== -1 ||
                      h.indexOf("glossy") !== -1
                    ? (B = new e.MeshStandardMaterial({ color: 9344675, roughness: 0.35, metalness: 0.85 }))
                    : h === "glass"
                      ? (B = new e.MeshPhysicalMaterial({
                          color: 0x080b10,
                          roughness: 0.08,
                          metalness: 0.1,
                          clearcoat: 1,
                          clearcoatRoughness: 0.05,
                          envMapIntensity: 1.4,
                          transparent: !0,
                          opacity: 0.6,
                          depthWrite: !1,
                        }))
                      : h.indexOf("glass") !== -1 || h.indexOf("light") !== -1
                        ? (B = new e.MeshStandardMaterial({
                            color: 15265531,
                            emissive: 10135485,
                            roughness: 0.15,
                          }))
                        : (B = new e.MeshStandardMaterial({ color: 1382431, roughness: 0.6 }));
        (h.indexOf("tint") !== -1 || h.indexOf("glass") !== -1) &&
          h.indexOf("light") === -1 &&
          ((B.userData = B.userData || {}), (B.userData.carGlass = !0), (B.envMapIntensity = 1.4));
        var G = String((x.parent && x.parent.name) || "").toLowerCase();
        ((h.indexOf("tyre") !== -1 ||
          h.indexOf("tire") !== -1 ||
          h.indexOf("rim") !== -1 ||
          h.indexOf("brake") !== -1 ||
          h.indexOf("alumin") !== -1 ||
          /tire|tyre|rim|brake/.test(G)) &&
          (x.userData.wheel = !0),
          (B.side = e.DoubleSide),
          (x.material = B));
      }
    });
    try {
      l.updateMatrixWorld(!0);
      var p = new e.Matrix4().copy(a.matrixWorld).invert(),
        v = new e.Matrix4(),
        w = new e.Vector3(),
        y = o ? 0 : 2,
        E = [],
        M = 0,
        g = 0;
      a.traverse(function (x) {
        if (!(!x.isMesh || !x.geometry)) {
          var P = String(x.userData.matName || "").toLowerCase();
          if ((P.indexOf("brake") !== -1 && E.push(x), P.indexOf("headlights light") !== -1)) {
            v.multiplyMatrices(p, x.matrixWorld);
            var h = x.geometry.attributes.position,
              B;
            for (B = 0; B < h.count; B += 3)
              (w.fromBufferAttribute(h, B).applyMatrix4(v), (M += y === 0 ? w.x : w.z), g++);
          }
        }
      });
      var b = y === 0 ? i.x : i.z,
        k = g && M / g < b ? -1 : 1,
        L = new e.MeshStandardMaterial({ color: 13112347, roughness: 0.32, metalness: 0.35 });
      E.forEach(function (x) {
        var P = new e.Box3(),
          h = x.geometry.attributes.position,
          B;
        for (v.multiplyMatrices(p, x.matrixWorld), B = 0; B < h.count; B += 2)
          (w.fromBufferAttribute(h, B).applyMatrix4(v), P.expandByPoint(w));
        var G = P.getSize(new e.Vector3()),
          z = P.getCenter(new e.Vector3()),
          Q = G.x < G.z ? 0 : 2;
        if (!(G.y < G[Q === 0 ? "x" : "z"])) {
          var J = Q === 0 ? 2 : 0,
            q = Math.max(G.y, J === 0 ? G.x : G.z) / 2,
            O = Q === 0 ? G.x : G.z,
            F = [0, 0, 0];
          ((F[Q] = Math.max(O * 3.2, q * 0.34)), (F[J] = q * 0.62), (F[1] = q * 0.3));
          var I = new e.Mesh(new e.BoxGeometry(F[0], F[1], F[2]), L),
            N = [z.x, z.y, z.z];
          ((N[J] += k * q * 0.66),
            (N[1] += q * 0.46),
            I.position.set(N[0], N[1], N[2]),
            (I.userData.keep = !0),
            a.add(I));
        }
      });
    } catch {}
    return (
      _l(e, l, function (x) {
        return !!x.userData.wheel;
      }),
      l
    );
  }
  function Yl(e, a, r) {
    var n = a.index ? a.toNonIndexed() : a,
      i = n.attributes.position,
      o = i.count,
      s = Math.cos((r * Math.PI) / 180),
      l,
      c,
      f = new Float32Array(o * 3),
      u = new Float32Array(o),
      p,
      v,
      w,
      y,
      E,
      M,
      g,
      b,
      k,
      L,
      x,
      P,
      h,
      B = [1e9, 1e9, 1e9],
      G = [-1e9, -1e9, -1e9];
    for (l = 0; l < o; l++)
      ((B[0] = Math.min(B[0], i.getX(l))),
        (B[1] = Math.min(B[1], i.getY(l))),
        (B[2] = Math.min(B[2], i.getZ(l))),
        (G[0] = Math.max(G[0], i.getX(l))),
        (G[1] = Math.max(G[1], i.getY(l))),
        (G[2] = Math.max(G[2], i.getZ(l))));
    var z = Math.max(
      1e-9,
      Math.sqrt(Math.pow(G[0] - B[0], 2) + Math.pow(G[1] - B[1], 2) + Math.pow(G[2] - B[2], 2)) * 2e-6,
    );
    for (l = 0; l < o; l += 3)
      for (
        p = i.getX(l),
          v = i.getY(l),
          w = i.getZ(l),
          y = i.getX(l + 1) - p,
          E = i.getY(l + 1) - v,
          M = i.getZ(l + 1) - w,
          g = i.getX(l + 2) - p,
          b = i.getY(l + 2) - v,
          k = i.getZ(l + 2) - w,
          L = E * k - M * b,
          x = M * g - y * k,
          P = y * b - E * g,
          h = Math.sqrt(L * L + x * x + P * P),
          c = 0;
        c < 3;
        c++
      )
        ((u[l + c] = h),
          h > 0 && ((f[(l + c) * 3] = L / h), (f[(l + c) * 3 + 1] = x / h), (f[(l + c) * 3 + 2] = P / h)));
    var Q = new Map(),
      J,
      q;
    for (l = 0; l < o; l++)
      ((J = Math.round(i.getX(l) / z) + "_" + Math.round(i.getY(l) / z) + "_" + Math.round(i.getZ(l) / z)),
        (q = Q.get(J)),
        q || ((q = []), Q.set(J, q)),
        q.push(l));
    var O = new Float32Array(o * 3),
      F,
      I,
      N,
      K,
      ne,
      T,
      ae;
    return (
      Q.forEach(function (ue) {
        for (l = 0; l < ue.length; l++) {
          for (K = ue[l], F = 0, I = 0, N = 0, c = 0; c < ue.length; c++)
            ((ne = ue[c]),
              (T = f[K * 3] * f[ne * 3] + f[K * 3 + 1] * f[ne * 3 + 1] + f[K * 3 + 2] * f[ne * 3 + 2]),
              T >= s &&
                ((ae = u[ne]), (F += f[ne * 3] * ae), (I += f[ne * 3 + 1] * ae), (N += f[ne * 3 + 2] * ae)));
          ((h = Math.sqrt(F * F + I * I + N * N) || 1),
            (O[K * 3] = F / h),
            (O[K * 3 + 1] = I / h),
            (O[K * 3 + 2] = N / h));
        }
      }),
      n.setAttribute("normal", new e.BufferAttribute(O, 3)),
      n
    );
  }
  function Zl(e, a) {
    var r = a.attributes.position,
      n = a.attributes.normal,
      i = r.count,
      o,
      s,
      l = new Map(),
      c = new Float32Array(i * 3),
      f;
    if (i / 3 > 12e3) return a;
    a.computeBoundingBox();
    var u = a.boundingBox,
      p = Math.max(1e-9, u.min.distanceTo(u.max) * 2e-6),
      v = new Array(i);
    for (o = 0; o < i; o++) {
      ((s = Math.round(r.getX(o) / p) + "_" + Math.round(r.getY(o) / p) + "_" + Math.round(r.getZ(o) / p)),
        (v[o] = s));
      var w = l.get(s);
      (w || ((w = [0, 0, 0]), l.set(s, w)), (w[0] += n.getX(o)), (w[1] += n.getY(o)), (w[2] += n.getZ(o)));
    }
    for (o = 0; o < i; o++) {
      var y = l.get(v[o]),
        E = Math.sqrt(y[0] * y[0] + y[1] * y[1] + y[2] * y[2]) || 1;
      ((c[o * 3] = y[0] / E), (c[o * 3 + 1] = y[1] / E), (c[o * 3 + 2] = y[2] / E));
    }
    var M = new Float32Array(i * 4 * 3),
      g = new Float32Array(i * 4 * 3),
      b = 0;
    function k(O) {
      return [r.getX(O), r.getY(O), r.getZ(O)];
    }
    function L(O, F) {
      var I = k(O),
        N = k(F),
        K = [(I[0] + N[0]) / 2, (I[1] + N[1]) / 2, (I[2] + N[2]) / 2],
        ne = [0, 0, 0],
        T,
        ae,
        ue,
        me,
        Ge;
      [
        [I, O],
        [N, F],
      ].forEach(function (ze) {
        for (
          me = [c[ze[1] * 3], c[ze[1] * 3 + 1], c[ze[1] * 3 + 2]],
            ue = (K[0] - ze[0][0]) * me[0] + (K[1] - ze[0][1]) * me[1] + (K[2] - ze[0][2]) * me[2],
            ae = 0;
          ae < 3;
          ae++
        )
          ne[ae] += (K[ae] - ue * me[ae]) * 0.5;
      });
      var xe = [n.getX(O) + n.getX(F), n.getY(O) + n.getY(F), n.getZ(O) + n.getZ(F)],
        ft = Math.sqrt(xe[0] * xe[0] + xe[1] * xe[1] + xe[2] * xe[2]) || 1;
      return {
        p: [K[0] + (ne[0] - K[0]) * 0.75, K[1] + (ne[1] - K[1]) * 0.75, K[2] + (ne[2] - K[2]) * 0.75],
        n: [xe[0] / ft, xe[1] / ft, xe[2] / ft],
      };
    }
    function x(O, F) {
      ((M[b] = O[0]),
        (M[b + 1] = O[1]),
        (M[b + 2] = O[2]),
        (g[b] = F[0]),
        (g[b + 1] = F[1]),
        (g[b + 2] = F[2]),
        (b += 3));
    }
    function P(O) {
      return { p: k(O), n: [n.getX(O), n.getY(O), n.getZ(O)] };
    }
    for (o = 0; o < i; o += 3) {
      var h = P(o),
        B = P(o + 1),
        G = P(o + 2),
        z = L(o, o + 1),
        Q = L(o + 1, o + 2),
        J = L(o + 2, o);
      [
        [h, z, J],
        [z, B, Q],
        [J, Q, G],
        [z, Q, J],
      ].forEach(function (O) {
        O.forEach(function (F) {
          x(F.p, F.n);
        });
      });
    }
    var q = new e.BufferGeometry();
    return (
      q.setAttribute("position", new e.BufferAttribute(M, 3)),
      q.setAttribute("normal", new e.BufferAttribute(g, 3)),
      q
    );
  }
  function _l(e, a, r) {
    a.updateMatrixWorld(!0);
    var n = new e.Matrix4().copy(a.matrixWorld).invert(),
      i = new e.Matrix4(),
      o = new e.Vector3(),
      s = [],
      l = 1e9,
      c = -1e9,
      f = 1e9;
    a.traverse(function (x) {
      if (!(!x.isMesh || !x.visible)) {
        i.multiplyMatrices(n, x.matrixWorld);
        var P = x.geometry.attributes.position,
          h;
        for (h = 0; h < P.count; h++)
          (o.fromBufferAttribute(P, h).applyMatrix4(i), o.y < l && (l = o.y), o.y > c && (c = o.y));
      }
    });
    var u = c - l,
      p = l + u * 0.3;
    if (
      (a.traverse(function (x) {
        if (!(!x.isMesh || !x.visible || r(x))) {
          i.multiplyMatrices(n, x.matrixWorld);
          var P = x.geometry.attributes.position,
            h;
          for (h = 0; h < P.count; h += 2)
            (o.fromBufferAttribute(P, h).applyMatrix4(i),
              o.y < p && (s.push([o.x, o.z]), o.y < f && (f = o.y)));
        }
      }),
      s.length < 8)
    )
      return;
    s.sort(function (x, P) {
      return x[0] - P[0] || x[1] - P[1];
    });
    function v(x, P, h) {
      return (P[0] - x[0]) * (h[1] - x[1]) - (P[1] - x[1]) * (h[0] - x[0]);
    }
    var w = [],
      y = [],
      E;
    for (E = 0; E < s.length; E++) {
      for (; w.length >= 2 && v(w[w.length - 2], w[w.length - 1], s[E]) <= 0;) w.pop();
      w.push(s[E]);
    }
    for (E = s.length - 1; E >= 0; E--) {
      for (; y.length >= 2 && v(y[y.length - 2], y[y.length - 1], s[E]) <= 0;) y.pop();
      y.push(s[E]);
    }
    (y.pop(), w.pop());
    var M = w.concat(y),
      g = 0,
      b = 0;
    (M.forEach(function (x) {
      ((g += x[0]), (b += x[1]));
    }),
      (g /= M.length),
      (b /= M.length));
    var k = new e.Shape();
    M.forEach(function (x, P) {
      var h = g + (x[0] - g) * 0.9,
        B = b + (x[1] - b) * 0.9;
      P ? k.lineTo(h, B) : k.moveTo(h, B);
    });
    var L = new e.Mesh(
      new e.ShapeGeometry(k),
      new e.MeshStandardMaterial({ color: 2764342, roughness: 0.75, metalness: 0.3, side: e.DoubleSide }),
    );
    ((L.rotation.x = Math.PI / 2), (L.position.y = f + u * 0.09), a.add(L));
  }
  function Ql(e, a) {
    var r = new e.PMREMGenerator(a),
      n = new e.Scene(),
      i = new e.SphereGeometry(50, 32, 16),
      o = i.attributes.position,
      s = [],
      l,
      c,
      f;
    for (l = 0; l < o.count; l++)
      ((c = o.getY(l) / 50),
        c > 0
          ? ((f = Math.pow(c, 0.7)), s.push(0.92 - 0.38 * f, 0.95 - 0.22 * f, 1 - 0.06 * f))
          : ((f = Math.min(1, -c * 2)), s.push(0.5 - 0.22 * f, 0.52 - 0.22 * f, 0.55 - 0.2 * f)));
    (i.setAttribute("color", new e.Float32BufferAttribute(s, 3)),
      n.add(new e.Mesh(i, new e.MeshBasicMaterial({ vertexColors: !0, side: e.BackSide }))));
    var u = new e.MeshBasicMaterial({ color: new e.Color(7, 7, 7) }),
      p = new e.MeshBasicMaterial({ color: new e.Color(2.6, 2.7, 2.9) });
    [
      [-9, 34, 0],
      [9, 34, 0],
      [-26, 30, 0],
      [26, 30, 0],
    ].forEach(function (E) {
      var M = new e.Mesh(new e.BoxGeometry(2.2, 0.6, 44), u);
      (M.position.set(E[0], E[1], E[2]), n.add(M));
    });
    var v = new e.Mesh(new e.BoxGeometry(0.6, 22, 30), p);
    (v.position.set(46, 12, -6), n.add(v));
    var w = new e.Mesh(new e.BoxGeometry(0.6, 18, 26), p);
    (w.position.set(-46, 10, 8), n.add(w));
    var y = r.fromScene(n, 0.03).texture;
    return (r.dispose(), y);
  }
  function Uo(e, a) {
    !t ||
      !t.envMap ||
      e.traverse(function (r) {
        if (!(!r.isMesh || !r.material)) {
          var n = Array.isArray(r.material) ? r.material : [r.material];
          n.forEach(function (i) {
            i.isMeshStandardMaterial &&
              ((i.userData && i.userData.carGlass ? (i.envMapIntensity = 1.4) : ((i.envMap = t.envMap), (i.envMapIntensity = a * (i.metalness > 0.5 ? 1.5 : 1)))),
              (i.needsUpdate = !0));
          });
        }
      });
  }
  function Fs(e, a, r) {
    (a && (e.color.copy(a), e.color.multiplyScalar(r ? 1.05 : 1)),
      (function () {
        var f = (typeof MER_FIN !== "undefined" && MER_FIN[(MER && MER.finish) || "metallic"]) || null;
        f
          ? ((e.roughness = f.r + (r ? 0 : 0.02)), (e.metalness = f.m), (e.envMapIntensity = f.env), (e.clearcoat = f.cc), (e.clearcoatRoughness = f.ccr))
          : ((e.roughness = r ? 0.2 : 0.22), (e.metalness = r ? 0.9 : 0.88), (e.envMapIntensity = r ? 2.3 : 2.6), (e.clearcoat = 1), (e.clearcoatRoughness = 0));
      })(),
      (e.needsUpdate = !0));
  }
  function Kl() {
    if (!(!t || !t.group || !t.carList || !fe)) {
      var e = fe,
        a = t.carEnv;
      if (!a) {
        var r = new e.WebGLCubeRenderTarget(qn() ? 64 : 128, {
          generateMipmaps: !0,
          minFilter: e.LinearMipmapLinearFilter,
        });
        ((a = t.carEnv = { rt: r, cc: new e.CubeCamera(0.3, 6e3, r) }), t.scene.add(a.cc));
      }
      var n = zt === "night",
        i = t.drive ? t.drive.i : -1,
        o = [];
      (t.carList.forEach(function (s, l) {
        (s.traverse(function (c) {
          !c.isMesh ||
            !c.material ||
            !c.material.userData ||
            !c.material.userData.carPaint ||
            (c.material.envMap !== a.rt.texture && (c.material.envMap = a.rt.texture),
            Fs(c.material, c.material.userData.base, n));
          c.isMesh && c.material && c.material.userData && c.material.userData.carGlass && (c.material.envMap = a.rt.texture, (c.material.envMapIntensity = 1.4), (c.material.needsUpdate = !0));
        }),
          o.push(s.visible),
          (s.visible = !1));
      }),
        t.group.updateMatrixWorld(!0),
        a.cc.position.set(0, 3.6, 0),
        t.group.localToWorld(a.cc.position));
      try {
        a.cc.update(t.renderer, t.scene);
      } catch {}
      t.carList.forEach(function (s, l) {
        s.visible = o[l];
      });
    }
  }
  function Xo() {
    t &&
      (clearTimeout(t.carEnvT),
      (t.carEnvT = setTimeout(function () {
        (Kl(), ye());
      }, 80)));
  }
  function Jl(e, a) {
    var r = Ln.clone(!0),
      n = new e.MeshPhysicalMaterial({
        color: a,
        roughness: 0.2,
        metalness: 0.88,
        clearcoat: 1,
        clearcoatRoughness: 0,
        side: e.DoubleSide,
      });
    ((n.userData.carPaint = !0),
      (n.userData.base = n.color.clone()),
      r.traverse(function (o) {
        o.isMesh && o.userData.body && (o.material = n);
      }),
      Uo(r, 0.28));
    var i = new e.Group();
    return (i.add(r), i);
  }
  function $l() {
    return fe
      ? Promise.resolve(fe)
      : (qo ||
          (qo = import(Ol).then(function (e) {
            return ((fe = e), e);
          })),
        qo);
  }
  
  function Tl(e) {
    e.traverse(function (a) {
      (a.geometry && a.geometry.dispose(),
        a.material &&
          (Array.isArray(a.material) ? a.material : [a.material]).forEach(function (r) {
            (r.map && r.map.dispose(), r.dispose());
          }));
    });
  }
  function jo(e, a, r, n) {
    var i = 28,
      o = [],
      s = [],
      l,
      c,
      f,
      u,
      p,
      v = 2 / n;
    for (
      a.forEach(function (b) {
        var k = (b.y0 + b.y1) / 2,
          L = (b.y1 - b.y0) / 2,
          x = b.w / 2;
        for (l = 0; l < i; l++)
          ((f = (2 * Math.PI * l) / i),
            (u = Math.cos(f)),
            (p = Math.sin(f)),
            o.push(
              x * Math.sign(u) * Math.pow(Math.abs(u), v),
              k + L * Math.sign(p) * Math.pow(Math.abs(p), v),
              b.z,
            ));
      }),
        c = 0;
      c < a.length - 1;
      c++
    )
      for (l = 0; l < i; l++) {
        var w = c * i + l,
          y = c * i + ((l + 1) % i),
          E = (c + 1) * i + l,
          M = (c + 1) * i + ((l + 1) % i);
        s.push(w, E, y, y, E, M);
      }
    [0, a.length - 1].forEach(function (b) {
      var k = a[b],
        L = o.length / 3;
      for (o.push(0, (k.y0 + k.y1) / 2, k.z), l = 0; l < i; l++) s.push(L, b * i + l, b * i + ((l + 1) % i));
    });
    var g = new e.BufferGeometry();
    return (
      g.setAttribute("position", new e.Float32BufferAttribute(o, 3)),
      g.setIndex(s),
      g.computeVertexNormals(),
      (r.side = e.DoubleSide),
      new e.Mesh(g, r)
    );
  }
  function e0(e, a) {
    if (Ln) return Jl(e, a);
    var r = new e.Group(),
      n = new e.MeshPhysicalMaterial({
        color: a,
        roughness: 0.2,
        metalness: 0.88,
        clearcoat: 1,
        clearcoatRoughness: 0,
      });
    ((n.userData.carPaint = !0), (n.userData.base = n.color.clone()));
    var i = new e.MeshStandardMaterial({ color: 1778483, roughness: 0.12, metalness: 0.5 }),
      o = new e.MeshStandardMaterial({ color: 1316637, roughness: 0.9 }),
      s = new e.MeshStandardMaterial({ color: 3883340, roughness: 0.3, metalness: 0.8 }),
      l = new e.MeshStandardMaterial({ color: 987672, roughness: 0.7 });
    function c(u, p, v, w) {
      return (u.position.set(p, v, w), r.add(u), u);
    }
    (r.add(
      jo(
        e,
        [
          { z: -7.3, w: 3.4, y0: 0.9, y1: 1.5 },
          { z: -6.8, w: 5, y0: 0.7, y1: 1.9 },
          { z: -5.5, w: 6, y0: 0.7, y1: 2.3 },
          { z: -3.5, w: 6.3, y0: 0.7, y1: 2.55 },
          { z: -1.5, w: 6.4, y0: 0.7, y1: 2.7 },
          { z: 1, w: 6.5, y0: 0.7, y1: 2.8 },
          { z: 3.8, w: 6.9, y0: 0.7, y1: 2.95 },
          { z: 5.8, w: 6.7, y0: 0.8, y1: 2.9 },
          { z: 7, w: 5.8, y0: 0.9, y1: 2.6 },
          { z: 7.3, w: 4.2, y0: 1, y1: 2.3 },
        ],
        n,
        2.8,
      ),
    ),
      r.add(
        jo(
          e,
          [
            { z: -3, w: 4.8, y0: 2.6, y1: 2.75 },
            { z: -1.6, w: 5.2, y0: 2.6, y1: 3.45 },
            { z: -0.4, w: 5.2, y0: 2.6, y1: 3.65 },
            { z: 2, w: 5.1, y0: 2.6, y1: 3.65 },
            { z: 3.6, w: 4.8, y0: 2.6, y1: 3.2 },
            { z: 4.8, w: 4.3, y0: 2.6, y1: 2.8 },
          ],
          i,
          2.4,
        ),
      ),
      r.add(
        jo(
          e,
          [
            { z: -0.9, w: 3.6, y0: 3.55, y1: 3.7 },
            { z: -0.2, w: 4.3, y0: 3.6, y1: 3.8 },
            { z: 2.4, w: 4.3, y0: 3.6, y1: 3.8 },
            { z: 3.2, w: 3.6, y0: 3.55, y1: 3.7 },
          ],
          n,
          3,
        ),
      ),
      [
        [-3.15, -4.6, 0.9],
        [3.15, -4.6, 0.9],
        [-3.35, 4.5, 1.15],
        [3.35, 4.5, 1.15],
      ].forEach(function (u) {
        var p = new e.Mesh(new e.CylinderGeometry(1.1, 1.1, u[2], 22), o);
        ((p.rotation.z = Math.PI / 2), c(p, u[0], 1.1, u[1]));
        var v = new e.Mesh(new e.CylinderGeometry(0.78, 0.78, u[2] + 0.06, 18), s);
        ((v.rotation.z = Math.PI / 2), c(v, u[0], 1.1, u[1]));
        var w = Math.sign(u[0]) * (u[2] / 2 + 0.05),
          y;
        for (y = 0; y < 5; y++) {
          var E = new e.Mesh(new e.BoxGeometry(0.05, 1.5, 0.16), l);
          ((E.rotation.x = (y * Math.PI) / 5), c(E, u[0] + w, 1.1, u[1]));
        }
      }),
      [-1, 1].forEach(function (u) {
        c(new e.Mesh(new e.BoxGeometry(0.5, 0.3, 0.7), n), u * 3.05, 3, -1.7);
        var p = new e.Mesh(new e.BoxGeometry(1.3, 0.16, 0.35), new e.MeshBasicMaterial({ color: 15331583 }));
        ((p.rotation.y = -u * 0.35), c(p, u * 2.25, 1.75, -6.55));
      }),
      c(new e.Mesh(new e.BoxGeometry(3, 0.5, 0.2), l), 0, 1.1, -7));
    var f = new e.MeshStandardMaterial({ color: new e.Color(a).multiplyScalar(0.3), roughness: 0.6 });
    return (
      [-1, 1].forEach(function (u) {
        (c(new e.Mesh(new e.BoxGeometry(1.1, 0.07, 1.6), l), u * 1.4, 2.46, -4.5),
          c(new e.Mesh(new e.BoxGeometry(0.12, 0.7, 1.7), l), u * 3.2, 2, 1.7),
          c(new e.Mesh(new e.BoxGeometry(0.1, 0.7, 1.1), n), u * 3.45, 3.35, 6.5),
          c(new e.Mesh(new e.BoxGeometry(0.18, 0.5, 0.35), l), u * 2.2, 3.05, 6.4));
      }),
      c(new e.Mesh(new e.BoxGeometry(3.4, 0.08, 2.5), f), 0, 3, 5.1),
      c(new e.Mesh(new e.BoxGeometry(6.9, 0.14, 0.95), n), 0, 3.38, 6.5),
      c(
        new e.Mesh(new e.BoxGeometry(4.6, 0.2, 0.25), new e.MeshBasicMaterial({ color: 13777723 })),
        0,
        2.3,
        7,
      ),
      r
    );
  }
  function qs() {
    if (ie) {
      var e = V("three");
      $l()
        .then(function (a) {
          merBoot("three", 1, "Loading car");
          return Xl(a).then(function () {
            return a;
          });
        })
        .then(function (a) {
          merBoot("car", 1, "Building garage and race track");
          return new Promise(function (go) {
            requestAnimationFrame(function () {
              setTimeout(function () { go(a); }, 60);
            });
          });
        })
        .then(function (a) {
          Rr && (D0(a, e), merSceneBuilt());
        })
        .catch(function (a) {
          merFail(a);
        });
    }
  }
  function Yo(e) {
    if (!(!t || !t.doors || !t.doorGeo)) {
      t.spillDoorM &&
        (t.spillDoorM.opacity = Math.min(0.85, 0.8 * (t.nightLit || 0)) * Math.max(0, Math.min(1, e)));
      var a = t.doorGeo,
        r = a.dh,
        n = (Math.PI / 2) * a.rB,
        i = a.dh / 4,
        o = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2,
        s = o * (r + n + 0.3);
      t.doors.forEach(function (l) {
        l.panels.forEach(function (c, f) {
          var u = s + (f + 0.5) * i,
            p,
            v,
            w,
            y;
          (u <= r
            ? ((p = a.dZ), (v = u), (w = 0))
            : u <= r + n
              ? ((y = (u - r) / a.rB),
                (p = a.dZ - a.rB + a.rB * Math.cos(y)),
                (v = r + a.rB * Math.sin(y)),
                (w = y))
              : ((p = a.dZ - a.rB - (u - r - n)), (v = r + a.rB), (w = Math.PI / 2)),
            c.position.set(l.c, v, p),
            (c.rotation.x = -w));
        });
      });
    }
  }
  function ln(e) {
    if (t) {
      ((ra = e), cancelAnimationFrame(t.doorRaf));
      var a = t.doorT || 0,
        r = e ? 1 : 0,
        n = performance.now(),
        i = 2400 * Math.max(0.15, Math.abs(r - a));
      (Wa(),
        (function o(s) {
          var l = Math.min(1, ((s || performance.now()) - n) / i);
          ((t.doorT = a + (r - a) * l), Yo(t.doorT), ye(), l < 1 && (t.doorRaf = requestAnimationFrame(o)));
        })(n));
    }
  }
  var At = {};
  function Ws(e) {
    var a = e.key;
    return a === "Shift"
      ? "shift"
      : a === "ArrowUp"
        ? "w"
        : a === "ArrowDown"
          ? "s"
          : a === "ArrowLeft"
            ? "left"
            : a === "ArrowRight"
              ? "right"
              : ((a = String(a).toLowerCase()), a === "w" || a === "a" || a === "s" || a === "d" ? a : null);
  }
  function no() {
    var e = ie;
    return {
      x: Math.max(0, e.wid / 2 - 1),
      zMin: -e.len / 2 + (e.wid >= 10 ? 3.2 : 1),
      zMax: e.len / 2 - 1.2,
    };
  }
  function io(e, a) {
    var r = ie,
      n = r.wid / 2,
      i = r.len / 2,
      o = no(),
      s = e >= -o.x && e <= o.x && a >= o.zMin && a <= o.zMax,
      l;
    if (
      (!s &&
        ra &&
        a > o.zMax - 0.01 &&
        a < i + 1.7 &&
        (s = (t.doors || []).some(function (g) {
          return Math.abs(e - g.c) <= g.w / 2 - 1;
        })),
      s ||
        (s =
          !(Math.abs(e) < n + 1.7 && a > -i - 1.7 && a < i + 1.7) &&
          (t && t.worldBox
            ? e >= t.worldBox.x0 && e <= t.worldBox.x1 && a >= t.worldBox.z0 && a <= t.worldBox.z1
            : Math.abs(e) <= n + 320 && a >= -i - 320 && a <= i + 320)),
      !s)
    )
      return !1;
    if (t.trees)
      for (l = 0; l < t.trees.length; l++) {
        var c = t.trees[l],
          f = e - c.x,
          u = a - c.z;
        if (f * f + u * u < c.r * c.r) return !1;
      }
    if (!ct) return !0;
    var p = Wn(),
      v,
      w,
      y,
      E,
      M;
    for (l = 0; l < p.length; l++)
      if (
        ((v = (-p[l].r * Math.PI) / 180),
        (w = e - p[l].x),
        (y = a - p[l].z),
        (E = w * Math.cos(v) - y * Math.sin(v)),
        (M = w * Math.sin(v) + y * Math.cos(v)),
        Math.abs(E) < 3.9 && Math.abs(M) < 7.4)
      )
        return !1;
    return !0;
  }
  function Zo(e, a) {
    var r = t.wyaw,
      n = Math.sin(r) * e + Math.cos(r) * a,
      i = -Math.cos(r) * e + Math.sin(r) * a,
      o = io(t.wx, t.wz),
      s = no();
    (!ra &&
      ie &&
      i > 0 &&
      t.wz > s.zMax - 1 &&
      (t.doors || []).some(function (l) {
        return Math.abs(t.wx - l.c) <= l.w / 2;
      }) &&
      (ln(!0), we("Opening the door", 1800)),
      (io(t.wx + n, t.wz) || !o) && (t.wx += n),
      (io(t.wx, t.wz + i) || !o) && (t.wz += i));
  }
  function t0() {
    t && t.walkMark && (t.walkMark.visible = !1);
  }
  function Gr() {
    t && ((t.walkTo = null), t0());
  }
  function Ns(e) {
    !t || !t.walk || (Gr(), Zo(e, 0), It(), ye());
  }
  function j0(e) {
    if (!(t && t.drive) && !(!t || !t.walk || !fe)) {
      var a = t.renderer.domElement,
        r = a.getBoundingClientRect(),
        n = new fe.Vector2(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -((e.clientY - r.top) / r.height) * 2 + 1,
        ),
        i = new fe.Raycaster(),
        o = new fe.Vector3();
      if (
        (i.setFromCamera(n, t.camera),
        !!i.ray.intersectPlane(new fe.Plane(new fe.Vector3(0, 1, 0), 0), o) &&
          !(Math.hypot(o.x - t.wx, o.z - t.wz) > 140 || Math.hypot(o.x - t.wx, o.z - t.wz) < 0.6))
      ) {
        if (((t.walkTo = { x: o.x, z: o.z, stuck: 0 }), !t.walkMark)) {
          var s = new fe.Mesh(
            new fe.RingGeometry(0.55, 0.78, 36),
            new fe.MeshBasicMaterial({
              color: 16761395,
              transparent: !0,
              opacity: 0.9,
              depthTest: !1,
              side: fe.DoubleSide,
            }),
          );
          ((s.rotation.x = -Math.PI / 2), (s.renderOrder = 20), t.scene.add(s), (t.walkMark = s));
        }
        (t.walkMark.position.set(o.x, 0.08, o.z), (t.walkMark.visible = !0), oo());
      }
    }
  }
  function Vs(e) {
    if (!t || !t.walk) {
      t.wraf = 0;
      return;
    }
    var a = Math.min(0.05, Math.max(0, (e - t.wlast) / 1e3));
    t.wlast = e;
    var r = t.joy ? t.joy.x : 0,
      n = t.joy ? t.joy.y : 0,
      i = (At.w || At.padf ? 1 : 0) - (At.s || At.padb ? 1 : 0) - n,
      o = (At.d ? 1 : 0) - (At.a ? 1 : 0) + r,
      s = (At.right || At.padr ? 1 : 0) - (At.left || At.padl ? 1 : 0),
      l = t.walkTo;
    if (((i || o || s) && l && (Gr(), (l = null)), !i && !o && !s && !l)) {
      t.wraf = 0;
      return;
    }
    s && (t.wyaw += s * 1.7 * a);
    var c = (At.shift || Math.hypot(r, n) > 0.95 ? 13 : 7) * a;
    if (i || o) Zo(i * c, o * c);
    else if (l) {
      var f = l.x - t.wx,
        u = l.z - t.wz,
        p = Math.hypot(f, u);
      if (p < 0.4 || l.stuck > 8) Gr();
      else {
        var v = Math.min(p > 40 ? 16 : p > 14 ? 10 : 7, 2 + p * 3) * a,
          w = (f / p) * v,
          y = (u / p) * v,
          E = t.wyaw,
          M = t.wx,
          g = t.wz;
        if (
          (Zo(w * Math.sin(E) - y * Math.cos(E), w * Math.cos(E) + y * Math.sin(E)),
          Math.hypot(t.wx - M, t.wz - g) < v * 0.3 ? l.stuck++ : (l.stuck = 0),
          p > 3)
        ) {
          var b = Math.atan2(f, -u) - t.wyaw;
          ((b = Math.atan2(Math.sin(b), Math.cos(b))), (t.wyaw += b * Math.min(1, a * 4)));
        }
        if (t.walkMark) {
          var k = 1 + 0.12 * Math.sin(e / 130);
          t.walkMark.scale.set(k, k, k);
        }
      }
    }
    (It(), ye(), (t.wraf = requestAnimationFrame(Vs)));
  }
  function oo() {
    t && t.walk && !t.wraf && ((t.wlast = performance.now()), (t.wraf = requestAnimationFrame(Vs)));
  }
  function Hs() {
    var e = no(),
      a,
      r = [0, 1.5, -1.5, 3, -3, 4.5, -4.5, 6, -6],
      n,
      i = !1;
    for (t.wx = 0, t.wz = e.zMax, t.wyaw = 0, t.wpitch = 0.05, a = e.zMax; a >= e.zMin && !i; a -= 0.5)
      for (n = 0; n < r.length; n++)
        if (Math.abs(r[n]) <= e.x && io(r[n], a)) {
          ((t.wx = r[n]), (t.wz = a), (i = !0));
          break;
        }
    Gr();
  }
  function Us() {
    return t.touch
      ? "Drag to look around. Use the stick to walk."
      : "Drag to look around. Use the W A S D keys to walk.";
  }
  function a0() {
    if (!(!t || !t.hintEl)) {
      var e = !1;
      try {
        e = window.localStorage.getItem("lc-walk-hint") === "1";
      } catch {}
      e ||
        t.hintDone ||
        ((t.hintEl.querySelector("span").textContent = Us()),
        t.hintEl.classList.add("lc-show"),
        clearTimeout(t.hintT),
        (t.hintT = setTimeout(function () {
          xi(!0);
        }, 1e4)));
    }
  }
  function xi(e) {
    if (
      !(!t || !t.hintEl) &&
      (clearTimeout(t.hintT),
      !!t.hintEl.classList.contains("lc-show") && (t.hintEl.classList.remove("lc-show"), e))
    ) {
      t.hintDone = !0;
      try {
        window.localStorage.setItem("lc-walk-hint", "1");
      } catch {}
    }
  }
  function Xs(e) {
    !t ||
      t.touch === e ||
      ((t.touch = e),
      t.host.classList.toggle("lc-touch", e),
      t.hintEl &&
        t.hintEl.classList.contains("lc-show") &&
        (t.hintEl.querySelector("span").textContent = Us()));
  }
  var Pt = {};
  function r0(e) {
    if (e.userData.rig) return e.userData.rig;
    var a = fe,
      r = { fwdZ: -1, wheels: [] },
      n = [],
      i = new a.Vector3();
    e.updateMatrixWorld(!0);
    var o = new a.Matrix4().copy(e.matrixWorld).invert();
    e.traverse(function (x) {
      x.isMesh &&
        x.geometry &&
        x.geometry.attributes.position &&
        !x.geometry.attributes.position.isInterleavedBufferAttribute &&
        n.push(x);
    });
    function s(x) {
      return String(x.userData.matName || "").toLowerCase();
    }
    function l(x, P, h) {
      var B = x.geometry.attributes.position,
        G,
        z = new a.Vector3();
      for (G = 0; G < B.count; G++) (z.fromBufferAttribute(B, G).applyMatrix4(P), h(z));
    }
    function c(x, P) {
      var h = new a.Matrix4().multiplyMatrices(o, x.matrixWorld),
        B = x.geometry.attributes.position,
        G;
      for (G = 0; G < B.count; G++) (i.fromBufferAttribute(B, G).applyMatrix4(h), P(i));
    }
    n.forEach(function (x) {
      var P = x.parent ? String(x.parent.name || "").toLowerCase() : "";
      P.indexOf("brake") !== -1 && s(x).indexOf("brake") === -1 && (x.userData.keep = !0);
    });
    var f = [],
      u = [];
    n.forEach(function (x) {
      var P = s(x);
      if (!(P.indexOf("headlight") === -1 && P.indexOf("tail") === -1)) {
        var h = 0,
          B = 0;
        (c(x, function (G) {
          ((h += G.z), B++);
        }),
          B && (P.indexOf("headlight") !== -1 ? f : u).push(h / B));
      }
    });
    function p(x) {
      var P = 0;
      return (
        x.forEach(function (h) {
          P += h;
        }),
        P / x.length
      );
    }
    f.length ? (r.fwdZ = p(f) > 0 ? 1 : -1) : u.length && (r.fwdZ = p(u) > 0 ? -1 : 1);
    var v = n.filter(function (x) {
      var P = s(x);
      return P.indexOf("tyre") !== -1 || P.indexOf("tire") !== -1;
    });
    if (!v.length) return ((e.userData.rig = r), r);
    var w = 0,
      y = 0,
      E = 0,
      M = {};
    v.forEach(function (x) {
      c(x, function (P) {
        ((w += P.x), (y += P.z), E++);
      });
    });
    var g = w / E,
      b = y / E;
    v.forEach(function (x) {
      c(x, function (P) {
        var h = (P.x > g ? 1 : 0) + "" + (P.z > b ? 1 : 0),
          B = M[h] || (M[h] = new a.Box3());
        B.expandByPoint(P);
      });
    });
    var k = [];
    if (
      (Object.keys(M).forEach(function (x) {
        var P = M[x],
          h = P.getSize(new a.Vector3()),
          B = P.getCenter(new a.Vector3());
        h.x < h.y * 0.9 &&
          h.x < h.z * 0.9 &&
          k.push({ c: B, R: Math.max(h.y, h.z) / 2, hw: h.x / 2, tris: [] });
      }),
      k.length < 2)
    )
      return ((e.userData.rig = r), r);
    (k.forEach(function (x) {
      ((x.steer = new a.Group()),
        (x.spin = new a.Group()),
        x.steer.position.copy(x.c),
        e.add(x.steer),
        x.steer.add(x.spin),
        (x.front = (x.c.z - b) * r.fwdZ > 0),
        (x.Rw = x.R * Math.abs(e.scale.y || 1)));
    }),
      e.updateMatrixWorld(!0));
    var L = function (x) {
      return x.userData.body || x.userData.keep;
    };
    return (
      n.forEach(function (x) {
        if (L(x)) return;
        var P = x.geometry,
          h = P.attributes.position,
          B = P.index,
          G = new a.Matrix4().multiplyMatrices(o, x.matrixWorld);
        P.boundingBox || P.computeBoundingBox();
        var z = P.boundingBox.clone().applyMatrix4(G),
          Q = k.some(function (Ne) {
            return (
              z.max.x >= Ne.c.x - Ne.hw &&
              z.min.x <= Ne.c.x + Ne.hw &&
              z.max.y >= Ne.c.y - Ne.R &&
              z.min.y <= Ne.c.y + Ne.R &&
              z.max.z >= Ne.c.z - Ne.R &&
              z.min.z <= Ne.c.z + Ne.R
            );
          });
        if (!Q) return;
        var J = B ? B.count / 3 : h.count / 3,
          q = new Int8Array(J),
          O = !1,
          F,
          I,
          N,
          K,
          ne,
          T,
          ae,
          ue,
          me;
        for (F = 0; F < J; F++) {
          for (ne = 0, T = 0, ae = 0, I = 0; I < 3; I++)
            ((K = B ? B.getX(F * 3 + I) : F * 3 + I),
              i.fromBufferAttribute(h, K).applyMatrix4(G),
              (ne += i.x),
              (T += i.y),
              (ae += i.z));
          for (ne /= 3, T /= 3, ae /= 3, N = 0; N < k.length; N++) {
            var Ge = k[N];
            if (
              ((ue = T - Ge.c.y),
              (me = ae - Ge.c.z),
              ue * ue + me * me <= Ge.R * Ge.R * 1.06 && Math.abs(ne - Ge.c.x) <= Ge.hw * 1.15 + 0.08)
            ) {
              ((q[F] = N + 1), (O = !0));
              break;
            }
          }
        }
        if (!O) return;
        var xe = Object.keys(P.attributes);
        function ft(Ne) {
          var Wt = 0,
            Et = {},
            Ot;
          for (F = 0; F < J; F++) q[F] === Ne && Wt++;
          if (!Wt) return null;
          for (
            xe.forEach(function (Bt) {
              var et = P.attributes[Bt];
              Et[Bt] = { at: et, arr: new et.array.constructor(Wt * 3 * et.itemSize), o: 0 };
            }),
              F = 0;
            F < J;
            F++
          )
            if (q[F] === Ne)
              for (I = 0; I < 3; I++)
                ((K = B ? B.getX(F * 3 + I) : F * 3 + I),
                  xe.forEach(function (Bt) {
                    var et = Et[Bt],
                      oe = et.at.itemSize,
                      tt;
                    for (tt = 0; tt < oe; tt++) et.arr[et.o++] = et.at.array[K * oe + tt];
                  }));
          var ia = new a.BufferGeometry();
          return (
            xe.forEach(function (Bt) {
              ia.setAttribute(
                Bt,
                new a.BufferAttribute(Et[Bt].arr, Et[Bt].at.itemSize, Et[Bt].at.normalized),
              );
            }),
            ia
          );
        }
        var ze = ft(0),
          ut = x.parent;
        for (N = 0; N < k.length; N++) {
          var We = ft(N + 1);
          if (We) {
            var Be = new a.Mesh(We, x.material);
            (Be.position.copy(x.position),
              Be.quaternion.copy(x.quaternion),
              Be.scale.copy(x.scale),
              (Be.userData = Object.assign({}, x.userData)),
              (Be.renderOrder = x.renderOrder),
              Be.updateMatrix(),
              ut.add(Be),
              Be.updateMatrixWorld(!0),
              k[N].spin.attach(Be));
          }
        }
        ze ? (x.geometry = ze) : ut.remove(x);
      }),
      n.forEach(function (x) {
        if (x.userData.keep) {
          var P = x.geometry;
          P.boundingBox || P.computeBoundingBox();
          var h = P.boundingBox
              .getCenter(new a.Vector3())
              .applyMatrix4(new a.Matrix4().multiplyMatrices(o, x.matrixWorld)),
            B = null,
            G = 1e9;
          (k.forEach(function (z) {
            var Q = h.distanceTo(z.c);
            Q < G && ((G = Q), (B = z));
          }),
            B && G < B.R * 1.6 && B.steer.attach(x));
        }
      }),
      (r.wheels = k.map(function (x) {
        return {
          lx: x.c.x,
          lz: x.c.z,
          cy: x.c.y,
          steer: x.steer,
          spin: x.spin,
          R: Math.max(0.5, x.Rw),
          front: x.front,
        };
      })),
      (e.userData.rig = r),
      r
    );
  }
  function n0(e, a, r) {
    var n = t.track,
      i = t.railGrid;
    if (!(!n || !i)) {
      var o = n.pts,
        N = o.length,
        s = 1e9,
        l = 0,
        c,
        f,
        u,
        p,
        v = t.trackGrid;
      if (v) {
        var w = Math.floor(e.x / 16),
          y = Math.floor(e.z / 16),
          E,
          M,
          g,
          b;
        for (E = -1; E <= 1; E++)
          for (M = -1; M <= 1; M++)
            if (((g = v[w + E + "," + (y + M)]), g))
              for (b = 0; b < g.length; b++)
                ((c = g[b]),
                  (f = e.x - o[c][0]),
                  (u = e.z - o[c][1]),
                  (p = f * f + u * u),
                  p < s && ((s = p), (l = c)));
      }
      if (s > 256)
        for (c = 0; c < o.length; c++)
          ((f = e.x - o[c][0]), (u = e.z - o[c][1]), (p = f * f + u * u), p < s && ((s = p), (l = c)));
      /* Closest point on the two track segments next to the nearest point, so long segments stay accurate. */
      var best = 1e9, bx = o[l][0], bz = o[l][1], tx = 0, tz = 1, sg;
      for (sg = -1; sg <= 0; sg++) {
        var ia = (l + sg + N) % N, ib = (ia + 1) % N, A = o[ia], B = o[ib],
          dx = B[0] - A[0], dz = B[1] - A[1], ll = dx * dx + dz * dz || 1,
          tt = Math.max(0, Math.min(1, ((e.x - A[0]) * dx + (e.z - A[1]) * dz) / ll)),
          px = A[0] + dx * tt, pz = A[1] + dz * tt, d2 = (e.x - px) * (e.x - px) + (e.z - pz) * (e.z - pz);
        d2 < best && ((best = d2), (bx = px), (bz = pz), (tx = dx), (tz = dz));
      }
      var L = Math.sqrt(best),
        q = Math.atan2(tx, tz),
        O = (-e.r * Math.PI) / 180,
        F = a.v >= 0 ? 0 : Math.PI,
        I = Math.atan2(Math.sin(q + F - O), Math.cos(q + F - O)),
        ext = 3.1 * Math.abs(Math.cos(I)) + 6.5 * Math.abs(Math.sin(I)),
        k = Math.max(n.w / 2 - 3.2, n.w / 2 + 3.35 - ext);
      if (!(L <= k)) {
        var X = Math.floor(e.x / 8),
          P = Math.floor(e.z / 8),
          h,
          B2,
          G = !1;
        for (h = -1; h <= 1 && !G; h++)
          for (B2 = -1; B2 <= 1; B2++)
            if (i[X + h + "," + (P + B2)]) {
              G = !0;
              break;
            }
        if (!(!G || L > k + 14)) {
          var nx = (e.x - bx) / (L || 1), nz = (e.z - bz) / (L || 1), imp = Math.abs(Math.sin(I));
          ((e.x = bx + nx * k), (e.z = bz + nz * k));
          if (Math.abs(I) < 1.9) {
            var N2 = O + I * Math.min(1, 7 * r);
            ((e.r = (-N2 * 180) / Math.PI), (a.phi = N2));
          }
          (Math.abs(a.v) > 8 && (a.v -= a.v * Math.min(0.5, (0.2 + 2 * imp * imp) * r)), (a.scrape = 0.25));
        }
      }
    }
  }
  function i0(e, a, r) {
    var n = ie,
      i = n.wid / 2,
      o = n.len / 2,
      s = no(),
      l = e >= -s.x && e <= s.x && a >= s.zMin && a <= s.zMax,
      c;
    if (
      (!l &&
        ra &&
        a > s.zMax - 0.01 &&
        a < o + 1.7 &&
        (l = (t.doors || []).some(function (b) {
          return Math.abs(e - b.c) <= b.w / 2 - 0.5;
        })),
      l ||
        (l =
          !(Math.abs(e) < i + 1.7 && a > -o - 1.7 && a < o + 1.7) &&
          (t && t.worldBox
            ? e >= t.worldBox.x0 && e <= t.worldBox.x1 && a >= t.worldBox.z0 && a <= t.worldBox.z1
            : Math.abs(e) <= i + 320 && a >= -o - 320 && a <= o + 320)),
      !l)
    )
      return !1;
    if (t.trees)
      for (c = 0; c < t.trees.length; c++) {
        var f = t.trees[c],
          u = e - f.x,
          p = a - f.z;
        if (u * u + p * p < f.r * f.r) return !1;
      }
    var v = ee,
      w,
      y,
      E,
      M,
      g;
    for (c = 0; c < v.length; c++)
      if (
        c !== r &&
        ((w = (-v[c].r * Math.PI) / 180),
        (y = e - v[c].x),
        (E = a - v[c].z),
        (M = y * Math.cos(w) - E * Math.sin(w)),
        (g = y * Math.sin(w) + E * Math.cos(w)),
        Math.abs(M) < Fa + 0.2 && Math.abs(g) < wt + 0.2)
      )
        return !1;
    return !0;
  }
  function o0(e, a, r) {
    if (t.trees) {
      var n,
        i,
        o,
        s,
        l,
        c,
        f,
        u = Math.sin(a),
        p = Math.cos(a),
        v = [-1, 0, 1],
        w = [-1, 0, 1];
      for (n = 0; n < 4; n++) {
        for (f = !1, i = 0; i < 3; i++)
          for (o = 0; o < 3; o++)
            for (
              s = e.x + v[i] * Fa * 0.98 * p + w[o] * wt * 0.98 * u,
                l = e.z - v[i] * Fa * 0.98 * u + w[o] * wt * 0.98 * p,
                c = 0;
              c < t.trees.length;
              c++
            ) {
              var y = t.trees[c],
                E = s - y.x,
                M = l - y.z,
                g = E * E + M * M;
              if (g < y.r * y.r) {
                var b = Math.sqrt(g) || 0.01,
                  k = y.r - b + 0.05;
                ((e.x += (E / b) * k),
                  (e.z += (M / b) * k),
                  (s += (E / b) * k),
                  (l += (M / b) * k),
                  (f = !0));
              }
            }
        if (!f) break;
      }
    }
  }
  function wi(e, a, r, n) {
    var i = [-1, -0.67, -0.33, 0, 0.33, 0.67, 1].map(function (v) {
        return v * Fa * 0.98;
      }),
      o = [-1, -0.5, 0, 0.5, 1].map(function (v) {
        return v * wt * 0.98;
      }),
      s,
      l,
      c,
      f,
      u = Math.sin(r),
      p = Math.cos(r);
    for (s = 0; s < i.length; s++)
      for (l = 0; l < o.length; l++)
        if (((c = e + i[s] * p + o[l] * u), (f = a - i[s] * u + o[l] * p), !i0(c, f, n))) return !1;
    return !0;
  }
  function so() {
    if (t.glareTex) return t.glareTex;
    var e = fe,
      a = document.createElement("canvas");
    ((a.width = 128), (a.height = 128));
    var r = a.getContext("2d"),
      n = r.createRadialGradient(64, 64, 0, 64, 64, 64);
    return (
      n.addColorStop(0, "rgba(255,255,255,1)"),
      n.addColorStop(0.2, "rgba(255,244,220,0.7)"),
      n.addColorStop(0.55, "rgba(255,230,190,0.2)"),
      n.addColorStop(1, "rgba(255,230,190,0)"),
      (r.fillStyle = n),
      r.fillRect(0, 0, 128, 128),
      (t.glareTex = new e.CanvasTexture(a)),
      e.SRGBColorSpace && (t.glareTex.colorSpace = e.SRGBColorSpace),
      t.glareTex
    );
  }
  function s0(e, a) {
    if (e.userData.heads) return e.userData.heads;
    var r = fe,
      n = { lights: [], mats: [], glares: [], pool: null, fz: 1, tmats: [], tglares: [], tpool: null },
      i = [];
    ((e.userData.heads = n), e.updateMatrixWorld(!0));
    var o = new r.Matrix4().copy(e.matrixWorld).invert(),
      s = new r.Vector3(),
      l = [],
      c = new r.Box3(),
      f = Math.abs(e.scale.y || 1);
    e.traverse(function (I) {
      if (!(!I.isMesh || !I.geometry || !I.geometry.attributes.position)) {
        var N = String(I.userData.matName || "").toLowerCase(),
          K = I.geometry.attributes.position,
          ne = new r.Matrix4().multiplyMatrices(o, I.matrixWorld),
          T,
          ae = N.indexOf("headlights light") !== -1,
          ue = N.indexOf("red light") !== -1 || N.indexOf("tail") !== -1;
        for (T = 0; T < K.count; T += ae ? 1 : 4)
          (s.fromBufferAttribute(K, T).applyMatrix4(ne), c.expandByPoint(s), ae && l.push(s.clone()));
        if (
          (ae &&
            I.material &&
            I.material.emissive &&
            ((I.material = I.material.clone()), n.mats.push(I.material)),
          ue && !ae)
        ) {
          for (T = 0; T < K.count; T++) (s.fromBufferAttribute(K, T).applyMatrix4(ne), i.push(s.clone()));
          I.material && I.material.emissive && ((I.material = I.material.clone()), n.tmats.push(I.material));
        }
      }
    });
    var u = a || 1,
      p = [];
    if (l.length) {
      var v = 0,
        w = 0;
      (l.forEach(function (I) {
        ((v += I.x), (w += I.z));
      }),
        (v /= l.length),
        (w /= l.length),
        (u = w > (c.min.z + c.max.z) / 2 ? 1 : -1));
      var y = [[], []];
      (l.forEach(function (I) {
        y[I.x > v ? 1 : 0].push(I);
      }),
        y.forEach(function (I) {
          if (I.length) {
            var N = new r.Vector3();
            (I.forEach(function (K) {
              N.add(K);
            }),
              N.multiplyScalar(1 / I.length),
              p.push(N));
          }
        }));
    }
    if (p.length < 2) {
      p = [];
      var E = (c.max.x - c.min.x) * 0.3,
        M = c.min.y + (c.max.y - c.min.y) * 0.38,
        g = u > 0 ? c.max.z * 0.95 : c.min.z * 0.95;
      p.push(new r.Vector3(-E, M, g), new r.Vector3(E, M, g));
    }
    if (((n.fz = u), (n.cones = []), !t.beamTex)) {
      var b = document.createElement("canvas");
      ((b.width = 8), (b.height = 128));
      var k = b.getContext("2d"),
        L = k.createLinearGradient(0, 0, 0, 128);
      (L.addColorStop(0, "rgba(255,255,255,1)"),
        L.addColorStop(0.35, "rgba(255,255,255,0.35)"),
        L.addColorStop(1, "rgba(255,255,255,0)"),
        (k.fillStyle = L),
        k.fillRect(0, 0, 8, 128),
        (t.beamTex = new r.CanvasTexture(b)));
    }
    (p.forEach(function (I) {
      var N = new r.ConeGeometry(3.4, 28, 16, 1, !0);
      N.translate(0, -14, 0);
      var K = new r.Mesh(
        N,
        new r.MeshBasicMaterial({
          map: t.beamTex,
          color: 15660799,
          transparent: !0,
          opacity: 0,
          blending: r.AdditiveBlending,
          depthWrite: !1,
          side: r.DoubleSide,
        }),
      );
      ((K.rotation.x = -u * (Math.PI / 2 - 0.07)),
        K.position.set(I.x, I.y, I.z + u * (1.4 / f)),
        K.scale.setScalar(1 / f),
        (K.renderOrder = 5),
        (K.visible = !1),
        e.add(K),
        n.cones.push(K));
    }),
      p.forEach(function (I) {
        var N = new r.SpotLight(16770254, 0, 120, 0.5, 0.6, 0);
        (N.position.set(I.x, I.y - 0.05, I.z + u * (1.4 / f)),
          N.target.position.set(I.x, 0, I.z + u * (22 / f)),
          e.add(N),
          e.add(N.target),
          n.lights.push(N));
        var K = new r.Sprite(
          new r.SpriteMaterial({
            map: so(),
            color: 16770254,
            transparent: !0,
            opacity: 0,
            blending: r.AdditiveBlending,
            depthWrite: !1,
            depthTest: !1,
          }),
        );
        (K.position.set(I.x, I.y, I.z + u * 0.5),
          K.scale.setScalar(2.2 / f),
          (K.renderOrder = 6),
          e.add(K),
          n.glares.push(K));
      }));
    var x = (p[0].x + p[1].x) / 2,
      P = (p[0].z + p[1].z) / 2 + u * (11 / f),
      h = new r.Mesh(
        new r.PlaneGeometry(15 / f, 26 / f),
        new r.MeshBasicMaterial({
          map: so(),
          color: 16770254,
          transparent: !0,
          opacity: 0,
          blending: r.AdditiveBlending,
          depthWrite: !1,
        }),
      );
    if (
      ((h.rotation.x = -Math.PI / 2),
      h.position.set(x, 0.07 / f, P),
      (h.renderOrder = 4),
      e.add(h),
      (n.pool = h),
      i.length)
    ) {
      var B = 0;
      (i.forEach(function (I) {
        B += I.x;
      }),
        (B /= i.length));
      var G = [[], []];
      i.forEach(function (I) {
        G[I.x > B ? 1 : 0].push(I);
      });
      var z = [];
      G.forEach(function (I) {
        if (I.length) {
          var N = new r.Vector3();
          (I.forEach(function (ne) {
            N.add(ne);
          }),
            N.multiplyScalar(1 / I.length));
          var K = new r.Sprite(
            new r.SpriteMaterial({
              map: so(),
              color: 16722456,
              transparent: !0,
              opacity: 0,
              blending: r.AdditiveBlending,
              depthWrite: !1,
              depthTest: !1,
            }),
          );
          (K.position.set(N.x, N.y, N.z - u * 0.5),
            K.scale.setScalar(1.8 / f),
            (K.renderOrder = 6),
            e.add(K),
            n.tglares.push(K),
            z.push(N));
        }
      });
      var Q =
          z.reduce(function (I, N) {
            return I + N.x;
          }, 0) / z.length,
        J =
          z.reduce(function (I, N) {
            return I + N.z;
          }, 0) / z.length,
        q = new r.Mesh(
          new r.PlaneGeometry(10 / f, 9 / f),
          new r.MeshBasicMaterial({
            map: so(),
            color: 16722456,
            transparent: !0,
            opacity: 0,
            blending: r.AdditiveBlending,
            depthWrite: !1,
            polygonOffset: !0,
            polygonOffsetFactor: -6,
            polygonOffsetUnits: -6,
          }),
        );
      ((q.rotation.x = -Math.PI / 2),
        q.position.set(Q, 0.07 / f, J - u * (4.5 / f)),
        (q.renderOrder = 4),
        e.add(q),
        (n.tpool = q));
      var O =
          z.reduce(function (I, N) {
            return I + N.y;
          }, 0) / z.length,
        F = new r.PointLight(qe.rearColor, 0, qe.rearDistance, 2);
      (F.position.set(Q, O, J - u * (5 / f)), (F.visible = !1), e.add(F), (n.rear = F));
    }
    return n;
  }
  function zn() {
    if (!(!t || !t.carList)) {
      var iv = typeof MER !== "undefined" && MER && MER.intro && MER.intro.ok ? MER.intro : null,
        e = zt === "night" && (!!t.drive || !!iv),
        a = t.drive ? t.drive.i : iv ? iv.hero : -1,
        r = t.camera ? t.camera.position : null;
      t.carList.forEach(function (n, i) {
        var o = n.userData.heads;
        if (o) {
          var s = e && i === a,
            l = !!t.cineHigh;
          (o.lights.forEach(function (M) {
            l
              ? (M.color.setHex(qe.headColor),
                (M.distance = qe.headDistance),
                (M.angle = qe.headAngle),
                (M.penumbra = qe.headPenumbra),
                (M.decay = qe.headDecay),
                (M.intensity = s ? qe.headIntensity : 0))
              : (M.color.setHex(16770254),
                (M.distance = 120),
                (M.angle = 0.5),
                (M.penumbra = 0.6),
                (M.decay = 0),
                (M.intensity = s ? 16 : 0));
          }),
            o.mats.forEach(function (M) {
              (M.emissive.set(16770254), (M.emissiveIntensity = s ? 1.6 : 0));
            }),
            o.pool && (o.pool.material.opacity = s ? (iv && iv.dim ? 0.45 : 0.6) : 0),
            o.cones &&
              o.cones.forEach(function (M) {
                ((M.material.opacity = s ? (iv && iv.dim ? 0.03 : 0.07) : 0), (M.visible = !!s));
              }));
          var c = 0;
          if (s && r) {
            var f = new fe.Vector3(0, 0, o.fz).transformDirection(n.matrixWorld),
              u = r.clone().sub(n.getWorldPosition(new fe.Vector3()));
            ((u.y = 0), u.lengthSq() > 1e-6 && (u.normalize(), (c = Math.max(0, f.dot(u)))));
          }
          o.glares.forEach(function (M) {
            M.material.opacity = s ? Math.min(0.9, 1.1 * c * c * c) * (iv && iv.dim ? 0.45 : 1) : 0;
          });
          var p = s && ((t.drive && t.drive.brake) || (iv && iv.brake)) ? 1 : 0,
            v = 0;
          if (s && r) {
            var w = new fe.Vector3(0, 0, -o.fz).transformDirection(n.matrixWorld),
              y = r.clone().sub(n.getWorldPosition(new fe.Vector3()));
            ((y.y = 0), y.lengthSq() > 1e-6 && (y.normalize(), (v = Math.max(0, w.dot(y)))));
          }
          if (
            (o.tmats.forEach(function (M) {
              l
                ? (M.emissive.set(16718362), (M.emissiveIntensity = s ? qe.tailIntensity + 1.4 + 2.2 * p : 0))
                : (M.emissive.set(16718352), (M.emissiveIntensity = s ? 3.2 + 2.6 * p : 0));
            }),
            o.rear)
          ) {
            var E = !!(l && s);
            (o.rear.visible !== E && (o.rear.visible = E),
              (o.rear.intensity = E ? qe.rearIntensity * (1 + 0.9 * p) : 0));
          }
          (o.tglares.forEach(function (M) {
            M.material.opacity = s ? Math.min(0.95, (0.45 + 0.45 * p) * v * v * v + 0.22 + 0.1 * p) : 0;
          }),
            o.tpool && (o.tpool.material.opacity = s ? 0.3 + 0.25 * p : 0));
        }
      });
    }
  }
  function lo(e, a) {
    var r = t && t.hills,
      n = 0,
      i;
    if (!r) return 0;
    for (i = 0; i < r.length; i++) {
      var o = r[i],
        s = e - o.x,
        l = a - o.z,
        c = s * s + l * l;
      c < o.r * o.r && (n += o.h * (0.5 + 0.5 * Math.cos((Math.PI * Math.sqrt(c)) / o.r)));
    }
    return n;
  }
  function l0(e, a) {
    var r = t && t.terrain;
    if (!r) return lo(e, a);
    function n(f, u, p) {
      var v = Math.min(1, Math.max(0, (p - f) / (u - f)));
      return v * v * (3 - 2 * v);
    }
    var i = r.z0 + 0.7,
      o = r.z1 - 0.7,
      s = -0.5 * n(i - 0.1, i + 0.3, a) * (1 - n(o - 0.3, o + 0.1, a));
    a > r.z1 && (s = 0);
    var l = -0.5 * n(r.z0, r.z0 + 2.5, a) * (1 - n(o - 0.3, o + 0.1, a));
    a > r.z1 && (l = 0);
    var c = Math.min(1, Math.max(0, (r.ax - Math.abs(e)) / 1.2));
    return s * (1 - c) + l * c;
  }
  function _o(e, a, r) {
    var n = Math.abs(e.scale.y || 1),
      i = (-a.r * Math.PI) / 180,
      o = Math.cos(i),
      s = Math.sin(i),
      l = r.wheels,
      c = l.length,
      f,
      u = 0,
      p = 0,
      v = [],
      w = 0;
    for (f = 0; f < c; f++) ((u += l[f].lx * n), (p += l[f].lz * n));
    ((u /= c), (p /= c));
    var y = 0,
      E = 0,
      M = 0,
      g = 0;
    for (f = 0; f < c; f++) {
      var b = l[f].lx * n,
        k = l[f].lz * n,
        L = l0(a.x + b * o + k * s, a.z - b * s + k * o);
      (v.push(L),
        (w += L),
        (y += (b - u) * L),
        (E += (b - u) * (b - u)),
        (M += (k - p) * L),
        (g += (k - p) * (k - p)));
    }
    return { y: w / c, th: g > 1e-6 ? -M / g : 0, ph: E > 1e-6 ? y / E : 0, hs: v, sc: n };
  }
  function js(e, a, r, n) {
    ((e.rotation.order = "YXZ"), (e.position.y = a.y + 0.15), (e.rotation.x = a.th), (e.rotation.z = a.ph));
    var i = r.sc;
    n.wheels.forEach(function (o, s) {
      var l = a.y + 0.15 + a.ph * o.lx * i - a.th * o.lz * i,
        c = Math.max(-0.5, Math.min(0.25, r.hs[s] + 0.13 - l));
      o.steer.position.y = o.cy + c / i;
    });
  }
  function Ys(e, a, r, n, i, o) {
    var s = _o(r, a, n),
      l = e.su,
      c = n.fwdZ,
      f = (e.v * e.v * Math.tan(e.steer)) / (wt * 0.85),
      u = s.th - c * Math.max(-30, Math.min(30, o)) * 4e-4,
      p = s.ph + c * Math.max(-0.03, Math.min(0.03, f * 3.5e-4));
    ((u = Math.max(-0.5, Math.min(0.5, u))), (p = Math.max(-0.5, Math.min(0.5, p))));
    var v = 950,
      w = 2 * Math.sqrt(v) * 1.05,
      y = 4,
      E,
      M = i / y;
    for (E = 0; E < y; E++)
      ((l.vy += (v * (s.y - l.y) - w * l.vy) * M),
        (l.y += l.vy * M),
        (l.vth += (v * (u - l.th) - w * l.vth) * M),
        (l.th += l.vth * M),
        (l.vph += (v * (p - l.ph) - w * l.vph) * M),
        (l.ph += l.vph * M));
    js(r, l, s, n);
  }
  function Pn(e) {
    var a = Math.floor(e / 6e4),
      r = (e % 6e4) / 1e3;
    return a + ":" + (r < 10 ? "0" : "") + r.toFixed(3);
  }
  var cn = "#35d07f",
    ba = "#ff3b30",
    Qo = "#ffc933",
    c0 = "#8d93a0",
    In = "#2a2e36";
  function Ko() {
    if (!document.getElementById("lc-race-css")) {
      var e = document.createElement("style");
      ((e.id = "lc-race-css"),
        (e.textContent =
          '.lc-three .lc-racebtn{display:none;position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:6;align-items:center;gap:10px;padding:12px 26px 12px 20px;border:0;border-radius:999px;background:linear-gradient(180deg,#ffd24d,#f0a91a);color:#140d00;font:900 17px/1 "Arial Black",Arial,sans-serif;letter-spacing:.04em;box-shadow:0 6px 22px rgba(0,0,0,.45);cursor:pointer}.lc-three .lc-racebtn:hover{filter:brightness(1.08)}.lc-three .lc-racebtn:focus-visible{outline:3px solid #fff;outline-offset:3px}.lc-three .lc-racebtn i{display:block;width:22px;height:16px;background:conic-gradient(#111 25%,#fff 0 50%,#111 0 75%,#fff 0) 0 0/8px 8px;border-radius:2px}.lc-three.lc-open:not(.lc-walking):not(.lc-driving) .lc-racebtn{display:flex}.lc-three .lc-drivebar [data-rb]{display:none}.lc-three.lc-racing .lc-drivebar [data-rb]{display:inline-block}.lc-three .lc-drivebar [data-rb="cam"]{display:inline-block}.lc-three .lc-drivebar [data-rb]{background:#fff !important;color:#0a0203 !important}.lc-three .lc-tc{display:none;position:absolute;left:0;right:0;bottom:0;height:0;z-index:7;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}.lc-three.lc-open.lc-driving.lc-touchui .lc-tc{display:block}.lc-three .lc-tc-steer{position:absolute;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));width:min(40vw,320px);height:100px;border-radius:50px;background:rgba(10,12,16,.5);border:2px solid rgba(255,255,255,.28);touch-action:none}.lc-three .lc-tc-steer:before,.lc-three .lc-tc-steer:after{content:"";position:absolute;top:50%;margin-top:-10px;border:10px solid transparent}.lc-three .lc-tc-steer:before{left:12px;border-right-color:rgba(255,255,255,.5)}.lc-three .lc-tc-steer:after{right:12px;border-left-color:rgba(255,255,255,.5)}.lc-three .lc-tc-steer i{position:absolute;left:50%;top:50%;width:80px;height:80px;margin:-40px 0 0 -40px;border-radius:50%;background:rgba(255,255,255,.9);box-shadow:0 3px 12px rgba(0,0,0,.4);pointer-events:none}.lc-three .lc-tc-r{position:absolute;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));display:grid;grid-template-columns:auto auto;gap:10px;align-items:end;justify-items:center}.lc-three .lc-tc button{border:2px solid rgba(255,255,255,.35);color:#fff;font:900 13px/1 "Arial Black",Arial,sans-serif;letter-spacing:.05em;touch-action:none;-webkit-tap-highlight-color:transparent;padding:0}.lc-three .lc-tc [data-tc=hb],.lc-three .lc-tc [data-tc=boost]{width:62px;height:62px;border-radius:50%;background:rgba(10,12,16,.6)}.lc-three .lc-tc [data-tc=boost]{background:rgba(20,90,160,.75)}.lc-three .lc-tc [data-tc=brk]{width:78px;height:92px;border-radius:14px;background:rgba(150,24,20,.8)}.lc-three .lc-tc [data-tc=gas]{width:84px;height:118px;border-radius:14px;background:rgba(24,140,70,.85)}.lc-three .lc-tc button.lc-on{filter:brightness(1.45);transform:scale(.94)}.lc-three.lc-touchui .lc-drivebar span{display:none}.lc-three.lc-touchui .lc-drivebar{padding-left:6px}.lc-three.lc-touchui canvas.lc-minimap{top:max(10px,env(safe-area-inset-top)) !important;bottom:auto !important;left:max(10px,env(safe-area-inset-left)) !important;width:104px !important;height:104px !important}.lc-three.lc-touchui .lc-rhud{top:58px !important}.lc-three.lc-open .lc-howto{display:flex !important;flex-direction:column !important;flex-wrap:nowrap !important;align-items:flex-end !important;justify-content:flex-start !important;left:auto !important;right:12px !important;top:12px !important;bottom:auto !important;max-height:calc(100% - 120px);overflow:hidden;gap:6px !important;z-index:4 !important}.lc-three.lc-tipsoff .lc-howto{display:none !important}.lc-three .lc-howto-head{display:flex;align-items:center;gap:10px;pointer-events:auto;color:#fff;font:700 12px/1 Arial,sans-serif;letter-spacing:.04em;background:rgba(6,32,66,.9);border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:3px 3px 3px 12px}.lc-three .lc-howto-head button{width:24px;height:24px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;font:700 16px/1 Arial,sans-serif;cursor:pointer;padding:0}.lc-three .lc-howto-head button:hover{background:rgba(255,255,255,.3)}.lc-three .lc-howto-info{display:none;position:absolute;right:12px;top:12px;z-index:4;width:32px;height:32px;padding:0;border-radius:50%;border:1px solid rgba(255,255,255,.4);background:rgba(6,32,66,.9);color:#fff;font:italic 700 17px/1 Georgia,serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3)}.lc-three.lc-open.lc-tipsoff:not(.lc-walking):not(.lc-driving) .lc-howto-info{display:block}.lc-three.lc-racing .lc-lsw,.lc-three.lc-racing .lc-zoom,.lc-three.lc-touchui.lc-driving .lc-lsw,.lc-three.lc-touchui.lc-driving .lc-zoom,.lc-three.lc-touchui.lc-driving .lc-expand{display:none !important}.lc-three .lc-cine{display:none;position:absolute;inset:0;z-index:8;cursor:pointer}.lc-three .lc-cine i{position:absolute;left:0;right:0;height:12%;background:#000;transition:transform .7s cubic-bezier(.2,.8,.2,1)}.lc-three .lc-cine .lc-cine-t{top:0;transform:translateY(-100%)}.lc-three .lc-cine .lc-cine-b{bottom:0;transform:translateY(100%)}.lc-three .lc-cine.lc-on i{transform:none}.lc-three .lc-cine-tt{position:absolute;left:5%;bottom:calc(12% + 4%);color:#fff;font:italic 900 clamp(34px,7vw,78px)/.92 "Arial Black",Impact,Arial,sans-serif;letter-spacing:.01em;text-shadow:0 6px 24px rgba(0,0,0,.75);opacity:0;transform:translateX(-40px);transition:opacity .8s ease .5s,transform .8s cubic-bezier(.2,.8,.2,1) .5s}.lc-three .lc-cine.lc-on .lc-cine-tt{opacity:1;transform:none}.lc-three .lc-cine.lc-cine-tv .lc-cine-tt{display:none}.lc-three .lc-cine-hint{position:absolute;left:0;right:0;bottom:4%;text-align:center;color:#fff;font:700 14px/1 Arial,sans-serif;letter-spacing:.08em;opacity:0;transition:opacity .5s;pointer-events:none}.lc-three .lc-cine.lc-cine-ready .lc-cine-hint{opacity:.85}.lc-three .lc-cine-tt small,.lc-three .lc-cine-tt em{display:block;font:800 clamp(11px,1.5vw,15px)/1.4 Arial,sans-serif;letter-spacing:.32em;font-style:normal;color:#ffc233}.lc-three .lc-cine-tt small{margin-bottom:8px}.lc-three .lc-cine-tt em{margin-top:10px;color:#d6dbe3}.lc-three .lc-cine-sk{position:absolute;right:max(16px,env(safe-area-inset-right));bottom:3%;z-index:1;padding:8px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.12);color:#fff;font:700 13px/1 Arial,sans-serif;cursor:pointer}.lc-three.lc-intro .lc-drivebar,.lc-three.lc-intro .lc-rhud,.lc-three.lc-intro canvas.lc-minimap,.lc-three.lc-intro .lc-tc,.lc-three.lc-intro .lc-dragtip{display:none !important}.lc-three .lc-bignum{position:absolute;left:50%;top:44%;z-index:7;pointer-events:none;transform:translate(-50%,-50%);font:italic 900 clamp(110px,30vh,280px)/1 "Arial Black",Impact,Arial,sans-serif;-webkit-text-stroke:5px #0b0c10;paint-order:stroke fill;text-shadow:0 10px 40px rgba(0,0,0,.6);opacity:0}.lc-three .lc-bignum.lc-pop{animation:lcpop .78s cubic-bezier(.2,.9,.25,1) forwards}.lc-three .lc-bignum.lc-go{animation:lcgo 1.2s cubic-bezier(.2,.9,.25,1) forwards}@keyframes lcpop{0%{opacity:0;transform:translate(-50%,-50%) scale(2.4)}18%{opacity:1;transform:translate(-50%,-50%) scale(1)}72%{opacity:1;transform:translate(-50%,-50%) scale(.96)}100%{opacity:0;transform:translate(-50%,-50%) scale(.8)}}@keyframes lcgo{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}60%{opacity:1;transform:translate(-50%,-50%) scale(1.25)}100%{opacity:0;transform:translate(-50%,-50%) scale(2.2)}}.lc-three .lc-racebtn.lc-pulse{animation:lcpulse 1.1s ease-in-out infinite}@keyframes lcpulse{0%,100%{box-shadow:0 6px 22px rgba(0,0,0,.45),0 0 0 0 rgba(255,201,51,.7)}50%{box-shadow:0 6px 22px rgba(0,0,0,.45),0 0 0 14px rgba(255,201,51,0)}}@media (prefers-reduced-motion:reduce){.lc-three .lc-racebtn.lc-pulse{animation:none}}.lc-three .lc-gauge{display:none;position:absolute;right:max(14px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));width:200px;height:240px;z-index:6;pointer-events:none;filter:drop-shadow(0 6px 18px rgba(0,0,0,.5))}.lc-three.lc-touchui .lc-gauge{top:max(8px,env(safe-area-inset-top)) !important;bottom:auto !important;right:max(10px,env(safe-area-inset-right)) !important;width:140px !important;height:168px !important}.lc-three.lc-intro .lc-gauge,.lc-three.lc-intro .lc-speedfx{display:none !important}.lc-three .lc-drivebar{left:auto !important;right:max(12px,env(safe-area-inset-right)) !important;top:12px !important;transform:none !important;flex-direction:column !important;align-items:stretch !important;gap:6px !important;padding:12px !important;border-radius:16px !important;width:172px;box-sizing:border-box}.lc-three .lc-drivebar span{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:center;font-size:12px;line-height:1.2;white-space:normal;margin:0 0 6px;padding:0 2px}.lc-three .lc-drivebar span b{justify-self:start;min-width:22px;padding:2px 6px;border-radius:5px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);font:800 11px/1.2 Arial,sans-serif;text-align:center;color:#ffc233}.lc-three .lc-drivebar span em{font-style:normal;font-weight:600;opacity:.92}.lc-three .lc-drivebar button{width:100%}.lc-three.lc-touchui .lc-drivebar{right:auto !important;left:max(10px,env(safe-area-inset-left)) !important;top:124px !important;width:118px;padding:6px !important;gap:5px !important}.lc-three .lc-howto-head button:focus-visible,.lc-three .lc-howto-info:focus-visible{outline:2px solid #ffc233;outline-offset:2px}'),
        document.head.appendChild(e));
    }
  }
  function f0(e) {
    return Math.round(e.S[0]) + "_" + Math.round(e.S[1]) + "_" + Math.round(e.len || 0);
  }
  function u0(e) {
    var a = e.len || 3900;
    return [
      { n: "GOLD", c: "#ffcf3d", t: Math.round((a / 112) * 10) * 100 },
      { n: "SILVER", c: "#d6dbe3", t: Math.round((a / 94) * 10) * 100 },
      { n: "BRONZE", c: "#d9904f", t: Math.round((a / 76) * 10) * 100 },
    ];
  }
  function co() {
    var e = t.track,
      a = f0(e);
    if (t.race && t.race.sig === a) return t.race;
    var r = null;
    try {
      r = JSON.parse(localStorage.getItem("lcRace") || "null");
    } catch {
      r = null;
    }
    if (
      (!r || r.sig !== a) &&
      ((r = { sig: a, best: 0, sp: [], ghost: [], drift: 0 }), !localStorage.getItem("lcRace"))
    )
      try {
        var n = JSON.parse(localStorage.getItem("lcBestLap") || "null");
        n && n.t > 0 && (r.best = n.t);
      } catch {}
    return (
      (t.race = {
        sig: a,
        state: "off",
        best: r.best || 0,
        bestSplits: r.sp && r.sp.length === 3 ? r.sp : [],
        ghost: r.ghost || [],
        bestDrift: r.drift || 0,
        splits: [],
        rec: [],
        cp: [],
        t0: 0,
        pen: 0,
        passed: !1,
        prevAl: 0,
        go: 0,
        flash: null,
        dUntil: 0,
        dTxt: "",
        dCol: "",
        drift: { pend: 0, mult: 1, t: 0, gap: 0, lap: 0, ftxt: "", fUntil: 0 },
      }),
      t.race
    );
  }
  function d0(e) {
    try {
      localStorage.setItem(
        "lcRace",
        JSON.stringify({ sig: e.sig, best: e.best, sp: e.bestSplits, ghost: e.ghost, drift: e.bestDrift }),
      );
    } catch {}
  }
  function h0() {
    var e = t.hud;
    return (
      e ||
      (Ko(),
      (e = document.createElement("div")),
      (e.className = "lc-rhud"),
      (e.style.cssText =
        'position:absolute;top:6px;left:50%;transform:translateX(-50%);transform-origin:50% 0;z-index:6;pointer-events:none;display:none;font-family:"Arial Black",Impact,"Helvetica Neue",Arial,sans-serif;color:#fff'),
      (e.innerHTML =
        '<div class="lc-rh-box" style="display:flex;justify-content:center;background:none;border:0;box-shadow:none;transform:none"><div style="padding:0;min-width:340px;text-align:center"><div class="lc-rh-lights" style="display:none;justify-content:center;gap:14px;margin:2px 0 8px"><b></b><b></b><b></b></div><div class="lc-rh-label" style="font-size:16px;letter-spacing:.24em;font-weight:900;font-style:italic;text-shadow:0 0 12px currentColor,0 2px 6px rgba(0,0,0,.9)"></div><div class="lc-rh-time" style="font-size:72px;font-weight:900;font-style:italic;font-variant-numeric:tabular-nums;line-height:1;letter-spacing:.01em;-webkit-text-stroke:3px #02060f;paint-order:stroke fill;text-shadow:0 0 26px rgba(47,140,255,.95),0 5px 0 rgba(0,0,0,.55)"></div><div class="lc-rh-bar" style="height:4px;width:240px;margin:4px auto 0;transform:skewX(-30deg);background:#ff3b30;box-shadow:0 0 12px currentColor"></div><div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:8px"><span class="lc-rh-pips" style="display:flex;gap:6px"><i></i><i></i><i></i></span><span class="lc-rh-best" style="font-size:14px;font-weight:900;font-style:italic;letter-spacing:.1em;margin-left:12px;text-shadow:0 2px 6px rgba(0,0,0,.9)"></span></div><div class="lc-rh-medal" style="font-size:13px;font-weight:900;font-style:italic;letter-spacing:.16em;margin-top:5px;text-shadow:0 2px 6px rgba(0,0,0,.9)"></div></div><div style="display:none"><span class="lc-rh-mph"></span><span class="lc-rh-gear"></span><div class="lc-rh-boost"></div></div></div><div class="lc-rh-drift" style="text-align:center;margin-top:6px;font-size:18px;font-weight:900;font-style:italic;letter-spacing:.04em;text-shadow:0 2px 10px rgba(0,0,0,.8)"></div>'),
      Array.prototype.forEach.call(e.querySelectorAll(".lc-rh-pips i"), function (a) {
        a.style.cssText = "display:block;width:22px;height:7px;border-radius:2px;background:#30343d";
      }),
      Array.prototype.forEach.call(e.querySelectorAll(".lc-rh-lights b"), function (a) {
        a.style.cssText =
          "display:block;width:20px;height:20px;border-radius:50%;background:#2a2e36;border:2px solid #111;transition:background .08s";
      }),
      t.host.appendChild(e),
      (t.hud = e),
      e)
    );
  }
  function Zs(e) {
    if (t) {
      var a = h0();
      if (!e) {
        a.style.display = "none";
        return;
      }
      a.style.display = "block";
      var r = Math.max(
        0.82,
        Math.min(1.05, (t.host.clientWidth || 800) / 520, (t.host.clientHeight || 700) / 420),
      );
      ((a.style.transform = "translateX(-50%) scale(" + (r * 0.95).toFixed(2) + ")"),
        (a.querySelector(".lc-rh-bar").style.background = e.color),
        (a.querySelector(".lc-rh-bar").style.color = e.color));
      var n = a.querySelector(".lc-rh-label");
      n.textContent = "";
      String(e.label || "").split(/ {2,}/).forEach(function (part, pi) {
        if (!part) return;
        if (pi > 0) { var sp = document.createElement("i"); sp.className = "lc-rh-sep"; n.appendChild(sp); }
        var sx = document.createElement("span"); sx.textContent = part; n.appendChild(sx);
      });
      ((n.style.color = /^CHECKPOINT/.test(e.label || "") ? "#e0f7ff" : e.color),
        (a.querySelector(".lc-rh-time").textContent = e.time),
        (a.querySelector(".lc-rh-best").textContent = e.best || ""));
      var i = a.querySelector(".lc-rh-medal");
      ((i.textContent = e.medal || ""),
        (i.style.color = e.medalCol || "#c9ced8"),
        (a.querySelector(".lc-rh-mph").textContent = String(Math.round(e.mph || 0))),
        (a.querySelector(".lc-rh-gear").textContent = e.gear ? "  G" + e.gear : ""));
      var o = a.querySelector(".lc-rh-boost");
      ((o.style.width = Math.round((e.boost || 0) * 100) + "%"),
        (o.style.background = e.boosting ? "#ff8a1f" : "#3fb6ff"));
      var s = a.querySelector(".lc-rh-lights"),
        l;
      if (((s.style.display = e.lights ? "flex" : "none"), e.lights))
        for (l = 0; l < 3; l++) s.children[l].style.background = e.lights[l];
      var c = a.querySelector(".lc-rh-pips").children;
      for (l = 0; l < c.length; l++) c[l].style.background = l < (e.hit || 0) ? e.color : "#30343d";
      var f = a.querySelector(".lc-rh-drift");
      ((f.textContent = e.drift || ""), (f.style.color = e.driftCol || "#ffd24d"));
    }
  }
  function _s(e, a) {
    t.mapCv && (t.mapCv.style.display = "none");
    return;
    var r = t.track,
      n = t.mapCv;
    if (
      (n ||
        ((n = document.createElement("canvas")),
        (n.width = n.height = 220),
        (n.className = "lc-minimap"),
        (n.style.cssText =
          "position:absolute;left:20px;bottom:20px;width:160px;height:160px;z-index:6;pointer-events:none;background:rgba(4,12,30,.78);border:2px solid #3d9bff;border-radius:50%;box-shadow:0 0 18px rgba(47,140,255,.5);display:none"),
        t.host.appendChild(n),
        (t.mapCv = n)),
      !e || !r || !r.pts)
    ) {
      n.style.display = "none";
      return;
    }
    if (((n.style.display = "block"), !r.box || r.box.src !== r.pts)) {
      var i = 1e9,
        o = -1e9,
        s = 1e9,
        l = -1e9;
      (r.pts.forEach(function (M) {
        ((i = Math.min(i, M[0])), (o = Math.max(o, M[0])), (s = Math.min(s, M[1])), (l = Math.max(l, M[1])));
      }),
        (r.box = { src: r.pts, x0: i, x1: o, z0: s, z1: l }));
    }
    var c = r.box,
      f = 190 / Math.max(c.x1 - c.x0, c.z1 - c.z0),
      u = 110 - ((c.x0 + c.x1) / 2) * f,
      p = 110 - ((c.z0 + c.z1) / 2) * f,
      v = n.getContext("2d"),
      w,
      y = function (M) {
        return u + M * f;
      },
      E = function (M) {
        return p + M * f;
      };
    (v.clearRect(0, 0, 220, 220),
      (v.lineJoin = "round"),
      (v.lineCap = "round"),
      [
        [11, "#4a505c"],
        [5, "#a6adb9"],
      ].forEach(function (M) {
        for (v.beginPath(), w = 0; w < r.pts.length; w += 2) {
          var g = r.pts[w];
          w === 0 ? v.moveTo(y(g[0]), E(g[1])) : v.lineTo(y(g[0]), E(g[1]));
        }
        (v.closePath(), (v.lineWidth = M[0]), (v.strokeStyle = M[1]), v.stroke());
      }),
      ie &&
        ((v.fillStyle = "#6b7280"),
        v.fillRect(y(-ie.wid / 2), E(-ie.len / 2), Math.max(3, ie.wid * f), Math.max(3, ie.len * f))),
      (v.strokeStyle = "#fff"),
      (v.lineWidth = 3),
      v.beginPath(),
      v.moveTo(y(r.S[0] - r.T[1] * 22), E(r.S[1] + r.T[0] * 22)),
      v.lineTo(y(r.S[0] + r.T[1] * 22), E(r.S[1] - r.T[0] * 22)),
      v.stroke(),
      a &&
        ((v.fillStyle = "rgba(127,211,255,.9)"),
        v.beginPath(),
        v.arc(y(a[0]), E(a[1]), 5, 0, 6.283),
        v.fill()),
      (v.fillStyle = "#ff3b30"),
      (v.strokeStyle = "#fff"),
      (v.lineWidth = 2),
      v.beginPath(),
      v.arc(y(e.x), E(e.z), 6, 0, 6.283),
      v.fill(),
      v.stroke());
  }

  /* Rubber skid texture: soft edges, dense center and broken speckle so marks look like real tire tracks. */
  function merSkidTex(e) {
    var cv = document.createElement("canvas");
    cv.width = 32; cv.height = 128;
    var x = cv.getContext("2d"), im = x.createImageData(32, 128), d = im.data, i, j, seed = 7;
    for (j = 0; j < 128; j++)
      for (i = 0; i < 32; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        var r = (seed >>> 24) / 255, u = Math.abs(i - 15.5) / 15.5,
          edge = Math.pow(1 - u, 0.7), a = edge * (0.55 + 0.45 * r) * (r > 0.12 ? 1 : 0.4), k = (j * 32 + i) * 4;
        d[k] = d[k + 1] = d[k + 2] = 255;
        d[k + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255);
      }
    x.putImageData(im, 0, 0);
    var t2 = new e.CanvasTexture(cv);
    return ((t2.wrapT = e.RepeatWrapping), (t2.anisotropy = 4), t2);
  }
  function Qs() {
    var e = fe;
    if (t.rvis && t.rvis.parent === t.group) return t.rvis;
    t.rvis && t.rvis.parent && t.rvis.parent.remove(t.rvis);
    var a = new e.Group();
    (t.group.add(a), (t.rvis = a));
    var r = 1800,
      n = new Float32Array(r * 12),
      i = [],
      o;
    for (o = 0; o < r; o++) i.push(o * 4, o * 4 + 1, o * 4 + 2, o * 4 + 1, o * 4 + 3, o * 4 + 2);
    var s = new e.BufferGeometry();
    (s.setAttribute("position", new e.BufferAttribute(n, 3)), s.setAttribute("uv", new e.BufferAttribute(new Float32Array(r * 8), 2)), s.setIndex(i), s.setDrawRange(0, 0));
    var l = new e.Mesh(
      s,
      new e.MeshBasicMaterial({
        color: 0x141416,
        map: merSkidTex(e),
        transparent: !0,
        opacity: 0.95,
        depthWrite: !1,
        polygonOffset: !0,
        polygonOffsetFactor: -6,
        polygonOffsetUnits: -6,
        side: e.DoubleSide,
      }),
    );
    ((l.frustumCulled = !1),
      (l.renderOrder = 2),
      a.add(l),
      (a.userData.skid = { mesh: l, n: r, next: 0, used: 0, last: {} }));
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var f = c.getContext("2d"),
      u = f.createRadialGradient(32, 32, 0, 32, 32, 32);
    (u.addColorStop(0, "rgba(240,240,240,0.9)"),
      u.addColorStop(0.5, "rgba(225,225,225,0.4)"),
      u.addColorStop(1, "rgba(215,215,215,0)"),
      (f.fillStyle = u),
      f.fillRect(0, 0, 64, 64));
    var p = new e.CanvasTexture(c),
      v = [];
    for (o = 0; o < 130; o++) {
      var w = new e.Sprite(new e.SpriteMaterial({ map: p, transparent: !0, opacity: 0, depthWrite: !1 }));
      ((w.visible = !1), a.add(w), v.push({ s: w, life: 0, vy: 0 }));
    }
    return ((a.userData.smoke = { puffs: v, next: 0 }), a);
  }
  function p0(e, a, r) {
    var n = fe,
      i = r.userData.flames,
      o = t.carList[e.i],
      s = ee[e.i];
    if (!i) {
      var l = document.createElement("canvas");
      l.width = l.height = 64;
      var c = l.getContext("2d"),
        f = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      (f.addColorStop(0, "rgba(235,245,255,1)"),
        f.addColorStop(0.18, "rgba(120,170,255,0.95)"),
        f.addColorStop(0.4, "rgba(255,170,60,0.85)"),
        f.addColorStop(0.7, "rgba(255,80,20,0.35)"),
        f.addColorStop(1, "rgba(255,40,0,0)"),
        (c.fillStyle = f),
        c.fillRect(0, 0, 64, 64));
      var u = new n.CanvasTexture(l),
        p = [],
        v;
      for (v = 0; v < 8; v++) {
        var w = new n.Sprite(
          new n.SpriteMaterial({
            map: u,
            color: 16777215,
            transparent: !0,
            opacity: 0,
            depthWrite: !1,
            blending: n.AdditiveBlending,
            toneMapped: !1,
          }),
        );
        ((w.visible = !1), r.add(w), p.push(w));
      }
      var y = new n.PointLight(16742954, 0, 14, 2);
      (r.add(y), (i = r.userData.flames = { list: p, light: y, t: 0, k: 0 }));
    }
    var E = es(e).gear;
    if (
      (e.fxGear && E > e.fxGear && (e.thrIn || 0) > 0.1 && ((i.t = 0.24), (i.k = 1)),
      (e.fxGear = E),
      e.boosting && ((i.t = 0.24), (i.k = 1.5)),
      e.flameReq && (i.t <= 0.05 && ((i.t = 0.14), (i.k = e.flameReq)), (e.flameReq = 0)),
      i.t <= 0 || !o || !s)
    ) {
      i.on &&
        (i.list.forEach(function (z) {
          z.visible = !1;
        }),
        (i.light.intensity = 0),
        (i.on = !1));
      return;
    }
    ((i.t -= a), (i.on = !0));
    var M = Math.max(0, i.t) / (i.k >= 1 ? 0.24 : 0.14),
      g = (-s.r * Math.PI) / 180,
      b = e.rig.fwdZ,
      k = Math.sin(g),
      L = Math.cos(g),
      x = -b * k,
      P = -b * L,
      h = (o.position.y || 0) + 1.05,
      B,
      G = 0;
    ([-1, 1].forEach(function (z) {
      var Q = z * Fa * 0.6,
        J = -b * wt * 0.96,
        q = s.x + Q * L + J * k,
        O = s.z - Q * k + J * L;
      for (B = 0; B < 4; B++) {
        var F = i.list[G++],
          I = 0.15 + B * 0.45 * i.k,
          N = (1.1 - B * 0.2) * i.k * (0.75 + Math.random() * 0.5);
        (F.position.set(q + x * I, h + B * 0.04, O + P * I),
          F.scale.set(N * 1.25, N, 1),
          (F.material.opacity = Math.min(1, M * 1.6) * (1 - B * 0.18)),
          (F.visible = !0));
      }
    }),
      i.light.position.set(s.x + x * (wt * 0.96 + 0.8), h, s.z + P * (wt * 0.96 + 0.8)),
      (i.light.intensity = 6 * M * i.k));
  }
  function v0(e, a) {
    var r = fe,
      n = Qs(),
      i = n.userData.skid,
      o = n.userData.smoke,
      s = t.carList[e.i],
      l = new r.Vector3();
    if (s) {
      (s.updateMatrixWorld(!0), t.group.updateMatrixWorld(!0), p0(e, a, n));
      var c = Math.abs(e.v),
        f = c > 12 && !e.off && (e.slip > 0.1 || (e.brake && c > 40) || (e.boosting && c < 45));
      (e.rig.wheels.forEach(function (u, p) {
        if (!u.front) {
          (u.spin.getWorldPosition(l), t.group.worldToLocal(l));
          var v = Math.max(l.y - u.R + 0.06, 0.034),
            w = i.last[p];
          if (!f) {
            i.last[p] = null;
            return;
          }
          if (w) {
            var y = l.x - w.x,
              E = l.z - w.z,
              M = Math.sqrt(y * y + E * E);
            if (M < 0.45) return;
            if (M < 4) {
              var g = (-E / M) * 0.15,
                b = (y / M) * 0.15,
                k = i.mesh.geometry.attributes.position.array,
                L = i.next * 12;
              ((k[L] = w.x + g),
                (k[L + 1] = w.y),
                (k[L + 2] = w.z + b),
                (k[L + 3] = w.x - g),
                (k[L + 4] = w.y),
                (k[L + 5] = w.z - b),
                (k[L + 6] = l.x + g),
                (k[L + 7] = v),
                (k[L + 8] = l.z + b),
                (k[L + 9] = l.x - g),
                (k[L + 10] = v),
                (k[L + 11] = l.z - b),
                (function () {
                var uu = i.mesh.geometry.attributes.uv.array, q = i.next * 8, vv = M * 1.2;
                ((uu[q] = 0), (uu[q + 1] = 0), (uu[q + 2] = 1), (uu[q + 3] = 0), (uu[q + 4] = 0), (uu[q + 5] = vv), (uu[q + 6] = 1), (uu[q + 7] = vv));
                i.mesh.geometry.attributes.uv.needsUpdate = !0;
              })(),
                (i.next = (i.next + 1) % i.n),
                (i.used = Math.min(i.used + 1, i.n)),
                i.mesh.geometry.setDrawRange(0, i.used * 6),
                (i.mesh.geometry.attributes.position.needsUpdate = !0));
            }
          }
          if (((i.last[p] = { x: l.x, y: v, z: l.z }), Math.random() < Math.min(1, a * 45))) {
            var x = o.puffs[o.next];
            ((o.next = (o.next + 1) % o.puffs.length),
              (x.life = 1),
              (x.s.material.rotation = Math.random() * 6.28),
              (x.vy = 1.4 + Math.random()),
              x.s.position.set(l.x + (Math.random() - 0.5), v + 0.7, l.z + (Math.random() - 0.5)),
              x.s.scale.setScalar(1.6),
              (x.s.visible = !0));
          }
        }
      }),
        o.puffs.forEach(function (u) {
          if (!(u.life <= 0)) {
            if (((u.life -= a / 1.9), u.life <= 0)) {
              u.s.visible = !1;
              return;
            }
            ((u.s.position.y += u.vy * a),
              u.s.scale.setScalar(2 + (1 - u.life) * 11),
              (u.s.material.opacity = 0.55 * u.life));
          }
        }));
    }
  }
  function Ks() {
    var e = Qs(),
      a = t.drive && t.carList[t.drive.i];
    if (!a) return null;
    if (e.userData.ghost && e.userData.ghostSrc === a) return e.userData.ghost;
    e.userData.ghost && ((e.userData.ghost.userData.tr || []).forEach(function (q) { e.remove(q.mesh); }), e.remove(e.userData.ghost));
    var r = merGhostMat(),
      zp = merGhostZ(),
      n = new fe.Group(),
      i = new fe.Matrix4(),
      o = a.position.clone(),
      s = a.rotation.clone();
    return (
      a.position.set(0, 0, 0),
      a.rotation.set(0, 0, 0),
      a.updateMatrixWorld(!0),
      i.copy(a.matrixWorld).invert(),
      a.traverse(function (l) {
        if (!(!l.isMesh || l.isSprite || !l.visible) && merGhostKeep(l, i)) {
          if (Is() === "high") {
            var zc = new fe.Mesh(l.geometry, zp);
            ((zc.matrixAutoUpdate = !1), zc.matrix.multiplyMatrices(i, l.matrixWorld), (zc.renderOrder = 8), (zc.castShadow = zc.receiveShadow = !1), n.add(zc));
          }
          var c = new fe.Mesh(l.geometry, r);
          ((c.matrixAutoUpdate = !1),
            c.matrix.multiplyMatrices(i, l.matrixWorld),
            (c.renderOrder = 9),
            (c.castShadow = c.receiveShadow = !1),
            n.add(c));
        }
      }),
      a.position.copy(o),
      a.rotation.copy(s),
      a.updateMatrixWorld(!0),
      (n.visible = !1),
      merGhostRig(n),
      e.add(n),
      (e.userData.ghost = n),
      (e.userData.ghostSrc = a),
      n
    );
  }
  /* Time Trial ghost: one-shell cyan hologram with rim glow, proximity fade and taillight ribbons. */
  function merGhostMat() {
    if (t.ghM) return t.ghM;
    t.ghM = new fe.ShaderMaterial({
      uniforms: { uOp: { value: 1 }, uT: { value: 0 } },
      vertexShader: "varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; vY = position.y; gl_Position = projectionMatrix * mv; }",
      fragmentShader: "uniform float uOp; uniform float uT; varying vec3 vN; varying vec3 vV; varying float vY; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); f = pow(f, 2.2); float scan = 0.85 + 0.15 * sin(vY * 9.0 - uT * 6.0); vec3 core = vec3(0.0, 0.533, 1.0); vec3 rim = vec3(0.0, 0.96, 1.0); vec3 c = mix(core * 0.35, rim * 1.2, f) * scan; float a = (0.10 + 0.9 * f) * 0.35 * 2.4 * uOp; gl_FragColor = vec4(c * a, a); }",
      transparent: !0,
      depthWrite: !1,
      depthTest: !0,
      blending: fe.AdditiveBlending,
      fog: !1,
      toneMapped: !1,
    });
    return t.ghM;
  }
  function merGhostZ() {
    return t.ghZ || (t.ghZ = new fe.MeshBasicMaterial({ colorWrite: !1, depthWrite: !0 }));
  }
  function merGhostKeep(l, inv) {
    var mt = l.material;
    if (mt && (mt.blending === fe.AdditiveBlending || (mt.transparent && mt.opacity < 0.95) || mt.isMeshBasicMaterial || mt.isSpriteMaterial)) return !1;
    var nm = ((l.name || "") + " " + ((l.material && l.material.name) || "")).toLowerCase();
    if (/seat|interior|cabin|steer|dash|caliper|brake|engine|under|chassis|exhaust|pedal|mirror_in/.test(nm)) return !1;
    var g = l.geometry;
    if (!g) return !1;
    g.boundingBox || g.computeBoundingBox();
    var sz = new fe.Vector3();
    g.boundingBox.getSize(sz).multiply(new fe.Vector3().setFromMatrixScale(new fe.Matrix4().multiplyMatrices(inv, l.matrixWorld)));
    return Math.max(sz.x, sz.y, sz.z) > 0.35;
  }
  function merGhostRig(n) {
    var bb = new fe.Box3(), tmp = new fe.Box3();
    n.children.forEach(function (c) {
      c.geometry.boundingBox || c.geometry.computeBoundingBox();
      tmp.copy(c.geometry.boundingBox).applyMatrix4(c.matrix);
      bb.union(tmp);
    });
    if (bb.isEmpty()) bb.set(new fe.Vector3(-3, 0, -7), new fe.Vector3(3, 4, 7));
    var fz = (t.drive && t.drive.rig && t.drive.rig.fwdZ) || -1,
      w = bb.max.x - bb.min.x, rz = fz < 0 ? bb.max.z : bb.min.z, y = bb.min.y + (bb.max.y - bb.min.y) * 0.42;
    n.userData.tl = [new fe.Vector3(-w * 0.36, y, rz), new fe.Vector3(w * 0.36, y, rz)];
    n.userData.tr = null;
  }
  function merGhostTrail(n, on) {
    var T = n && n.userData.tr;
    if (!T) return;
    T.forEach(function (r) { r.mesh.visible = !!on; if (!on) r.pts.length = 0; });
  }
  function merGhostTick(n) {
    var M = merGhostMat(), d = t.drive, car = d && t.carList[d.i];
    M.uniforms.uT.value = performance.now() / 1000;
    var op = 1;
    if (car) {
      var dx = car.position.x - n.position.x, dz = car.position.z - n.position.z, dist = Math.sqrt(dx * dx + dz * dz);
      op = Math.max(0, Math.min(1, (dist - 9) / 11));
    }
    n.userData.op = (n.userData.op == null ? op : n.userData.op + (op - n.userData.op) * 0.2);
    M.uniforms.uOp.value = n.userData.op;
    var par = n.parent;
    if (!par || !n.userData.tl) return;
    if (!n.userData.tr) {
      n.userData.tr = [0, 1].map(function () {
        var N = 48, g = new fe.BufferGeometry(), pos = new Float32Array(N * 2 * 3), al = new Float32Array(N * 2), idx = [], k;
        for (k = 0; k < N - 1; k++) idx.push(k * 2, k * 2 + 1, k * 2 + 2, k * 2 + 1, k * 2 + 3, k * 2 + 2);
        g.setAttribute("position", new fe.BufferAttribute(pos, 3));
        g.setAttribute("al", new fe.BufferAttribute(al, 1));
        g.setIndex(idx);
        var m = new fe.Mesh(g, t.ghTrM || (t.ghTrM = new fe.ShaderMaterial({
          uniforms: { uOp: { value: 1 } },
          vertexShader: "attribute float al; varying float vA; void main(){ vA = al; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
          fragmentShader: "uniform float uOp; varying float vA; void main(){ float a = vA * 0.55 * uOp; gl_FragColor = vec4(vec3(0.0, 0.96, 1.0) * a, a); }",
          transparent: !0, depthWrite: !1, blending: fe.AdditiveBlending, side: fe.DoubleSide, fog: !1, toneMapped: !1,
        })));
        m.frustumCulled = !1;
        m.renderOrder = 7;
        m.visible = !1;
        par.add(m);
        return { mesh: m, pts: [], N: N };
      });
    }
    t.ghTrM.uniforms.uOp.value = Math.max(0.25, n.userData.op);
    n.updateMatrixWorld(!0);
    n.userData.tr.forEach(function (r, si) {
      var w = n.localToWorld(n.userData.tl[si].clone()), p = par.worldToLocal(w), P = r.pts, last = P[0];
      if (last && last.distanceTo(p) > 40) P.length = 0;
      if (!last || last.distanceTo(p) > 0.7) { P.unshift(p); P.length > r.N && (P.length = r.N); }
      else P[0] = p;
      var pos = r.mesh.geometry.attributes.position.array, al = r.mesh.geometry.attributes.al.array, k, L = P.length;
      for (k = 0; k < r.N; k++) {
        var a = P[Math.min(k, L - 1)], b = P[Math.min(k + 1, L - 1)] || a, sx = -(b.z - a.z), sz = b.x - a.x, sl = Math.sqrt(sx * sx + sz * sz) || 1, hw = 0.11;
        if (k > 0 && k >= L - 1) { var b2 = P[Math.max(0, L - 2)]; sx = -(a.z - b2.z); sz = a.x - b2.x; sl = Math.sqrt(sx * sx + sz * sz) || 1; }
        sx = (sx / sl) * hw; sz = (sz / sl) * hw;
        pos[k * 6] = a.x + sx; pos[k * 6 + 1] = a.y; pos[k * 6 + 2] = a.z + sz;
        pos[k * 6 + 3] = a.x - sx; pos[k * 6 + 4] = a.y; pos[k * 6 + 5] = a.z - sz;
        var f = k < L ? Math.pow(1 - k / r.N, 1.6) : 0;
        al[k * 2] = al[k * 2 + 1] = f;
      }
      r.mesh.geometry.attributes.position.needsUpdate = !0;
      r.mesh.geometry.attributes.al.needsUpdate = !0;
      r.mesh.visible = L > 1;
    });
  }

  /* Luxury detailing bay: acoustic walls, brick band, night windows, ceiling grid, props, sign, accent LEDs, warm spots. */
  function merCan(w, h, fn, rep, srgb) {
    var c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h);
    var tx = new fe.CanvasTexture(c);
    srgb !== !1 && (tx.colorSpace = fe.SRGBColorSpace);
    rep && ((tx.wrapS = tx.wrapT = fe.RepeatWrapping), tx.repeat.set(rep[0], rep[1]));
    tx.anisotropy = 8;
    return tx;
  }
  function merCorrTex() {
    return t.corrTex || (t.corrTex = merCan(256, 64, function (g, w, h) {
      g.fillStyle = "#363d4a"; g.fillRect(0, 0, w, h);
      for (var x = 0; x < w; x += 16) { var gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, "#272d37"); gr.addColorStop(0.5, "#4a5363"); gr.addColorStop(1, "#272d37"); g.fillStyle = gr; g.fillRect(x, 0, 16, h); }
    }, [12, 1]));
  }
  function merAcousticTex() {
    return t.acTex || (t.acTex = merCan(256, 256, function (g, w, h) {
      g.fillStyle = "#1e2229"; g.fillRect(0, 0, w, h);
      for (var k = 0; k < 3000; k++) { g.fillStyle = "rgba(" + (Math.random() < 0.5 ? "0,0,0" : "120,130,145") + ",0.07)"; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
      for (var x = 0; x < w; x += 32) { g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(x, 0, 3, h); g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(x + 3, 0, 1, h); }
      g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(0, h - 3, w, 3);
    }, [8, 1]));
  }
  function merTileNormal(rx, ry) {
    var c = document.createElement("canvas"), S = 128; c.width = c.height = S;
    var g = c.getContext("2d"), hgt = new Float32Array(S * S), x, y;
    for (y = 0; y < S; y++) for (x = 0; x < S; x++) {
      var ed = Math.min(x, y, S - 1 - x, S - 1 - y), hv = Math.min(1, ed / 7);
      var px = x % 16, py = y % 16, peg = px > 3 && px < 13 && py > 3 && py < 13 ? 0.35 : 0;
      hgt[y * S + x] = hv + (ed > 8 ? peg : 0);
    }
    var im = g.createImageData(S, S);
    for (y = 0; y < S; y++) for (x = 0; x < S; x++) {
      var l = hgt[y * S + ((x - 1 + S) % S)], r = hgt[y * S + ((x + 1) % S)], u = hgt[((y - 1 + S) % S) * S + x], d = hgt[((y + 1) % S) * S + x];
      var nx = (l - r) * 2, ny = (u - d) * 2, nz = 1, L = Math.sqrt(nx * nx + ny * ny + 1), o = (y * S + x) * 4;
      im.data[o] = (nx / L * 0.5 + 0.5) * 255; im.data[o + 1] = (ny / L * 0.5 + 0.5) * 255; im.data[o + 2] = (nz / L * 0.5 + 0.5) * 255; im.data[o + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    var tx = new fe.CanvasTexture(c);
    tx.wrapS = tx.wrapT = fe.RepeatWrapping; tx.repeat.set(rx, ry); tx.colorSpace = fe.NoColorSpace;
    return tx;
  }
  function merGarageLux(e, oe, r, n, i, o) {
    t.luxOn = !0;
    var spots = Wn(), lux = [];
    var clear = function (x, z, rad) {
      return !spots.some(function (s) { return Math.abs(s.x - x) < rad + 6 && Math.abs(s.z - z) < rad + 9; });
    };
    var box = function (w, h, d, m, x, y, z, par) { var b = new e.Mesh(new e.BoxGeometry(w, h, d), m); b.position.set(x, y, z); (par || oe).add(b); return b; };
    var cyl = function (rt, rb, h, m, x, y, z, seg, par) { var b = new e.Mesh(new e.CylinderGeometry(rt, rb, h, seg || 14), m); b.position.set(x, y, z); (par || oe).add(b); return b; };
    var M = {
      dark: new e.MeshStandardMaterial({ color: 0x23262c, roughness: 0.55, metalness: 0.6 }),
      matte: new e.MeshStandardMaterial({ color: 0x14161a, roughness: 0.85, metalness: 0.2 }),
      chrome: new e.MeshStandardMaterial({ color: 0xcfd4db, roughness: 0.22, metalness: 0.95 }),
      red: new e.MeshStandardMaterial({ color: 0xa81e1a, roughness: 0.4, metalness: 0.3 }),
      rubber: new e.MeshStandardMaterial({ color: 0x101113, roughness: 0.9 }),
      rim: new e.MeshStandardMaterial({ color: 0x3b3f46, roughness: 0.3, metalness: 0.85 }),
      led: new e.MeshBasicMaterial({ color: 0xffffff, toneMapped: !1 }),
      cyan: new e.MeshBasicMaterial({ color: 0x00f5ff, toneMapped: !1 }),
      redL: new e.MeshBasicMaterial({ color: 0xff2035, toneMapped: !1 }),
    };
    M.led.color.setRGB(1.8, 1.8, 1.75); M.cyan.color.setRGB(0, 1.9, 2.0); M.redL.color.setRGB(2.0, 0.15, 0.25);
    /* Brick band on the back wall above the cabinets */
    var bH = Math.max(2, o - 8.2), brick = merCan(512, 256, function (g, w, h) {
      g.fillStyle = "#0d0e10"; g.fillRect(0, 0, w, h);
      var bh = 32, bw = 96, row, col;
      for (row = 0; row < h / bh; row++) for (col = -1; col < w / bw + 1; col++) {
        var x = col * bw + (row % 2 ? bw / 2 : 0), v = 30 + Math.random() * 22;
        g.fillStyle = "rgb(" + (v | 0) + "," + ((v + 1) | 0) + "," + ((v + 4) | 0) + ")"; g.fillRect(x + 3, row * bh + 3, bw - 6, bh - 6);
        for (var k = 0; k < 40; k++) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x + 3 + Math.random() * (bw - 8), row * bh + 3 + Math.random() * (bh - 8), 2, 2); }
      }
    }, [r.wid / 8, bH / 4]);
    var bp = new e.Mesh(new e.PlaneGeometry(r.wid, bH), new e.MeshStandardMaterial({ map: brick, roughness: 0.92 }));
    bp.position.set(0, o - bH / 2, -i + 0.03); oe.add(bp);
    /* Ceiling grid, conduits and linear LED strips */
    var cg = new e.Group(); oe.add(cg);
    for (var x = -n + 6; x < n - 1; x += 6) box(0.22, 0.32, r.len, M.matte, x, o - 0.17, 0, cg);
    for (var z = -i + 6; z < i - 1; z += 6) box(r.wid, 0.28, 0.2, M.matte, 0, o - 0.15, z, cg);
    [-n + 2.2, -n + 2.7, n - 2.4].forEach(function (x) { var c = cyl(0.09, 0.09, r.len - 1, M.dark, x, o - 0.55, 0, 8, cg); c.rotation.x = Math.PI / 2; });
    [-n + 2.2, n - 2.4].forEach(function (x) { cyl(0.09, 0.09, o - 0.6, M.dark, x, (o - 0.6) / 2, -i + 0.25, 8, cg); });
    [-n + 3.6, n - 3.6].forEach(function (x) { box(0.22, 0.06, r.len - 5, M.led, x, o - 0.36, 0, cg); box(0.4, 0.08, r.len - 4.6, M.matte, x, o - 0.3, 0, cg); });
    /* Night view behind the side windows */
    var night = merCan(1024, 256, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#04060c"); gr.addColorStop(0.7, "#0e1628"); gr.addColorStop(1, "#141c2c"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var q = 0; q < 70; q++) { g.fillStyle = "rgba(200,215,255," + (0.2 + Math.random() * 0.5).toFixed(2) + ")"; g.fillRect(Math.random() * w, Math.random() * h * 0.45, 1.3, 1.3); }
      [140, 470, 820].forEach(function (lx) {
        var gl = g.createRadialGradient(lx, 150, 0, lx, 150, 70); gl.addColorStop(0, "rgba(255,190,110,0.9)"); gl.addColorStop(0.15, "rgba(255,160,80,0.35)"); gl.addColorStop(1, "rgba(255,150,70,0)");
        g.fillStyle = gl; g.fillRect(lx - 70, 80, 140, 140); g.fillStyle = "#05070b"; g.fillRect(lx - 2, 150, 4, 110); g.fillRect(lx - 14, 148, 16, 4);
      });
      g.fillStyle = "#020305";
      for (var p = 0; p < 34; p++) {
        var px = p * 31 + Math.random() * 20, ph = 70 + Math.random() * 110, base = h - Math.random() * 8;
        g.beginPath(); g.moveTo(px, base - ph);
        for (var tier = 1; tier <= 5; tier++) { var ty = base - ph + (ph * tier) / 5, tw = 6 + tier * 6; g.lineTo(px + tw, ty); g.lineTo(px + tw * 0.4, ty); }
        g.lineTo(px + 2, base); g.lineTo(px - 2, base);
        for (tier = 5; tier >= 1; tier--) { ty = base - ph + (ph * tier) / 5; tw = 6 + tier * 6; g.lineTo(px - tw * 0.4, ty); g.lineTo(px - tw, ty); }
        g.closePath(); g.fill();
      }
      g.fillRect(0, h - 10, w, 10);
    });
    [-1, 1].forEach(function (sd) {
      var bd = new e.Mesh(new e.PlaneGeometry(r.len + 8, o + 4), new e.MeshBasicMaterial({ map: night, fog: !1 }));
      bd.position.set(sd * (n + 4), o / 2, 0); bd.rotation.y = sd > 0 ? -Math.PI / 2 : Math.PI / 2; oe.add(bd);
    });
    /* Props */
    var cart = function (x, z, ry) {
      var g = new e.Group(); g.position.set(x, 0, z); g.rotation.y = ry; oe.add(g);
      [0.75, 1.7, 2.65].forEach(function (y) { box(2.4, 0.08, 1.4, M.dark, 0, y, 0, g); });
      [[-1.15, -0.65], [1.15, -0.65], [-1.15, 0.65], [1.15, 0.65]].forEach(function (p) { box(0.08, 2.4, 0.08, M.chrome, p[0], 1.65, p[1], g); cyl(0.13, 0.13, 0.12, M.rubber, p[0], 0.3, p[1], 10, g).rotation.x = Math.PI / 2; });
      var cols = [0xd8262e, 0x1f8fff, 0xf2c31b, 0x2fd17a, 0xe8e8e8, 0x9a4dff];
      for (var b = 0; b < 6; b++) {
        var bm = new e.MeshStandardMaterial({ color: cols[b], roughness: 0.25, metalness: 0.05, transparent: !0, opacity: 0.88 });
        cyl(0.13, 0.15, 0.62, bm, -0.9 + b * 0.36, 3.0, -0.2 + (b % 2) * 0.3, 10, g); cyl(0.05, 0.05, 0.14, M.matte, -0.9 + b * 0.36, 3.38, -0.2 + (b % 2) * 0.3, 8, g);
      }
      var bf = cyl(0.42, 0.42, 0.18, M.matte, 0.3, 1.92, 0, 18, g); cyl(0.4, 0.4, 0.06, new e.MeshStandardMaterial({ color: 0xff6a1a, roughness: 0.9 }), 0.3, 1.81, 0, 18, g);
      box(0.9, 0.22, 0.28, M.dark, -0.45, 2.04, 0, g);
    };
    var tire = function (x, y, z, ax, par) { var tr = new e.Mesh(new e.TorusGeometry(1.0, 0.36, 10, 22), M.rubber); tr.position.set(x, y, z); ax === "y" ? (tr.rotation.x = Math.PI / 2) : (tr.rotation.y = Math.PI / 2); (par || oe).add(tr); var rm = cyl(0.78, 0.78, 0.5, M.rim, x, y, z, 16, par); ax === "y" || (rm.rotation.z = Math.PI / 2); return tr; };
    var wheelStack = function (x, z) { if (!clear(x, z, 1.5)) return; for (var s = 0; s < 4; s++) tire(x, 0.36 + s * 0.74, z, "y"); };
    var lift = function (cx, z) {
      if (!clear(cx, z, 7)) return;
      [-5.6, 5.6].forEach(function (dx) {
        box(1.0, 11, 1.0, M.red, cx + dx, 5.5, z); box(1.8, 0.15, 1.8, M.dark, cx + dx, 0.08, z);
        box(0.24, 0.24, 3.6, M.dark, cx + dx * 0.82, 0.55, z - 1.5).rotation.y = dx > 0 ? 0.5 : -0.5;
        box(0.24, 0.24, 3.6, M.dark, cx + dx * 0.82, 0.55, z + 1.5).rotation.y = dx > 0 ? -0.5 : 0.5;
      });
      box(12.2, 0.5, 0.6, M.red, cx, 11.2, z);
      box(0.06, 9.5, 0.06, M.cyan, cx - 5.05, 5.5, z + 0.2); box(0.06, 9.5, 0.06, M.cyan, cx + 5.05, 5.5, z + 0.2);
    };
    var rack = function (x, z0, sd) {
      if (!clear(x, z0 + 3, 4)) return;
      var g = new e.Group(); g.position.set(x, 0, z0); oe.add(g);
      [0, 6.2].forEach(function (dz) { box(0.15, 6.2, 0.15, M.dark, 0, 3.1, dz, g); box(1.6, 0.15, 0.15, M.dark, sd * 0.7, 6.2, dz, g); });
      [1.3, 4.2].forEach(function (y) { box(0.12, 0.12, 6.2, M.chrome, sd * 0.25, y - 1.1, 3.1, g); box(0.12, 0.12, 6.2, M.chrome, sd * 1.15, y - 1.1, 3.1, g); for (var q = 0; q < 4; q++) tire(sd * 0.7, y, 0.75 + q * 1.55, "z", g).rotation.y = 0; });
    };
    var toolbox = function (x, z) {
      if (!clear(x, z, 2)) return;
      box(3.4, 3.0, 1.8, M.red, x, 1.75, z); box(3.4, 1.2, 1.8, M.red, x, 4.0, z);
      var seam = new e.MeshStandardMaterial({ color: 0x060708, roughness: 0.8, metalness: 0.1 }), zf = z - 0.93, q;
      for (q = 0; q < 6; q++) box(3.3, 0.04, 0.05, seam, x, 0.75 + q * 0.5, zf);
      for (q = 0; q < 2; q++) box(3.3, 0.04, 0.05, seam, x, 3.7 + q * 0.4, zf);
      box(0.04, 3.0, 0.05, seam, x - 1.69, 1.75, zf); box(0.04, 3.0, 0.05, seam, x + 1.69, 1.75, zf);
      [0.5, 1, 1.5, 2, 2.5, 3.0, 3.55, 3.9, 4.35].forEach(function (hy) {
        box(1.5, 0.07, 0.1, M.chrome, x, hy, zf - 0.05);
        box(0.08, 0.1, 0.1, M.chrome, x - 0.7, hy, zf - 0.02); box(0.08, 0.1, 0.1, M.chrome, x + 0.7, hy, zf - 0.02);
      });
      [[-1.5, -0.7], [1.5, -0.7], [-1.5, 0.7], [1.5, 0.7]].forEach(function (p) { cyl(0.13, 0.13, 0.25, M.rubber, x + p[0], 0.13, z + p[1], 8); });
      box(1.2, 0.5, 0.8, M.matte, x - 0.8, 4.85, z); box(1.0, 0.4, 0.7, M.dark, x + 0.8, 4.8, z);
    };
    try {
      cart(-n + 1.6, 2, Math.PI / 2); cart(n - 1.6, -1, -Math.PI / 2);
      wheelStack(n - 1.6, -i + 3.6); wheelStack(n - 1.6, -i + 6.3);
      lift(n - 9, i - 10);
      rack(-n + 1.2, -i + 4, 1);
    } catch (er) { console.warn("lux props", er); }
    /* Warm spotlights and soft beams on the hero car */
    var sp = spots[0] || { x: 0, z: 0 }, beamTex = merCan(4, 128, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(225,235,255,0.9)"); gr.addColorStop(1, "rgba(225,235,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    var beamM = new e.MeshBasicMaterial({ map: beamTex, transparent: !0, opacity: 0.11, blending: e.AdditiveBlending, depthWrite: !1, side: e.DoubleSide, toneMapped: !1 });
    t.luxSpots = [];
    [[-7, -5], [7, 4]].forEach(function (of) {
      var p = new e.Vector3(sp.x + of[0], o - 0.6, sp.z + of[1]), tg = new e.Vector3(sp.x, 0, sp.z);
      box(0.6, 0.5, 0.6, M.matte, p.x, p.y + 0.2, p.z);
      if (Is() === "high") {
        var sl = new e.SpotLight(0xffeedd, 0, 46, 0.42, 0.65, 1.3);
        sl.position.copy(p); sl.target.position.copy(tg); oe.add(sl); oe.add(sl.target); t.luxSpots.push(sl);
      }
    });
    t.luxHemi = new e.HemisphereLight(0xe4ebff, 0x3a3f48, 0);
    oe.add(t.luxHemi);
    t.luxBox = { n: n, i: i };

    var wash = merCan(128, 128, function (g, w, h) { var gr = g.createRadialGradient(w / 2, 0, 0, w / 2, 0, h); gr.addColorStop(0, "rgba(225,235,255,0.9)"); gr.addColorStop(0.5, "rgba(225,235,255,0.25)"); gr.addColorStop(1, "rgba(225,235,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    var poolM = new e.MeshBasicMaterial({ map: merCan(64, 64, function (g) { var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(225,235,255,0.7)"); gr.addColorStop(1, "rgba(225,235,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), transparent: !0, depthWrite: !1, blending: e.AdditiveBlending, toneMapped: !1, opacity: 0.5, polygonOffset: !0, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    var wm = new e.MeshBasicMaterial({ map: wash, transparent: !0, depthWrite: !1, blending: e.AdditiveBlending, toneMapped: !1, opacity: 0.32 });
    var trim = new e.MeshStandardMaterial({ color: 0x525c6e, roughness: 0.4, metalness: 0.6, emissive: 0x525c6e, emissiveIntensity: 0.25 });
    box(r.wid + 1.6, 0.45, 0.45, trim, 0, o + 0.05, i + 0.55); box(r.wid + 1.6, 0.45, 0.45, trim, 0, o + 0.05, -i - 0.55);
    box(0.45, 0.45, r.len + 1.6, trim, -n - 0.55, o + 0.05, 0); box(0.45, 0.45, r.len + 1.6, trim, n + 0.55, o + 0.05, 0);
    var doorsX = (t.doors || []).map(function (d) { return [d.c - d.w / 2 - 1.2, d.c + d.w / 2 + 1.2]; });
    for (var dx = -n + 2; dx <= n - 1.5; dx += 4.5) {
      if (doorsX.some(function (d) { return dx > d[0] && dx < d[1]; })) continue;
      box(0.9, 0.25, 0.5, M.dark, dx, o - 0.7, i + 0.78);
      box(0.6, 0.04, 0.3, M.led, dx, o - 0.84, i + 0.78);
      var wp = new e.Mesh(new e.PlaneGeometry(4.2, o - 1), wm); wp.position.set(dx, (o - 1) / 2, i + 0.54); oe.add(wp);
      var pool = new e.Mesh(new e.CircleGeometry(3.4, 24), poolM); pool.rotation.x = -Math.PI / 2; pool.position.set(dx, 0.05, i + 3.2); pool.renderOrder = 2; oe.add(pool);
    }
    merLuxSpots(!!(typeof MER !== "undefined" && MER && MER.showroom));
  }
  /* Phones: if the frame rate stays low anywhere in the game, step quality down until it holds */
  function merAutoQ() {
    if (Is() !== "lite" || !t || !t.renderer) return;
    var nowQ = performance.now(), Q = MER.q || (MER.q = { last: nowQ, ema: 16, t: 0, step: 0 });
    var dq = nowQ - Q.last; Q.last = nowQ;
    if (dq > 250) return;
    Q.ema += (dq - Q.ema) * 0.04; Q.t += dq;
    if (Q.t > 2500 && Q.ema > 21 && Q.step < 3) {
      Q.step++; Q.t = 0; Q.ema = 16;
      if (Q.step === 1) MER.noWet = !0;
      else try {
        t.renderer.setPixelRatio(Q.step === 2 ? 1.2 : 1);
        var sz = t.renderer.getSize(new fe.Vector2()); t.renderer.setSize(sz.x, sz.y, !1);
      } catch (er) {}
    }
  }
  function merLuxTick() {
    merAutoQ();
    if (!t.luxHemi || !t.camera || !t.luxBox) return;
    var c = t.camera.position, B = t.luxBox, inside = Math.abs(c.x) < B.n + 3 && Math.abs(c.z) < B.i + 3 && c.y < 30;
    t.luxHemi.intensity = inside ? 0.6 : 0;
    if (t.extFill) { var near = !inside && Math.abs(c.x) < B.n + 90 && Math.abs(c.z) < B.i + 90; t.extFill.intensity = near ? 420 : 0; }
  }
  function merPrewarm() {
    if (MER.warmed || !t || !t.renderer || !t.scene || !t.camera || t.drive) return;
    MER.warmed = !0;
    var r = t.renderer, sc = t.scene, f0 = sc.fog, tm = r.toneMapping, hi = Is() === "high", hid = [], sw = [], lv = [];
    try {
      sc.fog = new fe.FogExp2(qe.fogColor, qe.fogDensity);
      r.toneMapping = fe.ACESFilmicToneMapping;
      hi && (t.cineSw || []).forEach(function (q) { sw.push([q, q.mesh.material]); q.mesh.material = q.pbr; });
      hi && (t.slights || []).forEach(function (L) { lv.push([L, L.visible]); L.visible = !0; });
      hi && (t.pl || []).forEach(function (L) { lv.push([L, L.visible]); L.visible = !1; });
      sc.traverse(function (o) { !o.visible && !o.isLight && (hid.push(o), (o.visible = !0)); });
      r.compileAsync ? r.compileAsync(sc, t.camera).catch(function () {}) : r.compile(sc, t.camera);
    } catch (er) {}
    hid.forEach(function (o) { o.visible = !1; });
    sw.forEach(function (a) { a[0].mesh.material = a[1]; });
    lv.forEach(function (a) { a[0].visible = a[1]; });
    sc.fog = f0; r.toneMapping = tm;
  }
  function merLuxSpots(on) {
    (t.luxSpots || []).forEach(function (s) { s.intensity = on ? 150 : 0; });
    if (!t.scene) return;
    if (on) { t.luxFog || (t.luxFog = new fe.FogExp2(0x0b1324, 0.015)); t.scene.fog || (t.scene.fog = t.luxFog); }
    else if (t.scene.fog === t.luxFog) t.scene.fog = null;
  }
  function Jo(e) {
    if (t.engNoiseBuf) return t.engNoiseBuf;
    var a = e.createBuffer(1, Math.round(e.sampleRate * 0.6), e.sampleRate),
      r = a.getChannelData(0),
      n;
    for (n = 0; n < r.length; n++) r[n] = Math.random() * 2 - 1;
    return ((t.engNoiseBuf = a), a);
  }
  function On(e, a, r, n) {
    var i = e.createBufferSource(),
      o = e.createBiquadFilter(),
      s = e.createGain(),
      l = e.currentTime;
    ((i.buffer = Jo(e)),
      r === "bov"
        ? ((o.type = "bandpass"),
          (o.Q.value = 0.8),
          o.frequency.setValueAtTime(1900, l),
          o.frequency.exponentialRampToValueAtTime(600, l + 0.5),
          s.gain.setValueAtTime(1e-4, l),
          s.gain.exponentialRampToValueAtTime(0.1 * n + 0.015, l + 0.03),
          s.gain.exponentialRampToValueAtTime(1e-4, l + 0.55))
        : r === "shift"
          ? ((o.type = "lowpass"),
            (o.frequency.value = 900),
            s.gain.setValueAtTime(1e-4, l),
            s.gain.exponentialRampToValueAtTime(0.32, l + 0.008),
            s.gain.exponentialRampToValueAtTime(1e-4, l + 0.09))
          : r === "bang"
            ? ((o.type = "lowpass"),
              (o.frequency.value = 380),
              s.gain.setValueAtTime(1e-4, l),
              s.gain.exponentialRampToValueAtTime(0.55, l + 0.004),
              s.gain.exponentialRampToValueAtTime(1e-4, l + 0.12))
            : ((o.type = "bandpass"),
              (o.Q.value = 0.9),
              (o.frequency.value = 450 + Math.random() * 700),
              s.gain.setValueAtTime(1e-4, l),
              s.gain.exponentialRampToValueAtTime(0.22 + Math.random() * 0.16, l + 0.004),
              s.gain.exponentialRampToValueAtTime(1e-4, l + 0.04 + Math.random() * 0.05)),
      i.connect(o),
      o.connect(s),
      s.connect(a.m),
      i.start(l, Math.random() * 0.3),
      i.stop(l + 0.7));
  }
  function $o(e, a) {
    var r = t.eng;
    if (!a || t.engMute || !e) {
      if (r && t.ac)
        try {
          r.m.gain.setTargetAtTime(0, t.ac.currentTime, 0.05);
        } catch {}
      return;
    }
    if (!(t.engOff || t.ac === !1))
      try {
        if (!t.ac) {
          var n = window.AudioContext || window.webkitAudioContext;
          if (!n) {
            t.engOff = !0;
            return;
          }
          t.ac = new n();
        }
        var i = t.ac;
        if (i.state === "suspended") {
          var o = i.resume();
          o && o.catch && o.catch(function () {});
        }
        if (!r) {
          var s = i.createGain();
          ((s.gain.value = 0), s.connect(i.destination));
          var l = i.createOscillator(),
            c = i.createOscillator(),
            f = i.createOscillator(),
            u = i.createGain(),
            p = i.createGain(),
            v = i.createWaveShaper(),
            w = new Float32Array(256),
            y;
          for (y = 0; y < 256; y++) {
            var E = y / 128 - 1;
            w[y] = Math.tanh(E * 2.2);
          }
          v.curve = w;
          var M = i.createBiquadFilter(),
            g = i.createGain();
          ((l.type = "sawtooth"),
            (c.type = "sawtooth"),
            (f.type = "square"),
            (u.gain.value = 0.38),
            (p.gain.value = 0.3),
            (M.type = "lowpass"),
            (M.Q.value = 2.5),
            (g.gain.value = 0.5));
          var b = i.createGain(),
            k = i.createOscillator(),
            L = i.createGain();
          ((b.gain.value = 0.72),
            (k.type = "sine"),
            (L.gain.value = 0.28),
            k.connect(L),
            L.connect(b.gain),
            k.start(),
            l.connect(v),
            c.connect(u),
            u.connect(v),
            f.connect(p),
            p.connect(v),
            v.connect(M),
            M.connect(b),
            b.connect(g),
            g.connect(s));
          var x = i.createBufferSource(),
            P = i.createGain(),
            h = i.createBiquadFilter(),
            B = i.createBiquadFilter();
          ((x.buffer = Jo(i)),
            (x.loop = !0),
            (h.type = "bandpass"),
            (h.Q.value = 0.7),
            (B.type = "lowpass"),
            (B.frequency.value = 1400),
            (B.Q.value = 0.5),
            (P.gain.value = 0),
            x.connect(h),
            h.connect(B),
            B.connect(P),
            P.connect(s),
            [l, c, f, x].forEach(function (N) {
              N.start();
            }),
            (r = t.eng =
              {
                lfo: k,
                m: s,
                o1: l,
                o2: c,
                o3: f,
                f: M,
                eg: g,
                tw: x,
                tl: B,
                tf: h,
                tg: P,
                boost: 0,
                gear: 1,
                popT: 0,
              }));
        }
        var G = i.currentTime,
          z = es(e),
          Q = z.rpm,
          J = Math.max(0, e.thrIn || 0) + (e.boosting ? 0.4 : 0),
          q = Math.min(0.1, Math.max(0.001, G - (r.last || G)));
        ((r.last = G), r.m.gain.setTargetAtTime(1, G, 0.05));
        var O = Q / 60;
        (r.o1.frequency.setTargetAtTime(O * 2.5, G, 0.03),
          r.o2.frequency.setTargetAtTime(O * 1.5, G, 0.03),
          r.o3.frequency.setTargetAtTime(O * 0.5, G, 0.03),
          r.lfo.frequency.setTargetAtTime(O * 0.5, G, 0.03),
          r.f.frequency.setTargetAtTime(300 + Q * (J > 0.1 ? 0.42 : 0.17), G, 0.04),
          r.eg.gain.setTargetAtTime(J > 0.1 ? 0.16 : 0.08, G, 0.06));
        var F = r.boost;
        if (
          (J > 0.1 && Q > 2400
            ? (r.boost = Math.min(1, r.boost + q * (0.9 + Q / 6e3)))
            : (r.boost = Math.max(0, r.boost - q * 3.2)),
          F > 0.45 && r.boost < F && J <= 0.1 && !r.bovLock && (On(i, r, "bov", F), (r.bovLock = !0)),
          J > 0.1 && (r.bovLock = !1),
          r.tf.frequency.setTargetAtTime(450 + r.boost * 1100, G, 0.08),
          r.tl.frequency.setTargetAtTime(900 + r.boost * 1300, G, 0.08),
          r.tg.gain.setTargetAtTime(0.09 * Math.pow(r.boost, 1.6), G, 0.08),
          z.gear > r.gear &&
            J > 0.1 &&
            (On(i, r, "shift", 1),
            On(i, r, "bov", 0.8 + z.gear * 0.38),
            r.eg.gain.setValueAtTime(0.03, G),
            r.eg.gain.setTargetAtTime(0.16, G + 0.06, 0.03)),
          (r.gear = z.gear),
          (r.liftT = J > 0.1 ? 0 : (r.liftT || 0) + q),
          J <= 0.1 && r.liftT < 2.4 && Q > 2800 && Math.abs(e.v) > 18)
        ) {
          if (((r.popT -= q), r.popT <= 0)) {
            var I = Math.random() < 0.28;
            (On(i, r, "pop", 1),
              Math.random() < 0.5 && On(i, r, "pop", 1),
              I && (On(i, r, "bang", 1), (e.flameReq = Math.max(e.flameReq || 0, 0.55))),
              (r.popT = (r.liftT < 0.8 ? 0.03 : 0.07) + Math.random() * 0.18));
          }
        } else r.popT = 0.12;
        e.gear = z.gear;
      } catch {
        t.engOff = !0;
      }
  }
  function To() {
    if (!(!t || !t.host)) {
      var e = t.host.querySelector(".lc-drivebar span"),
        a = t.raceOn
          ? [
              ["W", "Gas"],
              ["S", "Brake"],
              ["A D", "Steer"],
              ["Shift", "Boost"],
              ["C", "Camera"],
              ["R", "Reset lap"],
              ["M", "Engine sound"],
              ["N", "Music"],
            ]
          : [
              ["W", "Gas"],
              ["S", "Brake, reverse"],
              ["A D", "Steer"],
              ["Shift", "Boost"],
              ["C", "Camera"],
              ["R", "Reset car"],
              ["T", "Time trial"],
              ["M", "Sound"],
            ];
      e &&
        (e.innerHTML = a
          .map(function (n) {
            return "<b>" + n[0] + "</b><em>" + n[1] + "</em>";
          })
          .join(""));
      var r = t.host.querySelector('.lc-drivebar [data-rb="stop"]');
      r && (r.textContent = t.raceOn ? "Exit race" : "Stop driving");
      var rs = t.host.querySelector('.lc-drivebar [data-rb="reset"]');
      rs && (rs.textContent = t.raceOn ? "Reset lap" : "Reset car");
    }
  }
  function Dn() {
    var e = t && t.drive,
      a = t && t.track;
    if (!(!e || !a || !t.raceOn)) {
      var r = ee[e.i],
        n = e.rig.fwdZ,
        i = Math.atan2(n * a.T[0], n * a.T[1]);
      ((r.x = a.S[0] - a.T[0] * 22),
        (r.z = a.S[1] - a.T[1] * 22),
        (r.r = (-i * 180) / Math.PI),
        (e.v = 0),
        (e.pv = 0),
        (e.steer = 0),
        (e.yaw = 0),
        (e.phi = i),
        (e.nitro = 1),
        (e.slip = 0),
        (e.cang = Math.atan2(n * Math.sin(i), n * Math.cos(i))),
        (e.cam.yaw = 0));
      var o = co();
      ((o.state = "count"),
        (o.passed = !1),
        (o.c0 = performance.now() + 700),
        (o.cq = 0),
        (o.cdS = 0),
        (o.jump = !1),
        (o.al0 = -22),
        (o.flash = null),
        (o.dUntil = 0),
        (o.drift = { pend: 0, mult: 1, t: 0, gap: 0, lap: 0, ftxt: "", fUntil: 0 }));
      var s = Ks();
      (s && (s.visible = !1), merBoard("READY..."), zr(e.i), It(), ye());
    }
  }
  function m0(e) {
    var a = ee[e.i],
      r = t.track,
      n = ie;
    if (!a || !r || !n) return null;
    var i = e.rig.fwdZ,
      o = n.len / 2,
      s = n.wid / 2,
      l = (-a.r * Math.PI) / 180,
      c = i * Math.cos(l);
    if (Math.abs(a.x) > s || Math.abs(a.z) > o) return null;
    var f = c > 0.3 ? 1 : c < -0.3 ? -1 : 0;
    if (!f) return null;
    var u = [],
      p = a.x,
      v = a.z,
      w = l,
      y,
      E = o + wt + 3,
      M = Math.max(0, (E - v) / Math.abs(c)),
      g = Math.max(1, Math.ceil(M / 0.5));
    for (u.push([p, v, w]), y = 1; y <= g; y++)
      ((p += (f * i * Math.sin(w) * M) / g), (v += (f * i * Math.cos(w) * M) / g), u.push([p, v, w]));
    var b = Math.atan2(i * r.T[0], i * r.T[1]),
      k = Math.atan2(Math.sin(b - w), Math.cos(b - w)),
      L = 15 * Math.abs(k),
      x = Math.max(1, Math.ceil(L / 0.5));
    for (y = 1; y <= x; y++) {
      var P = w + k / x / 2;
      ((p += (f * i * Math.sin(P) * L) / x),
        (v += (f * i * Math.cos(P) * L) / x),
        (w += k / x),
        u.push([p, v, w]));
    }
    var h = [r.S[0] - r.T[0] * 22, r.S[1] - r.T[1] * 22],
      B = (h[0] - p) * r.T[0] + (h[1] - v) * r.T[1];
    if (B < 12) return null;
    var G = Math.sqrt((h[0] - p) * (h[0] - p) + (h[1] - v) * (h[1] - v)),
      z = [p + r.T[0] * G * 0.4, v + r.T[1] * G * 0.4],
      Q = [h[0] - r.T[0] * G * 0.4, h[1] - r.T[1] * G * 0.4],
      J = [],
      q = [p, v];
    for (y = 0; y <= 160; y++) {
      var O = y / 160,
        F = 1 - O,
        I = F * F * F * q[0] + 3 * F * F * O * z[0] + 3 * F * O * O * Q[0] + O * O * O * h[0],
        N = F * F * F * q[1] + 3 * F * F * O * z[1] + 3 * F * O * O * Q[1] + O * O * O * h[1],
        K = 3 * F * F * (z[0] - q[0]) + 6 * F * O * (Q[0] - z[0]) + 3 * O * O * (h[0] - Q[0]),
        ne = 3 * F * F * (z[1] - q[1]) + 6 * F * O * (Q[1] - z[1]) + 3 * O * O * (h[1] - Q[1]);
      J.push([I, N, Math.atan2(i * K, i * ne)]);
    }
    var T = function (me) {
        var Ge = [0],
          xe;
        for (xe = 1; xe < me.length; xe++)
          Ge.push(
            Ge[xe - 1] +
              Math.sqrt(Math.pow(me[xe][0] - me[xe - 1][0], 2) + Math.pow(me[xe][1] - me[xe - 1][1], 2)),
          );
        return Ge;
      },
      ae = T(u),
      ue = T(J);
    return {
      A: { pts: u, cum: ae, len: ae[ae.length - 1], dir: f },
      B: { pts: J, cum: ue, len: ue[ue.length - 1], dir: 1 },
      start: [a.x, a.z],
      end: h,
      pT: b,
    };
  }
  function Js(e, a) {
    var r = e.cum,
      n = r.length,
      i = 0,
      o = 0,
      s = n - 1;
    for (a = Math.max(0, Math.min(e.len, a)); s - o > 1;) ((i = (o + s) >> 1), r[i] <= a ? (o = i) : (s = i));
    var l = e.pts[o],
      c = e.pts[s],
      f = (a - r[o]) / Math.max(1e-6, r[s] - r[o]),
      u = Math.atan2(Math.sin(c[2] - l[2]), Math.cos(c[2] - l[2]));
    return [l[0] + (c[0] - l[0]) * f, l[1] + (c[1] - l[1]) * f, l[2] + u * f];
  }
  function Fn(e) {
    var a = t.host,
      r = t.cine;
    if (
      (r ||
        ((r = document.createElement("div")),
        (r.className = "lc-cine"),
        (r.innerHTML =
          '<i class="lc-cine-t"></i><i class="lc-cine-b"></i><div class="lc-cine-tt"><small>TIME TRIAL</small>MIDNIGHT EXTREME RACER<em></em></div><div class="lc-cine-hint">Press Enter or Space to skip</div><button type="button" class="lc-cine-sk">Skip intro</button>'),
        r.addEventListener("pointerdown", function (i) {
          i.stopPropagation();
        }),
        r.addEventListener("click", function (i) {
          (i.stopPropagation(),
            i.target.closest && i.target.closest(".lc-cine-sk")
              ? t.drive && t.drive.intro && M0(!0)
              : t.egg && t.egg.busy && t.egg.startFn && t.egg.startFn());
        }),
        a.appendChild(r),
        (t.cine = r)),
      e)
    ) {
      var n = co();
      ((r.querySelector("em").textContent = n.best
        ? "HIGH SCORE  " + Pn(n.best)
        : "SET THE FIRST HIGH SCORE"),
        (r.style.display = "block"),
        r.offsetWidth,
        r.classList.add("lc-on"));
    } else
      (r.classList.remove("lc-on"),
        setTimeout(function () {
          r.classList.contains("lc-on") || (r.style.display = "none");
        }, 650));
    a.classList.toggle("lc-intro", !!e);
  }
  function g0() {
    var e = t.drive;
    if (!e) return !1;
    var a = m0(e);
    if (!a) return !1;
    var r = ie.len / 2,
      n = a.start[0],
      i = -(a.A.dir * t.track.T[0] >= 0 ? 1 : -1);
    return (
      (e.intro = { plan: a, phase: "wait", t: 0, s: 0, v: 0, cam0: [n + i * 8, 1.1, r + 19], look: null }),
      ra || ln(!0),
      (co().state = "intro"),
      we(""),
      Fn(!0),
      (t.camera.fov = 42),
      t.camera.updateProjectionMatrix(),
      !0
    );
  }
  function M0(e) {
    var a = t.drive;
    !a ||
      !a.intro ||
      ((a.intro = null),
      Fn(!1),
      e ? (a.camFrom = null) : (a.camFrom = { p: t.camera.position.clone(), q: t.camera.quaternion.clone() }),
      (a.blendT = 0),
      (a.fov = t.camera.fov),
      rl(0.15),
      Dn(),
      we(""));
  }
  function x0(e) {
    var a = t.drive,
      r = a.intro,
      n = ee[a.i],
      i = t.carList[a.i],
      o = a.rig,
      s = o.fwdZ,
      l = a.v,
      c = null;
    if (
      ((r.t += e),
      r.phase === "wait"
        ? ((a.v = 0), (a.thrIn = 0), r.t > 1.5 && ((r.phase = "A"), (r.s = 0), (r.v = 0)))
        : r.phase === "pause" &&
          ((a.v = 0),
          (a.thrIn = r.t > r.pauseEnd - 0.35 ? 0.7 : 0),
          r.t > r.pauseEnd && ((r.phase = "B"), (r.s = 0), (r.v = 0))),
      r.phase === "A" ? (c = r.plan.A) : r.phase === "B" && (c = r.plan.B),
      c)
    ) {
      var f = r.phase === "A" ? 11 : 32,
        u = r.phase === "A" ? 6 : 13,
        p = c.len - r.s;
      ((r.v = Math.max(0.6, Math.min(f, r.v + u * e, Math.sqrt(2 * u * 0.8 * Math.max(0, p))))),
        (r.s = Math.min(c.len, r.s + r.v * e)));
      var v = Js(c, r.s),
        w = Js(c, r.s + 0.6),
        y = Math.atan2(Math.sin(w[2] - v[2]), Math.cos(w[2] - v[2])) / 0.6;
      ((n.x = v[0]),
        (n.z = v[1]),
        (n.r = (-v[2] * 180) / Math.PI),
        (a.v = c.dir * r.v),
        (a.thrIn = r.v < f - 0.5 && p > 6 ? 1 : 0.15));
      var E = Math.max(-0.62, Math.min(0.62, Math.atan(wt * 0.85 * y * c.dir)));
      if (((a.steer += (E - a.steer) * Math.min(1, 6 * e)), c.len - r.s < 0.03))
        if (r.phase === "A") ((r.phase = "pause"), (r.pauseEnd = r.t + 0.9), (a.v = 0));
        else {
          M0(!1);
          return;
        }
    } else a.steer += (0 - a.steer) * Math.min(1, 4 * e);
    ((a.phi = (-n.r * Math.PI) / 180),
      (a.slip = 0),
      zr(a.i),
      Ys(a, n, i, o, e, (a.v - l) / Math.max(e, 0.001)),
      (a.pv = a.v),
      o.wheels.forEach(function (g) {
        ((g.spin.rotation.x += (a.v * s * e) / g.R), g.front && (g.steer.rotation.y = a.steer));
      }));
    var M = (-n.r * Math.PI) / 180;
    ((a.cang = Math.atan2(s * Math.sin(M), s * Math.cos(M))), w0(e));
  }
  function w0(e) {
    var a = t.drive,
      r = a.intro,
      n = ee[a.i],
      i = fe,
      o = t.camera,
      s = (-n.r * Math.PI) / 180,
      l = a.rig.fwdZ,
      c = l * Math.sin(s),
      f = l * Math.cos(s),
      u = f,
      p = -c;
    p < 0 && ((u = -u), (p = -p));
    var v,
      w = new i.Vector3(n.x, 2.1, n.z),
      y = r.plan.A,
      E = r.plan.B,
      M = 1 - Math.exp(-3.2 * e);
    (r.phase === "wait" || (r.phase === "A" && r.s < y.len * 0.5)
      ? ((v = new i.Vector3(
          r.cam0[0] - r.t * 0.35 * Math.sign(r.cam0[0] - r.plan.start[0]),
          r.cam0[1],
          r.cam0[2],
        )),
        (w.y = 2.4))
      : r.phase === "A" || r.phase === "pause"
        ? (r.orb === void 0 && (r.orb = Math.atan2(o.position.x - n.x, o.position.z - n.z)),
          (r.orb += e * 0.55),
          (v = new i.Vector3(n.x + Math.sin(r.orb) * 12, 2.4, n.z + Math.cos(r.orb) * 12)))
        : r.s < E.len * 0.72
          ? ((v = new i.Vector3(n.x + u * 14 - c * 4, 2.3, n.z + p * 14 - f * 4)),
            w.set(n.x + c * 4, 2, n.z + f * 4),
            (M = 1 - Math.exp(-5 * e)))
          : ((v = new i.Vector3(n.x - c * 19, 6.1, n.z - f * 19)),
            w.set(n.x + c * 5, 2.7, n.z + f * 5),
            (M = 1 - Math.exp(-2.4 * e))),
      r.look ? (o.position.lerp(v, M), r.look.lerp(w, M)) : (o.position.copy(v), (r.look = w.clone())),
      o.lookAt(r.look));
  }
  function merBoard(txt) {
    var b = t && t.mFx && t.mFx.board;
    if (!b) return !1;
    if (!txt) { b.state = null; b.grp.visible = !1; return !0; }
    if (b.state !== txt) { b.state = txt; b.t0 = performance.now(); b.draw(txt); }
    b.grp.visible = !0;
    b.setOp(1);
    return !0;
  }
  function $s(e, a) {
    if (t && t.mFx && t.mFx.board) { merBoard(e === "GO" ? "GO!" : e === "1" ? "SET..." : "READY..."); return; }
    var r = t.host,
      n = t.bigNum;
    (n ||
      ((n = document.createElement("div")), (n.className = "lc-bignum"), r.appendChild(n), (t.bigNum = n)),
      (n.textContent = e),
      (n.style.color = a),
      n.classList.remove("lc-go", "lc-pop"),
      n.offsetWidth,
      n.classList.add(e === "GO" ? "lc-go" : "lc-pop"));
  }
  function es(e) {
    for (
      var a = Math.abs(e.v) * 0.6818, r = [40, 64, 90, 116, 142, 162, 180], n = 0;
      n < r.length - 1 && a > r[n];
    )
      n++;
    var i = Math.max(900, (a * 6900) / r[n]);
    return ((e.thrIn || 0) > 0.1 && a < 4 && (i = Math.max(i, 3800)), { rpm: i, gear: n + 1 });
  }

  /* Need for Speed / Midnight Club style neon gauge: speedometer with an RPM rim, red ring, nitro bar and lap panel. */
  function merDrawGauge(a, r, e) {
    var W = 290, H = 346, cx = 145, cy = 150, A0 = Math.PI * 0.75, SW = Math.PI * 1.5, MAXMPH = 180;
    if (a.width !== Math.round(W * r)) {
      a.width = Math.round(W * r);
      a.height = Math.round(H * r);
      t.gaugeBg2 = null;
    }
    a.style.width !== W + "px" && ((a.style.width = W + "px"), (a.style.height = H + "px"));
    var ang = function (m) {
      return A0 + SW * Math.min(1, Math.max(0, m / MAXMPH));
    };
    if (!t.gaugeBg2) {
      var f = document.createElement("canvas");
      f.width = a.width;
      f.height = a.height;
      var u = f.getContext("2d");
      u.scale(r, r);
      var g0 = u.createRadialGradient(cx, cy, 10, cx, cy, 132);
      (g0.addColorStop(0, "#0d2350"), g0.addColorStop(0.7, "#060f24"), g0.addColorStop(1, "#02050d"));
      ((u.fillStyle = g0), u.beginPath(), u.arc(cx, cy, 132, 0, 6.2832), u.fill());
      u.save();
      (u.beginPath(), u.arc(cx, cy, 128, 0, 6.2832), u.clip());
      u.fillStyle = "rgba(120,180,255,.11)";
      for (var yy = cy - 132; yy < cy + 132; yy += 6)
        for (var xx = cx - 132 + (Math.round(yy / 6) % 2) * 3; xx < cx + 132; xx += 6) u.fillRect(xx, yy, 1.6, 1.6);
      u.restore();
      ((u.shadowColor = "#2f8cff"), (u.shadowBlur = 16), (u.strokeStyle = "#3d9bff"), (u.lineWidth = 4));
      (u.beginPath(), u.arc(cx, cy, 131, 0, 6.2832), u.stroke());
      ((u.shadowBlur = 0), (u.strokeStyle = "rgba(200,230,255,.9)"), (u.lineWidth = 2), (u.lineCap = "round"));
      (u.beginPath(), u.arc(cx, cy, 124, Math.PI * 0.62, Math.PI * 0.2 + Math.PI * 2 - 0.02, !1), u.stroke());
      ((u.strokeStyle = "rgba(47,140,255,.22)"), (u.lineWidth = 8), (u.lineCap = "butt"));
      (u.beginPath(), u.arc(cx, cy, 116, A0, A0 + SW), u.stroke());
      ((u.shadowColor = "#ff2d2d"), (u.shadowBlur = 8), (u.strokeStyle = "#ff2a2a"), (u.lineWidth = 3));
      (u.beginPath(), u.arc(cx, cy, 106, 0, 6.2832), u.stroke());
      u.shadowBlur = 0;
      for (var m = 0; m <= MAXMPH; m += 10) {
        var an = ang(m), maj = m % 20 === 0, hot = m >= 140, c1 = Math.cos(an), s1 = Math.sin(an), r0 = maj ? 86 : 92;
        ((u.strokeStyle = hot ? "#ff6a5f" : "#e6f0ff"), (u.lineWidth = maj ? 3 : 1.6));
        (u.beginPath(), u.moveTo(cx + c1 * r0, cy + s1 * r0), u.lineTo(cx + c1 * 99, cy + s1 * 99), u.stroke());
        if (maj) {
          ((u.fillStyle = hot ? "#ff6a5f" : "#e6f0ff"), (u.font = "italic 800 12px Arial, sans-serif"));
          ((u.textAlign = "center"), (u.textBaseline = "middle"));
          u.fillText(String(m), cx + c1 * 72, cy + s1 * 72);
        }
      }
      ((u.fillStyle = "#7fa6d9"), (u.font = "800 8px Arial, sans-serif"), (u.textAlign = "center"));
      u.fillText("MPH", cx, cy - 44);
      var P = function (x0, y0, x1, y1) {
        (u.beginPath(), u.moveTo(x0, y1), u.lineTo(x0 + 18, y0), u.lineTo(x1, y0), u.lineTo(x1 - 18, y1), u.closePath());
      };
      (P(28, 290, 262, 328), (u.fillStyle = "rgba(4,12,30,.94)"), u.fill());
      ((u.shadowColor = "#2f8cff"), (u.shadowBlur = 12), (u.strokeStyle = "#3d9bff"), (u.lineWidth = 2), u.stroke());
      t.gaugeBg2 = f;
    }
    var g = a.getContext("2d");
    (g.setTransform(1, 0, 0, 1, 0, 0), g.clearRect(0, 0, a.width, a.height), g.drawImage(t.gaugeBg2, 0, 0), g.scale(r, r));
    var b = es(e);
    e.rpmD = e.rpmD ? e.rpmD + (b.rpm - e.rpmD) * 0.25 : b.rpm;
    var k = e.rpmD, hotR = k > 6500, mph = Math.abs(e.v) * 0.6818;
    e.spD = e.spD == null ? mph : e.spD + (mph - e.spD) * 0.3;
    ((g.shadowColor = hotR ? "#ff3b30" : "#35b6ff"), (g.shadowBlur = 12), (g.strokeStyle = hotR ? "#ff5a3c" : "#4cc3ff"));
    ((g.lineWidth = 8), (g.lineCap = "butt"), g.beginPath(), g.arc(cx, cy, 116, A0, A0 + SW * Math.min(1, k / 8000)), g.stroke());
    g.shadowBlur = 0;
    var na2 = ang(e.spD), cs = Math.cos(na2), sn2 = Math.sin(na2);
    ((g.strokeStyle = "#ff3b2e"), (g.shadowColor = "#ff3b2e"), (g.shadowBlur = 10), (g.lineWidth = 3.5), (g.lineCap = "round"));
    (g.beginPath(), g.moveTo(cx - cs * 16, cy - sn2 * 16), g.lineTo(cx + cs * 102, cy + sn2 * 102), g.stroke());
    ((g.shadowBlur = 0), (g.fillStyle = "#050c1b"), (g.strokeStyle = hotR ? "#ff5a3c" : "#2f8cff"), (g.lineWidth = 2.5));
    (g.beginPath(), g.arc(cx, cy, 30, 0, 6.2832), g.fill(), g.stroke());
    var G = e.v < -0.5 ? "R" : String(b.gear);
    (G !== e.gearD && ((e.gearD = G), (e.gearFlash = 1)), (e.gearFlash = Math.max(0, (e.gearFlash || 0) - 0.06)));
    ((g.textAlign = "center"), (g.textBaseline = "middle"), (g.fillStyle = e.gearFlash > 0 ? "#ffd24d" : "#ffffff"));
    ((g.font = "italic 900 " + Math.round(30 + e.gearFlash * 8) + 'px "Arial Black", Arial, sans-serif'), g.fillText(G, cx + 1, cy + 2));
    ((g.shadowColor = "#35b6ff"), (g.shadowBlur = 10), (g.fillStyle = "#ffffff"));
    ((g.font = 'italic 900 66px "Arial Black", Arial, sans-serif'), g.fillText(String(Math.round(mph)), cx, cy + 66));
    g.shadowBlur = 0;
    var N = Math.max(0, Math.min(1, e.nitro == null ? 1 : e.nitro)), segs = 14, i;
    for (i = 0; i < segs; i++) {
      var on = (i + 1) / segs <= N + 0.001, x0 = cx - 62 + i * 9;
      ((g.fillStyle = on ? (e.boosting ? "#ff8a1f" : "#35b6ff") : "rgba(255,255,255,.14)"));
      on && ((g.shadowColor = e.boosting ? "#ff8a1f" : "#35b6ff"), (g.shadowBlur = 6));
      (g.beginPath(), g.moveTo(x0, 266), g.lineTo(x0 + 3, 258), g.lineTo(x0 + 9, 258), g.lineTo(x0 + 6, 266), g.closePath(), g.fill());
      g.shadowBlur = 0;
    }
    ((g.fillStyle = e.boosting ? "#ffb070" : "#7fa6d9"), (g.font = "800 8px Arial, sans-serif"), g.fillText("NITRO", cx, 274));
    var z = t.raceOn && e.lapTxt ? e.lapTxt : "FREE DRIVE", q = 22;
    g.font = "italic 900 " + q + 'px "Arial Black", Arial, sans-serif';
    for (; q > 11 && g.measureText(z).width > (t.raceOn ? 150 : 180); ) (q--, (g.font = "italic 900 " + q + 'px "Arial Black", Arial, sans-serif'));
    ((g.fillStyle = t.raceOn ? "#ffffff" : "#7fa6d9"), g.fillText(z, t.raceOn ? cx + 14 : cx, 310));
    t.raceOn && ((g.fillStyle = "#6fd0ff"), (g.font = "800 9px Arial, sans-serif"), (g.textAlign = "left"), g.fillText("LAP", 52, 310));
  }

  /* Arcade camera shake: strong while boosting, subtle near top speed. */
  function merShakeAmt(e) {
    var f = Math.min(1, Math.abs(e.v) / 261);
    return e.boosting ? 0.06 : f > 0.85 ? (0.02 * (f - 0.85)) / 0.15 : 0;
  }

  /* Neon gantry, chevron corner signs and glowing checkpoint gates. */
  function merTrackFx(e, grp, kt, Xr, xn, Ye, ge, Ve, Pe, Je) {
    try {
      var N = Ve, i, j, total = 0;
      /* Neon START / FINISH sign */
      var c2 = Ye.getContext("2d"),
        gg = c2.createLinearGradient(0, 0, 0, 80);
      (gg.addColorStop(0, "#06121f"), gg.addColorStop(1, "#02060e"));
      ((c2.fillStyle = gg), c2.fillRect(0, 0, 512, 80));
      ((c2.shadowColor = "#19f0ff"), (c2.shadowBlur = 6), (c2.fillStyle = "#19f0ff"));
      (c2.fillRect(0, 0, 512, 3), c2.fillRect(0, 77, 512, 3));
      ((c2.font = 'italic 700 34px Arial, sans-serif'), "letterSpacing" in c2 && (c2.letterSpacing = "7px"), (c2.textAlign = "center"), (c2.textBaseline = "middle"));
      ((c2.fillStyle = "#e6fcff"), (c2.shadowBlur = 8), c2.fillText("START / FINISH", 256, 42));
      Xr.map && (Xr.map.needsUpdate = !0);
      (Xr.color.setRGB(1.25, 1.25, 1.25), (Xr.toneMapped = !1), (Xr.needsUpdate = !0));
      xn.color.setHex(3159618), (xn.needsUpdate = !0);
      var nm = new e.MeshBasicMaterial({ color: 16777215, toneMapped: !1 });
      nm.color.setRGB(0.2, 1.5, 1.7);
      var fr = function (w, h, x, y) {
        var m = new e.Mesh(new e.BoxGeometry(w, h, 0.3), nm);
        (m.position.set(x, y, 0), kt.add(m));
      };
      (fr(Pe + 4.6, 0.1, 0, 14.15), fr(Pe + 4.6, 0.1, 0, 10.65), fr(0.1, 3.5, -(Pe / 2 + 2.25), 12.4), fr(0.1, 3.5, Pe / 2 + 2.25, 12.4));
      var nm2 = new e.MeshBasicMaterial({ color: 16777215, toneMapped: !1 });
      nm2.color.setRGB(0.5, 3.2, 3.6);
      [-1, 1].forEach(function (sd) {
        [-0.46, 0.46].forEach(function (zz) {
          var st = new e.Mesh(new e.BoxGeometry(0.22, 13.4, 0.12), nm2);
          (st.position.set(sd * (Pe / 2 + 1.6), 7, zz), kt.add(st));
        });
      });
      var gs = new e.SpotLight(14155775, 2600, 70, 0.9, 0.7, 1.4);
      (gs.position.set(0, 13.2, 0), gs.target.position.set(0, 0, 0), kt.add(gs), kt.add(gs.target));
      var rc = document.createElement("canvas");
      rc.width = rc.height = 128;
      var rx = rc.getContext("2d"), rg = rx.createRadialGradient(64, 64, 0, 64, 64, 64);
      (rg.addColorStop(0, "rgba(255,255,255,.9)"), rg.addColorStop(1, "rgba(255,255,255,0)"));
      ((rx.fillStyle = rg), rx.fillRect(0, 0, 128, 128));
      var gm = new e.MeshBasicMaterial({ map: new e.CanvasTexture(rc), transparent: !0, opacity: 0.5, blending: e.AdditiveBlending, depthWrite: !1, toneMapped: !1 });
      gm.color.setRGB(0.5, 1.5, 1.7);
      var gp = new e.Mesh(new e.PlaneGeometry(Pe + 8, 16), gm);
      (gp.rotation.x = -Math.PI / 2, gp.position.y = 0.08, kt.add(gp));
      (Je.color.setRGB(1.7, 1.7, 1.85), (Je.toneMapped = !1), (Je.needsUpdate = !0));
      var dk = new e.MeshBasicMaterial({ color: 988702 }),
        beam = new e.Mesh(new e.BoxGeometry(Pe + 5, 0.55, 0.7), dk);
      (beam.position.set(0, 14.45, 0), kt.add(beam));
      var beam2 = new e.Mesh(new e.BoxGeometry(Pe + 5, 0.55, 0.7), dk);
      (beam2.position.set(0, 10.35, 0), kt.add(beam2));

      /* Gunmetal truss, spotlights and the suspended countdown board */
      (function () {
        var steel = new e.MeshStandardMaterial({ color: 0x343a44, metalness: 0.8, roughness: 0.3, emissive: 0x0b0e13 }),
          lamp = new e.MeshBasicMaterial({ color: 0xffffff, toneMapped: !1 });
        lamp.color.setRGB(2.2, 2.3, 2.4);
        beam.material = steel;
        beam2.material = steel;
        kt.children.forEach(function (c) {
          var gp0 = c.geometry && c.geometry.parameters;
          gp0 && gp0.height === 14 && gp0.width === 0.8 && (c.visible = !1);
        });
        var box = function (w, h, d, x, y, z, rx, rz) {
          var m = new e.Mesh(new e.BoxGeometry(w, h, d), steel);
          m.position.set(x, y, z);
          rx && (m.rotation.x = rx);
          rz && (m.rotation.z = rz);
          kt.add(m);
          return m;
        };
        var PH = 2, NP = 7, hw = 0.6;
        [-1, 1].forEach(function (sd) {
          var x0 = sd * (Pe / 2 + 1.6), sx, sz, p, up;
          [-1, 1].forEach(function (a1) {
            [-1, 1].forEach(function (b1) {
              box(0.24, 14.4, 0.24, x0 + a1 * hw, 7.2, b1 * hw);
            });
          });
          for (p = 0; p < NP; p++) {
            up = p % 2 ? 1 : -1;
            var yc = p * PH + PH / 2, ang = Math.atan2(hw * 2, PH), len = Math.hypot(hw * 2, PH);
            [-1, 1].forEach(function (b1) {
              box(0.12, len, 0.12, x0, yc, b1 * hw, 0, up * ang);
            });
            [-1, 1].forEach(function (a1) {
              box(0.12, len, 0.12, x0 + a1 * hw, yc, 0, -up * ang, 0);
            });
          }
          for (p = 0; p <= NP; p++) {
            [-1, 1].forEach(function (b1) {
              box(hw * 2, 0.12, 0.12, x0, p * PH, b1 * hw);
            });
          }
        });
        /* top chord with zigzag bracing */
        var tw = Pe + 4.6, nz = Math.max(4, Math.round(tw / 2.2)), zw = tw / nz, zi;
        box(tw, 0.22, 0.22, 0, 15.5, 0);
        for (zi = 0; zi < nz; zi++) {
          var zl = Math.hypot(zw, 1.05), za = Math.atan2(zw, 1.05);
          box(0.12, zl, 0.12, -tw / 2 + zw * (zi + 0.5), 14.98, 0, 0, zi % 2 ? za : -za);
        }
        /* downward spotlights under the crossbeam */
        [-1, 1].forEach(function (sd) {
          var lx = sd * Pe * 0.27,
            sp = new e.SpotLight(0xd8f1ff, 1500, 55, 0.62, 0.65, 1.3);
          sp.position.set(lx, 9.7, -0.9);
          sp.target.position.set(lx * 0.45, 0, -3.5);
          kt.add(sp);
          kt.add(sp.target);
          var hs = new e.Mesh(new e.CylinderGeometry(0.5, 0.65, 0.95, 14), steel);
          hs.position.set(lx, 9.95, -0.9);
          kt.add(hs);
          var ln = new e.Mesh(new e.CircleGeometry(0.5, 14), lamp);
          ln.rotation.x = Math.PI / 2;
          ln.position.set(lx, 9.46, -0.9);
          kt.add(ln);
          var cm = new e.MeshBasicMaterial({ color: 0xbfe8ff, transparent: !0, opacity: 0.055, blending: e.AdditiveBlending, depthWrite: !1, side: e.DoubleSide, toneMapped: !1 }),
            cn2 = new e.Mesh(new e.ConeGeometry(3.4, 9.2, 22, 1, !0), cm);
          cn2.position.set(lx, 4.85, -0.9);
          kt.add(cn2);
        });
        /* suspended LED countdown board */
        var bw = Math.min(Pe * 0.62, 19), bh = bw / 4.6, by = 7.3,
          bc = document.createElement("canvas");
        bc.width = 640;
        bc.height = 139;
        var btex = new e.CanvasTexture(bc);
        e.SRGBColorSpace && (btex.colorSpace = e.SRGBColorSpace);
        var bmF = new e.MeshBasicMaterial({ map: btex, transparent: !0, toneMapped: !1, depthWrite: !1 }),
          bmB = new e.MeshBasicMaterial({ map: btex, transparent: !0, toneMapped: !1, depthWrite: !1 });
        bmF.color.setRGB(1.0, 1.0, 1.0);
        bmB.color.setRGB(1.0, 1.0, 1.0);
        var bg = new e.Group();
        bg.position.set(0, by, 0);
        var pf = new e.Mesh(new e.PlaneGeometry(bw, bh), bmF);
        pf.rotation.y = Math.PI;
        pf.position.z = -0.3;
        var pb = new e.Mesh(new e.PlaneGeometry(bw, bh), bmB);
        pb.position.z = 0.3;
        var core = new e.Mesh(new e.BoxGeometry(bw, bh, 0.5), steel);
        bg.add(core, pf, pb);
        var gm2 = new e.MeshBasicMaterial({ map: gm.map, transparent: !0, opacity: 0.3, blending: e.AdditiveBlending, depthWrite: !1, toneMapped: !1, side: e.DoubleSide }),
          gl2 = new e.Mesh(new e.PlaneGeometry(bw * 1.7, bh * 3.2), gm2);
        gl2.rotation.y = Math.PI;
        gl2.position.z = -0.6;
        bg.add(gl2);
        [-1, 1].forEach(function (sd) {
          var cb = new e.Mesh(new e.BoxGeometry(0.1, 10.35 - (by + bh / 2) + 0.1, 0.1), steel);
          cb.position.set(sd * bw * 0.36, (10.35 + by + bh / 2) / 2 - by, 0);
          bg.add(cb);
        });
        kt.add(bg);
        bg.visible = !1;
        var draw = function (txt) {
          var x = bc.getContext("2d"), W = bc.width, H = bc.height, c1, c2c, glow;
          if (txt === "GO!") { c1 = "#07a83a"; c2c = "#4fc61a"; glow = [0.1, 1.6, 0.35]; }
          else if (txt === "SET...") { c1 = "#c99a00"; c2c = "#e6c200"; glow = [1.7, 1.4, 0.1]; }
          else { c1 = "#b3140c"; c2c = "#d96a00"; glow = [1.8, 0.55, 0.1]; }
          x.clearRect(0, 0, W, H);
          var r = 22, p0 = 8;
          x.beginPath();
          x.moveTo(p0 + r, p0); x.lineTo(W - p0 - r, p0); x.quadraticCurveTo(W - p0, p0, W - p0, p0 + r);
          x.lineTo(W - p0, H - p0 - r); x.quadraticCurveTo(W - p0, H - p0, W - p0 - r, H - p0);
          x.lineTo(p0 + r, H - p0); x.quadraticCurveTo(p0, H - p0, p0, H - p0 - r);
          x.lineTo(p0, p0 + r); x.quadraticCurveTo(p0, p0, p0 + r, p0); x.closePath();
          var g1 = x.createLinearGradient(0, 0, W, 0);
          g1.addColorStop(0, c1); g1.addColorStop(1, c2c);
          x.globalAlpha = 0.95; x.fillStyle = g1; x.fill(); x.globalAlpha = 1;
          var g2 = x.createLinearGradient(0, 0, 0, H);
          g2.addColorStop(0, "rgba(255,255,255,.22)"); g2.addColorStop(0.5, "rgba(0,0,0,0)"); g2.addColorStop(1, "rgba(0,0,0,.3)");
          x.fillStyle = g2; x.fill();
          x.lineWidth = 6; x.strokeStyle = "#e9fbff"; x.shadowColor = c2c; x.shadowBlur = 14; x.stroke(); x.shadowBlur = 0;
          x.font = "italic 900 84px 'Arial Black', Impact, Arial, sans-serif";
          x.textAlign = "center"; x.textBaseline = "middle";
          x.lineWidth = 12; x.lineJoin = "round"; x.strokeStyle = "rgba(20,6,0,.85)"; x.strokeText(txt, W / 2, H / 2 + 5);
          x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 6; x.fillStyle = "#ffffff"; x.fillText(txt, W / 2, H / 2 + 5);
          x.shadowBlur = 0;
          btex.needsUpdate = !0;
          gm2.color.setRGB(glow[0] * 0.7, glow[1] * 0.7, glow[2] * 0.7);
        };
        t.mFx = t.mFx || {};
        t.mFx.board = {
          grp: bg, draw: draw, state: null, t0: 0,
          setOp: function (o) { bmF.opacity = bmB.opacity = o; gm2.opacity = 0.3 * o; },
        };
      })();
      /* Thick cyan neon outer arch */
      (function () {
        var ne = new e.MeshBasicMaterial({ color: 0xffffff, toneMapped: !1 });
        ne.color.setRGB(0.0, 2.8, 3.2);
        var ox = Pe / 2 + 3.0, top = 16.4,
          add = function (w, h, x, y) {
            var m = new e.Mesh(new e.BoxGeometry(w, h, 0.3), ne);
            m.position.set(x, y, 0);
            kt.add(m);
          };
        add(0.3, top, -ox, top / 2);
        add(0.3, top, ox, top / 2);
        add(ox * 2 + 0.3, 0.3, 0, top);
        var hm = new e.MeshBasicMaterial({ map: gm.map, transparent: !0, opacity: 0.3, blending: e.AdditiveBlending, depthWrite: !1, toneMapped: !1, side: e.DoubleSide });
        hm.color.setRGB(0.0, 1.6, 1.9);
        [-1, 1].forEach(function (sd) {
          var hp = new e.Mesh(new e.PlaneGeometry(4.2, top + 3), hm);
          hp.position.set(sd * ox, top / 2, 0);
          kt.add(hp);
        });
        var ht = new e.Mesh(new e.PlaneGeometry(ox * 2 + 4, 4.2), hm);
        ht.position.set(0, top, 0);
        kt.add(ht);
      })();
      var oldBoard = t.mFx && t.mFx.board, fx = (t.mFx = { chev: [], gates: [], gateGrp: new e.Group(), board: oldBoard });
      /* Chevron signs at sharp corners */
      for (i = 0; i < N; i++) {
        var q = ge[(i + 1) % N];
        total += Math.hypot(q[0] - ge[i][0], q[1] - ge[i][1]);
      }
      var k = Math.max(1, Math.round(24 / (total / N))),
        cand = [];
      for (i = 0; i < N; i++) {
        var A = ge[(i - k + N) % N], B = ge[i], C = ge[(i + k) % N],
          v1x = B[0] - A[0], v1z = B[1] - A[1], v2x = C[0] - B[0], v2z = C[1] - B[1],
          cr = v1x * v2z - v1z * v2x,
          an = Math.atan2(cr, v1x * v2x + v1z * v2z);
        Math.abs(an) > 0.5 && cand.push({ i: i, a: Math.abs(an), left: cr < 0 });
      }
      cand.sort(function (a, b) { return b.a - a.a; });
      var picked = [];
      cand.forEach(function (c) {
        picked.length < 6 &&
          !picked.some(function (p) {
            var d = Math.abs(p.i - c.i);
            return Math.min(d, N - d) < N / 10;
          }) &&
          picked.push(c);
      });
      var mk = function (left) {
        var cv = document.createElement("canvas");
        cv.width = 256; cv.height = 180;
        var x = cv.getContext("2d");
        ((x.fillStyle = "#050505"), x.fillRect(0, 0, 256, 180));
        ((x.strokeStyle = "#fff"), (x.lineWidth = 10), x.strokeRect(5, 5, 246, 170));
        (x.translate(128, 90), left && x.scale(-1, 1));
        ((x.lineWidth = 22), (x.lineCap = "round"), (x.lineJoin = "round"), (x.strokeStyle = "#fff"));
        [-62, 0, 62].forEach(function (o) {
          (x.beginPath(), x.moveTo(o - 22, -52), x.lineTo(o + 22, 0), x.lineTo(o - 22, 52), x.stroke());
        });
        var tx = new e.CanvasTexture(cv);
        return (e.SRGBColorSpace && (tx.colorSpace = e.SRGBColorSpace), tx);
      };
      var texL = mk(!0), texR = mk(!1), postM = new e.MeshBasicMaterial({ color: 3355443 });
      var sgL = [], sgR = [], sgP = [], dm = new e.Object3D();
      picked.forEach(function (c) {
        [-2 * k, -k, 0].forEach(function (off) {
          var jx = (c.i + off + N * 4) % N,
            P0 = ge[(jx - 1 + N) % N], P1 = ge[(jx + 1) % N],
            tx = P1[0] - P0[0], tz = P1[1] - P0[1], tl = Math.hypot(tx, tz) || 1;
          ((tx /= tl), (tz /= tl));
          var lx = tz, lz = -tx, ox = c.left ? -lx : lx, oz = c.left ? -lz : lz,
            d = Pe / 2 + 5.5,
            px = ge[jx][0] + ox * d, pz = ge[jx][1] + oz * d,
            ry = Math.atan2(-tx - ox * 0.7, -tz - oz * 0.7);
          dm.rotation.set(0, ry, 0);
          dm.position.set(px, 3.6, pz);
          dm.updateMatrix();
          (c.left ? sgL : sgR).push(dm.matrix.clone());
          [-1.9, 1.9].forEach(function (po) {
            dm.position.set(px + Math.cos(ry) * po - Math.sin(ry) * 0.1, 1.8, pz - Math.sin(ry) * po - Math.cos(ry) * 0.1);
            dm.updateMatrix();
            sgP.push(dm.matrix.clone());
          });
        });
      });
      var matL = new e.MeshBasicMaterial({ map: texL, toneMapped: !1 }),
        matR = new e.MeshBasicMaterial({ map: texR, toneMapped: !1 }),
        panG = new e.PlaneGeometry(5.2, 3.6);
      matL.color.setRGB(2.4, 1.5, 0.15);
      matR.color.setRGB(2.4, 1.5, 0.15);
      merInst(e, grp, panG, matL, sgL, !1);
      merInst(e, grp, panG, matR, sgR, !1);
      merInst(e, grp, new e.BoxGeometry(0.25, 3.6, 0.25), postM, sgP, !1);
      fx.chev.push({ mat: matL, ph: 0 }, { mat: matR, ph: 0.9 });
      /* Cyan neon arrow rows before the sharp corners, with a soft glow on the road (instanced) */
      (function () {
        var mkn = function (left) {
          var cv = document.createElement("canvas");
          cv.width = 256; cv.height = 192;
          var x = cv.getContext("2d");
          x.translate(128, 96);
          left && x.scale(-1, 1);
          x.lineCap = "round"; x.lineJoin = "round";
          [-34, 34].forEach(function (o) {
            x.beginPath(); x.moveTo(o - 26, -62); x.lineTo(o + 26, 0); x.lineTo(o - 26, 62);
            x.shadowColor = "#00f0ff"; x.shadowBlur = 26; x.lineWidth = 24; x.strokeStyle = "#00d8ff"; x.stroke();
            x.shadowBlur = 0; x.lineWidth = 9; x.strokeStyle = "#d6ffff"; x.stroke();
          });
          var tx = new e.CanvasTexture(cv);
          return (e.SRGBColorSpace && (tx.colorSpace = e.SRGBColorSpace), tx);
        };
        var step = Math.max(1, Math.round(k * 0.7)), dm2 = new e.Object3D(), aL = [], aR = [], aP = [], aG = [];
        dm2.rotation.order = "YXZ";
        var curves = [];
        cand.concat(N ? (function () {
          var extra = [], ii;
          for (ii = 0; ii < N; ii++) {
            var A2 = ge[(ii - k + N) % N], B2 = ge[ii], C2 = ge[(ii + k) % N],
              w1x = B2[0] - A2[0], w1z = B2[1] - A2[1], w2x = C2[0] - B2[0], w2z = C2[1] - B2[1],
              cr2 = w1x * w2z - w1z * w2x, an2 = Math.atan2(cr2, w1x * w2x + w1z * w2z);
            Math.abs(an2) > 0.22 && Math.abs(an2) <= 0.5 && extra.push({ i: ii, a: Math.abs(an2), left: cr2 < 0 });
          }
          return extra.sort(function (a, b) { return b.a - a.a; });
        })() : []).forEach(function (c) {
          curves.length < 16 && !curves.some(function (p) { var d = Math.abs(p.i - c.i); return Math.min(d, N - d) < N / 18; }) && curves.push(c);
        });
        curves.forEach(function (c) {
          var si;
          for (si = 0; si < 5; si++) {
            var jx = (c.i + (si - 3) * step * 2 + N * 40) % N,
              P0 = ge[(jx - 1 + N) % N], P1 = ge[(jx + 1) % N],
              tx = P1[0] - P0[0], tz = P1[1] - P0[1], tl = Math.hypot(tx, tz) || 1;
            tx /= tl; tz /= tl;
            var lx = tz, lz = -tx, ox = c.left ? -lx : lx, oz = c.left ? -lz : lz;
            [1].forEach(function (sd) {
              var sx2 = ox * sd, sz2 = oz * sd,
                gx = ge[jx][0] + sx2 * (Pe / 2 + 5.2), gz = ge[jx][1] + sz2 * (Pe / 2 + 5.2),
                ry = Math.atan2(-tx - sx2 * 0.7, -tz - sz2 * 0.7);
              dm2.rotation.set(0, ry, 0);
              dm2.position.set(gx, 8.6, gz);
              dm2.updateMatrix();
              (c.left ? aL : aR).push(dm2.matrix.clone());
              [-2.6, 2.6].forEach(function (po) {
                dm2.position.set(gx + Math.cos(ry) * po - Math.sin(ry) * 0.12, 3.7, gz - Math.sin(ry) * po - Math.cos(ry) * 0.12);
                dm2.updateMatrix();
                aP.push(dm2.matrix.clone());
              });
            });
            dm2.rotation.set(-Math.PI / 2, Math.atan2(tx, tz), 0);
            dm2.position.set(ge[jx][0] + ox * (Pe / 2 - 2.4), 0.07, ge[jx][1] + oz * (Pe / 2 - 2.4));
            dm2.updateMatrix();
            aG.push(dm2.matrix.clone());
          }
        });
        var mkm = function (tex) {
          var m = new e.MeshBasicMaterial({ map: tex, transparent: !0, depthWrite: !1, blending: e.AdditiveBlending, toneMapped: !1, side: e.DoubleSide });
          m.color.setRGB(0.7, 2.1, 2.4);
          return m;
        };
        var arG = new e.PlaneGeometry(8.2, 6.2);
        merInst(e, grp, arG, mkm(mkn(!0)), aL, !1);
        merInst(e, grp, arG, mkm(mkn(!1)), aR, !1);
        merInst(e, grp, new e.BoxGeometry(0.22, 7.4, 0.22), new e.MeshStandardMaterial({ color: 0x8a9099, roughness: 0.35, metalness: 0.85 }), aP, !1);
        var glowM = new e.MeshBasicMaterial({ map: gm.map, transparent: !0, opacity: 0.28, blending: e.AdditiveBlending, depthWrite: !1, toneMapped: !1, polygonOffset: !0, polygonOffsetFactor: -6, polygonOffsetUnits: -6 });
        glowM.color.setRGB(0.0, 1.5, 1.8);

      })();
      /* Checkpoint light gates */
      var gc = document.createElement("canvas");
      gc.width = 4; gc.height = 128;
      var gx = gc.getContext("2d"), gl = gx.createLinearGradient(0, 128, 0, 0);
      (gl.addColorStop(0, "rgba(255,255,255,.85)"), gl.addColorStop(1, "rgba(255,255,255,0)"));
      ((gx.fillStyle = gl), gx.fillRect(0, 0, 4, 128));
      var gtex = new e.CanvasTexture(gc);
      t.track.cps.forEach(function (cp) {
        var bi2 = 0, bd = 1e18;
        for (j = 0; j < N; j++) {
          var dd = (ge[j][0] - cp[0]) * (ge[j][0] - cp[0]) + (ge[j][1] - cp[1]) * (ge[j][1] - cp[1]);
          dd < bd && ((bd = dd), (bi2 = j));
        }
        var Q0 = ge[(bi2 - 1 + N) % N], Q1 = ge[(bi2 + 1) % N],
          g = new e.Group();
        g.position.set(cp[0], 0, cp[1]);
        g.rotation.y = Math.atan2(Q1[0] - Q0[0], Q1[1] - Q0[1]);
        var pm = new e.MeshBasicMaterial({ color: 16777215, toneMapped: !1 }),
          sm = new e.MeshBasicMaterial({ map: gtex, color: 16777215, transparent: !0, blending: e.AdditiveBlending, depthWrite: !1, side: e.DoubleSide, toneMapped: !1 });
        var sh = new e.Mesh(new e.PlaneGeometry(Pe + 2.4, 13), sm);
        sh.position.y = 6.5;
        g.add(sh);
        [-1, 1].forEach(function (s) {
          var pl = new e.Mesh(new e.BoxGeometry(0.6, 14, 0.6), pm);
          (pl.position.set(s * (Pe / 2 + 1.2), 7, 0), g.add(pl));
        });
        var tb = new e.Mesh(new e.BoxGeometry(Pe + 2.4, 0.6, 0.6), pm);
        (tb.position.y = 13.7, g.add(tb));
        (fx.gateGrp.add(g), fx.gates.push({ pm: pm, sm: sm }));
      });
      ((fx.gateGrp.visible = !1), grp.add(fx.gateGrp), merRefl(kt));
    } catch (err) {
      console.warn("track fx failed", err);
    }
  }

  /* Shared helpers: instanced batches, reflection layer and wet road pass */
  function merInst(e, grp, geo, mat, list, refl) {
    if (!list.length) return null;
    var im = new e.InstancedMesh(geo, mat, list.length), i;
    for (i = 0; i < list.length; i++) im.setMatrixAt(i, list[i]);
    im.instanceMatrix.needsUpdate = !0;
    im.frustumCulled = !1;
    refl && merRefl(im);
    grp.add(im);
    return im;
  }
  function merRefl(o) {
    o.traverse(function (c) {
      c.layers.enable(1);
    });
  }
  function merWetU() {
    var U = MER.wetU;
    U || (U = MER.wetU = { tRefl: { value: null }, reflMat: { value: new fe.Matrix4() }, reflK: { value: 0 } });
    return U;
  }
  function merWetHook(m) {
    var op = fe.ShaderChunk.opaque_fragment ? "#include <opaque_fragment>" : "#include <output_fragment>";
    m.onBeforeCompile = function (sh) {
      var U = merWetU();
      sh.uniforms.tRefl = U.tRefl;
      sh.uniforms.reflMat = U.reflMat;
      sh.uniforms.reflK = U.reflK;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec4 vWetPos;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWetPos = modelMatrix * vec4(transformed, 1.0);");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform sampler2D tRefl;\nuniform mat4 reflMat;\nuniform float reflK;\nvarying vec4 vWetPos;")
        .replace(
          op,
          "if (reflK > 0.0) {\n" +
            "  vec4 rc = reflMat * vWetPos;\n" +
            "  vec2 ruv = rc.xy / rc.w;\n" +
            "  float okr = step(0.0, rc.w) * step(0.0, ruv.x) * step(ruv.x, 1.0) * step(0.0, ruv.y) * step(ruv.y, 1.0);\n" +
            "  float rd = length(vWetPos.xyz - cameraPosition);\n" +
            "  float fd = clamp(0.35 + smoothstep(6.0, 70.0, rd) * 0.5, 0.0, 1.0);\n" +
            "  vec3 rf = texture2D(tRefl, ruv).rgb * 0.4 + texture2D(tRefl, ruv + vec2(0.012, 0.0)).rgb * 0.15 + texture2D(tRefl, ruv - vec2(0.012, 0.0)).rgb * 0.15 + texture2D(tRefl, ruv + vec2(0.0, 0.012)).rgb * 0.15 + texture2D(tRefl, ruv - vec2(0.0, 0.012)).rgb * 0.15;\n" +
            "  rf = min(rf, vec3(1.6));\n" +
            "  outgoingLight = outgoingLight * (1.0 - 0.12 * reflK * okr) + rf * fd * reflK * okr;\n" +
            "}\n" +
            op,
        );
    };
    m.customProgramCacheKey = function () {
      return "merwet";
    };
    return m;
  }
  function merWetPass() {
    var U = merWetU(), d = t && t.drive;
    if (window.LC_WET === !1 || !d || d.intro || !t.camera || !t.renderer || !t.scene) {
      U.reflK.value = 0;
      return;
    }
    if (MER.noWet) {
      U.reflK.value = 0;
      return;
    }
    var W = MER.wet;
    if (!W) {
      var rs = Is() === "lite" ? 256 : 512, rt = new fe.WebGLRenderTarget(rs, rs, { minFilter: fe.LinearFilter, magFilter: fe.LinearFilter, depthBuffer: !0 });
      W = MER.wet = { rt: rt, cam: new fe.PerspectiveCamera(), tm: new fe.Matrix4(), f: 0, n: 0, ok: !1, bad: 0 };
      W.cam.layers.set(1);
      U.tRefl.value = rt.texture;
      U.reflMat.value = W.tm;
    }
    if (W.bad > 3) {
      U.reflK.value = 0;
      return;
    }
    W.f++;
    var r = t.renderer, cam = t.camera, vc = W.cam, H = 0;
    cam.updateMatrixWorld();
    if (W.n++ % 90 === 0) {
      t.scene.traverse(function (o) {
        o.isLight && o.layers.enable(1);
      });
      var car = t.carList && t.carList[d.i];
      car && merRefl(car);
    }
    var cp = new fe.Vector3().setFromMatrixPosition(cam.matrixWorld),
      rot = new fe.Matrix4().extractRotation(cam.matrixWorld),
      look = new fe.Vector3(0, 0, -1).applyMatrix4(rot).add(cp),
      up = new fe.Vector3(0, 1, 0).applyMatrix4(rot);
    vc.position.set(cp.x, 2 * H - cp.y, cp.z);
    up.y = -up.y;
    vc.up.copy(up);
    look.y = 2 * H - look.y;
    vc.lookAt(look);
    vc.near = cam.near;
    vc.far = cam.far;
    vc.updateMatrixWorld();
    vc.projectionMatrix.copy(cam.projectionMatrix);
    vc.projectionMatrixInverse.copy(cam.projectionMatrixInverse);
    vc.matrixWorldInverse.copy(vc.matrixWorld).invert();
    W.tm.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    W.tm.multiply(vc.projectionMatrix);
    W.tm.multiply(vc.matrixWorldInverse);
    var pRT = r.getRenderTarget(), pAuto = r.autoClear, pSh = r.shadowMap.autoUpdate, pBg = t.scene.background,
      pCol = new fe.Color(), pAl = r.getClearAlpha();
    r.getClearColor(pCol);
    r.shadowMap.autoUpdate = !1;
    r.autoClear = !0;
    r.setClearColor(0x000000, 1);
    t.scene.background = null;
    try {
      r.setRenderTarget(W.rt);
      r.render(t.scene, vc);
      W.ok = !0;
    } catch (er) {
      W.bad++;
    }
    r.setRenderTarget(pRT);
    r.autoClear = pAuto;
    r.shadowMap.autoUpdate = pSh;
    t.scene.background = pBg;
    r.setClearColor(pCol, pAl);
    U.reflK.value = W.ok ? 0.45 : 0;
  }

  /* Orange sparks flying off the rear wheels while drifting or boosting */
  function merSparks(e, dt, active) {
    var S = MER.sp;
    if (!S) {
      if (!t || !t.group) return;
      var n = 90, pos = new Float32Array(n * 3), i;
      for (i = 0; i < n; i++) pos[i * 3 + 1] = -500;
      var g = new fe.BufferGeometry();
      g.setAttribute("position", new fe.BufferAttribute(pos, 3));
      var pts = new fe.Points(g, new fe.PointsMaterial({ color: 0xffa640, size: 0.32, transparent: !0, opacity: 0.95, blending: fe.AdditiveBlending, depthWrite: !1, toneMapped: !1 }));
      pts.frustumCulled = !1;
      t.group.add(pts);
      S = MER.sp = { n: n, pos: pos, g: g, v: new Float32Array(n * 3), life: new Float32Array(n), next: 0, acc: 0, pts: pts };
    }
    if (S.pts.parent !== t.group) t.group.add(S.pts);
    var s = e && ee[e.i], k = Math.sin(0), spawn = 0, j;
    if (active && s && !e.off) {
      S.acc += dt * 110;
      spawn = Math.floor(S.acc);
      S.acc -= spawn;
    }
    if (spawn && s) {
      var g0 = (-s.r * Math.PI) / 180, b = e.rig.fwdZ, sn = Math.sin(g0), cs = Math.cos(g0),
        bx = -b * sn, bz = -b * cs, car = t.carList[e.i], y0 = ((car && car.position.y) || 0) + 0.35;
      for (j = 0; j < spawn; j++) {
        var side = Math.random() < 0.5 ? -1 : 1, Q = side * Fa * 0.6, J = -b * wt * 0.9,
          q = s.x + Q * cs + J * sn, O = s.z - Q * sn + J * cs, idx = S.next;
        S.next = (S.next + 1) % S.n;
        var sp = 8 + Math.random() * 14, lat = (Math.random() - 0.5) * 12;
        S.pos[idx * 3] = q; S.pos[idx * 3 + 1] = y0; S.pos[idx * 3 + 2] = O;
        S.v[idx * 3] = bx * sp + cs * lat; S.v[idx * 3 + 1] = 2 + Math.random() * 6; S.v[idx * 3 + 2] = bz * sp - sn * lat;
        S.life[idx] = 0.35 + Math.random() * 0.4;
      }
    }
    var any = !1;
    for (j = 0; j < S.n; j++) {
      if (S.life[j] <= 0) continue;
      S.life[j] -= dt;
      if (S.life[j] <= 0) { S.pos[j * 3 + 1] = -500; any = !0; continue; }
      S.v[j * 3 + 1] -= 16 * dt;
      S.pos[j * 3] += S.v[j * 3] * dt;
      S.pos[j * 3 + 1] = Math.max(0.05, S.pos[j * 3 + 1] + S.v[j * 3 + 1] * dt);
      S.pos[j * 3 + 2] += S.v[j * 3 + 2] * dt;
      any = !0;
    }
    (spawn || any) && (S.g.attributes.position.needsUpdate = !0);
  }

  /* Per-frame arcade layer: speed lines, drift score popups, chevron and gate animation. */
  function merFxLoop() {
    requestAnimationFrame(merFxLoop);
    var now = performance.now(),
      dt = Math.min(0.05, (now - (MER.fxT || now)) / 1000);
    MER.fxT = now;
    if (!t || !Qi) return;
    var bd = t.mFx && t.mFx.board;
    if (bd && bd.grp.visible) {
      var ag = now - bd.t0;
      if (bd.state === "GO!") {
        if (ag > 1300) { var op = 1 - (ag - 1300) / 600; op <= 0 ? merBoard(null) : bd.setOp(op); }
      } else bd.setOp(0.88 + 0.12 * Math.sin(now / 160));
    }
    var el = MER.fxEl;
    if (!el) {
      var sl = document.createElement("div");
      sl.className = "mer-speedlines";
      var dr = document.createElement("div");
      dr.className = "mer-drift";
      dr.innerHTML =
        '<div class="mer-drift-score"></div><div><span class="mer-drift-main"></span><span class="mer-drift-mult"></span></div><div class="mer-drift-bar"><i></i></div><div class="mer-bank"></div>';
      (Qi.appendChild(sl), Qi.appendChild(dr));
      el = MER.fxEl = {
        sl: sl, dr: dr,
        score: dr.querySelector(".mer-drift-score"),
        main: dr.querySelector(".mer-drift-main"),
        mult: dr.querySelector(".mer-drift-mult"),
        bar: dr.querySelector(".mer-drift-bar i"),
        barW: dr.querySelector(".mer-drift-bar"),
        bank: dr.querySelector(".mer-bank"),
      };
    }
    var e = t.drive,
      on = !!e && !e.intro,
      D = MER.dr || (MER.dr = { pend: 0, t: 0, gap: 0, mult: 1, total: 0, lastMult: 1 });
    el.sl.classList.toggle("on", on && !!e.boosting);
    try {
      merSparks(e, dt, on && !e.crashed && Math.abs(e.v) > 25 && (e.slip > 0.14 || !!e.boosting));
    } catch (er) {}
    var flash = function (txt, col) {
      el.bank.textContent = txt;
      el.bank.style.color = col;
      el.bank.classList.remove("show");
      void el.bank.offsetWidth;
      el.bank.classList.add("show");
    };
    if (on) {
      var drifting = e.slip > 0.14 && Math.abs(e.v) > 25 && !e.off && !e.crashed;
      if (drifting) {
        ((D.pend += e.slip * Math.abs(e.v) * dt * 2.2), (D.t += dt), (D.gap = 0), (D.mult = Math.min(5, 1 + Math.floor(D.t / 1.5))));
      } else if (D.pend > 0) {
        if (e.crashed) {
          (flash("DRIFT LOST", "#ff4a3c"), (D.pend = 0), (D.t = 0), (D.mult = 1), (D.lastMult = 1));
        } else if (((D.gap += dt), D.gap > 0.5)) {
          var B = Math.round(D.pend * D.mult);
          ((D.total += B), flash("+" + B.toLocaleString() + " BANKED", "#52ff8a"));
          ((D.pend = 0), (D.t = 0), (D.mult = 1), (D.lastMult = 1));
        }
      }
    } else if (D.pend > 0) {
      ((D.pend = 0), (D.t = 0), (D.mult = 1), (D.lastMult = 1));
    }
    el.dr.classList.toggle("on", on && (D.pend > 0 || D.total > 0));
    el.score.textContent = D.total > 0 ? "SCORE " + D.total.toLocaleString() : "";
    if (D.pend > 0) {
      var cols = ["#ffffff", "#ffe35a", "#ffb02e", "#ff6a2e", "#ff2bd6"];
      el.main.style.display = el.mult.style.display = el.barW.style.display = "";
      el.main.textContent = "DRIFT +" + Math.round(D.pend * D.mult).toLocaleString();
      el.main.style.color = cols[D.mult - 1];
      el.mult.textContent = "x" + D.mult;
      if (D.mult !== D.lastMult) {
        D.lastMult = D.mult;
        el.mult.classList.remove("pulse");
        void el.mult.offsetWidth;
        el.mult.classList.add("pulse");
      }
      el.bar.style.width = (D.mult >= 5 ? 100 : ((D.t % 1.5) / 1.5) * 100) + "%";
    } else {
      el.main.style.display = el.mult.style.display = el.barW.style.display = "none";
    }
    var hl = t.mHL,
      night = !!e && !e.intro && zt === "night" && !!t.group;
    if (night) {
      if (!hl) {
        hl = t.mHL = [];
        for (var q = 0; q < 2; q++) {
          var L = new fe.SpotLight(16773327, 0, 300, 0.62, 0.55, 1.3);
          (t.group.add(L), t.group.add(L.target), hl.push(L));
        }
      }
      var ps = ee[e.i], cr = t.carList[e.i], bw = e.rig.fwdZ, gr = (-ps.r * Math.PI) / 180, sn = Math.sin(gr), cs = Math.cos(gr), hi = !!t.cineHigh;
      hl.forEach(function (L, k) {
        var lat = (k ? 1 : -1) * Fa * 0.5, fw = bw * wt * 0.9,
          x = ps.x + lat * cs + fw * sn, z = ps.z - lat * sn + fw * cs;
        L.visible = !0;
        L.position.set(x, ((cr && cr.position.y) || 0) + 0.75, z);
        L.target.position.set(x + bw * sn * 40, 0, z + bw * cs * 40);
        L.intensity = hi ? 900 : 10;
        L.decay = hi ? 1.3 : 0;
        L.distance = hi ? 300 : 120;
        L.angle = hi ? 0.62 : 0.5;
      });
    } else if (hl) {
      hl.forEach(function (L) { L.visible = !1; });
    }
    var fx = t.mFx;
    if (fx) {
      var s = now / 1000;
      fx.chev.forEach(function (c) {
        var k = 0.45 + 0.55 * Math.max(0, Math.sin(s * 6 - c.ph));
        c.mat.color.setRGB(2.6 * k, 1.6 * k, 0.1 * k);
      });
      fx.gateGrp.visible = !1;
      if (t.raceOn) {
        var rc = co(), cp = (rc && rc.cp) || [], nxt = -1, i;
        for (i = 0; i < fx.gates.length; i++)
          if (!cp[i]) { nxt = i; break; }
        fx.gates.forEach(function (g, gi) {
          var pulse = 0.7 + 0.3 * Math.sin(s * 5);
          if (cp[gi]) {
            (g.pm.color.setRGB(0.2, 1.6, 0.5), g.sm.color.setRGB(0.1, 0.6, 0.25), (g.sm.opacity = 0.35));
          } else if (gi === nxt) {
            (g.pm.color.setRGB(2.6 * pulse, 0.3, 2.3 * pulse), g.sm.color.setRGB(1.6 * pulse, 0.3, 1.5 * pulse), (g.sm.opacity = 0.7));
          } else {
            (g.pm.color.setRGB(0.3, 2.2, 2.5), g.sm.color.setRGB(0.2, 1.1, 1.4), (g.sm.opacity = 0.5));
          }
        });
      }
    }
  }

  /* Sharp nitro exhaust cones: a blue outer flame with a bright cyan core, one pair per pipe. */
  function merBoostCones(e, car, pos, grp, fl, dt) {
    var th = fe;
    if (!fl.cones) {
      fl.cones = [];
      for (var q = 0; q < 2; q++) {
        var og = new th.ConeGeometry(0.11, 1.9, 14, 1, !0);
        og.translate(0, 0.95, 0);
        var ig = new th.ConeGeometry(0.05, 1.25, 12, 1, !0);
        ig.translate(0, 0.62, 0);
        var om = new th.MeshBasicMaterial({ color: 16777215, transparent: !0, opacity: 0.7, blending: th.AdditiveBlending, depthWrite: !1, side: th.DoubleSide, toneMapped: !1 });
        om.color.setRGB(0.15, 0.55, 2.4);
        var im = new th.MeshBasicMaterial({ color: 16777215, transparent: !0, opacity: 1, blending: th.AdditiveBlending, depthWrite: !1, side: th.DoubleSide, toneMapped: !1 });
        im.color.setRGB(0.9, 2.2, 2.6);
        var oc = new th.Mesh(og, om), ic = new th.Mesh(ig, im);
        ((oc.visible = ic.visible = !1), (oc.renderOrder = ic.renderOrder = 7), grp.add(oc), grp.add(ic), fl.cones.push([oc, ic]));
      }
    }
    var on = !!(e.boosting && car && pos);
    if (!on) {
      fl.cones.forEach(function (c) { c[0].visible = c[1].visible = !1; });
      return;
    }
    var g = (-pos.r * Math.PI) / 180, b = e.rig.fwdZ, sn = Math.sin(g), cs = Math.cos(g),
      bx = -b * sn, bz = -b * cs, dir = new th.Vector3(bx, -0.02, bz).normalize(),
      h = (car.position.y || 0) + 0.52, rear = -b * (wt * 0.96 + 0.2);
    [-1, 1].forEach(function (z, k) {
      var lat = z * Fa * 0.5, px = pos.x + lat * cs + rear * sn, pz = pos.z - lat * sn + rear * cs,
        fk = 0.85 + Math.random() * 0.3, w = 0.9 + Math.random() * 0.2;
      fl.cones[k].forEach(function (m, n) {
        m.visible = !0;
        m.position.set(px, h, pz);
        m.quaternion.setFromUnitVectors(new th.Vector3(0, 1, 0), dir);
        m.scale.set(w, fk, w);
      });
    });
  }

  /* Sloped shoulder that runs from the road edge down to the terrain, so no dark gap shows beside the asphalt. */
  function merRoadSkirt(e, a, ge, Ve, Pe) {
    var prof = [[-0.4, 0.004], [0, 0.008], [0.6, -0.02], [2.2, -0.045], [4.6, -0.056]],
      pos = [], idx = [], col = [], base = 0, side, i, k, nrm = [];
    [-1, 1].forEach(function (sd) {
      for (i = 0; i <= Ve; i++) {
        var p0 = ge[(i + Ve - 1) % Ve], p1 = ge[(i + 1) % Ve], c = ge[i % Ve],
          dx = p1[0] - p0[0], dz = p1[1] - p0[1], dl = Math.sqrt(dx * dx + dz * dz) || 1,
          nx = (-dz / dl) * sd, nz = (dx / dl) * sd;
        for (k = 0; k < prof.length; k++) {
          var off = Pe / 2 + prof[k][0];
          pos.push(c[0] + nx * off, prof[k][1], c[1] + nz * off);
          nrm.push(0, 1, 0);
        }
        if (i < Ve) {
          var b0 = base + i * prof.length, b1 = base + (i + 1) * prof.length;
          for (k = 0; k < prof.length - 1; k++) idx.push(b0 + k, b1 + k, b0 + k + 1, b1 + k, b1 + k + 1, b0 + k + 1);
        }
      }
      base = pos.length / 3;
    });
    var g = new e.BufferGeometry();
    g.setAttribute("position", new e.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new e.Float32BufferAttribute(nrm, 3));
    g.setIndex(idx);
    var m = new e.MeshLambertMaterial({ color: 0x0c1610, emissive: 0x030604, side: e.DoubleSide, polygonOffset: !0, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    var mesh = new e.Mesh(g, m);
    mesh.frustumCulled = !1;
    a.add(mesh);
    return mesh;
  }
  /* Boost only counts while Shift is really held. After a screenshot shortcut or an F key, it stays locked until a fresh Shift press. */
  function merRearWall(r, a) {
    var T = t.track, R = t.race;
    if (!T || !R || R.passed || !T.S || !T.T) return;
    var lim = -30, d = (r.x - T.S[0]) * T.T[0] + (r.z - T.S[1]) * T.T[1];
    if (d < lim) {
      r.x += T.T[0] * (lim - d);
      r.z += T.T[1] * (lim - d);
      var fz = (a.rig && a.rig.fwdZ) || 1, mv = fz * a.v * (Math.sin(a.phi) * T.T[0] + Math.cos(a.phi) * T.T[1]);
      mv < 0 && (a.v *= 0.2);
    }
  }
  function merBoostOk(d) {
    if ((d.code === "ShiftLeft" || d.code === "ShiftRight") && d.type === "keydown" && !d.metaKey && !d.ctrlKey && !d.altKey && !d.repeat) merBoostOk.lock = !1;
    var ok = !!d.shiftKey && !merBoostOk.lock && !d.metaKey;
    ok && (merBoostOk.t = performance.now());
    return ok;
  }
  /* No guardrail on the garage side of the track where the driveway meets it. */
  function merRailGap(ge, x, z) {
    try {
      if (merRailGap.k !== ge) {
        merRailGap.k = ge; merRailGap.c = null;
        if (typeof ie !== "undefined" && ie && ie.wid) {
          var b = (ir(ie.wid, ie.len, ie.cars) || [])[0] || { c: 0 }, dX = b.c, dZ = ie.len / 2 + 0.2, bi = 0, bd = 1e18, i;
          for (i = 0; i < ge.length; i++) { var d = Math.hypot(ge[i][0] - dX, ge[i][1] - dZ); d < bd && ((bd = d), (bi = i)); }
          if (bd > 6 && bd < 500) merRailGap.c = { cx: ge[bi][0], cz: ge[bi][1], dx: dX - ge[bi][0], dz: dZ - ge[bi][1] };
        }
      }
      var c = merRailGap.c;
      if (!c) return !1;
      var px = x - c.cx, pz = z - c.cz;
      return px * c.dx + pz * c.dz > 0 && Math.hypot(px, pz) < 17;
    } catch (er) { return !1; }
  }
  /* Keep only guardrail runs that are long enough, so no lone piece is left sitting in the grass. */
  function merRailKeep(ge, m, S, re, C) {
    var vl = function (A, B) {
        var x = B[0] - A[0], z = B[1] - A[1], l = Math.sqrt(x * x + z * z) || 1;
        return [(-z / l) * C, (x / l) * C];
      },
      ok = [], H, tot = 0;
    for (H = 0; H < m; H++) {
      var at = ge[H], ar = ge[(H + 1) % m], Eo = ge[(H + m - 1) % m], N0 = ge[(H + 2) % m],
        rr = vl(Eo, ar), pi = vl(at, N0);
      (ok.push(!(re(at[0] + rr[0] * S, at[1] + rr[1] * S) || re(ar[0] + pi[0] * S, ar[1] + pi[1] * S))),
        (tot += Math.hypot(ar[0] - at[0], ar[1] - at[1])));
    }
    var keep = ok.slice(), st = -1;
    for (H = 0; H < m; H++) if (!ok[H]) { st = H; break; }
    if (st < 0) return keep;
    var minLen = Math.max(3, Math.ceil(45 / (tot / m))), run = [], i;
    for (i = 1; i <= m; i++) {
      var idx = (st + i) % m;
      if (ok[idx]) run.push(idx);
      if (!ok[idx] || i === m) {
        run.length < minLen && run.forEach(function (q) { keep[q] = !1; });
        run = [];
      }
    }
    return keep;
  }
  function Ts(e) {
    var a = t.gauge,
      r = Math.min(2.5, (window.devicePixelRatio || 1) * 1.1);
    if (
      (a ||
        ((a = document.createElement("canvas")),
        (a.className = "lc-gauge"),
        (a.style.cssText =
          "display:none;position:absolute;left:auto;top:auto;right:18px;bottom:18px;width:260px;height:312px;z-index:6;pointer-events:none;filter:drop-shadow(0 6px 18px rgba(0,0,0,.5))"),
        t.host.appendChild(a),
        (t.gauge = a)),
      !e)
    ) {
      a.style.display = "none";
      return;
    }
    a.style.display = "block";
    merDrawGauge(a, r, e);
    return;
    var n = Math.PI * 0.75,
      i = Math.PI * 1.5,
      o = 8e3,
      s = 125,
      l = 125,
      c = function (O) {
        return n + i * Math.min(1, O / o);
      };
    if (!t.gaugeBg) {
      var f = document.createElement("canvas");
      ((f.width = a.width), (f.height = a.height));
      var u = f.getContext("2d"),
        p;
      u.scale(r, r);
      var v = u.createRadialGradient(s, l, 10, s, l, 120);
      for (
        v.addColorStop(0, "#0f2346"),
          v.addColorStop(1, "#040912"),
          u.fillStyle = v,
          u.beginPath(),
          u.arc(s, l, 118, 0, 6.2832),
          u.fill(),
          u.shadowColor = "#2f8cff",
          u.shadowBlur = 12,
          u.strokeStyle = "#2f8cff",
          u.lineWidth = 3,
          u.beginPath(),
          u.arc(s, l, 116, 0, 6.2832),
          u.stroke(),
          u.shadowBlur = 0,
          u.strokeStyle = "rgba(47,140,255,.25)",
          u.lineWidth = 10,
          u.beginPath(),
          u.arc(s, l, 96, n, n + i),
          u.stroke(),
          u.strokeStyle = "rgba(255,59,48,.75)",
          u.beginPath(),
          u.arc(s, l, 96, c(6500), n + i),
          u.stroke(),
          p = 0;
        p <= 16;
        p++
      ) {
        var w = c(p * 500),
          y = p % 2 === 0,
          E = y ? 80 : 85;
        ((u.strokeStyle = p >= 13 ? "#ff6a5f" : "#cfe3ff"),
          (u.lineWidth = y ? 3 : 1.5),
          u.beginPath(),
          u.moveTo(s + Math.cos(w) * E, l + Math.sin(w) * E),
          u.lineTo(s + Math.cos(w) * 90, l + Math.sin(w) * 90),
          u.stroke(),
          y &&
            ((u.fillStyle = p >= 13 ? "#ff6a5f" : "#e6f0ff"),
            (u.font = "italic 800 15px Arial, sans-serif"),
            (u.textAlign = "center"),
            (u.textBaseline = "middle"),
            u.fillText(String(p / 2), s + Math.cos(w) * 66, l + Math.sin(w) * 66)));
      }
      ((u.fillStyle = "#7fa6d9"),
        (u.font = "700 9px Arial, sans-serif"),
        (u.textAlign = "center"),
        u.fillText("x1000 RPM", s, l - 46),
        (u.fillStyle = "rgba(8,16,32,.92)"),
        (u.strokeStyle = "#2f8cff"),
        (u.lineWidth = 1.5));
      var M = function (O, F, I, N, K) {
        (u.beginPath(),
          u.moveTo(O + K, F),
          u.arcTo(O + I, F, O + I, F + N, K),
          u.arcTo(O + I, F + N, O, F + N, K),
          u.arcTo(O, F + N, O, F, K),
          u.arcTo(O, F, O + I, F, K),
          u.closePath());
      };
      (M(40, 252, 170, 40, 12), u.fill(), u.stroke(), (t.gaugeBg = f));
    }
    var g = a.getContext("2d");
    (g.setTransform(1, 0, 0, 1, 0, 0),
      g.clearRect(0, 0, a.width, a.height),
      g.drawImage(t.gaugeBg, 0, 0),
      g.scale(r, r));
    var b = es(e);
    e.rpmD = e.rpmD ? e.rpmD + (b.rpm - e.rpmD) * 0.25 : b.rpm;
    var k = e.rpmD,
      L = c(k),
      x = k > 6500;
    ((g.shadowColor = x ? "#ff3b30" : "#35b6ff"),
      (g.shadowBlur = 10),
      (g.strokeStyle = x ? "#ff5a3c" : "#4cc3ff"),
      (g.lineWidth = 10),
      (g.lineCap = "butt"),
      g.beginPath(),
      g.arc(s, l, 96, n, L),
      g.stroke(),
      (g.shadowBlur = 0));
    var P = Math.max(0, Math.min(1, e.nitro == null ? 1 : e.nitro)),
      h = Math.PI * 0.68,
      B = Math.PI * 0.32;
    ((g.strokeStyle = "rgba(255,255,255,.12)"),
      (g.lineWidth = 6),
      (g.lineCap = "round"),
      g.beginPath(),
      g.arc(s, l, 106, h, B, !0),
      g.stroke(),
      P > 0.01 &&
        ((g.shadowColor = e.boosting ? "#ff8a1f" : "#35b6ff"),
        (g.shadowBlur = 8),
        (g.strokeStyle = e.boosting ? "#ff8a1f" : "#35b6ff"),
        g.beginPath(),
        g.arc(s, l, 106, h, h - (h - B) * P, !0),
        g.stroke(),
        (g.shadowBlur = 0)),
      (g.fillStyle = e.boosting ? "#ffb070" : "#7fa6d9"),
      (g.font = "800 9px Arial, sans-serif"),
      (g.textAlign = "center"),
      (g.textBaseline = "middle"),
      g.fillText("BOOST", s, l + 100),
      (g.strokeStyle = "#ff8a1f"),
      (g.lineWidth = 4),
      (g.lineCap = "round"),
      (g.shadowColor = "#ff8a1f"),
      (g.shadowBlur = 10),
      g.beginPath(),
      g.moveTo(s + Math.cos(L) * 18, l + Math.sin(L) * 18),
      g.lineTo(s + Math.cos(L) * 92, l + Math.sin(L) * 92),
      g.stroke(),
      (g.shadowBlur = 0),
      (g.fillStyle = "#081426"),
      (g.strokeStyle = x ? "#ff5a3c" : "#2f8cff"),
      (g.lineWidth = 2.5),
      g.beginPath(),
      g.arc(s, l, 26, 0, 6.2832),
      g.fill(),
      g.stroke());
    var G = e.v < -0.5 ? "R" : String(b.gear);
    (G !== e.gearD && ((e.gearD = G), (e.gearFlash = 1)),
      (e.gearFlash = Math.max(0, (e.gearFlash || 0) - 0.06)),
      (g.fillStyle = e.gearFlash > 0 ? "#ffd24d" : "#ffffff"),
      (g.font = "italic 900 " + Math.round(30 + e.gearFlash * 8) + 'px "Arial Black", Arial, sans-serif'),
      g.fillText(G, s + 1, l + 2),
      (g.fillStyle = "#ffffff"),
      (g.font = 'italic 900 34px "Arial Black", Arial, sans-serif'),
      g.fillText(String(Math.round(Math.abs(e.v) * 0.6818)), s, l + 52),
      (g.fillStyle = "#7fa6d9"),
      (g.font = "800 10px Arial, sans-serif"),
      g.fillText("MPH", s, l + 74));
    var z = t.raceOn && e.lapTxt ? e.lapTxt : "FREE DRIVE",
      Q = t.raceOn ? s + 12 : s,
      J = t.raceOn ? 128 : 150,
      q = 22;
    for (
      g.font = "italic 900 " + q + 'px "Arial Black", Arial, sans-serif';
      q > 11 && g.measureText(z).width > J;
    )
      (q--, (g.font = "italic 900 " + q + 'px "Arial Black", Arial, sans-serif'));
    ((g.fillStyle = t.raceOn ? "#ffffff" : "#7fa6d9"),
      g.fillText(z, Q, 273),
      (g.fillStyle = "#7fa6d9"),
      (g.font = "800 9px Arial, sans-serif"),
      (g.textAlign = "left"),
      t.raceOn && g.fillText("LAP", 52, 273));
  }
  function el(e) {
    var a = t && t.egg;
    if (!a || a.hinge.parent !== t.group) return null;
    var r = t.renderer.domElement,
      n = r.getBoundingClientRect(),
      i = new fe.Raycaster();
    i.setFromCamera(
      new fe.Vector2(((e.clientX - n.left) / n.width) * 2 - 1, -((e.clientY - n.top) / n.height) * 2 + 1),
      t.camera,
    );
    var o = i.intersectObjects([a.hinge, a.pad], !0)[0];
    if (!o) return null;
    for (var s = o.object; s && s !== a.pad && s !== a.hinge;) s = s.parent;
    return s === a.pad && a.open ? "pad" : "door";
  }
  function tl(e) {
    var a = t.egg;
    if (a && ((a.open = e), !a.raf)) {
      var r = performance.now(),
        n = function (i) {
          var o = Math.min(0.05, (i - r) / 1e3);
          r = i;
          var s = a.open ? -1.4 : 0;
          ((a.ang += (s - a.ang) * Math.min(1, 7 * o)),
            Math.abs(s - a.ang) < 0.003 && (a.ang = s),
            (a.hinge.rotation.x = a.ang),
            (a.leak.visible = a.ang > -0.05),
            ye(),
            a.ang !== s ? (a.raf = requestAnimationFrame(n)) : (a.raf = 0));
        };
      a.raf = requestAnimationFrame(n);
    }
  }
  function b0(e) {
    var a = ce.raceCover,
      r = document.createElement("canvas");
    ((r.width = 1280), (r.height = 720));
    var n = r.getContext("2d"),
      i = function () {
        var c = n.createLinearGradient(0, 0, 0, 720);
        (c.addColorStop(0, "#0b1730"),
          c.addColorStop(0.6, "#05080f"),
          c.addColorStop(1, "#020305"),
          (n.fillStyle = c),
          n.fillRect(0, 0, 1280, 720),
          (n.textAlign = "center"),
          (n.fillStyle = "#dfe6f2"),
          (n.font = "700 46px Arial, sans-serif"),
          n.fillText("OBSESSED GARAGE", 640, 130));
        var f = n.createLinearGradient(0, 170, 0, 420);
        (f.addColorStop(0, "#ffffff"),
          f.addColorStop(1, "#8fa3c4"),
          n.save(),
          n.transform(1, 0, -0.18, 1, 50, 0),
          (n.fillStyle = f),
          (n.font = '900 128px "Arial Black", Impact, Arial, sans-serif'),
          n.fillText("MIDNIGHT", 640, 290),
          n.fillText("EXTREME", 640, 410));
        var u = n.createLinearGradient(0, 430, 0, 520);
        (u.addColorStop(0, "#ffe27a"),
          u.addColorStop(1, "#e08a12"),
          (n.fillStyle = u),
          (n.font = '900 96px "Arial Black", Impact, Arial, sans-serif'),
          n.fillText("DELUXE", 640, 515),
          n.restore(),
          (n.fillStyle = "#c9d2e0"),
          (n.font = "italic 800 36px Arial, sans-serif"),
          n.fillText("OG LIGHTING CALCULATOR RACING SIMULATOR", 640, 640));
      },
      o = function (c) {
        if (c) {
          var f = Math.max(1280 / c.width, 720 / c.height),
            u = c.width * f,
            p = c.height * f;
          try {
            n.drawImage(c, (1280 - u) / 2, (720 - p) / 2, u, p);
          } catch {
            i();
          }
        } else i();
        e(r);
      };
    if (!a) {
      o(null);
      return;
    }
    var s = new Image();
    s.crossOrigin = "anonymous";
    var l = setTimeout(function () {
      ((s.onload = s.onerror = null), o(null));
    }, 6e3);
    ((s.onload = function () {
      (clearTimeout(l), o(s));
    }),
      (s.onerror = function () {
        (clearTimeout(l), o(null));
      }),
      (s.src = a));
  }
  function y0() {
    var e = t.egg,
      a = fe;
    if (!(!e || e.busy || t.drive)) {
      if (!ct) {
        we("Turn the cars on to play", 2600);
        return;
      }
      ((e.busy = !0), (e.skip = !1), al(), Fn(!0), t.cine && t.cine.classList.add("lc-cine-tv"), we(""));
      var r = t.camera,
        n = t.tvScr,
        i = r.position.clone(),
        o = r.quaternion.clone(),
        s = r.fov;
      t.group.updateMatrixWorld(!0);
      var l = new a.Vector3(),
        c = new a.Vector3();
      (n.getWorldPosition(l), n.localToWorld(c.set(0, -0.25, 6.2)));
      var f = new a.PerspectiveCamera();
      (f.position.copy(c), f.lookAt(l));
      var u = f.quaternion.clone(),
        p = n.material.map,
        v = null,
        w = performance.now(),
        y = "fly",
        E = 0,
        M = !1;
      b0(function (G) {
        v = G;
      });
      var g = t.tvVid;
      if (((t.tvHold = !0), (t.tvWasOn = t.tvOn !== !1), cr(), g))
        try {
          (g.pause(), (g.muted = !0));
        } catch {}
      t.tvPaint && t.tvPaint();
      var b = document.createElement("canvas");
      ((b.width = 1280), (b.height = 720));
      try {
        b.getContext("2d").drawImage(p.image, 0, 0, 1280, 720);
      } catch {
        var k = b.getContext("2d");
        ((k.fillStyle = "#05070a"), k.fillRect(0, 0, 1280, 720));
      }
      var L = document.createElement("canvas");
      ((L.width = 1280), (L.height = 720));
      var x = L.getContext("2d");
      x.drawImage(b, 0, 0);
      var P = new a.CanvasTexture(L);
      (a.SRGBColorSpace && (P.colorSpace = a.SRGBColorSpace),
        (n.material.map = P),
        (n.material.needsUpdate = !0));
      var h = function () {
        (e.raf2 && cancelAnimationFrame(e.raf2),
          (e.raf2 = 0),
          (n.material.map = p),
          (n.material.needsUpdate = !0),
          P.dispose(),
          t.cine && t.cine.classList.remove("lc-cine-tv", "lc-cine-ready"),
          (r.fov = s),
          r.updateProjectionMatrix(),
          (e.busy = !1),
          tl(!1),
          uo(),
          t.drive || (Fn(!1), fo()));
      };
      ((e.ready = !1),
        (e.padHeld = !0),
        (e.startFn = function () {
          e.ready && y !== "done" && ((y = "done"), h());
        }),
        (e.cancelFn = function () {
          if (y !== "done") {
            if (
              ((y = "done"),
              e.raf2 && cancelAnimationFrame(e.raf2),
              (e.raf2 = 0),
              (n.material.map = p),
              (n.material.needsUpdate = !0),
              P.dispose(),
              t.cine && t.cine.classList.remove("lc-cine-tv", "lc-cine-ready"),
              Fn(!1),
              fo(),
              (t.tvHold = !1),
              g && t.tvOn !== !1)
            ) {
              var G = g.play();
              G && G.catch && G.catch(function () {});
            }
            (cr(), (r.fov = s), r.updateProjectionMatrix(), (e.busy = !1), (e.ready = !1), It(), ye());
          }
        }));
      var B = function (G) {
        if (y !== "done") {
          var z = (G - w) / 1e3,
            Q = Math.min(1, z / 1.9),
            J = Q < 0.5 ? 4 * Q * Q * Q : 1 - Math.pow(-2 * Q + 2, 3) / 2;
          if (
            (M ||
              (r.position.lerpVectors(i, c, J),
              r.quaternion.slerpQuaternions(o, u, J),
              (r.fov = s + (40 - s) * J),
              r.updateProjectionMatrix(),
              Q >= 1 && (M = !0)),
            !E && v && z > 1.1 && (E = G),
            (x.globalAlpha = 1),
            x.drawImage(b, 0, 0),
            E)
          ) {
            var q = (G - E) / 1e3;
            ((x.globalAlpha = Math.min(1, q / 1.3)),
              x.drawImage(v, 0, 0),
              (x.globalAlpha = 1),
              q > 1.7 &&
                Math.floor(q * 2.4) % 2 === 0 &&
                ((x.fillStyle = "rgba(0,0,0,.55)"),
                x.fillRect(440, 560, 400, 70),
                (x.fillStyle = "#ffd24d"),
                (x.font = 'italic 900 44px "Arial Black", Arial, sans-serif'),
                (x.textAlign = "center"),
                x.fillText("PRESS START", 640, 611)),
              M && r.position.lerpVectors(c, l, Math.min(0.12, q * 0.025)),
              M && q > 1.7 && !e.ready && ((e.ready = !0), t.cine && t.cine.classList.add("lc-cine-ready")));
            var O = ho(),
              F = !!(O && ((O.buttons[0] && O.buttons[0].pressed) || (O.buttons[9] && O.buttons[9].pressed)));
            if (F && !e.padHeld && e.ready) {
              ((y = "done"), h());
              return;
            }
            e.padHeld = F;
          }
          ((P.needsUpdate = !0), ye(), (e.raf2 = requestAnimationFrame(B)));
        }
      };
      e.raf2 = requestAnimationFrame(B);
    }
  }
  function S0() {
    if (t.ac === !1) return null;
    try {
      if (!t.ac) {
        var e = window.AudioContext || window.webkitAudioContext;
        if (!e) return null;
        t.ac = new e();
      }
    } catch {
      return null;
    }
    if (t.ac.state === "suspended") {
      var a = t.ac.resume();
      a && a.catch && a.catch(function () {});
    }
    return t.ac;
  }
  function al() {
    var e = S0();
    if (!(!e || (t.music && t.music.on) || t.musicMute)) {
      var a = (t.music = { on: !0, step: 0, next: e.currentTime + 0.08 });
      ((a.out = e.createGain()), (a.out.gain.value = 0));
      var r = e.createDynamicsCompressor();
      if (
        ((r.threshold.value = -14),
        (r.ratio.value = 4),
        (r.attack.value = 0.003),
        (r.release.value = 0.12),
        a.out.connect(r),
        r.connect(e.destination),
        (a.comp = r),
        a.out.gain.setTargetAtTime(t.drive ? 0.16 : 0.3, e.currentTime, 0.3),
        ce.raceMusic)
      )
        try {
          var n = t.musicEl;
          n ||
            ((n = t.musicEl = new Audio()),
            (n.crossOrigin = "anonymous"),
            (n.loop = !0),
            (n.preload = "auto"),
            (n.src = ce.raceMusic),
            (t.musicSrc = e.createMediaElementSource(n)));
          try {
            t.musicSrc.disconnect();
          } catch {}
          (t.musicSrc.connect(a.out), (n.currentTime = 0));
          var i = n.play();
          (i && i.catch && i.catch(function () {}), (a.el = n));
          return;
        } catch {}
      var o = Jo(e),
        s = function (g) {
          return 440 * Math.pow(2, (g - 69) / 12);
        },
        l = [45, 45, 41, 43],
        c = [0, 0, 12, 0, 3, 0, 7, 12, 0, 10, 0, 3, 15, 0, 7, 5],
        f = [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0],
        u = function (g, b, k, L, x, P) {
          var h = e.createBufferSource(),
            B = e.createGain(),
            G = e.createBiquadFilter();
          ((h.buffer = o),
            (G.type = L),
            (G.frequency.value = x),
            P && (G.Q.value = P),
            B.gain.setValueAtTime(k, g),
            B.gain.exponentialRampToValueAtTime(1e-4, g + b),
            h.connect(G),
            G.connect(B),
            B.connect(a.out),
            h.start(g, Math.random() * 0.4),
            h.stop(g + b + 0.02));
        },
        p = function (g) {
          var b = e.createOscillator(),
            k = e.createGain();
          (b.frequency.setValueAtTime(170, g),
            b.frequency.exponentialRampToValueAtTime(44, g + 0.09),
            k.gain.setValueAtTime(1.15, g),
            k.gain.exponentialRampToValueAtTime(1e-4, g + 0.32),
            b.connect(k),
            k.connect(a.out),
            b.start(g),
            b.stop(g + 0.34),
            u(g, 0.012, 0.35, "highpass", 3e3));
        },
        v = function (g, b) {
          var k = e.createOscillator(),
            L = e.createGain(),
            x = e.createBiquadFilter();
          ((k.type = "sawtooth"),
            (k.frequency.value = g),
            (x.type = "lowpass"),
            (x.frequency.value = 420),
            (x.Q.value = 3),
            L.gain.setValueAtTime(1e-4, b),
            L.gain.exponentialRampToValueAtTime(0.34, b + 0.005),
            L.gain.exponentialRampToValueAtTime(1e-4, b + 0.09),
            k.connect(x),
            x.connect(L),
            L.connect(a.out),
            k.start(b),
            k.stop(b + 0.1));
        },
        w = function (g, b, k, L) {
          var x = e.createOscillator(),
            P = e.createGain(),
            h = e.createBiquadFilter(),
            B = 500 + L * 2600 + (k ? 900 : 0);
          ((x.type = "sawtooth"),
            (x.frequency.value = g),
            (h.type = "lowpass"),
            (h.Q.value = 14),
            h.frequency.setValueAtTime(B, b),
            h.frequency.exponentialRampToValueAtTime(240, b + 0.11),
            P.gain.setValueAtTime(1e-4, b),
            P.gain.exponentialRampToValueAtTime(k ? 0.11 : 0.07, b + 0.004),
            P.gain.exponentialRampToValueAtTime(1e-4, b + 0.12),
            x.connect(h),
            h.connect(P),
            P.connect(a.out),
            x.start(b),
            x.stop(b + 0.13));
        },
        y = function (g, b) {
          [0, 3, 7].forEach(function (k) {
            var L = e.createOscillator(),
              x = e.createGain(),
              P = e.createBiquadFilter();
            ((L.type = "square"),
              (L.frequency.value = s(g + k)),
              (P.type = "lowpass"),
              P.frequency.setValueAtTime(3200, b),
              P.frequency.exponentialRampToValueAtTime(500, b + 0.2),
              x.gain.setValueAtTime(1e-4, b),
              x.gain.exponentialRampToValueAtTime(0.05, b + 0.005),
              x.gain.exponentialRampToValueAtTime(1e-4, b + 0.22),
              L.connect(P),
              P.connect(x),
              x.connect(a.out),
              L.start(b),
              L.stop(b + 0.24));
          });
        },
        E = function (g, b) {
          var k = g % 16,
            L = Math.floor(g / 16),
            x = L % 4,
            P = Math.floor(L / 8),
            h = L % 8,
            B = P > 0 && h === 7 && k >= 8;
          if (
            (k % 4 === 0 && !B && p(b),
            k % 4 === 2
              ? u(b, 0.1, 0.24, "highpass", 8e3)
              : u(b, 0.025, k % 2 ? 0.05 : 0.08, "highpass", 1e4),
            (k === 4 || k === 12) &&
              L >= 2 &&
              (u(b, 0.05, 0.4, "bandpass", 1500, 1.2),
              u(b + 0.011, 0.05, 0.32, "bandpass", 1500, 1.2),
              u(b + 0.022, 0.14, 0.38, "bandpass", 1300, 1.2)),
            k % 4 !== 0 && !B && v(s(l[x] - 12), b),
            L >= 4 && w(s(l[x] + c[k]), b, f[k], 0.5 + 0.5 * Math.sin((g / 64) * Math.PI)),
            L >= 8 && (k === 0 || k === 6 || k === 10) && x % 2 === 0 && y(l[x] + 12, b),
            h === 7 && k === 0)
          ) {
            var G = e.createBufferSource(),
              z = e.createGain(),
              Q = e.createBiquadFilter(),
              J = 960 / 140 / 4;
            ((G.buffer = o),
              (G.loop = !0),
              (Q.type = "highpass"),
              Q.frequency.setValueAtTime(400, b),
              Q.frequency.exponentialRampToValueAtTime(9e3, b + J),
              z.gain.setValueAtTime(1e-4, b),
              z.gain.exponentialRampToValueAtTime(0.22, b + J),
              G.connect(Q),
              Q.connect(z),
              z.connect(a.out),
              G.start(b),
              G.stop(b + J));
          }
        },
        M = 60 / 140 / 4;
      a.timer = setInterval(function () {
        if (a.on)
          for (; a.next < e.currentTime + 0.14;) {
            try {
              E(a.step, a.next);
            } catch {}
            ((a.next += M), a.step++);
          }
      }, 25);
    }
  }
  function fo() {
    var e = t && t.music;
    if (!(!e || !e.on)) {
      e.on = !1;
      try {
        e.out.gain.setTargetAtTime(0, t.ac.currentTime, 0.2);
      } catch {}
      setTimeout(function () {
        if ((clearInterval(e.timer), e.el))
          try {
            e.el.pause();
          } catch {}
        try {
          e.comp.disconnect();
        } catch {}
      }, 1200);
    }
  }
  function rl(e) {
    var a = t && t.music;
    if (a && a.on)
      try {
        a.out.gain.setTargetAtTime(e, t.ac.currentTime, 0.4);
      } catch {}
  }
  function nl(e) {
    var a = fe,
      r = t.carList && t.carList[e.i];
    if (!(!r || !t.renderer)) {
      var n = t.liveRef,
        i = qn();
      if (!n || n.car !== r) {
        il();
        var o = i ? 64 : 128,
          s = new a.WebGLCubeRenderTarget(o, { generateMipmaps: !0, minFilter: a.LinearMipmapLinearFilter }),
          l = new a.CubeCamera(0.6, 6e3, s);
        t.scene.add(l);
        var c = [];
        (r.traverse(function (M) {
          if (!(!M.isMesh || !M.userData.body)) {
            var g = M.material,
              b = new a.MeshPhysicalMaterial({
                color: g.color ? g.color.clone() : 16777215,
                roughness: 0.2,
                metalness: 0.12,
                clearcoat: 1,
                clearcoatRoughness: 0.03,
                side: g.side,
                envMap: s.texture,
                envMapIntensity: 1.15,
              });
            (c.push([M, g]), (M.material = b));
          }
        }),
          (n = t.liveRef = { car: r, rt: s, cc: l, swaps: c, n: 0, every: i ? 4 : 2 }));
      }
      var f = zt === "night";
      if (
        (n.night !== f &&
          ((n.night = f),
          n.swaps.forEach(function (M) {
            var g = M[0].material,
              b = M[1].color ? M[1].color : null;
            Fs(g, (M[1].userData && M[1].userData.base) || b, f);
          })),
        !n.lamps)
      ) {
        n.lamps = [];
        for (var u = 0; u < 3; u++) {
          var p = new a.PointLight(16772836, 0, 55, 1.6);
          (t.group.add(p), n.lamps.push(p));
        }
      }
      var v = f && t.trackLamps && t.trackLamps.heads,
        w = ee[e.i];
      if (v && v.length && w) {
        var y = v
          .map(function (M) {
            var g = M[0] - w.x,
              b = M[2] - w.z;
            return [g * g + b * b, M];
          })
          .sort(function (M, g) {
            return M[0] - g[0];
          });
        n.lamps.forEach(function (M, g) {
          var b = y[g];
          (M.parent !== t.group && t.group.add(M),
            b && b[0] < 3600
              ? (M.position.set(b[1][0], b[1][1], b[1][2]), (M.intensity = 90 * (1 - Math.sqrt(b[0]) / 60)))
              : (M.intensity = 0));
        });
      } else
        n.lamps.forEach(function (M) {
          M.intensity = 0;
        });
      if ((n.n++, !(n.n % n.every !== 1 && n.every > 1))) {
        (r.updateMatrixWorld(!0), r.getWorldPosition(n.cc.position), (n.cc.position.y += 2.2));
        var E = r.visible;
        r.visible = !1;
        try {
          n.cc.update(t.renderer, t.scene);
        } catch {}
        r.visible = E;
      }
    }
  }
  function il() {
    var e = t && t.liveRef;
    e &&
      (e.swaps.forEach(function (a) {
        var r = a[0].material;
        ((a[0].material = a[1]), r && r.dispose && r.dispose());
      }),
      e.cc.parent && e.cc.parent.remove(e.cc),
      e.lamps &&
        e.lamps.forEach(function (a) {
          a.parent && a.parent.remove(a);
        }),
      e.rt.dispose(),
      (t.liveRef = null),
      Xo());
  }
  function ol(e, a) {
    var r = fe,
      n = t.windLines;
    if (!e) {
      n && (n.visible = !1);
      return;
    }
    var i = Math.abs(e.v) * 0.6818,
      o = e.boosting ? 1 : 0;
    e.sfxK = (e.sfxK || 0) + (o - (e.sfxK || 0)) * Math.min(1, (o > (e.sfxK || 0) ? 7 : 2.5) * a);
    var s = e.sfxK,
      l = 70,
      c;
    if (s < 0.02) {
      n && (n.visible = !1);
      return;
    }
    if (!n) {
      var f = new r.BufferGeometry(),
        u = [];
      for (
        f.setAttribute("position", new r.BufferAttribute(new Float32Array(l * 6), 3)),
          f.setAttribute("color", new r.BufferAttribute(new Float32Array(l * 6), 3)),
          c = 0;
        c < l;
        c++
      ) {
        var p = Math.random() * 6.2832,
          v = 3.2 + Math.random() * 7.5;
        u.push({
          lx: Math.cos(p) * v,
          ly: 0.6 + Math.random() * 4.2,
          u: -24 + Math.random() * 48,
          sp: 0.7 + Math.random() * 0.6,
        });
      }
      ((n = new r.LineSegments(
        f,
        new r.LineBasicMaterial({
          vertexColors: !0,
          transparent: !0,
          blending: r.AdditiveBlending,
          depthWrite: !1,
          toneMapped: !1,
        }),
      )),
        (n.frustumCulled = !1),
        (n.renderOrder = 8),
        (n.userData.seeds = u),
        t.group.add(n),
        (t.windLines = n));
    }
    n.visible = !0;
    var w = ee[e.i],
      y = t.carList[e.i],
      E = (-w.r * Math.PI) / 180,
      M = Math.sin(E),
      g = Math.cos(E),
      b = e.rig.fwdZ,
      k = y ? y.position.y : 0,
      L = n.geometry.attributes.position,
      x = n.geometry.attributes.color,
      P = n.userData.seeds,
      h = e.boosting ? 0.55 : 0.85,
      B = e.boosting ? 0.82 : 0.9,
      G = (3 + 7 * s) * (e.boosting ? 1.5 : 1);
    for (c = 0; c < l; c++) {
      var z = P[c],
        Q = Math.max(40, Math.abs(e.v)) * a * z.sp * (0.9 + 0.5 * s);
      if (((z.u -= Q), z.u < -24)) {
        z.u += 48;
        var J = Math.random() * 6.2832,
          q = 3.2 + Math.random() * 7.5;
        ((z.lx = Math.cos(J) * q), (z.ly = 0.6 + Math.random() * 4.2));
      }
      var O = z.u * b,
        F = (z.u + G * z.sp) * b;
      (L.setXYZ(c * 2, w.x + z.lx * g + O * M, k + z.ly, w.z - z.lx * M + O * g),
        L.setXYZ(c * 2 + 1, w.x + z.lx * g + F * M, k + z.ly, w.z - z.lx * M + F * g));
      var I = Math.min(1, s * 1.4);
      (x.setXYZ(c * 2, h * I, B * I, I), x.setXYZ(c * 2 + 1, 0, 0, 0));
    }
    ((L.needsUpdate = !0), (x.needsUpdate = !0));
  }
  function uo() {
    if (!(!t || !t.group)) {
      if (!ct) {
        we("Turn the cars on to play the race game", 2600);
        return;
      }
      if (!t.track) {
        we("The race track is not ready yet", 2e3);
        return;
      }
      fn();
      var e = !t.drive,
        a = t.sel >= 0 ? t.sel : 0;
      if (e && ee && ee[a] && ie) {
        var r = ee[a],
          n =
            Math.abs(r.x) < ie.wid / 2 - 2 &&
            Math.abs(r.z) < ie.len / 2 - 2 &&
            Math.abs(Math.cos((r.r * Math.PI) / 180)) > 0.9;
        if (!n) {
          var i = Rs(ie.len, ie.wid)[a];
          i &&
            !ee.some(function (o, s) {
              return s !== a && zs(o, i);
            }) &&
            ((ee[a] = { x: i.x, z: i.z, r: i.r }), zr(a));
        }
      }
      (t.drive || ts(a),
        t.drive &&
          ((t.raceOn = !0),
          t.host.classList.add("lc-racing"),
          zt !== "night" && ((t.raceNight = { prev: zt }), (zt = "night"), ya()),
          t.raceDusk && t.raceDusk(!0),
          Vo(!0),
          To(),
          !(e && g0()) &&
            (Dn(), we(""))));
    }
  }
  function sl() {
    if (t) {
      if (
        ((t.raceOn = !1),
        t.host && t.host.classList.remove("lc-racing"),
        t.race && (t.race.state = "off"),
        Zs(null),
        _s(null),
        merBoard(null),
        fo(),
        t.tvHold)
      ) {
        if (((t.tvHold = !1), t.tvVid && t.tvOn !== !1)) {
          var e = t.tvVid.play();
          e && e.catch && e.catch(function () {});
        }
        cr();
      }
      (Vo(!1),
        t.raceDusk && t.raceDusk(!1),
        t.raceNight && ((zt = t.raceNight.prev), (t.raceNight = null), ya()),
        t.drive && t.drive.intro && (t.drive.intro = null),
        t.cine && Fn(!1),
        t.rvis && t.rvis.userData.ghost && ((t.rvis.userData.ghost.visible = !1), merGhostTrail(t.rvis.userData.ghost, !1)),
        To());
    }
  }
  function k0(e, a, r) {
    var n = t.track;
    if (!(!n || !t.raceOn)) {
      var i = co(),
        o = performance.now(),
        s,
        l = 0,
        c = a.x - n.S[0],
        f = a.z - n.S[1],
        u = c * n.T[0] + f * n.T[1],
        p = -c * n.T[1] + f * n.T[0],
        v = (-a.r * Math.PI) / 180,
        w = e.rig.fwdZ,
        y = w * Math.sin(v) * n.T[0] + w * Math.cos(v) * n.T[1],
        E = Math.abs(e.v) * 0.6818,
        M = u0(n),
        g = i.best ? "HIGH SCORE " + Pn(i.best) : "NO HIGH SCORE YET",
        b =
          i.prevAl < 0 &&
          u >= 0 &&
          Math.abs(p) < n.w / 2 + 25 &&
          Math.abs(u) < 60 &&
          Math.abs(i.prevAl) < 60 &&
          y > -0.1,
        k = null,
        L;
      for (L = M.length - 1; L >= 0; L--)
        if (!i.best || i.best > M[L].t) {
          k = M[L];
          break;
        }
      var x = k ? "NEXT " + k.n + " " + Pn(k.t) : "ALL MEDALS WON",
        P = k ? k.c : "#ffcf3d",
        h = i.drift;
      if (i.state === "running") {
        if (e.slip > 0.14 && Math.abs(e.v) > 25 && !e.off)
          ((h.pend += e.slip * Math.abs(e.v) * r * 2.2),
            (h.t += r),
            (h.gap = 0),
            (h.mult = Math.min(5, 1 + Math.floor(h.t / 1.5))));
        else if (h.pend > 0 && ((h.gap += r), h.gap > 0.5)) {
          var B = Math.round(h.pend * h.mult);
          ((h.lap += B),
            (h.ftxt = "+" + B + " DRIFT"),
            (h.fUntil = o + 1500),
            (h.pend = 0),
            (h.t = 0),
            (h.mult = 1));
        }
        e.crashed &&
          h.pend > 0 &&
          ((h.pend = 0), (h.t = 0), (h.mult = 1), (h.ftxt = "DRIFT LOST"), (h.fUntil = o + 1500));
      }
      var G =
          h.pend > 0
            ? "DRIFT " + Math.round(h.pend) + "  x" + h.mult
            : o < h.fUntil
              ? h.ftxt
              : h.lap
                ? "DRIFT " + h.lap.toLocaleString()
                : "",
        z = {
          label: "",
          color: c0,
          time: "0:00.000",
          hit: 0,
          best: g,
          mph: E,
          gear: e.gear,
          boost: e.nitro,
          boosting: e.boosting,
          lights: null,
          medal: "",
          medalCol: P,
          drift: "",
          driftCol: G === "DRIFT LOST" ? ba : "#ffd24d",
        },
        Q = Ks(),
        J = null;
      if (i.state === "count") {
        i.cq = (i.cq || 0) + Math.min(r * 1000, 50);
        var q = i.cq - 700;
        (!i.jump && u - i.al0 > 1.5 && ((i.jump = !0), we("Jump start. 2 second penalty", 2500)),
          (z.lights =
            q < 0 ? [In, In, In] : q < 800 ? [ba, In, In] : q < 1600 ? [ba, ba, In] : [ba, ba, Qo]));
        var O = q < 0 ? 0 : q < 800 ? 3 : q < 1600 ? 2 : 1;
        (O && O !== i.cdS && $s(String(O), O === 1 ? Qo : ba),
          (i.cdS = O),
          (z.label = i.jump ? "JUMP START  +2.000" : "GET READY"),
          (z.color = i.jump ? ba : Qo),
          q >= 2400 &&
            ((i.state = "running"),
            (i.t0 = o),
            (i.pen = i.jump ? 2e3 : 0),
            (i.cp = n.cps.map(function () {
              return !1;
            })),
            (i.splits = []),
            (i.rec = []),
            (i.lastRec = -1e9),
            (i.passed = u >= 0),
            (i.go = o + 1e3),
            (i.dUntil = 0),
            (i.flash = null),
            (i.cdS = 0),
            $s("GO", cn)),
          Q && (Q.visible = !1));
      }
      if (i.state === "running") {
        var F = o - i.t0,
          I = F + i.pen;
        for (
          F - i.lastRec >= 100 &&
            ((i.lastRec = F),
            i.rec.push(Math.round(a.x * 10) / 10, Math.round(a.z * 10) / 10, Math.round(a.r))),
            s = 0;
          s < n.cps.length;
          s++
        ) {
          if (!i.cp[s]) {
            var N = a.x - n.cps[s][0],
              K = a.z - n.cps[s][1];
            if (
              N * N + K * K < Math.pow(n.w / 2 + 60, 2) &&
              ((i.cp[s] = !0), (i.splits[s] = I), i.bestSplits[s])
            ) {
              var ne = (I - i.bestSplits[s]) / 1e3;
              ((i.dTxt = (ne <= 0 ? "" : "+") + ne.toFixed(3)),
                (i.dCol = ne <= 0 ? cn : ba),
                (i.dUntil = o + 3500));
            }
          }
          i.cp[s] && l++;
        }
        if (b && !i.passed) i.passed = !0;
        else if (b && F > 8e3)
          if (l >= n.cps.length) {
            var T = i.best,
              ae = null,
              ue;
            for (L = 0; L < M.length; L++)
              if (I <= M[L].t) {
                ae = M[L];
                break;
              }
            (h.pend > 0 && ((h.lap += Math.round(h.pend * h.mult)), (h.pend = 0), (h.t = 0), (h.mult = 1)),
              !T || I < T
                ? ((i.best = I),
                  (i.bestSplits = i.splits.slice()),
                  (i.ghost = i.rec.slice()),
                  (ue = T ? "NEW HIGH SCORE  -" + ((T - I) / 1e3).toFixed(3) : "FIRST HIGH SCORE"))
                : (ue = "LAP +" + ((I - T) / 1e3).toFixed(3) + " OFF THE BEST"),
              h.lap > i.bestDrift && (i.bestDrift = h.lap),
              d0(i),
              (i.flash = {
                txt: ue,
                col: cn,
                until: o + 5e3,
                time: I,
                medal: "",
                drift: h.lap,
              }),
              we(
                "Lap " + Pn(I),
                3500,
              ),
              (i.t0 = o),
              (i.pen = 0),
              (i.passed = !0),
              (i.cp = n.cps.map(function () {
                return !1;
              })),
              (i.splits = []),
              (i.rec = []),
              (i.lastRec = -1e9),
              (h.lap = 0),
              (F = 0),
              (I = 0),
              (l = 0));
          } else we("Lap not counted. Drive the whole track without cutting across.", 3e3);
        if (Q && i.ghost && i.ghost.length >= 6) {
          var me = F / 100,
            Ge = Math.floor(me),
            xe = i.ghost.length / 3;
          if (Ge < xe - 1) {
            var ft = me - Ge,
              ze = Ge * 3,
              ut = ze + 3,
              We = i.ghost[ze + 2],
              Be = i.ghost[ut + 2],
              Ne = ((Be - We + 540) % 360) - 180,
              Wt = i.ghost[ze] + (i.ghost[ut] - i.ghost[ze]) * ft,
              Et = i.ghost[ze + 1] + (i.ghost[ut + 1] - i.ghost[ze + 1]) * ft;
            (Q.position.set(Wt, 0, Et),
              Q.rotation.set(0, (-(We + Ne * ft) * Math.PI) / 180, 0),
              (Q.visible = !0),
              merGhostTick(Q),
              (J = [Wt, Et]));
          } else ((Q.visible = !1), merGhostTrail(Q, !1));
        }
        var Ot = i.flash && o < i.flash.until ? i.flash : null,
          ia = o < i.dUntil && i.dTxt;
        ((z.time = Ot && o < Ot.until - 2500 ? Pn(Ot.time) : Pn(I)),
          (z.hit = l),
          o < i.go
            ? ((z.label = "GO"), (z.color = cn), (z.lights = [cn, cn, cn]))
            : Ot
              ? ((z.label = Ot.medal + "  " + Ot.txt),
                (z.color = Ot.col),
                Ot.drift && !G && (z.drift = "LAP DRIFT " + Ot.drift.toLocaleString()))
              : e.off
                ? ((z.label = "OFF TRACK"), (z.color = ba))
                : ia
                  ? ((z.label = "VS HIGH SCORE  " + i.dTxt), (z.color = i.dCol))
                  : ((z.label = ""), (z.color = ba)),
          F > 9e5 && Dn());
      }
      ((i.prevAl = u), (e.lapTxt = z.time), Zs(z), _s(a, J));
    }
  }
  function ts(e) {
    if (!t || !t.group || !ct) {
      t && we("Turn the cars on to drive one", 2200);
      return;
    }
    (t.host.classList.contains("lc-open") || po(), fn());
    var a = t.carList && t.carList[e];
    if (!(!a || !ee[e])) {
      (t.drive && or(!0), t.walk && bi(!1));
      var r = r0(a);
      (s0(a, r.fwdZ), (Pt = {}));
      var n = _o(a, ee[e], r);
      t.drive = {
        su: { y: n.y, th: n.th, ph: n.ph, vy: 0, vth: 0, vph: 0 },
        pv: 0,
        i: e,
        v: 0,
        steer: 0,
        rig: r,
        last: performance.now(),
        cang: 0,
        raf: 0,
        cam: { yaw: 0, pitch: 0.2, dist: 19 },
        home: { x: ee[e].x, z: ee[e].z, r: ee[e].r },
      };
      var i = ee[e],
        o = (-i.r * Math.PI) / 180;
      ((t.drive.cang = Math.atan2(r.fwdZ * Math.sin(o), r.fwdZ * Math.cos(o))),
        (t.sel = -1),
        (t.walk = !0),
        t.host.classList.add("lc-walking", "lc-driving"),
        (qa = { gas: !1, brk: !1, steer: 0, hb: !1, boost: !1 }),
        (sr = []),
        t.host.classList.toggle("lc-touchui", qn()),
        qn() &&
          t.host.clientHeight > t.host.clientWidth &&
          setTimeout(function () {
            we("Turn your phone sideways for the best view", 3500);
          }, 5400),
        (t.camera.fov = 55),
        (t.camera.near = 0.3),
        t.camera.updateProjectionMatrix(),
        To(),
        we(
          "Driving. W S gas and reverse, A D steer, Space brake. Drag to look around and scroll to zoom. Esc stops.",
          5200,
        ),
        ya(!0),
        zn(),
        Wa(),
        Nn(),
        It(),
        (t.drive.raf = requestAnimationFrame(as)));
    }
  }
  function or(e) {
    var a = t && t.drive;
    a &&
      (cancelAnimationFrame(a.raf),
      (t.drive = null),
      (Pt = {}),
      zn(),
      Ts(null),
      il(),
      ol(null, 0),
      (qa = { gas: !1, brk: !1, steer: 0, hb: !1, boost: !1 }),
      t.tcReset && t.tcReset(),
      sl(),
      $o(null, !1),
      a.rig.wheels.forEach(function (r) {
        r.steer.rotation.y = 0;
      }),
      t.host.classList.remove("lc-driving"),
      merHomeCar(a),
      e
        ? ((t.walk = !1),
          t.host.classList.remove("lc-walking"),
          (t.camera.fov = 32),
          (t.camera.near = 0.5),
          t.camera.updateProjectionMatrix())
        : merReturnToWalk(a));
  }
  var na = { gas: 0, brk: 0, steer: 0, hb: !1, boost: !1 },
    qa = { gas: !1, brk: !1, steer: 0, hb: !1, boost: !1 },
    sr = [];
  function ho() {
    var e = navigator.getGamepads ? navigator.getGamepads() : [],
      a;
    for (a = 0; a < (e ? e.length : 0); a++)
      if (e[a] && e[a].connected && e[a].buttons && e[a].buttons.length) return e[a];
    return null;
  }
  function C0() {
    na = { gas: 0, brk: 0, steer: 0, hb: !1, boost: !1 };
    var e = ho();
    if (((t.gp = e), !e)) {
      sr = [];
      return;
    }
    var a = function (s) {
        var l = e.buttons[s];
        return l ? (l.value > 0.02 ? l.value : l.pressed ? 1 : 0) : 0;
      },
      r = function (s) {
        var l = e.buttons[s];
        return !!(l && l.pressed);
      },
      n = e.axes && e.axes.length ? e.axes[0] : 0,
      i = 0.12;
    ((n = Math.abs(n) < i ? 0 : (n - Math.sign(n) * i) / (1 - i)),
      (na.steer = -Math.sign(n) * Math.pow(Math.min(1, Math.abs(n)), 1.5)),
      r(14) ? (na.steer = 1) : r(15) && (na.steer = -1),
      (na.gas = a(7)),
      (na.brk = a(6)),
      (na.hb = r(0) || r(1)),
      (na.boost = e.mapping === "standard" && e.buttons.length >= 16 && e.axes.length >= 4 && (r(2) || r(5))));
    var o = e.buttons.map(function (s) {
      return !!(s && s.pressed);
    });
    if (t.drive && t.drive.intro) {
      sr = o;
      return;
    }
    if (sr.length && (o[3] && !sr[3] && ss(), o[9] && !sr[9] && t.raceOn && Dn(), o[8] && !sr[8])) {
      ((sr = o), or());
      return;
    }
    sr = o;
  }
  function A0(e) {
    var a = t && t.gp,
      r = a && a.vibrationActuator;
    if (!(!r || !r.playEffect))
      try {
        var n = r.playEffect("dual-rumble", {
          duration: 160,
          strongMagnitude: Math.min(1, e),
          weakMagnitude: Math.min(1, e * 0.7),
        });
        n && n.catch && n.catch(function () {});
      } catch {}
  }
  function ll() {
    if (!(!t || t.padRaf)) {
      var e = !0,
        a = function () {
          var r = ho();
          if (!r || !t) {
            t && (t.padRaf = 0);
            return;
          }
          var n = !!(r.buttons[9] && r.buttons[9].pressed);
          ((e = n), (t.padRaf = requestAnimationFrame(a)));
        };
      t.padRaf = requestAnimationFrame(a);
    }
  }
  function qn() {
    try {
      return (
        window.matchMedia("(pointer: coarse)").matches ||
        (navigator.maxTouchPoints > 0 && !window.matchMedia("(hover: hover)").matches)
      );
    } catch {
      return !1;
    }
  }
  function E0(e) {
    var a = t.drive,
      r = ee[a.i],
      n = t.carList[a.i],
      i = a.rig,
      o = i.fwdZ,
      s = Math.max(Pt.w ? 1 : 0, na.gas, qa.gas ? 1 : 0),
      l = Math.max(Pt.s ? 1 : 0, na.brk, qa.brk ? 1 : 0),
      c = s - l;
    Math.abs(c) < 0.05 && (c = 0);
    var f = !1,
      u = !!((Pt.boost && performance.now() - (merBoostOk.t || 0) < 2500) || na.boost || qa.boost);
    ((a.thrIn = c), a.nitro === void 0 && (a.nitro = 1));
    var p = !!(u && a.nitro > 0.02 && a.v > 2 && c >= 0);
    ((a.nitro = Math.max(0, Math.min(1, a.nitro + (p ? -0.36 : 0.11) * e))), (a.boosting = p));
    var v = 261;
    c > 0
      ? (a.v += (a.v < 0 ? 40 : 7 + 25 * Math.max(0, 1 - a.v / v)) * c * e)
      : c < 0
        ? (a.v -= (a.v > 0 ? 90 : 12) * -c * e)
        : (a.v -= Math.sign(a.v) * Math.min(Math.abs(a.v), (3 + Math.abs(a.v) * 0.1) * e));
    var w = !!(f && a.v > 15 && Math.abs(a.steer) > 0.04),
      y = !w && c < 0 && a.v > 25 && Math.abs(a.steer) > 0.04,
      E = w ? 1.3 : y ? 1.25 : 1;
    (f && (a.v -= Math.sign(a.v) * Math.min(Math.abs(a.v), (w ? 26 : 120) * e)),
      p && (a.v += 95 * Math.max(0.25, 1 - a.v / 300) * e),
      (a.v = Math.max(-14, a.v)),
      a.v > v && (a.v = v),
      (a.off = !1),
      t.raceOn &&
        t.track &&
        ((a.off = t.track.sd(r.x, r.z) > t.track.w / 2 + 1.5),
        a.off && a.v > 58 && (a.v -= ((a.v - 58) * 1.8 + 12) * e)),
      (a.brake = !!(f || (l > 0.3 && a.v > 0.5))));
    var M = Math.min(1, Math.abs(a.v) / 205),
      g = 0.64 - 0.5 * Math.pow(M, 0.35),
      b = Math.max(-1, Math.min(1, (Pt.a ? 1 : 0) - (Pt.d ? 1 : 0) + na.steer + qa.steer)) * g;
    a.steer += (b - a.steer) * Math.min(1, (5.2 - 1.8 * M) * e);
    var k = (-r.r * Math.PI) / 180,
      L = wt * 0.85,
      x = Math.min(2.1, 155 / Math.max(Math.abs(a.v), 1)) * E,
      P = Math.max(-x, Math.min(x, (a.v / L) * Math.tan(a.steer) * 0.8 * (E > 1 ? 1.15 : 1))),
      h = (a.yaw = (a.yaw || 0) + (P - (a.yaw || 0)) * Math.min(1, (E > 1 ? 12 : 7) * e)) * e,
      B = k,
      G = k,
      z = 6 + Math.abs(a.v) * 0.35;
    (!ra &&
      rs(r.x + o * Math.sin(k) * z, r.z + o * Math.cos(k) * z, r.r) &&
      (ln(!0), t.raceOn || we("Opening the door so you can drive out", 2200)),
      a.phi === void 0 && (a.phi = k));
    var Q = a.v < 0 ? 40 : w ? 1.6 : y ? 3 : c > 0 && a.v > 40 && Math.abs(a.steer) > 0.12 ? 9 : 40;
    wi(r.x, r.z, k, a.i) || o0(r, k, a.i);
    var J = Math.max(1, Math.ceil((Math.abs(a.v) * e) / 2)),
      q,
      O = !1,
      F = !1;
    for (q = 0; q < J; q++) {
      ((B = k + h / J), (G = k + h / (2 * J)));
      var I = Math.atan2(Math.sin(B - a.phi), Math.cos(B - a.phi));
      a.phi += I * Math.min(1, (Q * e) / J);
      var N = Math.atan2(Math.sin(B - a.phi), Math.cos(B - a.phi));
      Math.abs(N) > 0.75 && (a.phi = B - Math.sign(N) * 0.75);
      var K = r.x + (o * Math.sin(a.phi) * a.v * e) / J,
        ne = r.z + (o * Math.cos(a.phi) * a.v * e) / J;
      if (wi(K, ne, B, a.i)) ((r.x = K), (r.z = ne), (r.r = (-B * 180) / Math.PI), (k = B));
      else if (wi(K, r.z, B, a.i)) ((r.x = K), (r.r = (-B * 180) / Math.PI), (k = B), (F = !0));
      else if (wi(r.x, ne, B, a.i)) ((r.z = ne), (r.r = (-B * 180) / Math.PI), (k = B), (F = !0));
      else if (wi(r.x, r.z, B, a.i)) ((r.r = (-B * 180) / Math.PI), (k = B), (F = !0));
      else {
        O = !0;
        break;
      }
      (t.raceOn || t.railGrid) && n0(r, a, e / J);
      t.raceOn && merRearWall(r, a);
    }
    if (
      (F && (a.v *= Math.max(0, 1 - 2.2 * e)),
      O && Math.abs(a.v) > 12 && A0(Math.abs(a.v) / 90),
      O)
    )
      (Math.abs(a.v) > 0.5 ? (a.v = -a.v * 0.12) : (a.v = 0), (a.phi = k));
    else {
      var T = Math.abs(Math.atan2(Math.sin(k - a.phi), Math.cos(k - a.phi)));
      T > 0.05 && (a.v -= a.v * 0.55 * T * e);
    }
    if (
      ((a.slip = O ? 0 : T || 0),
      (a.crashed = O),
      zr(a.i),
      v0(a, e),
      (a.dchk = (a.dchk || 0) - e),
      a.dchk <= 0 && ie)
    ) {
      a.dchk = 0.3;
      var ae = ir(ie.wid, ie.len, ie.cars),
        ue = 1e9,
        me,
        Ge,
        xe;
      for (me = 0; me < ae.length; me++)
        ((Ge = r.x - ae[me].c), (xe = r.z - ie.len / 2), (ue = Math.min(ue, Math.sqrt(Ge * Ge + xe * xe))));
      if (ue < 30 && !ra) (ln(!0), t.raceOn || we("Garage doors opening", 1600));
      else if (ue > 46 && ra) {
        var ft = !1,
          ze;
        for (ze = 0; ze < ee.length; ze++) rs(ee[ze].x, ee[ze].z, ee[ze].r) && (ft = !0);
        ft || (ln(!1), t.raceOn || we("Garage doors closing", 1600));
      }
    }
    (k0(a, r, e),
      Ys(a, r, n, i, e, (a.v - a.pv) / Math.max(e, 0.001)),
      (a.pv = a.v),
      i.wheels.forEach(function (Ne) {
        ((Ne.spin.rotation.x += (a.v * o * e) / Ne.R), Ne.front && (Ne.steer.rotation.y = a.steer));
      }));
    var ut = (-r.r * Math.PI) / 180,
      We = Math.atan2(o * Math.sin(ut), o * Math.cos(ut)),
      Be = We - a.cang;
    ((Be = Math.atan2(Math.sin(Be), Math.cos(Be))), (a.cang += Be * Math.min(1, 3.2 * e)));
  }
  function as(e) {
    var a = t && t.drive;
    if (a) {
      var r = Math.min(0.05, Math.max(0.001, (e - a.last) / 1e3));
      if (((a.last = e), !Rr || !t.host.classList.contains("lc-open"))) {
        or();
        return;
      }
      if ((C0(), !!t.drive)) {
        if (a.intro) {
          if ((x0(r), !t.drive)) return;
          ($o(a, !0), nl(a), a.intro || It(), zn(), ye(), (a.raf = requestAnimationFrame(as)));
          return;
        }
        (E0(r), $o(a, !0), Ts(a), nl(a), ol(a, r), It(), zn(), ye(), (a.raf = requestAnimationFrame(as)));
      }
    }
  }
  function bi(e) {
    if (!(!t || !t.group) && ((e = !!e), e !== !!t.walk)) {
      var a = t.host;
      ((t.walk = e),
        a.classList.toggle("lc-walking", e),
        e
          ? (Hs(),
            (t.camera.fov = 72),
            (t.camera.near = 0.2),
            (t.sel = -1),
            (t.ring.visible = !1),
            we(""),
            a0())
          : ((t.camera.fov = 32),
            (t.camera.near = 0.5),
            (At = {}),
            cancelAnimationFrame(t.wraf),
            (t.wraf = 0),
            Gr(),
            t.joy && ((t.joy.x = 0), (t.joy.y = 0)),
            xi(!1),
            we("")),
        t.camera.updateProjectionMatrix(),
        ya(!0),
        Wa(),
        Nn());
    }
  }
  function cl() {
    if (!(!t || !t.pl || !t.lamps || !t.lamps.length || !ie)) {
      var e = t.lamps,
        a = {},
        r = [],
        n = ct ? Wn() : [],
        i,
        o,
        s = t.pl.length,
        l = ie,
        c = (l.isOver ? 8.1 : 8) + (Math.max(9, Math.min(25, parseFloat(V("ht").value) || 9)) - 9);
      if (Fe === "one") {
        var f = e[t.oneIdx];
        (t.pl.forEach(function (u, p) {
          u.intensity = 0;
        }),
          f &&
            (t.pl[0].position.set(f.x, c, f.z),
            t.pl[0].target.position.set(f.x, 0, f.z),
            (t.pl[0].intensity = 22 * (t.plK || 0))));
        return;
      }
      if (n.length)
        for (i = 0; i < Math.min(s, n.length); i++)
          r.push(n[Math.floor((i * n.length) / Math.min(s, n.length))]);
      else
        for (i = 0; i < s; i++)
          r.push({
            x: (((i % 3) + 0.5) / 3 - 0.5) * l.wid,
            z: ((Math.floor(i / 3) + 0.5) / 2 - 0.5) * l.len,
          });
      t.pl.forEach(function (u, p) {
        var v = r[p],
          w = -1,
          y = 1e9,
          E,
          M,
          g;
        if (!v) {
          u.intensity = 0;
          return;
        }
        for (o = 0; o < e.length; o++)
          a[o] || ((E = e[o].x - v.x), (M = e[o].z - v.z), (g = E * E + M * M), g < y && ((y = g), (w = o)));
        if (w < 0) {
          u.intensity = 0;
          return;
        }
        ((a[w] = 1),
          u.position.set(e[w].x, c, e[w].z),
          u.target.position.set(e[w].x, 0, e[w].z),
          (u.intensity = 22 * (t.plK || 0)));
      });
    }
  }
  function ya(e) {
    if (!(!t || !t.lamps || !ie)) {
      var a = ie,
        r = t.lamps.length;
      if (
        (t.lamps.forEach(function (q, O) {
          var F = Fe === "all" || (Fe === "one" && O === t.oneIdx);
          (q.lit.forEach(function (I) {
            I.material = F ? t.bulbM : t.offM;
          }),
            q.glows.forEach(function (I) {
              I.visible = F && !t.walk;
            }),
            q.bloom && (q.bloom.visible = F));
        }),
        (t.fAll.visible = Fe === "all"),
        (t.fOne.visible = Fe === "one"),
        Fe === "one" && t.lamps[t.oneIdx])
      ) {
        var n = t.lamps[t.oneIdx],
          i = a.wid / 2,
          o = a.len / 2,
          s = Math.max(n.x - 11, -i),
          l = Math.min(n.x + 11, i),
          c = Math.max(n.z - 11, -o),
          f = Math.min(n.z + 11, o);
        (t.fOne.scale.set(Math.max(l - s, 1), Math.max(f - c, 1), 1),
          t.fOne.position.set((s + l) / 2, 0.06, (c + f) / 2));
      }
      var u = !a.isOver && Fe !== "off",
        p = u ? on / 100 : 1,
        v = Math.pow(p, 0.8),
        w = t.dim;
      ((w.hidden = !u),
        (w.querySelector("input").value = String(on)),
        (w.querySelector("output").textContent = on + "%"));
      var y = zt === "night",
        E = y ? 1.25 : 1,
        M = y
          ? Fe === "all"
            ? [1.25, 0.3]
            : Fe === "one"
              ? [0.45, 0.12]
              : [0.14, 0.05]
          : Fe === "all"
            ? [1.9, 0.95]
            : Fe === "one"
              ? [1.65, 0.8]
              : [1.4, 0.7],
        g = y ? [0.14, 0.05] : [1.4, 0.7];
      (t.envTone && t.envTone(y),
        t.trackLamps && t.trackLamps.set(y),
        t.glassM && t.glassM.color.set(y ? 7308976 : 13625087),
        t.host.classList.toggle("lc-night", y),
        zn(),
        (t.carList || []).forEach(function (q) {
          q.visible = ct;
        }),
        (t.carShadows || []).forEach(function (q) {
          q.visible = ct;
        }),
        lr(),
        (t.hemi.intensity = g[0] + (M[0] - g[0]) * v),
        (t.sun.intensity = g[1] + (M[1] - g[1]) * v),
        t.cineHigh && ((t.hemi.intensity = 0.7), (t.sun.intensity = 0.45)));
      var b = y ? [1.25, 0.3] : [1.9, 0.95],
        k = Math.max(0, ((b[0] - t.hemi.intensity) * 0.28 + (b[1] - t.sun.intensity) * 0.14) / Math.PI);
      (t.extMats || []).concat(t.yardExt || []).forEach(function (q) {
        q.emissiveIntensity = k + ((q.userData && q.userData.minE) || 0);
      });
      var L = (Fe === "all" ? 1 : Fe === "one" ? 0.4 : 0) * v * (y ? 1.25 : 1);
      if (
        ((t.intMats || []).forEach(function (q) {
          q.m.emissiveIntensity = q.k * L;
        }),
        (t.nightLit = y ? Math.min(1.25, L) : 0),
        t.spillM && (t.spillM.opacity = Math.min(0.75, 0.62 * t.nightLit)),
        t.spillDoorM && (t.spillDoorM.opacity = Math.min(0.85, 0.8 * t.nightLit) * (t.doorT || 0)),
        t.glassM &&
          ((t.glassM.opacity = 0.2 + 0.22 * t.nightLit),
          t.glassM.emissive.set(t.luxOn ? 0x101828 : 16767392),
          (t.glassM.emissiveIntensity = (t.luxOn ? 0.05 : 0.55) * t.nightLit),
          y && t.nightLit > 0.05 && t.glassM.color.set(t.luxOn ? 0x3a4a66 : 16771528)),
        t.rayM)
      ) {
        var x = y ? 0.12 : 0.4,
          P = Fe === "one" ? (y ? 0.05 : 0.18) : 0;
        ((t.rayM.opacity = Fe === "off" ? x : x + (P - x) * v),
          t.rayM.color.set(y ? 10467583 : 16773577),
          t.dustM &&
            ((t.dustM.opacity = Math.min(1, t.rayM.opacity * 2.4)),
            t.dustM.color.set(y ? 13622527 : 16774358)));
      }
      (t.bloomM && ((t.bloomM.opacity = 0.2 * v * E), t.bloomM.color.set(y ? 14674175 : 16774358)),
        t.shadowM &&
          (t.shadowM.opacity =
            (y
              ? Fe === "all"
                ? 0.8
                : Fe === "one"
                  ? 0.5
                  : 0.05
              : Fe === "all"
                ? 0.8
                : Fe === "one"
                  ? 0.65
                  : 0.5) * (Fe === "off" ? 1 : v)),
        t.glowM && (t.glowM.opacity = (Fe === "all" ? 0.42 : 0.32) * v * E),
        (t.washM.opacity = 0.17 * v * E),
        (t.plK = Fe === "off" ? 0 : (y ? 1.5 : 1.8) * v * (Fe === "one" ? 1.15 : 1)),
        cl(),
        (t.oneM.opacity = 0.5 * v * E),
        t.bulbM.color.set(5857647).lerp(new fe.Color(t.c3), v),
        t.sw.setAttribute("data-mode", Fe === "all" && p < 1 ? "dim" : Fe),
        t.sw.querySelectorAll("[data-lm]").forEach(function (q) {
          q.setAttribute("aria-pressed", q.getAttribute("data-lm") === Fe ? "true" : "false");
        }));
      var h = parseFloat(V("ht").value),
        B = a.plan.qty > 0 ? a.plan.lumens / a.plan.qty : 0,
        G,
        z = p < 1 ? " at " + on + "%" : "";
      (Fe === "off"
        ? (G = "Lights off")
        : Fe === "one"
          ? (G =
              '1 light<span class="lc-n-x">' +
              z +
              ": about " +
              Math.max(1, Math.round(p * En(a.len, a.wid, h, ce.workPlane, B, 1, ce.llf))) +
              " foot candles</span>")
          : (G =
              "All " +
              a.plan.qty +
              ' lights<span class="lc-n-x">' +
              z +
              ": about " +
              Math.max(1, Math.round(p * En(a.len, a.wid, h, ce.workPlane, a.plan.lumens, 1, ce.llf))) +
              " foot candles</span>"),
        t.sw.setAttribute("data-dim", u ? "1" : "0"),
        (t.sw.querySelector(".lc-lsw-note").innerHTML = G));
      var Q = t.sw.querySelector(".lc-lsw-help");
      ((Q.textContent = (ce.lightsHelp || "") + (!a.isOver && ce.dimHelp ? " " + ce.dimHelp : "")),
        (Q.hidden = !Q.textContent));
      var J =
        Fe === "one"
          ? p * En(a.len, a.wid, h, ce.workPlane, B, 1, ce.llf)
          : p * En(a.len, a.wid, h, ce.workPlane, a.plan.lumens, 1, ce.llf);
      ((w.querySelector(".lc-dim-fc b").textContent = String(Math.max(1, Math.round(J)))),
        Wa(),
        Xo(),
        e || ye());
    }
  }
  function Wa() {
    var e = t.sw,
      a = Oo(ce.fixtures[an]);
    function r(c, f) {
      e.querySelectorAll(c).forEach(function (u) {
        u.setAttribute("aria-pressed", f(u) ? "true" : "false");
      });
    }
    (r("[data-cars]", function (c) {
      return (c.getAttribute("data-cars") === "1") === ct;
    }),
      r("[data-time]", function (c) {
        return c.getAttribute("data-time") === zt;
      }),
      r("[data-view]", function (c) {
        return (c.getAttribute("data-view") === "1") == !!t.walk;
      }),
      r("[data-snd]", function (c) {
        return (c.getAttribute("data-snd") === "1") == !!t.sound;
      }),
      r("[data-door]", function (c) {
        return (c.getAttribute("data-door") === "1") === ra;
      }),
      r("[data-tv]", function (c) {
        return (c.getAttribute("data-tv") === "1") == (t.tvOn !== !1);
      }),
      (e.querySelector(".lc-sz-read").textContent =
        parseFloat(V("wid").value) +
        "\xD7" +
        parseFloat(V("len").value) +
        "\xD7" +
        parseFloat(V("ht").value) +
        " ft"),
      e.querySelectorAll('[data-ca="l"], [data-ca="r"]').forEach(function (c) {
        c.disabled = t.sel < 0 || !ct;
      }));
    var n = Wn().length;
    ((e.querySelector(".lc-car-count").textContent = ct ? n + (n === 1 ? " car" : " cars") : "hidden"),
      t.howto &&
        (t.howto.querySelector('[data-h="turn"]').classList.toggle("lc-dimmed", !(t.sel >= 0 && ct)),
        t.howto.querySelector('[data-h="turn"]').classList.toggle("lc-hot", t.sel >= 0 && ct),
        t.howto.querySelector('[data-h="move"]').classList.toggle("lc-dimmed", !ct)),
      r("[data-sz]", function (c) {
        return c.getAttribute("data-sz") === parseFloat(V("len").value) + "x" + parseFloat(V("wid").value);
      }),
      r("[data-t]", function (c) {
        return parseInt(c.getAttribute("data-t"), 10) === an;
      }));
    var i = e.querySelector('[data-sec="k"]'),
      o = nn(a);
    if (((i.hidden = !o), o)) {
      let c = function (f, u) {
        var p = String(f || "").match(/\d{3,5}\s*K/i);
        return p ? p[0].replace(/\s+/g, "").toUpperCase() : f || u;
      };
      var l = c,
        s = i.querySelectorAll("[data-k]");
      ((s[0].textContent = c(a.k2.mainLabel, "Standard")),
        (s[1].textContent = c(a.k2.label, "Warm")),
        r("[data-k]", function (f) {
          return (f.getAttribute("data-k") === "1") == (Br === 1);
        }));
    }
  }
  function fn() {
    ee || (ee = ao(Gs(ie.len, ie.wid)));
  }
  function Wn() {
    return ee || (ie && ie.spots) || [];
  }
  function lr() {
    if (!(!t || !t.ring)) {
      var e = Wn()[t.sel];
      ((t.ring.visible = !!e && t.sel >= 0 && ct && !t.walk),
        e && (t.ring.position.set(e.x, 0, e.z), (t.ring.rotation.y = (-e.r * Math.PI) / 180)));
    }
  }
  function zr(e) {
    var a = Wn()[e],
      r = t && t.carList && t.carList[e],
      n = t && t.carShadows && t.carShadows[e];
    if (!(!a || !r)) {
      (r.position.set(a.x, 0, a.z), (r.rotation.y = (-a.r * Math.PI) / 180));
      var i = r.userData.rig;
      if (i && i.wheels && i.wheels.length && !(t.drive && t.drive.i === e)) {
        var o = _o(r, a, i);
        js(r, { y: o.y, th: o.th, ph: o.ph }, o, i);
      } else
        t.drive &&
          t.drive.i === e &&
          t.drive.su &&
          ((r.rotation.order = "YXZ"),
          (r.position.y = t.drive.su.y),
          (r.rotation.x = t.drive.su.th),
          (r.rotation.z = t.drive.su.ph));
      n &&
        ((n.rotation.order = "YXZ"),
        n.rotation.set(-Math.PI / 2, (-a.r * Math.PI) / 180, 0),
        n.position.set(a.x, 0.045, a.z));
    }
  }
  function fl(e, a) {
    var r = Wn(),
      n = -1,
      i = 1e9,
      o,
      s,
      l,
      c,
      f,
      u,
      p;
    for (o = 0; o < r.length; o++)
      ((s = (-r[o].r * Math.PI) / 180),
        (l = e - r[o].x),
        (c = a - r[o].z),
        (f = l * Math.cos(s) - c * Math.sin(s)),
        (u = l * Math.sin(s) + c * Math.cos(s)),
        Math.abs(f) < 3.4 && Math.abs(u) < 7.2 && ((p = l * l + c * c), p < i && ((i = p), (n = o))));
    return n;
  }
  function rs(e, a, r) {
    if (!ie) return !1;
    var n = to(ie.wid, ie.len, r),
      i = (r * Math.PI) / 180,
      o = Math.abs(Math.cos(i)) * Fa + Math.abs(Math.sin(i)) * wt,
      s = ir(ie.wid, ie.len, ie.cars),
      l;
    if (a < n.zMax - 1.2) return !1;
    for (l = 0; l < s.length; l++) if (Math.abs(e - s[l].c) <= s[l].w / 2 - o - 0.25) return !0;
    return !1;
  }
  function B0(e, a, r) {
    !ra && rs(a, r, ee[e].r) && (ln(!0), we("Opening the door so the car can drive out", 2200));
    var n = ee[e],
      i = Lr(ee, e, n),
      o = [
        [a, r],
        [a, n.z],
        [n.x, r],
      ],
      s,
      l;
    for (s = 0; s < 3; s++)
      if (((l = Mi({ x: o[s][0], z: o[s][1], r: n.r }, ie.wid, ie.len)), Lr(ee, e, l) <= i)) {
        ((n.x = l.x), (n.z = l.z));
        break;
      }
    (zr(e), lr(), ye());
  }
  function yi() {
    ((ee = ao(ee)), (eo = !0), Mt(), (eo = !1), Wa());
  }
  function L0() {
    if ((fn(), ee.length >= 20)) {
      we("That is the most cars we can show", 3e3);
      return;
    }
    var e = Pl(ee, ie.wid, ie.len);
    if (e) ee.push(e);
    else {
      var a = Ps(ee.length + 1, ie.wid, ie.len);
      if (!a) {
        we("The garage is full. Make it bigger to fit more cars.", 3500);
        return;
      }
      ee = a;
    }
    ((t.sel = ee.length - 1), (ee = ao(ee)), Mt());
  }
  function R0() {
    (fn(), !(ee.length <= 1) && (ee.splice(t.sel >= 0 ? t.sel : ee.length - 1, 1), (t.sel = -1), Mt()));
  }
  function G0() {
    fn();
    var e = Ps(ee.length, ie.wid, ie.len);
    if (!e) {
      we("These cars need more room to line up", 3e3);
      return;
    }
    ((ee = ao(e)), (t.sel = -1), Mt());
  }
  function z0(e) {
    if (!(!ee || t.sel < 0 || !ee[t.sel])) {
      var a = ee[t.sel],
        r = Mi({ x: a.x, z: a.z, r: (a.r + e * 45 + 360) % 360 }, ie.wid, ie.len);
      if (Lr(ee, t.sel, r) > Lr(ee, t.sel, a)) {
        we("No room to turn here. Move the car or its neighbors first.", 2800);
        return;
      }
      ((a.x = r.x), (a.z = r.z), (a.r = r.r), zr(t.sel), lr(), ye(), yi());
    }
  }
  function we(e, a) {
    !t ||
      !t.tip ||
      (clearTimeout(t.tipT),
      e &&
        a &&
        (t.tipT = setTimeout(function () {
          we("");
        }, a)),
      (t.tip.textContent = e || ""),
      t.tip.classList.toggle("lc-show", !!e && t.host.classList.contains("lc-open")));
  }
  function ns(e, a, r) {
    var n = Math.max(9, r);
    t.hpos = {
      w: new fe.Vector3(e / 2 + 1.4, 0.9, 0),
      l: new fe.Vector3(0, 0.9, a / 2 + 1.4),
      h: new fe.Vector3(e / 2 + 0.6, n + 0.4, a / 2 + 0.6),
    };
  }
  function ul(e) {
    e && we(e.w + " \xD7 " + e.l + " ft, " + e.h + " ft ceiling");
  }
  function P0(e) {
    var a = fe,
      r = Math.max(9, e.h);
    (t.preview.geometry.dispose(),
      (t.preview.geometry = new a.EdgesGeometry(new a.BoxGeometry(e.w, r, e.l))),
      t.preview.position.set(0, r / 2, 0),
      (t.preview.visible = !0),
      ns(e.w, e.l, e.h),
      ul(e),
      ye());
  }
  function ca(e) {
    var a = e >>> 0;
    return function () {
      return ((a = (a * 1664525 + 1013904223) >>> 0), a / 4294967296);
    };
  }
  /* Adds a little noise to the sky so the 8 bit gradient does not show bands. */
  function is(e, a) {
    var cv = is_raw(e, a),
      cx = cv.getContext("2d"),
      im = cx.getImageData(0, 0, cv.width, cv.height),
      d = im.data,
      k,
      seed = 12345;
    for (k = 0; k < d.length; k += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      var nz = ((seed >>> 24) / 255 - 0.5) * 3.2;
      ((d[k] = Math.max(0, Math.min(255, d[k] + nz))),
        (d[k + 1] = Math.max(0, Math.min(255, d[k + 1] + nz))),
        (d[k + 2] = Math.max(0, Math.min(255, d[k + 2] + nz))));
    }
    return (cx.putImageData(im, 0, 0), cv);
  }
  function is_raw(e, a) {
    var r = 1024,
      n = 1024,
      i = document.createElement("canvas"),
      o,
      s,
      l,
      c = ca(e ? 7 : 11),
      f,
      u,
      p;
    if (
      ((i.width = r),
      (i.height = n),
      (o = i.getContext("2d")),
      (s = o.createLinearGradient(0, 0, 0, n)),
      a
        ? (s.addColorStop(0, "#0d1840"),
          s.addColorStop(0.16, "#17275c"),
          s.addColorStop(0.3, "#26397a"),
          s.addColorStop(0.4, "#3c4f8f"),
          s.addColorStop(0.455, "#6a5a9a"),
          s.addColorStop(0.49, "#c0708a"),
          s.addColorStop(0.512, "#d98a72"),
          s.addColorStop(0.545, "#4a4f85"),
          s.addColorStop(0.7, "#2f3a68"),
          s.addColorStop(0.85, "#2b3558"),
          s.addColorStop(1, "#2b3558"))
        : e
          ? (s.addColorStop(0, "#040814"),
            s.addColorStop(0.42, "#14204a"),
            s.addColorStop(0.5, "#2c3b69"),
            s.addColorStop(1, "#2c3b69"))
          : (s.addColorStop(0, "#2f78d2"),
            s.addColorStop(0.35, "#6fb0f0"),
            s.addColorStop(0.5, "#dcedfb"),
            s.addColorStop(1, "#dcedfb")),
      (o.fillStyle = s),
      o.fillRect(0, 0, r, n),
      a)
    ) {
      for (l = 0; l < 170; l++)
        ((f = c() * r),
          (u = Math.pow(c(), 1.5) * n * 0.3),
          (o.fillStyle = "rgba(255,255,255," + (0.15 + c() * 0.5).toFixed(2) + ")"),
          o.fillRect(f, u, 1, 1));
      for (l = 0; l < 16; l++)
        ((f = c() * r),
          (u = n * (0.3 + c() * 0.14)),
          (p = 60 + c() * 110),
          (s = o.createRadialGradient(f, u, 0, f, u, p)),
          s.addColorStop(0, "rgba(60,52,104,.38)"),
          s.addColorStop(1, "rgba(60,52,104,0)"),
          o.save(),
          o.translate(f, u),
          o.scale(1, 0.14),
          o.translate(-f, -u),
          (o.fillStyle = s),
          o.fillRect(f - p, u - p, p * 2, p * 2),
          o.restore());
      ((s = o.createRadialGradient(r * 0.7, n * 0.5, 0, r * 0.7, n * 0.5, 260)),
        s.addColorStop(0, "rgba(150,84,80,.3)"),
        s.addColorStop(1, "rgba(150,84,80,0)"),
        o.save(),
        o.translate(r * 0.7, n * 0.5),
        o.scale(1, 0.28),
        o.translate(-r * 0.7, -n * 0.5),
        (o.fillStyle = s),
        o.fillRect(r * 0.7 - 260, n * 0.5 - 260, 520, 520),
        o.restore());
    } else if (e) {
      for (l = 0; l < 520; l++)
        ((f = c() * r),
          (u = Math.pow(c(), 1.4) * n * 0.47),
          (o.fillStyle = "rgba(255,255,255," + (0.25 + c() * 0.7).toFixed(2) + ")"),
          o.fillRect(f, u, c() < 0.12 ? 2 : 1, c() < 0.12 ? 2 : 1));
      ((s = o.createRadialGradient(r * 0.75, n * 0.28, 0, r * 0.75, n * 0.28, 70)),
        s.addColorStop(0, "rgba(255,255,240,1)"),
        s.addColorStop(0.2, "rgba(235,240,255,.9)"),
        s.addColorStop(0.3, "rgba(180,200,255,.25)"),
        s.addColorStop(1, "rgba(180,200,255,0)"),
        (o.fillStyle = s),
        o.fillRect(r * 0.75 - 80, n * 0.28 - 80, 160, 160));
    } else
      for (
        s = o.createRadialGradient(r * 0.75, n * 0.3, 0, r * 0.75, n * 0.3, 140),
          s.addColorStop(0, "rgba(255,255,235,1)"),
          s.addColorStop(0.1, "rgba(255,250,215,.95)"),
          s.addColorStop(0.25, "rgba(255,240,200,.35)"),
          s.addColorStop(1, "rgba(255,240,200,0)"),
          o.fillStyle = s,
          o.fillRect(r * 0.75 - 150, n * 0.3 - 150, 300, 300),
          l = 0;
        l < 34;
        l++
      )
        ((f = c() * r),
          (u = n * (0.16 + c() * 0.25)),
          (p = 30 + c() * 70),
          (s = o.createRadialGradient(f, u, 0, f, u, p)),
          s.addColorStop(0, "rgba(255,255,255,.55)"),
          s.addColorStop(1, "rgba(255,255,255,0)"),
          o.save(),
          o.translate(f, u),
          o.scale(1, 0.32),
          o.translate(-f, -u),
          (o.fillStyle = s),
          o.fillRect(f - p, u - p, p * 2, p * 2),
          o.restore());
    return i;
  }
  function os(e, a, r, n, i, o, s, l) {
    var c = 360,
      f = ca(i),
      u = [1, 2, 3, 5, 8, 12],
      p = u.map(function () {
        return f() * 6.2832;
      }),
      v = [],
      w = [],
      y = [],
      E,
      M,
      g,
      b,
      k = 0,
      L,
      x,
      P = new e.Color(o),
      h = new e.Color(s),
      B = new e.Color(16054527),
      G;
    for (
      u.forEach(function (I) {
        k += 1 / Math.pow(I, 0.6);
      }),
        E = 0;
      E <= c;
      E++
    ) {
      for (g = (E / c) * Math.PI * 2, b = 0, M = 0; M < u.length; M++)
        b += (1 - Math.abs(Math.sin(u[M] * g * 0.5 + p[M]))) / Math.pow(u[M], 0.6);
      ((b = Math.pow(b / k, 1.15)), (L = r + n * b), (x = r + n * l));
      var z = Math.cos(g) * a,
        Q = Math.sin(g) * a;
      (v.push(z, -10, Q), (G = P.clone()), w.push(G.r, G.g, G.b));
      var J = Math.min(L, x);
      (v.push(z, J, Q), w.push(h.r, h.g, h.b), v.push(z, L, Q), (G = L > x ? B : h), w.push(G.r, G.g, G.b));
    }
    for (E = 0; E < c; E++) {
      var q = E * 3,
        O = (E + 1) * 3;
      y.push(q, O, q + 1, O, O + 1, q + 1, q + 1, O + 1, q + 2, O + 1, O + 2, q + 2);
    }
    var F = new e.BufferGeometry();
    return (
      F.setAttribute("position", new e.Float32BufferAttribute(v, 3)),
      F.setAttribute("color", new e.Float32BufferAttribute(w, 3)),
      F.setIndex(y),
      new e.Mesh(F, new e.MeshBasicMaterial({ vertexColors: !0, side: e.DoubleSide, fog: !1 }))
    );
  }
  /* Phones draw only out to 1400 units, which used to slice through the sky dome and the
     mountain rings and made the sky flicker as the camera moved. Push these backdrop meshes
     to the very back of the depth range so the far limit never clips them. They are listed
     back to front and painted in that order; everything else in the world draws over them. */
  function merSkyBackdrop(list) {
    list.forEach(function (m, k) {
      var mt = m.material;
      m.renderOrder = -10 + k;
      m.frustumCulled = !1;
      mt.depthWrite = !1;
      mt.onBeforeCompile = function (sh) {
        sh.vertexShader = sh.vertexShader.replace(
          "#include <fog_vertex>",
          "#include <fog_vertex>\n  gl_Position.z = gl_Position.w * 0.99999;",
        );
      };
      mt.needsUpdate = !0;
    });
  }
  function I0(e) {
    var a = new e.Group(),
      r = [],
      n = new e.CanvasTexture(is(!1)),
      i = new e.CanvasTexture(is(!0)),
      o = new e.CanvasTexture(is(!0, !0));
    e.SRGBColorSpace &&
      ((n.colorSpace = e.SRGBColorSpace),
      (i.colorSpace = e.SRGBColorSpace),
      (o.colorSpace = e.SRGBColorSpace));
    var s = new e.MeshBasicMaterial({ map: n, side: e.BackSide, depthWrite: !1, fog: !1 }),
      l = new e.Mesh(new e.SphereGeometry(4200, 96, 64), s);
    ((l.renderOrder = -10), a.add(l));
    var c = [
      os(e, 560, 70, 260, 5, 9415113, 11453404, 0.55),
      os(e, 440, 45, 190, 23, 5665935, 7836846, 0.62),
      os(e, 340, 20, 105, 41, 3495487, 5666908, 2),
    ];
    c.forEach(function (M) {
      (M.scale.setScalar(3.5), a.add(M), r.push(M.material));
    });
    var f = new e.MeshBasicMaterial({ color: 8299359 });
    (function () {
      var M = document.createElement("canvas");
      M.width = M.height = 512;
      var g = M.getContext("2d"),
        b,
        k,
        L,
        x,
        P;
      for (g.fillStyle = "#e6e6e6", g.fillRect(0, 0, 512, 512), b = 0; b < 5200; b++) {
        ((k = Math.random() * 512),
          (L = Math.random() * 512),
          (x = 5 + Math.random() * 11),
          (P = -1.57 + (Math.random() - 0.5) * 1.1));
        var h = 0.55 + Math.random() * 0.55;
        ((g.strokeStyle =
          "rgba(" +
          Math.round(255 * h * 0.82) +
          "," +
          Math.round(255 * h) +
          "," +
          Math.round(255 * h * 0.7) +
          "," +
          (0.35 + Math.random() * 0.4).toFixed(2) +
          ")"),
          (g.lineWidth = 1 + Math.random() * 1.4),
          g.beginPath(),
          g.moveTo(k, L),
          g.lineTo(k + Math.cos(P) * x * 0.4, L + Math.sin(P) * x),
          g.stroke(),
          (k < 14 || L < 14) &&
            (g.beginPath(),
            g.moveTo(k + 512, L + 512),
            g.lineTo(k + 512 + Math.cos(P) * x * 0.4, L + 512 + Math.sin(P) * x),
            g.stroke()));
      }
      for (b = 0; b < 0; b++)
        ((g.fillStyle =
          "rgba(" +
          (Math.random() < 0.5 ? "40,52,30" : "90,110,60") +
          "," +
          (0.12 + Math.random() * 0.2).toFixed(2) +
          ")"),
          g.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 3, 2 + Math.random() * 3));
      var B = new e.CanvasTexture(M);
      ((B.wrapS = B.wrapT = e.RepeatWrapping),
        B.repeat.set(213, 213),
        (B.anisotropy = Math.min(16, t.renderer.capabilities.getMaxAnisotropy())),
        e.SRGBColorSpace && (B.colorSpace = e.SRGBColorSpace),
        (t.grassTex = B));
    })();
    var f = new e.MeshBasicMaterial({ color: 0x0c1610 }),
      u = new e.Mesh(new e.CircleGeometry(1500, 64), f);
    ((u.rotation.x = -Math.PI / 2),
      (u.position.y = -0.06),
      a.add(u),
      r.push(f),
      (f.userData.noTint = !0),
      (t.groundMesh = u),
      (t.envTone = function (M) {
        var g = !!(t.dusk && M);
        s.map = t.photoTex || (g ? o : M ? i : n);
        var b = new fe.Color(g ? 4608650 : M ? 3819112 : 14673134);
        (r.concat(t.yardMats || []).forEach(function (k) {
          (k.userData.base || (k.userData.base = k.color.clone()),
            !k.userData.noTint && k.color.copy(k.userData.base).multiply(b));
        }),
          g && f.color.multiplyScalar(0.55));
      }));
    var p = document.createElement("canvas");
    ((p.width = 8), (p.height = 128));
    var v = p.getContext("2d"),
      w = v.createLinearGradient(0, 0, 0, 128);
    (w.addColorStop(0, "rgba(70,82,130,0)"),
      w.addColorStop(0.55, "rgba(70,82,130,0.5)"),
      w.addColorStop(1, "rgba(40,52,96,0.25)"),
      (v.fillStyle = w),
      v.fillRect(0, 0, 8, 128));
    var y = new e.Mesh(
      new e.CylinderGeometry(1e3, 1e3, 240, 48, 1, !0),
      new e.MeshBasicMaterial({
        map: new e.CanvasTexture(p),
        transparent: !0,
        side: e.BackSide,
        depthWrite: !1,
        fog: !1,
        opacity: 0.85,
      }),
    );
    /* Sky dome, then mountain rings from far to near. The dusk band keeps its own order. */
    if (qn()) (merSkyBackdrop([l, c[0], c[1], c[2]]), merSkyBackdrop([y]));
    if (
      ((y.position.y = 80),
      (y.visible = !1),
      (y.renderOrder = -5),
      a.add(y),
      (t.raceDusk = function (M) {
        ((t.dusk = !!M),
          (t.scene.fog = M ? new e.FogExp2(qe.fogColor, qe.fogDensity) : null),
          (y.visible = !!M),
          t.envTone && t.envTone(zt === "night"),
          ye());
      }),
      (t.env = a),
      t.scene.add(a),
      (t.photoTex = null),
      (t.hasPhoto = !1),
      ce.outsidePhoto)
    ) {
      var E = new e.TextureLoader();
      (E.setCrossOrigin("anonymous"),
        E.load(
          ce.outsidePhoto,
          function (M) {
            (e.SRGBColorSpace && (M.colorSpace = e.SRGBColorSpace),
              (M.anisotropy = Math.min(8, t.renderer.capabilities.getMaxAnisotropy())),
              (t.photoTex = M),
              (t.hasPhoto = !0));
            var g = new e.SphereGeometry(4200, 64, 32);
            (g.scale(-1, 1, 1),
              l.geometry.dispose(),
              (l.geometry = g),
              (l.rotation.y = Math.PI * 0.5),
              (s.side = e.FrontSide),
              (s.map = M),
              s.color.set(16777215),
              (s.needsUpdate = !0),
              c.forEach(function (O) {
                O.visible = !1;
              }));
            try {
              var b = M.image,
                k = document.createElement("canvas");
              ((k.width = 32), (k.height = 8));
              var L = k.getContext("2d");
              L.drawImage(b, 0, b.height * 0.66, b.width, b.height * 0.2, 0, 0, 32, 8);
              var x = L.getImageData(0, 0, 32, 8).data,
                P = 0,
                h = 0,
                B = 0,
                G = x.length / 4,
                z;
              for (z = 0; z < x.length; z += 4) ((P += x[z]), (h += x[z + 1]), (B += x[z + 2]));
              (f.color.setRGB(P / G / 255, h / G / 255, B / G / 255, e.SRGBColorSpace || void 0),
                f.color.multiplyScalar(1.3),
                (f.userData.base = f.color.clone()));
              var Q = document.createElement("canvas");
              Q.width = Q.height = 256;
              var J = Q.getContext("2d"),
                q = J.createRadialGradient(128, 128, 10, 128, 128, 128);
              (q.addColorStop(0, "#fff"),
                q.addColorStop(0.3, "#fff"),
                q.addColorStop(1, "#000"),
                (J.fillStyle = "#000"),
                J.fillRect(0, 0, 256, 256),
                (J.fillStyle = q),
                J.fillRect(0, 0, 256, 256),
                (f.map = null),
                (f.alphaMap = new e.CanvasTexture(Q)),
                (f.transparent = !0),
                (f.depthWrite = !1),
                (f.needsUpdate = !0),
                u.geometry.dispose(),
                (u.geometry = new e.CircleGeometry(420, 64)));
            } catch {
              u.visible = !1;
            }
            (t.trees && (t.trees = []),
              t.yardTrees &&
                t.yardTrees.forEach(function (O) {
                  O.visible = !1;
                }),
              t.yardRoad &&
                t.yardRoad.forEach(function (O) {
                  O.visible = !1;
                }),
              t.hemi && t.draw && t.draw(),
              typeof ye == "function" && ye());
          },
          void 0,
          function () {
            t.hasPhoto = !1;
          },
        ));
    }
  }
  function O0(e, a, r, n) {
    var i = new e.MeshBasicMaterial({ color: 3103290 }),
      o = new e.MeshBasicMaterial({ color: 4930092 }),
      s = ca(41),
      l = 56,
      c = 26;
    function f(m, S, A) {
      var R = new e.CanvasTexture(m);
      return (
        (R.wrapS = R.wrapT = e.RepeatWrapping),
        R.repeat.set(S, A),
        (R.anisotropy = 8),
        e.SRGBColorSpace && (R.colorSpace = e.SRGBColorSpace),
        R
      );
    }
    var u = (function () {
        var m = document.createElement("canvas");
        m.width = m.height = 256;
        var S = m.getContext("2d"),
          A,
          R,
          Y,
          j;
        for (S.fillStyle = "#cfd3cf", S.fillRect(0, 0, 256, 256), A = 0; A < 5; A++) {
          var Z = A * 51.2,
            H = S.createLinearGradient(0, Z, 0, Z + 51.2);
          for (
            H.addColorStop(0, "rgba(255,255,255,0.22)"),
              H.addColorStop(0.7, "rgba(0,0,0,0.0)"),
              H.addColorStop(1, "rgba(0,0,0,0.5)"),
              S.fillStyle = H,
              S.fillRect(0, Z, 256, 51.2),
              S.fillStyle = "rgba(0,0,0,0.38)",
              S.beginPath(),
              S.moveTo(0, Z + 51.2),
              R = 0;
            R <= 16;
            R++
          )
            (S.lineTo(R * 16 + 8, Z + 51.2 - 8 - (R % 2 ? 0 : 6)), S.lineTo((R + 1) * 16, Z + 51.2));
          (S.lineTo(256, Z + 54), S.lineTo(0, Z + 54), S.fill());
        }
        for (R = 0; R < 2600; R++)
          ((Y = Math.random() * 256),
            (j = Math.random() * 256),
            (S.strokeStyle = Math.random() < 0.5 ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.26)"),
            (S.lineWidth = 1),
            S.beginPath(),
            S.moveTo(Y, j),
            S.lineTo(Y + (Math.random() - 0.5) * 5, j + 4 + Math.random() * 6),
            S.stroke());
        return f(m, 3, 1);
      })(),
      p = (function () {
        var m = document.createElement("canvas");
        ((m.width = 128), (m.height = 256));
        var S = m.getContext("2d"),
          A;
        for (S.fillStyle = "#c9c4be", S.fillRect(0, 0, 128, 256), A = 0; A < 150; A++) {
          var R = Math.random() * 128,
            Y = 1 + Math.random() * 4;
          ((S.fillStyle =
            "rgba(" +
            (Math.random() < 0.6 ? "30,20,12" : "255,240,225") +
            "," +
            (0.1 + Math.random() * 0.3).toFixed(2) +
            ")"),
            S.fillRect(R, Math.random() * 120, Y, 40 + Math.random() * 140));
        }
        for (A = 0; A < 6; A++) {
          var j = Math.random() * 128,
            Z = Math.random() * 256,
            H = S.createRadialGradient(j, Z, 0, j, Z, 9);
          (H.addColorStop(0, "rgba(20,12,6,0.55)"),
            H.addColorStop(1, "rgba(20,12,6,0)"),
            (S.fillStyle = H),
            S.fillRect(j - 9, Z - 9, 18, 18));
        }
        return f(m, 2, 2);
      })(),
      v = (function () {
        var m = document.createElement("canvas");
        m.width = m.height = 256;
        var S = m.getContext("2d"),
          A;
        for (S.fillStyle = "#d6d9d2", S.fillRect(0, 0, 256, 256), A = 0; A < 1500; A++)
          (S.save(),
            S.translate(Math.random() * 256, Math.random() * 256),
            S.rotate(Math.random() * 6.283),
            (S.fillStyle =
              Math.random() < 0.5
                ? "rgba(0,0,0," + (0.1 + Math.random() * 0.22).toFixed(2) + ")"
                : "rgba(255,255,230," + (0.12 + Math.random() * 0.22).toFixed(2) + ")"),
            S.beginPath(),
            S.ellipse(0, 0, 2 + Math.random() * 3.5, 1 + Math.random() * 1.6, 0, 0, 6.283),
            S.fill(),
            S.restore());
        return f(m, 4, 4);
      })();
    ((i.map = u), (o.map = p));
    var w = (function () {
        var m = document.createElement("canvas");
        ((m.width = 128), (m.height = 96));
        var S = m.getContext("2d"),
          A;
        for (A = 0; A < 16; A++) {
          var R = 10 + Math.random() * 108,
            Y = 40 + Math.random() * 50,
            j = (Math.random() - 0.5) * 34,
            Z = 90 + Math.random() * 90;
          ((S.fillStyle =
            "rgb(" + Math.round(Z * 0.55) + "," + Math.round(Z + 30) + "," + Math.round(Z * 0.3) + ")"),
            S.beginPath(),
            S.moveTo(R - 2.4, 96),
            S.quadraticCurveTo(R + j * 0.3, 96 - Y * 0.6, R + j, 96 - Y),
            S.quadraticCurveTo(R + j * 0.3 + 2.4, 96 - Y * 0.55, R + 2.4, 96),
            S.fill());
        }
        var H = new e.CanvasTexture(m);
        return ((H.anisotropy = 4), e.SRGBColorSpace && (H.colorSpace = e.SRGBColorSpace), H);
      })(),
      y = document.createElement("canvas");
    y.width = y.height = 256;
    var E = y.getContext("2d"),
      M,
      g,
      b;
    for (E.fillStyle = "#b9bbbd", E.fillRect(0, 0, 256, 256), M = 0; M < 2600; M++)
      ((g = s() * 256),
        (b = s() * 256),
        (E.fillStyle =
          "rgba(" + (s() < 0.5 ? "0,0,0" : "255,255,255") + "," + (0.03 + s() * 0.06).toFixed(3) + ")"),
        E.fillRect(g, b, 1 + s() * 2, 1 + s() * 2));
    for (M = 0; M < 7; M++) {
      ((g = s() * 256), (b = s() * 256));
      var k = E.createRadialGradient(g, b, 0, g, b, 30 + s() * 40);
      (k.addColorStop(0, "rgba(70,70,74,0.10)"),
        k.addColorStop(1, "rgba(70,70,74,0)"),
        (E.fillStyle = k),
        E.fillRect(0, 0, 256, 256));
    }
    ((E.fillStyle = "rgba(60,60,64,0.22)"),
      E.fillRect(0, 252, 256, 4),
      E.fillRect(252, 0, 4, 256),
      (E.fillStyle = "rgba(255,255,255,0.16)"),
      E.fillRect(0, 0, 256, 1.5),
      E.fillRect(0, 0, 1.5, 256));
    var L = f(y, 1 / 12, 1 / 12),
      x = new e.MeshBasicMaterial({ color: 16777215, map: L }),
      P = new e.MeshBasicMaterial({ color: 14869218, map: L }),
      h = r.wid / 2,
      B = 7,
      G = new e.Shape(),
      z = 36,
      Q = -(z - 9),
      J = -z;
    (G.moveTo(-h, 0),
      G.lineTo(h, 0),
      G.lineTo(h, Q),
      G.quadraticCurveTo(h, J, h + B, J),
      G.lineTo(-h - B, J),
      G.quadraticCurveTo(-h, J, -h, Q),
      G.lineTo(-h, 0));
    var q = new e.Mesh(new e.ShapeGeometry(G, 12), x);
    ((q.rotation.x = -Math.PI / 2), q.position.set(0, -0.03, n), a.add(q));
    var O = new e.Mesh(new e.PlaneGeometry(r.wid + 3, r.len + 3), P);
    ((O.rotation.x = -Math.PI / 2), O.position.set(0, -0.045, 0), a.add(O));
    var F = document.createElement("canvas");
    ((F.width = 512), (F.height = 128));
    var I = F.getContext("2d");
    for (I.fillStyle = "#4a4d53", I.fillRect(0, 0, 512, 128), M = 0; M < 2400; M++)
      ((g = s() * 512),
        (b = s() * 128),
        (I.fillStyle =
          "rgba(" + (s() < 0.5 ? "0,0,0" : "255,255,255") + "," + (0.03 + s() * 0.05).toFixed(3) + ")"),
        I.fillRect(g, b, 1 + s() * 2, 1 + s() * 2));
    ((I.fillStyle = "#e0b92c"),
      I.fillRect(0, 62, 256, 4),
      (I.fillStyle = "rgba(235,235,235,0.75)"),
      I.fillRect(0, 6, 512, 2),
      I.fillRect(0, 120, 512, 2));
    var N = new e.Mesh(
      new e.PlaneGeometry(2700, c),
      new e.MeshBasicMaterial({ color: 16777215, map: f(F, 2700 / 64, 1) }),
    );
    ((N.rotation.x = -Math.PI / 2), N.position.set(0, -0.5, n + l + c / 2), a.add(N));
    var K = new e.MeshBasicMaterial({ color: 13619410 }),
      ne = new e.MeshBasicMaterial({ color: 16777215, map: f(y, 2700 / 12, 5 / 12) }),
      T = h + B,
      ae = 1350 - T,
      ue = [-1, 1],
      me = [];
    ue.forEach(function (m) {
      var S = new e.Mesh(new e.BoxGeometry(ae, 0.52, 0.7), K);
      (S.position.set(m * (T + ae / 2), -0.24, n + l + 0.35), a.add(S), me.push(S));
    });
    var Ge = new e.Mesh(new e.BoxGeometry(2700, 0.52, 0.7), K);
    (Ge.position.set(0, -0.24, n + l + c - 0.35), a.add(Ge));
    var xe = new e.BufferGeometry(),
      ft = n + l,
      ze = n + l + 2.5;
    (xe.setAttribute(
      "position",
      new e.BufferAttribute(new Float32Array([-T, 0, ft, T, 0, ft, T, -0.5, ze, -T, -0.5, ze]), 3),
    ),
      xe.setIndex([0, 2, 1, 0, 3, 2]));
    var ut = new e.MeshBasicMaterial({ color: 11843256, side: e.DoubleSide }),
      We = new e.Mesh(xe, ut);
    if ((a.add(We), (t.terrain = null), 0)) var Be, Ne, Wt, Et, Ot, ia, Bt;
    var et = new e.Mesh(new e.PlaneGeometry(2700, 5), ne);
    ((et.rotation.x = -Math.PI / 2),
      et.position.set(0, -0.02, n + l - 3.2),
      a.add(et),
      [N, Ge, We, et].concat(me).forEach(function (m) {
        m.visible = !1;
      }));
    var oe = r.wid + B * 2 + 6;
    t.trees = [];
    var tt = [],
      fr = [],
      dt = function (m, S) {
        var A = new e.MeshStandardMaterial({
          color: m,
          roughness: S ?? 1,
          flatShading: !0,
          emissive: m,
          emissiveIntensity: 0,
        });
        return ((A.userData.minE = 0.16), tt.push(A), A);
      },
      Ce = ca(1234),
      Dt = r.wid / 2,
      it = r.len / 2,
      ot = document.createElement("canvas");
    ot.width = ot.height = 128;
    var fa = ot.getContext("2d");
    ((fa.fillStyle = "#4a3626"), fa.fillRect(0, 0, 128, 128));
    for (var bt = 0; bt < 900; bt++)
      ((fa.fillStyle =
        "rgba(" + (Ce() < 0.5 ? "20,12,6" : "120,86,58") + "," + (0.15 + Ce() * 0.3).toFixed(2) + ")"),
        fa.fillRect(Ce() * 128, Ce() * 128, 2 + Ce() * 5, 1 + Ce() * 2));
    var Sa = new e.CanvasTexture(ot);
    ((Sa.wrapS = Sa.wrapT = e.RepeatWrapping),
      (Sa.anisotropy = 8),
      e.SRGBColorSpace && (Sa.colorSpace = e.SRGBColorSpace));
    var Pr = new e.MeshStandardMaterial({
      color: 16777215,
      map: Sa,
      roughness: 1,
      emissive: 16777215,
      emissiveMap: Sa,
      emissiveIntensity: 0,
    });
    tt.push(Pr);
    var un = dt(12171442, 0.9),
      ua = [
        { x: Dt + 3.6, z: 0, w: 4, l: r.len + 3, axis: "z" },
        { x: -Dt - 3.6, z: 0, w: 4, l: r.len + 3, axis: "z" },
        { x: 0, z: -it - 3.6, w: r.wid + 11, l: 4, axis: "x" },
      ],
      Zt = [],
      da = [],
      ka = [];
    ua.forEach(function (m) {
      var S = new e.PlaneGeometry(m.w, m.l),
        A = S.attributes.uv,
        R;
      for (R = 0; R < A.count; R++) A.setXY(R, (A.getX(R) * m.w) / 6, (A.getY(R) * m.l) / 6);
      var Y = new e.Mesh(S, Pr);
      ((Y.rotation.x = -Math.PI / 2), Y.position.set(m.x, -0.02, m.z), a.add(Y));
      var j = new e.Mesh(new e.BoxGeometry(m.axis === "z" ? 0.3 : m.w, 0.28, m.axis === "z" ? m.l : 0.3), un);
      (j.position.set(
        m.axis === "z" ? m.x + Math.sign(m.x) * (m.w / 2) : m.x,
        0.1,
        m.axis === "z" ? m.z : m.z - m.l / 2,
      ),
        a.add(j));
      var Z = Math.max(2, Math.round((m.axis === "z" ? m.l : m.w) / 4.8)),
        H,
        d,
        C,
        D,
        X;
      for (H = 0; H < Z; H++) {
        if (
          ((d = (H + 0.5) / Z),
          (C = 0.8 + Ce() * 0.6),
          (D = m.axis === "z" ? m.x + (Ce() - 0.5) * 1.2 : m.x - m.w / 2 + d * m.w),
          (X = m.axis === "z" ? m.z - m.l / 2 + d * m.l : m.z + (Ce() - 0.5) * 1.2),
          Zt.push({ x: D, z: X, s: C, c: Ce() }),
          Ce() < 0.7)
        )
          for (var $ = 0; $ < 4; $++)
            da.push({ x: D + (Ce() - 0.5) * 3, z: X + (Ce() - 0.5) * 3, c: Math.floor(Ce() * 4) });
        Ce() < 0.6 && ka.push({ x: D + (Ce() - 0.5) * 3.4, z: X + (Ce() - 0.5) * 3.4, s: 0.22 + Ce() * 0.3 });
      }
    });
    var ur = dt(16777215, 1);
    (ur.emissive.setHex(3829814), (ur.map = v));
    var Vn = 0,
      yt = new e.IcosahedronGeometry(1, 1),
      Nt = new e.InstancedMesh(yt, ur, Zt.length),
      pt = new e.Matrix4(),
      de = new e.Quaternion(),
      Lt = new e.Vector3(),
      Ae = new e.Vector3(),
      _t = new e.Color();
    if (
      (Zt.forEach(function (m, S) {
        (Lt.set(m.x, m.s * 0.78, m.z),
          Ae.set(m.s * 1.3, m.s * 0.95, m.s * 1.3),
          pt.compose(Lt, de, Ae),
          Nt.setMatrixAt(S, pt),
          _t.setHex(m.c < 0.33 ? 4160058 : m.c < 0.66 ? 3107381 : 5934908),
          Nt.setColorAt(S, _t),
          t.trees.push({ x: m.x, z: m.z, r: m.s * 1.1 + 0.5 }));
      }),
      a.add(Nt),
      da.length)
    ) {
      var Qt = dt(16777215, 0.8);
      Qt.emissive.setHex(9079434);
      var ki = 0,
        Ir = new e.InstancedMesh(new e.IcosahedronGeometry(0.3, 0), Qt, da.length),
        dr = [15026253, 16106818, 14277106, 12085465];
      (da.forEach(function (m, S) {
        (Lt.set(m.x, 0.3, m.z),
          Ae.set(1, 0.8, 1),
          pt.compose(Lt, de, Ae),
          Ir.setMatrixAt(S, pt),
          _t.setHex(dr[m.c]),
          Ir.setColorAt(S, _t));
      }),
        a.add(Ir));
    }
    if (ka.length) {
      var Ci = new e.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9, metalness: 0 }),
        Ue = new e.InstancedMesh(new e.DodecahedronGeometry(1, 0), Ci, ka.length);
      (ka.forEach(function (m, S) {
        (Lt.set(m.x, m.s * 0.4, m.z),
          Ae.set(m.s * 1.3, m.s * 0.8, m.s),
          pt.compose(Lt, de, Ae),
          Ue.setMatrixAt(S, pt));
      }),
        a.add(Ue));
    }
    var vo = dt(5915442, 1),
      Hn = [dt(5212732, 1), dt(6463562, 1), dt(10238507, 1)];
    ((vo.map = p),
      Hn.forEach(function (m) {
        ((m.map = v), (m.vertexColors = !0));
      }),
      [
        [-(Dt + 11), it + 7, 0],
        [Dt + 12, it + 17, 1],
        [-(Dt + 10), -it - 9, 1],
        [Dt + 11, -it - 11, 2],
      ].forEach(function (m) {
        var S = new e.Group(),
          A = 4.2 + Ce() * 1.4,
          R = Hn[m[2]],
          Y = new e.Mesh(new e.CylinderGeometry(0.35, 0.5, A, 7), vo);
        ((Y.position.y = A / 2),
          S.add(Y),
          [
            [0, A + 1.7, 0, 3],
            [1.7, A + 0.9, 0.7, 2.3],
            [-1.6, A + 1, -0.8, 2.4],
            [0.3, A + 3.2, -0.4, 2.1],
            [-0.9, A + 2.6, 1.3, 1.9],
            [1.2, A + 2.4, -1.4, 1.8],
            [-0.2, A + 0.2, 1.6, 1.7],
          ].forEach(function (j) {
            var Z = new e.IcosahedronGeometry(j[3], 2),
              H = Z.attributes.position,
              d = new e.Vector3(),
              C = [],
              D;
            for (D = 0; D < H.count; D++) {
              d.fromBufferAttribute(H, D);
              var X = d.length() || 1,
                $ = 1 + (Ce() - 0.5) * 0.28;
              (d.multiplyScalar($), H.setXYZ(D, d.x, d.y, d.z));
              var le = 0.55 + 0.45 * Math.max(0, (d.y / X + 1) / 2);
              C.push(le, le, le);
            }
            (Z.setAttribute("color", new e.Float32BufferAttribute(C, 3)), Z.computeVertexNormals());
            var re = new e.Mesh(Z, R);
            (re.position.set(j[0], j[1], j[2]), S.add(re));
          }),
          S.position.set(m[0], 0, m[1]),
          a.add(S),
          t.trees.push({ x: m[0], z: m[1], r: 1.6 }));
      }));
    var Un = function (m, S) {
        var A = m / 2,
          R = Math.max(-A + 0.3, -(n + l + c - S)),
          Y = Math.min(A - 0.3, -(n + l - S)),
          j = new e.Shape();
        if ((j.moveTo(-A, -A), j.lineTo(A, -A), j.lineTo(A, A), j.lineTo(-A, A), j.lineTo(-A, -A), 0)) var Z;
        var H = new e.ShapeGeometry(j),
          d = H.attributes.position,
          C = H.attributes.uv,
          D;
        for (D = 0; D < d.count; D++) C.setXY(D, d.getX(D) / m + 0.5, d.getY(D) / m + 0.5);
        return H;
      },
      hr = document.createElement("canvas");
    ((hr.width = 256), (hr.height = 4));
    var dn = hr.getContext("2d");
    ((dn.fillStyle = "rgba(10,50,10,0.16)"),
      dn.fillRect(0, 0, 128, 4),
      (dn.fillStyle = "rgba(255,255,255,0.07)"),
      dn.fillRect(128, 0, 128, 4));
    var Or = new e.CanvasTexture(hr);
    ((Or.wrapS = Or.wrapT = e.RepeatWrapping), Or.repeat.set(260 / 16, 1), (Or.magFilter = e.NearestFilter));
    var Ai = new e.MeshBasicMaterial({
      color: 16777215,
      map: Or,
      transparent: !0,
      depthWrite: !1,
      polygonOffset: !0,
      polygonOffsetFactor: 2,
      polygonOffsetUnits: 2,
    });
    tt.push(Ai);
    var Vt = new e.Mesh(Un(260, 20), Ai);
    ((Vt.rotation.x = -Math.PI / 2), Vt.position.set(0, -0.05, n * 0 + 20), a.add(Vt));
    var Dr = document.createElement("canvas");
    Dr.width = Dr.height = 1024;
    var vt = Dr.getContext("2d"),
      Fr;
    for (Fr = 0; Fr < 170; Fr++) {
      var Xn = Ce() * 1024,
        qr = Ce() * 1024,
        St = 30 + Ce() * 90,
        hn = vt.createRadialGradient(Xn, qr, 0, Xn, qr, St),
        Ca = Ce() < 0.5;
      (hn.addColorStop(0, Ca ? "rgba(30,60,20,0.26)" : "rgba(210,230,140,0.2)"),
        hn.addColorStop(1, Ca ? "rgba(30,60,20,0)" : "rgba(210,230,140,0)"),
        (vt.fillStyle = hn),
        vt.fillRect(Xn - St, qr - St, St * 2, St * 2));
    }
    var oa = new e.CanvasTexture(Dr);
    ((oa.anisotropy = 8), e.SRGBColorSpace && (oa.colorSpace = e.SRGBColorSpace));
    var Ei = new e.MeshBasicMaterial({
      color: 16777215,
      map: oa,
      transparent: !0,
      depthWrite: !1,
      polygonOffset: !0,
      polygonOffsetFactor: 3,
      polygonOffsetUnits: 3,
    });
    tt.push(Ei);
    var Ft = new e.Mesh(Un(300, 20), Ei);
    ((Ft.rotation.x = -Math.PI / 2), Ft.position.set(0, -0.055, n * 0 + 20), a.add(Ft));
    var jn = h + B + 4.5,
      Yn = n + l - 7.2,
      Bi = dt(3882822, 0.7),
      pn = dt(2040880, 0.5),
      Zn = dt(13777458, 0.6),
      Kt = new e.Mesh(new e.BoxGeometry(0.28, 3.6, 0.28), Bi);
    (Kt.position.set(jn, 1.8, Yn), a.add(Kt));
    var Ht = new e.Mesh(new e.BoxGeometry(0.9, 0.85, 1.7), pn);
    (Ht.position.set(jn, 3.9, Yn), a.add(Ht));
    var sa = new e.Mesh(new e.BoxGeometry(0.08, 0.7, 0.3), Zn);
    (sa.position.set(jn + 0.5, 4.2, Yn - 0.3),
      a.add(sa),
      (Kt.visible = !1),
      (Ht.visible = !1),
      (sa.visible = !1));
    var Pe = 30,
      be = n + 34,
      Li = 2.4,
      pr = [
        [-100, be],
        [40, be],
        [170, be],
        [245, be - 10],
        [270, -15],
        [242, -75],
        [264, -135],
        [246, -185],
        [270, -228],
        [264, -252],
        [246, -270],
        [222, -276],
        [150, -270],
        [75, -232],
        [10, -262],
        [-60, -268],
        [-130, -268],
        [-200, -250],
        [-242, -205],
        [-226, -150],
        [-250, -100],
        [-268, -55],
        [-250, be - 30],
        [-205, be - 4],
      ];
    pr = pr.map(function (m) {
      return [m[0] * Li, be - (be - m[1]) * Li];
    });
    var Wr = [],
      Ee,
      Aa,
      Ea = pr.length,
      _n = function (m, S, A, R, Y) {
        var j = Y * Y,
          Z = j * Y;
        return [
          0.5 *
            (2 * S[0] +
              (-m[0] + A[0]) * Y +
              (2 * m[0] - 5 * S[0] + 4 * A[0] - R[0]) * j +
              (-m[0] + 3 * S[0] - 3 * A[0] + R[0]) * Z),
          0.5 *
            (2 * S[1] +
              (-m[1] + A[1]) * Y +
              (2 * m[1] - 5 * S[1] + 4 * A[1] - R[1]) * j +
              (-m[1] + 3 * S[1] - 3 * A[1] + R[1]) * Z),
        ];
      };
    for (Ee = 0; Ee < Ea; Ee++)
      for (Aa = 0; Aa < 30; Aa++)
        Wr.push(_n(pr[(Ee + Ea - 1) % Ea], pr[Ee], pr[(Ee + 1) % Ea], pr[(Ee + 2) % Ea], Aa / 30));
    var Ke = [0],
      Na = 0,
      Va = Wr.length;
    for (Ee = 0; Ee < Va; Ee++) {
      var Nr = Wr[Ee],
        Vr = Wr[(Ee + 1) % Va];
      ((Na += Math.sqrt((Vr[0] - Nr[0]) * (Vr[0] - Nr[0]) + (Vr[1] - Nr[1]) * (Vr[1] - Nr[1]))), Ke.push(Na));
    }
    var ge = [],
      Ve = Math.round(Na / 4),
      ha = 0;
    for (Ee = 0; Ee < Ve; Ee++) {
      for (var vn = (Na * Ee) / Ve; ha < Va - 1 && Ke[ha + 1] < vn;) ha++;
      var Qn = (vn - Ke[ha]) / Math.max(1e-6, Ke[ha + 1] - Ke[ha]),
        vr = Wr[ha],
        mo = Wr[(ha + 1) % Va];
      ge.push([vr[0] + (mo[0] - vr[0]) * Qn, vr[1] + (mo[1] - vr[1]) * Qn]);
    }
    var mn = 1e9,
      Xe = -1e9,
      Rt = 1e9,
      mr = -1e9;
    (ge.forEach(function (m) {
      ((mn = Math.min(mn, m[0])),
        (Xe = Math.max(Xe, m[0])),
        (Rt = Math.min(Rt, m[1])),
        (mr = Math.max(mr, m[1])));
    }),
      (t.worldBox = {
        x0: mn - Pe / 2 - 30,
        x1: Xe + Pe / 2 + 30,
        z0: Rt - Pe / 2 - 30,
        z1: Math.max(mr, n + 40) + Pe / 2 + 30,
      }));
    var st = function (m, S) {
        var A = 1e9,
          R,
          Y,
          j,
          Z;
        for (R = 0; R < ge.length; R++)
          ((Y = m - ge[R][0]), (j = S - ge[R][1]), (Z = Y * Y + j * j), Z < A && (A = Z));
        return Math.sqrt(A);
      },
      Kn = r.wid / 2 + 67,
      Ha = 0,
      go = 1e9,
      Hr;
    for (Hr = 0; Hr < Ve; Hr++) {
      var Mo = ge[Hr][0] - Kn,
        Le = ge[Hr][1] - be,
        gr = Mo * Mo + Le * Le;
      gr < go && ((go = gr), (Ha = Hr));
    }
    var Ua = ge[Ha],
      cs = ge[(Ha + 1) % Ve],
      Ur = ge[(Ha + Ve - 1) % Ve],
      Jt = [cs[0] - Ur[0], cs[1] - Ur[1]],
      Ri = Math.sqrt(Jt[0] * Jt[0] + Jt[1] * Jt[1]);
    Jt = [Jt[0] / Ri, Jt[1] / Ri];
    var Gi = [0.25, 0.5, 0.75].map(function (m) {
      return ge[(Ha + Math.floor(Ve * m)) % Ve].slice();
    });
    t.track = { sd: st, w: Pe, S: Ua.slice(), T: Jt, cps: Gi, pts: ge, len: Na };
    var Jn = [],
      zi = [],
      xo = [],
      $n = 0,
      Xa,
      gn,
      ja,
      Pi;
    for (Ee = 0; Ee <= Ve; Ee++) {
      var la = ge[Ee % Ve],
        Ii = ge[(Ee + 1) % Ve],
        pa = ge[(Ee + Ve - 1) % Ve];
      if (
        ((gn = Ii[0] - pa[0]),
        (ja = Ii[1] - pa[1]),
        (Pi = Math.sqrt(gn * gn + ja * ja) || 1),
        (gn /= Pi),
        (ja /= Pi),
        (Xa = [-ja, gn]),
        Ee > 0)
      ) {
        var Ya = ge[(Ee - 1) % Ve];
        $n += Math.sqrt((la[0] - Ya[0]) * (la[0] - Ya[0]) + (la[1] - Ya[1]) * (la[1] - Ya[1]));
      }
      if (
        (Jn.push(
          la[0] + (Xa[0] * Pe) / 2,
          0.012,
          la[1] + (Xa[1] * Pe) / 2,
          la[0] - (Xa[0] * Pe) / 2,
          0.012,
          la[1] - (Xa[1] * Pe) / 2,
        ),
        zi.push(0, $n / 30, 1, $n / 30),
        Ee < Ve)
      ) {
        var Za = Ee * 2;
        xo.push(Za, Za + 1, Za + 2, Za + 1, Za + 3, Za + 2);
      }
    }
    for (t.trackGrid = {}, Ee = 0; Ee < Ve; Ee++) {
      var va = Math.floor(ge[Ee][0] / 16) + "," + Math.floor(ge[Ee][1] / 16);
      (t.trackGrid[va] = t.trackGrid[va] || []).push(Ee);
    }
    var ma = new e.BufferGeometry();
    (ma.setAttribute("position", new e.Float32BufferAttribute(Jn, 3)),
      ma.setAttribute("uv", new e.Float32BufferAttribute(zi, 2)),
      ma.setIndex(xo),
      (function () {
        var m = [],
          S;
        for (S = 0; S < Jn.length / 3; S++) m.push(0, 1, 0);
        ma.setAttribute("normal", new e.Float32BufferAttribute(m, 3));
      })());
    var Ba = document.createElement("canvas");
    ((Ba.width = 512), (Ba.height = 512));
    var lt = Ba.getContext("2d"),
      Tn;
    function Oi() {
      ([0, 119].forEach(function (m) {
        ((lt.fillStyle = "rgba(20,21,24,0.55)"), lt.fillRect(m * 4, 0, 36, 512));
      }),
        (lt.fillStyle = "rgba(15,16,20,0.22)"),
        lt.fillRect(134, 0, 28, 512),
        lt.fillRect(350, 0, 28, 512),
        (lt.fillStyle = "rgba(245,245,245,0.92)"),
        lt.fillRect(48, 0, 16, 512),
        lt.fillRect(448, 0, 16, 512),
        (lt.fillStyle = "rgba(236,186,52,0.95)"),
        lt.fillRect(236, 0, 12, 512),
        lt.fillRect(264, 0, 12, 512));
    }
    for (lt.fillStyle = "#33363c", lt.fillRect(0, 0, 512, 512), Tn = 0; Tn < 7e3; Tn++)
      ((lt.fillStyle =
        "rgba(" + (s() < 0.5 ? "0,0,0" : "255,255,255") + "," + (0.03 + s() * 0.05).toFixed(3) + ")"),
        lt.fillRect(s() * 512, s() * 512, 2 + s() * 6, 2 + s() * 6));
    Oi();
    var La = new e.MeshBasicMaterial({
        color: 16777215,
        map: f(Ba, 1, 1),
        side: e.DoubleSide,
        polygonOffset: !0,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      _a = new e.Mesh(ma, (merWetHook(La), La));
    (a.add(_a),
      (_a.receiveShadow = !1),
      (t.cineSw = []),
      (function () {
        var m = new e.MeshStandardMaterial({
          map: La.map,
          color: 0x8c9097,
          roughness: 0.4,
          metalness: 0,
          side: e.DoubleSide,
          polygonOffset: !0,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        });
        merWetHook(m);
        if (
          ((m.normalScale = new e.Vector2(0.2, 0.2)),
          sn(e, Yt.asphalt.normal, !1, 10, 10, Gn.asphaltN, function (A) {
            ((m.normalMap = A), (m.needsUpdate = !0));
          }),
          sn(e, Yt.asphalt.roughness, !1, 24, 24, Gn.asphaltR, function (A) {
            ((m.roughnessMap = A), (m.needsUpdate = !0));
          }),
          Yt.asphalt.map)
        ) {
          var S = new Image();
          ((S.crossOrigin = "anonymous"),
            (S.onload = function () {
              ((lt.fillStyle = lt.createPattern(S, "repeat")),
                lt.fillRect(0, 0, 512, 512),
                Oi(),
                (La.map.needsUpdate = !0),
                ye());
            }),
            (S.src = Yt.asphalt.map));
        }
        t.cineSw.push({ mesh: _a, basic: La, pbr: m });
      })(),
      merRoadSkirt(e, a, ge, Ve, Pe),
      (t.kerbM = null),
      (function () {
        var m = Ve,
          S = [],
          A = [],
          R,
          Y;
        for (R = 0; R < m; R++) {
          var j = ge[(R + m - 2) % m],
            Z = ge[R],
            H = ge[(R + 2) % m],
            d = Math.atan2(Z[1] - j[1], Z[0] - j[0]),
            C = Math.atan2(H[1] - Z[1], H[0] - Z[0]);
          S.push(Math.abs(Math.atan2(Math.sin(C - d), Math.cos(C - d))) / 8);
        }
        for (R = 0; R < m; R++) {
          var D = !1;
          for (Y = -4; Y <= 4; Y++) S[(R + Y + m) % m] > 1 / 230 && (D = !0);
          A.push(D);
        }
        var X = [],
          $ = [],
          le = [
            [-0.35, 0.02],
            [0.3, 0.15],
            [1.9, 0.15],
            [2.3, 0.03],
          ],
          re = [0.78, 1, 0.7],
          ve = [0.851, 0.149, 0.149],
          se = [0.941, 0.941, 0.941];
        if (
          ([-1, 1].forEach(function (Me) {
            for (R = 0; R < m; R++)
              if (!(!A[R] || !A[(R + 1) % m])) {
                var je = ge[R],
                  he = ge[(R + 1) % m],
                  Ie = ge[(R + m - 1) % m],
                  Ze = ge[(R + 2) % m],
                  xt = function (Ma, er) {
                    var xa = er[0] - Ma[0],
                      Oa = er[1] - Ma[1],
                      Sr = Math.sqrt(xa * xa + Oa * Oa) || 1;
                    return [(-Oa / Sr) * Me, (xa / Sr) * Me];
                  },
                  ht = xt(Ie, he),
                  mt = xt(je, Ze),
                  Xt = Pe / 2,
                  Oe = Math.floor(R / 1) % 2 ? ve : se;
                for (Y = 0; Y < 3; Y++) {
                  var De = Xt + le[Y][0],
                    rt = Xt + le[Y + 1][0],
                    nt = le[Y][1],
                    Qe = le[Y + 1][1],
                    gt = re[Y],
                    jt = [je[0] + ht[0] * De, nt, je[1] + ht[1] * De],
                    Tr = [je[0] + ht[0] * rt, Qe, je[1] + ht[1] * rt],
                    aa = [he[0] + mt[0] * rt, Qe, he[1] + mt[1] * rt],
                    br = [he[0] + mt[0] * De, nt, he[1] + mt[1] * De],
                    yr = [Oe[0] * gt, Oe[1] * gt, Oe[2] * gt];
                  [jt, Tr, aa, jt, aa, br].forEach(function (Ma) {
                    (X.push(Ma[0], Ma[1], Ma[2]), $.push(yr[0], yr[1], yr[2]));
                  });
                }
              }
          }),
          !!X.length)
        ) {
          var He = new e.BufferGeometry();
          (He.setAttribute("position", new e.Float32BufferAttribute(X, 3)),
            He.setAttribute("color", new e.Float32BufferAttribute($, 3)));
          var $e = new e.MeshBasicMaterial({
              color: 16777215,
              vertexColors: !0,
              side: e.DoubleSide,
              polygonOffset: !0,
              polygonOffsetFactor: -5,
              polygonOffsetUnits: -5,
            }),
            Re = new e.Mesh(He, $e);
          (a.add(Re),
            (t.kerbM = $e),
            t.cineSw.push({
              mesh: Re,
              basic: $e,
              pbr: new e.MeshStandardMaterial({
                color: 16777215,
                vertexColors: !0,
                side: e.DoubleSide,
                roughness: 0.6,
                metalness: 0,
                polygonOffset: !0,
                polygonOffsetFactor: -5,
                polygonOffsetUnits: -5,
              }),
            }));
        }
      })());
    var Qa = document.createElement("canvas");
    ((Qa.width = 256), (Qa.height = 44));
    var Mn = Qa.getContext("2d"),
      Se,
      Ra;
    for (Se = 0; Se < 32; Se++)
      for (Ra = 0; Ra < 4; Ra++)
        ((Mn.fillStyle = (Se + Ra) % 2 ? "#111" : "#f4f4f4"), Mn.fillRect(Se * 8, Ra * 11, 8, 11));
    var Je = new e.MeshBasicMaterial({
        map: f(Qa, 1, 1),
        color: 16777215,
        polygonOffset: !0,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      }),
      Ye = document.createElement("canvas");
    ((Ye.width = 512), (Ye.height = 80));
    var $t = Ye.getContext("2d");
    (($t.fillStyle = "#16181d"),
      $t.fillRect(0, 0, 512, 80),
      ($t.fillStyle = "#d4a63a"),
      $t.fillRect(0, 0, 512, 6),
      $t.fillRect(0, 74, 512, 6),
      ($t.fillStyle = "#ffffff"),
      ($t.font = "bold 44px Arial, sans-serif"),
      ($t.textAlign = "center"),
      ($t.textBaseline = "middle"),
      $t.fillText("START / FINISH", 256, 42));
    var Xr = new e.MeshBasicMaterial({ map: f(Ye, 1, 1), color: 16777215 }),
      xn = new e.MeshBasicMaterial({ color: 9080728 }),
      kt = new e.Group(),
      wn = new e.Mesh(new e.PlaneGeometry(Pe, 5), Je);
    ((wn.rotation.x = -Math.PI / 2),
      (wn.position.y = 0.03),
      kt.add(wn),
      [-1, 1].forEach(function (m) {
        var S = new e.Mesh(new e.BoxGeometry(0.8, 14, 0.8), xn);
        (S.position.set(m * (Pe / 2 + 1.6), 7, 0), kt.add(S));
      }));
    var Di = new e.Mesh(new e.PlaneGeometry(Pe + 4.4, 3.4), Xr);
    (Di.position.set(0, 12.4, 0.05), kt.add(Di));
    var bn = new e.Mesh(new e.PlaneGeometry(Pe + 4.4, 3.4), Xr);
    (bn.position.set(0, 12.4, -0.05),
      (bn.rotation.y = Math.PI),
      kt.add(bn),
      kt.position.set(Ua[0], 0, Ua[1]),
      (kt.rotation.y = Math.atan2(Jt[0], Jt[1])),
      a.add(kt),
      merTrackFx(e, a, kt, Xr, xn, Ye, ge, Ve, Pe, Je),
      (t.lampPoleM = null),
      (t.lampConcM = null),
      (t.lampHousM = null),
      (t.trackLamps = null),
      (function () {
        var m = [],
          S,
          A = 1,
          R = r.wid / 2 + 9;
        for (S = 0; S < Ve; S += 30)
          for (var Y = 0; Y < 2; Y++) {
            A = Y ? -1 : 1;
            var j = (S + (Y ? 15 : 0)) % Ve,
              Z = ge[j],
              H = ge[(j + 1) % Ve],
              d = H[0] - Z[0],
              C = H[1] - Z[1],
              D = Math.sqrt(d * d + C * C) || 1,
              X = (-C / D) * A,
              $ = (d / D) * A,
              le = Pe / 2 + 10,
              re = Z[0] + X * le,
              ve = Z[1] + $ * le;
            Math.sqrt((re - Ua[0]) * (re - Ua[0]) + (ve - Ua[1]) * (ve - Ua[1])) < 30 ||
              (Math.abs(re) < R && ve > -it && ve < be) ||
              st(re, ve) < Pe / 2 + 5 ||
              m.push([re, ve, -X, -$]);
          }
        var se = m.length;
        if (((t.lampSpots = m), !!se)) {
          var He = new e.MeshStandardMaterial({ color: 10133671, roughness: 0.42, metalness: 0.75 }),
            $e = new e.MeshStandardMaterial({ color: 10724254, roughness: 0.95 }),
            Re = new e.MeshStandardMaterial({ color: 8225675, roughness: 0.35, metalness: 0.7 }),
            Me = new e.MeshBasicMaterial({ color: 9080210 }),
            je = new e.CubicBezierCurve3(
              new e.Vector3(0, 21.2, 0),
              new e.Vector3(0, 23.4, 0.6),
              new e.Vector3(0, 23.2, 3.6),
              new e.Vector3(0, 22.7, 6.4),
            ),
            he = new e.SphereGeometry(1, 20, 10);
          he.scale(0.62, 0.3, 1.25);
          var Ie = new e.CircleGeometry(1, 20);
          (Ie.rotateX(Math.PI / 2), Ie.scale(0.5, 1, 1));
          var Ze = new e.InstancedMesh(new e.CylinderGeometry(0.16, 0.34, 21.4, 12), He, se),
            xt = new e.InstancedMesh(new e.TubeGeometry(je, 18, 0.11, 7), He, se),
            ht = new e.InstancedMesh(Ie, Me, se),
            mt = new e.InstancedMesh(new e.CylinderGeometry(0.75, 0.82, 0.8, 12), $e, se),
            Xt = new e.InstancedMesh(he, Re, se),
            Oe = new e.InstancedMesh(new e.CylinderGeometry(0.5, 0.5, 0.1, 8), Re, se),
            De = new e.Matrix4(),
            rt = new e.Quaternion(),
            nt = new e.Vector3(),
            Qe = new e.Vector3(1, 1, 1),
            gt = new e.Vector3(0, 1, 0),
            jt = document.createElement("canvas");
          jt.width = jt.height = 64;
          var Tr = jt.getContext("2d"),
            aa = Tr.createRadialGradient(32, 32, 0, 32, 32, 32);
          (aa.addColorStop(0, "rgba(255,252,248,1)"),
            aa.addColorStop(0.22, "rgba(255,240,228,0.3)"),
            aa.addColorStop(1, "rgba(255,232,218,0)"),
            (Tr.fillStyle = aa),
            Tr.fillRect(0, 0, 64, 64));
          var br = new e.CanvasTexture(jt),
            yr = [],
            Ma = new e.SpriteMaterial({
              map: br,
              color: 16777215,
              transparent: !0,
              depthWrite: !1,
              blending: e.AdditiveBlending,
              toneMapped: !1,
              fog: !1,
            });
          Ma.color.setHex(16772320);
          var er = document.createElement("canvas");
          er.width = er.height = 128;
          var xa = er.getContext("2d"),
            Oa = xa.createRadialGradient(64, 64, 0, 64, 64, 64);
          (Oa.addColorStop(0, "rgba(255,236,224,1)"),
            Oa.addColorStop(0.4, "rgba(255,236,224,0.5)"),
            Oa.addColorStop(1, "rgba(255,236,224,0)"),
            (xa.fillStyle = Oa),
            xa.fillRect(0, 0, 128, 128));
          var Sr = [],
            ui = [],
            Yi = [],
            Zi = [];
          m.forEach(function (Te, wa) {
            var hi = Math.atan2(Te[2], Te[3]);
            (rt.setFromAxisAngle(gt, hi),
              nt.set(Te[0], 11.3, Te[1]),
              De.compose(nt, rt, Qe),
              Ze.setMatrixAt(wa, De),
              nt.set(Te[0], 0.25, Te[1]),
              De.compose(nt, rt, Qe),
              mt.setMatrixAt(wa, De),
              nt.set(Te[0], 0.7, Te[1]),
              De.compose(nt, rt, Qe),
              Oe.setMatrixAt(wa, De),
              nt.set(Te[0], 0, Te[1]),
              De.compose(nt, rt, Qe),
              xt.setMatrixAt(wa, De));
            var Cr = Te[0] + Te[2] * 7.3,
              tr = Te[1] + Te[3] * 7.3;
            (nt.set(Cr, 22.6, tr),
              De.compose(nt, rt, Qe),
              Xt.setMatrixAt(wa, De),
              nt.set(Cr, 22.29, tr),
              De.compose(nt, rt, Qe),
              ht.setMatrixAt(wa, De),
              Zi.push([Cr, 22, tr]));
            var tn = new e.Sprite(Ma);
            (tn.position.set(Cr, 22, tr), tn.scale.set(4.6, 4.6, 1), (tn.visible = !1), a.add(tn), yr.push(tn));
            var Da = 20,
              An = Cr,
              _e = tr,
              at = wa * 4;
            (Sr.push(
              An - Da,
              0.03,
              _e - Da,
              An + Da,
              0.03,
              _e - Da,
              An + Da,
              0.03,
              _e + Da,
              An - Da,
              0.03,
              _e + Da,
            ),
              ui.push(0, 0, 1, 0, 1, 1, 0, 1),
              Yi.push(at, at + 2, at + 1, at, at + 3, at + 2),
              t.trees.push({ x: Te[0], z: Te[1], r: 0.8 }));
          });
          var en = new e.BufferGeometry();
          (en.setAttribute("position", new e.Float32BufferAttribute(Sr, 3)),
            en.setAttribute("uv", new e.Float32BufferAttribute(ui, 2)),
            en.setIndex(Yi));
          var kr = new e.Mesh(
            en,
            new e.MeshBasicMaterial({
              map: new e.CanvasTexture(er),
              transparent: !0,
              depthWrite: !1,
              fog: !1,
              blending: e.AdditiveBlending,
              toneMapped: !1,
              polygonOffset: !0,
              polygonOffsetFactor: -8,
              polygonOffsetUnits: -8,
            }),
          );
          ((kr.renderOrder = 2),
            (kr.visible = !1),
            [Ze, xt, ht, mt, Xt, Oe].forEach(function (Te) {
              a.add(Te);
            }),
            a.add(kr),
            (t.lampPoleM = He),
            (t.lampConcM = $e),
            (t.lampHousM = Re),
            (t.trackLamps = {
              heads: Zi,
              set: function (Te) {
                ((kr.visible = Te),
                  yr.forEach(function (wa) {
                    wa.visible = Te;
                  }),
                  Me.color.setHex(Te ? 16774122 : 9080210),
                  Te &&
                    t.cineOn &&
                    Me.color.setRGB(qe.bulbEmissive, qe.bulbEmissive * 0.925, qe.bulbEmissive * 0.878));
              },
            }),
            (t.pools = kr),
            (t.slights = []));
          for (var Cn = 0; Cn < qe.lampCount; Cn++) {
            var di = new e.PointLight(qe.lampColor, qe.lampIntensity, qe.lampDistance, 2);
            ((di.visible = !1), (di.userData.pole = -1), a.add(di), t.slights.push(di));
          }
          t.trackLamps.set(zt === "night");
        }
      })(),
      (t.railM = null),
      (t.postM = null),
      (t.rockM = null),
      (t.railGrid = null),
      (function () {
        var m = Ve,
          S = Pe / 2 + 3.8,
          A = [],
          R = [],
          Y = [],
          j = [],
          Z = {},
          H,
          d,
          C,
          D = r.wid / 2 + 9,
          X = [
            [0, 0.9],
            [0.16, 1.3],
            [0, 1.7],
            [0.16, 2.1],
            [0, 2.5],
            [0.1, 2.66],
          ],
          $ = [0.55, 0.8, 0.55, 0.8, 1.5],
          le = [0.55, 0.58, 0.65],
          re = function (_e, at) {
            if (merRailGap(ge, _e, at)) return !0;
            var ar = _e - Ua[0],
              Eo = at - Ua[1];
            return (
              ar * ar + Eo * Eo < 1156 || (Math.abs(_e) < D && at > -it && at < be) || st(_e, at) < S - 2
            );
          };
        if (
          ([-1, 1].forEach(function (_e) {
            for (C = _e, t.mRk = merRailKeep(ge, m, S, re, _e), H = 0; H < m; H++) {
              var at = ge[H],
                ar = ge[(H + 1) % m],
                Eo = ge[(H + m - 1) % m],
                N0 = ge[(H + 2) % m],
                vl = function (Ar, _i) {
                  var vi = _i[0] - Ar[0],
                    mi = _i[1] - Ar[1],
                    wl = Math.sqrt(vi * vi + mi * mi) || 1;
                  return [(-mi / wl) * C, (vi / wl) * C];
                },
                rr = vl(Eo, ar),
                pi = vl(at, N0),
                Bo = at[0] + rr[0] * S,
                Lo = at[1] + rr[1] * S,
                ml = ar[0] + pi[0] * S,
                gl = ar[1] + pi[1] * S;
              if (!(re(Bo, Lo) || re(ml, gl)) && t.mRk[H]) {
                for (d = 0; d < 5; d++) {
                  var Ml = [at[0] + rr[0] * (S + X[d][0]), X[d][1], at[1] + rr[1] * (S + X[d][0])],
                    V0 = [at[0] + rr[0] * (S + X[d + 1][0]), X[d + 1][1], at[1] + rr[1] * (S + X[d + 1][0])],
                    xl = [ar[0] + pi[0] * (S + X[d + 1][0]), X[d + 1][1], ar[1] + pi[1] * (S + X[d + 1][0])],
                    H0 = [ar[0] + pi[0] * (S + X[d][0]), X[d][1], ar[1] + pi[1] * (S + X[d][0])];
                  ([Ml, V0, xl, Ml, xl, H0].forEach(function (Ar) {
                    (A.push(Ar[0], Ar[1], Ar[2]), R.push(le[0] * $[d], le[1] * $[d], le[2] * $[d]));
                  }),
                    Y.push(
                      H * 0.4,
                      X[d][1] * 0.5,
                      H * 0.4,
                      X[d + 1][1] * 0.5,
                      (H + 1) * 0.4,
                      X[d + 1][1] * 0.5,
                      H * 0.4,
                      X[d][1] * 0.5,
                      (H + 1) * 0.4,
                      X[d + 1][1] * 0.5,
                      (H + 1) * 0.4,
                      X[d][1] * 0.5,
                    ));
                }
                (H % 2 === 0 && j.push([Bo + rr[0] * 0.4, Lo + rr[1] * 0.4, Math.atan2(rr[0], rr[1])]),
                  [0, 0.5].forEach(function (Ar) {
                    var _i = Bo + (ml - Bo) * Ar,
                      vi = Lo + (gl - Lo) * Ar,
                      mi = Math.floor(_i / 8) + "," + Math.floor(vi / 8);
                    (Z[mi] = Z[mi] || []).push(_i, vi);
                  }));
              }
            }
          }),
          !!A.length)
        ) {
          var ve = t.lampSpots || [],
            se,
            He;
          for (se = 0; se < A.length / 3; se++) {
            var $e = A[se * 3],
              Re = A[se * 3 + 1],
              Me = A[se * 3 + 2],
              je = 1e9;
            for (He = 0; He < ve.length; He++) {
              var he = $e - ve[He][0],
                Ie = Me - ve[He][1],
                Ze = he * he + Ie * Ie;
              Ze < je && (je = Ze);
            }
            var xt = Math.exp(-je / 300),
              ht = 0.9 + 0.1 * Math.sin($e * 2.3 + Me * 1.7 + Re * 9);
            ((R[se * 3] = R[se * 3] * ht * (1 + 2.2 * xt)),
              (R[se * 3 + 1] = R[se * 3 + 1] * ht * (1 + 2.1 * xt)),
              (R[se * 3 + 2] = R[se * 3 + 2] * ht * (1 + 2 * xt)));
          }
          var mt = new e.BufferGeometry();
          (mt.setAttribute("position", new e.Float32BufferAttribute(A, 3)),
            mt.setAttribute("color", new e.Float32BufferAttribute(R, 3)),
            mt.setAttribute("uv", new e.Float32BufferAttribute(Y, 2)),
            mt.computeVertexNormals(),
            (t.railM = new e.MeshBasicMaterial({ color: 16777215, vertexColors: !0, side: e.DoubleSide })));
          var Xt = new e.Mesh(mt, t.railM);
          a.add(Xt);
          var Oe = new e.MeshStandardMaterial({
            color: 0x5c6068,
            metalness: 0.45,
            roughness: 0.62,
            envMapIntensity: 0.6,
            side: e.DoubleSide,
          });
          t.cineSw.push({ mesh: Xt, basic: t.railM, pbr: Oe });
          var De = new e.BoxGeometry(0.35, 2.6, 0.35);
          (De.translate(0, 1.3, 0), (t.postM = new e.MeshBasicMaterial({ color: 9080987 })));
          var rt = new e.InstancedMesh(De, t.postM, j.length),
            nt = new e.Matrix4(),
            Qe = new e.Quaternion(),
            gt = new e.Vector3(),
            jt = new e.Vector3(1, 1, 1),
            Tr = new e.Vector3(0, 1, 0);
          (j.forEach(function (_e, at) {
            (Qe.setFromAxisAngle(Tr, _e[2]),
              gt.set(_e[0], 0, _e[1]),
              nt.compose(gt, Qe, jt),
              rt.setMatrixAt(at, nt));
          }),
            a.add(rt),
            (t.railGrid = Z),
            t.cineSw.push({ mesh: rt, basic: t.postM, pbr: Oe }));
          for (var aa = ca(91), br = [], yr = 0; br.length < 420 && yr < 4e3;) {
            yr++;
            var Ma = Math.floor(aa() * m),
              er = aa() < 0.5 ? -1 : 1,
              xa = ge[Ma],
              Oa = ge[(Ma + 1) % m],
              Sr = Oa[0] - xa[0],
              ui = Oa[1] - xa[1],
              Yi = Math.sqrt(Sr * Sr + ui * ui) || 1,
              Zi = S + 2 + aa() * 8,
              en = xa[0] - (ui / Yi) * er * Zi,
              kr = xa[1] + (Sr / Yi) * er * Zi;
            re(en, kr) || st(en, kr) < S + 1 || br.push([en, kr, 1.4 + aa() * 3.2, aa() * 6.28, aa()]);
          }
          if (br.length) {
            var Cn = new e.DodecahedronGeometry(1, 1),
              di = Cn.attributes.position,
              Te = Cn.attributes.normal,
              wa = [],
              hi;
            for (hi = 0; hi < di.count; hi++) {
              var Cr = 0.5 + 0.5 * Math.max(0, Te.getY(hi));
              wa.push(Cr, Cr, Cr);
            }
            (Cn.setAttribute("color", new e.Float32BufferAttribute(wa, 3)),
              (t.rockM = new e.MeshBasicMaterial({ color: 16777215, vertexColors: !0 })));
            var tr = new e.InstancedMesh(Cn, t.rockM, br.length),
              tn = new e.Color(),
              Da = new e.Quaternion(),
              An = new e.Vector3();
            (br.forEach(function (_e, at) {
              (gt.set(_e[0], _e[2] * 0.25, _e[1]),
                Da.setFromAxisAngle(Tr, _e[3]),
                An.set(_e[2] * 1.3, _e[2] * 0.8, _e[2]),
                nt.compose(gt, Da, An),
                tr.setMatrixAt(at, nt),
                tn.setHex(0x2a2a2a).lerp(new e.Color(0x333333), _e[4]),
                tr.setColorAt(at, tn));
            }),
              a.add(tr),
              t.cineSw.push({
                mesh: tr,
                basic: t.rockM,
                pbr: new e.MeshStandardMaterial({
                  color: 16777215,
                  vertexColors: !0,
                  roughness: 0.9,
                  metalness: 0,
                }),
              }));
          }
        }
      })());
    var Fi = (function () {
      var m = ca(7),
        S = [],
        A = [],
        R = [],
        Y = [
          [3.2, 3.4, 1.8],
          [2.7, 3.2, 3.7],
          [2.2, 3, 5.4],
          [1.65, 2.7, 7],
          [1.05, 2.5, 8.4],
          [0.5, 2, 9.9],
        ],
        j = function (H, d, C, D) {
          (S.push(H[0], H[1], H[2]), A.push(d[0], d[1], d[2]), R.push(C, D));
        };
      Y.forEach(function (H, d) {
        var C = H[0],
          D = H[1],
          X = H[2],
          $ = 11,
          le = [],
          re,
          ve = 0.72 + d * 0.07;
        for (re = 0; re < $; re++) {
          var se = (re / $) * Math.PI * 2 + m() * 0.25,
            He = C * (0.78 + m() * 0.36);
          le.push([Math.cos(se) * He, X - 0.25 - m() * 0.55, Math.sin(se) * He, se]);
        }
        var $e = [m() * 0.12 - 0.06, X + D, m() * 0.12 - 0.06],
          Re = [0, X + 0.35, 0];
        for (re = 0; re < $; re++) {
          var Me = le[re],
            je = le[(re + 1) % $],
            he = 0.82 + 0.26 * Math.cos(Me[3] - 0.8),
            Ie = 0.82 + 0.26 * Math.cos(je[3] - 0.8),
            Ze = Math.min(1.25, ve * 1.18);
          (j(Me, [0.5 * ve * he, 0.55 * ve * he, 0.5 * ve * he], re / $, 0),
            j(je, [0.5 * ve * Ie, 0.55 * ve * Ie, 0.5 * ve * Ie], (re + 1) / $, 0),
            j($e, [Ze, Ze * 1.04, Ze * 0.95], (re + 0.5) / $, 1),
            j(Me, [0.22, 0.25, 0.22], re / $, 0),
            j(Re, [0.12, 0.14, 0.12], (re + 0.5) / $, 0.3),
            j(je, [0.22, 0.25, 0.22], (re + 1) / $, 0));
        }
      });
      var Z = new e.BufferGeometry();
      return (
        Z.setAttribute("position", new e.Float32BufferAttribute(S, 3)),
        Z.setAttribute("color", new e.Float32BufferAttribute(A, 3)),
        Z.setAttribute("uv", new e.Float32BufferAttribute(R, 2)),
        Z.computeVertexNormals(),
        Z.computeBoundingSphere(),
        Z
      );
    })();
    ((i.vertexColors = !0), (i.side = e.DoubleSide), i.color.setHex(5211478), (i.needsUpdate = !0));
    var ke = t.worldBox,
      pe = ca(97),
      Ga = ca(313),
      ei = Math.sqrt(r.wid * r.wid + r.len * r.len) / 2 + 40,
      Tt;
    t.hills = [];
    var ti = function (m, S, A) {
      return (
        st(m, S) > A + Pe / 2 + 8 &&
        Math.sqrt(m * m + S * S) > A + ei + 30 &&
        !(Math.abs(m) < oe / 2 + A + 6 && S > 0)
      );
    };
    for (Tt = 0; Tt < 300 && t.hills.length < 8; Tt++) {
      var qi = 35 + Ga() * 50,
        Ka = ke.x0 + Ga() * (ke.x1 - ke.x0),
        ai = ke.z0 + Ga() * (ke.z1 - ke.z0);
      ti(Ka, ai, qi) && t.hills.push({ x: Ka, z: ai, r: qi, h: 3 + Ga() * 7 });
    }
    var za = (ke.x0 + ke.x1) / 2,
      fs = (ke.z0 + ke.z1) / 2,
      us = (ke.x1 - ke.x0) / 2,
      jr = (ke.z1 - ke.z0) / 2;
    for (Tt = 0; Tt < 26; Tt++) {
      var ri = (Tt / 26) * Math.PI * 2 + Ga() * 0.2,
        Mr = 140 + Ga() * 150,
        ni = Math.cos(ri),
        Yr = Math.sin(ri),
        ii = 1 / Math.max(Math.abs(ni) / us, Math.abs(Yr) / jr),
        oi = za + ni * (ii + Mr * 0.55),
        wo = fs + Yr * (ii + Mr * 0.55);
      st(oi, wo) > Mr + Pe / 2 + 4 && t.hills.push({ x: oi, z: wo, r: Mr, h: 16 + Ga() * 40 });
    }
    var Wi = t.groundMesh ? t.groundMesh.material : new e.MeshBasicMaterial({ color: 8299359 }),
      Zr = [];
    (t.hills.forEach(function (m) {
      var S = m.r > 100 ? 28 : 18,
        A = new e.PlaneGeometry(m.r * 2, m.r * 2, S, S);
      A.rotateX(-Math.PI / 2);
      var R = A.attributes.position,
        Y = A.attributes.uv,
        j;
      for (j = 0; j < R.count; j++) {
        var Z = R.getX(j),
          H = R.getZ(j),
          d = Math.sqrt(Z * Z + H * H),
          C = d < m.r ? m.h * (0.5 + 0.5 * Math.cos((Math.PI * d) / m.r)) : 0;
        (R.setY(j, C - 0.1), Y.setXY(j, ((m.x + Z) / 1500 + 1) / 2, (-(m.z + H) / 1500 + 1) / 2));
      }
      A.computeVertexNormals();
      var D = new e.Mesh(A, Wi);
      (D.position.set(m.x, 0, m.z), a.add(D), Zr.push(D));
    }),
      (function () {
        if (t.groundMesh) {
          var m = new e.MeshStandardMaterial({
            color: 0x0c1610,
            roughness: 0.98,
            metalness: 0,
            envMapIntensity: 0,
          });
          (sn(e, Yt.ground.normal, !1, 213, 213, Gn.mossN, function (S) {
            ((m.normalMap = S), (m.needsUpdate = !0));
          }),
            sn(e, Yt.ground.roughness, !1, 213, 213, Gn.mossR, function (S) {
              ((m.roughnessMap = S), (m.needsUpdate = !0));
            }),
            !1 &&
              sn(e, Yt.ground.map, !0, 213, 213, null, function (S) {
                ((m.map = S), (m.needsUpdate = !0));
              }),
            [t.groundMesh].concat(Zr).forEach(function (S) {
              t.cineSw.push({ mesh: S, basic: Wi, pbr: m });
            }));
        }
      })());
    for (
      var Ni = 1900,
        Pa = new e.InstancedMesh(Fi, i, Ni),
        Ja = new e.InstancedMesh(new e.CylinderGeometry(0.28, 0.42, 3, 6), o, Ni),
        Ct = 0,
        ea = 0,
        $a = new e.Matrix4(),
        xr = new e.Quaternion(),
        Ia = new e.Vector3(),
        Ta = new e.Vector3(),
        _r = new e.Euler(),
        Qr = new e.Color(),
        Ut,
        Gt,
        ga,
        Vi = function (m, S, A) {
          return m > ke.x0 - A && m < ke.x1 + A && S > ke.z0 - A && S < ke.z1 + A;
        },
        Hi = function (m, S) {
          ga = 1.1 + pe() * 1.5;
          var A = ga * (0.85 + pe() * 0.3),
            R = ga * (0.9 + pe() * 0.3),
            Y = lo(m, S) - 0.15;
          (t.trees.push({ x: m, z: S, r: 0.6 * ga + 1 }),
            _r.set((pe() - 0.5) * 0.08, pe() * Math.PI * 2, (pe() - 0.5) * 0.08),
            xr.setFromEuler(_r),
            Ia.set(m, Y, S),
            Ta.set(A, R, A),
            $a.compose(Ia, xr, Ta),
            Pa.setMatrixAt(Ct, $a));
          var j = 0.8 + pe() * 0.4;
          (Qr.setRGB(j * (0.95 + pe() * 0.1), j, j * (0.92 + pe() * 0.1)),
            Pa.setColorAt(Ct, Qr),
            xr.identity(),
            Ia.set(m, Y + 1.5 * R, S),
            Ta.set(A, R, A),
            $a.compose(Ia, xr, Ta),
            Ja.setMatrixAt(Ct, $a),
            Ct++);
        },
        yn = function (m, S) {
          return m * m + S * S > ei * ei && !(Math.abs(m) < oe / 2 + 4 && S > 0) && st(m, S) > Pe / 2 + 9;
        };
      Ct < 1250 && ea < 3e4;
    ) {
      ea++;
      var Sn = Math.floor(pe() * Ve),
        Kr = ge[Sn],
        Jr = ge[(Sn + 1) % Ve],
        si = Jr[0] - Kr[0],
        ta = Jr[1] - Kr[1],
        Ui = Math.sqrt(si * si + ta * ta) || 1,
        bo = pe() < 0.5 ? -1 : 1,
        yo = Pe / 2 + 10 + Math.pow(pe(), 1.7) * 90;
      ((Ut = Kr[0] - (ta / Ui) * bo * yo),
        (Gt = Kr[1] + (si / Ui) * bo * yo),
        !(!yn(Ut, Gt) || !Vi(Ut, Gt, 200)) && Hi(Ut, Gt));
    }
    for (ea = 0; Ct < 1500 && ea < 2e4;)
      (ea++,
        (Ut = ke.x0 + pe() * (ke.x1 - ke.x0)),
        (Gt = ke.z0 + pe() * (ke.z1 - ke.z0)),
        !(!yn(Ut, Gt) || st(Ut, Gt) < Pe / 2 + 40) && Hi(Ut, Gt));
    ea = 0;
    for (
      var So = qn() ? 380 : 900, ko = Ds(e, ql, Yt.pine.map), kn = new e.InstancedMesh(Os(e, 12, 24, 3), ko, So), li = 0;
      li < So && ea < 4e4;
    )
      if (
        (ea++,
        (Ut = ke.x0 - 220 + pe() * (ke.x1 - ke.x0 + 440)),
        (Gt = ke.z0 - 220 + pe() * (ke.z1 - ke.z0 + 440)),
        !(Vi(Ut, Gt, -10) || !yn(Ut, Gt)))
      ) {
        var Co = 0.9 + pe() * 1;
        (xr.setFromAxisAngle(new e.Vector3(0, 1, 0), pe() * 6.283),
          Ia.set(Ut, lo(Ut, Gt) - 0.2, Gt),
          Ta.set(Co * (0.9 + pe() * 0.3), Co * (0.85 + pe() * 0.4), Co * (0.9 + pe() * 0.3)),
          $a.compose(Ia, xr, Ta),
          kn.setMatrixAt(li, $a));
        var Ao = 0.75 + pe() * 0.4;
        (Qr.setRGB(Ao, Ao, Ao), kn.setColorAt(li, Qr), li++);
      }
    ((kn.count = li),
      a.add(kn),
      (t.pineCardM = ko),
      (function () {
        for (
          var m = Os(e, 2.8, 1.8, 3),
            S = Ds(e, Fl, Yt.shrub.map),
            A = 720,
            R = new e.InstancedMesh(m, S, A),
            Y = 0,
            j = 0,
            Z = new e.Quaternion(),
            H = new e.Color();
          Y < A && j < 2e4;
        ) {
          j++;
          var d, C;
          if (pe() < 0.6) {
            var D = Math.floor(pe() * Ve),
              X = ge[D],
              $ = ge[(D + 1) % Ve],
              le = $[0] - X[0],
              re = $[1] - X[1],
              ve = Math.sqrt(le * le + re * re) || 1,
              se = pe() < 0.5 ? -1 : 1,
              He = Pe / 2 + 7 + pe() * 26;
            ((d = X[0] - (re / ve) * se * He), (C = X[1] + (le / ve) * se * He));
          } else {
            var $e = t.trees[Math.floor(pe() * t.trees.length)];
            if (!$e) continue;
            ((d = $e.x + (pe() - 0.5) * 9), (C = $e.z + (pe() - 0.5) * 9));
          }
          if (!(!yn(d, C) || st(d, C) < Pe / 2 + 6)) {
            var Re = 1 + pe() * 1.8;
            (Z.setFromAxisAngle(new e.Vector3(0, 1, 0), pe() * 6.28),
              Ia.set(d, lo(d, C) - 0.1, C),
              Ta.set(Re * (0.9 + pe() * 0.4), Re * (0.7 + pe() * 0.5), Re * (0.9 + pe() * 0.4)),
              $a.compose(Ia, Z, Ta),
              R.setMatrixAt(Y, $a));
            var Me = 0.75 + pe() * 0.45;
            (H.setRGB(Me * (0.9 + pe() * 0.2), Me, Me * 0.9), R.setColorAt(Y, H), Y++);
          }
        }
        ((R.count = Y), a.add(R), (t.bushM = S));
      })(),
      (Pa.count = Ct),
      (Ja.count = Ct),
      a.add(Pa),
      a.add(Ja),
      (t.yardTrees = [Pa, Ja, kn]),
      ce.outsidePhoto &&
        t.hasPhoto &&
        ((Pa.visible = !1), (Ja.visible = !1), (kn.visible = !1), (t.trees = [])));
    var ds = new e.MeshBasicMaterial({ map: w, color: 16777215, alphaTest: 0.4, side: e.DoubleSide }),
      Xi = new e.BufferGeometry(),
      wr = 1.2,
      ji = 0.9;
    (Xi.setAttribute(
      "position",
      new e.Float32BufferAttribute(
        [
          -wr / 2,
          0,
          0,
          wr / 2,
          0,
          0,
          wr / 2,
          ji,
          0,
          -wr / 2,
          ji,
          0,
          0,
          0,
          -wr / 2,
          0,
          0,
          wr / 2,
          0,
          ji,
          wr / 2,
          0,
          ji,
          -wr / 2,
        ],
        3,
      ),
    ),
      Xi.setAttribute(
        "uv",
        new e.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1], 2),
      ),
      Xi.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]));
    for (
      var hs = qn() ? 360 : 900, ci = new e.InstancedMesh(Xi, ds, hs), fi = 0, ps = 0, $r = ca(555), W = new e.Color();
      fi < hs && ps < 6e3;
    ) {
      ps++;
      var U = ($r() - 0.5) * 150,
        _ = -60 + $r() * (n + l + 40);
      if (
        !(Math.abs(U) < Dt + 9 && _ > -it - 8 && _ < it + 4) &&
        !(Math.abs(U) < h + 1.5 && _ > n - 1) &&
        !(Math.abs(st(U, _)) < Pe / 2 + 1.5)
      ) {
        var te = 0.7 + $r() * 1.1;
        (Lt.set(U, 0, _),
          de.setFromAxisAngle(new e.Vector3(0, 1, 0), $r() * 6.283),
          Ae.set(te, te * (0.8 + $r() * 0.6), te),
          pt.compose(Lt, de, Ae),
          ci.setMatrixAt(fi, pt),
          W.setHSL(0.24 + $r() * 0.05, 0.4, 0.6 + $r() * 0.25),
          ci.setColorAt(fi, W),
          fi++);
      }
    }
    ((ci.count = fi),
      a.add(ci),
      t.yardTrees.push(ci),
      (t.yardMats = [x, i, o, P, N.material, K, ne, ds, ut, La, Je, Xr, xn].concat(
        tt,
        [
          t.lampPoleM,
          t.lampConcM,
          t.lampHousM,
          t.kerbM,
          t.bushM,
          t.pineCardM,
          t.railM,
          t.postM,
          t.rockM,
        ].filter(Boolean),
      )),
      (t.yardExt = tt.filter(function (m) {
        return !!m.emissive;
      })),
      (t.yardRoad = [N].concat(me, [Ge, We, et, Vt, Ft, _a, kt])),
      t.envTone && t.envTone(zt === "night"));
  }
  function D0(e, a) {
    var r = ie,
      n = r.wid / 2,
      i = r.len / 2,
      o = Math.max(9, Math.min(25, parseFloat(V("ht").value) || 9)),
      s = o - 9;
    if (!t) {
      let U = function (d, C, D) {
          var X = document.createElement("div");
          return (
            (X.className = "lc-sec"),
            X.setAttribute("data-sec", d),
            (X.innerHTML =
              '<p class="lc-lsw-title">' +
              C +
              '</p><div class="lc-lsw-btns" role="group" aria-label="' +
              C +
              '">' +
              D +
              "</div>"),
            w.appendChild(X),
            X
          );
        },
        _ = function (d, C, D) {
          return '<button type="button" data-' + d + '="' + C + '" aria-pressed="false">' + D + "</button>";
        },
        te = function () {
          if (
            a.classList.contains("lc-open") &&
            !document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            t.wasFs
          ) {
            ((t.wasFs = !1), Si());
            return;
          }
          ((t.wasFs = !!(document.fullscreenElement || document.webkitFullscreenElement)),
            setTimeout(function () {
              t.group && Nn();
            }, 80));
        },
        S = function (d) {
          var C = Be.getBoundingClientRect(),
            D = C.width / 2,
            X = d.clientX - (C.left + D),
            $ = d.clientY - (C.top + D),
            le = Math.hypot(X, $);
          (le > D && ((X = (X / le) * D), ($ = ($ / le) * D), (le = D)),
            (Ne.style.transform = "translate(" + X + "px," + $ + "px)"));
          var re = le / D,
            ve = 0.14;
          if (re < ve) ((t.joy.x = 0), (t.joy.y = 0));
          else {
            var se = (re - ve) / (1 - ve);
            ((t.joy.x = (X / le) * se), (t.joy.y = ($ / le) * se));
          }
          ((t.touched = !0), Gr(), xi(!0), oo());
        },
        A = function (d) {
          (d && d.pointerId !== Wt) || ((Wt = null), (t.joy.x = 0), (t.joy.y = 0), (Ne.style.transform = ""));
        },
        R = function (d) {
          var C = p.getBoundingClientRect();
          (Ot.set(((d.clientX - C.left) / C.width) * 2 - 1, -((d.clientY - C.top) / C.height) * 2 + 1),
            Et.setFromCamera(Ot, t.camera));
        },
        Y = function (d) {
          if (t.walk || !t.handles || !t.handles.visible || !a.classList.contains("lc-open")) return null;
          R(d);
          var C = Et.intersectObjects(t.hitMeshes, !1)[0];
          return C ? C.object.userData.axis : null;
        },
        j = function (d) {
          var C = new e.Matrix4().copy(t.group.matrixWorld).invert(),
            D = new e.Ray().copy(Et.ray).applyMatrix4(C),
            X = t.hd.base,
            $;
          d === "h"
            ? (($ = t.camera.position.clone().applyMatrix4(C).sub(X)),
              ($.y = 0),
              $.lengthSq() < 1e-6 && $.set(0, 0, 1),
              $.normalize())
            : ($ = new e.Vector3(0, 1, 0));
          var le = new e.Vector3();
          return D.intersectPlane(new e.Plane().setFromNormalAndCoplanarPoint($, X), le) ? le : null;
        },
        Z = function (d) {
          var C = new e.Matrix4().copy(t.group.matrixWorld).invert(),
            D = new e.Ray().copy(Et.ray).applyMatrix4(C),
            X = new e.Vector3();
          return D.intersectPlane(new e.Plane(new e.Vector3(0, 1, 0), -d), X) ? X : null;
        },
        H = function (d) {
          return t.walk || !t.ring || !t.ring.visible || !t.rotHit || !ct || !a.classList.contains("lc-open")
            ? !1
            : (R(d), Et.intersectObject(t.rotHit, !1).length > 0);
        };
      var kn = U,
        li = _,
        Co = te,
        Ao = S,
        ds = A,
        Xi = R,
        wr = Y,
        ji = j,
        hs = Z,
        ci = H,
        l = new e.WebGLRenderer({ antialias: !0, alpha: !0 });
      (Is() === "high" && ((l.shadowMap.enabled = !0), (l.shadowMap.type = e.PCFSoftShadowMap)),
        l.setPixelRatio(Math.min(window.devicePixelRatio || 1, qn() ? 1.35 : 2)),
        a.insertBefore(l.domElement, a.firstChild),
        (t = {
          host: a,
          sel: -1,
          sound: !0,
          renderer: l,
          scene: new e.Scene(),
          camera: new e.PerspectiveCamera(32, 1, 0.5, qn() ? 1400 : 9e3),
          yaw: 0,
          running: !1,
          drag: null,
        }),
        (t.hemi = new e.HemisphereLight(16777215, 11187142, 2.4)),
        t.scene.add(t.hemi));
      var c = new e.DirectionalLight(16777215, 0.9);
      ((t.sun = c), c.position.set(30, 70, 50), t.scene.add(c), I0(e));
      try {
        t.envMap = Ql(e, l);
      } catch {
        t.envMap = null;
      }
      t.pl = [];
      for (var f = 0; f < 6; f++) {
        var u = new e.SpotLight(16777215, 0, 26, 1.1, 0.9, 2);
        (u.position.set(0, 8, 0),
          u.target.position.set(0, 0, 0),
          t.scene.add(u),
          t.scene.add(u.target),
          t.pl.push(u));
      }
      var p = l.domElement,
        v = document.createElement("div");
      ((v.className = "lc-zoom"),
        (v.innerHTML =
          '<button type="button" class="lc-zbtn" data-z="in" aria-label="Zoom in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg></button><button type="button" class="lc-zbtn" data-z="out" aria-label="Zoom out"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" aria-hidden="true"><path d="M4 12h16"/></svg></button>'),
        a.appendChild(v));
      var w = document.createElement("div");
      ((w.className = "lc-lsw"),
        (w.innerHTML =
          '<p class="lc-lsw-title">Light control</p><div class="lc-lsw-btns" role="group" aria-label="Light switch"><button type="button" data-lm="all" aria-pressed="true">All</button><button type="button" data-lm="one" aria-pressed="false">1 light</button><button type="button" data-lm="off" aria-pressed="false">Off</button></div><p class="lc-lsw-note" aria-live="polite"></p><p class="lc-lsw-help"></p>'),
        Array.prototype.forEach.call(w.children, function (d) {
          d.setAttribute("data-tab", "lights");
        }));
      var y = document.createElement("div");
      ((y.className = "lc-tabs"),
        y.setAttribute("role", "group"),
        y.setAttribute("aria-label", "Control sections"),
        (y.innerHTML =
          '<button type="button" data-tabsel="lights" aria-pressed="true">Lights</button><button type="button" data-tabsel="scene" aria-pressed="false">Scene</button><button type="button" data-tabsel="cars" aria-pressed="false">Cars</button><button type="button" data-tabsel="setup" aria-pressed="false">Setup</button>'),
        a.appendChild(w),
        (t.sw = w),
        w.addEventListener("click", function (d) {
          var C = d.target.closest("button");
          if (C)
            if (C.hasAttribute("data-tabsel"))
              (d.stopPropagation(),
                w.setAttribute("data-tab", C.getAttribute("data-tabsel")),
                w.querySelectorAll("[data-tabsel]").forEach(function (le) {
                  le.setAttribute("aria-pressed", le === C ? "true" : "false");
                }));
            else if (C.hasAttribute("data-lm")) (d.stopPropagation(), (Fe = C.getAttribute("data-lm")), ya());
            else if (C.hasAttribute("data-cars"))
              (d.stopPropagation(), (ct = C.getAttribute("data-cars") === "1"), ya());
            else if (C.hasAttribute("data-time"))
              (d.stopPropagation(), (zt = "night"), ya());
            else if (C.hasAttribute("data-view"))
              (d.stopPropagation(), t.drive && or(!0), bi(C.getAttribute("data-view") === "1"));
            else if (C.hasAttribute("data-race")) (d.stopPropagation(), uo());
            else if (C.hasAttribute("data-drive"))
              (d.stopPropagation(), t.raceOn && sl(), ts(t.sel >= 0 ? t.sel : 0));
            else if (C.hasAttribute("data-snd")) {
              if (
                (d.stopPropagation(),
                (t.sound = C.getAttribute("data-snd") === "1"),
                t.tvVid && t.tvOn !== !1)
              ) {
                t.tvVid.muted = !t.sound;
                var D = t.tvVid.play();
                D && D.catch && D.catch(function () {});
              }
              (cr(), Wa());
            } else if (C.hasAttribute("data-tv"))
              (d.stopPropagation(), q0(C.getAttribute("data-tv") === "1"));
            else if (C.hasAttribute("data-door"))
              (d.stopPropagation(), ln(C.getAttribute("data-door") === "1"));
            else if (C.hasAttribute("data-k"))
              (d.stopPropagation(), (Br = C.getAttribute("data-k") === "1" ? 1 : 0), Mt());
            else if (C.hasAttribute("data-car"))
              (d.stopPropagation(), C.getAttribute("data-car") === "1" ? L0() : R0());
            else if (C.hasAttribute("data-ca")) {
              d.stopPropagation();
              var X = C.getAttribute("data-ca");
              X === "t" ? G0() : z0(X === "l" ? -1 : 1);
            } else if (C.hasAttribute("data-sz")) {
              d.stopPropagation();
              var $ = C.getAttribute("data-sz").split("x");
              ((V("len").value = $[0]),
                (V("wid").value = $[1]),
                t.drive && ((t.resumeDrive = t.drive.i), (t.resumeRace = !!t.raceOn), or(!0)),
                (ee = null),
                (t.sel = -1),
                Mt());
            } else
              C.hasAttribute("data-t") &&
                (d.stopPropagation(), (an = parseInt(C.getAttribute("data-t"), 10) || 0), Mt());
        }),
        w.addEventListener("pointerdown", function (d) {
          d.stopPropagation();
        }));
      var vt = document.createElement("div");
      ((vt.className = "lc-dim"),
        (vt.hidden = !0),
        (vt.innerHTML =
          '<p class="lc-lsw-title">Dimming control</p><div class="lc-dim-row"><div class="lc-dim-track"><input type="range" min="1" max="100" step="1" value="100" aria-label="Dimming level" aria-orientation="vertical"><div class="lc-dim-ticks"><button type="button" data-d="100" style="top:8.0px" aria-label="Set dimming to 100 percent">100%</button><button type="button" data-d="75" style="top:30.2px" aria-label="Set dimming to 75 percent">75%</button><button type="button" data-d="50" style="top:52.4px" aria-label="Set dimming to 50 percent">50%</button><button type="button" data-d="25" style="top:74.7px" aria-label="Set dimming to 25 percent">25%</button><button type="button" data-d="1" style="top:96.0px" aria-label="Set dimming to 1 percent">1%</button></div></div><div class="lc-dim-read"><output>100%</output><div class="lc-dim-fc"><b>0</b><span>foot candles</span></div></div></div>'),
        w.appendChild(vt),
        U("view", "View", _("view", 0, "Overview") + _("view", 1, "Walk around")),
        U("time", "Time of day", _("time", "day", "Day") + _("time", "night", "Night")),
        U("tv", "TV power", _("tv", 1, "On") + _("tv", 0, "Off")),
        ce.tvVideo && U("snd", "TV sound", _("snd", 0, "Off") + _("snd", 1, "On")),
        U("k", "Color temperature", _("k", 0, "Standard") + _("k", 1, "Warm")));
      var E = U("scene", "Scene", _("cars", 1, "Cars") + _("cars", 0, "No cars")),
        M = document.createElement("div");
      ((M.className = "lc-lsw-btns"),
        M.setAttribute("role", "group"),
        M.setAttribute("aria-label", "Garage doors"),
        (M.innerHTML = _("door", 0, "Doors closed") + _("door", 1, "Doors open")),
        E.appendChild(M));
      var g = [];
      var b = U("size", "Garage size", g.join("")),
        k = document.createElement("span");
      ((k.className = "lc-sz-read"),
        b.firstChild.appendChild(k),
        (b = U("cars", "Cars", "")),
        b.removeChild(b.lastChild));
      var L = document.createElement("span");
      ((L.className = "lc-sz-read lc-car-count"), b.firstChild.appendChild(L));
      var x = document.createElement("div");
      ((x.className = "lc-lsw-btns"),
        x.setAttribute("role", "group"),
        x.setAttribute("aria-label", "Add or remove a car"),
        (x.innerHTML =
          '<button type="button" data-car="-1" aria-pressed="false">\u2212 Car</button><button type="button" data-car="1" aria-pressed="false">+ Car</button>'),
        b.appendChild(x));
      var P = document.createElement("div");
      ((P.className = "lc-lsw-btns"),
        P.setAttribute("role", "group"),
        P.setAttribute("aria-label", "Turn the selected car or tidy the cars"),
        (P.innerHTML =
          '<button type="button" data-ca="l" aria-label="Turn the selected car left" aria-pressed="false">\u21BA Left</button><button type="button" data-ca="r" aria-label="Turn the selected car right" aria-pressed="false">Right \u21BB</button><button type="button" data-ca="t" aria-pressed="false">Tidy up</button>'),
        b.appendChild(P));
      var h = document.createElement("div");
      ((h.className = "lc-lsw-btns"),
        h.setAttribute("role", "group"),
        h.setAttribute("aria-label", "Drive a car"),
        (h.innerHTML = '<button type="button" data-drive="1" aria-pressed="false">Free drive</button>'),
        b.appendChild(h));
      var B = {
        view: "scene",
        tv: "scene",
        snd: "scene",
        scene: "scene",
        time: "lights",
        k: "lights",
        size: "setup",
        cars: "cars",
        cmp: "setup",
      };
      (Array.prototype.forEach.call(w.children, function (d) {
        var C = d.getAttribute && d.getAttribute("data-sec");
        C && B[C] && d.setAttribute("data-tab", B[C]);
      }),
        vt.setAttribute("data-tab", "lights"));
      var G = Array.prototype.slice.call(w.children);
      ([
        ["lights", ""],
        ["scene", "Scene"],
        ["cars", "Cars"],
        ["setup", "Setup"],
      ].forEach(function (d) {
        if (d[1]) {
          var C = document.createElement("p");
          ((C.className = "lc-grp"),
            (C.textContent = d[1]),
            C.setAttribute("data-tab", d[0]),
            w.appendChild(C));
        }
        G.filter(function (D) {
          return D.getAttribute("data-tab") === d[0];
        }).forEach(function (D) {
          w.appendChild(D);
        });
      }),
        (t.dim = vt),
        vt.addEventListener("pointerdown", function (d) {
          d.stopPropagation();
        }),
        vt.querySelector(".lc-dim-ticks").addEventListener("click", function (d) {
          var C = d.target.closest("[data-d]");
          C && ((on = parseInt(C.getAttribute("data-d"), 10) || 100), ya());
        }),
        vt.querySelector("input").addEventListener("input", function (d) {
          ((on = parseInt(d.target.value, 10) || 100), ya());
        }));
      var z = document.createElement("button");
      ((z.type = "button"),
        (z.className = "lc-zbtn lc-expand"),
        z.setAttribute("aria-label", "Open larger view"),
        (z.textContent = "\u2922 Expand"),
        a.appendChild(z),
        (t.xb = z),
        z.addEventListener("click", function () {
          a.classList.contains("lc-open") ? Si() : po();
        }),
        (t.bd = document.createElement("div")),
        (t.bd.className = "lc-backdrop"),
        Qi.appendChild(t.bd),
        t.bd.addEventListener("click", Si),
        document.addEventListener("keydown", function (d) {
          if (d.key === "Escape" && a.classList.contains("lc-open")) {
            if (t.egg && t.egg.busy) {
              t.egg.ready && t.egg.cancelFn && t.egg.cancelFn();
              return;
            }
            t.drive && or();
          }
        }),
        window.addEventListener("resize", function () {
          t.group && Nn();
        }),
        document.addEventListener("fullscreenchange", te),
        document.addEventListener("webkitfullscreenchange", te),
        v.addEventListener("click", function (d) {
          var C = d.target.closest(".lc-zbtn");
          C && pl(C.getAttribute("data-z") === "in" ? 1.35 : 1 / 1.35);
        }),
        p.addEventListener(
          "wheel",
          function (d) {
            if (!(!a.classList.contains("lc-open") && !d.ctrlKey && !d.metaKey)) {
              if ((d.preventDefault(), t.drive)) {
                var C = t.drive.cam;
                ((C.dist = Math.min(
                  50,
                  Math.max(5, C.dist * Math.exp(Math.max(-120, Math.min(120, d.deltaY)) * 0.0015)),
                )),
                  It(),
                  ye());
                return;
              }
              if (t.walk) {
                Ns(-Math.max(-120, Math.min(120, d.deltaY)) * 0.03);
                return;
              }
              pl(Math.exp(-Math.max(-120, Math.min(120, d.deltaY)) * 0.0015));
            }
          },
          { passive: !1 },
        ));
      var Q = document.createElement("div");
      ((Q.className = "lc-dragtip"), Q.setAttribute("aria-live", "polite"), a.appendChild(Q), (t.tip = Q));
      var J = document.createElement("div");
      J.className = "lc-howto";
      var q = function (d) {
          return '<svg viewBox="0 0 26 26" aria-hidden="true">' + d + "</svg>";
        },
        O = '<circle cx="13" cy="13" r="12" fill="#0b3a74"/>';
      ((J.innerHTML =
        '<span data-h="look">' +
        q(
          O +
            '<path d="M6 13h14M6 13l3-3M6 13l3 3M20 13l-3-3M20 13l-3 3" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
        ) +
        'Drag to look around</span><span data-h="zoom">' +
        q(
          O +
            '<rect x="9" y="5" width="8" height="16" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M13 8v4" stroke="#ffc233" stroke-width="2" stroke-linecap="round"/>',
        ) +
        'Scroll to zoom</span><span data-h="size">' +
        q(
          O +
            '<circle cx="13" cy="13" r="4" fill="#ffc233"/><path d="M4.5 13h4M17.5 13h4M4.5 13l2-2M4.5 13l2 2M21.5 13l-2-2M21.5 13l-2 2" fill="none" stroke="#ffc233" stroke-width="1.6" stroke-linecap="round"/>',
        ) +
        'Gold dots resize</span><span data-h="move">' +
        q(
          O +
            '<rect x="9" y="5" width="8" height="16" rx="3.5" fill="#fff"/><rect x="10.3" y="8" width="5.4" height="4" rx="1.2" fill="#0b3a74"/>',
        ) +
        'Drag a car to move it</span><span data-h="turn" class="lc-dimmed">' +
        q(
          O +
            '<rect x="10.5" y="8" width="5" height="10" rx="2.2" fill="#fff"/><path d="M5.5 14a7.6 7.6 0 0 1 3-9M20.5 12a7.6 7.6 0 0 1-3 9" fill="none" stroke="#ffc233" stroke-width="1.8" stroke-linecap="round"/><circle cx="8.8" cy="5.2" r="2.2" fill="#ffc233"/>',
        ) +
        "Pick a car, drag its dot to turn</span>"),
        J.querySelectorAll("span").forEach(function (d) {
          d.setAttribute("data-w", "0");
        }),
        J.insertAdjacentHTML(
          "beforeend",
          '<span data-w="1">' +
            q(
              O +
                '<path d="M6 13h14M6 13l3-3M6 13l3 3M20 13l-3-3M20 13l-3 3" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
            ) +
            'Drag to look around. Drag down to look up at the lights</span><span data-w="1">' +
            q(
              O +
                '<text x="13" y="16" text-anchor="middle" font-size="8.5" font-weight="700" fill="#ffc233" font-family="Arial,sans-serif">WASD</text>',
            ) +
            'W A S D or arrow keys to walk. Hold Shift to run</span><span data-w="1">' +
            q(
              O +
                '<rect x="9" y="5" width="8" height="16" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M13 8v4" stroke="#ffc233" stroke-width="2" stroke-linecap="round"/>',
            ) +
            "Scroll to step forward or back</span>",
        ),
        a.appendChild(J),
        (t.howto = J),
        J.setAttribute("aria-label", "Tips"),
        Ko());
      var F = document.createElement("div");
      ((F.className = "lc-howto-head"),
        (F.innerHTML = '<b>Tips</b><button type="button" aria-label="Hide tips">\xD7</button>'),
        J.insertBefore(F, J.firstChild));
      var I = document.createElement("button");
      ((I.type = "button"),
        (I.className = "lc-howto-info"),
        I.setAttribute("aria-label", "Show tips"),
        (I.textContent = "i"),
        a.appendChild(I));
      var N = function (d, C) {
          if ((a.classList.toggle("lc-tipsoff", !d), C))
            try {
              localStorage.setItem("lcTipsOff", d ? "0" : "1");
            } catch {}
        },
        K = null;
      try {
        K = localStorage.getItem("lcTipsOff");
      } catch {}
      (N(K === null ? !qn() : K !== "1", !1),
        [F.querySelector("button"), I].forEach(function (d, C) {
          (d.addEventListener("pointerdown", function (D) {
            D.stopPropagation();
          }),
            d.addEventListener("click", function (D) {
              (D.stopPropagation(), N(C === 1, !0));
            }));
        }));
      var ne = document.createElement("div");
      ((ne.className = "lc-pad"),
        (ne.innerHTML =
          '<button type="button" data-pad="f" aria-label="Walk forward">\u25B2</button><button type="button" data-pad="b" aria-label="Walk back">\u25BC</button><button type="button" data-pad="l" aria-label="Turn left">\u25C0</button><button type="button" data-pad="r" aria-label="Turn right">\u25B6</button>'),
        a.appendChild(ne),
        ne.querySelectorAll("button").forEach(function (d) {
          var C = "pad" + d.getAttribute("data-pad");
          (d.addEventListener("pointerdown", function (D) {
            (D.stopPropagation(), (At[C] = !0), oo());
          }),
            ["pointerup", "pointerleave", "pointercancel"].forEach(function (D) {
              d.addEventListener(D, function () {
                At[C] = !1;
              });
            }));
        }),
        (t.touch = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches)),
        a.classList.toggle("lc-touch", t.touch));
      var T = document.createElement("div");
      ((T.className = "lc-walkbar"),
        (T.innerHTML =
          '<button type="button" data-wb="ov">Back to overview</button><button type="button" data-wb="rs">Reset spot</button>'),
        T.addEventListener("click", function (d) {
          var C = d.target.closest("button");
          C &&
            (d.stopPropagation(),
            C.getAttribute("data-wb") === "ov" ? bi(!1) : (Hs(), It(), ye(), we("Back at the door", 1600)));
        }),
        a.appendChild(T));
      var ae = document.createElement("div");
      ((ae.className = "lc-drivebar"),
        (ae.innerHTML =
          '<span></span><button type="button" data-rb="cam">Camera</button><button type="button" data-rb="trial">Time trial</button><button type="button" data-rb="reset">Reset lap</button><button type="button" data-rb="stop">Stop driving</button>'),
        ae.addEventListener("click", function (d) {
          var C = d.target.closest("button");
          if (C) {
            (d.stopPropagation(), C.blur());
            var D = C.getAttribute("data-rb");
            D === "reset" ? (t.raceOn ? Dn() : merResetFree()) : D === "trial" ? uo() : D === "cam" ? ss() : or();
          }
        }),
        Ko());
      var ue = document.createElement("button");
      ((ue.type = "button"),
        (ue.className = "lc-racebtn"),
        (ue.innerHTML = "<i></i>Play the race game"),
        ue.addEventListener("click", function (d) {
          (d.stopPropagation(), uo());
        }),
        ue.addEventListener("pointerdown", function (d) {
          d.stopPropagation();
        }));
      var ot = document.createElement("div");
      ((ot.className = "lc-tc"),
        (ot.innerHTML =
          '<div class="lc-tc-steer" aria-label="Steer"><i></i></div><div class="lc-tc-r"><button type="button" data-tc="hb">DRIFT</button><button type="button" data-tc="boost">BOOST</button><button type="button" data-tc="brk">BRAKE</button><button type="button" data-tc="gas">GAS</button></div>'),
        a.appendChild(ot));
      var me = ot.querySelector(".lc-tc-steer"),
        Ge = me.firstChild,
        xe = null,
        x0 = 0,
        kx = 0,
        ft = function (d) {
          var C = me.getBoundingClientRect(),
            D = Math.max(30, Math.min(70, C.width / 2 - 34)),
            X = Math.max(-D, Math.min(D, d.clientX - x0)),
            $ = X / D,
            dz = 0.07,
            m = Math.abs($) < dz ? 0 : (Math.abs($) - dz) / (1 - dz);
          ((Ge.style.transform = "translateX(" + (kx + X) + "px)"),
            me.classList.toggle("mer-steer-l", $ < -dz),
            me.classList.toggle("mer-steer-r", $ > dz),
            (qa.steer = -Math.sign($) * Math.pow(m, 1.5)));
        },
        ze = function (d) {
          (d && xe !== null && d.pointerId !== xe) ||
            ((xe = null), (qa.steer = 0), (Ge.style.transform = ""), me.classList.remove("mer-steer-l", "mer-steer-r", "mer-steer-on"));
        };
      (me.addEventListener("pointerdown", function (d) {
        (d.preventDefault(), d.stopPropagation(), (xe = d.pointerId));
        var C0 = me.getBoundingClientRect();
        x0 = Math.max(C0.left + 40, Math.min(C0.right - 40, d.clientX));
        kx = x0 - (C0.left + C0.width / 2);
        me.classList.add("mer-steer-on");
        try {
          me.setPointerCapture(d.pointerId);
        } catch {}
        ft(d);
      }),
        me.addEventListener("pointermove", function (d) {
          d.pointerId === xe && (d.preventDefault(), d.stopPropagation(), ft(d));
        }),
        ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (d) {
          me.addEventListener(d, ze);
        }));
      var ut = Array.prototype.slice.call(ot.querySelectorAll("[data-tc]"));
      (ut.forEach(function (d) {
        var C = d.getAttribute("data-tc"),
          D = function (X) {
            ((qa[C] = X), d.classList.toggle("lc-on", X));
          };
        (d.addEventListener("pointerdown", function (X) {
          (X.preventDefault(), X.stopPropagation());
          try {
            d.setPointerCapture(X.pointerId);
          } catch {}
          D(!0);
        }),
          ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (X) {
            d.addEventListener(X, function () {
              D(!1);
            });
          }),
          d.addEventListener("contextmenu", function (X) {
            X.preventDefault();
          }));
      }),
        ["touchstart", "touchmove", "gesturestart"].forEach(function (d) {
          ot.addEventListener(
            d,
            function (C) {
              C.target.closest && C.target.closest(".lc-tc-steer, [data-tc]") && C.preventDefault();
            },
            { passive: !1 },
          );
        }),
        (t.tcReset = function () {
          (ze(),
            ut.forEach(function (d) {
              d.classList.remove("lc-on");
            }));
        }),
        window.addEventListener("gamepadconnected", function () {
          t && (a.classList.contains("lc-open") && we("Controller connected", 3e3), ll());
        }),
        window.addEventListener("gamepaddisconnected", function () {
          t && a.classList.contains("lc-open") && we("Controller disconnected", 2500);
        }),
        ho() && ll(),
        a.appendChild(ae));
      var We = document.createElement("div");
      ((We.className = "lc-walkhint"),
        We.setAttribute("aria-live", "polite"),
        (We.innerHTML = "<i></i><span></span>"),
        a.appendChild(We),
        (t.hintEl = We));
      var Be = document.createElement("div"),
        Ne = document.createElement("i"),
        Wt = null;
      ((Be.className = "lc-joy"),
        Be.setAttribute("aria-hidden", "true"),
        Be.appendChild(Ne),
        a.appendChild(Be),
        (t.joy = { x: 0, y: 0 }),
        Be.addEventListener("pointerdown", function (d) {
          (d.stopPropagation(), d.preventDefault(), (Wt = d.pointerId));
          try {
            Be.setPointerCapture(d.pointerId);
          } catch {}
          S(d);
        }),
        Be.addEventListener("pointermove", function (d) {
          d.pointerId === Wt && (d.stopPropagation(), S(d));
        }),
        Be.addEventListener("pointerup", A),
        Be.addEventListener("pointercancel", A),
        document.addEventListener("keydown", function (d) {
          if (t && t.egg && t.egg.busy && a.classList.contains("lc-open")) {
            (d.preventDefault(),
              !d.repeat &&
                (d.code === "Enter" || d.code === "Space" || d.code === "NumpadEnter") &&
                t.egg.startFn &&
                t.egg.startFn());
            return;
          }
          if (t && t.drive && a.classList.contains("lc-open")) {
            Pt.boost = merBoostOk(d);
            if (/^F\d+$/.test(d.code)) return;
            if (t.drive.intro) {
              d.code !== "Escape" && d.preventDefault();
              (d.code === "Enter" || d.code === "Space" || d.code === "NumpadEnter") && !d.repeat && M0(!0);
              return;
            }
            var C = d.target && d.target.tagName,
              D = null;
            if (C === "INPUT" || C === "TEXTAREA" || C === "SELECT") return;
            if (
              (d.code === "KeyW" || d.code === "ArrowUp"
                ? (D = "w")
                : d.code === "KeyS" || d.code === "ArrowDown"
                  ? (D = "s")
                  : d.code === "KeyA" || d.code === "ArrowLeft"
                    ? (D = "a")
                    : d.code === "KeyD" || d.code === "ArrowRight"
                      ? (D = "d")
                      : d.code === "Space" && (D = "space"),
              (d.code === "ShiftLeft" || d.code === "ShiftRight") && (D = "boost"),
              d.code === "KeyC")
            ) {
              (d.preventDefault(), d.repeat || ss());
              return;
            }
            if (d.code === "KeyR") {
              (d.preventDefault(), d.repeat || (t.raceOn ? Dn() : merResetFree()));
              return;
            }
            if (d.code === "KeyT") {
              (d.preventDefault(), d.repeat || t.raceOn || uo());
              return;
            }
            if (d.code === "KeyN") {
              d.repeat ||
                ((t.musicMute = !t.musicMute),
                t.musicMute ? fo() : t.raceOn && (al(), rl(0.15)),
                we(t.musicMute ? "Music off" : "Music on", 1400));
              return;
            }
            if (d.code === "KeyM") {
              d.repeat ||
                ((t.engMute = !t.engMute), we(t.engMute ? "Engine sound off" : "Engine sound on", 1400));
              return;
            }
            D && (d.preventDefault(), (Pt[D] = !0));
            return;
          }
          if (!(!t || !t.walk || !a.classList.contains("lc-open"))) {
            var X = d.target && d.target.tagName;
            if (!(X === "INPUT" || X === "TEXTAREA" || X === "SELECT")) {
              var $ = Ws(d);
              $ && (Xs(!1), xi(!0), d.preventDefault(), (At[$] = !0), oo());
            }
          }
        }),
        document.addEventListener("keyup", function (d) {
          var C = Ws(d);
          C && (At[C] = !1);
        }),
        document.addEventListener("keyup", function (d) {
          Pt.boost = merBoostOk(d);
          d.code === "KeyW" || d.code === "ArrowUp"
            ? (Pt.w = !1)
            : d.code === "KeyS" || d.code === "ArrowDown"
              ? (Pt.s = !1)
              : d.code === "KeyA" || d.code === "ArrowLeft"
                ? (Pt.a = !1)
                : d.code === "KeyD" || d.code === "ArrowRight"
                  ? (Pt.d = !1)
                  : d.code === "Space"
                    ? (Pt.space = !1)
                    : (d.code === "ShiftLeft" || d.code === "ShiftRight") && (Pt.boost = !1);
        }),
        window.addEventListener("blur", function () {
          ((At = {}), (Pt = {}));
        }));
      var Et = new e.Raycaster(),
        Ot = new e.Vector2();
      (p.addEventListener("pointerdown", function (d) {
        if (H(d)) {
          (d.stopImmediatePropagation(),
            (t.touched = !0),
            fn(),
            (t.rd = { i: t.sel }),
            p.setPointerCapture(d.pointerId),
            (a.style.cursor = "grabbing"));
          return;
        }
        var C = Y(d);
        if (!C) {
          if (t.walk || !a.classList.contains("lc-open") || !ct || !ie) return;
          R(d);
          var D = Z(1.2),
            X = D ? fl(D.x, D.z) : -1;
          if (X < 0) {
            t.emptyDown = { x: d.clientX, y: d.clientY };
            return;
          }
          (d.stopImmediatePropagation(), (t.touched = !0), fn(), (t.sel = X));
          var $ = Z(0),
            le = ee[X];
          ((t.cd = { i: X, dx: $ ? le.x - $.x : 0, dz: $ ? le.z - $.z : 0 }),
            p.setPointerCapture(d.pointerId),
            (a.style.cursor = "grabbing"),
            we(""),
            lr(),
            Wa(),
            ye());
          return;
        }
        (d.stopImmediatePropagation(),
          (t.touched = !0),
          (t.hd = {
            axis: C,
            base: t.hpos[C].clone(),
            off: new e.Vector3(),
            dims: t.dims ? { w: t.dims.w, l: t.dims.l, h: t.dims.h } : null,
          }));
        var re = j(C);
        (re && t.hd.off.copy(re).sub(t.hd.base),
          p.setPointerCapture(d.pointerId),
          (a.style.cursor = "grabbing"),
          ul(t.hd.dims));
      }),
        p.addEventListener("pointermove", function (d) {
          if (t.rd) {
            R(d);
            var C = Z(0),
              D = ee && ee[t.rd.i];
            if (C && D) {
              var X = (-Math.atan2(C.x - D.x, C.z - D.z) * 180) / Math.PI;
              (d.shiftKey && (X = Math.round(X / 15) * 15), (X = ((X % 360) + 360) % 360));
              var $ = Mi({ x: D.x, z: D.z, r: X }, ie.wid, ie.len),
                le = Lr(ee, t.rd.i, $) <= Lr(ee, t.rd.i, D);
              (le && ((D.x = $.x), (D.z = $.z), (D.r = $.r)),
                we(
                  le
                    ? Math.round(D.r) +
                        "\xB0 " +
                        (d.shiftKey ? "(snapping to 15\xB0)" : "(hold Shift to snap)")
                    : "No room to turn here",
                ),
                zr(t.rd.i),
                lr(),
                ye());
            }
            return;
          }
          if (t.cd) {
            R(d);
            var re = Z(0);
            re && B0(t.cd.i, re.x + t.cd.dx, re.z + t.cd.dz);
            return;
          }
          if (t.hd) {
            R(d);
            var ve = j(t.hd.axis);
            if (!ve) return;
            ve.sub(t.hd.off);
            var se = t.hd.dims,
              He = t.hd.axis;
            (He === "w"
              ? (se.w = Math.max(10, Math.min(150, Math.round(2 * (ve.x - 1.4)))))
              : He === "l"
                ? (se.l = Math.max(17, Math.min(150, Math.round(2 * (ve.z - 1.4)))))
                : (se.h = Math.max(8, Math.min(25, Math.round(ve.y - 0.4)))),
              P0(se));
            return;
          }
          if (t.drag === null) {
            var $e = Y(d),
              Re = null;
            (!t.walk && !$e && ct && a.classList.contains("lc-open") && ie && (R(d), (Re = Z(1.2))),
              (a.style.cursor = $e || H(d) ? "grab" : Re && fl(Re.x, Re.z) >= 0 ? "move" : ""));
          }
        }));
      var ia = function (d) {
        var C = t.hd;
        if (!C) return !1;
        ((t.hd = null), (a.style.cursor = ""), (t.preview.visible = !1), (t.usedHandles = !0), we(""));
        var D = C.dims;
        return (
          d &&
          D &&
          (D.w !== parseFloat(V("wid").value) ||
            D.l !== parseFloat(V("len").value) ||
            D.h !== parseFloat(V("ht").value))
            ? ((V("wid").value = D.w), (V("len").value = D.l), (V("ht").value = D.h), Mt())
            : (ns(t.dims.w, t.dims.l, t.dims.h), ye()),
          !0
        );
      };
      (p.addEventListener("pointerup", function (d) {
        if (t.rd) {
          ((t.rd = null), (a.style.cursor = ""), we(""), yi());
          return;
        }
        if (t.cd) {
          ((t.cd = null), (a.style.cursor = ""), yi());
          return;
        }
        if (!ia(!0) && t.emptyDown) {
          var C = Math.abs(d.clientX - t.emptyDown.x) + Math.abs(d.clientY - t.emptyDown.y);
          ((t.emptyDown = null), C < 5 && t.sel >= 0 && ((t.sel = -1), lr(), Wa(), ye()));
        }
      }),
        p.addEventListener("pointercancel", function () {
          if (t.rd) {
            ((t.rd = null), (a.style.cursor = ""), we(""), yi());
            return;
          }
          if (t.cd) {
            ((t.cd = null), (a.style.cursor = ""), yi());
            return;
          }
          ((t.emptyDown = null), ia(!1));
        }),
        p.addEventListener("pointerdown", function (d) {
          (Xs(d.pointerType === "touch"),
            t.walk && xi(!0),
            (t.drag = d.clientX),
            (t.dragY = d.clientY),
            (t.sx = d.clientX),
            (t.sy = d.clientY),
            (t.touched = !0),
            p.setPointerCapture(d.pointerId),
            (a.style.cursor = "grabbing"));
        }),
        p.addEventListener("pointermove", function (d) {
          if (t.drag !== null) {
            if (t.drive) {
              /* Phones: a thumb sliding off the touch controls must not swing the race camera. */
              if (d.pointerType === "touch") return;
              var C = t.drive.cam;
              ((C.yaw -= (d.clientX - t.drag) * 0.006),
                (t.drag = d.clientX),
                (C.pitch = Math.min(1.3, Math.max(0.04, C.pitch + (d.clientY - t.dragY) * 0.005))),
                (t.dragY = d.clientY),
                It(),
                ye());
              return;
            }
            if (t.walk) {
              ((t.wyaw += (d.clientX - t.drag) * 0.005),
                (t.drag = d.clientX),
                (t.wpitch = Math.min(1.45, Math.max(-1.45, t.wpitch - (d.clientY - t.dragY) * 0.005))),
                (t.dragY = d.clientY),
                It(),
                ye());
              return;
            }
            ((t.yaw += (d.clientX - t.drag) * 0.012),
              (t.drag = d.clientX),
              (t.pitch = Math.min(1.5, Math.max(-0.2, t.pitch + (d.clientY - t.dragY) * 0.008))),
              (t.dragY = d.clientY),
              It(),
              ye());
          }
        }));
      var Bt = function () {
        ((t.drag = null), (a.style.cursor = ""));
      };
      (p.addEventListener("pointerup", function (d) {
        var C = Math.abs(d.clientX - t.sx) + Math.abs(d.clientY - t.sy) > 5;
        if ((Bt(), !C && a.classList.contains("lc-open") && !t.drive && t.egg && !t.egg.busy)) {
          var D = el(d);
          if (D === "door") {
            (t.walk && Gr(), tl(!t.egg.open));
            return;
          }
          if (D === "pad") {
            (t.walk && Gr(), y0());
            return;
          }
        }
        !C && !a.classList.contains("lc-open") && po();
      }),
        p.addEventListener("pointercancel", Bt),
        p.addEventListener("pointermove", function (d) {
          if (d.buttons || t.drive || !t.egg || !a.classList.contains("lc-open")) {
            p.style.cursor && (p.style.cursor = "");
            return;
          }
          var C = performance.now();
          C - (t.hovT || 0) < 120 || ((t.hovT = C), (p.style.cursor = el(d) ? "pointer" : ""));
        }));
    }
    t.drive && ((t.resumeDrive = t.drive.i), (t.resumeRace = !!t.raceOn), or(!0));
    var et = t.group && a.classList.contains("lc-open") ? { pitch: t.pitch, zoom: t.zoom } : null;
    t.group && (t.scene.remove(t.group), Tl(t.group));
    var oe = new e.Group();
    t.group = oe;
    var tt = new e.MeshStandardMaterial({
      color: 0xffffff,
      map: merAcousticTex(),
      roughness: 0.92,
      emissive: 0x1e2229,
      emissiveIntensity: 0,
    });
    t.intMats = [{ m: tt, k: 0.4 }];
    var fr = new e.MeshStandardMaterial({ color: 0x2a2e35, roughness: 0.5, metalness: 0.3 }),
      dt = new e.MeshStandardMaterial({ color: 16119544, roughness: 0.5, metalness: 0, transparent: !0 }),
      Ce = new e.MeshStandardMaterial({
        color: 0xffffff,
        map: merCorrTex(),
        roughness: 0.55,
        metalness: 0.3,
        envMapIntensity: 0.35,
        emissive: 0x343c4a,
        emissiveIntensity: 0,
      });
    ((Ce.userData.minE = 0.55), (Ce.roughness = 0.6), (Ce.metalness = 0.2));
    t.extMats = [Ce];
    function Dt(W, U) {
      var _ = [tt, tt, tt, tt, tt, tt];
      return ((_[W > 0 ? 0 : W < 0 ? 1 : U > 0 ? 4 : 5] = Ce), _);
    }
    var it = Math.min(40, 4096 / Math.max(r.wid, r.len, 1)),
      ot = document.createElement("canvas");
    ((ot.width = Math.ceil(r.wid * it)), (ot.height = Math.ceil(r.len * it)));
    var fa = ot.getContext("2d"),
      bt = 1.3125,
      Sa = As(r.wid, r.len, r.cars),
      Pr = Sa.m,
      un = Sa.b,
      ua,
      Zt;
    for (ua = 0; ua * bt < r.wid; ua++)
      for (Zt = 0; Zt * bt < r.len; Zt++) {
        var da = Math.min((ua + 0.5) * bt, r.wid),
          ka = Math.min((Zt + 0.5) * bt, r.len),
          ur = Math.min(da, r.wid - da, ka, r.len - ka),
          Vn = (ua + Zt) % 2;
        ((fa.fillStyle =
          ur < Pr
            ? Vn
              ? "#33373e"
              : "#25282e"
            : ur < Pr + un
              ? Vn
                ? "#121417"
                : "#1a1c20"
              : Vn
                ? "#33373e"
                : "#25282e"),
          fa.fillRect(ua * bt * it, Zt * bt * it, bt * it + 1, bt * it + 1));
      }
    var yt = new e.CanvasTexture(ot);
    ((yt.colorSpace = e.SRGBColorSpace),
      (yt.anisotropy = Math.min(16, t.renderer.capabilities.getMaxAnisotropy())));
    var Nt = new e.Mesh(
      new e.PlaneGeometry(r.wid, r.len),
      (function () {
        var hiQ = Is() === "high",
          W = new (hiQ ? e.MeshPhysicalMaterial : e.MeshStandardMaterial)({
          map: yt,
          roughness: 0.35,
          metalness: 0.1,
          normalMap: merTileNormal(r.wid / bt, r.len / bt),
          normalScale: new e.Vector2(0.8, 0.8),
          emissive: 16777215,
          emissiveMap: yt,
          emissiveIntensity: 0,
        });
        hiQ && ((W.clearcoat = 0.3), (W.clearcoatRoughness = 0.25), (W.specularIntensity = 0.8));
        return (t.intMats.push({ m: W, k: 0.07 }), W);
      })(),
    );
    ((Nt.rotation.x = -Math.PI / 2), Nt.position.set(0, 0, 0), oe.add(Nt));
    var pt = document.createElement("canvas");
    pt.width = pt.height = 512;
    var de = pt.getContext("2d"),
      Lt = 512,
      Ae = Lt / 2,
      _t = Lt / 26,
      Qt,
      ki;
    for (
      de.clearRect(0, 0, Lt, Lt),
        de.lineCap = "butt",
        [
          [0, 0, 1],
          [1, 0, 2],
          [0, 1, 2],
          [1, 1, 1],
        ].forEach(function (W) {
          var U = W[0] * Ae,
            _ = W[1] * Ae,
            te = W[2];
          for (
            de.save(), de.beginPath(), de.rect(U + 7, _ + 7, Ae - 14, Ae - 14), de.clip(), Qt = -Ae;
            Qt < Ae * 2.2;
            Qt += _t
          )
            (de.beginPath(),
              te === 1
                ? (de.moveTo(U + Qt, _), de.lineTo(U + Qt + Ae, _ + Ae))
                : (de.moveTo(U + Qt + Ae, _), de.lineTo(U + Qt, _ + Ae)),
              (de.strokeStyle = "rgba(0,0,0,0.75)"),
              (de.lineWidth = _t * 0.42),
              de.stroke(),
              de.beginPath(),
              te === 1
                ? (de.moveTo(U + Qt + _t * 0.34, _), de.lineTo(U + Qt + _t * 0.34 + Ae, _ + Ae))
                : (de.moveTo(U + Qt + Ae - _t * 0.34, _), de.lineTo(U + Qt - _t * 0.34, _ + Ae)),
              (de.strokeStyle = "rgba(255,255,255,0.05)"),
              (de.lineWidth = _t * 0.12),
              de.stroke());
          de.restore();
        }),
        ki = 1;
      ki <= 1;
      ki++
    ) {
      var Ir = ki * _t * 1.6;
      (de.beginPath(),
        de.moveTo(Ae, Ae - Ir),
        de.lineTo(Ae + Ir, Ae),
        de.lineTo(Ae, Ae + Ir),
        de.lineTo(Ae - Ir, Ae),
        de.closePath(),
        (de.strokeStyle = "rgba(0,0,0,0.2)"),
        (de.lineWidth = _t * 0.2),
        de.stroke());
    }
    ((de.strokeStyle = "rgba(0,0,0,0.55)"),
      (de.lineWidth = 5),
      de.strokeRect(0, 0, Lt, Lt),
      (de.strokeStyle = "rgba(0,0,0,0.3)"),
      (de.lineWidth = 5),
      de.beginPath(),
      de.moveTo(Ae, 6),
      de.lineTo(Ae, Lt - 6),
      de.moveTo(6, Ae),
      de.lineTo(Lt - 6, Ae),
      de.stroke());
    var dr = new e.CanvasTexture(pt);
    ((dr.wrapS = dr.wrapT = e.RepeatWrapping),
      (dr.colorSpace = e.SRGBColorSpace),
      (dr.anisotropy = Math.min(16, t.renderer.capabilities.getMaxAnisotropy())),
      dr.repeat.set(r.wid / bt, r.len / bt),
      dr.offset.set(0, Math.ceil(r.len / bt) - r.len / bt));
    var Ci = new e.Mesh(
      new e.PlaneGeometry(r.wid, r.len),
      new e.MeshStandardMaterial({
        map: dr,
        transparent: !0,
        roughness: 1,
        depthWrite: !1,
        polygonOffset: !0,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    );
    ((Ci.rotation.x = -Math.PI / 2),
      Ci.position.set(0, 0.006, 0),
      oe.add(Ci),
      (function () {
        var W = document.createElement("canvas");
        ((W.width = 512), (W.height = 64));
        var U = W.getContext("2d"),
          _;
        for (U.fillStyle = "#07090c", U.fillRect(0, 0, 512, 64), _ = 0; _ < 32; _++)
          ((U.fillStyle = "#9aa3b0"),
            U.fillRect(_ * 16 + 2, 4, 5, 56),
            (U.fillStyle = "#5c6470"),
            U.fillRect(_ * 16 + 7, 4, 2, 56));
        ((U.fillStyle = "#c7ced9"), U.fillRect(0, 0, 512, 4), U.fillRect(0, 60, 512, 4));
        var te = new e.CanvasTexture(W);
        ((te.colorSpace = e.SRGBColorSpace),
          (te.anisotropy = Math.min(16, t.renderer.capabilities.getMaxAnisotropy())));
        var m = new e.MeshStandardMaterial({ color: 12173515, roughness: 0.35, metalness: 0.85 }),
          S = new e.MeshStandardMaterial({ map: te, roughness: 0.5, metalness: 0.5 });
        ir(r.wid, r.len, r.cars).forEach(function (A) {
          var R = Math.max(3, A.w - 0.6),
            Y = i + 1.4,
            j = te.clone();
          ((j.needsUpdate = !0), (j.wrapS = e.RepeatWrapping), j.repeat.set(Math.max(1, R / 8), 1));
          var Z = new e.MeshStandardMaterial({ map: j, roughness: 0.5, metalness: 0.5 }),
            H = new e.Mesh(new e.BoxGeometry(R + 0.14, 0.03, 0.64), m);
          (H.position.set(A.c, -0.017, Y), oe.add(H));
          var d = new e.Mesh(new e.PlaneGeometry(R, 0.5), Z);
          ((d.rotation.x = -Math.PI / 2), d.position.set(A.c, -0.0015, Y), (d.renderOrder = 1), oe.add(d));
        });
      })());
    var Ue = 0.5;
    t.walls = [];
    function vo(W, U, _, te, m, S, A) {
      var R = new e.Mesh(new e.BoxGeometry(W, U, _), Dt(S, A));
      return (
        R.position.set(te, U / 2, m),
        (R.userData.n = new e.Vector3(S, 0, A)),
        oe.add(R),
        t.walls.push(R),
        R
      );
    }
    var Hn = new e.Mesh(
      new e.PlaneGeometry(r.wid, r.len),
      (function () {
        var W = new e.MeshStandardMaterial({
          color: 0x16191e,
          roughness: 0.95,
          emissive: 0x16191e,
          emissiveIntensity: 0,
        });
        return (t.intMats.push({ m: W, k: 0.4 }), W);
      })(),
    );
    ((Hn.rotation.x = Math.PI / 2), Hn.position.set(0, o, 0), oe.add(Hn));
    var Un = new e.Group();
    (oe.add(Un), (t.yd = Un), O0(e, Un, r, i));
    var hr = new e.Mesh(
      new e.BoxGeometry(r.wid + 3.2, 0.5, r.len + 3.2),
      (function () {
        var W = new e.MeshStandardMaterial({
          color: 3949133,
          roughness: 0.85,
          emissive: 3949133,
          emissiveIntensity: 0,
        });
        return (t.extMats.push(W), W);
      })(),
    );
    (hr.position.set(0, o + 0.3, 0), (hr.visible = !1), oe.add(hr), (t.roof = hr));
    var dn = vo(r.wid + 2 * Ue, o, Ue, 0, -i - Ue / 2, 0, -1),
      Or = new e.Mesh(new e.BoxGeometry(r.wid, 0.5, 0.07), fr);
    (Or.position.set(0, 0.25 - o / 2, Ue / 2 + 0.035), dn.add(Or));
    var Ai = new e.Mesh(new e.BoxGeometry(r.wid, 0.1, 0.1), fr);
    (Ai.position.set(0, 0.55 - o / 2, Ue / 2 + 0.05), dn.add(Ai));
    var Vt = new e.MeshStandardMaterial({ color: 0xffffff, map: merAcousticTex(), roughness: 0.9, transparent: !0 }),
      Dr = new e.MeshStandardMaterial({
        color: 0xffffff,
        map: merCorrTex(),
        roughness: 0.55,
        metalness: 0.3,
        envMapIntensity: 0.35,
        transparent: !0,
        emissive: 0x343c4a,
        emissiveIntensity: 0,
      });
    ((Dr.userData.minE = 0.55), (Dr.roughness = 0.6), (Dr.metalness = 0.2));
    t.extMats.push(Dr);
    var vt = new e.MeshStandardMaterial({ color: 1316637, roughness: 0.4, metalness: 0.5, transparent: !0 }),
      Fr = new e.MeshStandardMaterial({ color: 1777447, roughness: 0.5, metalness: 0.4, transparent: !0 }),
      Xn = new e.MeshStandardMaterial({
        color: 0x0b1118,
        roughness: 0.05,
        metalness: 0.6,
        transparent: !0,
        opacity: 0.82,
      }),
      qr = new e.Group(),
      St = 8,
      hn;
    function Ca(W, U, _, te, m, S, A) {
      var R = new e.Mesh(new e.BoxGeometry(W, U, _), te === Vt ? [Vt, Vt, Vt, Vt, Dr, Vt] : te);
      (R.position.set(m, S, A), qr.add(R));
    }
    var oa = -n - Ue;
    function Ei(W, U) {
      ((W = Math.max(W, -n)),
        (U = Math.min(U, n)),
        !(U - W < 0.05) &&
          (Ca(U - W, 0.5, 0.07, dt, (W + U) / 2, 0.25, i - 0.035),
          Ca(U - W, 0.1, 0.1, dt, (W + U) / 2, 0.55, i - 0.05)));
    }
    var Ft = 0.7,
      jn = i + 0.1;
    ((t.doors = []),
      (t.doorGeo = { dh: St, rB: Ft, dZ: jn }),
      ir(r.wid, r.len, r.cars)
        .sort(function (W, U) {
          return W.c - U.c;
        })
        .forEach(function (W) {
          var U = W.c - W.w / 2,
            _ = W.c + W.w / 2;
          (U > oa && (Ca(U - oa, o, Ue, Vt, (U + oa) / 2, o / 2, i + Ue / 2), Ei(oa, U)),
            Ca(W.w, o - St, Ue, Vt, W.c, St + (o - St) / 2, i + Ue / 2));
          var te = [];
          for (hn = 0; hn < 4; hn++) {
            var m = new e.Group(),
              S = St / 4,
              A = function (R, Y, j, Z, H, d) {
                var C = new e.Mesh(new e.BoxGeometry(R, Y, j), Z);
                (C.position.set(H, d, 0), m.add(C));
              };
            (A(W.w - 0.5, S - 0.1, 0.06, Xn, 0, 0),
              A(W.w - 0.1, 0.22, 0.27, vt, 0, S / 2 - 0.11),
              A(W.w - 0.1, 0.22, 0.27, vt, 0, -S / 2 + 0.11),
              A(0.32, S, 0.27, vt, -(W.w / 2 - 0.2), 0),
              A(0.32, S, 0.27, vt, W.w / 2 - 0.2, 0),
              A(0.16, S - 0.2, 0.27, vt, 0, 0),
              qr.add(m),
              te.push(m));
          }
          (t.doors.push({ panels: te, c: W.c, w: W.w }),
            Ca(0.2, St, 0.3, Fr, W.c - W.w / 2 + 0.05, St / 2, i + 0.2),
            Ca(0.2, St, 0.3, Fr, W.c + W.w / 2 - 0.05, St / 2, i + 0.2),
            Ca(W.w, 0.2, 0.3, Fr, W.c, St, i + 0.2),
            (oa = _));
        }),
      n + Ue > oa && (Ca(n + Ue - oa, o, Ue, Vt, (n + Ue + oa) / 2, o / 2, i + Ue / 2), Ei(oa, n + Ue)),
      oe.add(qr),
      (t.front = { group: qr, mats: [Vt, vt, Fr, Xn, Dr, dt], n: new e.Vector3(0, 0, 1) }));
    var Yn = new e.MeshStandardMaterial({ color: 10134451, roughness: 0.45, metalness: 0.55 }),
      Bi = new e.MeshStandardMaterial({ color: 1711396, roughness: 0.45, metalness: 0.5 }),
      pn = new e.MeshStandardMaterial({ color: 2303791, roughness: 0.55, metalness: 0.3 }),
      Zn = document.createElement("canvas");
    ((Zn.width = 64), (Zn.height = 16));
    var Kt = Zn.getContext("2d");
    ((Kt.fillStyle = "#1b1e25"),
      Kt.fillRect(0, 0, 64, 16),
      (Kt.strokeStyle = "#5b6372"),
      (Kt.lineWidth = 3),
      Kt.beginPath(),
      Kt.moveTo(0, 16),
      Kt.lineTo(16, 0),
      Kt.moveTo(32, 16),
      Kt.lineTo(48, 0),
      Kt.stroke());
    function Ht(W, U, _, te, m, S, A) {
      var R = new e.Mesh(new e.BoxGeometry(W, U, _), te);
      return (R.position.set(m, S, A), oe.add(R), R);
    }
    var sa = St + Ft,
      Pe = Math.min(St + 0.55, o - 0.55);
    (ir(r.wid, r.len, r.cars).forEach(function (W) {
      var U = Ft + Math.min(8.8, r.len - 3),
        _ = jn,
        te;
      [-1, 1].forEach(function (d) {
        ((te = W.c + d * (W.w / 2 + 0.02)), Ht(0.14, sa - Ft, 0.22, Bi, te, (sa - Ft) / 2, _));
        var C = new e.Mesh(new e.TorusGeometry(Ft, 0.09, 8, 16, Math.PI / 2), Bi);
        ((C.rotation.y = -Math.PI / 2),
          C.position.set(te, sa - Ft, _ - Ft),
          oe.add(C),
          Ht(0.14, 0.2, U - Ft, Bi, te, sa, _ - Ft - (U - Ft) / 2),
          Ht(0.3, 0.3, 0.4, pn, te, sa - 0.05, _ - U),
          o - sa > 0.45 &&
            [0.2, 0.55, 0.9].forEach(function (D) {
              (Ht(0.12, o - sa, 0.12, Yn, te, sa + (o - sa) / 2, _ - U * D), Ht(0.45, 0.06, 0.45, Bi, te, o - 0.03, _ - U * D), Ht(0.3, 0.06, 0.3, Bi, te, sa + 0.1, _ - U * D));
            }));
      });
      var m = W.w + 0.3,
        S = W.c + 0.15,
        A = new e.Mesh(new e.CylinderGeometry(0.07, 0.07, m, 10), Yn);
      ((A.rotation.z = Math.PI / 2), A.position.set(S, Pe, i - 0.45), oe.add(A));
      if (o - Pe > 0.5)
        [-0.5, 0, 0.5].forEach(function (f) {
          var bx = W.c + f * (W.w - 1);
          (Ht(0.14, o - Pe, 0.14, Yn, bx, Pe + (o - Pe) / 2, i - 0.45), Ht(0.5, 0.06, 0.5, Bi, bx, o - 0.03, i - 0.45), Ht(0.36, 0.1, 0.3, Bi, bx, Pe + 0.12, i - 0.45));
        });
      var R = W.w * 0.42,
        Y = new e.CanvasTexture(Zn);
      ((Y.wrapS = Y.wrapT = e.RepeatWrapping), Y.repeat.set(Math.max(2, Math.round(R * 3)), 1));
      var j = new e.Mesh(
        new e.CylinderGeometry(0.17, 0.17, R, 14),
        new e.MeshStandardMaterial({ map: Y, roughness: 0.5, metalness: 0.5 }),
      );
      ((j.rotation.z = Math.PI / 2),
        j.position.set(W.c - W.w * 0.1, Pe, i - 0.45),
        oe.add(j),
        [-1, 1].forEach(function (d) {
          var C = new e.Mesh(new e.CylinderGeometry(0.24, 0.24, 0.3, 14), pn);
          ((C.rotation.z = Math.PI / 2), C.position.set(W.c + d * (W.w / 2 - 0.5), Pe, i - 0.45), oe.add(C));
        }));
      var Z = W.c + W.w / 2 + 0.5,
        H = Pe - 0.35;
      (Ht(0.5, 1, 0.25, pn, Z, Pe - 0.2, i - 0.15),
        Ht(0.62, 1.7, 0.7, pn, Z, H, i - 0.55),
        Ht(
          0.5,
          0.5,
          0.05,
          new e.MeshStandardMaterial({ color: 11055294, roughness: 0.4, metalness: 0.5 }),
          Z,
          H + 0.45,
          i - 0.92,
        ),
        Ht(0.14, 0.14, 0.05, new e.MeshBasicMaterial({ color: 4313963 }), Z + 0.15, H - 0.35, i - 0.92),
        Ht(0.03, 0.5, 0.03, pn, Z - 0.2, H + 1.1, i - 0.55),
        Ht(0.03, 1.5, 0.03, new e.MeshBasicMaterial({ color: 14212582 }), Z + 0.2, H - 1.6, i - 0.9),
        Ht(0.16, 0.22, 0.1, new e.MeshBasicMaterial({ color: 14169132 }), Z + 0.2, H - 2.45, i - 0.9));
    }),
      Yo(t.doorT || 0));
    var be = { w: 3.6, y0: 2.4, y1: Math.max(8, o - 1) };
    function Li(W, U) {
      var _ = new e.Group(),
        te = Ti(r.len)
          .map(function (d) {
            return d - i;
          })
          .sort(function (d, C) {
            return d - C;
          }),
        m = -r.len / 2,
        S = be.y0,
        A = be.y1,
        R = be.w / 2;
      (_.position.set(W, o / 2, 0), (_.userData.n = new e.Vector3(U, 0, 0)));
      function Y(d, C, D, X) {
        if (!(d <= 0.01 || C <= 0.01)) {
          var $ = new e.Mesh(new e.BoxGeometry(Ue, C, d), Dt(U, 0));
          ($.position.set(0, X - o / 2, D), _.add($));
        }
      }
      (te.forEach(function (d) {
        (Y(d - R - m, o, (m + d - R) / 2, o / 2),
          Y(be.w, S, d, S / 2),
          Y(be.w, o - A, d, (A + o) / 2),
          (m = d + R));
      }),
        Y(r.len / 2 - m, o, (m + r.len / 2) / 2, o / 2));
      var j = -U,
        Z = new e.Mesh(new e.BoxGeometry(0.07, 0.5, r.len), fr);
      (Z.position.set(j * (Ue / 2 + 0.035), 0.25 - o / 2, 0), _.add(Z));
      var H = new e.Mesh(new e.BoxGeometry(0.1, 0.1, r.len), fr);
      return (H.position.set(j * (Ue / 2 + 0.05), 0.55 - o / 2, 0), _.add(H), oe.add(_), t.walls.push(_), _);
    }
    var pr = Li(-n - Ue / 2, -1),
      Wr = Li(n + Ue / 2, 1),
      Ee = new e.MeshStandardMaterial({
        color: 13625087,
        roughness: 0.05,
        metalness: 0.1,
        transparent: !0,
        opacity: 0.2,
        depthWrite: !1,
      }),
      Aa = new e.MeshStandardMaterial({ color: 1382429, roughness: 0.45, metalness: 0.5 });
    t.glassM = Ee;
    var Ea = be.y1 - be.y0,
      _n = (be.y0 + be.y1) / 2,
      Ke = 0.16,
      Na = document.createElement("canvas");
    ((Na.width = 256), (Na.height = 8));
    var Va = Na.getContext("2d"),
      Nr;
    for (Va.fillStyle = "#6a6a6a", Va.fillRect(0, 0, 256, 8), Nr = 0; Nr < 16; Nr++) {
      var Vr = Math.random() * 256,
        ge = 8 + Math.random() * 26,
        Ve = Va.createLinearGradient(Vr - ge, 0, Vr + ge, 0);
      (Ve.addColorStop(0, "rgba(255,255,255,0)"),
        Ve.addColorStop(0.5, "rgba(255,255,255," + (0.35 + Math.random() * 0.45).toFixed(2) + ")"),
        Ve.addColorStop(1, "rgba(255,255,255,0)"),
        (Va.fillStyle = Ve),
        Va.fillRect(Vr - ge, 0, ge * 2, 8));
    }
    var ha = new e.CanvasTexture(Na);
    ((ha.wrapS = e.RepeatWrapping),
      e.SRGBColorSpace && (ha.colorSpace = e.SRGBColorSpace),
      (t.rayM = new e.MeshBasicMaterial({
        map: ha,
        color: 16773577,
        vertexColors: !0,
        transparent: !0,
        opacity: 0.6,
        blending: e.AdditiveBlending,
        depthWrite: !1,
        side: e.DoubleSide,
        toneMapped: !1,
      })));
    var vn = document.createElement("canvas");
    vn.width = vn.height = 32;
    var Qn = vn.getContext("2d"),
      vr = Qn.createRadialGradient(16, 16, 0, 16, 16, 16);
    (vr.addColorStop(0, "rgba(255,255,255,1)"),
      vr.addColorStop(0.35, "rgba(255,255,255,0.55)"),
      vr.addColorStop(1, "rgba(255,255,255,0)"),
      (Qn.fillStyle = vr),
      Qn.fillRect(0, 0, 32, 32),
      (t.dust = []),
      (t.dustM = new e.PointsMaterial({
        map: new e.CanvasTexture(vn),
        color: 16774358,
        size: 0.07,
        sizeAttenuation: !0,
        vertexColors: !0,
        transparent: !0,
        opacity: 0,
        blending: e.AdditiveBlending,
        depthWrite: !1,
        toneMapped: !1,
      })),
      (t.shafts = []),
      (t.shaftKey = null));
    function mo(W, U) {
      var _ = be.w / 2 - Ke,
        te = [
          [U - _, be.y1 - Ke],
          [U + _, be.y1 - Ke],
          [U + _, be.y0 + Ke],
          [U - _, be.y0 + Ke],
        ],
        m = [],
        S = [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
        A,
        R,
        Y = [],
        j = [],
        Z = [];
      for (
        te.forEach(function (Me) {
          m.push([0, Me[1] - o / 2, Me[0]]);
        }),
          A = 0;
        A < 4;
        A++
      ) {
        R = (A + 1) % 4;
        var H = A * 4;
        (j.push(0, 0, 1, 0, 1, 1, 0, 1),
          Z.push(0.34, 0.34, 0.34, 0.34, 0.34, 0.34, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06),
          Y.push(H, H + 1, H + 2, H, H + 2, H + 3));
      }
      (j.push(0, 0, 1, 0, 1, 1, 0, 1),
        Z.push(0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16),
        Y.push(16, 17, 18, 16, 18, 19));
      var d = new Float32Array(60),
        C = new e.BufferGeometry();
      (C.setAttribute("position", new e.BufferAttribute(d, 3)),
        C.setAttribute("color", new e.Float32BufferAttribute(Z, 3)),
        C.setAttribute("uv", new e.Float32BufferAttribute(j, 2)),
        C.setIndex(Y));
      var D = new e.Mesh(C, t.rayM);
      ((D.renderOrder = 3), (D.frustumCulled = !1));
      function X(Me, je, he) {
        var Ie = [0, 0, 0],
          Ze;
        for (Ze = 0; Ze < 3; Ze++)
          Ie[Ze] =
            Me[0][Ze] * (1 - je) * (1 - he) +
            Me[1][Ze] * je * (1 - he) +
            Me[3][Ze] * (1 - je) * he +
            Me[2][Ze] * je * he;
        return Ie;
      }
      var $ = 45,
        le = new Float32Array($ * 3),
        re = new Float32Array($ * 3),
        ve = [],
        se;
      for (se = 0; se < $; se++)
        ve.push({
          u: Math.random(),
          v: Math.random(),
          t: Math.pow(Math.random(), 0.8),
          x: 0,
          y: 0,
          z: 0,
          ph: Math.random() * 6.283,
          sp: 0.4 + Math.random() * 0.9,
          am: 0.12 + Math.random() * 0.2,
        });
      var He = new e.BufferGeometry();
      (He.setAttribute("position", new e.BufferAttribute(le, 3)),
        He.setAttribute("color", new e.BufferAttribute(re, 3)));
      var $e = new e.Points(He, t.dustM);
      (($e.frustumCulled = !1), ($e.renderOrder = 4), t.dust.push({ geo: He, base: ve, pts: $e }));
      var Re = new e.Group();
      return (
        Re.add(D),
        Re.add($e),
        (Re.userData.aim = function (Me) {
          var je = Me[1] < -0.05,
            he,
            Ie,
            Ze,
            xt,
            ht = 0;
          if (((Re.visible = je), (D.visible = je), ($e.visible = je), !!je)) {
            for (Me = [W * Math.max(0.18, Math.abs(Me[0])), Me[1], Me[2]], he = 0; he < 4; he++)
              ((Ze = te[he][1]),
                (Ie = (Ze - 0.02) / -Me[1]),
                Me[2] < -0.001 && (Ie = Math.min(Ie, (te[he][0] + i - 0.3) / -Me[2])),
                Me[2] > 0.001 && (Ie = Math.min(Ie, (i - 0.3 - te[he][0]) / Me[2])),
                (Ie = Math.min(Ie, (r.wid - 0.3) / Math.abs(Me[0]))),
                (Ie = Math.max(Ie, 0.05)),
                (S[he] = [Me[0] * Ie, Math.max(0.02, Ze + Me[1] * Ie) - o / 2, te[he][0] + Me[2] * Ie]));
            for (he = 0; he < 4; he++) {
              var mt = (he + 1) % 4,
                Xt = [m[he], m[mt], S[mt], S[he]];
              for (xt = 0; xt < 4; xt++)
                ((d[ht++] = Xt[xt][0]), (d[ht++] = Xt[xt][1]), (d[ht++] = Xt[xt][2]));
            }
            for (he = 0; he < 4; he++) ((d[ht++] = S[he][0]), (d[ht++] = S[he][1]), (d[ht++] = S[he][2]));
            ((C.attributes.position.needsUpdate = !0),
              ve.forEach(function (Oe) {
                var De = X(m, Oe.u, Oe.v),
                  rt = X(S, Oe.u, Oe.v);
                ((Oe.x = De[0] + (rt[0] - De[0]) * Oe.t),
                  (Oe.y = De[1] + (rt[1] - De[1]) * Oe.t),
                  (Oe.z = De[2] + (rt[2] - De[2]) * Oe.t));
              }));
          }
        }),
        t.shafts.push(Re),
        Re
      );
    }
    if (
      ([
        [pr, 1],
        [Wr, -1],
      ].forEach(function (W) {
        Ti(r.len).forEach(function (U) {
          var _ = U - i,
            te = W[1] * (Ue / 2);
          function m(j, Z, H, d, C, D, X) {
            var $ = new e.Mesh(new e.BoxGeometry(j, Z, H), d);
            return ($.position.set(te - W[1] * C, D - o / 2, _ + X), W[0].add($), $);
          }
          (m(0.34, Ke, be.w + Ke, Aa, 0.25, be.y1 - Ke / 2, 0),
            m(0.34, Ke, be.w + Ke, Aa, 0.25, be.y0 + Ke / 2, 0),
            m(0.34, Ea, Ke, Aa, 0.25, _n, be.w / 2 - Ke / 2),
            m(0.34, Ea, Ke, Aa, 0.25, _n, -be.w / 2 + Ke / 2));
          var S = m(0.05, Ea - Ke, be.w - Ke, Ee, 0.25, _n, 0);
          ((S.renderOrder = 2),
            m(0.2, Ea - Ke, 0.09, Aa, 0.25, _n, 0),
            m(0.2, 0.09, be.w - Ke, Aa, 0.25, be.y1 - Ea * 0.22, 0),
            W[0].add(mo(W[1], _)));
          var A = fr,
            R = new e.Mesh(new e.BoxGeometry(Ue + 0.7, 0.12, be.w + 0.6), A);
          (R.position.set(0, be.y0 - 0.04 - o / 2, _), W[0].add(R));
          var Y = new e.Mesh(new e.BoxGeometry(Ue + 0.5, 0.1, be.w + 0.4), A);
          (Y.position.set(0, be.y0 - 0.15 - o / 2, _), W[0].add(Y));
        });
      }),
      (function () {
        var W = document.createElement("canvas");
        ((W.width = 128), (W.height = 128));
        var U = W.getContext("2d"),
          _ = U.createImageData(128, 128),
          te,
          m,
          S,
          A,
          R;
        for (te = 0; te < 128; te++)
          for (m = 0; m < 128; m++) {
            ((S = 1 - m / 127),
              (A = 1 - Math.abs(te / 63.5 - 1)),
              (R = Math.pow(Math.max(0, S), 1.5) * Math.pow(Math.max(0, A), 1.1)));
            var Y = (te * 128 + m) * 4;
            ((_.data[Y] = 255),
              (_.data[Y + 1] = 255),
              (_.data[Y + 2] = 255),
              (_.data[Y + 3] = Math.round(255 * R)));
          }
        U.putImageData(_, 0, 0);
        var j = new e.CanvasTexture(W);
        (e.SRGBColorSpace && (j.colorSpace = e.SRGBColorSpace),
          (t.spillM = new e.MeshBasicMaterial({
            map: j,
            color: 16767392,
            transparent: !0,
            opacity: 0,
            blending: e.AdditiveBlending,
            depthWrite: !1,
            side: e.DoubleSide,
            toneMapped: !1,
          })),
          (t.spillDoorM = t.spillM.clone()),
          (t.spillDoorM.opacity = 0));
        function Z(H, d, C, D, X, $, le) {
          var re = new e.Group();
          (re.position.set(D, X, $), (re.rotation.y = le));
          var ve = new e.Mesh(new e.PlaneGeometry(d, C), H);
          ((ve.rotation.x = -Math.PI / 2),
            (ve.position.x = d / 2),
            (ve.renderOrder = 2),
            re.add(ve),
            oe.add(re));
        }
        ([
          [-1, -n - Ue],
          [1, n + Ue],
        ].forEach(function (H) {
          Ti(r.len).forEach(function (d) {
            Z(t.spillM, 8, be.w + 5, H[1], 0.01, d - i, H[0] > 0 ? 0 : Math.PI);
          });
        }),
          ir(r.wid, r.len, r.cars).forEach(function (H) {
            Z(t.spillDoorM, 16, H.w + 4, H.c, 0, i + 0.4, -Math.PI / 2);
          }));
      })(),
      t.tvTimer && (clearInterval(t.tvTimer), (t.tvTimer = null)),
      t.tvVid)
    ) {
      try {
        (t.tvVid.pause(), t.tvVid.removeAttribute("src"), t.tvVid.load());
      } catch {}
      t.tvVid = null;
    }
    var mn = oe.children.length;
    if (((t.egg = null), r.wid >= 10)) {
      let W = function (m, S, A, R, Y) {
          (Le(m - 0.05, R - 0.04, 0.05, Y ? Kn : mr, S, A - R / 2, Rt + 1.02),
            Le(Math.max(0.3, m - 0.5), 0.035, 0.06, Ha, S, A - 0.1, Rt + 1.07));
        },
        U = function (m, S, A, R) {
          var Y = A;
          R.forEach(function (j, Z) {
            (W(m, S, Y, j, Z === R.length - 1), (Y -= j));
          });
        },
        _ = function () {
          if (((Se.fillStyle = "#05070a"), Se.fillRect(0, 0, 640, 360), t.tvOn === !1)) {
            var m = Se.createLinearGradient(0, 0, 640, 360);
            (m.addColorStop(0, "#0a0c10"),
              m.addColorStop(1, "#020304"),
              (Se.fillStyle = m),
              Se.fillRect(0, 0, 640, 360),
              (Ra.needsUpdate = !0));
            return;
          }
          if (Ye && Ye.readyState >= 2 && Ye.videoWidth) {
            var S = Ye.videoWidth,
              A = Ye.videoHeight,
              R = Math.min(640 / S, 360 / A),
              Y = S * R,
              j = A * R;
            try {
              Se.drawImage(Ye, (640 - Y) / 2, (360 - j) / 2, Y, j);
            } catch {
              Ye = null;
              return;
            }
            var Z = Se.createRadialGradient(320, 180, 120, 320, 180, 420);
            (Z.addColorStop(0, "rgba(0,0,0,0)"),
              Z.addColorStop(1, "rgba(0,0,0,0.38)"),
              (Se.fillStyle = Z),
              Se.fillRect(0, 0, 640, 360),
              (Ra.needsUpdate = !0));
            return;
          }
          var tq = performance.now() / 1000, gx2, gy2, px2;
          Se.fillStyle = "#04070b"; Se.fillRect(0, 0, 640, 360);
          Se.strokeStyle = "rgba(0,200,255,0.09)"; Se.lineWidth = 1;
          for (gx2 = 0; gx2 <= 640; gx2 += 40) { Se.beginPath(); Se.moveTo(gx2, 0); Se.lineTo(gx2, 360); Se.stroke(); }
          for (gy2 = 0; gy2 <= 360; gy2 += 40) { Se.beginPath(); Se.moveTo(0, gy2); Se.lineTo(640, gy2); Se.stroke(); }
          Se.strokeStyle = "rgba(0,230,255,0.5)"; Se.lineWidth = 2; Se.beginPath();
          for (px2 = 0; px2 <= 640; px2 += 8) { var py2 = 240 + 34 * Math.sin(px2 * 0.02 + tq * 1.3) + 12 * Math.sin(px2 * 0.07 - tq * 2); px2 ? Se.lineTo(px2, py2) : Se.moveTo(px2, py2); }
          Se.stroke();
          Se.fillStyle = "rgba(0,230,255,0.4)"; Se.font = "600 18px monospace";
          Se.fillText("RPM " + (3100 + Math.round(600 * Math.sin(tq * 0.7))), 26, 42);
          Se.fillText("OIL 92C   BOOST 1.2 BAR", 26, 68);
          var gl2 = Se.createLinearGradient(0, 0, 640, 360); gl2.addColorStop(0, "rgba(255,255,255,0.05)"); gl2.addColorStop(0.45, "rgba(255,255,255,0)"); Se.fillStyle = gl2; Se.fillRect(0, 0, 640, 360);
          Ra.needsUpdate = !0;
        };
      var fi = W,
        ps = U,
        $r = _,
        Xe = Cs(r.wid),
        Rt = -i + 1,
        mr = new e.MeshStandardMaterial({ color: 1382429, roughness: 0.6, metalness: 0.25 }),
        st = new e.MeshStandardMaterial({ color: 855827, roughness: 0.7, metalness: 0.2 }),
        Kn = new e.MeshStandardMaterial({ color: 1843239, roughness: 0.42, metalness: 0.4 }),
        Ha = new e.MeshStandardMaterial({ color: 14673132, roughness: 0.2, metalness: 0.95 }),
        go = (function () {
          var m = document.createElement("canvas");
          ((m.width = 256), (m.height = 64));
          var S = m.getContext("2d"),
            A;
          for (S.fillStyle = "#7a4a2b", S.fillRect(0, 0, 256, 64), A = 0; A < 90; A++)
            ((S.fillStyle =
              "rgba(" + (A % 2 ? "60,32,16" : "150,96,58") + "," + (0.1 + Math.random() * 0.18) + ")"),
              S.fillRect(0, Math.random() * 64, 256, 0.6 + Math.random() * 1.6));
          var R = new e.CanvasTexture(m);
          return ((R.colorSpace = e.SRGBColorSpace), R);
        })(),
        Hr = new e.MeshStandardMaterial({ color: 16777215, map: go, roughness: 0.4, metalness: 0.05 }),
        Mo = new e.MeshStandardMaterial({ color: 461069, roughness: 0.08, metalness: 0.6 }),
        Le = function (m, S, A, R, Y, j, Z) {
          var H = new e.Mesh(new e.BoxGeometry(m, S, A), R);
          return (H.position.set(Y, j, Z), oe.add(H), H);
        },
        gr = -n + Xe.off + Xe.tallW,
        Ua,
        cs,
        Ur;
      [-n + Xe.off + Xe.tallW / 2, -n + Xe.off + Xe.total - Xe.tallW / 2].forEach(function (m) {
        (Le(Xe.tallW, 7, 2, st, m, 3.5, Rt),
          Le(Xe.tallW - 0.1, 6.8, 0.05, mr, m, 3.5, Rt + 1.02),
          Le(0.04, 6.8, 0.07, Ha, m + (m < 0 ? Xe.tallW / 2 - 0.03 : -Xe.tallW / 2 + 0.03), 3.5, Rt + 1.03),
          m < 0 && Le(Math.min(1.5, Xe.tallW - 0.3), 0.2, 1, Kn, m, 7.1, Rt));
      });
      for (
        var Jt = Math.max(2, Math.round(Xe.run / 2.7)),
          Ri = [],
          Gi = 0,
          Jn = [1, 2, 1, 1, 2, 1],
          zi = 0,
          xo = Xe.run / Jt,
          $n = gr;
        Gi < Jt;
      ) {
        var Xa = Jn[zi % Jn.length];
        (Gi + Xa > Jt && (Xa = 1), Ri.push(Xa), (Gi += Xa), zi++);
      }
      var gn = new e.MeshStandardMaterial({ color: 526604, roughness: 0.8 }),
        ja = new e.MeshStandardMaterial({ color: 11121084, roughness: 0.4, metalness: 0.7 });
      (Ri.forEach(function (m) {
        var S = m * xo,
          A = $n + S / 2,
          R = m > 1;
        (($n += S),
          Le(S - 0.03, 2.78, 1.98, st, A, 1.64, Rt),
          Le(S - 0.1, 0.22, 1.9, gn, A, 0.11, Rt - 0.02),
          R
            ? (W(S, A, 3, 0.5, !1),
              U(S / 2 - 0.01, A - S / 4, 2.5, [0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.35]),
              U(S / 2 - 0.01, A + S / 4, 2.5, [0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.35]))
            : U(S, A, 3, [0.34, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.31]),
          Le(0.5, 0.09, 0.03, ja, A - S / 2 + 0.45, 2.88, Rt + 1.06),
          Le(0.1, 0.1, 0.03, ja, A - S / 2 + 1, 2.88, Rt + 1.06));
      }),
        Le(Xe.run, 0.1, 2.1, Hr, gr + Xe.run / 2, 3.07, Rt),
        Le(Xe.run, 3.9, 0.1, st, gr + Xe.run / 2, 5.05, -i + 0.05));
      var Pi = new e.MeshStandardMaterial({ color: 2764342, roughness: 0.7 }),
        la,
        Ii = Math.max(2, Math.round(Xe.run / 2.2));
      for (la = 1; la < Ii; la++) Le(0.03, 3.9, 0.02, Pi, gr + (la * Xe.run) / Ii, 5.05, -i + 0.11);
      var pa = Math.min(4.6, Xe.run * 0.34),
        Ya = (Xe.run - pa) / 2,
        Za = Math.max(1, Math.round(Ya / 2.5)),
        va = Ya / Za,
        ma,
        Ba;
      for (Ba = 0; Ba < 2; Ba++) {
        var lt = gr + Ba * (Ya + pa);
        for (Ur = 0; Ur < Za; Ur++) {
          if (((ma = lt + (Ur + 0.5) * va), Ba === 0 && Ur === Za - 1)) {
            (function (m) {
              var S = va - 0.05,
                A = 1.75,
                R = 0.96,
                Y = -i + 0.07,
                j = -i + 1.03,
                Z = 5.8 - A / 2,
                H = new e.MeshStandardMaterial({ color: 2303533, roughness: 0.8, metalness: 0.1 });
              (Le(S, A, 0.04, H, m, 5.8, Y + 0.02),
                Le(S, 0.05, R, st, m, Z + 0.025, -i + 0.55),
                Le(S, 0.05, R, st, m, Z + A - 0.025, -i + 0.55),
                Le(0.05, A, R, st, m - S / 2 + 0.025, 5.8, -i + 0.55),
                Le(0.05, A, R, st, m + S / 2 - 0.025, 5.8, -i + 0.55));
              var d = 5.72;
              Le(S - 0.1, 0.04, R - 0.08, H, m, d, -i + 0.53);
              var C = new e.MeshBasicMaterial({ color: 3842303, toneMapped: !1 });
              (Le(S - 0.2, 0.02, 0.02, C, m, Z + A - 0.07, j - 0.08),
                Le(S - 0.2, 0.02, 0.02, C, m, d - 0.04, j - 0.08));
              var D = new e.Mesh(
                new e.PlaneGeometry(S - 0.3, 0.05),
                new e.MeshBasicMaterial({
                  color: 3842303,
                  transparent: !0,
                  opacity: 0.55,
                  toneMapped: !1,
                  depthWrite: !1,
                }),
              );
              ((D.rotation.x = Math.PI / 2), D.position.set(m, Z - 0.004, j - 0.02), oe.add(D));
              var X = new e.Group();
              X.position.set(m - 0.1, d + 0.02, -i + 0.5);
              var $ = new e.Mesh(
                new e.BoxGeometry(1.1, 0.2, 0.72),
                new e.MeshStandardMaterial({ color: 855569, roughness: 0.35, metalness: 0.3 }),
              );
              (($.position.y = 0.12), X.add($));
              var le = new e.Mesh(
                new e.BoxGeometry(1.06, 0.02, 0.68),
                new e.MeshStandardMaterial({ color: 2040360, roughness: 0.6 }),
              );
              ((le.position.y = 0.01), X.add(le));
              var re = new e.Mesh(
                new e.BoxGeometry(0.5, 0.012, 0.01),
                new e.MeshBasicMaterial({ color: 5617919, toneMapped: !1 }),
              );
              (re.position.set(-0.2, 0.15, 0.362), X.add(re));
              var ve = new e.Mesh(
                new e.CircleGeometry(0.018, 16),
                new e.MeshBasicMaterial({ color: 16777215, toneMapped: !1 }),
              );
              (ve.position.set(0.44, 0.12, 0.361), X.add(ve), oe.add(X));
              var se = new e.Group(),
                He = new e.MeshStandardMaterial({ color: 1382171, roughness: 0.55, metalness: 0.15 }),
                $e,
                Re = new e.Shape();
              (Re.moveTo(-0.17, -0.07),
                Re.absarc(-0.17, 0, 0.07, -Math.PI / 2, Math.PI / 2, !0),
                Re.lineTo(0.17, 0.07),
                Re.absarc(0.17, 0, 0.07, Math.PI / 2, -Math.PI / 2, !0),
                Re.lineTo(-0.17, -0.07));
              var Me = new e.ExtrudeGeometry(Re, {
                  depth: 0.045,
                  bevelEnabled: !0,
                  bevelThickness: 0.015,
                  bevelSize: 0.015,
                  bevelSegments: 4,
                  curveSegments: 18,
                }),
                je = new e.Mesh(Me, He);
              ((je.rotation.x = -Math.PI / 2),
                (je.position.y = 0.035),
                se.add(je),
                [-1, 1].forEach(function (Qe) {
                  var gt = new e.Mesh(new e.CapsuleGeometry(0.058, 0.12, 6, 14), He);
                  (gt.rotation.set(Math.PI / 2, 0, Qe * 0.45),
                    gt.position.set(Qe * 0.2, 0.045, 0.095),
                    se.add(gt));
                  var jt = new e.Mesh(
                    new e.BoxGeometry(0.12, 0.025, 0.03),
                    new e.MeshStandardMaterial({ color: 2369325, roughness: 0.5 }),
                  );
                  (jt.position.set(Qe * 0.16, 0.075, -0.085), se.add(jt));
                }));
              var he = 0.096,
                Ie = new e.MeshStandardMaterial({ color: 2764083, roughness: 0.75 });
              [
                [-0.135, -0.025],
                [0.07, 0.04],
              ].forEach(function (Qe) {
                var gt = new e.Mesh(new e.CylinderGeometry(0.022, 0.026, 0.03, 16), Ie);
                (gt.position.set(Qe[0], he + 0.01, Qe[1]), se.add(gt));
                var jt = new e.Mesh(new e.CylinderGeometry(0.036, 0.036, 0.014, 20), Ie);
                (jt.position.set(Qe[0], he + 0.03, Qe[1]), se.add(jt));
              });
              var Ze = new e.MeshStandardMaterial({ color: 3093048, roughness: 0.6 }),
                xt = new e.Mesh(new e.BoxGeometry(0.075, 0.012, 0.024), Ze);
              (xt.position.set(-0.07, he + 0.004, 0.045), se.add(xt));
              var ht = new e.Mesh(new e.BoxGeometry(0.024, 0.012, 0.075), Ze);
              (ht.position.set(-0.07, he + 0.004, 0.045),
                se.add(ht),
                [
                  [0.135, 0.008, 4177754],
                  [0.17, -0.027, 14173242],
                  [0.1, -0.027, 3833816],
                  [0.135, -0.062, 15254074],
                ].forEach(function (Qe) {
                  var gt = new e.Mesh(
                    new e.CylinderGeometry(0.016, 0.016, 0.014, 16),
                    new e.MeshStandardMaterial({
                      color: Qe[2],
                      roughness: 0.3,
                      emissive: Qe[2],
                      emissiveIntensity: 0.25,
                    }),
                  );
                  (gt.position.set(Qe[0], he + 0.005, Qe[1]), se.add(gt));
                }));
              var mt = new e.Mesh(
                new e.CylinderGeometry(0.022, 0.022, 0.012, 20),
                new e.MeshBasicMaterial({ color: 10474751, toneMapped: !1 }),
              );
              (mt.position.set(0, he + 0.004, -0.045), se.add(mt));
              var Xt = new e.Mesh(
                new e.BoxGeometry(0.75, 0.3, 0.5),
                new e.MeshBasicMaterial({ visible: !1 }),
              );
              ((Xt.position.y = 0.08),
                se.add(Xt),
                se.position.set(m + 0.1, Z + 0.05, -i + 0.72),
                (se.rotation.y = -0.3),
                se.scale.setScalar(1.2),
                oe.add(se));
              var Oe = new e.Group();
              (Oe.position.set(m, 5.8 + 0.825, -i + 1.04), oe.add(Oe));
              var De = new e.Mesh(new e.BoxGeometry(va - 0.1, 1.65, 0.05), mr);
              (De.position.set(0, -0.825, 0), Oe.add(De));
              var rt = new e.Mesh(new e.BoxGeometry(va - 0.3, 0.035, 0.06), Ha);
              (rt.position.set(0, -1.625, 0.04), Oe.add(rt));
              var nt = new e.Mesh(new e.BoxGeometry(0.1, 0.07, 0.03), ja);
              (nt.position.set(va / 2 - 0.45, -1.545, 0.03),
                Oe.add(nt),
                (t.egg = { hinge: Oe, door: De, pad: se, home: mt, leak: D, open: !1, ang: 0, busy: !1 }));
            })(ma);
            continue;
          }
          (Le(va - 0.05, 1.75, 0.96, st, ma, 5.8, -i + 0.55),
            Le(va - 0.1, 1.65, 0.05, mr, ma, 5.8, -i + 1.04),
            Le(va - 0.3, 0.035, 0.06, Ha, ma, 5, -i + 1.08),
            Le(0.1, 0.07, 0.03, ja, ma + va / 2 - 0.45, 5.08, -i + 1.07));
        }
        var Tn = Ba === 0 ? lt + 0.9 : lt + Ya - 0.9,
          Oi = 6.68 + 0.5;
        (Le(1.45, 0.95, 0.85, st, Tn, Oi, -i + 0.62),
          [
            [-0.38, 0.52],
            [0.36, 0.3],
          ].forEach(function (m, S) {
            var A = new e.Mesh(new e.CylinderGeometry(m[1] * 0.5, m[1] * 0.5, 0.05, 20), S ? mr : Kn);
            ((A.rotation.x = Math.PI / 2), A.position.set(Tn + m[0] * 0.8, Oi, -i + 1.07), oe.add(A));
          }));
      }
      var La = gr + Ya + pa / 2,
        _a = pa * 0.5625,
        Qa = 6.6 - _a / 2;
      (Le(pa, _a, 0.1, Mo, La, Qa, -i + 0.2),
        Le(pa + 0.06, _a + 0.06, 0.05, st, La, Qa, -i + 0.14),
        t.tvTimer && (clearInterval(t.tvTimer), (t.tvTimer = null)));
      var Mn = document.createElement("canvas");
      ((Mn.width = 640), (Mn.height = 360));
      var Se = Mn.getContext("2d"),
        Ra = new e.CanvasTexture(Mn);
      Ra.colorSpace = e.SRGBColorSpace;
      var Je = { x: 90, y: 70, vx: 3.2, vy: 2.4, w: 300, h: 92, hue: 0 },
        Ye = null;
      if (ce.tvVideo) {
        ((Ye = document.createElement("video")),
          (Ye.crossOrigin = "anonymous"),
          (Ye.muted = !0),
          (Ye.loop = !0),
          (Ye.playsInline = !0),
          Ye.setAttribute("playsinline", ""),
          (Ye.preload = "auto"),
          (Ye.src = ce.tvVideo),
          (Ye.volume = 0),
          (Ye.muted = !t.sound),
          (t.tvVid = Ye));
        var $t = Ye.play();
        ($t &&
          $t.catch &&
          $t.catch(function () {
            Ye.muted = !0;
            var m = Ye.play();
            m && m.catch && m.catch(function () {});
          }),
          Ye.addEventListener("error", function () {
            Ye = null;
          }));
      }
      _();
      var Xr = new e.Mesh(
        new e.PlaneGeometry(pa - 0.12, _a - 0.12),
        new e.MeshBasicMaterial({ map: Ra, toneMapped: !1 }),
      );
      (Xr.position.set(La, Qa, -i + 0.252), oe.add(Xr));
      var xn = document.createElement("canvas");
      ((xn.width = 256), (xn.height = 144));
      var Ct = xn.getContext("2d"),
        kt = Ct.createLinearGradient(0, 0, 256, 144);
      (kt.addColorStop(0, "rgba(255,255,255,0.10)"),
        kt.addColorStop(0.2, "rgba(255,255,255,0.0)"),
        kt.addColorStop(0.36, "rgba(255,255,255,0.0)"),
        kt.addColorStop(0.46, "rgba(255,255,255,0.20)"),
        kt.addColorStop(0.58, "rgba(255,255,255,0.0)"),
        kt.addColorStop(0.68, "rgba(255,255,255,0.12)"),
        kt.addColorStop(0.78, "rgba(255,255,255,0.0)"),
        kt.addColorStop(1, "rgba(255,255,255,0.0)"),
        (Ct.fillStyle = kt),
        Ct.fillRect(0, 0, 256, 144));
      var wn = new e.Mesh(
        new e.PlaneGeometry(pa - 0.12, _a - 0.12),
        new e.MeshBasicMaterial({
          map: new e.CanvasTexture(xn),
          transparent: !0,
          depthWrite: !1,
          blending: e.AdditiveBlending,
          toneMapped: !1,
        }),
      );
      (wn.position.set(La, Qa, -i + 0.255),
        oe.add(wn),
        (t.tvScr = Xr),
        (t.tvPaint = _),
        (t.tvLed = Le(
          0.07,
          0.04,
          0.02,
          new e.MeshBasicMaterial({ color: t.tvOn === !1 ? 14169132 : 1323036, toneMapped: !1 }),
          La + pa / 2 - 0.18,
          Qa - _a / 2 - 0.015,
          -i + 0.175,
        )),
        (t.tvTimer = setInterval(function () {
          if (!t || !Rr || document.hidden || !t.renderer || !t.renderer.domElement.offsetParent) {
            t && cr();
            return;
          }
          (_(), ye());
        }, 60)));
      var Di = -n + Xe.off + Xe.total,
        bn = Di + 1.1 < n - 0.2 ? Di + 1 : -n + Xe.off - 1;
      if (Math.abs(bn) < n - 0.2) {
        Le(1.7, 1.5, 1.9, st, bn, 0.75, Rt);
        var Fi = new e.Mesh(new e.CylinderGeometry(0.55, 0.55, 0.05, 24), Kn);
        ((Fi.rotation.x = Math.PI / 2), Fi.position.set(bn, 0.8, Rt + 0.96), oe.add(Fi));
      }
      for (var ke = mn; ke < oe.children.length; ke++)
        oe.children[ke] !== Xr && oe.children[ke] !== wn && Uo(oe.children[ke], 0.5);
    }
    var pe = null;
    if (oe.children.length > mn) {
      pe = new e.Box3();
      for (var Ga = mn; Ga < oe.children.length; Ga++) pe.expandByObject(oe.children[Ga]);
    }
    var ei = [13620186],
      Tt,
      ti;
    t.carList = [];
    var qi = [];
    for (Tt = 0; Tt < r.spots.length; Tt++) {
      var Ka = e0(e, ei[Tt % ei.length]);
      (Uo(Ka, 0.28),
        Ka.scale.setScalar(0.9),
        Ka.position.set(r.spots[Tt].x, 0, r.spots[Tt].z),
        (Ka.visible = ct),
        t.carList.push(Ka),
        qi.push(new e.Box3().setFromObject(Ka)),
        oe.add(Ka));
    }
    var ai = r.isOver ? Bs(r.fixture) : 0,
      za = r.isOver ? Math.max((r.fixture.widthIn || 6) / 12, ai >= 6 ? 2.3 : 1.7) : 0.46,
      fs = new e.MeshStandardMaterial({
        color: Er === "black" ? 1382430 : 15527924,
        roughness: 0.5,
        metalness: 0.2,
      }),
      us = new e.MeshStandardMaterial({ color: 15330804, roughness: 0.6 }),
      jr = Es(r.fixture),
      ri = new e.MeshBasicMaterial({ color: jr.c3 }),
      Mr = document.createElement("canvas");
    ((Mr.width = 128), (Mr.height = 128));
    var ni = Mr.getContext("2d"),
      Yr = ni.createRadialGradient(64, 64, 0, 64, 64, 64);
    (Yr.addColorStop(0, "rgba(255,255,255,0.95)"),
      Yr.addColorStop(0.25, "rgba(255,255,255,0.45)"),
      Yr.addColorStop(0.6, "rgba(255,255,255,0.12)"),
      Yr.addColorStop(1, "rgba(255,255,255,0)"),
      (ni.fillStyle = Yr),
      ni.fillRect(0, 0, 128, 128));
    var ii = new e.CanvasTexture(Mr);
    e.SRGBColorSpace && (ii.colorSpace = e.SRGBColorSpace);
    var oi = new e.MeshBasicMaterial({
        map: ii,
        color: jr.g3,
        transparent: !0,
        opacity: 0.3,
        blending: e.AdditiveBlending,
        depthWrite: !1,
        side: e.DoubleSide,
      }),
      wo = new e.MeshStandardMaterial({ color: 12896980, roughness: 0.6 });
    ((t.glowM = oi),
      (t.c3 = jr.c3),
      t.pl.forEach(function (W) {
        W.color.set(jr.g3);
      }));
    var Wi = new e.MeshBasicMaterial({
        color: jr.g3,
        transparent: !0,
        opacity: 0.17,
        blending: e.AdditiveBlending,
        depthWrite: !1,
      }),
      Zr = new e.Mesh(new e.PlaneGeometry(r.wid, r.len), Wi);
    ((Zr.rotation.x = -Math.PI / 2), Zr.position.set(0, 0.06, 0), (Zr.renderOrder = 1), oe.add(Zr));
    var Ni = new e.MeshBasicMaterial({
        map: ii,
        color: jr.g3,
        transparent: !0,
        opacity: 0.5,
        blending: e.AdditiveBlending,
        depthWrite: !1,
      }),
      Pa = new e.Mesh(new e.PlaneGeometry(1, 1), Ni);
    ((Pa.rotation.x = -Math.PI / 2),
      (Pa.renderOrder = 1),
      oe.add(Pa),
      (t.fAll = Zr),
      (t.fOne = Pa),
      (t.washM = Wi),
      (t.oneM = Ni));
    var Ja = document.createElement("canvas");
    ((Ja.width = 128), (Ja.height = 128));
    var Ct = Ja.getContext("2d"),
      ea = Ct.createRadialGradient(64, 64, 0, 64, 64, 64);
    (ea.addColorStop(0, "#e6e6e6"),
      ea.addColorStop(0.5, "#8c8c8c"),
      ea.addColorStop(0.8, "#262626"),
      ea.addColorStop(1, "#000000"),
      (Ct.fillStyle = "#000000"),
      Ct.fillRect(0, 0, 128, 128),
      (Ct.fillStyle = ea),
      Ct.fillRect(0, 0, 128, 128));
    var $a = new e.CanvasTexture(Ja),
      xr = new e.MeshBasicMaterial({ alphaMap: $a, color: 0, transparent: !0, opacity: 0.4, depthWrite: !1 });
    ((t.shadowM = xr), (t.carShadows = []));
    function Ia(W, U, _, te) {
      var m = new e.Mesh(new e.PlaneGeometry(_, te), xr);
      return (
        (m.rotation.x = -Math.PI / 2),
        m.position.set(W, 0.045, U),
        (m.renderOrder = 0.5),
        oe.add(m),
        m
      );
    }
    (qi.forEach(function (W, U) {
      var _ = Ia(
        (W.min.x + W.max.x) / 2,
        (W.min.z + W.max.z) / 2,
        (W.max.x - W.min.x) * 1.4 + 1,
        (W.max.z - W.min.z) * 1.25 + 1,
      );
      ((_.visible = ct), t.carShadows.push(_));
    }),
      (t.ring = new e.Group()));
    var Ta = new e.MeshBasicMaterial({
        color: 16761395,
        depthTest: !1,
        transparent: !0,
        opacity: 0.95,
        side: e.DoubleSide,
      }),
      _r = new e.Mesh(new e.RingGeometry(0.93, 1, 56), Ta);
    ((_r.rotation.x = -Math.PI / 2),
      _r.scale.set(3.6, 7.4, 1),
      (_r.renderOrder = 17),
      (_r.position.y = 0.08),
      t.ring.add(_r),
      oe.add(t.ring));
    var Qr = new e.MeshBasicMaterial({ color: 16761395, depthTest: !1, transparent: !0 }),
      Ut = new e.MeshBasicMaterial({ color: 16761395, depthTest: !1, transparent: !0, opacity: 0.3 }),
      Gt = new e.Mesh(new e.BoxGeometry(0.22, 0.05, 2.6), Qr);
    (Gt.position.set(0, 0.08, 8.7), (Gt.renderOrder = 17), t.ring.add(Gt));
    var ga = new e.Group();
    ga.position.set(0, 0.9, 10);
    var Vi = new e.Mesh(new e.SphereGeometry(1.9, 18, 12), Ut);
    Vi.renderOrder = 19;
    var Hi = new e.Mesh(new e.SphereGeometry(1, 18, 12), Qr);
    Hi.renderOrder = 20;
    var yn = new e.Mesh(new e.SphereGeometry(2.8, 8, 6), new e.MeshBasicMaterial({ visible: !1 }));
    (ga.add(Vi),
      ga.add(Hi),
      ga.add(yn),
      [1, -1].forEach(function (W) {
        var U = new e.Mesh(new e.ConeGeometry(0.6, 1.2, 12), Qr);
        ((U.renderOrder = 20), (U.rotation.z = (-W * Math.PI) / 2), (U.position.x = W * 2.6), ga.add(U));
      }),
      t.ring.add(ga),
      (t.rotG = ga),
      (t.rotHit = yn),
      pe && Ia((pe.min.x + pe.max.x) / 2, pe.max.z - 0.2, pe.max.x - pe.min.x + 2.4, 4.2),
      (t.lamps = []),
      (t.bulbM = ri),
      (t.offM = wo),
      (t.oneIdx = 0));
    var Sn = document.createElement("canvas");
    Sn.width = Sn.height = 128;
    var Kr = Sn.getContext("2d"),
      Jr = Kr.createRadialGradient(64, 64, 0, 64, 64, 64);
    (Jr.addColorStop(0, "rgba(255,255,255,0.95)"),
      Jr.addColorStop(0.25, "rgba(255,250,235,0.5)"),
      Jr.addColorStop(0.6, "rgba(255,245,220,0.14)"),
      Jr.addColorStop(1, "rgba(255,245,220,0)"),
      (Kr.fillStyle = Jr),
      Kr.fillRect(0, 0, 128, 128),
      (t.bloomM = new e.SpriteMaterial({
        map: new e.CanvasTexture(Sn),
        color: 16774358,
        transparent: !0,
        opacity: 0,
        blending: e.AdditiveBlending,
        depthWrite: !1,
        toneMapped: !1,
      })));
    var si = 1e9;
    for (ti = 0; ti < r.rows; ti++) {
      var ta = r.rowMargin + ti * r.rowGap - i;
      r.pieces.forEach(function (W) {
        var U = Math.max(W.len - 0.1, 0.2),
          _ = W.x + W.len / 2 - n,
          te = { lit: [], glows: [] },
          m = _ * _ + ta * ta;
        if ((m < si && ((si = m), (t.oneIdx = t.lamps.length)), t.lamps.push(te), r.isOver)) {
          var S = new e.Mesh(new e.BoxGeometry(U, 0.18, za), us);
          (S.position.set(_, o - 0.09, ta), oe.add(S));
          var A = (za - 0.2) / ai,
            R = Math.min(A * 0.42, 0.24),
            Y;
          for (Y = 0; Y < ai; Y++) {
            var j = new e.Mesh(new e.CylinderGeometry(R, R, Math.max(U - 0.2, 0.2), 10), ri);
            ((j.rotation.z = Math.PI / 2),
              te.lit.push(j),
              j.position.set(_, o - 0.18 - R * 1.05, ta - za / 2 + 0.1 + A * (Y + 0.5)),
              oe.add(j));
          }
        } else {
          var Z = za * 0.6,
            H = za * 0.4,
            d = o - 0.005,
            C = new e.Mesh(new e.BoxGeometry(U, Z, za), fs);
          (C.position.set(_, d - Z / 2, ta), oe.add(C));
          var D = new e.Mesh(new e.BoxGeometry(U, H, za * 0.94), ri);
          (D.position.set(_, d - Z - H / 2 + 0.01, ta), oe.add(D), te.lit.push(D));
        }
        var X = o - 0.5,
          $ = new e.Mesh(new e.PlaneGeometry(U + 0.8, za + 1.4), oi);
        (($.rotation.x = -Math.PI / 2),
          $.position.set(_, X - 0.1, ta),
          ($.renderOrder = 2),
          oe.add($),
          te.glows.push($));
        var le = new e.Mesh(new e.PlaneGeometry(U + 0.4, 1.6), oi);
        (le.position.set(_, X, ta),
          (le.renderOrder = 2),
          oe.add(le),
          te.glows.push(le),
          (te.x = _),
          (te.z = ta));
        var re = new e.Sprite(t.bloomM);
        (re.scale.set(U + 0.9, Math.max(za, 0.5) + 0.8, 1),
          re.position.set(_, o - 0.7, ta),
          (re.renderOrder = 5),
          (re.visible = !1),
          oe.add(re),
          (te.bloom = re));
      });
    }
    ((t.dims = { w: r.wid, l: r.len, h: parseFloat(V("ht").value) || 9 }),
      ns(t.dims.w, t.dims.l, t.dims.h),
      (t.handles = new e.Group()),
      (t.hitMeshes = []),
      (t.handleObjs = {}));
    var Ui = new e.MeshBasicMaterial({ color: 16761395, depthTest: !1, transparent: !0 }),
      bo = new e.MeshBasicMaterial({ color: 16761395, depthTest: !1, transparent: !0, opacity: 0.3 }),
      yo = new e.MeshBasicMaterial({ visible: !1 });
    (["w", "l", "h"].forEach(function (W) {
      var U = new e.Group(),
        _ = new e.Mesh(new e.SphereGeometry(1.9, 18, 12), bo);
      _.renderOrder = 19;
      var te = new e.Mesh(new e.SphereGeometry(1, 18, 12), Ui);
      te.renderOrder = 20;
      var m = new e.Mesh(new e.SphereGeometry(2.8, 8, 6), yo);
      ((m.userData.axis = W),
        U.add(_),
        U.add(te),
        U.add(m),
        [1, -1].forEach(function (S) {
          var A = new e.Mesh(new e.ConeGeometry(0.6, 1.2, 12), Ui);
          ((A.renderOrder = 20),
            W === "w"
              ? ((A.rotation.z = (-S * Math.PI) / 2), (A.position.x = S * 2.6))
              : W === "l"
                ? ((A.rotation.x = (S * Math.PI) / 2), (A.position.z = S * 2.6))
                : ((A.rotation.z = S > 0 ? 0 : Math.PI), (A.position.y = S * 2.6)),
            U.add(A));
        }),
        t.handles.add(U),
        (t.handleObjs[W] = U),
        t.hitMeshes.push(m));
    }),
      oe.add(t.handles),
      (t.preview = new e.LineSegments(
        new e.EdgesGeometry(new e.BoxGeometry(1, 1, 1)),
        new e.LineBasicMaterial({ color: 16761395, depthTest: !1, transparent: !0 }),
      )),
      (t.preview.renderOrder = 18),
      (t.preview.visible = !1),
      oe.add(t.preview),
      r.spots.forEach(function (W, U) {
        zr(U);
      }),
      t.sel >= r.spots.length && (t.sel = -1),
      lr(),
      merGarageLux(e, oe, r, n, i, o),
      t.scene.add(oe),
      ya(!0),
      (t.R = Math.sqrt(r.wid * r.wid + r.len * r.len) / 2 + 1.5 + s * 0.55),
      (t.cy = 2.5 + s * 0.45),
      (t.pitch = et ? et.pitch : 0.68),
      (t.zoom = et ? et.zoom : 1),
      dl(a));
    var So = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (
      (et
        ? (t.intro = null)
        : !t.touched && !So
          ? ((t.yaw = -0.7), (t.intro = 0))
          : t.touched || ((t.yaw = 0), (t.intro = null)),
      ye(),
      t.intro !== null &&
        t.intro !== void 0 &&
        !t.running &&
        ((t.running = !0),
        (function W() {
          if (!t.running || !Rr) {
            t.running = !1;
            return;
          }
          t.intro += 0.025;
          var U = Math.min(t.intro, 1);
          (t.touched || (t.yaw = -0.7 * (1 - (1 - Math.pow(1 - U, 3)))),
            ye(),
            U < 1 && !t.touched ? requestAnimationFrame(W) : ((t.running = !1), (t.intro = null)));
        })()),
      Xo(),
      t.resumeDrive >= 0 && et)
    ) {
      var ko = t.resumeDrive;
      ((t.resumeDrive = -1),
        setTimeout(function () {
          if (t && t.carList && t.carList.length && a.classList.contains("lc-open")) {
            var W = t.resumeRace;
            ((t.resumeRace = !1), ts(Math.min(ko, t.carList.length - 1)), W && uo());
          }
        }, 60));
    } else t.resumeDrive = -1;
  }
  function dl(e) {
    var a = e.clientWidth || 300,
      r = e.clientHeight || 190;
    (t.renderer.setSize(a, r, !1), (t.camera.aspect = a / r), t.camera.updateProjectionMatrix());
    var n = (t.camera.fov * Math.PI) / 180,
      i = 2 * Math.atan(Math.tan(n / 2) * t.camera.aspect);
    ((t.dist = (t.R * 0.8) / Math.sin(Math.min(n, i) / 2)), It());
  }
  function Nn() {
    (dl(V("three")), ye());
  }
  function po() {
    var e = V("three");
    (e.classList.add("lc-open"),
      t.bd.classList.add("lc-on"),
      e.setAttribute("role", "dialog"),
      e.setAttribute("aria-modal", "true"),
      (t.xb.textContent = "\u2715 Close"),
      t.xb.setAttribute("aria-label", "Close larger view"),
      (document.body.style.overflow = "hidden"),
      we(""));
    Nn();
  }
  function Si() {
    var e = V("three");
    if (e.classList.contains("lc-open")) {
      (e.classList.remove("lc-open"),
        t.bd.classList.remove("lc-on"),
        e.setAttribute("role", "img"),
        e.removeAttribute("aria-modal"),
        (t.xb.textContent = "\u2922 Expand"),
        t.xb.setAttribute("aria-label", "Open larger view"),
        (document.body.style.overflow = ""));
      try {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          var a = document.exitFullscreen || document.webkitExitFullscreen,
            r = a.call(document);
          r && r.catch && r.catch(function () {});
        }
      } catch {}
      (cr(),
        t.drive && or(!0),
        bi(!1),
        we(""),
        (t.sel = -1),
        lr(),
        (on = 100),
        (ct = !0),
        (zt = "night"),
        (ra = !1),
        (t.doorT = 0),
        cancelAnimationFrame(t.doorRaf),
        Yo(0),
        ya(!0),
        Nn(),
        t.xb.focus());
    }
  }
  function F0(e) {
    if (t.ac === !1) return null;
    try {
      if (!t.ac) {
        var a = window.AudioContext || window.webkitAudioContext;
        if (!a) return ((t.ac = !1), null);
        t.ac = new a();
      }
      if (t.ac.state === "suspended") {
        var r = t.ac.resume();
        r && r.catch && r.catch(function () {});
      }
      if (!t.aud || t.aud.el !== e) {
        var n = t.ac.createMediaElementSource(e),
          i = t.ac.createGain(),
          o = t.ac.createPanner();
        ((o.panningModel = "equalpower"),
          (o.distanceModel = "linear"),
          (o.refDistance = 1),
          (o.maxDistance = 1e5),
          (o.rolloffFactor = 0),
          n.connect(i),
          i.connect(o),
          o.connect(t.ac.destination),
          (t.aud = { el: e, gain: i, pan: o }));
      }
      return t.aud;
    } catch {
      return ((t.ac = !1), (t.aud = null), null);
    }
  }
  function hl(e, a, r, n) {
    e.positionX
      ? ((e.positionX.value = a), (e.positionY.value = r), (e.positionZ.value = n))
      : e.setPosition && e.setPosition(a, r, n);
  }
  function cr() {
    var e = t && t.tvVid;
    if (e) {
      var a =
        !!t.sound &&
        t.tvOn !== !1 &&
        t.host.classList.contains("lc-open") &&
        !document.hidden &&
        t.renderer &&
        t.renderer.domElement.offsetParent;
      if (t.tvHold) {
        if (((e.muted = !0), t.aud && t.aud.el === e && (t.aud.gain.gain.value = 0), !e.paused))
          try {
            e.pause();
          } catch {}
        return;
      }
      if ((a && navigator.userActivation && !navigator.userActivation.hasBeenActive && (a = !1), !a)) {
        ((e.muted = !0), t.aud && t.aud.el === e && (t.aud.gain.gain.value = 0));
        return;
      }
      var r = 0.35,
        n = new fe.Vector3();
      if ((t.tvScr && t.tvScr.getWorldPosition(n), t.tvScr && t.camera)) {
        var i = n.distanceTo(t.camera.position);
        ((r = Math.max(0.04, Math.min(1, 1.15 - i / 28))), (r = r * r));
      }
      var o = F0(e);
      if (o && t.camera && t.tvScr) {
        t.camera.updateMatrixWorld();
        var s = new fe.Vector3(),
          l = new fe.Vector3(),
          c = new fe.Vector3(0, 1, 0).transformDirection(t.camera.matrixWorld);
        (t.camera.getWorldPosition(s), t.camera.getWorldDirection(l));
        var f = t.ac.listener;
        (hl(f, s.x, s.y, s.z),
          f.forwardX
            ? ((f.forwardX.value = l.x),
              (f.forwardY.value = l.y),
              (f.forwardZ.value = l.z),
              (f.upX.value = c.x),
              (f.upY.value = c.y),
              (f.upZ.value = c.z))
            : f.setOrientation && f.setOrientation(l.x, l.y, l.z, c.x, c.y, c.z),
          hl(o.pan, n.x, n.y, n.z),
          (o.gain.gain.value = r),
          (e.volume = 1),
          (e.muted = !1));
      } else ((e.volume = Math.max(0, Math.min(1, r))), (e.muted = !1));
      if (e.paused) {
        var u = e.play();
        u && u.catch && u.catch(function () {});
      }
    }
  }
  function q0(e) {
    if (t) {
      t.tvOn = !!e;
      var a = t.tvVid;
      if (a)
        if (e) {
          var r = a.play();
          r && r.catch && r.catch(function () {});
        } else
          try {
            a.pause();
          } catch {}
      (t.tvLed && t.tvLed.material.color.set(e ? 1323036 : 14169132),
        t.tvPaint && t.tvPaint(),
        cr(),
        Wa(),
        ye());
    }
  }
  function ss() {
    !t ||
      !t.drive ||
      ((t.drive.view = ((t.drive.view || 0) + 1) % 3),
      we(["Chase camera", "Far chase camera", "Hood camera"][t.drive.view], 1400),
      It(),
      ye());
  }
  function It() {
    if (MER.intro && merIntroCam()) return;
    if (MER.showroom && merShowroomCam()) return;
    if (t.drive) {
      var e = t.drive,
        a = ee[e.i],
        r = e.cam,
        n = e.view || 0,
        i =
          Math.min(88, (n === 2 ? 66 : 60) + 18 * Math.min(1, Math.abs(e.v) / 261) + (e.boosting ? 7 : 0));
      if (
        ((e.fov = e.fov ? e.fov + (i - e.fov) * 0.12 : i),
        Math.abs(t.camera.fov - e.fov) > 0.05 && ((t.camera.fov = e.fov), t.camera.updateProjectionMatrix()),
        n === 2)
      ) {
        var o = (-a.r * Math.PI) / 180 + r.yaw,
          s = e.rig.fwdZ,
          l = s * Math.sin((-a.r * Math.PI) / 180),
          c = s * Math.cos((-a.r * Math.PI) / 180),
          f = s * Math.sin(o),
          u = s * Math.cos(o),
          p = t.carList[e.i],
          v = p ? p.position.y : 0;
        (t.camera.position.set(a.x + l * wt * 0.42, v + 3.55, a.z + c * wt * 0.42),
          t.camera.lookAt(a.x + f * 45, v + 2.4 - r.pitch * 6, a.z + u * 45),
          merShakeAmt(e) > 0 &&
            ((t.camera.position.x += (Math.random() - 0.5) * merShakeAmt(e)),
            (t.camera.position.y += (Math.random() - 0.5) * merShakeAmt(e))));
        return;
      }
      var w = n === 1 ? r.dist * 1.9 : r.dist,
        y = n === 1 ? r.pitch + 0.08 : r.pitch,
        E = e.cang + r.yaw,
        M = Math.sin(E),
        g = Math.cos(E),
        b = Math.cos(y);
      t.camera.position.set(a.x - M * w * b, Math.max(0.9, 2.3 + Math.sin(y) * w), a.z - g * w * b);
      var k = -e.steer * 6.5 * Math.min(1, Math.abs(e.v) / 60) * e.rig.fwdZ;
      if (
        ((e.look = (e.look || 0) + (k - (e.look || 0)) * 0.08),
        t.camera.lookAt(a.x + M * 5 + g * e.look, 2.7, a.z + g * 5 - M * e.look),
        merShakeAmt(e) > 0)
      ) {
        var L = merShakeAmt(e);
        ((t.camera.position.x += (Math.random() - 0.5) * L),
          (t.camera.position.y += (Math.random() - 0.5) * L));
      }
      if (e.camFrom) {
        e.blendT = Math.min(1, (e.blendT || 0) + 0.022);
        var x = e.blendT * e.blendT * (3 - 2 * e.blendT),
          P = t.camera.quaternion.clone(),
          h = t.camera.position.clone();
        (t.camera.position.lerpVectors(e.camFrom.p, h, x),
          t.camera.quaternion.slerpQuaternions(e.camFrom.q, P, x),
          e.blendT >= 1 && (e.camFrom = null));
      }
      return;
    }
    if (t.walk) {
      var B = Math.cos(t.wpitch),
        G = ie || { wid: 20, len: 20 };
      ((t.wx = Math.max(-G.wid / 2 - 110, Math.min(G.wid / 2 + 110, t.wx))),
        (t.wz = Math.max(-G.len / 2 - 110, Math.min(G.len / 2 + 110, t.wz))),
        t.camera.position.set(t.wx, 5.6, t.wz),
        t.camera.lookAt(t.wx + Math.sin(t.wyaw) * B, 5.6 + Math.sin(t.wpitch), t.wz - Math.cos(t.wyaw) * B));
      var z = t.renderer.domElement.parentNode.querySelector('[data-z="in"]'),
        Q = t.renderer.domElement.parentNode.querySelector('[data-z="out"]');
      (z && (z.disabled = !1), Q && (Q.disabled = !1));
      return;
    }
    var J = t.dist / t.zoom;
    (t.camera.position.set(0, Math.sin(t.pitch) * J + (t.cy || 2.5) - 0.5, Math.cos(t.pitch) * J),
      t.camera.lookAt(0, t.cy || 2.5, 0));
    var q = t.renderer.domElement.parentNode.querySelector('[data-z="in"]'),
      O = t.renderer.domElement.parentNode.querySelector('[data-z="out"]');
    (q && (q.disabled = t.zoom >= 2.8), O && (O.disabled = t.zoom <= 0.2));
  }
  function pl(e) {
    if (!(!t || !t.group)) {
      if (t.drive) {
        ((t.drive.cam.dist = Math.min(50, Math.max(5, t.drive.cam.dist / e))), It(), ye());
        return;
      }
      if (t.walk) {
        Ns(e > 1 ? 3 : -3);
        return;
      }
      ((t.zoom = Math.min(2.8, Math.max(0.2, t.zoom * e))), It(), ye());
    }
  }
  function ye() {
    if (!(!t || !t.group)) {
      if (
        (cl(),
        (t.group.rotation.y = t.walk ? 0 : t.yaw),
        t.group.updateMatrixWorld(!0),
        cr(),
        t.shafts && t.shafts.length && t.sun)
      ) {
        var e = t.group.rotation.y,
          a = e.toFixed(3);
        if (t.shaftKey !== a) {
          t.shaftKey = a;
          var r = t.sun.position,
            n = Math.sqrt(r.x * r.x + r.y * r.y + r.z * r.z),
            i = -r.x / n,
            o = -r.y / n,
            s = -r.z / n,
            l = [i * Math.cos(e) - s * Math.sin(e), o, i * Math.sin(e) + s * Math.cos(e)];
          t.shafts.forEach(function (M) {
            M.userData.aim(l);
          });
        }
      }
      if (t.dust && t.dustM && t.dustM.opacity > 0.02) {
        var c = performance.now() / 1e3;
        t.dust.forEach(function (M) {
          if (M.pts.visible) {
            var g = M.geo.attributes.position,
              b = M.geo.attributes.color,
              k,
              L;
            for (k = 0; k < M.base.length; k++) {
              ((L = M.base[k]),
                g.setXYZ(
                  k,
                  L.x + Math.sin(c * L.sp + L.ph) * L.am,
                  L.y + Math.sin(c * L.sp * 0.7 + L.ph * 1.7) * L.am * 0.7,
                  L.z + Math.cos(c * L.sp + L.ph) * L.am,
                ));
              var x = 0.3 + 0.7 * Math.pow(Math.abs(Math.sin(c * L.sp * 1.6 + L.ph * 2.3)), 2);
              b.setXYZ(k, x, x, x);
            }
            ((g.needsUpdate = !0), (b.needsUpdate = !0));
          }
        });
      }
      if (
        (t.env && (t.env.rotation.y = t.group.rotation.y),
        t.roof && (t.roof.visible = !!t.walk),
        t.group.updateMatrixWorld(!0),
        t.handles && t.hpos)
      ) {
        var f = t.host.classList.contains("lc-open") && !t.walk;
        if (((t.handles.visible = f), f)) {
          var u = t.renderer.domElement.clientHeight || 600;
          if (
            (["w", "l", "h"].forEach(function (M) {
              var g = t.handleObjs[M],
                b = t.hpos[M];
              (g.position.copy(b),
                g.scale.setScalar(
                  (t.camera.position.distanceTo(b.clone().applyMatrix4(t.group.matrixWorld)) * 0.573 * 12) /
                    u,
                ));
            }),
            t.handles.updateMatrixWorld(!0),
            t.ring && t.ring.visible && t.rotG)
          ) {
            var p = new fe.Vector3();
            (t.rotG.getWorldPosition(p),
              t.rotG.scale.setScalar((t.camera.position.distanceTo(p) * 0.573 * 12) / u),
              t.ring.updateMatrixWorld(!0));
          }
        }
      }
      if (t.front) {
        var v = new fe.Vector3(),
          w = t.front.n.clone().applyQuaternion(t.group.quaternion);
        (t.front.group.getWorldPosition(v), (v.z += 0));
        var y = new fe.Vector3(0, 4, t.front.group.children[0].position.z).applyMatrix4(t.group.matrixWorld),
          E = !t.walk && w.dot(t.camera.position.clone().sub(y)) > 0;
        t.front.mats.forEach(function (M, g) {
          ((M.opacity = E ? [0.2, 0.62, 0.8, 0.14, 0.2, 0.2][g] : [1, 1, 1, 0.4, 1, 1][g]),
            (M.depthWrite = g === 3 ? !1 : !E));
        });
      }
      (t.walls.forEach(function (M) {
        var g = M.userData.n.clone().applyQuaternion(t.group.quaternion),
          b = new fe.Vector3();
        (M.getWorldPosition(b), (M.visible = t.walk ? !0 : g.dot(t.camera.position.clone().sub(b)) < 0));
      }),
        t.cineOn && Nl(),
        merGfxTick(),
        merLuxTick(),
        merWetPass(),
        t.cineOn && t.bloomOn ? Hl() : t.renderer.render(t.scene, t.camera));
    }
  }

    function Mt() {
    var n = Math.min(150, parseFloat(V("len").value)),
      i = Math.min(150, parseFloat(V("wid").value)),
      o = Math.min(25, parseFloat(V("ht").value)),
      l = Oo(ce.fixtures[an]);
    if (!l || !(l.lumens > 0) || !(n > 0) || !(i > 0)) return;
    Il(n, i, xs(n, i, o, l), l, an);
  }

  /* ===================================================================================
   * Game shell: start screen, walk around garage, click a car to race, garage HUD.
   * =================================================================================== */
  var MER = {
    ready: !1,
    entered: !1,
    pending: !1,
    mode: "trial", // "trial" plays the cinematic intro and a timed lap, "free" drives with no timer
    paint: "silver",
    target: -1, // car the player is aiming at or standing next to
    pointer: null, // last mouse position over the canvas
    bound: !1,
    lastTick: 0,
  };
  var MER_PAINT = {
    silver: 0xd3d8e0,
    red: 0xff1428,
    blue: 0x0b4dff,
    black: 0x14151a,
    white: 0xffffff,
    yellow: 0xffc800,
  };

  function merEl(id) {
    return document.getElementById(id);
  }
  function merShow(id, on) {
    var el = merEl(id);
    el && (el.hidden = !on);
  }

  /* Paint every car. The paint material keeps its base color in userData.base. */
  function merApplyPaint() {
    if (!t || !t.carList) return;
    var hex = MER_PAINT[MER.paint] || MER_PAINT.silver;
    t.carList.forEach(function (car) {
      car.traverse(function (o) {
        var m = o.isMesh && o.material;
        if (m && m.userData && m.userData.carPaint) {
          (m.userData.base || (m.userData.base = m.color.clone()), m.userData.base.setHex(hex), m.color.copy(m.userData.base), Fs(m, m.userData.base, zt === "night"));
        }
      });
    });
    (Xo(), ye());
  }

  /* Free drive reset: put the car back on the start line. */
  function merResetFree() {
    var e = t && t.drive,
      a = t && t.track;
    if (!e) return;
    var r = ee[e.i],
      n = e.rig.fwdZ;
    if (a) {
      var i = Math.atan2(n * a.T[0], n * a.T[1]);
      ((r.x = a.S[0] - a.T[0] * 22), (r.z = a.S[1] - a.T[1] * 22), (r.r = (-i * 180) / Math.PI), (e.phi = i), (e.cang = Math.atan2(n * Math.sin(i), n * Math.cos(i))));
    } else if (e.home) {
      ((r.x = e.home.x), (r.z = e.home.z), (r.r = e.home.r));
    }
    ((e.v = 0), (e.pv = 0), (e.steer = 0), (e.yaw = 0), (e.nitro = 1), (e.slip = 0), (e.cam.yaw = 0));
    (zr(e.i), It(), ye(), we("Car reset", 1400));
  }

  /* Put a car back on its parking spot after a drive. */
  function merHomeCar(a) {
    var h = a && a.home;
    h && ee && ee[a.i] && ((ee[a.i].x = h.x), (ee[a.i].z = h.z), (ee[a.i].r = h.r), zr(a.i));
  }

  /* After a race or drive, the player walks around inside the garage again. */
  function merReturnToWalk(a) {
    ((t.walk = !1), t.host.classList.remove("lc-walking"), ra && ln(!1), bi(!0), (t.sel = -1), lr(), Wa(), ye(), merShowroomEnter(), merSyncUi());
  }

  /* Day and night, engine sound and music buttons stay in sync with the game state. */
  function merSyncHud() {
    var set = function (id, on) {
      var el = merEl(id);
      el && el.setAttribute("aria-pressed", on ? "true" : "false");
    };
    var dn = merEl("btn-daynight");
    dn && ((dn.textContent = zt === "night" ? "Night" : "Day"), dn.setAttribute("aria-pressed", zt === "night" ? "true" : "false"));
    set("btn-engine", !(t && t.engMute));
    set("btn-music", !(t && t.musicMute));
    document.querySelectorAll("[data-mode]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-mode") === MER.mode ? "true" : "false");
    });
    document.querySelectorAll("[data-color]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-color") === MER.paint ? "true" : "false");
    });
    document.querySelectorAll("[data-finish]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-finish") === (MER.finish || "metallic") ? "true" : "false");
    });
  }

  /* Show the garage HUD and crosshair only while the player walks in the garage. */
  function merSyncUi() {
    var c = Qi.classList,
      garageWalk = !!(MER.entered && !MER.intro && MER.showroom && c.contains("lc-open") && !c.contains("lc-driving"));
    (merShow("garage-hud", garageWalk), merShow("crosshair", !1), merShow("sh-hint", garageWalk));
    garageWalk || ((MER.target = -1), merShow("car-prompt", !1), c.contains("is-pointer-target") && c.remove("is-pointer-target"));
    merSyncHud();
  }

  /* Find which parked car the player aims at, or stands next to. */
  function merCarBox(car) {
    /* Slightly taller than the car so aiming at the roof line from standing eye height still counts */
    var box = new fe.Box3().setFromObject(car);
    return (box.max.y += 3.2), box.expandByScalar(0.4), box;
  }
  function merPick(x, y) {
    if (!t || !t.carList || !ct || !t.camera) return -1;
    var ray = new fe.Raycaster(),
      hit = new fe.Vector3(),
      best = -1,
      bestD = 1e9;
    ray.setFromCamera(new fe.Vector2(x, y), t.camera);
    t.carList.forEach(function (car, i) {
      if (!car.visible) return;
      var p = ray.ray.intersectBox(merCarBox(car), hit);
      if (p) {
        var d = p.distanceTo(ray.ray.origin);
        d < bestD && ((bestD = d), (best = i));
      }
    });
    return best;
  }
  function merNear() {
    if (!t) return -1;
    var spots = Wn(),
      best = -1,
      bestD = 13;
    spots.forEach(function (s, i) {
      var d = Math.hypot(t.wx - s.x, t.wz - s.z);
      d < bestD && ((bestD = d), (best = i));
    });
    return best;
  }
  function merTick() {
    if (!MER.entered) return;
    requestAnimationFrame(merTick);
    /* Music plays from the first click (intro, garage, driving). The Music button mutes it. */
    if (t) {
      var drv = !!t.drive, mus = t.music && t.music.on;
      if (!mus && !t.musicMute) { al(); MER.musDrv = drv; }
      else if (mus && MER.musDrv !== drv) { MER.musDrv = drv; rl(drv ? 0.16 : 0.3); }
      else if (mus && t.musicMute) fo();
    }
    if (MER.intro || MER.showroom) return;
    var now = performance.now();
    if (now - MER.lastTick < 70) return;
    MER.lastTick = now;
    var c = Qi.classList;
    if (!(c.contains("lc-walking") && !c.contains("lc-driving") && c.contains("lc-open") && t && t.group)) return;
    var pointerHit = -1;
    if (MER.pointer) {
      var r = t.renderer.domElement.getBoundingClientRect();
      pointerHit = merPick(((MER.pointer.x - r.left) / r.width) * 2 - 1, -((MER.pointer.y - r.top) / r.height) * 2 + 1);
    }
    var aimHit = merPick(0, 0),
      target = pointerHit >= 0 ? pointerHit : aimHit >= 0 ? aimHit : merNear();
    MER.target = target;
    MER.pointerHit = pointerHit;
    merShow("car-prompt", target >= 0);
    c.contains("is-pointer-target") !== target >= 0 && c.toggle("is-pointer-target", target >= 0);
  }

  /* Click or press E on a car: select it, leave walk mode, then start the race intro. */
  function merEnterCar(i) {
    if (!t || !t.group || t.drive || !t.carList || !t.carList[i] || !ct) return;
    if (MER.mode === "trial" && !t.track) {
      we("The race track is still loading", 2200);
      return;
    }
    ((t.sel = i), we(""), (MER.target = -1), merShow("car-prompt", !1));
    merShowroomExit();
    bi(!1);
    MER.mode = "trial";
    uo();
    t.drive || (bi(!0), we("Could not start the race. Try again.", 2400), merShowroomEnter());
    merSyncUi();
  }

  function merBindScene() {
    if (MER.bound || !t || !t.renderer) return;
    MER.bound = !0;
    var p = t.renderer.domElement;
    p.addEventListener("pointermove", function (e) {
      MER.pointer = { x: e.clientX, y: e.clientY };
    });
    p.addEventListener("pointerleave", function () {
      MER.pointer = null;
    });
    p.addEventListener("pointerup", function (e) {
      if (!MER.entered || MER.showroom || t.drive || !Qi.classList.contains("lc-walking")) return;
      var moved = Math.abs(e.clientX - t.sx) + Math.abs(e.clientY - t.sy);
      if (moved > 5) return;
      var r = p.getBoundingClientRect(),
        i = merPick(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      i >= 0 && merEnterCar(i);
    });
    new MutationObserver(merSyncUi).observe(Qi, { attributes: !0, attributeFilter: ["class"] });
  }


  /* ---- Graphics: contact shadows under every car and a moon light that casts a soft car shadow on the road ---- */
  var MERGFX = { tex: null, blobs: [], moon: null, q: null, e: null, cp: null };
  function merBlobTexture() {
    if (MERGFX.tex) return MERGFX.tex;
    var c = document.createElement("canvas");
    ((c.width = 128), (c.height = 256));
    var x = c.getContext("2d");
    (x.scale(1, 2), (x.translate(0, 0)));
    var g = x.createRadialGradient(64, 64, 0, 64, 64, 62);
    (g.addColorStop(0, "rgba(0,0,0,0.8)"),
      g.addColorStop(0.5, "rgba(0,0,0,0.5)"),
      g.addColorStop(0.8, "rgba(0,0,0,0.16)"),
      g.addColorStop(1, "rgba(0,0,0,0)"),
      (x.fillStyle = g),
      x.fillRect(0, 0, 128, 128));
    var tx = new fe.CanvasTexture(c);
    return (fe.SRGBColorSpace && (tx.colorSpace = fe.SRGBColorSpace), (MERGFX.tex = tx), tx);
  }
  function merGfxTick() {
    if (!t || !t.carList || !t.scene || !fe) return;
    if (!MERGFX.q) ((MERGFX.q = new fe.Quaternion()), (MERGFX.e = new fe.Euler(0, 0, 0, "YXZ")), (MERGFX.cp = new fe.Vector3()));
    var cars = t.carList;
    cars.forEach(function (car, i) {
      var b = MERGFX.blobs[i];
      if (!b) {
        b = new fe.Mesh(
          new fe.PlaneGeometry(9.6, 17.8),
          new fe.MeshBasicMaterial({
            map: merBlobTexture(),
            transparent: !0,
            opacity: 0.85,
            depthWrite: !1,
            polygonOffset: !0,
            polygonOffsetFactor: -4,
            polygonOffsetUnits: -4,
          }),
        );
        ((b.renderOrder = 2), (b.frustumCulled = !1), t.scene.add(b), (MERGFX.blobs[i] = b));
      }
      if (!car.userData.merCast) {
        car.userData.merCast = !0;
        car.traverse(function (o) {
          o.isMesh && (o.castShadow = !0);
        });
      }
      b.visible = !!car.visible;
      if (!b.visible) return;
      (car.getWorldPosition(MERGFX.cp), car.getWorldQuaternion(MERGFX.q), MERGFX.e.setFromQuaternion(MERGFX.q, "YXZ"));
      MERGFX.qx || ((MERGFX.qx = new fe.Quaternion().setFromAxisAngle(new fe.Vector3(1, 0, 0), -Math.PI / 2)), (MERGFX.up = new fe.Vector3()));
      MERGFX.up.set(0, 1, 0).applyQuaternion(MERGFX.q);
      b.quaternion.copy(MERGFX.q).multiply(MERGFX.qx);
      b.position.copy(MERGFX.cp).addScaledVector(MERGFX.up, -0.1);
    });
    /* Moon light with a soft shadow map. It follows the car being driven and only runs in a race on high quality. */
    var racing = !!(t.drive && t.cineOn && Is() === "high" && t.renderer.shadowMap.enabled),
      m = MERGFX.moon;
    if (!m && racing) {
      m = MERGFX.moon = new fe.DirectionalLight(11193087, 0.8);
      m.castShadow = !0;
      m.shadow.mapSize.set(qn() || (navigator.hardwareConcurrency || 8) <= 4 ? 1024 : 2048, qn() || (navigator.hardwareConcurrency || 8) <= 4 ? 1024 : 2048);
      m.shadow.bias = -0.0004;
      m.shadow.normalBias = 0.05;
      var sc = m.shadow.camera;
      ((sc.left = -13), (sc.right = 13), (sc.top = 13), (sc.bottom = -13), (sc.near = 1), (sc.far = 90));
      (t.scene.add(m), t.scene.add(m.target));
    }
    if (m) {
      m.visible = racing;
      if (racing) {
        var dc = cars[t.drive.i];
        if (dc) {
          dc.getWorldPosition(MERGFX.cp);
          (m.target.position.copy(MERGFX.cp), m.position.set(MERGFX.cp.x - 16, MERGFX.cp.y + 34, MERGFX.cp.z + 12), m.target.updateMatrixWorld());
        }
      }
    }
  }

  /* Idle camera behind the start screen. */
  function merIdle() {
    if (MER.entered || !t || !t.group) return;
    ((t.yaw += 0.0022), ye(), requestAnimationFrame(merIdle));
  }

  /* Called each time the 3D garage finishes building. */
  /* Paved apron from the garage door out to the nearest point of the track. */
  function merDriveway() {
    try {
      if (MER.apron && MER.apron.parent) MER.apron.parent.remove(MER.apron);
      MER.apron = null;
      if (!t || !t.track || !t.track.pts || !ie || !t.scene) return;
      var pts = t.track.pts, bays = ir(ie.wid, ie.len, ie.cars), b = bays[0] || { c: 0, w: 8 },
        dx = b.c, dz = ie.len / 2 + 0.2, best = 1e9, bi = 0, i;
      for (i = 0; i < pts.length; i++) {
        var d = Math.hypot(pts[i][0] - dx, pts[i][1] - dz);
        d < best && ((best = d), (bi = i));
      }
      var vx = pts[bi][0] - dx, vz = pts[bi][1] - dz, L = Math.hypot(vx, vz);
      if (L < 6 || L > 500 || vz < 0) return;
      var ux = vx / L, uz = vz / L, nx = -uz, nz = ux, L2 = Math.max(3, L - t.track.w / 2 + 0.6),
        w0 = Math.max(10, b.w + 3) / 2, w1 = w0 + 4, ex = dx + ux * L2, ez = dz + uz * L2, y = 0.04,
        geo = new fe.BufferGeometry();
      geo.setAttribute("position", new fe.Float32BufferAttribute([
        dx - nx * w0, y, dz - nz * w0, dx + nx * w0, y, dz + nz * w0,
        ex + nx * w1, y, ez + nz * w1, ex - nx * w1, y, ez - nz * w1,
      ], 3));
      geo.setIndex([0, 2, 1, 0, 3, 2]);
      geo.computeVertexNormals();
      var mat = new fe.MeshLambertMaterial({ color: 0x2a2d33, side: fe.DoubleSide, polygonOffset: !0, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
        m = new fe.Mesh(geo, mat);
      m.renderOrder = 1;
      t.scene.add(m);
      MER.apron = m;
    } catch (e) {}
  }
  function merSceneBuilt() {
    merDriveway();
    merBindScene();
    merApplyPaint();
    if (!MER.ready && !MER.warming) {
      MER.warming = !0;
      merBoot("scene", 1, "Compiling shaders");
      Nn();
      var warm = function () {
        var n = 0;
        try { t.renderer.compile(t.scene, t.camera); } catch (e) {}
        (function f() {
          try { ye(); } catch (e) {}
          n++ < 3 ? requestAnimationFrame(f) : fin();
        })();
      };
      var fin = function () {
        MER.ready = !0;
        merBoot("warm", 1, "Ready");
        var b = merEl("enter-btn");
        b && ((b.disabled = !1), (b.textContent = "PRESS START"), b.focus());
        var ov = merEl("title-overlay");
        ov && ov.classList.add("is-ready");
        merShow("loading", !1);
        merIdle();
        MER.pending && merStart();
      };
      requestAnimationFrame(function () { setTimeout(warm, 30); });
    }
  }
  function merFail(err) {
    window.console && console.warn("Midnight Extreme Racer could not start the 3D garage", err);
    var el = merEl("error");
    if (el) {
      ((el.textContent = "The 3D garage could not load. Check your connection and serve this folder over http, then reload."), (el.hidden = !1));
    }
    merShow("loading", !1);
  }


  function merBoot(k, v, l) {
    window.MER_BOOT && window.MER_BOOT.set(k, v, l);
  }

  /* ---------- Cinematic intro: track fly-by, hero car sweep, then settle into the garage ---------- */
  var MER_I = { C1: 2.2, C2: 4.5, C3: 7.0, END: 8.5 };
  function merIntroFov(v) {
    Math.abs(t.camera.fov - v) > 0.05 && ((t.camera.fov = v), t.camera.updateProjectionMatrix());
  }
  function merSmooth(x) {
    x = Math.max(0, Math.min(1, x));
    return x * x * (3 - 2 * x);
  }
  function merPchip(T, S) {
    var n = T.length, h = [], d = [], m = [], i;
    for (i = 0; i < n - 1; i++) { h[i] = T[i + 1] - T[i]; d[i] = (S[i + 1] - S[i]) / h[i]; }
    m[0] = d[0]; m[n - 1] = 0;
    for (i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]);
    return function (x) {
      if (x <= T[0]) return S[0];
      if (x >= T[n - 1]) return S[n - 1];
      var k = 0;
      while (x > T[k + 1]) k++;
      var u = (x - T[k]) / h[k], u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * S[k] + (u3 - 2 * u2 + u) * h[k] * m[k] + (-2 * u3 + 3 * u2) * S[k + 1] + (u3 - u2) * h[k] * m[k + 1];
    };
  }
  /* Resample a polyline into 1 m steps. Returns { X, Z, n } */
  function merResample(P) {
    var cum = [0], i, X = [], Z = [];
    for (i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    var L = cum[cum.length - 1], k = 0, s;
    for (s = 0; s <= L; s += 1) {
      while (k < P.length - 2 && cum[k + 1] < s) k++;
      var seg = cum[k + 1] - cum[k] || 1, u = Math.max(0, Math.min(1, (s - cum[k]) / seg));
      X.push(P[k][0] + (P[k + 1][0] - P[k][0]) * u);
      Z.push(P[k][1] + (P[k + 1][1] - P[k][1]) * u);
    }
    X.push(P[P.length - 1][0]); Z.push(P[P.length - 1][1]);
    return { X: X, Z: Z, n: X.length };
  }
  function merChaikin(P, it) {
    var q, r;
    while (it-- > 0) {
      r = [P[0]];
      for (q = 0; q < P.length - 1; q++) {
        var a = P[q], b = P[q + 1];
        r.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
      }
      r.push(P[P.length - 1]);
      P = r;
    }
    return P;
  }
  function merIPos(R, s) {
    s = Math.max(0, Math.min(R.n - 1.001, s));
    var i = Math.floor(s), u = s - i;
    return { x: R.X[i] + (R.X[i + 1] - R.X[i]) * u, z: R.Z[i] + (R.Z[i + 1] - R.Z[i]) * u };
  }
  function merIHead(R, s) {
    var a = merIPos(R, s - 2), b = merIPos(R, s + 2);
    return Math.atan2(b.x - a.x, b.z - a.z);
  }
  function merWrap(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
  function merNearS(R, x, z) {
    var best = 1e18, bs = 0, i;
    for (i = 0; i < R.n; i++) {
      var d = (R.X[i] - x) * (R.X[i] - x) + (R.Z[i] - z) * (R.Z[i] - z);
      d < best && ((best = d), (bs = i));
    }
    return bs;
  }
  /* Build the hot lap path: track corner, track to the driveway, driveway, garage door, parked spot. */
  function merIntroPrep() {
    var I = MER.intro, tr = t.track, pts = tr && tr.pts, list = t.carList || [], h = 0, j;
    I.ok = !1;
    for (j = 0; j < list.length; j++) if (list[j] && list[j].visible) { h = j; break; }
    I.hero = h;
    var car = list[h], sp = Wn()[h];
    if (!car || !sp || !ie) return;
    var rg0 = r0(car);
    try { s0(car, rg0.fwdZ); } catch (er) {}
    var fw = (rg0 && rg0.fwdZ) || -1, ry0 = (-sp.r * Math.PI) / 180,
      hh = [Math.sin(ry0), Math.cos(ry0)], bays = ir(ie.wid, ie.len, ie.cars), b = bays[0] || { c: sp.x, w: 8 },
      dX = b.c, dZ = ie.len / 2 + 0.2;
    I.hf = Math.PI;
    I.fw = fw; I.orig = { x: sp.x, z: sp.z, r: sp.r }; I.door = { x: dX, z: dZ };
    var rr0 = sp.r;
    h === 0 && (sp.r = merNoseInR());
    I.SP = merShowCalc(merShowAz0(), 0);
    sp.r = rr0;
    var raw = [], corner = null, n = pts ? pts.length : 0;
    if (pts && n > 30) {
      var bi = 0, bd = 1e18, i;
      for (i = 0; i < n; i++) { var dd = Math.hypot(pts[i][0] - dX, pts[i][1] - dZ); dd < bd && ((bd = dd), (bi = i)); }
      I.jx = pts[bi][0]; I.jz = pts[bi][1];
      var ax = dX - pts[bi][0], az = dZ - pts[bi][1], aL = Math.hypot(ax, az) || 1;
      ax /= aL; az /= aL;
      var turnFor = function (dir) {
        var p1 = pts[(bi - dir + n) % n], p2 = pts[(bi + dir) % n], tx = p2[0] - p1[0], tz = p2[1] - p1[1], tl = Math.hypot(tx, tz) || 1;
        return (tx * ax + tz * az) / tl;
      };
      var dir = turnFor(1) >= turnFor(-1) ? 1 : -1;
      if (aL > 6 && aL < 500) {
        /* walk backwards from the driveway to find the sharpest corner 70 to 240 m before it */
        var back = [], acc = 0, k = bi, g = 0, dist = [0];
        back.push(bi);
        while (acc < 330 && g++ < n - 2) {
          var pk = pts[k], k2 = (k - dir + n) % n, pn = pts[k2];
          acc += Math.hypot(pk[0] - pn[0], pk[1] - pn[1]);
          k = k2; back.push(k); dist.push(acc);
        }
        var bestA = 0.12, bc = -1, w = 3;
        for (i = w; i < back.length - w; i++) {
          if (dist[i] < 70 || dist[i] > 240) continue;
          var q0 = pts[back[i + w]], q1 = pts[back[i]], q2 = pts[back[i - w]],
            a1 = Math.atan2(q1[0] - q0[0], q1[1] - q0[1]), a2 = Math.atan2(q2[0] - q1[0], q2[1] - q1[1]), da = Math.abs(merWrap(a2 - a1));
          da > bestA && ((bestA = da), (bc = i));
        }
        bc < 0 && (bc = Math.min(back.length - w - 1, Math.max(w, Math.floor(back.length * 0.5))));
        var startI = bc;
        while (startI < back.length - 1 && dist[startI] - dist[bc] < 130) startI++;
        var kc = back[bc], q0b = pts[back[Math.min(back.length - 1, bc + 3)]], q2b = pts[back[Math.max(0, bc - 3)]], pc = pts[kc];
        var h1 = [pc[0] - q0b[0], pc[1] - q0b[1]], h2 = [q2b[0] - pc[0], q2b[1] - pc[1]], l1 = Math.hypot(h1[0], h1[1]) || 1, l2 = Math.hypot(h2[0], h2[1]) || 1,
          ix = h2[0] / l2 - h1[0] / l1, iz = h2[1] / l2 - h1[1] / l1, il = Math.hypot(ix, iz) || 1;
        corner = { x: pc[0], z: pc[1], ix: ix / il, iz: iz / il };
        for (i = startI; i >= 3; i--) raw.push([pts[back[i]][0], pts[back[i]][1]]);
        /* smooth turn onto the driveway: quadratic curve from 12 m before the junction to 12 m along the driveway */
        var pS = pts[back[3]], pE = [pts[bi][0] + ax * Math.min(12, aL / 2), pts[bi][1] + az * Math.min(12, aL / 2)], u;
        for (u = 0; u <= 1.001; u += 0.1)
          raw.push([(1 - u) * (1 - u) * pS[0] + 2 * (1 - u) * u * pts[bi][0] + u * u * pE[0], (1 - u) * (1 - u) * pS[1] + 2 * (1 - u) * u * pts[bi][1] + u * u * pE[1]]);
        var tail = [[pE[0], pE[1]], [dX, dZ + 6], [dX, dZ - 3], [sp.x, Math.min(dZ - 4, sp.z + 9)], [sp.x, sp.z]];
        raw = raw.concat(merChaikin(tail, 3).slice(1));
      }
    }
    if (raw.length < 4) {
      raw = merChaikin([[dX, dZ + 170], [dX, dZ + 6], [dX, dZ - 3], [sp.x, Math.min(dZ - 4, sp.z + 9)], [sp.x, sp.z]], 3);
      corner = { x: dX - 7, z: dZ + 95, ix: 1, iz: 0 };
    }
    var R = merResample(raw);
    I.R = R;
    var sC = corner ? merNearS(R, corner.x, corner.z) : 60, sDoor = merNearS(R, dX, dZ), sEnd = R.n - 1;
    sC = Math.max(20, Math.min(sC, sDoor - 40));
    I.sC = sC; I.sDoor = sDoor; I.sEnd = sEnd; I.corner = corner;
    /* Speed plan: fast hot lap, a long brake, a slow turn onto the driveway, then a slow roll through the door that eases to a stop */
    var sJ = I.jx != null ? merNearS(R, I.jx, I.jz) : sDoor - 40;
    sJ = Math.max(sC + 10, Math.min(sJ, sDoor - 4));
    /* real car speeds: about 35 m/s on the lap, about 1.1 g of braking, then a walking pace roll up the driveway */
    var vT = 11, aB = 32, sT0 = Math.max(sC + 30, sJ - 16),
      v0 = Math.min(105, Math.max(32, Math.sqrt(vT * vT + 2 * aB * Math.max(10, sT0 - sC - 30)))),
      Lb = (v0 * v0 - vT * vT) / (2 * aB), sBr = sT0 - Lb, tB0 = sBr / v0, tb = (v0 - vT) / aB, tD0 = tB0 + tb,
      Ld = Math.max(10, sEnd - sT0), Te = Math.max(6, Math.min(8.5, Ld / 6.5)), kk = Math.max(0.3, Math.min(2.8, (vT * Te) / Ld)),
      Tm = tD0 + Te;
    I.S = function (tm) {
      tm = Math.max(0, tm);
      if (tm <= tB0) return v0 * tm;
      if (tm <= tD0) { var tp = tm - tB0; return sBr + v0 * tp - 0.5 * aB * tp * tp; }
      var ta = Math.min(1, (tm - tD0) / Te), ta2 = ta * ta, ta3 = ta2 * ta;
      return sT0 + Ld * (-2 * ta3 + 3 * ta2 + (ta3 - 2 * ta2 + ta) * kk);
    };
    var tX = 0, tDo = 0, tP = 0, ti, sv;
    for (ti = 0; ti < Tm + 0.5; ti += 0.02) {
      sv = I.S(ti);
      !tX && sv >= sDoor - 26 && (tX = ti);
      !tDo && sv >= sDoor - 2 && (tDo = ti);
      if (!tP && sv >= sDoor + 10) { tP = ti; break; }
    }
    I.END = Tm + 1.3;
    I.cX = Math.max(tX || Tm * 0.6, MER_I.C2 + 0.6);
    I.tD = Math.max(tDo || Tm * 0.75, I.cX + 1.0);
    I.tCl = Math.min(I.END - 1.3, Math.max((tP || Tm * 0.85) + 0.3, I.tD + 0.55 * (I.END - I.tD)));
    /* apron direction for the exterior camera */
    var o1 = merIPos(R, Math.max(0, sDoor - 18));
    var ux = o1.x - dX, uz = o1.z - dZ, ul = Math.hypot(ux, uz) || 1;
    I.out = { x: ux / ul, z: uz / ul };
    I.ok = !0;
    I.smoke = [];
    I.lastSm = 0;
    I.prevS = 0;
    I.doorOn = !1;
  }
  function merIntroSmoke(I, tt, p, hx, hz, spin) {
    var sc = t.scene;
    if (!sc) return;
    if (!I.smTex) {
      var c = document.createElement("canvas"); c.width = c.height = 64;
      var g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(220,228,240,0.85)"); gr.addColorStop(0.5, "rgba(190,200,215,0.35)"); gr.addColorStop(1, "rgba(180,190,205,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      I.smTex = new fe.CanvasTexture(c);
    }
    if (((tt > 0.3 && tt < 3.4) || spin) && tt - I.lastSm > (spin ? 0.11 : 0.04)) {
      I.lastSm = tt;
      [-1, 1].forEach(function (side) {
        var m = new fe.SpriteMaterial({ map: I.smTex, transparent: !0, depthWrite: !1, opacity: 0.4, color: 0x9aa3b2 }),
          sp = new fe.Sprite(m), rx = -hz, rz = hx;
        sp.position.set(p.x - hx * 4.6 + rx * side * 2.3, 0.9, p.z - hz * 4.6 + rz * side * 2.3);
        sp.scale.set(3.4, 3.4, 1);
        sp.userData = { t0: tt, vx: -hx * 4.5 + rx * side * 1.5, vz: -hz * 4.5 + rz * side * 1.5 };
        sc.add(sp);
        I.smoke.push(sp);
      });
    }
    for (var q = I.smoke.length - 1; q >= 0; q--) {
      var s = I.smoke[q], a = tt - s.userData.t0, life = 1.4;
      if (a > life) { sc.remove(s); s.material.dispose(); I.smoke.splice(q, 1); continue; }
      s.position.x += s.userData.vx * 0.016; s.position.z += s.userData.vz * 0.016; s.position.y = 0.9 + a * 3.2;
      var sz = 3.4 + a * 6; s.scale.set(sz, sz, 1);
      s.material.opacity = 0.4 * (1 - a / life);
    }
  }
  function merIntroClean(I) {
    if (!I) return;
    (I.smoke || []).forEach(function (s) { t.scene && t.scene.remove(s); s.material && s.material.dispose(); });
    I.smoke = [];
    I.smTex && I.smTex.dispose && I.smTex.dispose();
    I.smTex = null;
  }
  /* Called from the camera function while the intro runs. Returns true when it set the camera. */
  function merIntroCam() {
    try { return merIntroCam0(); } catch (er) { return !!MER.intro; }
  }
  function merIntroCam0() {
    var I = MER.intro;
    if (!I) return !1;
    var tt = Math.min(I.END, merIntroNow(I)), cam = t.camera, V = fe.Vector3;
    if (!I.ok) {
      var SP0 = I.SP || merShowCalc(merShowAz0(), 0);
      if (SP0) { cam.position.set(SP0.x, SP0.y, SP0.z); cam.lookAt(SP0.lx, SP0.ly, SP0.lz); merIntroFov(SP0.fov); }
      return !0;
    }
    var R = I.R, s = I.S(tt), p = merIPos(R, s), th = merIHead(R, s), sp = Wn()[I.hero],
      spd = Math.max(0, (I.S(tt + 0.03) - I.S(tt - 0.03)) / 0.06);
    /* drift: nose swings into the turn while the car is fast */
    var dth = merWrap(merIHead(R, s + 4) - merIHead(R, s - 4)) / 8, fast = Math.max(0, Math.min(1, (spd - 14) / 14)),
      fin = merSmooth((s - (I.sEnd - 10)) / 8),
      phi = th + Math.max(-0.5, Math.min(0.5, dth * 15)) * fast * (1 - fin) + merWrap(I.hf - th) * fin;
    var hx = Math.sin(th), hz = Math.cos(th);
    /* the nose points along fwdZ * (sin ry, cos ry), so a nose angle phi needs ry = phi + pi when fwdZ is -1 */
    var ry = I.fw < 0 ? phi + Math.PI : phi;
    if (sp) { sp.x = p.x; sp.z = p.z; sp.r = (-ry * 180) / Math.PI; }
    I.dim = tt >= I.cX - 0.4;
    var luxI = 150 * merSmooth((tt - (I.cX - 1.2)) / 0.9);
    (t.luxSpots || []).forEach(function (L) { L.intensity = luxI; });
    I.brake = tt > 2.6 && spd < (I.lastSpd || 0) - 0.02;
    I.lastSpd = spd;
    zr(I.hero);
    try {
      var cw = (t.carList || [])[I.hero], rig = cw && r0(cw), dtw = I.wT == null ? 0 : Math.min(0.05, Math.max(0, tt - I.wT));
      I.wT = tt;
      var stepD = I.pp ? Math.hypot(p.x - I.pp.x, p.z - I.pp.z) : 0;
      I.pp = { x: p.x, z: p.z };
      var rel = merWrap(th - phi), mvd = Math.cos(rel) >= 0 ? 1 : -1;
      mvd < 0 && (rel = merWrap(rel + Math.PI));
      var strA = tt >= I.END - 1.2 ? 0 : Math.max(-0.55, Math.min(0.55, rel + Math.atan(2.7 * dth * mvd)));
      I.strA = (I.strA || 0) + (strA - (I.strA || 0)) * Math.min(1, 12 * dtw);
      rig && rig.wheels && rig.wheels.forEach(function (w) {
        w.spin.rotation.x += (stepD * mvd * I.fw) / w.R;
        w.front && (w.steer.rotation.y = I.strA);
      });
    } catch (er) {}
    merIntroSmoke(I, tt, p, Math.sin(phi), Math.cos(phi), !1);
    /* garage door: opens during shot 3, closes during shot 4 */
    var dT = merSmooth((s - (I.sDoor - 78)) / 48);
    if (tt >= I.tCl) dT = 1 - merSmooth((tt - I.tCl) / 1.1);
    if (dT > 0 && !ra) { ra = !0; try { Wa(); } catch (e) {} }
    if (Math.abs((t.doorT || 0) - dT) > 1e-4) { t.doorT = dT; Yo(dT); }
    var rx = -hz, rz = hx, camP = new V(), look = new V(), fov, roll = 0;
    if (tt < MER_I.C1 && I.corner) {
      /* Shot 1: low apex whip beside the kerb */
      var cr = I.corner, tw = (t.track && t.track.w) || 14, off = tw / 2 + 0.7;
      camP.set(cr.x + cr.ix * off, 0.35, cr.z + cr.iz * off);
      look.set(p.x + hx * 3, 0.75, p.z + hz * 3);
      fov = 52;
      I.sh3 = null;
    } else if (tt < I.cX) {
      var tA2 = Math.min(I.cX - 0.8, MER_I.C1 + 1.7);
      if (tt < tA2) {
        /* Shot 2: low tracking shot that whips from the front quarter down the flank to the rear while matching the car's speed */
        var g2 = merSmooth((tt - MER_I.C1) / Math.max(0.4, tA2 - MER_I.C1)), ang = 0.85 - 1.5 * g2, dd = 21 - 2 * g2;
        camP.set(p.x + (hx * Math.cos(ang) + rx * Math.sin(ang)) * dd, 2.3, p.z + (hz * Math.cos(ang) + rz * Math.sin(ang)) * dd);
        look.set(p.x + hx * 3, 2.0, p.z + hz * 3);
        fov = 44; roll = 0.04 * Math.sin(ang * 2);
      } else {
        /* Shot 2b: fixed trackside camera ahead of the car, it whip pans as the car flashes past and brakes for the driveway */
        if (!I.pan) {
          var tq = Math.min(I.cX - 0.2, tA2 + 1.0), pq = merIPos(R, I.S(tq)), thq = merIHead(R, I.S(tq)), qx = Math.sin(thq), qz = Math.cos(thq),
            qrx = -qz, qrz = qx, sd = (qrx * (I.door.x - pq.x) + qrz * (I.door.z - pq.z)) > 0 ? -1 : 1;
          I.pan = { x: pq.x + qrx * 18 * sd + qx * 10, z: pq.z + qrz * 18 * sd + qz * 10 };
        }
        camP.set(I.pan.x, 2.6, I.pan.z);
        look.set(p.x + hx * 2.5, 2.2, p.z + hz * 2.5);
        fov = 40;
      }
    } else {
      /* Shots 3 and 4 share the exterior camera, then glide through the door and around to the front three quarter */
      var dx = I.door.x, dz = I.door.z, o = I.out, nx = -o.z, nz = o.x;
      var SPe = I.SP, sgn = SPe && SPe.x < I.orig.x ? -1 : 1, side = nx * sgn >= 0 ? 1 : -1;
      var e3 = merSmooth((tt - I.cX) / Math.max(0.5, I.tD - I.cX)), cx = dx + o.x * 36 + nx * 14 * side, cz = Math.max(dz + 24, dz + o.z * 36 + nz * 14 * side);
      var p3 = new V(cx - (cx - dx) * 0.08 * e3, 5.2, cz - (cz - dz) * 0.08 * e3), l3 = new V(dx, 5.5, dz - 1.5);
      if (tt < I.tD) { camP.copy(p3); look.copy(l3); fov = 48; }
      else {
        var u4 = merSmooth((tt - I.tD) / Math.max(0.5, I.END - I.tD)), end = SPe ? new V(SPe.x, SPe.y, SPe.z) : new V(0, 1.5, 0),
          st3 = new V(cx - (cx - dx) * 0.08, 5.2, cz - (cz - dz) * 0.08), c1 = new V(dx + sgn * 1.5, 6.5, dz + 10), c2 = new V(dx + sgn * 6.5, 6, dz - 10),
          b0 = (1 - u4) * (1 - u4) * (1 - u4), b1 = 3 * (1 - u4) * (1 - u4) * u4, b2 = 3 * (1 - u4) * u4 * u4, b3 = u4 * u4 * u4;
        camP.set(b0 * st3.x + b1 * c1.x + b2 * c2.x + b3 * end.x, b0 * st3.y + b1 * c1.y + b2 * c2.y + b3 * end.y, b0 * st3.z + b1 * c1.z + b2 * c2.z + b3 * end.z);
        var lEnd = SPe ? new V(SPe.lx, SPe.ly, SPe.lz) : new V(0, 1.2, 0);
        look.lerpVectors(l3, lEnd, u4);
        fov = 48 + ((SPe ? SPe.fov : 60) - 48) * u4;
      }
    }
    if (tt < I.cX) { var shk = Math.min(1, spd / 100) * 0.1; camP.x += Math.sin(tt * 7.1) * shk; camP.y += Math.sin(tt * 9.3 + 1.3) * shk * 0.6; camP.z += Math.sin(tt * 6.2 + 2.1) * shk; }
    cam.up.set(0, 1, 0);
    cam.position.copy(camP);
    cam.lookAt(look);
    roll && cam.rotateZ(roll);
    merIntroFov(fov);
    return !0;
  }
  function merWarp(r) {
    var a = 2.0, b = 2.35, c = 3.4, d = 3.9, k = 0.35;
    if (r <= a) return r;
    var seg = function (x0, x1, r0, r1) { var u = Math.min(r, x1) - x0; return u <= 0 ? 0 : u * r0 + ((r1 - r0) * u * u) / (2 * (x1 - x0)); };
    return a + seg(a, b, 1, k) + seg(b, c, k, k) + seg(c, d, k, 1) + Math.max(0, r - d);
  }
  function merIntroNow(I) { return typeof window.__merIT === "number" ? window.__merIT : merWarp((performance.now() - I.t0) / 1000); }
  function merIntroEl(id) { return document.getElementById(id); }
  function merIntroEnd() {
    var I = MER.intro;
    if (!I) return;
    MER.intro = null;
    merIntroClean(I);
    /* snap everything to the parked showroom state */
    try {
      var sp = Wn()[I.hero];
      if (I.orig && sp) { sp.x = I.orig.x; sp.z = I.orig.z; sp.r = I.orig.r; zr(I.hero); }
      var cw2 = (t.carList || [])[I.hero], rg2 = cw2 && r0(cw2);
      rg2 && rg2.wheels && rg2.wheels.forEach(function (w) { w.front && (w.steer.rotation.y = 0); });
      t.doorT = 0; Yo(0);
      if (ra) { ra = !1; Wa(); }
      t.camera.up.set(0, 1, 0);
      zn();
    } catch (e) {}
    var box = merIntroEl("intro");
    box && box.classList.remove("live");
    Qi.classList.remove("mer-intro-on");
    setTimeout(function () { box && (box.hidden = !0); }, 800);
    merShowroomEnter();
    try { It(); ye(); } catch (e) {}
    merSyncUi();
  }
  function merIntroLoop() {
    var I = MER.intro;
    if (!I) return;
    var tt = merIntroNow(I);
    if (tt >= I.END) { merIntroEnd(); return; }
    var on = function (id, v) { var e = merIntroEl(id); e && e.classList.toggle("on", v); };
    on("card-a", tt >= MER_I.C1 && tt < MER_I.C2 + 0.5);
    var ca = merIntroEl("card-a");
    ca && ca.classList.toggle("out", tt >= MER_I.C2 - 0.05);
    on("card-b", !1);
    on("card-c", !1);
    var sl = merIntroEl("intro-sl");
    sl && sl.classList.toggle("on", tt < MER_I.C2 - 0.3);
    try { It(); zn(); ye(); } catch (e) { window.console && console.warn("MER intro loop", e && e.stack ? e.stack : e); }
    requestAnimationFrame(merIntroLoop);
  }
  function merIntroStart() {
    var box = merIntroEl("intro");
    if (!box || !t || !t.group) return;
    MER.intro = { t0: performance.now(), END: MER_I.END, pan: null };
    var ca0 = merIntroEl("card-a"), bs0 = merIntroEl("card-best");
    ca0 && ca0.classList.remove("on", "out");
    bs0 && (bs0.textContent = merBestText());
    merIntroPrep();
    box.hidden = !1;
    Qi.classList.add("mer-intro-on");
    requestAnimationFrame(function () { box.classList.add("live"); });
    requestAnimationFrame(merIntroLoop);
  }


  /* ---------- 3D showroom: low three-quarter orbit, car on the left, menu on the right ---------- */
  var MER_FIN = {
    gloss: { m: 0.3, r: 0.14, cc: 1, ccr: 0.02, env: 0.8 },
    matte: { m: 0.15, r: 0.72, cc: 0.05, ccr: 0.6, env: 0.7 },
    metallic: { m: 0.88, r: 0.28, cc: 1, ccr: 0.02, env: 1.15 },
  };
  function merShowGeo() {
    var sp = Wn()[0], hero = (t.carList || [])[0];
    if (!sp || !hero) return null;
    var al = (-sp.r * Math.PI) / 180, fw = (hero.userData && hero.userData.rig && hero.userData.rig.fwdZ) || -1;
    return { sp: sp, ff: Math.atan2(Math.sin(al) * fw, Math.cos(al) * fw) };
  }
  function merShowAz0() {
    var g = merShowGeo();
    return g ? g.ff + 0.72 : 0;
  }
  /* Showroom pose: the hero car sits nose-in, facing the back wall. The spot itself stays nose-out so the race start is unchanged. */
  function merNoseInR() {
    var car = (t.carList || [])[0], rg = car && r0(car), fw = (rg && rg.fwdZ) || -1, ry = fw < 0 ? 2 * Math.PI : Math.PI;
    return (-ry * 180) / Math.PI;
  }
  function merNoseIn(on) {
    try {
      var sp = Wn()[0], car = (t.carList || [])[0];
      if (!sp || !car) return;
      if (on) { if (MER.noseR == null) { MER.noseR = sp.r; sp.r = merNoseInR(); zr(0); } }
      else if (MER.noseR != null) { sp.r = MER.noseR; MER.noseR = null; zr(0); }
    } catch (er) {}
  }
  function merShowCalc(az, time) {
    var g = merShowGeo(), G = ie || { wid: 40, len: 40 };
    if (!g) return null;
    var sp = g.sp, rel = az - g.ff, dx = Math.sin(az), dz = Math.cos(az),
      ext = 1 / Math.sqrt(Math.pow(Math.sin(rel) / 3.4, 2) + Math.pow(Math.cos(rel) / 7.0, 2)),
      tx = Math.max(4, G.wid / 2 - 3.4 - Math.abs(sp.x)), tz = Math.max(4, G.len / 2 - (dz < 0 ? 3.2 : 2.2) - Math.abs(sp.z)),
      eR = 1 / Math.sqrt((dx / tx) * (dx / tx) + (dz / tz) * (dz / tz)),
      R = Math.max(ext + 3.6, Math.min(16.5, eR)),
      asp = (t.camera && t.camera.aspect) || 2, hth = Math.max(0.55, 31 / (2 * R)), fov = Math.max(42, Math.min(86, (2 * Math.atan(hth / Math.min(asp, 2.4)) * 180) / Math.PI)),
      off = 0.2 * R * Math.tan((fov * Math.PI) / 360) * Math.min(asp, 2.4),
      rx = Math.cos(az), rz = -Math.sin(az);
    return {
      x: sp.x + dx * R, y: 1.45 + 0.3 * Math.sin(time * 0.5), z: sp.z + dz * R,
      lx: sp.x + rx * off, ly: 1.75, lz: sp.z + rz * off, fov: fov,
    };
  }
  function merShowroomCam() {
    var S = MER.sh;
    if (!S) return !1;
    var now = performance.now(), dt = Math.min(0.05, Math.max(0, (now - S.last) / 1000));
    S.last = now;
    if (!S.drag) {
      S.az += S.vel * dt;
      S.vel *= Math.pow(0.04, dt);
    }
    if (S.key) { S.az += S.key * 1.6 * dt; S.dragEnd = now; }
    S.el = S.el || 0;
    S.el += ((S.elT || 0) - S.el) * Math.min(1, 6 * dt);
    var P = merShowCalc(S.az, (now - S.t0) / 1000);
    if (!P) return !1;
    var pc = Math.cos(S.el), ps = Math.sin(S.el), cx0 = (ee && Wn()[0] || { x: 0, z: 0 }).x, cz0 = (Wn()[0] || { x: 0, z: 0 }).z,
      hr = Math.hypot(P.x - cx0, P.z - cz0);
    P.x = cx0 + (P.x - cx0) * pc;
    P.z = cz0 + (P.z - cz0) * pc;
    P.y = Math.max(1.1, Math.min(10, P.y * pc + hr * ps));
    merIntroFov(P.fov);
    t.camera.position.set(P.x, P.y, P.z);
    t.camera.lookAt(P.lx, P.ly, P.lz);
    return !0;
  }
  function merShowroomLoop() {
    if (!MER.showroom || !MER.sh) return;
    if (t && t.drive) return;
    try { It(); ye(); } catch (e) {}
    MER.sh.raf = requestAnimationFrame(merShowroomLoop);
  }
  function merBestText() {
    try {
      var j = JSON.parse(localStorage.getItem("lcRace") || "null");
      if (j && j.best > 0) {
        var m = t && t.track ? u0(t.track) : [], medal = "", i;
        for (i = m.length - 1; i >= 0; i--) j.best <= m[i].t && (medal = " " + m[i].n);
        for (i = 0; i < m.length; i++) if (j.best <= m[i].t) { medal = " " + m[i].n; break; }
        return "Best: " + Pn(j.best);
      }
    } catch (e) {}
    return "No best time yet";
  }
  function merShowroomEnter() {
    if (!t || !t.group || MER.showroom || t.drive) return;
    MER.showroom = !0;
    merNoseIn(!0);
    var now = performance.now();
    MER.sh = { az: merShowAz0(), vel: 0, drag: null, dragEnd: -1e9, last: now, t0: now, raf: 0 };
    Qi.classList.add("mer-showroom");
    t.hintEl && t.hintEl.classList.remove("lc-show");
    merShow("sh-hint", !0);
    merSyncUi();
    var bl = merEl("best-line");
    bl && (bl.textContent = merBestText());
    merLuxSpots(!0);
    MER.warmed || setTimeout(merPrewarm, 1200);
    MER.sh.raf = requestAnimationFrame(merShowroomLoop);
  }
  function merShowroomExit() {
    if (!MER.showroom) return;
    MER.showroom = !1;
    merNoseIn(!1);
    merLuxSpots(!1);
    MER.sh && MER.sh.raf && cancelAnimationFrame(MER.sh.raf);
    MER.sh = null;
    Qi.classList.remove("mer-showroom");
    merShow("sh-hint", !1);
    t && t.camera && ((t.camera.near = 0.2), t.camera.updateProjectionMatrix());
  }
  function merLaunch() {
    if (!MER.showroom || MER.launching) return;
    MER.launching = !0;
    var sb = merEl("btn-startrace");
    sb && ((sb.textContent = "LOADING..."), sb.classList.add("is-loading"));
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        MER.launching = !1;
        merEnterCar(0);
        sb && ((sb.textContent = "START RACE"), sb.classList.remove("is-loading"));
      });
    });
  }
  function merBindShowroom() {
    var sh = function () { return MER.showroom && MER.sh; };
    var inPanel = function (el) { return !!(el && el.closest && el.closest("#garage-hud, #sh-hint")); };
    ["mousedown", "touchstart", "wheel"].forEach(function (ev) {
      window.addEventListener(ev, function (e) {
        if (!sh() || inPanel(e.target)) return;
        e.stopImmediatePropagation();
      }, !0);
    });
    window.addEventListener("pointerdown", function (e) {
      if (!sh() || inPanel(e.target)) return;
      e.stopImmediatePropagation();
      MER.sh.drag = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    }, !0);
    window.addEventListener("pointermove", function (e) {
      var S = sh() && MER.sh, d = S && S.drag;
      if (!d) return;
      var now = performance.now(), dx = e.clientX - d.x, dtm = Math.max(1, now - d.t);
      S.az -= dx * 0.0072;
      S.elT = Math.max(0, Math.min(1.4, (S.elT || 0) + (e.clientY - d.y) * 0.006));
      d.y = e.clientY;
      S.vel = Math.max(-3, Math.min(3, (-dx * 0.0072 * 1000) / dtm));
      d.x = e.clientX;
      d.t = now;
    }, !0);
    ["pointerup", "pointercancel"].forEach(function (ev) {
      window.addEventListener(ev, function () {
        var S = MER.sh;
        if (S && S.drag) { S.drag = null; S.dragEnd = performance.now(); }
      }, !0);
    });
    document.addEventListener("keydown", function (e) {
      if (!sh()) return;
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (e.code === "Enter" && !e.repeat && tag !== "BUTTON" && tag !== "INPUT") { e.preventDefault(); e.stopImmediatePropagation(); merLaunch(); return; }
      if (/^(KeyA|KeyD|ArrowLeft|ArrowRight)$/.test(e.code) && tag !== "INPUT") MER.sh.key = (e.code === "KeyA" || e.code === "ArrowLeft") ? -1 : 1;
      if (/^(Key[WASDEQ]|Arrow|Space|Shift)/.test(e.code) && tag !== "INPUT" && tag !== "BUTTON") { e.preventDefault(); e.stopImmediatePropagation(); }
    }, !0);
    document.addEventListener("keyup", function (e) {
      if (MER.sh && /^(KeyA|KeyD|ArrowLeft|ArrowRight)$/.test(e.code)) MER.sh.key = 0;
    }, !0);
    document.querySelectorAll("[data-finish]").forEach(function (b) {
      b.addEventListener("click", function () {
        MER.finish = b.getAttribute("data-finish");
        merApplyPaint();
        merSyncHud();
      });
    });
  }

  /* ENTER GARAGE: unlock audio, open the full screen view and start walking. */
  function merStart() {
    if (MER.entered) return;
    if (!MER.ready) {
      ((MER.pending = !0), merShow("loading", !0));
      return;
    }
    ((MER.entered = !0), (MER.pending = !1));
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC && t.ac !== !1) {
        t.ac || (t.ac = new AC());
        if (t.ac.state === "suspended") {
          var rs = t.ac.resume();
          rs && rs.catch && rs.catch(function () {});
        }
      }
    } catch (e) {}
    try { t.musicMute || al(); } catch (e) {}
    try {
      if (window.matchMedia && matchMedia("(pointer: coarse)").matches) {
        var de = document.documentElement, rf = de.requestFullscreen || de.webkitRequestFullscreen;
        if (rf && !document.fullscreenElement) { var fp = rf.call(de); fp && fp.catch && fp.catch(function () {}); }
        if (screen.orientation && screen.orientation.lock) { var op = screen.orientation.lock("landscape"); op && op.catch && op.catch(function () {}); }
      }
    } catch (e) {}
    var ov = merEl("title-overlay"), eb = merEl("enter-btn");
    eb && ((eb.textContent = "LOADING..."), eb.classList.add("is-loading"), (eb.disabled = !0));
    (po(), (t.yaw = 0), bi(!0), merIntroStart(), MER.intro || merShowroomEnter(), merSyncUi(), requestAnimationFrame(merTick), requestAnimationFrame(merFxLoop));
    var nf = 0;
    (function wait() {
      if (++nf < 4) return requestAnimationFrame(wait);
      nf === 4 && merPrewarm();
      requestAnimationFrame(function () {
        MER.intro && (MER.intro.t0 = performance.now());
        if (ov) {
          ov.classList.add("is-leaving");
          setTimeout(function () { ov.hidden = !0; }, 650);
        }
      });
    })();
  }

  function merBindUi() {
    document.addEventListener(
      "keydown",
      function (e) {
        if (!MER.intro) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        (e.code === "Enter" || e.code === "NumpadEnter" || e.code === "Space" || e.code === "Escape") && !e.repeat && merIntroEnd();
      },
      !0,
    );
    ["pointerdown", "mousedown", "touchstart", "wheel"].forEach(function (ev) {
      window.addEventListener(
        ev,
        function (e) {
          if (!MER.intro) return;
          if (e.target && e.target.closest && e.target.closest("#intro-skip")) return;
          e.stopImmediatePropagation();
        },
        !0,
      );
    });
    var skipBtn = merEl("intro-skip");
    skipBtn && skipBtn.addEventListener("click", function () { merIntroEnd(); });
    var enter = merEl("enter-btn");
    if (enter) {
      ((enter.disabled = !0), (enter.textContent = "LOADING..."), enter.addEventListener("click", merStart), enter.focus());
    }
    var on = function (id, fn) {
      var el = merEl(id);
      el && el.addEventListener("click", fn);
    };
    on("btn-daynight", function () {
      ((zt = "night"), merSyncHud());
    });
    on("btn-engine", function () {
      (t && (t.engMute = !t.engMute), merSyncHud());
    });
    on("btn-music", function () {
      t && ((t.musicMute = !t.musicMute), t.musicMute ? fo() : t.raceOn && (al(), rl(0.15)));
      merSyncHud();
    });
    document.querySelectorAll("[data-mode]").forEach(function (b) {
      b.addEventListener("click", function () {
        ((MER.mode = "trial"), merSyncHud());
      });
    });
    document.querySelectorAll("[data-color]").forEach(function (b) {
      b.addEventListener("click", function () {
        ((MER.paint = b.getAttribute("data-color")), merApplyPaint(), merSyncHud());
      });
    });
    var hue = merEl("paint-hue");
    hue &&
      hue.addEventListener("input", function () {
        MER_PAINT.custom = new fe.Color().setHSL(hue.value / 360, 1, 0.5).getHex();
        ((MER.paint = "custom"), merApplyPaint(), merSyncHud());
      });
    var clearKeys = function () {
      ((Pt = {}), (At = {}));
    };
    window.addEventListener("blur", clearKeys);
    window.addEventListener("focus", clearKeys);
    document.addEventListener("visibilitychange", clearKeys);
    document.addEventListener(
      "keydown",
      function (e) {
        (e.metaKey || e.key === "Meta" || /^F\d+$/.test(e.code)) && (clearKeys(), (merBoostOk.lock = !0));
      },
      !0,
    );
    document.addEventListener(
      "keyup",
      function (e) {
        e.key === "Meta" && clearKeys();
      },
      !0,
    );
    ["pointermove", "pointerdown", "mousemove"].forEach(function (ev) {
      document.addEventListener(
        ev,
        function (e) {
          Pt.boost && !e.shiftKey && (Pt.boost = !1);
        },
        !0,
      );
    });
    var sr = merEl("btn-startrace");
    sr && sr.addEventListener("click", function () { merLaunch(); });
    merBindShowroom();
    var prompt = merEl("car-prompt");
    prompt &&
      prompt.addEventListener("click", function () {
        MER.target >= 0 && merEnterCar(MER.target);
      });
    document.addEventListener("keydown", function (e) {
      if (e.code === "KeyE" && !e.repeat && MER.entered && t && t.walk && !t.drive && MER.target >= 0) {
        (e.preventDefault(), merEnterCar(MER.target));
      }
    });
    /* Browsers keep audio suspended until the player touches the page. */
    ["pointerdown", "keydown", "touchend"].forEach(function (ev) {
      document.addEventListener(
        ev,
        function () {
          if (t && t.ac && t.ac.state === "suspended") {
            var rs = t.ac.resume();
            rs && rs.catch && rs.catch(function () {});
          }
          if (t && t.sound && t.tvVid && t.tvVid.muted && !t.tvHold)
            try {
              cr();
            } catch (e) {}
        },
        !0,
      );
    });
    merSyncHud();
  }

  /* Start: night garage, then build the 3D scene. */
  zt = "night";
  Rr = !0;
  merBindUi();
  Mt();
})();
