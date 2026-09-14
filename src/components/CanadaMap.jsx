// src/components/CanadaMap.jsx
// Receives dealers from App. CircleMarker = pure SVG, no icon images needed.

import { useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"

// SW and NE corners of Canada
const CANADA_BOUNDS = [
  [41.6, -141.0],
  [83.2, -52.6],
]

/** Pans the map when a dealer is selected in the list. */
function FlyTo({ dealer }) {
  const map = useMap()

  useEffect(() => {
    if (dealer?.latitude && dealer?.longitude) {
      map.flyTo([Number(dealer.latitude), Number(dealer.longitude)], 10, { duration: 1 })
    }
  }, [dealer, map])

  return null
}

export default function CanadaMap({ dealers = [], selected, onSelect }) {
  const located = dealers.filter((d) => d.latitude && d.longitude)

  return (
    <MapContainer
      bounds={CANADA_BOUNDS}
      maxBounds={CANADA_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={3}
      maxZoom={14}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", minHeight: "500px" }}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri | Postal data: GeoNames (CC-BY) | Dealers: CIRO"
        noWrap
      />

      <FlyTo dealer={selected} />

      {located.map((dealer, i) => {
        const isSelected = selected?.name === dealer.name

        return (
          <CircleMarker
            key={`${dealer.name}-${i}`}
            center={[Number(dealer.latitude), Number(dealer.longitude)]}
            radius={isSelected ? 11 : 6}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: isSelected ? "#dc2626" : "#2563eb",
              fillOpacity: 0.85,
            }}
            eventHandlers={{ click: () => onSelect?.(dealer) }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>{dealer.name}</strong>

                {dealer.category && (
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {dealer.category}
                  </div>
                )}

                {dealer.phone && (
                  <div style={{ marginTop: 6 }}>
                    <a href={`tel:${dealer.phone}`}>{dealer.phone}</a>
                  </div>
                )}

                {dealer.website && (
                  <div style={{ marginTop: 4 }}>
                    <a href={dealer.website} target="_blank" rel="noopener noreferrer">
                      Visit website
                    </a>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
