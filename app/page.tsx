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
        onClick={() => setFilters(f => ({ ...f, [filterKey]: value }))}
        style={{
          padding: '5px 14px', borderRadius: 20,
          border: `1px solid ${active ? 'var(--text)' : 'var(--border)'}`,
          background: active ? 'var(--text)' : 'var(--surface)',
          color: active ? 'white' : 'var(--text)',
          fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
          transition: 'all 0.15s'
        }}
      >{label}</button>
    )
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>

      {/* HEADER */}
      <header style={{ marginBottom: 48 }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
            color: 'var(--text-muted)', textTransform: 'uppercase',
            background: 'var(--accent-light)', padding: '4px 10px', borderRadius: 4
          }}>Digital Product Passport</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 8 }}>HARPO</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Miguel Milá & Gonzalo Milá · 2014 · Urbidermis, S.L.</p>
      </header>

      {/* BENEFICIOS */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
        {[
          { icon: '♻', title: 'Cradle to Cradle®', desc: 'Primera empresa del mundo en certificar mobiliario urbano C2C' },
          { icon: '🌲', title: 'FSC & PEFC', desc: 'Madera certificada de origen sostenible' },
          { icon: '⟳', title: 'Vida útil 25 años', desc: 'Alta reparabilidad y repuestos disponibles' },
        ].map(b => (
          <div key={b.title} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '20px 24px', flex: 1, minWidth: 180
          }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>{b.icon}</div>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{b.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{b.desc}</div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 70 }}>Tipología</span>
          <FilterBtn filterKey="tipologia" value="all" label="Todos" />
          {['Banco','Banqueta','Mesa','Lounge chair','Chaise longue'].map(t => (
            <FilterBtn key={t} filterKey="tipologia" value={t} label={t} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 70 }}>Longitud</span>
          <FilterBtn filterKey="longitud" value="all" label="Todos" />
          {['0.6','1.2','1.75','3'].map(l => (
            <FilterBtn key={l} filterKey="longitud" value={l} label={`${l} m`} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 70 }}>Material</span>
          <FilterBtn filterKey="material" value="all" label="Todos" />
          {['Aluminio','Madera tropical','Pino europeo'].map(m => (
            <FilterBtn key={m} filterKey="material" value={m} label={m} />
          ))}
        </div>
      </div>

      {/* GRID */}
      {ORDER.map(tip => {
        const items = byTipologia[tip]
        if (!items?.length) return null
        return (
          <section key={tip} style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)'
            }}>{tip}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
              {items.map(r => (
                <Link key={r.id} href={`/product/${r.referencia}`} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '20px 24px', display: 'block',
                  textDecoration: 'none', transition: 'border-color 0.15s'
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{r.referencia}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{r.nombre_comercial_completo}</div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}

      {filtered.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, padding: '32px 0' }}>No hay referencias con estos filtros.</p>
      )}

      <footer style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12 }}>
        <p>Urbidermis, S.L. · DPP v1.0 · ESPR (UE) 2024/1781</p>
      </footer>
    </main>
  )
}
