/* ==========================================================================
   HUB PLANTAS · Lógica de la interfaz
   --------------------------------------------------------------------------
   No necesitas editar este archivo para agregar o cambiar dashboards:
   todo se configura en config.js.

   Enlaces directos (para compartir por correo):
     index.html#planta=molienda-sag
     index.html#planta=molienda-sag&modulo=parametros&vista=mb3
   ========================================================================== */
(function () {
  'use strict';

  var C = window.HUB_CONFIG;
  if (!C) { document.body.insertAdjacentHTML('afterbegin', '<p style="padding:24px">No se encontró config.js. Verifica que el archivo esté junto a index.html.</p>'); return; }

  var ALL = 'todas';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var state = { plant: ALL, view: 'home', module: null, sub: {} };
  var frames = {};          // iframes ya creados, por "modulo:vista"
  var loadTimer = null;

  /* ---------- utilidades ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) continue;
      if (k === 'class') n.className = attrs[k]; else n.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  function plantById(id) { return C.plants.filter(function (p) { return p.id === id; })[0]; }
  function moduleById(id) { return C.modules.filter(function (m) { return m.id === id; })[0]; }
  function catById(id) { return C.categories.filter(function (c) { return c.id === id; })[0] || { name: '' }; }
  function viewsOf(m) { return (m.views && m.views.length) ? m.views : [{ id: 'general', name: m.name, url: m.url || '' }]; }
  function currentView(m) {
    var vs = viewsOf(m), id = state.sub[m.id];
    return vs.filter(function (v) { return v.id === id; })[0] || vs[0];
  }
  /* URL de una vista para la planta seleccionada:
     urlPorPlanta[planta] si existe; si no, url (vista general / "Todas las plantas") */
  function urlFor(v, plantId) {
    plantId = plantId || state.plant;
    var map = v.urlPorPlanta || {};
    return (plantId !== ALL && map[plantId]) || v.url || '';
  }
  function frameKey(m, v) {
    var map = v.urlPorPlanta || {};
    return m.id + ':' + v.id + ':' + ((state.plant !== ALL && map[state.plant]) ? state.plant : 'general');
  }

  /* Estado de un módulo en una planta: 'on' | 'soon' | 'off' */
  function statusOf(m, plantId) {
    if (plantId === ALL) return 'on';
    var s = (m.coverage || {})[plantId];
    if (s === 'activo') return 'on';
    if (s === 'proximamente') return 'soon';
    return 'off';
  }
  function plantsOn(m) { return C.plants.filter(function (p) { return statusOf(m, p.id) === 'on'; }); }
  function countOn(plantId) { return C.modules.filter(function (m) { return statusOf(m, plantId) === 'on'; }).length; }

  /* Acepta una URL o el código <iframe …> completo copiado desde Looker Studio */
  function cleanUrl(raw) {
    if (!raw) return '';
    var s = String(raw).trim();
    var m = s.match(/src\s*=\s*["']([^"']+)["']/i);
    if (m) s = m[1];
    return s.replace(/&amp;/g, '&');
  }

  /* Looker Studio: convierte cualquier enlace del informe al formato embebible */
  function isLooker(url) { return /(^|\.)(lookerstudio|datastudio)\.google\.com$/i.test(hostOf(url)); }
  function hostOf(url) { try { return new URL(url).hostname; } catch (e) { return ''; } }
  function lookerPath(url) {
    var u = new URL(url);
    var p = u.pathname.replace(/^\/u\/\d+/, '').replace(/\/edit\/?$/, '').replace(/^\/embed/, '');
    return { path: p, search: u.search };
  }
  function embedUrl(url) {
    url = cleanUrl(url);
    if (!url || !isLooker(url)) return url;
    try { var l = lookerPath(url); return 'https://' + hostOf(url) + '/embed' + l.path + l.search; } catch (e) { return url; }
  }
  function externalUrl(url) {
    url = cleanUrl(url);
    if (!url || !isLooker(url)) return url;
    try { var l = lookerPath(url); return 'https://' + hostOf(url) + l.path + l.search; } catch (e) { return url; }
  }
  function sourceLabel(url) { url = cleanUrl(url); return !url ? '' : isLooker(url) ? 'Looker Studio' : 'Página web'; }

  /* ---------- marca ---------- */
  function renderBrand() {
    var b = C.brand || {};
    $('hub-title').textContent = b.title || 'HUB Plantas';
    $('hub-subtitle').textContent = b.subtitle || '';
    $('status-text').textContent = b.statusText || 'Sistema operativo';
    $('site-text').textContent = b.siteText || '';
    document.querySelectorAll('.logo-slot').forEach(function (slot) {
      var who = b[slot.getAttribute('data-logo')] || {};
      if (who.logo) {
        slot.appendChild(el('img', { class: 'logo-light', src: who.logo, alt: who.name || '' }));
        if (who.logoDark) {
          slot.classList.add('has-dark');
          slot.appendChild(el('img', { class: 'logo-dark', src: who.logoDark, alt: who.name || '' }));
        }
      } else {
        slot.appendChild(el('span', { class: 'logo-slot__ph', title: 'Reemplazar en config.js › brand' }, 'Logo ' + esc(who.name || '')));
      }
    });
  }

  /* ---------- reloj (hora de faena) ---------- */
  function startClock() {
    var tz = (C.brand && C.brand.timeZone) || 'America/Santiago';
    var fmt;
    try { fmt = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }); }
    catch (e) { fmt = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }); }
    var c = $('clock');
    c.setAttribute('aria-label', 'Hora local en faena');
    function tick() { var d = new Date(); c.textContent = fmt.format(d); c.setAttribute('datetime', d.toISOString()); }
    tick(); setInterval(tick, 15000);
  }

  /* ---------- selector de planta ---------- */
  var plantBtns = [], indicator;
  function renderPlantbar() {
    var track = $('plantbar');
    indicator = el('span', { class: 'plant-ind', 'aria-hidden': 'true' });
    track.appendChild(indicator);
    var list = [{ id: ALL, name: 'Todas las plantas' }].concat(C.plants);
    list.forEach(function (p) {
      var n = p.id === ALL ? C.modules.length : countOn(p.id);
      var b = el('button', {
        class: 'plant-btn', type: 'button', role: 'radio', 'data-plant': p.id,
        'aria-checked': 'false', tabindex: '-1',
        title: p.id === ALL ? 'Ver todas las soluciones' : n + ' de ' + C.modules.length + ' soluciones con servicio en ' + p.name
      }, '<span>' + esc(p.name) + '</span><span class="plant-btn__count" aria-hidden="true">' + n + '/' + C.modules.length + '</span>');
      b.addEventListener('click', function () { setPlant(p.id); });
      track.appendChild(b);
      plantBtns.push(b);
    });
    track.addEventListener('keydown', function (e) {
      if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].indexOf(e.key) < 0) return;
      e.preventDefault();
      var i = plantBtns.findIndex(function (b) { return b.getAttribute('aria-checked') === 'true'; });
      if (e.key === 'ArrowRight') i = (i + 1) % plantBtns.length;
      if (e.key === 'ArrowLeft') i = (i - 1 + plantBtns.length) % plantBtns.length;
      if (e.key === 'Home') i = 0;
      if (e.key === 'End') i = plantBtns.length - 1;
      setPlant(plantBtns[i].getAttribute('data-plant'));
      plantBtns[i].focus();
    });
    window.addEventListener('resize', moveIndicator);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
  }
  function moveIndicator() {
    var b = plantBtns.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    if (!b || !indicator) return;
    indicator.style.width = b.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + b.offsetLeft + 'px)';
  }

  /* ---------- tarjetas de módulos ---------- */
  function renderModules() {
    var root = $('modules');
    C.categories.forEach(function (cat) {
      var mods = C.modules.filter(function (m) { return m.category === cat.id; });
      if (!mods.length) return;
      var sec = el('section', { class: 'cat', 'aria-labelledby': 'cat-' + cat.id });
      sec.appendChild(el('div', { class: 'cat__head' },
        '<h2 id="cat-' + cat.id + '">' + esc(cat.name) + '</h2><span class="cat__count" data-cat-count="' + cat.id + '"></span>'));
      var grid = el('div', { class: 'tiles' });
      mods.forEach(function (m) { grid.appendChild(renderTile(m)); });
      sec.appendChild(grid);
      root.appendChild(sec);
    });
  }
  function renderTile(m) {
    var vs = viewsOf(m);
    var t = el('article', { class: 'tile', 'data-module': m.id });
    var pips = C.plants.map(function (p) {
      var s = statusOf(m, p.id);
      return '<span class="pip ' + s + '" data-pip="' + p.id + '" title="' + esc(p.name) + ': ' + (s === 'on' ? 'activo' : s === 'soon' ? 'próximamente' : 'no aplica') + '"></span>';
    }).join('');
    var nOn = plantsOn(m).length;
    var views = '';
    if (vs.length > 1) {
      views = '<ul class="tile__views" aria-label="Tableros de ' + esc(m.name) + '">' + vs.map(function (v) {
        return '<li><button class="view-chip" type="button" data-view="' + esc(v.id) + '">' + esc(v.name) + '</button></li>';
      }).join('') + '</ul>';
    }
    t.innerHTML =
      '<span class="tile__tape" aria-hidden="true"></span>' +
      '<div class="tile__body">' +
        '<div class="tile__head"><h3><button class="tile__open" type="button">' + esc(m.name) + '</button></h3><span class="badge" aria-live="polite"></span></div>' +
        '<p>' + esc(m.description || '') + '</p>' +
        views +
      '</div>' +
      '<div class="tile__foot">' +
        '<span class="cov"><span class="pips" aria-hidden="true">' + pips + '</span><span>' + nOn + ' de ' + C.plants.length + ' plantas</span></span>' +
        '<span class="tile__go"></span>' +
      '</div>';
    t.querySelector('.tile__open').addEventListener('click', function () { openModule(m.id); });
    t.querySelectorAll('.view-chip').forEach(function (b) {
      b.addEventListener('click', function () { openModule(m.id, b.getAttribute('data-view')); });
    });
    return t;
  }
  function updateTiles() {
    var plant = plantById(state.plant);
    document.querySelectorAll('.tile').forEach(function (t) {
      var m = moduleById(t.getAttribute('data-module'));
      var s = statusOf(m, state.plant);
      var badge = t.querySelector('.badge'), go = t.querySelector('.tile__go');
      if (state.plant === ALL) {
        t.removeAttribute('data-state');
        badge.className = 'badge'; badge.textContent = '';
        go.textContent = 'Abrir dashboard';
      } else if (s === 'on') {
        t.setAttribute('data-state', 'on');
        badge.className = 'badge badge--on'; badge.textContent = 'Activo en ' + plant.name;
        go.textContent = 'Abrir dashboard';
      } else if (s === 'soon') {
        t.setAttribute('data-state', 'soon');
        badge.className = 'badge badge--soon'; badge.textContent = 'Próximamente';
        go.textContent = 'Ver detalle';
      } else {
        t.setAttribute('data-state', 'off');
        badge.className = 'badge badge--off'; badge.textContent = 'No aplica en ' + plant.name;
        go.textContent = 'Ver dónde aplica';
      }
      t.querySelectorAll('.pip').forEach(function (p) {
        p.classList.toggle('sel', p.getAttribute('data-pip') === state.plant);
      });
    });
    document.querySelectorAll('[data-cat-count]').forEach(function (n) {
      var id = n.getAttribute('data-cat-count');
      var mods = C.modules.filter(function (m) { return m.category === id; });
      if (state.plant === ALL) { n.textContent = mods.length + (mods.length === 1 ? ' módulo' : ' módulos'); return; }
      var on = mods.filter(function (m) { return statusOf(m, state.plant) === 'on'; }).length;
      n.textContent = on + ' de ' + mods.length + ' con servicio';
    });
  }

  /* ---------- matriz de cobertura ---------- */
  function renderMatrix() {
    var tb = $('matrix');
    var head = '<thead><tr><th class="rowhead-col" scope="col"><span class="sr" style="position:absolute;left:-9999px">Módulo</span></th>' +
      C.plants.map(function (p) {
        return '<th scope="col" data-col="' + p.id + '"><button class="mx-col" type="button" data-plant="' + p.id + '" aria-pressed="false" title="' + esc(p.name) + '">' + esc(p.short || p.name) + '</button></th>';
      }).join('') + '</tr></thead>';
    var body = '<tbody>' + C.modules.map(function (m) {
      var n = viewsOf(m).length;
      return '<tr><th scope="row">' + esc(m.name) + (n > 1 ? '<small>' + n + ' tableros</small>' : '') + '</th>' +
        C.plants.map(function (p) {
          var s = statusOf(m, p.id);
          var label = m.name + ' en ' + p.name + ': ' + (s === 'on' ? 'servicio activo, abrir dashboard' : s === 'soon' ? 'próximamente' : 'no aplica');
          return '<td data-col="' + p.id + '"><button class="mx-cell" type="button" data-s="' + s + '" data-module="' + m.id + '" data-plant="' + p.id + '" aria-label="' + esc(label) + '" title="' + esc(label) + '"><span class="mark mark--' + s + '"></span></button></td>';
        }).join('') + '</tr>';
    }).join('') + '</tbody>';
    tb.innerHTML = head + body;
    tb.querySelectorAll('.mx-col').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-plant');
        setPlant(state.plant === id ? ALL : id);
      });
    });
    tb.querySelectorAll('.mx-cell').forEach(function (b) {
      b.addEventListener('click', function () {
        var pid = b.getAttribute('data-plant'), mid = b.getAttribute('data-module');
        if (b.getAttribute('data-s') === 'on') { setPlant(pid, true); openModule(mid); }
        else setPlant(pid);
      });
    });
  }
  function updateMatrix() {
    document.querySelectorAll('#matrix [data-col]').forEach(function (c) {
      c.classList.toggle('is-selcol', c.getAttribute('data-col') === state.plant);
    });
    document.querySelectorAll('#matrix .mx-col').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-plant') === state.plant ? 'true' : 'false');
    });
  }

  /* ---------- encabezado de planta ---------- */
  function updateIntro(animate) {
    var name = state.plant === ALL ? 'Todas las plantas' : plantById(state.plant).name;
    var h = $('plant-heading');
    $('plant-name').textContent = name;
    if (animate && !reduceMotion) { h.classList.remove('is-swapping'); void h.offsetWidth; h.classList.add('is-swapping'); }
    var total = C.modules.length;
    if (state.plant === ALL) {
      $('plant-summary').innerHTML = '<b>' + total + ' soluciones</b> en ' + C.plants.length + ' plantas. Elige una planta para ver dónde está activo cada servicio.';
    } else {
      var n = countOn(state.plant);
      $('plant-summary').innerHTML = '<b>' + n + ' de ' + total + ' soluciones</b> con servicio activo en ' + esc(name) + '.';
    }
  }

  /* ---------- cambio de planta ---------- */
  function setPlant(id, silent) {
    if (id !== ALL && !plantById(id)) id = ALL;
    var changed = id !== state.plant;
    state.plant = id;
    store('hub-plant', id);
    plantBtns.forEach(function (b) {
      var on = b.getAttribute('data-plant') === id;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.setAttribute('tabindex', on ? '0' : '-1');
      if (on && changed && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    moveIndicator();
    updateTiles();
    updateMatrix();
    updateIntro(changed);
    if (state.view === 'viewer') { updateModuleTabs(); showStage(); }
    if (!silent) writeHash(false);
  }

  /* ---------- visor ---------- */
  var modTabs = [];
  function renderModuleTabs() {
    var wrap = $('module-switch');
    C.modules.forEach(function (m) {
      var b = el('button', { class: 'mod-tab', type: 'button', role: 'tab', 'data-module': m.id, 'aria-selected': 'false', tabindex: '-1' }, esc(m.name));
      b.addEventListener('click', function () { openModule(m.id); });
      wrap.appendChild(b); modTabs.push(b);
    });
    wrap.addEventListener('keydown', function (e) { rovingKeys(e, modTabs, function (b) { openModule(b.getAttribute('data-module')); }); });
  }
  function rovingKeys(e, list, act) {
    if (['ArrowRight', 'ArrowLeft'].indexOf(e.key) < 0) return;
    e.preventDefault();
    var i = list.indexOf(document.activeElement);
    if (i < 0) i = 0;
    i = e.key === 'ArrowRight' ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
    list[i].focus(); act(list[i]);
  }
  function updateModuleTabs() {
    modTabs.forEach(function (b) {
      var m = moduleById(b.getAttribute('data-module'));
      var sel = m.id === state.module;
      b.setAttribute('aria-selected', sel ? 'true' : 'false');
      b.setAttribute('tabindex', sel ? '0' : '-1');
      b.setAttribute('data-s', statusOf(m, state.plant));
      b.title = statusOf(m, state.plant) === 'off' ? 'No aplica en ' + plantById(state.plant).name : '';
      if (sel && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }
  function renderViewTabs(m) {
    var wrap = $('view-switch');
    var vs = viewsOf(m);
    wrap.innerHTML = '';
    if (vs.length < 2) { wrap.hidden = true; return; }
    wrap.hidden = false;
    var cur = currentView(m), list = [];
    vs.forEach(function (v) {
      var b = el('button', { class: 'view-tab', type: 'button', role: 'tab', 'aria-selected': v.id === cur.id ? 'true' : 'false', tabindex: v.id === cur.id ? '0' : '-1', 'data-view': v.id }, esc(v.name));
      b.addEventListener('click', function () { openModule(m.id, v.id); });
      wrap.appendChild(b); list.push(b);
    });
    wrap.onkeydown = function (e) { rovingKeys(e, list, function (b) { openModule(m.id, b.getAttribute('data-view')); }); };
  }

  function openModule(id, viewId, opts) {
    var m = moduleById(id);
    if (!m) return;
    opts = opts || {};
    var fromHome = state.view !== 'viewer';
    if (viewId && viewsOf(m).some(function (v) { return v.id === viewId; })) state.sub[m.id] = viewId;
    state.module = m.id;
    state.view = 'viewer';
    document.body.setAttribute('data-view', 'viewer');
    $('home').hidden = true;
    $('viewer').hidden = false;

    $('viewer-category').textContent = catById(m.category).name;
    $('viewer-title').textContent = m.name;

    updateModuleTabs();
    renderViewTabs(m);
    if (fromHome) window.scrollTo(0, 0);
    showStage();
    sizeStage();
    if (!opts.fromHistory) writeHash(fromHome);
  }

  function goHome(fromHistory) {
    exitFullscreen();
    state.view = 'home'; state.module = null;
    document.body.setAttribute('data-view', 'home');
    $('viewer').hidden = true;
    $('home').hidden = false;
    hideFrames();
    moveIndicator();
    if (!fromHistory) writeHash(false);
  }

  function hideStates() {
    ['state-loading', 'state-nourl', 'state-nocoverage'].forEach(function (s) { $(s).hidden = true; });
    clearTimeout(loadTimer);
  }
  function hideFrames() {
    Object.keys(frames).forEach(function (k) { frames[k].classList.remove('is-active'); });
  }

  function showStage() {
    var m = moduleById(state.module);
    if (!m) return;
    var v = currentView(m);
    var url = urlFor(v);
    var s = statusOf(m, state.plant);
    hideStates(); hideFrames();

    $('viewer-source').textContent = sourceLabel(url);
    $('viewer-source').hidden = !url;
    var ext = $('viewer-external');
    if (url) ext.href = externalUrl(url); else ext.removeAttribute('href');

    var showActions = s === 'on' && !!url;
    $('viewer-reload').style.visibility = showActions ? '' : 'hidden';
    $('viewer-external').style.visibility = showActions ? '' : 'hidden';

    if (s !== 'on') {
      var pname = plantById(state.plant).name;
      $('nocov-title').textContent = s === 'soon' ? m.name + ' llegará pronto a ' + pname : m.name + ' no aplica en ' + pname;
      var on = plantsOn(m);
      $('nocov-text').textContent = on.length
        ? 'Este servicio está activo en ' + (on.length === 1 ? 'esta planta' : 'estas plantas') + '. Elige una para verlo:'
        : 'Este servicio aún no está activo en ninguna planta.';
      var box = $('nocov-plants'); box.innerHTML = '';
      on.forEach(function (p) {
        var b = el('button', { class: 'btn btn--solid', type: 'button' }, esc(p.name));
        b.addEventListener('click', function () { setPlant(p.id); });
        box.appendChild(b);
      });
      var all = el('button', { class: 'btn btn--ghost', type: 'button' }, 'Ver en todas las plantas');
      all.addEventListener('click', function () { setPlant(ALL); });
      box.appendChild(all);
      $('state-nocoverage').hidden = false;
      return;
    }
    if (!url) { $('state-nourl').hidden = false; return; }

    var key = frameKey(m, v);
    var f = frames[key];
    if (!f) {
      f = el('iframe', {
        src: embedUrl(url), title: m.name + (viewsOf(m).length > 1 ? ' · ' + v.name : ''),
        allow: 'fullscreen; clipboard-write', allowfullscreen: true,
        referrerpolicy: 'strict-origin-when-cross-origin', loading: 'eager',
        // Mismos permisos que entrega Looker Studio en su código de inserción
        // (permiten iniciar sesión con Google dentro del iframe)
        sandbox: isLooker(cleanUrl(url)) ? 'allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads' : null
      });
      f.addEventListener('load', function () {
        f.classList.add('is-loaded');
        if (f.classList.contains('is-active')) { hideStates(); }
      });
      frames[key] = f;
      $('frames').appendChild(f);
    }
    f.classList.add('is-active');
    if (!f.classList.contains('is-loaded')) showLoading(url);
  }

  function showLoading(url) {
    $('state-loading').hidden = false;
    $('loading-hint').hidden = true;
    $('loading-external').href = externalUrl(url);
    clearTimeout(loadTimer);
    loadTimer = setTimeout(function () { $('loading-hint').hidden = false; }, 9000);
  }

  function reloadCurrent() {
    var m = moduleById(state.module); if (!m) return;
    var v = currentView(m);
    var f = frames[frameKey(m, v)];
    if (!f) return;
    f.classList.remove('is-loaded');
    showLoading(urlFor(v));
    f.src = f.src;
  }

  function sizeStage() {
    var st = $('stage');
    if (document.body.classList.contains('stage-fs')) { st.style.height = ''; return; }
    var top = st.getBoundingClientRect().top + window.scrollY;
    var h = Math.max(420, window.innerHeight - top - 20);
    st.style.height = h + 'px';
  }

  /* ---------- pantalla completa ---------- */
  function isFs() { return !!(document.fullscreenElement || document.webkitFullscreenElement) || document.body.classList.contains('stage-pseudo-fs'); }
  function setFsUi(on) {
    document.body.classList.toggle('stage-fs', on);
    $('viewer-fullscreen').querySelector('span').textContent = on ? 'Salir de pantalla completa' : 'Pantalla completa';
    if (!on) sizeStage();
  }
  function enterFullscreen() {
    var st = $('stage');
    var req = st.requestFullscreen || st.webkitRequestFullscreen;
    if (req) {
      try {
        var p = req.call(st);
        if (p && p.catch) p.catch(pseudoFs);
        return;
      } catch (e) { /* cae a modo alternativo */ }
    }
    pseudoFs();
  }
  function pseudoFs() { document.body.classList.add('stage-pseudo-fs'); setFsUi(true); }
  function exitFullscreen() {
    if (document.body.classList.contains('stage-pseudo-fs')) { document.body.classList.remove('stage-pseudo-fs'); setFsUi(false); return; }
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
  function toggleFullscreen() { isFs() ? exitFullscreen() : enterFullscreen(); }
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
    document.addEventListener(ev, function () { setFsUi(!!(document.fullscreenElement || document.webkitFullscreenElement)); });
  });

  /* ---------- tema claro / oscuro ---------- */
  function currentTheme() { return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    store('hub-theme', t);
    $('theme-toggle').setAttribute('aria-label', t === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#1A1D20' : '#E8EBED');
  }
  function toggleTheme(e) {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduceMotion) { applyTheme(next); return; }
    var r = e.currentTarget.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var tr = document.startViewTransition(function () { applyTheme(next); });
    tr.ready.then(function () {
      document.documentElement.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 700, easing: 'cubic-bezier(.16, 1, .3, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () {});
  }

  /* ---------- enlaces directos (#planta=…&modulo=…&vista=…) ---------- */
  function writeHash(push) {
    var p = new URLSearchParams();
    if (state.plant !== ALL) p.set('planta', state.plant);
    if (state.view === 'viewer' && state.module) {
      p.set('modulo', state.module);
      var m = moduleById(state.module);
      if (viewsOf(m).length > 1) p.set('vista', currentView(m).id);
    }
    var h = p.toString();
    var url = location.pathname + location.search + (h ? '#' + h : '');
    try { push ? history.pushState(null, '', url) : history.replaceState(null, '', url); } catch (e) { location.hash = h; }
  }
  function readHash(fromHistory) {
    var p = new URLSearchParams(location.hash.replace(/^#/, ''));
    var plant = p.get('planta') || (fromHistory ? ALL : (store('hub-plant') || ALL));
    setPlant(plant, true);
    var mod = p.get('modulo');
    if (mod && moduleById(mod)) openModule(mod, p.get('vista'), { fromHistory: true });
    else if (state.view === 'viewer') goHome(true);
  }

  /* ---------- fondo: curvas de nivel de un rajo ---------- */
  function drawTerrain() {
    var svg = $('terrain');
    var W = 1600, H = 1000;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    function ring(cx, cy, r, amps, phases, n) {
      var pts = [];
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2, k = 1;
        for (var j = 0; j < amps.length; j++) k += amps[j] * Math.sin((j + 2) * a + phases[j]);
        pts.push([cx + Math.cos(a) * r * k * 1.25, cy + Math.sin(a) * r * k * .82]);
      }
      // Catmull-Rom → Bézier (curva cerrada suave)
      var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
      for (var q = 0; q < n; q++) {
        var p0 = pts[(q - 1 + n) % n], p1 = pts[q], p2 = pts[(q + 1) % n], p3 = pts[(q + 2) % n];
        d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
             (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' +
             p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      return d + 'Z';
    }
    var out = '';
    var phases = [rnd() * 6, rnd() * 6, rnd() * 6, rnd() * 6];
    for (var k = 0; k < 22; k++) {             // el rajo: bancos concéntricos
      var g = k / 22;
      var amps = [.05 + g * .08, .03 + g * .05, .02 + g * .03, .012];
      out += '<path class="' + (k % 5 === 4 ? 'hi' : '') + '" d="' + ring(1180, 330, 28 + k * 44, amps, phases.map(function (p, i) { return p + g * (i + 1) * .6; }), 72) + '"/>';
    }
    var ph2 = [rnd() * 6, rnd() * 6, rnd() * 6, rnd() * 6];
    for (var z = 0; z < 10; z++) {              // un cerro al otro lado
      var g2 = z / 10;
      out += '<path class="' + (z % 5 === 4 ? 'hi' : '') + '" d="' + ring(170, 930, 30 + z * 46, [.07 + g2 * .05, .04, .02, .01], ph2.map(function (p, i) { return p + g2 * i * .5; }), 64) + '"/>';
    }
    svg.innerHTML = out;
  }

  /* ---------- inicio ---------- */
  function init() {
    renderBrand();
    startClock();
    drawTerrain();
    renderPlantbar();
    renderModules();
    renderMatrix();
    renderModuleTabs();
    applyTheme(currentTheme());

    $('theme-toggle').addEventListener('click', toggleTheme);
    $('viewer-back').addEventListener('click', function () { goHome(false); });
    $('viewer-fullscreen').addEventListener('click', toggleFullscreen);
    $('stage-exit').addEventListener('click', exitFullscreen);
    $('viewer-reload').addEventListener('click', reloadCurrent);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('stage-pseudo-fs')) exitFullscreen();
    });
    window.addEventListener('resize', function () { if (state.view === 'viewer') sizeStage(); });
    window.addEventListener('popstate', function () { readHash(true); });
    window.addEventListener('hashchange', function () { readHash(true); });

    readHash(false);
    if (state.view !== 'viewer') writeHash(false);
  }

  init();
})();
