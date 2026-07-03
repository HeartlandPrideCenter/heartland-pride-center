(() => {
  function coordsFor(city) {
    if (!window.HPC_BACKSTAGE_COORDINATES) return { latitude: null, longitude: null };
    return window.HPC_BACKSTAGE_COORDINATES.cityFallback(city || 'Lake Wales');
  }

  window.publishApplication = async (id) => {
    const app = applications.find((a) => a.id === id);
    if (!app) return;
    toast('Publishing heart to the map...');
    const coords = coordsFor(app.city || 'Lake Wales');
    const business = {
      application_id: app.id,
      name: app.organization_name || 'Unnamed Business',
      contact_name: app.contact_name || '',
      category: app.category || 'Local Business',
      description: app.description || '',
      public_description: app.description || '',
      address: app.address || '',
      city: app.city || '',
      county: app.county || 'Polk',
      phone: app.phone || '',
      email: app.email || '',
      website: app.website || '',
      heart_rating: 'Community Heart',
      status: 'published',
      featured: false,
      approved_at: new Date().toISOString(),
      internal_notes: app.notes || '',
      latitude: coords.latitude,
      longitude: coords.longitude
    };
    const create = await fetch(apiBase + '/businesses', {
      method: 'POST',
      headers: authedHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify(business)
    });
    if (!create.ok) return toast('Publish failed');
    await fetch(apiBase + `/applications?id=eq.${id}`, {
      method: 'PATCH',
      headers: authedHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ status: 'published', reviewed_at: new Date().toISOString(), published_at: new Date().toISOString() })
    });
    toast('Published with map coordinates');
    await loadBackstage();
  };
})();
