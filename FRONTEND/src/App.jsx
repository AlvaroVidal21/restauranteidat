import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Footer } from './Component/Footer';
import { Inicio } from './Component/Inicio';
import { Navegacion } from './Component/Navegacion';
import { Cliente } from './Component/Cliente';
import Registrarcliente from './Component/Registrarcliente';
import { Plato } from './Component/Plato';
import Registrarplato from './Component/Registrarplato';
import EditarPlato from './Component/EditarPlato';
import Reservar from './Component/Reservar';
import Dashboard from './Component/Dashboard';
import Login from './Component/Login';
import Clienteapi from './Component/Clienteapi';
import Platoapilistar from './Component/Platoapilistar';
import EditarCliente from './Component/EditarCliente';
import MisReservas from './Component/MisReservas';
import Experiencias from './Component/Experiencias';
import GestionMesas from './Component/GestionMesas';

export const App = () => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
	}, []);

	// Check for admin DNI (00000000) or if the user object has a clear admin flag/role if implemented later.
	// The current system uses '00000000' for the admin user.
	const isAdmin = user && (user.dni === '00000000' || user.dni.toLowerCase() === 'admin');
	const isAuthenticated = Boolean(user);

	const ProtectedRoute = ({ children }) => {
		return isAdmin ? children : <Navigate to="/login" />;
	};

	const AuthRoute = ({ children }) => {
		return isAuthenticated ? children : <Navigate to="/login" />;
	};

	const handleLogout = () => {
		setUser(null);
		localStorage.removeItem('user');
	};

	return (
		<Router>
			<Navegacion isAdmin={isAdmin} user={user} onLogout={handleLogout} />
			<Routes>
				{/* Public Routes */}
				<Route path="/" element={<Inicio />} />
				<Route path="/reservar" element={<Reservar />} />
				<Route path="/experiencias" element={<Experiencias />} />
				<Route path="/login" element={<Login onLogin={setUser} />} />
				<Route path="/registrarcliente" element={<Registrarcliente />} />
				<Route path="/mis-reservas" element={<AuthRoute><MisReservas /></AuthRoute>} />

				{/* Admin Routes */}
				<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
				<Route path="/listarplatos" element={<ProtectedRoute><Platoapilistar /></ProtectedRoute>} />
				<Route path="/registrarplato" element={<ProtectedRoute><Registrarplato /></ProtectedRoute>} />
				<Route path="/editarplato/:id" element={<ProtectedRoute><EditarPlato /></ProtectedRoute>} />
				<Route path="/clientes" element={<ProtectedRoute><Clienteapi /></ProtectedRoute>} />
				<Route path="/editarcliente/:id" element={<ProtectedRoute><EditarCliente /></ProtectedRoute>} />
				<Route path="/mesas" element={<ProtectedRoute><GestionMesas /></ProtectedRoute>} />
			</Routes>
			<Footer />
		</Router>
	)
}
export default App;
