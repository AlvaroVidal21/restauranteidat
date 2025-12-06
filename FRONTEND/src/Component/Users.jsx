import React, { useEffect, useState } from 'react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    //fetch('https://jsonplaceholder.typicode.com/users') // ejemplo de API pública
     fetch('http://127.0.0.1:8000/api/mesas') // ejemplo de API local
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
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
      <h2>Usuarios</h2>
      <ul>
        {users.map(user => (
         // <li key={user.id}>{user.name} - {user.email}</li>
         <li key={user.idmesa}>{user.nombremessa} - {user.descripcionmesa}</li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
