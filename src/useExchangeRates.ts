import { useState, useEffect } from 'react'

type Rates = Record<string, number>

const FALLBACK_RATES: Rates = {
  USD: 18.5,
  EUR: 20.2,
  GBP: 23.5,
  ZAR: 1,
}

export function useExchangeRates() {
  const [rates, setRates] = useState<Rates>(FALLBACK_RATES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/ZAR')
        if (!res.ok) throw new Error('Rate fetch failed')
        const data = await res.json()
        const zarRates: Rates = {
          ZAR: 1,
          USD: 1 / data.rates.USD,
          EUR: 1 / data.rates.EUR,
          GBP: 1 / data.rates.GBP,
        }
        setRates(zarRates)
        setLastUpdated(new Date())
      } catch (err) {
        console.warn('Using fallback exchange rates:', err)
        setError('Using estimated rates')
        setRates(FALLBACK_RATES)
        setLastUpdated(null)
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [])

  return { rates, loading, error, lastUpdated }
}