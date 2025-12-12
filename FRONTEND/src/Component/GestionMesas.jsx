import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const GestionMesas = () => {
    const [mesas, setMesas] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMesa, setEditMesa] = useState(null);
    const [formData, setFormData] = useState({
        nombremessa: '',
        cantidadsillas: '',
        ubicacionmesa: '',
        tipo: 'familiar'
    });

    useEffect(() => {
        fetchMesas();
    }, []);

    const fetchMesas = async () => {
        try {
            const resp = await fetch('http://127.0.0.1:8000/api/mesas');
            if (resp.ok) {
                const data = await resp.json();
                setMesas(data);
            }
        } catch (error) {
            console.error('Error fetching mesas', error);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar mesa?',
            text: 'Solo se podrá eliminar si no tiene reservas activas.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const resp = await fetch(`http://127.0.0.1:8000/api/mesas/${id}`, { method: 'DELETE' });

                let data = {};
                const contentType = resp.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    data = await resp.json();
                } else {
                    // If not JSON, it might be an HTML error page from Laravel (500)
                    const text = await resp.text();
                    console.error("Non-JSON response:", text);
                    data = { message: `Error del servidor (${resp.status}). Ver consola.` };
                }

                if (resp.ok) {
                    Swal.fire('Eliminada', 'La mesa ha sido eliminada.', 'success');
                    fetchMesas();
                } else {
                    Swal.fire('Error', data.message || 'No se pudo eliminar.', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Error de conexión o servidor caído', 'error');
            }
        }
    };

    const openModal = (mesa = null) => {
        if (mesa) {
            setEditMesa(mesa);
            setFormData({
                nombremessa: mesa.nombremessa,
                cantidadsillas: mesa.cantidadsillas || mesa.sillas,
                ubicacionmesa: mesa.ubicacionmesa || mesa.zona,
                tipo: mesa.tipo || 'familiar'
            });
        } else {
            setEditMesa(null);
            setFormData({
                nombremessa: '',
                cantidadsillas: '',
                ubicacionmesa: '',
                tipo: 'familiar'
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditMesa(null);
    };

    const handleSave = async () => {
        if (!formData.nombremessa || !formData.cantidadsillas) {
            Swal.fire('Error', 'Nombre y Cantidad de sillas son obligatorios', 'error');
            return;
        }

        const id = editMesa ? (editMesa.idmesa || editMesa.id) : null;
        const url = id
            ? `http://127.0.0.1:8000/api/mesas/${id}`
            : 'http://127.0.0.1:8000/api/mesas';

        const method = id ? 'PUT' : 'POST';

        try {
            const resp = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (resp.ok) {
                Swal.fire('Guardado', 'Mesa guardada correctamente', 'success');
                closeModal();
                fetchMesas();
            } else {
                const err = await resp.json();
                Swal.fire('Error', err.message || 'No se pudo guardar la mesa', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error al conectar con el servidor', 'error');
        }
    };

    return (
        <div className="lab-container">
            <div className="section-header">
                <p className="menu-meta">Administración</p>
                <h2>Gestión de Mesas</h2>
                <p className="text-muted">Añade, edita o elimina mesas. La eliminación está protegida si hay reservas pendientes.</p>
            </div>

            <div className="lab-card table-card">
                <div style={{ padding: 'var(--spacing-lg)', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid var(--color-border)' }}>
                    <button className="btn-lab btn-lab-primary" onClick={() => openModal()}>
                        + Nueva Mesa
                    </button>
                </div>

                <div className="table-scroll">
                    <table className="lab-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Capacidad</th>
                                <th>Ubicación / Zona</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mesas.map(mesa => (
                                <tr key={mesa.idmesa || mesa.id}>
                                    <td>{mesa.idmesa || mesa.id}</td>
                                    <td>{mesa.nombremessa}</td>
                                    <td>{mesa.cantidadsillas || mesa.sillas} pax</td>
                                    <td>{mesa.ubicacionmesa || mesa.zona}</td>
                                    <td>{mesa.tipo}</td>
                                    <td>
                                        <span className={`status-chip ${mesa.disponible ? 'status-pending' : 'status-done'}`}>
                                            {mesa.disponible ? 'Habilitada' : 'Inhabilitada'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-row">
                                            <button className="action-pill action-pill-edit" onClick={() => openModal(mesa)}>
                                                Editar
                                            </button>
                                            <button className="action-pill action-pill-cancel" onClick={() => handleDelete(mesa.idmesa || mesa.id)}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {mesas.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center" style={{ padding: '40px' }}>
                                        No hay mesas registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="lab-card" style={{ width: '500px', maxWidth: '90%', padding: '30px' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editMesa ? 'Editar Mesa' : 'Nueva Mesa'}</h3>
                        <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label>Nombre de Mesa</label>
                                <input className="lab-input" value={formData.nombremessa} onChange={e => setFormData({ ...formData, nombremessa: e.target.value })} placeholder="Ej: Mesa 1" />
                            </div>
                            <div>
                                <label>Capacidad (Sillas)</label>
                                <input type="number" className="lab-input" value={formData.cantidadsillas} onChange={e => setFormData({ ...formData, cantidadsillas: e.target.value })} placeholder="Ej: 4" />
                            </div>
                            <div>
                                <label>Ubicación / Zona</label>
                                <input className="lab-input" value={formData.ubicacionmesa} onChange={e => setFormData({ ...formData, ubicacionmesa: e.target.value })} placeholder="Ej: Terraza" />
                            </div>
                            <div>
                                <label>Tipo</label>
                                <select className="lab-input" value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                                    <option value="familiar">Familiar</option>
                                    <option value="pareja">Pareja</option>
                                    <option value="solitario">Solitario</option>
                                    <option value="romantica">Romántica</option>
                                </select>
                            </div>
                        </div>
                        <div className="actions-inline" style={{ marginTop: '30px', justifyContent: 'flex-end' }}>
                            <button className="btn-lab" onClick={closeModal} style={{ marginRight: '10px' }}>Cancelar</button>
                            <button className="btn-lab btn-lab-primary" onClick={handleSave}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionMesas;
