import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Database IDs from your Notion workspace
const DB = {
  REFERENCIAS: "37ddcd2af5ee80ec97b0c3477301d3d5",
  LCA_IMPACTO: "382dcd2af5ee80b692a0da77484cc4cd",
  MATERIALES: "37ddcd2af5ee80bdbcf1cb2cde2b1ca2",
  COLECCION: "37ddcd2af5ee8021a725fc53552d6d9a",
  EMPRESA: "38adcd2af5ee808a87e5f68b5c904e43",
  CERTIFICACIONES: "37ddcd2af5ee80bc966ec06704b408ef",
  NORMAS: "380dcd2af5ee80858ba2ee0ac500a2f9",
  DOCUMENTOS: "37ddcd2af5ee80ae9596e37a6f62aec9",
  MASA: "38adcd2af5ee8054af89c5fe9121cbbd",
};

function getText(prop: any): string {
  if (!prop) return "";
  if (prop.type === "title") return prop.title?.map((t: any) => t.plain_text).join("") ?? "";
  if (prop.type === "rich_text") return prop.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
  if (prop.type === "select") return prop.select?.name ?? "";
  if (prop.type === "number") return prop.number?.toString() ?? "";
  if (prop.type === "url") return prop.url ?? "";
  if (prop.type === "date") return prop.date?.start ?? "";
  if (prop.type === "checkbox") return prop.checkbox ? "Sí" : "No";
  if (prop.type === "formula") return prop.formula?.string ?? prop.formula?.number?.toString() ?? "";
  return "";
}

export async function getAllReferencias() {
  const res = await notion.databases.query({ database_id: DB.REFERENCIAS, page_size: 100 });
  return res.results.map((page: any) => ({
    id: page.id,
    referencia: getText(page.properties["Referencia"]),
    tipologia: getText(page.properties["tipologia"]),
    longitud_m: getText(page.properties["longitud_m"]),
    peso_kg: getText(page.properties["peso_kg"]),
    dpp_uuid: getText(page.properties["dpp_uuid"]),
    dpp_url: getText(page.properties["dpp_url"]),
    nombre_comercial_completo: getText(page.properties["nombre_comercial_completo"]),
  }));
}

export async function getReferencia(slug: string) {
  const res = await notion.databases.query({
    database_id: DB.REFERENCIAS,
    filter: { property: "Referencia", title: { equals: slug } },
  });
  if (!res.results.length) return null;
  const page = res.results[0] as any;
  const props = page.properties;

  // Get related material IDs
  const matPrincipalIds = props["material_principal"]?.relation?.map((r: any) => r.id) ?? [];
  const matSecundarioIds = props["material_secundario"]?.relation?.map((r: any) => r.id) ?? [];
  const coleccionIds = props["Colección"]?.relation?.map((r: any) => r.id) ?? [];

  return {
    id: page.id,
    referencia: getText(props["Referencia"]),
    tipologia: getText(props["tipologia"]),
    longitud_m: getText(props["longitud_m"]),
    peso_kg: getText(props["peso_kg"]),
    embalaje_kg: getText(props["Embalaje cartón (kg)"]),
    dim_largo_cm: getText(props["dim_largo_cm"]),
    dim_ancho_cm: getText(props["dim_ancho_cm"]),
    dim_alto_cm: getText(props["dim_alto_cm"]),
    altura_asiento_cm: getText(props["altura_asiento_cm"]),
    num_plazas: getText(props["num_plazas"]),
    adaptado_silla_ruedas: getText(props["adaptado_silla_ruedas"]),
    dpp_uuid: getText(props["dpp_uuid"]),
    dpp_url: getText(props["dpp_url"]),
    dpp_version: getText(props["dpp_version"]),
    dpp_issued_at: getText(props["dpp_issued_at"]),
    nombre_comercial_completo: getText(props["nombre_comercial_completo"]),
    matPrincipalIds,
    matSecundarioIds,
    coleccionIds,
  };
}

export async function getLCA(referencia: string) {
  const res = await notion.databases.query({
    database_id: DB.LCA_IMPACTO,
    filter: { property: "Referencia", title: { equals: referencia } },
  });
  if (!res.results.length) return null;
  const page = res.results[0] as any;
  const p = page.properties;
  return {
    gwp_no_biogenico: getText(p["gwp_no_biogenico_kg_co2"]),
    gwp_con_biogenico: getText(p["gwp_con_biogenico_kg_co2"]),
    energia_no_renovable: getText(p["energia_no_renovable_mj"]),
    escasez_agua: getText(p["escasez_agua"]),
    agua_neta: getText(p["agua_neta_m3"]),
    acidificacion: getText(p["acidificacion"]),
    agotamiento_ozono: getText(p["agotamiento_ozono"]),
    recursos_minerales: getText(p["recursos_minerales"]),
    uso_suelo: getText(p["uso_suelo"]),
    alcance: getText(p["alcance_lca"]),
    metodologia: getText(p["metodologia"]),
    proveedor: getText(p["proveedor_lca"]),
    fuente: getText(p["fuente"]),
  };
}

export async function getMaterial(id: string) {
  const page = await notion.pages.retrieve({ page_id: id }) as any;
  const p = page.properties;
  return {
    name: getText(p["Name"]),
    recycled_content: getText(p["Recycled Content (%)"]),
    origen: getText(p["origen"]),
    tipo_material: getText(p["tipo_material"]),
    tratamiento: getText(p["tratamiento_superficie"]),
    reciclable: getText(p["reciclable"]),
  };
}

export async function getColeccion(id: string) {
  const page = await notion.pages.retrieve({ page_id: id }) as any;
  const p = page.properties;
  return {
    name: getText(p["Name"]),
    ano_diseno: getText(p["ano_diseno"]),
    disenadores: getText(p["disenadores"]),
    vida_util_anos: getText(p["vida_util_anos"]),
    reparabilidad: getText(p["reparabilidad"]),
    desmontaje: getText(p["posibilidad_desmontaje"]),
    fin_de_vida: getText(p["fin_de_vida"]),
  };
}

export async function getEmpresa() {
  const res = await notion.databases.query({ database_id: DB.EMPRESA, page_size: 1 });
  if (!res.results.length) return null;
  const page = res.results[0] as any;
  const p = page.properties;
  return {
    nombre: getText(p["Denominación social"]),
    nombre_comercial: getText(p["Nombre comercial"]),
    domicilio: getText(p["Domicilio social"]),
    lugar_produccion: getText(p["Lugar de producción"]),
    pais_fabricacion: getText(p["País de fabricación"]),
    nif: getText(p["NIF / CIF"]),
    eori: getText(p["Número EORI"]),
    web: getText(p["Web"]),
    email_dpp: getText(p["Email contacto DPP"]),
  };
}
