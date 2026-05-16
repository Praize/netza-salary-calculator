// ─────────────────────────────────────────────
// PayFast "Buy me a coffee" component
//
// TODO: Replace these two values when you sign up at payfast.io
 
const MERCHANT_ID = import.meta.env.VITE_PAYFAST_MERCHANT_ID
const MERCHANT_KEY = import.meta.env.VITE_PAYFAST_MERCHANT_KEY
// ─────────────────────────────────────────────

const PAYFAST_URL = 'https://www.payfast.co.za/eng/process'
// const PAYFAST_URL = 'https://sandbox.payfast.co.za/eng/process'

const AMOUNTS = [
  { label: '☕ R20',  value: 20,  note: 'One coffee' },
  { label: '☕☕ R50', value: 50,  note: 'Two coffees' },
  { label: '🍕 R100', value: 100, note: 'A slice of pizza' },
]

export default function PayFastButton() {
  function handlePay(amount) {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = PAYFAST_URL
    form.target = '_blank'

    const fields = {
      merchant_id:          MERCHANT_ID,
      merchant_key:         MERCHANT_KEY,
      return_url:           window.location.href,
      cancel_url:           window.location.href,
      notify_url:           '',                        // optional: webhook URL
      name_first:           'NetZA',
      name_last:            'Supporter',
      amount:               amount.toFixed(2),
      item_name:            'Buy NetZA a coffee',
      item_description:     'Supporting a free SA salary tool ☕',
    }

    Object.entries(fields).forEach(([key, val]) => {
      const input = document.createElement('input')
      input.type  = 'hidden'
      input.name  = key
      input.value = val
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 640,
      margin: '32px auto 0',
      padding: '24px',
      background: '#111',
      border: '1px solid #1d1d1d',
      borderRadius: 16,
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: 13,
        color: '#444',
        fontFamily: 'DM Mono, monospace',
        marginBottom: 4,
        lineHeight: 1.7,
      }}>
        Built by a South African, for South Africans.
      </p>
      <p style={{
        fontSize: 13,
        color: '#e5f440',
        fontFamily: 'DM Mono, monospace',
        marginBottom: 20,
        lineHeight: 1.7,
      }}>
        If this saved you time, buy me a coffee ☕
      </p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {AMOUNTS.map(({ label, value, note }) => (
          <button
            key={value}
            onClick={() => handlePay(value)}
            title={note}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              color: '#666',
              fontFamily: 'DM Mono, monospace',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = '#00e87a'
              e.target.style.color = '#00e87a'
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = '#2a2a2a'
              e.target.style.color = '#666'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <p style={{
        marginTop: 14,
        fontSize: 11,
        color: '#cecece',
        fontFamily: 'DM Mono, monospace',
      }}>
        Secured by PayFast · ZAR · No account needed
      </p>
    </div>
  )
}
