import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Inicio = () => {
  const navigate = useNavigate();
  const [experiencias, setExperiencias] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/experiencias')
      .then(res => res.json())
      .then(data => setExperiencias(Array.isArray(data) ? data : []))
      .catch(() => setExperiencias([]));
  }, []);

  return (
    <div className="lab-container">
      <section className="hero-lux">
        <div className="hero-copy">
          <span className="hero-badge">La Maison · Alta Cocina</span>
          <h1 className="hero-title">Cocina de Autor sin Apuro</h1>
          <p className="hero-subtitle">
            Una experiencia gastronómica íntima donde la técnica moderna se encuentra con los sabores de origen.
            Deguste cada plato mientras el salón se envuelve en luz tenue y música suave.
          </p>
          <div className="hero-cta">
            <button className="btn-lab btn-lab-primary" onClick={() => navigate('/reservar')}>Reservar Mesa</button>
          </div>
        </div>
        <div className="hero-image" aria-hidden="true"></div>
      </section>

      <section>
        <div className="section-header">
          <p className="menu-meta">Experiencias</p>
          <h2>Descubre nuestras experiencias</h2>
          <div className="gold-line"></div>
          <button className="btn-lab btn-lab-sm" onClick={() => navigate('/experiencias')} style={{ marginTop: 'var(--spacing-sm)' }}>
            Ver detalles
          </button>
        </div>

        <div className="menu-grid">
          {experiencias.length === 0 && (
            <article className="menu-card">
              <p className="menu-meta">Pronto</p>
              <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>Experiencias disponibles</h3>
              <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                Aún no hay experiencias cargadas. Vuelve pronto o reserva para conocer la propuesta del día.
              </p>
              <button className="btn-lab btn-lab-sm" onClick={() => navigate('/reservar')}>Reservar</button>
            </article>
          )}

          {experiencias.map(exp => (
            <article key={exp.id} className="menu-card">
              <p className="menu-meta">Experiencia</p>
              <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{exp.nombre}</h3>
              <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
                {exp.descripcion || 'Propuesta de autor diseñada para sorprender.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="menu-price">${parseFloat(exp.precio).toFixed(2)}</span>
                <button className="btn-lab btn-lab-sm" onClick={() => navigate(`/reservar?exp=${exp.idexperiencia}`)}>Reservar</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-panel" style={{ marginTop: 'var(--spacing-xl)' }}>
        <p className="menu-meta">Reservas</p>
        <h2 style={{ color: 'var(--color-white)', marginBottom: 'var(--spacing-md)' }}>Viva la Experiencia</h2>
        <p style={{ color: 'rgba(255,255,255,0.78)', maxWidth: '520px', margin: '0 auto var(--spacing-lg)' }}>
          Para garantizar la mejor atención, le sugerimos reservar con 24 horas de anticipación. Nuestro concierge confirmará cada detalle.
        </p>
        <button className="btn-lab btn-lab-primary" onClick={() => navigate('/reservar')}>
          Agendar Mesa
        </button>
      </section>
    </div>
  )
}

export default Inicio;
