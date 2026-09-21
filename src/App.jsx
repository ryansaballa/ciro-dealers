// src/App.jsx

import { useEffect, useMemo, useState } from "react"
import "./App.css"
import CanadaMap from "./components/CanadaMap"
import DealerList from "./components/DealerList"

export default function App() {
  const [dealers, setDealers] = useState([])
  const [search, setSearch] = useState("")
  const [province, setProvince] = useState("All")
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch("/data/dealers.json")
      .then((res) => res.json())
      .then((data) => setDealers(data.dealers ?? data))
      .catch((err) => console.error("Failed to load dealers.json:", err))
  }, [])

  const provinces = useMemo(
    () =>
      [
        "All",
        ...new Set(dealers.map((d) => d.province).filter(Boolean)),
      ].sort(),
    [dealers],
  )

  const filtered = useMemo(
    () =>
      dealers.filter((d) => {
        const q = search.toLowerCase()
        const matchesSearch = !q || d.name?.toLowerCase().includes(q)
        return matchesSearch && (province === "All" || d.province === province)
      }),
    [dealers, search, province],
  )

  const mapped = filtered.filter((d) => d.latitude && d.longitude).length

  const handleDealerSelect = (dealer) => {
    setSelected((current) => {
      const sameDealer =
        current &&
        current.name === dealer?.name &&
        Number(current.latitude) === Number(dealer?.latitude) &&
        Number(current.longitude) === Number(dealer?.longitude)

      if (sameDealer) {
        return {
          ...dealer,
          _zoomNonce: (current._zoomNonce ?? 0) + 1,
        }
      }

      return dealer
    })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <img
          className="app-logo"
          src="/imgs/CIRO_Logo_Acrynoym_White.svg"
          alt="CIRO"
        />
        <div className="app-header-content">
          <h1>Regulated Dealer Explorer</h1>
        </div>
      </header>

      {/* minHeight: 0 is REQUIRED or the map collapses to 0px */}
      <main className="app-main">
        <section className="app-map-panel">
          <CanadaMap
            dealers={filtered}
            selected={selected}
            onSelect={handleDealerSelect}
          />
        </section>

        <div className="app-toolbar">
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="province-select"
          >
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p === "All" ? "All provinces" : p}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dealers…"
            className="search-input"
          />

          <p className="toolbar-summary">
            {filtered.length} of {dealers.length} dealers · {mapped} on map
          </p>
        
        </div>
            
        <aside className="app-sidebar">
          <DealerList
            dealers={filtered}
            selected={selected}
            onSelect={handleDealerSelect}
          />
        </aside>
        
      </main>
    </div>
  )
}
