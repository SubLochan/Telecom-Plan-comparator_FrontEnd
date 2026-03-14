import { useState } from 'react'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import styles from './FilterPanel.module.css'

const PLAN_TYPES = ['PREPAID','POSTPAID','FAMILY','BUSINESS','STUDENT']

export default function FilterPanel({ providers=[], onFilter, loading }) {
  const [form, setForm] = useState({ provider:'', planType:'', minMonthlyPrice:'', maxMonthlyPrice:'', fiveGEnabled:null, internationalRoaming:null, hotspotEnabled:null })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSubmit = (e) => {
    e.preventDefault()
    const body={}
    if(form.provider) body.provider=form.provider
    if(form.planType) body.planType=form.planType
    if(form.minMonthlyPrice) body.minMonthlyPrice=Number(form.minMonthlyPrice)
    if(form.maxMonthlyPrice) body.maxMonthlyPrice=Number(form.maxMonthlyPrice)
    if(form.fiveGEnabled!=null) body.fiveGEnabled=form.fiveGEnabled
    if(form.internationalRoaming!=null) body.internationalRoaming=form.internationalRoaming
    if(form.hotspotEnabled!=null) body.hotspotEnabled=form.hotspotEnabled
    onFilter(body)
  }

  const reset = () => {
    setForm({provider:'',planType:'',minMonthlyPrice:'',maxMonthlyPrice:'',fiveGEnabled:null,internationalRoaming:null,hotspotEnabled:null})
    onFilter({})
  }

  const boolBtn=(key,val,label)=>(
    <button type="button"
      className={`${styles.toggleBtn} ${form[key]===val?styles.toggleActive:''}`}
      onClick={()=>set(key,form[key]===val?null:val)}>{label}</button>
  )

  return (
    <form className={styles.panel} onSubmit={handleSubmit}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}><SlidersHorizontal size={14}/> Find Best Mobile Plans</span>
        <button type="button" className={styles.resetBtn} onClick={reset}><RotateCcw size={11}/>Reset</button>
      </div>

      <div className={styles.body}>
        <div className={styles.group}>
          <label className={styles.label}>Monthly Budget (₹)</label>
          <div className={styles.row}>
            <input className={styles.input} type="number" placeholder="Min" min="0"
              value={form.minMonthlyPrice} onChange={e=>set('minMonthlyPrice',e.target.value)}/>
            <span className={styles.dash}>—</span>
            <input className={styles.input} type="number" placeholder="Max" min="0"
              value={form.maxMonthlyPrice} onChange={e=>set('maxMonthlyPrice',e.target.value)}/>
          </div>
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Provider</label>
          <select className={styles.select} value={form.provider} onChange={e=>set('provider',e.target.value)}>
            <option value="">All Providers</option>
            {providers.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Plan Type</label>
          <select className={styles.select} value={form.planType} onChange={e=>set('planType',e.target.value)}>
            <option value="">All Types</option>
            {PLAN_TYPES.map(t=><option key={t} value={t}>{t[0]+t.slice(1).toLowerCase()}</option>)}
          </select>
        </div>

        <div className={styles.group}>
          <label className={styles.label}>5G Network</label>
          <div className={styles.toggleGroup}>{boolBtn('fiveGEnabled',true,'Yes')}{boolBtn('fiveGEnabled',false,'No')}</div>
        </div>

        <div className={styles.group}>
          <label className={styles.label}>International Roaming</label>
          <div className={styles.toggleGroup}>{boolBtn('internationalRoaming',true,'Yes')}{boolBtn('internationalRoaming',false,'No')}</div>
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Mobile Hotspot</label>
          <div className={styles.toggleGroup}>{boolBtn('hotspotEnabled',true,'Yes')}{boolBtn('hotspotEnabled',false,'No')}</div>
        </div>

        <button type="submit" className={styles.applyBtn} disabled={loading}>
          {loading?'Searching…':'Find Best Plans'}
        </button>
      </div>
    </form>
  )
}
