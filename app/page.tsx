tengoimport { getAllReferencias } from '../lib/notion'
import Link from 'next/link'

export const revalidate = 3600

export default async function Home() {
  const refs = await getAllReferencias()

  const cleaned = refs.map(r => ({
    ...r,
    nombre_comercial_completo: (r.nombre_comercial_completo || '').replace(/@/g, ''),
  }))

  const refsJson = JSON.stringify(cleaned)

  return (
    <>
      <style>{`
        .filter-btn {
          padding: 5px 14px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--surface);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: var(--font-sans);
          color: var(--text);
        }
        .filter-btn:hover { border-color: var(--text); }
        .filter-btn.active { background: var(--text); color: white; border-color: var(--text); }
        .ref-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px 24px;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
          text-decoration: none;
          display: block;
        }
        .ref-card:hover {
          border-color: var(--text);
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .benefit-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px 24px;
          flex: 1;
          min-width: 180px;
        }
        #grid-container .section-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 12px;
          margin-top: 32px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }
      `}</style>

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
          <div className="benefit-card">
            <div style={{ fontSize: 18, marginBottom: 8 }}>♻</div>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>Cradle to Cradle®</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>Primera empresa del mundo en certificar mobiliario urbano C2C</div>
          </div>
          <div className="benefit-card">
            <div style={{ fontSize: 18, marginBottom: 8 }}>🌲</div>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>FSC & PEFC</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>Madera certificada de origen sostenible</div>
          </div>
          <div className="benefit-card">
            <div style={{ fontSize: 18, marginBottom: 8 }}>⟳</div>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>Vida útil 25 años</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>Alta reparabilidad y repuestos disponibles</div>
          </div>
        </div>

        {/* FILTROS */}
        <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 70 }}>Tipología</span>
            <button className="filter-btn active" data-filter="tipologia" data-value="all" onclick="filterRefs(this)">Todos</button>
            {['Banco','Banqueta','Mesa','Lounge chair','Chaise longue'].map(t => (
              <button key={t} className="filter-btn" data-filter="tipologia" data-value={t} onclick="filterRefs(this)">{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 70 }}>Longitud</span>
            <button className="filter-btn active" data-filter="longitud" data-value="all" onclick="filterRefs(this)">Todos</button>
            {['0.6','1.2','1.75','3'].map(l => (
              <button key={l} className="filter-btn" data-filter="longitud" data-value={l} onclick="filterRefs(this)">{l} m</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 70 }}>Material</span>
            <button className="filter-btn active" data-filter="material" data-value="all" onclick="filterRefs(this)">Todos</button>
            {['Aluminio','Madera tropical','Pino europeo'].map(m => (
              <button key={m} className="filter-btn" data-filter="material" data-value={m} onclick="filterRefs(this)">{m}</button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div id="grid-container"></div>

        <footer style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12 }}>
          <p>Urbidermis, S.L. · DPP v1.0 · ESPR (UE) 2024/1781</p>
        </footer>
      </main>

      <script dangerouslySetInnerHTML={{ __html: `
        const ALL_REFS = ${refsJson};

        function getMaterial(nombre) {
          if (!nombre) return '';
          const n = nombre.toLowerCase();
          if (n.includes('alumin')) return 'Aluminio';
          if (n.includes('tropical')) return 'Madera tropical';
          if (n.includes('pino') || n.includes('pine') || n.includes('pefc')) return 'Pino europeo';
          return '';
        }

        let activeFilters = { tipologia: 'all', longitud: 'all', material: 'all' };

        function filterRefs(btn) {
          const filter = btn.dataset.filter;
          const value = btn.dataset.value;
          activeFilters[filter] = value;

          document.querySelectorAll('[data-filter="' + filter + '"]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          renderGrid();
        }

        function renderGrid() {
          const filtered = ALL_REFS.filter(r => {
            const tipOk = activeFilters.tipologia === 'all' || r.tipologia === activeFilters.tipologia;
            const lonOk = activeFilters.longitud === 'all' || String(r.longitud_m) === activeFilters.longitud;
            const matOk = activeFilters.material === 'all' || getMaterial(r.nombre_comercial_completo) === activeFilters.material;
            return tipOk && lonOk && matOk;
          });

          const byTipologia = {};
          const ORDER = ['Banco','Banqueta','Mesa','Lounge chair','Chaise longue'];
          filtered.forEach(r => {
            const t = r.tipologia || 'Otros';
            if (!byTipologia[t]) byTipologia[t] = [];
            byTipologia[t].push(r);
          });

          const container = document.getElementById('grid-container');

          if (filtered.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:14px;padding:32px 0">No hay referencias con estos filtros.</p>';
            return;
          }

          let html = '';
          ORDER.forEach(tip => {
            if (!byTipologia[tip]) return;
            html += '<div class="section-title">' + tip + '</div>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:8px">';
            byTipologia[tip].forEach(r => {
              html += '<a class="ref-card" href="/product/' + r.referencia + '">';
              html += '<div style="font-family:var(--font-mono);font-size:13px;font-weight:500;margin-bottom:6px">' + r.referencia + '</div>';
              html += '<div style="font-size:12px;color:var(--text-muted);line-height:1.4">' + (r.nombre_comercial_completo || '') + '</div>';
              html += '</a>';
            });
            html += '</div>';
          });

          container.innerHTML = html;
        }

        renderGrid();
      `}} />
    </>
  )
}
