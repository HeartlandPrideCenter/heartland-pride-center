window.HPC_LAND_OF_HEARTS_MAP = {
  init(businesses) {
    const mapEl = document.getElementById('lohMap');
    if (!mapEl) return null;

    mapEl.style.display = 'block';
    mapEl.style.width = '100%';
    mapEl.style.minHeight = '520px';
    mapEl.style.height = '520px';

    const wrap = mapEl.closest('.loh-map-wrap');
    if (wrap) {
      wrap.style.display = 'block';
      wrap.style.width = '100%';
      wrap.style.minHeight = '520px';
      wrap.style.height = '520px';
      wrap.style.position = 'relative';
      wrap.style.zIndex = '1';
    }

    if (!window.L) {
      mapEl.innerHTML = '<div class="loh-map-fallback"><strong>❤️ Land of Hearts Map</strong><p>The interactive map engine did not load. Published businesses are still listed below.</p></div>';
      return { render() {}, focus() {} };
    }

    const map = L.map(mapEl, { scrollWheelZoom: false, tap: true }).setView([27.90, -81.60], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    let markers = [];
    const fallback = [
      [27.9014, -81.5859], [28.0395, -81.9498], [27.9659, -81.9734], [27.8964, -81.8431],
      [28.1142, -81.6179], [27.7523, -81.8017], [28.1558, -81.5326], [27.8397, -81.5415]
    ];

    const badgeIcon = { lgbtq_owned: '🏳️‍🌈', proud_ally: '🤝', accessible: '♿' };
    function heartIcon(active=false) {
      return L.divIcon({
        className: 'loh-heart-div-icon',
        html: '<div class="loh-heart-marker' + (active ? ' active' : '') + '">❤️</div>',
        iconSize: active ? [50, 50] : [42, 42],
        iconAnchor: active ? [25, 25] : [21, 21],
        popupAnchor: [0, -22]
      });
    }

    const style = document.createElement('style');
    style.textContent = '.loh-heart-marker.active{transform:scale(1.16);box-shadow:0 0 0 10px rgba(239,205,114,.18),0 16px 30px rgba(0,0,0,.32)}';
    document.head.appendChild(style);

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
      return '<div class="loh-popup"><small>' + escapeText(b.category || 'Local Business') + '</small><h3>❤️ ' + escapeText(b.name) + '</h3><p>' + desc + '</p><p>' + place + '</p>' + iconsFor(b) + '</div>';
    }

    function focus(index) {
      markers.forEach((marker, i) => marker.setIcon(heartIcon(i === index)));
      const marker = markers[index];
      if (marker) {
        map.setView(marker.getLatLng(), Math.max(map.getZoom(), 12), { animate: true });
        marker.openPopup();
      }
    }

    function render(list) {
      layer.clearLayers();
      markers = [];
      const points = [];
      (list || []).forEach((b, index) => {
        const point = coordsFor(b, index);
        points.push(point);
        const marker = L.marker(point, { icon: heartIcon(false), title: b.name || 'Land of Hearts business' }).addTo(layer).bindPopup(popupFor(b));
        marker.on('click', () => {
          focus(index);
          window.dispatchEvent(new CustomEvent('loh:marker-selected', { detail: { index, business: b } }));
        });
        markers.push(marker);
      });
      if (points.length) map.fitBounds(points, { padding: [45, 45], maxZoom: 12 });
      else map.setView([27.90, -81.60], 9);
      setTimeout(() => map.invalidateSize(), 250);
      setTimeout(() => map.invalidateSize(), 900);
    }

    render(businesses || []);
    window.addEventListener('resize', () => map.invalidateSize());
    return { render, focus };
  }
};
