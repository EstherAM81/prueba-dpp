import { getReferencia, getLCA, getMaterial, getColeccion, getEmpresa, getCertificacion, getNorma, getDocumentos, getMasa } from '../../../../lib/notion'
import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug)
  const [ref, empresa] = await Promise.all([getReferencia(slug), getEmpresa()])
  if (!ref) return NextResponse.json({ ref: null })

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

  return NextResponse.json({ ref, empresa, lca, documentos, masa, matPrincipal, matSecundario, coleccion, certificaciones, normas })
}
