export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)

export const formatData = (gb) =>
  gb == null ? 'Unlimited' : gb >= 1000 ? `${(gb / 1000).toFixed(1)} TB` : `${gb} GB`

export const formatCalls = (minutes) =>
  minutes == null ? 'Unlimited' : `${minutes} min`

export const formatSms = (count) =>
  count == null ? 'Unlimited' : `${count} SMS`

export const formatRating = (rating) =>
  rating ? rating.toFixed(1) : 'N/A'

export const planTypeLabel = (type) => ({
  PREPAID: 'Prepaid',
  POSTPAID: 'Postpaid',
  FAMILY: 'Family',
  BUSINESS: 'Business',
  STUDENT: 'Student',
}[type] ?? type)

export const planTypeColor = (type) => ({
  PREPAID:  '#00d4ff',
  POSTPAID: '#7c3aed',
  FAMILY:   '#00c48c',
  BUSINESS: '#ff6b35',
  STUDENT:  '#ffb547',
}[type] ?? '#8a95a8')

export const stars = (rating) => {
  const n = Math.round(rating ?? 0)
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}
