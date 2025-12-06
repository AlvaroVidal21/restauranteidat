import React, { useEffect, useState } from 'react'

export const Mesa = () => {

  const [mesa, setMesa] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    fetch('http://127.0.0.1:8000/api/mesas') // ejemplo de API local
      .then((response) => response.json())
      .then((data) => {
        setMesa(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al consumir API:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div>
      <h2>Listar Mesas</h2>
      <ul>
        {mesa.map(objmesa => (
          // <li key={user.id}>{user.name} - {user.email}</li>
          <li key={objmesa.idmesa}>{objmesa.nombremessa} - {objmesa.descripcionmesa}</li>
        ))}
      </ul>
    </div>
  );
};

export default Mesa;
