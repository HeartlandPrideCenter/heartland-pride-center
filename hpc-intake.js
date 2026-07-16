(() => {
  'use strict';
  if (window.__HPC_UNIFIED_INTAKE__) return;
  window.__HPC_UNIFIED_INTAKE__ = true;

  const API = `${window.HPC_DATA_URL || ''}/rest/v1/applications`;
  const KEY = window.HPC_DATA_PUBLIC_TOKEN || '';
  const EMAIL = 'https://formsubmit.co/ajax/d707b823a032678d5049d71c9352448f';
  const ready = Boolean(window.HPC_DATA_URL && KEY && !KEY.includes('ADD_PUBLIC_TOKEN'));
  const value = id => (document.getElementById(id)?.value || '').trim();
  const setStatus = (id, html) => { const el = document.getElementById(id); if (el) { el.style.display = 'block'; el.innerHTML = html; } };

  const configs = {
    contactIntakeForm: {
      status: 'contactMessageStatus',
      build() {
        const type = value('contactDepartment');
        const labels = {contact:'General Contact',resources:'Resource Request',partners:'Partnership Inquiry',volunteers:'Volunteer Interest',events:'Event Request',business:'Business / Directory Inquiry'};
        const category = labels[type] || 'General Contact';
        const message = value('contactMessage');
        return {
          payload: {type, status:'new', organization_name:value('contactName'), contact_name:value('contactName'), email:value('contactEmail'), phone:value('contactPhone'), category, city:value('contactCity'), county:'Polk', description:message, notes:`Preferred follow-up: ${value('contactFollowup')}\nRouted department: ${category}\nMessage: ${message}`},
          email: {name:value('contactName'), email:value('contactEmail'), phone:value('contactPhone'), city:value('contactCity'), department:category, preferred_follow_up:value('contactFollowup'), message},
          subject: `[HPC Contact Form] ${category}`,
          success: '<strong>❤️ Message received.</strong> Your inquiry has been saved and emailed to HPC.'
        };
      }
    },
    volunteerInterestForm: {
      status: 'volunteerMessage',
      build() {
        const interests = value('volInterests');
        const availability = value('volAvailability');
        const experience = value('volExperience');
        return {
          payload: {type:'volunteer', status:'new', organization_name:value('volName'), contact_name:value('volName'), email:value('volEmail'), phone:value('volPhone'), category:'Volunteer Interest', city:value('volCity'), county:'Polk', description:interests, notes:`Interests: ${interests}\nAvailability: ${availability || 'not provided'}\nExperience/notes: ${experience || 'not provided'}`},
          email: {name:value('volName'), email:value('volEmail'), phone:value('volPhone'), city:value('volCity'), interests, availability, experience_or_notes:experience},
          subject: '[HPC Volunteer Interest] New submission',
          success: '<strong>❤️ Volunteer interest received.</strong> Your information has been saved and emailed to HPC.'
        };
      }
    },
    partnerInterestForm: {
      status: 'partnerStatus',
      build() {
        const category = value('partnerType');
        const message = value('partnerMessage');
        return {
          payload: {type:'partners', status:'new', organization_name:value('partnerOrg'), contact_name:value('partnerName'), email:value('partnerEmail'), phone:value('partnerPhone'), category, city:value('partnerCity'), county:'Polk', description:message, notes:`Partnership type: ${category}\nMessage: ${message}`},
          email: {organization:value('partnerOrg'), contact_name:value('partnerName'), email:value('partnerEmail'), phone:value('partnerPhone'), city:value('partnerCity'), partnership_type:category, message},
          subject: `[HPC Partner Interest] ${value('partnerOrg')}`,
          success: '<strong>❤️ Partner interest received.</strong> Your inquiry has been saved and emailed to HPC.'
        };
      }
    },
    landOfHeartsForm: {
      status: 'applicationMessage',
      build() {
        const selected = [...document.querySelectorAll('input[name="lohBadges"]:checked')].map(x => x.value);
        const description = value('lohPublicDescription');
        const notes = `Preferred contact: ${value('lohPreferredContact')}\nSelected identifiers: ${selected.join(', ') || 'none'}\nPrivate notes: ${value('lohPrivateNotes') || 'none'}\nConsent: authorized representative certified accuracy and consented to publication if approved.`;
        const website = value('lohWebsite');
        const normalizedWebsite = website && !/^https?:\/\//i.test(website) ? `https://${website}` : website;
        return {
          payload: {type:'business', status:'pending', organization_name:value('lohBusinessName'), contact_name:value('lohContactName'), email:value('lohEmail'), phone:value('lohPhone'), website:normalizedWebsite, category:value('lohCategory'), address:value('lohAddress'), city:value('lohCity'), county:'Polk', description, notes},
          email: {business_name:value('lohBusinessName'), category:value('lohCategory'), address:value('lohAddress'), city:value('lohCity'), website:normalizedWebsite, contact_name:value('lohContactName'), email:value('lohEmail'), phone:value('lohPhone'), preferred_contact:value('lohPreferredContact'), public_description:description, identifiers:selected.join(', ') || 'none', private_notes:value('lohPrivateNotes')},
          subject: `[HPC Business Network] ${value('lohBusinessName')}`,
          success: '<strong>❤️ Application received.</strong><p>Your application has been saved and emailed to HPC for review.</p>'
        };
      }
    }
  };

  async function sendEmail(fields, subject) {
    const body = new FormData();
    Object.entries(fields).forEach(([k,v]) => body.append(k, v || ''));
    body.append('_subject', subject);
    body.append('_template', 'table');
    body.append('_captcha', 'false');
    const response = await fetch(EMAIL, {method:'POST', headers:{Accept:'application/json'}, body});
    if (!response.ok) throw new Error(`email failed (${response.status})`);
    const result = await response.json().catch(() => ({}));
    if (result.success === false) throw new Error(result.message || 'email rejected');
  }

  document.addEventListener('submit', async event => {
    const form = event.target;
    const config = configs[form?.id];
    if (!config) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    setStatus(config.status, '<strong>Submitting...</strong>');

    try {
      if (!ready) throw new Error('intake connection unavailable');
      const job = config.build();
      const database = await fetch(API, {method:'POST', headers:{apikey:KEY, Authorization:`Bearer ${KEY}`, 'Content-Type':'application/json', Prefer:'return=minimal'}, body:JSON.stringify(job.payload)});
      if (!database.ok) throw new Error(`database failed (${database.status})`);
      await sendEmail(job.email, job.subject);
      form.reset();
      setStatus(config.status, job.success);
    } catch (error) {
      console.error('HPC unified intake failure', error);
      setStatus(config.status, '<strong>Submission incomplete.</strong> Delivery could not be confirmed. Please email info@heartlandpridecenter.org so we do not miss you.');
    } finally {
      if (button) button.disabled = false;
    }
  }, true);
})();