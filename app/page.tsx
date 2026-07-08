'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Ref {
  id: string
  referencia: string
  tipologia: string
  longitud_m: string
  nombre_comercial_completo: string
}

export default function Home() {
  const [refs, setRefs] = useState<Ref[]>([])
  const [filters, setFilters] = useState({ tipologia: 'all', longitud: 'all', material: 'all' })

  useEffect(() => {
    fetch('/api/refs').then(r => r.json()).then(setRefs)
  }, [])

  function getMaterial(nombre: string) {
    const n = (nombre || '').toLowerCase()
    if (n.includes('alumin')) return 'Aluminio'
    if (n.includes('tropical')) return 'Madera tropical'
    if (n.includes('pino') || n.includes('pine') || n.includes('pefc')) return 'Pino europeo'
    return ''
  }

  const filtered = refs.filter(r => {
    const tipOk = filters.tipologia === 'all' || r.tipologia === filters.tipologia
    const lonOk = filters.longitud === 'all' || String(r.longitud_m) === filters.longitud
    const matOk = filters.material === 'all' || getMaterial(r.nombre_comercial_completo) === filters.material
    return tipOk && lonOk && matOk
  })

  const ORDER = ['Banco','Banqueta','Mesa','Lounge chair','Chaise longue']
  const byTipologia: Record<string, Ref[]> = {}
  filtered.forEach(r => {
    const t = r.tipologia || 'Otros'
    if (!byTipologia[t]) byTipologia[t] = []
    byTipologia[t].push(r)
  })

  function FilterBtn({ filterKey, value, label }: { filterKey: string; value: string; label: string }) {
    const active = filters[filterKey as keyof typeof filters] === value
    return (
      <button
        className={`filter-btn${active ? ' active' : ''}`}
        onClick={() => setFilters(f => ({ ...f, [filterKey]: value }))}
      >{label}</button>
    )
  }

  return (
    <main style={{ maxWidth: 1056, margin: '0 auto', padding: '48px 16px' }}>

      {/* HEADER */}
      <header style={{ borderBottom: '1px solid var(--cds-border-subtle-00)', paddingBottom: 32, marginBottom: 40 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--cds-text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>
          Digital Product Passport
        </p>
        <h1 style={{ fontSize: 42, fontWeight: 300, letterSpacing: '-0.01em', marginBottom: 8, color: 'var(--cds-text-primary)' }}>HARPO</h1>
        <p style={{ fontSize: 14, color: 'var(--cds-text-secondary)', fontWeight: 300 }}>
          Miguel Milá & Gonzalo Milá · 2014 · Urbidermis, S.L.
        </p>
      </header>

      {/* BENEFICIOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1, marginBottom: 40, background: 'var(--cds-border-subtle-00)' }}>
        {[
          { icon: '♻', title: 'Cradle to Cradle®', desc: 'Primera empresa del mundo en certificar mobiliario urbano C2C' },
          { icon: '🌲', title: 'FSC & PEFC', desc: 'Madera 100% certificada de origen sostenible' },
          { icon: '⟳', title: 'Vida útil 25 años', desc: 'Alta reparabilidad y repuestos disponibles' },
        ].map(b => (
          <div key={b.title} style={{ background: 'var(--cds-background)', padding: '24px 20px' }}>
            <div style={{ fontSize: 20, marginBottom: 10 }}>{b.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{b.title}</div>
            <div style={{ fontSize: 13, color: 'var(--cds-text-secondary)', lineHeight: 1.5 }}>{b.desc}</div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div style={{ background: 'var(--cds-background)', border: '1px solid var(--cds-border-subtle-00)', padding: '20px 24px', marginBottom: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'tipologia', label: 'Tipología', options: ['Banco','Banqueta','Mesa','Lounge chair','Chaise longue'] },
            { key: 'longitud', label: 'Longitud', options: ['0.6 m:0.6','1.2 m:1.2','1.75 m:1.75','3 m:3'] },
            { key: 'material', label: 'Material', options: ['Aluminio','Madera tropical','Pino europeo'] },
          ].map(({ key, label, options }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--cds-text-secondary)', width: 72, flexShrink: 0 }}>{label}</span>
              <FilterBtn filterKey={key} value="all" label="Todos" />
              {options.map(o => {
                const [lbl, val] = o.includes(':') ? o.split(':') : [o, o]
                return <FilterBtn key={val} filterKey={key} value={val} label={lbl} />
              })}
            </div>
          ))}
        </div>
      </div>

      {/* GRID */}
      {filtered.length === 0 && (
        <p style={{ color: 'var(--cds-text-secondary)', fontSize: 14, padding: '32px 0' }}>No hay referencias con estos filtros.</p>
      )}

      {ORDER.map(tip => {
        const items = byTipologia[tip]
        if (!items?.length) return null
        return (
          <section key={tip} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cds-text-secondary)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--cds-border-subtle-00)' }}>
              {tip}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1, background: 'var(--cds-border-subtle-00)' }}>
              {items.map(r => (
                <Link key={r.id} href={`/product/${r.referencia}`} className="cds-tile">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, color: 'var(--cds-interactive)', marginBottom: 6 }}>{r.referencia}</div>
                  <div style={{ fontSize: 13, color: 'var(--cds-text-secondary)', lineHeight: 1.4 }}>
                    {r.nombre_comercial_completo.replace(/@/g, '').trim()}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}

      <footer style={{ marginTop: 64, paddingTop: 16, borderTop: '1px solid var(--cds-border-subtle-00)', color: 'var(--cds-text-secondary)', fontSize: 12 }}>
        Urbidermis, S.L. · DPP v1.0 · ESPR (UE) 2024/1781
      </footer>
    </main>
  )
}
