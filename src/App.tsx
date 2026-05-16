import { useState, useMemo } from 'react'
import { calcSalary, formatZAR } from './taxEngine'
import { useExchangeRates } from './useExchangeRates'
import './App.css'

import PayFastButton from './PayFastButton'

const CURRENCIES = ['ZAR', 'USD', 'EUR', 'GBP']
const FREQUENCIES = ['Monthly', 'Annual', 'Hourly']
// const CURRENCY_SYMBOLS = { ZAR: 'R', USD: '$', EUR: '€', GBP: '£' }

function SegmentedControl({ options, value, onChange }: { options: string[], value: string, onChange: (v: string) => void }) {
  return (
    <div style={{
      display: 'flex',
      background: '#111',
      border: '1px solid #222',
      borderRadius: 8,
      padding: 3,
      gap: 2,
    }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: value === opt ? '#00e87a' : 'transparent',
            color: value === opt ? '#0a0a0a' : '#666',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.05em',
            transition: 'all 0.15s ease',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function DeductionRow({ label, monthly, annual, color = '#f0f0f0', isMuted = false }: { label: string, monthly: number, annual: number, color?: string, isMuted?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #1a1a1a',
      opacity: isMuted ? 0.5 : 1,
    }}>
      <span style={{ color: '#888', fontSize: 13, fontFamily: 'DM Mono, monospace' }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <div style={{ color, fontSize: 15, fontWeight: 500, fontFamily: 'DM Mono, monospace' }}>
          {formatZAR(monthly)}<span style={{ color: '#444', fontSize: 11 }}>/mo</span>
        </div>
        <div style={{ color: '#444', fontSize: 11, fontFamily: 'DM Mono, monospace' }}>
          {formatZAR(annual)}/yr
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>('USD')
  const [frequency, setFrequency] = useState('Monthly')
  const [pensionPct, setPensionPct] = useState(0)
  const [age, setAge] = useState(30)
  const [hoursPerWeek, setHoursPerWeek] = useState(40)

  const { rates, loading: ratesLoading, error: ratesError, lastUpdated } = useExchangeRates()

  const result = useMemo(() => {
    const num = parseFloat(amount)
    if (!num || num <= 0 || !rates[currency]) return null

    const zarAmount = num * rates[currency]

    let grossMonthly
    if (frequency === 'Monthly') grossMonthly = zarAmount
    else if (frequency === 'Annual') grossMonthly = zarAmount / 12
    else if (frequency === 'Hourly') grossMonthly = zarAmount * hoursPerWeek * 52 / 12

    return calcSalary({ grossMonthly, pensionPct, age })
  }, [amount, currency, frequency, pensionPct, age, hoursPerWeek, rates])

  const exchangeRate = rates[currency] || 1
  // const sym = CURRENCY_SYMBOLS[currency]

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 16px 80px',
    }}>
      {/* Header */}
      <header style={{
        width: '100%',
        maxWidth: 640,
        padding: '40px 0 32px',
        animation: 'fadeUp 0.5s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            background: '#00e87a',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}>🇿🇦</div>
          {/* <span style={{ fontSize: 13, color: '#444', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em' }}>
            NetZA
          </span> */}
           <img src="/logo.svg" alt="NetZA" height="48" />

        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 42px)',
          fontWeight: 800,
          lineHeight: 1.1,
          color: '#f0f0f0',
          marginBottom: 8,
        }}>
          What's your<br />
          <span style={{ color: '#00e87a' }}>take-home pay?</span>
        </h1>
        <p style={{ color: '#555', fontSize: 16, lineHeight: 1.6, fontFamily: 'DM Mono, monospace' }}>
          Foreign offer → ZAR → SARS tax → net pay. One shot.
        </p>
      </header>

      {/* Exchange rate banner */}
      <div style={{
        width: '100%',
        maxWidth: 640,
        marginBottom: 16,
        padding: '10px 14px',
        background: '#111',
        border: '1px solid #1d1d1d',
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        animation: 'fadeUp 0.5s ease 0.1s both',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {['USD','EUR','GBP'].map(c => (
            <span key={c} style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#555' }}>
              <span style={{ color: '#00e87a' }}>{c}</span>{' '}
              {ratesLoading ? '...' : `R${rates[c]?.toFixed(2)}`}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 11, color: '#333', fontFamily: 'DM Mono, monospace' }}>
          {ratesError ? '⚠ estimated' : lastUpdated ? '● live' : ''}
        </span>
      </div>

      {/* Input Card */}
      <div style={{
        width: '100%',
        maxWidth: 640,
        background: '#111',
        border: '1px solid #1d1d1d',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        animation: 'fadeUp 0.5s ease 0.15s both',
      }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 10 }}>
            SALARY AMOUNT
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Currency selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as typeof currency)}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #cecece',
                  borderRadius: 8,
                  color: '#00e87a',
                  fontFamily: 'DM Mono, monospace',
                  fontWeight: 500,
                  fontSize: 16,
                  padding: '14px 10px',
                  cursor: 'pointer',
                  outline: 'none',
                  width: 80,
                  gap: 10
                }}
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Amount input */}
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{
                flex: 1,
                background: '#1a1a1a',
                border: '1px solid #cecece',
                borderRadius: 8,
                color: '#cecece',
                fontFamily: 'DM Mono, monospace',
                fontSize: 22,
                fontWeight: 500,
                padding: '14px 16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                minWidth: 0,
              }}
              onFocus={e => e.target.style.borderColor = '#00e87a'}
              onBlur={e => e.target.style.borderColor = '#cecece'}
            />
          </div>
          {/* ZAR equivalent hint */}
          {amount && currency !== 'ZAR' && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#cecece', fontFamily: 'DM Mono, monospace' , fontWeight: 700}}>
              ≈ {formatZAR(parseFloat(amount || '0') * exchangeRate)}{' '}
              <span style={{ color: '#cecece' }}>ZAR {frequency.toLowerCase()}</span>
            </div>
          )}
        </div>

        {/* Frequency */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 10 }}>
            FREQUENCY
          </label>
          <SegmentedControl options={FREQUENCIES} value={frequency} onChange={setFrequency} />
        </div>

        {/* Hours per week — only show for hourly */}
        {frequency === 'Hourly' && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>
              <span>HOURS / WEEK</span>
              <span style={{ color: '#00e87a' }}>{hoursPerWeek}h</span>
            </label>
            <input type="range" min={1} max={60} value={hoursPerWeek} onChange={e => setHoursPerWeek(Number(e.target.value))} />
          </div>
        )}

        {/* Pension */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>
            <span>PENSION / RA CONTRIBUTION</span>
            <span style={{ color: pensionPct > 0 ? '#ffe548' : '#333' }}>{pensionPct}%</span>
          </label>
          <input type="range" min={0} max={27} value={pensionPct} onChange={e => setPensionPct(Number(e.target.value))} />
          {pensionPct > 0 && (
            <p style={{ marginTop: 6, fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace' }}>
              Pre-tax deduction — reduces your taxable income
            </p>
          )}
        </div>

        {/* Age */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>
            <span>YOUR AGE</span>
            <span style={{ color: '#f0f0f0' }}>
              {age < 65 ? age : age < 75 ? `${age} (65+ rebate)` : `${age} (75+ rebate)`}
            </span>
          </label>
          <input type="range" min={18} max={80} value={age} onChange={e => setAge(Number(e.target.value))} />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div style={{
          width: '100%',
          maxWidth: 640,
          animation: 'fadeUp 0.35s ease',
        }}>
          {/* Net take-home hero */}
          <div style={{
            background: 'linear-gradient(135deg, #0d1f14 0%, #0a1a10 100%)',
            border: '1px solid #00e87a33',
            borderRadius: 16,
            padding: 28,
            marginBottom: 12,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 150,
              height: 150,
              background: 'radial-gradient(circle, #00e87a22 0%, transparent 70%)',
              borderRadius: '50%',
            }} />
            <div style={{ fontSize: 11, color: '#00e87a88', fontFamily: 'DM Mono, monospace', letterSpacing: '0.15em', marginBottom: 8 }}>
              MONTHLY TAKE-HOME
            </div>
            <div style={{ fontSize: 'clamp(32px, 8vw, 52px)', fontWeight: 800, color: '#00e87a', lineHeight: 1, marginBottom: 4 }}>
              {formatZAR(result.net.monthly)}
            </div>
            <div style={{ fontSize: 16, color: '#00e87a55', fontFamily: 'DM Mono, monospace' }}>
              {formatZAR(result.net.annual)} per year
            </div>

            {/* Effective tax rate pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 16,
              padding: '6px 12px',
              background: '#0a0a0a44',
              border: '1px solid #00e87a22',
              borderRadius: 20,
            }}>
              <span style={{ fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace' }}>Effective tax rate</span>
              <span style={{ fontSize: 13, color: '#ffe548', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>
                {result.effectiveTaxRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Breakdown card */}
          <div style={{
            background: '#111',
            border: '1px solid #1d1d1d',
            borderRadius: 16,
            padding: 24,
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 11, color: '#444', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 4 }}>
              BREAKDOWN
            </div>
            <DeductionRow
              label="Gross salary"
              monthly={result.grossMonthly}
              annual={result.grossAnnual}
              color="#f0f0f0"
            />
            <DeductionRow
              label="PAYE income tax"
              monthly={-result.paye.monthly}
              annual={-result.paye.annual}
              color="#ff4d4d"
            />
            <DeductionRow
              label="UIF (1%, capped)"
              monthly={-result.uif.monthly}
              annual={-result.uif.annual}
              color="#ff4d4d"
            />
            {result.pension.monthly > 0 && (
              <DeductionRow
                label={`Pension / RA (${pensionPct}%)`}
                monthly={-result.pension.monthly}
                annual={-result.pension.annual}
                color="#ffe548"
              />
            )}
            {/* Net row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 16,
              marginTop: 4,
            }}>
              <span style={{ color: '#00e87a', fontSize: 16, fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>
                Take-home
              </span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#00e87a', fontSize: 18, fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>
                  {formatZAR(result.net.monthly)}<span style={{ color: '#00e87a55', fontSize: 11 }}>/mo</span>
                </div>
                <div style={{ color: '#00e87a55', fontSize: 11, fontFamily: 'DM Mono, monospace' }}>
                  {formatZAR(result.net.annual)}/yr
                </div>
              </div>
            </div>
          </div>

          {/* Conversion info if foreign currency */}
          {currency !== 'ZAR' && (
            <div style={{
              background: '#111',
              border: '1px solid #1d1d1d',
              borderRadius: 12,
              padding: '14px 18px',
              fontSize: 12,
              color: '#555',
              fontFamily: 'DM Mono, monospace',
              lineHeight: 1.7,
            }}>
              <span style={{ color: '#444' }}>Rate used: </span>
              <span style={{ color: '#666' }}>1 {currency} = R{exchangeRate.toFixed(4)}</span>
              <span style={{ color: '#6e6e6e' }}> · Gross in ZAR: {formatZAR(result.grossMonthly)}/mo</span>
            </div>
          )}

          {/* Disclaimer */}
          <p style={{
            marginTop: 16,
            fontSize: 11,
            color: '#cecece',
            fontFamily: 'DM Mono, monospace',
            textAlign: 'center',
            lineHeight: 1.8,
          }}>
            Estimates only · SARS 2026/2027 brackets · Not financial advice
          </p>
        </div>
      ) : (
        <div style={{
          width: '100%',
          maxWidth: 640,
          padding: 40,
          textAlign: 'center',
          color: '#cecece',
          fontFamily: 'DM Mono, monospace',
          fontSize: 13,
        }}>
          Enter a salary above to see your breakdown ↑
        </div>
      )}
    <PayFastButton />

      <footer style={{
        width: '100%',
        maxWidth: 640,
        marginTop: 32,
        paddingBottom: 40,
        textAlign: 'center',
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
        color: '#222',
        lineHeight: 2,
      }}>
        <span style={{ color: '#cecece' }}>NetZA · Made in 🇿🇦</span>
        <span style={{ margin: '0 8px', color: '#cecece' }}>·</span>
        <span style={{ color: '#cecece' }}>SARS 2026/2027 · Estimates only</span>
      </footer>
    </div>
  )
}
