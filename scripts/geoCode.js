import fs from "fs"

const filePath = "./public/data/dealers.json"

const data = JSON.parse(fs.readFileSync(filePath, "utf8"))

console.log(`Found ${data.dealers.length} dealers`)

function buildAddress(dealer) {
  return [
    dealer.address.replace(/^Suite\s*#?\d+[A-Za-z]*,\s*/i, ""),
    dealer.city,
    dealer.province,
    dealer.postalCode,
    "Canada",
  ]
    .filter(Boolean)
    .join(", ")
}

const dealer = data.dealers[0]

const address = buildAddress(dealer)

console.log("Geocoding:")
console.log(address)

const response = await fetch(
  `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`,
  {
    headers: {
      "User-Agent": "CIRO-Dealer-Map/1.0",
    },
  },
)

const results = await response.json()

console.log("Result:")
console.log(results)

if (results.length > 0) {
  console.log("Latitude:", results[0].lat)
  console.log("Longitude:", results[0].lon)
  console.log("Matched address:", results[0].display_name)
} else {
  console.log("No geocoding result found.")
}
