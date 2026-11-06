// Mesin animasi splash ngampUS (logika asli dari demo HTML, timing persis sesuai referensi visual).
// Dipanggil sekali dari SplashScreen.tsx. Mengembalikan fungsi cleanup.
export function initSplash() {
  if (typeof document === 'undefined') return () => {};

  var $ = function(s) { return document.querySelector(s); };
  var splash = $('#splash');
  if (!splash) return () => {};

  var scene = $('.scene'),
      cap = $('#cap'),
      cnt = $('#cnt'),
      fill = $('#fill'),
      msg = $('#msg'),
      clk = $('#clk'),
      mt = $('#mt'),
      lb = $('#lb'),
      loader = $('#loader'),
      lmsg = $('#lmsg');

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var K = reduce ? 0.15 : 1;
  var timers = [], raf = 0, loaded = false, shown = 0, t0 = 0, exiting = false;

  function at(ms, fn) { timers.push(setTimeout(fn, ms * K)); }
  function pad(n) { return String(n).padStart(2, '0'); }

  var D = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
  function clock() {
    var n = new Date();
    if (clk) clk.textContent = D[n.getDay()] + ', ' + pad(n.getHours()) + '.' + pad(n.getMinutes());
  }
  clock();
  var clockId = setInterval(clock, 1000);

  function typeTag(txt, start) {
    if (!cap) return;
    cap.textContent = '';
    for (var i = 0; i < txt.length; i++) {
      (function(idx) {
        at(start + idx * 30, function() {
          if (cap) cap.textContent = txt.slice(0, idx + 1);
        });
      })(i);
    }
  }

  Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(function(r) {
      if (document.readyState === 'complete') r();
      else window.addEventListener('load', r, { once: true });
    })
  ]).then(function() {
    loaded = true;
  });

  /* meter "level pusing" turun dari 100 ke 0 mengikuti progres load asli */
  function draw() {
    if (!cnt || !lb || !mt || !fill || !msg) return;
    var p = Math.round((1 - shown) * 100), ok = shown >= 1;
    cnt.textContent = ok ? 'rapi' : String(p);
    lb.textContent = ok ? 'status' : 'level pusing';
    mt.classList.toggle('ok', ok);
    fill.style.transform = 'scaleX(' + (ok ? 1 : 1 - shown) + ')';
    msg.textContent = shown < 0.3 ? 'mahasiswa lagi pusing' : shown < 0.55 ? 'maskot datang bantuin' : shown < 0.95 ? 'merapikan jadwal & deadline' : 'siap. Senin kamu rapi.';
  }

  function tick(now) {
    if (exiting) return;
    var tt = Math.min(1, (now - t0) / (7400 * K));
    var target = Math.min(tt, loaded ? 1 : 0.92);
    shown += (target - shown) * 0.14;
    if (target === 1 && shown > 0.994) shown = 1;
    draw();
    if (shown >= 1) {
      exit();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function exit() {
    exiting = true;
    if (splash) splash.classList.remove('talk');
    var mouth = $('#mouth');
    if (mouth && scene) {
      var m = mouth.getBoundingClientRect();
      scene.style.transformOrigin = (m.left + m.width / 2) + 'px ' + (m.top + m.height / 2) + 'px';
    }
    if (splash) splash.classList.add('zoom');
    at(620, function() {
      if (splash) splash.classList.add('portal');
      document.body.classList.add('ready');
      window.dispatchEvent(new Event('ngampus:reveal'));
    });
    at(1400, function() {
      if (splash) splash.hidden = true;
      window.dispatchEvent(new Event('ngampus:splash-done'));
      document.documentElement.style.overflow = '';
      try { sessionStorage.setItem('ngSplash', '1'); } catch (e) {}
    });
  }

  function run() {
    timers.forEach(clearTimeout);
    timers = [];
    cancelAnimationFrame(raf);
    exiting = false;
    shown = 0;
    document.body.classList.remove('ready');
    document.documentElement.style.overflow = 'hidden';
    if (loader) {
      loader.classList.remove('on');
      loader.hidden = true;
    }
    if (splash) {
      splash.hidden = false;
      splash.className = 'nt';
      if (scene) scene.style.transformOrigin = '';
      draw();
      void splash.offsetWidth;
      splash.className = '';
    }
    at(60, function() { if (splash) splash.classList.add('in'); });
    at(2200, function() { if (splash) splash.classList.add('help'); });
    at(3500, function() { if (splash) splash.classList.add('fix'); });
    at(5400, function() { if (splash) splash.classList.add('big'); });
    at(6300, function() { if (splash) splash.classList.add('talk'); });
    typeTag('beres semua. yuk, mulai semestermu.', 6300);
    t0 = performance.now();
    raf = requestAnimationFrame(tick);
  }

  var LM = ['memuat jadwal…', 'menghitung SKS…', 'mengecek deadline…', 'hampir rapi…'];
  var lt = 0;
  function showLoader(ms) {
    if (!loader || !lmsg) return;
    clearInterval(lt);
    loader.hidden = false;
    void loader.offsetWidth;
    loader.classList.add('on');
    var i = 0;
    lmsg.textContent = LM[0];
    lt = setInterval(function() {
      i = (i + 1) % LM.length;
      lmsg.textContent = LM[i];
    }, 700);
    setTimeout(function() {
      loader.classList.remove('on');
      clearInterval(lt);
      setTimeout(function() { loader.hidden = true; }, 450);
    }, ms);
  }

  if (typeof window !== 'undefined') {
    window.ngampusLoader = showLoader;
  }

  var seen = false;
  try { seen = !!sessionStorage.getItem('ngSplash'); } catch (e) {}

  if (seen) {
    if (splash) splash.hidden = true;
    document.body.classList.add('ready');
    window.dispatchEvent(new Event('ngampus:reveal'));
    showLoader(1200);
  } else {
    run();
  }

  return function() {
    timers.forEach(clearTimeout);
    cancelAnimationFrame(raf);
    clearInterval(clockId);
    clearInterval(lt);
  };
}

