import { getReferencia, getLCA, getMaterial, getColeccion, getEmpresa } from '../../../lib/notion'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 3600

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border)'
      }}>{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value, mono }: { label: string; value: string | undefined; mono?: boolean }) {
  if (!value) return null
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '200px 1fr',
      gap: 16,
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
      alignItems: 'start'
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{
        fontSize: 13,
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        wordBreak: 'break-all'
      }}>{value}</span>
    </div>
  )
}

function Badge({ children, green }: { children: React.ReactNode; green?: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 500,
      background: green ? 'var(--green-light)' : 'var(--accent-light)',
      color: green ? 'var(--green)' : 'var(--text)',
      marginRight: 8,
      marginBottom: 6
    }}>{children}</span>
  )
}

function LCACard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '16px 20px',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 500, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{unit}</div>
    </div>
  )
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug)
  const [ref, empresa] = await Promise.all([
    getReferencia(slug),
    getEmpresa(),
  ])

  if (!ref) notFound()

  const [lca, ...materiales] = await Promise.all([
    getLCA(slug),
    ...ref.matPrincipalIds.map(getMaterial),
    ...ref.matSecundarioIds.map(getMaterial),
  ])

  const matPrincipal = materiales.slice(0, ref.matPrincipalIds.length)
  const matSecundario = materiales.slice(ref.matPrincipalIds.length)

  const coleccion = ref.coleccionIds.length ? await getColeccion(ref.coleccionIds[0]) : null

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

      {/* Back */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>
        ← Todas las referencias
      </Link>

      {/* Header */}
      <header style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            background: 'var(--accent-light)',
            padding: '4px 10px',
            borderRadius: 4
          }}>Digital Product Passport · v{ref.dpp_version || '1.0'}</span>
          {ref.tipologia && <Badge>{ref.tipologia}</Badge>}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
          {ref.referencia}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {ref.nombre_comercial_completo || ref.referencia}
        </h1>
        {ref.dpp_issued_at && (
          <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 13 }}>
            Emitido: {ref.dpp_issued_at}
          </p>
        )}
      </header>

      {/* Identidad pasaporte */}
      <Section title="Identidad del pasaporte">
        <Row label="UUID" value={ref.dpp_uuid} mono />
        <Row label="Versión" value={ref.dpp_version} />
        <Row label="URL pública" value={ref.dpp_url} mono />
      </Section>

      {/* Producto */}
      <Section title="Identificación del producto">
        <Row label="Tipología" value={ref.tipologia} />
        <Row label="Colección" value={coleccion?.name} />
        <Row label="Longitud" value={ref.longitud_m ? `${ref.longitud_m} m` : undefined} />
        <Row label="Peso total" value={ref.peso_kg ? `${ref.peso_kg} kg` : undefined} />
        <Row label="Dimensiones (largo × ancho × alto)" value={
          ref.dim_largo_cm && ref.dim_ancho_cm && ref.dim_alto_cm
            ? `${ref.dim_largo_cm} × ${ref.dim_ancho_cm} × ${ref.dim_alto_cm} cm`
            : undefined
        } />
        <Row label="Altura asiento" value={ref.altura_asiento_cm ? `${ref.altura_asiento_cm} cm` : undefined} />
        <Row label="Número de plazas" value={ref.num_plazas} />
        <Row label="Adaptado silla de ruedas" value={ref.adaptado_silla_ruedas} />
      </Section>

      {/* Fabricante */}
      {empresa && (
        <Section title="Operador económico">
          <Row label="Fabricante" value={`${empresa.nombre} · ${empresa.nombre_comercial}`} />
          <Row label="Domicilio social" value={empresa.domicilio} />
          <Row label="Lugar de producción" value={empresa.lugar_produccion} />
          <Row label="País de fabricación" value={empresa.pais_fabricacion} />
          <Row label="NIF" value={empresa.nif} />
          <Row label="EORI" value={empresa.eori} />
          <Row label="Web" value={empresa.web} />
          <Row label="Contacto DPP" value={empresa.email_dpp} />
        </Section>
      )}

      {/* Materiales */}
      {(matPrincipal.length > 0 || matSecundario.length > 0) && (
        <Section title="Materiales y contenido reciclado">
          {matPrincipal.map((m, i) => m && (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 13 }}>
                Material principal — {m.name}
              </div>
              <Row label="Tipo" value={m.tipo_material} />
              <Row label="Origen" value={m.origen} />
              <Row label="Contenido reciclado" value={m.recycled_content ? `${m.recycled_content}%` : undefined} />
              <Row label="Tratamiento superficie" value={m.tratamiento} />
              <Row label="Reciclable" value={m.reciclable} />
            </div>
          ))}
          {matSecundario.map((m, i) => m && (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 13 }}>
                Material secundario — {m.name}
              </div>
              <Row label="Tipo" value={m.tipo_material} />
              <Row label="Origen" value={m.origen} />
              <Row label="Contenido reciclado" value={m.recycled_content ? `${m.recycled_content}%` : undefined} />
              <Row label="Tratamiento superficie" value={m.tratamiento} />
            </div>
          ))}
          <Row label="Embalaje (cartón)" value={ref.embalaje_kg ? `${ref.embalaje_kg} kg · 100% reciclado · Clase A` : undefined} />
        </Section>
      )}

      {/* LCA */}
      {lca && (
        <Section title="Huella de carbono y LCA">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            <LCACard label="GWP sin biogénico" value={lca.gwp_no_biogenico} unit="kg CO₂ eq" />
            <LCACard label="GWP con biogénico" value={lca.gwp_con_biogenico} unit="kg CO₂ eq" />
            <LCACard label="Energía no renovable" value={lca.energia_no_renovable} unit="MJ" />
            <LCACard label="Escasez de agua" value={lca.escasez_agua} unit="m³ world eq" />
            <LCACard label="Agua neta" value={lca.agua_neta} unit="m³" />
            <LCACard label="Acidificación" value={lca.acidificacion} unit="mol H⁺ eq" />
          </div>
          <Row label="Alcance" value={lca.alcance} />
          <Row label="Metodología" value={lca.metodologia} />
          <Row label="Proveedor LCA" value={lca.proveedor} />
          <Row label="Fuente" value={lca.fuente} />
        </Section>
      )}

      {/* Sostenibilidad */}
      {coleccion && (
        <Section title="Sostenibilidad y fin de vida">
          <Row label="Reparabilidad" value={coleccion.reparabilidad} />
          <Row label="Posibilidad de desmontaje" value={coleccion.desmontaje} />
          <Row label="Vida útil declarada" value={coleccion.vida_util_anos ? `${coleccion.vida_util_anos} años` : undefined} />
          <Row label="Fin de vida" value={coleccion.fin_de_vida} />
        </Section>
      )}

      {/* Footer */}
      <footer style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span>Urbidermis, S.L. · ESPR (UE) 2024/1781</span>
        <span>DPP {ref.dpp_uuid?.slice(0, 8)}</span>
      </footer>
    </main>
  )
}
