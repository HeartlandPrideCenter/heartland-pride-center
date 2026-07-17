window.HPC_DATA_URL = 'https://xrunawtqotumbsztboxo.supabase.co';
window.HPC_DATA_PUBLIC_TOKEN = 'sb_publishable_UyoqGKapp6Da2CNE4qqlZA_BodqSra8';

// Emergency public-intake catch net. If Supabase rejects a public application,
// preserve the completed payload locally and show a clear recovery path so the
// visitor can send the exact submission to HPC by email without retyping it.
if (!window.location.pathname.includes('staff') && !window.__HPC_INTAKE_FALLBACK_INSTALLED__) {
  window.__HPC_INTAKE_FALLBACK_INSTALLED__ = true;
  const nativeFetch = window.fetch.bind(window);

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function buildEmail(payload, backup) {
    const subject = `Website intake backup: ${payload.category || payload.type || 'Public inquiry'}`;
    const body = [
      'A website submission could not reach the HPC database. The completed information is preserved below.',
      '',
      `Page: ${window.location.href}`,
      `Captured: ${backup.captured_at}`,
      `Type: ${payload.type || ''}`,
      `Category: ${payload.category || ''}`,
      `Name / Organization: ${payload.organization_name || payload.contact_name || ''}`,
      `Contact Name: ${payload.contact_name || ''}`,
      `Email: ${payload.email || ''}`,
      `Phone: ${payload.phone || ''}`,
      `Website: ${payload.website || ''}`,
      `Address: ${payload.address || ''}`,
      `City: ${payload.city || ''}`,
      `County: ${payload.county || ''}`,
      '',
      'Message / Description:',
      payload.description || '',
      '',
      'Additional Notes:',
      payload.notes || ''
    ].join('\n');
    return {
      body,
      url: `mailto:info@heartlandpridecenter.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    };
  }

  function showRecoveryNotice(payload, backup) {
    document.getElementById('hpcIntakeRecovery')?.remove();
    const email = buildEmail(payload, backup);
    const overlay = document.createElement('div');
    overlay.id = 'hpcIntakeRecovery';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="hpc-intake-recovery-card">
        <p class="hpc-intake-recovery-eyebrow">Temporary Technical Difficulty</p>
        <h2>Your submission was not completed.</h2>
        <p>We are experiencing a temporary connection problem. Your information is still filled in and has been preserved on this device.</p>
        <p><strong>Please use the button below to send the completed submission directly to Heartland Pride Center.</strong> Your email app will open with everything already included. You only need to press Send.</p>
        <div class="hpc-intake-recovery-actions">
          <a class="hpc-intake-email-btn" href="${esc(email.url)}">Send My Submission by Email</a>
          <button type="button" class="hpc-intake-copy-btn">Copy My Submission</button>
          <button type="button" class="hpc-intake-close-btn">Return to Form</button>
        </div>
        <p class="hpc-intake-recovery-small">You may also email <strong>info@heartlandpridecenter.org</strong>. Please do not assume the form was received unless you send the email or later receive a success confirmation.</p>
      </div>`;
    const style = document.createElement('style');
    style.textContent = `
      #hpcIntakeRecovery{position:fixed;inset:0;z-index:99999;background:rgba(1,9,18,.82);display:grid;place-items:center;padding:20px;backdrop-filter:blur(8px)}
      .hpc-intake-recovery-card{width:min(680px,96vw);max-height:90vh;overflow:auto;border:2px solid #f0ce73;border-radius:26px;background:#071827;color:#f5f1e8;padding:28px;box-shadow:0 28px 90px rgba(0,0,0,.55);font-family:Inter,system-ui,sans-serif}
      .hpc-intake-recovery-card h2{margin:.25rem 0 1rem;font-size:clamp(1.7rem,4vw,2.5rem)}
      .hpc-intake-recovery-card p{line-height:1.65}.hpc-intake-recovery-eyebrow{color:#f0ce73;font-weight:900;letter-spacing:.12em;text-transform:uppercase;font-size:.76rem}
      .hpc-intake-recovery-actions{display:flex;gap:10px;flex-wrap:wrap;margin:22px 0}
      .hpc-intake-email-btn,.hpc-intake-copy-btn,.hpc-intake-close-btn{border-radius:999px;padding:13px 18px;font-weight:900;text-decoration:none;cursor:pointer;font:inherit}
      .hpc-intake-email-btn{background:linear-gradient(135deg,#d4af37,#f0ce73);color:#061323;border:0}
      .hpc-intake-copy-btn,.hpc-intake-close-btn{background:rgba(255,255,255,.07);color:#f5f1e8;border:1px solid rgba(245,241,232,.22)}
      .hpc-intake-recovery-small{font-size:.9rem;color:rgba(245,241,232,.75)}
    `;
    overlay.appendChild(style);
    document.body.appendChild(overlay);
    overlay.querySelector('.hpc-intake-copy-btn').addEventListener('click', async e => {
      try {
        await navigator.clipboard.writeText(email.body);
        e.currentTarget.textContent = 'Copied';
      } catch (_) {
        e.currentTarget.textContent = 'Unable to copy';
      }
    });
    overlay.querySelector('.hpc-intake-close-btn').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.hpc-intake-email-btn').focus();
  }

  window.fetch = async (...args) => {
    const response = await nativeFetch(...args);
    try {
      const requestUrl = String(args[0] || '');
      const options = args[1] || {};
      const isApplicationInsert = requestUrl.includes('/rest/v1/applications') && String(options.method || 'GET').toUpperCase() === 'POST';
      if (isApplicationInsert && !response.ok) {
        const payload = JSON.parse(options.body || '{}');
        const backup = {
          captured_at: new Date().toISOString(),
          page: window.location.href,
          response_status: response.status,
          payload
        };
        const saved = JSON.parse(localStorage.getItem('hpcFailedPublicIntakes') || '[]');
        saved.push(backup);
        localStorage.setItem('hpcFailedPublicIntakes', JSON.stringify(saved.slice(-25)));
        window.setTimeout(() => showRecoveryNotice(payload, backup), 75);
      }
    } catch (fallbackError) {
      console.error('HPC intake fallback error', fallbackError);
    }
    return response;
  };
}

if (window.location.pathname.includes('business-network')) {
  const cardsScript = document.createElement('script');
  cardsScript.src = 'land-of-hearts-cards-view.js?v=show-stage-20260707';
  cardsScript.defer = true;
  document.head.appendChild(cardsScript);
}

if (window.location.pathname.includes('staff')) {
  window.addEventListener('DOMContentLoaded', () => {
    const load = (src) => {
      const script = document.createElement('script');
      script.src = src;
      document.body.appendChild(script);
    };

    load('staff-business-operational.js?v=master-workspace-complete-20260710');
    load('staff-intake-health.js?v=daily-sentinel-20260715');
    load('staff-intake-department.js?v=intake-foundation-20260716');
    load('staff-intake-presentation.js?v=atlas-standard-20260716');
    load('staff-intake-data-bridge.js?v=authoritative-feed-racefix-20260716');
    load('staff-navigation-state.js?v=context-memory-20260716');
  }, { once: true });
}

// Production foundation: shared master identity records plus department-owned work records.
// Master Records workspace is integrated directly into the working program.