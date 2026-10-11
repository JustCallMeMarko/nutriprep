// Shared client-side input rules. The backend enforces the same limits in
// its Pydantic schemas / Form constraints, so keep both in sync.
export const LIMITS = {
  HEIGHT_CM: { min: 50, max: 300 },
  WEIGHT_KG: { min: 20, max: 500 },
  ADDRESS_MIN: 10,
  ADDRESS_MAX: 255,
  NAME_MAX: 100,
  DESCRIPTION_MAX: 2000,
  CALORIES_MAX: 10_000,
  MACRO_MAX: 5_000,
  CREDITS_MAX: 100_000,
  STOCKS_MAX: 1_000_000,
  MESSAGE_MAX: 2_000,
  PLATE_MIN: 2,
  PLATE_MAX: 50,
} as const

const PH_MOBILE_DIGITS = /^9\d{9}$/
const PHONE_CHARACTERS = /[^\d\s\-()+]/g

// Keeps the field forgiving while typing; the number is normalised to +63 on submit.
export function sanitizePhoneInput(value: string) {
  return value.replace(PHONE_CHARACTERS, "").slice(0, 25)
}

// Reduces any accepted PH format (0917..., 917..., 63917..., +63 917...) to the
// 10-digit mobile number that is sent as +63.
export function toLocalDigits(value: string) {
  let digits = value.replace(/\D/g, "")
  if (digits.startsWith("63")) digits = digits.slice(2)
  else if (digits.startsWith("0")) digits = digits.slice(1)
  return digits.slice(0, 10)
}

export function isValidPhMobile(value: string) {
  return PH_MOBILE_DIGITS.test(toLocalDigits(value))
}

export function normalizePhMobile(value: string) {
  return `+63${toLocalDigits(value)}`
}

export const PH_MOBILE_ERROR = "Enter a valid PH mobile number, e.g. +63 917 123 4567."

export function isNumberInRange(value: number | string, min: number, max: number) {
  if (value === "") return false
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= min && parsed <= max
}

// Error for an optional non-negative numeric field (empty is allowed).
export function nonNegativeError(value: string, label: string, max: number) {
  if (value.trim() === "") return ""
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return `${label} can't be negative.`
  if (parsed > max) return `${label} can't exceed ${max.toLocaleString()}.`
  return ""
}
