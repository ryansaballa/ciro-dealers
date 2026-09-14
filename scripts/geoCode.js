// scripts/geoCode.js
// Offline geocoding — no API, no key, no rate limits, no network calls.
//
// ONE-TIME SETUP (run in terminal from project root):
//   curl -o scripts/CA.zip https://download.geonames.org/export/zip/CA.zip
//   unzip -o scripts/CA.zip -d scripts/
//
// THEN:
//   node scripts/geoCode.js

import fs from "node:fs"

const DEALERS = "public/data/dealers.json"
const SOURCE = "scripts/CA.txt" // from GeoNames CA.zip

/* ---------------------------------------------------------- */
/* 1. Build FSA lookup from the local GeoNames file            */
/* ---------------------------------------------------------- */

if (!fs.existsSync(SOURCE)) {
  console.error(`Missing ${SOURCE}\n`)
  console.error("Run these two commands first:\n")
  console.error("  curl -o scripts/CA.zip https://download.geonames.org/export/zip/CA.zip")
  console.error("  unzip -o scripts/CA.zip -d scripts/\n")
  process.exit(1)
}

// GeoNames format: tab-separated, no header
// 0=country 1=postal 2=place 3=admin1 4=admin1code ... 9=lat 10=lng 11=accuracy
const lookup = {}

for (const line of fs.readFileSync(SOURCE, "utf8").split("\n")) {
  if (!line.trim()) continue
  const cols = line.split("\t")

  const fsa = String(cols[1] || "").toUpperCase().replace(/\s/g, "").slice(0, 3)
  const lat = Number(cols[9])
  const lng = Number(cols[10])

  if (!fsa || !Number.isFinite(lat) || !Number.isFinite(lng)) continue
  if (lookup[fsa]) continue // first entry per FSA wins

  lookup[fsa] = { lat, lng, place: cols[2], province: cols[4] }
}

console.log(`Loaded ${Object.keys(lookup).length} FSAs from ${SOURCE}`)

/* ---------------------------------------------------------- */
/* 2. Join against dealers.json                                */
/* ---------------------------------------------------------- */

const data = JSON.parse(fs.readFileSync(DEALERS, "utf8"))
const dealers = data.dealers ?? data

let matched = 0
const misses = []

for (const d of dealers) {
  const fsa = String(d.postalCode || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3)
  const hit = lookup[fsa]

  if (hit) {
    d.latitude = hit.lat
    d.longitude = hit.lng
    matched++
  } else {
    misses.push(`${d.name} — postal: "${d.postalCode ?? "(none)"}"`)
  }
}

fs.writeFileSync(DEALERS, JSON.stringify(data, null, 2))

console.log(`Matched ${matched}/${dealers.length} dealers.`)

if (misses.length) {
  console.log("\nNo match:")
  misses.forEach((m) => console.log("  " + m))
}
