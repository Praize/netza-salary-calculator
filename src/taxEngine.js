// SARS 2026/2027 Tax Brackets
const TAX_BRACKETS = [
  { min: 0,         max: 245100,  rate: 0.18, base: 0 },
  { min: 245100,    max: 381200,  rate: 0.26, base: 44118 },
  { min: 381200,    max: 528500,  rate: 0.31, base: 79511 },
  { min: 528500,    max: 731900,  rate: 0.36, base: 125193 },
  { min: 731900,    max: 1103400, rate: 0.39, base: 198413 },
  { min: 1103400,   max: 1581600, rate: 0.41, base: 343374 },
  { min: 1581600,   max: Infinity,rate: 0.45, base: 539460 },
]

// 2026/2027 Rebates
const REBATES = {
  primary: 17820,   // Under 65
  secondary: 9756,  // 65–74
  tertiary: 3240,   // 75+
}

// UIF cap
const UIF_MONTHLY_CAP = 177.12
const UIF_RATE = 0.01

export function calcPAYE(annualIncome, age = 30) {
  if (annualIncome <= 0) return 0

  let tax = 0
  for (const bracket of TAX_BRACKETS) {
    if (annualIncome > bracket.min) {
      const taxable = Math.min(annualIncome, bracket.max) - bracket.min
      tax = bracket.base + taxable * bracket.rate
      if (annualIncome <= bracket.max) break
    }
  }

  // Subtract rebates based on age
  let rebate = REBATES.primary
  if (age >= 65) rebate += REBATES.secondary
  if (age >= 75) rebate += REBATES.tertiary

  return Math.max(0, tax - rebate)
}

export function calcUIF(monthlyGross) {
  return Math.min(monthlyGross * UIF_RATE, UIF_MONTHLY_CAP)
}

export function calcSalary({ grossMonthly, pensionPct = 0, age = 30 }) {
  const annualGross = grossMonthly * 12

  // Pension is pre-tax deduction (capped at 27.5%)
  const pensionMonthly = grossMonthly * (pensionPct / 100)
  const pensionAnnual = pensionMonthly * 12

  const taxableAnnual = Math.max(0, annualGross - pensionAnnual)
  const annualPAYE = calcPAYE(taxableAnnual, age)
  const monthlyPAYE = annualPAYE / 12

  const monthlyUIF = calcUIF(grossMonthly)

  const totalDeductionsMonthly = monthlyPAYE + monthlyUIF + pensionMonthly
  const netMonthly = grossMonthly - totalDeductionsMonthly

  return {
    grossMonthly,
    grossAnnual: annualGross,
    paye: { monthly: monthlyPAYE, annual: annualPAYE },
    uif: { monthly: monthlyUIF, annual: monthlyUIF * 12 },
    pension: { monthly: pensionMonthly, annual: pensionAnnual },
    totalDeductions: { monthly: totalDeductionsMonthly, annual: totalDeductionsMonthly * 12 },
    net: { monthly: netMonthly, annual: netMonthly * 12 },
    effectiveTaxRate: annualGross > 0 ? (annualPAYE / annualGross) * 100 : 0,
  }
}

export function formatZAR(amount) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
