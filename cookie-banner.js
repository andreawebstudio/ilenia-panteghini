/*
  Banner cookie — conforme alle Linee guida del Garante Privacy (provv. 10 giugno 2021)
  - Pulsanti "Accetta" e "Rifiuta" con lo stesso peso visivo
  - La "X" di chiusura equivale a "Rifiuta" (nessun cookie non tecnico)
  - La scelta viene ricordata per 6 mesi, poi il banner viene riproposto
  - Il link "Preferenze cookie" (attributo data-cookie-prefs) riapre il banner

  Per aggiungere in futuro strumenti NON tecnici (es. statistiche, pixel, video incorporati),
  inserire lo script così, e verrà attivato SOLO dopo il consenso:
    <script type="text/plain" data-consent="accepted" src="https://..."></script>
*/
(function () {
  var KEY = 'ip_cookie_consent';
  var MAX_AGE = 1000 * 60 * 60 * 24 * 182; // circa 6 mesi
  var d = document;

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (v && v.choice && Date.now() - v.date < MAX_AGE) return v.choice;
    } catch (e) {}
    return null;
  }
  function save(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, date: Date.now() })); } catch (e) {}
  }

  function activate() {
    [].forEach.call(d.querySelectorAll('script[type="text/plain"][data-consent="accepted"]'), function (old) {
      var s = d.createElement('script');
      for (var i = 0; i < old.attributes.length; i++) {
        var a = old.attributes[i];
        if (a.name !== 'type' && a.name !== 'data-consent') s.setAttribute(a.name, a.value);
      }
      s.text = old.text;
      old.parentNode.replaceChild(s, old);
    });
  }

  var css =
    '.cb{position:fixed;left:16px;right:16px;bottom:16px;z-index:200;max-width:560px;margin:0 auto;' +
    'background:#fff;color:#263C3D;border:1px solid rgba(18,106,112,.16);border-radius:18px;' +
    'box-shadow:0 20px 50px -20px rgba(38,60,61,.45);padding:1.4rem 1.4rem 1.25rem;font-family:Montserrat,system-ui,sans-serif;' +
    'font-size:.86rem;line-height:1.6;opacity:0;transform:translateY(12px);transition:opacity .35s,transform .35s}' +
    '.cb.show{opacity:1;transform:none}' +
    '.cb h2{font-family:"Cormorant Garamond",Georgia,serif;font-size:1.45rem;font-weight:600;color:#126A70;margin:0 2rem .5rem 0;line-height:1.2}' +
    '.cb p{margin:0 0 1rem}' +
    '.cb a{color:#126A70;font-weight:500}' +
    '.cb-x{position:absolute;top:.7rem;right:.7rem;width:40px;height:40px;border:0;background:none;cursor:pointer;border-radius:50%;color:#263C3D;font-size:1.5rem;line-height:1}' +
    '.cb-x:hover{background:#F4DDE3}' +
    '.cb-row{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}' +
    '.cb-btn{min-height:46px;border-radius:10px;font:600 .74rem/1 Montserrat,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;' +
    'border:1.5px solid #126A70;background:#fff;color:#126A70}' +
    '.cb-btn.ok{background:#126A70;color:#fff}' +
    '.cb-btn:hover{filter:brightness(1.08)}' +
    '.cb :focus-visible{outline:2px solid #126A70;outline-offset:3px}' +
    '@media (prefers-reduced-motion:reduce){.cb{transition:none}}';

  var box;
  function show() {
    if (box) { box.querySelector('.cb-btn').focus(); return; }
    if (!d.getElementById('cb-style')) {
      var st = d.createElement('style'); st.id = 'cb-style'; st.textContent = css; d.head.appendChild(st);
    }
    box = d.createElement('div');
    box.className = 'cb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-labelledby', 'cb-title');
    box.setAttribute('aria-describedby', 'cb-desc');
    box.innerHTML =
      '<button class="cb-x" type="button" aria-label="Chiudi e rifiuta i cookie non necessari">&times;</button>' +
      '<h2 id="cb-title">Rispetto la tua privacy</h2>' +
      '<p id="cb-desc">Questo sito usa solo cookie e strumenti tecnici necessari al suo funzionamento. ' +
      'Con il tuo consenso potrei usare anche strumenti di terze parti (ad esempio statistiche o contenuti incorporati). ' +
      'Puoi accettare, rifiutare o chiudere il banner: chiudendolo rifiuti. Puoi cambiare idea in ogni momento dal link ' +
      '"Preferenze cookie" in fondo alla pagina. Leggi la <a href="cookie-policy.html">Cookie Policy</a>.</p>' +
      '<div class="cb-row">' +
      '<button class="cb-btn" type="button" data-c="rejected">Rifiuta</button>' +
      '<button class="cb-btn ok" type="button" data-c="accepted">Accetta</button>' +
      '</div>';
    d.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('show'); });
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      choose(b.classList.contains('cb-x') ? 'rejected' : b.getAttribute('data-c'));
    });
  }
  function hide() {
    if (!box) return;
    var b = box; box = null;
    b.classList.remove('show');
    setTimeout(function () { b.remove(); }, 350);
  }
  function choose(c) {
    var before = read();
    save(c);
    hide();
    if (c === 'accepted') activate();
    else if (before === 'accepted') location.reload(); // revoca: ricarica senza gli strumenti attivati
  }

  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-cookie-prefs]');
    if (a) { e.preventDefault(); show(); }
  });

  var c = read();
  if (c === 'accepted') activate();
  else if (!c) show();
})();
