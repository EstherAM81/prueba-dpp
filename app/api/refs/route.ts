import { getAllReferencias } from '../../../lib/notion'
import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  const refs = await getAllReferencias()
  const cleaned = refs.map(r => ({
    ...r,
    nombre_comercial_completo: (r.nombre_comercial_completo || '').replace(/@/g, ''),
  }))
  return NextResponse.json(cleaned)
}
