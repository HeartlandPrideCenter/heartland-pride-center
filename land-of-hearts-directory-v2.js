(() => {
  const badgeIcon = {
    lgbtq_owned: '🏳️‍🌈 LGBTQ+ Owned',
    proud_ally: '🤝 Proud Ally',
    accessible: '♿ Accessible',
    'LGBTQ+ Owned or Operated': '🏳️‍🌈 LGBTQ+ Owned',
    'Proud Ally': '🤝 Proud Ally',
    'Accessible': '♿ Accessible'
  };
  const recognitionIcon = {
    founding_member: '❤️ Founding Member',
    verified: '⭐ Heartland Verified',
    heart_of_community: '💖 Heart of the Community'
  };
  const sponsorIcon = { bronze: '🥉 Bronze Sponsor', silver: '🥈 Silver Sponsor', gold: '🥇 Gold Sponsor', platinum: '💎 Platinum Sponsor' };

  function esc(v) { return String(v || '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
  function normalizeWebsite(url) { return !url ? '' : (/^https?:\/\//i.test(url) ? url : 'https://' + url); }
  function iconLine(list, map) { return (Array.isArray(list) ? list : []).map(k => `<span>${esc(map[k] || k)}</span>`).join(''); }
  function splitNotes(notes) { if (!notes) return []; return String(notes).split(/\n|,|\|/).map(x => x.trim()).filter(Boolean).filter(x => !/^private notes/i.test(x) && !/^preferred contact/i.test(x) && !/^consent/i.test(x)).slice(0,4); }
  function commitment(b) { return b.heart_rating || b.commitment_level || 'Member Heart'; }
  function directionsUrl(b) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([b.address,b.city,'Florida'].filter(Boolean).join(', ')); }

  function ensureShell() {
    let shell = document.getElementById('lohDetailShell');
    if (shell) return shell;
    shell = document.createElement('div');
    shell.id = 'lohDetailShell';
    shell.className = 'loh-detail-shell';
    shell.innerHTML = '<aside class="loh-detail-panel" role="dialog" aria-modal="true" aria-label="Business profile"><button class="loh-detail-close" type="button" aria-label="Close profile">×</button><div id="lohDetailContent"></div></aside>';
    document.body.appendChild(shell);
    shell.querySelector('.loh-detail-close').onclick = () => shell.classList.remove('open');
    shell.addEventListener('click', e => { if (e.target === shell) shell.classList.remove('open'); });
    const style = document.createElement('style');
    style.textContent = `.business-directory{display:grid;gap:10px}.loh-row{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;border:1px solid rgba(245,241,232,.12);background:rgba(255,255,255,.045);border-radius:18px;padding:14px 16px;cursor:pointer;transition:.18s ease}.loh-row:hover,.loh-row.active{border-color:rgba(239,205,114,.48);background:rgba(212,175,55,.09);transform:translateY(-1px)}.loh-row-heart{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#f7d66b,#d4af37);box-shadow:0 12px 24px rgba(0,0,0,.18);color:#071827;font-weight:950;font-size:1.4rem}.loh-row strong{display:block;color:#fff}.loh-row small{display:block;color:rgba(245,241,232,.68);margin-top:3px}.loh-row p{margin:8px 0 0;color:rgba(245,241,232,.62);line-height:1.45;font-size:.92rem}.loh-row-icons{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.loh-row-icons span{border:1px solid rgba(239,205,114,.22);border-radius:999px;background:rgba(212,175,55,.08);padding:5px 8px;font-size:.82rem}.loh-row-actions{display:flex;gap:8px}.loh-mini-btn{border:1px solid rgba(239,205,114,.24);border-radius:999px;background:rgba(212,175,55,.08);color:#f5f1e8;padding:8px 12px;font-weight:900}.loh-detail-shell{position:fixed;inset:0;z-index:9998;display:none;align-items:stretch;justify-content:flex-end;background:rgba(3,10,19,.68);backdrop-filter:blur(8px);padding:18px}.loh-detail-shell.open{display:flex}.loh-detail-panel{position:relative;width:min(760px,96vw);max-height:calc(100vh - 36px);overflow:auto;border:1px solid rgba(239,205,114,.28);border-radius:32px;background:#081523;color:#f5f1e8;box-shadow:0 30px 100px rgba(0,0,0,.5);padding:0}.loh-detail-close{position:absolute;right:18px;top:14px;z-index:3;width:42px;height:42px;border-radius:999px;border:1px solid rgba(245,241,232,.16);background:rgba(5,18,32,.72);color:#fff;font-size:25px}.loh-cover{position:relative;min-height:190px;background:radial-gradient(circle at 25% 18%,rgba(239,205,114,.24),transparent 9rem),radial-gradient(circle at 80% 70%,rgba(118,88,255,.18),transparent 12rem),linear-gradient(145deg,rgba(212,175,55,.1),rgba(255,255,255,.04));border-bottom:1px solid rgba(239,205,114,.18);display:flex;align-items:flex-end;padding:26px}.loh-logo-bubble{display:grid;place-items:center;width:72px;height:72px;border-radius:24px;background:linear-gradient(135deg,#f7d66b,#d4af37);color:#071827;font-size:2rem;font-weight:950;box-shadow:0 18px 45px rgba(0,0,0,.24)}.loh-profile-body{padding:28px}.loh-detail-header{padding-right:42px}.loh-detail-header h2{margin:8px 0;font-family:Cinzel,serif;font-size:clamp(2rem,5vw,3.4rem);line-height:1}.loh-pill-line{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.loh-pill-line span{border:1px solid rgba(239,205,114,.22);border-radius:999px;background:rgba(212,175,55,.08);padding:8px 11px}.loh-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}.loh-profile-grid div{border:1px solid rgba(245,241,232,.12);border-radius:18px;padding:14px;background:rgba(255,255,255,.045)}.loh-profile-grid small{display:block;color:#f0ce73;font-weight:900;text-transform:uppercase;letter-spacing:.1em;font-size:.68rem;margin-bottom:6px}.loh-detail-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.loh-detail-actions a{border:1px solid rgba(239,205,114,.24);border-radius:999px;background:rgba(212,175,55,.08);color:#f5f1e8;padding:10px 14px;font-weight:900;text-decoration:none}.loh-member-seal{margin-top:18px;border:1px solid rgba(239,205,114,.28);border-radius:22px;background:rgba(212,175,55,.08);padding:16px;color:rgba(245,241,232,.78);line-height:1.55}.loh-member-seal strong{display:block;color:#f0ce73;margin-bottom:5px}@media(max-width:720px){.loh-detail-shell{padding:8px;align-items:flex-end}.loh-detail-panel{width:100%;max-height:92vh;border-radius:28px 28px 0 0}.loh-row{grid-template-columns:auto 1fr}.loh-row-actions{grid-column:1/-1}.loh-profile-body{padding:22px 18px}.loh-profile-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(style);
    return shell;
  }

  function openDetail(b) {
    const shell = ensureShell();
    const website = b.website ? `<a href="${esc(normalizeWebsite(b.website))}" target="_blank" rel="noopener">Website</a>` : '';
    const directions = b.address || b.city ? `<a href="${directionsUrl(b)}" target="_blank" rel="noopener">Directions</a>` : '';
    const phone = b.phone ? `<a href="tel:${esc(b.phone)}">Call</a>` : '';
    const email = b.email ? `<a href="mailto:${esc(b.email)}">Email</a>` : '';
    const notes = splitNotes(b.internal_notes || b.notes).map(n => `<span>${esc(n)}</span>`).join('');
    const socials = [b.facebook, b.instagram, b.linkedin].filter(Boolean).map(s => `<a href="${esc(normalizeWebsite(s))}" target="_blank" rel="noopener">Social</a>`).join('');
    const hours = b.hours || b.business_hours || 'Hours available from the business.';
    const services = b.services || b.service_area || 'Services and offerings may vary. Contact the business for current details.';
    const accessible = Array.isArray(b.badges) && (b.badges.includes('Accessible') || b.badges.includes('accessible')) ? 'Accessibility information provided by the business.' : 'Accessibility details may be added after review.';
    lohDetailContent.innerHTML = `<div class="loh-cover"><div class="loh-logo-bubble">♥</div></div><div class="loh-profile-body"><div class="loh-detail-header"><span class="eyebrow">Land of Hearts Profile</span><h2>❤️ ${esc(b.name)}</h2><p>${esc([b.category, b.city, commitment(b)].filter(Boolean).join(' · '))}</p></div><div class="loh-pill-line"><span>❤️ ${esc(commitment(b))}</span>${iconLine(b.badges,badgeIcon)}${iconLine(b.recognition_badges,recognitionIcon)}${b.sponsor_level ? `<span>${esc(sponsorIcon[b.sponsor_level] || b.sponsor_level)}</span>` : ''}${notes}</div><p>${esc(b.public_description || b.description || 'Affirming business listing.')}</p><div class="loh-profile-grid"><div><small>Location</small>${esc([b.address,b.city,b.county ? b.county + ' County' : ''].filter(Boolean).join(' · ') || 'Location available soon')}</div><div><small>Services</small>${esc(services)}</div><div><small>Hours</small>${esc(hours)}</div><div><small>Accessibility</small>${esc(accessible)}</div></div><div class="loh-detail-actions">${website}${directions}${phone}${email}${socials}</div><div class="loh-member-seal"><strong>Proud Member of the Heartland Pride Center Affirming Business Network</strong>This listing has been reviewed for publication by Heartland Pride Center. Community reviews are not used here; recognition is based on participation, verification, and relationship with the network.</div></div>`;
    shell.classList.add('open');
  }

  window.HPC_LAND_OF_HEARTS_DIRECTORY_V2 = {
    render(container, list, onSelect) {
      ensureShell();
      container.innerHTML = (list || []).length ? list.map((b, index) => {
        const badges = iconLine(b.badges, badgeIcon) || '<span>❤️ Member</span>';
        const detail = [b.category || 'Business', b.city || 'Heartland', commitment(b)].join(' · ');
        const description = esc(b.public_description || b.description || '').slice(0, 170);
        return `<article class="loh-row" data-index="${index}"><div class="loh-row-heart">♥</div><div><strong>${esc(b.name)}</strong><small>${esc(detail)}</small>${description ? `<p>${description}${description.length >= 170 ? '…' : ''}</p>` : ''}<div class="loh-row-icons">${badges}</div></div><div class="loh-row-actions"><button class="loh-mini-btn" type="button" data-action="view">View Profile</button></div></article>`;
      }).join('') : '<div class="directory-note"><strong>No published businesses yet.</strong><p>Approved businesses will appear here after Backstage review.</p></div>';
      container.querySelectorAll('.loh-row').forEach(row => {
        row.addEventListener('click', () => {
          container.querySelectorAll('.loh-row').forEach(r => r.classList.remove('active'));
          row.classList.add('active');
          const b = list[Number(row.dataset.index)];
          if (onSelect) onSelect(b, Number(row.dataset.index));
          openDetail(b);
        });
      });
    },
    open: openDetail,
    openProfile: openDetail
  };
})();
