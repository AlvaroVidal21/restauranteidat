import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Experiencias = () => {
  const navigate = useNavigate();
  const [experiencias, setExperiencias] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImage = (exp) => {
    const name = (exp?.nombre || '').toLowerCase();
    const desc = (exp?.descripcion || '').toLowerCase();
    const text = `${name} ${desc}`;

    if (name.includes('cena romántica') || text.includes('romant')) {
      return 'https://i.pinimg.com/736x/ed/3c/8c/ed3c8c0b8338d70beb8530a6f876866d.jpg';
    }
    if (
      name.includes('degustación marina') ||
      text.includes('marina') ||
      text.includes('ceviche') ||
      text.includes(' mar ') ||
      text.includes(' mar.') ||
      text.includes(' mar,')
    ) {

      if (!text.includes('maridaje')) {
        return 'https://i.pinimg.com/1200x/74/b8/e5/74b8e5cd81f5c4ba6f05a73c6e23304d.jpg';
      }
    }
    if (name.includes('andina') || text.includes('andina') || text.includes('andes') || text.includes('cordillera')) {
      return 'https://i.pinimg.com/736x/0f/bf/fa/0fbffa17f7fec501aa9696c1192733a3.jpg';
    }
    if (text.includes('degust') || text.includes('cata')) {
      return 'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=900&q=80';
    }
    if (text.includes('fuego') || text.includes('brasa') || text.includes('wok')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';
    }
    return 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80';
  };

  const getExtraCopy = (exp) => {
    const base = exp?.descripcion || 'Menú de autor de 3 tiempos con productos de temporada.';
    const crafted = `${base} · Incluye mise en place cuidada, ritmo pausado y maridajes sugeridos por nuestro sommelier.`;
    return crafted.length > 240 ? `${crafted.slice(0, 237)}...` : crafted;
  };

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/experiencias')
      .then(res => res.json())
      .then(data => setExperiencias(Array.isArray(data) ? data : []))
      .catch(() => setExperiencias([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lab-container">
      <div className="section-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <p className="menu-meta">Experiencias</p>
        <h2>Explora cada experiencia</h2>
        <div className="gold-line"></div>
        <p className="text-muted" style={{ maxWidth: '620px', margin: '0 auto' }}>
          Detalles, precio y reserva inmediata para las experiencias vigentes.
        </p>
      </div>

      {loading && (
        <p className="text-center text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
          Cargando experiencias...
        </p>
      )}

      {!loading && experiencias.length === 0 && (
        <div className="menu-card" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p className="menu-meta">Pronto</p>
          <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>Aún no hay experiencias publicadas</h3>
          <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
            Estamos preparando nuevas propuestas. Mientras tanto, puedes reservar y consultarnos por la sugerencia del chef.
          </p>
          <button className="btn-lab btn-lab-primary" onClick={() => navigate('/reservar')}>Reservar</button>
        </div>
      )}

      <div className="menu-grid">
        {experiencias.map((exp) => (
          <article key={exp.id} className="menu-card">
            <p className="menu-meta">Experiencia</p>
            <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{exp.nombre}</h3>
            <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: 'var(--spacing-sm)', boxShadow: 'var(--shadow-sm)' }}>
              <img
                src={getImage(exp)}
                alt={exp.nombre}
                style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
              {getExtraCopy(exp)}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
              <span className="menu-price">${parseFloat(exp.precio).toFixed(2)}</span>
              <button className="btn-lab btn-lab-sm" onClick={() => navigate(`/reservar?exp=${exp.id}`)}>Reservar</button>
            </div>
            <div className="summary-box" style={{ marginBottom: 0 }}>
              <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--color-text-light)', fontSize: '13px', lineHeight: 1.6 }}>
                <li>Reserva de mesa por 2h y servicio personalizado.</li>
                <li>Incluye maridaje sugerido; añade bebida u opcionales al reservar.</li>
                <li>Confirmación inmediata y recordatorio por correo.</li>
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Experiencias;
