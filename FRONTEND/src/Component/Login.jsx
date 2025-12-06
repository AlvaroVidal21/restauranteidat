import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';

export const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        dni: '',
        password: '',
        isAdminLogin: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                onLogin(data.user);
                Swal.fire({
                    icon: 'success',
                    title: 'Bienvenido',
                    text: `Hola, ${data.user.nombres}`,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/');
                });
            } else {
                Swal.fire('Error', data.message || 'Credenciales inválidas', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="shell-centered">
            <div className="form-card auth-card">

                <div className="section-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <p className="menu-meta">{formData.isAdminLogin ? 'Administración' : 'La Maison'}</p>
                    <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>
                        {formData.isAdminLogin ? 'Acceso Admin' : 'Bienvenido'}
                    </h2>
                    <p className="text-muted" style={{ fontSize: '14px' }}>
                        {formData.isAdminLogin
                            ? 'Ingrese sus credenciales de administrador'
                            : 'Inicie sesión para gestionar su reserva'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="form-shell">
                    <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label>DNI / Usuario</label>
                        <input
                            type="text"
                            className="lab-input"
                            required
                            placeholder="Ingrese su documento"
                            value={formData.dni}
                            onChange={e => setFormData({ ...formData, dni: e.target.value })}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <label>Contraseña</label>
                        <input
                            type="password"
                            className="lab-input"
                            required
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-lab btn-lab-primary"
                        disabled={isLoading}
                        style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}
                    >
                        {isLoading ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)' }}>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isAdminLogin: !formData.isAdminLogin })}
                        className="muted-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                    >
                        {formData.isAdminLogin ? '← Volver al acceso de clientes' : '¿Administrador?'}
                    </button>

                    {!formData.isAdminLogin && (
                        <div style={{ marginTop: 'var(--spacing-sm)' }}>
                            <span className="text-muted" style={{ fontSize: '13px' }}>¿No tiene cuenta? </span>
                            <Link
                                to="/registrarcliente"
                                style={{
                                    color: 'var(--color-primary)',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    fontSize: '13px'
                                }}
                            >
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
