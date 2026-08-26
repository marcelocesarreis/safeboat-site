/* ═══════════ SAFEBOAT · i18n ═══════════
   Tradução em runtime sem duplicar páginas: um dicionário por idioma
   (i18n/<lang>.js) mapeia o texto em português → tradução. O tradutor
   percorre os nós de texto e os atributos visíveis; um MutationObserver
   cobre o conteúdo montado por JavaScript (checkout, resumo, fechamento).

   Idiomas: pt (padrão, sem dicionário) · en · es · it · de · zh.
   Escolha persistida em localStorage (sb-lang); ?lang= tem prioridade.
   Chaves especiais no dicionário: "@…" = atributos (placeholder, title,
   aria-label, alt) · "#…" = <title> da aba. */
(function () {
  'use strict';

  var IDIOMAS = { pt: 'PT', en: 'EN', es: 'ES', it: 'IT', de: 'DE', zh: '中文' };
  var HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es', it: 'it', de: 'de', zh: 'zh-CN' };

  var param = new URLSearchParams(location.search).get('lang');
  if (param && IDIOMAS[param]) {
    try { localStorage.setItem('sb-lang', param); } catch (e) {}
  }
  var lang = 'pt';
  try { lang = localStorage.getItem('sb-lang') || 'pt'; } catch (e) {}
  if (!IDIOMAS[lang]) lang = 'pt';

  var dict = null;

  function traduzTexto(t) {
    if (!dict) return null;
    var chave = t.trim();
    if (!chave) return null;
    var v = dict[chave];
    if (v === undefined) return null;
    // preserva espaços ao redor do texto original
    var ini = t.match(/^\s*/)[0];
    var fim = t.match(/\s*$/)[0];
    return ini + v + fim;
  }

  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

  function traduzNo(no) {
    if (no.nodeType === 3) {
      var novo = traduzTexto(no.textContent);
      if (novo !== null && novo !== no.textContent) no.textContent = novo;
      return;
    }
    if (no.nodeType !== 1) return;
    var tag = no.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return;
    for (var i = 0; i < ATTRS.length; i++) {
      var v = no.getAttribute && no.getAttribute(ATTRS[i]);
      if (v && dict) {
        var tr = dict['@' + v.trim()];
        if (tr !== undefined) no.setAttribute(ATTRS[i], tr);
      }
    }
    for (var f = no.firstChild; f; f = f.nextSibling) traduzNo(f);
  }

  function traduzTudo() {
    if (!dict) return;
    traduzNo(document.body);
    var t = dict['#' + document.title.trim()];
    if (t !== undefined) document.title = t;
    var d = document.querySelector('meta[name="description"]');
    if (d) {
      var dv = dict['@' + (d.getAttribute('content') || '').trim()];
      if (dv !== undefined) d.setAttribute('content', dv);
    }
  }

  /* conteúdo montado por JS (checkout, resumo, fechamento) */
  var pendentes = [];
  var agendado = false;
  function observa() {
    new MutationObserver(function (ms) {
      if (!dict) return;
      for (var i = 0; i < ms.length; i++) {
        var ad = ms[i].addedNodes;
        for (var j = 0; j < ad.length; j++) pendentes.push(ad[j]);
      }
      if (pendentes.length && !agendado) {
        agendado = true;
        setTimeout(function () {
          agendado = false;
          var lote = pendentes.splice(0);
          for (var k = 0; k < lote.length; k++) {
            if (lote[k].isConnected) traduzNo(lote[k]);
          }
        }, 60);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* seletor de idioma no cabeçalho */
  function poeSeletor() {
    var acoes = document.querySelector('.barra-acoes');
    if (!acoes || document.getElementById('sbLang')) return;
    var sel = document.createElement('select');
    sel.id = 'sbLang';
    sel.setAttribute('aria-label', 'Idioma / Language');
    for (var k in IDIOMAS) {
      var o = document.createElement('option');
      o.value = k;
      o.textContent = IDIOMAS[k];
      if (k === lang) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener('change', function () {
      try { localStorage.setItem('sb-lang', sel.value); } catch (e) {}
      var u = new URL(location.href);
      u.searchParams.delete('lang');
      location.href = u.toString();
    });
    var css = document.createElement('style');
    css.textContent =
      '#sbLang{appearance:none;-webkit-appearance:none;background:transparent;color:rgba(255,255,255,.85);' +
      'border:1px solid rgba(255,255,255,.35);border-radius:99px;padding:8px 26px 7px 12px;font-family:inherit;' +
      'font-size:.72rem;letter-spacing:.08em;cursor:pointer;background-image:url("data:image/svg+xml,' +
      encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="5"><path d="M0 0l4 5 4-5z" fill="rgba(255,255,255,.6)"/></svg>') +
      '");background-repeat:no-repeat;background-position:right 10px center}' +
      '#sbLang:focus{outline:none;border-color:rgba(255,255,255,.7)}' +
      '#sbLang option{color:#23304A;background:#fff}' +
      '@media (max-width:760px){#sbLang{padding:7px 22px 6px 9px;font-size:.68rem}}';
    document.head.appendChild(css);
    acoes.insertBefore(sel, acoes.firstChild);
  }

  function pronto(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  pronto(function () {
    poeSeletor();
    if (lang === 'pt') return;
    document.documentElement.lang = HTML_LANG[lang];
    var s = document.createElement('script');
    s.src = 'i18n/' + lang + '.js';
    s.onload = function () {
      dict = window.SB_DICT || null;
      traduzTudo();
      observa();
    };
    document.head.appendChild(s);
  });
})();
