// src/components/DealerMap.jsx
import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Leaflet's default marker icons break under Vite — this fixes them.
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const CANADA_CENTER = [56.13, -106.35]

/** Pans the map when a dealer is selected in the list. */
function FlyTo({ dealer }) {
  const map = useMap()

  useEffect(() => {
    if (dealer?.latitude && dealer?.longitude) {
      map.flyTo([dealer.latitude, dealer.longitude], 11, { duration: 1 })
    }
  }, [dealer, map])

  return null
}

export default function DealerMap({ dealers, selected, onSelect }) {
  const located = dealers.filter((d) => d.latitude && d.longitude)

  return (
    <MapContainer
      center={CANADA_CENTER}
      zoom={4}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Postal data: GeoNames (CC-BY) | Dealers: CIRO'
/>

      <FlyTo dealer={selected} />

      <MarkerClusterGroup chunkedLoading>
        {located.map((dealer, i) => (
          <Marker
            key={dealer.name ?? i}
            position={[dealer.latitude, dealer.longitude]}
            eventHandlers={{ click: () => onSelect?.(dealer) }}
          >
            <Popup>
              <p className="font-semibold text-slate-900">{dealer.name}</p>
              <p className="text-sm text-slate-600">
                {[dealer.city, dealer.province].filter(Boolean).join(", ")}
              </p>
              {dealer.category && (
                <span className="mt-1 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                  {dealer.category}
                </span>
              )}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
