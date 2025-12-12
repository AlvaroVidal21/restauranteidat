import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export const Registrarplato = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '',
        categoria: '',
        precio: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            ...formData,
            precio: formData.precio ? parseFloat(formData.precio) : 0,
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/saveplatos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'REGISTRO EXITOSO',
                    text: result.message || 'Plato registrado correctamente',
                }).then(() => {
                    navigate('/listarplatos');
                });
                setFormData({ nombre: '', categoria: '', precio: '' });
            } else {
                const joinedErrors = result?.errors
                    ? Object.values(result.errors).flat().join(' \n')
                    : null;

                const debugPayload = { status: response.status, result };
                console.error('Error al registrar plato', debugPayload);

                const message = joinedErrors || result.message || result.error || 'Verifique los datos ingresados';
                const detail = result?.errors ? JSON.stringify(result.errors, null, 2) : JSON.stringify(result, null, 2);

                Swal.fire({
                    icon: 'error',
                    title: 'ERROR AL REGISTRAR PLATO',
                    text: message,
                    footer: `<pre style="text-align:left;white-space:pre-wrap;font-size:11px;">${detail}</pre>`
                });
                setErrors(result.errors || {});
            }
        } catch (error) {
            console.error('Excepción al registrar plato', error);
            Swal.fire('ERROR DEL SISTEMA', 'Ocurrió un error al registrar el Plato.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="shell-centered">
            <div className="form-card form-shell" style={{ maxWidth: '620px' }}>
                <div className="section-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <p className="menu-meta">Carta</p>
                    <h2>NUEVO PLATO</h2>
                    <p className="text-muted" style={{ fontSize: '14px' }}>Solo categorías: Entradas, Fondos, Postres o Bebidas.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label htmlFor="nombre">Nombre del Plato</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            className="lab-input"
                            maxLength="50"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                        {errors.nombre && <small style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{errors.nombre[0]}</small>}
                    </div>

                    <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label htmlFor="categoria">Categoría</label>
                        <select
                            id="categoria"
                            name="categoria"
                            className="lab-input"
                            value={formData.categoria}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Seleccione Categoría --</option>
                            <option value="Entradas">Entradas</option>
                            <option value="Fondos">Fondos</option>
                            <option value="Postres">Postres</option>
                            <option value="Bebidas">Bebidas</option>
                        </select>
                        {errors.categoria && <small style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{errors.categoria[0]}</small>}
                    </div>

                    <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label htmlFor="precio">Precio (USD)</label>
                        <input
                            type="number"
                            id="precio"
                            name="precio"
                            className="lab-input"
                            step="0.01"
                            min="0"
                            value={formData.precio}
                            onChange={handleChange}
                            required
                        />
                        {errors.precio && <small style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{errors.precio[0]}</small>}
                    </div>

                    <div className="actions-inline" style={{ justifyContent: 'space-between' }}>
                        <button
                            type="button"
                            className="btn-lab"
                            onClick={() => navigate('/listarplatos')}
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button className="btn-lab btn-lab-primary" type="submit" disabled={isLoading}>
                            {isLoading ? 'PROCESANDO...' : 'REGISTRAR PLATO'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Registrarplato;
