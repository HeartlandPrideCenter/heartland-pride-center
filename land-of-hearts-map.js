window.HPC_LAND_OF_HEARTS_MAP = {
  init(businesses) {
    const mapEl = document.getElementById('lohMap');
    if (!mapEl) return null;
    mapEl.style.display = 'block';
    mapEl.style.width = '100%';
    mapEl.style.height = '100%';
    mapEl.style.minHeight = '560px';

    if (!window.L) {
      mapEl.innerHTML = '<div class="loh-map-fallback"><strong>❤️ Land of Hearts Map</strong><p>The interactive map engine did not load. Published businesses are still listed below.</p></div>';
      return { render() {}, focus() {}, resize() {}, locate() {}, setLayer() {}, getVisible() { return []; } };
    }

    const map = L.map(mapEl, { scrollWheelZoom: true, wheelPxPerZoomLevel: 80, tap: true, zoomControl: true, doubleClickZoom: true, touchZoom: true, dragging: true }).setView([27.90, -81.60], 10);
    const layers = {
      standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' }),
      terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '&copy; OpenTopoMap contributors' })
    };
    layers.standard.addTo(map);
    let activeLayer = layers.standard;

    const layer = L.layerGroup().addTo(map);
    let markers = [];
    let userMarker = null;
    let currentList = businesses || [];
    const fallback = [[27.9014,-81.5859],[28.0395,-81.9498],[27.9659,-81.9734],[27.8964,-81.8431],[28.1142,-81.6179],[27.7523,-81.8017],[28.1558,-81.5326],[27.8397,-81.5415]];
    const badgeIcon = { lgbtq_owned:'🏳️‍🌈', proud_ally:'🤝', accessible:'♿', 'LGBTQ+ Owned or Operated':'🏳️‍🌈', 'Proud Ally':'🤝', 'Accessible':'♿' };

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

    function heartIcon(active=false) {
      const size = active ? 58 : 48;
      const anchor = active ? [29,50] : [24,42];
      return L.divIcon({
        className:'loh-heart-div-icon',
        html:'<div class="loh-heart-pin' + (active ? ' active' : '') + '"><span>♥</span></div>',
        iconSize:[size,size],
        iconAnchor:anchor,
        popupAnchor:[0,-44]
      });
    }
    function userIcon() { return L.divIcon({ className:'loh-user-div-icon', html:'<div class="loh-user-marker">📍</div>', iconSize:[42,42], iconAnchor:[21,21] }); }

    const style = document.createElement('style');
    style.textContent = `.loh-heart-div-icon{background:transparent!important;border:0!important}.loh-heart-pin{position:relative;width:48px;height:48px;display:grid;place-items:center;filter:drop-shadow(0 14px 18px rgba(0,0,0,.34))}.loh-heart-pin:before{content:"";position:absolute;inset:4px 4px 9px 4px;background:linear-gradient(135deg,#f8d96f,#d4af37 52%,#a87515);border:2px solid rgba(255,255,255,.9);border-radius:52% 52% 52% 0;transform:rotate(-45deg);box-shadow:inset 0 1px 10px rgba(255,255,255,.28),0 0 0 4px rgba(7,24,39,.28)}.loh-heart-pin:after{content:"";position:absolute;left:50%;bottom:0;width:8px;height:8px;background:#a87515;border-right:2px solid rgba(255,255,255,.75);border-bottom:2px solid rgba(255,255,255,.75);transform:translateX(-50%) rotate(45deg);border-radius:0 0 3px 0}.loh-heart-pin span{position:relative;z-index:2;color:#071827;font-size:24px;font-weight:950;transform:translateY(-2px);text-shadow:0 1px 0 rgba(255,255,255,.4)}.loh-heart-pin.active{width:58px;height:58px;animation:lohPinPulse 1.8s ease-in-out infinite}.loh-heart-pin.active:before{background:linear-gradient(135deg,#fff2a8,#efcd72 48%,#bd8b24);box-shadow:inset 0 1px 12px rgba(255,255,255,.36),0 0 0 8px rgba(239,205,114,.18),0 0 28px rgba(239,205,114,.28)}.loh-heart-pin.active span{font-size:28px}@keyframes lohPinPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}.loh-user-marker{display:grid;place-items:center;width:42px;height:42px;border-radius:999px;background:#fff;border:3px solid #2f80ed;box-shadow:0 12px 28px rgba(0,0,0,.26);font-size:20px}.loh-popup .loh-map-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.loh-popup .loh-map-actions a,.loh-popup .loh-map-actions button{border:1px solid rgba(239,205,114,.28);border-radius:999px;background:rgba(212,175,55,.08);color:#f5f1e8;padding:8px 10px;font-weight:900;text-decoration:none;font:inherit;cursor:pointer}.loh-card-icons{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.loh-card-icons span{border:1px solid rgba(239,205,114,.22);border-radius:999px;background:rgba(212,175,55,.08);padding:5px 8px;font-size:.8rem}.loh-map-fallback{display:grid;place-items:center;text-align:center;min-height:420px;padding:32px;color:#f5f1e8}`;
    document.head.appendChild(style);

    function coordsFor(b, index) { if (b.latitude && b.longitude) return [Number(b.latitude), Number(b.longitude)]; return fallback[index % fallback.length]; }
    function escapeText(value) { return String(value || '').replace(/[&<>"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[char])); }
    function directionsUrl(b) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([b.address,b.city,'Florida'].filter(Boolean).join(', ')); }
    function iconsFor(b) { const list = [...toList(b.badges), ...toList(b.recognition_badges)]; return '<div class="loh-card-icons"><span>❤️ Member</span>' + list.map(key => '<span>' + (badgeIcon[key] || key || '❤️') + '</span>').join('') + (b.sponsor_level ? '<span>' + escapeText(b.sponsor_level) + '</span>' : '') + '</div>'; }
    function popupFor(b, index) {
      const desc = escapeText(b.public_description || b.description || 'Affirming business listing.');
      const place = escapeText([b.address, b.city].filter(Boolean).join(', '));
      const website = b.website ? '<a href="' + escapeText(/^https?:\/\//i.test(b.website) ? b.website : 'https://' + b.website) + '" target="_blank" rel="noopener">Website</a>' : '';
      const directions = b.address || b.city ? '<a href="' + directionsUrl(b) + '" target="_blank" rel="noopener">Directions</a>' : '';
      return '<div class="loh-popup"><small>' + escapeText(b.category || 'Local Business') + '</small><h3>❤️ ' + escapeText(b.name) + '</h3><p>' + desc + '</p><p>' + place + '</p>' + iconsFor(b) + '<div class="loh-map-actions"><button type="button" data-loh-profile="' + index + '">Profile</button>' + directions + website + '</div></div>';
    }
    function distanceMiles(from, to) { const R=3958.8, dLat=(to[0]-from[0])*Math.PI/180, dLng=(to[1]-from[1])*Math.PI/180, a=Math.sin(dLat/2)**2+Math.cos(from[0]*Math.PI/180)*Math.cos(to[0]*Math.PI/180)*Math.sin(dLng/2)**2; return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); }
    function getVisible() { const bounds=map.getBounds(); return markers.map((marker,index)=>({ marker,index,business:currentList[index] })).filter(item=>bounds.contains(item.marker.getLatLng())).map(item=>item.business); }
    function announceVisible() { window.dispatchEvent(new CustomEvent('loh:visible-businesses', { detail:{ businesses:getVisible() } })); }
    function resize() { setTimeout(()=>map.invalidateSize(true),60); setTimeout(()=>map.invalidateSize(true),250); setTimeout(()=>{ map.invalidateSize(true); announceVisible(); },700); }
    function focus(index) { markers.forEach((marker,i)=>marker.setIcon(heartIcon(i===index))); const marker=markers[index]; if(marker){ map.setView(marker.getLatLng(), Math.max(map.getZoom(), 13), { animate:true }); marker.openPopup(); } resize(); }
    function render(list) { currentList=list||[]; layer.clearLayers(); markers=[]; const points=[]; currentList.forEach((b,index)=>{ const point=coordsFor(b,index); points.push(point); const marker=L.marker(point,{ icon:heartIcon(false), title:b.name||'Land of Hearts business' }).addTo(layer).bindPopup(popupFor(b,index)); marker.on('click',()=>{ focus(index); window.dispatchEvent(new CustomEvent('loh:marker-selected',{ detail:{ index,business:b } })); }); markers.push(marker); }); if(points.length) map.fitBounds(points,{ padding:[55,55], maxZoom:13 }); else map.setView([27.90,-81.60],10); resize(); announceVisible(); }
    function setLayer(name) { const next=layers[name]||layers.standard; if(activeLayer!==next){ map.removeLayer(activeLayer); activeLayer=next; activeLayer.addTo(map); } resize(); }
    function locate(auto=false) { if(!navigator.geolocation){ if(!auto) window.dispatchEvent(new CustomEvent('loh:map-message',{ detail:{ message:'Location is not available on this device.' } })); return; } navigator.geolocation.getCurrentPosition(pos=>{ const point=[pos.coords.latitude,pos.coords.longitude]; if(userMarker) userMarker.remove(); userMarker=L.marker(point,{ icon:userIcon(), title:'Your location' }).addTo(map).bindPopup('You are here'); map.setView(point,12,{ animate:true }); const ranked=markers.map((marker,index)=>({ index,business:currentList[index],distance:distanceMiles(point,[marker.getLatLng().lat,marker.getLatLng().lng]) })).sort((a,b)=>a.distance-b.distance); window.dispatchEvent(new CustomEvent('loh:located',{ detail:{ lat:point[0], lng:point[1], ranked } })); resize(); },()=>{ if(!auto) window.dispatchEvent(new CustomEvent('loh:map-message',{ detail:{ message:'Unable to access your location.' } })); },{ enableHighAccuracy:true, timeout:9000 }); }
    map.on('popupopen', event=>{ const btn=event.popup.getElement()?.querySelector('[data-loh-profile]'); if(btn) btn.onclick=()=>window.dispatchEvent(new CustomEvent('loh:profile-open',{ detail:{ index:Number(btn.dataset.lohProfile), business:currentList[Number(btn.dataset.lohProfile)] } })); });
    map.on('moveend zoomend', announceVisible);
    render(businesses||[]);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', resize);
    return { render, focus, resize, setLayer, locate, getVisible };
  }
};
