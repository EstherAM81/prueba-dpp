# Harpo DPP — Digital Product Passport

Front en Next.js que consume la API de Notion para mostrar el DPP de cada referencia de la colección HARPO de Urbidermis.

## Stack
- **Next.js 14** (App Router, Server Components)
- **Notion API** como base de datos
- **Vercel** para despliegue

## Configuración local

1. Clona el repositorio
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea tu archivo `.env.local` (copia `.env.local.example`):
   ```
   NOTION_TOKEN=secret_xxxxx
   ```
4. Arranca en desarrollo:
   ```bash
   npm run dev
   ```

## Obtener el NOTION_TOKEN

1. Ve a https://www.notion.so/my-integrations
2. Crea una integración nueva (nombre: "Harpo DPP")
3. Copia el "Internal Integration Token"
4. En Notion, comparte cada base de datos con la integración:
   - REFERENCIAS → Share → Invite → selecciona "Harpo DPP"
   - LCA_IMPACTO, MATERIALES, COLECCION, EMPRESA (igual)

## Despliegue en Vercel

1. Sube el proyecto a GitHub
2. Ve a https://vercel.com → New Project → importa el repo
3. En "Environment Variables" añade:
   - `NOTION_TOKEN` = tu token de Notion
4. Deploy

## Rutas
- `/` — Listado de todas las referencias agrupadas por tipología
- `/product/[SKU]` — DPP individual (ej: `/product/HBB35`)

## Actualización de datos
Edita directamente en Notion. El front se revalida cada hora automáticamente (o fuerza revalidación desde Vercel).
