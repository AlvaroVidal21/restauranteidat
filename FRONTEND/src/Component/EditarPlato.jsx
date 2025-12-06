import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EditarPlato = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombreplato: "",
    categoria: "",
    precio: ""
  });

  const [loading, setLoading] = useState(true);

  // Cargar datos del plato
  useEffect(() => {
    const cargarPlato = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/platos/${id}`
        );

        const data = await response.json();

        if (response.ok) {
          setFormData({
            nombreplato: data.nombreplato,
            categoria: data.categoria,
            precio: data.precio || ""
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: 'No se encontró el experimento',
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

    cargarPlato();
  }, [id]);

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      precio: formData.precio ? parseFloat(formData.precio) : 0,
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/platos/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Edición exitosa',
          text: result.message || 'El plato se actualizó correctamente',
          confirmButtonColor: '#1b7f4d'
        }).then(() => {
          navigate("/listarplatos");
        });
      } else {
        const joinedErrors = result?.errors
          ? Object.values(result.errors).flat().join(' \n')
          : null;

        Swal.fire({
          icon: 'error',
          title: 'Error al editar',
          text: joinedErrors || result.message || "No se pudo actualizar",
        });
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: "No se pudo conectar con el servidor",
      });
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--primary-cyan)' }}>CARGANDO DATOS DEL EXPERIMENTO...</p>;
  }

  return (
    <div className="lab-container">
      <div className="lab-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>EDITAR PLATO / EXPERIENCIA</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="nombreplato">NOMBRE DEL PLATO:</label>
            <input
              type="text"
              className="lab-input"
              value={formData.nombreplato}
              onChange={(e) =>
                setFormData({ ...formData, nombreplato: e.target.value })
              }
              required
              autoComplete="off"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="categoria">CATEGORÍA:</label>
            <select
              className="lab-input"
              value={formData.categoria}
              onChange={(e) =>
                setFormData({ ...formData, categoria: e.target.value })
              }
              required
            >
              <option value="">-- Seleccione Categoría --</option>
              <option value="Entradas">Entradas</option>
              <option value="Fondos">Fondos</option>
              <option value="Postres">Postres</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Experiencias">Experiencias</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="precio">PRECIO (USD):</label>
            <input
              type="number"
              className="lab-input"
              step="0.01"
              min="0"
              value={formData.precio}
              onChange={(e) =>
                setFormData({ ...formData, precio: e.target.value })
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

export default EditarPlato;
