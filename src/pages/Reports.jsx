import { useEffect, useState } from 'react'
import { planService } from '../services/planService'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts'
import { formatPrice } from '../utils/formatters'
import styles from './Reports.module.css'

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#A78BFA']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' && p.value > 100 ? formatPrice(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const [plans, setPlans]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    planService.getAll(0, 100)
      .then(d => setPlans(d?.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <h1 className={styles.title}>Usage Reports</h1>
        </div>
      </div>
      <div className={styles.inner}>
        <div className={styles.loadingGrid}>
          {[1, 2, 3, 4].map(i => <div key={i} className={`skeleton ${styles.skeletonChart}`} />)}
        </div>
      </div>
    </div>
  )

  // ── Derived chart data ────────────────────────────────────────────
  const priceByProvider = Object.values(
    plans.reduce((acc, p) => {
      if (!acc[p.provider]) acc[p.provider] = { provider: p.provider, total: 0, count: 0 }
      acc[p.provider].total += parseFloat(p.monthlyPrice)
      acc[p.provider].count++
      return acc
    }, {})
  ).map(d => ({ provider: d.provider, avgPrice: Math.round(d.total / d.count) }))
    .sort((a, b) => a.avgPrice - b.avgPrice)

  const plansByType = Object.entries(
    plans.reduce((acc, p) => { acc[p.planType] = (acc[p.planType] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name: name[0] + name.slice(1).toLowerCase(), value }))

  const featureData = [
    { feature: '5G',        count: plans.filter(p => p.fiveGEnabled).length },
    { feature: 'Roaming',   count: plans.filter(p => p.internationalRoaming).length },
    { feature: 'Hotspot',   count: plans.filter(p => p.hotspotEnabled).length },
    { feature: 'No Lock-in',count: plans.filter(p => p.contractMonths === 0).length },
  ]

  const buckets = [
    { range: '₹0–30',  count: plans.filter(p => p.monthlyPrice <= 30).length },
    { range: '₹31–50', count: plans.filter(p => p.monthlyPrice > 30 && p.monthlyPrice <= 50).length },
    { range: '₹51–80', count: plans.filter(p => p.monthlyPrice > 50 && p.monthlyPrice <= 80).length },
    { range: '₹80+',   count: plans.filter(p => p.monthlyPrice > 80).length },
  ]

  const avgPrice = plans.length
    ? plans.reduce((s, p) => s + parseFloat(p.monthlyPrice), 0) / plans.length
    : 0

  const stats = [
    { label: 'Total Plans',  val: plans.length },
    { label: 'Providers',    val: [...new Set(plans.map(p => p.provider))].length },
    { label: 'Avg Price',    val: formatPrice(avgPrice) },
    { label: '5G Plans',     val: plans.filter(p => p.fiveGEnabled).length },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <h1 className={styles.title}>Alerts & Usage Reports</h1>
          <p className={styles.sub}>Visual analytics and market breakdown across all telecom providers</p>
        </div>
      </div>

      <div className={styles.inner}>
        <div className={styles.statRow}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statVal}>{s.val}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.grid}>
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Average Price by Provider</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={priceByProvider} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="provider" tick={{ fill: '#4B5675', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4B5675', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                <Bar dataKey="avgPrice" name="Avg Price" radius={[4, 4, 0, 0]} fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Plans by Type (Distribution)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={plansByType} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={85} innerRadius={40}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {plansByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Feature Adoption (Plans Count)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={featureData} layout="vertical" margin={{ top: 8, right: 12, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#4B5675', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="feature" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                <Bar dataKey="count" name="Plans" radius={[0, 4, 4, 0]} fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Price Distribution</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={buckets} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: '#4B5675', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4B5675', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                <Area type="monotone" dataKey="count" name="Plans"
                  stroke="#3B82F6" fill="rgba(59,130,246,0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
