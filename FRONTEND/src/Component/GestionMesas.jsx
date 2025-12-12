import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const GestionMesas = () => {
    const [mesas, setMesas] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMesa, setEditMesa] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        capacidad: '',
        ubicacion: '',
        tipo: 'familiar',
        estado: 'disponible'
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
                    data = { message: 'Error en servidor' };
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
                nombre: mesa.nombre,
                capacidad: mesa.capacidad,
                ubicacion: mesa.ubicacion,
                tipo: mesa.tipo || 'familiar',
                estado: mesa.estado || 'disponible'
            });
        } else {
            setEditMesa(null);
            setFormData({
                nombre: '',
                capacidad: '',
                ubicacion: '',
                tipo: 'familiar',
                estado: 'disponible'
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditMesa(null);
    };

    const handleSave = async () => {
        if (!formData.nombre || !formData.capacidad) {
            Swal.fire('Error', 'Nombre y Capacidad son obligatorios', 'error');
            return;
        }

        const id = editMesa ? editMesa.id : null;
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
                                        <th>Código</th>
                                        <th>Nombre</th>
                                        <th>Sillas</th>
                                <th>Ubicación</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mesas.map(mesa => (
                                <tr key={mesa.id}>
                                    <td>{mesa.codigo || mesa.id}</td>
                                    <td>{mesa.nombre}</td>
                                    <td>{mesa.capacidad} sillas</td>
                                    <td>{mesa.ubicacion}</td>
                                    <td>{mesa.tipo}</td>
                                    <td>
                                        <span className={`status-chip ${mesa.estado === 'disponible' ? 'status-done' : 'status-pending'}`}>
                                            {mesa.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-row">
                                            <button className="action-pill action-pill-edit" onClick={() => openModal(mesa)}>
                                                Editar
                                            </button>
                                            <button className="action-pill action-pill-cancel" onClick={() => handleDelete(mesa.id)}>
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
                <div className="modal-overlay" role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div className="lab-card" style={{ width: '520px', maxWidth: '96%', padding: '28px', borderRadius: '12px', boxShadow: '0 8px 28px rgba(0,0,0,0.18)' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editMesa ? 'Editar Mesa' : 'Nueva Mesa'}</h3>
                        <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label>Nombre de Mesa</label>
                                <input className="lab-input" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Mesa 1" />
                            </div>
                            <div>
                                <label>Sillas</label>
                                <input type="number" className="lab-input" value={formData.capacidad} onChange={e => setFormData({ ...formData, capacidad: e.target.value })} placeholder="Ej: 4" />
                            </div>
                            <div>
                                <label>Ubicación</label>
                                <input className="lab-input" value={formData.ubicacion} onChange={e => setFormData({ ...formData, ubicacion: e.target.value })} placeholder="Ej: Terraza" />
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
                            <div>
                                <label>Estado</label>
                                <select className="lab-input" value={formData.estado} onChange={e => setFormData({ ...formData, estado: e.target.value })}>
                                    <option value="disponible">Disponible</option>
                                    <option value="ocupada">Ocupada</option>
                                    <option value="mantenimiento">Mantenimiento</option>
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
