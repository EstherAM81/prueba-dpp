'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DPPData {
  ref: any
  empresa: any
  lca: any
  documentos: any[]
  masa: any
  matPrincipal: any[]
  matSecundario: any[]
  coleccion: any
  certificaciones: any[]
  normas: any[]
}

const GWP_MAX_COLLECTION = 350 // kg CO2 approximate max in collection for bar scale

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section style={{ marginBottom: 32 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
          paddingBottom: 8, marginBottom: open ? 16 : 0, cursor: defaultOpen ? 'default' : 'pointer',
          textAlign: 'left'
        }}
      >
        <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
          {title}
        </h2>
        {!defaultOpen && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>}
      </button>
      {open && children}
    </section>
  )
}

function Row({ label, value, mono, link }: { label: string; value?: string; mono?: boolean; link?: boolean }) {
  if (!value) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'start' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      {link
        ? <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--green)', wordBreak: 'break-all' }}>{value}</a>
        : <span style={{ fontSize: 13, fontFamily: mono ? 'var(--font-mono)' : 'inherit', wordBreak: 'break-all' }}>{value}</span>
      }
    </div>
  )
}

function RowPending({ label, nota }: { label: string; nota?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'start' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 12, color: '#C0392B', background: '#FDF0EE', padding: '3px 8px', borderRadius: 4, display: 'inline-block', fontFamily: 'var(--font-mono)' }}>
        ⚠ Pendiente{nota ? ` — ${nota}` : ''}
      </span>
    </div>
  )
}

function MaterialChip({ label, pct, green }: { label: string; pct: string; green?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: green ? 'var(--green-light)' : 'var(--accent-light)',
      border: `1px solid ${green ? '#2D6A4F33' : 'var(--border)'}`,
      borderRadius: 8, padding: '10px 16px', marginRight: 8, marginBottom: 8
    }}>
      <span style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: green ? 'var(--green)' : 'var(--text)' }}>{pct}%</span>
      <span style={{ fontSize: 12, color: green ? 'var(--green)' : 'var(--text-muted)', lineHeight: 1.3 }}>{label}</span>
    </div>
  )
}

function LCACard({ label, value, unit }: { label: string; value: string; unit: string }) {
  if (!value) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{unit}</div>
    </div>
  )
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<DPPData | null>(null)
  const [loading, setLoading] = useState(true)
  const [passportOpen, setPassportOpen] = useState(false)
  const slug = decodeURIComponent(params.slug)

  useEffect(() => {
    fetch(`/api/product/${slug}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [slug])

  if (loading) return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', color: 'var(--text-muted)' }}>
      Cargando...
    </main>
  )

  if (!data?.ref) return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <p>Referencia no encontrada.</p>
    </main>
  )

  const { ref, empresa, lca, documentos, masa, matPrincipal, matSecundario, coleccion, certificaciones, normas } = data
  const nombre = (ref.nombre_comercial_completo || ref.referencia).replace(/@/g, '').trim()
  const gwpValue = lca?.gwp_no_biogenico ? parseFloat(lca.gwp_no_biogenico) : 0
  const gwpPct = Math.min((gwpValue / GWP_MAX_COLLECTION) * 100, 100)

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>
        ← Todas las referencias
      </Link>

      {/* HEADER */}
      <header style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', background: 'var(--accent-light)', padding: '4px 10px', borderRadius: 4 }}>
                Digital Product Passport · v{ref.dpp_version || '1.0'}
              </span>
              {ref.tipologia && <span style={{ fontSize: 12, fontWeight: 500, background: 'var(--accent-light)', padding: '3px 10px', borderRadius: 4 }}>{ref.tipologia}</span>}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 6 }}>{ref.referencia}</div>
            <h1 style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{nombre}</h1>
            {ref.dpp_issued_at && <p style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 13 }}>Emitido: {ref.dpp_issued_at}</p>}
          </div>

          {/* PASSPORT ID — secundario */}
          <div style={{ minWidth: 200 }}>
            <div style={{ background: 'var(--accent-light)', borderRadius: 8, padding: '12px 16px', fontSize: 12 }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pasaporte digital</div>
              {ref.dpp_uuid && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 8, wordBreak: 'break-all' }}>{ref.dpp_uuid}</div>}
              <button
                onClick={() => setPassportOpen(o => !o)}
                style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}
              >
                {passportOpen ? 'Ocultar detalles' : 'Ver detalles técnicos'}
              </button>
              {passportOpen && (
                <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Versión</div>
                  <div style={{ fontSize: 12, marginBottom: 8 }}>{ref.dpp_version || '1.0'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Estado</div>
                  <div style={{ fontSize: 12, marginBottom: 8 }}>Active</div>
                  {ref.dpp_url && <>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>URL pública</div>
                    <a href={ref.dpp_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--green)', wordBreak: 'break-all' }}>{ref.dpp_url}</a>
                  </>}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* B · PRODUCTO */}
      <Section title="B · Identificación del producto">
        <Row label="Nombre comercial" value={nombre} />
        <Row label="Modelo / Referencia" value={ref.referencia} mono />
        <Row label="Tipología" value={ref.tipologia} />
        <Row label="Colección" value={coleccion?.name} />
        {coleccion?.ano_diseno && <Row label="Año de diseño" value={coleccion.ano_diseno} />}
        {coleccion?.disenadores && <Row label="Diseñadores" value={coleccion.disenadores} />}
        <Row label="Dimensiones (largo × ancho × alto)" value={ref.dim_largo_cm && ref.dim_ancho_cm && ref.dim_alto_cm ? `${ref.dim_largo_cm} × ${ref.dim_ancho_cm} × ${ref.dim_alto_cm} cm` : undefined} />
        {ref.adaptado_silla_ruedas === 'Sí' && <Row label="Adaptado silla de ruedas" value="Sí" />}
        <RowPending label="GTIN (14 dígitos)" nota="Registrar en GS1 Spain" />
        <RowPending label="Código eCl@ss" nota="Asignar código de categoría de producto" />
      </Section>

      {/* C · FABRICANTE */}
      {empresa && (
        <Section title="C · Fabricante">
          <Row label="Razón social" value={empresa.nombre} />
          <Row label="Nombre comercial" value={empresa.nombre_comercial} />
          <Row label="Domicilio social" value={empresa.domicilio} />
          <Row label="Lugar de producción" value={empresa.lugar_produccion} />
          <Row label="País de fabricación" value={empresa.pais_fabricacion} />
          <Row label="NIF / CIF" value={empresa.nif} />
          <Row label="Número EORI" value={empresa.eori} />
          <Row label="Web" value={empresa.web} link />
          <Row label="Email contacto DPP" value={empresa.email_dpp} />
          <RowPending label="GLN (Global Location Number)" nota="Registrar en GS1 Spain" />
        </Section>
      )}

      {/* D · MATERIALES */}
      {(matPrincipal.length > 0 || matSecundario.length > 0) && (
        <Section title="D · Materiales y contenido reciclado">
          {[...matPrincipal, ...matSecundario].filter(Boolean).map((m: any, i: number) => (
            <div key={i} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: i < matPrincipal.length + matSecundario.length - 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>{m.name}</div>
              <div style={{ marginBottom: 12 }}>
                {m.recycled_content && m.recycled_content !== '0' && (
                  <MaterialChip label="Reciclado" pct={m.recycled_content} green />
                )}
                {m.virgin_content && m.virgin_content !== '0' && (
                  <MaterialChip label="Virgen" pct={m.virgin_content} />
                )}
              </div>
              <Row label="Origen" value={m.origen} />
              <Row label="Aleación / clasificación" value={m.tipo_material} />
              <Row label="Tratamiento superficie" value={m.tratamiento} />
              <Row label="Especie madera" value={m.especie_madera} />
              <Row label="Reciclable" value={m.reciclable === 'Sí' ? '✓ Sí' : m.reciclable} />
            </div>
          ))}
          <Row label="Embalaje (excluido del peso)" value={ref.embalaje_kg ? `${ref.embalaje_kg} kg · Cartón canal BC · 100% reciclado · Clase A` : undefined} />
        </Section>
      )}

      {/* E · LCA */}
      {lca && (
        <Section title="E · Huella de carbono y LCA">
          {gwpValue > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                GWP sin biogénico — {lca.gwp_no_biogenico} kg CO₂ eq
              </div>
              <div style={{ background: 'var(--border)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${gwpPct}%`, height: '100%', background: 'var(--green)', borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                <span>0 kg CO₂</span>
                <span>{GWP_MAX_COLLECTION} kg CO₂</span>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
            <LCACard label="GWP sin biogénico" value={lca.gwp_no_biogenico} unit="kg CO₂ eq" />
            <LCACard label="GWP con biogénico" value={lca.gwp_con_biogenico} unit="kg CO₂ eq" />
            <LCACard label="Energía no renovable" value={lca.energia_no_renovable} unit="MJ" />
            <LCACard label="Escasez de agua" value={lca.escasez_agua} unit="m³ world eq" />
            <LCACard label="Agua neta" value={lca.agua_neta} unit="m³" />
            <LCACard label="Acidificación" value={lca.acidificacion} unit="mol H⁺ eq" />
            <LCACard label="Agotamiento ozono" value={lca.agotamiento_ozono} unit="kg CFC-11 eq" />
            <LCACard label="Recursos minerales" value={lca.recursos_minerales} unit="kg Sb-eq" />
            <LCACard label="Uso del suelo" value={lca.uso_suelo} unit="Pt" />
          </div>
          <Row label="Alcance" value={lca.alcance} />
          <Row label="Metodología" value={lca.metodologia} />
          <Row label="Proveedor LCA" value={lca.proveedor} />
          <Row label="Fuente" value={lca.fuente} />
        </Section>
      )}

      {/* F · NORMAS — desplegable */}
      {normas.length > 0 && (
        <Section title="F · Normas aplicables" defaultOpen={false}>
          {normas.map((norma: any, i: number) => norma && (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ fontWeight: 500, fontSize: 13, fontFamily: 'var(--font-mono)' }}>{norma.name}</div>
                {norma.ambito && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{norma.ambito}</div>}
              </div>
              {norma.descripcion && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{norma.descripcion}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* G · CERTIFICACIONES */}
      {certificaciones.length > 0 && (
        <Section title="G · Certificaciones">
          {certificaciones.map((cert: any, i: number) => cert && (
            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{cert.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cert.organismo}{cert.tipo ? ` · ${cert.tipo}` : ''}</div>
                  {cert.ambito && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cert.ambito}</div>}
                </div>
                {cert.pdf && (
                  <a href={cert.pdf} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--green)', whiteSpace: 'nowrap', background: 'var(--green-light)', padding: '4px 10px', borderRadius: 4 }}>
                    Ver PDF →
                  </a>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* H · MASA */}
      <Section title="H · Masa del producto">
        <Row label="Peso total del producto" value={ref.peso_kg ? `${ref.peso_kg} kg` : undefined} />
        {masa && <>
          <Row label="Listones / superficie" value={masa.listones ? `${masa.listones} kg` : undefined} />
          <Row label="Estructura" value={masa.estructura ? `${masa.estructura} kg` : undefined} />
          <Row label="Tornillería" value={masa.tornilleria ? `${masa.tornilleria} kg` : undefined} />
        </>}
        <Row label="Embalaje (excluido)" value={ref.embalaje_kg ? `${ref.embalaje_kg} kg` : undefined} />
      </Section>

      {/* I · SOSTENIBILIDAD */}
      {coleccion && (
        <Section title="I · Sostenibilidad y fin de vida">
          <Row label="Reparabilidad" value={coleccion.reparabilidad} />
          <Row label="Desmontaje" value={coleccion.desmontaje} />
          <Row label="Vida útil declarada" value={coleccion.vida_util_anos ? `${coleccion.vida_util_anos} años` : undefined} />
          <Row label="Fin de vida" value="Desmontaje manual. Separación por material para reciclaje diferenciado." />
          <Row label="Gestión fin de vida" value="A cargo del operador responsable de la instalación, según normativa local de residuos" />
          <RowPending label="Clase de reciclabilidad (A-D)" nota="Realizar evaluación según metodología declarada" />
          <RowPending label="URL take-back / fin de vida" nota="Crear URL pública QR-resolvable" />
          <RowPending label="URL repuestos (10+ años)" nota="Crear página o email específico para recambios" />
        </Section>
      )}

      {/* J · SUSTANCIAS */}
      <Section title="J · Sustancias y cumplimiento químico">
        <RowPending label="Sustancias de preocupación (SVHC)" nota="Solicitar SDS a cada proveedor" />
        <RowPending label="SVHC — Candidate List ECHA" nota="Confirmar si contienen SVHC >0,1% en peso" />
        <RowPending label="Declaración REACH" nota="Emitir declaración formal Reglamento (CE) 1907/2006" />
      </Section>

      {/* K · DOCUMENTOS */}
      {documentos.length > 0 && (
        <Section title="K · Documentación técnica">
          {documentos.map((doc: any, i: number) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doc.tipo}{doc.idiomas ? ` · ${doc.idiomas}` : ''}</div>
              </div>
              {doc.url && (
                <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--green)', whiteSpace: 'nowrap', background: 'var(--green-light)', padding: '4px 10px', borderRadius: 4 }}>
                  Descargar →
                </a>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* L · DECLARACIONES */}
      <Section title="L · Declaraciones de conformidad">
        <RowPending label="Declaración EUDR" nota="Emitir declaración formal de diligencia debida (madera)" />
        <RowPending label="Declaración REACH" nota="Emitir declaración formal Reglamento (CE) 1907/2006" />
        <RowPending label="Declaración conformidad ESPR" nota="Emitir cuando entre en vigor el acto delegado" />
        <RowPending label="EPD verificada por tercero" nota="LCA Dcycle disponible — pendiente verificación acreditada" />
      </Section>

      <footer style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span>Urbidermis, S.L. · ESPR (UE) 2024/1781</span>
        {ref.dpp_uuid && <span style={{ fontFamily: 'var(--font-mono)' }}>DPP {ref.dpp_uuid.slice(0, 8)}</span>}
      </footer>
    </main>
  )
}
