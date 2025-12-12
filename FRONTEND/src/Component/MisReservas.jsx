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
        const data = await response.json();
        const mine = data.filter((r) => Number(r.cliente) === Number(user.idcliente));
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
    const flag = Number(reserva?.estadoreserva);
    if (flag === 2) return 'Atendido';
    if (flag === 1) return 'Pendiente';

    const now = new Date();
    const dateStr = reserva.fechareserva || '';
    const timeStr = reserva.horainicio || '00:00';
    const date = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(date)) return 'Pendiente';
    return date >= now ? 'Pendiente' : 'Atendido';
  };

  const stats = useMemo(() => {
    const total = reservas.length;
    const pendientes = reservas.filter((r) => computeStatus(r) === 'Pendiente').length;
    const concluidas = total - pendientes;
    return { total, pendientes, concluidas };
  }, [reservas]);

  const cancelarReserva = async (idreserva) => {
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
      const response = await fetch(`http://127.0.0.1:8000/api/reservas/${idreserva}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo_cancelacion: motivo }),
      });

      if (response.ok) {
        setReservas((prev) => prev.filter((r) => r.idreserva !== idreserva));
        Swal.fire('Reserva cancelada', 'Hemos registrado tu cancelación.', 'success');
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
                <th>Experiencia / Plato</th>
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
                return (
                  <tr key={reserva.idreserva}>
                    <td style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                    <td>{reserva.fechareserva}</td>
                    <td>{reserva.horainicio} - {reserva.horafin}</td>
                    <td>
                      {reserva.plato_info ? reserva.plato_info.nombreplato : (reserva.experiencia_info ? reserva.experiencia_info.nombre : '—')}
                    </td>
                    <td>{reserva.mesa_info ? reserva.mesa_info.nombremessa : '—'}</td>
                    <td>
                      <span className={`status-chip ${status === 'Pendiente' ? 'status-pending' : 'status-done'}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      {isCancelable ? (
                        <button className="btn-lab btn-lab-danger btn-lab-sm" onClick={() => cancelarReserva(reserva.idreserva)}>
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
