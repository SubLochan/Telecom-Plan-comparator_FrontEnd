import { useNavigate } from 'react-router-dom'
import { useCompare } from '../../context/CompareContext'
import { GitCompare, X, Trash2 } from 'lucide-react'
import styles from './CompareBar.module.css'

export default function CompareBar() {
  const { selected, toggle, clear } = useCompare()
  const navigate = useNavigate()

  if (selected.length === 0) return null

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <GitCompare size={16} className={styles.icon}/>
          <span className={styles.count}>{selected.length} plan{selected.length>1?'s':''} selected</span>
          <div className={styles.chips}>
            {selected.map(p=>(
              <span key={p.id} className={styles.chip}>
                {p.name}
                <button className={styles.chipRemove} onClick={()=>toggle(p)}><X size={10}/></button>
              </span>
            ))}
          </div>
        </div>
        <div className={styles.right}>
          <button className={styles.clearBtn} onClick={clear}><Trash2 size={13}/>Clear</button>
          <button className={styles.compareBtn} disabled={selected.length<2} onClick={()=>navigate('/compare')}>
            Compare Now →
          </button>
        </div>
      </div>
    </div>
  )
}
