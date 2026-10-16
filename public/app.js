(() => {
  const form = document.getElementById("sim-form");
  const input = document.getElementById("sample-number");
  const button = document.getElementById("simulate-button");
  const status = document.getElementById("status");
  const el = id => document.getElementById(id);
  function setStatus(message, error = false) { status.textContent = message; status.classList.toggle("error", error); }
  const map = L.map("map").setView([23.8103, 90.4125], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  function render(data) {
    layer.clearLayers();
    const e = data.estimate, target = [e.latitude, e.longitude];
    L.circle(target, { radius: e.accuracyRadiusKm * 1000, color: "#e64c62", fillColor: "#e64c62", fillOpacity: 0.15 }).addTo(layer);
    L.marker(target).addTo(layer).bindPopup("SIMULATED estimate — not a real device location").openPopup();
    data.towers.forEach(t => {
      L.circleMarker([t.lat, t.lng], { radius: 8, color: "#fff", weight: 2, fillColor: "#1676d2", fillOpacity: 1 }).addTo(layer)
        .bindPopup(`${t.id}<br>Fictional signal: ${t.signalDbm} dBm<br>Illustrative distance: ${t.distanceKm} km`);
      L.polyline([[t.lat, t.lng], target], { color: "#1676d2", weight: 1.5, opacity: 0.6, dashArray: "6 6" }).addTo(layer);
    });
    el("coordinates").textContent = `${e.latitude.toFixed(4)}° N, ${e.longitude.toFixed(4)}° E`;
    el("accuracy").textContent = `Fictional radius: approximately ${e.accuracyRadiusKm} km (not real accuracy)`;
    el("method").textContent = data.method; el("tower-count").textContent = String(data.towers.length); el("shown-number").textContent = data.sampleNumber;
    const tbody = el("tower-rows"); tbody.replaceChildren();
    data.towers.forEach(t => { const row = document.createElement("tr"); [`${t.id}`, `${t.signalDbm} dBm`, `${t.distanceKm} km`].forEach(value => { const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell); }); tbody.appendChild(row); });
    const group = L.featureGroup(layer.getLayers()); if (group.getBounds().isValid()) map.fitBounds(group.getBounds(), { padding: [24, 24], maxZoom: 14 });
    setTimeout(() => map.invalidateSize(), 100);
  }
  form.addEventListener("submit", async event => {
    event.preventDefault(); const phone = input.value.trim();
    if (!/^\+?[0-9]{8,15}$/.test(phone)) { setStatus("Enter 8–15 digits, optionally starting with +.", true); input.focus(); return; }
    button.disabled = true; setStatus("Generating fictional tower measurements...");
    try {
      const response = await fetch("/api/simulate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
      render(data); setStatus("Simulation complete. The result is fictional and does not locate a real phone.");
    } catch (error) { setStatus(`Could not run simulation: ${error.message}. Check the server and internet connection.`, true); }
    finally { button.disabled = false; }
  });
  form.requestSubmit();
})();
