import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Dashboard = () => {
    const [reservas, setReservas] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [stats, setStats] = useState({ total: 0, today: 0 });
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [financials, setFinancials] = useState({ total: 0, avg: 0 });
    const [detailOpen, setDetailOpen] = useState(false);
    const [editReserva, setEditReserva] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [viewReserva, setViewReserva] = useState(null);
    const [quickFilter, setQuickFilter] = useState('all');

    const timeSlots = [
        { label: '2:00 PM', value: '14:00' },
        { label: '4:00 PM', value: '16:00' },
        { label: '6:00 PM', value: '18:00' },
        { label: '8:00 PM', value: '20:00' },
    ];

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
            setReservas(data);
            calculateStats(data);
            calculateFinancials(data);
        } catch (error) {
            console.error(error);
        }
    };

    const calculateStats = (data) => {
        const today = new Date().toISOString().split('T')[0];
        const todayCount = data.filter(r => r.fechareserva === today).length;
        setStats({
            total: data.length,
            today: todayCount
        });
    };

    const getBasePrice = (reserva) => {
        const price = reserva?.experiencia_info?.precio
            ?? reserva?.plato_info?.precio
            ?? reserva?.experiencia?.precio
            ?? reserva?.plato?.precio
            ?? 0;
        const qty = Number(reserva?.cantidadpersonas || 1);
        return parseFloat(price || 0) * qty;
    };

    const calculateFinancials = (data) => {
        const totalRevenue = data.reduce((sum, r) => sum + getBasePrice(r), 0);
        const avgTicket = data.length ? totalRevenue / data.length : 0;
        setFinancials({ total: totalRevenue, avg: avgTicket });
    };

    const deleteReservation = async (id) => {
        Swal.fire({
            title: '¿Cancelar Reserva?',
            text: 'Esta acción liberará la mesa.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await fetch(`http://127.0.0.1:8000/api/reservas/${id}`, { method: 'DELETE' });
                fetchReservations();
                Swal.fire('Cancelada', 'La reserva ha sido eliminada.', 'success');
            }
        });
    };

    const filteredReservas = reservas.filter((reserva) => {
        if (quickFilter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            if (reserva.fechareserva !== today) return false;
        }
        if (!dateRange.start && !dateRange.end) return true;
        const date = new Date(reserva.fechareserva);
        if (dateRange.start && date < new Date(dateRange.start)) return false;
        if (dateRange.end && date > new Date(dateRange.end)) return false;
        return true;
    });

    const filteredStats = {
        total: filteredReservas.length,
        today: filteredReservas.filter(r => r.fechareserva === new Date().toISOString().split('T')[0]).length,
    };

    const filteredFinancials = {
        total: filteredReservas.reduce((sum, r) => sum + getBasePrice(r), 0),
        avg: filteredReservas.length ? filteredReservas.reduce((sum, r) => sum + getBasePrice(r), 0) / filteredReservas.length : 0,
    };

    const getUnitPrice = (reserva) => (
        reserva?.experiencia_info?.precio
        ?? reserva?.plato_info?.precio
        ?? reserva?.experiencia?.precio
        ?? reserva?.plato?.precio
        ?? 0
    );

    const getBebida = (reserva) => {
        return (
            reserva?.bebida ||
            reserva?.drinkName ||
            reserva?.drink_name ||
            reserva?.bebida_info?.nombre ||
            reserva?.plato_bebida?.nombreplato ||
            reserva?.bebidaNombre ||
            'No registrado'
        );
    };

    const getExtras = (reserva) => {
        if (Array.isArray(reserva?.extras) && reserva.extras.length) return reserva.extras.join(', ');
        if (Array.isArray(reserva?.opcionalesNombres) && reserva.opcionalesNombres.length) return reserva.opcionalesNombres.join(', ');
        if (Array.isArray(reserva?.opcionales_nombres) && reserva.opcionales_nombres.length) return reserva.opcionales_nombres.join(', ');
        if (typeof reserva?.extras === 'string' && reserva.extras.trim() !== '') return reserva.extras;
        if (typeof reserva?.opcionales === 'string' && reserva.opcionales.trim() !== '') return reserva.opcionales;
        if (typeof reserva?.opcionales_nombres === 'string' && reserva.opcionales_nombres.trim() !== '') return reserva.opcionales_nombres;
        return 'No registrado';
    };

    const openDetail = (reserva) => {
        const mesaId = reserva.mesa || reserva.mesa_id || reserva.idmesa || reserva.mesa_info?.idmesa;
        setEditReserva({ ...reserva, mesa: mesaId });
        setDetailOpen(true);
    };

    const closeDetail = () => {
        setDetailOpen(false);
        setEditReserva(null);
    };

    const openView = (reserva) => {
        setViewReserva(reserva);
        setViewOpen(true);
    };

    const closeView = () => {
        setViewOpen(false);
        setViewReserva(null);
    };

    const handleEditChange = (field, value) => {
        // If changing start time, auto-derive end time (+2h)
        if (field === 'horainicio') {
            const [h, m] = (value || '').split(':');
            const endH = (parseInt(h || '0', 10) + 2).toString().padStart(2, '0');
            setEditReserva(prev => ({ ...prev, horainicio: value, horafin: `${endH}:${m || '00'}` }));
            return;
        }
        // Bloquear cambios de aforo si es romántica
        if (field === 'cantidadpersonas' && isRomantic(editReserva)) {
            return;
        }
        setEditReserva(prev => ({ ...prev, [field]: value }));
    };

    const computeStatus = (reserva) => {
        const now = new Date();
        const dateStr = reserva.fechareserva || '';
        const timeStr = reserva.horainicio || '00:00';
        const date = new Date(`${dateStr}T${timeStr}`);
        if (isNaN(date)) return 'Pendiente';
        return date >= now ? 'Pendiente' : 'Concluida';
    };

    const clean = (text) => (text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '');
    const isRomantic = (reserva) => clean(reserva?.experiencia_info?.nombre || reserva?.experiencia?.nombre || '')?.includes('romant');
    const capacity = (mesa) => Number(mesa?.sillas ?? mesa?.cantidadsillas ?? 0);
    const mesaMatches = (mesa, personas, romantica) => {
        const cap = capacity(mesa);
        if (romantica) {
            return cap === 2 && (mesa.tipo === 'pareja' || mesa.tipo === 'romantica');
        }
        if (personas <= 1) {
            return cap >= 1 && (mesa.tipo === 'solitario' || mesa.tipo == null);
        }
        return cap >= personas && (mesa.tipo === 'familiar' || mesa.tipo == null || mesa.tipo === 'pareja' || mesa.tipo === 'romantica');
    };

    const saveReservation = async () => {
        if (!editReserva) return;
        try {
            // Derive horafin en base a turno fijo de 2h
            const [h, m] = (editReserva.horainicio || '').split(':');
            const endH = (parseInt(h || '0', 10) + 2).toString().padStart(2, '0');

            const romantica = isRomantic(editReserva);
            const personasFinal = romantica ? 2 : editReserva.cantidadpersonas;
            const payload = {
                fechareserva: editReserva.fechareserva,
                horainicio: editReserva.horainicio,
                horafin: `${endH}:${m || '00'}`,
                cantidadpersonas: personasFinal,
                mesa: editReserva.mesa || editReserva.mesa_id || editReserva.idmesa,
                motivo: editReserva.motivo
            };

            const resp = await fetch(`http://127.0.0.1:8000/api/reservas/${editReserva.idreserva}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                let message = 'No se pudo actualizar la reserva.';
                try {
                    const err = await resp.json();
                    message = err.message || message;
                } catch (e) {
                    // fallback if response is HTML or empty
                    message = `Error ${resp.status}`;
                }
                Swal.fire('Error', message, 'error');
                return;
            }

            Swal.fire('Actualizada', 'La reserva fue modificada.', 'success');
            closeDetail();
            fetchReservations();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo actualizar la reserva.', 'error');
        }
    };

    return (
        <div className="lab-container">
            <div className="section-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p className="menu-meta">Panel Ejecutivo</p>
                <h2 style={{ marginBottom: '8px', letterSpacing: '0.5px' }}>Dashboard Operativo & Ingresos</h2>
                <p className="text-muted" style={{ maxWidth: '720px', margin: '0 auto' }}>
                    Monitorea reservas, aforo y estimados de ingresos; filtra rápido por fecha o solo para hoy.
                </p>
            </div>

            <div className="stat-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #0f1117, #171b23)', color: '#f6f7fb', border: 'none' }}>
                    <div className="stat-label" style={{ color: '#9aa0b5' }}>Reservas (filtro)</div>
                    <div className="stat-value" style={{ fontSize: '2.4rem' }}>{filteredStats.total}</div>
                </div>
                <div className="stat-card" style={{ background: '#fff8ec', border: '1px solid #f1e0c2' }}>
                    <div className="stat-label" style={{ color: '#a67c27' }}>Para hoy</div>
                    <div className="stat-value" style={{ color: '#8b5e15' }}>{filteredStats.today}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Ingresos Estimados</div>
                    <div className="stat-value">${filteredFinancials.total.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Ticket Promedio</div>
                    <div className="stat-value">${filteredFinancials.avg.toFixed(2)}</div>
                </div>
            </div>

            <div className="lab-card table-card">
                <div style={{ padding: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                        <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>Bitácora de Reservas</h3>
                        <p className="text-muted" style={{ margin: 0 }}>Filtra por rango, o usa el atajo “Solo hoy”.</p>
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
                                <th>Experiencia (Plato)</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReservas.map(reserva => (
                                <tr key={reserva.idreserva}>
                                    <td>{reserva.idreserva}</td>
                                    <td>{reserva.cliente_info ? reserva.cliente_info.nombres : 'N/A'}</td>
                                    <td>{reserva.mesa_info ? reserva.mesa_info.nombremessa : 'N/A'}</td>
                                    <td>
                                        {reserva.plato_info
                                            ? `Plato: ${reserva.plato_info.nombreplato}`
                                            : (reserva.experiencia_info ? `Exp: ${reserva.experiencia_info.nombre}` : 'N/A')}
                                    </td>
                                    <td>{reserva.fechareserva}</td>
                                    <td>{reserva.horainicio} - {reserva.horafin}</td>
                                    <td>
                                        <span className={`status-chip ${computeStatus(reserva) === 'Pendiente' ? 'status-pending' : 'status-done'}`}>
                                            {computeStatus(reserva)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-stack">
                                            <div className="action-row">
                                                <button className="action-pill action-pill-view" onClick={() => openView(reserva)}>
                                                    Ver
                                                </button>
                                                <button className="action-pill action-pill-edit" onClick={() => openDetail(reserva)}>
                                                    Editar
                                                </button>
                                            </div>
                                            <button className="action-pill action-pill-cancel" onClick={() => deleteReservation(reserva.idreserva)}>
                                                Cancelar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {detailOpen && editReserva && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '16px' }}>
                    <div className="lab-card" style={{ width: '640px', maxWidth: '95%', padding: 'var(--spacing-lg)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={closeDetail} style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Detalle de Reserva #{editReserva.idreserva}</h3>
                        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>Ajuste fecha/horario o aforo a solicitud del cliente.</p>

                        <div className="summary-box" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                                <div>
                                    <span className="menu-meta">Cliente</span>
                                    <p style={{ margin: 0 }}>{editReserva.cliente_info?.nombres || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Mesa</span>
                                    <p style={{ margin: 0 }}>{editReserva.mesa_info?.nombremessa || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Experiencia / Plato</span>
                                    <p style={{ margin: 0 }}>{editReserva.experiencia_info?.nombre || editReserva.plato_info?.nombreplato || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Importe estimado</span>
                                    <p style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--color-gold)' }}>${getBasePrice(editReserva).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label>Fecha de reserva</label>
                                <input type="date" className="lab-input" value={editReserva.fechareserva || ''} onChange={(e) => handleEditChange('fechareserva', e.target.value)} />
                            </div>
                            <div>
                                <label>Hora (turnos fijos)</label>
                                <select className="lab-input" value={editReserva.horainicio || ''} onChange={(e) => handleEditChange('horainicio', e.target.value)}>
                                    <option value="">-- Seleccione --</option>
                                    {timeSlots.map(slot => (
                                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                                    ))}
                                </select>
                                {editReserva.horafin && (
                                    <p className="text-muted" style={{ margin: '6px 0 0 0', fontSize: '12px' }}>Fin automático: {editReserva.horafin}</p>
                                )}
                            </div>
                            <div>
                                <label>Mesa</label>
                                {(() => {
                                    const romantica = isRomantic(editReserva);
                                    const personas = romantica ? 2 : Number(editReserva.cantidadpersonas || 1);
                                    const opciones = mesas.filter(m => mesaMatches(m, personas, romantica));
                                    return (
                                        <select className="lab-input" value={editReserva.mesa || ''} onChange={(e) => handleEditChange('mesa', e.target.value)}>
                                            <option value="">-- Seleccione Mesa --</option>
                                            {opciones.map(m => (
                                                <option key={m.idmesa} value={m.idmesa}>{m.nombremessa} ({m.cantidadsillas || m.sillas} sillas) - {m.ubicacionmesa || m.zona}</option>
                                            ))}
                                        </select>
                                    );
                                })()}
                            </div>
                            <div>
                                <label>Personas</label>
                                <input
                                    type="number"
                                    className="lab-input"
                                    min="1"
                                    max="20"
                                    value={isRomantic(editReserva) ? 2 : (editReserva.cantidadpersonas || 1)}
                                    onChange={(e) => handleEditChange('cantidadpersonas', e.target.value)}
                                    disabled={isRomantic(editReserva)}
                                />
                                {isRomantic(editReserva) && (
                                    <p className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>Cena romántica: aforo fijo en 2 y solo mesas de pareja.</p>
                                )}
                            </div>
                            <div>
                                <label>Motivo / notas</label>
                                <input type="text" className="lab-input" value={editReserva.motivo || ''} onChange={(e) => handleEditChange('motivo', e.target.value)} />
                            </div>
                        </div>

                        <div className="actions-inline" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button className="btn-lab" onClick={closeDetail}>Cerrar</button>
                            <button className="btn-lab btn-lab-primary" onClick={saveReservation}>Guardar cambios</button>
                        </div>
                    </div>
                </div>
            )}

            {viewOpen && viewReserva && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '16px' }}>
                    <div className="lab-card" style={{ width: '680px', maxWidth: '95%', padding: 'var(--spacing-lg)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={closeView} style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Reserva #{viewReserva.idreserva}</h3>
                        <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>Detalle completo de la reserva.</p>

                        <div className="summary-box" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                                <div>
                                    <span className="menu-meta">Cliente</span>
                                    <p style={{ margin: 0 }}>{viewReserva.cliente_info?.nombres || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Mesa</span>
                                    <p style={{ margin: 0 }}>{viewReserva.mesa_info?.nombremessa || 'N/A'} ({viewReserva.mesa_info?.cantidadsillas || '?'} sillas)</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Fecha y turno</span>
                                    <p style={{ margin: 0 }}>{viewReserva.fechareserva} — {viewReserva.horainicio} a {viewReserva.horafin}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Personas</span>
                                    <p style={{ margin: 0 }}>{viewReserva.cantidadpersonas}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Importe estimado</span>
                                    <p style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--color-gold)' }}>${getBasePrice(viewReserva).toFixed(2)}</p>
                                </div>
                                <div>
                                    <span className="menu-meta">Estado</span>
                                    <p style={{ margin: 0 }}>{viewReserva.estadoreserva === 1 ? 'Activa' : 'Inactiva'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="summary-box" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Costos</h4>
                            <p style={{ margin: 0 }}><strong>Precio unitario:</strong> ${parseFloat(getUnitPrice(viewReserva) || 0).toFixed(2)}</p>
                            <p style={{ margin: 0 }}><strong>Personas:</strong> {viewReserva.cantidadpersonas}</p>
                            <p style={{ margin: 0 }}><strong>Total estimado:</strong> ${getBasePrice(viewReserva).toFixed(2)}</p>
                        </div>

                        <div className="summary-box" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Consumo</h4>
                            <p style={{ margin: 0 }}><strong>Experiencia:</strong> {viewReserva.experiencia_info?.nombre || 'N/A'}</p>
                            <p style={{ margin: 0 }}><strong>Plato:</strong> {viewReserva.plato_info?.nombreplato || 'Ninguno'}</p>
                            <p style={{ margin: 0 }}><strong>Bebida:</strong> {getBebida(viewReserva)}</p>
                            <p style={{ margin: 0 }}><strong>Extras:</strong> {getExtras(viewReserva)}</p>
                            {Array.isArray(viewReserva?.opcionalesNombres) && viewReserva.opcionalesNombres.length > 0 && (
                                <p style={{ margin: 0 }}><strong>Platos opcionales:</strong> {viewReserva.opcionalesNombres.join(', ')}</p>
                            )}
                        </div>

                        <div className="summary-box">
                            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Notas</h4>
                            <p style={{ margin: 0 }}>{viewReserva.motivo || 'Sin notas'}</p>
                        </div>
                        <div className="actions-inline" style={{ marginTop: 'var(--spacing-md)' }}>
                            <button className="btn-lab" onClick={closeView}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
