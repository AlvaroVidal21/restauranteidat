import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// Dashboard del Administrador
// Muestra lista de reservas, estadisticas y permite gestionar reservas
const Dashboard = () => {
    const [reservas, setReservas] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [quickFilter, setQuickFilter] = useState('all');
    const [detailOpen, setDetailOpen] = useState(false);
    const [editReserva, setEditReserva] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [viewReserva, setViewReserva] = useState(null);

    const timeSlots = [
        { label: '2:00 PM', value: '14:00' },
        { label: '4:00 PM', value: '16:00' },
        { label: '6:00 PM', value: '18:00' },
        { label: '8:00 PM', value: '20:00' },
    ];

    // Cargar datos al iniciar
    useEffect(() => {
        fetchReservations();
        fetchMesas();
    }, []);

    const fetchMesas = async () => {
        try {
            const resp = await fetch('http://127.0.0.1:8000/api/mesas');
            const data = await resp.json();
            setMesas(data);
        } catch (error) {
            console.error('Error cargando mesas', error);
        }
    };

    const fetchReservations = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/listareservas');
            const data = await response.json();
            setReservas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error cargando reservas', error);
        }
    };

    // Cancelar una reserva
    const cancelReservation = async (id) => {
        const result = await Swal.fire({
            title: 'Cancelar Reserva',
            text: 'Esta accion eliminara la reserva.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Si, cancelar',
            cancelButtonText: 'No'
        });

        if (result.isConfirmed) {
            try {
                const resp = await fetch(`http://127.0.0.1:8000/api/reservas/${id}`, {
                    method: 'DELETE'
                });
                if (resp.ok) {
                    fetchReservations();
                    Swal.fire('Cancelada', 'La reserva ha sido eliminada.', 'success');
                } else {
                    Swal.fire('Error', 'No se pudo cancelar la reserva.', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Error de conexion.', 'error');
            }
        }
    };

    // Marcar reserva como atendida
    const markAsAttended = async (reserva) => {
        const result = await Swal.fire({
            title: 'Marcar como atendida',
            text: 'Confirmas que la reserva fue atendida?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Si, marcar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const resp = await fetch(`http://127.0.0.1:8000/api/reservas/${reserva.id}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'atendida' })
            });

            if (resp.ok) {
                fetchReservations();
                Swal.fire('Listo', 'Reserva marcada como atendida.', 'success');
            } else {
                Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de conexion.', 'error');
        }
    };

    // Filtrar reservas por fecha
    const filteredReservas = reservas.filter((reserva) => {
        const fechaReserva = reserva.fecha || '';

        if (quickFilter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            if (fechaReserva !== today) return false;
        }

        if (!dateRange.start && !dateRange.end) return true;

        const date = new Date(fechaReserva);
        if (dateRange.start && date < new Date(dateRange.start)) return false;
        if (dateRange.end && date > new Date(dateRange.end)) return false;

        return true;
    });

    // Calcular estadisticas
    const today = new Date().toISOString().split('T')[0];
    const stats = {
        total: filteredReservas.length,
        today: filteredReservas.filter(r => r.fecha === today).length,
        pendientes: filteredReservas.filter(r => r.estado === 'pendiente').length,
    };

    // Calcular ingresos estimados
    const totalIngresos = filteredReservas.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
    const ticketPromedio = filteredReservas.length ? totalIngresos / filteredReservas.length : 0;

    // Obtener nombre del cliente
    const getClienteName = (reserva) => {
        if (reserva.cliente && reserva.cliente.nombres) return reserva.cliente.nombres;
        return 'Sin cliente';
    };

    // Obtener nombre de la mesa
    const getMesaName = (reserva) => {
        if (reserva.mesa && reserva.mesa.nombre) return reserva.mesa.nombre;
        return 'Sin mesa';
    };

    // Obtener descripcion de la experiencia
    const getExperiencia = (reserva) => {
        const detalles = reserva.detalles_consumo;
        if (detalles && detalles.experiencia) return detalles.experiencia;
        return 'Sin experiencia';
    };

    // Determinar estado visual
    const getEstadoLabel = (estado) => {
        const estados = {
            'pendiente': 'Pendiente',
            'confirmada': 'Confirmada',
            'atendida': 'Atendida',
            'cancelada': 'Cancelada'
        };
        return estados[estado] || 'Pendiente';
    };

    const getEstadoClass = (estado) => {
        if (estado === 'atendida') return 'status-done';
        if (estado === 'cancelada') return 'status-cancelled';
        return 'status-pending';
    };

    // Abrir modal para ver detalles
    const openView = (reserva) => {
        setViewReserva(reserva);
        setViewOpen(true);
    };

    const closeView = () => {
        setViewOpen(false);
        setViewReserva(null);
    };

    // Abrir modal para editar
    const openEdit = (reserva) => {
        setEditReserva({ ...reserva });
        setDetailOpen(true);
    };

    const closeEdit = () => {
        setDetailOpen(false);
        setEditReserva(null);
    };

    // Guardar cambios en reserva
    const saveReservation = async () => {
        if (!editReserva) return;

        try {
            const resp = await fetch(`http://127.0.0.1:8000/api/reservas/${editReserva.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: editReserva.fecha,
                    hora_inicio: editReserva.hora_inicio,
                    hora_fin: editReserva.hora_fin,
                    cantidad_personas: editReserva.cantidad_personas,
                    mesa_id: editReserva.mesa_id,
                    motivo: editReserva.motivo
                })
            });

            if (resp.ok) {
                Swal.fire('Actualizada', 'La reserva fue modificada.', 'success');
                closeEdit();
                fetchReservations();
            } else {
                const err = await resp.json();
                Swal.fire('Error', err.message || 'No se pudo actualizar.', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de conexion.', 'error');
        }
    };

    // Manejar cambios en el formulario de edicion
    const handleEditChange = (field, value) => {
        if (field === 'hora_inicio') {
            // Calcular hora fin automaticamente (+2 horas)
            const [h, m] = (value || '').split(':');
            const endH = (parseInt(h || '0', 10) + 2).toString().padStart(2, '0');
            setEditReserva(prev => ({ ...prev, hora_inicio: value, hora_fin: `${endH}:${m || '00'}` }));
            return;
        }
        setEditReserva(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="lab-container">
            {/* Encabezado */}
            <div className="section-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p className="menu-meta">Panel Administrativo</p>
                <h2 style={{ marginBottom: '8px' }}>Dashboard de Reservas</h2>
                <p className="text-muted" style={{ maxWidth: '720px', margin: '0 auto' }}>
                    Gestiona reservas, filtra por fecha y revisa estadisticas.
                </p>
            </div>

            {/* Tarjetas de estadisticas */}
            <div className="stat-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #0f1117, #171b23)', color: '#f6f7fb', border: 'none' }}>
                    <div className="stat-label" style={{ color: '#9aa0b5' }}>Total Reservas</div>
                    <div className="stat-value" style={{ color: 'white', fontSize: '2.4rem' }}>{stats.total}</div>
                </div>
                <div className="stat-card" style={{ background: '#fff8ec', border: '1px solid #f1e0c2' }}>
                    <div className="stat-label" style={{ color: '#a67c27' }}>Para Hoy</div>
                    <div className="stat-value" style={{ color: '#8b5e15' }}>{stats.today}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Ingresos Estimados</div>
                    <div className="stat-value">${totalIngresos.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Ticket Promedio</div>
                    <div className="stat-value">${ticketPromedio.toFixed(2)}</div>
                </div>
            </div>

            {/* Tabla de reservas */}
            <div className="lab-card table-card">
                <div style={{ padding: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                        <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>Bitacora de Reservas</h3>
                        <p className="text-muted" style={{ margin: 0 }}>Filtra por rango, o usa el atajo "Solo hoy".</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            className={`pill-tab ${quickFilter === 'today' ? 'pill-tab-active' : ''}`}
                            onClick={() => setQuickFilter(quickFilter === 'today' ? 'all' : 'today')}
                            style={{ borderRadius: '12px', padding: '10px 14px' }}
                        >
                            Solo hoy
                        </button>
                        <div>
                            <label style={{ marginBottom: '4px', display: 'block' }}>Desde</label>
                            <input type="date" className="lab-input" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ marginBottom: '4px', display: 'block' }}>Hasta</label>
                            <input type="date" className="lab-input" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                        </div>
                        {(dateRange.start || dateRange.end || quickFilter === 'today') && (
                            <button className="btn-lab btn-lab-sm" onClick={() => { setDateRange({ start: '', end: '' }); setQuickFilter('all'); }}>
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </div>
                <div className="table-scroll" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <table className="lab-table" style={{ minWidth: '920px' }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Mesa</th>
                                <th>Experiencia</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReservas.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                        No hay reservas para mostrar.
                                    </td>
                                </tr>
                            )}
                            {filteredReservas.map(reserva => {
                                const estado = reserva.estado || 'pendiente';
                                const isAtendido = estado === 'atendida';
                                return (
                                    <tr key={reserva.id}>
                                        <td>{reserva.id}</td>
                                        <td>{getClienteName(reserva)}</td>
                                        <td>{getMesaName(reserva)}</td>
                                        <td>{getExperiencia(reserva)}</td>
                                        <td>{reserva.fecha || '-'}</td>
                                        <td>{reserva.hora_inicio || '-'}</td>
                                        <td>
                                            <span className={`status-chip ${getEstadoClass(estado)}`}>
                                                {getEstadoLabel(estado)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-stack">
                                                <div className="action-row">
                                                    <button className="action-pill action-pill-view" onClick={() => openView(reserva)}>
                                                        Ver
                                                    </button>
                                                    <button className="action-pill action-pill-edit" onClick={() => openEdit(reserva)}>
                                                        Editar
                                                    </button>
                                                </div>
                                                {!isAtendido && estado !== 'cancelada' && (
                                                    <button className="action-pill action-pill-edit" onClick={() => markAsAttended(reserva)}>
                                                        Marcar atendido
                                                    </button>
                                                )}
                                                {estado !== 'cancelada' && (
                                                    <button className="action-pill action-pill-cancel" onClick={() => cancelReservation(reserva.id)}>
                                                        Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de edicion */}
            {detailOpen && editReserva && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '16px' }}>
                    <div className="lab-card" style={{ width: '540px', maxWidth: '95%', padding: 'var(--spacing-lg)', position: 'relative' }}>
                        <button onClick={closeEdit} style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }}>X</button>
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Editar Reserva #{editReserva.id}</h3>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label>Fecha</label>
                            <input type="date" className="lab-input" value={editReserva.fecha || ''} onChange={(e) => handleEditChange('fecha', e.target.value)} />
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label>Hora</label>
                            <select className="lab-input" value={editReserva.hora_inicio || ''} onChange={(e) => handleEditChange('hora_inicio', e.target.value)}>
                                <option value="">-- Seleccione --</option>
                                {timeSlots.map(slot => (
                                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                                ))}
                            </select>
                            {editReserva.hora_fin && (
                                <p className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>Fin: {editReserva.hora_fin}</p>
                            )}
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label>Mesa</label>
                            <select className="lab-input" value={editReserva.mesa_id || ''} onChange={(e) => handleEditChange('mesa_id', e.target.value)}>
                                <option value="">-- Seleccione --</option>
                                {mesas.map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre} ({m.capacidad} sillas) - {m.ubicacion}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label>Personas</label>
                            <input type="number" className="lab-input" min="1" max="20" value={editReserva.cantidad_personas || 1} onChange={(e) => handleEditChange('cantidad_personas', e.target.value)} />
                        </div>

                        <div className="actions-inline" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button className="btn-lab" onClick={closeEdit}>Cerrar</button>
                            <button className="btn-lab btn-lab-primary" onClick={saveReservation}>Guardar cambios</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de visualizacion */}
            {viewOpen && viewReserva && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '16px' }}>
                    <div className="lab-card" style={{ width: '580px', maxWidth: '95%', padding: 'var(--spacing-lg)', position: 'relative' }}>
                        <button onClick={closeView} style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }}>X</button>
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Reserva #{viewReserva.id}</h3>

                        <div className="summary-box" style={{ marginBottom: 'var(--spacing-md)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <span className="menu-meta">Cliente</span>
                                    <p style={{ margin: 0 }}>{getClienteName(viewReserva)}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Mesa</span>
                                    <p style={{ margin: 0 }}>{getMesaName(viewReserva)}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Fecha y Hora</span>
                                    <p style={{ margin: 0 }}>{viewReserva.fecha} - {viewReserva.hora_inicio}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Personas</span>
                                    <p style={{ margin: 0 }}>{viewReserva.cantidad_personas}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Estado</span>
                                    <p style={{ margin: 0 }}>{getEstadoLabel(viewReserva.estado)}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Total</span>
                                    <p style={{ margin: 0, color: 'var(--color-gold)', fontWeight: 'bold' }}>${parseFloat(viewReserva.total || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {viewReserva.detalles_consumo && (
                            <div className="summary-box" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <h4 style={{ marginBottom: '8px' }}>Detalles del Consumo</h4>
                                <p style={{ margin: '4px 0' }}><strong>Experiencia:</strong> {viewReserva.detalles_consumo.experiencia || 'N/A'}</p>
                                <p style={{ margin: '4px 0' }}><strong>Bebida:</strong> {viewReserva.detalles_consumo.drink_name || 'N/A'}</p>
                                {viewReserva.detalles_consumo.opcionales_nombres && viewReserva.detalles_consumo.opcionales_nombres.length > 0 && (
                                    <p style={{ margin: '4px 0' }}><strong>Extras:</strong> {viewReserva.detalles_consumo.opcionales_nombres.join(', ')}</p>
                                )}
                            </div>
                        )}

                        <div className="actions-inline">
                            <button className="btn-lab" onClick={closeView}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
