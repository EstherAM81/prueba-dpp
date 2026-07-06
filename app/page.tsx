import { getAllReferencias } from '../lib/notion'
import Link from 'next/link'

export const revalidate = 3600

const TIPOLOGIA_ORDER = ['Banco', 'Banqueta', 'Mesa', 'Lounge chair', 'Chaise longue']

export default async function Home() {
  const refs = await getAllReferencias()
  const sorted = [...refs].sort((a, b) => {
    const ta = TIPOLOGIA_ORDER.indexOf(a.tipologia)
    const tb = TIPOLOGIA_ORDER.indexOf(b.tipologia)
    if (ta !== tb) return ta - tb
    return a.referencia.localeCompare(b.referencia)
  })

  const byTipologia = sorted.reduce((acc, r) => {
    const t = r.tipologia || 'Otros'
    if (!acc[t]) acc[t] = []
    acc[t].push(r)
    return acc
  }, {} as Record<string, typeof refs>)

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
      <header style={{ marginBottom: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            background: 'var(--accent-light)',
            padding: '4px 10px',
            borderRadius: 4
          }}>Digital Product Passport</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 12 }}>
          HARPO
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Colección de mobiliario urbano exterior · Urbidermis, S.L.
        </p>
      </header>

      {Object.entries(byTipologia).map(([tipologia, items]) => (
        <section key={tipologia} style={{ marginBottom: 48 }}>
          <h2 style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 16,
            paddingBottom: 8,
            borderBottom: '1px solid var(--border)'
          }}>{tipologia}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {items.map(ref => (
              <Link key={ref.id} href={`/product/${ref.referencia}`}>
                <div className="ref-card">
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 8
                  }}>{ref.referencia}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {(ref.nombre_comercial_completo || `${ref.tipologia} ${ref.longitud_m ? ref.longitud_m + ' m' : ''}`).replace(/@/g, '')}
                  </div>
                  {ref.peso_kg && (
                    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                      {ref.peso_kg} kg
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <footer style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12 }}>
        <p>Urbidermis, S.L. · DPP v1.0 · ESPR (UE) 2024/1781</p>
      </footer>
    </main>
  )
}
