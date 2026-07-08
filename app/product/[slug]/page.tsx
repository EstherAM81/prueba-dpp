import { getReferencia, getLCA, getMaterial, getColeccion, getEmpresa, getCertificacion, getNorma, getDocumentos, getMasa } from '../../../lib/notion'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{
        fontSize: 14, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--cds-text-secondary)',
        marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--cds-border-subtle-00)'
      }}>{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value, mono, link }: { label: string; value?: string; mono?: boolean; link?: boolean }) {
  if (!value) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--cds-border-subtle-00)', alignItems: 'start' }}>
      <span style={{ fontSize: 13, color: 'var(--cds-text-secondary)' }}>{label}</span>
      {link
        ? <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--cds-link-primary)', wordBreak: 'break-all' }}>{value}</a>
        : <span style={{ fontSize: 13, fontFamily: mono ? 'var(--font-mono)' : 'inherit', wordBreak: 'break-all' }}>{value}</span>
      }
    </div>
  )
}

function RowPending({ label, nota }: { label: string; nota?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--cds-border-subtle-00)', alignItems: 'start' }}>
      <span style={{ fontSize: 13, color: 'var(--cds-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--cds-support-error)', background: 'var(--cds-support-error-bg)', padding: '3px 8px', display: 'inline-block', fontFamily: 'var(--font-mono)' }}>
        ⚠ Pendiente{nota ? ` — ${nota}` : ''}
      </span>
    </div>
  )
}

function SubHeader({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cds-text-secondary)', marginTop: 16, marginBottom: 8 }}>
      {label}
    </div>
  )
}

function LCACard({ label, value, unit }: { label: string; value: string; unit: string }) {
  if (!value) return null
  return (
    <div style={{ background: 'var(--cds-background)', border: '1px solid var(--cds-border-subtle-00)', padding: '16px' }}>
      <div style={{ fontSize: 11, color: 'var(--cds-text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 300, fontFamily: 'var(--font-mono)', color: 'var(--cds-text-primary)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--cds-text-secondary)', marginTop: 4 }}>{unit}</div>
    </div>
  )
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug)
  const [ref, empresa] = await Promise.all([getReferencia(slug), getEmpresa()])
  if (!ref) notFound()

  const [lca, documentos, masa] = await Promise.all([getLCA(slug), getDocumentos(ref.id), getMasa(ref.id)])

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

  const nombre = (ref.nombre_comercial_completo || ref.referencia).replace(/@/g, '').trim()

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 16px' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--cds-link-primary)', fontSize: 13, marginBottom: 32 }}>
        ← Todas las referencias
      </Link>

      {/* HEADER */}
      <header style={{ borderBottom: '1px solid var(--cds-border-subtle-00)', paddingBottom: 24, marginBottom: 40 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <span className="cds-tag">Digital Product Passport · v{ref.dpp_version || '1.0'}</span>
          {ref.tipologia && <span className="cds-tag">{ref.tipologia}</span>}
          {ref.dpp_status && <span className="cds-tag" style={{ color: ref.dpp_status === 'Active' ? 'var(--cds-support-success)' : 'inherit' }}>{ref.dpp_status}</span>}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--cds-interactive)', marginBottom: 6 }}>{ref.referencia}</div>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 8 }}>{nombre}</h1>
        {ref.dpp_issued_at && <p style={{ color: 'var(--cds-text-secondary)', fontSize: 13, marginBottom: 4 }}>Emitido: {ref.dpp_issued_at}</p>}
        {ref.dpp_uuid && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cds-text-secondary)' }}>UUID: {ref.dpp_uuid}</p>}
        {ref.schema_version && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cds-text-secondary)' }}>Schema v{ref.schema_version} · {ref.espr_product_category}</p>}
      </header>

      {/* IDENTIFICACIÓN DEL PRODUCTO */}
      <Section title="Identificación del producto">
        <Row label="Nombre comercial" value={nombre} />
        <Row label="Referencia" value={ref.referencia} mono />
        <Row label="Tipología" value={ref.tipologia} />
        <Row label="Colección" value={coleccion?.name} />
        {coleccion?.ano_diseno && <Row label="Año de diseño" value={coleccion.ano_diseno} />}
        {coleccion?.disenadores && <Row label="Diseñadores" value={coleccion.disenadores} />}
        <Row label="Dimensiones (largo × ancho × alto)" value={ref.dim_largo_cm && ref.dim_ancho_cm && ref.dim_alto_cm ? `${ref.dim_largo_cm} × ${ref.dim_ancho_cm} × ${ref.dim_alto_cm} cm` : undefined} />
        {ref.adaptado_silla_ruedas === 'Sí' && <Row label="Adaptado silla de ruedas" value="Sí" />}
        <RowPending label="GTIN (14 dígitos)" nota="Registrar en GS1 Spain" />
        <RowPending label="Código eCl@ss" nota="Asignar código de categoría de producto" />
      </Section>

      {/* FABRICANTE */}
      {empresa && (
        <Section title="Fabricante">
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

      {/* MATERIALES */}
      {(matPrincipal.length > 0 || matSecundario.length > 0) && (
        <Section title="Materiales y contenido reciclado">
          {[...matPrincipal.map((m,i) => ({m,i,tipo:'Material principal'})), ...matSecundario.map((m,i) => ({m,i,tipo:'Material secundario'}))].filter(({m}) => m).map(({m, i, tipo}) => (
            <div key={`${tipo}-${i}`} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--cds-border-subtle-00)' }}>
              <SubHeader label={tipo} />
              <Row label="Material" value={m.name} />
              <Row label="Aleación / clasificación" value={m.tipo_material !== m.name ? m.tipo_material : undefined} />
              <Row label="Origen" value={m.origen} />
              <Row label="Contenido reciclado" value={m.recycled_content && m.recycled_content !== '0' ? `${m.recycled_content}%` : undefined} />
              <Row label="Contenido virgen" value={m.virgin_content && m.virgin_content !== '0' ? `${m.virgin_content}%` : undefined} />
              <Row label="Tratamiento superficie" value={m.tratamiento} />
              <Row label="Especie madera" value={m.especie_madera} />
              <Row label="Reciclable" value={m.reciclable === 'Sí' ? '✓ Sí' : m.reciclable} />
            </div>
          ))}

          {/* EMBALAJE */}
          <div style={{ marginBottom: 8 }}>
            <SubHeader label="Embalaje" />
            <Row label="Masa" value={ref.embalaje_kg ? `${ref.embalaje_kg} kg` : '4.64 kg'} />
            <Row label="Tipo" value={ref.packaging_tipo || 'Cartón canal BC'} />
            <Row label="Contenido reciclado" value={ref.packaging_recycled_pct ? `${ref.packaging_recycled_pct}%` : '100%'} />
            <Row label="Clase de reciclabilidad" value={ref.packaging_recyclability_class ? `✓ ${ref.packaging_recyclability_class} — Reciclable` : '✓ A — Reciclable'} />
          </div>
        </Section>
      )}

      {/* LCA */}
      {lca && (
        <Section title="Huella de carbono y LCA">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, marginBottom: 24, background: 'var(--cds-border-subtle-00)' }}>
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

      {/* NORMAS */}
      {normas.length > 0 && (
        <Section title="Normas aplicables">
          {normas.map((norma: any, i: number) => norma && (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--cds-border-subtle-00)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ fontWeight: 500, fontSize: 13, fontFamily: 'var(--font-mono)' }}>{norma.name}</div>
                {norma.ambito && <div style={{ fontSize: 12, color: 'var(--cds-text-secondary)' }}>{norma.ambito}</div>}
              </div>
              {norma.descripcion && <div style={{ fontSize: 12, color: 'var(--cds-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{norma.descripcion}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* CERTIFICACIONES */}
      {certificaciones.length > 0 && (
        <Section title="Certificaciones">
          {(() => {
            // Detect wood type from materials to show correct cert
            const allMaterials = [...matPrincipal, ...matSecundario].filter(Boolean)
            const hasFSC = allMaterials.some((m: any) => (m.name || '').toLowerCase().includes('tropical') || (m.origen || '').toLowerCase().includes('tropical'))
            const hasPEFC = allMaterials.some((m: any) => (m.name || '').toLowerCase().includes('pino') || (m.name || '').toLowerCase().includes('pefc') || (m.name || '').toLowerCase().includes('pine'))

            return certificaciones.filter((cert: any) => {
              if (!cert) return false
              const n = (cert.name || '').toUpperCase()
              // Always show CE and C2C
              if (n.includes('CE') || n.includes('CRADLE')) return true
              // Show FSC only if tropical wood
              if (n.includes('FSC') && !n.includes('PEFC')) return hasFSC || (!hasFSC && !hasPEFC)
              // Show PEFC only if pine wood
              if (n.includes('PEFC') && !n.includes('FSC')) return hasPEFC
              // Show FSC+PEFC combined if both
              return true
            }).map((cert: any, i: number) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--cds-border-subtle-00)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{cert.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--cds-text-secondary)' }}>{cert.organismo}{cert.tipo ? ` · ${cert.tipo}` : ''}</div>
                    {cert.ambito && <div style={{ fontSize: 12, color: 'var(--cds-text-secondary)' }}>{cert.ambito}</div>}
                  </div>
                  {cert.pdf && (
                    <a href={cert.pdf} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--cds-link-primary)', whiteSpace: 'nowrap', border: '1px solid var(--cds-border-subtle-01)', padding: '4px 10px' }}>
                      Ver PDF →
                    </a>
                  )}
                </div>
              </div>
            ))
          })()}
        </Section>
      )}

      {/* MASA */}
      <Section title="Masa del producto">
        <Row label="Peso total del producto" value={ref.peso_kg ? `${ref.peso_kg} kg` : undefined} />
        {masa && <>
          <Row label="Listones / superficie" value={masa.listones ? `${masa.listones} kg` : undefined} />
          <Row label="Estructura" value={masa.estructura ? `${masa.estructura} kg` : undefined} />
          <Row label="Tornillería" value={masa.tornilleria ? `${masa.tornilleria} kg` : undefined} />
        </>}
        <Row label="Embalaje (excluido del producto)" value={ref.embalaje_kg ? `${ref.embalaje_kg} kg` : undefined} />
      </Section>

      {/* SOSTENIBILIDAD */}
      {coleccion && (
        <Section title="Sostenibilidad y fin de vida">
          <Row label="Reparabilidad" value={coleccion.reparabilidad} />
          <Row label="Desmontaje" value={coleccion.desmontaje} />
          <Row label="Vida útil declarada" value={coleccion.vida_util_anos ? `${coleccion.vida_util_anos} años` : undefined} />
          <Row label="Fin de vida" value="Desmontaje manual. Separación por material para reciclaje diferenciado." />
          <Row label="Gestión fin de vida" value="A cargo del operador responsable de la instalación, según normativa local de residuos." />
          <Row label="Solicitud de repuestos" value="spare-parts@urbidermis.com" />
          <RowPending label="Clase de reciclabilidad (A-D)" nota="Realizar evaluación según metodología declarada" />
          <RowPending label="URL take-back / fin de vida" nota="Crear URL pública QR-resolvable" />
          <RowPending label="URL repuestos (10+ años)" nota="Crear página o email específico para recambios" />
        </Section>
      )}

      {/* SUSTANCIAS */}
      <Section title="Sustancias y cumplimiento químico">
        <RowPending label="Sustancias de preocupación (SVHC)" nota="Solicitar SDS a cada proveedor" />
        <RowPending label="SVHC — Candidate List ECHA" nota="Confirmar si contienen SVHC >0,1% en peso" />
        <RowPending label="Declaración REACH" nota="Emitir declaración formal Reglamento (CE) 1907/2006" />
      </Section>

      {/* DOCUMENTOS */}
      {documentos.length > 0 && (
        <Section title="Documentación técnica">
          {documentos.filter((doc: any) => {
            const n = doc.name || ''
            const t = doc.tipo || ''
            return n.includes('LCA') || n.includes('Assembly') || n.includes('Mantenimiento') || n.includes('Disassembly') || t.toLowerCase().includes('care')
          }).map((doc: any, i: number) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--cds-border-subtle-00)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: 'var(--cds-text-secondary)' }}>{doc.tipo}{doc.idiomas ? ` · ${doc.idiomas}` : ''}</div>
              </div>
              {doc.url && (
                <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--cds-link-primary)', whiteSpace: 'nowrap', border: '1px solid var(--cds-border-subtle-01)', padding: '4px 10px' }}>
                  Descargar →
                </a>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* DECLARACIONES */}
      <Section title="Declaraciones de conformidad">
        <RowPending label="Declaración EUDR" nota="Emitir declaración formal de diligencia debida (madera)" />
        <RowPending label="Declaración REACH" nota="Emitir declaración formal Reglamento (CE) 1907/2006" />
        <RowPending label="Declaración conformidad ESPR" nota="Emitir cuando entre en vigor el acto delegado" />
        <RowPending label="EPD verificada por tercero" nota="LCA Dcycle disponible — pendiente verificación acreditada" />
      </Section>

      <footer style={{ marginTop: 64, paddingTop: 16, borderTop: '1px solid var(--cds-border-subtle-00)', color: 'var(--cds-text-secondary)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
        <span>Urbidermis, S.L. · ESPR (UE) 2024/1781</span>
        {ref.dpp_uuid && <span style={{ fontFamily: 'var(--font-mono)' }}>{ref.dpp_uuid.slice(0,8)}</span>}
      </footer>
    </main>
  )
}
