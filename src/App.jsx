// src/App.jsx

import { useEffect, useMemo, useState } from "react"
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
    () => ["All", ...new Set(dealers.map((d) => d.province).filter(Boolean))].sort(),
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>CIRO Dealer Explorer</h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
          {filtered.length} of {dealers.length} dealers · {mapped} on map
        </p>
      </header>

      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "12px 24px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dealers…"
          style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }}
        />

        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6 }}
        >
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p === "All" ? "All provinces" : p}
            </option>
          ))}
        </select>
      </div>

      {/* minHeight: 0 is REQUIRED or the map collapses to 0px */}
      <main style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <aside style={{ width: 360, overflowY: "auto", borderRight: "1px solid #e2e8f0" }}>
          <DealerList dealers={filtered} selected={selected} onSelect={setSelected} />
        </aside>

        <section style={{ flex: 1, minHeight: 0 }}>
          <CanadaMap dealers={filtered} selected={selected} onSelect={setSelected} />
        </section>
      </main>
    </div>
  )
}
