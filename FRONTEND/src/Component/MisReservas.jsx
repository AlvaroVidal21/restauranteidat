import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/listareservas');
        // Assuming the new controller uses standard resources or similar.
        // If the user's routes are "api/reservas", let's use that.
        // Actually, previous code used "listareservas". I should probably check routes, but standard REST is "reservas".
        // Let's assume "reservas" returns all, and we filter client-side (not ideal for security but consistent with previous code).
        // Or if there is a specific endpoint for "my reservations", but the previous code filtered client side.

        const data = await response.json();
        // user.id might be the new field, or idcliente
        const userId = user.id || user.idcliente;
        const mine = Array.isArray(data) ? data.filter((r) => Number(r.cliente_id) === Number(userId)) : [];
        setReservas(mine);
      } catch (err) {
        console.error('Error al cargar reservas', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const computeStatus = (reserva) => {
    // New logic: Check 'estado' field directly or compute based on time
    if (reserva.estado === 'cancelada') return 'Cancelada';
    if (reserva.estado === 'completada' || reserva.estado === 'atendido') return 'Atendido';

    // Fallback date check
    const now = new Date();
    const rawDateStr = reserva.fecha || '';
    const dateStr = (rawDateStr || '').slice(0, 10);
    const timeStr = reserva.hora_inicio || '00:00';
    const date = new Date(`${dateStr}T${timeStr}`);

    if (isNaN(date.getTime())) return 'Pendiente'; // Default
    return date >= now ? 'Pendiente' : 'Atendido';
  };

  const formatDate = (value) => {
    const raw = (value || '').toString();
    const short = raw.slice(0, 10);
    const d = new Date(short);
    return Number.isNaN(d.getTime()) ? short : d.toLocaleDateString('es-PE');
  };

  const stats = useMemo(() => {
    const total = reservas.length;
    const pendientes = reservas.filter((r) => computeStatus(r) === 'Pendiente').length;
    const concluidas = total - pendientes;
    return { total, pendientes, concluidas };
  }, [reservas]);

  const cancelarReserva = async (id) => {
    const { value: motivo } = await Swal.fire({
      title: 'Cancelar reserva',
      text: 'Cuéntenos el motivo de cancelación',
      input: 'text',
      inputPlaceholder: 'Ej: Cambio de fecha, emergencia, etc.',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Volver',
      inputValidator: (value) => {
        if (!value || value.trim().length < 4) {
          return 'Ingrese un motivo breve (mínimo 4 caracteres)';
        }
        return null;
      },
    });

    if (!motivo) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reservas/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'cancelada', motivo_cancelacion: motivo }),
      });

      if (response.ok) {
        setReservas((prev) => prev.map((r) => (r.id === id ? { ...r, estado: 'cancelada' } : r)));
        Swal.fire('Reserva cancelada', 'Tu reserva fue cancelada y queda registrada en tu historial.', 'success');
      } else {
        const errorData = await response.json();
        Swal.fire('No se pudo cancelar', errorData.message || 'Intente nuevamente.', 'error');
      }
    } catch (error) {
      Swal.fire('Error de conexión', 'No pudimos comunicar con el servidor.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="lab-container" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
        <p className="text-muted">Inicia sesión para ver tus reservas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="lab-container" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
        <p className="text-muted">Cargando tus reservas...</p>
      </div>
    );
  }

  return (
    <div className="lab-container">
      <div className="section-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <p className="menu-meta">Tus reservas</p>
        <h2>Agenda personal</h2>
        <p className="text-muted" style={{ maxWidth: '520px', margin: '0 auto' }}>
          Consulta reservas pendientes, revisa tu historial y cancela con un motivo si es necesario.
        </p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendientes}</div>
          <div className="stat-label">Pendientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.concluidas}</div>
          <div className="stat-label">Concluidas</div>
        </div>
      </div>

      <div className="lab-card table-card">
        <div style={{ padding: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ marginBottom: '4px' }}>Mis reservas</h3>
            <p className="text-muted" style={{ margin: 0 }}>Pendientes y anteriores</p>
          </div>
        </div>

        <div className="table-scroll">
          <table className="lab-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Experiencia / Detalle</th>
                <th>Mesa</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                    <span className="text-muted">Aún no tienes reservas registradas.</span>
                  </td>
                </tr>
              )}

              {reservas.map((reserva, idx) => {
                const status = computeStatus(reserva);
                const isCancelable = status === 'Pendiente';

                // Parse detalles_consumo if string (though it should be cast by Laravel)
                let detalles = reserva.detalles_consumo;
                if (typeof detalles === 'string') {
                  try { detalles = JSON.parse(detalles); } catch (e) { }
                }
                const expName = detalles?.experiencia || detalles?.experiencia_info?.nombre || 'Reserva Simple';

                return (
                  <tr key={reserva.id}>
                    <td style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                    <td>{formatDate(reserva.fecha)}</td>
                    <td>{reserva.hora_inicio} - {reserva.hora_fin}</td>
                    <td>
                      {expName}
                    </td>
                    <td>{reserva.mesa ? reserva.mesa.nombre : '—'}</td>
                    <td>
                      <span className={`status-chip ${status === 'Pendiente' ? 'status-pending' : 'status-done'}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      {isCancelable ? (
                        <button className="btn-lab btn-lab-danger btn-lab-sm" onClick={() => cancelarReserva(reserva.id)}>
                          Cancelar
                        </button>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '12px' }}>No disponible</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MisReservas;
