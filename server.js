const express = require("express");
const path = require("path");
const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "telecom-location-simulator", simulationOnly: true }));

// Repeatable fictional scenario generator. The number is only used as a seed;
// it is NOT looked up in a database and does not reveal real location.
function hashNumber(value) {
  let hash = 2166136261;
  for (const ch of value) { hash ^= ch.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}
function rng(seed) {
  let state = seed || 1;
  return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
}
app.post("/api/simulate", (req, res) => {
  const phone = req.body && req.body.phone;
  if (typeof phone !== "string" || !/^\+?[0-9]{8,15}$/.test(phone)) {
    return res.status(400).json({ error: "Enter 8–15 digits, optionally starting with +." });
  }
  const random = rng(hashNumber(phone));
  // All points are fictional and constrained to a demo area around Dhaka.
  const centerLat = 23.8103 + (random() - 0.5) * 0.06;
  const centerLng = 90.4125 + (random() - 0.5) * 0.07;
  const estimate = { latitude: Number(centerLat.toFixed(5)), longitude: Number(centerLng.toFixed(5)), accuracyRadiusKm: Number((0.8 + random() * 2.2).toFixed(1)) };
  const offsets = [[-0.012,-0.014],[0.014,0.006],[-0.004,0.018],[0.009,-0.019]];
  const towers = offsets.map((offset, i) => {
    const lat = centerLat + offset[0] + (random() - 0.5) * 0.006;
    const lng = centerLng + offset[1] + (random() - 0.5) * 0.006;
    const signalDbm = Math.round(-70 - random() * 35);
    const dLat = (lat - centerLat) * 111.1;
    const dLng = (lng - centerLng) * 102.5;
    return { id: `DEMO-CELL-${String(i+1).padStart(3,"0")}`, lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)), signalDbm, distanceKm: Number(Math.sqrt(dLat*dLat+dLng*dLng).toFixed(2)) };
  });
  res.json({ simulation: true, sampleNumber: phone, method: "Fictional cell-tower / signal-strength demonstration", estimate, towers,
    disclaimer: "This is a repeatable fictional scenario seeded by the entered digits. It is not derived from the number, a real tower, a carrier, or a person's location." });
});
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API endpoint not found." });
  res.sendFile(path.join(__dirname, "public", "index.html"), err => err && next(err));
});
app.listen(PORT, () => {
  console.log(`Telecom Location Simulator running at http://localhost:${PORT}`);
  console.log("Simulation only: no real telecom network or personal location is accessed.");
});
