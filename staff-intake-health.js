(() => {
  const ready = fn => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const dashboard = document.getElementById('dashboard');
    const healthSection = document.getElementById('health');
    if (!dashboard) return;

    const style = document.createElement('style');
    style.textContent = `
      .intake-pulse{border:1px solid var(--line);border-radius:22px;background:rgba(255,255,255,.05);padding:20px;margin:0 0 18px}
      .intake-pulse.pass{border-color:rgba(59,217,139,.55);background:rgba(59,217,139,.08)}
      .intake-pulse.fail{border-color:rgba(255,122,130,.62);background:rgba(255,122,130,.085)}
      .intake-pulse.pending{border-color:rgba(240,206,115,.45);background:rgba(212,175,55,.07)}
      .intake-pulse-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}
      .intake-pulse h2{margin:.25rem 0 .45rem}.intake-pulse p{margin:.25rem 0;color:var(--muted);line-height:1.55}
      .intake-state{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:999px;padding:8px 12px;font-size:.68rem;font-weight:950;letter-spacing:.09em;text-transform:uppercase}
      .intake-pulse.pass .intake-state{color:#c8ffdf}.intake-pulse.fail .intake-state{color:#ffd1d4}.intake-pulse.pending .intake-state{color:#ffe7a6}
      .intake-form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:16px}
      .intake-form-card{border:1px solid var(--line);border-radius:16px;padding:14px;background:rgba(6,19,35,.44)}
      .intake-form-card strong{display:block;margin-bottom:6px}.intake-form-card small{display:block;color:var(--muted);line-height:1.45;overflow-wrap:anywhere}
      .intake-form-card.pass{border-color:rgba(59,217,139,.4)}.intake-form-card.fail{border-color:rgba(255,122,130,.45)}
      .intake-pulse-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
      @media(max-width:760px){.intake-form-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);

    const card = document.createElement('section');
    card.className = 'intake-pulse pending';
    card.id = 'intakePulse';
    dashboard.insertBefore(card, dashboard.firstChild);

    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const label = key => ({contact:'Contact Form',volunteer:'Volunteer Form',business:'Land of Hearts Application'}[key] || key);
    const formatTime = iso => {
      if (!iso) return 'No completed test yet';
      const date = new Date(iso);
      return date.toLocaleString([], { dateStyle:'medium', timeStyle:'short' });
    };

    function render(data) {
      const overall = ['pass','fail'].includes(data?.overall) ? data.overall : 'pending';
      const icon = overall === 'pass' ? '●' : overall === 'fail' ? '●' : '◌';
      const statusText = overall === 'pass' ? 'All Forms Passing' : overall === 'fail' ? 'Intake Failure Detected' : 'Awaiting Test';
      const forms = data?.forms || {};
      card.className = `intake-pulse ${overall}`;
      card.innerHTML = `
        <div class="intake-pulse-head">
          <div><span class="eyebrow">Daily Production Sentinel</span><h2>Public Intake Health</h2><p>Last test: <strong>${esc(formatTime(data?.ran_at_utc))}</strong></p></div>
          <span class="intake-state">${icon} ${esc(statusText)}</span>
        </div>
        <div class="intake-form-grid">
          ${['contact','volunteer','business'].map(key => {
            const item = forms[key] || {status:'pending',http_code:0,message:'Awaiting test.'};
            return `<div class="intake-form-card ${esc(item.status)}"><strong>${esc(label(key))}</strong><small>Status: ${esc(String(item.status || 'pending').toUpperCase())}${item.http_code ? ` · HTTP ${esc(item.http_code)}` : ''}</small><small>${esc(item.message || '')}</small></div>`;
          }).join('')}
        </div>
        <div class="intake-pulse-actions">
          <a class="btn" href="${esc(data?.run_url || 'https://github.com/HeartlandPrideCenter/heartland-pride-center/actions/workflows/form-intake-health-check.yml')}" target="_blank" rel="noopener">Open Test Run</a>
          <button class="btn" type="button" id="refreshIntakePulse">Refresh Status</button>
        </div>`;
      document.getElementById('refreshIntakePulse')?.addEventListener('click', load);

      if (healthSection) {
        let mirror = document.getElementById('intakePulseHealthMirror');
        if (!mirror) {
          mirror = card.cloneNode(true);
          mirror.id = 'intakePulseHealthMirror';
          const target = healthSection.querySelector('.card') || healthSection;
          target.prepend(mirror);
        } else {
          mirror.className = card.className;
          mirror.innerHTML = card.innerHTML;
        }
      }
    }

    async function load() {
      try {
        const response = await fetch(`health/intake-status.json?v=${Date.now()}`, { cache:'no-store' });
        if (!response.ok) throw new Error(`Status file returned ${response.status}`);
        render(await response.json());
      } catch (error) {
        render({ overall:'pending', ran_at_utc:null, forms:{
          contact:{status:'pending',message:'Unable to load health status.'},
          volunteer:{status:'pending',message:'Unable to load health status.'},
          business:{status:'pending',message:'Unable to load health status.'}
        }});
        console.error('Unable to load intake health status', error);
      }
    }

    load();
  });
})();
