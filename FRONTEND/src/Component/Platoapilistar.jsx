import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export const Platoapilistar = () => {
    const navigate = useNavigate();

    const [platos, setPlatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/listarplatos')
            .then((response) => response.json())
            .then((data) => {
                setPlatos(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error al cargar platos:', error);
                setLoading(false);
            });
    }, []);

    const eliminarPlato = (idplato) => {
        Swal.fire({
            title: '¿CONFIRMAR ELIMINACIÓN?',
            text: 'Esta acción borrará el registro del sistema permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'SÍ, BORRAR',
            cancelButtonText: 'CANCELAR'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/platos/${idplato}`, {
                        method: 'DELETE'
                    });
                    const data = await response.json();
                    if (response.ok) {
                        Swal.fire('ELIMINADO', data.message || 'Plato eliminado.', 'success');
                        setPlatos((prev) => prev.filter((p) => p.idplato !== idplato));
                    } else {
                        Swal.fire('ERROR', data.message || 'No se pudo eliminar.', 'error');
                    }
                } catch (error) {
                    Swal.fire('ERROR DE CONEXIÓN', 'No se pudo conectar con el servidor.', 'error');
                }
            }
        });
    };

    const filteredPlatos = platos.filter((p) => {
        const matchNombre = (p.nombre || '').toLowerCase().includes(filtroNombre.toLowerCase());
        const matchCategoria = filtroCategoria ? (p.categoria || '').toLowerCase() === filtroCategoria.toLowerCase() : true;
        return matchNombre && matchCategoria;
    });

    if (loading) return <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>Cargando datos del sistema...</p>;

    return (
        <div className="lab-container">
            <div className="lab-card table-card">
                <div style={{ padding: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <div>
                        <p className="menu-meta">Carta / Experiencias</p>
                        <h2 style={{ marginBottom: '4px' }}>Gestión de Platos</h2>
                        <p className="text-muted" style={{ margin: 0 }}>Edite, elimine o agregue nuevas propuestas.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                        <button className="btn-lab btn-lab-primary" onClick={() => navigate('/registrarplato')}>
                            Añadir plato
                        </button>
                    </div>
                </div>

                <div style={{ padding: '0 var(--spacing-lg) var(--spacing-md)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-sm)' }}>
                    <input
                        type="text"
                        className="lab-input"
                        placeholder="Filtrar por nombre"
                        value={filtroNombre}
                        onChange={(e) => setFiltroNombre(e.target.value)}
                        style={{ marginBottom: 0 }}
                    />
                    <select
                        className="lab-input"
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        style={{ marginBottom: 0 }}
                    >
                        <option value="">Todas las categorías</option>
                        <option value="Entradas">Entradas</option>
                        <option value="Fondos">Fondos</option>
                        <option value="Postres">Postres</option>
                        <option value="Bebidas">Bebidas</option>
                    </select>
                    <button
                        type="button"
                        className="btn-lab btn-lab-sm"
                        onClick={() => { setFiltroNombre(''); setFiltroCategoria(''); }}
                        style={{ justifySelf: 'flex-start', border: 'none', padding: '4px 30px', letterSpacing: '1px', color: 'var(--color-text-muted)' }}
                    >
                        Limpiar filtros
                    </button>
                </div>

                <div className="table-scroll">
                    <table className="lab-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Precio (USD)</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlatos.length > 0 ? (
                                filteredPlatos.map((plato, index) => (
                                    <tr key={plato.id}>
                                        <td style={{ color: 'var(--color-text-muted)' }}>{index + 1}</td>
                                        <td style={{ fontWeight: 500 }}>{plato.nombre}</td>
                                        <td><span className="pill pill-gold">{plato.categoria}</span></td>
                                        <td>${parseFloat(plato.precio || 0).toFixed(2)}</td>
                                        <td style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                                            <button
                                                className="btn-lab btn-lab-sm"
                                                onClick={() => navigate(`/editarplato/${plato.id}`)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn-lab btn-lab-sm btn-lab-danger"
                                                onClick={() => eliminarPlato(plato.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                        <span className="text-muted">Sin resultados para el filtro aplicado.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Platoapilistar;
