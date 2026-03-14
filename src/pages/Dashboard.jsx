import { useState } from 'react'
import { usePlans, useFilteredPlans, useProviders } from '../hooks/usePlans'
import PlanCard from '../components/ui/PlanCard'
import FilterPanel from '../components/ui/FilterPanel'
import CompareBar from '../components/ui/CompareBar'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, LayoutGrid, Bookmark, BarChart3 } from 'lucide-react'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [page, setPage]       = useState(0)
  const [sortBy, setSortBy]   = useState('monthlyPrice')
  const [sortDir, setSortDir] = useState('asc')
  const [search, setSearch]   = useState('')
  const [activeFilter, setActiveFilter] = useState(null)

  const providers = useProviders()
  const { data: allData,      loading: allLoading }                    = usePlans({ page, size: 12, sortBy, sortDir })
  const { data: filteredData, loading: filterLoading, filter } = useFilteredPlans()

  const data    = activeFilter ? filteredData : allData
  const loading = activeFilter ? filterLoading : allLoading
  const plans   = data?.content ?? []
  const total   = data?.totalElements ?? 0
  const pages   = data?.totalPages ?? 1

  const handleFilter = (body) => {
    if (!body || Object.keys(body).length === 0) {
      setActiveFilter(null)
      setPage(0)
    } else {
      setActiveFilter(body)
      filter(body, 0)
      setPage(0)
    }
  }

  const visiblePlans = search
    ? plans.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.provider.toLowerCase().includes(search.toLowerCase()))
    : plans

  return (
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerBg} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerTop}>
            <div>
              <div className={styles.welcome}>
                Welcome{user ? `, ${user.username}` : ''}! 👋
              </div>
              <div className={styles.bannerTitle}>
                Compare <em>Mobile Plans</em> Easily
              </div>
              <div className={styles.bannerSub}>
                Find the best plan from top providers — filter by budget, data, and features
              </div>
            </div>
            <Link to="/compare" className={styles.startBtn}>Start Comparison →</Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className={styles.quickActions}>
        <Link to="/" className={styles.quickCard}><LayoutGrid size={18} />My Plans</Link>
        <Link to="/compare" className={styles.quickCard}><Bookmark size={18} />Saved Plans</Link>
        <Link to="/reports" className={styles.quickCard}><BarChart3 size={18} />Usage Reports</Link>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <div className={styles.searchInner}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search plans or providers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <FilterPanel providers={providers} onFilter={handleFilter} loading={filterLoading} />
        </aside>

        <main>
          <div className={styles.toolbar}>
            <span className={styles.resultCount}>
              {loading ? '—' : `${visiblePlans.length} of ${total} plans`}
              {activeFilter && <span className={styles.filterTag}>Filtered</span>}
            </span>
            <div className={styles.sortBar}>
              <label className={styles.sortLabel}>Sort by</label>
              <select className={styles.sortSelect} value={sortBy}
                onChange={e => { setSortBy(e.target.value); setPage(0) }}>
                <option value="monthlyPrice">Price</option>
                <option value="name">Name</option>
                <option value="provider">Provider</option>
                <option value="createdAt">Newest</option>
              </select>
              <button className={styles.sortDirBtn}
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`skeleton ${styles.skeletonCard}`} />
              ))}
            </div>
          ) : visiblePlans.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📭</div>
              <p>No plans match your criteria.</p>
              <button className={styles.emptyBtn} onClick={() => handleFilter({})}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {visiblePlans.map((plan, i) => (
                <PlanCard key={plan.id} plan={plan} delay={i * 40} />
              ))}
            </div>
          )}

          {!activeFilter && pages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled={page === 0}
                onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button key={i}
                  className={`${styles.pageBtn} ${i === page ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(i)}>
                  {i + 1}
                </button>
              ))}
              <button className={styles.pageBtn} disabled={page >= pages - 1}
                onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>

      <CompareBar />
    </div>
  )
}
