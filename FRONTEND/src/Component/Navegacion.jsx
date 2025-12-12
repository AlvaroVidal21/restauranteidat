import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navegacion.css';

export const Navegacion = ({ isAdmin, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="lab-navbar">
      <div className="lab-brand">LA MAISON</div>
      <ul className="lab-nav-links">
        <li><Link to="/" className={`lab-nav-link ${isActive('/')}`}>Inicio</Link></li>
        <li><Link to="/reservar" className={`lab-nav-link ${isActive('/reservar')}`}>Reservar</Link></li>

        {isAdmin ? (
          <>
            <li><Link to="/dashboard" className={`lab-nav-link ${isActive('/dashboard')}`}>Dashboard</Link></li>
            <li><Link to="/listarplatos" className={`lab-nav-link ${isActive('/listarplatos')}`}>Platos</Link></li>
            <li><Link to="/clientes" className={`lab-nav-link ${isActive('/clientes')}`}>Clientes</Link></li>
            <li><Link to="/mesas" className={`lab-nav-link ${isActive('/mesas')}`}>Mesas</Link></li>
            <li><button onClick={handleLogout} className="btn-lab btn-lab-danger admin-logout-btn">Admin Salir</button></li>
          </>
        ) : (
          <>
            {user ? (
              <>
                <li><Link to="/mis-reservas" className={`lab-nav-link ${isActive('/mis-reservas')}`}>Mis Reservas</Link></li>
                <li className="user-greeting">Hola, {user.nombres.split(' ')[0]}</li>
                <li><button onClick={handleLogout} className="logout-btn">Salir</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login" className={`lab-nav-link ${isActive('/login')}`}>Ingresar</Link></li>
                <li><Link to="/registrarcliente" className={`lab-nav-link ${isActive('/registrarcliente')}`}>Registrarse</Link></li>
              </>
            )}
          </>
        )}
      </ul>
    </nav>
  );
}
