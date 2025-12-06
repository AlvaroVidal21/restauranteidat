import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const Clienteapi = () => {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/clientes')
      .then((response) => response.json())
      .then((data) => {
        setCliente(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar Clientes:', error);
        setLoading(false);
      });
  }, []);

  const eliminarCliente = async (idcliente) => {
    Swal.fire({
      title: '¿Confirmar eliminación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8B0000',
      cancelButtonColor: '#666',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/clientes/${idcliente}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            setCliente(prev => prev.filter(c => c.idcliente !== idcliente));
            Swal.fire('Eliminado', 'El cliente ha sido eliminado correctamente.', 'success');
          } else {
            Swal.fire('Error', 'No se pudo eliminar el cliente.', 'error');
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="lab-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>
          Cargando clientes...
        </p>
      </div>
    );
  }

  return (
    <div className="lab-container">
      <div className="lab-card" style={{ padding: 'var(--spacing-xl)' }}>

        {/* Header */}
        <div className="section-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <p style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            color: 'var(--color-gold)',
            marginBottom: 'var(--spacing-sm)'
          }}>
            Administración
          </p>
          <h2>Registro de Clientes</h2>
          <div className="gold-line"></div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="lab-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cliente.length > 0 ? (
                cliente.map((objcliente, index) => (
                  <tr key={objcliente.idcliente}>
                    <td style={{ color: 'var(--color-text-muted)' }}>{index + 1}</td>
                    <td style={{ fontWeight: '500' }}>{objcliente.nombres}</td>
                    <td>{objcliente.dni}</td>
                    <td>{objcliente.telefono}</td>
                    <td style={{ color: 'var(--color-text-light)' }}>{objcliente.correo || '—'}</td>
                    <td>
                      <button
                        className="btn-lab btn-lab-sm"
                        onClick={() => navigate(`/editarcliente/${objcliente.idcliente}`)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-lab btn-lab-sm btn-lab-danger"
                        onClick={() => eliminarCliente(objcliente.idcliente)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-muted)' }}>
                    No se encontraron clientes registrados.
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

export default Clienteapi;
