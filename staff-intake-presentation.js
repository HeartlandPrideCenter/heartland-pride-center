(() => {
  const ready = fn => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const $ = id => document.getElementById(id);
    const style = document.createElement('style');
    style.textContent = `
      body.intake-mode .hero{padding:9px 15px;margin-bottom:8px;align-items:center}
      body.intake-mode .hero .eyebrow{display:none}
      body.intake-mode .hero h1{font-size:1.7rem;margin:0}
      body.intake-mode .hero p{font-size:.82rem;margin:.18rem 0 0}
      body.intake-mode #manualTop{display:none!important}
      body.intake-mode #searchPanel{display:none!important}

      body.intake-mode #intake{margin:0}
      body.intake-mode .intake-shell{gap:8px}
      body.intake-mode .intake-top{padding:12px;border-radius:18px}
      body.intake-mode .intake-tabs{gap:6px}
      body.intake-mode .intake-tab{min-width:0;padding:0 13px;min-height:34px}
      body.intake-mode .intake-tab span:last-child{padding:2px 7px}
      body.intake-mode .intake-actions{margin-top:9px;padding-top:9px;border-top:1px solid var(--line)}
      body.intake-mode .intake-actions strong{font-size:1rem}
      body.intake-mode .intake-actions small{font-size:.78rem}
      body.intake-mode .process-next{min-width:165px;min-height:36px}
      body.intake-mode #toggleIntakeSearch{min-height:36px;padding:0 12px}
      body.intake-mode .intake-search-wrap{margin-top:8px}
      body.intake-mode .intake-search-wrap input{min-height:36px;border-radius:9px}
      body.intake-mode .intake-list{border-radius:14px}
      body.intake-mode .intake-head,
      body.intake-mode .intake-row{padding:8px 11px}
      body.intake-mode .queue-empty{padding:30px 18px}

      body.intake-mode .modal-head{position:relative;padding:8px 13px!important}
      body.intake-mode .modal-head h2{font-size:1.22rem;margin:.1rem 0}
      body.intake-mode .modal-head p{position:absolute;right:52px;top:11px;margin:0;font-size:.75rem;color:var(--gold2);font-weight:850}
      body.intake-mode .modal-body{padding:10px 18px 20px!important}
      body.intake-mode .workspace-tabs{position:sticky;top:0;z-index:8;margin:-10px -18px 12px;padding:9px 18px;background:#071827;border-bottom:1px solid var(--line)}
      body.intake-mode .workspace-tabs .btn{padding:8px 13px;min-height:34px}
      body.intake-mode .intake-bottom-actions{position:sticky;bottom:-20px;background:#071827;padding:12px 0 2px;margin-top:14px}

      @media(max-width:850px){
        body.intake-mode .intake-actions{align-items:stretch}
        body.intake-mode .intake-actions>div:last-child{width:100%}
        body.intake-mode #toggleIntakeSearch,
        body.intake-mode .process-next{flex:1;min-width:0}
        body.intake-mode .modal-head p{position:static}
      }
    `;
    document.head.appendChild(style);

    function isIntakeActive() {
      return document.querySelector('.nav [data-view="intake"]')?.classList.contains('active') ||
        $('intake')?.classList.contains('active');
    }

    function applyMode() {
      document.body.classList.toggle('intake-mode', Boolean(isIntakeActive()));
    }

    document.addEventListener('click', event => {
      if (event.target.closest('.nav [data-view]')) setTimeout(applyMode, 0);
    });

    const observer = new MutationObserver(applyMode);
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    applyMode();
  });
})();
