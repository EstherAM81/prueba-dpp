import { getReferencia, getLCA, getMaterial, getColeccion, getEmpresa, getCertificacion, getNorma, getDocumentos, getMasa } from '../../../lib/notion'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 3600

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)'
      }}>{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value, mono, link }: { label: string; value?: string; mono?: boolean; link?: boolean }) {
  if (!value) return null
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16,
      padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'start'
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--green)', wordBreak: 'break-all' }}>{value}</a>
      ) : (
        <span style={{ fontSize: 13, fontFamily: mono ? 'var(--font-mono)' : 'inherit', wordBreak: 'break-all' }}>{value}</span>
      )}
    </div>
  )
}


function RowPending({ label, nota }: { label: string; nota?: string }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16,
      padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'start'
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{
        fontSize: 12,
        color: '#C0392B',
        background: '#FDF0EE',
        padding: '3px 8px',
        borderRadius: 4,
        display: 'inline-block',
        fontFamily: 'var(--font-mono)'
      }}>
        ⚠ Pendiente{nota ? ` — ${nota}` : ''}
      </span>
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

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug)

  const [ref, empresa] = await Promise.all([getReferencia(slug), getEmpresa()])
  if (!ref) notFound()

  const [lca, documentos, masa] = await Promise.all([
    getLCA(slug),
    getDocumentos(ref.id),
    getMasa(ref.id),
  ])

  const materiales = await Promise.all([
    ...ref.matPrincipalIds.map(getMaterial),
    ...ref.matSecundarioIds.map(getMaterial),
  ])
  const matPrincipal = materiales.slice(0, ref.matPrincipalIds.length)
  const matSecundario = materiales.slice(ref.matPrincipalIds.length)

  const coleccion = ref.coleccionIds.length ? await getColeccion(ref.coleccionIds[0]) : null

  const [certificaciones, normas] = await Promise.all([
    coleccion?.certIds ? Promise.all(coleccion.certIds.map(getCertificacion)) : Promise.resolve([]),
    coleccion?.normasIds ? Promise.all(coleccion.normasIds.map(getNorma)) : Promise.resolve([]),
  ])

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>
        ← Todas las referencias
      </Link>

      {/* HEADER */}
      <header style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', background: 'var(--accent-light)', padding: '4px 10px', borderRadius: 4 }}>
            Digital Product Passport · v{ref.dpp_version || '1.0'}
          </span>
          {ref.tipologia && (
            <span style={{ fontSize: 12, fontWeight: 500, background: 'var(--accent-light)', padding: '3px 10px', borderRadius: 4 }}>{ref.tipologia}</span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>{ref.referencia}</div>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {(ref.nombre_comercial_completo || ref.referencia).replace(/@/g, '')}
        </h1>
        {ref.dpp_issued_at && <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 13 }}>Emitido: {ref.dpp_issued_at}</p>}
      </header>

      {/* A · IDENTIDAD */}
      <Section title="A · Identidad del pasaporte">
        <Row label="UUID del pasaporte" value={ref.dpp_uuid} mono />
        <Row label="Versión" value={ref.dpp_version} />
        <Row label="URL pública" value={ref.dpp_url} link />
        <Row label="Estado" value="Active" />
      </Section>

      {/* B · PRODUCTO */}
      <Section title="B · Identificación del producto">
        <Row label="Nombre comercial" value={ref.nombre_comercial_completo} />
        <Row label="Modelo / Referencia" value={ref.referencia} mono />
        <Row label="Tipología" value={ref.tipologia} />
        <Row label="Colección" value={coleccion?.name} />
        {coleccion?.ano_diseno && <Row label="Año de diseño" value={coleccion.ano_diseno} />}
        {coleccion?.disenadores && <Row label="Diseñadores" value={coleccion.disenadores} />}
        <Row label="Dimensiones (largo × ancho × alto)" value={ref.dim_largo_cm && ref.dim_ancho_cm && ref.dim_alto_cm ? `${ref.dim_largo_cm} × ${ref.dim_ancho_cm} × ${ref.dim_alto_cm} cm` : undefined} />
        {ref.adaptado_silla_ruedas === "Sí" && <Row label="Adaptado silla de ruedas" value="Sí" />}
        <RowPending label="GTIN (14 dígitos)" nota="Registrar en GS1 Spain" />
        <RowPending label="Código eCl@ss" nota="Asignar código de categoría de producto" />
      </Section>

      {/* C · OPERADOR */}
      {empresa && (
        <Section title="C · Operador económico">
          <Row label="Fabricante" value={empresa.nombre} />
          <Row label="Nombre comercial" value={empresa.nombre_comercial} />
          <Row label="Tipo de operador" value={empresa.tipo_operador} />
          <Row label="Domicilio social" value={empresa.domicilio} />
          <Row label="Lugar de producción" value={empresa.lugar_produccion} />
          <Row label="País de fabricación" value={empresa.pais_fabricacion} />
          <Row label="País de registro" value={empresa.pais_registro} />
          <Row label="NIF / CIF" value={empresa.nif} />
          <Row label="Número EORI" value={empresa.eori} />
          <Row label="Web" value={empresa.web} link />
          <Row label="Email contacto DPP" value={empresa.email_dpp} />
          <RowPending label="GLN (Global Location Number)" nota="Registrar en GS1 Spain" />
        </Section>
      )}

      {/* D · MASA */}
      <Section title="D · Masa del producto">
        <Row label="Peso total del producto" value={ref.peso_kg ? `${ref.peso_kg} kg` : undefined} />
        {masa && <>
          <Row label="Listones / superficie" value={masa.listones ? `${masa.listones} kg` : undefined} />
          <Row label="Estructura" value={masa.estructura ? `${masa.estructura} kg` : undefined} />
          <Row label="Tornillería" value={masa.tornilleria ? `${masa.tornilleria} kg` : undefined} />
        </>}
        <Row label="Embalaje (excluido del peso)" value={ref.embalaje_kg ? `${ref.embalaje_kg} kg · Cartón canal BC · 100% reciclado · Clase A` : undefined} />
      </Section>

      {/* E2 · REACH */}
      <Section title="E · Sustancias y cumplimiento químico">
        <RowPending label="Sustancias de preocupación (SVHC)" nota="Solicitar SDS a cada proveedor de material" />
        <RowPending label="SVHC — Candidate List ECHA" nota="Confirmar con proveedor si contienen SVHC >0,1% en peso" />
        <RowPending label="Declaración REACH" nota="Emitir declaración formal una vez recibidas las SDS" />
      </Section>

      {/* F · MATERIALES */}
      {(matPrincipal.length > 0 || matSecundario.length > 0) && (
        <Section title="F · Materiales y contenido reciclado">
          {matPrincipal.map((m, i) => m && (
            <div key={i} style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 500, fontSize: 11, marginBottom: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Material principal
              </div>
              <Row label="Material" value={m.name} />
              <Row label="Tipo" value={m.tipo_material} />
              <Row label="Origen" value={m.origen} />
              <Row label="Contenido reciclado" value={m.recycled_content ? `${m.recycled_content}%` : undefined} />
              <Row label="Contenido virgen" value={m.virgin_content ? `${m.virgin_content}%` : undefined} />
              <Row label="Tratamiento superficie" value={m.tratamiento} />
              <Row label="Especie madera" value={m.especie_madera} />
              <Row label="Reciclable" value={m.reciclable === "Sí" ? "✓ Sí" : m.reciclable} />
            </div>
          ))}
          {matSecundario.map((m, i) => m && (
            <div key={i} style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.06em', marginBottom: 8 }}>
                Material secundario
              </div>
              <Row label="Material" value={m.name} />
              <Row label="Tipo" value={m.tipo_material} />
              <Row label="Origen" value={m.origen} />
              <Row label="Contenido reciclado" value={m.recycled_content ? `${m.recycled_content}%` : undefined} />
              <Row label="Tratamiento superficie" value={m.tratamiento} />
              <Row label="Reciclable" value={m.reciclable === "Sí" ? "✓ Sí" : m.reciclable} />
            </div>
          ))}
        </Section>
      )}

      {/* F · LCA */}
      {lca && (
        <Section title="G · Huella de carbono y LCA">
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

      {/* G · SOSTENIBILIDAD */}
      {coleccion && (
        <Section title="H · Sostenibilidad y fin de vida">
          <Row label="Reparabilidad" value={coleccion.reparabilidad} />
          <Row label="Desmontaje" value={coleccion.desmontaje} />
          <Row label="Vida útil declarada" value={coleccion.vida_util_anos ? `${coleccion.vida_util_anos} años` : undefined} />
          <Row label="Fin de vida" value="Desmontaje manual. Separación por material para reciclaje diferenciado." />
          <Row label="Gestión fin de vida" value="A cargo del operador responsable de la instalación, según normativa local de residuos" />
          <RowPending label="Clase de reciclabilidad (A-D)" nota="Realizar evaluación según metodología declarada" />
          <RowPending label="URL take-back / fin de vida" nota="Crear URL pública QR-resolvable para gestión de residuos" />
          <RowPending label="URL repuestos (10+ años)" nota="Crear página o email específico para solicitar recambios" />
        </Section>
      )}

      {/* H · CERTIFICACIONES */}
      {certificaciones.length > 0 && (
        <Section title="I · Certificaciones">
          {certificaciones.map((cert, i) => cert && (
            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{cert.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cert.organismo} · {cert.tipo}</div>
                  {cert.ambito && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cert.ambito}</div>}
                </div>
                {cert.pdf && (
                  <a href={cert.pdf} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 12, color: 'var(--green)', whiteSpace: 'nowrap',
                    background: 'var(--green-light)', padding: '4px 10px', borderRadius: 4
                  }}>Ver PDF →</a>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* I · NORMAS */}
      {normas.length > 0 && (
        <Section title="J · Normas aplicables">
          {normas.map((norma, i) => norma && (
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

      {/* J · DOCUMENTOS */}
      {documentos.length > 0 && (
        <Section title="K · Documentación técnica">
          {documentos.map((doc, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doc.tipo}{doc.idiomas ? ` · ${doc.idiomas}` : ''}</div>
              </div>
              {doc.url && (
                <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: 12, color: 'var(--green)', whiteSpace: 'nowrap',
                  background: 'var(--green-light)', padding: '4px 10px', borderRadius: 4
                }}>Descargar →</a>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* L · DECLARACIONES */}
      <Section title="L · Declaraciones de conformidad">
        <RowPending label="Declaración EUDR" nota="Emitir declaración formal de diligencia debida (madera)" />
        <RowPending label="Declaración REACH" nota="Emitir declaración formal Reglamento (CE) 1907/2006" />
        <RowPending label="Declaración conformidad ESPR" nota="Emitir cuando entre en vigor el acto delegado para mobiliario" />
        <RowPending label="EPD verificada por tercero" nota="LCA Dcycle disponible — pendiente verificación acreditada" />
      </Section>

      <footer style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span>Urbidermis, S.L. · ESPR (UE) 2024/1781</span>
        {ref.dpp_uuid && <span>DPP {ref.dpp_uuid.slice(0, 8)}</span>}
      </footer>
    </main>
  )
}
