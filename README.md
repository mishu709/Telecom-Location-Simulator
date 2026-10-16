# Telecom Location Simulator (fictional demo)

## Requirements
- Node.js 18+ and npm
- Internet access for Leaflet map tiles/CDN

## Run in VS Code
1. Extract the ZIP.
2. Open this folder (the one containing `package.json`) in VS Code.
3. In Terminal, run `npm install` then `npm start`.
4. Open http://localhost:3000.

## What it does
Enter a phone-number-shaped string to generate a repeatable fictional scenario with sample tower markers, made-up signal strengths, illustrative distances, and an illustrative estimate circle on a map. Different digit strings can produce different demo layouts. The number is used only as a deterministic seed.

## Important limitation
This does NOT identify the subscriber's country/region, query telecom networks, locate a real phone, or calculate a real position. The coordinates are fictional examples around Dhaka and must not be treated as an actual estimate. Real network positioning requires authorized carrier data and legal permission.
