// src/hooks/useDealers.js
import { useEffect, useState } from "react"

export default function useDealers() {
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDealers() {
      try {
        const response = await fetch("/data/dealers.json")
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        setDealers(data.dealers ?? data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDealers()
  }, [])

  return { dealers, loading, error }
}
