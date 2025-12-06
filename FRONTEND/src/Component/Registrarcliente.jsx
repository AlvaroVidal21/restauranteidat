import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export const Registrarcliente = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        dni: '',
        nombres: '',
        telefono: '',
        correo: '',
        password: '',
        fecha_nacimiento: ''
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

        try {
            const response = await fetch('http://127.0.0.1:8000/api/saveclientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Registro Exitoso',
                    text: 'Su cuenta ha sido creada correctamente.',
                }).then(() => navigate('/login'));

                setFormData({ dni: '', nombres: '', telefono: '', correo: '', password: '', fecha_nacimiento: '' });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Validación',
                    text: result.message || 'Verifique los datos ingresados',
                });
                setErrors(result.errors || {});
            }

        } catch (error) {
            Swal.fire('Error', 'Error de conexión con el servidor', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="shell-centered">
            <div className="form-card form-shell">

                <div className="section-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <p className="menu-meta">La Maison</p>
                    <h2>Crear Cuenta</h2>
                    <p className="text-muted" style={{ fontSize: '14px', marginTop: 'var(--spacing-xs)' }}>
                        Complete el formulario para registrarse
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div>
                            <label htmlFor="dni">DNI / ID</label>
                            <input
                                type="text"
                                id="dni"
                                name="dni"
                                className="lab-input"
                                maxLength="8"
                                value={formData.dni}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                placeholder="12345678"
                            />
                            {errors.dni && <small style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{errors.dni[0]}</small>}
                        </div>

                        <div>
                            <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                id="fecha_nacimiento"
                                name="fecha_nacimiento"
                                className="lab-input"
                                value={formData.fecha_nacimiento}
                                onChange={handleChange}
                                required
                            />
                            {errors.fecha_nacimiento && <small style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{errors.fecha_nacimiento[0]}</small>}
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label htmlFor="nombres">Nombre Completo</label>
                        <input
                            type="text"
                            id="nombres"
                            name="nombres"
                            className="lab-input"
                            value={formData.nombres}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                            placeholder="Nombre y Apellidos"
                        />
                        {errors.nombres && <small style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{errors.nombres[0]}</small>}
                    </div>

                    <div className="form-grid" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div>
                            <label htmlFor="telefono">Teléfono</label>
                            <input
                                type="text"
                                id="telefono"
                                name="telefono"
                                className="lab-input"
                                maxLength="20"
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                placeholder="+51 999 999 999"
                            />
                            {errors.telefono && <small style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{errors.telefono[0]}</small>}
                        </div>

                        <div>
                            <label htmlFor="correo">Correo Electrónico</label>
                            <input
                                type="email"
                                id="correo"
                                name="correo"
                                className="lab-input"
                                value={formData.correo}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                placeholder="correo@ejemplo.com"
                            />
                            {errors.correo && <small style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{errors.correo[0]}</small>}
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="lab-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                        {errors.password && <small style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{errors.password[0]}</small>}
                    </div>

                    <button
                        className="btn-lab btn-lab-primary"
                        type="submit"
                        disabled={isLoading}
                        style={{ width: '100%' }}
                    >
                        {isLoading ? 'Procesando...' : 'Crear Cuenta'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Registrarcliente;
