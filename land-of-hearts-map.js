window.HPC_LAND_OF_HEARTS_MAP = {
  init(businesses) {
    const mapEl = document.getElementById('lohMap');
    if (!mapEl) return null;

    if (!window.L) {
      mapEl.innerHTML = '<div class="loh-map-fallback"><strong>❤️ Land of Hearts Map</strong><p>The interactive map engine did not load. Published businesses are still listed below.</p></div>';
      return { render() {} };
    }

    const map = L.map(mapEl, { scrollWheelZoom: false, tap: true }).setView([27.90, -81.60], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    const fallback = [
      [27.9014, -81.5859],
      [28.0395, -81.9498],
      [27.9659, -81.9734],
      [27.8964, -81.8431],
      [28.1142, -81.6179],
      [27.7523, -81.8017],
      [28.1558, -81.5326],
      [27.8397, -81.5415]
    ];

    const badgeIcon = { lgbtq_owned: '🏳️‍🌈', proud_ally: '🤝', accessible: '♿' };
    const heart = L.divIcon({
      className: 'loh-heart-div-icon',
      html: '<div class="loh-heart-marker">❤️</div>',
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -22]
    });

    function coordsFor(b, index) {
      if (b.latitude && b.longitude) return [Number(b.latitude), Number(b.longitude)];
      return fallback[index % fallback.length];
    }

    function iconsFor(b) {
      const list = Array.isArray(b.badges) ? b.badges : [];
      return '<div class="loh-card-icons"><span>❤️</span>' + list.map((key) => '<span>' + (badgeIcon[key] || '❤️') + '</span>').join('') + '</div>';
    }

    function escapeText(value) {
      return String(value || '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
    }

    function popupFor(b) {
      const desc = escapeText(b.public_description || b.description || 'Affirming business listing.');
      const place = escapeText([b.address, b.city].filter(Boolean).join(', '));
      return '<div class="loh-popup"><small>' + escapeText(b.category || 'Local Business') + '</small><h3>' + escapeText(b.name) + '</h3><p>' + desc + '</p><p>' + place + '</p>' + iconsFor(b) + '</div>';
    }

    function render(list) {
      layer.clearLayers();
      const points = [];
      (list || []).forEach((b, index) => {
        const point = coordsFor(b, index);
        points.push(point);
        L.marker(point, { icon: heart, title: b.name || 'Land of Hearts business' }).addTo(layer).bindPopup(popupFor(b));
      });
      if (points.length) map.fitBounds(points, { padding: [45, 45], maxZoom: 12 });
      else map.setView([27.90, -81.60], 9);
      setTimeout(() => map.invalidateSize(), 350);
    }

    render(businesses || []);
    window.addEventListener('resize', () => map.invalidateSize());
    return { render };
  }
};
