(() => {
  const badgeIcon = {
    lgbtq_owned: { icon:'🏳️‍🌈', label:'LGBTQ+ Owned', className:'rainbow' },
    proud_ally: { icon:'🤝', label:'Proud Ally', className:'ally' },
    accessible: { icon:'♿', label:'Accessible', className:'access' },
    'LGBTQ+ Owned or Operated': { icon:'🏳️‍🌈', label:'LGBTQ+ Owned', className:'rainbow' },
    'Proud Ally': { icon:'🤝', label:'Proud Ally', className:'ally' },
    'Accessible': { icon:'♿', label:'Accessible', className:'access' },
    LGBTQ_Owned: { icon:'🏳️‍🌈', label:'LGBTQ+ Owned', className:'rainbow' },
    Proud_Ally: { icon:'🤝', label:'Proud Ally', className:'ally' },
    Accessibility: { icon:'♿', label:'Accessible', className:'access' }
  };
  const recognitionIcon = {
    founding_member: { icon:'❤️', label:'Founding Member', className:'heart' },
    verified: { icon:'⭐', label:'Heartland Verified', className:'verified' },
    heart_of_community: { icon:'💖', label:'Heart of the Community', className:'heart' },
    Founding: { icon:'❤️', label:'Founding Member', className:'heart' },
    Verified: { icon:'⭐', label:'Heartland Verified', className:'verified' }
  };
  const sponsorIcon = {
    bronze: { icon:'🥉', label:'Bronze Sponsor', className:'sponsor' },
    silver: { icon:'🥈', label:'Silver Sponsor', className:'sponsor' },
    gold: { icon:'🥇', label:'Gold Sponsor', className:'sponsor' },
    platinum: { icon:'💎', label:'Platinum Sponsor', className:'sponsor' }
  };

  function esc(v) { return String(v || '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c])); }
  function normalizeWebsite(url) { return !url ? '' : (/^https?:\/\//i.test(url) ? url : 'https://' + url); }
  function toList(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean).map(v => String(v).trim()).filter(Boolean);
    if (typeof value === 'object') return Object.entries(value).filter(([, v]) => Boolean(v)).map(([k]) => k);
    const raw = String(value).trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(v => String(v).trim()).filter(Boolean);
      if (parsed && typeof parsed === 'object') return Object.entries(parsed).filter(([, v]) => Boolean(v)).map(([k]) => k);
    } catch (e) {}
    return raw.split(/\n|,|\||;/).map(x => x.trim()).filter(Boolean);
  }
  function badgeData(key, map) {
    if (!key) return null;
    const value = map[key] || { icon:'❤️', label:key, className:'heart' };
    return typeof value === 'string' ? { icon:'❤️', label:value, className:'heart' } : value;
  }
  function visualBadges(items) {
    return items.length ? items.map(item => `<span class="loh-visual-badge ${esc(item.className)}"><i>${esc(item.icon)}</i><b>${esc(item.label)}</b></span>`).join('') : '<span class="loh-visual-badge heart"><i>❤️</i><b>Member</b></span>';
  }
  function businessBadges(b) {
    const badges = toList(b.badges).map(k => badgeData(k, badgeIcon)).filter(Boolean);
    const recognition = toList(b.recognition_badges).map(k => badgeData(k, recognitionIcon)).filter(Boolean);
    const sponsor = b.sponsor_level ? [badgeData(b.sponsor_level, sponsorIcon)] : [];
    return [{ icon:'❤️', label:b.heart_rating || b.commitment_level || 'Community Heart', className:'heart' }, ...badges, ...recognition, ...sponsor.filter(Boolean)];
  }
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
    style.textContent = `.business-directory{display:grid;gap:10px}.loh-row{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;border:1px solid rgba(245,241,232,.12);background:rgba(255,255,255,.045);border-radius:18px;padding:14px 16px;cursor:pointer;transition:.18s ease}.loh-row:hover,.loh-row.active{border-color:rgba(239,205,114,.48);background:rgba(212,175,55,.09);transform:translateY(-1px)}.loh-row-heart{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#f7d66b,#d4af37);box-shadow:0 12px 24px rgba(0,0,0,.18);color:#071827;font-weight:950;font-size:1.4rem}.loh-row strong{display:block;color:#fff}.loh-row small{display:block;color:rgba(245,241,232,.68);margin-top:3px}.loh-row p{margin:8px 0 0;color:rgba(245,241,232,.62);line-height:1.45;font-size:.92rem}.loh-row-icons{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.loh-row-actions{display:flex;gap:8px}.loh-mini-btn{border:1px solid rgba(239,205,114,.24);border-radius:999px;background:rgba(212,175,55,.08);color:#f5f1e8;padding:8px 12px;font-weight:900}.loh-detail-shell{position:fixed;inset:0;z-index:9998;display:none;align-items:center;justify-content:center;background:rgba(3,10,19,.68);backdrop-filter:blur(8px);padding:18px}.loh-detail-shell.open{display:flex}.loh-detail-panel{position:relative;width:min(680px,94vw);max-height:88vh;overflow:auto;border:1px solid rgba(239,205,114,.28);border-radius:28px;background:#081523;color:#f5f1e8;box-shadow:0 30px 100px rgba(0,0,0,.5);padding:0}.loh-detail-close{position:absolute;right:14px;top:14px;z-index:3;width:38px;height:38px;border-radius:999px;border:1px solid rgba(245,241,232,.16);background:rgba(5,18,32,.72);color:#fff;font-size:23px}.loh-profile-head{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;padding:24px 64px 18px 24px;border-bottom:1px solid rgba(239,205,114,.18);background:radial-gradient(circle at 25% 5%,rgba(239,205,114,.18),transparent 12rem),linear-gradient(145deg,rgba(212,175,55,.08),rgba(255,255,255,.035))}.loh-logo-bubble{display:grid;place-items:center;width:68px;height:68px;border-radius:22px;background:linear-gradient(135deg,#f7d66b,#d4af37);color:#071827;font-size:2rem;font-weight:950;box-shadow:0 18px 45px rgba(0,0,0,.24)}.loh-detail-header h2{margin:5px 0 5px;font-family:Cinzel,serif;font-size:clamp(1.85rem,4vw,2.65rem);line-height:.96}.loh-detail-header p{margin:0;color:rgba(245,241,232,.72);font-weight:800}.loh-profile-body{padding:22px 24px 24px}.loh-visual-badges{display:flex;gap:9px;flex-wrap:wrap;margin:0 0 18px}.loh-visual-badge{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:8px 11px;border:1px solid rgba(239,205,114,.25);box-shadow:inset 0 1px 0 rgba(255,255,255,.1);font-size:.86rem}.loh-visual-badge i{font-style:normal;display:grid;place-items:center;width:24px;height:24px;border-radius:999px;background:rgba(255,255,255,.12)}.loh-visual-badge b{font-weight:950}.loh-visual-badge.heart{background:linear-gradient(135deg,rgba(212,175,55,.18),rgba(255,255,255,.055));color:#f5f1e8}.loh-visual-badge.rainbow{background:linear-gradient(135deg,rgba(255,56,96,.16),rgba(255,211,67,.12),rgba(45,212,191,.12),rgba(147,112,219,.15));border-color:rgba(245,241,232,.24)}.loh-visual-badge.ally{background:linear-gradient(135deg,rgba(45,212,191,.14),rgba(212,175,55,.08));border-color:rgba(45,212,191,.3)}.loh-visual-badge.access{background:linear-gradient(135deg,rgba(96,165,250,.16),rgba(255,255,255,.055));border-color:rgba(96,165,250,.35)}.loh-visual-badge.verified{background:linear-gradient(135deg,rgba(255,255,255,.11),rgba(212,175,55,.13));border-color:rgba(255,255,255,.22)}.loh-visual-badge.sponsor{background:linear-gradient(135deg,rgba(212,175,55,.22),rgba(255,255,255,.055));border-color:rgba(239,205,114,.42)}.loh-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}.loh-profile-grid div{border:1px solid rgba(245,241,232,.12);border-radius:18px;padding:14px;background:rgba(255,255,255,.045)}.loh-profile-grid small{display:block;color:#f0ce73;font-weight:900;text-transform:uppercase;letter-spacing:.1em;font-size:.68rem;margin-bottom:6px}.loh-detail-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.loh-detail-actions a{border:1px solid rgba(239,205,114,.24);border-radius:999px;background:rgba(212,175,55,.08);color:#f5f1e8;padding:10px 14px;font-weight:900;text-decoration:none}.loh-member-seal{margin-top:18px;border:1px solid rgba(239,205,114,.28);border-radius:20px;background:rgba(212,175,55,.08);padding:14px;color:rgba(245,241,232,.78);line-height:1.5}.loh-member-seal strong{display:block;color:#f0ce73;margin-bottom:5px}@media(max-width:720px){.loh-detail-shell{padding:8px;align-items:flex-end}.loh-detail-panel{width:100%;max-height:92vh;border-radius:28px 28px 0 0}.loh-profile-head{padding:22px 54px 16px 18px;grid-template-columns:auto 1fr}.loh-logo-bubble{width:56px;height:56px;border-radius:18px}.loh-row{grid-template-columns:auto 1fr}.loh-row-actions{grid-column:1/-1}.loh-profile-body{padding:20px 18px}.loh-profile-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(style);
    return shell;
  }

  function openDetail(b) {
    const shell = ensureShell();
    const website = b.website ? `<a href="${esc(normalizeWebsite(b.website))}" target="_blank" rel="noopener">Website</a>` : '';
    const directions = b.address || b.city ? `<a href="${directionsUrl(b)}" target="_blank" rel="noopener">Directions</a>` : '';
    const phone = b.phone ? `<a href="tel:${esc(b.phone)}">Call</a>` : '';
    const email = b.email ? `<a href="mailto:${esc(b.email)}">Email</a>` : '';
    const notes = splitNotes(b.internal_notes || b.notes).map(n => `<span class="loh-visual-badge heart"><i>📝</i><b>${esc(n)}</b></span>`).join('');
    const socials = [b.facebook, b.instagram, b.linkedin].filter(Boolean).map(s => `<a href="${esc(normalizeWebsite(s))}" target="_blank" rel="noopener">Social</a>`).join('');
    const hours = b.hours || b.business_hours || 'Hours available from the business.';
    const services = b.services || b.service_area || 'Services and offerings may vary. Contact the business for current details.';
    const accessible = businessBadges(b).some(x => /accessible/i.test(x.label)) ? 'Accessibility information provided by the business.' : 'Accessibility details may be added after review.';
    lohDetailContent.innerHTML = `<div class="loh-profile-head"><div class="loh-logo-bubble">♥</div><div class="loh-detail-header"><span class="eyebrow">Land of Hearts Profile</span><h2>❤️ ${esc(b.name)}</h2><p>${esc([b.category, b.city, commitment(b)].filter(Boolean).join(' · '))}</p></div></div><div class="loh-profile-body"><div class="loh-visual-badges">${visualBadges(businessBadges(b))}${notes}</div><p>${esc(b.public_description || b.description || 'Affirming business listing.')}</p><div class="loh-profile-grid"><div><small>Location</small>${esc([b.address,b.city,b.county ? b.county + ' County' : ''].filter(Boolean).join(' · ') || 'Location available soon')}</div><div><small>Services</small>${esc(services)}</div><div><small>Hours</small>${esc(hours)}</div><div><small>Accessibility</small>${esc(accessible)}</div></div><div class="loh-detail-actions">${website}${directions}${phone}${email}${socials}</div><div class="loh-member-seal"><strong>Proud Member of the Heartland Pride Center Affirming Business Network</strong>This listing has been reviewed for publication by Heartland Pride Center. Community reviews are not used here; recognition is based on participation, verification, and relationship with the network.</div></div>`;
    shell.classList.add('open');
  }

  window.HPC_LAND_OF_HEARTS_DIRECTORY_V2 = {
    render(container, list, onSelect) {
      ensureShell();
      container.innerHTML = (list || []).length ? list.map((b, index) => {
        const badges = visualBadges(businessBadges(b).slice(0,4));
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
