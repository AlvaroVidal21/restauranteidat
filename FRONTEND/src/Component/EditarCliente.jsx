import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EditarCliente = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        dni: "",
        nombres: "",
        telefono: "",
        correo: ""
    });

    const [loading, setLoading] = useState(true);

    // Cargar datos del cliente
    useEffect(() => {
        const cargarCliente = async () => {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/api/clientes/${id}`
                );

                const data = await response.json();

                if (response.ok) {
                    setFormData({
                        dni: data.dni,
                        nombres: data.nombres,
                        telefono: data.telefono,
                        correo: data.correo
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'ERROR',
                        text: 'No se encontró el cliente',
                        background: '#050510',
                        color: '#fff'
                    });
                }

                setLoading(false);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR DE CONEXIÓN',
                    text: 'No se pudo conectar con el servidor',
                    background: '#050510',
                    color: '#fff'
                });
                setLoading(false);
            }
        };

        cargarCliente();
    }, [id]);

    // Guardar cambios
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/clientes/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'ACTUALIZACIÓN EXITOSA',
                    text: result.message,
                    background: '#050510',
                    color: '#fff',
                    confirmButtonColor: '#00f3ff'
                }).then(() => {
                    navigate("/clientes");
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'ERROR DE ACTUALIZACIÓN',
                    text: result.message || "No se pudo actualizar",
                    background: '#050510',
                    color: '#fff'
                });
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'ERROR DE CONEXIÓN',
                text: "No se pudo conectar con el servidor",
                background: '#050510',
                color: '#fff'
            });
        }
    };

    if (loading) {
        return <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--primary-cyan)' }}>CARGANDO DATOS DEL CLIENTE...</p>;
    }

    return (
        <div className="lab-container">
            <div className="lab-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>EDITAR CLIENTE</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="nombres">NOMBRES:</label>
                        <input
                            type="text"
                            className="lab-input"
                            value={formData.nombres}
                            onChange={(e) =>
                                setFormData({ ...formData, nombres: e.target.value })
                            }
                            required
                            autoComplete="off"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="dni">DNI:</label>
                        <input
                            type="text"
                            className="lab-input"
                            value={formData.dni}
                            onChange={(e) =>
                                setFormData({ ...formData, dni: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="telefono">TELÉFONO:</label>
                        <input
                            type="text"
                            className="lab-input"
                            value={formData.telefono}
                            onChange={(e) =>
                                setFormData({ ...formData, telefono: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label htmlFor="correo">CORREO:</label>
                        <input
                            type="email"
                            className="lab-input"
                            value={formData.correo}
                            onChange={(e) =>
                                setFormData({ ...formData, correo: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button className="btn-lab btn-lab-primary" style={{ width: '100%', fontSize: '1.2rem' }}>
                            GUARDAR CAMBIOS
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarCliente;
